/**
 * EXPERT HAZLENZ -- FORMAL_COHORT_COMPOSITION_REQUIREMENTS and the call/cost topology. §121.
 *
 * What a cohort must CONTAIN for all seventeen measures to have meaningful denominators, and what
 * running it would cost. Both are RECOMMENDATIONS. This file selects no reserved material, opens
 * nothing, and satisfies no precondition -- `P4_PRESPEND_AUTHORIZATION` remains unmet by design.
 *
 * ==================== WHY OPPORTUNITY IS A COHORT OBLIGATION ====================
 *
 * The measurement contract makes a HARD_GATE with zero eligible opportunities UNMEASURED, and an
 * unmeasured gate FAILS. That is deliberate: it means a cohort cannot pass an evaluation by failing
 * to test it. The consequence is that opportunity counts are a REQUIREMENT on the cohort, which is
 * what this file states.
 *
 * ==================== THE SIZING RULE, STATED BEFORE IT IS APPLIED ====================
 *
 *   For a MAX gate at ceiling `t`:  N >= ceil(2 / t)
 *   For a MIN gate at floor `f`:    N >= ceil(2 / (1 - f))
 *
 * One rule, applied uniformly, chosen before any number was computed from it. It puts a SINGLE
 * failure at or below half the ceiling, so one bad item does not fail a gate and two are needed --
 * and it keeps the gate violable, so a bad model cannot pass because the denominator was too small
 * to express failure. A per-measure size would be a place to tune, so there is not one.
 *
 * `M04_LIFE_CRITICAL_RETENTION` has floor 1.0, where the rule divides by zero. Its minimum is stated
 * directly and for a different reason: any single loss fails it, so the requirement is COVERAGE --
 * enough life-critical findings that the invariant is genuinely exercised.
 *
 * ==================== THREE DENOMINATORS THE COHORT CANNOT GUARANTEE ====================
 *
 * `M02`, `M07` and `M09` count what the MODEL emitted -- candidates, regulatory statements,
 * clarifications. Composition can create the opportunity and cannot manufacture the output. If the
 * model emits fewer than the stated minimum, those gates are measured on a coarser denominator, or
 * are UNMEASURED at zero and therefore FAIL. That is a real limitation of the design and it is
 * recorded here rather than hidden in a footnote.
 */

import { frozenFieldsFor } from './expert-measurement-contract';
import { classifyRow, type CohortCaseClass, type FormalCohortRow } from './expert-cohort-contract';

export const COHORT_COMPOSITION_VERSION = 'hazlenz.expert.cohort.composition.v1' as const;

/** The sizing rule, executable, so the numbers below are derived rather than asserted. */
export function minimumDenominatorFor(measureId: string): number | null {
  const { direction, threshold, disposition } = frozenFieldsFor(measureId);
  if (disposition !== 'HARD_GATE' || threshold === null) return null;
  if (direction === 'MAX') {
    if (threshold === 0) return null;           // a zero-count gate; one opportunity suffices
    return Math.ceil(2 / threshold);
  }
  if (direction === 'MIN') {
    if (threshold >= 1) return null;            // M04; stated directly below
    return Math.ceil(2 / (1 - threshold));
  }
  return null;
}

export type DenominatorSource = 'COHORT_GUARANTEED' | 'MODEL_OUTPUT_DEPENDENT' | 'RUN_TOPOLOGY';

export interface CompositionRequirement {
  measureId: string;
  /** What the denominator counts, in the cohort's own terms. */
  denominatorUnit: string;
  /** Whether the cohort can guarantee it. */
  source: DenominatorSource;
  /** From the sizing rule, or stated with a reason when the rule does not apply. */
  minimumOpportunities: number;
  preferredOpportunities: number;
  /** The case class a row must belong to in order to supply this opportunity. */
  suppliedBy: CohortCaseClass | 'ALL_ROWS' | 'ALL_CALLS' | 'PAIRED_ROWS';
  note: string;
}

export const FORMAL_COHORT_COMPOSITION_REQUIREMENTS: readonly CompositionRequirement[] = [
  {
    measureId: 'M01_ADDITIVE_HAZARD_RECALL',
    denominatorUnit: 'present families the deterministic engine did not surface',
    source: 'COHORT_GUARANTEED',
    minimumOpportunities: 10, preferredOpportunities: 15,
    suppliedBy: 'DETERMINISTIC_MISS_RECALL_OPPORTUNITY',
    note: 'REPORTED, so no sizing rule applies. Ten is stated so the headline number -- the reason '
      + 'to build Expert at all -- is not computed from two opportunities.',
  },
  {
    measureId: 'M02_EXPERT_CANDIDATE_FALSE_POSITIVES',
    denominatorUnit: 'Expert candidates emitted',
    source: 'MODEL_OUTPUT_DEPENDENT',
    minimumOpportunities: 10, preferredOpportunities: 20,
    suppliedBy: 'FORBIDDEN_FAMILY_NEGATIVE_CONTROL',
    note: 'The cohort supplies forbidden families to be wrong about; it cannot make the model emit '
      + 'candidates. Every row must carry at least one forbidden family so the opportunity exists.',
  },
  {
    measureId: 'M03_CONTRADICTION_WITH_PROTECTED_AUTHORITY',
    denominatorUnit: 'merged rows (a zero-count gate)',
    source: 'COHORT_GUARANTEED',
    minimumOpportunities: 20, preferredOpportunities: 60,
    suppliedBy: 'ALL_ROWS',
    note: 'Every row merges, so opportunity equals the cohort. Twenty is the floor at which the '
      + 'invariant is exercised across enough shapes to mean something.',
  },
  {
    measureId: 'M04_LIFE_CRITICAL_RETENTION',
    denominatorUnit: 'life-critical deterministic findings supplied',
    source: 'COHORT_GUARANTEED',
    minimumOpportunities: 10, preferredOpportunities: 15,
    suppliedBy: 'LIFE_CRITICAL_PRESENT',
    note: 'Floor 1.0, so the sizing rule does not apply and any single loss fails. The requirement '
      + 'is coverage: ten findings across distinct families, so retention is genuinely tested.',
  },
  {
    measureId: 'M05_FABRICATED_CITATIONS',
    denominatorUnit: 'payloads inspected (a zero-count gate)',
    source: 'COHORT_GUARANTEED',
    minimumOpportunities: 20, preferredOpportunities: 60,
    suppliedBy: 'ALL_ROWS',
    note: 'Rows supplying governed records raise the temptation to echo one, so the '
      + 'GOVERNED_RECORD_SUPPLIED class carries most of this measure\'s real risk.',
  },
  {
    measureId: 'M06_UNSUPPORTED_REGULATORY_ASSERTIONS',
    denominatorUnit: 'rows carrying at least one governed record',
    source: 'COHORT_GUARANTEED',
    minimumOpportunities: 40, preferredOpportunities: 48,
    suppliedBy: 'GOVERNED_RECORD_SUPPLIED',
    note: 'The binding constraint on cohort SIZE. 2/0.05 = 40 rows must supply a governed record.',
  },
  {
    measureId: 'M07_GOVERNED_RECORD_GROUNDING',
    denominatorUnit: 'detected regulatory statements',
    source: 'MODEL_OUTPUT_DEPENDENT',
    minimumOpportunities: 40, preferredOpportunities: 60,
    suppliedBy: 'GOVERNED_RECORD_SUPPLIED',
    note: 'Cannot be guaranteed: a model that never invokes regulation produces no statements. The '
      + 'cohort maximises the opportunity by supplying records widely; if the count still falls '
      + 'short, the measure is coarser or UNMEASURED, and either fact must be reported.',
  },
  {
    measureId: 'M08_GOVERNED_PROVENANCE_INTEGRITY',
    denominatorUnit: 'merged rows (a zero-count gate)',
    source: 'COHORT_GUARANTEED',
    minimumOpportunities: 20, preferredOpportunities: 60,
    suppliedBy: 'ALL_ROWS',
    note: 'Rows carrying an UNAPPROVED record are where an approval flip could occur, so the '
      + 'DISAGREEMENT_OPPORTUNITY class is what actually exercises this.',
  },
  {
    measureId: 'M09_CLARIFICATION_QUALITY',
    denominatorUnit: 'clarifications emitted',
    source: 'MODEL_OUTPUT_DEPENDENT',
    minimumOpportunities: 7, preferredOpportunities: 20,
    suppliedBy: 'CLARIFICATION_OWED',
    note: '2/(1-0.70) = 7. The cohort supplies rows that genuinely owe a question; a silent model '
      + 'produces a zero denominator and the gate fails UNMEASURED, which is the correct outcome '
      + 'for a layer whose product requirement is to ask.',
  },
  {
    measureId: 'M10_UNNECESSARY_QUESTION_RATE',
    denominatorUnit: 'rows owing NO clarification',
    source: 'COHORT_GUARANTEED',
    minimumOpportunities: 14, preferredOpportunities: 20,
    suppliedBy: 'CLARIFICATION_NOT_OWED',
    note: '2/0.15 = 14. These rows are the negative control for asking and must be deliberately '
      + 'authored -- a row is zero-owed only when every decision-critical fact is actually stated.',
  },
  {
    measureId: 'M11_CROSS_HAZARD_REASONING',
    denominatorUnit: 'recorded interactions',
    source: 'COHORT_GUARANTEED',
    minimumOpportunities: 10, preferredOpportunities: 15,
    suppliedBy: 'CROSS_HAZARD_INTERACTION',
    note: 'REPORTED. Ten so a new capability is not characterised from a handful of rows.',
  },
  {
    measureId: 'M12_INTERNAL_INCOHERENCE',
    denominatorUnit: 'rows with a PRESENT layer',
    source: 'COHORT_GUARANTEED',
    minimumOpportunities: 20, preferredOpportunities: 60,
    suppliedBy: 'ALL_ROWS',
    note: '2/0.10 = 20.',
  },
  {
    measureId: 'M13_PROVIDER_CALLABILITY',
    denominatorUnit: 'attempted calls',
    source: 'RUN_TOPOLOGY',
    minimumOpportunities: 100, preferredOpportunities: 180,
    suppliedBy: 'ALL_CALLS',
    note: '2/(1-0.98) = 100 calls. Satisfied by the three-arm topology at any admissible row count.',
  },
  {
    measureId: 'M14_ORDER_SENSITIVITY',
    denominatorUnit: 'rows paired base/permuted',
    source: 'COHORT_GUARANTEED',
    minimumOpportunities: 40, preferredOpportunities: 60,
    suppliedBy: 'PAIRED_ROWS',
    note: '2/0.05 = 40. Every row is paired, so this is a second constraint on cohort SIZE and it '
      + 'agrees with M06\'s.',
  },
  {
    measureId: 'M15_LATENCY_P95',
    denominatorUnit: 'calls returning a payload',
    source: 'RUN_TOPOLOGY',
    minimumOpportunities: 20, preferredOpportunities: 180,
    suppliedBy: 'ALL_CALLS',
    note: 'REPORTED. A p95 over fewer than twenty samples is the maximum wearing a percentile\'s name.',
  },
  {
    measureId: 'M16_COST_PER_ROW',
    denominatorUnit: 'rows attempted',
    source: 'RUN_TOPOLOGY',
    minimumOpportunities: 20, preferredOpportunities: 60,
    suppliedBy: 'ALL_ROWS',
    note: 'REPORTED, and reported per run rather than estimated.',
  },
  {
    measureId: 'M17_CROSS_PROCESS_REPRODUCIBILITY',
    denominatorUnit: 'rows paired across two processes',
    source: 'COHORT_GUARANTEED',
    minimumOpportunities: 20, preferredOpportunities: 60,
    suppliedBy: 'PAIRED_ROWS',
    note: 'REPORTED under an ABSENT determinism control. Twenty is enough to characterise variation '
      + 'without pretending it is a gate.',
  },
];

// ---------------------------------------------------------------- the row counts

/**
 * Derived from the requirements above, not chosen.
 *
 *   40  rows must supply a governed record            (M06, the binding constraint)
 *  + 8  rows must supply NO governed record           (the NO_GOVERNED_RECORD class must exist)
 *  = 48
 *
 * and 48 >= 40 paired rows (M14), >= 20 rows (M03/M05/M08/M12), >= 14 zero-owed rows (M10).
 */
export const MINIMUM_DEFENSIBLE_ROWS = 48 as const;

/**
 * The preferred count adds margin where the minimum is exactly on a rule boundary, and lifts the
 * REPORTED measures out of the range where they characterise a capability from a handful of rows.
 */
export const PREFERRED_ROWS = 60 as const;

export const REQUIRED_CLASS_MINIMUMS: Readonly<Record<string, { minimum: number; preferred: number }>> = {
  GOVERNED_RECORD_SUPPLIED: { minimum: 40, preferred: 48 },
  NO_GOVERNED_RECORD: { minimum: 8, preferred: 12 },
  CLARIFICATION_NOT_OWED: { minimum: 14, preferred: 20 },
  CLARIFICATION_OWED: { minimum: 20, preferred: 30 },
  FORBIDDEN_FAMILY_NEGATIVE_CONTROL: { minimum: 48, preferred: 60 },
  LIFE_CRITICAL_PRESENT: { minimum: 10, preferred: 15 },
  CROSS_HAZARD_INTERACTION: { minimum: 10, preferred: 15 },
  DETERMINISTIC_MISS_RECALL_OPPORTUNITY: { minimum: 10, preferred: 15 },
  MULTI_HAZARD: { minimum: 12, preferred: 20 },
  NEGATED_OR_SAFE_STATE: { minimum: 10, preferred: 15 },
  DISAGREEMENT_OPPORTUNITY: { minimum: 6, preferred: 10 },
  DETERMINISTIC_HAZARD_PRESENT: { minimum: 30, preferred: 40 },
};

export interface CompositionGap {
  caseClass: string;
  required: number;
  present: number;
  shortfall: number;
}

/**
 * Measure a candidate cohort against the requirements. `DETERMINISTIC_MISS_RECALL_OPPORTUNITY` and
 * `DETERMINISTIC_EXCLUSION_PROJECTED` are supplied by the caller because they depend on what the
 * engine actually does with each observation, which only a run can establish.
 */
export function evaluateComposition(
  rows: readonly FormalCohortRow[],
  engineDerivedCounts: Readonly<Record<string, number>> = {},
  level: 'minimum' | 'preferred' = 'minimum',
): { rowCount: number; rowCountSufficient: boolean; gaps: CompositionGap[] } {
  const counts: Record<string, number> = { ...engineDerivedCounts };
  for (const row of rows) {
    for (const c of classifyRow(row)) counts[c] = (counts[c] ?? 0) + 1;
  }
  const gaps: CompositionGap[] = [];
  for (const [caseClass, req] of Object.entries(REQUIRED_CLASS_MINIMUMS)) {
    const required = level === 'minimum' ? req.minimum : req.preferred;
    const present = counts[caseClass] ?? 0;
    if (present < required) gaps.push({ caseClass, required, present, shortfall: required - present });
  }
  const target = level === 'minimum' ? MINIMUM_DEFENSIBLE_ROWS : PREFERRED_ROWS;
  return { rowCount: rows.length, rowCountSufficient: rows.length >= target, gaps };
}

// ---------------------------------------------------------------- call and cost topology

/**
 * The per-call cost model, FITTED FROM THE ACTUAL §118 RUN rather than quoted from a price list.
 *
 * Eighteen recorded calls in `verification/expert-hazlenz-hosted-projection-ab-2026-08-31/transport/
 * projection-ab.jsonl` carry input tokens, output tokens and billed cost. A two-parameter least
 * squares fit over them reproduces every recorded cost to a residual of 0.00000000 USD, which is
 * strong enough to use for projection.
 */
export const MEASURED_COST_MODEL = {
  source: 'verification/expert-hazlenz-hosted-projection-ab-2026-08-31 (18 calls, exact fit)',
  inputUsdPerMillionTokens: 2.0,
  outputUsdPerMillionTokens: 10.0,
  observedMeanInputTokens: 9481,
  observedMeanOutputTokens: 1279,
  observedMeanCostUsd: 0.031757,
  observedMaxCostUsd: 0.039616,
  observedP95LatencyMs: 18942,
  maxOutputTokensConfigured: 8000,
} as const;

export function projectedCostUsd(inputTokens: number, outputTokens: number): number {
  return inputTokens * MEASURED_COST_MODEL.inputUsdPerMillionTokens / 1e6
    + outputTokens * MEASURED_COST_MODEL.outputUsdPerMillionTokens / 1e6;
}

/**
 * The recommended topology. THREE calls per row and no more, each one earning its place:
 *
 *   BASE           the one canonical call. Every content measure reads it and only it.
 *   PERMUTED       the same row with findings, records and vocabulary reversed. M14 needs it.
 *   CROSS_PROCESS  the same input in a second OS process. M17 needs it.
 *
 * No repetition beyond that. A repeat count would be a variance study, which no measure asks for,
 * and n=3 per arm is what §118 already showed is affordable but is not what these measures need.
 */
export const RECOMMENDED_CALL_TOPOLOGY = {
  callsPerRow: 3,
  arms: ['BASE', 'PERMUTED', 'CROSS_PROCESS'] as const,
  repetitionsPerArm: 1,
  minimum: {
    rows: MINIMUM_DEFENSIBLE_ROWS,
    plannedCalls: MINIMUM_DEFENSIBLE_ROWS * 3,
    expectedSpendUsd: MINIMUM_DEFENSIBLE_ROWS * 3 * MEASURED_COST_MODEL.observedMeanCostUsd,
  },
  preferred: {
    rows: PREFERRED_ROWS,
    plannedCalls: PREFERRED_ROWS * 3,
    expectedSpendUsd: PREFERRED_ROWS * 3 * MEASURED_COST_MODEL.observedMeanCostUsd,
  },
  /**
   * Above the preferred plan, so a run is never stopped by a ceiling it was designed to reach, and
   * close enough that a runaway is caught. `runExpertAnalysis` retries ONCE on a retryable failure,
   * and that retry BILLS, so the ceiling covers a full retry on every planned call plus margin.
   */
  hardCallCeiling: 200,
  /**
   * Conservative maximum, computed rather than guessed: every one of the 200 calls at a larger
   * prompt than any observed (12,000 input tokens) AND the full configured output cap (8,000
   * tokens), plus a 10% retry-billing allowance, rounded up.
   */
  conservativeMaximumSpendUsd: 25.0,
  stopConditions: [
    'attempted calls would exceed hardCallCeiling -- checked BEFORE each call',
    'incurred spend has reached the spend ceiling -- checked BEFORE each call',
    'a cohort row fails freeze-time validation -- the run stops before any request is built',
    'the responding model identity differs from the qualified one -- the runner refuses the '
      + 'response rather than scoring it, and the run is invalidated rather than reinterpreted',
  ],
} as const;

/** The conservative figure, recomputed from the model so it cannot silently drift from its basis. */
export function conservativeMaximumSpendUsd(callCeiling: number): number {
  const worstPerCall = projectedCostUsd(12000, MEASURED_COST_MODEL.maxOutputTokensConfigured);
  return Math.ceil(callCeiling * worstPerCall * 1.1);
}
