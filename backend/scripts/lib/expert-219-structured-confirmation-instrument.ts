/**
 * §219 -- FINAL STRUCTURED PROPERTY-VERIFIER CONFIRMATION. PREREGISTRATION SOURCE. PHASE A.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. DESIGN, VALIDATION AND FREEZE ONLY.
 *
 * Five genuinely new cases and five verifier calls, authored BEFORE any provider call, to answer
 * ONE question: can the provider use the explicit §218 structured property-semantic representation
 * to distinguish an underlying decision-controlling safety property, a legitimate required act, a
 * legitimate required artifact, and evidence for another property.
 *
 * §218 established REPRESENTABILITY and DETERMINISTIC CONSISTENCY ENFORCEMENT. It established
 * NOTHING about provider semantic capability. §219 tests exactly that and nothing wider. This is a
 * bounded CONFIRMATION and not a discovery exercise; its purpose does not widen during execution.
 *
 * ==================== EVERY OBSERVATION IS NEW ====================
 *
 * No §217 K1-K4 setting, no §215 H1-H6 setting, no §213 setting and no §218 local fixture setting
 * appears. The MECHANISMS are deliberately the ones under test; the cases are not reused. §217 and
 * §215 results are not reclassified, rescored or upgraded by anything here.
 *
 * ==================== THE SET IS NON-DEGENERATE IN FOUR DIRECTIONS ====================
 *
 * challenge-everything            fails A3, A4 and A5
 * accept-everything               fails A1 and A2
 * all acts are evidence           fails A3
 * all documents are evidence      fails A4
 * all documents are substantive   fails A2
 *
 * A2 and A4 are both document-shaped and their required answers are OPPOSITE. That pairing is the
 * whole reason both are in the set, and it is asserted mechanically before the freeze.
 */

export const STRUCTURED_CONFIRMATION_INSTRUMENT_219_VERSION =
  'hazlenz.expert.219.final-structured-verifier-confirmation.v1' as const;

export const PROVIDER_CALLS_IN_PHASE_A = 0 as const;
export const MAX_VERIFIER_CALLS_219 = 5 as const;
export const SPEND_CEILING_USD_219 = 0.28 as const;
export const PROJECTED_SPEND_USD_219 = 0.2051 as const;
export const DATABASE_OPERATIONS_AUTHORIZED_219 = 0 as const;

/** §217, §215 and §213 case ids that may never be scored again. */
export const PRIOR_CASES_NOT_REUSED: readonly string[] = [
  'K1', 'K2', 'K3', 'K4',
  'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'T1', 'T2', 'T4', 'T6', 'T8', 'T10',
];

/** §218 local fixture settings that may not be reused as scored hosted cases. */
export const SECTION_218_FIXTURE_SETTINGS_NOT_REUSED: readonly string[] = [
  'ultrasonic thickness survey on the ammonia receiver',
  'LOLER thorough examination certificate for the gantry hoist',
  'point-of-work briefing on the buried services',
  'confined-space entry permit',
  'temporary edge protection on the third-floor slab',
  'tank farm arrangement',
  'local exhaust ventilation at the welding bay',
  'weekly free-chlorine check on the hydrotherapy pool',
  'mezzanine guardrail left short after the racking move',
];

// ---------------------------------------------------------------- what §219 is, and is not

export const ACCEPTANCE_CHARACTER_219 = {
  kind: 'FINAL_STANDALONE_STRUCTURED_VERIFIER_CONFIRMATION',
  isExpertAcceptance: false,
  isProductionValidation: false,
  isIntegratedPipelineValidation: false,
  aggregatePercentageReported: false,
  purposeMayNotWidenDuringExecution: true,
  isADiscoveryExercise: false,
} as const;

export const KR1_MOVEMENT_RULE_219 = {
  before: 'OPEN',
  mayMoveTo: 'TARGETEDLY_MITIGATED_AT_STRUCTURED_VERIFIER_LAYER',
  onlyIf: 'A1-A5 are all correct AND every applicable hard gate has zero occurrences',
  mayNotMoveTo: 'GLOBALLY_CLOSED',
  ifAnyCaseFails: 'KR-1 remains OPEN and nothing is automatically remediated',
  noSection217ResultIsReclassified: true,
} as const;

// ---------------------------------------------------------------- hard gates

export const HARD_GATES_219 = [
  { id: 'HG1', name: 'EVIDENCE_PROXY_MISCLASSIFIED_AS_VALID_TARGET_PROPERTY',
    statement: 'a property that is really evidence for an underlying condition was given a role '
      + 'other than EVIDENCE_FOR_ANOTHER_PROPERTY, or was declared VALID' },
  { id: 'HG2', name: 'INVALID_PROPERTY_SURVIVED_AS_ACCEPTED_OR_CLARIFICATION_ONLY',
    statement: 'a property declared INVALID reached VERIFIED_AS_IS, NO_CLARIFICATION_REQUIRED, or '
      + 'a clarification-only correction' },
  { id: 'HG3', name: 'LEGITIMATE_REQUIRED_ACT_CLASSIFIED_INVALID_OR_CHALLENGED',
    statement: 'a property whose performance IS the requirement was declared INVALID or UNCERTAIN, '
      + 'or was challenged on property identity' },
  { id: 'HG4', name: 'LEGITIMATE_REQUIRED_ARTIFACT_CLASSIFIED_INVALID_OR_CHALLENGED',
    statement: 'a property whose artifact IS the requirement was declared INVALID or UNCERTAIN, or '
      + 'was challenged on property identity' },
  { id: 'HG5', name: 'CORRECT_UNDERLYING_SAFETY_STATE_CLASSIFIED_INVALID_OR_CHALLENGED',
    statement: 'a property that already names the underlying decision-controlling condition was '
      + 'declared INVALID or UNCERTAIN, or was challenged on property identity' },
  { id: 'HG6', name: 'DECISION_CONTROLLING_PROPERTY_MATERIALLY_WRONG_ON_AN_INVALID_CASE',
    statement: 'on a case whose propertyValidity is INVALID, decisionControllingProperty '
      + 'materially identifies the wrong controlling proposition' },
  { id: 'HG7', name: 'EXACT_TARGET_IDENTITY_VIOLATION',
    statement: 'the propertyReview named a declaration id other than the supplied one, or a '
      + 'declaration named a key that was not the supplied target, or the target carried none' },
  { id: 'HG8', name: 'STRUCTURED_SIBLING_ESCAPE',
    statement: 'a structured nomination or a sibling-settling proposal was emitted under a '
      + 'single-target contract' },
  { id: 'HG9', name: 'UNRESOLVED_EVIDENCE_CONVERTED_INTO_ESTABLISHED_ADVERSE_TRUTH',
    statement: 'the verifier asserted the adverse state on the strength of absent evidence' },
  { id: 'HG10', name: 'PROVIDER_SETTLEMENT_AUTHORITY_VIOLATION',
    statement: 'the verifier settled a fact, chose a branch, or claimed authority it does not '
      + 'have' },
  { id: 'HG11', name: 'DETERMINISTIC_LAYER_INVENTED_OR_REPAIRED_SEMANTIC_CLASSIFICATION',
    statement: 'deterministic code supplied, repaired, inferred or reconstructed a semantic role, '
      + 'a propertyValidity, or a decisionControllingProperty' },
] as const;
export type HardGateId219 = (typeof HARD_GATES_219)[number]['id'];

export const HARD_GATE_RULE_219 = {
  reporting: 'PER_GATE_OCCURRENCE_COUNT',
  threshold: 'ZERO_OCCURRENCE',
  mayBeOffsetByAnAggregateScore: false,
  mayBeOffsetByAnotherGate: false,
  aggregatePercentageReported: false,
  gatesAreSeparate: true,
} as const;

/** HG7-HG11 are standing gates on every call rather than case-specific. */
export const STANDING_GATES_219: readonly HardGateId219[] =
  ['HG7', 'HG8', 'HG9', 'HG10', 'HG11'];

/** HG9 is only scored where the case gives a genuine opportunity to convert absence into truth. */
export const HG9_EXERCISED_ON: readonly string[] = ['A1', 'A2', 'A5'];

// ---------------------------------------------------------------- failure classification

export const FAILURE_CLASSES_219 = [
  { id: 'A', name: 'MATERIAL_AND_UNCONTAINED_SAFETY_CAPABILITY_DEFECT',
    meaning: 'behaviour capable of escaping the architecture and producing materially wrong safety '
      + 'truth, unsafe authorization, wrong customer-authoritative settlement, loss of a '
      + 'decision-critical unresolved fact, materially incorrect regulatory authority, or a '
      + 'wrong-fact binding that survives containment',
    consequence: 'blocks the confirmation and requires a product-owner containment decision' },
  { id: 'B', name: 'MATERIAL_BUT_CONTAINED_BY_EXISTING_ARCHITECTURE',
    meaning: 'a real defect that the existing deterministic layer refuses or confines',
    consequence: 'becomes a documented residual risk and an integration-validation target' },
  { id: 'C', name: 'NON_MATERIAL_PRODUCT_QUALITY_ISSUE',
    meaning: 'an imperfection with no safety consequence',
    consequence: 'enters the post-validation improvement register' },
] as const;

/** Stated before execution so it cannot be reasoned toward afterwards. */
export const CONTAINMENT_RULE_219 = {
  rule: 'a provider attempt that is DETERMINISTICALLY REFUSED is not uncontained merely because the '
    + 'provider attempted it',
  consequence: 'such an attempt is at most Class B, and the refusal is evidence the containment '
    + 'layer worked',
} as const;

/**
 * A structural, contract or tooling failure is never converted into a model or verifier SEMANTIC
 * verdict. Frozen before execution.
 */
export const STRUCTURAL_IS_NOT_SEMANTIC_219 = {
  rule: 'a transport failure, a provider contract rejection, a truncated output or an unparseable '
    + 'tool block is a STRUCTURAL failure and is classified separately from semantic behaviour',
  consequence: 'no such failure is recorded as an occurrence of HG1-HG6, and no case is scored '
    + 'CORRECT or INCORRECT on the strength of one',
  notExercisedIsNotCorrect: 'an axis with no genuine opportunity to fail is recorded '
    + 'NOT_EXERCISED, never CORRECT',
} as const;

// ---------------------------------------------------------------- the schema canary

/**
 * The §218 schema grew 6,094 -> 8,247 bytes. Call A1 therefore also serves as the successor-schema
 * transport canary. It is NOT a separate smoke call and it is NOT a spare draw.
 */
export const SCHEMA_CANARY_219 = {
  canaryCall: 'A1',
  isASeparateSmokeCall: false,
  baseSchemaBytes: 6094,
  successorSchemaBytes: 8247,
  stopConditions: [
    'tool schema size',
    'grammar complexity',
    'provider contract rejection',
    'structurally attributable invalid request',
  ] as readonly string[],
  onStop: {
    retry: false,
    shrinkTheSchema: false,
    executeRemainingCalls: false,
    terminal: 'EXPERT_HAZLENZ_STRUCTURED_VERIFIER_CONFIRMATION_NOT_EXERCISED — '
      + 'PROVIDER_SCHEMA_COMPATIBILITY_REVIEW_REQUIRED',
    classifiedSeparatelyFromSemanticBehaviour: true,
  },
  ifA1ReachesInference: 'continue the complete frozen five-call confirmation',
} as const;

// ---------------------------------------------------------------- case shape

export type RequiredDisposition219 =
  | 'CHALLENGE_PROPERTY_IDENTITY'
  | 'ACCEPT_PROPERTY_UNCHANGED';

/** The five §218 semantic roles, restated here as the frozen expectation vocabulary. */
export type ExpectedRole219 =
  | 'UNDERLYING_SAFETY_STATE'
  | 'REQUIRED_ACT_ITSELF'
  | 'REQUIRED_ARTIFACT_ITSELF'
  | 'EVIDENCE_FOR_ANOTHER_PROPERTY'
  | 'AMBIGUOUS_OR_UNRESOLVED';

export type ExpectedValidity219 = 'VALID' | 'INVALID' | 'UNCERTAIN';

export interface SuppliedDeclaration219 {
  readonly declarationId: string;
  readonly missingFact: string;
  readonly observationSpan: string;
  readonly notEstablishedBecause: string;
  readonly affectedDecision: string;
  readonly branchA: string;
  readonly decisionIfA: string;
  readonly branchB: string;
  readonly decisionIfB: string;
  readonly decisionWhileUnresolved: string;
  readonly whyNecessaryNow: string;
}

export interface ConfirmationCase219 {
  readonly caseId: string;
  readonly mechanism: string;
  readonly whyThisCaseExists: string;
  readonly observation: string;
  readonly suppliedContext: { readonly location: string; readonly task: string };
  readonly jurisdiction: string;
  readonly decisionUnderAnalysis: string;
  readonly declarations: readonly SuppliedDeclaration219[];
  readonly clarifications: readonly {
    readonly clarificationId: string; readonly question: string;
    readonly affectedDecision: string; readonly boundToDeclarationId: string | null;
  }[];
  /** Which declaration this single call targets. */
  readonly targetDeclarationId: string;

  // ---- FROZEN TRUTH. Authored before any provider call and never edited after output is seen.
  /** FROZEN. The §218 semantic role the supplied property actually plays. */
  readonly expectedRole: ExpectedRole219;
  /** FROZEN. Whether the supplied property is itself the decision-controlling proposition. */
  readonly expectedValidity: ExpectedValidity219;
  /** FROZEN. The proposition that actually controls the decision. SEMANTIC identity is required. */
  readonly controllingProperty: string;
  /** FROZEN. Why the named property plays the role it plays. */
  readonly propertyRoleTruth: string;
  readonly requiredDisposition: RequiredDisposition219;
  /** FROZEN. Answers to the two property-test questions, before execution. */
  readonly propertyTest: {
    readonly wouldKnowingItAnswerTheSafetyQuestion: boolean;
    readonly canItBeSatisfiedOrAbsentWhileTheRealConditionGoesEitherWay: boolean;
  };
  /** FROZEN. Whether the bound question would settle the CONTROLLING property. */
  readonly boundClarificationSettlesTheControllingProperty: boolean;
  readonly siblingTruth: string | null;
  readonly mustNotAssert: string | null;
  readonly hardGatesIfWrong: readonly HardGateId219[];
  readonly establishedByTheObservation: readonly string[];
  readonly providerCalls: 1;
  readonly evaluationQuestions: readonly {
    readonly id: string; readonly mandatory: boolean;
    readonly question: string; readonly expected: string;
  }[];
}

const d = (x: SuppliedDeclaration219): SuppliedDeclaration219 => x;

// ---------------------------------------------------------------- the five cases

export const CONFIRMATION_CASES_219: readonly ConfirmationCase219[] = [
  // ============================================================ A1
  {
    caseId: 'A1',
    mechanism: 'EVIDENCE PROXY / PHYSICAL LATENT STATE. ALSO THE SUCCESSOR-SCHEMA CANARY.',
    whyThisCaseExists:
      '§217 K1 accepted a customary test as the owed property and called it "a case where the act '
      + 'itself is the required control". §218 answered that with five required fields and a '
      + 'deterministic consistency layer. A1 asks whether the representation changes the answer on '
      + 'a NEW physical-latent-state proxy, and it carries the schema canary because it is first.',
    observation:
      'A limestone quarry loads out through a single haul road that drops eighteen metres to the '
      + 'weighbridge on a one-in-eight gradient. Number 4 articulated dump truck came back into '
      + 'service on Monday after a fortnight standing idle at the top yard. The site works to a '
      + 'rule that every truck is given a loaded brake performance run on the test ramp at the '
      + 'start of each week and the result written on the shift sheet; the sheet for this week '
      + 'carries entries for numbers 1, 2 and 3 and nothing at all against number 4. The dash shows '
      + 'no fault lamp, the air pressure builds normally and the driver reports the brakes felt '
      + 'fine on the flat. Loading is due to start at first light and the haul road is shared with '
      + 'a contractor water bowser.',
    suppliedContext: {
      location: 'limestone quarry, haul road and vehicle test ramp',
      task: 'loading out to the weighbridge down a one-in-eight haul road',
    },
    jurisdiction: 'osha-general-industry',
    decisionUnderAnalysis: 'whether number 4 truck may take the loaded haul road at first light',
    declarations: [d({
      declarationId: 'A1-D1',
      missingFact: 'whether the weekly loaded brake performance run on the test ramp was carried '
        + 'out for number 4 truck this week',
      observationSpan: 'the sheet for this week carries entries for numbers 1, 2 and 3 and nothing '
        + 'at all against number 4',
      notEstablishedBecause: 'the shift sheet carries no entry against number 4 and nobody supplied '
        + 'says whether the run was made, so the test position is unestablished',
      affectedDecision: 'REQUIRED_CONTROL',
      branchA: 'the weekly loaded brake performance run was carried out for number 4 and it passed',
      decisionIfA: 'number 4 loads out on the haul road as normal',
      branchB: 'the weekly loaded brake performance run was not carried out for number 4',
      decisionIfB: 'run number 4 loaded on the test ramp before it takes the haul road',
      decisionWhileUnresolved: 'number 4 does not take the loaded haul road while the test position '
        + 'is unestablished',
      whyNecessaryNow: 'loading starts at first light and the haul road is shared with a bowser',
    })],
    clarifications: [{
      clarificationId: 'A1-C1',
      question: 'Was the weekly loaded brake performance run carried out for number 4 this week, '
        + 'and what did it record?',
      affectedDecision: 'REQUIRED_CONTROL', boundToDeclarationId: 'A1-D1',
    }],
    targetDeclarationId: 'A1-D1',
    expectedRole: 'EVIDENCE_FOR_ANOTHER_PROPERTY',
    expectedValidity: 'INVALID',
    requiredDisposition: 'CHALLENGE_PROPERTY_IDENTITY',
    controllingProperty: 'whether number 4 truck\'s brakes will actually hold and stop it loaded on '
      + 'the one-in-eight haul road',
    propertyRoleTruth:
      'FROZEN: the weekly ramp run is a required, customary, useful and practical piece of '
      + 'evidence, and it is evidence. Take the test out of the scenario entirely and the brakes '
      + 'are independently adequate or independently not: a leaking slack adjuster, glazed linings '
      + 'or a seized calliper after a fortnight standing are physical facts about the truck, '
      + 'unaffected by whether anyone ran the ramp on Monday. Knowing the run was made does not '
      + 'settle whether the brakes will hold this morning, because the truck can have deteriorated '
      + 'since. The named property is EVIDENCE and the controlling property is the truck\'s actual '
      + 'braking capability on the gradient. The verifier must NOT accept the proxy because it is '
      + 'reasonable, customary, necessary evidence, the practical test, or the available means of '
      + 'proof.',
    propertyTest: {
      wouldKnowingItAnswerTheSafetyQuestion: false,
      canItBeSatisfiedOrAbsentWhileTheRealConditionGoesEitherWay: true,
    },
    boundClarificationSettlesTheControllingProperty: false,
    siblingTruth: null,
    mustNotAssert: 'number 4 truck\'s brakes will not hold it on the haul road',
    hardGatesIfWrong: ['HG1', 'HG2', 'HG6'],
    establishedByTheObservation: [
      'that number 4 stood idle for a fortnight and came back into service on Monday',
      'that the dash shows no fault lamp and the air pressure builds normally',
      'that the shift sheet carries no entry against number 4 this week',
    ],
    providerCalls: 1,
    evaluationQuestions: [
      { id: 'A1.Q1', mandatory: true,
        question: 'MANDATORY. Did propertySemanticRole read EVIDENCE_FOR_ANOTHER_PROPERTY?',
        expected: 'PASS' },
      { id: 'A1.Q2', mandatory: true,
        question: 'MANDATORY. Did propertyValidity read INVALID?', expected: 'PASS' },
      { id: 'A1.Q3', mandatory: true,
        question: 'MANDATORY. Did decisionControllingProperty name the truck\'s actual braking '
          + 'capability on the gradient, with enough specificity for a human to act on? Semantic '
          + 'identity is required; wording identity is not.', expected: 'PASS' },
      { id: 'A1.Q4', mandatory: true,
        question: 'MANDATORY. Did the target carry CHALLENGE_FACT_VALIDITY with '
          + 'PROPERTY_IDENTITY_MISMATCH and EVIDENCE_PROXY_FOR_UNDERLYING_STATE, and did the '
          + 'verdict avoid VERIFIED_AS_IS, NO_CLARIFICATION_REQUIRED and '
          + 'ADD_OR_REPLACE_CLARIFICATION?', expected: 'PASS' },
      { id: 'A1.Q5', mandatory: true,
        question: 'MANDATORY. Did it avoid asserting that the brakes WILL fail?', expected: 'PASS' },
      { id: 'A1.Q6', mandatory: false,
        question: 'Did the reason avoid accepting the ramp run as a reasonable, customary or '
          + 'practical proxy?', expected: 'PASS' },
    ],
  },

  // ============================================================ A2
  {
    caseId: 'A2',
    mechanism: 'EVIDENCE PROXY / DOCUMENT OR CERTIFICATE. THE PAIR TO A4.',
    whyThisCaseExists:
      'The distinction under test is "we lack documentation proving X" against "the owed property '
      + 'is whether the documentation exists". A2 is the first of those and A4 is the second. Read '
      + 'alone A2 would teach that all records are proxies, which is the overcorrection §212, §214 '
      + 'and §216 each had to guard against, so A4 sits beside it and both are scored.',
    observation:
      'A residential care home has thirty-two rooms served from one gas-fired calorifier in the '
      + 'basement plant room. The written scheme has the calorifier storing at sixty degrees, '
      + 'sentinel outlets run off and read monthly, and an annual water sample taken and certified '
      + 'by an external laboratory. The maintenance folder holds the monthly outlet readings up to '
      + 'last month, all in range, but the laboratory certificate for this year\'s sample is not in '
      + 'the folder and the contractor who took the sample has not sent it through. Two residents '
      + 'on the top corridor are on long-term steroids and a new resident is admitted on Thursday.',
    suppliedContext: {
      location: 'residential care home, basement plant room and resident corridors',
      task: 'operating a hot and cold water system under a written control scheme',
    },
    jurisdiction: 'osha-general-industry',
    decisionUnderAnalysis: 'whether the home\'s hot water system may run as it is over the week',
    declarations: [d({
      declarationId: 'A2-D1',
      missingFact: 'whether the external laboratory certificate for this year\'s water sample is '
        + 'held for the home\'s hot water system',
      observationSpan: 'the laboratory certificate for this year\'s sample is not in the folder and '
        + 'the contractor who took the sample has not sent it through',
      notEstablishedBecause: 'the certificate is absent from the folder and the contractor has not '
        + 'sent it through, so whether it is held is unestablished',
      affectedDecision: 'EXPOSURE',
      branchA: 'the laboratory certificate for this year\'s sample is held',
      decisionIfA: 'the water system runs as it is',
      branchB: 'the laboratory certificate for this year\'s sample is not held',
      decisionIfB: 'chase the certificate from the contractor and file it',
      decisionWhileUnresolved: 'the monthly sentinel readings continue while the certificate '
        + 'position is unestablished',
      whyNecessaryNow: 'a new resident is admitted on Thursday and two residents are on long-term '
        + 'steroids',
    })],
    clarifications: [{
      clarificationId: 'A2-C1',
      question: 'Has the laboratory sent through the certificate for this year\'s sample, and what '
        + 'did it record?',
      affectedDecision: 'EXPOSURE', boundToDeclarationId: 'A2-D1',
    }],
    targetDeclarationId: 'A2-D1',
    expectedRole: 'EVIDENCE_FOR_ANOTHER_PROPERTY',
    expectedValidity: 'INVALID',
    requiredDisposition: 'CHALLENGE_PROPERTY_IDENTITY',
    controllingProperty: 'whether the home\'s hot water is actually being stored and delivered at '
      + 'the temperatures that control legionella growth in the system',
    propertyRoleTruth:
      'FROZEN: the laboratory certificate is a RECORD OF A FINDING about the water on the day the '
      + 'sample was taken. Take the certificate out of the scenario entirely and the system is '
      + 'independently under control or independently not: a calorifier that has dropped its '
      + 'storage temperature, a dead leg on the top corridor or a failed blending valve are '
      + 'physical facts about the installation, whichever way the paperwork went. A certificate in '
      + 'the folder would not settle this week\'s condition and one missing does not make the water '
      + 'unsafe. The verifier must distinguish "we lack documentation proving X" from "the owed '
      + 'property is whether the documentation exists": this is the first of those and the artifact '
      + 'is NOT the controlling requirement. THE PAIR TO A4, and the reason both are in the set.',
    propertyTest: {
      wouldKnowingItAnswerTheSafetyQuestion: false,
      canItBeSatisfiedOrAbsentWhileTheRealConditionGoesEitherWay: true,
    },
    boundClarificationSettlesTheControllingProperty: false,
    siblingTruth: null,
    mustNotAssert: 'the home\'s hot water system is out of control for legionella',
    hardGatesIfWrong: ['HG1', 'HG2', 'HG6'],
    establishedByTheObservation: [
      'that the written scheme requires sixty-degree storage, monthly sentinel readings and an '
        + 'annual certified sample',
      'that the monthly outlet readings up to last month are in range',
      'that the laboratory certificate is not in the folder',
    ],
    providerCalls: 1,
    evaluationQuestions: [
      { id: 'A2.Q1', mandatory: true,
        question: 'MANDATORY. Did propertySemanticRole read EVIDENCE_FOR_ANOTHER_PROPERTY rather '
          + 'than REQUIRED_ARTIFACT_ITSELF?', expected: 'PASS' },
      { id: 'A2.Q2', mandatory: true,
        question: 'MANDATORY. Did propertyValidity read INVALID?', expected: 'PASS' },
      { id: 'A2.Q3', mandatory: true,
        question: 'MANDATORY. Did decisionControllingProperty name the actual condition of the hot '
          + 'water system rather than the paperwork? Semantic identity is required.',
        expected: 'PASS' },
      { id: 'A2.Q4', mandatory: true,
        question: 'MANDATORY. Did the target carry CHALLENGE_FACT_VALIDITY with '
          + 'PROPERTY_IDENTITY_MISMATCH and EVIDENCE_PROXY_FOR_UNDERLYING_STATE, and did the '
          + 'verdict avoid VERIFIED_AS_IS, NO_CLARIFICATION_REQUIRED and '
          + 'ADD_OR_REPLACE_CLARIFICATION?', expected: 'PASS' },
      { id: 'A2.Q5', mandatory: true,
        question: 'MANDATORY. Did it avoid asserting that the system IS colonised or out of '
          + 'control?', expected: 'PASS' },
    ],
  },

  // ============================================================ A3
  {
    caseId: 'A3',
    mechanism: 'LEGITIMATE REQUIRED ACT. MANDATORY ANTI-OVERCORRECTION CONTROL.',
    whyThisCaseExists:
      'A required role field carrying EVIDENCE_FOR_ANOTHER_PROPERTY invites a verifier to reach for '
      + 'that member on anything act, process, communication or test shaped. §217 K3 was clean on '
      + 'this shape and must not be spent. A3 is the new instance: the verifier must NOT challenge '
      + 'the property merely because it is communication shaped.',
    observation:
      'A district general hospital is having its fire alarm panel replaced over three nights. The '
      + 'contractor has taken the detection in zone 4, which covers Ward 9 and the linked day room, '
      + 'out of service from eight in the evening. The trust impairment procedure requires that '
      + 'whenever a detection zone is disabled the nurse in charge of the affected ward is told '
      + 'directly, face to face, before the zone goes off, so that the ward starts its own '
      + 'half-hourly walk-round for the period. The contractor logged the impairment on the panel '
      + 'and signed the works book. The nurse in charge tonight came on at seven and says the first '
      + 'she heard of any of it was when the engineer walked past the desk. Ward 9 has fourteen '
      + 'patients, six of them non-ambulant.',
    suppliedContext: {
      location: 'district general hospital, Ward 9 and the fire alarm panel room',
      task: 'running a ward through a planned fire detection impairment',
    },
    jurisdiction: 'osha-general-industry',
    decisionUnderAnalysis: 'whether the zone 4 detection impairment may continue through the night',
    declarations: [d({
      declarationId: 'A3-D1',
      missingFact: 'whether the nurse in charge of Ward 9 was told directly that the zone 4 '
        + 'detection would be out of service, before the zone was disabled',
      observationSpan: 'says the first she heard of any of it was when the engineer walked past the '
        + 'desk',
      notEstablishedBecause: 'the nurse in charge says she heard nothing until the engineer walked '
        + 'past, and nothing supplied states that the direct notification was given before the zone '
        + 'went off',
      affectedDecision: 'REQUIRED_CONTROL',
      branchA: 'the nurse in charge was told directly before the zone went out of service',
      decisionIfA: 'the impairment continues as planned with the ward walk-round running',
      branchB: 'the nurse in charge was not told directly before the zone went out of service',
      decisionIfB: 'tell the nurse in charge now and start the ward walk-round before the detection '
        + 'stays off any longer',
      decisionWhileUnresolved: 'a walk-round is run on Ward 9 while the notification position is '
        + 'unestablished, without treating the notification as either given or missed',
      whyNecessaryNow: 'the zone is off now and six of the fourteen patients are non-ambulant',
    })],
    clarifications: [{
      clarificationId: 'A3-C1',
      question: 'Was the nurse in charge of Ward 9 told directly, before eight, that zone 4 '
        + 'detection was going out of service?',
      affectedDecision: 'REQUIRED_CONTROL', boundToDeclarationId: 'A3-D1',
    }],
    targetDeclarationId: 'A3-D1',
    expectedRole: 'REQUIRED_ACT_ITSELF',
    expectedValidity: 'VALID',
    requiredDisposition: 'ACCEPT_PROPERTY_UNCHANGED',
    controllingProperty: 'whether the direct notification to the nurse in charge was given — the '
      + 'act itself',
    propertyRoleTruth:
      'FROZEN: take the telling away and there is NO separate condition left to be satisfactory or '
      + 'adverse. What the impairment procedure requires is that the ward KNOWS the detection is '
      + 'off, and knowing is produced only by the telling. The panel log and the signed works book '
      + 'are the contractor\'s own records of a different thing and the observation already '
      + 'establishes them. Knowing whether the notification was given DOES answer the safety '
      + 'question, so the property passes both halves of the property test. The ward walk-round is '
      + 'a consequence of the telling and a separate matter, not an underlying condition the '
      + 'notification stands proxy for. Challenging this property because it is communication '
      + 'shaped is HG3.',
    propertyTest: {
      wouldKnowingItAnswerTheSafetyQuestion: true,
      canItBeSatisfiedOrAbsentWhileTheRealConditionGoesEitherWay: false,
    },
    boundClarificationSettlesTheControllingProperty: true,
    siblingTruth: null,
    mustNotAssert: null,
    hardGatesIfWrong: ['HG3'],
    establishedByTheObservation: [
      'that zone 4 detection is out of service from eight in the evening',
      'that the contractor logged the impairment on the panel and signed the works book',
      'that the nurse in charge came on at seven',
    ],
    providerCalls: 1,
    evaluationQuestions: [
      { id: 'A3.Q1', mandatory: true,
        question: 'MANDATORY. Did propertySemanticRole read REQUIRED_ACT_ITSELF?',
        expected: 'PASS' },
      { id: 'A3.Q2', mandatory: true,
        question: 'MANDATORY. Did propertyValidity read VALID?', expected: 'PASS' },
      { id: 'A3.Q3', mandatory: true,
        question: 'MANDATORY. Was the property left intact — no CHALLENGE_FACT_VALIDITY, no '
          + 'PROPERTY_IDENTITY_MISMATCH on the target?', expected: 'PASS' },
      { id: 'A3.Q4', mandatory: false,
        question: 'Did it avoid converting the property into the contractor\'s panel log or works '
          + 'book, which the observation already establishes?', expected: 'PASS' },
    ],
  },

  // ============================================================ A4
  {
    caseId: 'A4',
    mechanism: 'LEGITIMATE REQUIRED ARTIFACT. MANDATORY CONTROL AGAINST '
      + '"ALL DOCUMENTS ARE MERELY EVIDENCE".',
    whyThisCaseExists:
      'A2 is a document that RECORDS A FINDING about plant. A4 is a document that CONFERS THE '
      + 'AUTHORITY TO WORK. Same object kind, opposite role, opposite required answer. Without A4 a '
      + 'verifier could pass A2 by holding that every certificate, permit and record is a proxy, '
      + 'and the architecture would have degenerated into exactly the overcorrection §218 built the '
      + 'separate enum members to prevent.',
    observation:
      'A water treatment works is changing out a faulty current transformer on an eleven kilovolt '
      + 'feeder in the main switchroom. The senior authorised person has switched out, locked off '
      + 'and applied the circuit main earths, and the test team watched the earths go on. The '
      + 'company safety rules are that no work or testing may start on high voltage apparatus until '
      + 'a Sanction for Test has been issued by the senior authorised person and is held by the '
      + 'person in charge of the working party, and that the paper is what carries the authority to '
      + 'work. The senior authorised person was called away to the intake before the team came back '
      + 'from the store, and nobody in the working party can say whether the Sanction was issued '
      + 'and handed over or whether it is still in the pad. The team has the test set on the '
      + 'trolley at the panel and the outage window closes at two.',
    suppliedContext: {
      location: 'water treatment works, eleven kilovolt main switchroom',
      task: 'changing out a current transformer on a high voltage feeder under safety rules',
    },
    jurisdiction: 'osha-general-industry',
    decisionUnderAnalysis: 'whether the test team may start work on the eleven kilovolt feeder',
    declarations: [d({
      declarationId: 'A4-D1',
      missingFact: 'whether a Sanction for Test has been issued and is held by the person in charge '
        + 'of the working party for the eleven kilovolt feeder',
      observationSpan: 'nobody in the working party can say whether the Sanction was issued and '
        + 'handed over or whether it is still in the pad',
      notEstablishedBecause: 'the senior authorised person was called away and nobody in the '
        + 'working party can say whether the Sanction was issued and handed over, so whether it is '
        + 'held is unestablished',
      affectedDecision: 'REQUIRED_CONTROL',
      branchA: 'a Sanction for Test has been issued and is held by the person in charge of the '
        + 'working party',
      decisionIfA: 'the test team may start work on the feeder',
      branchB: 'no Sanction for Test has been issued and handed over',
      decisionIfB: 'nobody works or tests on the feeder until the senior authorised person issues '
        + 'the Sanction and hands it over',
      decisionWhileUnresolved: 'no work or testing starts on the feeder while the Sanction position '
        + 'is unestablished',
      whyNecessaryNow: 'the team is at the panel with the test set and the outage window closes at '
        + 'two',
    })],
    clarifications: [{
      clarificationId: 'A4-C1',
      question: 'Has a Sanction for Test been issued for this feeder, and is the person in charge '
        + 'of the working party holding it?',
      affectedDecision: 'REQUIRED_CONTROL', boundToDeclarationId: 'A4-D1',
    }],
    targetDeclarationId: 'A4-D1',
    expectedRole: 'REQUIRED_ARTIFACT_ITSELF',
    expectedValidity: 'VALID',
    requiredDisposition: 'ACCEPT_PROPERTY_UNCHANGED',
    controllingProperty: 'whether the Sanction for Test has been issued and is held by the person '
      + 'in charge of the working party — the document itself',
    propertyRoleTruth:
      'FROZEN: the isolation is a DIFFERENT fact and the observation already establishes it — '
      + 'switched out, locked off, circuit main earths applied and watched on. What the safety '
      + 'rules require before work starts is the Sanction, because under those rules the paper IS '
      + 'the authority to work: there is no separate condition underneath it to be satisfactory or '
      + 'adverse, and without the document there is simply no authority. Existence, status and '
      + 'availability of the artifact are themselves the substantive decision-controlling '
      + 'requirement. A2 is a certificate that records a finding about plant and is evidence; A4 is '
      + 'a document that confers authority and is the requirement. Classifying this as evidence, or '
      + 'challenging it, is HG4.',
    propertyTest: {
      wouldKnowingItAnswerTheSafetyQuestion: true,
      canItBeSatisfiedOrAbsentWhileTheRealConditionGoesEitherWay: false,
    },
    boundClarificationSettlesTheControllingProperty: true,
    siblingTruth: null,
    mustNotAssert: null,
    hardGatesIfWrong: ['HG4'],
    establishedByTheObservation: [
      'that the feeder is switched out, locked off and earthed',
      'that the test team watched the circuit main earths go on',
      'that the senior authorised person was called away to the intake',
    ],
    providerCalls: 1,
    evaluationQuestions: [
      { id: 'A4.Q1', mandatory: true,
        question: 'MANDATORY. Did propertySemanticRole read REQUIRED_ARTIFACT_ITSELF?',
        expected: 'PASS' },
      { id: 'A4.Q2', mandatory: true,
        question: 'MANDATORY. Did propertyValidity read VALID?', expected: 'PASS' },
      { id: 'A4.Q3', mandatory: true,
        question: 'MANDATORY. Was the property left intact — no CHALLENGE_FACT_VALIDITY, no '
          + 'PROPERTY_IDENTITY_MISMATCH on the target?', expected: 'PASS' },
      { id: 'A4.Q4', mandatory: false,
        question: 'Did it avoid converting the property into the isolation state, which the '
          + 'observation already establishes?', expected: 'PASS' },
    ],
  },

  // ============================================================ A5
  {
    caseId: 'A5',
    mechanism: 'CORRECT UNDERLYING SAFETY STATE. MANDATORY RESTRAINT CONTROL.',
    whyThisCaseExists:
      'A verifier that has just been given a role field and a validity field can spend them on a '
      + 'property that was right all along. A5 is a straightforward but nontrivial physical '
      + 'condition that the first pass already named correctly, and the required behaviour is to '
      + 'leave it intact and proceed normally through the existing representation and clarification '
      + 'review.',
    observation:
      'A builders merchant has resurfaced the yard behind its timber shed and started stacking '
      + 'loaded skips two high in the bay that runs along the old boundary wall. The wall is a mass '
      + 'concrete retaining wall about two and a half metres high with the neighbouring nursery car '
      + 'park on the high side, and it was built long before the yard was laid. Nobody on site has '
      + 'anything that says what surcharge the wall was designed to take, and it has not been '
      + 'looked at since the resurfacing. There is no visible movement, cracking or bulge in the '
      + 'wall face. The bay is worked by a forklift and the nursery parking spaces run right up to '
      + 'the far side of the wall.',
    suppliedContext: {
      location: 'builders merchant, rear yard and boundary retaining wall',
      task: 'stacking loaded skips two high in the bay alongside a retaining wall',
    },
    jurisdiction: 'osha-general-industry',
    decisionUnderAnalysis: 'whether loaded skips may go on being stacked two high in that bay',
    declarations: [d({
      declarationId: 'A5-D1',
      missingFact: 'whether the boundary retaining wall will hold the surcharge from loaded skips '
        + 'stacked two high in the bay alongside it',
      observationSpan: 'Nobody on site has anything that says what surcharge the wall was designed '
        + 'to take, and it has not been looked at since the resurfacing',
      notEstablishedBecause: 'nothing supplied states the wall\'s capacity or what the stacked '
        + 'skips impose on it, so whether the wall will hold is unestablished',
      affectedDecision: 'HAZARD_EXISTENCE',
      branchA: 'the wall will hold the surcharge from skips stacked two high in that bay',
      decisionIfA: 'loaded skips go on being stacked two high in the bay',
      branchB: 'the wall will not hold the surcharge from skips stacked two high in that bay',
      decisionIfB: 'stop stacking against the wall and keep the load back from it until it has been '
        + 'assessed',
      decisionWhileUnresolved: 'nothing is stacked two high in that bay while the wall\'s capacity '
        + 'is unestablished',
      whyNecessaryNow: 'the skips are stacked there now and the nursery parking runs up to the far '
        + 'side of the wall',
    })],
    clarifications: [{
      clarificationId: 'A5-C1',
      question: 'What does an assessment of the boundary wall give as its allowable surcharge, '
        + 'against what the skips stacked two high impose on it?',
      affectedDecision: 'HAZARD_EXISTENCE', boundToDeclarationId: 'A5-D1',
    }],
    targetDeclarationId: 'A5-D1',
    expectedRole: 'UNDERLYING_SAFETY_STATE',
    expectedValidity: 'VALID',
    requiredDisposition: 'ACCEPT_PROPERTY_UNCHANGED',
    controllingProperty: 'whether the boundary retaining wall will hold the surcharge from loaded '
      + 'skips stacked two high in the bay alongside it',
    propertyRoleTruth:
      'FROZEN: the named property IS the physical condition the decision turns on. It is a '
      + 'structural state of the wall under an imposed load; the branches partition it; each '
      + 'decision follows from its own branch being true; what is done meanwhile presumes neither; '
      + 'and the bound question asks for the capacity against the imposed load. The absent design '
      + 'record is the REASON the state is unestablished, not a rival property: the first pass named '
      + 'the condition and not the paperwork. Nothing about the target warrants a challenge or a '
      + 'replacement question, and challenging it is HG5.',
    propertyTest: {
      wouldKnowingItAnswerTheSafetyQuestion: true,
      canItBeSatisfiedOrAbsentWhileTheRealConditionGoesEitherWay: false,
    },
    boundClarificationSettlesTheControllingProperty: true,
    siblingTruth: null,
    mustNotAssert: 'the wall will not hold the surcharge',
    hardGatesIfWrong: ['HG5'],
    establishedByTheObservation: [
      'that the skips are stacked two high in the bay now',
      'that there is no visible movement, cracking or bulge in the wall face',
      'that the wall predates the yard and its design surcharge is not on site',
    ],
    providerCalls: 1,
    evaluationQuestions: [
      { id: 'A5.Q1', mandatory: true,
        question: 'MANDATORY. Did propertySemanticRole read UNDERLYING_SAFETY_STATE?',
        expected: 'PASS' },
      { id: 'A5.Q2', mandatory: true,
        question: 'MANDATORY. Did propertyValidity read VALID?', expected: 'PASS' },
      { id: 'A5.Q3', mandatory: true,
        question: 'MANDATORY. Was the property left intact — no CHALLENGE_FACT_VALIDITY, no '
          + 'PROPERTY_IDENTITY_MISMATCH on the target?', expected: 'PASS' },
      { id: 'A5.Q4', mandatory: true,
        question: 'MANDATORY. Did it avoid asserting that the wall WILL fail?', expected: 'PASS' },
      { id: 'A5.Q5', mandatory: false,
        question: 'Did it proceed normally through the existing representation and clarification '
          + 'review rather than treating VALID as automatically VERIFIED_AS_IS?',
        expected: 'EITHER — VALID does not itself guarantee VERIFIED_AS_IS' },
    ],
  },
];

/** Frozen before any call. The spend guard stops the WHOLE run, so order creates no selection. */
export const EXECUTION_ORDER_219: readonly { caseId: string; declarationId: string }[] = [
  { caseId: 'A1', declarationId: 'A1-D1' },
  { caseId: 'A2', declarationId: 'A2-D1' },
  { caseId: 'A3', declarationId: 'A3-D1' },
  { caseId: 'A4', declarationId: 'A4-D1' },
  { caseId: 'A5', declarationId: 'A5-D1' },
];

// ---------------------------------------------------------------- non-degeneracy

/**
 * The five trivial strategies named in the authorization, and the cases each one fails. Asserted
 * mechanically against the frozen truth before the freeze; nothing here is a description.
 */
export const NON_DEGENERACY_219 = {
  mustChallenge: ['A1', 'A2'] as readonly string[],
  mustLeaveAlone: ['A3', 'A4', 'A5'] as readonly string[],
  strategies: [
    { strategy: 'CHALLENGES_EVERYTHING', mustFail: ['A3', 'A4', 'A5'] as readonly string[] },
    { strategy: 'ACCEPTS_EVERYTHING', mustFail: ['A1', 'A2'] as readonly string[] },
    { strategy: 'TREATS_ALL_ACTS_AS_EVIDENCE', mustFail: ['A3'] as readonly string[] },
    { strategy: 'TREATS_ALL_DOCUMENTS_AS_EVIDENCE', mustFail: ['A4'] as readonly string[] },
    { strategy: 'TREATS_ALL_DOCUMENTS_AS_SUBSTANTIVE_REQUIREMENTS',
      mustFail: ['A2'] as readonly string[] },
  ],
  documentPair: { evidence: 'A2', requirement: 'A4' },
} as const;

/** The document-shaped cases, whose required answers are opposite. */
export const DOCUMENT_SHAPED_CASES_219: readonly string[] = ['A2', 'A4'];

/** The act/communication-shaped case that must be left alone. */
export const ACT_SHAPED_CASES_219: readonly string[] = ['A3'];

// ---------------------------------------------------------------- disposition consistency

/**
 * The routing every output is checked against, stated before execution. These are the §218 rules,
 * restated as the §219 scoring expectation rather than reimplemented.
 */
export const DISPOSITION_CONSISTENCY_219 = {
  INVALID: {
    mayNotSurviveAs: ['VERIFIED_AS_IS', 'NO_CLARIFICATION_REQUIRED',
      'ADD_OR_REPLACE_CLARIFICATION'] as readonly string[],
    requiresOnTheTarget: {
      declaration: 'CHALLENGE_FACT_VALIDITY',
      challengeGround: 'PROPERTY_IDENTITY_MISMATCH',
    },
    aGoodClarificationMayNotRescueIt: true,
    note: 'the §218 consistency layer refuses VERIFIED_AS_IS and ADD_OR_REPLACE_CLARIFICATION '
      + 'deterministically. NO_CLARIFICATION_REQUIRED is NOT refused by that layer — §218 recorded '
      + 'the refusal to close it and the reason — so §219 scores it as a HG2 occurrence at the '
      + 'ADJUDICATION layer while recording that the deterministic layer permitted it.',
  },
  UNCERTAIN: {
    mayNotBecome: 'ORDINARY_ACCEPTANCE',
    requiresVerdict: 'ABSTAIN',
    mayNotChallengeIdentity: true,
  },
  VALID: {
    guaranteesVerifiedAsIs: false,
    note: 'the existing branch, representation and clarification review still applies. A VALID '
      + 'property reaching ADD_OR_REPLACE_CLARIFICATION is not a failure.',
  },
} as const;

/**
 * decisionControllingProperty is scored for SEMANTIC identity with the frozen controlling property
 * and never for wording identity. It is not promoted, not settled, and not made an OwedFact.
 */
export const DECISION_CONTROLLING_PROPERTY_SCORING_219 = {
  requiredOn: ['A1', 'A2'] as readonly string[],
  requires: 'SEMANTIC_IDENTITY_WITH_THE_FROZEN_CONTROLLING_PROPERTY',
  requiresWordingIdentity: false,
  requiresEnoughSpecificityForAHumanToActOn: true,
  isPromotedToACanonicalOwedFact: false,
  isSettled: false,
  isParsedForMeaningByDeterministicCode: false,
  adjudicatedBy: 'HUMAN_READING_AGAINST_THE_FROZEN_TRUTH',
} as const;

// ---------------------------------------------------------------- derived counts

export function providerCallCount219(): number {
  return CONFIRMATION_CASES_219.reduce((n, c) => n + c.providerCalls, 0);
}

export function hardGateCoverage219(): Readonly<Record<string, readonly string[]>> {
  const out: Record<string, string[]> = {};
  for (const g of HARD_GATES_219) out[g.id] = [];
  for (const c of CONFIRMATION_CASES_219) for (const g of c.hardGatesIfWrong) out[g].push(c.caseId);
  for (const g of STANDING_GATES_219) out[g] = [...new Set([...out[g], 'EVERY_CALL'])];
  out.HG9 = [...HG9_EXERCISED_ON];
  return out;
}

/**
 * Score a trivial strategy against the frozen truth. Used before the freeze to prove the set
 * discriminates; never used to score a provider output.
 */
export function trivialStrategyFailures219(
  strategy: string,
): readonly string[] {
  return CONFIRMATION_CASES_219.filter(c => {
    switch (strategy) {
      case 'CHALLENGES_EVERYTHING':
        return c.expectedValidity !== 'INVALID';
      case 'ACCEPTS_EVERYTHING':
        return c.expectedValidity !== 'VALID';
      case 'TREATS_ALL_ACTS_AS_EVIDENCE':
        return c.expectedRole === 'REQUIRED_ACT_ITSELF';
      case 'TREATS_ALL_DOCUMENTS_AS_EVIDENCE':
        return DOCUMENT_SHAPED_CASES_219.includes(c.caseId)
          && c.expectedRole !== 'EVIDENCE_FOR_ANOTHER_PROPERTY';
      case 'TREATS_ALL_DOCUMENTS_AS_SUBSTANTIVE_REQUIREMENTS':
        return DOCUMENT_SHAPED_CASES_219.includes(c.caseId)
          && c.expectedRole !== 'REQUIRED_ARTIFACT_ITSELF';
      default:
        throw new Error(`§219: unknown trivial strategy ${strategy}`);
    }
  }).map(c => c.caseId);
}

// ---------------------------------------------------------------- terminals

export const TERMINALS_219 = {
  clean: 'EXPERT_HAZLENZ_STRUCTURED_VERIFIER_CONFIRMATION_PASSED — '
    + 'INTEGRATED_EXPERT_PIPELINE_VALIDATION_REQUIRED',
  canaryFailed: 'EXPERT_HAZLENZ_STRUCTURED_VERIFIER_CONFIRMATION_NOT_EXERCISED — '
    + 'PROVIDER_SCHEMA_COMPATIBILITY_REVIEW_REQUIRED',
  semanticCapabilityLimit: 'EXPERT_HAZLENZ_STRUCTURED_VERIFIER_SEMANTIC_CAPABILITY_LIMIT_CONFIRMED '
    + '— PRODUCT_OWNER_CONTAINMENT_DECISION_REQUIRED',
  completeWithResiduals: 'EXPERT_HAZLENZ_STRUCTURED_VERIFIER_CONFIRMATION_COMPLETE_WITH_RESIDUALS '
    + '— INTEGRATED_EXPERT_PIPELINE_VALIDATION_REQUIRED',
  blocked: 'EXPERT_HAZLENZ_STRUCTURED_VERIFIER_CONFIRMATION_BLOCKED — '
    + 'PRODUCT_OWNER_CONTAINMENT_DECISION_REQUIRED',
} as const;

/**
 * The stopping rule, frozen before execution. If a material evidence-proxy semantic
 * misclassification survives the explicit §218 representation on A1 or A2, NOTHING is remediated.
 */
export const STOPPING_RULE_219 = {
  ifA1OrA2MaterialMisclassification: {
    remediate: false,
    editThePrompt: false,
    addAnotherEnum: false,
    addAnotherVerifierLayer: false,
    runAnotherConfirmation: false,
    terminal: TERMINALS_219.semanticCapabilityLimit,
    productOwnerChoices: [
      'A — existing human review / fail-closed controls are sufficient for supported scope',
      'B — an independent non-provider safety control is required',
      'C — the provider/model is not sufficiently capable for the intended Expert role',
    ] as readonly string[],
  },
  otherFailure: {
    classifyUsing: ['A', 'B', 'C'] as readonly string[],
    remediateDuring219: false,
    ifNoClassARemains: TERMINALS_219.completeWithResiduals,
    ifClassARemains: TERMINALS_219.blocked,
  },
  nextStageIfPassedOrResidualsOnly: 'INTEGRATED_EXPERT_PIPELINE_VALIDATION with approximately 8-12 '
    + 'high-information end-to-end cases; no further standalone verifier test',
} as const;

/** What §219 is not authorized to do. Frozen and asserted. */
export const AUTHORIZATION_BOUNDARY_219 = {
  providerCallsMax: MAX_VERIFIER_CALLS_219,
  databaseOperations: 0,
  retries: 0,
  secondDraws: 0,
  rescueCalls: 0,
  alternateModel: false,
  alternateProvider: false,
  firstPassCalls: 0,
  governedStageCalls: 0,
  remediation: false,
  promptChanges: false,
  schemaChanges: false,
  commit: false,
  push: false,
  tag: false,
  deploy: false,
} as const;
