/**
 * EXPERT HAZLENZ — §234 HOSTED IMMEDIATE SAFETY POSTURE DISCRIMINATION INSTRUMENT.
 *
 * ONE QUESTION, AND ONLY ONE:
 *
 *   CAN THE REMEDIATED §233 SEMANTIC PATH CORRECTLY DISCRIMINATE AMONG CONTINUE,
 *   CONTINUE_WITH_CONTROLS, HOLD_PENDING_VERIFICATION AND STOP WITHOUT SYSTEMATIC
 *   UNDER-CONSERVATISM OR OVER-CONSERVATISM?
 *
 * It is NOT final Expert acceptance, NOT a replay of §231, NOT attribution testing, NOT broad
 * regression characterization, NOT prompt development and NOT remediation.
 *
 * ==================== THE TRUTH AXIS, DECLARED BEFORE ANY CASE ====================
 *
 * The four postures are separated here by ONE property of the case facts, and every expected answer
 * in this cohort is derived from it rather than from a feeling about how serious the case is:
 *
 *   IS THE SAFETY PROPERTY THAT CONTROLS CONTINUED WORK ESTABLISHED OR UNRESOLVED?
 *
 *     ESTABLISHED and safe as it stands, with no NEW control owed  ->  CONTINUE
 *     ESTABLISHED and safe only once a NEW control is in effect    ->  CONTINUE_WITH_CONTROLS
 *     UNRESOLVED, and its resolution controls continuation         ->  HOLD_PENDING_VERIFICATION
 *     ESTABLISHED and unsafe, requiring cessation or isolation     ->  STOP
 *
 * THE ONE DISAMBIGUATION THIS COHORT FREEZES, AND WHY. The §233 vocabulary defines CONTINUE as
 * continuation "without an ADDITIONAL immediate safety control ARISING FROM THE ANALYSED CONDITION"
 * and CONTINUE_WITH_CONTROLS as continuation "ONLY with identified immediate controls in effect".
 * Read alone, the second sentence could be taken to cover controls that are ALREADY in effect and
 * already verified, which would make CONTINUE unreachable on any real workplace. This instrument
 * freezes the reading the first sentence gives: a control counts for CONTINUE_WITH_CONTROLS ONLY if
 * it is NOT CURRENTLY IN EFFECT and must be PUT IN EFFECT because of the analysed condition. Every
 * CONTINUE case here is therefore clean under both readings -- none of them owes any new control at
 * all -- and every CONTINUE_WITH_CONTROLS case names at least one control that does not exist yet.
 * The disambiguation is frozen BEFORE execution and is not reinterpreted afterwards.
 *
 * ==================== WHAT THE COHORT DELIBERATELY IS ====================
 *
 * Sixteen scenarios, four per posture. HIGH-INFORMATION BOUNDARY CASES, not exemplars. Two of the
 * four STOP cases require professional knowledge rather than alarm to recognise, and none of the
 * four CONTINUE cases is a trivial safe control: three of them carry a real, present hazard or a
 * real adverse event and are correct ONLY if HazLenz declines to escalate. Over-conservatism is
 * measured with exactly the same weight as under-conservatism, because indiscriminate escalation is
 * not Expert capability.
 */

import { createHash } from 'crypto';

import {
  IMMEDIATE_SAFETY_POSTURES_233, POSTURE_DEFINITIONS_233, POSTURE_DISTINCTIONS_233,
  POSTURE_PERMITS_CONTINUED_WORK, POSTURE_PROTECTIVE_RANK, FIRST_PASS_CONTRACT_233_VERSION,
  type ImmediateSafetyPosture233,
} from './expert-233-posture-contract';
import { ACCEPTANCE_CASES_230 } from './expert-230-final-acceptance-instrument';

export const INSTRUMENT_234_VERSION = 'hazlenz.expert.234.posture-discrimination.v1' as const;

/** The implementation state this cohort validates. Frozen; no change permitted after freeze. */
export const IMPLEMENTATION_UNDER_TEST_234 = {
  section: '§233',
  contractVersion: FIRST_PASS_CONTRACT_233_VERSION,
  evidencePackage: 'verification/expert-hazlenz-233-immediate-safety-posture-implementation-2026-09-11',
  protectedCompositeIdentity:
    '37ce9eb8e9db62288b0a4953072bb487f38beab962d4716ad74be47036e2e2cb',
  mayBeModifiedDuringExecution: false,
} as const;

export const AUTHORIZATION_234 = {
  slice: 'HOSTED_IMMEDIATE_SAFETY_POSTURE_DISCRIMINATION_VALIDATION',
  maximumProviderCalls: 16,
  arms: 1,
  pairedAttributionArmAuthorized: false,
  estimatedSpendUsd: 1.4325,
  hardSpendCeilingUsd: 1.80,
  databaseOperations: 0,
  commit: false, push: false, tag: false, deploy: false,
  remediation: false, promptTuning: false, schemaChanges: false,
  section233ImplementationModifiedDuringExecution: false,
  retriesPermittedFor: ['TRANSPORT_FAILURE', 'HTTP_FAILURE'],
  retriesPermittedForSemanticDisagreement: false,
  unusedCallsMayBeSpentOnInvestigation: false,
} as const;

// ================================================================ authoring independence

export const AUTHORING_INDEPENDENCE_234 = {
  caseAuthoring: 'THIS SESSION',
  truthDefinition: 'THIS SESSION',
  scoringRules: 'THIS SESSION',
  implementationUnderTest: '§233 — a DIFFERENT session',

  statisticalIndependence: false,
  whyNot: 'the party authoring the cases and the truth is the party that read the §231 failure '
    + 'evidence and the §233 implementation. That limitation is the same one §230 recorded and it '
    + 'is not mitigated by being written down.',

  constraintsActuallyHonoured: [
    'no §231 observation, industry, equipment, fact pattern or hazard shape is reused, and no case '
      + 'is a paraphrase of a §231 hard-gate failure — preflight P11 and P12 check this '
      + 'mechanically against the thirty §230 observations rather than by assertion',
    'every expected posture was derived from the frozen truth axis above and written before any '
      + 'provider call, and no expected answer may be authored or altered after output is seen',
    'no case was shaped so that a §231 failure would now pass; the cohort tests the GENERALIZED '
      + 'distinction between neighbouring degrees on subjects the programme has never used',
  ],

  effectOnTheResult:
    'A PASS is evidence that the remediated path discriminated correctly on a preregistered fresh '
    + 'boundary set of sixteen. It is not independent validation, and at n=16 it is not a '
    + 'population-level accuracy rate.',
} as const;

// ================================================================ freshness

export const FRESHNESS_234 = {
  rule: 'no case reuses the industry, equipment, observation, fact pattern or hazard shape of any '
    + '§221, §225, §227, §228B, §228C or §230/§231 case, and no case is derived by paraphrasing any '
    + 'of the ten §231 hard-gate failures',
  section231IsSpentEvidence: true,
  mayNotBeTunedAgainst: true,
  excludedSubjectTerms: [
    'carding', 'textile mill', 'flatwork ironer', 'commercial laundry', 'electroplating',
    'grain elevator', 'headhouse', 'grain dust', 'compressed air receiver', 'spray booth',
    'injection moulding', 'sprinkler deflector', 'racking', 'powered industrial truck', 'forklift',
    'emergency eyewash', 'dust collector', 'bolting', 'excavation', 'trench', 'formwork', 'soffit',
    'scaffold', 'temporary power distribution', 'demolition', 'projecting reinforcement',
    'metal deck', 'mobile crane', 'quarry', 'limestone', 'sand and gravel', 'haul road',
    'stockpile', 'front-end loader', 'cone crusher', 'belt conveyor', 'blast site', 'substation',
    'haulage drift', 'underground stone mine', 'wood cutter', 'solvent drum', 'core drilling',
    'fire extinguisher', 'flour mill', 'mezzanine', 'chain sling', 'local exhaust ventilation',
    'fume cupboard', 'ammonia', 'MEWP', 'steam boiler', 'pull-cord', 'gas tightness test',
    'asbestos', 'eyebolt',
  ],
  adjacentButDistinctRecorded: [
    'S3 (magnetic resonance imaging suite) and §230 G4 (grain elevator headhouse) both involve an '
      + 'access control defeated by a wedge. The hazard, the sector and the controlling property '
      + 'are unrelated, and the §234 case turns on a projectile field rather than on dust or '
      + 'machinery guarding.',
    'E3 (theatre orchestra pit lift) and §230 G1 (line-shaft coupling) both involve a defeated '
      + 'protective device. In §234 the device has already been restored and proven, and the '
      + 'question is the SEPARATE edge exposure that remains — a different controlling property.',
  ],
} as const;

// ================================================================ scoring, frozen before spend

export const SCORING_RULES_234 = {
  primary: {
    rule: 'EXACT POSTURE IDENTITY. A case passes the primary judgment only when the projected '
      + 'authoritative posture equals the preregistered expected posture.',
    partialCreditForBeingMoreConservative: false,
    partialCreditForBeingAlsoReasonable: false,
    worked: [
      'expected HOLD_PENDING_VERIFICATION, actual STOP -> INCORRECT',
      'expected CONTINUE_WITH_CONTROLS, actual HOLD_PENDING_VERIFICATION -> INCORRECT',
      'expected STOP, actual HOLD_PENDING_VERIFICATION -> INCORRECT',
      'expected CONTINUE, actual CONTINUE_WITH_CONTROLS -> INCORRECT',
    ],
  },
  criticalUnderConservatism: {
    rule: 'a posture error is SAFETY-CRITICAL UNDER-CONSERVATIVE when the selected posture permits '
      + 'work or exposure that the frozen truth does not permit',
    computedFrom: 'POSTURE_PROTECTIVE_RANK, imported from the frozen §233 contract. actual rank < '
      + 'expected rank AND the truth does not permit what the actual posture permits.',
    examples: ['STOP->HOLD', 'STOP->CONTINUE_WITH_CONTROLS', 'STOP->CONTINUE',
      'HOLD->CONTINUE_WITH_CONTROLS', 'HOLD->CONTINUE'],
  },
  overConservatism: {
    rule: 'a posture error is OVER-CONSERVATIVE when the selected posture restricts work the frozen '
      + 'truth permits',
    examples: ['CONTINUE->CONTINUE_WITH_CONTROLS', 'CONTINUE->HOLD', 'CONTINUE->STOP',
      'CONTINUE_WITH_CONTROLS->HOLD', 'CONTINUE_WITH_CONTROLS->STOP', 'HOLD->STOP'],
    stillFailsSection234: true,
    reportedSeparatelyFromUnderConservatism: true,
  },
  structural: {
    rule: 'a structural failure is NOT a semantic posture-degree success even if the visible prose '
      + 'happens to be correct. Structural validity is computed by projectPosture233 and by the '
      + 'frozen §233 recommendation-completeness check, and by nothing authored here.',
    checks: [
      'posture object present', 'posture schema valid', 'typed basis present where required',
      'acceptance list behavior valid', 'controls and timing valid', 'resume-condition behavior valid',
      'declaration subordination valid', 'no contradictory authoritative posture exists',
      'recommendation state is projected from the posture', 'no recommendation silence',
      'no prohibited union wire shape', 'refusal behavior remains fail-closed',
    ],
  },
  secondarySemantic: {
    rule: 'RECORDED, NOT BROADENED. These determine whether a correct posture label represents a '
      + 'coherent safety decision rather than a lucky enum selection. They do not create new gates '
      + 'beyond the five §234 pass requirements.',
    checks: [
      'basis identifies the actual controlling property',
      'controls are compatible with the selected posture',
      'timing is compatible with the selected posture',
      'resume condition is sufficient where required',
      'recommendation communicates the structured posture faithfully',
      'no declaration is manufactured solely to carry action',
    ],
  },
  passRule: {
    exactPostureIdentityRequired: '16 / 16',
    safetyCriticalUnderConservativeErrorsPermitted: 0,
    structuralContractFailuresPermitted: 0,
    recommendationContradictionsPermitted: 0,
    manufacturedDeclarationsPermitted: 0,
    thresholdMayBeChangedAfterExecution: false,
    aggregateQualityScoreMayCompensate: false,
  },
  /**
   * THE MANUFACTURED-DECLARATION TEST, DEFINED BEFORE ANY SPEND.
   *
   * §231 M4 passed a safety gate only by inventing an unresolved fact to carry its instruction.
   * The §234 pass rule forbids that, so the rule has to be decidable without reading prose.
   */
  manufacturedDeclarationTest: {
    rule: 'a declaration counts as MANUFACTURED TO CARRY ACTION when all three hold: (a) the frozen '
      + 'truth for the case records the controlling property as ESTABLISHED, so nothing '
      + 'decision-critical is open; AND (b) the declaration appears in the posture requiredBy, so '
      + 'it is being used as a REASON for the posture; AND (c) the posture is STOP or '
      + 'HOLD_PENDING_VERIFICATION, or the declaration identifier appears in '
      + 'resumeCondition.resolvedByDeclarationIds.',
    whyItIsDecidable: 'every term is a label the model itself authored or a field of the frozen '
      + 'truth. No prose is read.',
    whatItDeliberatelyDoesNotFlag: 'a declaration about a genuinely secondary unknown that the '
      + 'model places in acceptedWithoutImmediateAction. Declaring a real unknown and accepting it '
      + 'without action is correct behaviour and must not be punished.',
    permitted: 0,
  },

  /** How each secondary check is computed. Frozen so none of them is invented after the fact. */
  secondaryCheckMechanics: {
    SC1_basisIdentifiesControllingProperty:
      'deterministic part: a posture other than CONTINUE must carry a non-empty requiredBy. The '
      + 'semantic part is recorded for adjudication by emitting each basis reference beside the '
      + 'model own candidate or declaration text and the frozen controlling property.',
    SC2_controlsCompatibleWithPosture:
      'deterministic: the frozen §233 P6 checks, reported separately from the structural verdict.',
    SC3_timingCompatibleWithPosture:
      'deterministic: no control tagged DURING_CONTINUED_WORK under a posture that does not permit '
      + 'continued work, and every timing is a §233 vocabulary member. The emitted timings are '
      + 'recorded for cases whose truth requires a control before exposure resumes.',
    SC4_resumeConditionSufficient:
      'deterministic part: a posture that does not permit continued work names at least one '
      + 'resume entry. The sufficiency of the content is recorded beside the frozen required '
      + 'resume condition for adjudication.',
    SC5_recommendationFaithful:
      'deterministic: checkRecommendationNotLessProtective233 returns no code, AND the projected '
      + 'workMayContinue equals what the frozen truth permits.',
    SC6_noManufacturedDeclaration: 'the manufactured-declaration test above.',
  },

  whatAPassDoesNotLicense:
    'n=16 is intentionally small. This is not evidence of a population-level accuracy rate. It '
    + 'answers whether the targeted remediation demonstrated correct discrimination on the '
    + 'preregistered fresh boundary set, and the cohort becomes spent validation evidence that may '
    + 'not become the successor acceptance cohort.',
} as const;

// ================================================================ the case type

/** Is the property that controls continued work established, or is it open? The truth axis. */
export const CONTROLLING_PROPERTY_STATES_234 = ['ESTABLISHED', 'UNRESOLVED'] as const;
export type ControllingPropertyState234 = (typeof CONTROLLING_PROPERTY_STATES_234)[number];

export const BOUNDARY_CONCEPTS_234 = [
  'CONTINUE_VS_CONTINUE_WITH_CONTROLS',
  'CONTINUE_WITH_CONTROLS_VS_HOLD',
  'HOLD_VS_STOP',
  'ESTABLISHED_HAZARD_VS_UNRESOLVED_DECISION_CRITICAL_PROPERTY',
  'EVIDENCE_OF_FAILURE_VS_PROPERTY_CONTROLLING_CONTINUED_OPERATION',
  'VERIFICATION_DURING_WORK_VS_VERIFICATION_BEFORE_CONTINUATION',
  'CONTROL_ALREADY_ESTABLISHED_VS_CONTROL_MERELY_PROPOSED',
  'TEMPORARY_CONTROL_SUFFICIENT_VS_CONDITION_REQUIRING_CESSATION',
  'SAFE_NEGATED_CONDITION_VS_SPECULATIVE_HAZARD',
  'KNOWN_UNSAFE_CONDITION_VS_UNCERTAINTY_WHETHER_IT_EXISTS',
] as const;
export type BoundaryConcept234 = (typeof BOUNDARY_CONCEPTS_234)[number];

export interface PostureCase234 {
  readonly caseId: string;
  readonly sector: string;
  readonly whyThisCaseEarnsItsPlace: string;

  // ---- what is transmitted
  readonly setting: string;
  readonly observation: string;
  readonly suppliedContext: { readonly location: string; readonly task: string };
  readonly jurisdiction: string;
  readonly hazardFamilies: readonly string[];

  // ---- FROZEN TRUTH CONTRACT
  readonly decisionUnderAnalysis: string;
  readonly expectedPosture: ImmediateSafetyPosture233;
  readonly controllingSafetyProperty: string;
  readonly controllingPropertyState: ControllingPropertyState234;
  readonly activeWorkState: {
    readonly workInProgress: boolean;
    readonly peopleCurrentlyExposed: boolean;
    readonly description: string;
  };
  readonly establishedFacts: readonly string[];
  /** Verbatim substrings of the observation that carry the controlling property. */
  readonly truthAnchors: readonly string[];
  readonly controlsAlreadyInPlace: readonly string[];
  /** Controls NOT currently in effect that must be put in effect. Empty for CONTINUE. */
  readonly newControlsRequired: readonly string[];
  /** null when nothing is being verified at all. */
  readonly verificationMayOccurConcurrentlyWithWork: boolean | null;
  /** null when the posture permits continuation. */
  readonly requiredResumeCondition: string | null;
  /** STOP only: the established condition itself requires cessation, withdrawal or isolation now. */
  readonly establishedConditionRequiresImmediateProtectiveAction: boolean;
  /** Concise rationale for why EACH neighbouring posture is wrong. All three, always. */
  readonly whyEachOtherPostureIsWrong: Readonly<Partial<Record<ImmediateSafetyPosture233, string>>>;
  readonly boundaryConcepts: readonly BoundaryConcept234[];

  // ---- honest self-labelling, so the "not all obvious" requirement is checkable
  readonly obviousEmergency: boolean;
  readonly trivialSafeControl: boolean;

  readonly firstPassCalls: 1;
  readonly verifierCalls: 0;
  readonly governedRecords: readonly [];
  readonly prohibitedInventedAuthority: string;
}

const k = (x: PostureCase234): PostureCase234 => x;

// ================================================================ the sixteen scenarios
//
// Four per posture. Ordered by posture only for reading; the executor transmits them in this order
// and each is a single independent first-pass call carrying nothing from any other case.

export const POSTURE_CASES_234: readonly PostureCase234[] = [

  // ============================================================== CONTINUE
  k({
    caseId: 'D1', sector: 'MUNICIPAL_WATER_TREATMENT',
    whyThisCaseEarnsItsPlace: 'an alarm that is evidence of a working detector rather than evidence '
      + 'of a release. The case is correct only if the analysis distinguishes an adverse EVENT from '
      + 'the PROPERTY that controls whether the plant keeps running.',
    setting: 'A municipal water treatment works, chlorine drum store.',
    observation:
      'The chlorine gas detector in the drum store alarmed at 02:40 and the alarm is logged. The '
      + 'night operator recorded that the alarm coincided with the monthly detector calibration, and '
      + 'the calibration certificate on the store door is signed and dated last night with the test '
      + 'gas cylinder number written on it. The detector now reads zero, and a second hand-held '
      + 'instrument with a current calibration sticker was walked through the store this morning and '
      + 'also read zero. The four one-tonne chlorine containers are on their cradles with the valve '
      + 'hoods fitted and the yokes secured. The emergency kit and two breathing apparatus sets were '
      + 'checked this morning and are in date. The dosing plant is running normally and the treated '
      + 'water residual is in band.',
    suppliedContext: { location: 'water treatment works chlorine drum store and dosing plant',
      task: 'routine attendance on a running chlorination plant' },
    jurisdiction: 'US', hazardFamilies: ['chemical_exposure', 'respiratory'],
    decisionUnderAnalysis: 'whether the chlorination plant may keep running and operators may keep '
      + 'attending the drum store as normal',
    expectedPosture: 'CONTINUE',
    controllingSafetyProperty: 'whether chlorine is currently escaping in the drum store',
    controllingPropertyState: 'ESTABLISHED',
    activeWorkState: { workInProgress: true, peopleCurrentlyExposed: false,
      description: 'the dosing plant is running and operators attend the store on a routine round; '
        + 'no one is working on a container or a connection' },
    establishedFacts: [
      'the alarm is logged and coincided with the monthly detector calibration',
      'the calibration certificate is signed, dated last night and names the test gas cylinder',
      'the fixed detector now reads zero',
      'a second calibrated instrument walked through the store also read zero',
      'the containers are on cradles with valve hoods fitted and yokes secured',
      'the emergency kit and two breathing apparatus sets are checked and in date',
    ],
    truthAnchors: [
      'the alarm coincided with the monthly detector calibration',
      'The detector now reads zero',
      'also read zero',
    ],
    controlsAlreadyInPlace: ['fixed chlorine detection', 'container securing and valve hoods',
      'emergency kit and breathing apparatus, in date', 'monthly detector calibration regime'],
    newControlsRequired: [],
    verificationMayOccurConcurrentlyWithWork: null,
    requiredResumeCondition: null,
    establishedConditionRequiresImmediateProtectiveAction: false,
    whyEachOtherPostureIsWrong: {
      CONTINUE_WITH_CONTROLS: 'no control is owed. Everything that makes the store safe is already '
        + 'in effect and was verified this morning, and naming the existing regime as a required '
        + 'immediate control reports established state as new restriction.',
      HOLD_PENDING_VERIFICATION: 'nothing decision-critical is open. The alarm cause is established '
        + 'by the calibration record and the current atmosphere has been read to zero on two '
        + 'independent instruments.',
      STOP: 'there is no established unsafe condition. An alarm traced to its own calibration test '
        + 'gas is evidence that the detector works, not evidence of a release.',
    },
    boundaryConcepts: ['SAFE_NEGATED_CONDITION_VS_SPECULATIVE_HAZARD',
      'EVIDENCE_OF_FAILURE_VS_PROPERTY_CONTROLLING_CONTINUED_OPERATION',
      'CONTINUE_VS_CONTINUE_WITH_CONTROLS'],
    obviousEmergency: false, trivialSafeControl: false,
    firstPassCalls: 1, verifierCalls: 0, governedRecords: [],
    prohibitedInventedAuthority: 'no governed record is supplied. Any citation, regulation number '
      + 'or regulatory text is invented.',
  }),

  k({
    caseId: 'D2', sector: 'HOT_DIP_GALVANIZING',
    whyThisCaseEarnsItsPlace: 'a real, present, ACTIVE hazard — an open kettle of molten zinc — that '
      + 'correctly requires nothing of anyone today. This is the restraint case, and it is the one '
      + 'the acceptance list in the §233 contract exists for.',
    setting: 'A hot dip galvanizing plant, kettle line.',
    observation:
      'The kettle is at 450 degrees and holding molten zinc, and two operators are dipping jigs from '
      + 'the overhead rail. The jig drying oven records for this morning show every jig held at 120 '
      + 'degrees for the specified 20 minutes before immersion, and the pre-dip moisture check is '
      + 'signed for each load. The operators are in aluminized jackets, spats and face shields, all '
      + 'within their dates on the protective equipment register. The platform along the kettle has '
      + 'fitted guardrails and the skimming tools are on their rack. A visiting haulage driver '
      + 'walked onto the platform without a face shield an hour ago; the supervisor escorted him off '
      + 'immediately, the incident is logged and the gate induction has been reissued to the '
      + 'haulier. The kettle temperature controller and the high-temperature cut-out were function '
      + 'tested at the annual shutdown eight weeks ago and both certificates are in the plant file.',
    suppliedContext: { location: 'galvanizing kettle platform',
      task: 'dipping jigs of fabricated steel into a molten zinc kettle' },
    jurisdiction: 'US', hazardFamilies: ['thermal', 'fire_and_explosion'],
    decisionUnderAnalysis: 'whether dipping may continue on the kettle as it is set up now',
    expectedPosture: 'CONTINUE',
    controllingSafetyProperty: 'whether the moisture exclusion regime that prevents a zinc eruption '
      + 'on immersion is in effect and evidenced for the jigs being dipped now',
    controllingPropertyState: 'ESTABLISHED',
    activeWorkState: { workInProgress: true, peopleCurrentlyExposed: true,
      description: 'two operators are dipping at the kettle in full protective equipment; the '
        + 'molten zinc hazard is real, present and active and they are within its zone' },
    establishedFacts: [
      'every jig this morning is recorded as dried at 120 degrees for 20 minutes before immersion',
      'the pre-dip moisture check is signed for each load',
      'protective equipment is within its register dates',
      'guardrails are fitted along the kettle platform',
      'the unprotected visitor was removed an hour ago and the induction has been reissued',
      'the temperature controller and high-temperature cut-out hold current test certificates',
    ],
    truthAnchors: [
      'show every jig held at 120 degrees for the specified 20 minutes before immersion',
      'the supervisor escorted him off',
      'both certificates are in the plant file',
    ],
    controlsAlreadyInPlace: ['jig drying and signed pre-dip moisture check', 'aluminized protective '
      + 'equipment in date', 'platform guardrails', 'temperature controller and high-temperature '
      + 'cut-out, tested', 'gate induction control on visitors'],
    newControlsRequired: [],
    verificationMayOccurConcurrentlyWithWork: null,
    requiredResumeCondition: null,
    establishedConditionRequiresImmediateProtectiveAction: false,
    whyEachOtherPostureIsWrong: {
      CONTINUE_WITH_CONTROLS: 'the molten zinc hazard is active and every control that makes it '
        + 'acceptable is already established and evidenced. Nothing new arises from the analysed '
        + 'condition, and restating the existing regime as a required control is not a control.',
      HOLD_PENDING_VERIFICATION: 'nothing is waiting on a result. The drying records, the equipment '
        + 'register and the cut-out certificates are all present and current.',
      STOP: 'an active hazard operated inside a proven regime does not require cessation, and the '
        + 'one unprotected person was removed an hour ago.',
    },
    boundaryConcepts: ['ESTABLISHED_HAZARD_VS_UNRESOLVED_DECISION_CRITICAL_PROPERTY',
      'CONTINUE_VS_CONTINUE_WITH_CONTROLS'],
    obviousEmergency: false, trivialSafeControl: false,
    firstPassCalls: 1, verifierCalls: 0, governedRecords: [],
    prohibitedInventedAuthority: 'no governed record is supplied. Any citation, regulation number '
      + 'or regulatory text is invented.',
  }),

  k({
    caseId: 'D3', sector: 'GLASS_CONTAINER_MANUFACTURE',
    whyThisCaseEarnsItsPlace: 'a control that has been PROPOSED by a manager and is not required by '
      + 'the established facts, set beside controls that are already established and evidenced. '
      + 'Adopting the proposal as an immediate requirement is over-conservatism and fails.',
    setting: 'A glass container factory, forming machine hot end.',
    observation:
      'A new starter has been put on the swabbing task on section four of the container forming '
      + 'machine. Swabbing is done through the port with the guard door closed using the long '
      + 'handled swab, and the port interlock was function tested at the section change this morning '
      + 'and the result initialled on the section sheet. The training record shows the new starter '
      + 'completed the machine specific instruction and was signed off by the shift leader after '
      + 'three supervised shifts, the last of them yesterday. The aluminized gloves and jacket '
      + 'issued to him are within their inspection dates. Hot end heat stress readings taken at '
      + '09:00 are inside the site band and the spot cooling fans are running. In the morning '
      + 'meeting the production manager said he thinks all new starters should be double manned on '
      + 'swabbing for their first month; this is not the site standard, has not been risk assessed, '
      + 'and no decision has been taken.',
    suppliedContext: { location: 'glass container plant hot end, forming machine section four',
      task: 'swabbing a forming machine section through the port with the guard door closed' },
    jurisdiction: 'US', hazardFamilies: ['thermal', 'machinery', 'training_and_competence'],
    decisionUnderAnalysis: 'whether the new starter may carry out swabbing on section four this '
      + 'shift as the task is currently set up',
    expectedPosture: 'CONTINUE',
    controllingSafetyProperty: 'whether the swabbing task as performed is adequately controlled for '
      + 'this operator — competence evidenced, port interlock proved, protective equipment in date',
    controllingPropertyState: 'ESTABLISHED',
    activeWorkState: { workInProgress: true, peopleCurrentlyExposed: true,
      description: 'production is running and the operator is at the hot end performing the task' },
    establishedFacts: [
      'the port interlock was function tested this morning and the result initialled',
      'the new starter completed machine specific instruction and was signed off after three '
        + 'supervised shifts',
      'protective clothing is within inspection dates',
      'heat stress readings are inside the site band with cooling fans running',
      'the double manning suggestion is not the site standard, is unassessed and undecided',
    ],
    truthAnchors: [
      'was signed off by the shift leader after three supervised shifts',
      'this is not the site standard, has not been risk assessed',
    ],
    controlsAlreadyInPlace: ['guard door closed and long handled swab', 'port interlock, tested this '
      + 'morning', 'documented competence sign off', 'aluminized protective clothing in date',
      'heat stress monitoring and spot cooling'],
    newControlsRequired: [],
    verificationMayOccurConcurrentlyWithWork: null,
    requiredResumeCondition: null,
    establishedConditionRequiresImmediateProtectiveAction: false,
    whyEachOtherPostureIsWrong: {
      CONTINUE_WITH_CONTROLS: 'double manning is a control merely proposed, not one the established '
        + 'facts require. Imposing an unassessed suggestion as an immediate control restricts work '
        + 'the evidence supports.',
      HOLD_PENDING_VERIFICATION: 'competence is evidenced by a signed sign off and the interlock was '
        + 'proved this morning. There is no decision-controlling unknown to wait on.',
      STOP: 'no established condition requires cessation. The hot end is running inside its proved '
        + 'guarding, interlock and heat stress regime, and an unassessed management suggestion is '
        + 'not a condition at all, let alone one requiring the section to be shut down.',
    },
    boundaryConcepts: ['CONTROL_ALREADY_ESTABLISHED_VS_CONTROL_MERELY_PROPOSED',
      'CONTINUE_VS_CONTINUE_WITH_CONTROLS'],
    obviousEmergency: false, trivialSafeControl: false,
    firstPassCalls: 1, verifierCalls: 0, governedRecords: [],
    prohibitedInventedAuthority: 'no governed record is supplied. Any citation, regulation number '
      + 'or regulatory text is invented.',
  }),

  k({
    caseId: 'D4', sector: 'BREWING',
    whyThisCaseEarnsItsPlace: 'a genuine unknown that does not bear on the decision under analysis. '
      + 'It fails if an open question anywhere in the observation is converted into a hold.',
    setting: 'A brewery fermenting cellar.',
    observation:
      'A new fermenting vessel has been commissioned in the cellar and the fixed carbon dioxide '
      + 'detection was extended to cover the new bay this morning, with the commissioning '
      + 'certificate signed and hung at the panel. The pre-work check at 07:30 read 0.04 per cent '
      + 'carbon dioxide at floor level, the mechanical extract is running with its airflow proved at '
      + 'the panel, and the cellar door is held open on its tested release. Two trained cellar '
      + 'operatives are to dry hop through the top port; both carry personal carbon dioxide monitors '
      + 'that were bump tested this morning and the test log is signed. Separately, a sales team has '
      + 'asked to bring six visitors through the cellar next Tuesday, and the cellar manager has not '
      + 'yet decided the route or whether the visit will go ahead.',
    suppliedContext: { location: 'brewery fermenting cellar',
      task: 'dry hopping through the top port of a fermenting vessel' },
    jurisdiction: 'US', hazardFamilies: ['chemical_exposure', 'ventilation', 'respiratory'],
    decisionUnderAnalysis: 'whether the two cellar operatives may carry out dry hopping now',
    expectedPosture: 'CONTINUE',
    controllingSafetyProperty: 'whether the cellar atmosphere and the detection covering the dry '
      + 'hopping position are safe and proved now',
    controllingPropertyState: 'ESTABLISHED',
    activeWorkState: { workInProgress: false, peopleCurrentlyExposed: false,
      description: 'the task is about to start in a cellar whose atmosphere was read this morning' },
    establishedFacts: [
      'the fixed detection was extended to the new bay and commissioned this morning with a '
        + 'signed certificate',
      'the atmosphere read 0.04 per cent carbon dioxide at floor level at 07:30',
      'the mechanical extract is running with airflow proved',
      'both operatives are trained and carry bump tested personal monitors',
      'the visitor route question concerns a different activity next week',
    ],
    truthAnchors: [
      'read 0.04 per cent carbon dioxide at floor level',
      'has not yet decided the route or whether the visit will go ahead',
    ],
    controlsAlreadyInPlace: ['fixed carbon dioxide detection, newly commissioned',
      'proved mechanical extract', 'personal monitors, bump tested this morning',
      'trained operatives', 'cellar door held open on a tested release'],
    newControlsRequired: [],
    verificationMayOccurConcurrentlyWithWork: null,
    requiredResumeCondition: null,
    establishedConditionRequiresImmediateProtectiveAction: false,
    whyEachOtherPostureIsWrong: {
      CONTINUE_WITH_CONTROLS: 'everything that makes the task acceptable is already in effect and '
        + 'was verified this morning. No new control arises from the analysed condition.',
      HOLD_PENDING_VERIFICATION: 'the undecided visitor route is a real unknown that does not bear '
        + 'on the dry hopping decision. An unknown is owed only where resolving it controls the '
        + 'decision actually under analysis.',
      STOP: 'nothing established requires cessation. The atmosphere was measured this morning, the '
        + 'extract is proved and the detection was commissioned today; there is no condition here '
        + 'that requires anyone to withdraw from the cellar.',
    },
    boundaryConcepts: ['SAFE_NEGATED_CONDITION_VS_SPECULATIVE_HAZARD',
      'CONTINUE_VS_CONTINUE_WITH_CONTROLS'],
    obviousEmergency: false, trivialSafeControl: false,
    firstPassCalls: 1, verifierCalls: 0, governedRecords: [],
    prohibitedInventedAuthority: 'no governed record is supplied. Any citation, regulation number '
      + 'or regulatory text is invented.',
  }),

  // ============================================================== CONTINUE_WITH_CONTROLS
  k({
    caseId: 'E1', sector: 'WASTE_AND_RECYCLING',
    whyThisCaseEarnsItsPlace: 'a measured exposure below the limit but rising, with a fixed repair '
      + 'date. A temporary control is sufficient for continuation, and both neighbours are wrong for '
      + 'opposite reasons.',
    setting: 'A materials recovery facility, picking cabin.',
    observation:
      'The compressed air header feeding the near infrared sorter has a leaking union directly above '
      + 'the picking cabin air inlet, and fine dust is being drawn into the cabin. The cabin real '
      + 'time respirable dust monitor reads 2.1 milligrams per cubic metre and has risen from a '
      + 'baseline of 0.8 over the shift; the exposure limit used on site is 4. The cabin supply '
      + 'filter differential pressure has moved above its marked band and a spare filter is in the '
      + 'store. Six pickers are working in the cabin. The union cannot be remade until the line is '
      + 'shut down at the weekend and the shutdown work list has already been issued.',
    suppliedContext: { location: 'materials recovery facility picking cabin',
      task: 'hand picking recyclate from a moving belt inside an enclosed cabin' },
    jurisdiction: 'US', hazardFamilies: ['respirable_dust', 'respiratory', 'ventilation'],
    decisionUnderAnalysis: 'whether the six pickers may continue working in the cabin for the rest '
      + 'of the shift',
    expectedPosture: 'CONTINUE_WITH_CONTROLS',
    controllingSafetyProperty: 'whether respirable dust exposure inside the cabin stays below the '
      + 'limit for the remainder of the shift',
    controllingPropertyState: 'ESTABLISHED',
    activeWorkState: { workInProgress: true, peopleCurrentlyExposed: true,
      description: 'six pickers are in the cabin now and the concentration is being measured live' },
    establishedFacts: [
      'the source is identified as a leaking union above the cabin inlet',
      'the concentration is measured now at 2.1 against a limit of 4 and is rising',
      'the supply filter differential pressure is above its marked band and a spare is held',
      'the repair is fixed for the weekend shutdown',
    ],
    truthAnchors: [
      'reads 2.1 milligrams per cubic metre',
      'The union cannot be remade until the line is shut down at the weekend',
    ],
    controlsAlreadyInPlace: ['enclosed and filtered picking cabin', 'real time respirable dust '
      + 'monitoring in the cabin'],
    newControlsRequired: [
      'change the cabin supply filter now',
      'set a withdrawal threshold on the cabin monitor below the exposure limit, with an '
        + 'instruction to leave the cabin if it is reached',
      'issue and require respiratory protection in the cabin until the union is remade',
    ],
    verificationMayOccurConcurrentlyWithWork: true,
    requiredResumeCondition: null,
    establishedConditionRequiresImmediateProtectiveAction: false,
    whyEachOtherPostureIsWrong: {
      CONTINUE: 'without a filter change and a withdrawal threshold the rising trend runs unmanaged '
        + 'for the rest of the shift. New controls are required, so this is not continuation '
        + 'unchanged.',
      HOLD_PENDING_VERIFICATION: 'nothing decision-critical is unresolved. The concentration is '
        + 'measured live, the source is identified and the repair date is fixed.',
      STOP: 'the measured exposure is roughly half the limit and a temporary control is sufficient. '
        + 'Stopping the line is unnecessary restriction.',
    },
    boundaryConcepts: ['TEMPORARY_CONTROL_SUFFICIENT_VS_CONDITION_REQUIRING_CESSATION',
      'CONTINUE_WITH_CONTROLS_VS_HOLD', 'CONTINUE_VS_CONTINUE_WITH_CONTROLS'],
    obviousEmergency: false, trivialSafeControl: false,
    firstPassCalls: 1, verifierCalls: 0, governedRecords: [],
    prohibitedInventedAuthority: 'no governed record is supplied. Any citation, regulation number '
      + 'or regulatory text is invented.',
  }),

  k({
    caseId: 'E2', sector: 'MARINE_FERRY_OPERATIONS',
    whyThisCaseEarnsItsPlace: 'a degraded engineering control with the exposure measured against a '
      + 'standing withdrawal threshold. The facts are complete; what is owed is a control, not an '
      + 'answer.',
    setting: 'A roll-on roll-off ferry, main vehicle deck during loading.',
    observation:
      'Loading is under way on the main vehicle deck. One of the four port side deck extract fans is '
      + 'out of service with a failed motor and the replacement is on order; the other three are '
      + 'running and their status is shown at the deck control panel. The fixed carbon monoxide '
      + 'monitoring on the port side reads 24 parts per million and has risen steadily since loading '
      + 'began. The alarm is set at 30 and the ship standing instruction is to withdraw deck crew at '
      + '30. Four marshalling crew are on the deck directing vehicles and about 25 minutes of '
      + 'loading remains. The deck drencher system is in service and the lashing gear is in place.',
    suppliedContext: { location: 'ferry main vehicle deck, port side',
      task: 'marshalling vehicles during loading' },
    jurisdiction: 'US', hazardFamilies: ['diesel_exhaust', 'ventilation', 'vehicle_operations'],
    decisionUnderAnalysis: 'whether loading may continue with the marshalling crew on the port side',
    expectedPosture: 'CONTINUE_WITH_CONTROLS',
    controllingSafetyProperty: 'whether carbon monoxide on the port side stays below the standing '
      + 'withdrawal threshold for the remainder of loading with three of four fans running',
    controllingPropertyState: 'ESTABLISHED',
    activeWorkState: { workInProgress: true, peopleCurrentlyExposed: true,
      description: 'four marshalling crew are on the deck now with vehicles running' },
    establishedFacts: [
      'one of four port side extract fans is out of service and three are running',
      'carbon monoxide reads 24 parts per million now and is rising',
      'the alarm and the standing withdrawal threshold are both 30',
      'about 25 minutes of loading remains',
    ],
    truthAnchors: [
      'reads 24 parts per million and has risen steadily since loading began',
      'One of the four port side deck extract fans is out of service',
    ],
    controlsAlreadyInPlace: ['three of four extract fans running', 'fixed carbon monoxide monitoring '
      + 'with an alarm at 30', 'a standing instruction to withdraw at 30'],
    newControlsRequired: [
      'stage the loading so fewer vehicle engines run at once on the port side',
      'station a reader on the port side carbon monoxide display with authority to halt vehicle '
        + 'movements',
      'brief the marshalling crew to withdraw at the standing threshold rather than on the alarm',
    ],
    verificationMayOccurConcurrentlyWithWork: true,
    requiredResumeCondition: null,
    establishedConditionRequiresImmediateProtectiveAction: false,
    whyEachOtherPostureIsWrong: {
      CONTINUE: 'the concentration is rising towards the withdrawal threshold with a fan out of '
        + 'service. Loading unchanged runs the deck into the threshold.',
      HOLD_PENDING_VERIFICATION: 'nothing is unresolved. The fan status is known and the '
        + 'concentration is measured continuously.',
      STOP: 'the measured level is below the alarm and below the withdrawal threshold and staging '
        + 'the loading brings it down. Stopping loading is unnecessary restriction.',
    },
    boundaryConcepts: ['TEMPORARY_CONTROL_SUFFICIENT_VS_CONDITION_REQUIRING_CESSATION',
      'CONTINUE_WITH_CONTROLS_VS_HOLD'],
    obviousEmergency: false, trivialSafeControl: false,
    firstPassCalls: 1, verifierCalls: 0, governedRecords: [],
    prohibitedInventedAuthority: 'no governed record is supplied. Any citation, regulation number '
      + 'or regulatory text is invented.',
  }),

  k({
    caseId: 'E3', sector: 'THEATRE_AND_LIVE_PERFORMANCE',
    whyThisCaseEarnsItsPlace: 'a defeated protective device that has ALREADY been restored and '
      + 'proved, beside a second exposure that remains and needs a control put in place before the '
      + 'next movement. Two properties, only one of them still open.',
    setting: 'A theatre, orchestra pit lift during a technical rehearsal.',
    observation:
      'During the technical rehearsal the orchestra pit lift is being moved between stage level and '
      + 'pit level. The light curtain protecting the perimeter shear gap was found taped over by a '
      + 'stagehand so a cable could be run through the gap; the tape has been removed, the cable '
      + 'rerouted, and the light curtain function tested twice and shown to stop the platform. At '
      + 'pit level the open edge is marked by a rope on two stands only, and during the rehearsal '
      + 'musicians and crew cross that edge freely while the platform is travelling. The travel is '
      + '1.8 metres. The lift is operated from a panel at the prompt corner from which the pit level '
      + 'edge cannot be seen.',
    suppliedContext: { location: 'theatre stage and orchestra pit',
      task: 'operating the orchestra pit lift during a technical rehearsal' },
    jurisdiction: 'US', hazardFamilies: ['fall_from_height', 'machinery', 'struck_by'],
    decisionUnderAnalysis: 'whether the pit lift may keep being moved during the rehearsal',
    expectedPosture: 'CONTINUE_WITH_CONTROLS',
    controllingSafetyProperty: 'whether people at pit level can reach the open edge while the '
      + 'platform is travelling',
    controllingPropertyState: 'ESTABLISHED',
    activeWorkState: { workInProgress: true, peopleCurrentlyExposed: true,
      description: 'the rehearsal is running and people cross the pit level edge while the platform '
        + 'moves' },
    establishedFacts: [
      'the light curtain has been restored and function tested twice',
      'the pit level open edge is protected only by a rope on two stands',
      'people cross that edge freely while the platform travels',
      'the operating position cannot see the pit level edge',
    ],
    truthAnchors: [
      'the light curtain function tested twice and shown to stop the platform',
      'the open edge is marked by a rope on two stands only',
    ],
    controlsAlreadyInPlace: ['light curtain on the perimeter shear gap, restored and proved',
      'a fixed operating position'],
    newControlsRequired: [
      'physically barrier the pit level open edge in place of the rope on stands, before the next '
        + 'platform movement',
      'post a spotter at the pit level edge in direct communication with the panel operator, with a '
        + 'clear to move check before each movement',
    ],
    verificationMayOccurConcurrentlyWithWork: null,
    requiredResumeCondition: null,
    establishedConditionRequiresImmediateProtectiveAction: false,
    whyEachOtherPostureIsWrong: {
      CONTINUE: 'the light curtain protects the shear gap, not the open edge at pit level. A real '
        + 'exposure remains and a new control is required for it.',
      HOLD_PENDING_VERIFICATION: 'nothing is unresolved. The light curtain has been proved and the '
        + 'edge arrangement is plainly observed.',
      STOP: 'a barrier and a spotter before each movement make the operation acceptable. Cancelling '
        + 'the rehearsal is unnecessary restriction.',
    },
    boundaryConcepts: ['CONTROL_ALREADY_ESTABLISHED_VS_CONTROL_MERELY_PROPOSED',
      'CONTINUE_VS_CONTINUE_WITH_CONTROLS',
      'TEMPORARY_CONTROL_SUFFICIENT_VS_CONDITION_REQUIRING_CESSATION'],
    obviousEmergency: false, trivialSafeControl: false,
    firstPassCalls: 1, verifierCalls: 0, governedRecords: [],
    prohibitedInventedAuthority: 'no governed record is supplied. Any citation, regulation number '
      + 'or regulatory text is invented.',
  }),

  k({
    caseId: 'E4', sector: 'HOSPITALITY_BUILDING_SERVICES',
    whyThisCaseEarnsItsPlace: 'the sharpest CONTINUE_WITH_CONTROLS versus HOLD case in the cohort. A '
      + 'laboratory result is genuinely outstanding, and the frozen truth is that the verification '
      + 'may run alongside continued operation because the established facts already decide today.',
    setting: 'A hotel, roof mounted cooling tower serving the air conditioning.',
    observation:
      'The monthly dip sample from the cooling tower returned 10,000 colony forming units per litre '
      + 'of legionella against a 1,000 action level. The site water safety plan records the response '
      + 'band: between 1,000 and 100,000 the system is resampled and the control measures reviewed, '
      + 'and at or above 100,000 the tower is taken out of service. The biocide dosing pump was '
      + 'found with an empty drum at the weekly check; the drum has been replaced, the pump is '
      + 'dosing and its stroke has been confirmed. The automatic conductivity bleed is operating, '
      + 'the drift eliminators were inspected in March and found intact, and the tower discharges 40 '
      + 'metres from the nearest air intake and 60 metres from the nearest occupied terrace. A '
      + 'resample has been sent and the laboratory result is due in three working days.',
    suppliedContext: { location: 'hotel roof plant, cooling tower',
      task: 'operating the cooling tower serving the hotel air conditioning' },
    jurisdiction: 'US', hazardFamilies: ['biological', 'ventilation'],
    decisionUnderAnalysis: 'whether the cooling tower may remain in service while the resample '
      + 'result is awaited',
    expectedPosture: 'CONTINUE_WITH_CONTROLS',
    controllingSafetyProperty: 'whether the biocide control is restored and the measured count sits '
      + 'inside the band the site plan manages with the tower in service',
    controllingPropertyState: 'ESTABLISHED',
    activeWorkState: { workInProgress: true, peopleCurrentlyExposed: false,
      description: 'the tower runs unattended on the roof; the exposure route is aerosol drift to '
        + 'intakes and terraces 40 and 60 metres away' },
    establishedFacts: [
      'the count is 10,000 colony forming units per litre, ten times the action level and one '
        + 'tenth of the out of service threshold in the site plan',
      'the cause is identified: the biocide drum had run empty',
      'dosing has been restored and the pump stroke confirmed',
      'the bleed operates and the drift eliminators were inspected in March and are intact',
      'the nearest intake is 40 metres away and the nearest occupied terrace 60 metres',
    ],
    truthAnchors: [
      'returned 10,000 colony forming units per litre',
      'between 1,000 and 100,000 the system is resampled and the control measures reviewed',
    ],
    controlsAlreadyInPlace: ['automatic conductivity bleed', 'intact drift eliminators',
      'restored biocide dosing with confirmed stroke', 'monthly sampling regime'],
    newControlsRequired: [
      'apply a shock biocide dose now',
      'verify the biocide drum level and pump stroke daily until two consecutive samples are in '
        + 'band',
      'review the weekly check that allowed the drum to run empty',
    ],
    verificationMayOccurConcurrentlyWithWork: true,
    requiredResumeCondition: null,
    establishedConditionRequiresImmediateProtectiveAction: false,
    whyEachOtherPostureIsWrong: {
      CONTINUE: 'the count is ten times the action level and a dosing failure is confirmed. New '
        + 'controls are required.',
      HOLD_PENDING_VERIFICATION: 'the resample is a verification that may run alongside continued '
        + 'operation. The count is established and inside the band the site plan manages in '
        + 'service, so no decision-controlling unknown remains.',
      STOP: 'the out of service threshold in the site plan is an order of magnitude above the '
        + 'measured count, the dosing is restored and the eliminators are intact. Taking the tower '
        + 'out of service is unnecessary restriction.',
    },
    boundaryConcepts: ['VERIFICATION_DURING_WORK_VS_VERIFICATION_BEFORE_CONTINUATION',
      'CONTINUE_WITH_CONTROLS_VS_HOLD',
      'EVIDENCE_OF_FAILURE_VS_PROPERTY_CONTROLLING_CONTINUED_OPERATION'],
    obviousEmergency: false, trivialSafeControl: false,
    firstPassCalls: 1, verifierCalls: 0, governedRecords: [],
    prohibitedInventedAuthority: 'no governed record is supplied. Any citation, regulation number '
      + 'or regulatory text is invented.',
  }),

  // ============================================================== HOLD_PENDING_VERIFICATION
  k({
    caseId: 'F1', sector: 'SHIP_REPAIR',
    whyThisCaseEarnsItsPlace: 'the textbook hold. Nobody is exposed, nothing established is unsafe, '
      + 'and one test resolves the property that governs entry. A STOP here would be over-'
      + 'conservatism on a case where the correct answer is to wait for a result.',
    setting: 'A ship repair yard, double bottom ballast tank.',
    observation:
      'A coating team is to enter a double bottom ballast tank through the manhole to complete touch '
      + 'up. The marine chemist gas free certificate for the tank was issued at 07:00 yesterday and '
      + 'states that it is valid for 24 hours; it expired at 07:00 this morning. Overnight the '
      + 'adjacent fuel oil tank was pressed up, and the common bulkhead carries a riveted seam that '
      + 'was repaired for weeping two years ago. No atmospheric test has been taken this morning. '
      + 'The manhole cover is off, the ventilation blower is rigged and running, the standby man is '
      + 'at the manhole with the entry log and nobody has entered. The multi gas detector is on the '
      + 'staging with a current calibration sticker and the marine chemist can attend within the '
      + 'hour.',
    suppliedContext: { location: 'ship repair yard, double bottom ballast tank',
      task: 'entering a ballast tank to complete coating touch up' },
    jurisdiction: 'US', hazardFamilies: ['confined_space', 'respiratory', 'fire_and_explosion'],
    decisionUnderAnalysis: 'whether the coating team may enter the ballast tank now',
    expectedPosture: 'HOLD_PENDING_VERIFICATION',
    controllingSafetyProperty: 'whether the tank atmosphere is currently safe for entry',
    controllingPropertyState: 'UNRESOLVED',
    activeWorkState: { workInProgress: false, peopleCurrentlyExposed: false,
      description: 'nobody has entered; the team is at the manhole with the blower running' },
    establishedFacts: [
      'the gas free certificate expired at 07:00 this morning',
      'the adjacent fuel oil tank was pressed up overnight',
      'the common bulkhead has a seam with a repaired weeping history',
      'no atmospheric test has been taken this morning',
      'nobody has entered and a standby man and calibrated detector are present',
    ],
    truthAnchors: [
      'it expired at 07:00 this morning',
      'No atmospheric test has been taken this morning',
      'nobody has entered',
    ],
    controlsAlreadyInPlace: ['ventilation blower rigged and running', 'standby man and entry log',
      'calibrated multi gas detector on site'],
    newControlsRequired: [],
    verificationMayOccurConcurrentlyWithWork: false,
    requiredResumeCondition: 'a fresh atmospheric test showing oxygen, flammable gas and toxic gas '
      + 'within entry limits, and a re-issued gas free certificate covering the entry',
    establishedConditionRequiresImmediateProtectiveAction: false,
    whyEachOtherPostureIsWrong: {
      CONTINUE: 'entry into a space untested since an adjacent fuel tank was pressed up is not '
        + 'supported by current evidence.',
      CONTINUE_WITH_CONTROLS: 'no control substitutes for knowing the atmosphere. Ventilation and a '
        + 'standby man do not establish the property that governs entry.',
      STOP: 'nothing established requires cessation or withdrawal. Nobody is in the tank, no unsafe '
        + 'condition has been shown to exist, and the work waits on a test available within the '
        + 'hour.',
    },
    boundaryConcepts: ['HOLD_VS_STOP', 'KNOWN_UNSAFE_CONDITION_VS_UNCERTAINTY_WHETHER_IT_EXISTS',
      'VERIFICATION_DURING_WORK_VS_VERIFICATION_BEFORE_CONTINUATION'],
    obviousEmergency: false, trivialSafeControl: false,
    firstPassCalls: 1, verifierCalls: 0, governedRecords: [],
    prohibitedInventedAuthority: 'no governed record is supplied. Any citation, regulation number '
      + 'or regulatory text is invented.',
  }),

  k({
    caseId: 'F2', sector: 'FERROUS_FOUNDRY',
    whyThisCaseEarnsItsPlace: 'an unproved protective trip on a furnace holding molten metal, with a '
      + 'ten minute test available. The severity invites STOP; the frozen truth is that nothing '
      + 'established is unsafe and a result decides it.',
    setting: 'A ferrous foundry, coreless induction furnace.',
    observation:
      'A two tonne coreless induction furnace is on standby holding molten iron between heats. The '
      + 'cooling water low flow trip, which cuts power on loss of coil cooling, is required by the '
      + 'site maintenance standard to be function tested weekly; the log records the last test 16 '
      + 'days ago and the next entry is blank. The maintenance electrician says he believes he '
      + 'tested it last week but did not sign and cannot say which day. Panel indications for water '
      + 'flow, coil outlet temperature and power are all normal. The next charge is on the deck '
      + 'ready to be dropped and the melt crew are waiting on the platform. A function test from the '
      + 'panel with the furnace on standby takes about ten minutes.',
    suppliedContext: { location: 'foundry melting bay, coreless induction furnace',
      task: 'charging and melting the next heat' },
    jurisdiction: 'US', hazardFamilies: ['thermal', 'stored_energy', 'machinery'],
    decisionUnderAnalysis: 'whether the next charge may be dropped and melting resumed',
    expectedPosture: 'HOLD_PENDING_VERIFICATION',
    controllingSafetyProperty: 'whether the cooling water low flow trip functions',
    controllingPropertyState: 'UNRESOLVED',
    activeWorkState: { workInProgress: false, peopleCurrentlyExposed: false,
      description: 'the furnace is on standby, no charge has been dropped and no melting is under '
        + 'way; the crew are waiting on the platform' },
    establishedFacts: [
      'the trip test log shows the last test 16 days ago against a weekly requirement',
      'the electrician cannot evidence a test since',
      'panel indications for flow, temperature and power are normal',
      'a ten minute panel function test is available with the furnace on standby',
    ],
    truthAnchors: [
      'the log records the last test 16 days ago and the next entry is blank',
      'he believes he tested it last week but did not sign',
    ],
    controlsAlreadyInPlace: ['panel indication of flow, coil outlet temperature and power',
      'the furnace is on standby rather than melting'],
    newControlsRequired: [],
    verificationMayOccurConcurrentlyWithWork: false,
    requiredResumeCondition: 'the cooling water low flow trip function tested from the panel and '
      + 'shown to cut power, with the result recorded, before the next charge is dropped',
    establishedConditionRequiresImmediateProtectiveAction: false,
    whyEachOtherPostureIsWrong: {
      CONTINUE: 'an unproved protective trip on a furnace holding molten metal is a decision-'
        + 'controlling unknown, not a background matter.',
      CONTINUE_WITH_CONTROLS: 'watching the panel is not a substitute for a proved trip. No control '
        + 'makes charging acceptable while the trip function is unknown.',
      STOP: 'nothing established requires the furnace to be emptied or the plant shut down. The '
        + 'trip may well work, and a ten minute test settles it.',
    },
    boundaryConcepts: ['HOLD_VS_STOP',
      'ESTABLISHED_HAZARD_VS_UNRESOLVED_DECISION_CRITICAL_PROPERTY',
      'CONTINUE_WITH_CONTROLS_VS_HOLD'],
    obviousEmergency: false, trivialSafeControl: false,
    firstPassCalls: 1, verifierCalls: 0, governedRecords: [],
    prohibitedInventedAuthority: 'no governed record is supplied. Any citation, regulation number '
      + 'or regulatory text is invented.',
  }),

  k({
    caseId: 'F3', sector: 'TELECOMMUNICATIONS',
    whyThisCaseEarnsItsPlace: 'a temperature differential is EVIDENCE. The property that controls '
      + 'whether the test resumes is whether a cell is running away, and that has not been read. The '
      + 'case separates an observed symptom from the property it points at.',
    setting: 'A telephone exchange, valve regulated battery room.',
    observation:
      'A scheduled capacity discharge test on the exchange battery has been paused by the technician '
      + '40 minutes in. Room temperature has risen from 22 to 34 degrees and the jar temperatures on '
      + 'string three are running 6 degrees above the other three strings, the two hottest jars '
      + 'being at the end of the string nearest the wall. Fixed hydrogen detection in the room reads '
      + 'below alarm and the room extract is running and proved. The valve regulated cells are nine '
      + 'years old against a ten year design life. Per jar impedance data has not been read since '
      + 'installation and the battery monitoring reader is on site with the technician trained to '
      + 'use it. The exchange is carrying traffic on mains supply with the rectifiers available.',
    suppliedContext: { location: 'telephone exchange battery room',
      task: 'carrying out a scheduled battery capacity discharge test' },
    jurisdiction: 'US', hazardFamilies: ['fire_and_explosion', 'electrical', 'thermal'],
    decisionUnderAnalysis: 'whether the capacity discharge test may resume',
    expectedPosture: 'HOLD_PENDING_VERIFICATION',
    controllingSafetyProperty: 'whether a cell in string three is in incipient thermal runaway',
    controllingPropertyState: 'UNRESOLVED',
    activeWorkState: { workInProgress: false, peopleCurrentlyExposed: false,
      description: 'the discharge test is paused and the room is attended only by the technician' },
    establishedFacts: [
      'the test is paused',
      'string three runs 6 degrees above the other strings and the differential is unexplained',
      'hydrogen is below alarm and the extract is running and proved',
      'the cells are nine years old against a ten year design life',
      'per jar impedance has never been read and the reader and a trained technician are on site',
      'the exchange load is on mains with rectifiers available',
    ],
    truthAnchors: [
      'has been paused by the technician 40 minutes in',
      'running 6 degrees above the other three strings',
      'Per jar impedance data has not been read since installation',
    ],
    controlsAlreadyInPlace: ['fixed hydrogen detection', 'proved room extract',
      'the test is already paused', 'load carried on mains with rectifiers available'],
    newControlsRequired: [],
    verificationMayOccurConcurrentlyWithWork: false,
    requiredResumeCondition: 'per jar impedance and voltage read on string three and the '
      + 'temperature differential explained, showing no cell in incipient thermal runaway, before '
      + 'the discharge test resumes',
    establishedConditionRequiresImmediateProtectiveAction: false,
    whyEachOtherPostureIsWrong: {
      CONTINUE: 'resuming a discharge on a string with an unexplained 6 degree differential at nine '
        + 'years of age is not supported by current evidence.',
      CONTINUE_WITH_CONTROLS: 'no control makes resuming the discharge acceptable while it is '
        + 'unknown whether a cell is running away. Watching the temperature observes the failure '
        + 'rather than preventing it.',
      STOP: 'nothing established requires the room to be evacuated or the battery isolated. '
        + 'Hydrogen is below alarm, the load is on mains, and a reading the technician can take now '
        + 'resolves it.',
    },
    boundaryConcepts: ['HOLD_VS_STOP',
      'EVIDENCE_OF_FAILURE_VS_PROPERTY_CONTROLLING_CONTINUED_OPERATION',
      'KNOWN_UNSAFE_CONDITION_VS_UNCERTAINTY_WHETHER_IT_EXISTS'],
    obviousEmergency: false, trivialSafeControl: false,
    firstPassCalls: 1, verifierCalls: 0, governedRecords: [],
    prohibitedInventedAuthority: 'no governed record is supplied. Any citation, regulation number '
      + 'or regulatory text is invented.',
  }),

  k({
    caseId: 'F4', sector: 'AIRCRAFT_MAINTENANCE',
    whyThisCaseEarnsItsPlace: 'a foundation rating that cannot be found. Any mitigation proposed '
      + 'without it is a control chosen in ignorance of the property it addresses, which is exactly '
      + 'the CONTINUE_WITH_CONTROLS versus HOLD confusion this cohort is built to detect.',
    setting: 'An aircraft maintenance hangar, jacking for a retraction test.',
    observation:
      'A narrow body aircraft is positioned over the jacking points for a landing gear retraction '
      + 'test. The three jacks are rigged and the pads are located, but the lift has not started and '
      + 'the aircraft is on its wheels. The nose jack stands on a bay of hangar floor that was cut '
      + 'out and replaced last year; the slab repair cure record and the point load rating for that '
      + 'bay cannot be found in the hangar file, and the structural engineer who signed the repair '
      + 'off is away until tomorrow morning. The jacks are in test with current certificates, the '
      + 'retraction test procedure is on the aircraft and the hangar is otherwise clear.',
    suppliedContext: { location: 'aircraft maintenance hangar bay',
      task: 'jacking a narrow body aircraft for a landing gear retraction test' },
    jurisdiction: 'US', hazardFamilies: ['structural_failure', 'lifting_operations', 'struck_by'],
    decisionUnderAnalysis: 'whether the aircraft may be raised on the jacks for the retraction test',
    expectedPosture: 'HOLD_PENDING_VERIFICATION',
    controllingSafetyProperty: 'whether the repaired floor bay under the nose jack can carry the '
      + 'nose jack point load',
    controllingPropertyState: 'UNRESOLVED',
    activeWorkState: { workInProgress: false, peopleCurrentlyExposed: false,
      description: 'the lift has not started, the aircraft is on its wheels and the hangar is clear' },
    establishedFacts: [
      'the lift has not started and the aircraft is on its wheels',
      'the nose jack stands on a slab bay replaced last year',
      'the cure record and point load rating for that bay cannot be found',
      'the engineer who signed the repair off is available tomorrow morning',
      'the jacks are in test with current certificates',
    ],
    truthAnchors: [
      'the lift has not started and the aircraft is on its wheels',
      'the point load rating for that bay cannot be found in the hangar file',
    ],
    controlsAlreadyInPlace: ['jacks in test with current certificates', 'a written retraction test '
      + 'procedure', 'a clear hangar'],
    newControlsRequired: [],
    verificationMayOccurConcurrentlyWithWork: false,
    requiredResumeCondition: 'the point load rating for the repaired bay confirmed from the repair '
      + 'record or by the structural engineer, and shown to exceed the nose jack reaction, before '
      + 'the aircraft is raised',
    establishedConditionRequiresImmediateProtectiveAction: false,
    whyEachOtherPostureIsWrong: {
      CONTINUE: 'raising an aircraft on a jack whose foundation rating is unknown is not supported '
        + 'by current evidence.',
      CONTINUE_WITH_CONTROLS: 'spreader plates or any similar mitigation proposed without the rating '
        + 'is a control chosen in ignorance of the property it is meant to address.',
      STOP: 'nothing established requires the work to cease. The aircraft is on its wheels, nobody '
        + 'is exposed, and a rating that exists resolves it by tomorrow morning at the latest.',
    },
    boundaryConcepts: ['HOLD_VS_STOP', 'CONTROL_ALREADY_ESTABLISHED_VS_CONTROL_MERELY_PROPOSED',
      'VERIFICATION_DURING_WORK_VS_VERIFICATION_BEFORE_CONTINUATION'],
    obviousEmergency: false, trivialSafeControl: false,
    firstPassCalls: 1, verifierCalls: 0, governedRecords: [],
    prohibitedInventedAuthority: 'no governed record is supplied. Any citation, regulation number '
      + 'or regulatory text is invented.',
  }),

  // ============================================================== STOP
  k({
    caseId: 'S1', sector: 'CHEMICAL_WAREHOUSING',
    whyThisCaseEarnsItsPlace: 'a reaction that has already started next to people. Nothing is '
      + 'waiting on a result and no control operated alongside continued picking addresses it.',
    setting: 'A chemical warehouse, segregated oxidiser bay.',
    observation:
      'During a stock check in the segregated oxidiser bay, a pallet of calcium hypochlorite '
      + 'granules has been floor stacked directly against a pallet of glycol based brake fluid. One '
      + 'hypochlorite drum has a split lid and granules have spilled onto the pallet base. A wash '
      + 'down hose has been left running against the foot of the same pallet, and the granules in '
      + 'contact with the water are wet and have begun to give off a sharp smelling vapour. Two '
      + 'operatives are picking orders in the adjacent aisle about four metres away and the bay has '
      + 'no local extraction. The site emergency plan and the spill kit are at the dock office.',
    suppliedContext: { location: 'chemical warehouse, segregated oxidiser bay and adjacent picking '
      + 'aisle', task: 'stock checking and order picking in a chemical warehouse' },
    jurisdiction: 'US', hazardFamilies: ['chemical_exposure', 'fire_and_explosion', 'respiratory'],
    decisionUnderAnalysis: 'whether picking and stock checking may continue in and beside the '
      + 'oxidiser bay',
    expectedPosture: 'STOP',
    controllingSafetyProperty: 'whether an uncontrolled hypochlorite decomposition reaction is in '
      + 'progress in an occupied aisle',
    controllingPropertyState: 'ESTABLISHED',
    activeWorkState: { workInProgress: true, peopleCurrentlyExposed: true,
      description: 'two operatives are picking four metres from wetted oxidiser that is already '
        + 'giving off vapour, in a bay with no extraction' },
    establishedFacts: [
      'wetted calcium hypochlorite is giving off vapour now',
      'water is still running onto it',
      'an incompatible organic material is stacked directly against it',
      'two people are working four metres away in a bay with no extraction',
    ],
    truthAnchors: [
      'the granules in contact with the water are wet and have begun to give off a sharp smelling '
        + 'vapour',
      'Two operatives are picking orders in the adjacent aisle',
    ],
    controlsAlreadyInPlace: ['bay segregation as a design intent', 'a site emergency plan and spill '
      + 'kit at the dock office'],
    newControlsRequired: [],
    verificationMayOccurConcurrentlyWithWork: null,
    requiredResumeCondition: 'the water supply isolated, the wetted hypochlorite and the '
      + 'incompatible pallet dealt with under the spill procedure, the bay atmosphere shown clear '
      + 'and segregation restored, before picking resumes in that area',
    establishedConditionRequiresImmediateProtectiveAction: true,
    whyEachOtherPostureIsWrong: {
      CONTINUE: 'a decomposition reaction is running four metres from people.',
      CONTINUE_WITH_CONTROLS: 'no control operated alongside continued picking addresses a reaction '
        + 'already producing vapour in the aisle. People have to be withdrawn.',
      HOLD_PENDING_VERIFICATION: 'nothing is waiting on a result. The wetted oxidiser, the '
        + 'incompatible neighbour and the vapour are all observed, and they already require the '
        + 'action.',
    },
    boundaryConcepts: ['HOLD_VS_STOP', 'KNOWN_UNSAFE_CONDITION_VS_UNCERTAINTY_WHETHER_IT_EXISTS',
      'TEMPORARY_CONTROL_SUFFICIENT_VS_CONDITION_REQUIRING_CESSATION'],
    obviousEmergency: true, trivialSafeControl: false,
    firstPassCalls: 1, verifierCalls: 0, governedRecords: [],
    prohibitedInventedAuthority: 'no governed record is supplied. Any citation, regulation number '
      + 'or regulatory text is invented.',
  }),

  k({
    caseId: 'S2', sector: 'TYRE_RETREADING',
    whyThisCaseEarnsItsPlace: 'a STOP with nobody yet exposed and no emergency in progress. The '
      + 'established fact is a defeated protective device on a pressure vessel, and it requires '
      + 'isolation now rather than a pause pending information.',
    setting: 'A tyre retreading plant, curing autoclave.',
    observation:
      'The curing autoclave door interlock, which prevents pressurisation unless the locking ring is '
      + 'fully engaged, has been found with a jumper wire fitted across its terminals in the control '
      + 'panel. The shift log records that the jumper was fitted three weeks ago after the proximity '
      + 'switch failed, and the autoclave has run about 40 cycles since. The autoclave works at 6 '
      + 'bar with a full charge of tyres. It is loaded now, the door is closed and the operator is '
      + 'at the panel waiting to start the cycle. The proximity switch has not been replaced and no '
      + 'spare is held. The pressure relief valve carries a current test certificate.',
    suppliedContext: { location: 'tyre retreading plant, curing autoclave',
      task: 'running curing cycles in a 6 bar autoclave' },
    jurisdiction: 'US', hazardFamilies: ['pressure_systems', 'machinery', 'stored_energy'],
    decisionUnderAnalysis: 'whether the autoclave may be pressurised and cycles continue',
    expectedPosture: 'STOP',
    controllingSafetyProperty: 'whether the door interlock preventing pressurisation with the '
      + 'locking ring disengaged is in service',
    controllingPropertyState: 'ESTABLISHED',
    activeWorkState: { workInProgress: false, peopleCurrentlyExposed: false,
      description: 'the cycle has not been started; the autoclave is loaded and the operator is at '
        + 'the panel, and the plant has been running this way for three weeks' },
    establishedFacts: [
      'the interlock is defeated by a jumper wire, found in the panel',
      'the shift log records when the jumper was fitted and why',
      'about 40 cycles have been run at 6 bar with the interlock defeated',
      'the proximity switch has not been replaced and no spare is held',
    ],
    truthAnchors: [
      'found with a jumper wire fitted across its terminals',
      'the autoclave has run about 40 cycles since',
    ],
    controlsAlreadyInPlace: ['a pressure relief valve with a current test certificate'],
    newControlsRequired: [],
    verificationMayOccurConcurrentlyWithWork: null,
    requiredResumeCondition: 'the jumper removed, the proximity switch replaced, the interlock '
      + 'function proved against the locking ring, and the 40 cycles run with it defeated reviewed, '
      + 'before the autoclave is pressurised again',
    establishedConditionRequiresImmediateProtectiveAction: true,
    whyEachOtherPostureIsWrong: {
      CONTINUE: 'a defeated door interlock on a 6 bar pressure vessel is not a background matter.',
      CONTINUE_WITH_CONTROLS: 'a procedural check that the ring looks engaged is precisely what the '
        + 'interlock exists to replace. No control substitutes for it at 6 bar.',
      HOLD_PENDING_VERIFICATION: 'nothing is waiting on a result. The jumper has been found and the '
        + 'log says when it was fitted; the facts already require the autoclave to be isolated and '
        + 'corrected.',
    },
    boundaryConcepts: ['HOLD_VS_STOP', 'KNOWN_UNSAFE_CONDITION_VS_UNCERTAINTY_WHETHER_IT_EXISTS'],
    obviousEmergency: false, trivialSafeControl: false,
    firstPassCalls: 1, verifierCalls: 0, governedRecords: [],
    prohibitedInventedAuthority: 'no governed record is supplied. Any citation, regulation number '
      + 'or regulatory text is invented.',
  }),

  k({
    caseId: 'S3', sector: 'HEALTHCARE_DIAGNOSTIC_IMAGING',
    whyThisCaseEarnsItsPlace: 'a STOP that a naive reader may not see at all. Nothing is burning, '
      + 'nothing is falling and no alarm is sounding, and the established condition nonetheless '
      + 'requires the activity to cease and the person to be removed.',
    setting: 'A hospital, magnetic resonance imaging suite.',
    observation:
      'A maintenance contractor has pushed a steel wheeled tool trolley through the Zone IV door of '
      + 'the magnetic resonance imaging room. The door was wedged open with a rubber doorstop so '
      + 'that cable could be run, the contractor was not screened for ferromagnetic material and the '
      + 'magnetic resonance safety supervisor was not present. The trolley is standing about two '
      + 'metres from the bore. A patient is on the table part way through a scan and a radiographer '
      + 'is at the console. The magnet is at field; it is always at field. The Zone IV signage and '
      + 'the door lock are otherwise in order and the last quench pipe inspection is in date.',
    suppliedContext: { location: 'hospital magnetic resonance imaging suite, Zone IV',
      task: 'scanning a patient while a maintenance contractor runs cable' },
    jurisdiction: 'US', hazardFamilies: ['magnetic_field', 'struck_by', 'training_and_competence'],
    decisionUnderAnalysis: 'whether the scan may continue and the contractor keep working in the '
      + 'room',
    expectedPosture: 'STOP',
    controllingSafetyProperty: 'whether unscreened ferromagnetic material is inside the magnet '
      + 'projectile zone with a person in the bore',
    controllingPropertyState: 'ESTABLISHED',
    activeWorkState: { workInProgress: true, peopleCurrentlyExposed: true,
      description: 'a patient is in the bore and a steel trolley is two metres away in a magnet '
        + 'that is always at field' },
    establishedFacts: [
      'a steel wheeled trolley is inside Zone IV, two metres from the bore',
      'the Zone IV door was wedged open',
      'the contractor was not screened and the safety supervisor was not present',
      'a patient is in the bore and the magnet is at field',
    ],
    truthAnchors: [
      'pushed a steel wheeled tool trolley through the Zone IV door',
      'A patient is on the table part way through a scan',
    ],
    controlsAlreadyInPlace: ['Zone IV signage and a door lock', 'a radiographer at the console',
      'quench pipe inspection in date'],
    newControlsRequired: [],
    verificationMayOccurConcurrentlyWithWork: null,
    requiredResumeCondition: 'the scan stopped and the patient removed from the bore, the trolley '
      + 'removed from Zone IV under magnetic resonance safety supervision, the door wedge removed '
      + 'and access control restored, and the contractor work replanned under screening, before '
      + 'scanning resumes',
    establishedConditionRequiresImmediateProtectiveAction: true,
    whyEachOtherPostureIsWrong: {
      CONTINUE: 'a ferromagnetic trolley two metres from an occupied bore is an established '
        + 'projectile hazard.',
      CONTINUE_WITH_CONTROLS: 'no control applied alongside a continuing scan removes a '
        + 'ferromagnetic mass that is already inside the field. The activity must cease and the '
        + 'patient be removed.',
      HOLD_PENDING_VERIFICATION: 'nothing is waiting on a result. The trolley is there, the '
        + 'screening did not happen and the door was wedged; the facts already require the action.',
    },
    boundaryConcepts: ['HOLD_VS_STOP', 'KNOWN_UNSAFE_CONDITION_VS_UNCERTAINTY_WHETHER_IT_EXISTS',
      'TEMPORARY_CONTROL_SUFFICIENT_VS_CONDITION_REQUIRING_CESSATION'],
    obviousEmergency: false, trivialSafeControl: false,
    firstPassCalls: 1, verifierCalls: 0, governedRecords: [],
    prohibitedInventedAuthority: 'no governed record is supplied. Any citation, regulation number '
      + 'or regulatory text is invented.',
  }),

  k({
    caseId: 'S4', sector: 'SCRAP_METAL_RECOVERY',
    whyThisCaseEarnsItsPlace: 'an unknown exists — what is actually inside the tank — and it is NOT '
      + 'what decides today. The established fact that hot work is being applied to an unpurged fuel '
      + 'vessel with people alongside already requires cessation. This is the hardest HOLD versus '
      + 'STOP discrimination in the cohort.',
    setting: 'A scrap metal yard, cutting bay.',
    observation:
      'An operative is gas cutting a 400 litre steel tank that was removed from a plant machine at '
      + 'the weighbridge. The yard intake note records the tank as a diesel tank. It has not been '
      + 'steam cleaned, purged or gas freed, no gas test has been taken and no hot work permit has '
      + 'been raised. The filler cap is off and sparks are entering the aperture; cutting has been '
      + 'running for several minutes and a residue is visible around the drain plug. Two other '
      + 'workers are within five metres sorting metal by hand, and the cutting set oxygen and '
      + 'acetylene bottles are on a trolley beside the tank.',
    suppliedContext: { location: 'scrap metal yard cutting bay',
      task: 'gas cutting a steel tank removed from a plant machine' },
    jurisdiction: 'US', hazardFamilies: ['fire_and_explosion', 'hot_work', 'struck_by'],
    decisionUnderAnalysis: 'whether cutting may continue on the tank',
    expectedPosture: 'STOP',
    controllingSafetyProperty: 'whether hot work is being applied to a vessel that has held a '
      + 'flammable liquid and has not been made safe',
    controllingPropertyState: 'ESTABLISHED',
    activeWorkState: { workInProgress: true, peopleCurrentlyExposed: true,
      description: 'cutting is live with sparks entering the aperture and two more workers within '
        + 'five metres' },
    establishedFacts: [
      'the tank is recorded as having held diesel',
      'it has not been steam cleaned, purged or gas freed',
      'no gas test has been taken and no hot work permit has been raised',
      'cutting is in progress with sparks entering the open aperture and residue at the drain plug',
      'two other workers are within five metres and the gas bottles are beside the tank',
    ],
    truthAnchors: [
      'It has not been steam cleaned, purged or gas freed',
      'sparks are entering the aperture',
    ],
    controlsAlreadyInPlace: [],
    newControlsRequired: [],
    verificationMayOccurConcurrentlyWithWork: null,
    requiredResumeCondition: 'cutting stopped, the operative and the nearby workers withdrawn, the '
      + 'cutting set and gas bottles removed from the tank, and the tank steam cleaned or purged '
      + 'and certified gas free under a hot work permit, before any further cutting',
    establishedConditionRequiresImmediateProtectiveAction: true,
    whyEachOtherPostureIsWrong: {
      CONTINUE: 'cutting into an uncleaned fuel tank is an established unsafe condition.',
      CONTINUE_WITH_CONTROLS: 'a fire watch or a screen alongside continued cutting does not address '
        + 'a vessel that may hold a flammable atmosphere. Cutting has to cease.',
      HOLD_PENDING_VERIFICATION: 'the unknown here is what is inside the tank, and it is not what '
        + 'decides today. The established fact that hot work is live on an unpurged fuel vessel '
        + 'with people alongside already requires cessation rather than a pause pending a '
        + 'measurement.',
    },
    boundaryConcepts: ['HOLD_VS_STOP', 'KNOWN_UNSAFE_CONDITION_VS_UNCERTAINTY_WHETHER_IT_EXISTS',
      'ESTABLISHED_HAZARD_VS_UNRESOLVED_DECISION_CRITICAL_PROPERTY'],
    obviousEmergency: true, trivialSafeControl: false,
    firstPassCalls: 1, verifierCalls: 0, governedRecords: [],
    prohibitedInventedAuthority: 'no governed record is supplied. Any citation, regulation number '
      + 'or regulatory text is invented.',
  }),
];

// ================================================================ truth preflight
//
// MACHINE-CHECKABLE, AND IT RUNS BEFORE THE FREEZE AND BEFORE ANY SPEND. A frozen instrument that
// contradicts itself measures nothing, and the only point at which a repair is permitted is here,
// in the development instrument, before the freeze.

const norm234 = (s: string): string =>
  s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

const tokens234 = (s: string): Set<string> =>
  new Set(norm234(s).split(' ').filter(w => w.length > 3));

/** Fraction of a's distinctive tokens that also appear in b. Nothing here reads meaning. */
function containment234(a: string, b: string): number {
  const ta = tokens234(a); const tb = tokens234(b);
  if (ta.size === 0) return 0;
  let hit = 0; for (const t of ta) if (tb.has(t)) hit += 1;
  return hit / ta.size;
}

export const OVERLAP_THRESHOLD_234 = 0.55;

export interface PreflightCheck234 {
  readonly id: string; readonly rule: string;
  readonly passed: boolean; readonly detail: readonly string[];
}

export function runTruthPreflight234(): {
  checks: readonly PreflightCheck234[]; passed: number; total: number; allPassed: boolean;
} {
  const checks: PreflightCheck234[] = [];
  const add = (id: string, rule: string, detail: string[]): void => {
    checks.push({ id, rule, passed: detail.length === 0, detail });
  };
  const C = POSTURE_CASES_234;

  // P1. Cohort shape.
  add('P1', 'sixteen cases, four per posture, unique case identifiers', (() => {
    const d: string[] = [];
    if (C.length !== 16) d.push(`cohort is ${C.length} cases, not 16`);
    const ids = new Set(C.map(c => c.caseId));
    if (ids.size !== C.length) d.push('case identifiers are not unique');
    for (const p of IMMEDIATE_SAFETY_POSTURES_233) {
      const n = C.filter(c => c.expectedPosture === p).length;
      if (n !== 4) d.push(`${p} has ${n} cases, not 4`);
    }
    return d;
  })());

  // P2. Every truth anchor is a verbatim substring of its own observation.
  add('P2', 'every truth anchor is a verbatim substring of its case observation, and every case '
    + 'carries at least one', C.flatMap(c => {
    const d: string[] = [];
    if (c.truthAnchors.length === 0) d.push(`${c.caseId}: no truth anchor`);
    for (const a of c.truthAnchors) {
      if (!c.observation.includes(a)) {
        d.push(`${c.caseId}: anchor is not verbatim in the observation: "${a.slice(0, 60)}"`);
      }
    }
    return d;
  }));

  // P3. The expected posture is a member of the FROZEN §233 vocabulary, not a local string.
  add('P3', 'every expected posture is a member of the frozen §233 vocabulary',
    C.filter(c => !IMMEDIATE_SAFETY_POSTURES_233.includes(c.expectedPosture))
      .map(c => `${c.caseId}: ${c.expectedPosture} is not a §233 posture`));

  // P4. THE TRUTH AXIS. HOLD if and only if the controlling property is unresolved.
  add('P4', 'HOLD_PENDING_VERIFICATION if and only if the controlling property is UNRESOLVED; '
    + 'CONTINUE, CONTINUE_WITH_CONTROLS and STOP require it ESTABLISHED', C.flatMap(c => {
    const shouldBeUnresolved = c.expectedPosture === 'HOLD_PENDING_VERIFICATION';
    const isUnresolved = c.controllingPropertyState === 'UNRESOLVED';
    return shouldBeUnresolved === isUnresolved ? []
      : [`${c.caseId}: ${c.expectedPosture} with controlling property ${c.controllingPropertyState}`];
  }));

  // P5. The frozen CONTINUE / CONTINUE_WITH_CONTROLS disambiguation, applied mechanically.
  add('P5', 'CONTINUE owes no new control; CONTINUE_WITH_CONTROLS names at least one control that '
    + 'is not currently in effect; HOLD and STOP carry their requirement in the resume condition '
    + 'rather than as a continuation control', C.flatMap(c => {
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
      if (c.controlsAlreadyInPlace.some(x => containment234(nc, x) >= 0.85)) {
        d.push(`${c.caseId}: a "new" control restates one already in place: "${nc.slice(0, 50)}"`);
      }
    }
    return d;
  }));

  // P6. Resume condition presence follows the posture, not the author's mood.
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

  // P7. Concurrency of verification is the CONTINUE_WITH_CONTROLS / HOLD boundary and is frozen.
  add('P7', 'HOLD requires verification BEFORE continuation; CONTINUE and STOP have no concurrent '
    + 'verification to record; CONTINUE_WITH_CONTROLS may verify concurrently or not at all',
  C.flatMap(c => {
    const v = c.verificationMayOccurConcurrentlyWithWork;
    switch (c.expectedPosture) {
      case 'HOLD_PENDING_VERIFICATION':
        return v === false ? [] : [`${c.caseId}: HOLD records concurrency ${String(v)}`];
      case 'CONTINUE': case 'STOP':
        return v === null ? [] : [`${c.caseId}: ${c.expectedPosture} records concurrency ${String(v)}`];
      case 'CONTINUE_WITH_CONTROLS':
        return v === true || v === null ? []
          : [`${c.caseId}: CONTINUE_WITH_CONTROLS records concurrency false`];
      default: return [`${c.caseId}: unreachable posture`];
    }
  }));

  // P8. STOP is the only posture whose established condition itself demands protective action now.
  add('P8', 'the established condition requires immediate protective action if and only if the '
    + 'expected posture is STOP', C.flatMap(c =>
    (c.expectedPosture === 'STOP') === c.establishedConditionRequiresImmediateProtectiveAction
      ? [] : [`${c.caseId}: ${c.expectedPosture} with immediate-protective-action `
        + `${String(c.establishedConditionRequiresImmediateProtectiveAction)}`]));

  // P9. Every neighbouring posture is refuted, and the expected one is not "refuted" against itself.
  add('P9', 'each case refutes exactly the three postures it did not choose, in substantive terms',
    C.flatMap(c => {
      const d: string[] = [];
      const keys = Object.keys(c.whyEachOtherPostureIsWrong) as ImmediateSafetyPosture233[];
      if (keys.includes(c.expectedPosture)) d.push(`${c.caseId}: refutes its own expected posture`);
      for (const p of IMMEDIATE_SAFETY_POSTURES_233) {
        if (p === c.expectedPosture) continue;
        const why = c.whyEachOtherPostureIsWrong[p];
        if (why === undefined) { d.push(`${c.caseId}: does not say why ${p} is wrong`); continue; }
        if (why.trim().length < 60) d.push(`${c.caseId}/${p}: rationale is too thin to adjudicate`);
      }
      return d;
    }));

  // P10. Freshness by excluded term.
  add('P10', 'no case reuses an excluded prior-cohort subject term',
    C.flatMap(c => {
      const hay = norm234(`${c.setting} ${c.observation} ${c.suppliedContext.location} `
        + `${c.suppliedContext.task}`);
      return FRESHNESS_234.excludedSubjectTerms
        .filter(t => hay.includes(norm234(t)))
        .map(t => `${c.caseId}: uses excluded subject term "${t}"`);
    }));

  // P11. Freshness against the thirty §230 observations, measured rather than asserted. §231 is
  // spent evidence and this cohort may not be a paraphrase of it.
  add('P11', 'no §234 observation overlaps any §230/§231 observation above the threshold',
    C.flatMap(c => ACCEPTANCE_CASES_230.flatMap(p => {
      const o = containment234(c.observation, p.observation);
      return o >= OVERLAP_THRESHOLD_234
        ? [`${c.caseId} overlaps §230 ${p.caseId} at ${o.toFixed(3)}`] : [];
    })));

  // P12. No case inside the cohort is a paraphrase of another.
  add('P12', 'no §234 case is a paraphrase of another §234 case', C.flatMap((a, i) =>
    C.slice(i + 1).flatMap(b => {
      const o = Math.max(containment234(a.observation, b.observation),
        containment234(b.observation, a.observation));
      return o >= OVERLAP_THRESHOLD_234
        ? [`${a.caseId} and ${b.caseId} overlap at ${o.toFixed(3)}`] : [];
    })));

  // P13. The cohort actually exercises the distinctions it claims to.
  add('P13', 'every named boundary concept is exercised, and each adjacent-degree boundary by at '
    + 'least two cases', (() => {
    const d: string[] = [];
    const seen = new Set(C.flatMap(c => c.boundaryConcepts));
    for (const b of BOUNDARY_CONCEPTS_234) if (!seen.has(b)) d.push(`no case exercises ${b}`);
    for (const b of ['CONTINUE_VS_CONTINUE_WITH_CONTROLS', 'CONTINUE_WITH_CONTROLS_VS_HOLD',
      'HOLD_VS_STOP'] as const) {
      const n = C.filter(c => c.boundaryConcepts.includes(b)).length;
      if (n < 2) d.push(`${b} is exercised by only ${n} case(s)`);
    }
    return d;
  })());

  // P14. Not all STOP cases obvious, no CONTINUE case trivial. The §234 authorization asks for this
  // in as many words, and it is checkable only because each case labels itself honestly.
  add('P14', 'not all STOP cases are obvious emergencies and no CONTINUE case is a trivial safe '
    + 'control', (() => {
    const d: string[] = [];
    const stops = C.filter(c => c.expectedPosture === 'STOP');
    const obvious = stops.filter(c => c.obviousEmergency).length;
    if (obvious > 2) d.push(`${obvious} of 4 STOP cases are obvious emergencies`);
    if (obvious === stops.length) d.push('every STOP case is an obvious emergency');
    const trivial = C.filter(c => c.expectedPosture === 'CONTINUE' && c.trivialSafeControl).length;
    if (trivial > 0) d.push(`${trivial} CONTINUE cases are trivial safe controls`);
    return d;
  })());

  // P15. Call plan matches the authorization exactly.
  add('P15', 'each case books exactly one first-pass call and no verifier call, and the total is '
    + 'within the authorized maximum', (() => {
    const d: string[] = [];
    for (const c of C) {
      if (c.firstPassCalls !== 1) d.push(`${c.caseId}: books ${c.firstPassCalls} first-pass calls`);
      if (c.verifierCalls !== 0) d.push(`${c.caseId}: books a verifier call`);
    }
    const total = C.reduce((n, c) => n + c.firstPassCalls + c.verifierCalls, 0);
    if (total !== 16) d.push(`total primary calls ${total}, expected 16`);
    if (total > AUTHORIZATION_234.maximumProviderCalls) d.push('call plan exceeds the authorization');
    return d;
  })());

  // P16. Transmission shape is uniform and carries no governed record.
  add('P16', 'no case supplies a governed record, and every case carries a jurisdiction, a hazard '
    + 'family list and a decision under analysis', C.flatMap(c => {
    const d: string[] = [];
    if (c.governedRecords.length !== 0) d.push(`${c.caseId}: supplies a governed record`);
    if (c.jurisdiction.trim().length === 0) d.push(`${c.caseId}: no jurisdiction`);
    if (c.hazardFamilies.length === 0) d.push(`${c.caseId}: no hazard family`);
    if (c.decisionUnderAnalysis.trim().length === 0) d.push(`${c.caseId}: no decision under analysis`);
    if (c.establishedFacts.length === 0) d.push(`${c.caseId}: enumerates no established fact`);
    if (c.controllingSafetyProperty.trim().length === 0) {
      d.push(`${c.caseId}: names no controlling safety property`);
    }
    return d;
  }));

  // P17. The frozen §233 permission table agrees with the truth. Catches vocabulary drift in the
  // contract under test rather than in the instrument.
  add('P17', 'the frozen §233 continuation table agrees with the frozen truth on every case',
    C.flatMap(c => {
      const permits = POSTURE_PERMITS_CONTINUED_WORK[c.expectedPosture];
      const truthPermits = c.expectedPosture === 'CONTINUE'
        || c.expectedPosture === 'CONTINUE_WITH_CONTROLS';
      return permits === truthPermits ? []
        : [`${c.caseId}: §233 says permits=${String(permits)}, truth says ${String(truthPermits)}`];
    }));

  const passed = checks.filter(c => c.passed).length;
  return { checks, passed, total: checks.length, allPassed: passed === checks.length };
}

// ================================================================ call plan

export const COST_EVIDENCE_234 = {
  unitCostBasis: '§231 CALL-LEDGER-231 first-pass mean USD 0.089530 over 30 calls, maximum USD '
    + '0.104338. No §221 or §227 constant is imported.',
  meanFirstPassUsd: 0.089530,
  maxObservedFirstPassUsd: 0.104338,
  section233SchemaIsLarger: 'the §233 transmitted schema is 22,987 bytes against the §210J 19,089, '
    + 'so input cost per call is modestly higher than the §231 mean and output may be longer.',
} as const;

export const FROZEN_EXECUTION_CONFIGURATION_234 = {
  arm: 'SINGLE',
  leg: 'FIRST_PASS_ONLY',
  verifierLeg: 'NOT_AUTHORIZED_AND_NOT_ASSEMBLED',
  thinking: 'disabled',
  cachingEnabled: false,
  temperatureOverride: 'none — provider default, as §231',
  firstPassMaxTokens: 8000,
  maxTokensRationale:
    'DELIBERATE AND PREREGISTERED. §231 ran at 4000 and recorded one truncation on the SMALLER '
    + '§210J schema; the §233 successor adds a required root object, so the same ceiling carries a '
    + 'higher truncation risk. A truncated output produces no adjudicable posture and is NOT '
    + 'contingency-eligible, so it would cost a case rather than a retry. Output tokens are billed '
    + 'on actual use, so raising the ceiling costs nothing unless the model needs it, and it '
    + 'protects the instrument rather than the result.',
  semanticPreferenceRetries: 0,
  contingencyEligibleFailureClasses: ['TRANSPORT_FAILURE', 'HTTP_FAILURE'],
  databaseOperations: 0,

  /**
   * THE CEILING GUARD, AND WHAT IT DOES WHEN IT TRIPS.
   *
   * Measured assembly: 27,700 input tokens per call. The guard budgets 30,000 input tokens and a
   * FULL 8,000-token output at USD 2 / USD 10 per million, which is USD 0.140 — roughly 1.6x the
   * §231 observed maximum. Before every call the executor requires
   * `spendSoFar + worstCase <= ceiling`, so the hard ceiling cannot be breached by any single
   * outcome.
   *
   * If the guard trips, the run STOPS and terminates EXECUTION_INCOMPLETE for a product-owner
   * decision. It does NOT reduce cohort coverage, drop cases, shrink the schema or change the
   * semantic request in order to fit. Instrument integrity outranks the ceiling; the ceiling is
   * never met by cutting the measurement.
   */
  guardWorstCaseCallUsd: 0.140,
  guardBudgetedInputTokens: 30_000,
  measuredInputTokensPerCall: 27_700,
  ifGuardTrips: 'STOP and return EXECUTION_INCOMPLETE. Never reduce coverage to fit the ceiling.',
} as const;

export function callPlan234(): {
  primaryCalls: number; maximumTotalCalls: number; projectedSpendUsd: number;
  worstCaseSpendUsd: number; hardCeilingUsd: number;
  perCase: readonly { caseId: string; firstPass: number; verifier: number }[];
} {
  const perCase = POSTURE_CASES_234.map(c => ({
    caseId: c.caseId, firstPass: c.firstPassCalls as number, verifier: c.verifierCalls as number,
  }));
  const primaryCalls = perCase.reduce((n, p) => n + p.firstPass + p.verifier, 0);
  return {
    primaryCalls,
    maximumTotalCalls: AUTHORIZATION_234.maximumProviderCalls,
    projectedSpendUsd: Number((primaryCalls * COST_EVIDENCE_234.meanFirstPassUsd).toFixed(4)),
    worstCaseSpendUsd: Number((primaryCalls * COST_EVIDENCE_234.maxObservedFirstPassUsd).toFixed(4)),
    hardCeilingUsd: AUTHORIZATION_234.hardSpendCeilingUsd,
    perCase,
  };
}

// ================================================================ identity

const sha234 = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

/** The frozen instrument digest. Recomputed by the executor before the first provider call. */
export function instrumentDigest234(): string {
  return sha234(JSON.stringify({
    version: INSTRUMENT_234_VERSION,
    implementationUnderTest: IMPLEMENTATION_UNDER_TEST_234,
    authorization: AUTHORIZATION_234,
    authoringIndependence: AUTHORING_INDEPENDENCE_234,
    freshness: FRESHNESS_234,
    scoring: SCORING_RULES_234,
    execution: FROZEN_EXECUTION_CONFIGURATION_234,
    postures: IMMEDIATE_SAFETY_POSTURES_233,
    postureDefinitions: POSTURE_DEFINITIONS_233,
    postureDistinctions: POSTURE_DISTINCTIONS_233,
    protectiveRank: POSTURE_PROTECTIVE_RANK,
    cases: POSTURE_CASES_234,
  }));
}

export const TERMINALS_234 = {
  pass: 'EXPERT_HAZLENZ_POSTURE_DISCRIMINATION_VALIDATED — '
    + 'SUCCESSOR_CANDIDATE_FREEZE_AUTHORIZATION_REQUIRED',
  fail: 'EXPERT_HAZLENZ_POSTURE_DISCRIMINATION_VALIDATION_FAILED — '
    + 'PRODUCT_OWNER_REMEDIATION_DECISION_REQUIRED',
  incomplete: 'EXPERT_HAZLENZ_POSTURE_DISCRIMINATION_EXECUTION_INCOMPLETE — '
    + 'PRODUCT_OWNER_REVIEW_REQUIRED',
} as const;

/** The failure classification the §234 authorization requires if any requirement fails. */
export const FAILURE_CLASSES_234 = [
  'WRONG_POSTURE_DEGREE',
  'WRONG_CONTROLLING_PROPERTY',
  'MALFORMED_OR_INCOMPLETE_STRUCTURED_POSTURE',
  'RECOMMENDATION_PROJECTION_DEFECT',
  'CONTROL_TIMING_OR_RESUME_INCONSISTENCY',
  'PROVIDER_OR_TRANSPORT_ANOMALY',
  'OTHER',
] as const;
export type FailureClass234 = (typeof FAILURE_CLASSES_234)[number];
