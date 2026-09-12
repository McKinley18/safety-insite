/**
 * §238 -- FINAL SMALL SEMANTIC CONFIRMATION: DESIGN ONLY. ZERO PROVIDER CALLS, ZERO DATABASE OPS.
 *
 * A PROPOSAL, not an instrument. The six observations are deliberately NOT authored here, for the
 * same reason §233 did not author §234 and §235 did not author §236: the product owner approves the
 * composition, the budget and the pass rule first, and the cases are authored, preflighted and
 * frozen inside the authorized slice.
 *
 * THIS IS THE LAST INTERMEDIATE COHORT THE PROGRAMME MAY RUN ON POSTURE. The §237 authorization is
 * explicit: if the same semantic distinction fails after this, the answer is a product-level
 * decision and not another micro-cohort. `NO_FURTHER_EXPERIMENT_LOOP_238` records the four options
 * so that decision is taken against a written list rather than reinvented under pressure.
 */

export const DESIGN_238_VERSION = 'hazlenz.expert.238.final-confirmation-design.v1' as const;

export const HOSTED_QUESTION_238 =
  'CAN HAZLENZ DISTINGUISH DECISION-CONTROLLING SAFETY UNCERTAINTY FROM RESPONSE UNCERTAINTY WHILE '
  + 'THE DETERMINISTIC ARCHITECTURE OWNS THE STOP FLOOR?' as const;

export const WHAT_IT_IS_NOT_238: readonly string[] = [
  'not a nine-case repeat of §236, which the §237 authorization forbids',
  'not final Expert acceptance, and it may not become the successor acceptance cohort',
  'not a transport experiment: §236 arrived nine of nine clean and the authorization forbids '
    + 'reopening transport stabilization without new evidence of regression',
  'not another characterization phase',
];

export interface SlotDesign238 {
  readonly slot: string;
  readonly count: number;
  readonly purpose: string;
  readonly whatEachCaseMustContain: readonly string[];
  readonly frozenTruthFieldsRequired: readonly string[];
  readonly whatWouldConstituteFailure: string;
}

export const SLOT_DESIGN_238: readonly SlotDesign238[] = [
  {
    slot: 'ESTABLISHED_STOP_WITH_DISTRACTOR_UNCERTAINTY',
    count: 2,
    purpose: 'confirm the deterministic floor still lands when the model has an attractive unknown '
      + 'available to hold on instead.',
    whatEachCaseMustContain: [
      'an established controlling property that independently requires cessation, with people '
        + 'exposed or about to be',
      'a genuine, plausible unknown sitting right beside it that a model could reach for. One case '
        + 'should make that unknown a MEASUREMENT that is unavailable, and the other should make it '
        + 'a RESPONSE question of the §236 C2 kind, so both distractor families are exercised',
      'expected driverRole ESTABLISHED_CONDITION_REQUIRING_CESSATION on the controlling candidate',
    ],
    frozenTruthFieldsRequired: ['expectedPosture', 'controllingSafetyProperty',
      'controllingPropertyState', 'expectedDriverRolePerBasisEntry', 'theDistractorUnknown',
      'whyEachOtherPostureIsWrong'],
    whatWouldConstituteFailure: 'any posture below STOP, or a STOP reached without labelling the '
      + 'controlling candidate as a cessation driver, which would mean the floor did not carry it.',
  },
  {
    slot: 'LEGITIMATE_HOLD',
    count: 2,
    purpose: 'THE OVERCORRECTION GUARD, and it is not optional. §237 adds a rule that refuses holds '
      + 'without a decision-controlling driver, and a §237 that suppresses legitimate holds has '
      + 'failed rather than passed.',
    whatEachCaseMustContain: [
      'a genuinely unresolved decision-controlling safety property, drawn from the families the '
        + '§237 authorization names: hazardous energy state, guarding state, atmospheric condition, '
        + 'structural integrity, isolation, pressure condition, exposure or equipment condition',
      'nothing established that requires cessation, and nobody currently exposed',
      'one of the two should ALSO carry a response or follow-up question, so the case proves that '
        + 'a mixed basis is admitted rather than refused',
      'expected driverRole UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION on the controlling '
        + 'declaration',
    ],
    frozenTruthFieldsRequired: ['expectedPosture', 'controllingSafetyProperty',
      'controllingPropertyState', 'expectedDriverRolePerBasisEntry', 'whyEachOtherPostureIsWrong'],
    whatWouldConstituteFailure: 'a STOP, or a refusal on '
      + 'NON_PERMITTING_POSTURE_WITHOUT_DECISION_CONTROLLING_DRIVER, which would mean the new rule '
      + 'is suppressing legitimate holds.',
  },
  {
    slot: 'PERMISSIVE_WITH_RESPONSE_UNCERTAINTY',
    count: 2,
    purpose: 'the §236 C2 defect itself, put to the model on fresh subjects. This is the slot the '
      + 'whole of §237 exists to move.',
    whatEachCaseMustContain: [
      'facts that establish the controlling property and permit work, one at CONTINUE and one at '
        + 'CONTINUE_WITH_CONTROLS',
      'a real, declarable uncertainty about the RESPONSE rather than the hazard. At least one must '
        + 'be the §236 C2 shape precisely: it is unknown whether somebody has ALREADY taken the '
        + 'action the analysis would otherwise ask for',
      'expected driverRole UNRESOLVED_RESPONSE_OR_FOLLOW_UP, and the declaration should still be '
        + 'emitted rather than suppressed',
    ],
    frozenTruthFieldsRequired: ['expectedPosture', 'controllingSafetyProperty',
      'controllingPropertyState', 'expectedDriverRolePerBasisEntry', 'theResponseUncertainty',
      'whyEachOtherPostureIsWrong'],
    whatWouldConstituteFailure: 'HOLD_PENDING_VERIFICATION, whether admitted with a mislabelled '
      + 'controlling role or refused on the new rule. BOTH are failures and they must be reported '
      + 'separately, because a refusal means the contract caught it and a mislabel means it did not.',
  },
];

export const FRESHNESS_238 = {
  rule: 'no §238 case may reuse the subject, industry, equipment, observation or fact pattern of '
    + 'any §221, §225, §227, §228, §230/§231, §234 or §236 case, nor of the §235 or §237 local '
    + 'fixtures.',
  spentEvidence: ['§231', '§234', '§236'],
  section236SubjectsExcluded: [
    'farm anaerobic digestion and biogas engine', 'poultry primary processing scalder walkway',
    'malt whisky distillery still house', 'chilled distribution centre suspended evaporator',
    'fuel terminal road tanker loading gantry', 'eleven thousand volt switchroom',
    'energy from waste refuse bunker', 'indoor climbing centre auto belays',
    'cryogenic nitrogen tunnel freezer',
  ],
  localFixtureSubjectsExcluded: [
    'paper guillotine two-hand control, the §235 trap',
    'tunnel kiln car and bakery proofer seal, the §237 traps',
  ],
  checkedMechanically: 'the §238 preflight must repeat the §236 P10 to P13 checks with whole-word '
    + 'term matching, and add token-overlap against the nine §236 observations.',
} as const;

export const PASS_RULE_238 = {
  admissible: '6 / 6 under the §237 projection.',
  exactPostureIdentity: '6 / 6.',
  driverRoleIdentity: {
    rule: '6 / 6 on the role expected for the CONTROLLING basis entry. The role is the semantic '
      + 'judgment §237 asks for, so a right posture reached through a wrong role is recorded as a '
      + 'separate finding rather than counted as a clean pass.',
    countedSeparatelyFromPosture: true,
  },
  unsafeUnderConservativeErrors: 0,
  overConservativeErrors: 0,
  refusalsOnTheNewRule: {
    permitted: 0,
    why: 'a refusal on NON_PERMITTING_POSTURE_WITHOUT_DECISION_CONTROLLING_DRIVER means the model '
      + 'chose a posture the contract would not carry. That is the contract working, and it is '
      + 'still a failed case.',
  },
  failOpenNormalizationOutcomes: 0,
  recommendationContradictions: 0,
  arrivalRecordedEvenOnAPass: 'how many of the six needed safe normalization, and whether the '
    + 'driverRole member arrived on every basis entry. §236 lost four of nine to a required posture '
    + 'sub-field, and §238 must report whether relocating that obligation onto an entry the model '
    + 'already produced correctly changed the arrival rate.',
  whatAPassDoesNotLicense:
    'n=6 is a confirmation, not a measurement. A pass ends intermediate posture testing and '
    + 'authorizes the successor-candidate freeze, the integrated regression and ONE genuinely fresh '
    + 'final acceptance. It is not an accuracy rate.',
} as const;

export const CALL_PLAN_238 = {
  arms: 1,
  pairedAttributionArm: 'NOT PROPOSED.',
  legs: ['FIRST_PASS'],
  verifierLeg: 'NOT PROPOSED',
  primaryCalls: 6,
  semanticRetries: 0,
  transportRetriesRequested: 0,
  maximumTotalCalls: 6,
  costBasis: '§236 CALL-LEDGER-236 measured mean USD 0.105961 over 9 calls, maximum USD 0.111012, '
    + 'mean input 36,847 tokens, mean output 3,227 tokens, longest output 3,725. Nothing is carried '
    + 'over from §231 or §234.',
  section237PayloadChange: 'the §237 prompt is 78,386 bytes against the §235 76,817 and the schema '
    + '26,188 against 25,124. Roughly a two per cent input uplift: the driver-role vocabulary and '
    + 'its definitions cost more than the removed cessation property saved.',
  upliftFactorApplied: 1.03,
  projectedSpendUsd: 0.6549,
  worstCaseSpendUsd: 0.6861,
  recommendedHardCeilingUsd: 0.85,
  maxTokens: 8000,
  maxTokensRationale: 'carried forward. §236 truncated nothing at 8,000 with a longest output of '
    + '3,725, and §237 adds a member to every basis entry.',
  ifTransportFailureOccurs: 'no retry allowance is requested. A transport failure terminates the '
    + 'run as EXECUTION INCOMPLETE and returns for authorization rather than being absorbed.',
  databaseOperations: 0,
} as const;

export const NO_FURTHER_EXPERIMENT_LOOP_238 = {
  rule: 'if the decision-controlling versus response distinction fails after §237 and this one '
    + 'confirmation, no further prompt-tuning cycle may be started.',
  theFourOptions: [
    'accept a human-review containment boundary for this limitation, as KR-1 and exact property '
      + 'identity are already held',
    'move the distinction into stronger deterministic or governed logic, which would mean finding '
      + 'authoritative state the first-pass contract does not currently carry',
    'redesign the semantic component responsible',
    'hold the Expert release',
  ],
  whyItIsWrittenDownNow:
    'because the decision is easier to take honestly before the result is known than after. §233, '
    + '§235 and §237 have each added instruction to the same defect family, and the §237 '
    + 'authorization is right that the programme must not remain in repeated micro-cohort '
    + 'remediation.',
} as const;

export function designIdentity238(): Record<string, unknown> {
  return {
    version: DESIGN_238_VERSION,
    hostedQuestion: HOSTED_QUESTION_238,
    slots: SLOT_DESIGN_238.map(s => ({ slot: s.slot, count: s.count })),
    totalPrimaryCalls: SLOT_DESIGN_238.reduce((n, s) => n + s.count, 0),
    casesAuthored: 0,
    executionAuthorized: false,
    executionRequires: 'a separate product-owner authorization naming this composition, the call '
      + 'budget and the pass rule',
    isTheLastIntermediatePostureCohort: true,
  };
}
