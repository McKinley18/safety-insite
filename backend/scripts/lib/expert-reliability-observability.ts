/**
 * §165 EXPERT HAZLENZ -- RELIABILITY OBSERVABILITY RECORD. DEVELOPMENT PROTOTYPE ONLY.
 * NOT REACHABLE FROM PRODUCTION. NOT ENABLED. ZERO PROVIDER CALLS.
 *
 * ==================== WHY THIS IS APPEND-ONLY, IN ONE SENTENCE ====================
 *
 * §158's lesson on this repository is that when a retry replaces a value, the evidence that the
 * original event occurred must survive the replacement and must be PERSISTED rather than
 * reconstructed afterwards. A second draw that overwrote the first would destroy exactly the
 * observation this whole layer exists to make.
 *
 * So `appendAttempt` spreads and never indexes, `ObservabilityRecord.attempts` is `readonly`, and
 * `observabilityViolations` proves against a prior snapshot that no earlier attempt changed. A
 * caller that rewrites an attempt produces a violation rather than a tidier record.
 *
 * ==================== THE COMPLETENESS TEST IS ABOUT RECONSTRUCTION ====================
 *
 * `RECONSTRUCTABLE_FACTS` lists the seventeen things §165 Phase 10 requires a reader to be able to
 * rebuild from the record alone. `reconstructionGaps()` checks each one against an actual record.
 * The check is deliberately about SCORER INPUTS rather than about the record being large -- the
 * 2026-09-01 formal run wrote three large artifacts and still could not be rescored, and that is the
 * failure `expert-run-record-store.ts` was written for.
 */

import type { OwedFact, OwedFactTransition } from './expert-owed-facts';
import type { SemanticOutcomeRecord } from './expert-semantic-outcome-v2';
import type { ProviderCallChannel } from './expert-bounded-reliability-state-machine';

export const RELIABILITY_OBSERVABILITY_VERSION =
  'hazlenz.expert.reliability-observability.v1' as const;

/** The seventeen reconstruction obligations, in the order §165 Phase 10 states them. */
export const RECONSTRUCTABLE_FACTS = [
  'initialOwedFacts',
  'owedFactProvenance',
  'verifierAttempts',
  'declarationBindings',
  'nominations',
  'statusTransitions',
  'uncoveredFactKeys',
  'TARGET_COVERAGE_WARNING',
  'SECOND_DRAW_ELIGIBLE',
  'arbitrationResults',
  'finalQuestionSelection',
  'questionsSuppressedByBudget',
  'unresolvedLifeCriticalFacts',
  'failClosedReason',
  'providerCallCount',
  'degenerateRetryCount',
  'reliabilityDrawCount',
] as const;
export type ReconstructableFact = (typeof RECONSTRUCTABLE_FACTS)[number];

/**
 * Which record field satisfies each obligation.
 *
 * Two obligations are not one-to-one with a field name, and the mapping is stated rather than
 * assumed: `verifierAttempts` is satisfied by `attempts`, and `owedFactProvenance` is satisfied by
 * the `source` carried on every entry of `initialOwedFacts` -- provenance is a property OF a fact,
 * not a parallel list that could drift out of step with one.
 */
export const RECONSTRUCTION_FIELD_MAP:
Readonly<Record<ReconstructableFact, keyof ObservabilityRecord>> = {
  initialOwedFacts: 'initialOwedFacts',
  owedFactProvenance: 'initialOwedFacts',
  verifierAttempts: 'attempts',
  declarationBindings: 'declarationBindings',
  nominations: 'nominations',
  statusTransitions: 'statusTransitions',
  uncoveredFactKeys: 'uncoveredFactKeys',
  TARGET_COVERAGE_WARNING: 'TARGET_COVERAGE_WARNING',
  SECOND_DRAW_ELIGIBLE: 'SECOND_DRAW_ELIGIBLE',
  arbitrationResults: 'arbitrationResults',
  finalQuestionSelection: 'finalQuestionSelection',
  questionsSuppressedByBudget: 'questionsSuppressedByBudget',
  unresolvedLifeCriticalFacts: 'unresolvedLifeCriticalFacts',
  failClosedReason: 'failClosedReason',
  providerCallCount: 'providerCallCount',
  degenerateRetryCount: 'degenerateRetryCount',
  reliabilityDrawCount: 'reliabilityDrawCount',
};

export interface VerifierAttemptObservation {
  /** 1-based within its channel. Never reused, never overwritten. */
  readonly attemptSeq: number;
  readonly channel: ProviderCallChannel;
  /** 1 or 2 for a reliability draw; null for any other channel. */
  readonly drawIndex: number | null;
  readonly transportOk: boolean;
  readonly responseState: string;
  readonly degenerate: boolean;
  readonly contractAdmitted: boolean;
  readonly admissionCodes: readonly string[];
  readonly verdict: string | null;
  readonly clarificationEmitted: boolean;
  readonly rawPreserved: true;
  readonly costUsd: number | null;
  readonly latencyMs: number | null;
}

export interface ArbitrationObservation {
  readonly factKey: string;
  readonly decision: 'REJECTED' | 'UPHELD';
  readonly recordedReason: string;
  readonly decidedBy: string;
}

export interface ObservabilityRecord {
  readonly version: string;
  readonly analysisId: string;
  readonly population: string;
  readonly initialOwedFacts: readonly OwedFact[];
  readonly attempts: readonly VerifierAttemptObservation[];
  readonly declarationBindings: Readonly<Record<string, string>>;
  readonly nominations: readonly string[];
  readonly statusTransitions: readonly OwedFactTransition[];
  readonly uncoveredFactKeys: readonly string[];
  readonly TARGET_COVERAGE_WARNING: boolean;
  readonly SECOND_DRAW_ELIGIBLE: boolean;
  readonly arbitrationResults: readonly ArbitrationObservation[];
  readonly finalQuestionSelection: readonly string[];
  readonly questionsSuppressedByBudget: readonly string[];
  readonly unresolvedLifeCriticalFacts: readonly string[];
  readonly failClosedReason: string | null;
  readonly providerCallCount: number;
  readonly degenerateRetryCount: number;
  readonly reliabilityDrawCount: number;
  readonly semanticOutcome: SemanticOutcomeRecord;
}

export function emptyObservabilityRecord(
  analysisId: string, population: string, initialOwedFacts: readonly OwedFact[],
  semanticOutcome: SemanticOutcomeRecord,
): ObservabilityRecord {
  return {
    version: RELIABILITY_OBSERVABILITY_VERSION,
    analysisId,
    population,
    initialOwedFacts: [...initialOwedFacts],
    attempts: [],
    declarationBindings: {},
    nominations: [],
    statusTransitions: [],
    uncoveredFactKeys: [],
    TARGET_COVERAGE_WARNING: false,
    SECOND_DRAW_ELIGIBLE: false,
    arbitrationResults: [],
    finalQuestionSelection: [],
    questionsSuppressedByBudget: [],
    unresolvedLifeCriticalFacts: [],
    failClosedReason: null,
    providerCallCount: 0,
    degenerateRetryCount: 0,
    reliabilityDrawCount: 0,
    semanticOutcome,
  };
}

/**
 * Append one attempt. The prior attempts are spread, never indexed into, and the counters are
 * recomputed from the resulting list rather than incremented independently -- so a counter can never
 * disagree with the ledger it is supposed to summarise.
 */
export function appendAttempt(
  record: ObservabilityRecord, attempt: VerifierAttemptObservation,
): ObservabilityRecord {
  const attempts = [...record.attempts, attempt];
  return {
    ...record,
    attempts,
    providerCallCount: attempts.length,
    degenerateRetryCount: attempts.filter(a => a.channel === 'DEGENERATE_REISSUE').length,
    reliabilityDrawCount: attempts.filter(a => a.channel === 'RELIABILITY_DRAW').length,
  };
}

/**
 * Append-only proof against a prior snapshot. Reports every difference rather than the first, so a
 * caller sees whether one attempt was edited or the whole history was rebuilt.
 */
export function observabilityViolations(
  before: ObservabilityRecord, after: ObservabilityRecord,
): string[] {
  const v: string[] = [];
  if (after.attempts.length < before.attempts.length) {
    v.push('ATTEMPT_HISTORY_TRUNCATED');
  }
  for (let i = 0; i < before.attempts.length; i += 1) {
    if (JSON.stringify(before.attempts[i]) !== JSON.stringify(after.attempts[i])) {
      v.push(`ATTEMPT_OVERWRITTEN:seq ${before.attempts[i].attemptSeq}`);
    }
  }
  if (after.statusTransitions.length < before.statusTransitions.length) {
    v.push('TRANSITION_HISTORY_TRUNCATED');
  }
  for (let i = 0; i < before.statusTransitions.length; i += 1) {
    if (JSON.stringify(before.statusTransitions[i])
        !== JSON.stringify(after.statusTransitions[i])) {
      v.push(`TRANSITION_OVERWRITTEN:seq ${before.statusTransitions[i].seq}`);
    }
  }
  if (after.initialOwedFacts.length !== before.initialOwedFacts.length
      || JSON.stringify(after.initialOwedFacts) !== JSON.stringify(before.initialOwedFacts)) {
    v.push('INITIAL_OWED_FACTS_MUTATED — the set the verifier was given is evidence');
  }
  if (after.attempts.some(a => !a.rawPreserved)) v.push('RAW_NOT_PRESERVED');
  const seqs = after.attempts.map(a => a.attemptSeq);
  if (new Set(seqs).size !== seqs.length) v.push('ATTEMPT_SEQ_REUSED');
  if (after.providerCallCount !== after.attempts.length) {
    v.push(`PROVIDER_CALL_COUNT_DISAGREES_WITH_LEDGER:${after.providerCallCount} vs `
      + `${after.attempts.length}`);
  }
  return v;
}

/**
 * Which of the seventeen reconstruction obligations this record does not satisfy.
 *
 * A field that is legitimately empty is NOT a gap -- an analysis with no arbitration has no
 * arbitration results. What is a gap is a field that is absent, or a field whose value contradicts
 * another part of the record. Both are checked.
 */
export function reconstructionGaps(record: ObservabilityRecord): string[] {
  const gaps: string[] = [];
  const present = (k: ReconstructableFact): boolean => {
    const field = RECONSTRUCTION_FIELD_MAP[k];
    return Object.prototype.hasOwnProperty.call(record, field)
      && (record as unknown as Record<string, unknown>)[field] !== undefined;
  };
  for (const k of RECONSTRUCTABLE_FACTS) {
    if (!present(k)) gaps.push(`FIELD_ABSENT:${k}`);
  }
  if (record.initialOwedFacts.some(f => !f.source)) {
    gaps.push('FIELD_ABSENT:owedFactProvenance — an initial owed fact carries no source');
  }
  if (record.reliabilityDrawCount
      !== record.attempts.filter(a => a.channel === 'RELIABILITY_DRAW').length) {
    gaps.push('COUNTER_DISAGREES:reliabilityDrawCount');
  }
  if (record.degenerateRetryCount
      !== record.attempts.filter(a => a.channel === 'DEGENERATE_REISSUE').length) {
    gaps.push('COUNTER_DISAGREES:degenerateRetryCount');
  }
  if (record.TARGET_COVERAGE_WARNING !== (record.uncoveredFactKeys.length > 0)) {
    gaps.push('COUNTER_DISAGREES:TARGET_COVERAGE_WARNING does not match uncoveredFactKeys');
  }
  if (record.unresolvedLifeCriticalFacts.length > 0 && record.failClosedReason === null) {
    gaps.push('FAIL_CLOSED_REASON_MISSING — a life-critical gap was left unresolved and no reason '
      + 'was recorded');
  }
  return gaps;
}

/** One JSON line, for a durable append-only sink. No pretty-printing: a line is the unit. */
export const serialiseObservabilityRecord = (r: ObservabilityRecord): string => JSON.stringify(r);
