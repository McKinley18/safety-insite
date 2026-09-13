/**
 * EXPERT HAZLENZ -- the formal cohort row contract. §121.
 *
 * A cohort row is TWO things that must never touch: the SOURCE STATE, which is allowed to reach the
 * model, and the TRUTH KEY, which must never reach it. This file makes that a structural property
 * rather than a discipline: they are separate objects, the canonical input constructor's parameter
 * type cannot express the truth key, and `collectTruthKeyStrings()` exists so a test can prove no
 * truth string appears anywhere in a built request.
 *
 * ==================== WHY THE TRUTH KEY IS AUTHORED, NOT DERIVED ====================
 *
 * Seven of the seventeen measures need a denominator that only the corpus can supply: which hazards
 * are genuinely present, which are forbidden, which rows owe a clarification, which interactions are
 * real. §120 recorded that none of this existed. It is authored HERE, before any reserved material
 * is opened and before any formal model output exists, which is the only ordering under which an
 * answer key is an answer key rather than a rationalisation.
 *
 * The shape deliberately mirrors the frozen `hazlenz-decomposition-precision-corpus.ts`, which
 * already splits `requiredDomains` / `forbiddenDomains` / `allowedDomains` and already carries
 * `lifeCritical` as a CORPUS label. That corpus is the system's existing authority for both ideas,
 * so this is a reuse of an accepted pattern rather than a new theory of truth.
 *
 * ==================== THE TOTALITY RULE, AND WHY IT IS A FREEZE-TIME CHECK ====================
 *
 * `presentHazardFamilies`, `defensibleHazardFamilies` and `forbiddenHazardFamilies` must PARTITION
 * `allowedHazardFamilies` exactly -- disjoint, and covering. That is what makes M02 a mechanical
 * measure instead of a judgement: every candidate a model can legally emit lands in exactly one
 * bucket. A row that fails to partition is an INVALID ROW, caught by `validateCohortRow()` before a
 * single call is made, rather than a decision someone has to improvise while scoring.
 */

import type { GovernedStandardView } from './expert-contract.types';
import { EXPERT_AFFECTED_DECISIONS, EXPERT_INTERACTION_KINDS } from './expert-contract.types';

export const FORMAL_COHORT_ROW_CONTRACT_VERSION = 'hazlenz.expert.cohort.row.v1' as const;

// ---------------------------------------------------------------- source state (model-visible)

/**
 * Everything about a row that the model is allowed to see. This is the ONLY part the canonical
 * constructor reads, and every field of it has a production counterpart -- there is deliberately no
 * field here that a real inspection could not also supply.
 */
export interface FormalCohortSourceState {
  rowId: string;
  /** The observation text, exactly as an inspector would have written it. */
  observation: string;
  inspectionContext: { location: string | null; task: string | null };
  jurisdiction: string;
  /** The closed vocabulary for this row. The truth key must partition exactly this set. */
  allowedHazardFamilies: string[];
  /** Governed records the system chose to supply. Empty is legal and is its own case class. */
  governedStandards: GovernedStandardView[];
  /** Answers already collected, if the row models a workflow that had some. */
  answeredClarifications: Array<{ clarificationId: string; answer: string }>;
  /**
   * Additional supplied context, if any. Same three source types the evidence contract allows, so
   * an exact quote can bind against them the same way it binds against the observation.
   */
  supplementaryContext: Array<{
    sourceId: string;
    sourceType: 'inspection_context' | 'clarification_answer';
    text: string;
  }>;
}

// ---------------------------------------------------------------- truth key (never model-visible)

/** One decision-critical fact the row genuinely lacks. M09's target and M10's denominator. */
export interface DecisionCriticalGap {
  gapId: string;
  /** What is missing, as a fact rather than as a question -- the same discipline the contract asks of Expert. */
  description: string;
  affectedDecision: (typeof EXPERT_AFFECTED_DECISIONS)[number];
}

/** One genuine interaction the row contains. M11's denominator. */
export interface RecordedInteraction {
  interactionKind: (typeof EXPERT_INTERACTION_KINDS)[number];
  /** Hazard families that participate. At least two, by the same rule the output contract enforces. */
  participants: string[];
}

export interface FormalCohortTruth {
  /**
   * Families genuinely present in this observation. A qualified reviewer would confirm each one.
   * M01's source of "what was there"; M02's TRUE bucket.
   */
  presentHazardFamilies: string[];
  /**
   * Families a qualified reviewer would find defensible but would not require. Counted in M02's
   * denominator and never in its numerator -- this is the plan's "advisory noise" allowance made
   * explicit rather than argued case by case.
   */
  defensibleHazardFamilies: string[];
  /**
   * Families that must NOT be raised: the incidental, negated, historical or plainly absent. M02's
   * numerator. Directly analogous to Population A's `forbiddenDomains`.
   */
  forbiddenHazardFamilies: string[];
  /**
   * The subset of families this row describes in a negated or verified-safe state. Reported as a
   * SEPARATE count because the plan's M02 method says "negated/safe-state rows counted separately".
   */
  negatedOrSafeStateFamilies: string[];
  /**
   * Families whose omission would be life-critical. A CORPUS label, exactly as Population B carries
   * `lifeCritical` per group, because no engine in this system emits life-criticality.
   *
   * IMPORTANT: this reaches the MERGE input, which the model never sees. It must never reach the
   * Expert input -- `buildExpertAnalysisInput` has no parameter that could carry it.
   */
  lifeCriticalHazardFamilies: string[];
  /**
   * The decision-critical facts genuinely missing. EMPTY means the row owes NO clarification, which
   * is M10's denominator and is a deliberate case class rather than an absence of data.
   */
  decisionCriticalGaps: DecisionCriticalGap[];
  /** Genuine cross-hazard interactions. Empty is normal and is not an opportunity for M11. */
  recordedInteractions: RecordedInteraction[];
  /** Why this row was authored the way it was. Not scored; it is what makes the key reviewable. */
  authoringRationale: string;
}

export interface FormalCohortRow {
  contractVersion: typeof FORMAL_COHORT_ROW_CONTRACT_VERSION;
  source: FormalCohortSourceState;
  truth: FormalCohortTruth;
}

// ---------------------------------------------------------------- case classes

/**
 * The composition dimensions a cohort must cover. Derived from what the seventeen measures need as
 * denominators -- not from a general taxonomy of safety scenarios, and not from any observed model
 * behaviour.
 */
export const COHORT_CASE_CLASSES = [
  'DETERMINISTIC_HAZARD_PRESENT',
  'DETERMINISTIC_MISS_RECALL_OPPORTUNITY',
  'NEGATED_OR_SAFE_STATE',
  'MULTI_HAZARD',
  'CROSS_HAZARD_INTERACTION',
  'GOVERNED_RECORD_SUPPLIED',
  'NO_GOVERNED_RECORD',
  'CLARIFICATION_OWED',
  'CLARIFICATION_NOT_OWED',
  'FORBIDDEN_FAMILY_NEGATIVE_CONTROL',
  'LIFE_CRITICAL_PRESENT',
  'DISAGREEMENT_OPPORTUNITY',
  'DETERMINISTIC_EXCLUSION_PROJECTED',
] as const;
export type CohortCaseClass = (typeof COHORT_CASE_CLASSES)[number];

/**
 * Which classes a row belongs to, computed from the row rather than declared on it, so a label can
 * never disagree with the row it labels.
 *
 * `DETERMINISTIC_MISS_RECALL_OPPORTUNITY` and `DETERMINISTIC_EXCLUSION_PROJECTED` depend on what the
 * engine actually does with the observation and are therefore computed by the harness at freeze
 * time, not here.
 */
export function classifyRow(row: FormalCohortRow): CohortCaseClass[] {
  const t = row.truth;
  const classes: CohortCaseClass[] = [];
  if (t.presentHazardFamilies.length > 0) classes.push('DETERMINISTIC_HAZARD_PRESENT');
  if (t.negatedOrSafeStateFamilies.length > 0) classes.push('NEGATED_OR_SAFE_STATE');
  if (t.presentHazardFamilies.length >= 2) classes.push('MULTI_HAZARD');
  if (t.recordedInteractions.length > 0) classes.push('CROSS_HAZARD_INTERACTION');
  if (row.source.governedStandards.length > 0) classes.push('GOVERNED_RECORD_SUPPLIED');
  else classes.push('NO_GOVERNED_RECORD');
  if (t.decisionCriticalGaps.length > 0) classes.push('CLARIFICATION_OWED');
  else classes.push('CLARIFICATION_NOT_OWED');
  if (t.forbiddenHazardFamilies.length > 0) classes.push('FORBIDDEN_FAMILY_NEGATIVE_CONTROL');
  if (t.lifeCriticalHazardFamilies.length > 0) classes.push('LIFE_CRITICAL_PRESENT');
  if (row.source.governedStandards.some(g => g.backingState !== 'APPROVED')) {
    classes.push('DISAGREEMENT_OPPORTUNITY');
  }
  return classes;
}

// ---------------------------------------------------------------- validity

export interface CohortRowProblem {
  rowId: string;
  code: string;
  detail: string;
}

/**
 * Prove a row can be scored before it is ever run. Every problem here is a defect in the ROW, and
 * none of them may be resolved by relaxing a measure.
 */
export function validateCohortRow(row: FormalCohortRow): CohortRowProblem[] {
  const p: CohortRowProblem[] = [];
  const id = row.source.rowId;
  const push = (code: string, detail: string) => p.push({ rowId: id, code, detail });

  if (row.contractVersion !== FORMAL_COHORT_ROW_CONTRACT_VERSION) {
    push('CONTRACT_VERSION_MISMATCH', String(row.contractVersion));
  }
  if (!id || id.trim().length === 0) push('ROW_ID_MISSING', 'a row must be addressable');
  if (!row.source.observation || row.source.observation.trim().length === 0) {
    push('OBSERVATION_EMPTY', 'there is nothing to reason about');
  }

  const allowed = row.source.allowedHazardFamilies;
  if (allowed.length === 0) push('ALLOWED_FAMILIES_EMPTY', 'no candidate could ever be legal');
  if (new Set(allowed).size !== allowed.length) push('ALLOWED_FAMILIES_DUPLICATED', allowed.join(','));

  const t = row.truth;
  const buckets: Array<[string, string[]]> = [
    ['present', t.presentHazardFamilies],
    ['defensible', t.defensibleHazardFamilies],
    ['forbidden', t.forbiddenHazardFamilies],
  ];

  // THE TOTALITY RULE. Disjoint and covering, both directions checked.
  const seen = new Map<string, string>();
  for (const [name, families] of buckets) {
    for (const f of families) {
      const prior = seen.get(f);
      if (prior) push('TRUTH_BUCKETS_OVERLAP', `${f} is both ${prior} and ${name}`);
      else seen.set(f, name);
      if (!allowed.includes(f)) {
        push('TRUTH_FAMILY_OUTSIDE_VOCABULARY', `${f} (${name}) is not in allowedHazardFamilies`);
      }
    }
  }
  for (const f of allowed) {
    if (!seen.has(f)) push('TRUTH_BUCKETS_INCOMPLETE', `${f} is in the vocabulary but in no bucket`);
  }

  for (const f of t.negatedOrSafeStateFamilies) {
    if (!allowed.includes(f)) {
      push('NEGATED_FAMILY_OUTSIDE_VOCABULARY', `${f} is not in allowedHazardFamilies`);
    }
  }
  for (const f of t.lifeCriticalHazardFamilies) {
    if (!t.presentHazardFamilies.includes(f)) {
      push('LIFE_CRITICAL_NOT_PRESENT', `${f} is marked life-critical but is not present`);
    }
  }

  const gapIds = new Set<string>();
  for (const g of t.decisionCriticalGaps) {
    if (gapIds.has(g.gapId)) push('DUPLICATE_GAP_ID', g.gapId);
    gapIds.add(g.gapId);
    if (!g.description || g.description.trim().length === 0) push('GAP_DESCRIPTION_EMPTY', g.gapId);
    if (!(EXPERT_AFFECTED_DECISIONS as readonly string[]).includes(g.affectedDecision)) {
      push('GAP_AFFECTED_DECISION_INVALID', `${g.gapId}: ${g.affectedDecision}`);
    }
  }

  for (const i of t.recordedInteractions) {
    if (!(EXPERT_INTERACTION_KINDS as readonly string[]).includes(i.interactionKind)) {
      push('INTERACTION_KIND_INVALID', i.interactionKind);
    }
    if (i.participants.length < 2) {
      push('INTERACTION_PARTICIPANTS_INSUFFICIENT', `${i.interactionKind}: ${i.participants.length}`);
    }
    for (const part of i.participants) {
      if (!t.presentHazardFamilies.includes(part)) {
        push('INTERACTION_PARTICIPANT_NOT_PRESENT',
          `${i.interactionKind}: ${part} is not a present family`);
      }
    }
  }

  if (!t.authoringRationale || t.authoringRationale.trim().length === 0) {
    push('AUTHORING_RATIONALE_MISSING', 'a key with no stated reasoning cannot be reviewed');
  }

  const sourceIds = new Set<string>();
  for (const c of row.source.supplementaryContext) {
    if (sourceIds.has(c.sourceId)) push('DUPLICATE_SOURCE_ID', c.sourceId);
    sourceIds.add(c.sourceId);
  }

  return p;
}

/**
 * Every string the truth key contains, so a test can prove none of them reached the model.
 *
 * This is the anti-leak instrument. It returns FAMILY NAMES too, which is deliberate: a family name
 * legitimately appears in the model-visible `allowedHazardFamilies`, so the leak test must compare
 * against the truth-ONLY strings, which `truthOnlyStrings()` computes.
 */
export function collectTruthKeyStrings(row: FormalCohortRow): string[] {
  const t = row.truth;
  return [
    ...t.presentHazardFamilies, ...t.defensibleHazardFamilies, ...t.forbiddenHazardFamilies,
    ...t.negatedOrSafeStateFamilies, ...t.lifeCriticalHazardFamilies,
    ...t.decisionCriticalGaps.flatMap(g => [g.gapId, g.description, g.affectedDecision]),
    ...t.recordedInteractions.flatMap(i => [i.interactionKind, ...i.participants]),
    t.authoringRationale,
  ];
}

/**
 * Truth strings that have NO legitimate reason to appear in the model's input.
 *
 * Family names and `affectedDecision` values are excluded because both are members of vocabularies
 * the input legitimately carries. Gap ids, gap descriptions, interaction kinds and the authoring
 * rationale are not: if any of those appears in a built request, the key has leaked.
 */
export function truthOnlyStrings(row: FormalCohortRow): string[] {
  const t = row.truth;
  return [
    ...t.decisionCriticalGaps.flatMap(g => [g.gapId, g.description]),
    ...t.recordedInteractions.map(i => i.interactionKind),
    t.authoringRationale,
  ].filter(s => typeof s === 'string' && s.trim().length > 0);
}
