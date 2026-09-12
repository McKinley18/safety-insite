/**
 * §211 -- TARGETED VERIFIER VALIDATION INSTRUMENT. PREREGISTRATION SOURCE.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. DESIGN, VALIDATION AND FREEZE ONLY.
 *
 * Ten new cases, authored BEFORE any provider call, to determine whether the verifier can
 * independently detect that a first-pass unresolved fact is not the correct decision-critical
 * safety property. This is NOT a characterization cohort, NOT an accuracy measurement, and NOT
 * Expert acceptance.
 *
 * ==================== THE STIMULUS IS THE FIRST-PASS DECLARATION ====================
 *
 * Every case supplies a first-pass declaration that this module AUTHORS. None is model output and
 * none is copied from §210H. Several are deliberately defective, and that is the point: a defective
 * candidate is the INSTRUMENT, not a bug to be fixed upstream. §211's freeze rule says so directly
 * -- do not tune the first pass because a verifier test exposed a bad candidate.
 *
 * The mechanisms are §210H's. The cases are not. Ten different industries, ten different
 * mechanism-bearing structures, and no noun-substituted rewrite of G1, G2 or G3.
 *
 * ==================== WHY A CONTROL AND A COUNTER-CONTROL ARE MANDATORY ====================
 *
 * T8 is a fully correct declaration. A verifier that challenges everything passes every detection
 * case and is useless, and T8 is the only thing that catches it.
 *
 * T4 is an act-as-property case where performance of the act IS the owed property. A verifier
 * taught to distrust process language will reject it. That is HF-2, and it is the §210G
 * overcorrection risk arriving at a new layer. T1 and T4 are the decisive pair, exactly as §210H's
 * G1 and G3 were: T1 alone is passed by a system that strips process language everywhere, T4 alone
 * by one that never challenges anything.
 *
 * ==================== THIS INSTRUMENT IS NOT EXECUTABLE AGAINST TODAY'S VERIFIER ====================
 *
 * See `expert-211-verifier-inspection.ts`. The exact property is not in the payload, the verifier is
 * not asked about it, and a property-collapse finding has no declaration or challenge ground to land
 * in. The instrument is frozen against the REMEDIATED verifier the inspection specifies, and
 * `EXECUTION_PRECONDITIONS` names what must exist before a single call is made.
 */

import type { TargetedCapability } from './expert-211-verifier-inspection';
import { REMEDIATION_IDS } from './expert-211-verifier-inspection';

export const VALIDATION_INSTRUMENT_211_VERSION =
  'hazlenz.expert.211.targeted-verifier-validation.v1' as const;

export const PROVIDER_CALLS_IN_DESIGN_SLICE = 0 as const;

// ---------------------------------------------------------------- hard-failure classes

/**
 * Reported as OCCURRENCE COUNTS, never as an aggregate percentage. The authorization is explicit
 * that these must not be collapsed into one number, and a zero-occurrence gate cannot be offset by
 * a good score elsewhere.
 */
export const HARD_FAILURE_CLASSES = [
  { id: 'HF-1', name: 'EVIDENCE_PROXY_ACCEPTED_AS_THE_PROPERTY',
    statement: 'the verifier accepted a declaration whose property is the test, check, record or '
      + 'verification used to establish a safety state, as though it were the state' },
  { id: 'HF-2', name: 'LEGITIMATE_ACT_AS_PROPERTY_REJECTED',
    statement: 'the verifier rejected or challenged a case in which performance of the act IS the '
      + 'decision-critical property, merely because the property contains process language' },
  { id: 'HF-3', name: 'BOUND_TO_THE_WRONG_ADJACENT_OR_SIBLING_FACT',
    statement: 'the verifier addressed a neighbouring property instead of the exact owed one' },
  { id: 'HF-4', name: 'INSUFFICIENT_EVIDENCE_BECAME_ADVERSE_TRUTH',
    statement: 'the verifier allowed "not established" to be treated as "the adverse branch is '
      + 'true"' },
  { id: 'HF-5', name: 'INSUFFICIENT_CLARIFICATION_APPROVED',
    statement: 'the verifier approved a clarification that cannot settle the exact owed property' },
  { id: 'HF-6', name: 'DECISION_WHILE_UNRESOLVED_LOST',
    statement: 'the unresolved operational consequence did not survive to the verifier, or was '
      + 'silently dropped, reconstructed or rewritten' },
  { id: 'HF-7', name: 'PROVIDER_SETTLEMENT_AUTHORITY_BREACH',
    statement: 'the verifier settled, resolved or closed an owed fact, or its output was treated as '
      + 'settlement authority' },
] as const;
export type HardFailureId = (typeof HARD_FAILURE_CLASSES)[number]['id'];

/** Gate character, recorded so nobody averages a pass/fail gate into a quality score. */
export const HARD_FAILURE_GATE_RULE = {
  reporting: 'PER_CLASS_OCCURRENCE_COUNT',
  threshold: 'ZERO_OCCURRENCE',
  mayBeOffsetByAnAggregateScore: false,
  aggregatePercentageReported: false,
} as const;

// ---------------------------------------------------------------- the case shape

export type DeclarationQuality =
  | 'CORRECT'
  | 'EVIDENCE_PROXY_PROPERTY'
  | 'PROCESS_COMPLETED_SUBSTITUTED_FOR_STATE'
  | 'CORRECT_ACT_AS_PROPERTY'
  | 'CORRECT_PROPERTY_INSUFFICIENT_CLARIFICATION'
  | 'CORRECT_PROPERTY_INCOHERENT_UNRESOLVED_ACTION'
  | 'CORRECT_PROPERTY_ADVERSE_BRANCH_ABSORBS_UNCERTAINTY';

/** The verifier outcome the frozen truth requires. Stated in capability terms, not in verdict names,
 * because the verdict vocabulary is one of the things the remediation changes. */
export type RequiredVerifierOutcome =
  | 'CHALLENGE_THE_PROPERTY_AS_ITS_OWN_EVIDENCE'
  | 'CHALLENGE_THE_PROPERTY_AS_ALREADY_ESTABLISHED_PROCESS'
  | 'ACCEPT_THE_PROPERTY_UNCHANGED'
  | 'ACCEPT_THE_PROPERTY_AND_REPLACE_THE_CLARIFICATION'
  | 'ACCEPT_THE_PROPERTY_AND_FLAG_THE_UNRESOLVED_ACTION'
  | 'ACCEPT_THE_PROPERTY_AND_FLAG_THE_ADVERSE_BRANCH';

export interface SuppliedDeclaration {
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

export interface ValidationCase {
  readonly caseId: string;
  readonly mechanism: string;
  readonly primaryCapabilities: readonly TargetedCapability[];
  readonly observation: string;
  readonly suppliedContext: { readonly location: string; readonly task: string };
  readonly jurisdiction: string;
  readonly decisionUnderAnalysis: string;
  /** Authored here as design material. Never model output, never a §210H replay. */
  readonly declarations: readonly SuppliedDeclaration[];
  /** The clarifications the first pass emitted, as the verifier would be shown them. */
  readonly clarifications: readonly {
    readonly clarificationId: string; readonly question: string;
    readonly affectedDecision: string; readonly boundToDeclarationId: string | null;
  }[];
  readonly declarationQuality: DeclarationQuality;
  /** FROZEN TRUTH: the property that actually decides the case. */
  readonly correctOwedProperty: string;
  readonly requiredOutcome: RequiredVerifierOutcome;
  /** The counterfactual GATE 12 uses, answered here before execution. */
  readonly perfectKnowledgeTest: string;
  /** Where the world in which the state is satisfactory and unestablished must land. */
  readonly satisfactoryUnestablishedWorldBelongsTo: 'BRANCH_A' | 'NO_SUCH_WORLD_ACT_IS_PROPERTY';
  readonly hardFailuresIfWrong: readonly HardFailureId[];
  /** Facts the observation ESTABLISHES. Raising one is a false gap. */
  readonly establishedByTheObservation: readonly string[];
  readonly providerCalls: number;
  readonly evaluationQuestions: readonly {
    readonly id: string; readonly capability: TargetedCapability; readonly mandatory: boolean;
    readonly question: string; readonly expected: string;
  }[];
}

const d = (x: SuppliedDeclaration): SuppliedDeclaration => x;

// ---------------------------------------------------------------- the ten cases

export const VALIDATION_CASES: readonly ValidationCase[] = [
  // ============================================================ T1
  {
    caseId: 'T1',
    mechanism: 'latent physical state with a highly salient required test beside it',
    primaryCapabilities: ['V1_EXACT_PROPERTY_IDENTITY', 'V2_STATE_VERSUS_EVIDENCE',
      'V4_BRANCH_ALIGNMENT', 'V10_CHALLENGE_REVIEWABILITY'],
    observation:
      'A fabrication shop has welded four lifting eyes onto a steel transport frame so it can be '
      + 'craned onto a low loader. The welder is coded and the procedure sheet is signed off. The '
      + 'shop works to a rule that every lifting eye weld is crack tested before first lift and '
      + 'the result written on the frame record; the record for this frame has no test entry and '
      + 'the inspector who does the testing left at midday. The frame is slung and the crane driver '
      + 'is waiting on the hook.',
    suppliedContext: { location: 'fabrication shop, steel transport frame, lifting eyes',
      task: 'craning a fabricated frame onto a low loader' },
    jurisdiction: 'osha-general-industry',
    decisionUnderAnalysis: 'whether the frame may be lifted on these eyes now',
    declarations: [d({
      declarationId: 'T1-D1',
      missingFact: 'whether the lifting eye welds on this frame were crack tested before first lift',
      observationSpan: 'the record for this frame has no test entry and the inspector who does the '
        + 'testing left at midday',
      notEstablishedBecause: 'the frame record carries no test entry and the inspector is not '
        + 'available to confirm whether the test was carried out',
      affectedDecision: 'REQUIRED_CONTROL',
      branchA: 'the lifting eye welds were crack tested and passed, so the eyes are fit to lift the '
        + 'frame',
      decisionIfA: 'the lift may go ahead on these eyes once the test result is confirmed',
      branchB: 'the welds were not tested, or were tested and failed, so their soundness is '
        + 'unconfirmed or inadequate',
      decisionIfB: 'do not lift on these eyes until they have been crack tested and passed',
      decisionWhileUnresolved: 'no lift on these eyes until the test result is available',
      whyNecessaryNow: 'the frame is slung and the crane driver is on the hook',
    })],
    clarifications: [{
      clarificationId: 'T1-C1',
      question: 'Was the crack test carried out on the lifting eye welds, even though the record '
        + 'has no entry?',
      affectedDecision: 'REQUIRED_CONTROL', boundToDeclarationId: 'T1-D1',
    }],
    declarationQuality: 'EVIDENCE_PROXY_PROPERTY',
    correctOwedProperty: 'whether the lifting eye welds are actually sound enough to carry the '
      + 'frame through the lift',
    requiredOutcome: 'CHALLENGE_THE_PROPERTY_AS_ITS_OWN_EVIDENCE',
    perfectKnowledgeTest: 'if the weld metal could simply be seen through, this entry would be '
      + 'settled: you would see whether the welds are sound. The crack test is how you find out, so '
      + 'the state is the property and the test is evidence.',
    satisfactoryUnestablishedWorldBelongsTo: 'BRANCH_A',
    hardFailuresIfWrong: ['HF-1', 'HF-4'],
    establishedByTheObservation: [
      'that the welder is coded and the procedure sheet is signed off',
      'that the frame record has no test entry',
      'that the inspector left at midday',
    ],
    providerCalls: 1,
    evaluationQuestions: [
      { id: 'T1.Q1', capability: 'V1_EXACT_PROPERTY_IDENTITY', mandatory: true,
        question: 'MANDATORY. Did the verifier identify that missingFact names the crack test '
          + 'rather than the soundness of the welds?', expected: 'PASS' },
      { id: 'T1.Q2', capability: 'V2_STATE_VERSUS_EVIDENCE', mandatory: true,
        question: 'MANDATORY. Did it state that the test is evidence for the state and not the '
          + 'state itself?', expected: 'PASS' },
      { id: 'T1.Q3', capability: 'V4_BRANCH_ALIGNMENT', mandatory: false,
        question: 'Did it identify that branchB partitions tested against untested rather than '
          + 'sound against unsound?', expected: 'PASS' },
      { id: 'T1.Q4', capability: 'V5_UNRESOLVED_STATE_CONTAINMENT', mandatory: false,
        question: 'Did it avoid asserting that the welds ARE unsound?', expected: 'PASS' },
      { id: 'T1.Q5', capability: 'V10_CHALLENGE_REVIEWABILITY', mandatory: true,
        question: 'MANDATORY. Is the reason explicit enough that a human could authorize or refuse '
          + 'the challenge without reconstructing it from prose?', expected: 'PASS' },
    ],
  },

  // ============================================================ T2
  {
    caseId: 'T2',
    mechanism: 'latent state whose only visible trace is a missing document',
    primaryCapabilities: ['V1_EXACT_PROPERTY_IDENTITY', 'V2_STATE_VERSUS_EVIDENCE'],
    observation:
      'A water treatment works stores ferric sulphate in a single bulk tank inside a concrete bund. '
      + 'The bund walls are sound to look at and the drain valve is closed and padlocked. The site '
      + 'has a three-yearly bund integrity regime and the certificate for this bund is not in the '
      + 'folder; the works manager thinks it was done but cannot find it. A delivery tanker is at '
      + 'the gate waiting to fill the tank.',
    suppliedContext: { location: 'water treatment works, ferric sulphate bulk tank and bund',
      task: 'receiving a bulk chemical delivery into a bunded tank' },
    jurisdiction: 'osha-general-industry',
    decisionUnderAnalysis: 'whether the delivery may be taken into this tank now',
    declarations: [d({
      declarationId: 'T2-D1',
      missingFact: 'whether the bund integrity certificate for this bund is on file',
      observationSpan: 'the certificate for this bund is not in the folder',
      notEstablishedBecause: 'the folder does not contain the certificate and the works manager '
        + 'cannot confirm it exists',
      affectedDecision: 'APPLICABILITY',
      branchA: 'the certificate exists and the bund is within its integrity regime',
      decisionIfA: 'the delivery may be taken once the certificate is produced',
      branchB: 'the certificate does not exist, so the bund is outside its regime',
      decisionIfB: 'refuse the delivery until the bund has been tested and certified',
      decisionWhileUnresolved: 'hold the tanker until the certificate position is established',
      whyNecessaryNow: 'the tanker is at the gate waiting to discharge',
    })],
    clarifications: [{
      clarificationId: 'T2-C1',
      question: 'Can the bund integrity certificate be located, or confirmed as issued?',
      affectedDecision: 'APPLICABILITY', boundToDeclarationId: 'T2-D1',
    }],
    declarationQuality: 'EVIDENCE_PROXY_PROPERTY',
    correctOwedProperty: 'whether the bund will actually retain the contents of the tank if it '
      + 'releases',
    requiredOutcome: 'CHALLENGE_THE_PROPERTY_AS_ITS_OWN_EVIDENCE',
    perfectKnowledgeTest: 'if the bund could be filled and watched, this entry would be settled. '
      + 'The certificate records that somebody once did that; it is not the retention itself.',
    satisfactoryUnestablishedWorldBelongsTo: 'BRANCH_A',
    hardFailuresIfWrong: ['HF-1'],
    establishedByTheObservation: [
      'that the drain valve is closed and padlocked',
      'that the certificate is not in the folder',
    ],
    providerCalls: 1,
    evaluationQuestions: [
      { id: 'T2.Q1', capability: 'V1_EXACT_PROPERTY_IDENTITY', mandatory: true,
        question: 'MANDATORY. Did the verifier identify that the owed property is retention, not '
          + 'the whereabouts of a certificate?', expected: 'PASS' },
      { id: 'T2.Q2', capability: 'V2_STATE_VERSUS_EVIDENCE', mandatory: true,
        question: 'MANDATORY. Did it treat the document as a record of evidence rather than as the '
          + 'safety state?', expected: 'PASS' },
      { id: 'T2.Q3', capability: 'V6_CLARIFICATION_SUFFICIENCY', mandatory: false,
        question: 'Did it identify that locating the certificate would not settle whether the bund '
          + 'retains?', expected: 'PASS' },
    ],
  },

  // ============================================================ T3
  {
    caseId: 'T3',
    mechanism: 'a required process demonstrably completed while the hazardous state may remain',
    primaryCapabilities: ['V1_EXACT_PROPERTY_IDENTITY', 'V2_STATE_VERSUS_EVIDENCE'],
    observation:
      'A shipping container of hardwood flooring was fumigated at the port and carries a fumigation '
      + 'placard. The paperwork shows the doors were opened and the container ventilated for the '
      + 'full period the procedure specifies, and the placard has been struck through. The load is '
      + 'tightly packed to the doors and nobody has taken a reading inside the load. A picker is at '
      + 'the doors with a pallet truck.',
    suppliedContext: { location: 'distribution yard, fumigated container of packed flooring',
      task: 'entering and unloading a fumigated shipping container' },
    jurisdiction: 'osha-general-industry',
    decisionUnderAnalysis: 'whether the picker may enter the container and start unloading now',
    declarations: [d({
      declarationId: 'T3-D1',
      missingFact: 'whether the ventilation period specified in the fumigation procedure was '
        + 'completed for this container',
      observationSpan: 'nobody has taken a reading inside the load',
      notEstablishedBecause: 'no reading has been taken, so the ventilation cannot be confirmed as '
        + 'effective',
      affectedDecision: 'HAZARD_EXISTENCE',
      branchA: 'the ventilation period was completed as the procedure requires',
      decisionIfA: 'the picker may enter and unload',
      branchB: 'the ventilation period was not completed',
      decisionIfB: 'keep the picker out until the container has been ventilated for the full period',
      decisionWhileUnresolved: 'nobody enters until the ventilation position is established',
      whyNecessaryNow: 'the picker is at the doors with a pallet truck',
    })],
    clarifications: [{
      clarificationId: 'T3-C1',
      question: 'Was the container ventilated for the full period the fumigation procedure '
        + 'specifies?',
      affectedDecision: 'HAZARD_EXISTENCE', boundToDeclarationId: 'T3-D1',
    }],
    declarationQuality: 'PROCESS_COMPLETED_SUBSTITUTED_FOR_STATE',
    correctOwedProperty: 'whether fumigant is still present within the packed load at the '
      + 'concentrations a picker would be exposed to',
    requiredOutcome: 'CHALLENGE_THE_PROPERTY_AS_ALREADY_ESTABLISHED_PROCESS',
    perfectKnowledgeTest: 'if the air within the load could simply be sensed, this entry would be '
      + 'settled. Whether the procedure ran is already in the observation and does not settle it, '
      + 'because a tightly packed load can hold gas through a compliant ventilation period.',
    satisfactoryUnestablishedWorldBelongsTo: 'BRANCH_A',
    hardFailuresIfWrong: ['HF-1'],
    establishedByTheObservation: [
      'that the doors were opened and the container ventilated for the full specified period',
      'that the placard has been struck through',
      'that no reading has been taken inside the load',
    ],
    providerCalls: 1,
    evaluationQuestions: [
      { id: 'T3.Q1', capability: 'V1_EXACT_PROPERTY_IDENTITY', mandatory: true,
        question: 'MANDATORY. Did the verifier identify that the declaration asks about a process '
          + 'the observation ALREADY ESTABLISHES, and that the owed property is residual gas in '
          + 'the load?', expected: 'PASS' },
      { id: 'T3.Q2', capability: 'V2_STATE_VERSUS_EVIDENCE', mandatory: true,
        question: 'MANDATORY. Did it recognise that a completed procedure does not establish the '
          + 'state where the load may hold gas?', expected: 'PASS' },
      { id: 'T3.Q3', capability: 'V10_CHALLENGE_REVIEWABILITY', mandatory: false,
        question: 'Is the ground for the challenge distinguishable from "both answers lead to the '
          + 'same action"?', expected: 'PASS' },
    ],
  },

  // ============================================================ T4 -- COUNTER-CONTROL
  {
    caseId: 'T4',
    mechanism: 'performance of a required act IS the decision-critical property',
    primaryCapabilities: ['V3_ACT_AS_PROPERTY_NARROWING'],
    observation:
      'A brewery is about to send a fitter into a fermentation vessel through the side manway. The '
      + 'vessel has been cleaned, the atmosphere was tested at the manway ten minutes ago and read '
      + 'clear, the agitator is isolated and locked, and the fitter is trained and harnessed. The '
      + 'site rule is that the on-site rescue team agrees a rescue plan for each vessel entry and '
      + 'confirms it to the entry controller. The entry controller has been on shift for an hour, '
      + 'took over mid-preparation, and says he does not know whether that was done for this entry. '
      + 'The rescue team leader is not answering the radio.',
    suppliedContext: { location: 'brewery, fermentation vessel side manway',
      task: 'confined space entry into a fermentation vessel' },
    jurisdiction: 'osha-general-industry',
    decisionUnderAnalysis: 'whether the fitter may enter the vessel now',
    declarations: [d({
      declarationId: 'T4-D1',
      missingFact: 'whether the on-site rescue team has agreed a rescue plan for this entry and '
        + 'confirmed it to the entry controller',
      observationSpan: 'says he does not know whether that was done for this entry',
      notEstablishedBecause: 'the entry controller took over mid-preparation and cannot say whether '
        + 'the step happened, and the rescue team leader is unreachable',
      affectedDecision: 'REQUIRED_CONTROL',
      branchA: 'a rescue plan was agreed for this entry and confirmed to the entry controller',
      decisionIfA: 'the fitter may enter under the controls already in place',
      branchB: 'no rescue plan was agreed for this entry, or it was not confirmed to the controller',
      decisionIfB: 'no entry until a rescue plan is agreed with the rescue team and confirmed',
      decisionWhileUnresolved: 'nobody enters the vessel until the rescue plan position is '
        + 'established',
      whyNecessaryNow: 'the fitter is at the manway and the entry is about to start',
    })],
    clarifications: [{
      clarificationId: 'T4-C1',
      question: 'Has the rescue team agreed a rescue plan for this vessel entry and confirmed it to '
        + 'the entry controller?',
      affectedDecision: 'REQUIRED_CONTROL', boundToDeclarationId: 'T4-D1',
    }],
    declarationQuality: 'CORRECT_ACT_AS_PROPERTY',
    correctOwedProperty: 'whether the rescue plan for this entry has been agreed and confirmed — '
      + 'the act itself',
    requiredOutcome: 'ACCEPT_THE_PROPERTY_UNCHANGED',
    perfectKnowledgeTest: 'perfect sight of the vessel and its atmosphere would NOT settle this. '
      + 'The decision still turns on whether the agreement and the confirmation happened, so the '
      + 'act IS the property.',
    satisfactoryUnestablishedWorldBelongsTo: 'NO_SUCH_WORLD_ACT_IS_PROPERTY',
    hardFailuresIfWrong: ['HF-2'],
    establishedByTheObservation: [
      'that the vessel has been cleaned',
      'that the atmosphere was tested at the manway and read clear',
      'that the agitator is isolated and locked',
      'that the fitter is trained and harnessed',
    ],
    providerCalls: 1,
    evaluationQuestions: [
      { id: 'T4.Q1', capability: 'V3_ACT_AS_PROPERTY_NARROWING', mandatory: true,
        question: 'MANDATORY. Did the verifier LEAVE the act-shaped property intact rather than '
          + 'challenging it for containing process language?', expected: 'PASS' },
      { id: 'T4.Q2', capability: 'V3_ACT_AS_PROPERTY_NARROWING', mandatory: true,
        question: 'MANDATORY. Did it avoid converting the property into a physical state such as '
          + 'the atmosphere or the isolation?', expected: 'PASS' },
      { id: 'T4.Q3', capability: 'V1_EXACT_PROPERTY_IDENTITY', mandatory: false,
        question: 'Did it avoid raising the already-established atmosphere, isolation, cleaning or '
          + 'training as owed facts?', expected: 'PASS: not raised' },
    ],
  },

  // ============================================================ T5
  {
    caseId: 'T5',
    mechanism: 'an adjacent property close enough to substitute for the owed one',
    primaryCapabilities: ['V8_ADJACENT_FACT_DRIFT', 'V1_EXACT_PROPERTY_IDENTITY'],
    observation:
      'An ammonia refrigeration plant room at a food factory has a fixed gas detection head above '
      + 'the compressors and an emergency ventilation fan in the far wall. The detection head was '
      + 'swapped last week for a new one and the engineer who fitted it has gone. The fan runs when '
      + 'the test button on the panel is pressed. A maintenance fitter is about to go in and break '
      + 'into the oil drain line.',
    suppliedContext: { location: 'food factory, ammonia refrigeration plant room',
      task: 'breaking into an oil drain line on an ammonia compressor' },
    jurisdiction: 'osha-general-industry',
    decisionUnderAnalysis: 'whether the fitter may break into the oil drain line now',
    declarations: [d({
      declarationId: 'T5-D1',
      missingFact: 'whether the replacement gas detection head will actually alarm on an ammonia '
        + 'release at the compressors',
      observationSpan: 'The detection head was swapped last week for a new one and the engineer who '
        + 'fitted it has gone',
      notEstablishedBecause: 'the text records that the head was replaced and that the fitting '
        + 'engineer is unavailable; it does not state whether the new head alarms on release',
      affectedDecision: 'REQUIRED_CONTROL',
      branchA: 'the replacement head alarms on an ammonia release at the compressors',
      decisionIfA: 'the work may proceed with the detection relied on as a control',
      branchB: 'the replacement head does not alarm on release',
      decisionIfB: 'do not break the line until detection is proved or continuous attendance and '
        + 'monitoring are in place',
      decisionWhileUnresolved: 'do not break the line while the detection response is unestablished',
      whyNecessaryNow: 'the fitter is about to break into a line carrying ammonia',
    })],
    clarifications: [
      { clarificationId: 'T5-C1',
        question: 'Does the emergency ventilation fan start automatically on a gas alarm, rather '
          + 'than only on the panel test button?',
        affectedDecision: 'REQUIRED_CONTROL', boundToDeclarationId: null },
      { clarificationId: 'T5-C2',
        question: 'Has the replacement detection head been bump tested or gas checked since it was '
          + 'fitted, and what did it read?',
        affectedDecision: 'REQUIRED_CONTROL', boundToDeclarationId: 'T5-D1' },
    ],
    declarationQuality: 'CORRECT',
    correctOwedProperty: 'whether the replacement gas detection head will actually alarm on an '
      + 'ammonia release at the compressors',
    requiredOutcome: 'ACCEPT_THE_PROPERTY_UNCHANGED',
    perfectKnowledgeTest: 'if the head\'s response to gas could simply be seen, this entry would be '
      + 'settled. The bump test is how you find out.',
    satisfactoryUnestablishedWorldBelongsTo: 'BRANCH_A',
    hardFailuresIfWrong: ['HF-3'],
    establishedByTheObservation: [
      'that the fan runs when the panel test button is pressed',
      'that the head was replaced last week',
    ],
    providerCalls: 1,
    evaluationQuestions: [
      { id: 'T5.Q1', capability: 'V8_ADJACENT_FACT_DRIFT', mandatory: true,
        question: 'MANDATORY. Did the verifier stay on the detection head, rather than resolving '
          + 'the ventilation-fan property that the unbound clarification T5-C1 raises?',
        expected: 'PASS' },
      { id: 'T5.Q2', capability: 'V1_EXACT_PROPERTY_IDENTITY', mandatory: true,
        question: 'MANDATORY. Did it accept the declared property as correct rather than '
          + 'substituting the neighbour?', expected: 'PASS' },
      { id: 'T5.Q3', capability: 'V6_CLARIFICATION_SUFFICIENCY', mandatory: false,
        question: 'Did it treat T5-C2, which asks for the reading, as capable of settling the '
          + 'property?', expected: 'PASS' },
    ],
  },

  // ============================================================ T6
  {
    caseId: 'T6',
    mechanism: 'two independent unresolved facts on one observation',
    primaryCapabilities: ['V9_MULTI_FACT_ISOLATION', 'V8_ADJACENT_FACT_DRIFT'],
    observation:
      'A terraced end property is being demolished by machine down to slab. The party wall with the '
      + 'neighbouring house is exposed and the joist pockets have been cut out on the demolition '
      + 'side, but nothing on site records whether the wall was independently propped before that '
      + 'was done. Separately, the refurbishment asbestos survey in the site file covers the ground '
      + 'and first floors and does not mention the roof void, which the machine will open next. The '
      + 'operator is in the cab and the neighbours are at home.',
    suppliedContext: { location: 'terraced end property, machine demolition to slab',
      task: 'machine demolition adjacent to an occupied party wall, opening a roof void' },
    jurisdiction: 'osha-general-industry',
    decisionUnderAnalysis: 'whether machine demolition may continue on this elevation now',
    declarations: [
      d({
        declarationId: 'T6-D1',
        missingFact: 'whether the party wall is independently supported now that the joist pockets '
          + 'have been cut out on the demolition side',
        observationSpan: 'nothing on site records whether the wall was independently propped before '
          + 'that was done',
        notEstablishedBecause: 'the site records do not state whether propping was installed, and '
          + 'the text does not describe any support to the wall',
        affectedDecision: 'HAZARD_EXISTENCE',
        branchA: 'the party wall is independently supported and stable without the removed joists',
        decisionIfA: 'machine demolition may continue on this elevation',
        branchB: 'the party wall relies on the removed joists and is not independently supported',
        decisionIfB: 'stop machine work on this elevation and prop the wall before continuing',
        decisionWhileUnresolved: 'no machine work within reach of the party wall, and the '
          + 'neighbouring property is kept clear of it, until the support position is established',
        whyNecessaryNow: 'the operator is in the cab and the neighbours are at home',
      }),
      d({
        declarationId: 'T6-D2',
        missingFact: 'whether asbestos-containing materials are present in the roof void the '
          + 'machine will open next',
        observationSpan: 'covers the ground and first floors and does not mention the roof void',
        notEstablishedBecause: 'the survey in the file does not extend to the roof void, so nothing '
          + 'supplied states what is in it',
        affectedDecision: 'HAZARD_EXISTENCE',
        branchA: 'the roof void contains no asbestos-containing material',
        decisionIfA: 'the void may be opened by machine as planned',
        branchB: 'the roof void contains asbestos-containing material',
        decisionIfB: 'stop before the void is opened and have it surveyed and removed under '
          + 'controlled conditions',
        decisionWhileUnresolved: 'the roof void is not opened while its asbestos position is '
          + 'unestablished',
        whyNecessaryNow: 'the roof void is the next thing the machine will reach',
      }),
    ],
    clarifications: [
      { clarificationId: 'T6-C1',
        question: 'What independent support is in place to the party wall now that the joist '
          + 'pockets are cut out?',
        affectedDecision: 'HAZARD_EXISTENCE', boundToDeclarationId: 'T6-D1' },
      { clarificationId: 'T6-C2',
        question: 'Does a refurbishment or demolition survey cover the roof void, and what did it '
          + 'find?',
        affectedDecision: 'HAZARD_EXISTENCE', boundToDeclarationId: 'T6-D2' },
    ],
    declarationQuality: 'CORRECT',
    correctOwedProperty: 'two independent properties: party-wall support, and asbestos in the roof '
      + 'void',
    requiredOutcome: 'ACCEPT_THE_PROPERTY_UNCHANGED',
    perfectKnowledgeTest: 'both are physical states that direct sight would settle. Neither is an '
      + 'act.',
    satisfactoryUnestablishedWorldBelongsTo: 'BRANCH_A',
    hardFailuresIfWrong: ['HF-3'],
    establishedByTheObservation: [
      'that the joist pockets have been cut out on the demolition side',
      'that the survey in the file covers the ground and first floors',
    ],
    providerCalls: 2,
    evaluationQuestions: [
      { id: 'T6.Q1', capability: 'V9_MULTI_FACT_ISOLATION', mandatory: true,
        question: 'MANDATORY. On the party-wall call, did the verifier address ONLY the party-wall '
          + 'property and leave the asbestos property untouched?', expected: 'PASS' },
      { id: 'T6.Q2', capability: 'V9_MULTI_FACT_ISOLATION', mandatory: true,
        question: 'MANDATORY. On the asbestos call, did it address ONLY the asbestos property?',
        expected: 'PASS' },
      { id: 'T6.Q3', capability: 'V8_ADJACENT_FACT_DRIFT', mandatory: false,
        question: 'Did either call import the sibling\'s clarification or decision into its own '
          + 'reasoning?', expected: 'PASS: not imported' },
      { id: 'T6.Q4', capability: 'V7_DECISION_WHILE_UNRESOLVED', mandatory: false,
        question: 'Did each call receive and retain its OWN decisionWhileUnresolved, without '
          + 'cross-binding?', expected: 'PASS' },
    ],
  },

  // ============================================================ T7
  {
    caseId: 'T7',
    mechanism: 'a clarification that gathers evidence and cannot settle the property',
    primaryCapabilities: ['V6_CLARIFICATION_SUFFICIENCY'],
    observation:
      'A hospital plant room has a ventilation duct passing through the compartment wall into the '
      + 'ward corridor. A fire damper is fitted in the duct at the wall and the access hatch beside '
      + 'it is screwed shut. The maintenance file records a visual check of the hatch position last '
      + 'year and no drop test. The estates team are about to sign the plant room back into service '
      + 'after a refit.',
    suppliedContext: { location: 'hospital plant room, ventilation duct at a compartment wall',
      task: 'returning a plant room to service after a refit' },
    jurisdiction: 'osha-general-industry',
    decisionUnderAnalysis: 'whether the plant room may be signed back into service now',
    declarations: [d({
      declarationId: 'T7-D1',
      missingFact: 'whether the fire damper in the duct at the compartment wall will close on a '
        + 'fire signal',
      observationSpan: 'records a visual check of the hatch position last year and no drop test',
      notEstablishedBecause: 'the file records only that the hatch position was looked at; it does '
        + 'not state whether the damper closes',
      affectedDecision: 'REQUIRED_CONTROL',
      branchA: 'the damper closes fully on a fire signal and maintains the compartment',
      decisionIfA: 'the plant room may be signed back into service',
      branchB: 'the damper will not close, or will not close fully, so the compartment is breached '
        + 'in a fire',
      decisionIfB: 'do not sign the plant room back into service until the damper is proved or the '
        + 'duct is sealed',
      decisionWhileUnresolved: 'the plant room stays out of service while the damper response is '
        + 'unestablished',
      whyNecessaryNow: 'the estates team are about to sign the room back into service',
    })],
    clarifications: [{
      clarificationId: 'T7-C1',
      question: 'Is a fire damper fitted in the duct where it passes through the compartment wall?',
      affectedDecision: 'REQUIRED_CONTROL', boundToDeclarationId: 'T7-D1',
    }],
    declarationQuality: 'CORRECT_PROPERTY_INSUFFICIENT_CLARIFICATION',
    correctOwedProperty: 'whether the fire damper will close on a fire signal',
    requiredOutcome: 'ACCEPT_THE_PROPERTY_AND_REPLACE_THE_CLARIFICATION',
    perfectKnowledgeTest: 'the property is a functional state that a drop test settles. The '
      + 'clarification asks about PRESENCE, which the observation already establishes, so a "yes" '
      + 'answer changes nothing.',
    satisfactoryUnestablishedWorldBelongsTo: 'BRANCH_A',
    hardFailuresIfWrong: ['HF-5'],
    establishedByTheObservation: [
      'that a fire damper is fitted in the duct at the wall',
      'that the access hatch is screwed shut',
      'that no drop test is recorded',
    ],
    providerCalls: 1,
    evaluationQuestions: [
      { id: 'T7.Q1', capability: 'V6_CLARIFICATION_SUFFICIENCY', mandatory: true,
        question: 'MANDATORY. Did the verifier identify that answering T7-C1 could not settle '
          + 'whether the damper closes, because presence is already established?',
        expected: 'PASS' },
      { id: 'T7.Q2', capability: 'V1_EXACT_PROPERTY_IDENTITY', mandatory: true,
        question: 'MANDATORY. Did it leave the PROPERTY intact and act on the question instead? '
          + 'Narrowing the property to match the weak question is the destructive repair.',
        expected: 'PASS' },
      { id: 'T7.Q3', capability: 'V6_CLARIFICATION_SUFFICIENCY', mandatory: false,
        question: 'If it proposed a replacement, does the replacement seek the damper\'s response '
          + 'rather than its presence?', expected: 'PASS' },
    ],
  },

  // ============================================================ T8 -- CONTROL
  {
    caseId: 'T8',
    mechanism: 'a fully correct declaration. The false-positive control.',
    primaryCapabilities: ['V1_EXACT_PROPERTY_IDENTITY', 'V4_BRANCH_ALIGNMENT',
      'V7_DECISION_WHILE_UNRESOLVED'],
    observation:
      'A grain store on a farm has a mobile auger running off a tractor power take-off. The PTO '
      + 'guard is fitted over the shaft and turns freely with it, and the tractor is running at '
      + 'idle. The guard was refitted after a bearing change and nobody present saw whether the '
      + 'retaining chain was reconnected at the tractor end. A worker is about to move the auger '
      + 'spout by hand with the shaft turning.',
    suppliedContext: { location: 'farm grain store, tractor-driven mobile auger',
      task: 'repositioning an auger spout with the power take-off shaft turning' },
    jurisdiction: 'osha-general-industry',
    decisionUnderAnalysis: 'whether the worker may move the spout with the shaft turning',
    declarations: [d({
      declarationId: 'T8-D1',
      missingFact: 'whether the power take-off guard is restrained from rotating with the shaft',
      observationSpan: 'nobody present saw whether the retaining chain was reconnected at the '
        + 'tractor end',
      notEstablishedBecause: 'the text records that the guard turns freely with the shaft and that '
        + 'nobody saw the chain reconnected; it does not state whether the guard is restrained',
      affectedDecision: 'HAZARD_EXISTENCE',
      branchA: 'the guard is restrained and will not rotate with the shaft if touched',
      decisionIfA: 'the spout may be moved by hand with the shaft turning',
      branchB: 'the guard is unrestrained and will rotate with the shaft',
      decisionIfB: 'stop the shaft before the spout is touched, and reconnect the restraint',
      decisionWhileUnresolved: 'the shaft is stopped before anyone touches the auger, until the '
        + 'guard restraint is established',
      whyNecessaryNow: 'the worker is about to reach in with the shaft turning',
    })],
    clarifications: [{
      clarificationId: 'T8-C1',
      question: 'Is the power take-off guard retaining chain connected at the tractor end, and does '
        + 'the guard stay still when the shaft turns?',
      affectedDecision: 'HAZARD_EXISTENCE', boundToDeclarationId: 'T8-D1',
    }],
    declarationQuality: 'CORRECT',
    correctOwedProperty: 'whether the power take-off guard is restrained from rotating with the '
      + 'shaft',
    requiredOutcome: 'ACCEPT_THE_PROPERTY_UNCHANGED',
    perfectKnowledgeTest: 'direct sight of the chain and the guard would settle it. A physical '
      + 'state, correctly chosen.',
    satisfactoryUnestablishedWorldBelongsTo: 'BRANCH_A',
    hardFailuresIfWrong: ['HF-2'],
    establishedByTheObservation: [
      'that the guard is fitted over the shaft',
      'that the guard turns freely with the shaft',
      'that the tractor is running at idle',
    ],
    providerCalls: 1,
    evaluationQuestions: [
      { id: 'T8.Q1', capability: 'V1_EXACT_PROPERTY_IDENTITY', mandatory: true,
        question: 'MANDATORY. Did the verifier leave a correct declaration alone, rather than '
          + 'challenging or replacing it?', expected: 'PASS' },
      { id: 'T8.Q2', capability: 'V4_BRANCH_ALIGNMENT', mandatory: false,
        question: 'Did it confirm the branches partition the guard restraint itself?',
        expected: 'PASS' },
      { id: 'T8.Q3', capability: 'V7_DECISION_WHILE_UNRESOLVED', mandatory: false,
        question: 'Did it receive and retain decisionWhileUnresolved byte-exact?',
        expected: 'PASS' },
    ],
  },

  // ============================================================ T9
  {
    caseId: 'T9',
    mechanism: 'an unresolved action that presumes the satisfactory branch has been established',
    primaryCapabilities: ['V7_DECISION_WHILE_UNRESOLVED', 'V5_UNRESOLVED_STATE_CONTAINMENT'],
    observation:
      'A warehouse has a mezzanine edge protection rail along the pick face. One bay of the rail '
      + 'was taken out last week to land a pallet and put back the same day. The bolts are in and '
      + 'the rail looks in line. Nobody present can say whether the bolts were torqued or just run '
      + 'up by hand. Pickers are working along that face now.',
    suppliedContext: { location: 'warehouse mezzanine pick face, edge protection rail',
      task: 'order picking along a mezzanine edge' },
    jurisdiction: 'osha-general-industry',
    decisionUnderAnalysis: 'whether picking may continue along this face now',
    declarations: [d({
      declarationId: 'T9-D1',
      missingFact: 'whether the replaced bay of edge protection will hold a person leaning against '
        + 'it',
      observationSpan: 'Nobody present can say whether the bolts were torqued or just run up by hand',
      notEstablishedBecause: 'the text records the bolts are in and the rail looks in line, and '
        + 'that nobody can say how they were tightened',
      affectedDecision: 'HAZARD_EXISTENCE',
      branchA: 'the replaced bay will hold a person leaning against it',
      decisionIfA: 'picking continues along this face as it is',
      branchB: 'the replaced bay will not hold a person leaning against it',
      decisionIfB: 'stop picking along this face and make the rail good before it resumes',
      decisionWhileUnresolved: 'picking continues along the face on the basis that the rail is '
        + 'sound, since it is bolted and in line, until anyone says otherwise',
      whyNecessaryNow: 'pickers are working along that face now',
    })],
    clarifications: [{
      clarificationId: 'T9-C1',
      question: 'What torque was applied to the bolts on the replaced bay, or what does the bay do '
        + 'under a load test?',
      affectedDecision: 'HAZARD_EXISTENCE', boundToDeclarationId: 'T9-D1',
    }],
    declarationQuality: 'CORRECT_PROPERTY_INCOHERENT_UNRESOLVED_ACTION',
    correctOwedProperty: 'whether the replaced bay of edge protection will hold a person leaning '
      + 'against it',
    requiredOutcome: 'ACCEPT_THE_PROPERTY_AND_FLAG_THE_UNRESOLVED_ACTION',
    perfectKnowledgeTest: 'a physical state that direct examination would settle. The property is '
      + 'correct; the unresolved action is not.',
    satisfactoryUnestablishedWorldBelongsTo: 'BRANCH_A',
    hardFailuresIfWrong: ['HF-6', 'HF-4'],
    establishedByTheObservation: [
      'that the bolts are in and the rail looks in line',
      'that one bay was removed and replaced last week',
    ],
    providerCalls: 1,
    evaluationQuestions: [
      { id: 'T9.Q1', capability: 'V7_DECISION_WHILE_UNRESOLVED', mandatory: true,
        question: 'MANDATORY. Did the verifier identify that decisionWhileUnresolved proceeds as '
          + 'though branchA were established, which is exactly what is not known?',
        expected: 'PASS' },
      { id: 'T9.Q2', capability: 'V1_EXACT_PROPERTY_IDENTITY', mandatory: true,
        question: 'MANDATORY. Did it leave the PROPERTY and the branches intact, acting only on '
          + 'the unresolved action?', expected: 'PASS' },
      { id: 'T9.Q3', capability: 'V7_DECISION_WHILE_UNRESOLVED', mandatory: false,
        question: 'Did decisionWhileUnresolved reach the verifier at all, byte-exact?',
        expected: 'PASS — HF-6 if absent' },
    ],
  },

  // ============================================================ T10
  {
    caseId: 'T10',
    mechanism: 'the adverse branch absorbs "unestablished", so the satisfactory-but-unproven world '
      + 'drives a stop',
    primaryCapabilities: ['V5_UNRESOLVED_STATE_CONTAINMENT', 'V4_BRANCH_ALIGNMENT'],
    observation:
      'A theatre has a single-point suspension for a lighting truss over the stalls. The '
      + 'suspension eye is bolted through a steel beam in the roof void and was installed by a '
      + 'contractor who is no longer trading. There is no load calculation in the building file. '
      + 'The truss has been flown at this weight for six years without incident. The get-in crew '
      + 'are ready to fly it for tonight.',
    suppliedContext: { location: 'theatre roof void, single-point truss suspension',
      task: 'flying a lighting truss over an auditorium' },
    jurisdiction: 'osha-general-industry',
    decisionUnderAnalysis: 'whether the truss may be flown on this suspension tonight',
    declarations: [d({
      declarationId: 'T10-D1',
      missingFact: 'whether the suspension eye and its beam will carry the flown truss at this '
        + 'weight',
      observationSpan: 'There is no load calculation in the building file',
      notEstablishedBecause: 'the building file holds no load calculation and the installing '
        + 'contractor is no longer trading',
      affectedDecision: 'HAZARD_EXISTENCE',
      branchA: 'the suspension and its beam carry the truss at this weight with the required margin',
      decisionIfA: 'the truss may be flown as planned',
      branchB: 'the suspension is unproven, or does not carry the truss at this weight',
      decisionIfB: 'do not fly the truss until the suspension has been calculated or proof loaded',
      decisionWhileUnresolved: 'the truss is not flown over the stalls while the suspension '
        + 'capacity is unestablished',
      whyNecessaryNow: 'the get-in crew are ready to fly it for tonight',
    })],
    clarifications: [{
      clarificationId: 'T10-C1',
      question: 'What does a structural check or proof load of the suspension eye and beam give for '
        + 'this truss weight?',
      affectedDecision: 'HAZARD_EXISTENCE', boundToDeclarationId: 'T10-D1',
    }],
    declarationQuality: 'CORRECT_PROPERTY_ADVERSE_BRANCH_ABSORBS_UNCERTAINTY',
    correctOwedProperty: 'whether the suspension eye and its beam will carry the flown truss at '
      + 'this weight',
    requiredOutcome: 'ACCEPT_THE_PROPERTY_AND_FLAG_THE_ADVERSE_BRANCH',
    perfectKnowledgeTest: 'a physical capacity that a calculation or proof load settles. The '
      + 'property is right; branchB has absorbed the epistemic state.',
    satisfactoryUnestablishedWorldBelongsTo: 'BRANCH_A',
    hardFailuresIfWrong: ['HF-4'],
    establishedByTheObservation: [
      'that there is no load calculation in the building file',
      'that the truss has been flown at this weight for six years',
      'that the installing contractor is no longer trading',
    ],
    providerCalls: 1,
    evaluationQuestions: [
      { id: 'T10.Q1', capability: 'V5_UNRESOLVED_STATE_CONTAINMENT', mandatory: true,
        question: 'MANDATORY. Did the verifier identify that branchB\'s "unproven" disjunct puts '
          + 'the sound-but-uncalculated world on the adverse side?', expected: 'PASS' },
      { id: 'T10.Q2', capability: 'V5_UNRESOLVED_STATE_CONTAINMENT', mandatory: true,
        question: 'MANDATORY. Did it avoid concluding that the suspension IS inadequate? Holding '
          + 'the work is correct; asserting the adverse state is not.', expected: 'PASS' },
      { id: 'T10.Q3', capability: 'V4_BRANCH_ALIGNMENT', mandatory: false,
        question: 'Did it leave the property and decisionWhileUnresolved intact while acting on '
          + 'the branch?', expected: 'PASS' },
      { id: 'T10.Q4', capability: 'V1_EXACT_PROPERTY_IDENTITY', mandatory: false,
        question: 'Did it avoid treating six years without incident as establishing branchA?',
        expected: 'PASS' },
    ],
  },
];

// ---------------------------------------------------------------- coverage and cost

export function providerCallCount(): number {
  return VALIDATION_CASES.reduce((n, c) => n + c.providerCalls, 0);
}

/** Every capability must be a PRIMARY target of at least one case, or it is not being validated. */
export function capabilitiesCovered(): readonly TargetedCapability[] {
  const s = new Set<TargetedCapability>();
  for (const c of VALIDATION_CASES) for (const v of c.primaryCapabilities) s.add(v);
  return [...s].sort();
}

export function hardFailureCoverage(): Readonly<Record<HardFailureId, readonly string[]>> {
  const out: Record<string, string[]> = {};
  for (const h of HARD_FAILURE_CLASSES) out[h.id] = [];
  for (const c of VALIDATION_CASES) {
    for (const h of c.hardFailuresIfWrong) out[h].push(c.caseId);
  }
  return out as unknown as Readonly<Record<HardFailureId, readonly string[]>>;
}

/**
 * Cost, derived from the §208B AUTHORITATIVE verifier leg rather than assumed.
 *
 * §210A's token baseline records 24 verifier calls at median input 9,106, median output 732, total
 * USD 0.612072 over 217,911 input and 17,625 output tokens. Solving those two figures gives
 * USD 2.00 per million input and USD 10.00 per million output, and the same rates reproduce the
 * first-pass leg's recorded USD 1.69709 exactly. The rates are DERIVED FROM THE LEDGER, not looked
 * up.
 */
export const COST_BASIS = {
  source: 'verification/expert-hazlenz-210a-root-cause-and-token-blueprint-2026-09-08/'
    + 'TOKEN-BASELINE-210A.json — VERIFIER (§208B recovered, authoritative)',
  calls: 24,
  medianInputTokens: 9106,
  medianOutputTokens: 732,
  usdPerMillionInput: 2.0,
  usdPerMillionOutput: 10.0,
  ratesDerivedFrom: 'the recorded stage totals; the same rates reproduce the first-pass leg cost '
    + 'to the cent, which is the check that they are right',
} as const;

/**
 * The remediated payload and instruction are LARGER than what §208B measured, so the projection
 * must add them rather than quote the baseline. Every figure is an estimate and none is a
 * production cost claim.
 */
export const COST_DELTA_ASSUMPTIONS = {
  addedInputTokensPerCall: 830,
  breakdown: {
    elevenFieldPayload: 165,
    remitInstructionBlockRC: 525,
    vocabularySchemaRB: 140,
  },
  addedOutputTokensPerCall: 120,
  outputBreakdown: 'the property restatement and the challenge ground with its evidence',
  basis: 'measured byte counts for the §210J fields plus §210G-scale instruction blocks, converted '
    + 'at the repository\'s OBSERVED_BYTES_PER_TOKEN. An estimate, not a tokenizer result.',
} as const;

export function costProjection(): Record<string, number | string> {
  const calls = providerCallCount();
  const inPer = COST_BASIS.medianInputTokens + COST_DELTA_ASSUMPTIONS.addedInputTokensPerCall;
  const outPer = COST_BASIS.medianOutputTokens + COST_DELTA_ASSUMPTIONS.addedOutputTokensPerCall;
  const usd = (calls * inPer * COST_BASIS.usdPerMillionInput
    + calls * outPer * COST_BASIS.usdPerMillionOutput) / 1_000_000;
  const ceiling = Math.ceil(usd * 1.35 * 100) / 100;
  return {
    providerCalls: calls,
    projectedInputTokensPerCall: inPer,
    projectedOutputTokensPerCall: outPer,
    projectedTotalInputTokens: calls * inPer,
    projectedTotalOutputTokens: calls * outPer,
    projectedUsd: Number(usd.toFixed(4)),
    recommendedCeilingUsd: ceiling,
    ceilingBasis: '35% headroom over the projection, covering per-case observation length variance '
      + 'and one transport retry. A ceiling is a spend guard, not a prediction.',
    retriesAuthorized: 0,
    semanticRetriesAuthorized: 0,
  };
}

// ---------------------------------------------------------------- execution preconditions

/**
 * What must exist before ONE call is made. The instrument is frozen against the remediated verifier,
 * not against today's.
 */
export const EXECUTION_PRECONDITIONS = {
  remediationsRequired: [...REMEDIATION_IDS],
  executableAgainstTodaysVerifier: false,
  whyNot: 'the exact property is not in the payload, the verifier is not asked about it, and a '
    + 'property-collapse finding has no declaration or challenge ground to land in. A clean result '
    + 'from today\'s verifier would measure a verifier that was never asked the question.',
  alsoRequired: [
    'a preregistration frozen by sha256 before the first call, as §207 and §210H were',
    'a transport canary on one row before the cohort, the §199 pattern that worked and cost one call',
    'product-owner execution authorization naming the ceiling',
  ],
} as const;

/** Recorded so no reader mistakes this for acceptance. */
export const ACCEPTANCE_CHARACTER = {
  kind: 'DEVELOPMENT_VALIDATION',
  isExpertAcceptance: false,
  isProductionValidation: false,
  aggregatePercentageReported: false,
  reachingTheDenominatorMeans: 'INSTRUMENT_COMPLETION_ONLY',
} as const;
