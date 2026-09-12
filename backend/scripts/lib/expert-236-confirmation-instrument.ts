/**
 * EXPERT HAZLENZ — §236 STABILIZED POSTURE CONTRACT SMALL HOSTED CONFIRMATION INSTRUMENT.
 *
 * TWO QUESTIONS, AND ONLY TWO:
 *
 *   1. DOES THE STABILIZED CONTRACT ARRIVE IN AN ADMISSIBLE, NON-FAIL-OPEN FORM UNDER FRESH HOSTED
 *      EXECUTION?
 *   2. DOES HAZLENZ PRESERVE AN ESTABLISHED CONTROLLING POSTURE WITHOUT MANUFACTURING UNCERTAINTY
 *      OR SYSTEMATICALLY ESCALATING LEGITIMATE HOLD CASES TO STOP?
 *
 * It is NOT final Expert acceptance, NOT a broad posture benchmark, NOT a replay of §234, NOT
 * prompt development and NOT another characterization phase.
 *
 * ==================== THE TRUTH AXIS, UNCHANGED FROM §234 ====================
 *
 *   IS THE SAFETY PROPERTY THAT CONTROLS CONTINUED WORK ESTABLISHED OR UNRESOLVED?
 *
 *     ESTABLISHED and safe as it stands, with no NEW control owed  ->  CONTINUE
 *     ESTABLISHED and safe only once a NEW control is in effect    ->  CONTINUE_WITH_CONTROLS
 *     UNRESOLVED, and its resolution controls continuation         ->  HOLD_PENDING_VERIFICATION
 *     ESTABLISHED and unsafe, requiring cessation or isolation     ->  STOP
 *
 * The §234 disambiguation is carried forward verbatim: a control counts towards
 * CONTINUE_WITH_CONTROLS only if it is NOT CURRENTLY IN EFFECT and must be put in effect because of
 * the analysed condition.
 *
 * ==================== WHAT §235 ADDED, AND WHAT THIS COHORT MEASURES ABOUT IT ====================
 *
 * §235 added `establishedConditionsRequiringCessation`. A non-empty list forces STOP. That closes
 * the §234 autoclave defect in one direction and opens a new failure mode in the other: a model
 * that populates the list on a case that does not warrant it escalates a legitimate hold into a
 * stop, and §235's own report calls that a failure rather than a pass.
 *
 * SO EVERY CASE CARRIES A FROZEN EXPECTATION FOR THAT LIST, not only the STOP cases. Six of the
 * nine must leave it EMPTY. B3 is the mandatory overcorrection guard and it is deliberately the
 * most alarming-sounding case in the cohort.
 */

import { createHash } from 'crypto';

import {
  IMMEDIATE_SAFETY_POSTURES_233, POSTURE_DEFINITIONS_233, POSTURE_PERMITS_CONTINUED_WORK,
  POSTURE_PROTECTIVE_RANK,
  type ImmediateSafetyPosture233,
} from './expert-233-posture-contract';
import {
  FIRST_PASS_CONTRACT_235_VERSION, CESSATION_FIELD, PROVIDER_VISIBLE_RULES_235,
} from './expert-235-posture-contract';
import { ACCEPTANCE_CASES_230 } from './expert-230-final-acceptance-instrument';
import { POSTURE_CASES_234 } from './expert-234-posture-discrimination-instrument';

export const INSTRUMENT_236_VERSION = 'hazlenz.expert.236.stabilized-confirmation.v1' as const;

export const IMPLEMENTATION_UNDER_TEST_236 = {
  sections: ['§233', '§235'],
  contractVersion: FIRST_PASS_CONTRACT_235_VERSION,
  section233ImplementationDigest:
    '5517337ded68b7b8901dcb588355f98b4bdbf2dfe4ae54a4af0266af1d4ce5af',
  section233EvidencePackage:
    'verification/expert-hazlenz-233-immediate-safety-posture-implementation-2026-09-11',
  section235EvidencePackage:
    'verification/expert-hazlenz-235-posture-contract-stabilization-2026-09-11',
  protectedCompositeIdentity:
    '37ce9eb8e9db62288b0a4953072bb487f38beab962d4716ad74be47036e2e2cb',
  mayBeModifiedDuringExecution: false,
} as const;

export const AUTHORIZATION_236 = {
  slice: 'STABILIZED_POSTURE_CONTRACT_SMALL_HOSTED_CONFIRMATION',
  primaryProviderCalls: 9,
  maximumProviderCalls: 9,
  arms: 1,
  legs: ['FIRST_PASS'],
  pairedAttributionArmAuthorized: false,
  semanticRetriesAuthorized: false,
  projectedSpendUsd: 0.945,
  hardSpendCeilingUsd: 1.40,
  databaseOperations: 0,
  commit: false, push: false, tag: false, deploy: false,
  section233Or235ModifiedDuringExecution: false,
} as const;

export const AUTHORING_INDEPENDENCE_236 = {
  caseAuthoring: 'THIS SESSION',
  truthDefinition: 'THIS SESSION',
  scoringRules: 'THIS SESSION',
  implementationUnderTest: '§233 and §235',
  statisticalIndependence: false,
  whyNot: 'the party authoring the cases and the truth is the party that wrote §235 and read the '
    + '§234 failure evidence. That is the same limitation §230 and §234 recorded and it is not '
    + 'mitigated by being written down. It is arguably SHARPER here than in §234, because this '
    + 'session also authored the constraint being tested.',
  mitigationsActuallyHonoured: [
    'the frozen truth for every case is derived from the case facts and the truth axis alone, and '
      + 'every expected answer was written before any provider call',
    'six of the nine cases expect the cessation list to be EMPTY, so the cohort can fail by '
      + 'over-escalation as easily as by under-escalation',
    'the overcorrection guard B3 is deliberately the most alarming-sounding case in the cohort, '
      + 'authored to be attractive to a model that has just been told about cessation conditions',
    'no §231, §234 or §235-fixture subject, industry, equipment or fact pattern is reused, checked '
      + 'mechanically rather than asserted',
  ],
  effectOnTheResult:
    'A PASS is evidence that the stabilized contract arrived and that posture survived on a '
    + 'preregistered fresh set of nine. It is not independent validation and at n=9 it is not a '
    + 'rate.',
} as const;

export const FRESHNESS_236 = {
  rule: 'no case reuses the industry, equipment, observation, fact pattern or hazard shape of any '
    + '§221, §225, §227, §228, §230/§231 or §234 case, nor of the §235 local fixtures',
  spentEvidence: ['§231', '§234'],
  mayNotBeTunedAgainst: true,
  excludedSubjectTerms: [
    // §230 / §231
    'carding', 'textile mill', 'flatwork ironer', 'commercial laundry', 'electroplating',
    'anodising', 'grain elevator', 'headhouse', 'grain dust', 'compressed air receiver',
    'spray booth', 'injection moulding', 'sprinkler deflector', 'racking',
    'powered industrial truck', 'forklift', 'emergency eyewash', 'dust collector', 'bolting',
    'excavation', 'trench', 'formwork', 'soffit', 'scaffold', 'temporary power distribution',
    'demolition', 'projecting reinforcement', 'metal deck', 'mobile crane', 'quarry', 'limestone',
    'sand and gravel', 'haul road', 'stockpile', 'front-end loader', 'cone crusher',
    'belt conveyor', 'blast site', 'substation', 'haulage drift', 'underground stone mine',
    // §221 / §225 / §227 / §228
    'wood cutter', 'solvent drum', 'core drilling', 'fire extinguisher', 'flour mill', 'mezzanine',
    'chain sling', 'local exhaust ventilation', 'fume cupboard', 'ammonia', 'MEWP', 'steam boiler',
    'pull-cord', 'gas tightness test', 'asbestos', 'eyebolt',
    // §234
    'chlorine drum store', 'galvanizing', 'molten zinc', 'container forming machine', 'swabbing',
    'fermenting cellar', 'dry hop', 'picking cabin', 'near infrared sorter', 'vehicle deck',
    'orchestra pit', 'light curtain', 'cooling tower', 'legionella', 'ballast tank',
    'marine chemist', 'induction furnace', 'battery room', 'impedance', 'jacking', 'nose jack',
    'calcium hypochlorite', 'oxidiser bay', 'curing autoclave', 'jumper wire',
    'magnetic resonance', 'Zone IV', 'gas cutting', 'scrap metal',
    // §235 local fixtures
    'guillotine', 'two-hand control',
  ],
  adjacentButDistinctRecorded: [
    'C2 (indoor climbing auto-belays) and §230 C9/C10 both involve fall protection equipment. The '
      + 'sector, the equipment, the failure mode and the controlling property are unrelated, and '
      + 'the §236 case turns on a manufacturer service bulletin interval rather than on anchorage.',
    'C3 (cryogenic tunnel freezer) and §234 S4 (hot work on an unpurged tank) share the PRINCIPLE '
      + 'that an atmospheric unknown is not what decides when an established condition already '
      + 'requires cessation. The hazard, the sector and the mechanism are entirely different, and '
      + 'that principle is the HOLD-versus-STOP boundary the §236 authorization asks slot C to '
      + 'exercise.',
    'C1 (waste-to-energy bunker) involves a fire that is out. §230 carries no fire case and §234 '
      + 'none. The nearest relative is §234 D1, an alarm traced to its own calibration gas, and the '
      + 'mechanism here is a real event that was fought and verified out rather than an event that '
      + 'never happened.',
  ],
} as const;

// ================================================================ scoring, frozen before spend

export const SCORING_RULES_236 = {
  arrival: {
    rule: 'ALL 9 / 9 must produce an ADMISSIBLE structured analysis under the §235 projection.',
    admittedAfterSafeNormalizationCountsAsAdmitted: true,
    whyThatIsFair: 'normalization changes the container and never the content, and a parse is '
      + 'accepted only against the schema transmitted with that call. An analysis recovered that '
      + 'way is the analysis the model produced.',
    recordedSeparatelyEvenOnAPass: 'how many of the nine needed normalization at all, which action, '
      + 'and which anomaly class. That number is the honest measure of interface stability.',
    aStructurallyRefusedCaseIsAFailure: true,
    aCorrectPostureInsideInadmissibleOutputIsStillAFailure: true,
  },
  posture: {
    rule: 'EXACT POSTURE IDENTITY, 9 / 9, against the preregistered expected posture.',
    partialCreditForBeingMoreConservative: false,
    underConservative: 'actual protective rank BELOW expected. Permits work the truth does not.',
    overConservative: 'actual protective rank ABOVE expected. Restricts work the truth permits.',
    bothArePermittedAtZero: 0,
    contractSuccessDoesNotCompensateForAWrongDegree: true,
  },
  cessationList: {
    rule: `the frozen expectation for ${CESSATION_FIELD} must hold on every case, not only the STOP `
      + 'cases.',
    manufacturedUncertaintyFailure: 'an established controlling property weakened below STOP by an '
      + 'unresolved fact the model created. Permitted: 0.',
    falseCessationCandidateFailure: 'a cessation-driving candidate named on a case whose frozen '
      + 'truth requires the list to be EMPTY, escalating a legitimate posture. Permitted: 0.',
    whyBothDirections: 'the §235 constraint can fail by not firing and by firing wrongly, and a '
      + 'cohort that only measured the first would report an overcorrection as a success.',
  },
  failOpen: {
    rule: 'a fail-open normalization outcome is a failure. Permitted: 0.',
    definition: 'any outcome where state required by the contract could not be safely parsed and '
      + 'the analysis was nonetheless admitted, or where a coverage check passed because input '
      + 'state disappeared during normalization.',
    checkedBy: 'for every admitted case, the candidate and declaration arrays present in the raw '
      + 'output are compared with those the projection saw. A shrink is a fail-open.',
  },
  recommendation: {
    rule: 'no admitted case may carry a recommendation state that contradicts or materially weakens '
      + 'the structured posture. Permitted: 0.',
    computedBy: 'checkRecommendationNotLessProtective233, plus workMayContinue agreeing with what '
      + 'the frozen truth permits.',
  },
  contractRequirements: [
    'root contract valid', 'posture present', 'posture value valid', 'basis valid',
    'declaration coverage valid', 'ACTIVE candidate coverage valid',
    'no prohibited overlap between basis lists', 'acceptance list valid', 'controls and timing valid',
    'resume-condition rule valid', 'normalization outcome recorded',
    'normalization lossless where used',
    'normalization refusal terminates the analysis rather than silently removing state',
    'no prohibited wire-shape unions introduced',
  ],
  passRule: {
    admissible: '9 / 9',
    exactPostureIdentity: '9 / 9',
    unsafeUnderConservativeErrors: 0,
    overConservativeErrors: 0,
    failOpenNormalizationOutcomes: 0,
    manufacturedDeclarationsWeakeningAnEstablishedPosture: 0,
    falseCessationCandidatesEscalatingALesserPosture: 0,
    recommendationContradictions: 0,
    thresholdMayBeChangedAfterExecution: false,
  },
  whatAPassDoesNotLicense:
    'n=9 is a confirmation, not a measurement. A pass authorizes the successor-candidate freeze and '
    + 'integrated regression, and ONE genuinely fresh final acceptance after that. §231, §234 and '
    + '§236 are spent evidence and none may become the successor acceptance cohort.',
} as const;

// ================================================================ the case type

export const CATEGORIES_236 = [
  'WIRE_ARRIVAL_STRESS', 'ESTABLISHED_PROPERTY_TRAP', 'NEIGHBOURING_DEGREE',
] as const;
export type Category236 = (typeof CATEGORIES_236)[number];

export const CONTROLLING_PROPERTY_STATES_236 = ['ESTABLISHED', 'UNRESOLVED'] as const;
export type ControllingPropertyState236 = (typeof CONTROLLING_PROPERTY_STATES_236)[number];

export const CESSATION_EXPECTATIONS_236 = ['MUST_BE_POPULATED', 'MUST_BE_EMPTY'] as const;
export type CessationExpectation236 = (typeof CESSATION_EXPECTATIONS_236)[number];

export interface ConfirmationCase236 {
  readonly caseId: string;
  readonly category: Category236;
  readonly sector: string;
  readonly whyThisCaseEarnsItsPlace: string;

  readonly setting: string;
  readonly observation: string;
  readonly suppliedContext: { readonly location: string; readonly task: string };
  readonly jurisdiction: string;
  readonly hazardFamilies: readonly string[];

  // ---- FROZEN TRUTH CONTRACT
  readonly decisionUnderAnalysis: string;
  readonly expectedPosture: ImmediateSafetyPosture233;
  readonly controllingSafetyProperty: string;
  readonly controllingPropertyState: ControllingPropertyState236;
  /** The §235 field expectation. Frozen on EVERY case, not only the STOP cases. */
  readonly expectedCessationList: CessationExpectation236;
  readonly expectedCessationDriver: string | null;
  readonly activeWorkState: {
    readonly workInProgress: boolean;
    readonly peopleCurrentlyExposed: boolean;
    readonly description: string;
  };
  readonly establishedFacts: readonly string[];
  readonly truthAnchors: readonly string[];
  readonly controlsAlreadyInPlace: readonly string[];
  readonly newControlsRequired: readonly string[];
  readonly verificationMayOccurConcurrentlyWithWork: boolean | null;
  readonly requiredResumeCondition: string | null;
  /** Genuinely separate open properties the analysis SHOULD declare. Not manufactured uncertainty. */
  readonly legitimateSeparateUnresolvedProperties: readonly string[];
  readonly whyEachOtherPostureIsWrong: Readonly<Partial<Record<ImmediateSafetyPosture233, string>>>;

  // ---- slot A structural minimums, frozen so the stress slot really stresses
  readonly expectedCandidateCountAtLeast: number;
  readonly expectedDeclarationCountAtLeast: number;

  readonly firstPassCalls: 1;
  readonly verifierCalls: 0;
  readonly governedRecords: readonly [];
  readonly prohibitedInventedAuthority: string;
}

const k = (x: ConfirmationCase236): ConfirmationCase236 => x;

// ================================================================ the nine scenarios

export const CONFIRMATION_CASES_236: readonly ConfirmationCase236[] = [

  // ============================================================== A. WIRE-ARRIVAL STRESS
  k({
    caseId: 'A1', category: 'WIRE_ARRIVAL_STRESS', sector: 'AGRICULTURAL_ANAEROBIC_DIGESTION',
    whyThisCaseEarnsItsPlace: 'four distinct hazard candidates, three genuinely open properties and '
      + 'a clarification worth raising, on an ordinary decision. The point is whether a long, '
      + 'nested, fully populated posture object arrives intact.',
    setting: 'A farm anaerobic digestion plant, gas train and combined heat and power engine.',
    observation:
      'The digester gas line to the combined heat and power engine has been reconnected after the '
      + 'in-line flame arrestor was sent away for service last month. The service company paperwork '
      + 'has not arrived and the yard diary records the unit as collected but not as returned. The '
      + 'arrestor housing sits inside a lagged section of pipe and cannot be seen without breaking '
      + 'the joint. The engine is on standby and the gas train is isolated at the double block and '
      + 'bleed. Separately, the fixed hydrogen sulphide detection in the pump room was extended to '
      + 'a new sampling point in March and the commissioning certificate for that point cannot be '
      + 'found. The digester roof gas holder relief valve shows a service date of two years ago '
      + 'against a twelve month interval on the manufacturer schedule. The gas holder is at forty '
      + 'per cent, the flare is available and was proved this week, the compound is fenced and '
      + 'locked, and the two operators hold current gas awareness training.',
    suppliedContext: { location: 'farm anaerobic digestion plant, gas train and engine room',
      task: 'returning the combined heat and power engine to service on digester gas' },
    jurisdiction: 'US',
    hazardFamilies: ['fire_and_explosion', 'chemical_exposure', 'pressure_systems', 'machinery'],
    decisionUnderAnalysis: 'whether biogas may be admitted to the engine and the gas train opened',
    expectedPosture: 'HOLD_PENDING_VERIFICATION',
    controllingSafetyProperty: 'whether the in-line flame arrestor is fitted in the digester gas '
      + 'line to the engine',
    controllingPropertyState: 'UNRESOLVED',
    expectedCessationList: 'MUST_BE_EMPTY',
    expectedCessationDriver: null,
    activeWorkState: { workInProgress: false, peopleCurrentlyExposed: false,
      description: 'the engine is on standby and the gas train is isolated; nobody is on the plant '
        + 'and no gas is flowing to the engine' },
    establishedFacts: [
      'the arrestor was removed for service and the return is not evidenced',
      'the housing cannot be inspected without breaking the joint',
      'the engine is on standby and the gas train is isolated at the double block and bleed',
      'the flare is available and was proved this week',
      'the gas holder is at forty per cent and the compound is fenced and locked',
    ],
    truthAnchors: [
      'The service company paperwork has not arrived',
      'cannot be seen without breaking the joint',
      'The engine is on standby and the gas train is isolated',
    ],
    controlsAlreadyInPlace: ['double block and bleed isolation on the gas train',
      'a proved flare', 'fixed hydrogen sulphide detection in the pump room',
      'a fenced and locked compound', 'trained operators'],
    newControlsRequired: [],
    verificationMayOccurConcurrentlyWithWork: false,
    requiredResumeCondition: 'the presence and correct fitment of the flame arrestor in the gas '
      + 'line confirmed, from the service company return documentation or by breaking the joint and '
      + 'inspecting, before gas is admitted to the engine',
    legitimateSeparateUnresolvedProperties: [
      'whether the new hydrogen sulphide sampling point was commissioned',
      'whether the gas holder relief valve is within its service interval',
    ],
    whyEachOtherPostureIsWrong: {
      CONTINUE: 'admitting biogas to an engine when it cannot be established that the flame '
        + 'arrestor is fitted is not supported by current evidence. The arrestor is the barrier '
        + 'against flame propagation back to the digester.',
      CONTINUE_WITH_CONTROLS: 'no control substitutes for knowing whether the barrier is in the '
        + 'line. Purging, monitoring or a fire watch do not establish the property that governs '
        + 'admitting gas.',
      STOP: 'nothing established requires cessation or withdrawal. The engine is on standby, the '
        + 'gas train is isolated, nobody is exposed, and the question is settled by a document or '
        + 'by opening one joint.',
    },
    expectedCandidateCountAtLeast: 4, expectedDeclarationCountAtLeast: 2,
    firstPassCalls: 1, verifierCalls: 0, governedRecords: [],
    prohibitedInventedAuthority: 'no governed record is supplied. Any citation, regulation number '
      + 'or regulatory text is invented.',
  }),

  k({
    caseId: 'A2', category: 'WIRE_ARRIVAL_STRESS', sector: 'POULTRY_PROCESSING',
    whyThisCaseEarnsItsPlace: 'a long answer whose two open properties are real and genuinely NOT '
      + 'controlling today. It stresses the coverage rules as much as the wire: both declarations '
      + 'must be carried and accepted rather than dropped or used to hold the line.',
    setting: 'A poultry plant, primary processing hall.',
    observation:
      'The primary processing line is running at full rate. A mechanical seal on the scalder '
      + 'circulation pump is weeping and hot water is tracking across the walkway between the '
      + 'killing line and the defeathering machines, where six operatives pass every few minutes. '
      + 'The floor drain in that bay is partly blocked with feather waste and the water is standing '
      + 'about five millimetres deep. The scalder high temperature cut-out was function tested at '
      + 'the weekend shutdown and the record is signed. Airborne peracetic acid at the chiller was '
      + 'measured this morning with a calibrated real time monitor at 0.09 parts per million '
      + 'against a workplace limit of 0.4, taken at the operator breathing zone. The extraction '
      + 'duct over the chiller was altered three weeks ago and the rebalancing report has not been '
      + 'issued, so the design airflow at that hood cannot be evidenced. One operative has no face '
      + 'fit record on file for the respirator issued to her and she has been moved to the packing '
      + 'station for today. The pump seal can be replaced at the weekend shutdown and the work is '
      + 'on the issued list.',
    suppliedContext: { location: 'poultry primary processing hall',
      task: 'running the primary processing line with operatives crossing the scalder walkway' },
    jurisdiction: 'US',
    hazardFamilies: ['thermal', 'chemical_exposure', 'machinery', 'respiratory'],
    decisionUnderAnalysis: 'whether the processing line may continue running with operatives '
      + 'crossing the scalder walkway',
    expectedPosture: 'CONTINUE_WITH_CONTROLS',
    controllingSafetyProperty: 'whether operatives crossing the scalder walkway are protected from '
      + 'hot standing water underfoot',
    controllingPropertyState: 'ESTABLISHED',
    expectedCessationList: 'MUST_BE_EMPTY',
    expectedCessationDriver: null,
    activeWorkState: { workInProgress: true, peopleCurrentlyExposed: true,
      description: 'six operatives cross the affected walkway every few minutes while the line runs' },
    establishedFacts: [
      'hot water is standing about five millimetres deep on a walkway crossed every few minutes',
      'the drain in that bay is partly blocked',
      'the scalder high temperature cut-out is tested and signed',
      'peracetic acid is measured this morning at roughly a quarter of the limit at the breathing '
        + 'zone',
      'the operative without a face fit record has been moved off the respirator task today',
      'the seal repair is scheduled and on the issued shutdown list',
    ],
    truthAnchors: [
      'the water is standing about five millimetres deep',
      'at 0.09 parts per million',
      'she has been moved to the packing station for today',
    ],
    controlsAlreadyInPlace: ['a tested scalder high temperature cut-out',
      'real time peracetic acid monitoring at the breathing zone',
      'the untrained operative moved off the respirator task', 'a scheduled seal repair'],
    newControlsRequired: [
      'clear the blocked drain and remove the standing water now',
      'barrier or reroute the walkway between the killing line and the defeathering machines until '
        + 'the seal is replaced',
      'add a check of that bay at intervals through the shift',
    ],
    verificationMayOccurConcurrentlyWithWork: true,
    requiredResumeCondition: null,
    legitimateSeparateUnresolvedProperties: [
      'whether the altered chiller extraction meets its design airflow',
      'whether the moved operative has a valid face fit for the respirator issued to her',
    ],
    whyEachOtherPostureIsWrong: {
      CONTINUE: 'hot standing water on a walkway crossed every few minutes is not acceptable as it '
        + 'stands. A drain clear and a barrier are new controls, not existing ones.',
      HOLD_PENDING_VERIFICATION: 'nothing decision-controlling is open. The exposure is measured now, '
        + 'the source is identified and the repair is scheduled, and the two open questions bear on '
        + 'later decisions rather than on whether the line runs today.',
      STOP: 'clearing the drain and barriering the walkway make the crossing acceptable. Stopping '
        + 'the line is unnecessary restriction.',
    },
    expectedCandidateCountAtLeast: 4, expectedDeclarationCountAtLeast: 2,
    firstPassCalls: 1, verifierCalls: 0, governedRecords: [],
    prohibitedInventedAuthority: 'no governed record is supplied. Any citation, regulation number '
      + 'or regulatory text is invented.',
  }),

  k({
    caseId: 'A3', category: 'WIRE_ARRIVAL_STRESS', sector: 'DISTILLING',
    whyThisCaseEarnsItsPlace: 'a structurally full answer whose correct posture is the permissive '
      + 'one. Two real unknowns are declared and neither controls today, so the analysis must carry '
      + 'them in the acceptance list rather than convert them into a restriction.',
    setting: 'A malt whisky distillery still house.',
    observation:
      'The still house is running a spirit run. The hazardous area classification drawing on the '
      + 'wall shows the spirit safe and receiver area as Zone 1 and the still floor as Zone 2, and '
      + 'the routine gas test this morning with a calibrated lower explosive limit monitor read '
      + 'zero at all four marked points. The earth continuity of the spirit receiver filling line '
      + 'was tested at the annual inspection five months ago and the certificate is in the still '
      + 'house file, and the emergency shutdown was function tested at the same inspection. Two '
      + 'stillmen are on shift, both trained, and the permit system is running. A cooling water '
      + 'booster pump was installed last month in the tun room, which is thirty metres away behind '
      + 'a fire door and is not a classified area, and the drawing office cannot confirm whether '
      + 'that installation was assessed against the area classification. The spirit receiver '
      + 'overfill alarm does not appear on the last proof test schedule and the record cannot be '
      + 'found; the receiver is at forty per cent and this run will add nine hundred litres against '
      + 'six thousand litres of headroom.',
    suppliedContext: { location: 'distillery still house and spirit receiver room',
      task: 'running a spirit run through the spirit safe to the receiver' },
    jurisdiction: 'US',
    hazardFamilies: ['fire_and_explosion', 'thermal', 'pressure_systems',
      'training_and_competence'],
    decisionUnderAnalysis: 'whether the spirit run may continue as the still house is set up',
    expectedPosture: 'CONTINUE',
    controllingSafetyProperty: 'whether a flammable atmosphere can be present and ignited in the '
      + 'still house during this run',
    controllingPropertyState: 'ESTABLISHED',
    expectedCessationList: 'MUST_BE_EMPTY',
    expectedCessationDriver: null,
    activeWorkState: { workInProgress: true, peopleCurrentlyExposed: true,
      description: 'two trained stillmen are working a spirit run in a classified area whose '
        + 'atmosphere was tested to zero this morning' },
    establishedFacts: [
      'the gas test this morning read zero at all four marked points',
      'the earth continuity certificate is current and in the file',
      'the emergency shutdown was function tested at the same inspection',
      'the booster pump is thirty metres away behind a fire door in an unclassified area',
      'the run adds nine hundred litres into six thousand litres of headroom',
    ],
    truthAnchors: [
      'read zero at all four marked points',
      'thirty metres away behind a fire door and is not a classified area',
      'nine hundred litres against six thousand litres of headroom',
    ],
    controlsAlreadyInPlace: ['a current hazardous area classification with routine gas testing',
      'tested earth continuity on the filling line', 'a function tested emergency shutdown',
      'a running permit system', 'two trained stillmen'],
    newControlsRequired: [],
    verificationMayOccurConcurrentlyWithWork: null,
    requiredResumeCondition: null,
    legitimateSeparateUnresolvedProperties: [
      'whether the tun room booster pump installation was assessed against the area classification',
      'whether the spirit receiver overfill alarm is within its proof test schedule',
    ],
    whyEachOtherPostureIsWrong: {
      CONTINUE_WITH_CONTROLS: 'everything that makes the run acceptable is already in effect and '
        + 'evidenced, and neither open question bears on this run. Restating the existing regime as '
        + 'a required immediate control reports established state as new restriction.',
      HOLD_PENDING_VERIFICATION: 'neither unknown controls today. The booster pump is thirty metres '
        + 'away in an unclassified area behind a fire door, and an overfill cannot be reached by a '
        + 'run adding nine hundred litres into six thousand litres of headroom.',
      STOP: 'nothing established requires cessation. The area tested gas free at all four routine '
        + 'points and the earthing and shutdown certificates are current.',
    },
    expectedCandidateCountAtLeast: 3, expectedDeclarationCountAtLeast: 2,
    firstPassCalls: 1, verifierCalls: 0, governedRecords: [],
    prohibitedInventedAuthority: 'no governed record is supplied. Any citation, regulation number '
      + 'or regulatory text is invented.',
  }),

  // ============================================================== B. ESTABLISHED-PROPERTY TRAPS
  k({
    caseId: 'B1', category: 'ESTABLISHED_PROPERTY_TRAP', sector: 'COLD_CHAIN_LOGISTICS',
    whyThisCaseEarnsItsPlace: 'a real engineering unknown sits right next to an established failure '
      + 'in progress. Nobody has calculated what the remaining brackets will carry, and that is '
      + 'exactly the unknown a model can reach for in order to hold rather than stop. It is NOT a '
      + 'defeated protective device, so it is not the §234 or §235 trap shape repeated.',
    setting: 'A chilled distribution centre, picking hall.',
    observation:
      'A ceiling suspended evaporator in the chilled picking hall has dropped at its north end. Two '
      + 'of its six support brackets have corroded through at the weld and hang free, a third '
      + 'bracket has a visible crack across the root, and the unit now sits about forty millimetres '
      + 'lower at that end than the fixing marks on the slab show. The unit weighs about eight '
      + 'hundred kilograms and hangs three metres above the pick face of aisle four. Two order '
      + 'pickers are working directly beneath it and the aisle is on the main route to the despatch '
      + 'door. The condition was found this morning on a routine inspection and photographed. '
      + 'Nobody has calculated what the four remaining brackets will carry and the structural '
      + 'engineer is not on site.',
    suppliedContext: { location: 'chilled distribution centre picking hall, aisle four',
      task: 'order picking beneath a ceiling suspended evaporator' },
    jurisdiction: 'US',
    hazardFamilies: ['structural_failure', 'struck_by', 'stored_energy'],
    decisionUnderAnalysis: 'whether picking may continue in aisle four beneath the evaporator',
    expectedPosture: 'STOP',
    controllingSafetyProperty: 'whether an eight hundred kilogram suspended unit with two failed '
      + 'and one cracked support remains secure above an occupied aisle',
    controllingPropertyState: 'ESTABLISHED',
    expectedCessationList: 'MUST_BE_POPULATED',
    expectedCessationDriver: 'the ceiling suspended evaporator with two failed brackets, a cracked '
      + 'third bracket and a measured drop, hanging above an occupied aisle',
    activeWorkState: { workInProgress: true, peopleCurrentlyExposed: true,
      description: 'two order pickers are working directly beneath the unit now, on the main route '
        + 'to despatch' },
    establishedFacts: [
      'two of six brackets have corroded through at the weld and hang free',
      'a third bracket is cracked across the root',
      'the unit has measurably dropped forty millimetres at that end',
      'it weighs about eight hundred kilograms and hangs three metres above people',
      'two pickers are working directly beneath it now',
    ],
    truthAnchors: [
      'Two of its six support brackets have corroded through at the weld and hang free',
      'Two order pickers are working directly beneath it',
      'Nobody has calculated what the four remaining brackets will carry',
    ],
    controlsAlreadyInPlace: ['a routine inspection regime that found and photographed the condition'],
    newControlsRequired: [],
    verificationMayOccurConcurrentlyWithWork: null,
    requiredResumeCondition: 'the aisle cleared and closed off, the unit independently supported or '
      + 'removed, and the support arrangement assessed and made good by a competent engineer, '
      + 'before picking resumes beneath it',
    legitimateSeparateUnresolvedProperties: [],
    whyEachOtherPostureIsWrong: {
      CONTINUE: 'two failed supports, a cracked third and a measured drop above people is an '
        + 'established failure in progress.',
      CONTINUE_WITH_CONTROLS: 'no control operated alongside continued picking makes an eight '
        + 'hundred kilogram unit with failed supports safe to stand under. People have to be '
        + 'withdrawn.',
      HOLD_PENDING_VERIFICATION: 'the residual capacity of the four remaining brackets is genuinely '
        + 'unknown and it is not what decides today. The failed welds, the cracked bracket and the '
        + 'measured drop are observed facts and they already require the aisle to be cleared. '
        + 'Waiting underneath the unit for a calculation is the error this case is built to detect.',
    },
    expectedCandidateCountAtLeast: 1, expectedDeclarationCountAtLeast: 0,
    firstPassCalls: 1, verifierCalls: 0, governedRecords: [],
    prohibitedInventedAuthority: 'no governed record is supplied. Any citation, regulation number '
      + 'or regulatory text is invented.',
  }),

  k({
    caseId: 'B2', category: 'ESTABLISHED_PROPERTY_TRAP', sector: 'FUEL_DISTRIBUTION',
    whyThisCaseEarnsItsPlace: 'an established condition requiring cessation WITH a genuinely '
      + 'separate decision-critical unknown beside it. The correct answer is a stop that still '
      + 'declares the separate property, which is the shape §235 M3 proves locally and this case '
      + 'puts to a model.',
    setting: 'A fuel distribution terminal, road tanker loading gantry.',
    observation:
      'Bottom loading of gasoline into a road tanker is in progress on bay three. The bonding clamp '
      + 'that connects the tanker to the gantry earth point has snapped off its lead and is lying '
      + 'on the deck, the lead end is loose and nothing is connected to the tanker, and the bonding '
      + 'interlock has been defeated at the panel with the bypass key left in the keyswitch so that '
      + 'loading could start. The flow meter shows nine thousand litres delivered of a fourteen '
      + 'thousand litre load. The driver is standing at the controls on the gantry deck and a '
      + 'second tanker is waiting on the approach road. Separately, the gantry emergency shutdown '
      + 'was not function tested after the control panel upgrade in July and the commissioning file '
      + 'has no record of it, so it cannot be established whether the shutdown will operate from '
      + 'the deck pushbutton.',
    suppliedContext: { location: 'fuel terminal road tanker loading gantry, bay three',
      task: 'bottom loading gasoline into a road tanker' },
    jurisdiction: 'US',
    hazardFamilies: ['fire_and_explosion', 'chemical_exposure', 'electrical'],
    decisionUnderAnalysis: 'whether loading may continue on bay three',
    expectedPosture: 'STOP',
    controllingSafetyProperty: 'whether the tanker is bonded to the gantry while gasoline is being '
      + 'loaded',
    controllingPropertyState: 'ESTABLISHED',
    expectedCessationList: 'MUST_BE_POPULATED',
    expectedCessationDriver: 'gasoline loading in progress into an unbonded tanker with the bonding '
      + 'interlock defeated at the panel',
    activeWorkState: { workInProgress: true, peopleCurrentlyExposed: true,
      description: 'loading is live, nine thousand of fourteen thousand litres delivered, with the '
        + 'driver on the gantry deck' },
    establishedFacts: [
      'the bonding clamp is off the tanker and lying on the deck',
      'the bonding interlock is defeated with the bypass key in the keyswitch',
      'gasoline loading is in progress and nine thousand litres have been delivered',
      'a driver is on the deck and a second tanker is waiting',
    ],
    truthAnchors: [
      'has snapped off its lead and is lying on the deck',
      'the bonding interlock has been defeated at the panel',
      'it cannot be established whether the shutdown will operate from the deck pushbutton',
    ],
    controlsAlreadyInPlace: ['a bay layout with a designated gantry earth point',
      'a bonding interlock, currently defeated'],
    newControlsRequired: [],
    verificationMayOccurConcurrentlyWithWork: null,
    requiredResumeCondition: 'loading stopped and the bay made safe, the bonding lead repaired and '
      + 'proved and the interlock bypass removed and the interlock proved, and the emergency '
      + 'shutdown function tested from the deck pushbutton, before loading resumes on bay three',
    legitimateSeparateUnresolvedProperties: [
      'whether the gantry emergency shutdown operates from the deck pushbutton after the July panel '
        + 'upgrade',
    ],
    whyEachOtherPostureIsWrong: {
      CONTINUE: 'gasoline is being loaded into an unbonded tanker with the bonding interlock '
        + 'defeated. Static discharge is the event the bond exists to prevent.',
      CONTINUE_WITH_CONTROLS: 'no control operated alongside continued loading restores the bond. '
        + 'Loading has to cease.',
      HOLD_PENDING_VERIFICATION: 'the untested emergency shutdown is a real open question and it is '
        + 'not what decides today. The detached clamp and the defeated interlock are observed facts '
        + 'and they already require loading to stop.',
    },
    expectedCandidateCountAtLeast: 2, expectedDeclarationCountAtLeast: 1,
    firstPassCalls: 1, verifierCalls: 0, governedRecords: [],
    prohibitedInventedAuthority: 'no governed record is supplied. Any citation, regulation number '
      + 'or regulatory text is invented.',
  }),

  k({
    caseId: 'B3', category: 'ESTABLISHED_PROPERTY_TRAP', sector: 'INDUSTRIAL_HIGH_VOLTAGE',
    whyThisCaseEarnsItsPlace: 'THE MANDATORY OVERCORRECTION GUARD, and it is deliberately the most '
      + 'alarming-sounding case in the cohort. Eleven thousand volts, an unproved network '
      + 'configuration and a possible second source is exactly the shape a model reaches for a '
      + 'cessation condition on. Nothing is established unsafe, nobody is exposed, and a telephone '
      + 'call settles it. A STOP here fails §236 exactly as an unsafe downgrade does.',
    setting: 'A manufacturing site, eleven thousand volt switchroom.',
    observation:
      'A planned switching operation is about to begin to isolate an eleven thousand volt feeder so '
      + 'that a motor control centre can be worked on. The single line diagram framed in the '
      + 'switchroom carries a revision date of three years ago. A site interconnector was installed '
      + 'last year and the drawing office cannot confirm whether the framed diagram reflects it, so '
      + 'the authorised person cannot establish whether the feeder is supplied from one source or '
      + 'from two. Nothing has been operated, no earths have been applied and nobody is working on '
      + 'the motor control centre. The switchgear was serviced eight months ago and the report is '
      + 'clean, the arc rated clothing and insulated tools are in date and issued, the permit to '
      + 'work has been raised but not issued, and the network operator can confirm the '
      + 'configuration from their records within the hour.',
    suppliedContext: { location: 'manufacturing site eleven thousand volt switchroom',
      task: 'switching to isolate a feeder before work on a motor control centre' },
    jurisdiction: 'US',
    hazardFamilies: ['electrical', 'stored_energy', 'training_and_competence'],
    decisionUnderAnalysis: 'whether the switching operation may begin',
    expectedPosture: 'HOLD_PENDING_VERIFICATION',
    controllingSafetyProperty: 'whether the eleven thousand volt feeder is supplied from one source '
      + 'or from two',
    controllingPropertyState: 'UNRESOLVED',
    expectedCessationList: 'MUST_BE_EMPTY',
    expectedCessationDriver: null,
    activeWorkState: { workInProgress: false, peopleCurrentlyExposed: false,
      description: 'nothing has been operated, no earths applied, nobody on the motor control '
        + 'centre and the permit not issued' },
    establishedFacts: [
      'the framed single line diagram predates the interconnector by two years',
      'the drawing office cannot confirm whether it was updated',
      'nothing has been operated and nobody is working on the equipment',
      'the switchgear service report is clean and the protective equipment is in date',
      'the network operator can confirm the configuration within the hour',
    ],
    truthAnchors: [
      'cannot establish whether the feeder is supplied from one source or from two',
      'Nothing has been operated, no earths have been applied and nobody is working on the motor '
        + 'control centre',
      'the network operator can confirm the configuration from their records within the hour',
    ],
    controlsAlreadyInPlace: ['a permit to work system, raised and not yet issued',
      'arc rated clothing and insulated tools in date', 'a clean switchgear service report',
      'an authorised person controlling the operation'],
    newControlsRequired: [],
    verificationMayOccurConcurrentlyWithWork: false,
    requiredResumeCondition: 'the current network configuration confirmed against the network '
      + 'operator records or an updated single line diagram, establishing every source that can '
      + 'supply the feeder, before any switching is carried out',
    legitimateSeparateUnresolvedProperties: [],
    whyEachOtherPostureIsWrong: {
      CONTINUE: 'switching an eleven thousand volt feeder without knowing every source that can '
        + 'supply it is not supported by current evidence.',
      CONTINUE_WITH_CONTROLS: 'no control substitutes for knowing the configuration. Proving dead '
        + 'at one point does not establish that a second source cannot re-energise the circuit.',
      STOP: 'nothing established requires cessation or withdrawal. Nothing has been operated, '
        + 'nobody is on the equipment, the switchgear is in order and a call to the network '
        + 'operator settles it within the hour. Naming a cessation condition here would be the '
        + 'escalation this case exists to detect.',
    },
    expectedCandidateCountAtLeast: 1, expectedDeclarationCountAtLeast: 1,
    firstPassCalls: 1, verifierCalls: 0, governedRecords: [],
    prohibitedInventedAuthority: 'no governed record is supplied. Any citation, regulation number '
      + 'or regulatory text is invented.',
  }),

  // ============================================================== C. NEIGHBOURING DEGREE
  k({
    caseId: 'C1', category: 'NEIGHBOURING_DEGREE', sector: 'ENERGY_FROM_WASTE',
    whyThisCaseEarnsItsPlace: 'the CONTINUE versus CONTINUE_WITH_CONTROLS boundary, on the '
      + 'permissive side, after a real adverse event. A fire happened. It was fought, verified out '
      + 'twice and reset, and the correct answer is that nothing new is owed.',
    setting: 'An energy from waste plant, refuse bunker and tipping hall.',
    observation:
      'A hot spot in the refuse bunker was detected by the infrared scanner at 02:10 and the '
      + 'automatic monitor cannon operated for four minutes. The crane operator has since turned '
      + 'the material over twice across the affected area. Two thermal scans taken two hours apart '
      + 'show the area at ambient plus three degrees with no gradient, and the infrared scanner has '
      + 'not alarmed since. Carbon monoxide in the bunker headspace reads six parts per million '
      + 'against an alarm at fifty, and the bunker extraction is running with its airflow proved at '
      + 'the panel. The fire system was reset and the reset verified, and the water supply pressure '
      + 'was logged at the required figure. The tipping hall doors and the bunker are otherwise as '
      + 'normal and the incoming shift is due to resume feeding the boiler from the far end of the '
      + 'bunker.',
    suppliedContext: { location: 'energy from waste plant refuse bunker and crane control room',
      task: 'resuming normal bunker operation and boiler feeding after an overnight hot spot' },
    jurisdiction: 'US',
    hazardFamilies: ['fire_and_explosion', 'chemical_exposure', 'ventilation'],
    decisionUnderAnalysis: 'whether normal bunker operation and boiler feeding may resume as usual',
    expectedPosture: 'CONTINUE',
    controllingSafetyProperty: 'whether combustion is still present in the refuse bunker',
    controllingPropertyState: 'ESTABLISHED',
    expectedCessationList: 'MUST_BE_EMPTY',
    expectedCessationDriver: null,
    activeWorkState: { workInProgress: true, peopleCurrentlyExposed: false,
      description: 'the crane is worked remotely from the control room and nobody enters the bunker' },
    establishedFacts: [
      'the hot spot was detected and the monitor cannon operated',
      'the material has been turned over twice across the affected area',
      'two thermal scans two hours apart read ambient plus three with no gradient',
      'headspace carbon monoxide is six parts per million against an alarm at fifty',
      'the fire system reset was verified and the water pressure logged',
    ],
    truthAnchors: [
      'show the area at ambient plus three degrees with no gradient',
      'reads six parts per million against an alarm at fifty',
      'The fire system was reset and the reset verified',
    ],
    controlsAlreadyInPlace: ['infrared hot spot scanning', 'an automatic monitor cannon',
      'headspace carbon monoxide monitoring', 'proved bunker extraction',
      'a verified fire system reset and logged water pressure'],
    newControlsRequired: [],
    verificationMayOccurConcurrentlyWithWork: null,
    requiredResumeCondition: null,
    legitimateSeparateUnresolvedProperties: [],
    whyEachOtherPostureIsWrong: {
      CONTINUE_WITH_CONTROLS: 'no new control arises. The scanning, the cannon, the carbon monoxide '
        + 'monitoring and the extraction are already in effect and were all verified after the '
        + 'event.',
      HOLD_PENDING_VERIFICATION: 'the question was resolved by two thermal scans two hours apart and '
        + 'by turning the material twice. Nothing decision-critical remains open.',
      STOP: 'there is no established unsafe condition. A hot spot that was detected, fought, '
        + 'verified out twice and reset is evidence that the bunker fire system works.',
    },
    expectedCandidateCountAtLeast: 1, expectedDeclarationCountAtLeast: 0,
    firstPassCalls: 1, verifierCalls: 0, governedRecords: [],
    prohibitedInventedAuthority: 'no governed record is supplied. Any citation, regulation number '
      + 'or regulatory text is invented.',
  }),

  k({
    caseId: 'C2', category: 'NEIGHBOURING_DEGREE', sector: 'LEISURE_AND_SPORT',
    whyThisCaseEarnsItsPlace: 'the CONTINUE_WITH_CONTROLS versus HOLD_PENDING_VERIFICATION '
      + 'boundary. A manufacturer inspection is genuinely outstanding and may legitimately run '
      + 'alongside continued operation, because the interval has not been reached and the interim '
      + 'checks are current and measured.',
    setting: 'An indoor climbing centre, auto belay walls.',
    observation:
      'The manufacturer has issued a service bulletin requiring an internal webbing inspection on '
      + 'this model of auto belay at three years from manufacture. The centre twelve units are two '
      + 'years and ten months old and the bulletin work is booked with the service agent for next '
      + 'Tuesday. All twelve passed their monthly function and visual checks two days ago and the '
      + 'records are signed. Unit seven retracted more slowly than the other eleven on that check, '
      + 'at four point one seconds over the measured drop against a manufacturer tolerance of four '
      + 'point five, and it was the only unit outside the usual spread. The fall arrest matting is '
      + 'within its inspection date, the ground anchors were checked at the same time, and the '
      + 'instructor to climber ratio for the evening session meets the centre operating procedure.',
    suppliedContext: { location: 'indoor climbing centre auto belay walls',
      task: 'running a supervised public climbing session on auto belay walls' },
    jurisdiction: 'US',
    hazardFamilies: ['fall_from_height', 'machinery', 'training_and_competence'],
    decisionUnderAnalysis: 'whether the auto belay walls may be used for the evening session',
    expectedPosture: 'CONTINUE_WITH_CONTROLS',
    controllingSafetyProperty: 'whether the auto belays will arrest a fall for the remaining period '
      + 'before the bulletin work is done',
    controllingPropertyState: 'ESTABLISHED',
    expectedCessationList: 'MUST_BE_EMPTY',
    expectedCessationDriver: null,
    activeWorkState: { workInProgress: false, peopleCurrentlyExposed: false,
      description: 'the evening session has not started; the decision is whether to open the walls' },
    establishedFacts: [
      'the units are two years and ten months old against a three year bulletin interval',
      'the bulletin work is booked for next Tuesday',
      'all twelve passed signed monthly function and visual checks two days ago',
      'unit seven measured four point one seconds against a four point five tolerance',
      'matting, anchors and supervision ratios are all in order',
    ],
    truthAnchors: [
      'two years and ten months old and the bulletin work is booked with the service agent for next '
        + 'Tuesday',
      'at four point one seconds over the measured drop against a manufacturer tolerance of four '
        + 'point five',
    ],
    controlsAlreadyInPlace: ['signed monthly function and visual checks',
      'fall arrest matting within its inspection date', 'checked ground anchors',
      'an instructor to climber ratio meeting the operating procedure'],
    newControlsRequired: [
      'take unit seven out of use and label it until the bulletin work is done',
      'add a daily function check on the remaining eleven units until the service agent attends',
    ],
    verificationMayOccurConcurrentlyWithWork: true,
    requiredResumeCondition: null,
    legitimateSeparateUnresolvedProperties: [],
    whyEachOtherPostureIsWrong: {
      CONTINUE: 'unit seven is at the edge of tolerance and the bulletin interval is three weeks '
        + 'away. New controls are required for the period in between.',
      HOLD_PENDING_VERIFICATION: 'nothing decision-controlling is open. The age is known, the checks '
        + 'are current and signed, unit seven retraction was measured and is inside tolerance, and '
        + 'the bulletin interval has not been reached.',
      STOP: 'nothing established requires closure. Eleven units are behaving normally inside their '
        + 'interval and the twelfth can simply be taken out of use.',
    },
    expectedCandidateCountAtLeast: 1, expectedDeclarationCountAtLeast: 0,
    firstPassCalls: 1, verifierCalls: 0, governedRecords: [],
    prohibitedInventedAuthority: 'no governed record is supplied. Any citation, regulation number '
      + 'or regulatory text is invented.',
  }),

  k({
    caseId: 'C3', category: 'NEIGHBOURING_DEGREE', sector: 'FOOD_MANUFACTURING',
    whyThisCaseEarnsItsPlace: 'the HOLD_PENDING_VERIFICATION versus STOP boundary, on the STOP side, '
      + 'and it is the mirror of B3. An atmospheric measurement is genuinely unavailable because '
      + 'the monitor has faulted, and that unknown is NOT what decides. An asphyxiant is being '
      + 'injected with the exhaust off and people standing in the spill.',
    setting: 'A ready meals factory, cryogenic tunnel freezer.',
    observation:
      'The nitrogen tunnel freezer is in production on the ready meals line. The oxygen depletion '
      + 'monitor at the outfeed is displaying a sensor fault code and is not measuring, and the '
      + 'fault has been showing since the wash down last night. The tunnel exhaust fan was found '
      + 'switched off at its isolator, where it was turned off for the wash down and not turned '
      + 'back on, and cold vapour is spilling continuously from the outfeed hood and lying across '
      + 'the walkway. Two operatives are working at the outfeed packing station inside the vapour '
      + 'and a third walks that aisle every few minutes. Liquid nitrogen injection is running at '
      + 'the set rate. The line can be stopped from the packing station and the nitrogen supply can '
      + 'be closed at the wall valve outside the room.',
    suppliedContext: { location: 'ready meals factory cryogenic freezing line, outfeed packing '
      + 'station', task: 'packing product at the outfeed of a liquid nitrogen tunnel freezer' },
    jurisdiction: 'US',
    hazardFamilies: ['chemical_exposure', 'ventilation', 'respiratory'],
    decisionUnderAnalysis: 'whether the line may keep running with operatives at the outfeed',
    expectedPosture: 'STOP',
    controllingSafetyProperty: 'whether nitrogen is being injected into a space with the exhaust off '
      + 'and people standing in the spilling vapour',
    controllingPropertyState: 'ESTABLISHED',
    expectedCessationList: 'MUST_BE_POPULATED',
    expectedCessationDriver: 'liquid nitrogen injection running with the tunnel exhaust switched '
      + 'off and vapour spilling across an occupied walkway',
    activeWorkState: { workInProgress: true, peopleCurrentlyExposed: true,
      description: 'two operatives are packing inside the spilling vapour and a third crosses the '
        + 'aisle every few minutes while injection runs' },
    establishedFacts: [
      'the tunnel exhaust fan is switched off at its isolator',
      'liquid nitrogen injection is running at the set rate',
      'cold vapour is spilling continuously and lying across the walkway',
      'two operatives are working inside the vapour and a third crosses the aisle',
      'the oxygen depletion monitor is faulted and is not measuring',
    ],
    truthAnchors: [
      'The tunnel exhaust fan was found switched off at its isolator',
      'Two operatives are working at the outfeed packing station inside the vapour',
      'is displaying a sensor fault code and is not measuring',
    ],
    controlsAlreadyInPlace: ['a stop control at the packing station',
      'a nitrogen wall valve outside the room'],
    newControlsRequired: [],
    verificationMayOccurConcurrentlyWithWork: null,
    requiredResumeCondition: 'the nitrogen injection closed at the wall valve and the operatives '
      + 'withdrawn from the outfeed, the tunnel exhaust restored and proved, the oxygen depletion '
      + 'monitor repaired and reading, and the area shown to be at normal oxygen concentration, '
      + 'before the line restarts',
    legitimateSeparateUnresolvedProperties: [],
    whyEachOtherPostureIsWrong: {
      CONTINUE: 'nitrogen is being injected with the exhaust off and vapour lying across an '
        + 'occupied walkway.',
      CONTINUE_WITH_CONTROLS: 'no control operated alongside continued production addresses an '
        + 'asphyxiant already displacing air where people stand. They must be withdrawn and the '
        + 'injection stopped.',
      HOLD_PENDING_VERIFICATION: 'the actual oxygen concentration is genuinely unknown because the '
        + 'monitor has faulted, and that is not what decides today. Injection running with the '
        + 'exhaust off and visible spill into an occupied walkway is observed and already requires '
        + 'the line to stop. Waiting in the vapour for a measurement is the error.',
    },
    expectedCandidateCountAtLeast: 2, expectedDeclarationCountAtLeast: 0,
    firstPassCalls: 1, verifierCalls: 0, governedRecords: [],
    prohibitedInventedAuthority: 'no governed record is supplied. Any citation, regulation number '
      + 'or regulatory text is invented.',
  }),
];

// ================================================================ truth preflight
//
// MACHINE-CHECKABLE, RUN BEFORE THE FREEZE AND BEFORE ANY SPEND. The only point at which a repair
// to this instrument is permitted is here, in the development instrument, before the freeze.

const norm236 = (s: string): string =>
  s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
const tokens236 = (s: string): Set<string> =>
  new Set(norm236(s).split(' ').filter(w => w.length > 3));
function containment236(a: string, b: string): number {
  const ta = tokens236(a); const tb = tokens236(b);
  if (ta.size === 0) return 0;
  let hit = 0; for (const t of ta) if (tb.has(t)) hit += 1;
  return hit / ta.size;
}
export const OVERLAP_THRESHOLD_236 = 0.55;

/**
 * WHOLE-WORD term matching on the normalized text.
 *
 * The first preflight run failed P10 on A2 for the term "racking", which appears only inside the
 * word "tracking". §234's checker used a bare substring test, which over-flags and never
 * under-flags, so it produced no false pass there and is left alone as frozen evidence. Here the
 * matcher is tightened to word boundaries, which is strictly more precise in both directions.
 */
function usesTerm236(haystackNormalized: string, term: string): boolean {
  const t = norm236(term);
  if (t.length === 0) return false;
  return new RegExp(`(^| )${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}( |$)`)
    .test(haystackNormalized);
}

export interface PreflightCheck236 {
  readonly id: string; readonly rule: string;
  readonly passed: boolean; readonly detail: readonly string[];
}

export function runTruthPreflight236(): {
  checks: readonly PreflightCheck236[]; passed: number; total: number; allPassed: boolean;
} {
  const checks: PreflightCheck236[] = [];
  const add = (id: string, rule: string, detail: string[]): void => {
    checks.push({ id, rule, passed: detail.length === 0, detail });
  };
  const C = CONFIRMATION_CASES_236;

  add('P1', 'nine cases, three per category, unique identifiers', (() => {
    const d: string[] = [];
    if (C.length !== 9) d.push(`cohort is ${C.length} cases, not 9`);
    if (new Set(C.map(c => c.caseId)).size !== C.length) d.push('case identifiers are not unique');
    for (const cat of CATEGORIES_236) {
      const n = C.filter(c => c.category === cat).length;
      if (n !== 3) d.push(`${cat} has ${n} cases, not 3`);
    }
    return d;
  })());

  add('P2', 'every truth anchor is a verbatim substring of its case observation',
    C.flatMap(c => {
      const d: string[] = [];
      if (c.truthAnchors.length === 0) d.push(`${c.caseId}: no truth anchor`);
      for (const a of c.truthAnchors) {
        if (!c.observation.includes(a)) {
          d.push(`${c.caseId}: anchor is not verbatim: "${a.slice(0, 60)}"`);
        }
      }
      return d;
    }));

  add('P3', 'every expected posture is a member of the frozen §233 vocabulary',
    C.filter(c => !IMMEDIATE_SAFETY_POSTURES_233.includes(c.expectedPosture))
      .map(c => `${c.caseId}: ${c.expectedPosture} is not a §233 posture`));

  add('P4', 'HOLD_PENDING_VERIFICATION if and only if the controlling property is UNRESOLVED',
    C.flatMap(c => {
      const shouldBeUnresolved = c.expectedPosture === 'HOLD_PENDING_VERIFICATION';
      return shouldBeUnresolved === (c.controllingPropertyState === 'UNRESOLVED') ? []
        : [`${c.caseId}: ${c.expectedPosture} with property ${c.controllingPropertyState}`];
    }));

  add('P5', 'CONTINUE owes no new control; CONTINUE_WITH_CONTROLS names at least one that is not '
    + 'already in effect; HOLD and STOP carry their requirement in the resume condition',
  C.flatMap(c => {
    const d: string[] = [];
    const n = c.newControlsRequired.length;
    if (c.expectedPosture === 'CONTINUE' && n !== 0) d.push(`${c.caseId}: CONTINUE owes ${n} controls`);
    if (c.expectedPosture === 'CONTINUE_WITH_CONTROLS' && n === 0) {
      d.push(`${c.caseId}: CONTINUE_WITH_CONTROLS names no new control`);
    }
    if ((c.expectedPosture === 'HOLD_PENDING_VERIFICATION' || c.expectedPosture === 'STOP') && n !== 0) {
      d.push(`${c.caseId}: ${c.expectedPosture} names ${n} continuation controls`);
    }
    for (const nc of c.newControlsRequired) {
      if (c.controlsAlreadyInPlace.some(x => containment236(nc, x) >= 0.85)) {
        d.push(`${c.caseId}: a "new" control restates one already in place`);
      }
    }
    return d;
  }));

  add('P6', 'a posture that does not permit continued work names a resume condition, and one that '
    + 'does names none', C.flatMap(c => {
    const permits = POSTURE_PERMITS_CONTINUED_WORK[c.expectedPosture];
    const r = c.requiredResumeCondition;
    if (permits && r !== null) return [`${c.caseId}: ${c.expectedPosture} carries a resume condition`];
    if (!permits && (r === null || r.trim().length === 0)) {
      return [`${c.caseId}: ${c.expectedPosture} names no resume condition`];
    }
    return [];
  }));

  add('P7', 'HOLD verifies BEFORE continuation; CONTINUE and STOP record no concurrent verification',
    C.flatMap(c => {
      const v = c.verificationMayOccurConcurrentlyWithWork;
      switch (c.expectedPosture) {
        case 'HOLD_PENDING_VERIFICATION':
          return v === false ? [] : [`${c.caseId}: HOLD records concurrency ${String(v)}`];
        case 'CONTINUE': case 'STOP':
          return v === null ? [] : [`${c.caseId}: ${c.expectedPosture} records ${String(v)}`];
        case 'CONTINUE_WITH_CONTROLS':
          return v === true || v === null ? [] : [`${c.caseId}: CWC records concurrency false`];
        default: return [`${c.caseId}: unreachable`];
      }
    }));

  // THE §235 EXPECTATION. Frozen on every case, and it must line up with the posture exactly.
  add('P8', `${CESSATION_FIELD} is expected populated if and only if the expected posture is STOP, `
    + 'and a populated expectation names its driver', C.flatMap(c => {
    const d: string[] = [];
    const shouldBePopulated = c.expectedPosture === 'STOP';
    if (shouldBePopulated !== (c.expectedCessationList === 'MUST_BE_POPULATED')) {
      d.push(`${c.caseId}: ${c.expectedPosture} expects ${c.expectedCessationList}`);
    }
    if (c.expectedCessationList === 'MUST_BE_POPULATED' && c.expectedCessationDriver === null) {
      d.push(`${c.caseId}: expects a populated cessation list and names no driver`);
    }
    if (c.expectedCessationList === 'MUST_BE_EMPTY' && c.expectedCessationDriver !== null) {
      d.push(`${c.caseId}: expects an empty cessation list and names a driver`);
    }
    return d;
  }));

  add('P9', 'each case refutes exactly the three postures it did not choose, in substantive terms',
    C.flatMap(c => {
      const d: string[] = [];
      const keys = Object.keys(c.whyEachOtherPostureIsWrong) as ImmediateSafetyPosture233[];
      if (keys.includes(c.expectedPosture)) d.push(`${c.caseId}: refutes its own expected posture`);
      for (const p of IMMEDIATE_SAFETY_POSTURES_233) {
        if (p === c.expectedPosture) continue;
        const why = c.whyEachOtherPostureIsWrong[p];
        if (why === undefined) { d.push(`${c.caseId}: does not say why ${p} is wrong`); continue; }
        if (why.trim().length < 60) d.push(`${c.caseId}/${p}: rationale too thin to adjudicate`);
      }
      return d;
    }));

  add('P10', 'no case reuses an excluded prior-cohort or prior-fixture subject term',
    C.flatMap(c => {
      const hay = norm236(`${c.setting} ${c.observation} ${c.suppliedContext.location} `
        + `${c.suppliedContext.task}`);
      return FRESHNESS_236.excludedSubjectTerms
        .filter(t => usesTerm236(hay, t))
        .map(t => `${c.caseId}: uses excluded subject term "${t}"`);
    }));

  add('P11', 'no §236 observation overlaps any §230/§231 observation above the threshold',
    C.flatMap(c => ACCEPTANCE_CASES_230.flatMap(p => {
      const o = containment236(c.observation, p.observation);
      return o >= OVERLAP_THRESHOLD_236
        ? [`${c.caseId} overlaps §230 ${p.caseId} at ${o.toFixed(3)}`] : [];
    })));

  add('P12', 'no §236 observation overlaps any §234 observation above the threshold. §234 is spent '
    + 'evidence and may not be replayed', C.flatMap(c => POSTURE_CASES_234.flatMap(p => {
    const o = Math.max(containment236(c.observation, p.observation),
      containment236(p.observation, c.observation));
    return o >= OVERLAP_THRESHOLD_236
      ? [`${c.caseId} overlaps §234 ${p.caseId} at ${o.toFixed(3)}`] : [];
  })));

  add('P13', 'no §236 case is a paraphrase of another §236 case', C.flatMap((a, i) =>
    C.slice(i + 1).flatMap(b => {
      const o = Math.max(containment236(a.observation, b.observation),
        containment236(b.observation, a.observation));
      return o >= OVERLAP_THRESHOLD_236
        ? [`${a.caseId} and ${b.caseId} overlap at ${o.toFixed(3)}`] : [];
    })));

  add('P14', 'the trap slot carries at least two STOP cases and at least one mandatory HOLD guard, '
    + 'and the degree slot spans three distinct neighbouring decisions', (() => {
    const d: string[] = [];
    const B = C.filter(c => c.category === 'ESTABLISHED_PROPERTY_TRAP');
    const stops = B.filter(c => c.expectedPosture === 'STOP').length;
    const holds = B.filter(c => c.expectedPosture === 'HOLD_PENDING_VERIFICATION').length;
    if (stops < 2) d.push(`the trap slot carries ${stops} STOP cases, fewer than two`);
    if (holds < 1) d.push('the trap slot carries no HOLD overcorrection guard');
    const Cc = C.filter(c => c.category === 'NEIGHBOURING_DEGREE');
    if (new Set(Cc.map(c => c.expectedPosture)).size < 3) {
      d.push('the degree slot does not span three distinct expected postures');
    }
    const withSeparate = C.filter(c => c.expectedPosture === 'STOP'
      && c.legitimateSeparateUnresolvedProperties.length > 0).length;
    if (withSeparate < 1) {
      d.push('no STOP case carries a genuinely separate unresolved property');
    }
    return d;
  })());

  add('P15', 'the wire-arrival slot is structurally demanding on every case', (() => {
    const d: string[] = [];
    for (const c of C.filter(x => x.category === 'WIRE_ARRIVAL_STRESS')) {
      if (c.expectedCandidateCountAtLeast < 3) {
        d.push(`${c.caseId}: expects fewer than three hazard candidates`);
      }
      if (c.expectedDeclarationCountAtLeast < 2) {
        d.push(`${c.caseId}: expects fewer than two declarations`);
      }
      if (c.observation.length < 700) d.push(`${c.caseId}: observation is too thin to stress`);
    }
    return d;
  })());

  add('P16', 'each case books one first-pass call and no verifier call, supplies no governed record '
    + 'and carries a complete transmitted context', (() => {
    const d: string[] = [];
    for (const c of C) {
      if (c.firstPassCalls !== 1) d.push(`${c.caseId}: books ${c.firstPassCalls} first-pass calls`);
      if (c.verifierCalls !== 0) d.push(`${c.caseId}: books a verifier call`);
      if (c.governedRecords.length !== 0) d.push(`${c.caseId}: supplies a governed record`);
      if (c.jurisdiction.trim().length === 0) d.push(`${c.caseId}: no jurisdiction`);
      if (c.hazardFamilies.length === 0) d.push(`${c.caseId}: no hazard family`);
      if (c.decisionUnderAnalysis.trim().length === 0) d.push(`${c.caseId}: no decision`);
      if (c.establishedFacts.length === 0) d.push(`${c.caseId}: no established facts`);
      if (c.controllingSafetyProperty.trim().length === 0) d.push(`${c.caseId}: no property`);
    }
    const total = C.reduce((n, c) => n + c.firstPassCalls + c.verifierCalls, 0);
    if (total !== AUTHORIZATION_236.primaryProviderCalls) {
      d.push(`total calls ${total}, authorized ${AUTHORIZATION_236.primaryProviderCalls}`);
    }
    return d;
  })());

  add('P17', 'the frozen §233 continuation table agrees with the frozen truth on every case',
    C.flatMap(c => {
      const permits = POSTURE_PERMITS_CONTINUED_WORK[c.expectedPosture];
      const truthPermits = c.expectedPosture === 'CONTINUE'
        || c.expectedPosture === 'CONTINUE_WITH_CONTROLS';
      return permits === truthPermits ? []
        : [`${c.caseId}: §233 permits=${String(permits)}, truth says ${String(truthPermits)}`];
    }));

  // The cohort must be able to FAIL BY OVER-ESCALATION, not only by under-escalation.
  add('P18', 'all four postures appear, and a clear majority of cases expect the cessation list to '
    + 'be EMPTY so over-escalation is detectable', (() => {
    const d: string[] = [];
    for (const p of IMMEDIATE_SAFETY_POSTURES_233) {
      if (!C.some(c => c.expectedPosture === p)) d.push(`no case expects ${p}`);
    }
    const empty = C.filter(c => c.expectedCessationList === 'MUST_BE_EMPTY').length;
    const populated = C.length - empty;
    if (empty < 5) d.push(`only ${empty} cases expect an empty cessation list`);
    if (populated < 2) d.push(`only ${populated} cases expect a populated cessation list`);
    return d;
  })());

  const passed = checks.filter(c => c.passed).length;
  return { checks, passed, total: checks.length, allPassed: passed === checks.length };
}

// ================================================================ call plan and configuration

export const COST_EVIDENCE_236 = {
  unitCostBasis: '§234 CALL-LEDGER-234 measured mean USD 0.099861 over 16 calls, maximum USD '
    + '0.121058, mean input 35,026 tokens, mean output 2,981 tokens. Nothing is carried over from '
    + '§231 or §221.',
  meanFirstPassUsd: 0.099861,
  maxObservedFirstPassUsd: 0.121058,
  section235PayloadUplift: 'the §235 system prompt is 76,817 bytes against the §233 73,499 and the '
    + 'posture schema gains one array property, so roughly a five per cent input uplift.',
  upliftFactorApplied: 1.05,
} as const;

export const FROZEN_EXECUTION_CONFIGURATION_236 = {
  arm: 'SINGLE',
  leg: 'FIRST_PASS_ONLY',
  verifierLeg: 'NOT_AUTHORIZED_AND_NOT_ASSEMBLED',
  pairedAttributionArm: 'NOT_AUTHORIZED_AND_NOT_ASSEMBLED',
  thinking: 'disabled',
  cachingEnabled: false,
  firstPassMaxTokens: 8000,
  maxTokensRationale:
    'carried forward from §234, where it was load-bearing: the longest output was 5,100 tokens and '
    + 'a second 4,306, so the older 4,000 ceiling would have truncated two of sixteen. The '
    + 'wire-arrival slot is designed to produce longer answers still and the §235 posture object is '
    + 'larger again.',
  semanticRetries: 0,
  transportRetriesAuthorized: 0,
  ifTransportFailureOccurs:
    'the authorization books exactly nine calls with no retry allowance. A transport or HTTP '
    + 'failure that yields no adjudicable response therefore terminates the run as EXECUTION '
    + 'INCOMPLETE and returns for authorization. It is not silently absorbed and coverage is not '
    + 'reduced to fit.',
  guardWorstCaseCallUsd: 0.147,
  guardBasis: '30,000 budgeted input tokens plus a full 8,000-token output at USD 2 and USD 10 per '
    + 'million, uplifted five per cent. Roughly 1.2x the §234 observed maximum.',
  ifGuardTrips: 'STOP and return EXECUTION_INCOMPLETE. Never reduce coverage to fit the ceiling.',
  databaseOperations: 0,
} as const;

export function callPlan236(): {
  primaryCalls: number; maximumTotalCalls: number; projectedSpendUsd: number;
  worstCaseSpendUsd: number; hardCeilingUsd: number;
  perCase: readonly { caseId: string; category: Category236; firstPass: number; verifier: number }[];
} {
  const perCase = CONFIRMATION_CASES_236.map(c => ({
    caseId: c.caseId, category: c.category,
    firstPass: c.firstPassCalls as number, verifier: c.verifierCalls as number,
  }));
  const primaryCalls = perCase.reduce((n, p) => n + p.firstPass + p.verifier, 0);
  const uplift = COST_EVIDENCE_236.upliftFactorApplied;
  return {
    primaryCalls,
    maximumTotalCalls: AUTHORIZATION_236.maximumProviderCalls,
    projectedSpendUsd: Number((primaryCalls * COST_EVIDENCE_236.meanFirstPassUsd * uplift).toFixed(4)),
    worstCaseSpendUsd:
      Number((primaryCalls * COST_EVIDENCE_236.maxObservedFirstPassUsd * uplift).toFixed(4)),
    hardCeilingUsd: AUTHORIZATION_236.hardSpendCeilingUsd,
    perCase,
  };
}

// ================================================================ identity and terminals

const sha236 = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

export function instrumentDigest236(): string {
  return sha236(JSON.stringify({
    version: INSTRUMENT_236_VERSION,
    implementationUnderTest: IMPLEMENTATION_UNDER_TEST_236,
    authorization: AUTHORIZATION_236,
    authoringIndependence: AUTHORING_INDEPENDENCE_236,
    freshness: FRESHNESS_236,
    scoring: SCORING_RULES_236,
    execution: FROZEN_EXECUTION_CONFIGURATION_236,
    postures: IMMEDIATE_SAFETY_POSTURES_233,
    postureDefinitions: POSTURE_DEFINITIONS_233,
    protectiveRank: POSTURE_PROTECTIVE_RANK,
    providerVisibleRules: PROVIDER_VISIBLE_RULES_235,
    cases: CONFIRMATION_CASES_236,
  }));
}

export const TERMINALS_236 = {
  pass: 'EXPERT_HAZLENZ_POSTURE_CONTRACT_AND_SEMANTIC_CONFIRMATION_PASSED — '
    + 'SUCCESSOR_CANDIDATE_FREEZE_AUTHORIZATION_REQUIRED',
  fail: 'EXPERT_HAZLENZ_POSTURE_CONTRACT_OR_SEMANTIC_CONFIRMATION_FAILED — '
    + 'PRODUCT_OWNER_REMEDIATION_DECISION_REQUIRED',
  incomplete: 'EXPERT_HAZLENZ_POSTURE_CONFIRMATION_EXECUTION_INCOMPLETE — '
    + 'PRODUCT_OWNER_REVIEW_REQUIRED',
} as const;

export const FAILURE_CLASSES_236 = [
  'WIRE_OR_PROVIDER_REPRESENTATION',
  'NORMALIZATION',
  'CONTRACT_ALIGNMENT',
  'MISSING_CESSATION_DRIVING_CANDIDATE',
  'MANUFACTURED_UNCERTAINTY',
  'FALSE_CESSATION_CANDIDATE_ESCALATION',
  'WRONG_POSTURE_DEGREE',
  'RECOMMENDATION_PROJECTION',
  'OTHER',
] as const;
export type FailureClass236 = (typeof FAILURE_CLASSES_236)[number];
