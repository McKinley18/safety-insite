/**
 * §207 -- THE FROZEN EXECUTION AND ADJUDICATION PROTOCOLS.
 *
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NOTHING IS EXECUTED FROM THIS FILE.
 *
 * Everything here is preregistered for the same reason the gates are: each of these rules is a
 * decision that becomes unavailable to make honestly once output exists. "Retry that one, it looked
 * off" and "that case doesn't count, the provider was flaky" are both defensible in advance and
 * both indefensible afterwards.
 *
 * ONE PRINCIPLE GOVERNS THE WHOLE FILE, and it is the §204 rule stated at run level:
 * A STRUCTURAL, CONTRACT OR TOOLING FAILURE IS NEVER CONVERTED INTO A SEMANTIC VERDICT.
 * A case the provider never answered has no semantic result — not a bad one.
 */

import { FROZEN_TRUTH_CASES, zeroDeclarationCaseIds, governedCaseIds } from './expert-207-truth-specification';
import { instrumentBudget } from './expert-207-gates';

export const PROTOCOLS_207_VERSION = 'hazlenz.expert.207.frozen-protocols.v1' as const;

// ---------------------------------------------------------------- provider call plan

export interface CallPlan {
  readonly firstPassCalls: number;
  readonly verifierCallsExpected: number;
  readonly verifierCallsMax: number;
  readonly governedStageCallsExpected: number;
  readonly governedStageCallsMax: number;
  readonly expectedTotal: number;
  readonly structuralMax: number;
  readonly retryAllowancePerCall: number;
  readonly retryAllowancePerRun: number;
  readonly hardCallCeiling: number;
}

export function callPlan(): CallPlan {
  const cases = FROZEN_TRUTH_CASES.length;
  const zeroDecl = zeroDeclarationCaseIds().length;
  const governed = governedCaseIds().length;
  const governedExpected = governedCaseIds()
    .filter(id => !zeroDeclarationCaseIds().includes(id)).length;
  const verifierExpected = cases - zeroDecl;
  const expectedTotal = cases + verifierExpected + governedExpected;
  const structuralMax = cases + cases + governed;
  return {
    firstPassCalls: cases,
    verifierCallsExpected: verifierExpected,
    verifierCallsMax: cases,
    governedStageCallsExpected: governedExpected,
    governedStageCallsMax: governed,
    expectedTotal,
    structuralMax,
    retryAllowancePerCall: 1,
    retryAllowancePerRun: 6,
    hardCallCeiling: structuralMax + 6,
  };
}

/**
 * Cost basis. The two measured figures are §206's, at `claude-sonnet-5` and USD 2.00 / MTok input,
 * USD 10.00 / MTok output. THE VERIFIER FIGURE IS AN ESTIMATE AND IS LABELLED ONE: §206 executed no
 * verifier call, so its token volume is assumed, not measured.
 */
export const COST_BASIS = {
  model: 'claude-sonnet-5',
  inputUsdPerMTok: 2.0,
  outputUsdPerMTok: 10.0,
  firstPassMeasured: {
    source: '§206 call 1',
    inputTokens: 24258,
    outputTokens: 1574,
    costUsd: 0.064256,
    measured: true,
  },
  governedStageMeasured: {
    source: '§206 call 3',
    inputTokens: 2376,
    outputTokens: 137,
    costUsd: 0.006122,
    measured: true,
  },
  verifierAssumed: {
    source: 'ESTIMATE — no verifier call has been executed on the §205 transport',
    inputTokens: 12000,
    outputTokens: 1200,
    costUsd: 0.036,
    measured: false,
    assumption:
      'the verifier request carries the projected facts and the observation but not the first '
      + 'pass\'s 18,730-byte declaration schema, so roughly half the first pass\'s input. If it '
      + 'proves larger the ceiling absorbs it; the ceiling, not the estimate, is the control.',
  },
} as const;

export interface SpendPlan {
  readonly expectedUsd: number;
  readonly ceilingScenarioUsd: number;
  readonly hardSpendCeilingUsd: number;
  readonly basis: string;
}

export function spendPlan(): SpendPlan {
  const p = callPlan();
  const fp = COST_BASIS.firstPassMeasured.costUsd;
  const vf = COST_BASIS.verifierAssumed.costUsd;
  const gs = COST_BASIS.governedStageMeasured.costUsd;
  const expected = p.firstPassCalls * fp + p.verifierCallsExpected * vf
    + p.governedStageCallsExpected * gs;
  const ceilingScenario = p.firstPassCalls * fp + p.verifierCallsMax * vf
    + p.governedStageCallsMax * gs + p.retryAllowancePerRun * fp;
  return {
    expectedUsd: Number(expected.toFixed(4)),
    ceilingScenarioUsd: Number(ceilingScenario.toFixed(4)),
    hardSpendCeilingUsd: 6.0,
    basis:
      'first pass and governed stage MEASURED in §206; verifier ESTIMATED. Retries priced at the '
      + 'first-pass rate, which is the most expensive call in the run.',
  };
}

// ---------------------------------------------------------------- provider error protocol

export const PROVIDER_FAILURE_CLASSES = [
  'TRANSPORT_TRANSIENT',
  'TRANSPORT_STRUCTURAL',
  'OUTPUT_TRUNCATED',
  'OUTPUT_UNPARSEABLE',
  'OUTPUT_DEGENERATE',
  'NO_FAILURE',
] as const;
export type ProviderFailureClass = (typeof PROVIDER_FAILURE_CLASSES)[number];

export interface FailureRule {
  readonly failureClass: ProviderFailureClass;
  readonly examples: readonly string[];
  readonly retry: 'ONE_IDENTICAL_RETRY' | 'NO_RETRY' | 'ABORT_RUN';
  readonly ifUnrecovered: string;
  readonly gateConsequence: string;
}

export const FAILURE_RULES: readonly FailureRule[] = [
  {
    failureClass: 'TRANSPORT_TRANSIENT',
    examples: ['HTTP 429', 'HTTP 500/502/503/504', 'connection reset', 'request timeout'],
    retry: 'ONE_IDENTICAL_RETRY',
    ifUnrecovered:
      'record PROVIDER_UNAVAILABLE for that call. Every slot on the affected case is recorded '
      + 'NOT_EXERCISED_PROVIDER_FAILURE with the HTTP evidence attached.',
    gateConsequence:
      'the case leaves every gate denominator it was in, and each affected gate records its REDUCED '
      + 'denominator. If a hard gate falls below its preregistered `minimumDenominator` it is '
      + 'COVERAGE_INSUFFICIENT — NOT passed. No semantic verdict is ever inferred from the absence.',
  },
  {
    failureClass: 'TRANSPORT_STRUCTURAL',
    examples: [
      'HTTP 400 with COMPILED_GRAMMAR_TOO_LARGE — the §199 failure',
      'schema rejected before inference',
      'model or tool name not accepted',
    ],
    retry: 'ABORT_RUN',
    ifUnrecovered:
      'the run is ABORTED and is VOID for acceptance purposes. A structural rejection means the '
      + 'thing that executed is not the thing that was preregistered.',
    gateConsequence:
      'no gate is evaluated. THE SCHEMA IS NOT SIMPLIFIED, TRUNCATED OR NORMALISED TO OBTAIN '
      + 'ACCEPTANCE — that is the §206 rule and it is absolute. The remedy is a separate slice, not '
      + 'an in-run adjustment.',
  },
  {
    failureClass: 'OUTPUT_TRUNCATED',
    examples: ['stop_reason = max_tokens', 'tool payload cut mid-object'],
    retry: 'ONE_IDENTICAL_RETRY',
    ifUnrecovered:
      'record OUTPUT_TRUNCATED as a STRUCTURAL failure of that call, not as a semantic result.',
    gateConsequence:
      'as TRANSPORT_TRANSIENT: the case leaves the denominators and the reduction is recorded. A '
      + 'truncated declaration must NOT be adjudicated as an incomplete declaration.',
  },
  {
    failureClass: 'OUTPUT_UNPARSEABLE',
    examples: ['tool payload is not valid JSON', 'no tool_use block returned at all'],
    retry: 'ONE_IDENTICAL_RETRY',
    ifUnrecovered: 'record OUTPUT_UNPARSEABLE as a structural failure of that call.',
    gateConsequence:
      'the case leaves every gate denominator it was in and each affected gate records its reduced '
      + 'denominator, exactly as for TRANSPORT_TRANSIENT. Deterministic code MUST NOT attempt to '
      + 'recover content from malformed output by parsing prose — that is the retired §160 matcher '
      + 'and it would fail G11.',
  },
  {
    failureClass: 'OUTPUT_DEGENERATE',
    examples: [
      'the same declaration repeated verbatim more than twice',
      'a declaration whose fields are placeholder text ("N/A", "TBD", "unknown")',
      'a declaration about a case other than the one supplied',
      'refusal-shaped prose in place of a declaration',
    ],
    retry: 'NO_RETRY',
    ifUnrecovered:
      'THE OUTPUT IS THE MODEL\'S ANSWER AND IS ADJUDICATED AS SUCH. Degeneracy of this kind is a '
      + 'capability observation, not a transport fault, and retrying it would be re-rolling until '
      + 'the answer improves.',
    gateConsequence:
      'the case stays in every denominator and is scored on its merits. Placeholder or off-case '
      + 'content is INCORRECT on the axes it touches.',
  },
  {
    failureClass: 'NO_FAILURE',
    examples: [
      'A CASE THAT RETURNS ZERO DECLARATIONS. This is NOT a failure and NOT degenerate: on AC-04, '
      + 'AC-05, AC-06 and AC-24 it is the frozen correct answer',
    ],
    retry: 'NO_RETRY',
    ifUnrecovered: 'not applicable',
    gateConsequence:
      'scored normally on axes B and I. RETRYING A ZERO-DECLARATION RESPONSE IS FORBIDDEN — it '
      + 'would systematically re-roll exactly the cases whose correct answer is silence.',
  },
];

export const RETRY_POLICY = {
  identicalBytesOnly: true,
  whatMayNotChangeOnARetry: [
    'the prompt', 'the schema', 'the model', 'the temperature or any sampling parameter',
    'the supplied observation', 'the supplied governed records',
  ],
  reason:
    'a retry exists to give a transport fault a second chance, not to give the output a second '
    + 'chance. A retry with any changed byte is a different experiment and is recorded as one.',
  maxPerCall: 1,
  maxPerRun: 6,
  everyRetryIsLedgered: true,
  ledgerFields: ['callIndex', 'leg', 'caseId', 'retried', 'retryReason', 'failureClass'],
} as const;

// ---------------------------------------------------------------- adjudication protocol

export const ADJUDICATION_PROTOCOL = {
  order: [
    '1. DETERMINISTIC SCORING FIRST, on the whole run: admission and refusal records, RR-7 '
    + 'preservation and totalLoss, the citation scan, the §202/§203 authority guards, grammar '
    + 'identities, and the call ledger. These produce gates G3 (structural half), G10, G11, G12 '
    + '(scan half) and G13 without any human judgment.',
    '2. THE DETERMINISTIC RESULT IS NOT SHOWN AS A SUGGESTED VERDICT on any semantic slot. It is '
    + 'evidence in the packet, never a pre-filled answer. §200 recorded zero model verdicts for '
    + 'this reason and §207 keeps it.',
    '3. HUMAN ADJUDICATION of the 177 substantive slots, by review unit, through the §202 '
    + 'append-only machinery with §205 T1 additive append.',
    '4. GATE COMPUTATION LAST, mechanically, from the recorded verdicts and the frozen '
    + 'applicability matrix. No gate is computed while slots are still open.',
  ],
  attribution: 'PRODUCT_OWNER — the only attribution any verdict may carry. There is no '
    + 'model-authored, agent-authored, inferred or assumed alternative and no code path produces one.',
  verdictVocabulary: ['CORRECT', 'PARTIALLY_CORRECT', 'INCORRECT', 'AMBIGUOUS', 'NOT_EXERCISED'],
  batching:
    'incremental and risk-targeted by default — one review unit at a time, stopping between units. '
    + 'Rapid batched packets are available where the product owner authorizes that mode explicitly '
    + 'for a session.',
  revision:
    'a recorded verdict may be revised only with an explicit revision flag and a recorded reason; '
    + 'both values are retained in the ledger. §202 already refuses a silent conflicting write with '
    + 'CONFLICTING_REVISION_REQUIRES_EXPLICIT_REVISION_FLAG.',
  revisionAfterGateComputation:
    'permitted, but the gate result computed before the revision is retained alongside the one '
    + 'computed after, and the revision reason must not be the gate outcome.',
} as const;

/**
 * AMBIGUOUS and NOT_EXERCISED are the two verdicts that decide whether this instrument tells the
 * truth, and both have been quietly converted into passes in other programmes. The rules are frozen.
 */
export const AMBIGUITY_PROTOCOL = {
  ambiguousIsNeverAPass: true,
  ambiguousOnAHardGateSlot:
    'the gate outcome is UNDETERMINED. UNDETERMINED blocks acceptance exactly as FAILED does, and '
    + 'is resolved only by (a) a second recorded product-owner sitting on that slot with additional '
    + 'reasoning, or (b) an explicit recorded product-owner ruling converting it, whose reasoning '
    + 'is part of the evidence. It must never lapse into CORRECT by default or by fatigue.',
  ambiguousBudget:
    'criterion OQ-7. Exceeding it is a defect in the §207 specification, recorded against §207 and '
    + 'not against Expert HazLenz.',
  notExercisedIsNeverAPass: true,
  notExercisedRules: [
    'permitted only where the design targeted an axis and the genuine opportunity to fail did not '
    + 'materialise. It must carry a recorded reason naming what did not materialise.',
    'A VACUOUS CORRECT IS FORBIDDEN. §204 recorded 13 NOT_EXERCISED slots rather than score them, '
    + 'and that precedent governs.',
    'a NOT_EXERCISED on a hard-gate slot REDUCES that gate\'s denominator and the reduction is '
    + 'reported with the gate. Below `minimumDenominator` the gate is COVERAGE_INSUFFICIENT, which '
    + 'is not a pass.',
    'NOT_EXERCISED_PROVIDER_FAILURE is a distinct sub-reason and is never merged with a design-side '
    + 'NOT_EXERCISED in any count.',
  ],
} as const;

// ---------------------------------------------------------------- evidence artifacts

export const EXPECTED_EVIDENCE_ARTIFACTS = [
  {
    file: 'PREREGISTRATION-207.json',
    produced: 'BEFORE execution, by §207',
    contains: 'the frozen truth specification, gates, protocols, plan and identity',
  },
  {
    file: 'CALL-LEDGER.jsonl',
    produced: 'during execution, append-only, leg-aware',
    contains:
      'one line per provider call: callIndex, leg, caseId, model requested and responded, canonical '
      + 'and transmitted schema bytes and identities, HTTP status, provider error, stop reason, '
      + 'token counts, cost, latency, failure class, retried, retryReason',
  },
  {
    file: 'RAW-RESPONSES.jsonl',
    produced: 'during execution, append-only',
    contains: 'the raw provider payloads, unmodified, one line per call',
  },
  {
    file: 'DETERMINISTIC-SCORING.json',
    produced: 'after execution, before any human verdict',
    contains:
      'admission and refusal records, RR-7 preservation and totalLoss per row, the citation scan, '
      + 'the §202/§203 guard results, and grammar identities',
  },
  {
    file: 'ADJUDICATION-WORKSHEET-207.json',
    produced: 'after deterministic scoring',
    contains: 'the 174 slots with their frozen questions, vocabularies and provenance; no prefills',
  },
  {
    file: 'ADJUDICATION-PRESENTATION-PACKET-207.md',
    produced: 'after deterministic scoring',
    contains: 'the evidence ONCE, so worksheet and packet cannot drift into disagreeing copies',
  },
  {
    file: 'VERDICT-LEDGER-207.jsonl',
    produced: 'during adjudication, append-only',
    contains: 'every recorded verdict with PRODUCT_OWNER attribution, batch id and timestamp',
  },
  {
    file: 'GATE-RESULTS-207.json',
    produced: 'after adjudication completes',
    contains:
      'each gate with its outcome, its denominator AS ACHIEVED against its preregistered minimum, '
      + 'and the slots it was computed from',
  },
  {
    file: 'ACCEPTANCE-REPORT-207.md',
    produced: 'last',
    contains: 'the acceptance determination, and every gate that was not PASSED, by name',
  },
] as const;

// ---------------------------------------------------------------- run-level invariants

export const RUN_INVARIANTS = {
  databaseOperations: 0,
  productionOrCustomerActivation: 'NONE',
  successorPromotion: 'NONE',
  promptSchemaOrContractMutationDuringTheRun: 'FORBIDDEN',
  oneRunOnly:
    'ONE bounded cohort pass is authorized at a time. A second pass over the same frozen cases is a '
    + 'separate product-owner decision and, if taken, is reported as a REPLICATE with both results '
    + 'retained — never as a correction of the first.',
  unintendedReplicates:
    'if a call is repeated by executor error, as happened in §206, it is preserved in the ledger as '
    + 'UNINTENDED_BYTE_IDENTICAL_REPLICATE. It is never silently deleted, never reclassified as a '
    + 'planned replicate, and never used to inflate behavioural evidence.',
} as const;

export function protocolsSelfCheck(): {
  readonly judgmentsMatchPlan: boolean;
  readonly ceilingExceedsStructuralMax: boolean;
  readonly everyFailureClassHasARule: boolean;
} {
  const p = callPlan();
  return {
    judgmentsMatchPlan: instrumentBudget().totalJudgments === 177,
    ceilingExceedsStructuralMax: p.hardCallCeiling > p.structuralMax,
    everyFailureClassHasARule:
      FAILURE_RULES.length === PROVIDER_FAILURE_CLASSES.length
      && PROVIDER_FAILURE_CLASSES.every(c => FAILURE_RULES.some(r => r.failureClass === c)),
  };
}
