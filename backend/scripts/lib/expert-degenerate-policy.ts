/**
 * §155 EXPERT HAZLENZ -- DEGENERATE OUTPUT POLICY. DEVELOPMENT PROTOTYPE ONLY.
 *
 * ==================== THE RECOMMENDATION, AND THE ARGUMENT FOR IT ====================
 *
 * OPTION C LAYERED ON OPTION B: one bounded reissue, and if the reissue is degenerate too, FAIL
 * CLOSED. Never a loop, never a third request, both raw attempts preserved and counted.
 *
 * Why not A, ACCEPT WITH DISCLOSURE. A customer shown a hazard candidate keyed `"placeholder"`, or
 * a summary that reads `"summary placis a a placeholder"`, has been shown something worse than
 * nothing: it looks like an analysis. The advisory layer's whole warrant is that a reviewer can
 * trust what carries the `EXPERT_ADVISORY` label. Disclosure does not repair that, and the existing
 * contract already says the fallback is deterministic HazLenz rather than a degraded Expert answer
 * -- `expert-provider.ts` deliberately has no result member meaning "degraded but usable".
 *
 * Why not B ALONE. Failing closed on the first degenerate response is safe and cheap, and it is the
 * FLOOR this policy keeps. But the three hardened draws show the same row producing junk in one
 * draw and a full substantive analysis in another -- HS-A1 was degenerate in §152 and §153 and
 * clean in §154; HS-K1 was clean in §152 and degenerate in §153 and §154. A response that is junk
 * on this draw is not evidence that the model cannot answer this observation. Refusing to ask again
 * discards recoverable value for a condition a single extra request may resolve.
 *
 * Why C IS SAFE HERE AND WOULD NOT BE ELSEWHERE. §149's `expert-runner.ts` already refuses to retry
 * a REJECTED normalization, for a stated reason: asking a model to re-answer a question it just
 * answered unsafely is how a validator gets talked out of a refusal. A degenerate response is the
 * opposite case. Nothing unsafe was asserted -- nothing was asserted at all -- so there is no
 * refusal to erode, and the reissue is the same request rather than a softened one.
 *
 * >>> THE CONDITIONS ARE NOT NEGOTIABLE, AND EACH ONE ANSWERS A FAILURE THIS PROGRAMME HAS SEEN:
 * >>>
 * >>>   1. The trigger is the DETERMINISTIC detector and nothing else. No "looks thin" heuristic.
 * >>>   2. The reissued request is BYTE-IDENTICAL. Same observation, same evidence, same contract,
 * >>>      same prompt. A reissue that rewords the prompt is a second experiment, not a retry.
 * >>>   3. AT MOST ONE. The ceiling is one for the same reason the runner's is.
 * >>>   4. BOTH ATTEMPTS ARE PRESERVED. §153's saved memory on this repository is explicit that a
 * >>>      replacement must never erase the evidence that the original event occurred. The first
 * >>>      raw response, its cost and its detector verdict all survive the reissue.
 * >>>   5. A SECOND DEGENERATE RESULT FAILS CLOSED. It does not accept, disclose, or ask again.
 * >>>   6. OFF IN EVALUATION. See below -- this is the condition most easily lost.
 *
 * ==================== WHY THIS MUST BE OFF IN EVERY SCORED RUN ====================
 *
 * A formal evaluation, a probe, and a replicate all measure what the model does. A silent reissue
 * changes the denominator and quietly improves the score: the run would report the SECOND response
 * while the first, which is the actual observation of provider reliability, disappears from the
 * measurement. §153 and §154 both recorded degenerate rows as denominator loss and authorized no
 * rerun, and that is the correct behaviour for a measuring instrument.
 *
 * So the policy is CUSTOMER-PATH ONLY, and `DegeneratePolicyContext.purpose` must be stated at
 * every call site. `EVALUATION` and `PROBE` can only ever return FAIL_CLOSED_NO_REISSUE.
 */

import type { DegenerateVerdict } from './expert-degenerate-output-detector';

export const DEGENERATE_POLICY_VERSION = 'hazlenz.expert.degenerate-policy.v1' as const;

export const DEGENERATE_POLICY_OPTIONS = [
  'A_ACCEPT_WITH_DISCLOSURE',
  'B_FAIL_CLOSED',
  'C_ONE_BOUNDED_REISSUE_THEN_FAIL_CLOSED',
  'D_SECOND_PROVIDER_FALLBACK',
] as const;
export type DegeneratePolicyOption = (typeof DEGENERATE_POLICY_OPTIONS)[number];

/**
 * The recommended option. `D_SECOND_PROVIDER_FALLBACK` is NOT implemented and NOT selectable: it
 * needs a second qualified model, and qualifying one is its own authorization. A fallback to an
 * unqualified provider would make every result unattributable, which is the same defect
 * `UNEXPECTED_MODEL_IDENTITY` exists to prevent.
 */
export const RECOMMENDED_POLICY: DegeneratePolicyOption =
  'C_ONE_BOUNDED_REISSUE_THEN_FAIL_CLOSED';

export const DEGENERATE_POLICY_DECISIONS = [
  'PROCEED_RESPONSE_IS_USABLE',
  'REISSUE_ONCE',
  'FAIL_CLOSED_NO_REISSUE',
  'FAIL_CLOSED_AFTER_REISSUE',
] as const;
export type DegeneratePolicyDecision = (typeof DEGENERATE_POLICY_DECISIONS)[number];

/** Why the caller is running. A scored run may never reissue. */
export const EXPERT_RUN_PURPOSES = ['CUSTOMER', 'EVALUATION', 'PROBE', 'DEVELOPMENT'] as const;
export type ExpertRunPurpose = (typeof EXPERT_RUN_PURPOSES)[number];

export interface DegeneratePolicyContext {
  purpose: ExpertRunPurpose;
  /** 0 for the first response of a logical call, 1 for the response to a reissue. */
  reissueAttemptIndex: 0 | 1;
  /** Consulted before a reissue is authorized. Absent means no budget is enforced. */
  mayIssueReissue?: () => { allowed: boolean; reason: string };
}

export interface DegeneratePolicyOutcome {
  version: string;
  policy: DegeneratePolicyOption;
  decision: DegeneratePolicyDecision;
  reason: string;
  /** Set when a reissue was EARNED and refused by a budget, so the suppression is never silent. */
  reissueSuppressed: { reason: string } | null;
}

export function decideDegeneratePolicy(
  verdict: DegenerateVerdict, context: DegeneratePolicyContext,
): DegeneratePolicyOutcome {
  const base = {
    version: DEGENERATE_POLICY_VERSION,
    policy: RECOMMENDED_POLICY,
    reissueSuppressed: null as DegeneratePolicyOutcome['reissueSuppressed'],
  };

  if (!verdict.DEGENERATE_PROVIDER_OUTPUT) {
    // A SUSPECT row proceeds. One signal convicts nothing -- §153's rule, unchanged.
    return {
      ...base,
      decision: 'PROCEED_RESPONSE_IS_USABLE',
      reason: verdict.suspect
        ? `one detector signal (${verdict.signals[0]}); reported, not convicting`
        : 'no detector signal',
    };
  }

  // Degenerate from here on.
  if (context.reissueAttemptIndex >= 1) {
    return {
      ...base,
      decision: 'FAIL_CLOSED_AFTER_REISSUE',
      reason: 'the reissued response is degenerate too; the ceiling is one and there is no loop',
    };
  }

  if (context.purpose === 'EVALUATION' || context.purpose === 'PROBE') {
    return {
      ...base,
      decision: 'FAIL_CLOSED_NO_REISSUE',
      reason: `purpose ${context.purpose}: a scored run may never reissue, because the reissue `
        + 'would replace the observation being measured',
    };
  }

  const gate = context.mayIssueReissue?.() ?? { allowed: true, reason: '' };
  if (!gate.allowed) {
    return {
      ...base,
      decision: 'FAIL_CLOSED_NO_REISSUE',
      reason: 'a reissue was earned and refused by the budget',
      reissueSuppressed: { reason: gate.reason },
    };
  }

  return {
    ...base,
    decision: 'REISSUE_ONCE',
    reason: `degenerate on signals ${verdict.signals.join(', ')}; one byte-identical reissue`,
  };
}

/**
 * What the customer path does with a decision. Separated from the decision so the mapping is
 * inspectable and so nothing can invent a fifth behaviour at a call site.
 *
 * FAIL CLOSED here means exactly what `expert-authority-merge.ts` already means by it: the advisory
 * block is EMPTY, the deterministic findings and governed citations are untouched, the inspection
 * continues, and the failure is recorded. It does not mean the inspection fails.
 */
export function customerEffectOf(decision: DegeneratePolicyDecision): {
  advisoryDelivered: boolean; layerStatus: string; inspectionContinues: true;
} {
  switch (decision) {
    case 'PROCEED_RESPONSE_IS_USABLE':
      return { advisoryDelivered: true, layerStatus: 'PRESENT', inspectionContinues: true };
    case 'REISSUE_ONCE':
      return { advisoryDelivered: false, layerStatus: 'PENDING_REISSUE', inspectionContinues: true };
    case 'FAIL_CLOSED_NO_REISSUE':
    case 'FAIL_CLOSED_AFTER_REISSUE':
      return { advisoryDelivered: false, layerStatus: 'OUTPUT_REJECTED', inspectionContinues: true };
  }
}

/**
 * One recorded response inside a logical call, degenerate or not.
 *
 * Mirrors `ExpertAttemptRecord` in `src/hazlenz/expert-hazlenz/expert-runner.ts` closely
 * enough to reason about, and does not import it: a prototype under `scripts/` must not create a
 * dependency that a later refactor could invert into production. §151 hit exactly that with a
 * fixture importing a script type across `rootDir`, and the fix was to declare the shape locally.
 */
export interface DegenerateAttemptRecord {
  readonly attemptIndex: 0 | 1;
  readonly isReissue: boolean;
  readonly rawResponsePreserved: true;
  readonly degenerate: boolean;
  readonly signals: readonly string[];
  readonly costUsd: number | null;
}

/**
 * APPEND the disposition of one response to a ledger. It is append-only by construction: the input
 * ledger is spread, never indexed into, and the return type is readonly.
 *
 * This is the mechanism behind "a retry preserves the first attempt's evidence". §153's lesson on
 * this repository is that when a retry replaces a value, the evidence that the original event
 * occurred must survive the replacement and must be persisted rather than reconstructed afterwards.
 * A reissued response is a SECOND record, never an overwrite of the first, and the first keeps its
 * own cost -- a degenerate response was still billed.
 */
export function appendAttempt(
  ledger: readonly DegenerateAttemptRecord[], record: DegenerateAttemptRecord,
): readonly DegenerateAttemptRecord[] {
  return [...ledger, record];
}

/** Ledger properties the acceptance matrix asserts mechanically. */
export function ledgerViolations(ledger: readonly DegenerateAttemptRecord[]): string[] {
  const v: string[] = [];
  if (ledger.length === 0) v.push('EMPTY_LEDGER — a logical call always issued one request');
  if (ledger.length > 2) v.push('MORE_THAN_TWO_ATTEMPTS — the reissue ceiling is one');
  if (ledger.some(a => !a.rawResponsePreserved)) v.push('RAW_RESPONSE_NOT_PRESERVED');
  if (ledger.length === 2) {
    if (ledger[0].attemptIndex !== 0 || ledger[1].attemptIndex !== 1) {
      v.push('ATTEMPT_INDICES_OUT_OF_ORDER');
    }
    if (!ledger[0].degenerate) v.push('REISSUED_A_NON_DEGENERATE_RESPONSE');
    if (ledger[1].isReissue !== true) v.push('SECOND_ATTEMPT_NOT_MARKED_AS_REISSUE');
  }
  return v;
}
