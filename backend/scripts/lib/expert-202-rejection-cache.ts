/**
 * §202 -- THE DETERMINISTIC-CONTRACT REJECTION CACHE. ADDITIVE SUCCESSOR. ZERO PROVIDER CALLS.
 *
 * ==================== WHAT IS INHERITED AND WHAT IS CORRECTED ====================
 *
 * INHERITED, BY CALL AND NOT BY COPY:
 *   §198  recordAttempt / mayIssueNextAttempt / preInferenceSignature / normaliseProviderErrorMessage
 *         Clause (a) — two CONSECUTIVE identical pre-inference rejections stop the run — is §198's
 *         function, called on every ISSUED attempt, first, unconditionally. It is not replaced, not
 *         weakened and not reimplemented. `predecessorBreakerStateOf` projects the §198 state back
 *         out exactly, so the successor is provably reversible.
 *   §201  classifyProviderFailure and its five-class taxonomy, with UNKNOWN treated as transient.
 *         The classifier is good and the conservatism is the product owner's requirement; §202
 *         imports it rather than restating it, so there is one taxonomy and not two.
 *   §198  NOT_EXERCISED, so the third accounting state uses the wording the repository already has.
 *
 * CORRECTED:
 *   1. THE KEY. §201's key is `stage | class | grammar`. The product-owner specification for §202
 *      is `provider/model family as relevant + execution stage + EFFECTIVE_GRAMMAR_IDENTITY +
 *      normalized deterministic rejection signature`. Three parts were missing and one was wrong:
 *
 *        MISSING  PROVIDER AND MODEL SCOPE. A grammar-size limit is a property of one provider's
 *                 compiler. §199 ran one model, so §201 could omit it without being caught, and a
 *                 harness that ever varied the model would have memoised one model's refusal
 *                 against another model's request.
 *        MISSING  THE REJECTION SIGNATURE. §201 remembered THAT a class was rejected, never WHICH
 *                 rejection. Two different deterministic faults on one grammar collapse into one
 *                 entry, and only the first is ever recorded — so the evidence loses the second
 *                 fault entirely.
 *        WRONG    `requestContractClass` was REQUIRED, and a null class silently disabled the whole
 *                 memory. A harness that forgot to declare it degraded to §198 with no complaint.
 *                 In §202 the class is ADVISORY: it is recorded and reported, and the grammar
 *                 identity carries the key. The capability class is a STRUCTURAL property of the
 *                 schema — §198's capability omission adds a property and a `required` member — so
 *                 deriving it from a declaration the harness might forget was the weaker of two
 *                 available mechanisms.
 *
 *      The four-part key identifies an ESTABLISHED FACT. The SUPPRESSION PREDICATE is necessarily
 *      the three-part PREFIX — provider, stage, grammar — because those are the only parts knowable
 *      before a request is issued. A planned attempt cannot be matched on the rejection it has not
 *      received yet. Both are computed by named functions so the distinction cannot blur.
 *
 *   2. STOP vs SKIP_ATTEMPT. §201 always returned SKIP_ATTEMPT and its report flagged the choice as
 *      ambiguous. §202 resolves it prospectively: BOTH dispositions exist, and which one applies is
 *      an EXPLICIT FROZEN INPUT — `FrozenCapabilityRequirement` — never an inference from counts,
 *      from the class name, or from how many rows remain. `createRejectionCache` refuses to build a
 *      cache whose requirement table does not TOTALLY cover the planned rows, so the question can
 *      never arrive undecided in the middle of a paid run.
 *
 *   3. THREE-STATE ACCOUNTING. §201 counted failure classes over attempts and had no ledger. It
 *      asserted in a comment that a suppressed row is "recorded as NOT ISSUED, never as a failure";
 *      nothing in the code made that true. §202 keeps a per-row ledger in exactly three states and
 *      `accountingViolations` proves the arithmetic rather than trusting it. THE INTEGRITY RULE: a
 *      SKIPPED row is never in a failure numerator and never in an attempt denominator. A skipped
 *      row is not a provider failure. It is not evidence of anything about the provider at all.
 *
 * ==================== THE LINE THIS MODULE MUST NOT CROSS ====================
 *
 * Nothing here has been exercised against a provider. §202 made zero provider calls. Every result
 * reported about this module is REPLAY against the recorded §199 execution log, and it must be
 * described that way. The cache's effect on a live run is INFERRED FROM REPLAY, not measured.
 */

import {
  recordAttempt,
  mayIssueNextAttempt,
  preInferenceSignature,
  normaliseProviderErrorMessage,
  initialBreakerState,
  SYSTEMATIC_PRE_INFERENCE_REJECTION,
  CONSECUTIVE_IDENTICAL_REJECTIONS_TO_STOP,
  PRE_INFERENCE_CIRCUIT_BREAKER_VERSION,
  type BreakerState,
} from './expert-pre-inference-circuit-breaker';
import { NOT_EXERCISED, EMPTY_RUN_SAFETY_VERSION } from './expert-empty-run-safety';
import {
  classifyProviderFailure,
  BREAKER_TREATMENT_BY_CLASS,
  HARNESS_HARDENING_VERSION,
  type HarnessAttemptInput,
  type HarnessFailureClass,
  type FailureClassification,
} from './expert-201-harness-hardening';
import {
  EFFECTIVE_GRAMMAR_IDENTITY_VERSION,
  EFFECTIVE_GRAMMAR_IDENTITY_IS_A_PROXY,
} from './expert-202-effective-grammar-identity';

export const REJECTION_CACHE_VERSION = 'hazlenz.expert.202.rejection-cache.v1' as const;

/** The exact predecessors this successor is constructed over. Asserted by the suite. */
export const CONSTRUCTED_OVER_202 = {
  circuitBreaker: PRE_INFERENCE_CIRCUIT_BREAKER_VERSION,
  emptyRunSafety: EMPTY_RUN_SAFETY_VERSION,
  harnessHardening: HARNESS_HARDENING_VERSION,
  grammarIdentity: EFFECTIVE_GRAMMAR_IDENTITY_VERSION,
} as const;

export const DETERMINISTIC_CONTRACT_REJECTION_ALREADY_ESTABLISHED =
  'DETERMINISTIC_CONTRACT_REJECTION_ALREADY_ESTABLISHED' as const;

export const REQUIRED_CAPABILITY_DETERMINISTICALLY_REJECTED =
  'REQUIRED_CAPABILITY_DETERMINISTICALLY_REJECTED' as const;

export const UNDECLARED_CAPABILITY_REQUIREMENT = 'UNDECLARED_CAPABILITY_REQUIREMENT' as const;

// ===========================================================================================
// 1. PROVIDER SCOPE -- "provider/model family as relevant", made explicit
// ===========================================================================================

/**
 * How widely a deterministic rejection is permitted to generalise.
 *
 * The conservative default is EXACT_MODEL, and it is the default because the opposite error is the
 * expensive one: a rejection memoised across a model family that does not in fact share a grammar
 * compiler would suppress rows on a model that was never asked. A harness that has evidence for the
 * wider scope declares DECLARED_MODEL_FAMILY and names the evidence in `scopeJustification`.
 */
export type ModelScopeKind = 'EXACT_MODEL' | 'DECLARED_MODEL_FAMILY';

export interface ProviderScope {
  /** e.g. `anthropic`. The party whose grammar compiler produced the rejection. */
  readonly providerFamily: string;
  /** The exact model id, or a declared family when the harness has evidence for the wider scope. */
  readonly modelScope: string;
  readonly modelScopeKind: ModelScopeKind;
  /** Required whenever the scope is wider than one model. Refused if empty in that case. */
  readonly scopeJustification: string | null;
}

export function providerScopeDefects(s: ProviderScope): string[] {
  const out: string[] = [];
  if (s.providerFamily.trim().length === 0) out.push('providerFamily is empty');
  if (s.modelScope.trim().length === 0) out.push('modelScope is empty');
  if (s.modelScopeKind === 'DECLARED_MODEL_FAMILY'
      && (s.scopeJustification ?? '').trim().length === 0) {
    out.push('modelScopeKind is DECLARED_MODEL_FAMILY but no scopeJustification was given. A '
      + 'rejection may only generalise beyond the exact model that produced it on stated evidence, '
      + 'because suppressing rows on a model that was never asked is the expensive error.');
  }
  return out;
}

// ===========================================================================================
// 2. THE FROZEN REQUIREMENT DECLARATION -- STOP vs SKIP_ATTEMPT, decided before the run
// ===========================================================================================

/**
 * Whether the experiment can continue once this capability is known to be deterministically
 * rejected.
 *
 * §201 left this ambiguous and said so. It is resolved here prospectively and it is resolved by
 * DECLARATION, not by inference. Nothing in the code looks at the class name, the row count, the
 * position in the order or the fraction of the cohort remaining. It reads the table.
 */
export type CapabilityRequirement =
  /**
   * The run cannot produce its result without this capability. The FIRST established deterministic
   * rejection halts the whole run — every subsequent row, of every class, is NOT_EXERCISED.
   */
  | 'REQUIRED_FOR_THE_EXPERIMENT_TO_CONTINUE'
  /**
   * The remaining rows still answer the questions the run was convened to answer. Matching rows are
   * SKIPPED; every other class proceeds. This is §199's actual situation: ten capability-ABSENT
   * rows were fully informative about first-pass behaviour with or without SG-01 and SG-02.
   */
  | 'NOT_REQUIRED_REMAINING_ROWS_STILL_INFORMATIVE';

export interface FrozenCapabilityRequirement {
  readonly stage: string;
  /**
   * The coarse contract class this declaration governs, e.g. `firstpass:vnext:capability-PRESENT`.
   * ADVISORY for the cache key (§202 correction 1) and LOAD-BEARING here: the requirement is a
   * statement about a CAPABILITY, which is what a class names, not about a grammar hash.
   */
  readonly requestContractClass: string;
  readonly requirement: CapabilityRequirement;
  /** The preregistration artifact and field that froze this. Refused if empty. */
  readonly frozenBy: string;
  /** Why this requirement and not the other, in a sentence that can be pasted into evidence. */
  readonly whyThisRequirement: string;
}

export function requirementDeclarationDefects(d: FrozenCapabilityRequirement): string[] {
  const out: string[] = [];
  if (d.stage.trim().length === 0) out.push('stage is empty');
  if (d.requestContractClass.trim().length === 0) out.push('requestContractClass is empty');
  if (d.frozenBy.trim().length === 0) {
    out.push(`${d.stage}/${d.requestContractClass}: frozenBy is empty. A requirement that names no `
      + 'freezing artifact is a decision made during the run, which is the thing this field exists '
      + 'to prevent.');
  }
  if (d.whyThisRequirement.trim().length === 0) {
    out.push(`${d.stage}/${d.requestContractClass}: whyThisRequirement is empty`);
  }
  return out;
}

const requirementFor = (
  table: readonly FrozenCapabilityRequirement[], stage: string, cls: string,
): FrozenCapabilityRequirement | null =>
  table.find(d => d.stage === stage && d.requestContractClass === cls) ?? null;

// ===========================================================================================
// 3. KEYS -- the established fact, and the predicate a planned attempt can actually be matched on
// ===========================================================================================

/**
 * The three parts knowable BEFORE a request is issued. This is what suppression matches on.
 *
 * It is a separate function from `establishedRejectionKey` on purpose, and neither is inlined,
 * because the difference between "what identifies the fact" and "what a future row can be tested
 * against" is exactly the distinction §200's recommendation lost.
 */
export function suppressionPrefix(
  scope: ProviderScope, stage: string, effectiveGrammarIdentity: string,
): string | null {
  const g = effectiveGrammarIdentity.trim();
  const st = stage.trim();
  if (g.length === 0 || st.length === 0) return null;
  return `provider=${scope.providerFamily} | model=${scope.modelScope} | stage=${st} | grammar=${g}`;
}

/**
 * The normalized deterministic rejection signature: WHICH rejection, not merely THAT one occurred.
 *
 * The pattern id names the class §201's allow-list matched; the normalised message distinguishes two
 * members of one class — two different unsupported keywords are both UNSUPPORTED_SCHEMA_KEYWORD and
 * are not the same fault. Both are kept because either alone loses something.
 */
export function deterministicRejectionSignature(
  matchedPatternId: string | null, providerErrorMessage: string | null,
): string {
  return `${matchedPatternId ?? '(unclassified)'}::${normaliseProviderErrorMessage(providerErrorMessage)}`;
}

/** The full four-part key. Identifies the established fact; never used as the suppression test. */
export function establishedRejectionKey(
  scope: ProviderScope, stage: string, effectiveGrammarIdentity: string, rejectionSignature: string,
): string | null {
  const prefix = suppressionPrefix(scope, stage, effectiveGrammarIdentity);
  if (prefix === null) return null;
  return `${prefix} | rejection=${rejectionSignature}`;
}

// ===========================================================================================
// 4. THE CACHE
// ===========================================================================================

export interface EstablishedDeterministicRejection {
  readonly key: string;
  readonly suppressionPrefix: string;
  readonly rejectionSignature: string;
  readonly matchedPatternId: string | null;
  /** The full §198 normalised signature of the attempt that established it. */
  readonly preInferenceSignature: string;
  readonly stage: string;
  readonly requestContractClass: string | null;
  readonly effectiveGrammarIdentity: string;
  readonly establishedByRowId: string;
  readonly establishedByOrdinal: number;
  readonly requirement: CapabilityRequirement;
}

export type RowState =
  | 'ATTEMPTED'
  | 'SKIPPED_DUE_TO_KNOWN_DETERMINISTIC_REJECTION'
  | 'NOT_EXERCISED';

export const ROW_STATES: readonly RowState[] = [
  'ATTEMPTED', 'SKIPPED_DUE_TO_KNOWN_DETERMINISTIC_REJECTION', 'NOT_EXERCISED',
];

export interface RowLedgerEntry {
  readonly ordinal: number;
  readonly rowId: string;
  readonly stage: string;
  readonly state: RowState;
  readonly reasonCode: string;
  /** ONLY ever non-null for an ATTEMPTED row. A skipped row has no provider outcome to describe. */
  readonly reachedInference: boolean | null;
  readonly failureClass: HarnessFailureClass | null;
  readonly suppressionPrefix: string | null;
  /** For a SKIPPED row: the ordinal of the ATTEMPTED row that established the fact. */
  readonly establishedByOrdinal: number | null;
}

export interface RunHalt {
  readonly stopReason: string;
  readonly detail: string;
  readonly establishedKey: string | null;
  readonly haltedAtOrdinal: number;
}

export interface RejectionCache {
  readonly version: string;
  /**
   * The run this cache belongs to. A cache is valid ONLY inside one frozen-treatment run — see
   * limit L2 in the identity module: the grammar identity cannot see a description-shortening
   * treatment change, and run scoping is what makes that harmless.
   */
  readonly runScopeId: string;
  readonly providerScope: ProviderScope;
  readonly requirements: readonly FrozenCapabilityRequirement[];
  readonly plannedRows: readonly PlannedRow[];
  readonly established: readonly EstablishedDeterministicRejection[];
  /** §198's state, held VERBATIM and never rewritten. Clause (a) is unchanged. */
  readonly predecessor: BreakerState;
  readonly ledger: readonly RowLedgerEntry[];
  readonly classCounts: Readonly<Record<HarnessFailureClass, number>>;
  readonly halt: RunHalt | null;
  /** Raised when a planned row's (stage, class) had no frozen requirement declaration. */
  readonly undeclaredRequirements: readonly string[];
}

export interface PlannedRow {
  readonly rowId: string;
  readonly stage: string;
  readonly requestContractClass: string;
  readonly effectiveGrammarIdentity: string;
}

const zeroClassCounts = (): Record<HarnessFailureClass, number> => ({
  DETERMINISTIC_CONTRACT_REJECTION: 0,
  TRANSIENT_PROVIDER_FAILURE: 0,
  INFERENCE_COMPLETED_OUTPUT_FAILURE: 0,
  SEMANTIC_PROVIDER_REFUSAL: 0,
  UNKNOWN_PROVIDER_FAILURE: 0,
});

export interface CreateRejectionCacheInput {
  readonly runScopeId: string;
  readonly providerScope: ProviderScope;
  readonly requirements: readonly FrozenCapabilityRequirement[];
  readonly plannedRows: readonly PlannedRow[];
}

/**
 * Build a cache, refusing to build one whose STOP-vs-SKIP question could arrive undecided.
 *
 * The totality check is the mechanism that makes the disposition "an explicit, frozen input rather
 * than an inference". It runs BEFORE the run, where a missing declaration costs nothing, instead of
 * in the middle of one, where the only options left are to guess or to abort a paid run.
 */
export function createRejectionCache(input: CreateRejectionCacheInput): RejectionCache {
  const problems: string[] = [];
  if (input.runScopeId.trim().length === 0) {
    problems.push('runScopeId is empty. A cache with no run scope could be carried into a run under '
      + 'a different frozen treatment, where an identity established under the old one would '
      + 'suppress a request the new one might transport successfully.');
  }
  problems.push(...providerScopeDefects(input.providerScope));
  for (const d of input.requirements) problems.push(...requirementDeclarationDefects(d));

  const seenRowIds = new Set<string>();
  for (const r of input.plannedRows) {
    if (seenRowIds.has(r.rowId)) problems.push(`planned row ${r.rowId} appears twice`);
    seenRowIds.add(r.rowId);
    if (r.effectiveGrammarIdentity.trim().length === 0) {
      problems.push(`planned row ${r.rowId} has no effectiveGrammarIdentity`);
    }
    if (requirementFor(input.requirements, r.stage, r.requestContractClass) === null) {
      problems.push(`${UNDECLARED_CAPABILITY_REQUIREMENT}: planned row ${r.rowId} is `
        + `${r.stage}/${r.requestContractClass}, for which no FrozenCapabilityRequirement was `
        + 'declared. STOP_RUN and SKIP_ATTEMPT are different outcomes and the choice between them '
        + 'is a frozen protocol input, so it cannot be left to be decided while the run is '
        + 'spending.');
    }
  }

  if (problems.length > 0) {
    throw new Error(`REJECTION_CACHE_REFUSED:\n  - ${problems.join('\n  - ')}`);
  }

  return {
    version: REJECTION_CACHE_VERSION,
    runScopeId: input.runScopeId,
    providerScope: input.providerScope,
    requirements: [...input.requirements],
    plannedRows: [...input.plannedRows],
    established: [],
    predecessor: initialBreakerState(),
    ledger: [],
    classCounts: zeroClassCounts(),
    halt: null,
    undeclaredRequirements: [],
  };
}

/** The exact §198 state, recoverable at any point. The reversibility the discipline requires. */
export const predecessorBreakerStateOf = (c: RejectionCache): BreakerState => c.predecessor;

// ===========================================================================================
// 5. THE DECISION
// ===========================================================================================

export type AttemptDisposition = 'PROCEED' | 'SKIP_ATTEMPT' | 'STOP_RUN';

export type DecisionClause =
  | 'A_CONSECUTIVE_PRE_INFERENCE'
  | 'B_KNOWN_DETERMINISTIC_REJECTION'
  | 'C_REQUIRED_CAPABILITY_HALT'
  | null;

export interface AttemptDecision {
  readonly allowed: boolean;
  readonly disposition: AttemptDisposition;
  readonly clause: DecisionClause;
  readonly stopReason: string | null;
  readonly detail: string | null;
  readonly establishedBy: EstablishedDeterministicRejection | null;
  /** Non-empty when the planned row's requirement was never declared. Never silent. */
  readonly defects: readonly string[];
}

/**
 * What to do about a row that has NOT yet been issued.
 *
 * Order is deliberate and each step is a different authority:
 *
 *   (a) §198's global two-consecutive rule, delegated. Unchanged and answered first.
 *   (c) a REQUIRED capability already established as deterministically rejected halts everything.
 *   (b) a known deterministic rejection for THIS provider + stage + grammar suppresses THIS row.
 *
 * (c) precedes (b) because a halt is a statement about the whole run and a skip is a statement
 * about one class; asking the narrower question first would let a row of another class proceed
 * after the run had already lost the capability it needed.
 */
export function planAttempt(cache: RejectionCache, planned: PlannedRow): AttemptDecision {
  const legacy = mayIssueNextAttempt(cache.predecessor);
  if (!legacy.allowed) {
    return {
      allowed: false, disposition: 'STOP_RUN', clause: 'A_CONSECUTIVE_PRE_INFERENCE',
      stopReason: legacy.stopReason, detail: legacy.detail, establishedBy: null, defects: [],
    };
  }

  if (cache.halt !== null) {
    return {
      allowed: false, disposition: 'STOP_RUN', clause: 'C_REQUIRED_CAPABILITY_HALT',
      stopReason: cache.halt.stopReason, detail: cache.halt.detail,
      establishedBy: cache.established.find(e => e.key === cache.halt?.establishedKey) ?? null,
      defects: [],
    };
  }

  const defects: string[] = [];
  if (requirementFor(cache.requirements, planned.stage, planned.requestContractClass) === null) {
    defects.push(`${UNDECLARED_CAPABILITY_REQUIREMENT}: ${planned.rowId} is `
      + `${planned.stage}/${planned.requestContractClass} with no frozen requirement. `
      + 'createRejectionCache refuses this before a run starts; reaching it here means the cache '
      + 'was built without the planned row, and the run report must surface it rather than absorb '
      + 'it.');
  }

  const prefix = suppressionPrefix(cache.providerScope, planned.stage,
    planned.effectiveGrammarIdentity);
  if (prefix !== null) {
    const hit = cache.established.find(e => e.suppressionPrefix === prefix);
    if (hit !== undefined) {
      return {
        allowed: false,
        disposition: 'SKIP_ATTEMPT',
        clause: 'B_KNOWN_DETERMINISTIC_REJECTION',
        stopReason: DETERMINISTIC_CONTRACT_REJECTION_ALREADY_ESTABLISHED,
        detail:
          `attempt ${hit.establishedByOrdinal} (${hit.establishedByRowId}) already established a `
          + `DETERMINISTIC_CONTRACT_REJECTION for ${prefix}`
          + `${hit.matchedPatternId ? ` (${hit.matchedPatternId})` : ''}. Issuing this row would `
          + 'spend it to rediscover a settled fact, which is exactly what §199 did with SG-02. The '
          + 'row is recorded SKIPPED_DUE_TO_KNOWN_DETERMINISTIC_REJECTION — never as an attempt and '
          + 'never as a provider failure — and every other grammar continues.',
        establishedBy: hit,
        defects,
      };
    }
  }

  return {
    allowed: true, disposition: 'PROCEED', clause: null, stopReason: null, detail: null,
    establishedBy: null, defects,
  };
}

// ===========================================================================================
// 6. RECORDING -- the three states, and nothing else
// ===========================================================================================

export interface Attempt202Input extends HarnessAttemptInput {
  readonly rowId: string;
  readonly effectiveGrammarIdentity: string;
}

export interface RecordIssuedResult {
  readonly cache: RejectionCache;
  readonly classification: FailureClassification;
  readonly preInferenceSignature: string | null;
  readonly establishedKey: string | null;
  readonly halted: boolean;
}

/**
 * Fold in a row that WAS issued.
 *
 * §198's `recordAttempt` is called first and unconditionally, so clause (a) behaves identically to
 * §198 for every input, including inputs this module memoises. The cache is written afterwards and
 * never feeds back into the predecessor state.
 *
 * A row is admitted to the memory only when ALL of: it carries a real pre-inference signature (so
 * it never reached inference), §201 classified it DETERMINISTIC_CONTRACT_REJECTION (the single
 * class carrying MEMOISE), and the key is complete. Any one missing and nothing is remembered.
 */
export function recordIssuedAttempt(
  cache: RejectionCache, a: Attempt202Input,
): RecordIssuedResult {
  const predecessor = recordAttempt(cache.predecessor, a);
  const classification = classifyProviderFailure(a);
  const sig = preInferenceSignature(a);
  const ordinal = cache.ledger.length + 1;

  const classCounts = { ...cache.classCounts };
  classCounts[classification.failureClass] += 1;

  const prefix = suppressionPrefix(cache.providerScope, a.stage, a.effectiveGrammarIdentity);
  const cls = (a.requestContractClass ?? '').trim();
  const declaration = cls.length > 0 ? requirementFor(cache.requirements, a.stage, cls) : null;

  let established = cache.established;
  let establishedKey: string | null = null;
  let halt = cache.halt;
  const undeclaredRequirements = [...cache.undeclaredRequirements];

  const memoisable = sig !== null
    && BREAKER_TREATMENT_BY_CLASS[classification.failureClass] === 'MEMOISE_AND_ADJACENCY'
    && prefix !== null;

  if (memoisable && sig !== null && prefix !== null) {
    const rejectionSignature = deterministicRejectionSignature(
      classification.matchedPatternId, a.providerErrorMessage);
    const key = establishedRejectionKey(cache.providerScope, a.stage, a.effectiveGrammarIdentity,
      rejectionSignature);
    if (key !== null) {
      establishedKey = key;
      if (declaration === null) {
        undeclaredRequirements.push(`${UNDECLARED_CAPABILITY_REQUIREMENT}: a deterministic `
          + `rejection was established for ${a.stage}/${cls || '(no class declared)'} but no frozen `
          + 'requirement governs it, so whether the run may continue was never decided in advance. '
          + 'The run continues and the row is skipped — the conservative disposition — and this '
          + 'defect must appear in the run report rather than being absorbed by it.');
      }
      if (!established.some(e => e.key === key)) {
        const requirement: CapabilityRequirement = declaration?.requirement
          ?? 'NOT_REQUIRED_REMAINING_ROWS_STILL_INFORMATIVE';
        established = [...established, {
          key,
          suppressionPrefix: prefix,
          rejectionSignature,
          matchedPatternId: classification.matchedPatternId,
          preInferenceSignature: sig,
          stage: a.stage,
          requestContractClass: cls.length > 0 ? cls : null,
          effectiveGrammarIdentity: a.effectiveGrammarIdentity,
          establishedByRowId: a.rowId,
          establishedByOrdinal: ordinal,
          requirement,
        }];
        if (requirement === 'REQUIRED_FOR_THE_EXPERIMENT_TO_CONTINUE' && halt === null) {
          halt = {
            stopReason: REQUIRED_CAPABILITY_DETERMINISTICALLY_REJECTED,
            detail:
              `${a.rowId} at attempt ${ordinal} established a DETERMINISTIC_CONTRACT_REJECTION for `
              + `${a.stage}/${cls}, which ${declaration?.frozenBy ?? '(undeclared)'} froze as `
              + 'REQUIRED_FOR_THE_EXPERIMENT_TO_CONTINUE. The run cannot produce its result without '
              + 'this capability, so continuing would spend rows on a question the run can no '
              + 'longer answer. Every remaining row is NOT_EXERCISED — not skipped, not failed.',
            establishedKey: key,
            haltedAtOrdinal: ordinal,
          };
        }
      }
    }
  }

  const entry: RowLedgerEntry = {
    ordinal,
    rowId: a.rowId,
    stage: a.stage,
    state: 'ATTEMPTED',
    reasonCode: classification.failureClass,
    reachedInference: a.reachedInference,
    failureClass: classification.failureClass,
    suppressionPrefix: prefix,
    establishedByOrdinal: null,
  };

  return {
    cache: {
      ...cache,
      predecessor,
      established,
      ledger: [...cache.ledger, entry],
      classCounts,
      halt,
      undeclaredRequirements,
    },
    classification,
    preInferenceSignature: sig,
    establishedKey,
    halted: halt !== null && cache.halt === null,
  };
}

/**
 * Fold in a row that was NOT issued because a matching deterministic rejection was already known.
 *
 * `recordAttempt` is NOT called. That is the whole accounting point: a row that was never issued is
 * not an attempt, so it must not touch the attempt state, the consecutive streak, or any failure
 * count. §198's breaker never learns it existed.
 */
export function recordSkippedRow(
  cache: RejectionCache, planned: PlannedRow, decision: AttemptDecision,
): RejectionCache {
  if (decision.disposition !== 'SKIP_ATTEMPT') {
    throw new Error('REJECTION_CACHE_MISUSE: recordSkippedRow called for disposition '
      + `${decision.disposition}. A row is recorded in the state its decision actually produced; `
      + 'relabelling one state as another is the accounting defect this ledger exists to prevent.');
  }
  const entry: RowLedgerEntry = {
    ordinal: cache.ledger.length + 1,
    rowId: planned.rowId,
    stage: planned.stage,
    state: 'SKIPPED_DUE_TO_KNOWN_DETERMINISTIC_REJECTION',
    reasonCode: decision.stopReason ?? DETERMINISTIC_CONTRACT_REJECTION_ALREADY_ESTABLISHED,
    reachedInference: null,
    failureClass: null,
    suppressionPrefix: decision.establishedBy?.suppressionPrefix ?? null,
    establishedByOrdinal: decision.establishedBy?.establishedByOrdinal ?? null,
  };
  return { ...cache, ledger: [...cache.ledger, entry] };
}

/**
 * Fold in a row the run never reached — because it halted, because a ceiling was hit, or because
 * the row was never scheduled.
 *
 * NOT_EXERCISED is §198's word and it is used here for §198's reason: an axis, or a row, that was
 * never put to the test is neither a pass nor a failure, and a report that lets it share a
 * denominator with the rows that WERE tested is misleading while being literally true.
 */
export function recordNotExercisedRow(
  cache: RejectionCache, planned: PlannedRow, reasonCode: string,
): RejectionCache {
  const entry: RowLedgerEntry = {
    ordinal: cache.ledger.length + 1,
    rowId: planned.rowId,
    stage: planned.stage,
    state: 'NOT_EXERCISED',
    reasonCode: reasonCode.trim().length > 0 ? reasonCode : NOT_EXERCISED,
    reachedInference: null,
    failureClass: null,
    suppressionPrefix: null,
    establishedByOrdinal: null,
  };
  return { ...cache, ledger: [...cache.ledger, entry] };
}

// ===========================================================================================
// 7. THREE-STATE ACCOUNTING -- proved, not asserted
// ===========================================================================================

export interface AttemptAccounting {
  readonly plannedRows: number;
  readonly attempted: number;
  readonly skippedDueToKnownDeterministicRejection: number;
  readonly notExercised: number;
  /**
   * The denominator for every per-attempt rate. EQUAL TO `attempted` BY CONSTRUCTION: a row that
   * was never issued was never an opportunity for the provider to fail.
   */
  readonly attemptDenominator: number;
  /** Issued attempts that did not reach inference. The ONLY legitimate failure numerator. */
  readonly providerFailureNumerator: number;
  readonly inferenceCompleted: number;
  readonly deterministicRejections: number;
  readonly rowIdsByState: Readonly<Record<RowState, readonly string[]>>;
  readonly classCounts: Readonly<Record<HarnessFailureClass, number>>;
}

export function accountingOf(cache: RejectionCache): AttemptAccounting {
  const byState: Record<RowState, string[]> = {
    ATTEMPTED: [], SKIPPED_DUE_TO_KNOWN_DETERMINISTIC_REJECTION: [], NOT_EXERCISED: [],
  };
  let providerFailureNumerator = 0;
  let inferenceCompleted = 0;
  for (const e of cache.ledger) {
    byState[e.state].push(e.rowId);
    if (e.state !== 'ATTEMPTED') continue;
    if (e.reachedInference === true) inferenceCompleted += 1;
    else providerFailureNumerator += 1;
  }
  const attempted = byState.ATTEMPTED.length;
  return {
    plannedRows: cache.plannedRows.length,
    attempted,
    skippedDueToKnownDeterministicRejection:
      byState.SKIPPED_DUE_TO_KNOWN_DETERMINISTIC_REJECTION.length,
    notExercised: byState.NOT_EXERCISED.length,
    attemptDenominator: attempted,
    providerFailureNumerator,
    inferenceCompleted,
    deterministicRejections: cache.classCounts.DETERMINISTIC_CONTRACT_REJECTION,
    rowIdsByState: byState,
    classCounts: cache.classCounts,
  };
}

/**
 * Check the arithmetic and the integrity rules, rather than trusting the code that produced them.
 *
 * Returns findings instead of throwing, for §198's reason: an instrument that catches itself should
 * record its own defect in the evidence rather than die and leave nothing behind.
 */
export function accountingViolations(cache: RejectionCache): string[] {
  const out: string[] = [];
  const acc = accountingOf(cache);

  const total = acc.attempted + acc.skippedDueToKnownDeterministicRejection + acc.notExercised;
  if (total !== acc.plannedRows) {
    out.push(`the three states sum to ${total} but ${acc.plannedRows} rows were planned. Every `
      + 'planned row is in exactly one state, or the ledger is not an account of the run.');
  }
  if (acc.attemptDenominator !== acc.attempted) {
    out.push(`attemptDenominator ${acc.attemptDenominator} != attempted ${acc.attempted}`);
  }
  if (acc.providerFailureNumerator > acc.attempted) {
    out.push(`providerFailureNumerator ${acc.providerFailureNumerator} exceeds attempted `
      + `${acc.attempted}`);
  }

  const seen = new Set<string>();
  for (const e of cache.ledger) {
    if (seen.has(e.rowId)) out.push(`row ${e.rowId} appears in the ledger more than once`);
    seen.add(e.rowId);

    if (e.state !== 'ATTEMPTED') {
      if (e.reachedInference !== null) {
        out.push(`${e.rowId} is ${e.state} but carries reachedInference=${e.reachedInference}. A `
          + 'row that was never issued has no provider outcome; recording one would make it '
          + 'countable as an attempt.');
      }
      if (e.failureClass !== null) {
        out.push(`${e.rowId} is ${e.state} but carries failureClass=${e.failureClass}. NEVER COUNT `
          + 'A SKIPPED ROW AS A PROVIDER FAILURE ATTEMPT.');
      }
    }
    if (e.state === 'SKIPPED_DUE_TO_KNOWN_DETERMINISTIC_REJECTION') {
      if (e.establishedByOrdinal === null) {
        out.push(`${e.rowId} was skipped but names no attempt that established the fact. A `
          + 'suppression with no cited establishing attempt is unauditable.');
      } else {
        const source = cache.ledger.find(x => x.ordinal === e.establishedByOrdinal);
        if (source === undefined || source.state !== 'ATTEMPTED') {
          out.push(`${e.rowId} cites ordinal ${e.establishedByOrdinal} as establishing its `
            + 'suppression, but that ordinal is not an ATTEMPTED row.');
        }
      }
    }
  }

  for (const p of cache.plannedRows) {
    if (!seen.has(p.rowId)) {
      out.push(`planned row ${p.rowId} has no ledger entry. An unrecorded row is silently missing `
        + 'from every denominator, which is the failure mode this ledger exists to prevent.');
    }
  }

  return out;
}

/**
 * The guard a scorer applies to its OWN failure set before publishing it.
 *
 * The integrity requirement in one function: a skipped row may not appear in a failure numerator.
 * Offered as an explicit call for the same reason §198 kept `mayIssueNextAttempt` separate from
 * `recordAttempt` — a scorer that skips the check should be a visibly missing line.
 */
export function skippedRowsWronglyCountedAsFailures(
  cache: RejectionCache, failureRowIds: readonly string[],
): string[] {
  const stateOf = new Map(cache.ledger.map(e => [e.rowId, e.state] as const));
  const out: string[] = [];
  for (const id of failureRowIds) {
    const state = stateOf.get(id);
    if (state === 'SKIPPED_DUE_TO_KNOWN_DETERMINISTIC_REJECTION') {
      out.push(`${id} is SKIPPED_DUE_TO_KNOWN_DETERMINISTIC_REJECTION and appears in a failure `
        + 'numerator. It was never issued: it is not evidence of anything about the provider.');
    }
    if (state === 'NOT_EXERCISED') {
      out.push(`${id} is ${NOT_EXERCISED} and appears in a failure numerator. It was never put to `
        + 'the test; it is neither a pass nor a failure.');
    }
    if (state === undefined) {
      out.push(`${id} appears in a failure numerator but has no ledger entry at all.`);
    }
  }
  return out;
}

/** A report block that cannot state one of the three counts without stating the other two. */
export function renderThreeStateAccounting(cache: RejectionCache): string {
  const a = accountingOf(cache);
  const list = (s: RowState): string =>
    a.rowIdsByState[s].length === 0 ? '(none)' : a.rowIdsByState[s].join(', ');
  return [
    `PLANNED ROWS: ${a.plannedRows}`,
    `  ATTEMPTED                                      ${a.attempted}  — ${list('ATTEMPTED')}`,
    '  SKIPPED_DUE_TO_KNOWN_DETERMINISTIC_REJECTION   '
      + `${a.skippedDueToKnownDeterministicRejection}  — `
      + `${list('SKIPPED_DUE_TO_KNOWN_DETERMINISTIC_REJECTION')}`,
    `  ${NOT_EXERCISED}                                 ${a.notExercised}  — `
      + `${list('NOT_EXERCISED')}`,
    `ATTEMPT DENOMINATOR: ${a.attemptDenominator} (= ATTEMPTED; a row never issued was never an `
      + 'opportunity to fail)',
    `PROVIDER FAILURE NUMERATOR: ${a.providerFailureNumerator} (issued attempts that did not reach `
      + 'inference)',
    'A SKIPPED ROW IS IN NEITHER. It is not a provider failure attempt.',
  ].join('\n');
}

// ===========================================================================================
// 8. THE RULES, AS DATA, SO THEY CANNOT DRIFT INTO PROSE
// ===========================================================================================

export const REJECTION_CACHE_RULES = {
  KEY_PARTS:
    'provider family + model scope + execution stage + EFFECTIVE_GRAMMAR_IDENTITY + normalized '
    + 'deterministic rejection signature. The first four are the SUPPRESSION PREFIX and are the '
    + 'only parts knowable before a request is issued; the fifth completes the identity of the '
    + 'established FACT and is recorded, never used as the suppression test.',
  WHY_NOT_requestContractId:
    '§199 keyed requestContractId on sha(stableStringify(wire schema)) and the vNext schema is '
    + 'built PER ROW, so SG-01 and SG-02 carried d0713f36696e8bea and 243bb6766c05599f for one '
    + 'identical grammar-size fault. §200 recorded the two signatures as identical; they were not. '
    + 'A memory keyed on that field would have missed SG-02 exactly as adjacency did.',
  CLAUSE_A_UNCHANGED_FROM_198:
    `${CONSECUTIVE_IDENTICAL_REJECTIONS_TO_STOP} CONSECUTIVE attempts sharing one normalised `
    + `pre-inference signature stop the run with ${SYSTEMATIC_PRE_INFERENCE_REJECTION}. Adjacency `
    + 'is the right guard against STOCHASTIC model failure and is preserved by calling §198.',
  CLASSIFICATION_IS_CONSERVATIVE:
    'UNKNOWN implies TRANSIENT. Misclassifying a blip as deterministic truncates a run and destroys '
    + 'behavioural evidence, which is unrecoverable; the opposite error wastes one row at $0.00. '
    + 'The two errors are not symmetric.',
  STOP_VS_SKIP:
    'SKIP_ATTEMPT is the disposition unless a FrozenCapabilityRequirement declares the capability '
    + 'REQUIRED_FOR_THE_EXPERIMENT_TO_CONTINUE, in which case the FIRST established rejection halts '
    + 'the run and every remaining row is NOT_EXERCISED. The choice is read from a frozen table and '
    + 'is never inferred from the class name, the row count or the position in the order. '
    + 'createRejectionCache refuses a cache whose table does not totally cover the planned rows.',
  THREE_STATES:
    'ATTEMPTED / SKIPPED_DUE_TO_KNOWN_DETERMINISTIC_REJECTION / NOT_EXERCISED. They sum to the '
    + 'planned rows, the attempt denominator is ATTEMPTED alone, and a SKIPPED row appears in no '
    + 'failure numerator and no attempt denominator. accountingViolations proves it.',
  RUN_SCOPED:
    'a cache is valid only inside one frozen-treatment run. The grammar identity cannot see a '
    + 'description-shortening treatment change (identity limit L2), and run scoping is what makes '
    + 'that limitation harmless rather than dangerous.',
  NOT_EXERCISED_AGAINST_A_PROVIDER:
    'ZERO provider calls were made by §202. Every result about this module is replay against the '
    + 'recorded §199 log. Its effect on a live run is INFERRED FROM REPLAY, not measured.',
  IDENTITY_IS_A_PROXY: EFFECTIVE_GRAMMAR_IDENTITY_IS_A_PROXY,
} as const;

/** The npm script entries the orchestrator is asked to register. Reported, never applied here. */
export const REQUESTED_PACKAGE_JSON_SCRIPTS_202: Readonly<Record<string, string>> = {
  'test:202:grammar-cache': 'tsx scripts/test-202-grammar-identity-and-cache.ts',
};
