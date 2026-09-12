/**
 * EXPERT HAZLENZ — §238 FINAL SMALL POSTURE SEMANTIC CONFIRMATION INSTRUMENT.
 *
 * ONE QUESTION:
 *
 *   CAN HAZLENZ DISTINGUISH DECISION-CONTROLLING SAFETY UNCERTAINTY FROM RESPONSE OR FOLLOW-UP
 *   UNCERTAINTY WHILE CORRECTLY ASSIGNING DRIVER CONSEQUENCE AND IMMEDIATE WORK POSTURE?
 *
 * IT SCORES TWO THINGS INDEPENDENTLY AND NEVER COLLAPSES THEM. A correct posture reached through the
 * wrong semantic role is not evidence of capability, so posture identity and driver-role identity
 * are separate verdicts and a case can fail either one alone.
 *
 * This is the LAST authorized intermediate hosted posture cohort. It is not final Expert acceptance.
 *
 * ==================== HOW DRIVER-ROLE TRUTH IS PREREGISTERED WITHOUT KNOWING THE KEYS ==========
 *
 * The model authors its own candidateKeys and declarationIds, so the frozen truth cannot name the
 * references in advance. What it CAN freeze, and does, is ROLE PRESENCE: for each of the two roles
 * that carry a decision, whether the admitted analysis must contain at least one driver with it or
 * none at all. That is decidable from the output alone, needs no reading of prose, and is exactly
 * the distinction the §237 authorization asked §238 to measure.
 *
 *   A cases   cessation AT_LEAST_ONE. A2 also requires NONE controlling, because its only unknown
 *             is a response question and elevating it is the §236 C2 error.
 *   B cases   cessation NONE and controlling AT_LEAST_ONE. A cessation role here is a false driver.
 *   C cases   cessation NONE and controlling NONE. Any controlling driver on a permissive posture
 *             means a response question was promoted into one.
 *
 * A1 deliberately leaves the controlling role NOT_SCORED: its distractor is a genuine second
 * property that could legitimately gate resumption, and §236 B2 established that a STOP may carry a
 * real separate unresolved property. Scoring it either way would punish a correct analysis.
 */

import { createHash } from 'crypto';

import {
  IMMEDIATE_SAFETY_POSTURES_233, POSTURE_DEFINITIONS_233, POSTURE_PERMITS_CONTINUED_WORK,
  POSTURE_PROTECTIVE_RANK, type ImmediateSafetyPosture233,
} from './expert-233-posture-contract';
import {
  FIRST_PASS_CONTRACT_237_VERSION, POSTURE_DRIVER_ROLES_237, DRIVER_ROLE_DEFINITIONS_237,
  PROVIDER_VISIBLE_RULES_237, CESSATION_ROLE_237,
  type PostureDriverRole237,
} from './expert-237-posture-contract';
import { ACCEPTANCE_CASES_230 } from './expert-230-final-acceptance-instrument';
import { POSTURE_CASES_234 } from './expert-234-posture-discrimination-instrument';
import { CONFIRMATION_CASES_236 } from './expert-236-confirmation-instrument';
import {
  SLOT_DESIGN_238, PASS_RULE_238, CALL_PLAN_238, NO_FURTHER_EXPERIMENT_LOOP_238,
  HOSTED_QUESTION_238, WHAT_IT_IS_NOT_238, FRESHNESS_238 as FRESHNESS_DESIGN_238,
} from './expert-238-final-confirmation-design';

export const INSTRUMENT_238_VERSION = 'hazlenz.expert.238.final-confirmation.v1' as const;

export const IMPLEMENTATION_UNDER_TEST_238 = {
  sections: ['§233', '§235 normalizer', '§237'],
  contractVersion: FIRST_PASS_CONTRACT_237_VERSION,
  section233ImplementationDigest:
    '5517337ded68b7b8901dcb588355f98b4bdbf2dfe4ae54a4af0266af1d4ce5af',
  section235StabilizationDigest:
    '1f00a67ec9ecff5ba1c5b221ea057d63af8ce87062e520d6c61693623f03a4bd',
  section237EvidencePackage:
    'verification/expert-hazlenz-237-posture-architecture-closure-2026-09-11',
  protectedCompositeIdentity:
    '37ce9eb8e9db62288b0a4953072bb487f38beab962d4716ad74be47036e2e2cb',
  mayBeModifiedDuringExecution: false,
} as const;

export const AUTHORIZATION_238 = {
  slice: 'FINAL_SMALL_POSTURE_SEMANTIC_CONFIRMATION',
  primaryProviderCalls: 6,
  maximumProviderCalls: 6,
  arms: 1, legs: ['FIRST_PASS'],
  semanticRetriesAuthorized: false,
  transportRetriesAuthorized: false,
  projectedSpendUsd: 0.6549,
  hardSpendCeilingUsd: 0.85,
  databaseOperations: 0,
  commit: false, push: false, tag: false, deploy: false,
  section233Or235Or237ModifiedDuringExecution: false,
  isTheLastIntermediatePostureCohort: true,
} as const;

export const AUTHORING_INDEPENDENCE_238 = {
  caseAuthoring: 'THIS SESSION', truthDefinition: 'THIS SESSION', scoringRules: 'THIS SESSION',
  implementationUnderTest: '§233, the §235 normalizer and §237',
  statisticalIndependence: false,
  whyNot: 'this session authored the cases, the truth, the scoring rules AND the §237 driver-role '
    + 'vocabulary being tested. That is the sharpest form of the limitation the programme has '
    + 'recorded since §230 and it is not mitigated by being written down.',
  mitigationsActuallyHonoured: [
    'every expected answer was derived from the case facts and the frozen truth axis, and written '
      + 'before any provider call',
    'four of six cases expect ZERO cessation drivers and four expect ZERO continuation-controlling '
      + 'drivers, so the cohort can fail by over-labelling as easily as by under-labelling',
    'one HOLD case is authored specifically as an overcorrection trap and one STOP case is authored '
      + 'specifically to be unremarkable rather than alarming',
    'no §231, §234, §236 or local-fixture subject is reused, checked mechanically',
  ],
  effectOnTheResult: 'a pass is evidence that the distinction was demonstrated on a preregistered '
    + 'fresh boundary cohort of six. It is not independent validation and at n=6 it is not a rate.',
} as const;

export const FRESHNESS_238 = {
  rule: FRESHNESS_DESIGN_238.rule,
  spentEvidence: ['§231', '§234', '§236'],
  excludedSubjectTerms: [
    // §230 / §231
    'carding', 'textile mill', 'flatwork ironer', 'commercial laundry', 'electroplating',
    'grain elevator', 'headhouse', 'compressed air receiver', 'spray booth', 'injection moulding',
    'sprinkler deflector', 'racking', 'powered industrial truck', 'forklift', 'emergency eyewash',
    'dust collector', 'bolting', 'excavation', 'trench', 'formwork', 'soffit', 'scaffold',
    'temporary power distribution', 'demolition', 'projecting reinforcement', 'metal deck',
    'mobile crane', 'quarry', 'limestone', 'sand and gravel', 'haul road', 'stockpile',
    'cone crusher', 'belt conveyor', 'blast site', 'substation', 'haulage drift',
    // §221 / §225 / §227 / §228
    'wood cutter', 'solvent drum', 'core drilling', 'fire extinguisher', 'flour mill', 'mezzanine',
    'chain sling', 'local exhaust ventilation', 'fume cupboard', 'ammonia', 'MEWP', 'steam boiler',
    'pull-cord', 'asbestos', 'eyebolt',
    // §234
    'chlorine drum store', 'galvanizing', 'molten zinc', 'container forming machine',
    'fermenting cellar', 'picking cabin', 'vehicle deck', 'orchestra pit', 'cooling tower',
    'legionella', 'ballast tank', 'induction furnace', 'battery room', 'nose jack',
    'calcium hypochlorite', 'curing autoclave', 'magnetic resonance', 'scrap metal',
    // §236
    'anaerobic digestion', 'flame arrestor', 'scalder', 'peracetic acid', 'still house',
    'spirit receiver', 'evaporator', 'order picker', 'loading gantry', 'bonding clamp',
    'switchroom', 'single line diagram', 'refuse bunker', 'monitor cannon', 'auto belay',
    'tunnel freezer', 'oxygen depletion monitor',
    // local fixtures §235 and §237
    'guillotine', 'two-hand control', 'tunnel kiln', 'proofer',
  ],
  adjacentButDistinctRecorded: [
    'A2 (heavy goods vehicle four-post lift) and §234 F4 (aircraft jacking) both raise a vehicle. '
      + 'The §234 case turns on an unknown floor rating with nobody exposed and the lift not '
      + 'started, expected HOLD. The §238 case turns on an examiner-condemned safety nut with a '
      + 'fitter underneath a raised vehicle, expected STOP. Opposite property, opposite posture.',
    'B1 (hospital medical oxygen manifold) and §236 B3 (high voltage switching) are both '
      + 'overcorrection traps on a serious-sounding system. §236 B3 turns on a records question; '
      + 'B1 turns on a physical property, an unexplained pressure fall, which is a different kind '
      + 'of unknown.',
  ],
  checkedMechanically: 'whole-word excluded-term matching, plus token overlap against the thirty '
    + '§230, sixteen §234 and nine §236 observations, plus no intra-cohort paraphrase.',
} as const;

// ================================================================ scoring, frozen before spend

export const ROLE_PRESENCE_EXPECTATIONS = ['AT_LEAST_ONE', 'NONE', 'NOT_SCORED'] as const;
export type RolePresenceExpectation = (typeof ROLE_PRESENCE_EXPECTATIONS)[number];

export const SCORING_RULES_238 = {
  twoIndependentVerdicts: {
    rule: 'POSTURE IDENTITY and DRIVER-ROLE IDENTITY are scored separately and are never collapsed. '
      + 'Every case therefore lands in one of four cells: correct posture and correct roles, '
      + 'correct posture and wrong roles, wrong posture and correct roles, wrong posture and wrong '
      + 'roles.',
    whyItMatters: 'a lucky correct posture with an incorrect semantic basis is not evidence of '
      + 'capability, and reporting one number would hide exactly that.',
  },
  postureIdentity: {
    rule: 'exact identity against the preregistered expected posture. No partial credit for being '
      + 'more conservative.',
    underConservative: 'actual protective rank below expected.',
    overConservative: 'actual protective rank above expected.',
  },
  driverRoleIdentity: {
    rule: 'the admitted analysis must match the frozen ROLE PRESENCE expectation for both '
      + 'decision-carrying roles.',
    decidableWithoutKnowingTheKeys: 'the model authors its own identifiers, so the truth freezes '
      + 'whether each role must be present at least once or must not appear at all. That is read '
      + 'off the output with no prose and no adjudication.',
    falseCessationDriver: `a ${CESSATION_ROLE_237} on a case whose truth says NONE.`,
    responseUncertaintyElevated: 'an UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION on a case whose '
      + 'truth says NONE, which is the §236 C2 error expressed in the §237 vocabulary.',
    missingCessationDriver: `no ${CESSATION_ROLE_237} on a case whose truth says AT_LEAST_ONE.`,
  },
  contractAdmission: {
    rule: 'all 6 / 6 admitted by the §237 projection. Safe normalization counts as admitted; no '
      + 'repair of semantic content is permitted and none is performed.',
    checks: [
      'requiredBy structure valid', 'ref valid', 'refKind valid', 'driverRole valid',
      'no contradictory driver and posture state', 'a cessation driver forces STOP',
      'STOP is not supported solely by control-level drivers',
      'a non-permissive posture carries at least one cessation or continuation-controlling driver',
      'declaration and ACTIVE candidate coverage valid',
      'recommendation agrees with the posture', 'no fail-open behaviour',
    ],
  },
  manufacturedUncertainty: {
    rule: 'the frozen §234 manufactured-declaration test, carried forward unchanged, counted only '
      + 'where it altered the posture.',
  },
  passRule: {
    admitted: '6 / 6',
    exactPostureIdentity: '6 / 6',
    driverRoleIdentity: '6 / 6',
    unsafeUnderConservativeErrors: 0,
    overConservativeErrors: 0,
    manufacturedUncertaintyAlteringPosture: 0,
    responseUncertaintyElevatedToControlling: 0,
    falseCessationDrivers: 0,
    recommendationContradictions: 0,
    structuralContractFailures: 0,
    conjunctive: true,
    noAggregateScoreMayCompensate: true,
    thresholdMayBeChangedAfterExecution: false,
  },
  interpretationLimit:
    'a pass does NOT establish a population accuracy rate. It establishes only that the final '
    + 'targeted semantic distinction was demonstrated on a fresh preregistered boundary cohort '
    + 'after the architecture was stabilized. Final Expert capability still requires successor '
    + 'acceptance, and §231, §234, §236 and §238 are all spent evidence.',
  theFourOptionsIfItFails: NO_FURTHER_EXPERIMENT_LOOP_238.theFourOptions,
} as const;

// ================================================================ the case type

export const CATEGORIES_238 = [
  'ESTABLISHED_STOP_WITH_DISTRACTOR', 'LEGITIMATE_HOLD', 'PERMISSIVE_WITH_RESPONSE_UNCERTAINTY',
] as const;
export type Category238 = (typeof CATEGORIES_238)[number];

export const DISTRACTOR_KINDS_238 = [
  'UNAVAILABLE_MEASUREMENT', 'RESPONSE_OR_FOLLOW_UP', 'ADMINISTRATIVE_RECORD', 'NONE',
] as const;
export type DistractorKind238 = (typeof DISTRACTOR_KINDS_238)[number];

export interface ConfirmationCase238 {
  readonly caseId: string;
  readonly category: Category238;
  readonly sector: string;
  readonly whyThisCaseEarnsItsPlace: string;

  readonly setting: string;
  readonly observation: string;
  readonly suppliedContext: { readonly location: string; readonly task: string };
  readonly jurisdiction: string;
  readonly hazardFamilies: readonly string[];

  // ---- FROZEN TRUTH
  readonly decisionUnderAnalysis: string;
  readonly expectedPosture: ImmediateSafetyPosture233;
  readonly controllingSafetyProperty: string;
  readonly controllingPropertyState: 'ESTABLISHED' | 'UNRESOLVED';
  /** What the controlling driver must be labelled, so an adjudicator can find it in the output. */
  readonly expectedControllingDriverRole: PostureDriverRole237;
  readonly expectedControllingDriverDescription: string;
  /** THE MACHINE-CHECKABLE DRIVER-ROLE TRUTH. Presence, not identity, because keys are authored. */
  readonly expectedRolePresence: Readonly<Record<
    'ESTABLISHED_CONDITION_REQUIRING_CESSATION' | 'UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION',
    RolePresenceExpectation>>;
  readonly distractor: { readonly kind: DistractorKind238; readonly description: string };
  /** Whether a declaration must exist for the posture to be structurally reachable at all. */
  readonly declarationRequiredForThePosture: boolean;
  readonly activeWorkState: {
    readonly workInProgress: boolean; readonly peopleCurrentlyExposed: boolean;
    readonly description: string;
  };
  readonly establishedFacts: readonly string[];
  readonly truthAnchors: readonly string[];
  readonly controlsAlreadyInPlace: readonly string[];
  readonly newControlsRequired: readonly string[];
  readonly requiredResumeCondition: string | null;
  readonly whyEachOtherPostureIsWrong: Readonly<Partial<Record<ImmediateSafetyPosture233, string>>>;
  readonly obviousCatastrophicEvent: boolean;

  readonly firstPassCalls: 1;
  readonly verifierCalls: 0;
  readonly governedRecords: readonly [];
  readonly prohibitedInventedAuthority: string;
}

const k = (x: ConfirmationCase238): ConfirmationCase238 => x;

// ================================================================ the six scenarios

export const CONFIRMATION_CASES_238: readonly ConfirmationCase238[] = [

  // ============================================== A. ESTABLISHED STOP + DISTRACTOR UNCERTAINTY
  k({
    caseId: 'A1', category: 'ESTABLISHED_STOP_WITH_DISTRACTOR', sector: 'SAWMILLING',
    whyThisCaseEarnsItsPlace: 'a STOP that looks like nothing. Three short cracks in a saw blade, '
      + 'and the manufacturer instruction on the wall says a cracked blade comes out of service. '
      + 'The test is whether consequence is recognised, not whether an emergency is recognised. The '
      + 'distractor is an UNAVAILABLE MEASUREMENT: nobody knows the extraction flow.',
    setting: 'A softwood sawmill, band resaw.',
    observation:
      'The band resaw was re-tensioned last week after a blade break. At this morning pre-shift '
      + 'check the sawyer found three cracks running from the gullets on the back edge of the '
      + 'blade, each between four and six millimetres long. The blade manufacturer instruction '
      + 'sheet hanging beside the machine states that a blade showing any crack in the body is to '
      + 'be removed from service immediately, and no crack-arrest holes have been drilled. The saw '
      + 'is running production and the sawyer stands at the infeed about eight hundred millimetres '
      + 'from the blade line. The wheel guards and the blade guard are fitted and undamaged and the '
      + 'brake was tested at the weekly check. Separately, the differential pressure gauge on the '
      + 'sawdust extraction has been reading erratically for a week and nobody can say whether the '
      + 'extraction is at its design flow.',
    suppliedContext: { location: 'sawmill resaw line',
      task: 'resawing boards on a band resaw' },
    jurisdiction: 'US', hazardFamilies: ['machinery', 'struck_by', 'respirable_dust'],
    decisionUnderAnalysis: 'whether the band resaw may keep running with the cracked blade fitted',
    expectedPosture: 'STOP',
    controllingSafetyProperty: 'whether a cracked band blade may remain in service at speed with an '
      + 'operator at the infeed',
    controllingPropertyState: 'ESTABLISHED',
    expectedControllingDriverRole: 'ESTABLISHED_CONDITION_REQUIRING_CESSATION',
    expectedControllingDriverDescription: 'the cracked band blade in service',
    expectedRolePresence: {
      ESTABLISHED_CONDITION_REQUIRING_CESSATION: 'AT_LEAST_ONE',
      UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION: 'NOT_SCORED',
    },
    distractor: { kind: 'UNAVAILABLE_MEASUREMENT',
      description: 'the extraction flow cannot be established. It is a genuine second property '
        + 'that could legitimately gate resumption, which is why the controlling role is not '
        + 'scored on this case: §236 B2 established that a STOP may carry a real separate '
        + 'unresolved property.' },
    declarationRequiredForThePosture: false,
    activeWorkState: { workInProgress: true, peopleCurrentlyExposed: true,
      description: 'the saw is in production with the sawyer eight hundred millimetres from the '
        + 'blade line' },
    establishedFacts: [
      'three cracks four to six millimetres long run from the gullets on the blade back edge',
      'the manufacturer instruction beside the machine requires immediate removal from service',
      'no crack-arrest holes have been drilled',
      'the saw is running and the sawyer is at the infeed',
    ],
    truthAnchors: [
      'three cracks running from the gullets on the back edge of the blade',
      'is to be removed from service immediately',
      'nobody can say whether the extraction is at its design flow',
    ],
    controlsAlreadyInPlace: ['fitted and undamaged wheel and blade guards', 'a tested brake',
      'a pre-shift check regime that found the cracks'],
    newControlsRequired: [],
    requiredResumeCondition: 'the cracked blade removed from the machine and replaced, and the '
      + 'cause of the cracking investigated, before the resaw runs again',
    whyEachOtherPostureIsWrong: {
      CONTINUE: 'a cracked band blade at speed with an operator beside it is an established '
        + 'condition the manufacturer instruction already answers.',
      CONTINUE_WITH_CONTROLS: 'no control operated alongside continued sawing addresses a blade '
        + 'that may fail. The guards contain a blade that breaks; they do not stop it breaking, and '
        + 'the correct action is to take it off.',
      HOLD_PENDING_VERIFICATION: 'the extraction flow is genuinely unknown and it is not what '
        + 'decides today. The cracks are measured, the instruction is on the wall, and nothing is '
        + 'waiting on a result.',
    },
    obviousCatastrophicEvent: false,
    firstPassCalls: 1, verifierCalls: 0, governedRecords: [],
    prohibitedInventedAuthority: 'no governed record is supplied. Any citation, regulation number '
      + 'or regulatory text is invented.',
  }),

  k({
    caseId: 'A2', category: 'ESTABLISHED_STOP_WITH_DISTRACTOR', sector: 'HEAVY_VEHICLE_MAINTENANCE',
    whyThisCaseEarnsItsPlace: 'THE §236 C2 DISTRACTOR PLACED BESIDE AN ESTABLISHED STOP. An '
      + 'examiner has already condemned the lift in writing and a fitter is underneath a raised '
      + 'vehicle, and the only unknown is whether somebody ordered the part. If that response '
      + 'question becomes a continuation-controlling driver, §237 has not moved the defect.',
    setting: 'A heavy goods vehicle workshop, four-post vehicle lift.',
    observation:
      'A rigid truck is raised to about 1.6 metres on the four-post lift for a tail lift repair and '
      + 'a fitter is working beneath it. At the statutory thorough examination two weeks ago the '
      + 'examiner recorded a significant defect on the number three post: the load-bearing safety '
      + 'nut is worn past the manufacturer discard limit, and the report requires the lift to be '
      + 'taken out of use until the nut is replaced. The report is in the workshop office and the '
      + 'lift has been used every working day since. The mechanical fall-arrest latches on the '
      + 'other three posts are intact and the lift controls and interlocks work normally. Nobody in '
      + 'the workshop can say whether the replacement nut was ordered, or by whom, or whether the '
      + 'depot supervisor was ever told about the report.',
    suppliedContext: { location: 'heavy goods vehicle workshop, four-post lift bay',
      task: 'repairing a tail lift beneath a raised rigid truck' },
    jurisdiction: 'US', hazardFamilies: ['structural_failure', 'struck_by', 'machinery'],
    decisionUnderAnalysis: 'whether work may continue beneath the raised vehicle on this lift',
    expectedPosture: 'STOP',
    controllingSafetyProperty: 'whether a lift with an examiner-condemned load-bearing safety nut '
      + 'may hold a raised vehicle over a working person',
    controllingPropertyState: 'ESTABLISHED',
    expectedControllingDriverRole: 'ESTABLISHED_CONDITION_REQUIRING_CESSATION',
    expectedControllingDriverDescription: 'the lift in use with a condemned number three safety nut',
    expectedRolePresence: {
      ESTABLISHED_CONDITION_REQUIRING_CESSATION: 'AT_LEAST_ONE',
      UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION: 'NONE',
    },
    distractor: { kind: 'RESPONSE_OR_FOLLOW_UP',
      description: 'whether the nut was ordered, by whom, and whether the supervisor was told. '
        + 'Resolving it changes only who does what next and never whether the fitter may stay '
        + 'under the truck.' },
    declarationRequiredForThePosture: false,
    activeWorkState: { workInProgress: true, peopleCurrentlyExposed: true,
      description: 'a fitter is working beneath a truck raised on the condemned lift now' },
    establishedFacts: [
      'the examiner recorded the number three safety nut as worn past the discard limit',
      'the report requires the lift to be taken out of use until the nut is replaced',
      'the lift has been used every working day since and is loaded now',
      'a fitter is beneath the raised vehicle',
    ],
    truthAnchors: [
      'the report requires the lift to be taken out of use until the nut is replaced',
      'a fitter is working beneath it',
      'Nobody in the workshop can say whether the replacement nut was ordered',
    ],
    controlsAlreadyInPlace: ['intact fall-arrest latches on the other three posts',
      'working lift controls and interlocks', 'a statutory examination regime that found the defect'],
    newControlsRequired: [],
    requiredResumeCondition: 'the fitter withdrawn and the vehicle lowered under a controlled '
      + 'method or independently supported, the lift taken out of use and labelled, and the safety '
      + 'nut replaced and the lift re-examined, before the lift is used again',
    whyEachOtherPostureIsWrong: {
      CONTINUE: 'a lift a competent examiner condemned in writing is holding a truck over a person.',
      CONTINUE_WITH_CONTROLS: 'the latches on the other three posts do not make a condemned post '
        + 'acceptable, and no control applied alongside the work removes the load from it. The '
        + 'person has to come out.',
      HOLD_PENDING_VERIFICATION: 'whether anybody ordered the nut is a real question and it is not '
        + 'what decides today. The examiner report is the established fact and it already requires '
        + 'the lift out of use. Waiting under the truck to find out whether somebody has already '
        + 'acted is the error this case is built to detect.',
    },
    obviousCatastrophicEvent: false,
    firstPassCalls: 1, verifierCalls: 0, governedRecords: [],
    prohibitedInventedAuthority: 'no governed record is supplied. Any citation, regulation number '
      + 'or regulatory text is invented.',
  }),

  // ============================================== B. LEGITIMATE HOLD
  k({
    caseId: 'B1', category: 'LEGITIMATE_HOLD', sector: 'HEALTHCARE_MEDICAL_GAS',
    whyThisCaseEarnsItsPlace: 'THE STRONG OVERCORRECTION TRAP. Medical oxygen, a hospital, an '
      + 'unexplained pressure loss. Everything about it sounds like a stop, and nothing established '
      + 'is unsafe: the wards are on the full main bank, the alarms are healthy and an hour of '
      + 'testing settles it. A STOP here fails §238 exactly as an unsafe answer does.',
    setting: 'A district hospital, medical oxygen manifold plant room.',
    observation:
      'The reserve cylinder bank on the medical oxygen manifold has fallen from 200 bar to 150 bar '
      + 'over three weeks with no recorded draw from it. The fall was noticed on this morning '
      + 'reading. The reserve line has not been leak tested since, and it cannot be established '
      + 'whether the loss is a genuine leak on the reserve side or an artefact of temperature: the '
      + 'plant room heater failed during that period and has since been repaired, and the two '
      + 'affected readings were taken in an unusually cold room. The main bank is full, pipeline '
      + 'pressure at the wards is normal, the low-pressure and reserve-in-use alarms were tested at '
      + 'the quarterly check and are healthy, and no ward is on the reserve line. The planned '
      + 'changeover to the reserve bank is scheduled for this afternoon so the main bank can be '
      + 'exchanged. An authorised person can leak test the reserve line in about an hour.',
    suppliedContext: { location: 'hospital medical oxygen manifold plant room',
      task: 'changing the ward supply over to the reserve cylinder bank' },
    jurisdiction: 'US', hazardFamilies: ['pressure_systems', 'fire_and_explosion', 'chemical_exposure'],
    decisionUnderAnalysis: 'whether the planned changeover onto the reserve bank may go ahead this '
      + 'afternoon',
    expectedPosture: 'HOLD_PENDING_VERIFICATION',
    controllingSafetyProperty: 'whether the reserve oxygen line leaks',
    controllingPropertyState: 'UNRESOLVED',
    expectedControllingDriverRole: 'UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION',
    expectedControllingDriverDescription: 'the unresolved question of whether the reserve line leaks',
    expectedRolePresence: {
      ESTABLISHED_CONDITION_REQUIRING_CESSATION: 'NONE',
      UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION: 'AT_LEAST_ONE',
    },
    distractor: { kind: 'NONE',
      description: 'the trap here is not a distractor but the register of the case. It sounds '
        + 'severe and it is not.' },
    declarationRequiredForThePosture: true,
    activeWorkState: { workInProgress: false, peopleCurrentlyExposed: false,
      description: 'the wards are on the full main bank, the changeover has not been made and '
        + 'nobody is exposed' },
    establishedFacts: [
      'the reserve bank fell 50 bar over three weeks with no recorded draw',
      'the plant room heater failed in the same period and has been repaired',
      'the main bank is full and ward pipeline pressure is normal',
      'the alarms were tested at the quarterly check and are healthy',
      'a leak test takes about an hour',
    ],
    truthAnchors: [
      'it cannot be established whether the loss is a genuine leak on the reserve side or an '
        + 'artefact of temperature',
      'The main bank is full, pipeline pressure at the wards is normal',
      'can leak test the reserve line in about an hour',
    ],
    controlsAlreadyInPlace: ['a full main bank carrying the wards', 'tested low-pressure and '
      + 'reserve-in-use alarms', 'a daily reading regime that found the fall'],
    newControlsRequired: [],
    requiredResumeCondition: 'the reserve line leak tested and the pressure loss explained, '
      + 'establishing that the reserve side holds, before the changeover is made',
    whyEachOtherPostureIsWrong: {
      CONTINUE: 'putting the wards onto a reserve line that may be leaking is not supported by '
        + 'current evidence.',
      CONTINUE_WITH_CONTROLS: 'no control substitutes for knowing whether the line holds. Watching '
        + 'the pressure after the changeover observes the failure rather than preventing it.',
      STOP: 'nothing established requires cessation or withdrawal. The wards are on a full main '
        + 'bank, the alarms are healthy, nobody is exposed, and an hour of testing resolves it. '
        + 'Escalating here is the error this case is built to detect.',
    },
    obviousCatastrophicEvent: false,
    firstPassCalls: 1, verifierCalls: 0, governedRecords: [],
    prohibitedInventedAuthority: 'no governed record is supplied. Any citation, regulation number '
      + 'or regulatory text is invented.',
  }),

  k({
    caseId: 'B2', category: 'LEGITIMATE_HOLD', sector: 'WIND_ENERGY',
    whyThisCaseEarnsItsPlace: 'a legitimate hold that ALSO carries a follow-up question. D4 asks '
      + 'for at least one decision-controlling driver, not for every driver to be one, and this '
      + 'case proves a mixed basis is admitted rather than refused.',
    setting: 'An onshore wind farm, turbine under scheduled service.',
    observation:
      'Turbine seven is stopped for its six monthly service, the rotor is locked with the pin '
      + 'engaged and the blades are pitched to feather. During the service the technicians found '
      + 'that the torque marking stripes on six of the fifty four blade root fasteners on blade B '
      + 'are misaligned by up to fifteen degrees, which indicates those fasteners may have moved. '
      + 'The tension in them cannot be established without the hydraulic tensioning tool, which is '
      + 'on another site and is due to arrive tomorrow morning. Nobody is required to be in the hub '
      + 'and the site access road is barriered at the turbine. The remaining forty eight stripes on '
      + 'that blade and all stripes on the other two blades are aligned. Separately, it is not '
      + 'recorded who is responsible for raising the defect with the turbine manufacturer or on '
      + 'which of the two maintenance systems the site now uses.',
    suppliedContext: { location: 'wind farm, turbine seven',
      task: 'completing the six monthly service and returning the turbine to service' },
    jurisdiction: 'US', hazardFamilies: ['structural_failure', 'stored_energy', 'struck_by'],
    decisionUnderAnalysis: 'whether turbine seven may be returned to service at the end of the '
      + 'service window',
    expectedPosture: 'HOLD_PENDING_VERIFICATION',
    controllingSafetyProperty: 'whether the six suspect blade root fasteners are at their specified '
      + 'tension',
    controllingPropertyState: 'UNRESOLVED',
    expectedControllingDriverRole: 'UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION',
    expectedControllingDriverDescription: 'the unresolved tension of the six suspect blade root '
      + 'fasteners',
    expectedRolePresence: {
      ESTABLISHED_CONDITION_REQUIRING_CESSATION: 'NONE',
      UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION: 'AT_LEAST_ONE',
    },
    distractor: { kind: 'RESPONSE_OR_FOLLOW_UP',
      description: 'who raises the defect with the manufacturer and on which system. A real '
        + 'follow-up question that must be declared and must not be the reason for the hold.' },
    declarationRequiredForThePosture: true,
    activeWorkState: { workInProgress: false, peopleCurrentlyExposed: false,
      description: 'the turbine is stopped, the rotor is locked and pitched to feather, and nobody '
        + 'is in the hub' },
    establishedFacts: [
      'six of fifty four torque stripes on blade B are misaligned by up to fifteen degrees',
      'the tension cannot be established until the tensioning tool arrives tomorrow morning',
      'the turbine is stopped, the rotor locked and the blades feathered',
      'nobody is in the hub and the access road is barriered',
      'the remaining stripes on that blade and on the other two blades are aligned',
    ],
    truthAnchors: [
      'are misaligned by up to fifteen degrees',
      'cannot be established without the hydraulic tensioning tool',
      'it is not recorded who is responsible for raising the defect',
    ],
    controlsAlreadyInPlace: ['the turbine stopped with the rotor lock pin engaged',
      'blades pitched to feather', 'a barriered access road', 'a torque marking regime that '
        + 'revealed the movement'],
    newControlsRequired: [],
    requiredResumeCondition: 'the tension in the six suspect blade root fasteners measured with the '
      + 'tensioning tool and shown to be at specification, or the fasteners re-tensioned, before '
      + 'the turbine is returned to service',
    whyEachOtherPostureIsWrong: {
      CONTINUE: 'returning a turbine to service with blade root fasteners that may have moved is '
        + 'not supported by current evidence.',
      CONTINUE_WITH_CONTROLS: 'no control makes running acceptable while the tension is unknown. '
        + 'Reduced power or extra monitoring does not establish the property.',
      STOP: 'the turbine is already stopped and locked out, nobody is exposed, and nothing '
        + 'established requires any further protective action. The work waits on a tool that '
        + 'arrives tomorrow.',
    },
    obviousCatastrophicEvent: false,
    firstPassCalls: 1, verifierCalls: 0, governedRecords: [],
    prohibitedInventedAuthority: 'no governed record is supplied. Any citation, regulation number '
      + 'or regulatory text is invented.',
  }),

  // ============================================== C. PERMISSIVE + RESPONSE UNCERTAINTY
  k({
    caseId: 'C1', category: 'PERMISSIVE_WITH_RESPONSE_UNCERTAINTY', sector: 'COMMERCIAL_PRINTING',
    whyThisCaseEarnsItsPlace: 'THE §236 C2 SHAPE, EXACTLY, ON THE PERMISSIVE SIDE. A control is '
      + 'plainly needed and plainly available, and the only unknown is whether somebody already '
      + 'started arranging it. The correct answer is to fit the lid and keep printing.',
    setting: 'A commercial printing works, five colour sheet-fed press.',
    observation:
      'The press is running. The delivery end guard interlock was function tested at shift start '
      + 'and stopped the press inside the stated stopping time, and the result is signed on the '
      + 'shift sheet. The ink mist extraction over the delivery is running with its airflow proved '
      + 'at the panel this morning. A minder reported yesterday that anti set-off spray powder is '
      + 'drifting into the operator position, and a personal inhalable dust sample taken yesterday '
      + 'at that position returned 1.8 milligrams per cubic metre against a limit of 10. The powder '
      + 'hopper lid is missing, which is where the drift comes from, and a replacement lid is in '
      + 'the stores and can be fitted in ten minutes. It is not recorded whether the day shift '
      + 'supervisor already asked stores to issue the lid, or whether anyone has been assigned to '
      + 'fit it.',
    suppliedContext: { location: 'printing works press hall, sheet-fed press delivery',
      task: 'running the press with an operator at the delivery position' },
    jurisdiction: 'US', hazardFamilies: ['respirable_dust', 'machinery', 'ventilation'],
    decisionUnderAnalysis: 'whether the press may keep running with the operator at the delivery '
      + 'position',
    expectedPosture: 'CONTINUE_WITH_CONTROLS',
    controllingSafetyProperty: 'whether inhalable spray powder exposure at the operator position '
      + 'stays acceptable while the hopper lid is missing',
    controllingPropertyState: 'ESTABLISHED',
    expectedControllingDriverRole: 'ESTABLISHED_CONDITION_REQUIRING_CONTROLS',
    expectedControllingDriverDescription: 'the missing hopper lid and the resulting powder drift',
    expectedRolePresence: {
      ESTABLISHED_CONDITION_REQUIRING_CESSATION: 'NONE',
      UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION: 'NONE',
    },
    distractor: { kind: 'RESPONSE_OR_FOLLOW_UP',
      description: 'whether the supervisor already asked stores for the lid and whether anyone was '
        + 'assigned to fit it. Resolving it changes only who fits the lid, never whether the press '
        + 'may run.' },
    declarationRequiredForThePosture: false,
    activeWorkState: { workInProgress: true, peopleCurrentlyExposed: true,
      description: 'the press is running with an operator in the drift at the delivery position' },
    establishedFacts: [
      'the guard interlock was function tested at shift start and the result signed',
      'the ink mist extraction is running with airflow proved',
      'measured inhalable dust at the operator position is 1.8 against a limit of 10',
      'the drift source is a missing hopper lid and a replacement is in stores',
      'fitting the lid takes ten minutes',
    ],
    truthAnchors: [
      'returned 1.8 milligrams per cubic metre against a limit of 10',
      'a replacement lid is in the stores and can be fitted in ten minutes',
      'It is not recorded whether the day shift supervisor already asked stores to issue the lid',
    ],
    controlsAlreadyInPlace: ['a tested delivery guard interlock', 'proved ink mist extraction',
      'personal exposure sampling at the operator position'],
    newControlsRequired: [
      'fit the replacement hopper lid now',
      'keep the operator position clear of the drift until the lid is fitted',
    ],
    requiredResumeCondition: null,
    whyEachOtherPostureIsWrong: {
      CONTINUE: 'powder is drifting into the operator position from a missing lid. Fitting it is a '
        + 'new control, not an existing one.',
      HOLD_PENDING_VERIFICATION: 'nothing decision-controlling is open. The exposure is measured at '
        + 'roughly a fifth of the limit, the source is identified and the remedy is in stores. Not '
        + 'knowing whether somebody already asked for the lid changes only who fetches it.',
      STOP: 'a measured exposure well below the limit with a ten minute remedy does not require the '
        + 'press to stop.',
    },
    obviousCatastrophicEvent: false,
    firstPassCalls: 1, verifierCalls: 0, governedRecords: [],
    prohibitedInventedAuthority: 'no governed record is supplied. Any citation, regulation number '
      + 'or regulatory text is invented.',
  }),

  k({
    caseId: 'C2', category: 'PERMISSIVE_WITH_RESPONSE_UNCERTAINTY', sector: 'HOSPITALITY_CATERING',
    whyThisCaseEarnsItsPlace: 'the purely administrative case. The controlling property was proved '
      + 'this morning by a same-day function test, and the only open question is which book the '
      + 'test was written in. Nothing about that touches whether the kitchen may cook.',
    setting: 'A hotel kitchen, gas cooking suite and canopy.',
    observation:
      'The gas safety interlock tied to the canopy extraction was proof tested at the annual gas '
      + 'safety check eleven weeks ago and the certificate is on the plant room wall and in date. '
      + 'The canopy extraction airflow was measured at the same check and is at design. This '
      + 'morning the head chef reported that the interlock clicked oddly when the extraction was '
      + 'switched on. The maintenance engineer attended within the hour, tested the interlock three '
      + 'times by isolating the extraction, confirmed that the gas supply shut off on each test, '
      + 'and logged the tests. The gas detection head in the kitchen was replaced in March and is '
      + 'within its calibration. It is not recorded which of the two maintenance systems the site '
      + 'now runs the engineer should have logged the tests in; he wrote them in the paper book and '
      + 'nobody can say whether that entry will be transferred to the digital system.',
    suppliedContext: { location: 'hotel kitchen, gas cooking suite beneath the extraction canopy',
      task: 'cooking service on a gas suite under a canopy with an extraction interlock' },
    jurisdiction: 'US', hazardFamilies: ['fire_and_explosion', 'ventilation', 'chemical_exposure'],
    decisionUnderAnalysis: 'whether gas cooking service may continue on the suite',
    expectedPosture: 'CONTINUE',
    controllingSafetyProperty: 'whether the gas supply shuts off when the canopy extraction stops',
    controllingPropertyState: 'ESTABLISHED',
    expectedControllingDriverRole: 'ESTABLISHED_CONDITION_REQUIRING_NO_IMMEDIATE_ACTION',
    expectedControllingDriverDescription: 'the gas interlock, proved by a same-day function test '
      + 'repeated three times',
    expectedRolePresence: {
      ESTABLISHED_CONDITION_REQUIRING_CESSATION: 'NONE',
      UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION: 'NONE',
    },
    distractor: { kind: 'ADMINISTRATIVE_RECORD',
      description: 'which maintenance system the engineer should have logged the tests in, and '
        + 'whether the paper entry will be transferred. Documentation only.' },
    declarationRequiredForThePosture: false,
    activeWorkState: { workInProgress: true, peopleCurrentlyExposed: false,
      description: 'the kitchen is in service under a proved interlock and a working extraction' },
    establishedFacts: [
      'the interlock was proof tested eleven weeks ago with a certificate in date',
      'the reported oddity was investigated within the hour on the same day',
      'the interlock shut the gas off on three consecutive tests and the tests were logged',
      'the extraction airflow is at design and the gas detection head is within calibration',
    ],
    truthAnchors: [
      'confirmed that the gas supply shut off on each test',
      'It is not recorded which of the two maintenance systems',
    ],
    controlsAlreadyInPlace: ['a proof tested gas interlock, retested this morning',
      'canopy extraction at design airflow', 'a gas detection head within calibration',
      'an in-date annual gas safety certificate'],
    newControlsRequired: [],
    requiredResumeCondition: null,
    whyEachOtherPostureIsWrong: {
      CONTINUE_WITH_CONTROLS: 'no new control arises. Everything that makes the suite acceptable is '
        + 'already in effect and the interlock was retested this morning.',
      HOLD_PENDING_VERIFICATION: 'the verification already happened. The reported oddity was '
        + 'investigated the same day and the interlock shut the gas off three times out of three. '
        + 'Which book the result is written in is not a safety property.',
      STOP: 'nothing established requires cessation. The interlock shut the gas off on three '
        + 'consecutive tests this morning, the extraction is at design airflow and the detection '
        + 'head is in calibration; there is no condition here that requires the suite to be shut '
        + 'down or the kitchen cleared.',
    },
    obviousCatastrophicEvent: false,
    firstPassCalls: 1, verifierCalls: 0, governedRecords: [],
    prohibitedInventedAuthority: 'no governed record is supplied. Any citation, regulation number '
      + 'or regulatory text is invented.',
  }),
];

// ================================================================ truth preflight

const norm238 = (s: string): string =>
  s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
const tokens238 = (s: string): Set<string> =>
  new Set(norm238(s).split(' ').filter(w => w.length > 3));
function containment238(a: string, b: string): number {
  const ta = tokens238(a); const tb = tokens238(b);
  if (ta.size === 0) return 0;
  let hit = 0; for (const t of ta) if (tb.has(t)) hit += 1;
  return hit / ta.size;
}
/** Whole-word matching on normalized text, carried forward from the §236 repair. */
function usesTerm238(hay: string, term: string): boolean {
  const t = norm238(term);
  if (t.length === 0) return false;
  return new RegExp(`(^| )${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}( |$)`).test(hay);
}
export const OVERLAP_THRESHOLD_238 = 0.55;

export interface PreflightCheck238 {
  readonly id: string; readonly rule: string;
  readonly passed: boolean; readonly detail: readonly string[];
}

export function runTruthPreflight238(): {
  checks: readonly PreflightCheck238[]; passed: number; total: number; allPassed: boolean;
} {
  const checks: PreflightCheck238[] = [];
  const add = (id: string, rule: string, detail: string[]): void => {
    checks.push({ id, rule, passed: detail.length === 0, detail });
  };
  const C = CONFIRMATION_CASES_238;

  add('P1', 'six cases, two per category, unique identifiers', (() => {
    const d: string[] = [];
    if (C.length !== 6) d.push(`cohort is ${C.length} cases, not 6`);
    if (new Set(C.map(c => c.caseId)).size !== C.length) d.push('identifiers are not unique');
    for (const cat of CATEGORIES_238) {
      const n = C.filter(c => c.category === cat).length;
      if (n !== 2) d.push(`${cat} has ${n} cases, not 2`);
    }
    return d;
  })());

  add('P2', 'every truth anchor is a verbatim substring of its observation', C.flatMap(c => {
    const d: string[] = [];
    if (c.truthAnchors.length === 0) d.push(`${c.caseId}: no anchor`);
    for (const a of c.truthAnchors) {
      if (!c.observation.includes(a)) d.push(`${c.caseId}: anchor not verbatim: "${a.slice(0, 55)}"`);
    }
    return d;
  }));

  add('P3', 'every expected posture and driver role is a member of the frozen vocabularies',
    C.flatMap(c => {
      const d: string[] = [];
      if (!IMMEDIATE_SAFETY_POSTURES_233.includes(c.expectedPosture)) {
        d.push(`${c.caseId}: ${c.expectedPosture} is not a §233 posture`);
      }
      if (!POSTURE_DRIVER_ROLES_237.includes(c.expectedControllingDriverRole)) {
        d.push(`${c.caseId}: ${c.expectedControllingDriverRole} is not a §237 role`);
      }
      for (const v of Object.values(c.expectedRolePresence)) {
        if (!ROLE_PRESENCE_EXPECTATIONS.includes(v)) d.push(`${c.caseId}: bad role presence ${v}`);
      }
      return d;
    }));

  add('P4', 'HOLD if and only if the controlling property is UNRESOLVED', C.flatMap(c =>
    (c.expectedPosture === 'HOLD_PENDING_VERIFICATION')
      === (c.controllingPropertyState === 'UNRESOLVED') ? []
      : [`${c.caseId}: ${c.expectedPosture} with property ${c.controllingPropertyState}`]));

  // THE §237 ROLE TRUTH must line up with the posture, or the cohort contradicts the contract.
  add('P5', 'the expected controlling driver role is the one the expected posture requires',
    C.flatMap(c => {
      const d: string[] = [];
      const r = c.expectedControllingDriverRole;
      if (c.expectedPosture === 'STOP' && r !== CESSATION_ROLE_237) {
        d.push(`${c.caseId}: STOP whose controlling role is ${r}`);
      }
      if (c.expectedPosture === 'HOLD_PENDING_VERIFICATION'
        && r !== 'UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION') {
        d.push(`${c.caseId}: HOLD whose controlling role is ${r}`);
      }
      if (c.expectedPosture === 'CONTINUE_WITH_CONTROLS'
        && r !== 'ESTABLISHED_CONDITION_REQUIRING_CONTROLS') {
        d.push(`${c.caseId}: CONTINUE_WITH_CONTROLS whose controlling role is ${r}`);
      }
      if (c.expectedPosture === 'CONTINUE'
        && r !== 'ESTABLISHED_CONDITION_REQUIRING_NO_IMMEDIATE_ACTION') {
        d.push(`${c.caseId}: CONTINUE whose controlling role is ${r}`);
      }
      return d;
    }));

  add('P6', 'the frozen role-presence expectation agrees with the expected posture and with the '
    + '§237 rules', C.flatMap(c => {
    const d: string[] = [];
    const cess = c.expectedRolePresence.ESTABLISHED_CONDITION_REQUIRING_CESSATION;
    const ctrl = c.expectedRolePresence.UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION;
    // §237 D3: a cessation driver forces STOP, so only a STOP case may require one and no
    // non-STOP case may permit one.
    if (c.expectedPosture === 'STOP' && cess !== 'AT_LEAST_ONE') {
      d.push(`${c.caseId}: STOP does not require a cessation driver`);
    }
    if (c.expectedPosture !== 'STOP' && cess !== 'NONE') {
      d.push(`${c.caseId}: ${c.expectedPosture} does not forbid a cessation driver`);
    }
    // §237 D4: a non-permitting posture needs a decision-controlling driver, and on a HOLD the
    // cessation route is closed, so a controlling declaration is structurally required.
    if (c.expectedPosture === 'HOLD_PENDING_VERIFICATION') {
      if (ctrl !== 'AT_LEAST_ONE') d.push(`${c.caseId}: HOLD does not require a controlling driver`);
      if (!c.declarationRequiredForThePosture) {
        d.push(`${c.caseId}: HOLD is unreachable without a declaration, yet none is required`);
      }
    }
    // a permissive posture must forbid the controlling role, or the cohort cannot detect the
    // §236 C2 error it exists to detect
    if (POSTURE_PERMITS_CONTINUED_WORK[c.expectedPosture] && ctrl !== 'NONE') {
      d.push(`${c.caseId}: a permissive posture does not forbid a controlling driver`);
    }
    return d;
  }));

  add('P7', 'CONTINUE owes no new control, CONTINUE_WITH_CONTROLS names at least one, and a '
    + 'non-permitting posture names a resume condition and no continuation controls', C.flatMap(c => {
    const d: string[] = [];
    const n = c.newControlsRequired.length;
    const permits = POSTURE_PERMITS_CONTINUED_WORK[c.expectedPosture];
    if (c.expectedPosture === 'CONTINUE' && n !== 0) d.push(`${c.caseId}: CONTINUE owes controls`);
    if (c.expectedPosture === 'CONTINUE_WITH_CONTROLS' && n === 0) {
      d.push(`${c.caseId}: CONTINUE_WITH_CONTROLS names no new control`);
    }
    if (!permits && n !== 0) d.push(`${c.caseId}: ${c.expectedPosture} names continuation controls`);
    if (permits && c.requiredResumeCondition !== null) {
      d.push(`${c.caseId}: a permissive posture carries a resume condition`);
    }
    if (!permits && (c.requiredResumeCondition ?? '').trim().length === 0) {
      d.push(`${c.caseId}: ${c.expectedPosture} names no resume condition`);
    }
    for (const nc of c.newControlsRequired) {
      if (c.controlsAlreadyInPlace.some(x => containment238(nc, x) >= 0.85)) {
        d.push(`${c.caseId}: a "new" control restates one already in place`);
      }
    }
    return d;
  }));

  add('P8', 'each case refutes exactly the three postures it did not choose, substantively',
    C.flatMap(c => {
      const d: string[] = [];
      const keys = Object.keys(c.whyEachOtherPostureIsWrong) as ImmediateSafetyPosture233[];
      if (keys.includes(c.expectedPosture)) d.push(`${c.caseId}: refutes its own posture`);
      for (const p of IMMEDIATE_SAFETY_POSTURES_233) {
        if (p === c.expectedPosture) continue;
        const why = c.whyEachOtherPostureIsWrong[p];
        if (why === undefined) { d.push(`${c.caseId}: does not refute ${p}`); continue; }
        if (why.trim().length < 60) d.push(`${c.caseId}/${p}: rationale too thin`);
      }
      return d;
    }));

  add('P9', 'the composition the authorization requires is present', (() => {
    const d: string[] = [];
    const A = C.filter(c => c.category === 'ESTABLISHED_STOP_WITH_DISTRACTOR');
    if (!A.every(c => c.expectedPosture === 'STOP')) d.push('an A case is not a STOP');
    if (!A.every(c => c.distractor.kind !== 'NONE')) d.push('an A case carries no distractor');
    const kinds = new Set(A.map(c => c.distractor.kind));
    if (!kinds.has('UNAVAILABLE_MEASUREMENT') || !kinds.has('RESPONSE_OR_FOLLOW_UP')) {
      d.push('the A slot does not exercise both distractor families');
    }
    if (A.some(c => c.obviousCatastrophicEvent)) {
      d.push('an A case is an obvious catastrophic event, which the authorization forbids');
    }
    const B = C.filter(c => c.category === 'LEGITIMATE_HOLD');
    if (!B.every(c => c.expectedPosture === 'HOLD_PENDING_VERIFICATION')) d.push('a B case is not a HOLD');
    if (!B.some(c => c.distractor.kind === 'RESPONSE_OR_FOLLOW_UP')) {
      d.push('no B case carries a follow-up question, so no mixed basis is exercised');
    }
    const Cc = C.filter(c => c.category === 'PERMISSIVE_WITH_RESPONSE_UNCERTAINTY');
    if (!Cc.every(c => POSTURE_PERMITS_CONTINUED_WORK[c.expectedPosture])) {
      d.push('a C case is not permissive');
    }
    if (new Set(Cc.map(c => c.expectedPosture)).size !== 2) {
      d.push('the C slot does not carry one CONTINUE and one CONTINUE_WITH_CONTROLS');
    }
    if (!Cc.every(c => c.distractor.kind === 'RESPONSE_OR_FOLLOW_UP'
      || c.distractor.kind === 'ADMINISTRATIVE_RECORD')) {
      d.push('a C case does not carry response or administrative uncertainty');
    }
    return d;
  })());

  add('P10', 'the cohort can fail by over-labelling as easily as by under-labelling', (() => {
    const d: string[] = [];
    const noCess = C.filter(c =>
      c.expectedRolePresence.ESTABLISHED_CONDITION_REQUIRING_CESSATION === 'NONE').length;
    const noCtrl = C.filter(c =>
      c.expectedRolePresence.UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION === 'NONE').length;
    if (noCess < 4) d.push(`only ${noCess} cases forbid a cessation driver`);
    if (noCtrl < 3) d.push(`only ${noCtrl} cases forbid a controlling driver`);
    if (!C.some(c => c.expectedRolePresence
      .ESTABLISHED_CONDITION_REQUIRING_CESSATION === 'AT_LEAST_ONE')) {
      d.push('no case requires a cessation driver');
    }
    return d;
  })());

  add('P11', 'no case reuses an excluded subject term', C.flatMap(c => {
    const hay = norm238(`${c.setting} ${c.observation} ${c.suppliedContext.location} `
      + `${c.suppliedContext.task}`);
    return FRESHNESS_238.excludedSubjectTerms.filter(t => usesTerm238(hay, t))
      .map(t => `${c.caseId}: uses excluded term "${t}"`);
  }));

  add('P12', 'no §238 observation overlaps any §230/§231, §234 or §236 observation', C.flatMap(c => {
    const prior: { id: string; text: string }[] = [
      ...ACCEPTANCE_CASES_230.map(p => ({ id: `§230 ${p.caseId}`, text: p.observation })),
      ...POSTURE_CASES_234.map(p => ({ id: `§234 ${p.caseId}`, text: p.observation })),
      ...CONFIRMATION_CASES_236.map(p => ({ id: `§236 ${p.caseId}`, text: p.observation })),
    ];
    return prior.flatMap(p => {
      const o = Math.max(containment238(c.observation, p.text), containment238(p.text, c.observation));
      return o >= OVERLAP_THRESHOLD_238 ? [`${c.caseId} overlaps ${p.id} at ${o.toFixed(3)}`] : [];
    });
  }));

  add('P13', 'no §238 case is a paraphrase of another', C.flatMap((a, i) =>
    C.slice(i + 1).flatMap(b => {
      const o = Math.max(containment238(a.observation, b.observation),
        containment238(b.observation, a.observation));
      return o >= OVERLAP_THRESHOLD_238 ? [`${a.caseId} and ${b.caseId} overlap at ${o.toFixed(3)}`] : [];
    })));

  add('P14', 'every case books one first-pass call, no verifier call, no governed record, and '
    + 'carries a complete transmitted context', (() => {
    const d: string[] = [];
    for (const c of C) {
      if (c.firstPassCalls !== 1) d.push(`${c.caseId}: not one first-pass call`);
      if (c.verifierCalls !== 0) d.push(`${c.caseId}: books a verifier call`);
      if (c.governedRecords.length !== 0) d.push(`${c.caseId}: supplies a governed record`);
      if (c.hazardFamilies.length === 0) d.push(`${c.caseId}: no hazard family`);
      if (c.establishedFacts.length === 0) d.push(`${c.caseId}: no established facts`);
      if (c.decisionUnderAnalysis.trim().length === 0) d.push(`${c.caseId}: no decision`);
      if (c.controllingSafetyProperty.trim().length === 0) d.push(`${c.caseId}: no property`);
      if (c.expectedControllingDriverDescription.trim().length === 0) {
        d.push(`${c.caseId}: the controlling driver is not described for adjudication`);
      }
    }
    const total = C.reduce((n, c) => n + c.firstPassCalls + c.verifierCalls, 0);
    if (total !== AUTHORIZATION_238.primaryProviderCalls) {
      d.push(`total calls ${total}, authorized ${AUTHORIZATION_238.primaryProviderCalls}`);
    }
    return d;
  })());

  add('P15', 'the frozen §233 continuation table agrees with the truth on every case', C.flatMap(c => {
    const permits = POSTURE_PERMITS_CONTINUED_WORK[c.expectedPosture];
    const truthPermits = c.expectedPosture === 'CONTINUE'
      || c.expectedPosture === 'CONTINUE_WITH_CONTROLS';
    return permits === truthPermits ? []
      : [`${c.caseId}: §233 permits=${String(permits)}, truth says ${String(truthPermits)}`];
  }));

  const passed = checks.filter(c => c.passed).length;
  return { checks, passed, total: checks.length, allPassed: passed === checks.length };
}

// ================================================================ execution configuration

export const FROZEN_EXECUTION_CONFIGURATION_238 = {
  arm: 'SINGLE', leg: 'FIRST_PASS_ONLY',
  verifierLeg: 'NOT_AUTHORIZED_AND_NOT_ASSEMBLED',
  pairedAttributionArm: 'NOT_AUTHORIZED_AND_NOT_ASSEMBLED',
  thinking: 'disabled', cachingEnabled: false,
  firstPassMaxTokens: 8000,
  maxTokensRationale: 'carried forward. §236 truncated nothing at 8,000 with a longest output of '
    + '3,725 tokens, and §237 adds a member to every basis entry.',
  semanticRetries: 0, transportRetriesAuthorized: 0,
  ifTransportFailureOccurs: 'the authorization books exactly six calls with no retry allowance. A '
    + 'transport or HTTP failure that yields no adjudicable response terminates the run as '
    + 'EXECUTION INCOMPLETE and returns for authorization.',
  guardWorstCaseCallUsd: 0.150,
  guardBasis: '30,000 budgeted input tokens plus a full 8,000-token output at USD 2 and USD 10 per '
    + 'million, uplifted. Roughly 1.35x the §236 observed maximum.',
  ifGuardTrips: 'STOP and return EXECUTION_INCOMPLETE. Never reduce coverage to fit the ceiling.',
  databaseOperations: 0,
} as const;

export const COST_EVIDENCE_238 = CALL_PLAN_238;

export function callPlan238(): {
  primaryCalls: number; maximumTotalCalls: number; projectedSpendUsd: number;
  worstCaseSpendUsd: number; hardCeilingUsd: number;
  perCase: readonly { caseId: string; category: Category238 }[];
} {
  return {
    primaryCalls: CONFIRMATION_CASES_238.reduce((n, c) => n + c.firstPassCalls + c.verifierCalls, 0),
    maximumTotalCalls: AUTHORIZATION_238.maximumProviderCalls,
    projectedSpendUsd: CALL_PLAN_238.projectedSpendUsd,
    worstCaseSpendUsd: CALL_PLAN_238.worstCaseSpendUsd,
    hardCeilingUsd: AUTHORIZATION_238.hardSpendCeilingUsd,
    perCase: CONFIRMATION_CASES_238.map(c => ({ caseId: c.caseId, category: c.category })),
  };
}

// ================================================================ identity and terminals

const sha238 = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

export function instrumentDigest238(): string {
  return sha238(JSON.stringify({
    version: INSTRUMENT_238_VERSION,
    implementationUnderTest: IMPLEMENTATION_UNDER_TEST_238,
    authorization: AUTHORIZATION_238,
    authoringIndependence: AUTHORING_INDEPENDENCE_238,
    freshness: FRESHNESS_238,
    scoring: SCORING_RULES_238,
    execution: FROZEN_EXECUTION_CONFIGURATION_238,
    slots: SLOT_DESIGN_238, passRuleFromDesign: PASS_RULE_238,
    hostedQuestion: HOSTED_QUESTION_238, whatItIsNot: WHAT_IT_IS_NOT_238,
    postures: IMMEDIATE_SAFETY_POSTURES_233,
    postureDefinitions: POSTURE_DEFINITIONS_233,
    protectiveRank: POSTURE_PROTECTIVE_RANK,
    driverRoles: POSTURE_DRIVER_ROLES_237,
    driverRoleDefinitions: DRIVER_ROLE_DEFINITIONS_237,
    providerVisibleRules: PROVIDER_VISIBLE_RULES_237,
    fourOptionsIfItFails: NO_FURTHER_EXPERIMENT_LOOP_238,
    cases: CONFIRMATION_CASES_238,
  }));
}

export const TERMINALS_238 = {
  pass: 'EXPERT_HAZLENZ_FINAL_POSTURE_SEMANTIC_CONFIRMATION_PASSED — '
    + 'SUCCESSOR_CANDIDATE_FREEZE_AUTHORIZATION_REQUIRED',
  fail: 'EXPERT_HAZLENZ_FINAL_POSTURE_SEMANTIC_CONFIRMATION_FAILED — '
    + 'PRODUCT_OWNER_CAPABILITY_BOUNDARY_DECISION_REQUIRED',
  incomplete: 'EXPERT_HAZLENZ_FINAL_POSTURE_CONFIRMATION_INCOMPLETE — '
    + 'PRODUCT_OWNER_REVIEW_REQUIRED',
} as const;
