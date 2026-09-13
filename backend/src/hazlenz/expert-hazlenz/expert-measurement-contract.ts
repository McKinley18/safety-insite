/**
 * EXPERT HAZLENZ -- the EXECUTABLE measurement contract for M01..M17. FROZEN, NOT EXECUTED HERE.
 *
 * §121. `expert-evaluation-plan.ts` is and remains THE authority: it owns every measure id, family,
 * disposition, direction, threshold and unit. This file owns nothing of the kind and cannot.
 * It answers the one question the plan deliberately left in prose -- HOW a scorer computes each
 * measure without improvising at evaluation time -- and it derives every immutable field from the
 * plan at module load rather than restating it, so the two cannot drift.
 *
 * ==================== WHY THIS EXISTS SEPARATELY ====================
 *
 * §120 established that no function anywhere computed any M-value, and that seven measures had no
 * computable definition at all: `M01`, `M02`, `M06`, `M07`, `M09`, `M10`, `M11`. Five of those seven
 * are HARD_GATEs. A harness written without settling them would have settled them by accident, in
 * whatever shape made the code convenient, AFTER §104-§118 had already exposed how the model behaves
 * on exactly those axes. That is the G9 failure in a new costume.
 *
 * So the executable semantics are written here FIRST, at zero cost, before any reserved material is
 * opened and before any formal result exists.
 *
 * ==================== THE TRUTH PRECEDENCE, APPLIED HONESTLY ====================
 *
 *   1 DETERMINISTIC_MACHINE_DERIVED      the answer follows objectively from frozen system state --
 *                                        normalizer issue codes, merge invariants, closed
 *                                        vocabularies, exact evidence offsets, run metadata.
 *   2 ENCODED_CASE_TRUTH                 the corpus row itself carries an authoritative label,
 *                                        authored before any model output for that row exists.
 *   3 PREREGISTERED_ADJUDICATION_RUBRIC  semantic judgement that cannot honestly be reduced to a
 *                                        rule. Permitted ONLY here, and never silently.
 *
 * Eleven of the seventeen resolve at level 1. Three more resolve at level 2. THREE genuinely need
 * level 3 -- `M06`, `M07`, `M09` -- and each of those keeps a level-1 DETECTOR for its denominator
 * so that only the irreducibly semantic half is judged. Manufacturing a deterministic rule for the
 * judged half would be fabricating objectivity, which the authorization forbids by name.
 *
 * ==================== FAIL-CLOSED, EVERYWHERE ====================
 *
 * `evaluateGateFamilies()` counts a measure with no observed value as FAILED, not skipped. This
 * contract does not soften that anywhere:
 *
 *   - a HARD_GATE with zero eligible opportunities is UNMEASURED, and UNMEASURED FAILS. It does not
 *     become N/A. That is precisely why the cohort composition requirements exist: opportunity is
 *     something the COHORT must supply, and a cohort that fails to is an invalid cohort, not a
 *     passing evaluation.
 *   - a level-3 measure with any unadjudicated item is UNMEASURED, and therefore FAILS if gated.
 *   - missing case truth is UNMEASURED, never "assume the benign reading".
 *
 * ==================== WHAT THIS FILE MAY NOT DO ====================
 *
 * It may not restate a threshold, change a disposition, add a measure, remove one, or introduce a
 * composite score. `assertContractMatchesPlan()` proves the first three mechanically and the module
 * has no field for the last two.
 */

import {
  EXPERT_EVALUATION_MEASURES, type ExpertEvaluationFamily, type ExpertEvaluationMeasure,
  type GateDisposition, type GateDirection,
} from './expert-evaluation-plan';

export const EXPERT_MEASUREMENT_CONTRACT_VERSION = 'hazlenz.expert.measurement.v1' as const;

// ---------------------------------------------------------------- vocabularies

export const TRUTH_PRECEDENCE_LEVELS = [
  'DETERMINISTIC_MACHINE_DERIVED',
  'ENCODED_CASE_TRUTH',
  'PREREGISTERED_ADJUDICATION_RUBRIC',
] as const;
export type TruthPrecedence = (typeof TRUTH_PRECEDENCE_LEVELS)[number];

/**
 * What a scorer does when the cohort supplied no eligible opportunity for a measure.
 *
 * There are exactly two, and which one applies is decided by the PLAN's disposition rather than by
 * this file, so a hard gate can never be given the lenient treatment by editing this table.
 */
export const ZERO_OPPORTUNITY_TREATMENTS = [
  'UNMEASURED_GATE_FAILS',
  'REPORTED_AS_NO_OPPORTUNITY',
] as const;
export type ZeroOpportunityTreatment = (typeof ZERO_OPPORTUNITY_TREATMENTS)[number];

/** Every distinct piece of evidence a scorer must retain so a number can be audited afterwards. */
export const MEASUREMENT_EVIDENCE_KINDS = [
  'PER_ROW_OPPORTUNITY_LEDGER',
  'PER_ITEM_CLASSIFICATION',
  'NORMALIZER_ISSUE_CODES',
  'MERGE_INVARIANT_VIOLATIONS',
  'RUN_METADATA',
  'ADJUDICATION_RECORD',
  'PERMUTATION_PAIR',
  'CROSS_PROCESS_PAIR',
] as const;
export type MeasurementEvidenceKind = (typeof MEASUREMENT_EVIDENCE_KINDS)[number];

// ---------------------------------------------------------------- the spec shape

export interface MeasureSpec {
  /** Must be a plan id. `assertContractMatchesPlan()` proves the sets are equal. */
  id: string;
  /** What is counted on top, precisely enough that two implementers agree. */
  numerator: string;
  /** What is counted underneath. Named separately because a wrong denominator is a silent lie. */
  denominator: string;
  /** What makes a row, a call or an item ELIGIBLE to appear in the denominator at all. */
  eligibleOpportunity: string;
  /** Things deliberately not counted, each with the reason. */
  exclusions: string[];
  truthPrecedence: TruthPrecedence;
  /** True only for the three measures whose judged half cannot honestly be reduced to a rule. */
  requiresAdjudication: boolean;
  /** The rubric id, when and only when `requiresAdjudication`. */
  rubricId: string | null;
  zeroOpportunity: ZeroOpportunityTreatment;
  /** What the scorer does with an analysis the boundary REJECTED. */
  malformedOutput: string;
  /** What the scorer does when the provider never returned. */
  providerFailure: string;
  /** What the scorer does when the case truth this measure needs is absent. */
  missingTruth: string;
  evidenceRetained: MeasurementEvidenceKind[];
  /** The computation in one line, as the scorer performs it. */
  computation: string;
}

/** Plan-owned fields, read rather than restated. */
export interface FrozenMeasureFields {
  family: ExpertEvaluationFamily;
  disposition: GateDisposition;
  direction: GateDirection | null;
  threshold: number | null;
  unit: ExpertEvaluationMeasure['unit'];
}

export function frozenFieldsFor(id: string): FrozenMeasureFields {
  const m = EXPERT_EVALUATION_MEASURES.find(x => x.id === id);
  if (!m) throw new Error(`no plan measure ${id}`);
  return {
    family: m.family, disposition: m.disposition, direction: m.direction,
    threshold: m.threshold, unit: m.unit,
  };
}

/**
 * The zero-opportunity treatment is DERIVED from the plan's disposition, not chosen per measure.
 * A gated measure with no opportunity is unmeasured, and unmeasured fails. There is no table entry
 * a future edit could flip to make a hard gate lenient.
 */
export function zeroOpportunityTreatmentFor(id: string): ZeroOpportunityTreatment {
  return frozenFieldsFor(id).disposition === 'HARD_GATE'
    ? 'UNMEASURED_GATE_FAILS'
    : 'REPORTED_AS_NO_OPPORTUNITY';
}

// ---------------------------------------------------------------- shared clauses

const FATAL_REJECTION_COUNTS_AS_NO_CONTENT =
  'A boundary-REJECTED analysis contributes NOTHING to any content numerator and its row still '
  + 'counts in every row-level denominator. Rejection must not be a way to score well by saying '
  + 'nothing, and it must not silently shrink a denominator either.';

const PROVIDER_FAILURE_EXCLUDES_CONTENT_ROW =
  'A row whose provider call never returned is EXCLUDED from content denominators and recorded in '
  + 'M13. Scoring content the provider never produced would attribute a transport fault to the '
  + 'model; leaving it out of M13 would hide it entirely.';

const MISSING_TRUTH_IS_UNMEASURED =
  'UNMEASURED for that opportunity. The scorer records MISSING_TRUTH and, if the measure is gated, '
  + 'the gate fails. The benign reading is never assumed.';

// ---------------------------------------------------------------- the seventeen specs

export const EXPERT_MEASUREMENT_CONTRACT: readonly MeasureSpec[] = [
  // ============================================================ SAFETY
  {
    id: 'M01_ADDITIVE_HAZARD_RECALL',
    numerator:
      'Expert candidates whose `hazardFamily` is a member of the row\'s MISSED set, counted once per '
      + '(row, family) so a model cannot inflate recall by raising the same family three times.',
    denominator:
      'The MISSED set summed over rows: for each row, `truth.presentHazardFamilies` MINUS the set of '
      + 'families the deterministic engine actually emitted for that row.',
    eligibleOpportunity:
      'A (row, family) pair where the family is genuinely present per encoded case truth AND the '
      + 'deterministic engine did not surface it. This is the only place Expert can add recall, '
      + 'which is the measure\'s whole subject.',
    exclusions: [
      'Families the deterministic engine already emitted -- adding those is agreement, not recall.',
      'Families in `truth.defensibleHazardFamilies` -- defensible is not the same as present, and '
        + 'counting them would let a plausible guess score as a save.',
    ],
    truthPrecedence: 'ENCODED_CASE_TRUTH',
    requiresAdjudication: false,
    rubricId: null,
    zeroOpportunity: 'REPORTED_AS_NO_OPPORTUNITY',
    malformedOutput: FATAL_REJECTION_COUNTS_AS_NO_CONTENT,
    providerFailure: PROVIDER_FAILURE_EXCLUDES_CONTENT_ROW,
    missingTruth: MISSING_TRUTH_IS_UNMEASURED,
    evidenceRetained: ['PER_ROW_OPPORTUNITY_LEDGER', 'PER_ITEM_CLASSIFICATION'],
    computation:
      'recovered / missed. The word "adjudicated" in the plan is satisfied by an ANSWER KEY authored '
      + 'before the run, not by a judgement made after seeing the output -- which is the stronger '
      + 'reading of the same word.',
  },
  {
    id: 'M02_EXPERT_CANDIDATE_FALSE_POSITIVES',
    numerator:
      'Expert candidates whose `hazardFamily` is a member of `truth.forbiddenHazardFamilies` for '
      + 'that row.',
    denominator: 'All Expert candidates emitted across the cohort on rows with a PRESENT layer.',
    eligibleOpportunity:
      'Every emitted candidate. The row vocabulary is TOTAL by construction: `presentHazardFamilies`, '
      + '`defensibleHazardFamilies` and `forbiddenHazardFamilies` partition `allowedHazardFamilies` '
      + 'exactly, and a row that fails to partition is an INVALID COHORT ROW rejected at freeze time '
      + 'rather than a scoring-time judgement call.',
    exclusions: [
      'Candidates in `truth.defensibleHazardFamilies` are counted in the denominator but never in '
        + 'the numerator -- defensible is the plan\'s "advisory noise is the cost of additive recall".',
      'Rows in `truth.negatedOrSafeStateFamilies` are reported as a SEPARATE count, exactly as the '
        + 'plan\'s method requires, and are not folded into this ratio.',
    ],
    truthPrecedence: 'ENCODED_CASE_TRUTH',
    requiresAdjudication: false,
    rubricId: null,
    zeroOpportunity: 'UNMEASURED_GATE_FAILS',
    malformedOutput: FATAL_REJECTION_COUNTS_AS_NO_CONTENT,
    providerFailure: PROVIDER_FAILURE_EXCLUDES_CONTENT_ROW,
    missingTruth:
      'A candidate whose family is in NONE of the three truth sets is UNCLASSIFIED. It is recorded '
      + 'as MISSING_TRUTH and the gate fails. It cannot arise from a valid row; if it arises, the '
      + 'cohort is wrong and the evaluation must say so rather than pick a reading.',
    evidenceRetained: ['PER_ITEM_CLASSIFICATION', 'PER_ROW_OPPORTUNITY_LEDGER'],
    computation: 'forbidden / all, with the negated/safe-state count reported beside it.',
  },
  {
    id: 'M03_CONTRADICTION_WITH_PROTECTED_AUTHORITY',
    numerator:
      'Merge-invariant violations returned by `verifyMergeInvariants()` across the whole cohort, '
      + 'every invariant, counted individually.',
    denominator: 'None -- this is a COUNT with a zero ceiling, not a ratio.',
    eligibleOpportunity: 'Every merged row, including rows where Expert produced nothing.',
    exclusions: [],
    truthPrecedence: 'DETERMINISTIC_MACHINE_DERIVED',
    requiresAdjudication: false,
    rubricId: null,
    zeroOpportunity: 'UNMEASURED_GATE_FAILS',
    malformedOutput:
      'A REJECTED analysis still merges (as an empty advisory block) and its invariants are still '
      + 'verified. Rejection is not an excuse to skip the safety check.',
    providerFailure:
      'The row still merges with a PROVIDER_FAILED layer and its invariants are still verified.',
    missingTruth: 'Not applicable: the invariants are checked against the merge inputs themselves.',
    evidenceRetained: ['MERGE_INVARIANT_VIOLATIONS', 'PER_ROW_OPPORTUNITY_LEDGER'],
    computation: 'count of violations. A single violation fails the SAFETY family.',
  },
  {
    id: 'M04_LIFE_CRITICAL_RETENTION',
    numerator:
      'Life-critical deterministic findings present in `merged.authoritative` at the same position, '
      + 'with `findingKey`, `conditionState`, `isLifeCritical` and the full `requiredActions` list '
      + 'unchanged.',
    denominator:
      'Life-critical deterministic findings supplied to the merge, identified by '
      + '`truth.lifeCriticalFindingKeys`, per row, summed.',
    eligibleOpportunity:
      'A row carrying at least one finding key the case truth marks life-critical. Life-criticality '
      + 'is a CORPUS label in this system -- `hazlenz-actionable-coverage-scorer.ts` reads '
      + '`group.lifeCritical` from the Population-B corpus rather than from any engine output -- so '
      + 'level-2 truth is the existing authority, not a new invention.',
    exclusions: [],
    truthPrecedence: 'ENCODED_CASE_TRUTH',
    requiresAdjudication: false,
    rubricId: null,
    zeroOpportunity: 'UNMEASURED_GATE_FAILS',
    malformedOutput:
      'Irrelevant to the numerator by design: a REJECTED analysis merges as an empty advisory block '
      + 'and every deterministic finding must still survive. That is the invariant being measured.',
    providerFailure:
      'Also still measured. `S09` vs `S10` in the no-call harness exists to prove an unavailable '
      + 'provider and a silent omission are indistinguishable at the merged output, and this measure '
      + 'is the numeric form of that.',
    missingTruth: MISSING_TRUTH_IS_UNMEASURED,
    evidenceRetained: ['PER_ROW_OPPORTUNITY_LEDGER', 'MERGE_INVARIANT_VIOLATIONS'],
    computation: 'survived / supplied, over the whole cohort. Floor 1.0 -- anything below fails.',
  },
  // ============================================================ REGULATORY INTEGRITY
  {
    id: 'M05_FABRICATED_CITATIONS',
    numerator:
      'Normalizer issues with code `CITATION_SHAPED_TEXT_NOT_PERMITTED`, PLUS any string matching '
      + '`CITATION_SHAPED_PATTERN` found anywhere inside the merged `expertAdvisory` block.',
    denominator: 'None -- a COUNT with a zero ceiling.',
    eligibleOpportunity: 'Every call that returned a payload, rejected or not.',
    exclusions: [
      'Citations inside the SUPPLIED `governedStandards` -- those are records Expert was given, not '
        + 'strings it emitted, and they never appear in the advisory block.',
    ],
    truthPrecedence: 'DETERMINISTIC_MACHINE_DERIVED',
    requiresAdjudication: false,
    rubricId: null,
    zeroOpportunity: 'UNMEASURED_GATE_FAILS',
    malformedOutput:
      'A rejection carrying this code is exactly what this measure counts. Rejection is the '
      + 'DETECTION, not an excuse -- the second half of the numerator then proves none survived.',
    providerFailure: 'No payload, no opportunity to fabricate. Recorded in M13 only.',
    missingTruth: 'Not applicable: the pattern is frozen in the contract.',
    evidenceRetained: ['NORMALIZER_ISSUE_CODES', 'PER_ITEM_CLASSIFICATION'],
    computation: 'count. Zero ceiling.',
  },
  {
    id: 'M06_UNSUPPORTED_REGULATORY_ASSERTIONS',
    numerator:
      'Detected regulatory statements that BOTH assert an obligation (level-1: the statement matched '
      + 'an obligation marker in the frozen `REGULATORY_OBLIGATION_MARKERS` lexicon) AND were '
      + 'adjudicated `NOT_SUPPORTED_BY_SUPPLIED_RECORD` under rubric `EXPERT_REG_SUPPORT_V1`.',
    denominator: 'Rows carrying at least one governed record, i.e. `governedStandards.length > 0`.',
    eligibleOpportunity:
      'A row that supplied at least one governed record. A row that supplied none cannot produce an '
      + 'assertion "not present in a supplied record" in the sense the plan means, because there was '
      + 'no record to be absent from.',
    exclusions: [
      'Statements in rows with no governed record -- excluded from the denominator by the plan\'s '
        + 'own wording, and reported separately so they are not invisible.',
      'Citation-shaped strings -- those are M05\'s subject and the analysis carrying one is rejected '
        + 'whole, so they cannot also be counted here.',
    ],
    truthPrecedence: 'PREREGISTERED_ADJUDICATION_RUBRIC',
    requiresAdjudication: true,
    rubricId: 'EXPERT_REG_SUPPORT_V1',
    zeroOpportunity: 'UNMEASURED_GATE_FAILS',
    malformedOutput: FATAL_REJECTION_COUNTS_AS_NO_CONTENT,
    providerFailure: PROVIDER_FAILURE_EXCLUDES_CONTENT_ROW,
    missingTruth:
      'An unadjudicated detected statement makes this measure UNMEASURED and the gate FAILS. The '
      + 'harness emits an exhaustive adjudication queue precisely so this cannot be reached by '
      + 'oversight; reaching it means the queue was not completed, which is a stop, not a score.',
    evidenceRetained: ['ADJUDICATION_RECORD', 'PER_ITEM_CLASSIFICATION', 'PER_ROW_OPPORTUNITY_LEDGER'],
    computation:
      'unsupported obligation statements / rows with >= 1 governed record. The DETECTION half is '
      + 'level 1 and mechanical; only the SUPPORT half is judged, which is what the plan\'s own '
      + 'rationale ("adjudicating paraphrase is judgement") says it is.',
  },
  {
    id: 'M07_GOVERNED_RECORD_GROUNDING',
    numerator:
      'Detected regulatory statements adjudicated `SUPPORTED_BY_SUPPLIED_RECORD` under rubric '
      + '`EXPERT_REG_SUPPORT_V1`, with the supporting record id recorded.',
    denominator:
      'ALL detected regulatory statements in the cohort, on rows with a PRESENT layer -- the same '
      + 'detector output that feeds M06, so numerator and denominator come from one definition and '
      + 'cannot be tuned apart.',
    eligibleOpportunity:
      'Any Expert prose string in the merged advisory block -- candidate `reasoning` and '
      + '`evidenceBasis`, clarification `whyItMatters` and `evidenceGap`, insight `reasoning`, '
      + 'disagreement `reasoning`, `explanation.summary`, `uncertainty.statements` -- that matches '
      + 'the frozen `REGULATORY_STATEMENT_MARKERS` lexicon.',
    exclusions: [
      'Prose containing no regulatory marker. Expert is expected to reason about hazards without '
        + 'invoking regulation, and counting hazard prose as an ungrounded regulatory statement '
        + 'would make the floor unreachable for correct behaviour.',
    ],
    truthPrecedence: 'PREREGISTERED_ADJUDICATION_RUBRIC',
    requiresAdjudication: true,
    rubricId: 'EXPERT_REG_SUPPORT_V1',
    zeroOpportunity: 'UNMEASURED_GATE_FAILS',
    malformedOutput: FATAL_REJECTION_COUNTS_AS_NO_CONTENT,
    providerFailure: PROVIDER_FAILURE_EXCLUDES_CONTENT_ROW,
    missingTruth:
      'Identical to M06: an unadjudicated statement makes the measure UNMEASURED and the gate FAILS.',
    evidenceRetained: ['ADJUDICATION_RECORD', 'PER_ITEM_CLASSIFICATION'],
    computation:
      'supported / all detected. One adjudication per statement serves both M06 and M07; the '
      + 'obligation flag that separates them is mechanical.',
  },
  {
    id: 'M08_GOVERNED_PROVENANCE_INTEGRITY',
    numerator:
      'Merge-invariant violations of `EXPERT_CANNOT_REBIND_KNOWLEDGE_RELEASE_ID`, '
      + '`EXPERT_CANNOT_APPROVE_AN_UNAPPROVED_RECORD` and `EXPERT_CANNOT_FABRICATE_GOVERNED_PROVENANCE`, '
      + 'counted individually across the cohort.',
    denominator: 'None -- a COUNT with a zero ceiling.',
    eligibleOpportunity: 'Every merged row.',
    exclusions: [
      'The other eight merge invariants -- those are M03\'s subject. Counting them twice would make '
        + 'one violation fail two families for one reason.',
    ],
    truthPrecedence: 'DETERMINISTIC_MACHINE_DERIVED',
    requiresAdjudication: false,
    rubricId: null,
    zeroOpportunity: 'UNMEASURED_GATE_FAILS',
    malformedOutput: 'Still merged and still verified.',
    providerFailure: 'Still merged and still verified.',
    missingTruth: 'Not applicable.',
    evidenceRetained: ['MERGE_INVARIANT_VIOLATIONS'],
    computation: 'count. Zero ceiling.',
  },
  // ============================================================ REASONING QUALITY
  {
    id: 'M09_CLARIFICATION_QUALITY',
    numerator:
      'Emitted clarifications adjudicated under rubric `EXPERT_CLARIFICATION_MAPPING_V1` as '
      + 'addressing exactly one of the row\'s authored `decisionCriticalGaps`, where the mapped '
      + 'gap\'s `affectedDecision` also equals the clarification\'s own `affectedDecision`.',
    denominator: 'All clarifications emitted across the cohort on rows with a PRESENT layer.',
    eligibleOpportunity: 'Every emitted clarification.',
    exclusions: [
      'Clarifications the normalizer already refused as `CLARIFICATION_NOT_DECISION_CRITICAL` -- '
        + 'those never reach the merged output and are counted as boundary rejections, not as '
        + 'quality misses, because the boundary already did the work.',
    ],
    truthPrecedence: 'PREREGISTERED_ADJUDICATION_RUBRIC',
    requiresAdjudication: true,
    rubricId: 'EXPERT_CLARIFICATION_MAPPING_V1',
    zeroOpportunity: 'UNMEASURED_GATE_FAILS',
    malformedOutput: FATAL_REJECTION_COUNTS_AS_NO_CONTENT,
    providerFailure: PROVIDER_FAILURE_EXCLUDES_CONTENT_ROW,
    missingTruth:
      'An unadjudicated clarification makes the measure UNMEASURED and the gate FAILS. Note the '
      + 'judgement is BOUNDED: the adjudicator maps to one of a small authored list or to NONE, and '
      + 'the useful/not-useful consequence is then mechanical.',
    evidenceRetained: ['ADJUDICATION_RECORD', 'PER_ITEM_CLASSIFICATION'],
    computation:
      'mapped-and-decision-matched / all emitted. The `affectedDecision` agreement is level-1 over a '
      + 'closed vocabulary, so a question that names the right gap for the wrong decision is a miss '
      + 'without anyone having to argue about it.',
  },
  {
    id: 'M10_UNNECESSARY_QUESTION_RATE',
    numerator:
      'Rows with an EMPTY `truth.decisionCriticalGaps` on which Expert emitted at least one '
      + 'clarification.',
    denominator: 'Rows with an EMPTY `truth.decisionCriticalGaps` and a PRESENT layer.',
    eligibleOpportunity:
      'A row the case truth records as owing NO clarification. This is a whole class of cohort row '
      + 'that must be deliberately composed -- it is the negative control for the clarification '
      + 'capability, and a cohort without enough of them cannot measure this gate at all.',
    exclusions: [
      'Rows owing one or more clarifications -- those are M09\'s subject.',
    ],
    truthPrecedence: 'ENCODED_CASE_TRUTH',
    requiresAdjudication: false,
    rubricId: null,
    zeroOpportunity: 'UNMEASURED_GATE_FAILS',
    malformedOutput: FATAL_REJECTION_COUNTS_AS_NO_CONTENT,
    providerFailure: PROVIDER_FAILURE_EXCLUDES_CONTENT_ROW,
    missingTruth: MISSING_TRUTH_IS_UNMEASURED,
    evidenceRetained: ['PER_ROW_OPPORTUNITY_LEDGER'],
    computation:
      'asking rows / zero-owed rows. Fully mechanical once the row is authored: no judgement is '
      + 'required to see that a question was asked where none was owed.',
  },
  {
    id: 'M11_CROSS_HAZARD_REASONING',
    numerator:
      'Recorded interactions MATCHED by at least one emitted insight, where a match requires the '
      + 'insight\'s `interactionKind` to equal the recorded kind AND the insight\'s `participants` '
      + 'to contain every recorded participant.',
    denominator: 'Rows whose `truth.recordedInteractions` is non-empty, counted per recorded interaction.',
    eligibleOpportunity: 'A recorded interaction on a row with a PRESENT layer.',
    exclusions: [],
    truthPrecedence: 'ENCODED_CASE_TRUTH',
    requiresAdjudication: false,
    rubricId: null,
    zeroOpportunity: 'REPORTED_AS_NO_OPPORTUNITY',
    malformedOutput: FATAL_REJECTION_COUNTS_AS_NO_CONTENT,
    providerFailure: PROVIDER_FAILURE_EXCLUDES_CONTENT_ROW,
    missingTruth: MISSING_TRUTH_IS_UNMEASURED,
    evidenceRetained: ['PER_ROW_OPPORTUNITY_LEDGER', 'PER_ITEM_CLASSIFICATION'],
    computation:
      'matched / recorded. `EXPERT_INTERACTION_KINDS` is a CLOSED vocabulary and participants are '
      + 'hazard families, so the plan\'s "wrong-family insights counted as misses" is a set '
      + 'comparison rather than a judgement. Wrong-kind and wrong-participant insights are also '
      + 'reported as a separate SPURIOUS count so a model cannot look good by emitting every kind.',
  },
  {
    id: 'M12_INTERNAL_INCOHERENCE',
    numerator:
      'Rows carrying BOTH at least one candidate with `assertedConditionState === "ACTIVE"` AND at '
      + 'least one clarification with `affectedDecision === "HAZARD_EXISTENCE"`.',
    denominator: 'Rows with a PRESENT layer.',
    eligibleOpportunity: 'Every row whose Expert layer produced a validated analysis.',
    exclusions: [],
    truthPrecedence: 'DETERMINISTIC_MACHINE_DERIVED',
    requiresAdjudication: false,
    rubricId: null,
    zeroOpportunity: 'UNMEASURED_GATE_FAILS',
    malformedOutput: FATAL_REJECTION_COUNTS_AS_NO_CONTENT,
    providerFailure: PROVIDER_FAILURE_EXCLUDES_CONTENT_ROW,
    missingTruth: 'Not applicable: both halves are read from the output over closed vocabularies.',
    evidenceRetained: ['PER_ROW_OPPORTUNITY_LEDGER', 'PER_ITEM_CLASSIFICATION'],
    computation:
      'incoherent rows / rows. IMPLEMENTED LITERALLY as the plan words it, at ROW level. '
      + '`DecisionCriticalClarification` carries no hazard family, so the contract offers no way to '
      + 'couple a question to the candidate it contradicts; the row-level reading is therefore the '
      + 'only one the type permits, and the 0.10 ceiling was set against this wording. Narrowing it '
      + 'to a family-coupled test would be WEAKENING a frozen gate, so it is recorded as a stated '
      + 'limitation instead.',
  },
  // ============================================================ RELIABILITY
  {
    id: 'M13_PROVIDER_CALLABILITY',
    numerator:
      'Calls that reached the provider and returned a payload the boundary could parse -- layer '
      + 'status PRESENT or OUTPUT_REJECTED. A rejected payload still PROVES callability; conflating '
      + 'transport with content would let a content defect read as an outage.',
    denominator: 'All attempted calls, every row, every repetition, retries included.',
    eligibleOpportunity: 'Every attempted call.',
    exclusions: [],
    truthPrecedence: 'DETERMINISTIC_MACHINE_DERIVED',
    requiresAdjudication: false,
    rubricId: null,
    zeroOpportunity: 'UNMEASURED_GATE_FAILS',
    malformedOutput: 'Counts as a SUCCESS here and as a failure in M05/M06/M07 where it belongs.',
    providerFailure:
      'Counts as a failure here, broken out by `ExpertProviderFailureKind` so a rate limit and an '
      + 'unexpected model identity are never summed into one uninformative number.',
    missingTruth: 'Not applicable.',
    evidenceRetained: ['RUN_METADATA'],
    computation: 'reached / attempted, with a by-kind breakdown reported beside the ratio.',
  },
  {
    id: 'M14_ORDER_SENSITIVITY',
    numerator:
      'Rows whose SCORED FIELD PROJECTION differs between the base call and the permuted call. The '
      + 'projection is frozen as: the sorted multiset of candidate '
      + '(hazardFamily, assertedConditionState, relationshipToDeterministic); the sorted multiset of '
      + 'clarification `affectedDecision`; the sorted multiset of insight '
      + '(interactionKind, sorted participants); the sorted multiset of disagreement '
      + '(target, disagreementType); and the `outcome`.',
    denominator: 'Rows for which BOTH the base and the permuted call returned a PRESENT layer.',
    eligibleOpportunity:
      'A row run twice with `deterministicFindings`, `governedStandards` and `authoritativeSources` '
      + 'reordered by a frozen permutation and NOTHING else changed.',
    exclusions: [
      'Free prose -- `summary`, `reasoning`, `whyItMatters` and the rest. Prose varies between two '
        + 'identical calls to a model with no determinism control, so counting it would measure '
        + 'sampling rather than order sensitivity and the gate would be unreachable by construction. '
        + 'That is the G9 error and this exclusion exists to avoid repeating it.',
      'Item ids and keys, which the producer chooses freely.',
    ],
    truthPrecedence: 'DETERMINISTIC_MACHINE_DERIVED',
    requiresAdjudication: false,
    rubricId: null,
    zeroOpportunity: 'UNMEASURED_GATE_FAILS',
    malformedOutput: 'A row where either call was rejected is excluded and reported separately.',
    providerFailure: 'Same treatment, and the failure is counted in M13.',
    missingTruth: 'Not applicable.',
    evidenceRetained: ['PERMUTATION_PAIR', 'PER_ROW_OPPORTUNITY_LEDGER'],
    computation: 'differing rows / paired rows.',
  },
  {
    id: 'M15_LATENCY_P95',
    numerator: 'Not a ratio -- the p95 of end-to-end elapsed milliseconds, measured at the runner.',
    denominator: 'None.',
    eligibleOpportunity: 'Every call that returned a payload (PRESENT or OUTPUT_REJECTED).',
    exclusions: [
      'Failed calls, whose latency is a timeout rather than a model latency.',
    ],
    truthPrecedence: 'DETERMINISTIC_MACHINE_DERIVED',
    requiresAdjudication: false,
    rubricId: null,
    zeroOpportunity: 'REPORTED_AS_NO_OPPORTUNITY',
    malformedOutput: 'Included -- the model still spent the time.',
    providerFailure: 'Excluded, and reported separately.',
    missingTruth: 'Not applicable.',
    evidenceRetained: ['RUN_METADATA'],
    computation:
      'nearest-rank p95 over sorted latencies: index = ceil(0.95 * n) - 1. Frozen so two runs '
      + 'compute the same statistic. REPORTED only -- Expert is off the customer request path, so a '
      + 'latency threshold would gate a number nothing waits on.',
  },
  {
    id: 'M16_COST_PER_ROW',
    numerator: 'Total provider spend across every attempted call in the run, in USD.',
    denominator: 'Cohort rows attempted.',
    eligibleOpportunity: 'Every attempted call contributes cost, including failures that billed.',
    exclusions: [],
    truthPrecedence: 'DETERMINISTIC_MACHINE_DERIVED',
    requiresAdjudication: false,
    rubricId: null,
    zeroOpportunity: 'REPORTED_AS_NO_OPPORTUNITY',
    malformedOutput: 'Included -- a rejected payload was still paid for.',
    providerFailure: 'Included when the provider reported usage; otherwise recorded as zero and said so.',
    missingTruth: 'Not applicable.',
    evidenceRetained: ['RUN_METADATA'],
    computation:
      'spend / rows, recorded with the input and output token counts that produced it. Never '
      + 'estimated after the fact -- the plan says "reported per run, never estimated".',
  },
  {
    id: 'M17_CROSS_PROCESS_REPRODUCIBILITY',
    numerator:
      'Rows whose SCORED FIELD PROJECTION -- the same frozen projection M14 uses -- is identical '
      + 'between two independent OS processes given the same input and the same prompt.',
    denominator: 'Rows for which both processes returned a PRESENT layer.',
    eligibleOpportunity: 'A row called once in each of two processes with identical input.',
    exclusions: ['Free prose and ids, for the reason stated in M14.'],
    truthPrecedence: 'DETERMINISTIC_MACHINE_DERIVED',
    requiresAdjudication: false,
    rubricId: null,
    zeroOpportunity: 'REPORTED_AS_NO_OPPORTUNITY',
    malformedOutput: 'A row where either process was rejected is excluded and reported separately.',
    providerFailure: 'Same treatment; counted in M13.',
    missingTruth: 'Not applicable.',
    evidenceRetained: ['CROSS_PROCESS_PAIR'],
    computation:
      'identical / paired. REPORTED, NOT GATED, and this contract may not change that: '
      + '`P2_DETERMINISM_CONTROL` is ABSENT for the qualified model -- no seed, and temperature, '
      + 'top_p and top_k unavailable -- so a hard gate here would be unreachable by construction. '
      + 'THAT IS THE G9 LESSON, and promoting this measure is a governance act with its own '
      + 'authorization, not something a harness may decide.',
  },
];

// ---------------------------------------------------------------- frozen lexicons

/**
 * Level-1 DETECTION for M06/M07. A statement is regulatory when it invokes an external rule as
 * authority. This lexicon is frozen BEFORE any reserved material is opened, and it was written from
 * the shape of regulatory language, never from any observed model output.
 *
 * Matching is case-insensitive over the whole prose string. A statement is the whole string, not a
 * sentence, so the unit a human adjudicates is the unit the scorer counted.
 */
export const REGULATORY_STATEMENT_MARKERS: readonly RegExp[] = [
  /\bOSHA\b/i,
  /\bMSHA\b/i,
  /\bregulation(s)?\b/i,
  /\bregulatory\b/i,
  /\bthe standard\b/i,
  /\bstandards? require/i,
  /\bcode\s+require/i,
  /\blegally\b/i,
  /\bcompliance\b/i,
  /\bnon-?compliant\b/i,
  /\bcitation\b/i,
  /\bviolat(ion|es|e)\b/i,
];

/**
 * The subset that additionally asserts an OBLIGATION, which is what separates M06's numerator from
 * M07's denominator. Mechanical, so the adjudicator is never asked whether something is a
 * requirement -- only whether the supplied records support it.
 */
export const REGULATORY_OBLIGATION_MARKERS: readonly RegExp[] = [
  /\brequire(s|d|ment|ments)?\b/i,
  /\bmust\b/i,
  /\bshall\b/i,
  /\bmandat(e|es|ed|ory)\b/i,
  /\bprohibit(s|ed)?\b/i,
  /\bnot permitted\b/i,
  /\bobligat(ed|ion|ions)\b/i,
];

// ---------------------------------------------------------------- adjudication rubrics

export interface AdjudicationRubric {
  rubricId: string;
  appliesTo: string[];
  question: string;
  /** The closed set of verdicts. An adjudicator may not write a fourth. */
  verdicts: readonly string[];
  /** How to decide, written so two qualified adjudicators reach the same answer. */
  decisionRule: string;
  /** What the adjudicator is NOT allowed to consider. */
  forbiddenInputs: string[];
  /** What must be recorded alongside the verdict. */
  recordRequirements: string[];
}

export const EXPERT_ADJUDICATION_RUBRICS: readonly AdjudicationRubric[] = [
  {
    rubricId: 'EXPERT_REG_SUPPORT_V1',
    appliesTo: ['M06_UNSUPPORTED_REGULATORY_ASSERTIONS', 'M07_GOVERNED_RECORD_GROUNDING'],
    question:
      'Is the regulatory content of this statement present in at least one governed record that was '
      + 'supplied to Expert on THIS row?',
    verdicts: ['SUPPORTED_BY_SUPPLIED_RECORD', 'NOT_SUPPORTED_BY_SUPPLIED_RECORD'],
    decisionRule:
      'SUPPORTED only when a supplied record\'s `approvedText` states, in substance, the same '
      + 'obligation or the same regulatory fact the statement asserts. Paraphrase is permitted; '
      + 'extension is not. If the record establishes a NARROWER duty than the statement claims, the '
      + 'verdict is NOT_SUPPORTED -- the statement went beyond the record. If the row supplied no '
      + 'record, the verdict is NOT_SUPPORTED by definition and the statement is excluded from '
      + 'M06\'s denominator but not from M07\'s.',
    forbiddenInputs: [
      'The adjudicator\'s own regulatory knowledge. The question is whether the SUPPLIED record '
        + 'supports it, not whether the claim happens to be true. A true claim with no supplied '
        + 'record is exactly the failure M06 exists to count.',
      'Any other row\'s records.',
      'Any knowledge of how the model scored on other measures, or of whether the gate is close.',
    ],
    recordRequirements: [
      'The verbatim statement, its rowId and its source field path.',
      'The citation of the supporting record when SUPPORTED, so the claim is re-checkable.',
      'One sentence of reason. A verdict with no reason is not auditable.',
    ],
  },
  {
    rubricId: 'EXPERT_CLARIFICATION_MAPPING_V1',
    appliesTo: ['M09_CLARIFICATION_QUALITY'],
    question:
      'Which ONE of this row\'s authored decision-critical gaps, if any, does this clarification ask '
      + 'about?',
    verdicts: ['MAPPED_TO_GAP', 'MAPPED_TO_NO_GAP'],
    decisionRule:
      'MAPPED_TO_GAP when the question, answered, would supply the fact the authored gap describes. '
      + 'At most one gap: where a question spans two, map it to the gap whose `affectedDecision` the '
      + 'question itself names. A question that would supply a genuinely useful fact NOT among the '
      + 'authored gaps is MAPPED_TO_NO_GAP -- the answer key is the standard, and a key that missed '
      + 'a good question is a finding about the key, to be recorded and reported, never repaired '
      + 'mid-run.',
    forbiddenInputs: [
      'Whether the mapping helps or hurts the 0.70 floor.',
      'The model\'s other clarifications on the same row, except to avoid mapping two clarifications '
        + 'to one gap without saying so.',
    ],
    recordRequirements: [
      'The verbatim question, its rowId, and the chosen `gapId` or NONE.',
      'Whether the clarification\'s own `affectedDecision` equals the mapped gap\'s. The scorer, not '
        + 'the adjudicator, applies that comparison.',
      'One sentence of reason.',
    ],
  },
];

export function rubricFor(rubricId: string): AdjudicationRubric | null {
  return EXPERT_ADJUDICATION_RUBRICS.find(r => r.rubricId === rubricId) ?? null;
}

// ---------------------------------------------------------------- consistency, proved not promised

export function specFor(id: string): MeasureSpec {
  const s = EXPERT_MEASUREMENT_CONTRACT.find(x => x.id === id);
  if (!s) throw new Error(`no measurement spec for ${id}`);
  return s;
}

/**
 * Prove this contract is a faithful executable reading of the plan rather than a second, drifting
 * authority. Returns the list of problems; an empty list is the proof.
 *
 * Every check is an EQUALITY against the plan or a structural property of this file. None of them
 * can be satisfied by editing a threshold here, because no threshold is stored here.
 */
export function assertContractMatchesPlan(): string[] {
  const problems: string[] = [];
  const planIds = EXPERT_EVALUATION_MEASURES.map(m => m.id).sort();
  const specIds = EXPERT_MEASUREMENT_CONTRACT.map(s => s.id).sort();

  if (planIds.length !== 17) problems.push(`plan has ${planIds.length} measures, expected 17`);
  if (specIds.length !== planIds.length || specIds.some((id, i) => id !== planIds[i])) {
    problems.push(`spec ids do not equal plan ids: [${specIds.join(',')}] vs [${planIds.join(',')}]`);
  }
  if (new Set(specIds).size !== specIds.length) problems.push('duplicate spec id');

  for (const spec of EXPERT_MEASUREMENT_CONTRACT) {
    const frozen = frozenFieldsFor(spec.id);
    const derived = zeroOpportunityTreatmentFor(spec.id);
    if (spec.zeroOpportunity !== derived) {
      problems.push(
        `${spec.id}: zeroOpportunity ${spec.zeroOpportunity} contradicts the plan-derived ${derived}`);
    }
    if (frozen.disposition === 'HARD_GATE' && spec.zeroOpportunity !== 'UNMEASURED_GATE_FAILS') {
      problems.push(`${spec.id}: a HARD_GATE may not be lenient on zero opportunity`);
    }
    if (spec.requiresAdjudication && !spec.rubricId) {
      problems.push(`${spec.id}: requiresAdjudication with no rubric`);
    }
    if (!spec.requiresAdjudication && spec.rubricId) {
      problems.push(`${spec.id}: carries a rubric it does not use`);
    }
    if (spec.requiresAdjudication && spec.truthPrecedence !== 'PREREGISTERED_ADJUDICATION_RUBRIC') {
      problems.push(`${spec.id}: adjudicated measures must declare precedence level 3`);
    }
    if (spec.rubricId && !rubricFor(spec.rubricId)) {
      problems.push(`${spec.id}: rubric ${spec.rubricId} is not defined`);
    }
    if (spec.rubricId) {
      const r = rubricFor(spec.rubricId);
      if (r && !r.appliesTo.includes(spec.id)) {
        problems.push(`${spec.id}: rubric ${spec.rubricId} does not claim this measure`);
      }
    }
    for (const field of ['numerator', 'denominator', 'eligibleOpportunity', 'malformedOutput',
      'providerFailure', 'missingTruth', 'computation'] as const) {
      if (!spec[field] || spec[field].trim().length === 0) {
        problems.push(`${spec.id}: ${field} is empty`);
      }
    }
    if (spec.evidenceRetained.length === 0) problems.push(`${spec.id}: retains no evidence`);
  }

  // M17 may never be silently promoted. The plan pre-registered it as reported BECAUSE the
  // determinism control is absent, and that promotion is a governance act elsewhere.
  if (frozenFieldsFor('M17_CROSS_PROCESS_REPRODUCIBILITY').disposition !== 'MEASURED_AND_REPORTED') {
    problems.push('M17 is no longer MEASURED_AND_REPORTED in the plan -- promotion requires its own '
      + 'authorization and this contract must not carry it silently');
  }

  return problems;
}

/**
 * The measures that must produce a number for the four family verdicts to be meaningful.
 * Exported so the harness can prove, before spending anything, that its scorers cover all of them.
 */
export function gatedMeasureIds(): string[] {
  return EXPERT_EVALUATION_MEASURES.filter(m => m.disposition === 'HARD_GATE').map(m => m.id);
}

export function reportedMeasureIds(): string[] {
  return EXPERT_EVALUATION_MEASURES.filter(m => m.disposition === 'MEASURED_AND_REPORTED').map(m => m.id);
}
