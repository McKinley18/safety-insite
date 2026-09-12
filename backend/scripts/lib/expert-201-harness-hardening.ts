/**
 * §201 -- HARNESS HARDENING. AN ADDITIVE SUCCESSOR. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * ==================== WHY THIS IS A NEW FILE AND NOT AN EDIT ====================
 *
 * `expert-pre-inference-circuit-breaker.ts` and `expert-empty-run-safety.ts` are hash-referenced by
 * §199's FROZEN preregistration (`PREREGISTRATION.json.CIRCUIT_BREAKER.moduleSha256`, checked at
 * §199 execution start with `throw new Error('ABORT: circuit breaker module moved since freeze')`)
 * and are asserted by §198's 89/89 suite. Editing either would either break that ABORT check or
 * silently detach §199's recorded evidence from the code that produced it.
 *
 * So this module follows the discipline the repository already uses for exactly this situation --
 * v3 -> v3.1 -> v3.2 -> v3.3, v15 -> vNext: the successor is built BY CONSTRUCTION from the
 * predecessor, calls into it rather than reimplementing it, and is provably reversible back to it
 * (`predecessorStateOf`). Nothing here changes what §198 or §199 computed.
 *
 * ==================== WHAT §199 ACTUALLY PAID FOR ====================
 *
 * From `CIRCUIT-BREAKER-LOG.jsonl` (§199, verbatim):
 *
 *   position 3  SG-01  reachedInference=false  contract=d0713f36696e8bea  consecutive=1  tripped=false
 *   position 8  SG-02  reachedInference=false  contract=243bb6766c05599f  consecutive=1  tripped=false
 *
 * both carrying the SAME provider message:
 *
 *   "The compiled grammar is too large, which would cause performance issues. Simplify your tool
 *    schemas or reduce the number of strict tools."
 *
 * TWO defects are visible there, not one, and only the first was named in §200's recommendation.
 *
 * DEFECT 1 -- ADJACENCY. Four completed inferences sat between them, `consecutive` never exceeded 1,
 * and the two-consecutive rule correctly did not trip. A second cohort row was spent rediscovering a
 * fact the first had fully established. That is the defect §200 recommended fixing.
 *
 * DEFECT 2 -- THE KEY WAS TOO FINE, AND §200's RECOMMENDATION AS WRITTEN WOULD NOT HAVE FIRED
 * EITHER. §200 records the two signatures as "identical". They are not: `contract=` differs
 * (`d0713f36696e8bea` vs `243bb6766c05599f`), because §199 set `requestContractId` to
 * `sha(stableStringify(req.schema)).slice(0,16)` and the vNext wire schema is built per ROW -- the
 * observation source id, the governed source ids and the hazard-family enum values all vary. A
 * stage-local memory keyed on that hash would have missed SG-02 in exactly the same way the
 * adjacency rule did. Fixing the rule without fixing the key would have bought nothing.
 *
 * The distinction this module introduces is therefore:
 *
 *   REQUEST-CONTRACT IDENTITY  the exact bytes of one request's schema. Per row. §198's field.
 *   EFFECTIVE GRAMMAR IDENTITY the STRUCTURE the provider compiles a grammar from, with leaf scalar
 *                              VALUES erased and every property name, nesting level, keyword and
 *                              array arity kept. Shared by rows that differ only in their data.
 *
 * Measured over the real §199 cohort (`test-201-harness-hardening.ts`, cases B4-B6):
 *
 *   all ten capability-ABSENT rows  -> one effective grammar identity
 *   both capability-PRESENT rows    -> one DIFFERENT effective grammar identity
 *   SG-01 and SG-02                 -> the SAME identity, with DIFFERENT exact schema hashes
 *
 * which is precisely the partition the grammar-size rejection follows.
 *
 * ==================== THE LINES THIS MODULE MUST NOT CROSS ====================
 *
 * 1. ADJACENCY SURVIVES. §198 case M3 is deliberate: two rows that both produced malformed output
 *    are ordinary stochastic variation, and a run that halted on them would destroy the observations
 *    it was convened to collect. Clause (a) is not replaced, not weakened, and not reimplemented --
 *    it is `recordAttempt` / `mayIssueNextAttempt`, called directly.
 *
 * 2. CLASSIFICATION IS CONSERVATIVE. Unknown is treated as transient. Misclassifying a transient
 *    failure as deterministic truncates a run over a blip and destroys behavioural evidence, which
 *    is unrecoverable; the opposite error wastes one cohort row at $0.00. The two errors are not
 *    symmetric and the code must not pretend they are.
 *
 * 3. AN ATTEMPT THAT REACHED INFERENCE NEVER CONTRIBUTES. Inherited unchanged from §198: a
 *    pre-inference rejection is a statement about OUR REQUEST; an inference-time failure is a
 *    statement about THE MODEL, and it is the thing a cohort exists to sample.
 */

import { createHash } from 'crypto';
import { resolve, sep, join } from 'path';

import {
  normaliseProviderErrorMessage,
  preInferenceSignature,
  recordAttempt,
  mayIssueNextAttempt,
  initialBreakerState,
  SYSTEMATIC_PRE_INFERENCE_REJECTION,
  CONSECUTIVE_IDENTICAL_REJECTIONS_TO_STOP,
  PRE_INFERENCE_CIRCUIT_BREAKER_VERSION,
  type AttemptSignatureInput,
  type BreakerState,
} from './expert-pre-inference-circuit-breaker';
import {
  axisResult,
  FORBIDDEN_EMPTY_RUN_PHRASES,
  NOT_EXERCISED,
  EMPTY_RUN_SAFETY_VERSION,
} from './expert-empty-run-safety';

export const HARNESS_HARDENING_VERSION = 'hazlenz.expert.201.harness-hardening.v1' as const;

/**
 * The exact predecessor versions this successor is constructed over.
 *
 * Held as data and asserted by the test so that a future edit to either predecessor is a LOUD test
 * failure rather than a silent change of meaning underneath §199's frozen hashes.
 */
export const CONSTRUCTED_OVER = {
  circuitBreaker: PRE_INFERENCE_CIRCUIT_BREAKER_VERSION,
  emptyRunSafety: EMPTY_RUN_SAFETY_VERSION,
} as const;

const sha256 = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

// ===========================================================================================
// 1. THE FAILURE TAXONOMY
// ===========================================================================================

/**
 * The five classes §201 is authorised to use. This vocabulary is closed on purpose: a near-member
 * invented for linguistic exactness would distort the mechanism the class names.
 *
 * Note what is NOT here: ACCOUNT_STATE_REJECTION. §200's recommendation table lists it, but §192's
 * preregistration and §199's executor already stop on its FIRST occurrence, before any breaker
 * consults this classifier -- "a credit rejection stops the run on FIRST occurrence rather than
 * reproving the account condition 39 times". Adding a sixth class would have implied this module
 * decides something it does not decide. Instead `classifyProviderFailure` raises the separate
 * `accountStateRejection` flag AND classifies conservatively, so a harness that forgets the
 * stricter pre-existing rule still cannot memoise an account condition as a contract fact.
 */
export type HarnessFailureClass =
  /** The same request would be rejected the same way every time. The cause is in OUR request. */
  | 'DETERMINISTIC_CONTRACT_REJECTION'
  /** The same request might succeed later. The cause is not in our request. */
  | 'TRANSIENT_PROVIDER_FAILURE'
  /** Inference ran; the OUTPUT was unusable. This is model behaviour and a cohort samples it. */
  | 'INFERENCE_COMPLETED_OUTPUT_FAILURE'
  /** Inference ran; the model declined to answer. Also model behaviour, and not the same thing. */
  | 'SEMANTIC_PROVIDER_REFUSAL'
  /** We genuinely cannot tell. Recorded honestly, and TREATED AS TRANSIENT. */
  | 'UNKNOWN_PROVIDER_FAILURE';

export const HARNESS_FAILURE_CLASSES: readonly HarnessFailureClass[] = [
  'DETERMINISTIC_CONTRACT_REJECTION',
  'TRANSIENT_PROVIDER_FAILURE',
  'INFERENCE_COMPLETED_OUTPUT_FAILURE',
  'SEMANTIC_PROVIDER_REFUSAL',
  'UNKNOWN_PROVIDER_FAILURE',
];

/**
 * How the breaker is permitted to use each class.
 *
 * `MEMOISE` is granted to exactly ONE class. Everything else gets adjacency only, or nothing --
 * which is the conservative default written into the type rather than into a comment.
 */
export type BreakerTreatment =
  /** Eligible for the new stage-local memory (clause b) AND for adjacency (clause a). */
  | 'MEMOISE_AND_ADJACENCY'
  /** Adjacency only. A repeat may still be a blip, so only two IN A ROW may stop a run. */
  | 'ADJACENCY_ONLY'
  /** Never contributes to any stopping rule. Inference was reached; this is the evidence. */
  | 'NEVER_CONTRIBUTES';

export const BREAKER_TREATMENT_BY_CLASS: Readonly<Record<HarnessFailureClass, BreakerTreatment>> = {
  DETERMINISTIC_CONTRACT_REJECTION: 'MEMOISE_AND_ADJACENCY',
  TRANSIENT_PROVIDER_FAILURE: 'ADJACENCY_ONLY',
  UNKNOWN_PROVIDER_FAILURE: 'ADJACENCY_ONLY',
  INFERENCE_COMPLETED_OUTPUT_FAILURE: 'NEVER_CONTRIBUTES',
  SEMANTIC_PROVIDER_REFUSAL: 'NEVER_CONTRIBUTES',
};

/**
 * The ONLY message shapes that may be called deterministic. An allow-list, not a heuristic.
 *
 * §200 established why the HTTP status and the provider's `error.type` are not sufficient on their
 * own: §197's `maxItems` rejection and a hypothetical rate limit both arrive as 4xx
 * `invalid_request_error` in some encodings. So the class keys on the NORMALISED MESSAGE SHAPE, and
 * anything not matched here falls through to UNKNOWN and is treated as transient.
 *
 * Every entry names the section that paid for it. An entry with no section behind it is a guess, and
 * a guess in this list costs behavioural evidence.
 */
export interface DeterministicRejectionPattern {
  readonly id: string;
  readonly pattern: RegExp;
  readonly whyDeterministic: string;
  readonly paidForBy: string;
}

export const DETERMINISTIC_REJECTION_PATTERNS: readonly DeterministicRejectionPattern[] = [
  {
    id: 'COMPILED_GRAMMAR_TOO_LARGE',
    pattern: /compiled grammar is too large/,
    whyDeterministic:
      'grammar compilation is a pure function of the submitted tool schemas. The identical schema '
      + 'compiles to the identical grammar and exceeds the identical limit, every time.',
    paidForBy: '§199 SG-01 at position 3 and SG-02 at position 8, byte-identical message',
  },
  {
    id: 'UNSUPPORTED_SCHEMA_KEYWORD',
    pattern: /property '[^']*' is not supported/,
    whyDeterministic:
      'the provider does not implement the keyword. Re-sending the same schema cannot change that.',
    paidForBy: "§197's twelve byte-identical 400s on `maxItems`",
  },
  {
    id: 'INVALID_SCHEMA',
    pattern: /(input_schema|tool schema|schema) is invalid|invalid schema for tool/,
    whyDeterministic: 'schema validation is deterministic over the submitted bytes.',
    paidForBy: '§197 / §198 transport remediation',
  },
  {
    id: 'UNKNOWN_TOOL',
    pattern: /(unknown|unrecognized|unrecognised) tool|tool '[^']*' (was )?not found/,
    whyDeterministic: 'the tool name is ours and is fixed for the run.',
    paidForBy: '§198 request-compatibility matrix',
  },
  {
    id: 'REQUEST_TOO_LONG',
    pattern: /prompt is too long|input length .* exceeds|exceeds the maximum .* tokens/,
    whyDeterministic:
      'prompt length is a property of the request we constructed, not of provider load.',
    paidForBy: '§198 request-compatibility matrix',
  },
  {
    id: 'UNEXPECTED_REQUEST_FIELD',
    pattern: /(unexpected|unrecognized|unrecognised) (keyword|field|parameter)|additional properties are not allowed/,
    whyDeterministic: 'the field is one we sent; the provider will reject it identically next time.',
    paidForBy: '§198 request-compatibility matrix',
  },
];

/**
 * Transient by HTTP status, checked BEFORE the deterministic allow-list.
 *
 * Order matters and is the conservative direction: if a provider ever wrapped a rate limit in a
 * message that happened to match a deterministic pattern, the status wins and the run survives.
 */
export const TRANSIENT_HTTP_STATUSES: readonly number[] = [408, 409, 425, 429];

/** Provider error types that are transient regardless of message. */
export const TRANSIENT_PROVIDER_ERROR_TYPES: readonly string[] = [
  'rate_limit_error', 'overloaded_error', 'api_error', 'timeout_error', 'timeout',
  'connection_error', 'service_unavailable', 'econnreset', 'etimedout', 'enotfound', 'socket_hang_up',
];

/** Account-state markers. Handled by a STRICTER pre-existing rule; never memoised here. */
export const ACCOUNT_STATE_MARKERS: readonly RegExp[] = [
  /credit balance is too low/,
  /insufficient (credit|quota|funds)/,
  /billing/,
  /your account does not have access/,
  /model .* not available to your (account|organization|organisation)/,
];

export const ACCOUNT_STATE_ERROR_TYPES: readonly string[] = [
  'authentication_error', 'permission_error', 'billing_error',
];

/** What the executor knows about one attempt, over and above §198's signature input. */
export interface HarnessAttemptInput extends AttemptSignatureInput {
  /**
   * The provider's own `stop_reason`, when inference was reached. Used ONLY to separate a refusal
   * from a malformed output; neither can contribute to a stopping rule, so nothing turns on it
   * except how honestly the run is described.
   */
  readonly providerStopReason?: string | null;
  /**
   * The COARSE contract class -- e.g. `firstpass:vnext:capability-PRESENT`. Declared by the harness
   * in its preregistration, never derived from a row. §199 had no such field, which is half of why
   * §200's recommended clause would not have fired.
   */
  readonly requestContractClass?: string | null;
  /**
   * The structural identity of the schema the provider compiles a grammar from. See
   * `effectiveGrammarIdentity`. Optional so that a harness that has not adopted it degrades to
   * clause (a) alone rather than to a wrong key.
   */
  readonly effectiveSchemaIdentity?: string | null;
}

export interface FailureClassification {
  readonly failureClass: HarnessFailureClass;
  readonly breakerTreatment: BreakerTreatment;
  /** True when a stricter, pre-existing stop-on-first-occurrence rule owns this attempt. */
  readonly accountStateRejection: boolean;
  /** The allow-list entry that fired, when one did. Null for every other class. */
  readonly matchedPatternId: string | null;
  /** Why this class and not another, in a sentence that can be pasted into evidence. */
  readonly reason: string;
  /** The normalised message the decision was actually made on. */
  readonly normalisedMessage: string;
}

/**
 * Classify one attempt.
 *
 * Reads top to bottom in order of how much is KNOWN, with the safest answer at every fork:
 *
 *   reached inference        -> it is model behaviour; never a stopping rule
 *   account-state marker     -> a stricter rule owns it; classify conservatively anyway
 *   transient status or type -> transient
 *   deterministic allow-list -> deterministic  (the only path to MEMOISE)
 *   anything else            -> UNKNOWN, treated as transient
 */
export function classifyProviderFailure(a: HarnessAttemptInput): FailureClassification {
  const normalisedMessage = normaliseProviderErrorMessage(a.providerErrorMessage);
  const errorType = (a.providerErrorType ?? '').trim().toLowerCase();

  // ---- inference was reached. This is the §198 line, and it is absolute.
  if (a.reachedInference) {
    const stop = (a.providerStopReason ?? '').trim().toLowerCase();
    const refused = stop === 'refusal' || stop === 'refused'
      || /\brefus(e|ed|al)\b|\bdecline[ds]?\b|cannot assist|unable to assist/.test(normalisedMessage);
    return {
      failureClass: refused ? 'SEMANTIC_PROVIDER_REFUSAL' : 'INFERENCE_COMPLETED_OUTPUT_FAILURE',
      breakerTreatment: 'NEVER_CONTRIBUTES',
      accountStateRejection: false,
      matchedPatternId: null,
      reason: refused
        ? 'inference ran and the model declined. That is a per-row semantic outcome and is exactly '
          + 'what the cohort was convened to observe; it can never stop a run.'
        : 'inference ran and the output was unusable. §198: an inference-time failure is a '
          + 'statement about THE MODEL, not about our request, and never contributes to a streak.',
      normalisedMessage,
    };
  }

  // ---- account state. A stricter rule already stops the run on the FIRST occurrence.
  const accountStateRejection = ACCOUNT_STATE_ERROR_TYPES.includes(errorType)
    || ACCOUNT_STATE_MARKERS.some(re => re.test(normalisedMessage));
  if (accountStateRejection) {
    return {
      failureClass: 'TRANSIENT_PROVIDER_FAILURE',
      breakerTreatment: 'ADJACENCY_ONLY',
      accountStateRejection: true,
      matchedPatternId: null,
      reason:
        'an account-state rejection. §192 already stops the run on its FIRST occurrence, so this '
        + 'module deliberately does not claim it as a contract fact: an account condition is not a '
        + 'property of the request contract and must not be memoised against a schema identity.',
      normalisedMessage,
    };
  }

  // ---- transient by status or by the provider's own type. Checked BEFORE the allow-list.
  const status = a.httpStatus;
  if (typeof status === 'number'
      && (TRANSIENT_HTTP_STATUSES.includes(status) || (status >= 500 && status <= 599))) {
    return {
      failureClass: 'TRANSIENT_PROVIDER_FAILURE',
      breakerTreatment: 'ADJACENCY_ONLY',
      accountStateRejection: false,
      matchedPatternId: null,
      reason: `HTTP ${status} describes the provider's state, not our request. Checked before the `
        + 'deterministic allow-list on purpose: if a rate limit ever arrived wearing a '
        + 'deterministic-looking message, the status must win and the run must survive.',
      normalisedMessage,
    };
  }
  if (TRANSIENT_PROVIDER_ERROR_TYPES.includes(errorType)) {
    return {
      failureClass: 'TRANSIENT_PROVIDER_FAILURE',
      breakerTreatment: 'ADJACENCY_ONLY',
      accountStateRejection: false,
      matchedPatternId: null,
      reason: `the provider's own error type '${errorType}' names its own condition.`,
      normalisedMessage,
    };
  }

  // ---- the ONLY path to MEMOISE.
  const hit = DETERMINISTIC_REJECTION_PATTERNS.find(p => p.pattern.test(normalisedMessage));
  if (hit !== undefined) {
    return {
      failureClass: 'DETERMINISTIC_CONTRACT_REJECTION',
      breakerTreatment: 'MEMOISE_AND_ADJACENCY',
      accountStateRejection: false,
      matchedPatternId: hit.id,
      reason: `${hit.id}: ${hit.whyDeterministic} (${hit.paidForBy})`,
      normalisedMessage,
    };
  }

  return {
    failureClass: 'UNKNOWN_PROVIDER_FAILURE',
    breakerTreatment: 'ADJACENCY_ONLY',
    accountStateRejection: false,
    matchedPatternId: null,
    reason:
      'no deterministic pattern matched. Recorded as UNKNOWN rather than relabelled, and TREATED '
      + 'AS TRANSIENT: calling a blip deterministic truncates a run and destroys behavioural '
      + 'evidence, which cannot be recovered; the opposite error wastes one cohort row at $0.00.',
    normalisedMessage,
  };
}

// ===========================================================================================
// 2. EFFECTIVE GRAMMAR IDENTITY -- the key §199 did not have
// ===========================================================================================

/**
 * Reduce a JSON Schema to the STRUCTURE a grammar compiler sees, discarding the data that varies
 * row to row.
 *
 * KEPT:    every property name, every nesting level, every schema keyword, every array ARITY
 *          (an enum of three alternatives and an enum of nine are different grammars).
 * ERASED:  leaf scalar VALUES -- replaced by their JavaScript type. `"OBS-SG-01"` and
 *          `"OBS-SG-02"` both become `"string"`; `3` and `40` both become `"number"`.
 *
 * WHERE THIS CAN BE WRONG, STATED PLAINLY: two schemas with the same shape but very different
 * literal LENGTHS could compile to grammars of different size, so this identity can be coarser than
 * the provider's real behaviour. The consequence of coarseness is a skipped row that MIGHT have
 * succeeded -- $0.00 and one unexercised row, recorded as such. The consequence of the opposite
 * error is spending rows rediscovering a settled fact, which is what §199 actually did. A harness
 * that wants the finer key can simply supply the exact schema hash as `effectiveSchemaIdentity`
 * instead; this function is offered, not imposed.
 */
export function grammarShapeOf(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(grammarShapeOf);
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(value as Record<string, unknown>).sort()) {
      out[k] = grammarShapeOf((value as Record<string, unknown>)[k]);
    }
    return out;
  }
  return value === null ? 'null' : typeof value;
}

/** Key-sorted JSON. Internal fingerprint only; it is never compared against a frozen hash. */
export function canonicalJson(value: unknown): string {
  const walk = (v: unknown): unknown => {
    if (Array.isArray(v)) return v.map(walk);
    if (v !== null && typeof v === 'object') {
      const o: Record<string, unknown> = {};
      for (const k of Object.keys(v as Record<string, unknown>).sort()) {
        o[k] = walk((v as Record<string, unknown>)[k]);
      }
      return o;
    }
    return v;
  };
  return JSON.stringify(walk(value));
}

export function effectiveGrammarIdentity(schema: unknown): string {
  return sha256(canonicalJson(grammarShapeOf(schema))).slice(0, 16);
}

/**
 * The stage-local memory key.
 *
 * All three parts are required. A missing part yields `null`, and a null key can never be memoised
 * -- expressed as an absent value rather than as a flag a caller might forget to check, which is the
 * same device §198 used for `preInferenceSignature` returning null on an inference-reaching attempt.
 */
export function deterministicRejectionKey(a: HarnessAttemptInput): string | null {
  const cls = (a.requestContractClass ?? '').trim();
  const grammar = (a.effectiveSchemaIdentity ?? '').trim();
  if (cls.length === 0 || grammar.length === 0) return null;
  return `stage=${a.stage} | class=${cls} | grammar=${grammar}`;
}

// ===========================================================================================
// 3. THE HARDENED BREAKER -- clause (a) preserved verbatim, clause (b) added beside it
// ===========================================================================================

export const DETERMINISTIC_CONTRACT_REJECTION_ALREADY_ESTABLISHED =
  'DETERMINISTIC_CONTRACT_REJECTION_ALREADY_ESTABLISHED' as const;

export interface EstablishedRejection {
  readonly key: string;
  /** The full §198 normalised signature of the attempt that established it. */
  readonly signature: string;
  readonly matchedPatternId: string | null;
  readonly attemptOrdinal: number;
}

/**
 * The successor state. `predecessor` is the §198 state, held VERBATIM and never rewritten, so
 * `predecessorStateOf` is an exact projection and the successor is provably reversible.
 */
export interface HardenedBreakerState {
  readonly predecessor: BreakerState;
  readonly established: readonly EstablishedRejection[];
  readonly attemptsRecorded: number;
  readonly classCounts: Readonly<Record<HarnessFailureClass, number>>;
}

const zeroCounts = (): Record<HarnessFailureClass, number> => ({
  DETERMINISTIC_CONTRACT_REJECTION: 0,
  TRANSIENT_PROVIDER_FAILURE: 0,
  INFERENCE_COMPLETED_OUTPUT_FAILURE: 0,
  SEMANTIC_PROVIDER_REFUSAL: 0,
  UNKNOWN_PROVIDER_FAILURE: 0,
});

export const initialHardenedState = (): HardenedBreakerState => ({
  predecessor: initialBreakerState(),
  established: [],
  attemptsRecorded: 0,
  classCounts: zeroCounts(),
});

/** The exact §198 state, recoverable at any point. The reversibility the discipline requires. */
export function predecessorStateOf(state: HardenedBreakerState): BreakerState {
  return state.predecessor;
}

export interface HardenedRecordResult {
  readonly state: HardenedBreakerState;
  readonly classification: FailureClassification;
  readonly signature: string | null;
  readonly memoisedKey: string | null;
}

/**
 * Fold one attempt in.
 *
 * `recordAttempt` -- the §198 function, unmodified -- is called on EVERY attempt, unconditionally
 * and first. Clause (a) therefore behaves identically to §198 for every input, including inputs
 * this module classifies as deterministic. The new memory is written afterwards and never feeds
 * back into the predecessor state.
 */
export function recordHardenedAttempt(
  state: HardenedBreakerState, a: HarnessAttemptInput,
): HardenedRecordResult {
  const predecessor = recordAttempt(state.predecessor, a);
  const classification = classifyProviderFailure(a);
  const signature = preInferenceSignature(a);
  const attemptsRecorded = state.attemptsRecorded + 1;

  const classCounts = { ...state.classCounts };
  classCounts[classification.failureClass] += 1;

  let established = state.established;
  let memoisedKey: string | null = null;

  // Memoisation requires ALL of: a real pre-inference signature, the MEMOISE treatment, and a
  // complete key. Any one missing and nothing is remembered -- the safe direction.
  if (signature !== null && classification.breakerTreatment === 'MEMOISE_AND_ADJACENCY') {
    const key = deterministicRejectionKey(a);
    if (key !== null && !established.some(e => e.key === key)) {
      memoisedKey = key;
      established = [...established, {
        key,
        signature,
        matchedPatternId: classification.matchedPatternId,
        attemptOrdinal: attemptsRecorded,
      }];
    } else if (key !== null) {
      memoisedKey = key;
    }
  }

  return {
    state: { predecessor, established, attemptsRecorded, classCounts },
    classification,
    signature,
    memoisedKey,
  };
}

/**
 * What the harness should do about an attempt it is ABOUT TO issue.
 *
 * `SKIP_ATTEMPT` and `STOP_RUN` are deliberately different outcomes. §200's own worked example says
 * that under the recommended rule "SG-02 is not issued at position 8 -> the run continues through
 * the remaining capability-ABSENT rows". Clause (b) is a statement about ONE contract class; it
 * carries no information about any other class, and halting the whole run on it would throw away
 * rows the rejection says nothing about. Clause (a) keeps §198's global STOP_RUN unchanged.
 */
export type AttemptDisposition = 'PROCEED' | 'SKIP_ATTEMPT' | 'STOP_RUN';

export interface PlannedAttemptDecision {
  readonly allowed: boolean;
  readonly disposition: AttemptDisposition;
  readonly clause: 'A_CONSECUTIVE' | 'B_STAGE_LOCAL_MEMORY' | null;
  readonly stopReason: string | null;
  readonly detail: string | null;
  /** The key that already established the fact, when clause (b) fired. */
  readonly establishedBy: EstablishedRejection | null;
}

/**
 * The planned attempt, as much of it as is known before it is issued. It carries no response fields
 * because there is no response yet -- which is why this cannot be `AttemptSignatureInput`.
 */
export interface PlannedAttempt {
  readonly stage: string;
  readonly requestContractClass: string | null;
  readonly effectiveSchemaIdentity: string | null;
}

export function mayIssuePlannedAttempt(
  state: HardenedBreakerState, planned: PlannedAttempt,
): PlannedAttemptDecision {
  // Clause (a) FIRST, and unchanged. §198 owns this answer.
  const legacy = mayIssueNextAttempt(state.predecessor);
  if (!legacy.allowed) {
    return {
      allowed: false,
      disposition: 'STOP_RUN',
      clause: 'A_CONSECUTIVE',
      stopReason: legacy.stopReason,
      detail: legacy.detail,
      establishedBy: null,
    };
  }

  // Clause (b). Scoped to ONE contract class.
  const key = deterministicRejectionKey({
    stage: planned.stage,
    requestContractClass: planned.requestContractClass,
    effectiveSchemaIdentity: planned.effectiveSchemaIdentity,
    reachedInference: false, httpStatus: null, providerErrorType: null,
    providerErrorMessage: null, requestContractId: '',
  });
  if (key !== null) {
    const hit = state.established.find(e => e.key === key);
    if (hit !== undefined) {
      return {
        allowed: false,
        disposition: 'SKIP_ATTEMPT',
        clause: 'B_STAGE_LOCAL_MEMORY',
        stopReason: DETERMINISTIC_CONTRACT_REJECTION_ALREADY_ESTABLISHED,
        detail:
          `attempt ${hit.attemptOrdinal} already established a DETERMINISTIC_CONTRACT_REJECTION for `
          + `${key}${hit.matchedPatternId ? ` (${hit.matchedPatternId})` : ''}. An identical grammar `
          + 'compiles to an identical result, so issuing this attempt would spend a cohort row to '
          + 'rediscover a settled fact -- which is exactly what §199 did with SG-02. The row is '
          + 'recorded as NOT ISSUED, never as a failure, and the run continues for every OTHER '
          + 'contract class.',
        establishedBy: hit,
      };
    }
  }

  return {
    allowed: true, disposition: 'PROCEED', clause: null,
    stopReason: null, detail: null, establishedBy: null,
  };
}

/** Recorded in code so the two clauses cannot drift into prose. */
export const STOPPING_RULE = {
  CLAUSE_A_UNCHANGED_FROM_198:
    `${CONSECUTIVE_IDENTICAL_REJECTIONS_TO_STOP} CONSECUTIVE attempts sharing one normalised `
    + `pre-inference signature stop the run with ${SYSTEMATIC_PRE_INFERENCE_REJECTION}. Adjacency is `
    + 'the right guard against STOCHASTIC model failure and is preserved exactly.',
  CLAUSE_B_NEW_IN_201:
    'a signature that has ALREADY occurred for the same stage + request-contract CLASS + effective '
    + 'grammar identity, AND was classified DETERMINISTIC_CONTRACT_REJECTION, suppresses the next '
    + 'attempt of THAT class only.',
  WHY_BOTH:
    'a capability-class failure is not distributed randomly across a cohort -- it fires on exactly '
    + 'the rows carrying the capability, and those rows can sit anywhere in a randomised order. '
    + 'Adjacency is the wrong instrument for a fault whose incidence is determined by row CLASS. '
    + 'Both statements are true at once, so the answer was never to replace the rule.',
  WHY_THE_KEY_CHANGED:
    "§199 keyed on sha(stableStringify(row schema)). The vNext wire schema is per-row, so SG-01 and "
    + 'SG-02 carried DIFFERENT contract ids for the SAME grammar-size fault. §200 recorded their '
    + 'signatures as identical; the log shows d0713f36696e8bea and 243bb6766c05599f. A memory keyed '
    + 'on that field would have missed SG-02 exactly as adjacency did.',
  THE_ACCEPTED_RISK:
    'clause (b) can suppress on a SINGLE observation. If a provider ever returned a grammar-size '
    + 'rejection non-deterministically, one row is skipped that a retry might have completed. It is '
    + 'recorded as NOT ISSUED, everything already obtained is preserved, and a successor '
    + 're-authorization can re-issue it. Nothing is lost that a fresh authorization cannot recover.',
} as const;

// ===========================================================================================
// 4. NON-OPPORTUNITY SCORER SAFETY -- composed over §198's empty-run invariant
// ===========================================================================================

export const NO_OPPORTUNITY_REALISED = 'NO_OPPORTUNITY_REALISED' as const;

/**
 * THE GAP §199 EXPOSED IN THE §198 INVARIANT.
 *
 * §198's rule is `completed model executions = 0 => no positive verdict`. §199 completed EIGHT
 * verifier executions and still had to write:
 *
 *   O_UNSUPPLIED_CITATION_CONTAINMENT  "NOT_EXERCISED -- zero citation-shaped tokens emitted across
 *                                       all eight verifier calls, so the mechanism was never put to
 *                                       the test"
 *   N_GOVERNED_EVIDENCE_QUOTATION_BOUNDARY
 *                                      "NOT_EXERCISED -- the engineered opportunity row never
 *                                       reached the verifier"
 *
 * §199's scorer got that right by hand. Nothing in the module made it get it right: a scorer that
 * passed the RUN denominator (8) to `axisResult` would have printed a clean positive verdict for an
 * axis nothing ever put to the test, and it would have been literally true and completely
 * misleading -- the §193 lesson again, on a third instrument.
 *
 * ZERO EXECUTIONS and ZERO OPPORTUNITIES are different facts and this module refuses to let them
 * share a denominator. `opportunityDefinition` is mandatory: an axis whose opportunity cannot be
 * stated is an axis whose denominator nobody has actually decided.
 */
export interface OpportunityAxis {
  readonly axisId: string;
  /** Whole-run denominator. §198's rule still applies at zero. */
  readonly completedExecutions: number;
  /** THIS AXIS's denominator: executions where the behaviour was genuinely available. */
  readonly opportunitiesRealised: number;
  /** What makes an execution an opportunity for THIS axis. Required, and never inferred. */
  readonly opportunityDefinition: string;
  readonly verdictWhenExercised: string;
}

export function opportunityAxisResult(a: OpportunityAxis): string {
  // §198's rule first, delegated so the predecessor wording is preserved by construction.
  if (!Number.isFinite(a.completedExecutions) || a.completedExecutions <= 0) {
    return axisResult(0, a.verdictWhenExercised);
  }
  if (typeof a.opportunityDefinition !== 'string' || a.opportunityDefinition.trim().length === 0) {
    return `${NOT_EXERCISED} — the opportunity denominator for ${a.axisId} was never defined, so no `
      + 'verdict can be admitted. An undefined denominator is not an empty one.';
  }
  if (!Number.isFinite(a.opportunitiesRealised) || a.opportunitiesRealised <= 0) {
    return `${NOT_EXERCISED} — ${NO_OPPORTUNITY_REALISED}. ${a.completedExecutions} execution(s) `
      + `completed, but none realised the opportunity for ${a.axisId} `
      + `(opportunity = ${a.opportunityDefinition.trim()}). The axis was never put to the test; `
      + 'this is neither a pass nor a failure, and it must not be read as one.';
  }
  return axisResult(a.opportunitiesRealised, a.verdictWhenExercised);
}

export interface AxisEmission {
  readonly axisId: string;
  readonly opportunitiesRealised: number;
  readonly emitted: string;
}

/**
 * The guard a scorer applies to its own output BEFORE writing it.
 *
 * §198's `emptyRunReportingViolations` only fires when the WHOLE RUN was empty. This one fires
 * per-axis, so an axis with a zero opportunity denominator inside a run that produced plenty of
 * output cannot slip a positive phrase through. Returns findings rather than throwing, for the same
 * reason §198 did: an instrument that catches itself should record its own defect in the evidence
 * rather than die and leave nothing behind.
 */
export function nonOpportunityReportingViolations(axes: readonly AxisEmission[]): string[] {
  const violations: string[] = [];
  for (const ax of axes) {
    if (Number.isFinite(ax.opportunitiesRealised) && ax.opportunitiesRealised > 0) continue;
    const value = ax.emitted;
    if (typeof value !== 'string') continue;
    if (value.startsWith(NOT_EXERCISED)) continue;
    for (const phrase of FORBIDDEN_EMPTY_RUN_PHRASES) {
      if (value.toUpperCase().includes(phrase.toUpperCase())) {
        violations.push(`${ax.axisId}: ${JSON.stringify(value)} asserts observed behaviour on an `
          + 'axis whose OPPORTUNITY was never realised. Executions occurred; this axis was not among '
          + 'what they exercised.');
        break;
      }
    }
  }
  return violations;
}

// ===========================================================================================
// 5. IMMUTABLE EVIDENCE DIRECTORIES
// ===========================================================================================

/**
 * §195-§200 evidence, immutable for every agent including the orchestrator.
 *
 * This is a FUNCTION and not a comment on purpose. §201's ownership map states the rule; a rule that
 * exists only in a document is enforced by whoever last read the document. The §193 lesson applies
 * to guards as much as to audits: a protection that cannot actually refuse is indistinguishable
 * from no protection.
 */
export const IMMUTABLE_EVIDENCE_DIRECTORIES: Readonly<Record<string, string>> = {
  '§195': 'expert-hazlenz-v3-2-end-to-end-validation-2026-09-06',
  '§196': 'expert-hazlenz-structured-first-pass-owed-facts-2026-09-06',
  '§197': 'expert-hazlenz-structured-e2e-validation-2026-09-07',
  '§198': 'expert-hazlenz-structured-pipeline-transport-remediation-2026-09-07',
  '§199': 'expert-hazlenz-successor-structured-e2e-2026-09-07',
  '§200': 'expert-hazlenz-semantic-adjudication-2026-09-07',
};

/** Repository root, derived from this file's own location: backend/scripts/lib -> ../../.. */
export const REPO_ROOT = resolve(__dirname, '..', '..', '..');

export const immutableEvidenceRoots = (): { section: string; path: string }[] =>
  Object.entries(IMMUTABLE_EVIDENCE_DIRECTORIES)
    .map(([section, dir]) => ({ section, path: resolve(REPO_ROOT, 'verification', dir) }));

const withSep = (p: string): string => (p.endsWith(sep) ? p : p + sep);

export interface EvidenceWriteVerdict {
  readonly allowed: boolean;
  readonly section: string | null;
  readonly resolvedPath: string;
  readonly reason: string | null;
  /** True when the target is not inside a protected directory but CONTAINS one. */
  readonly wouldDestroyByContainment: boolean;
}

/**
 * Decide whether a write to `targetPath` is permitted.
 *
 * Two ways to hit a protected package, and both are refused:
 *
 *   INSIDE       verification/<§199 dir>/RUN-SUMMARY.json   -- overwrite a recorded artifact
 *   CONTAINING   verification/                              -- a write or removal at an ANCESTOR
 *                                                              destroys the package underneath it
 *
 * `resolve` is applied first, so `a/../../verification/<§199 dir>/x` cannot walk in sideways, and a
 * sibling directory whose name merely STARTS with a protected name (`...-2026-09-07-extra`) is not
 * caught, because the comparison is on path segments and not on string prefixes.
 */
export function checkEvidenceWrite(targetPath: string): EvidenceWriteVerdict {
  const resolved = resolve(targetPath);
  for (const { section, path: root } of immutableEvidenceRoots()) {
    if (resolved === root || resolved.startsWith(withSep(root))) {
      return {
        allowed: false, section, resolvedPath: resolved, wouldDestroyByContainment: false,
        reason: `${resolved} is inside the ${section} evidence package, which is IMMUTABLE. A `
          + 'recorded evidence artifact is the only proof that the run which produced it happened '
          + 'as recorded. Overwriting one destroys the evidence and leaves a plausible file behind, '
          + 'which is worse than leaving no file at all.',
      };
    }
    if (root.startsWith(withSep(resolved))) {
      return {
        allowed: false, section, resolvedPath: resolved, wouldDestroyByContainment: true,
        reason: `${resolved} CONTAINS the ${section} evidence package (${root}). A write or removal `
          + 'at an ancestor destroys the package underneath it just as completely as a write '
          + 'inside it.',
      };
    }
  }
  return {
    allowed: true, section: null, resolvedPath: resolved, reason: null,
    wouldDestroyByContainment: false,
  };
}

export const isImmutableEvidencePath = (p: string): boolean => !checkEvidenceWrite(p).allowed;

/** Throwing form, for a harness that must abort rather than proceed. */
export function assertEvidenceWriteAllowed(targetPath: string): void {
  const v = checkEvidenceWrite(targetPath);
  if (!v.allowed) {
    throw new Error(`IMMUTABLE_EVIDENCE_WRITE_REFUSED: ${v.reason}`);
  }
}

/**
 * Wrap any writer so the guard cannot be forgotten.
 *
 * The point of the wrapper is the same as §198's decision to keep `mayIssueNextAttempt` separate
 * from `recordAttempt`: a harness that skips the check should be a visibly missing line, not a
 * silently ignored return value.
 */
export function guardedWriter<T>(
  write: (path: string, contents: string) => T,
): (path: string, contents: string) => T {
  return (path: string, contents: string): T => {
    assertEvidenceWriteAllowed(path);
    return write(path, contents);
  };
}

// ===========================================================================================
// 6. TARGETED TEXTUAL MUTATION OF A LARGE JSON DOCUMENT
// ===========================================================================================

/**
 * THE DEFECT THIS EXISTS TO PREVENT.
 *
 * A prior slice updated `docs/INSITE_CURRENT_STATE.json` by `JSON.parse` -> mutate -> `JSON.stringify`
 * -> write. The document is 2.28 MB across 235 top-level keys, almost all of it work from unrelated
 * earlier sections, and a round trip through the parser is NOT the identity: measured on the real
 * file, `JSON.stringify(JSON.parse(text), null, 2)` differs from `text`. Escaping, unicode form and
 * separator placement in unrelated pre-existing entries were rewritten by a slice that had touched
 * none of them, and the diff for a one-key change was the whole file.
 *
 * So the rule is: TO CHANGE ONE KEY, CHANGE ONLY THAT KEY'S BYTES. The functions below never
 * re-serialise the document. They locate the span of one top-level member with a string-aware
 * scanner and splice. `provesOnlySpanChanged` then verifies the claim independently rather than
 * trusting it -- because "I only changed one key" is exactly the kind of assertion that is worth
 * nothing unless something checks it.
 */

export interface TopLevelMemberSpan {
  readonly key: string;
  /** Index of the member's opening quote. */
  readonly keyStart: number;
  /** Index just past the key's closing quote. */
  readonly keyEnd: number;
  /** Index of the first byte of the value. */
  readonly valueStart: number;
  /** Index just past the last byte of the value. */
  readonly valueEnd: number;
  /** Index just past the comma following this member, or -1 when it is the last member. */
  readonly commaEnd: number;
}

const isWs = (c: string): boolean => c === ' ' || c === '\t' || c === '\n' || c === '\r';

function skipWs(text: string, i: number): number {
  let j = i;
  while (j < text.length && isWs(text[j])) j += 1;
  return j;
}

/** Scan a JSON string literal starting at its opening quote. Returns the index just past it. */
function scanString(text: string, i: number): number {
  if (text[i] !== '"') throw new Error(`TARGETED_JSON_SCAN: expected '"' at ${i}`);
  let j = i + 1;
  while (j < text.length) {
    const c = text[j];
    if (c === '\\') { j += 2; continue; }
    if (c === '"') return j + 1;
    j += 1;
  }
  throw new Error('TARGETED_JSON_SCAN: unterminated string');
}

/** Scan any JSON value starting at `i`. Returns the index just past it. String-aware throughout. */
function scanValue(text: string, i: number): number {
  const c = text[i];
  if (c === '"') return scanString(text, i);
  if (c === '{' || c === '[') {
    let depth = 0;
    let j = i;
    while (j < text.length) {
      const d = text[j];
      if (d === '"') { j = scanString(text, j); continue; }
      if (d === '{' || d === '[') depth += 1;
      else if (d === '}' || d === ']') {
        depth -= 1;
        if (depth === 0) return j + 1;
      }
      j += 1;
    }
    throw new Error('TARGETED_JSON_SCAN: unterminated object or array');
  }
  // number, true, false, null -- ends at the first structural character or whitespace.
  let j = i;
  while (j < text.length && !isWs(text[j]) && text[j] !== ',' && text[j] !== '}' && text[j] !== ']') {
    j += 1;
  }
  if (j === i) throw new Error(`TARGETED_JSON_SCAN: no value at ${i}`);
  return j;
}

/** Decode a JSON string literal to its key. Uses JSON.parse on the LITERAL ONLY, never the document. */
const decodeKey = (literal: string): string => JSON.parse(literal) as string;

/** Every top-level member of the document, in document order, with exact byte spans. */
export function topLevelMemberSpans(text: string): TopLevelMemberSpan[] {
  let i = skipWs(text, text.charCodeAt(0) === 0xfeff ? 1 : 0);
  if (text[i] !== '{') {
    throw new Error('TARGETED_JSON_SCAN: the document root is not an object');
  }
  i = skipWs(text, i + 1);
  const spans: TopLevelMemberSpan[] = [];
  if (text[i] === '}') return spans;
  for (;;) {
    const keyStart = i;
    const keyEnd = scanString(text, i);
    const key = decodeKey(text.slice(keyStart, keyEnd));
    i = skipWs(text, keyEnd);
    if (text[i] !== ':') throw new Error(`TARGETED_JSON_SCAN: expected ':' after ${key}`);
    const valueStart = skipWs(text, i + 1);
    const valueEnd = scanValue(text, valueStart);
    let after = skipWs(text, valueEnd);
    let commaEnd = -1;
    if (text[after] === ',') { commaEnd = after + 1; after = skipWs(text, commaEnd); }
    spans.push({ key, keyStart, keyEnd, valueStart, valueEnd, commaEnd });
    if (commaEnd === -1) {
      if (text[after] !== '}') throw new Error('TARGETED_JSON_SCAN: expected "}" after last member');
      return spans;
    }
    if (text[after] === '}') return spans; // tolerate a trailing comma rather than corrupt the file
    i = after;
  }
}

export function findTopLevelMember(text: string, key: string): TopLevelMemberSpan | null {
  return topLevelMemberSpans(text).find(s => s.key === key) ?? null;
}

export type UpsertAction = 'REPLACED_VALUE_IN_PLACE' | 'INSERTED_AS_LAST_MEMBER';

export interface UpsertResult {
  readonly text: string;
  readonly action: UpsertAction;
  /** The span of the ORIGINAL text that was replaced. Bytes outside it are byte-identical. */
  readonly replacedSpan: { readonly start: number; readonly end: number };
  readonly insertedLength: number;
  readonly bytesBefore: number;
  readonly bytesAfter: number;
}

/**
 * Insert or replace ONE top-level key by splicing its bytes.
 *
 * `valueText` is supplied ALREADY RENDERED by the caller. That is deliberate: if this function
 * accepted a value and serialised it, it would own the escaping of the caller's data, and the whole
 * point is that this module never decides how anything is written except the span it is asked to
 * change. `renderJsonValue` is available for callers who want a renderer, and is not required.
 *
 * On insert, the indentation of the LAST existing member is copied, so a two-space document stays a
 * two-space document without this function ever forming an opinion about the file's formatting.
 */
export function upsertTopLevelJsonKey(text: string, key: string, valueText: string): UpsertResult {
  const spans = topLevelMemberSpans(text);
  const existing = spans.find(s => s.key === key);
  const bytesBefore = Buffer.byteLength(text, 'utf8');

  if (existing !== undefined) {
    const next = text.slice(0, existing.valueStart) + valueText + text.slice(existing.valueEnd);
    return {
      text: next,
      action: 'REPLACED_VALUE_IN_PLACE',
      replacedSpan: { start: existing.valueStart, end: existing.valueEnd },
      insertedLength: valueText.length,
      bytesBefore,
      bytesAfter: Buffer.byteLength(next, 'utf8'),
    };
  }

  if (spans.length === 0) {
    throw new Error('TARGETED_JSON_UPSERT: refusing to insert into an empty root object; the '
      + 'indentation to match cannot be observed, and guessing it would rewrite the document style');
  }
  const last = spans[spans.length - 1];
  // The indentation of the last member's key line, copied verbatim.
  const lineStart = text.lastIndexOf('\n', last.keyStart) + 1;
  const indent = text.slice(lineStart, last.keyStart);
  const insertAt = last.commaEnd === -1 ? last.valueEnd : last.commaEnd;
  const inserted = last.commaEnd === -1
    ? `,\n${indent}${JSON.stringify(key)}: ${valueText}`
    : `\n${indent}${JSON.stringify(key)}: ${valueText},`;
  const next = text.slice(0, insertAt) + inserted + text.slice(insertAt);
  return {
    text: next,
    action: 'INSERTED_AS_LAST_MEMBER',
    replacedSpan: { start: insertAt, end: insertAt },
    insertedLength: inserted.length,
    bytesBefore,
    bytesAfter: Buffer.byteLength(next, 'utf8'),
  };
}

/**
 * Verify -- independently of the function that made the change -- that ONLY the declared span moved.
 *
 * Compares the prefix before the span and the suffix after it, byte for byte. This is the check
 * that makes "targeted" a measured property rather than a claim in a commit message.
 */
export function provesOnlySpanChanged(
  before: string, after: string, result: UpsertResult,
): { readonly ok: boolean; readonly detail: string } {
  const { start, end } = result.replacedSpan;
  const prefixOk = before.slice(0, start) === after.slice(0, start);
  const beforeSuffix = before.slice(end);
  const afterSuffix = after.slice(start + result.insertedLength);
  const suffixOk = beforeSuffix === afterSuffix;
  const lengthOk = after.length === before.length - (end - start) + result.insertedLength;
  return {
    ok: prefixOk && suffixOk && lengthOk,
    detail: `prefix[0..${start}) ${prefixOk ? 'identical' : 'CHANGED'}; suffix ${suffixOk ? 'identical' : 'CHANGED'}; `
      + `length ${lengthOk ? 'consistent' : 'INCONSISTENT'}`,
  };
}

/** Convenience renderer for callers who want one. Never applied to the rest of the document. */
export function renderJsonValue(value: unknown, indentLevel: number, indentUnit = '  '): string {
  const body = JSON.stringify(value, null, indentUnit.length);
  if (indentLevel <= 0) return body;
  const pad = indentUnit.repeat(indentLevel);
  return body.split('\n').map((l, idx) => (idx === 0 ? l : pad + l)).join('\n');
}

// ===========================================================================================
// 7. EXPLICIT VERIFICATION LABELS
// ===========================================================================================

/**
 * WHY "tsc clean" IS BANNED IN THIS REPOSITORY'S REPORTS.
 *
 * `backend/tsconfig.json` includes `src/**` only. `backend/scripts` is not in it and carries
 * thousands of pre-existing type errors in unrelated legacy scripts that no slice has ever been
 * authorised to touch. So "tsc clean" is true of one scope and false of another, and a reader
 * cannot tell which was run. The fix is not to run more; it is to make the SCOPE part of the claim,
 * so that an unqualified claim is not expressible.
 */
export type TypecheckLabel = 'SRC_TYPECHECK' | 'EXPERIMENT_SCOPE_TYPECHECK';

export interface TypecheckScope {
  readonly label: TypecheckLabel;
  readonly covers: string;
  readonly doesNotCover: string;
  readonly command: string;
}

export const TYPECHECK_SCOPES: Readonly<Record<TypecheckLabel, TypecheckScope>> = {
  SRC_TYPECHECK: {
    label: 'SRC_TYPECHECK',
    covers: 'backend/src/** exactly as backend/tsconfig.json includes it — the production surface',
    doesNotCover:
      'backend/scripts/** — not in the tsconfig include, and carrying pre-existing errors in '
      + 'unrelated legacy scripts. A green SRC_TYPECHECK says NOTHING about any script.',
    command: 'npx tsc --noEmit -p tsconfig.json',
  },
  EXPERIMENT_SCOPE_TYPECHECK: {
    label: 'EXPERIMENT_SCOPE_TYPECHECK',
    covers:
      'the NAMED experiment files of the current slice and their transitive imports, and nothing '
      + 'else. Executing a file under ts-node without --transpile-only typechecks exactly this set.',
    doesNotCover:
      'the rest of backend/scripts/**, and the production surface. A green '
      + 'EXPERIMENT_SCOPE_TYPECHECK says NOTHING about either.',
    command: 'npx ts-node scripts/<the named file>.ts',
  },
};

export interface TypecheckClaimInput {
  readonly label: TypecheckLabel;
  readonly command: string;
  readonly exitCode: number;
  readonly errorCount: number;
  /** The exact files the claim covers, when the label is EXPERIMENT_SCOPE_TYPECHECK. */
  readonly files?: readonly string[];
}

/** A sentence that cannot be read as covering more than it does. */
export function typecheckClaim(c: TypecheckClaimInput): string {
  const scope = TYPECHECK_SCOPES[c.label];
  const outcome = c.exitCode === 0 && c.errorCount === 0 ? 'PASSED' : `FAILED (${c.errorCount} error(s))`;
  const files = c.files && c.files.length > 0 ? ` FILES: ${c.files.join(', ')}.` : '';
  return `${scope.label} ${outcome}. COMMAND: \`${c.command}\` (exit ${c.exitCode}). `
    + `COVERS: ${scope.covers}.${files} DOES NOT COVER: ${scope.doesNotCover}`;
}

/**
 * Phrases that assert a typecheck result without naming its scope. Held as data so the regression
 * asserts the absence of the CLASS, not of one string somebody happened to think of.
 */
export const AMBIGUOUS_TYPECHECK_PHRASES: readonly string[] = [
  'tsc clean',
  'tsc passes',
  'typecheck clean',
  'typecheck passes',
  'typechecks cleanly',
  'no type errors',
  'compiles cleanly',
];

/**
 * Find unscoped typecheck claims in a report. A phrase is only a violation when the SAME sentence
 * does not name a scope label — quoting the banned phrase in order to ban it is not a violation, and
 * a rule that could not tell the difference would be unusable in the document that states it.
 */
export function ambiguousTypecheckClaims(reportText: string): string[] {
  const out: string[] = [];
  const sentences = reportText.split(/(?<=[.!?\n])/);
  for (const s of sentences) {
    const lower = s.toLowerCase();
    for (const phrase of AMBIGUOUS_TYPECHECK_PHRASES) {
      if (!lower.includes(phrase)) continue;
      if (s.includes('SRC_TYPECHECK') || s.includes('EXPERIMENT_SCOPE_TYPECHECK')) continue;
      out.push(`unscoped typecheck claim ${JSON.stringify(phrase)} in: ${JSON.stringify(s.trim())}`);
      break;
    }
  }
  return out;
}

/** The npm script entries §201's orchestrator is asked to register. Reported, never applied here. */
export const REQUESTED_PACKAGE_JSON_SCRIPTS: Readonly<Record<string, string>> = {
  'test:201:harness': 'ts-node scripts/test-201-harness-hardening.ts',
  'test:198:transport': 'ts-node scripts/test-198-transport-remediation.ts',
};

export const HARNESS_HARDENING_PATHS = {
  module: join('backend', 'scripts', 'lib', 'expert-201-harness-hardening.ts'),
  test: join('backend', 'scripts', 'test-201-harness-hardening.ts'),
} as const;
