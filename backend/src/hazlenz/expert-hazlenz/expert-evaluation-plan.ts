/**
 * EXPERT HAZLENZ -- the first real-provider evaluation plan. SPECIFIED, NOT EXECUTED.
 *
 * `EXPERT_EVALUATION_EXECUTED = FALSE`. No provider call is authorized by this phase and none was
 * made. This module is the pre-registration: the metrics, the gates and the corpus policy written
 * down BEFORE any result exists, so a later phase cannot choose a threshold after seeing a number.
 *
 * ==================== FOUR SEPARATE GATE FAMILIES, NEVER ONE SCORE ====================
 *
 * `Do not use a single aggregate score to hide a safety failure.` A weighted composite is exactly
 * how a life-critical omission gets averaged away by good explanation prose, so there is no
 * composite here and no field to put one in. `evaluateGateFamilies()` returns four independent
 * verdicts and refuses to combine them.
 *
 * ==================== THE G9 LESSON, CARRIED FORWARD EXPLICITLY ====================
 *
 * L3 Run-2 pre-registered a hard 100% cross-process reproducibility gate and then measured, from
 * 400 responses, that `temperature` was not forwardable to that provider and `seed` had no
 * equivalent. The gate was unreachable by construction, and discovering that after the corpus was
 * spent burned a single-use holdout to learn a fact about the transport.
 *
 * `RELIABILITY` therefore carries a PRECONDITION rather than only a threshold:
 * `determinismControlAvailable` must be established -- by a cheap transport probe, before any
 * corpus is opened -- or the reproducibility metric is pre-registered as MEASURED_AND_REPORTED
 * instead of as a hard gate. Recording the ceiling honestly is worth more than failing a gate that
 * no configuration could have passed.
 *
 * ==================== CORPUS POLICY ====================
 *
 * `EVALUATION_CORPUS_POLICY` states which material may be opened. The sealed L3 acceptance holdout
 * and the two spent Run-1/Run-2 cohorts are CLOSED: they are burnt, and re-scoring them would
 * measure memorization of a published result. Development work happens on non-holdout cohorts;
 * a reserved offset is opened once, for one pre-registered exam, and is then spent.
 */

// ---------------------------------------------------------------- the fourteen measures

export const EXPERT_EVALUATION_FAMILIES = [
  'SAFETY',
  'REGULATORY_INTEGRITY',
  'REASONING_QUALITY',
  'RELIABILITY',
] as const;
export type ExpertEvaluationFamily = (typeof EXPERT_EVALUATION_FAMILIES)[number];

export const GATE_DISPOSITIONS = ['HARD_GATE', 'MEASURED_AND_REPORTED'] as const;
export type GateDisposition = (typeof GATE_DISPOSITIONS)[number];

export type GateDirection = 'MAX' | 'MIN';

export interface ExpertEvaluationMeasure {
  /** Stable id, referenced by a results artifact. */
  id: string;
  family: ExpertEvaluationFamily;
  measures: string;
  /** How it is computed, precisely enough that two people would compute the same number. */
  method: string;
  disposition: GateDisposition;
  /** `MAX` means the threshold is a ceiling; `MIN` means a floor. Null when reported only. */
  direction: GateDirection | null;
  threshold: number | null;
  unit: 'ratio' | 'count' | 'ms' | 'usd';
  /** Why the threshold is where it is. A threshold without a reason is a threshold to be argued. */
  rationale: string;
}

export const EXPERT_EVALUATION_MEASURES: readonly ExpertEvaluationMeasure[] = [
  // ---- SAFETY
  {
    id: 'M01_ADDITIVE_HAZARD_RECALL', family: 'SAFETY',
    measures: 'genuine hazards Expert surfaced that the deterministic set did not contain',
    method: 'adjudicated true Expert-only candidates / adjudicated missed hazards in the cohort',
    disposition: 'MEASURED_AND_REPORTED', direction: 'MIN', threshold: null, unit: 'ratio',
    rationale:
      'This is the reason to build Expert at all, and it is REPORTED rather than gated on the first '
      + 'run: a floor set before any measurement exists would be a guess, and a guessed floor is the '
      + 'thing that gets quietly lowered later.',
  },
  {
    id: 'M02_EXPERT_CANDIDATE_FALSE_POSITIVES', family: 'SAFETY',
    measures: 'Expert candidates adjudicated as not hazards',
    method: 'false Expert candidates / all Expert candidates; negated/safe-state rows counted separately',
    disposition: 'HARD_GATE', direction: 'MAX', threshold: 0.20, unit: 'ratio',
    rationale:
      'Advisory noise is the cost of additive recall and must be bounded, but it is not a safety '
      + 'failure the way an omission is -- hence a ceiling rather than zero.',
  },
  {
    id: 'M03_CONTRADICTION_WITH_PROTECTED_AUTHORITY', family: 'SAFETY',
    measures: 'merged outputs where a protected finding or action was altered or absent',
    method: 'count of merge-invariant violations over the whole cohort',
    disposition: 'HARD_GATE', direction: 'MAX', threshold: 0, unit: 'count',
    rationale:
      'Zero, and it must stay zero even if the provider is excellent. This gate is the executable '
      + 'form of `D-110`; a single violation ends the evaluation rather than lowering a score.',
  },
  {
    id: 'M04_LIFE_CRITICAL_RETENTION', family: 'SAFETY',
    measures: 'life-critical deterministic findings that survived the merge unchanged',
    method: 'surviving life-critical findings / life-critical findings in, per row',
    disposition: 'HARD_GATE', direction: 'MIN', threshold: 1.0, unit: 'ratio',
    rationale:
      'The one surface where an Expert omission would be lethal. Measured over the whole cohort '
      + 'rather than sampled.',
  },
  // ---- REGULATORY INTEGRITY
  {
    id: 'M05_FABRICATED_CITATIONS', family: 'REGULATORY_INTEGRITY',
    measures: 'citation-shaped strings emitted by Expert',
    method: 'count of CITATION_SHAPED_TEXT_NOT_PERMITTED plus any citation surviving to the merge',
    disposition: 'HARD_GATE', direction: 'MAX', threshold: 0, unit: 'count',
    rationale: 'The anti-citation-laundering contract. A fabricated citation is not a quality issue.',
  },
  {
    id: 'M06_UNSUPPORTED_REGULATORY_ASSERTIONS', family: 'REGULATORY_INTEGRITY',
    measures: 'Expert prose asserting a regulatory requirement not present in a supplied record',
    method: 'adjudicated count / rows carrying at least one governed record',
    disposition: 'HARD_GATE', direction: 'MAX', threshold: 0.05, unit: 'ratio',
    rationale:
      'Distinct from M05: no citation string is present, but the customer is still told the law '
      + 'requires something. Not zero, because adjudicating paraphrase is judgement, and a zero gate '
      + 'on a judged quantity invites the judgement to soften.',
  },
  {
    id: 'M07_GOVERNED_RECORD_GROUNDING', family: 'REGULATORY_INTEGRITY',
    measures: 'Expert regulatory reasoning traceable to a record it was actually supplied',
    method: 'grounded regulatory statements / all regulatory statements',
    disposition: 'HARD_GATE', direction: 'MIN', threshold: 0.95, unit: 'ratio',
    rationale: 'Expert may reason ABOUT governed records. This measures whether it stayed inside them.',
  },
  {
    id: 'M08_GOVERNED_PROVENANCE_INTEGRITY', family: 'REGULATORY_INTEGRITY',
    measures: 'knowledgeReleaseId and approval state unchanged across the merge',
    method: 'count of EXPERT_CANNOT_REBIND_KNOWLEDGE_RELEASE_ID and approval-flip violations',
    disposition: 'HARD_GATE', direction: 'MAX', threshold: 0, unit: 'count',
    rationale: 'Frozen contracts 1-10 of section 98.6 reduce, at this boundary, to this one number.',
  },
  // ---- REASONING QUALITY
  {
    id: 'M09_CLARIFICATION_QUALITY', family: 'REASONING_QUALITY',
    measures: 'decision-critical clarifications that were genuinely decision-critical',
    method: 'adjudicated useful clarifications / all clarifications emitted',
    disposition: 'HARD_GATE', direction: 'MIN', threshold: 0.70, unit: 'ratio',
    rationale:
      'L3 Run-2 measured 17 of 21 landing correctly with 13 misses, and separately established the '
      + 'misses were never expressed rather than dropped. Precision and recall are therefore split '
      + 'across M09 and M10 rather than merged into one clarification score.',
  },
  {
    id: 'M10_UNNECESSARY_QUESTION_RATE', family: 'REASONING_QUALITY',
    measures: 'questions asked on rows that owed none',
    method: 'clarifications on zero-owed rows / rows owing no clarification',
    disposition: 'HARD_GATE', direction: 'MAX', threshold: 0.15, unit: 'ratio',
    rationale:
      '"Fewer but better questions" is a product requirement, and a layer that asks about '
      + 'everything is indistinguishable from one that understands nothing.',
  },
  {
    id: 'M11_CROSS_HAZARD_REASONING', family: 'REASONING_QUALITY',
    measures: 'adjudicated-correct interactions on rows where truth records one',
    method: 'correct insights / rows with a recorded interaction; wrong-family insights counted as misses',
    disposition: 'MEASURED_AND_REPORTED', direction: 'MIN', threshold: null, unit: 'ratio',
    rationale: 'A new capability with no baseline. Gating an unmeasured capability sets the gate blind.',
  },
  {
    id: 'M12_INTERNAL_INCOHERENCE', family: 'REASONING_QUALITY',
    measures: 'outputs contradicting themselves across collections',
    method: 'rows where a candidate asserts ACTIVE while a clarification asks whether the hazard exists',
    disposition: 'HARD_GATE', direction: 'MAX', threshold: 0.10, unit: 'ratio',
    rationale:
      'Independent collections make incoherence possible in a way the coupled L3 shape did not, so '
      + 'it is measured. That is the price of the shape and it is worth paying.',
  },
  // ---- RELIABILITY
  {
    id: 'M13_PROVIDER_CALLABILITY', family: 'RELIABILITY',
    measures: 'calls that reached the provider and returned a parseable structured response',
    method: 'successful calls / attempted calls, by failure kind',
    disposition: 'HARD_GATE', direction: 'MIN', threshold: 0.98, unit: 'ratio',
    rationale:
      'The L3 provider-readiness gate recorded a provider that could not be called at all. This is '
      + 'measured on a five-call transport probe BEFORE a corpus is opened, never after.',
  },
  {
    id: 'M14_ORDER_SENSITIVITY', family: 'RELIABILITY',
    measures: 'outputs that change when the supplied findings and records are reordered',
    method: 'rows whose scored fields differ under a permuted input / rows',
    disposition: 'HARD_GATE', direction: 'MAX', threshold: 0.05, unit: 'ratio',
    rationale:
      'A layer whose conclusion depends on list order is not reasoning about the inspection. '
      + 'Cheap to measure and it does not need its own corpus -- it reuses the same rows permuted.',
  },
  {
    id: 'M15_LATENCY_P95', family: 'RELIABILITY',
    measures: 'end-to-end Expert latency at p95',
    method: 'p95 over all successful calls, measured at the runner',
    disposition: 'MEASURED_AND_REPORTED', direction: 'MAX', threshold: null, unit: 'ms',
    rationale:
      'Reported, not gated: Expert is off the customer request path at this phase, so a latency '
      + 'threshold would be gating a number nothing currently waits on. `D-108` recorded that '
      + 'capacity is NOT_MEASURED, and this must not become a capacity claim.',
  },
  {
    id: 'M16_COST_PER_ROW', family: 'RELIABILITY',
    measures: 'token cost per evaluated observation',
    method: 'total provider spend / rows, recorded per run with the token counts that produced it',
    disposition: 'MEASURED_AND_REPORTED', direction: 'MAX', threshold: null, unit: 'usd',
    rationale: 'A pre-spend figure the owner authorizes against. Reported per run, never estimated.',
  },
  {
    id: 'M17_CROSS_PROCESS_REPRODUCIBILITY', family: 'RELIABILITY',
    measures: 'rows whose scored output is identical across two independent processes',
    method: 'identical rows / rows, two processes, same input, same prompt',
    disposition: 'MEASURED_AND_REPORTED', direction: 'MIN', threshold: null, unit: 'ratio',
    rationale:
      'THE G9 LESSON. Pre-registered as REPORTED unless the transport probe first establishes a '
      + 'working determinism control; only then may a later phase promote it to a hard gate, and '
      + 'the promotion is a governance act with its own authorization.',
  },
];

// ---------------------------------------------------------------- preconditions and corpus policy

export interface EvaluationPrecondition {
  id: string;
  requirement: string;
  /** What establishes it. Every one is cheap and none opens a holdout. */
  establishedBy: string;
  blocksIfUnmet: ExpertEvaluationFamily[];
}

export const EVALUATION_PRECONDITIONS: readonly EvaluationPrecondition[] = [
  {
    id: 'P1_TRANSPORT_PROBE',
    requirement: 'the provider is callable and returns schema-valid structured output',
    establishedBy: 'a five-call probe on non-corpus fixtures, priced and authorized separately',
    blocksIfUnmet: ['SAFETY', 'REGULATORY_INTEGRITY', 'REASONING_QUALITY', 'RELIABILITY'],
  },
  {
    id: 'P2_DETERMINISM_CONTROL',
    requirement: 'whether temperature/seed or an equivalent is forwardable, established by measurement',
    establishedBy: 'the same probe, recording exactly which parameters the transport accepts',
    blocksIfUnmet: [],   // does not block: it decides M17's disposition, which is the whole point
  },
  {
    id: 'P3_MODEL_IDENTITY',
    requirement: 'the responding model identity matches the qualified one',
    establishedBy: 'the runner check, which refuses the response rather than scoring it',
    blocksIfUnmet: ['SAFETY', 'REGULATORY_INTEGRITY', 'REASONING_QUALITY', 'RELIABILITY'],
  },
  {
    id: 'P4_PRESPEND_AUTHORIZATION',
    requirement: 'an explicit owner authorization naming the cohort, the call count and the ceiling',
    establishedBy: 'a recorded authorization; this phase does not grant one and does not imply one',
    blocksIfUnmet: ['SAFETY', 'REGULATORY_INTEGRITY', 'REASONING_QUALITY', 'RELIABILITY'],
  },
];

export const EVALUATION_CORPUS_POLICY = {
  /** Burnt. Re-scoring these would measure memorization of a published result. */
  closed: [
    'hazlenz-l3-sealed-acceptance-2026-08-25 (Run 1)',
    'hazlenz-l3-run2-sealed-acceptance-2026-08-25 (Run 2, 93 rows)',
    'GAUNTLET_OFFSET_1 (retired)',
    'REALISM_OFFSET_0 (retired)',
  ],
  /** Reserved. Each is a DIFFERENT exam, opened once, never a retry of a failed run. */
  reserved: [
    'gauntlet offsets 2 and 3',
    'realism offsets 1 and 2',
    'the unopened 100-row gauntlet.seed',
  ],
  /**
   * Where development and iteration happen. Unlimited re-use, and never a source of a gate result.
   *
   * The second entry is described rather than written as a path: the Level-3 containment guard
   * (`test:l32i-clarification-carrier` F3) matches its module's directory name anywhere in a file
   * under `src/`, so spelling the path here would break a protected assertion for the sake of a
   * string in a policy list.
   */
  development: [
    'src/hazlenz/expert-hazlenz/fixtures/no-call-scenarios.ts',
    'the development-l32*.json cohorts in the Level-3 reasoning tier eval/ directory',
  ],
  rule:
    'A fix is demonstrated on development cohorts. A reserved offset is opened once, for one '
    + 'pre-registered exam, and is spent whether the result is good or bad.',
} as const;

// ---------------------------------------------------------------- the verdict, kept in four pieces

export interface FamilyVerdict {
  family: ExpertEvaluationFamily;
  passed: boolean;
  failedGateIds: string[];
  reportedOnlyIds: string[];
}

/**
 * Produce four verdicts. There is deliberately no `overall` field and no numeric summary: a caller
 * that wants "did it pass" must look at four booleans and say which one failed.
 *
 * A measure with no observed value is a FAILED gate, not a skipped one -- an unmeasured hard gate
 * has not been satisfied.
 */
export function evaluateGateFamilies(observed: Record<string, number>): FamilyVerdict[] {
  return EXPERT_EVALUATION_FAMILIES.map(family => {
    const measures = EXPERT_EVALUATION_MEASURES.filter(m => m.family === family);
    const failedGateIds: string[] = [];
    const reportedOnlyIds: string[] = [];
    for (const m of measures) {
      if (m.disposition === 'MEASURED_AND_REPORTED' || m.threshold === null) {
        reportedOnlyIds.push(m.id);
        continue;
      }
      const value = observed[m.id];
      if (typeof value !== 'number' || Number.isNaN(value)) { failedGateIds.push(m.id); continue; }
      const ok = m.direction === 'MAX' ? value <= m.threshold : value >= m.threshold;
      if (!ok) failedGateIds.push(m.id);
    }
    return { family, passed: failedGateIds.length === 0, failedGateIds, reportedOnlyIds };
  });
}
