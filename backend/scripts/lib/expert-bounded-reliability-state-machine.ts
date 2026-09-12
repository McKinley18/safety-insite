/**
 * §165 EXPERT HAZLENZ -- BOUNDED RELIABILITY STATE MACHINE (POLICY C). DEVELOPMENT PROTOTYPE ONLY.
 * NOT REACHABLE FROM PRODUCTION. NOT ENABLED. ZERO PROVIDER CALLS IN THIS OPERATION.
 *
 * ==================== POLICY C, AND THE RULE MOST LIKELY TO BE SOFTENED ====================
 *
 * At most TWO semantic-reliability draws. No majority rule. No third draw. No loop. The second draw
 * fires ONLY on an admitted `NO_CLARIFICATION_REQUIRED` on a trigger-positive case where an owed
 * fact remains unresolved -- so a wrong-fact first draw does NOT trigger it, which is a known and
 * deliberate gap: that case is target coverage, and repetition cannot touch it.
 *
 * >>> TWO SILENCES NEVER ESTABLISH CORRECTNESS, AND THE REASON IS RECORDED IN CODE.
 * >>>
 * >>> The draws are not independent tests of a proposition. They are two samples from one
 * >>> distribution §163 measured to be CENTRED ON SILENCE for HS-E1 -- 8 of 10. Two silences is the
 * >>> single most likely outcome of that distribution (~64%) WHETHER OR NOT the silence is correct.
 * >>> Agreement between samples from a biased distribution is evidence about the mode, not about the
 * >>> truth, and treating it as confirmation converts a measured bias into a manufactured confidence
 * >>> signal -- the same error carried with more authority.
 * >>>
 * >>> So `resolveDrawOutcome` has no path from two silences to `COVERED`, to `VERIFIED_AS_IS`, or to
 * >>> a cleared coverage warning. There is no branch to relax; there is nothing there.
 *
 * ==================== COMPOSITION WITH THE DEGENERATE POLICY ====================
 *
 * The two layers act on different objects and never overlap. The degenerate policy acts on RESPONSE
 * STATE -- is this output usable at all -- and owns its single bounded reissue. This layer acts on
 * SEMANTIC OUTCOME among already-usable responses and owns its single bounded second draw. Their
 * budgets are SEPARATE AND ADDITIVE, which is why the cap counts them separately and why
 * `ProviderCallBudget` refuses a request that tries to spend one channel's allowance on another.
 *
 * ==================== ACTIVATION ====================
 *
 * `ACTIVATION_STATUS` is `DEVELOPMENT_INACTIVE`. The driver takes an injected draw function and the
 * default one THROWS. Nothing in this module knows a provider, an endpoint, a credential or a model
 * identity, and nothing in it can acquire one.
 */

import {
  type OwedFactLedger, unresolvedFacts,
} from './expert-owed-facts';
import {
  type SemanticOutcomeRecord, classifyDeterministically, UNKNOWN_SEMANTIC_VALIDITY,
} from './expert-semantic-outcome-v2';

export const RELIABILITY_STATE_MACHINE_VERSION =
  'hazlenz.expert.bounded-reliability-state-machine.v1' as const;

export const ACTIVATION_STATUS = 'DEVELOPMENT_INACTIVE' as const;

/** The ordered composition §164 §9 and §13 fixed. Exported so a test can assert the order. */
export const STATE_MACHINE_COMPOSITION = [
  'TRANSPORT',
  'RESPONSE_STATE_CLASSIFICATION',
  'DEGENERATE_HANDLING',
  'CONTRACT_ADMISSION',
  'SEMANTIC_RELIABILITY_DRAW_HANDLING',
  'OWED_FACT_COVERAGE',
  'ARBITRATION',
  'QUESTION_BUDGET',
  'FINAL_AUGMENTATION',
] as const;
export type CompositionStage = (typeof STATE_MACHINE_COMPOSITION)[number];

// ------------------------------------------------------------------ provider-call budget

/**
 * The four channels, their independent ceilings, and the structural total.
 *
 * SEPARATE budgets are the point. A degenerate reissue must not consume a reliability draw and a
 * reliability draw must not consume a coverage re-check, because each ceiling answers a different
 * failure and collapsing them would let one failure class exhaust another's allowance.
 */
export const PROVIDER_CALL_CHANNELS = {
  FIRST_PASS: 1,
  DEGENERATE_REISSUE: 1,
  RELIABILITY_DRAW: 2,
  COVERAGE_RECHECK: 1,
} as const;
export type ProviderCallChannel = keyof typeof PROVIDER_CALL_CHANNELS;

export const MAX_PROVIDER_CALLS_PER_ANALYSIS =
  Object.values(PROVIDER_CALL_CHANNELS).reduce((a, b) => a + b, 0);

export const MAX_RELIABILITY_DRAWS = PROVIDER_CALL_CHANNELS.RELIABILITY_DRAW;

export interface ProviderCallBudget {
  readonly spent: Readonly<Record<ProviderCallChannel, number>>;
  readonly total: number;
}

export const emptyProviderCallBudget = (): ProviderCallBudget => ({
  spent: { FIRST_PASS: 0, DEGENERATE_REISSUE: 0, RELIABILITY_DRAW: 0, COVERAGE_RECHECK: 0 },
  total: 0,
});

export interface BudgetDecision { allowed: boolean; reason: string }

/** Evaluated BEFORE a call, never after. A channel at its ceiling cannot borrow from another. */
export function mayIssueProviderCall(
  budget: ProviderCallBudget, channel: ProviderCallChannel,
): BudgetDecision {
  const ceiling = PROVIDER_CALL_CHANNELS[channel];
  if (ceiling === undefined) {
    return { allowed: false, reason: `UNKNOWN_CHANNEL:${String(channel)}` };
  }
  if (budget.spent[channel] + 1 > ceiling) {
    return { allowed: false,
      reason: `CHANNEL_CEILING_REACHED:${channel} ${budget.spent[channel]}/${ceiling}; `
        + 'channels do not lend to one another' };
  }
  if (budget.total + 1 > MAX_PROVIDER_CALLS_PER_ANALYSIS) {
    return { allowed: false,
      reason: `TOTAL_CALL_CEILING_REACHED:${budget.total}/${MAX_PROVIDER_CALLS_PER_ANALYSIS}` };
  }
  return { allowed: true, reason: '' };
}

export function recordProviderCall(
  budget: ProviderCallBudget, channel: ProviderCallChannel,
): ProviderCallBudget {
  const decision = mayIssueProviderCall(budget, channel);
  if (!decision.allowed) throw new Error(`PROVIDER_CALL_REFUSED — ${decision.reason}`);
  return {
    spent: { ...budget.spent, [channel]: budget.spent[channel] + 1 },
    total: budget.total + 1,
  };
}

/** Structural assertion: the four ceilings sum to the published maximum, and none is unbounded. */
export function assertCallCapInternallyConsistent(): void {
  const values = Object.values(PROVIDER_CALL_CHANNELS);
  if (values.some(v => !Number.isInteger(v) || v < 0)) {
    throw new Error('CALL_CAP_INCONSISTENT — a channel ceiling is not a non-negative integer');
  }
  const sum = values.reduce((a, b) => a + b, 0);
  if (sum !== MAX_PROVIDER_CALLS_PER_ANALYSIS) {
    throw new Error(`CALL_CAP_INCONSISTENT — channels sum to ${sum} but the published maximum is `
      + `${MAX_PROVIDER_CALLS_PER_ANALYSIS}`);
  }
  if (MAX_PROVIDER_CALLS_PER_ANALYSIS !== 5) {
    throw new Error(`CALL_CAP_CHANGED — §164 fixed the bounded path at 5 provider calls; this build `
      + `computes ${MAX_PROVIDER_CALLS_PER_ANALYSIS}`);
  }
}

// ------------------------------------------------------------------ the draw state machine

export const DRAW_STATES = [
  'DRAW_1',
  'DEGENERATE_POLICY_PATH',
  'SECOND_DRAW_ELIGIBLE',
  'SECOND_DRAW_ISSUED',
  'PROCEED_TO_COVERAGE_CHECK',
  'TERMINATED_NO_FURTHER_DRAWS',
] as const;
export type DrawState = (typeof DRAW_STATES)[number];

export interface DrawObservation {
  readonly drawIndex: 1 | 2;
  readonly transportOk: boolean;
  readonly degenerate: boolean;
  readonly responseState: string;
  readonly contractAdmitted: boolean;
  readonly verdict: string | null;
  readonly clarificationEmitted: boolean;
}

export interface DrawGateInput {
  readonly observation: DrawObservation;
  /** The selective-verification trigger fired for this analysis. */
  readonly triggerPositive: boolean;
  /** At least one owed fact is still UNRESOLVED at this point. */
  readonly unresolvedOwedFactRemains: boolean;
  readonly budget: ProviderCallBudget;
}

export interface DrawGateResult {
  readonly state: DrawState;
  readonly SECOND_DRAW_ELIGIBLE: boolean;
  readonly reason: string;
}

/**
 * The gate. Every condition is deterministic and each is required:
 *
 *   the response is execution-valid and contract-admitted   (an unusable draw is the degenerate
 *                                                            policy's business, not this layer's)
 *   the admitted verdict is NO_CLARIFICATION_REQUIRED        (silence, not a wrong fact)
 *   the trigger fired                                        (the case is in the escalated
 *                                                            population)
 *   an owed fact is still unresolved                         (there is something to be silent about)
 *   this is draw 1                                           (there is no third draw)
 *   the RELIABILITY_DRAW channel has allowance left          (channels do not borrow)
 */
export function evaluateSecondDrawGate(input: DrawGateInput): DrawGateResult {
  const o = input.observation;
  const no = (state: DrawState, reason: string): DrawGateResult =>
    ({ state, SECOND_DRAW_ELIGIBLE: false, reason });

  if (o.drawIndex !== 1) {
    return no('TERMINATED_NO_FURTHER_DRAWS',
      `draw ${o.drawIndex}: the ceiling is ${MAX_RELIABILITY_DRAWS} and there is no third draw`);
  }
  if (!o.transportOk || o.degenerate || o.responseState !== 'COMPLETE') {
    return no('DEGENERATE_POLICY_PATH',
      'execution-invalid or degenerate; the existing degenerate policy governs, not this layer');
  }
  if (!o.contractAdmitted) {
    return no('PROCEED_TO_COVERAGE_CHECK',
      'the contract refused the verdict; the first pass stands and coverage is still checked');
  }
  if (o.verdict !== 'NO_CLARIFICATION_REQUIRED') {
    return no('PROCEED_TO_COVERAGE_CHECK',
      `verdict ${String(o.verdict)} is not silence; a wrong-fact draw is an R3 problem and `
      + 'repetition cannot touch it');
  }
  if (!input.triggerPositive) {
    return no('PROCEED_TO_COVERAGE_CHECK', 'the case is not trigger-positive');
  }
  if (!input.unresolvedOwedFactRemains) {
    return no('PROCEED_TO_COVERAGE_CHECK', 'no owed fact remains unresolved');
  }
  const allowance = mayIssueProviderCall(input.budget, 'RELIABILITY_DRAW');
  if (!allowance.allowed) {
    return no('TERMINATED_NO_FURTHER_DRAWS', allowance.reason);
  }
  return {
    state: 'SECOND_DRAW_ELIGIBLE',
    SECOND_DRAW_ELIGIBLE: true,
    reason: 'admitted silence on a trigger-positive case with an unresolved owed fact; '
      + 'exactly one second draw',
  };
}

export interface DrawResolution {
  readonly drawCount: 1 | 2;
  readonly outcome: SemanticOutcomeRecord;
  /** Whether either draw's declarations may clear an owed fact. Two silences: never. */
  readonly mayClearOwedFact: boolean;
  readonly coverageWarningMayClear: boolean;
  readonly consensusClaimed: false;
  readonly reason: string;
}

/**
 * Resolve one or two draws into a semantic outcome.
 *
 * The only case with two draws that this function treats specially is TWO SILENCES, and it treats it
 * by refusing every upgrade: `SETTLED_SILENCE` with `drawCount: 2`, no clearance of any owed fact,
 * no clearance of the coverage warning, and `consensusClaimed` typed as the literal `false` so a
 * caller cannot set it.
 */
export function resolveDrawOutcome(
  draws: readonly DrawObservation[],
  owedFactExists: boolean,
): DrawResolution {
  if (draws.length === 0 || draws.length > MAX_RELIABILITY_DRAWS) {
    throw new Error(`DRAW_COUNT_OUT_OF_BOUNDS — ${draws.length}; the ceiling is `
      + `${MAX_RELIABILITY_DRAWS} and at least one draw always occurred`);
  }
  const last = draws[draws.length - 1];
  const allSilent = draws.every(d => d.contractAdmitted
    && d.verdict === 'NO_CLARIFICATION_REQUIRED' && !d.clarificationEmitted);

  const outcome = classifyDeterministically({
    transportOk: last.transportOk,
    degenerate: last.degenerate,
    responseState: last.responseState,
    contractAdmitted: last.contractAdmitted,
    clarificationEmitted: draws.some(d => d.clarificationEmitted),
    owedFactExists,
  });

  if (draws.length === 2 && allSilent) {
    return {
      drawCount: 2,
      outcome: { ...outcome, reason: 'two admitted silences on one frozen request; recorded as '
        + 'SETTLED_SILENCE with drawCount 2. Agreement between two samples of a distribution '
        + 'measured to be centred on silence is evidence about the mode, not about the truth.' },
      mayClearOwedFact: false,
      coverageWarningMayClear: false,
      consensusClaimed: false,
      reason: 'TWO_SILENCES_DO_NOT_ESTABLISH_CORRECTNESS',
    };
  }

  return {
    drawCount: draws.length as 1 | 2,
    outcome,
    // A clarification may clear an owed fact only through an ADMITTED BINDING, which the binding
    // contract decides. This flag says the door is open, never that the fact is covered.
    mayClearOwedFact: last.contractAdmitted && draws.some(d => d.clarificationEmitted),
    coverageWarningMayClear: last.contractAdmitted && draws.some(d => d.clarificationEmitted),
    consensusClaimed: false,
    reason: outcome.outcome === UNKNOWN_SEMANTIC_VALIDITY
      ? 'execution-valid; the semantic outcome requires human authority'
      : outcome.reason,
  };
}

/**
 * The invariants a caller asserts over a completed analysis. Each maps to a §165 Phase 8/9 rule.
 */
export function stateMachineViolations(input: {
  budget: ProviderCallBudget;
  draws: readonly DrawObservation[];
  resolution: DrawResolution;
  ledgerAfter: OwedFactLedger;
  targetCoverageWarning: boolean;
}): string[] {
  const v: string[] = [];
  if (input.budget.total > MAX_PROVIDER_CALLS_PER_ANALYSIS) {
    v.push(`TOTAL_CALL_CAP_EXCEEDED:${input.budget.total}`);
  }
  for (const [channel, ceiling] of Object.entries(PROVIDER_CALL_CHANNELS)) {
    const spent = input.budget.spent[channel as ProviderCallChannel];
    if (spent > ceiling) v.push(`CHANNEL_CAP_EXCEEDED:${channel} ${spent}/${ceiling}`);
  }
  if (input.draws.length > MAX_RELIABILITY_DRAWS) {
    v.push(`DRAW_CAP_EXCEEDED:${input.draws.length}`);
  }
  const indices = input.draws.map(d => d.drawIndex);
  if (indices.some((x, i) => x !== i + 1)) {
    v.push(`DRAW_INDICES_OUT_OF_ORDER:${indices.join(',')}`);
  }
  if (input.resolution.reason === 'TWO_SILENCES_DO_NOT_ESTABLISH_CORRECTNESS') {
    if (input.resolution.mayClearOwedFact || input.resolution.coverageWarningMayClear) {
      v.push('TWO_SILENCES_CLEARED_SOMETHING — two silences may clear nothing');
    }
    if (unresolvedFacts(input.ledgerAfter).length === 0) {
      v.push('OWED_FACT_CLEARED_BY_SILENCE — an owed fact left UNRESOLVED by two silences');
    }
    if (!input.targetCoverageWarning) {
      v.push('COVERAGE_WARNING_CLEARED_BY_SILENCE');
    }
  }
  return v;
}

// ------------------------------------------------------------------ the driver

export type DrawFunction = (drawIndex: 1 | 2) => Promise<DrawObservation>;

/**
 * The default draw function. Hosted execution is not authorized in this operation, and the refusal
 * is the default rather than a flag someone must remember to set.
 */
export const REFUSING_DRAW_FUNCTION: DrawFunction = async () => {
  throw new Error('HOSTED_EXECUTION_NOT_AUTHORIZED — this state machine is '
    + `${ACTIVATION_STATUS} and no provider call is permitted. Supply an explicit draw function `
    + 'under a separate authorization to execute one.');
};

export interface DriverResult {
  readonly draws: readonly DrawObservation[];
  readonly gate: DrawGateResult;
  readonly resolution: DrawResolution;
  readonly budget: ProviderCallBudget;
}

/**
 * Run the bounded draw sequence. Pure with respect to everything except the injected draw function,
 * which in this operation is never supplied.
 *
 * The loop is not a loop: draw 1 always happens, draw 2 happens if and only if the gate says so, and
 * there is no `while`, no recursion and no retry inside this function.
 */
export async function runBoundedDraws(
  args: {
    triggerPositive: boolean;
    unresolvedOwedFactRemains: boolean;
    owedFactExists: boolean;
    budget?: ProviderCallBudget;
    draw?: DrawFunction;
  },
): Promise<DriverResult> {
  assertCallCapInternallyConsistent();
  const draw = args.draw ?? REFUSING_DRAW_FUNCTION;
  let budget = args.budget ?? emptyProviderCallBudget();

  budget = recordProviderCall(budget, 'RELIABILITY_DRAW');
  const first = await draw(1);
  const draws: DrawObservation[] = [first];

  const gate = evaluateSecondDrawGate({
    observation: first,
    triggerPositive: args.triggerPositive,
    unresolvedOwedFactRemains: args.unresolvedOwedFactRemains,
    budget,
  });

  if (gate.SECOND_DRAW_ELIGIBLE) {
    budget = recordProviderCall(budget, 'RELIABILITY_DRAW');
    draws.push(await draw(2));
  }

  return {
    draws,
    gate,
    resolution: resolveDrawOutcome(draws, args.owedFactExists),
    budget,
  };
}
