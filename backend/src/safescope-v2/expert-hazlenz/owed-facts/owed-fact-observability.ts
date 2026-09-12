/**
 * EXPERT HAZLENZ -- OWED-FACT OBSERVABILITY. §170. INTEGRATED AND INACTIVE.
 *
 * Append-only development observability for the owed-fact stage.
 *
 * A retry that replaces a value must not erase the evidence that the original event occurred, and
 * that evidence has to be PERSISTED rather than reconstructed afterwards. So attempts are appended
 * and never indexed into, counters are recomputed from the ledger they summarise rather than
 * incremented alongside it, and `observabilityViolations()` proves append-only against a prior
 * snapshot rather than asserting it.
 *
 * `acceptableEvidence` is recorded with the initial owed facts. §169 turned on a distinction the
 * settlement criterion is central to, and a record that omitted it could not reconstruct why a
 * question was or was not sufficient.
 */

import type { OwedFact, OwedFactTransition, ArbitrationRequest } from './owed-fact.types';
import type { StructuralQuestion, CompoundProviderOutputDiagnostic } from './structural-questions';

export const OWED_FACT_OBSERVABILITY_VERSION = 'hazlenz.expert.owed-fact-observability.v1' as const;

/** The reconstruction obligations. A reader must be able to rebuild each from the record alone. */
export const RECONSTRUCTABLE_FACTS = [
  'initialOwedFacts',
  'acceptableEvidence',
  'owedFactProvenance',
  'providerAttempts',
  'rawResponses',
  'bindingFactKeys',
  'perFactDeclarations',
  'nominations',
  'coverageTransitions',
  'uncoveredFactKeys',
  'TARGET_COVERAGE_WARNING',
  'structuralQuestions',
  'questionSuppression',
  'compoundProviderOutputDiagnostics',
  'arbitrationRequests',
  'degenerateRetryCount',
  'reliabilityDrawCount',
  'finalDevelopmentAugmentation',
] as const;
export type ReconstructableFact = (typeof RECONSTRUCTABLE_FACTS)[number];

export const ATTEMPT_CHANNELS = [
  'FIRST_PASS', 'DEGENERATE_REISSUE', 'RELIABILITY_DRAW', 'COVERAGE_RECHECK',
] as const;
export type AttemptChannel = (typeof ATTEMPT_CHANNELS)[number];

export interface ProviderAttemptObservation {
  readonly attemptSeq: number;
  readonly channel: AttemptChannel;
  readonly drawIndex: number | null;
  readonly transportOk: boolean;
  readonly responseState: string;
  readonly degenerate: boolean;
  readonly contractAdmitted: boolean;
  readonly admissionCodes: readonly string[];
  readonly verdict: string | null;
  readonly bindingFactKey: string | null;
  /** The raw response, preserved whole. Never summarised away. */
  readonly rawPreserved: true;
  readonly rawResponse: unknown;
}

export interface OwedFactObservabilityRecord {
  readonly version: string;
  readonly analysisId: string;
  readonly population: string;
  readonly initialOwedFacts: readonly OwedFact[];
  readonly providerAttempts: readonly ProviderAttemptObservation[];
  readonly perFactDeclarations: readonly { factKey: string; declaration: string }[];
  readonly nominations: readonly string[];
  readonly coverageTransitions: readonly OwedFactTransition[];
  readonly uncoveredFactKeys: readonly string[];
  readonly TARGET_COVERAGE_WARNING: boolean;
  readonly structuralQuestions: readonly StructuralQuestion[];
  readonly questionSuppression: readonly StructuralQuestion[];
  readonly compoundProviderOutputDiagnostics: readonly CompoundProviderOutputDiagnostic[];
  readonly arbitrationRequests: readonly ArbitrationRequest[];
  readonly degenerateRetryCount: number;
  readonly reliabilityDrawCount: number;
  readonly finalDevelopmentAugmentationAttached: boolean;
  readonly failClosedReason: string | null;
}

export function emptyObservabilityRecord(
  analysisId: string, population: string, initialOwedFacts: readonly OwedFact[],
): OwedFactObservabilityRecord {
  return {
    version: OWED_FACT_OBSERVABILITY_VERSION,
    analysisId,
    population,
    initialOwedFacts: [...initialOwedFacts],
    providerAttempts: [],
    perFactDeclarations: [],
    nominations: [],
    coverageTransitions: [],
    uncoveredFactKeys: [],
    TARGET_COVERAGE_WARNING: false,
    structuralQuestions: [],
    questionSuppression: [],
    compoundProviderOutputDiagnostics: [],
    arbitrationRequests: [],
    degenerateRetryCount: 0,
    reliabilityDrawCount: 0,
    finalDevelopmentAugmentationAttached: false,
    failClosedReason: null,
  };
}

/**
 * Append one attempt. Prior attempts are spread, never indexed into, and the counters are
 * recomputed from the resulting list -- so a counter can never disagree with the ledger it
 * summarises.
 */
export function appendAttempt(
  record: OwedFactObservabilityRecord, attempt: ProviderAttemptObservation,
): OwedFactObservabilityRecord {
  const providerAttempts = [...record.providerAttempts, attempt];
  return {
    ...record,
    providerAttempts,
    degenerateRetryCount:
      providerAttempts.filter(a => a.channel === 'DEGENERATE_REISSUE').length,
    reliabilityDrawCount:
      providerAttempts.filter(a => a.channel === 'RELIABILITY_DRAW').length,
  };
}

/** Append-only proof against a prior snapshot. Reports every difference, not the first. */
export function observabilityViolations(
  before: OwedFactObservabilityRecord, after: OwedFactObservabilityRecord,
): string[] {
  const v: string[] = [];
  if (after.providerAttempts.length < before.providerAttempts.length) {
    v.push('ATTEMPT_HISTORY_TRUNCATED');
  }
  for (let i = 0; i < before.providerAttempts.length; i += 1) {
    if (JSON.stringify(before.providerAttempts[i])
        !== JSON.stringify(after.providerAttempts[i])) {
      v.push(`ATTEMPT_OVERWRITTEN:seq ${before.providerAttempts[i].attemptSeq}`);
    }
  }
  if (JSON.stringify(after.initialOwedFacts) !== JSON.stringify(before.initialOwedFacts)) {
    v.push('INITIAL_OWED_FACTS_MUTATED -- the set the verifier was given is evidence');
  }
  if (after.coverageTransitions.length < before.coverageTransitions.length) {
    v.push('TRANSITION_HISTORY_TRUNCATED');
  }
  if (after.providerAttempts.some(a => !a.rawPreserved)) v.push('RAW_NOT_PRESERVED');
  const seqs = after.providerAttempts.map(a => a.attemptSeq);
  if (new Set(seqs).size !== seqs.length) v.push('ATTEMPT_SEQ_REUSED');
  return v;
}

/** Which reconstruction obligations a record does not satisfy. An empty list is not a gap. */
export function reconstructionGaps(record: OwedFactObservabilityRecord): string[] {
  const gaps: string[] = [];
  const field: Readonly<Record<ReconstructableFact, keyof OwedFactObservabilityRecord>> = {
    initialOwedFacts: 'initialOwedFacts',
    acceptableEvidence: 'initialOwedFacts',
    owedFactProvenance: 'initialOwedFacts',
    providerAttempts: 'providerAttempts',
    rawResponses: 'providerAttempts',
    bindingFactKeys: 'providerAttempts',
    perFactDeclarations: 'perFactDeclarations',
    nominations: 'nominations',
    coverageTransitions: 'coverageTransitions',
    uncoveredFactKeys: 'uncoveredFactKeys',
    TARGET_COVERAGE_WARNING: 'TARGET_COVERAGE_WARNING',
    structuralQuestions: 'structuralQuestions',
    questionSuppression: 'questionSuppression',
    compoundProviderOutputDiagnostics: 'compoundProviderOutputDiagnostics',
    arbitrationRequests: 'arbitrationRequests',
    degenerateRetryCount: 'degenerateRetryCount',
    reliabilityDrawCount: 'reliabilityDrawCount',
    finalDevelopmentAugmentation: 'finalDevelopmentAugmentationAttached',
  };
  for (const k of RECONSTRUCTABLE_FACTS) {
    const f = field[k];
    if (!Object.prototype.hasOwnProperty.call(record, f)
        || (record as unknown as Record<string, unknown>)[f] === undefined) {
      gaps.push(`FIELD_ABSENT:${k}`);
    }
  }
  // The settlement criterion must be reconstructable per fact, including when it is legitimately
  // null -- an absent KEY and a null VALUE are different findings.
  for (const f of record.initialOwedFacts) {
    if (!Object.prototype.hasOwnProperty.call(f, 'acceptableEvidence')) {
      gaps.push(`ACCEPTABLE_EVIDENCE_KEY_ABSENT:${f.factKey}`);
    }
    if (!f.source) gaps.push(`OWED_FACT_PROVENANCE_ABSENT:${f.factKey}`);
  }
  if (record.TARGET_COVERAGE_WARNING !== (record.uncoveredFactKeys.length > 0)) {
    gaps.push('COUNTER_DISAGREES:TARGET_COVERAGE_WARNING does not match uncoveredFactKeys');
  }
  if (record.reliabilityDrawCount
      !== record.providerAttempts.filter(a => a.channel === 'RELIABILITY_DRAW').length) {
    gaps.push('COUNTER_DISAGREES:reliabilityDrawCount');
  }
  if (record.degenerateRetryCount
      !== record.providerAttempts.filter(a => a.channel === 'DEGENERATE_REISSUE').length) {
    gaps.push('COUNTER_DISAGREES:degenerateRetryCount');
  }
  return gaps;
}
