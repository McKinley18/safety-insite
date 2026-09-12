/**
 * EXPERT HAZLENZ -- literal scorers for M01..M17. §121.
 *
 * One function per measure, each computing exactly what `expert-measurement-contract.ts` says and
 * nothing else. The five stages the authorization asked to be kept apart are kept apart here:
 *
 *   1 RAW OBSERVATIONS      `CohortRunRecord` -- what happened, recorded by the harness.
 *   2 TRUTH / ELIGIBILITY   `deriveRowLedger()` -- who was eligible for what, from the answer key.
 *   3 MEASURE COMPUTATION   `score*()` -- one per measure, returning a `MeasureResult`.
 *   4 HARD-GATE ADJUDICATION `adjudicateFamilies()` -- delegates to the plan's own function.
 *   5 AGGREGATE REPORTING   `buildScoringReport()` -- assembles, never averages.
 *
 * ==================== NOTHING IS SILENTLY DISCARDED ====================
 *
 * Every `MeasureResult` carries a state -- `MEASURED`, `NO_OPPORTUNITY` or `UNMEASURED` -- and only
 * `MEASURED` produces a number. `adjudicateFamilies()` passes ONLY measured values to
 * `evaluateGateFamilies()`, so an unmeasured hard gate arrives as an absent value and the plan's own
 * rule fails it. There is no code path in which a gate becomes N/A.
 *
 * Malformed output, missing collections, provider failures, unbindable evidence, unsupported
 * deterministic contradictions and eligible opportunities with no response are each counted
 * explicitly in `supplementary`, so a number can never be produced by quietly dropping a row.
 *
 * ==================== WHICH CALL EACH MEASURE READS ====================
 *
 * A row is called more than once: a BASE call, a PERMUTED call for M14, and a CROSS_PROCESS call for
 * M17. Every CONTENT measure scores the BASE arm only, and `CONTENT_SCORING_ARM` says so in one
 * place. Scoring content on three arms would triple the adjudication burden and would let a model
 * be judged three times for one row, which is not what any of the plan's methods describe.
 * Reliability measures that are ABOUT the calls -- M13, M15, M16 -- read every attempted call, and
 * the two pairwise measures read their own pairs.
 */

import {
  CITATION_SHAPED_PATTERN,
  type ExpertAnalysis, type ExpertConditionState,
} from './expert-contract.types';
import type { ExpertNormalizationIssue } from './expert-normalization';
import type { ExpertAttemptRecord } from './expert-runner';
import type { MergeInvariantViolation } from './expert-authority-merge';
import type { MergedIntelligence } from './expert-authority-merge';
import { evaluateGateFamilies, type FamilyVerdict } from './expert-evaluation-plan';
import {
  EXPERT_MEASUREMENT_CONTRACT, REGULATORY_OBLIGATION_MARKERS, REGULATORY_STATEMENT_MARKERS,
  frozenFieldsFor, rubricFor, specFor,
} from './expert-measurement-contract';
import type { FormalCohortRow } from './expert-cohort-contract';

export const EXPERT_SCORER_VERSION = 'hazlenz.expert.scorers.v1' as const;

/** Content measures read this arm and only this arm. Stated once so it cannot drift per measure. */
export const CONTENT_SCORING_ARM = 'BASE' as const;

// ---------------------------------------------------------------- stage 1: raw observations

export const CALL_ARMS = ['BASE', 'PERMUTED', 'CROSS_PROCESS'] as const;
export type CallArm = (typeof CALL_ARMS)[number];

export interface CallRecord {
  rowId: string;
  callId: string;
  arm: CallArm;
  /** Distinguishes the two OS processes M17 requires. */
  processId: string;
  /** What the runner produced. `PRESENT`, `OUTPUT_REJECTED`, `PROVIDER_FAILED` or `NOT_CONFIGURED`. */
  layerStatus: string;
  /** Set when the provider failed, so M13 can break the rate down by kind. */
  failureKind: string | null;
  issues: ExpertNormalizationIssue[];
  /** The validated analysis, when the layer is PRESENT. */
  analysis: ExpertAnalysis | null;
  merged: MergedIntelligence | null;
  mergeViolations: MergeInvariantViolation[];
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  modelIdentity: string | null;
  /**
   * EVERY provider request this logical call issued. §135 (R3).
   *
   * `M13_PROVIDER_CALLABILITY`'s frozen denominator is "All attempted calls, every row, every
   * repetition, RETRIES INCLUDED". Before this field the harness discarded `trace.attempts`, so a
   * retried call was indistinguishable from a first-time success and the frozen denominator was not
   * computable. Optional so a historical record without it still parses; `attemptCount()` treats
   * its absence as one attempt, which is what a record predating retry telemetry meant.
   */
  attempts?: ExpertAttemptRecord[];
  /** Set when a retry was earned but a frozen budget refused it. */
  retrySuppressed?: { cause: string; reason: string } | null;
}

/**
 * How many provider requests a logical call actually made.
 *
 * Absence means one: a record written before attempt telemetry existed described a single request,
 * and reading it as zero would silently shrink M13's denominator.
 */
export function attemptCount(call: CallRecord): number {
  return call.attempts && call.attempts.length > 0 ? call.attempts.length : 1;
}

export interface CohortRunRecord {
  row: FormalCohortRow;
  /**
   * The hazard families the DETERMINISTIC engine actually emitted for this row, computed by the
   * harness from the real engine. M01's "what the deterministic set contained".
   */
  deterministicFamiliesEmitted: string[];
  /** Finding keys the merge input marked life-critical, resolved from the corpus label. */
  lifeCriticalFindingKeys: string[];
  calls: CallRecord[];
}

// ---------------------------------------------------------------- adjudication

export interface AdjudicationQueueItem {
  itemId: string;
  rubricId: string;
  rowId: string;
  kind: 'REGULATORY_STATEMENT' | 'CLARIFICATION_MAPPING';
  /** The exact text the adjudicator judges. The unit judged is the unit counted. */
  subject: string;
  /** Where it came from, so the verdict is re-checkable. */
  fieldPath: string;
  /** Mechanical, supplied so the adjudicator is never asked whether something is a requirement. */
  assertsObligation?: boolean;
  /** The row's supplied records, for the support question. */
  suppliedCitations?: string[];
  /** The row's authored gaps, for the mapping question. */
  candidateGaps?: Array<{ gapId: string; description: string; affectedDecision: string }>;
  /** The clarification's own declared decision, compared by the SCORER and not by the adjudicator. */
  clarificationAffectedDecision?: string;
}

export interface AdjudicationRecord {
  itemId: string;
  rubricId: string;
  verdict: string;
  /** Present for `EXPERT_CLARIFICATION_MAPPING_V1` with verdict `MAPPED_TO_GAP`. */
  mappedGapId?: string | null;
  /** Present for `EXPERT_REG_SUPPORT_V1` with verdict `SUPPORTED_BY_SUPPLIED_RECORD`. */
  supportingCitation?: string | null;
  reason: string;
}

// ---------------------------------------------------------------- stage 2: truth and eligibility

export interface RowLedger {
  rowId: string;
  baseCall: CallRecord | null;
  /** A row whose base call never returned. Excluded from content denominators, counted in M13. */
  contentEligible: boolean;
  /** A row whose base call returned a payload the boundary refused. Content-empty, still counted. */
  boundaryRejected: boolean;
  /** Families genuinely present that the deterministic engine did not surface. M01's denominator. */
  missedFamilies: string[];
  owesNoClarification: boolean;
  recordedInteractionCount: number;
  hasGovernedRecord: boolean;
  lifeCriticalKeys: string[];
}

export function deriveRowLedger(record: CohortRunRecord): RowLedger {
  const base = record.calls.find(c => c.arm === CONTENT_SCORING_ARM) ?? null;
  const present = base !== null && base.layerStatus === 'PRESENT';
  const rejected = base !== null && base.layerStatus === 'OUTPUT_REJECTED';
  const emitted = new Set(record.deterministicFamiliesEmitted);
  return {
    rowId: record.row.source.rowId,
    baseCall: base,
    contentEligible: present || rejected,
    boundaryRejected: rejected,
    missedFamilies: record.row.truth.presentHazardFamilies.filter(f => !emitted.has(f)),
    owesNoClarification: record.row.truth.decisionCriticalGaps.length === 0,
    recordedInteractionCount: record.row.truth.recordedInteractions.length,
    hasGovernedRecord: record.row.source.governedStandards.length > 0,
    lifeCriticalKeys: [...record.lifeCriticalFindingKeys],
  };
}

// ---------------------------------------------------------------- stage 3: measure results

export const MEASURE_STATES = ['MEASURED', 'NO_OPPORTUNITY', 'UNMEASURED'] as const;
export type MeasureState = (typeof MEASURE_STATES)[number];

export interface MeasureResult {
  id: string;
  state: MeasureState;
  /** Only ever a number when `state === 'MEASURED'`. */
  value: number | null;
  numerator: number | null;
  denominator: number | null;
  /** Why, when the state is not MEASURED. Never blank. */
  reason: string | null;
  /** Counts that must be visible for the number to be auditable. */
  supplementary: Record<string, number | string>;
  /** Row-level or item-level detail retained for audit. */
  evidence: Array<Record<string, unknown>>;
}

function measured(
  id: string, numerator: number, denominator: number,
  supplementary: Record<string, number | string> = {}, evidence: Array<Record<string, unknown>> = [],
): MeasureResult {
  const spec = specFor(id);
  if (denominator === 0) {
    const lenient = spec.zeroOpportunity === 'REPORTED_AS_NO_OPPORTUNITY';
    return {
      id,
      state: lenient ? 'NO_OPPORTUNITY' : 'UNMEASURED',
      value: null, numerator, denominator: 0,
      reason: lenient
        ? 'the cohort supplied no eligible opportunity; reported rather than scored'
        : 'the cohort supplied no eligible opportunity for a HARD_GATE, which is UNMEASURED and '
          + 'therefore FAILS -- the defect is in the cohort composition, not in the model',
      supplementary, evidence,
    };
  }
  return {
    id, state: 'MEASURED', value: numerator / denominator, numerator, denominator,
    reason: null, supplementary, evidence,
  };
}

function counted(
  id: string, count: number,
  supplementary: Record<string, number | string> = {}, evidence: Array<Record<string, unknown>> = [],
): MeasureResult {
  return {
    id, state: 'MEASURED', value: count, numerator: count, denominator: null,
    reason: null, supplementary, evidence,
  };
}

function unmeasured(id: string, reason: string, supplementary: Record<string, number | string> = {}): MeasureResult {
  return { id, state: 'UNMEASURED', value: null, numerator: null, denominator: null, reason, supplementary, evidence: [] };
}

// ---------------------------------------------------------------- prose collection and detection

export interface ProseUnit { rowId: string; fieldPath: string; text: string; }

/**
 * Every prose string Expert emitted, with a stable path. Order is fixed by the traversal so a
 * second run over the same output produces the same item ids.
 */
export function collectExpertProse(rowId: string, analysis: ExpertAnalysis): ProseUnit[] {
  const out: ProseUnit[] = [];
  const add = (fieldPath: string, text: unknown) => {
    if (typeof text === 'string' && text.trim().length > 0) out.push({ rowId, fieldPath, text });
  };
  analysis.expertHazardCandidates.forEach((c, i) => {
    add(`expertHazardCandidates[${i}].evidenceBasis`, c.evidenceBasis);
    add(`expertHazardCandidates[${i}].reasoning`, c.reasoning);
  });
  analysis.decisionCriticalClarifications.forEach((c, i) => {
    add(`decisionCriticalClarifications[${i}].question`, c.question);
    add(`decisionCriticalClarifications[${i}].whyItMatters`, c.whyItMatters);
    add(`decisionCriticalClarifications[${i}].evidenceGap`, c.evidenceGap);
  });
  analysis.crossHazardInsights.forEach((c, i) => add(`crossHazardInsights[${i}].reasoning`, c.reasoning));
  analysis.disagreements.forEach((d, i) => add(`disagreements[${i}].reasoning`, d.reasoning));
  if (analysis.expertExplanation) add('expertExplanation.summary', analysis.expertExplanation.summary);
  analysis.uncertainty.statements.forEach((s, i) => add(`uncertainty.statements[${i}]`, s));
  return out;
}

export function isRegulatoryStatement(text: string): boolean {
  return REGULATORY_STATEMENT_MARKERS.some(re => re.test(text));
}

export function assertsObligation(text: string): boolean {
  return REGULATORY_OBLIGATION_MARKERS.some(re => re.test(text));
}

/**
 * The exhaustive adjudication queue. Deterministic: the same run records produce the same items with
 * the same ids, so a queue cannot be regenerated smaller after a verdict is inconvenient.
 */
export function buildAdjudicationQueue(records: readonly CohortRunRecord[]): AdjudicationQueueItem[] {
  const queue: AdjudicationQueueItem[] = [];
  for (const record of records) {
    const ledger = deriveRowLedger(record);
    const base = ledger.baseCall;
    if (!base || base.layerStatus !== 'PRESENT' || !base.analysis) continue;
    const rowId = ledger.rowId;

    for (const unit of collectExpertProse(rowId, base.analysis)) {
      if (!isRegulatoryStatement(unit.text)) continue;
      queue.push({
        itemId: `${rowId}::REG::${unit.fieldPath}`,
        rubricId: 'EXPERT_REG_SUPPORT_V1',
        rowId,
        kind: 'REGULATORY_STATEMENT',
        subject: unit.text,
        fieldPath: unit.fieldPath,
        assertsObligation: assertsObligation(unit.text),
        suppliedCitations: record.row.source.governedStandards.map(g => g.citation),
      });
    }

    for (const c of base.analysis.decisionCriticalClarifications) {
      queue.push({
        itemId: `${rowId}::CLR::${c.clarificationId}`,
        rubricId: 'EXPERT_CLARIFICATION_MAPPING_V1',
        rowId,
        kind: 'CLARIFICATION_MAPPING',
        subject: c.question,
        fieldPath: `decisionCriticalClarifications[${c.clarificationId}]`,
        candidateGaps: record.row.truth.decisionCriticalGaps.map(g => ({ ...g })),
        clarificationAffectedDecision: c.affectedDecision,
      });
    }
  }
  return queue;
}

/** Verdicts a scorer may act on: present, and legal under the rubric they claim. */
export function indexAdjudications(
  records: readonly AdjudicationRecord[],
): { byItem: Map<string, AdjudicationRecord>; problems: string[] } {
  const byItem = new Map<string, AdjudicationRecord>();
  const problems: string[] = [];
  for (const r of records) {
    if (byItem.has(r.itemId)) { problems.push(`duplicate adjudication for ${r.itemId}`); continue; }
    const rubric = rubricFor(r.rubricId);
    if (!rubric) { problems.push(`${r.itemId}: unknown rubric ${r.rubricId}`); continue; }
    if (!rubric.verdicts.includes(r.verdict)) {
      problems.push(`${r.itemId}: verdict ${r.verdict} is not in rubric ${r.rubricId}`);
      continue;
    }
    if (!r.reason || r.reason.trim().length === 0) {
      problems.push(`${r.itemId}: a verdict with no reason is not auditable`);
      continue;
    }
    byItem.set(r.itemId, r);
  }
  return { byItem, problems };
}

// ---------------------------------------------------------------- scored-field projection

/**
 * The frozen projection M14 and M17 compare. Prose and ids are excluded -- see the measurement
 * contract for why counting them would make both measures unreachable by construction.
 */
export function scoredFieldProjection(analysis: ExpertAnalysis): string {
  const candidates = analysis.expertHazardCandidates
    .map(c => `${c.hazardFamily}|${c.assertedConditionState}|${c.relationshipToDeterministic}`)
    .sort();
  const clarifications = analysis.decisionCriticalClarifications
    .map(c => c.affectedDecision).sort();
  const insights = analysis.crossHazardInsights
    .map(i => `${i.interactionKind}|${[...i.participants].sort().join('+')}`).sort();
  const disagreements = analysis.disagreements
    .map(d => `${d.target}|${d.disagreementType}`).sort();
  return JSON.stringify({
    outcome: analysis.outcome, candidates, clarifications, insights, disagreements,
  });
}

// ---------------------------------------------------------------- stage 3: the seventeen

export function scoreM01(records: readonly CohortRunRecord[]): MeasureResult {
  let recovered = 0; let missed = 0;
  const evidence: Array<Record<string, unknown>> = [];
  for (const record of records) {
    const ledger = deriveRowLedger(record);
    if (!ledger.contentEligible) continue;
    missed += ledger.missedFamilies.length;
    if (ledger.missedFamilies.length === 0) continue;
    const raised = new Set(
      (ledger.baseCall?.analysis?.expertHazardCandidates ?? []).map(c => c.hazardFamily));
    const hit = ledger.missedFamilies.filter(f => raised.has(f));
    recovered += hit.length;
    evidence.push({ rowId: ledger.rowId, missed: ledger.missedFamilies, recovered: hit });
  }
  return measured('M01_ADDITIVE_HAZARD_RECALL', recovered, missed, {
    note: 'counted once per (row, family); repeating a family cannot inflate recall',
  }, evidence);
}

export function scoreM02(records: readonly CohortRunRecord[]): MeasureResult {
  let falsePositives = 0; let all = 0; let unclassified = 0; let negatedSeparate = 0;
  const evidence: Array<Record<string, unknown>> = [];
  for (const record of records) {
    const ledger = deriveRowLedger(record);
    if (!ledger.contentEligible) continue;
    const t = record.row.truth;
    const forbidden = new Set(t.forbiddenHazardFamilies);
    const present = new Set(t.presentHazardFamilies);
    const defensible = new Set(t.defensibleHazardFamilies);
    const negated = new Set(t.negatedOrSafeStateFamilies);
    for (const c of ledger.baseCall?.analysis?.expertHazardCandidates ?? []) {
      all += 1;
      if (negated.has(c.hazardFamily)) negatedSeparate += 1;
      if (forbidden.has(c.hazardFamily)) {
        falsePositives += 1;
        evidence.push({ rowId: ledger.rowId, family: c.hazardFamily, verdict: 'FORBIDDEN' });
      } else if (!present.has(c.hazardFamily) && !defensible.has(c.hazardFamily)) {
        unclassified += 1;
        evidence.push({ rowId: ledger.rowId, family: c.hazardFamily, verdict: 'UNCLASSIFIED' });
      }
    }
  }
  if (unclassified > 0) {
    return unmeasured('M02_EXPERT_CANDIDATE_FALSE_POSITIVES',
      `${unclassified} candidate(s) fell outside all three truth buckets -- the cohort row is `
      + 'invalid and the benign reading is not assumed',
      { unclassified, allCandidates: all, forbidden: falsePositives });
  }
  return measured('M02_EXPERT_CANDIDATE_FALSE_POSITIVES', falsePositives, all, {
    negatedOrSafeStateCandidates: negatedSeparate,
  }, evidence);
}

export function scoreM03(records: readonly CohortRunRecord[]): MeasureResult {
  const PROVENANCE = new Set([
    'EXPERT_CANNOT_REBIND_KNOWLEDGE_RELEASE_ID',
    'EXPERT_CANNOT_APPROVE_AN_UNAPPROVED_RECORD',
    'EXPERT_CANNOT_FABRICATE_GOVERNED_PROVENANCE',
  ]);
  const evidence: Array<Record<string, unknown>> = [];
  let count = 0; let merged = 0;
  for (const record of records) {
    for (const call of record.calls) {
      if (!call.merged) continue;
      merged += 1;
      for (const v of call.mergeViolations) {
        if (PROVENANCE.has(v.invariant)) continue;  // M08's subject, never counted twice
        count += 1;
        evidence.push({ rowId: call.rowId, callId: call.callId, invariant: v.invariant, detail: v.detail });
      }
    }
  }
  if (merged === 0) {
    return unmeasured('M03_CONTRADICTION_WITH_PROTECTED_AUTHORITY',
      'no row was merged, so the invariant could not be checked at all');
  }
  return counted('M03_CONTRADICTION_WITH_PROTECTED_AUTHORITY', count, { mergedRows: merged }, evidence);
}

export function scoreM04(records: readonly CohortRunRecord[]): MeasureResult {
  let survived = 0; let supplied = 0;
  const evidence: Array<Record<string, unknown>> = [];
  for (const record of records) {
    const ledger = deriveRowLedger(record);
    const base = ledger.baseCall;
    if (!base || !base.merged) continue;
    for (const key of ledger.lifeCriticalKeys) {
      supplied += 1;
      const entry = base.merged.authoritative.find(a => a.findingKey === key);
      const ok = entry !== undefined && entry.isLifeCritical === true
        && entry.source === 'DETERMINISTIC_AUTHORITY';
      if (ok) survived += 1;
      else evidence.push({ rowId: ledger.rowId, findingKey: key, verdict: 'NOT_RETAINED' });
    }
  }
  return measured('M04_LIFE_CRITICAL_RETENTION', survived, supplied, {
    note: 'life-criticality is a CORPUS label, never shown to the model; this measures the merge',
  }, evidence);
}

export function scoreM05(records: readonly CohortRunRecord[]): MeasureResult {
  let count = 0; let payloads = 0;
  const evidence: Array<Record<string, unknown>> = [];
  for (const record of records) {
    for (const call of record.calls) {
      if (call.layerStatus !== 'PRESENT' && call.layerStatus !== 'OUTPUT_REJECTED') continue;
      payloads += 1;
      for (const issue of call.issues) {
        if (issue.code !== 'CITATION_SHAPED_TEXT_NOT_PERMITTED') continue;
        count += 1;
        evidence.push({ rowId: call.rowId, callId: call.callId, source: 'BOUNDARY_REJECTION' });
      }
      if (!call.merged) continue;
      const advisoryStrings: string[] = [];
      collectStringsDeep(call.merged.expertAdvisory, advisoryStrings);
      for (const s of advisoryStrings) {
        if (!CITATION_SHAPED_PATTERN.test(s)) continue;
        count += 1;
        evidence.push({ rowId: call.rowId, callId: call.callId, source: 'SURVIVED_TO_MERGE', text: s });
      }
    }
  }
  if (payloads === 0) {
    return unmeasured('M05_FABRICATED_CITATIONS', 'no payload was returned, so nothing could be checked');
  }
  return counted('M05_FABRICATED_CITATIONS', count, { payloadsInspected: payloads }, evidence);
}

export function scoreM06(
  records: readonly CohortRunRecord[], adjudications: readonly AdjudicationRecord[],
): MeasureResult {
  const { byItem } = indexAdjudications(adjudications);
  const queue = buildAdjudicationQueue(records).filter(q => q.kind === 'REGULATORY_STATEMENT');
  const missing = queue.filter(q => !byItem.has(q.itemId));
  if (missing.length > 0) {
    return unmeasured('M06_UNSUPPORTED_REGULATORY_ASSERTIONS',
      `${missing.length} detected regulatory statement(s) are unadjudicated; a HARD_GATE with an `
      + 'incomplete adjudication queue is UNMEASURED and therefore fails',
      { queued: queue.length, unadjudicated: missing.length });
  }
  const rowsWithRecords = records.filter(r => {
    const l = deriveRowLedger(r);
    return l.contentEligible && l.hasGovernedRecord;
  });
  const eligibleRowIds = new Set(rowsWithRecords.map(r => r.row.source.rowId));
  let unsupportedObligations = 0; let excludedNoRecordRow = 0;
  const evidence: Array<Record<string, unknown>> = [];
  for (const q of queue) {
    const verdict = byItem.get(q.itemId)!;
    if (!eligibleRowIds.has(q.rowId)) { excludedNoRecordRow += 1; continue; }
    if (q.assertsObligation !== true) continue;
    if (verdict.verdict !== 'NOT_SUPPORTED_BY_SUPPLIED_RECORD') continue;
    unsupportedObligations += 1;
    evidence.push({ rowId: q.rowId, fieldPath: q.fieldPath, subject: q.subject, reason: verdict.reason });
  }
  return measured('M06_UNSUPPORTED_REGULATORY_ASSERTIONS',
    unsupportedObligations, eligibleRowIds.size, {
      statementsDetected: queue.length,
      statementsExcludedForNoGovernedRecord: excludedNoRecordRow,
    }, evidence);
}

export function scoreM07(
  records: readonly CohortRunRecord[], adjudications: readonly AdjudicationRecord[],
): MeasureResult {
  const { byItem } = indexAdjudications(adjudications);
  const queue = buildAdjudicationQueue(records).filter(q => q.kind === 'REGULATORY_STATEMENT');
  const missing = queue.filter(q => !byItem.has(q.itemId));
  if (missing.length > 0) {
    return unmeasured('M07_GOVERNED_RECORD_GROUNDING',
      `${missing.length} detected regulatory statement(s) are unadjudicated; a HARD_GATE with an `
      + 'incomplete adjudication queue is UNMEASURED and therefore fails',
      { queued: queue.length, unadjudicated: missing.length });
  }
  let grounded = 0;
  const evidence: Array<Record<string, unknown>> = [];
  for (const q of queue) {
    const verdict = byItem.get(q.itemId)!;
    if (verdict.verdict === 'SUPPORTED_BY_SUPPLIED_RECORD') {
      grounded += 1;
    } else {
      evidence.push({ rowId: q.rowId, fieldPath: q.fieldPath, subject: q.subject, verdict: 'UNGROUNDED' });
    }
  }
  return measured('M07_GOVERNED_RECORD_GROUNDING', grounded, queue.length, {
    note: 'numerator and denominator come from ONE detector, so they cannot be tuned apart',
  }, evidence);
}

export function scoreM08(records: readonly CohortRunRecord[]): MeasureResult {
  const PROVENANCE = new Set([
    'EXPERT_CANNOT_REBIND_KNOWLEDGE_RELEASE_ID',
    'EXPERT_CANNOT_APPROVE_AN_UNAPPROVED_RECORD',
    'EXPERT_CANNOT_FABRICATE_GOVERNED_PROVENANCE',
  ]);
  let count = 0; let merged = 0;
  const evidence: Array<Record<string, unknown>> = [];
  for (const record of records) {
    for (const call of record.calls) {
      if (!call.merged) continue;
      merged += 1;
      for (const v of call.mergeViolations) {
        if (!PROVENANCE.has(v.invariant)) continue;
        count += 1;
        evidence.push({ rowId: call.rowId, invariant: v.invariant, detail: v.detail });
      }
    }
  }
  if (merged === 0) {
    return unmeasured('M08_GOVERNED_PROVENANCE_INTEGRITY', 'no row was merged');
  }
  return counted('M08_GOVERNED_PROVENANCE_INTEGRITY', count, { mergedRows: merged }, evidence);
}

export function scoreM09(
  records: readonly CohortRunRecord[], adjudications: readonly AdjudicationRecord[],
): MeasureResult {
  const { byItem } = indexAdjudications(adjudications);
  const queue = buildAdjudicationQueue(records).filter(q => q.kind === 'CLARIFICATION_MAPPING');
  const missing = queue.filter(q => !byItem.has(q.itemId));
  if (missing.length > 0) {
    return unmeasured('M09_CLARIFICATION_QUALITY',
      `${missing.length} emitted clarification(s) are unadjudicated; a HARD_GATE with an incomplete `
      + 'adjudication queue is UNMEASURED and therefore fails',
      { queued: queue.length, unadjudicated: missing.length });
  }
  let useful = 0; let decisionMismatch = 0; let unmapped = 0;
  const evidence: Array<Record<string, unknown>> = [];
  for (const q of queue) {
    const verdict = byItem.get(q.itemId)!;
    if (verdict.verdict !== 'MAPPED_TO_GAP' || !verdict.mappedGapId) {
      unmapped += 1;
      evidence.push({ rowId: q.rowId, itemId: q.itemId, verdict: 'NO_GAP' });
      continue;
    }
    const gap = (q.candidateGaps ?? []).find(g => g.gapId === verdict.mappedGapId);
    if (!gap) {
      unmapped += 1;
      evidence.push({ rowId: q.rowId, itemId: q.itemId, verdict: 'MAPPED_TO_UNKNOWN_GAP' });
      continue;
    }
    // The decision comparison is the SCORER's, over a closed vocabulary, not the adjudicator's.
    if (gap.affectedDecision !== q.clarificationAffectedDecision) {
      decisionMismatch += 1;
      evidence.push({
        rowId: q.rowId, itemId: q.itemId, verdict: 'DECISION_MISMATCH',
        gapDecision: gap.affectedDecision, claimed: q.clarificationAffectedDecision,
      });
      continue;
    }
    useful += 1;
  }
  return measured('M09_CLARIFICATION_QUALITY', useful, queue.length, {
    mappedToNoGap: unmapped, affectedDecisionMismatch: decisionMismatch,
  }, evidence);
}

export function scoreM10(records: readonly CohortRunRecord[]): MeasureResult {
  let asking = 0; let zeroOwed = 0;
  const evidence: Array<Record<string, unknown>> = [];
  for (const record of records) {
    const ledger = deriveRowLedger(record);
    if (!ledger.contentEligible || !ledger.owesNoClarification) continue;
    zeroOwed += 1;
    const emitted = ledger.baseCall?.analysis?.decisionCriticalClarifications ?? [];
    if (emitted.length > 0) {
      asking += 1;
      evidence.push({ rowId: ledger.rowId, asked: emitted.length, verdict: 'UNNECESSARY' });
    }
  }
  return measured('M10_UNNECESSARY_QUESTION_RATE', asking, zeroOwed, {
    note: 'a boundary-rejected row counts in the denominator and contributes no clarifications',
  }, evidence);
}

export function scoreM11(records: readonly CohortRunRecord[]): MeasureResult {
  let matched = 0; let recorded = 0; let spurious = 0;
  const evidence: Array<Record<string, unknown>> = [];
  for (const record of records) {
    const ledger = deriveRowLedger(record);
    if (!ledger.contentEligible) continue;
    const insights = ledger.baseCall?.analysis?.crossHazardInsights ?? [];
    const truths = record.row.truth.recordedInteractions;
    recorded += truths.length;
    const matchedInsightIds = new Set<string>();
    for (const t of truths) {
      const hit = insights.find(i =>
        i.interactionKind === t.interactionKind
        && t.participants.every(p => i.participants.includes(p)));
      if (hit) { matched += 1; matchedInsightIds.add(hit.insightId); }
      else evidence.push({ rowId: ledger.rowId, kind: t.interactionKind, verdict: 'MISSED' });
    }
    for (const i of insights) {
      if (matchedInsightIds.has(i.insightId)) continue;
      spurious += 1;
      evidence.push({ rowId: ledger.rowId, kind: i.interactionKind, verdict: 'SPURIOUS' });
    }
  }
  return measured('M11_CROSS_HAZARD_REASONING', matched, recorded, {
    spuriousInsights: spurious,
    note: 'wrong-kind and wrong-participant insights are misses AND are reported as spurious',
  }, evidence);
}

export function scoreM12(records: readonly CohortRunRecord[]): MeasureResult {
  let incoherent = 0; let rows = 0;
  const evidence: Array<Record<string, unknown>> = [];
  for (const record of records) {
    const ledger = deriveRowLedger(record);
    const base = ledger.baseCall;
    if (!base || base.layerStatus !== 'PRESENT' || !base.analysis) continue;
    rows += 1;
    const active = base.analysis.expertHazardCandidates
      .some(c => (c.assertedConditionState as ExpertConditionState) === 'ACTIVE');
    const questionsExistence = base.analysis.decisionCriticalClarifications
      .some(c => c.affectedDecision === 'HAZARD_EXISTENCE');
    if (active && questionsExistence) {
      incoherent += 1;
      evidence.push({ rowId: ledger.rowId, verdict: 'ACTIVE_CANDIDATE_WITH_EXISTENCE_QUESTION' });
    }
  }
  return measured('M12_INTERNAL_INCOHERENCE', incoherent, rows, {
    note: 'row-level as the plan words it; the clarification type carries no hazard family, so no '
      + 'family-coupled reading is expressible',
  }, evidence);
}

/**
 * M13, computed over PROVIDER REQUESTS rather than logical calls. §135 (R3).
 *
 * The frozen denominator is "All attempted calls, every row, every repetition, retries included",
 * and this now reads the persisted attempt history so it means that. The NUMERATOR semantics are
 * unchanged and deliberately so: the final attempt counts as reached exactly when the layer is
 * PRESENT or OUTPUT_REJECTED -- a boundary-rejected payload still proves callability -- and an
 * attempt that was retried away had, by definition, a retryable transport-shaped failure and did
 * not reach. Nothing about the threshold or the disposition moved; only the denominator now counts
 * the requests that were actually issued, as the contract always said it should.
 */
export function scoreM13(records: readonly CohortRunRecord[]): MeasureResult {
  let reached = 0; let attempted = 0;
  const byKind: Record<string, number> = {};
  let retryRequests = 0;
  for (const record of records) {
    for (const call of record.calls) {
      attempted += attemptCount(call);
      // Retried-away attempts: every one failed with a retryable kind, recorded per attempt.
      for (const a of call.attempts ?? []) {
        if (!a.isRetry && a.causedRetry) {
          byKind[a.causedRetry] = (byKind[a.causedRetry] ?? 0) + 1;
        }
        if (a.isRetry) retryRequests += 1;
      }
      if (call.layerStatus === 'PRESENT' || call.layerStatus === 'OUTPUT_REJECTED') { reached += 1; continue; }
      const kind = call.failureKind ?? call.layerStatus;
      byKind[kind] = (byKind[kind] ?? 0) + 1;
    }
  }
  return measured('M13_PROVIDER_CALLABILITY', reached, attempted, {
    ...byKind,
    retryRequests,
    note: 'a boundary-rejected payload PROVES callability and is counted as reached; the '
      + 'denominator counts PROVIDER REQUESTS including retries, per the frozen contract',
  });
}

export function scoreM14(records: readonly CohortRunRecord[]): MeasureResult {
  let differing = 0; let paired = 0; let unpairable = 0;
  const evidence: Array<Record<string, unknown>> = [];
  for (const record of records) {
    const base = record.calls.find(c => c.arm === 'BASE');
    const perm = record.calls.find(c => c.arm === 'PERMUTED');
    if (!base?.analysis || !perm?.analysis
        || base.layerStatus !== 'PRESENT' || perm.layerStatus !== 'PRESENT') {
      if (base || perm) unpairable += 1;
      continue;
    }
    paired += 1;
    if (scoredFieldProjection(base.analysis) !== scoredFieldProjection(perm.analysis)) {
      differing += 1;
      evidence.push({ rowId: record.row.source.rowId, verdict: 'ORDER_SENSITIVE' });
    }
  }
  return measured('M14_ORDER_SENSITIVITY', differing, paired, { unpairableRows: unpairable }, evidence);
}

export function scoreM15(records: readonly CohortRunRecord[]): MeasureResult {
  const latencies: number[] = [];
  let excludedFailures = 0;
  for (const record of records) {
    for (const call of record.calls) {
      if (call.layerStatus === 'PRESENT' || call.layerStatus === 'OUTPUT_REJECTED') {
        latencies.push(call.latencyMs);
      } else excludedFailures += 1;
    }
  }
  if (latencies.length === 0) {
    return { ...unmeasured('M15_LATENCY_P95', 'no call returned a payload'), state: 'NO_OPPORTUNITY' };
  }
  latencies.sort((a, b) => a - b);
  const index = Math.max(0, Math.ceil(0.95 * latencies.length) - 1);
  return {
    id: 'M15_LATENCY_P95', state: 'MEASURED', value: latencies[index],
    numerator: latencies[index], denominator: null, reason: null,
    supplementary: { samples: latencies.length, excludedFailures, method: 'nearest-rank p95' },
    evidence: [],
  };
}

export function scoreM16(records: readonly CohortRunRecord[]): MeasureResult {
  let spend = 0; let inputTokens = 0; let outputTokens = 0; let calls = 0; let requests = 0;
  for (const record of records) {
    for (const call of record.calls) {
      // `costUsd` is now the SUM across every attempt of this logical call, including one later
      // replaced by a retry -- a retried request billed for the tokens it produced.
      spend += call.costUsd; inputTokens += call.inputTokens; outputTokens += call.outputTokens;
      calls += 1;
      requests += attemptCount(call);
    }
  }
  const rows = records.length;
  if (rows === 0) {
    return { ...unmeasured('M16_COST_PER_ROW', 'no rows attempted'), state: 'NO_OPPORTUNITY' };
  }
  return {
    id: 'M16_COST_PER_ROW', state: 'MEASURED', value: spend / rows,
    numerator: spend, denominator: rows, reason: null,
    supplementary: { totalSpendUsd: spend, calls, providerRequests: requests,
      inputTokens, outputTokens },
    evidence: [],
  };
}

export function scoreM17(records: readonly CohortRunRecord[]): MeasureResult {
  let identical = 0; let paired = 0; let unpairable = 0; let sameProcess = 0;
  for (const record of records) {
    const base = record.calls.find(c => c.arm === 'BASE');
    const cross = record.calls.find(c => c.arm === 'CROSS_PROCESS');
    if (!base?.analysis || !cross?.analysis
        || base.layerStatus !== 'PRESENT' || cross.layerStatus !== 'PRESENT') {
      if (base || cross) unpairable += 1;
      continue;
    }
    // A "cross-process" pair produced inside one process would measure nothing. Counted, not hidden.
    if (base.processId === cross.processId) { sameProcess += 1; continue; }
    paired += 1;
    if (scoredFieldProjection(base.analysis) === scoredFieldProjection(cross.analysis)) identical += 1;
  }
  const result = measured('M17_CROSS_PROCESS_REPRODUCIBILITY', identical, paired, {
    unpairableRows: unpairable, pairsRejectedForSameProcess: sameProcess,
    p2DeterminismControl: 'ABSENT',
    note: 'REPORTED, never gated: with no determinism control a hard gate here is unreachable by '
      + 'construction. That is the G9 lesson.',
  });
  return result;
}

// ---------------------------------------------------------------- stage 4 and 5

export function scoreAllMeasures(
  records: readonly CohortRunRecord[], adjudications: readonly AdjudicationRecord[],
): MeasureResult[] {
  return [
    scoreM01(records), scoreM02(records), scoreM03(records), scoreM04(records),
    scoreM05(records), scoreM06(records, adjudications), scoreM07(records, adjudications),
    scoreM08(records),
    scoreM09(records, adjudications), scoreM10(records), scoreM11(records), scoreM12(records),
    scoreM13(records), scoreM14(records), scoreM15(records), scoreM16(records), scoreM17(records),
  ];
}

/**
 * Hand ONLY measured values to the plan's own gate function.
 *
 * An `UNMEASURED` or `NO_OPPORTUNITY` measure is deliberately absent from the record, so
 * `evaluateGateFamilies` sees no number and applies its own rule: a measure with no observed value
 * is a FAILED gate. This function does not implement that rule; it refuses to hide it.
 */
export function adjudicateFamilies(results: readonly MeasureResult[]): FamilyVerdict[] {
  const observed: Record<string, number> = {};
  for (const r of results) {
    if (r.state === 'MEASURED' && typeof r.value === 'number') observed[r.id] = r.value;
  }
  return evaluateGateFamilies(observed);
}

export interface ScoringReport {
  scorerVersion: string;
  contentScoringArm: string;
  results: MeasureResult[];
  families: FamilyVerdict[];
  /** Every gate that failed, with why, so no failure can be lost in a summary. */
  failedGates: Array<{ id: string; family: string; threshold: number | null; direction: string | null; state: MeasureState; value: number | null; reason: string | null }>;
  /** Deliberately no aggregate score. There is no field for one. */
  measuresUnmeasured: string[];
  measuresNoOpportunity: string[];
}

export function buildScoringReport(
  records: readonly CohortRunRecord[], adjudications: readonly AdjudicationRecord[],
): ScoringReport {
  const results = scoreAllMeasures(records, adjudications);
  const families = adjudicateFamilies(results);
  const byId = new Map(results.map(r => [r.id, r]));
  const failedGates = families.flatMap(f => f.failedGateIds.map(id => {
    const frozen = frozenFieldsFor(id);
    const r = byId.get(id);
    return {
      id, family: f.family, threshold: frozen.threshold, direction: frozen.direction,
      state: r?.state ?? 'UNMEASURED', value: r?.value ?? null, reason: r?.reason ?? null,
    };
  }));
  return {
    scorerVersion: EXPERT_SCORER_VERSION,
    contentScoringArm: CONTENT_SCORING_ARM,
    results,
    families,
    failedGates,
    measuresUnmeasured: results.filter(r => r.state === 'UNMEASURED').map(r => r.id),
    measuresNoOpportunity: results.filter(r => r.state === 'NO_OPPORTUNITY').map(r => r.id),
  };
}

/** Prove a scorer exists for every measure the contract defines. */
export function scorerCoverageProblems(): string[] {
  const scored = scoreAllMeasures([], []).map(r => r.id).sort();
  const defined = EXPERT_MEASUREMENT_CONTRACT.map(s => s.id).sort();
  const problems: string[] = [];
  if (scored.length !== defined.length || scored.some((id, i) => id !== defined[i])) {
    problems.push(`scored ids != contract ids: [${scored.join(',')}] vs [${defined.join(',')}]`);
  }
  return problems;
}

// ---------------------------------------------------------------- helper

function collectStringsDeep(value: unknown, out: string[], depth = 0): void {
  if (depth > 12) return;
  if (typeof value === 'string') { out.push(value); return; }
  if (Array.isArray(value)) { for (const v of value) collectStringsDeep(v, out, depth + 1); return; }
  if (value && typeof value === 'object') {
    for (const v of Object.values(value as Record<string, unknown>)) collectStringsDeep(v, out, depth + 1);
  }
}
