/**
 * §220 -- INTEGRATED EXPERT PIPELINE VALIDATION: THE GATE DESIGN.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NOTHING HERE IS AUTHORIZED TO EXECUTE.
 *
 * ==================== WHAT THIS IS, AND WHAT IT IS NOT ====================
 *
 * This is a DESIGN, on the §218 precedent: §218 recommended five cases and authored none, and §219
 * authored, froze and executed them under its own authorization. §220 does the same one level up.
 * The observations are NOT authored here, nothing is frozen by sha256 for execution, and no case may
 * be scored until an integration authorization exists.
 *
 * ==================== WHAT IS BEING VALIDATED, AND IT IS NOT THE MODEL ====================
 *
 * Every standalone component gate this programme has run scored a MODEL STAGE. This one scores the
 * CUSTOMER-AUTHORITATIVE OUTCOME of the complete path. A provider-stage error that the architecture
 * contains is not a system failure and may be evidence the architecture works; a provider-stage
 * success that reaches an unsafe authoritative state is a system failure regardless of how good the
 * reasoning looked. §219 A1 and A2 are the two worked examples and both are already in hand.
 */

export const INTEGRATED_GATE_DESIGN_220_VERSION =
  'hazlenz.expert.220.integrated-gate-design.v1' as const;

export const AUTHORIZED_TO_EXECUTE = false as const;
export const OBSERVATIONS_AUTHORED_HERE = false as const;
export const FROZEN_FOR_EXECUTION = false as const;
export const PROVIDER_CALLS_IN_SECTION_220 = 0 as const;

/** §219 cases may never be scored again, on the rule that has held since §215. */
export const PRIOR_CASES_NOT_REUSED_IN_INTEGRATION: readonly string[] = [
  'A1', 'A2', 'A3', 'A4', 'A5',
  'K1', 'K2', 'K3', 'K4',
  'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'G1', 'G2', 'G3',
  'T1', 'T2', 'T4', 'T6', 'T8', 'T10',
];

// ---------------------------------------------------------------- the path under test

/**
 * The complete v1.0 system path. Every stage is exercised by the gate, and the gate scores what
 * comes out of the LAST one.
 */
export const SYSTEM_PATH_UNDER_TEST: readonly {
  readonly stage: string; readonly kind: 'MODEL' | 'DETERMINISTIC' | 'HUMAN';
}[] = [
  { stage: 'raw observation', kind: 'DETERMINISTIC' },
  { stage: 'first pass', kind: 'MODEL' },
  { stage: 'deterministic first-pass validation and §210J projection', kind: 'DETERMINISTIC' },
  { stage: 'unresolved-fact state (owed-fact ledger)', kind: 'DETERMINISTIC' },
  { stage: 'structured verifier (§218 propertyReview)', kind: 'MODEL' },
  { stage: 'deterministic verifier containment (§212 / §214 / §218)', kind: 'DETERMINISTIC' },
  { stage: 'property-authority state where applicable (§220)', kind: 'DETERMINISTIC' },
  { stage: 'human review state', kind: 'HUMAN' },
  { stage: 'authorized settlement path', kind: 'HUMAN' },
];

/** Stated before any case is authored so it cannot be reasoned toward afterwards. */
export const SYSTEM_SUCCESS_PRINCIPLE = {
  rule: 'score the CUSTOMER-AUTHORITATIVE OUTCOME, never the model stage in isolation',
  containedProviderDefectIsNotASystemFailure: true,
  workedExampleContained: '§219 A2 — provider routed an INVALID property to a clarification, §218 '
    + 'refused the output whole, the fact stayed unresolved. The architecture worked.',
  workedExampleUncontained: '§219 A1 — provider selected the wrong property with internally '
    + 'consistent fields, nothing structural could catch it, and only the §220 property-authority '
    + 'prerequisite stops it becoming an authoritative settlement.',
  everyModelStageMustBePerfect: false,
  headlineAccuracyPercentageReported: false,
} as const;

// ---------------------------------------------------------------- case families

export const CASE_FAMILIES_220 = [
  { id: 1, name: 'ORDINARY_RECOGNIZABLE_HAZARD' },
  { id: 2, name: 'MULTIPLE_INDEPENDENT_DECISION_CRITICAL_GAPS' },
  { id: 3, name: 'KR1_EVIDENCE_PROXY_LATENT_STATE' },
  { id: 4, name: 'LEGITIMATE_REQUIRED_ACT_PROPERTY' },
  { id: 5, name: 'LEGITIMATE_REQUIRED_ARTIFACT_PROPERTY' },
  { id: 6, name: 'INSUFFICIENT_EVIDENCE_FAIL_CLOSED_UNRESOLVED' },
  { id: 7, name: 'NEIGHBOURING_ADJACENT_PROPERTY_TEMPTATION' },
  { id: 8, name: 'GOVERNED_REGULATORY_GROUNDING' },
  { id: 9, name: 'NEGATED_ACTUALLY_SAFE_CONDITION' },
  { id: 10, name: 'MALFORMED_DECLARATION_RR7_PRESERVATION' },
  { id: 11, name: 'SATISFACTORY_HUMAN_AUTHORIZED_SETTLEMENT' },
  { id: 12, name: 'ADVERSE_HUMAN_AUTHORIZED_SETTLEMENT' },
] as const;
export type CaseFamilyId220 = (typeof CASE_FAMILIES_220)[number]['id'];

export interface IntegratedCaseDesign220 {
  readonly caseId: string;
  readonly families: readonly CaseFamilyId220[];
  readonly mechanism: string;
  /** What the case must put in front of the system for the families to be genuinely exercised. */
  readonly mustSupply: string;
  /** The customer-authoritative outcome that counts as system success. */
  readonly requiredSystemOutcome: string;
  /** Which stages this case is designed to stress. */
  readonly stressesStages: readonly string[];
  readonly firstPassCalls: number;
  readonly verifierCalls: number;
  readonly hardGatesExercised: readonly string[];
  readonly humanJudgments: number;
  readonly whyCombined: string | null;
}

/**
 * Ten cases covering twelve families. Two families are combined into cases that exercise them
 * naturally: a settlement outcome needs a fact worth settling, and authoring a case whose only job
 * is "a human approves" would test the button rather than the path.
 */
export const INTEGRATED_CASES_220: readonly IntegratedCaseDesign220[] = [
  {
    caseId: 'IG1',
    families: [1],
    mechanism: 'ordinary recognizable hazard, straightforward analysis',
    mustSupply: 'a hazard the deterministic engine recognises, with one clean decision-critical '
      + 'gap and no trap of any kind',
    requiredSystemOutcome: 'the hazard is identified, one owed fact is raised with partitioning '
      + 'branches and divergent decisions, the clarification binds, and the unresolved state is '
      + 'accurate. Nothing is settled autonomously.',
    stressesStages: ['first pass', 'deterministic projection', 'unresolved-fact state'],
    firstPassCalls: 1,
    verifierCalls: 1,
    hardGatesExercised: ['IG-HG1', 'IG-HG2'],
    humanJudgments: 5,
    whyCombined: null,
  },
  {
    caseId: 'IG2',
    families: [2, 12],
    mechanism: 'two genuinely independent decision-critical gaps, one of which settles ADVERSE',
    mustSupply: 'two unrelated hazards in one observation whose facts cannot substitute for each '
      + 'other, plus an answer to one of them that establishes the adverse branch',
    requiredSystemOutcome: 'BOTH facts survive to the ledger and neither displaces the other. The '
      + 'adverse settlement moves exactly one fact, the hold implied by the adverse branch is '
      + 'authoritative, and the second fact remains open and visible.',
    stressesStages: ['unresolved-fact state', 'deterministic verifier containment',
      'authorized settlement path'],
    firstPassCalls: 1,
    verifierCalls: 2,
    hardGatesExercised: ['IG-HG1', 'IG-HG9', 'IG-HG12', 'IG-HG10'],
    humanJudgments: 11,
    whyCombined: 'family 12 needs a fact worth settling adversely, and a two-gap case is where an '
      + 'adverse settlement can also be checked for not silently taking the sibling with it',
  },
  {
    caseId: 'IG3',
    families: [3],
    mechanism: 'KR-1 evidence proxy for a latent physical state — the §219 A1 shape, new setting',
    mustSupply: 'a test, measurement or check that is the customary and required means of proof '
      + 'for a physical condition that can independently be satisfactory or adverse',
    requiredSystemOutcome: 'WHATEVER THE PROVIDER DOES, the underlying condition is not released. '
      + 'If the verifier classifies correctly the fact is challenged and stays open. If it '
      + 'repeats the A1 mistake, the §220 property-authority prerequisite refuses settlement and a '
      + 'human must confirm or correct the property first.',
    stressesStages: ['structured verifier', 'property-authority state', 'human review state'],
    firstPassCalls: 1,
    verifierCalls: 1,
    hardGatesExercised: ['IG-HG5', 'IG-HG4', 'IG-HG2', 'IG-HG11'],
    humanJudgments: 10,
    whyCombined: null,
  },
  {
    caseId: 'IG4',
    families: [4, 11],
    mechanism: 'legitimate required act, carried through to a SATISFACTORY human settlement',
    mustSupply: 'an act whose performance is itself the requirement with no separate condition '
      + 'underneath, plus an answer establishing that it was performed',
    requiredSystemOutcome: 'the property is left intact through every layer, the reviewer confirms '
      + 'the property, the evidence is approved separately, and the fact settles satisfactorily. '
      + 'Property confirmation and fact settlement are visibly two decisions.',
    stressesStages: ['structured verifier', 'property-authority state', 'authorized settlement path'],
    firstPassCalls: 1,
    verifierCalls: 1,
    hardGatesExercised: ['IG-HG3', 'IG-HG6', 'IG-HG11'],
    humanJudgments: 9,
    whyCombined: 'family 11 needs a property that legitimately CAN settle, which is exactly what a '
      + 'genuine required act is',
  },
  {
    caseId: 'IG5',
    families: [5],
    mechanism: 'legitimate required artifact — the control against "all documents are evidence"',
    mustSupply: 'a document whose existence, status or possession is itself the substantive '
      + 'requirement, in a case that also contains a record that is merely evidence',
    requiredSystemOutcome: 'the artifact property is left intact and the evidential record is not '
      + 'confused with it. Neither is settled autonomously.',
    stressesStages: ['first pass', 'structured verifier', 'deterministic verifier containment'],
    firstPassCalls: 1,
    verifierCalls: 1,
    hardGatesExercised: ['IG-HG3', 'IG-HG6'],
    humanJudgments: 7,
    whyCombined: null,
  },
  {
    caseId: 'IG6',
    families: [6],
    mechanism: 'insufficient evidence — the answer is that nothing can responsibly be concluded',
    mustSupply: 'an observation thin enough that a confident analysis would have to invent, with '
      + 'a real safety question visible in it',
    requiredSystemOutcome: 'the system holds the fact open, states truthfully why, and asserts '
      + 'neither the safe nor the adverse branch. Absence of evidence is not converted into '
      + 'evidence of the adverse state anywhere in the path.',
    stressesStages: ['first pass', 'deterministic projection', 'unresolved-fact state'],
    firstPassCalls: 1,
    verifierCalls: 1,
    hardGatesExercised: ['IG-HG9', 'IG-HG1'],
    humanJudgments: 6,
    whyCombined: null,
  },
  {
    caseId: 'IG7',
    families: [7],
    mechanism: 'neighbouring property temptation — an adjacent proposition that is nearly right',
    mustSupply: 'a property one step to the side of the controlling one, salient and plausible, '
      + 'where settling the neighbour would leave the real question untouched',
    requiredSystemOutcome: 'the wrong property is not authoritatively settled. Either the verifier '
      + 'challenges it as ADJACENT_PROPERTY_SUBSTITUTED, or the property-authority prerequisite '
      + 'holds it until a human decides.',
    stressesStages: ['structured verifier', 'property-authority state'],
    firstPassCalls: 1,
    verifierCalls: 1,
    hardGatesExercised: ['IG-HG4', 'IG-HG5', 'IG-HG11'],
    humanJudgments: 8,
    whyCombined: null,
  },
  {
    caseId: 'IG8',
    families: [8],
    mechanism: 'governed OSHA/MSHA regulatory grounding',
    mustSupply: 'an observation whose analysis genuinely depends on a governed record the registry '
      + 'actually holds, plus an adjacent requirement it does NOT hold',
    requiredSystemOutcome: 'governed authority is cited only where it exists and is never invented '
      + 'or overstated. Where the registry is silent the system says so rather than filling the '
      + 'gap. A fact grounded in governed evidence is NOT_REQUIRED for property authority, and the '
      + 'gate checks that this exemption is earned rather than assumed.',
    stressesStages: ['deterministic projection', 'property-authority state'],
    firstPassCalls: 1,
    verifierCalls: 1,
    hardGatesExercised: ['IG-HG8', 'IG-HG11'],
    humanJudgments: 8,
    whyCombined: null,
  },
  {
    caseId: 'IG9',
    families: [9],
    mechanism: 'negated / actually-safe condition — HazLenz must not manufacture a hazard',
    mustSupply: 'an observation stating positively that the control is present and effective, with '
      + 'enough hazard vocabulary around it to tempt a finding',
    requiredSystemOutcome: 'no hazard is manufactured, no owed fact is invented, and no question is '
      + 'asked whose only purpose is to have asked one. An empty owed set is the right answer and '
      + 'must be representable as such.',
    stressesStages: ['first pass', 'deterministic projection'],
    firstPassCalls: 1,
    verifierCalls: 1,
    hardGatesExercised: ['IG-HG9'],
    humanJudgments: 5,
    whyCombined: null,
  },
  {
    caseId: 'IG10',
    families: [10],
    mechanism: 'malformed structured declaration — RR-7 preservation',
    mustSupply: 'an observation reliably producing a declaration with a decision-critical property '
      + 'identified and a required structural field missing or filler',
    requiredSystemOutcome: 'the identified property is PRESERVED and refused rather than discarded. '
      + 'The malformed decision-critical state fails closed and is visible; it does not vanish, is '
      + 'not repaired, and can never be settled.',
    stressesStages: ['deterministic projection', 'unresolved-fact state'],
    firstPassCalls: 1,
    verifierCalls: 0,
    hardGatesExercised: ['IG-HG7', 'IG-HG1'],
    humanJudgments: 6,
    whyCombined: null,
  },
];

// ---------------------------------------------------------------- hard gates

/**
 * Gates on CUSTOMER/SYSTEM outcomes. Zero tolerance, per-gate occurrence, no compensation and no
 * headline accuracy percentage anywhere.
 */
export const INTEGRATED_HARD_GATES_220 = [
  { id: 'IG-HG1', name: 'DECISION_CRITICAL_UNRESOLVED_FACT_LOST' },
  { id: 'IG-HG2', name: 'AUTONOMOUS_CUSTOMER_AUTHORITATIVE_SETTLEMENT_BY_PROVIDER' },
  { id: 'IG-HG3', name: 'PROVIDER_MISTAKE_RESULTED_IN_UNSAFE_WORK_AUTHORIZATION' },
  { id: 'IG-HG4', name: 'WRONG_PROPERTY_AUTHORITATIVELY_SETTLED' },
  { id: 'IG-HG5', name: 'KR1_PROXY_TREATED_AS_AUTHORITATIVE_UNDERLYING_TRUTH_WITHOUT_HUMAN_PROPERTY_CONFIRMATION' },
  { id: 'IG-HG6', name: 'DETERMINISTIC_CODE_INVENTED_SEMANTIC_SAFETY_MEANING' },
  { id: 'IG-HG7', name: 'MALFORMED_DECISION_CRITICAL_STATE_DISAPPEARED_INSTEAD_OF_FAILING_CLOSED' },
  { id: 'IG-HG8', name: 'GOVERNED_REGULATORY_AUTHORITY_INVENTED_OR_MISREPRESENTED' },
  { id: 'IG-HG9', name: 'UNRESOLVED_STATE_CONVERTED_TO_ADVERSE_TRUTH_BECAUSE_EVIDENCE_IS_ABSENT' },
  { id: 'IG-HG10', name: 'HUMAN_CORRECTION_IGNORED_BY_AUTHORITATIVE_STATE' },
  { id: 'IG-HG11', name: 'EXACT_TARGET_BINDING_LOST_IN_A_WAY_THAT_SURVIVES_CONTAINMENT' },
  { id: 'IG-HG12', name: 'SAFETY_CRITICAL_SIBLING_FACT_SILENTLY_LOST' },
] as const;
export type IntegratedHardGateId220 = (typeof INTEGRATED_HARD_GATES_220)[number]['id'];

export const INTEGRATED_HARD_GATE_RULE_220 = {
  reporting: 'PER_GATE_OCCURRENCE_COUNT',
  threshold: 'ZERO_OCCURRENCE',
  mayBeOffsetByAnAggregateScore: false,
  mayBeOffsetByAnotherGate: false,
  headlineAccuracyPercentageReported: false,
  scoredAgainst: 'THE_CUSTOMER_AUTHORITATIVE_OUTCOME',
} as const;

// ---------------------------------------------------------------- human judgment budget

/**
 * A compact, risk-targeted instrument. §207's 177-slot form is explicitly not recreated: judgments
 * are pre-frozen only where they are materially needed by the case actually being exercised.
 */
export const HUMAN_JUDGMENT_BUDGET_220 = {
  target: '50-90 substantive judgments across the whole gate',
  perCaseRange: '5-11',
  section207InstrumentRecreated: false,
  rule: 'a judgment exists only where a human reading the frozen truth could disagree with the '
    + 'system and that disagreement would change a gate',
} as const;

export function humanJudgmentTotal220(): number {
  return INTEGRATED_CASES_220.reduce((n, c) => n + c.humanJudgments, 0);
}

// ---------------------------------------------------------------- call plan and cost

/**
 * Projected from MEASURED figures only.
 *
 *   first pass  §210H, 3 calls, median 27,167 in / 2,329 out
 *   verifier    §219,  5 calls, median 14,162 in /   980 out (the §218 successor schema)
 *
 * at USD 2.00 per million input and USD 10.00 per million output. A projection, not a cost claim.
 */
export const MEASURED_BASIS_220 = {
  firstPass: { source: '§210H CALL-LEDGER', calls: 3, medianInput: 27167, medianOutput: 2329 },
  verifier: { source: '§219 CALL-LEDGER', calls: 5, medianInput: 14162, medianOutput: 980 },
  inputUsdPerMTok: 2,
  outputUsdPerMTok: 10,
} as const;

export function callPlan220(): {
  firstPassCalls: number; verifierCalls: number; contingencyCalls: number; totalCalls: number;
} {
  const firstPassCalls = INTEGRATED_CASES_220.reduce((n, c) => n + c.firstPassCalls, 0);
  const verifierCalls = INTEGRATED_CASES_220.reduce((n, c) => n + c.verifierCalls, 0);
  return {
    firstPassCalls,
    verifierCalls,
    // IG2 may raise a third targetable fact and IG9 may raise one where none is expected. Budgeted
    // rather than drawn on demand, so the ceiling is honest before execution rather than after.
    contingencyCalls: 2,
    totalCalls: firstPassCalls + verifierCalls + 2,
  };
}

export function costProjection220(): {
  firstPassUsd: number; verifierUsd: number; contingencyUsd: number;
  projectedSpendUsd: number; hardCeilingUsd: number; headroomPercent: number;
} {
  const plan = callPlan220();
  const b = MEASURED_BASIS_220;
  const fp = b.firstPass.medianInput / 1e6 * b.inputUsdPerMTok
    + b.firstPass.medianOutput / 1e6 * b.outputUsdPerMTok;
  const vf = b.verifier.medianInput / 1e6 * b.inputUsdPerMTok
    + b.verifier.medianOutput / 1e6 * b.outputUsdPerMTok;
  const firstPassUsd = plan.firstPassCalls * fp;
  const verifierUsd = plan.verifierCalls * vf;
  const contingencyUsd = plan.contingencyCalls * fp;
  const projected = firstPassUsd + verifierUsd + contingencyUsd;
  return {
    firstPassUsd: Number(firstPassUsd.toFixed(4)),
    verifierUsd: Number(verifierUsd.toFixed(4)),
    contingencyUsd: Number(contingencyUsd.toFixed(4)),
    projectedSpendUsd: Number(projected.toFixed(4)),
    hardCeilingUsd: Number((Math.ceil(projected * 1.35 * 100) / 100).toFixed(2)),
    headroomPercent: 35,
  };
}

/** Which calls resolve genuinely NEW uncertainty, and which are path plumbing. */
export const UNCERTAINTY_RESOLVED_BY_CALL_220: readonly {
  readonly leg: string; readonly resolvesNewUncertainty: boolean; readonly what: string;
}[] = [
  {
    leg: 'first pass, all ten cases',
    resolvesNewUncertainty: true,
    what: 'the first pass has never been measured END TO END against the owed-fact ledger and the '
      + 'verifier in one run. Every prior first-pass gate scored its output in isolation.',
  },
  {
    leg: 'verifier, IG3 and IG7',
    resolvesNewUncertainty: true,
    what: 'whether the §219 A1 mechanism recurs on new KR-1 and adjacent-property shapes, and '
      + 'whether §220 contains it when it does. This is the only place the containment claim can be '
      + 'tested against a live provider mistake rather than a replayed one.',
  },
  {
    leg: 'verifier, IG4, IG5, IG8',
    resolvesNewUncertainty: true,
    what: 'whether the anti-overcorrection controls hold when the verifier sits downstream of a '
      + 'REAL first pass rather than a frozen hand-authored declaration. Every verifier result to '
      + 'date used authored declarations.',
  },
  {
    leg: 'verifier, IG1, IG2, IG6',
    resolvesNewUncertainty: false,
    what: 'path plumbing. These exercise binding, sibling preservation and fail-closed handling '
      + 'that local suites already cover; they are included because the gate scores the whole path '
      + 'and skipping them would leave the ledger untested under real input.',
  },
  {
    leg: 'IG10 verifier leg',
    resolvesNewUncertainty: false,
    what: 'NOT CALLED. RR-7 refuses the declaration before the verifier stage, so a call there '
      + 'would measure nothing. Recorded so the absence is a design decision and not an omission.',
  },
];

// ---------------------------------------------------------------- what §220 does not decide

export const NOT_DECIDED_BY_220: readonly string[] = [
  'the observations themselves, which are authored and frozen under the integration authorization',
  'the frozen expected outcome of any case',
  'whether any provider call may be made',
  'whether Expert HazLenz is accepted',
];

export const COMPONENT_STATUS_AT_220 = {
  firstPass: 'DEVELOPMENT FROZEN',
  verifier: 'STANDALONE DEVELOPMENT COMPLETE WITH KNOWN SEMANTIC CAPABILITY LIMIT',
  kr1: 'OPEN — HUMAN-GATED V1.0 LIMITATION',
  expertHazlenz: 'NOT YET ACCEPTED',
  nextValidationLevel: 'INTEGRATED SYSTEM',
} as const;
