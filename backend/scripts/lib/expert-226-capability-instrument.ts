/**
 * §226 -- FIRST-PASS SEMANTIC PROPERTY INSTRUMENT. VALIDATION ONLY.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NOT IMPORTED BY ANY RUNTIME OR PROJECTION PATH.
 *
 * ==================== WHAT THIS INSTRUMENT CAN AND CANNOT ESTABLISH ====================
 *
 * It makes no provider call, so per HAZLENZ_INVARIANTS 27 it establishes NOTHING about how a model
 * will behave. A contract change is never evidence that a behavioural defect is repaired.
 *
 * What it CAN establish is CONTRACT DISCRIMINATION, and §225 sharpened what that has to mean here.
 * §225's remaining failures were not cases where the §224 contract permitted the wrong answer. GATE
 * 13 forbids the H2 and H3 substitutions in terms. They failed because EVERY §224 RULE IS KEYED ON
 * AN ENUMERATION THE MODEL MUST FIRST PLACE ITSELF INTO, and a model that does not place itself
 * there never evaluates the rule at all. So the question this instrument asks is not only "does the
 * contract forbid this output" but "DOES THE CONTRACT'S OWN STATED RULE REACH THIS OUTPUT":
 *
 *   - does the declaration trigger reach a candidate the model labelled ACTIVE?
 *   - does the property rule reach a substitution nobody enumerated in advance?
 *   - does the artifact carve-out exist at all?
 *
 * A deny-list rule is bypassed by falling outside the list. An unconditional test is not. That
 * difference is what is scored here, per case, under both contracts.
 *
 * ==================== HOW SCORING WORKS AND WHAT IT NEVER DOES ====================
 *
 * The evaluator scores AUTHORED FIXTURES against PREREGISTERED TRUTH, exactly as the §207, §221 and
 * §224 instruments do. Every comparison is a deterministic token overlap over preregistered strings,
 * and every score is reported alongside its verdict so a reader checks the classification rather
 * than trusting it. Nothing here infers safety meaning, reconstructs a declaration, repairs an
 * output or selects a property. It lives in the harness, is imported by no runtime module, and
 * never runs against live provider output.
 *
 * ==================== PREREGISTRATION ====================
 *
 * Every case, every owed property, every prohibited near neighbour and every per-measure expected
 * verdict UNDER BOTH CONTRACTS is authored before the §226 remediation is evaluated, checked by
 * `preflight226` and frozen by the digest in SECTION-226-LOCAL-INSTRUMENT.json. Per
 * HAZLENZ_INVARIANTS 21, nothing here may be revised after a result is seen. The §224 instrument's
 * authoring defect -- a frozen expectation table that understated which measures a case exercises --
 * is what the preflight exists to prevent recurring.
 */

export const INSTRUMENT_226_VERSION = 'hazlenz.expert.226.semantic-property.v1' as const;

/** Seven measures. Each is reported separately; none may be averaged into another. */
export const MEASURES_226 = [
  'DECLARATION_RECALL',
  'PROPERTY_IDENTITY',
  'INDEPENDENCE',
  'RESTRAINT',
  'REQUIRED_ACT_CONTROL',
  'REQUIRED_ARTIFACT_CONTROL',
  'CANDIDATE_STATE_BYPASS',
] as const;
export type Measure226 = typeof MEASURES_226[number];

export const AGGREGATE_SCORE_PERMITTED = false;

export type Verdict226 = 'COMPLIANT' | 'DEFECTIVE' | 'NOT_EXERCISED';

/** The kinds a declared property can be, and the kinds a near neighbour can be. Closed sets. */
export const OWED_KINDS = ['HAZARD_STATE', 'REQUIRED_ACT', 'REQUIRED_ARTIFACT'] as const;
export type OwedKind = typeof OWED_KINDS[number];

export const PROHIBITED_KINDS = [
  'CONTROL_STATE',
  'EVIDENCE_PROXY',
  'VERIFICATION_ACT',
  'DOCUMENT',
  'PROCESS_STEP',
  'ADJACENT_CONDITION',
  'ADJACENT_PROPERTY',
  /** §226-specific: the act a required artifact records. Over-correction BENEATH the artifact. */
  'UNDERLYING_ACT_BENEATH_ARTIFACT',
] as const;
export type ProhibitedKind = typeof PROHIBITED_KINDS[number];

/** A candidate as the first pass emits it, reduced to the fields this instrument reads. */
export interface CandidateFixture226 {
  readonly candidateKey: string;
  readonly assertedConditionState:
  'ACTIVE' | 'CONTROLLED' | 'CORRECTED' | 'REMOVED_FROM_SERVICE' | 'NEGATED' | 'HYPOTHETICAL'
  | 'INSUFFICIENT_EVIDENCE' | 'UNKNOWN';
  readonly confidence: 'LOW' | 'MODERATE' | 'HIGH';
  readonly requiresUserConfirmation: boolean;
  readonly reasoning: string;
  /** PREREGISTERED: which owed property this candidate is the model's own handle on, if any. */
  readonly carriesOwedPropertyKey: string | null;
  /** PREREGISTERED: does this candidate bear materially on the decision under analysis? */
  readonly materialToDecision: boolean;
  /** PREREGISTERED: does the candidate's own reasoning say a needed fact is not established? */
  readonly reasoningNamesUnestablishedFact: boolean;
}

/** A declaration as the first pass emits it, reduced to the fields this instrument reads. */
export interface DeclarationFixture226 {
  readonly declarationId: string;
  readonly missingFact: string;
  readonly affectedDecision: string;
  readonly branchA: string;
  readonly branchB: string;
  readonly decisionIfA: string;
  readonly decisionIfB: string;
  /**
   * PREREGISTERED: which owed property this entry is an ATTEMPT at. This is what keeps RECALL and
   * PROPERTY_IDENTITY independent measures, as §225 scored them: an entry emitted for the owed gap
   * discharges recall even when it names the wrong property, and the property identity measure
   * carries that failure on its own. Coupling the two would let one gate compensate for another,
   * which HAZLENZ_INVARIANTS 22 forbids. Null only on a restraint fixture that emits nothing.
   */
  readonly attemptsOwedPropertyKey: string | null;
}

export interface OutputFixture226 {
  readonly candidates: readonly CandidateFixture226[];
  readonly clarificationCount: number;
  readonly declarations: readonly DeclarationFixture226[];
  readonly uncertaintyStatements: readonly string[];
  readonly summary: string;
}

export interface OwedProperty226 {
  readonly key: string;
  /** The proposition whose truth controls the decision. Not evidence about it. */
  readonly proposition: string;
  readonly kind: OwedKind;
  /** PREREGISTERED: why this is genuinely open on the supplied facts. Required, non-empty. */
  readonly whyGenuinelyOpen: string;
  /** Adjacent and proxy properties the first pass may reach for instead of this one. */
  readonly prohibited: readonly { readonly kind: ProhibitedKind; readonly text: string }[];
}

export interface Case226 {
  readonly caseId: string;
  readonly family: string;
  readonly observation: string;
  readonly decisionUnderAnalysis: string;
  /** PREREGISTERED: what the supplied facts DO establish. Nothing owed may appear here. */
  readonly establishedFacts: readonly string[];
  /** PREREGISTERED: the properties genuinely decision-controlling here. Empty means none owed. */
  readonly owedProperties: readonly OwedProperty226[];
  /** PREREGISTERED: real unknowns that bear on nothing decided today. Never owed. */
  readonly nonFacts: readonly string[];
  /** PREREGISTERED: why restraint is correct where nothing is owed; null where something is. */
  readonly restraintBasis: string | null;
  /** PREREGISTERED: how many entries the frozen truth owes. Must equal owedProperties.length. */
  readonly expectedDeclarationCount: number;
  /** PREREGISTERED: the exact controlling properties, by key. */
  readonly expectedControllingPropertyKeys: readonly string[];
  readonly requiredActSemanticsApply: boolean;
  readonly requiredArtifactSemanticsApply: boolean;
  /** PREREGISTERED: how many entries this fixture actually emits. Guards fixture drift. */
  readonly emittedDeclarationCount: number;
  /** PREREGISTERED: is this a case whose owed property sits under a self-reported-settled label? */
  readonly isCandidateStateBypassCase: boolean;
  readonly output: OutputFixture226;
  readonly outputProvenance: 'AUTHORED_FOR_THIS_INSTRUMENT';
  /** PREREGISTERED per contract. Every measure, every case. No axis may be left unstated. */
  readonly expectedUnder224: Readonly<Record<Measure226, Verdict226>>;
  readonly expectedUnder226: Readonly<Record<Measure226, Verdict226>>;
  /** PREREGISTERED: which §226 root cause this case exercises, if any. */
  readonly exercisesRootCause: 'RC5' | 'RC6' | 'RC7' | null;
}

// ---------------------------------------------------------------- the ten cases

const NONE_226: Readonly<Record<Measure226, Verdict226>> = {
  DECLARATION_RECALL: 'NOT_EXERCISED',
  PROPERTY_IDENTITY: 'NOT_EXERCISED',
  INDEPENDENCE: 'NOT_EXERCISED',
  RESTRAINT: 'NOT_EXERCISED',
  REQUIRED_ACT_CONTROL: 'NOT_EXERCISED',
  REQUIRED_ARTIFACT_CONTROL: 'NOT_EXERCISED',
  CANDIDATE_STATE_BYPASS: 'NOT_EXERCISED',
};

export const CASES_226: readonly Case226[] = [
  // ---------------------------------------------------------------- RC5, bypass under ACTIVE
  {
    caseId: 'L1-BYPASS-ACTIVE',
    family: 'candidate-state bypass',
    observation: 'A trench 1.8 metres deep has been dug across a yard to lay a duct. The sides are '
      + 'unsupported and two operatives are working at the bottom. Spoil is heaped along one edge. '
      + 'The yard was built up years ago with imported fill; nobody on site can say what the fill '
      + 'is and no ground investigation record is held.',
    decisionUnderAnalysis: 'whether the two operatives may continue working in the trench today, '
      + 'and under what support',
    establishedFacts: [
      'the trench is 1.8 metres deep',
      'the sides are unsupported',
      'two operatives are working at the bottom of the trench',
      'spoil is heaped along one edge',
      'no ground investigation record is held',
    ],
    owedProperties: [{
      key: 'L1-P1',
      proposition: 'whether the sides of this trench will stand unsupported at this depth in this '
        + 'ground',
      kind: 'HAZARD_STATE',
      whyGenuinelyOpen: 'The fill is of unstated composition and nobody present can identify it. '
        + 'Whether the sides will stand turns on that composition, and the supplied facts neither '
        + 'state it nor state anything from which it follows. Which support system is required '
        + 'differs materially between the answers.',
      prohibited: [
        { kind: 'CONTROL_STATE', text: 'whether trench support has been installed' },
        { kind: 'VERIFICATION_ACT', text: 'whether the ground conditions have been assessed' },
        { kind: 'DOCUMENT', text: 'whether a ground investigation report can be produced' },
      ],
    }],
    nonFacts: [
      'which contractor originally built up the yard',
      'how long the duct run will take to complete',
    ],
    restraintBasis: null,
    expectedDeclarationCount: 1,
    expectedControllingPropertyKeys: ['L1-P1'],
    requiredActSemanticsApply: false,
    requiredArtifactSemanticsApply: false,
    emittedDeclarationCount: 0,
    isCandidateStateBypassCase: true,
    output: {
      candidates: [
        {
          candidateKey: 'cand-unsupported-sides', assertedConditionState: 'ACTIVE',
          confidence: 'HIGH', requiresUserConfirmation: false,
          reasoning: 'Operatives are working below ground level beside unsupported faces with '
            + 'surcharge from heaped spoil. This is a present collapse exposure.',
          carriesOwedPropertyKey: null, materialToDecision: true,
          reasoningNamesUnestablishedFact: false,
        },
        {
          candidateKey: 'cand-ground-conditions', assertedConditionState: 'ACTIVE',
          confidence: 'HIGH', requiresUserConfirmation: false,
          reasoning: 'The yard is made ground of unstated composition, which cannot be relied upon '
            + 'to judge whether the unsupported sides will hold at this depth.',
          carriesOwedPropertyKey: 'L1-P1', materialToDecision: true,
          reasoningNamesUnestablishedFact: true,
        },
      ],
      clarificationCount: 0,
      declarations: [],
      uncertaintyStatements: [],
      summary: 'An unsupported excavation with people working in it and spoil surcharging one '
        + 'edge. The collapse hazard is active and the work should stop until support is provided.',
    },
    outputProvenance: 'AUTHORED_FOR_THIS_INSTRUMENT',
    expectedUnder224: {
      ...NONE_226,
      DECLARATION_RECALL: 'COMPLIANT',
      CANDIDATE_STATE_BYPASS: 'DEFECTIVE',
    },
    expectedUnder226: {
      ...NONE_226,
      DECLARATION_RECALL: 'DEFECTIVE',
      CANDIDATE_STATE_BYPASS: 'COMPLIANT',
    },
    exercisesRootCause: 'RC5',
  },

  // ---------------------------------------------------------------- RC5, bypass under CONTROLLED
  {
    caseId: 'L2-BYPASS-CONTROLLED',
    family: 'candidate-state bypass',
    observation: 'A fabricator is MIG welding at a bench with an extraction arm positioned over '
      + 'the work. The arm is switched on and drawing. Both the wire and the parent plate are '
      + 'stainless. The extraction was commissioned for mild steel work only and the commissioning '
      + 'report says so; the shop moved to stainless six months ago and the system has not been '
      + 'looked at since.',
    decisionUnderAnalysis: 'whether this welder may continue working at this bench today, and '
      + 'under what respiratory control',
    establishedFacts: [
      'the extraction arm is switched on and drawing',
      'the arm is positioned over the work',
      'the wire and the parent plate are both stainless',
      'the extraction was commissioned for mild steel work only',
      'the system has not been looked at since the change to stainless six months ago',
    ],
    owedProperties: [{
      key: 'L2-P1',
      proposition: 'whether this extraction controls the chromium fume from stainless welding at '
        + 'this bench to a level that is safe to breathe',
      kind: 'HAZARD_STATE',
      whyGenuinelyOpen: 'The commissioning basis is stated and covers a different process. Nothing '
        + 'supplied states what the system achieves against the fume the current process produces. '
        + 'Whether respiratory protection is required turns on the answer.',
      prohibited: [
        { kind: 'CONTROL_STATE', text: 'whether the extraction arm is switched on and drawing' },
        {
          kind: 'VERIFICATION_ACT',
          text: 'whether the extraction has been re-tested since the change to stainless',
        },
        { kind: 'ADJACENT_PROPERTY', text: 'whether the welder is wearing eye and face protection' },
      ],
    }],
    nonFacts: [
      'which manufacturer supplied the extraction arm',
      'how many frames the fabricator expects to weld today',
    ],
    restraintBasis: null,
    expectedDeclarationCount: 1,
    expectedControllingPropertyKeys: ['L2-P1'],
    requiredActSemanticsApply: false,
    requiredArtifactSemanticsApply: false,
    emittedDeclarationCount: 0,
    isCandidateStateBypassCase: true,
    output: {
      candidates: [
        {
          candidateKey: 'cand-fume-extraction', assertedConditionState: 'CONTROLLED',
          confidence: 'HIGH', requiresUserConfirmation: false,
          reasoning: 'Local exhaust ventilation is in place, running and positioned over the work, '
            + 'so fume is being drawn away at source. The commissioning basis covers mild steel '
            + 'only, so what the system achieves against chromium fume from this process is not '
            + 'something the supplied facts settle.',
          carriesOwedPropertyKey: 'L2-P1', materialToDecision: true,
          reasoningNamesUnestablishedFact: true,
        },
        {
          candidateKey: 'cand-arc-eye', assertedConditionState: 'CONTROLLED', confidence: 'HIGH',
          requiresUserConfirmation: false,
          reasoning: 'Welding at a fixed bench with the operator using a helmet; no unshielded '
            + 'exposure is described.',
          carriesOwedPropertyKey: null, materialToDecision: false,
          reasoningNamesUnestablishedFact: false,
        },
      ],
      clarificationCount: 0,
      declarations: [],
      uncertaintyStatements: [],
      summary: 'Extraction is in place and operating at the bench, so fume is controlled at '
        + 'source. No decision-critical fact is missing.',
    },
    outputProvenance: 'AUTHORED_FOR_THIS_INSTRUMENT',
    expectedUnder224: {
      ...NONE_226,
      DECLARATION_RECALL: 'COMPLIANT',
      CANDIDATE_STATE_BYPASS: 'DEFECTIVE',
    },
    expectedUnder226: {
      ...NONE_226,
      DECLARATION_RECALL: 'DEFECTIVE',
      CANDIDATE_STATE_BYPASS: 'COMPLIANT',
    },
    exercisesRootCause: 'RC5',
  },

  // ---------------------------------------- RC6 control note: anticipated substitution, no regression
  {
    caseId: 'L3-CONTROL-STATE-ANTICIPATED',
    family: 'underlying state vs control-state proxy',
    observation: 'A sprayer is inside a spray booth applying two-pack primer to a tailgate. He is '
      + 'wearing overalls and gloves but no respirator. The extraction fan can be heard running '
      + 'and the booth door is closed. The airflow indicator gauge on the booth wall reads zero '
      + 'and the sprayer says it has read zero for months and that everyone ignores it. The '
      + 'filters were last changed at an unknown date and the booth log ends in March.',
    decisionUnderAnalysis: 'whether the sprayer may continue working in the booth as he is',
    establishedFacts: [
      'two-pack primer is being applied inside the booth',
      'the sprayer is wearing no respirator',
      'the extraction fan is audible and the booth door is closed',
      'the airflow indicator gauge reads zero and has done for months',
      'the booth log ends in March',
    ],
    owedProperties: [{
      key: 'L3-P1',
      proposition: 'whether the atmosphere inside this booth is safe to occupy without respiratory '
        + 'protection',
      kind: 'HAZARD_STATE',
      whyGenuinelyOpen: 'Nothing supplied states what is in the air the sprayer is breathing. The '
        + 'fan being audible does not state it, and the gauge reading zero does not state it '
        + 'either. Whether the work may continue at all turns on the answer.',
      prohibited: [
        { kind: 'CONTROL_STATE', text: 'whether the extraction system is moving sufficient air' },
        { kind: 'CONTROL_STATE', text: 'whether the airflow indicator gauge is working' },
        { kind: 'VERIFICATION_ACT', text: 'whether the booth airflow has been measured' },
        { kind: 'DOCUMENT', text: 'whether the booth log is up to date' },
      ],
    }],
    nonFacts: [
      'which supplier provided the primer',
      'how many tailgates are queued for the booth',
    ],
    restraintBasis: null,
    expectedDeclarationCount: 1,
    expectedControllingPropertyKeys: ['L3-P1'],
    requiredActSemanticsApply: false,
    requiredArtifactSemanticsApply: false,
    emittedDeclarationCount: 1,
    isCandidateStateBypassCase: false,
    output: {
      candidates: [
        {
          candidateKey: 'cand-isocyanate', assertedConditionState: 'INSUFFICIENT_EVIDENCE',
          confidence: 'MODERATE', requiresUserConfirmation: true,
          reasoning: 'Two-pack primer is sprayed without respiratory protection and the booth '
            + 'airflow indication is not usable.',
          carriesOwedPropertyKey: 'L3-P1', materialToDecision: true,
          reasoningNamesUnestablishedFact: true,
        },
      ],
      clarificationCount: 1,
      declarations: [{
        declarationId: 'DECL-1',
        missingFact: 'whether the extraction system is moving sufficient air through the booth',
        affectedDecision: 'REQUIRED_CONTROL',
        branchA: 'the fan and ductwork are functioning and moving the design airflow',
        branchB: 'the extraction is not moving the design airflow',
        decisionIfA: 'spraying may continue with the existing arrangements',
        decisionIfB: 'spraying stops until the extraction is restored',
        attemptsOwedPropertyKey: 'L3-P1',
      }],
      uncertaintyStatements: [],
      summary: 'The booth airflow indication is not usable and the extraction performance is not '
        + 'established.',
    },
    outputProvenance: 'AUTHORED_FOR_THIS_INSTRUMENT',
    expectedUnder224: {
      ...NONE_226,
      DECLARATION_RECALL: 'COMPLIANT',
      PROPERTY_IDENTITY: 'DEFECTIVE',
    },
    expectedUnder226: {
      ...NONE_226,
      DECLARATION_RECALL: 'COMPLIANT',
      PROPERTY_IDENTITY: 'DEFECTIVE',
    },
    exercisesRootCause: null,
  },

  // ---------------------------------------------- RC6, substitution nobody enumerated in advance
  {
    caseId: 'L4-SUBSTITUTION-UNANTICIPATED',
    family: 'underlying state vs an adjacent property outside the deny list',
    observation: 'A 240 volt submersible pump is clearing standing water from a wash bay floor '
      + 'drain. The operator is standing in the water while the pump runs. The lead and plug look '
      + 'sound with no cuts or scorching and the pump body is undamaged. There is no test label on '
      + 'the pump and the maintenance office has no record of it ever being tested. The supply is a '
      + 'wall socket in the wash bay and nobody on site can say whether that circuit has residual '
      + 'current protection.',
    decisionUnderAnalysis: 'whether the pump may continue to be used in the wash bay today',
    establishedFacts: [
      'a 240 volt submersible pump is running in standing water',
      'the operator is standing in the water',
      'the lead, plug and pump body are visually sound',
      'there is no test label and no maintenance record of any test',
      'nobody can say whether the wash bay socket circuit has residual current protection',
    ],
    owedProperties: [{
      key: 'L4-P1',
      proposition: 'whether this appliance is in a condition safe to use in a wet location',
      kind: 'HAZARD_STATE',
      whyGenuinelyOpen: 'A visual check of the lead and body is stated and establishes only what '
        + 'it says. Nothing supplied states the insulation condition, the earth continuity or the '
        + 'suitability of this pump for submerged use with a person standing in the water. Whether '
        + 'the work may continue at all turns on the answer.',
      prohibited: [
        {
          kind: 'DOCUMENT',
          text: 'whether a portable appliance test record exists for the pump',
        },
        { kind: 'VERIFICATION_ACT', text: 'whether the pump has been tested' },
      ],
    }],
    nonFacts: [
      'who last used the pump before today',
      'how much water is left to clear',
    ],
    restraintBasis: null,
    expectedDeclarationCount: 1,
    expectedControllingPropertyKeys: ['L4-P1'],
    requiredActSemanticsApply: false,
    requiredArtifactSemanticsApply: false,
    emittedDeclarationCount: 1,
    isCandidateStateBypassCase: false,
    output: {
      candidates: [
        {
          candidateKey: 'cand-electric-shock', assertedConditionState: 'INSUFFICIENT_EVIDENCE',
          confidence: 'MODERATE', requiresUserConfirmation: true,
          reasoning: 'Mains equipment in use in standing water with an operator in contact with '
            + 'that water.',
          carriesOwedPropertyKey: 'L4-P1', materialToDecision: true,
          reasoningNamesUnestablishedFact: true,
        },
      ],
      clarificationCount: 1,
      declarations: [{
        declarationId: 'DECL-1',
        missingFact: 'whether the wash bay socket circuit is protected by a functioning residual '
          + 'current device',
        affectedDecision: 'REQUIRED_CONTROL',
        branchA: 'the circuit has functioning residual current protection',
        branchB: 'the circuit has no residual current protection',
        decisionIfA: 'pumping may continue with the operator out of the water',
        decisionIfB: 'pumping stops until a protected supply is arranged',
        attemptsOwedPropertyKey: 'L4-P1',
      }],
      uncertaintyStatements: [],
      summary: 'Mains equipment is in use in water and the protection on the supply circuit is not '
        + 'established.',
    },
    outputProvenance: 'AUTHORED_FOR_THIS_INSTRUMENT',
    expectedUnder224: {
      ...NONE_226,
      DECLARATION_RECALL: 'COMPLIANT',
      PROPERTY_IDENTITY: 'COMPLIANT',
    },
    expectedUnder226: {
      ...NONE_226,
      DECLARATION_RECALL: 'COMPLIANT',
      PROPERTY_IDENTITY: 'DEFECTIVE',
    },
    exercisesRootCause: 'RC6',
  },

  // ---------------------------------------------------------------- required act, over-correction guard
  {
    caseId: 'L5-REQUIRED-ACT-LEGITIMATE',
    family: 'legitimate required act',
    observation: 'An operative is about to enter a mixer vessel under a confined space permit. The '
      + 'permit requires two isolations before entry: the drive locked off, and the product line '
      + 'positively isolated and proved at the bleed. The drive is locked and tagged. The product '
      + 'line valve is shut and padlocked. The permit box for the proving step at the bleed is '
      + 'blank and nobody present can say whether the proving was carried out before the earlier '
      + 'entry this morning.',
    decisionUnderAnalysis: 'whether this operative may enter the vessel now',
    establishedFacts: [
      'the drive is locked off and tagged',
      'the product line valve is shut and padlocked',
      'the permit requires the product line to be positively isolated and proved at the bleed',
      'the permit box for the proving step is blank',
    ],
    owedProperties: [{
      key: 'L5-P1',
      proposition: 'whether the second isolation was applied and proved at the bleed before entry',
      kind: 'REQUIRED_ACT',
      whyGenuinelyOpen: 'The permit makes the proving act the precondition for entry. A shut and '
        + 'padlocked valve is stated and is not that act. Nobody present can say whether the act '
        + 'was carried out, and entry is permitted or refused on the answer.',
      prohibited: [
        { kind: 'DOCUMENT', text: 'whether the permit box has been filled in' },
        { kind: 'ADJACENT_PROPERTY', text: 'whether the drive is locked off and tagged' },
      ],
    }],
    nonFacts: [
      'how long the earlier entry this morning lasted',
      'what the vessel last contained',
    ],
    restraintBasis: null,
    expectedDeclarationCount: 1,
    expectedControllingPropertyKeys: ['L5-P1'],
    requiredActSemanticsApply: true,
    requiredArtifactSemanticsApply: false,
    emittedDeclarationCount: 1,
    isCandidateStateBypassCase: false,
    output: {
      candidates: [
        {
          candidateKey: 'cand-stored-energy', assertedConditionState: 'INSUFFICIENT_EVIDENCE',
          confidence: 'MODERATE', requiresUserConfirmation: true,
          reasoning: 'Entry is imminent and one of the two isolations the permit requires has no '
            + 'record of having been proved.',
          carriesOwedPropertyKey: 'L5-P1', materialToDecision: true,
          reasoningNamesUnestablishedFact: true,
        },
      ],
      clarificationCount: 1,
      declarations: [{
        declarationId: 'DECL-1',
        missingFact: 'whether the second isolation was applied and proved at the bleed before '
          + 'entry, as the permit requires',
        affectedDecision: 'PERMIT_TO_WORK',
        branchA: 'the second isolation was applied and proved at the bleed before entry',
        branchB: 'the second isolation was not applied, or was not proved',
        decisionIfA: 'entry may proceed under the permit as written',
        decisionIfB: 'entry is refused until the isolation is applied and proved',
        attemptsOwedPropertyKey: 'L5-P1',
      }],
      uncertaintyStatements: [],
      summary: 'One of the two isolations the permit requires has not been shown to have been '
        + 'applied and proved.',
    },
    outputProvenance: 'AUTHORED_FOR_THIS_INSTRUMENT',
    expectedUnder224: {
      ...NONE_226,
      DECLARATION_RECALL: 'COMPLIANT',
      PROPERTY_IDENTITY: 'COMPLIANT',
      REQUIRED_ACT_CONTROL: 'COMPLIANT',
    },
    expectedUnder226: {
      ...NONE_226,
      DECLARATION_RECALL: 'COMPLIANT',
      PROPERTY_IDENTITY: 'COMPLIANT',
      REQUIRED_ACT_CONTROL: 'COMPLIANT',
    },
    exercisesRootCause: null,
  },

  // ---------------------------------------------------- RC7, the artifact undercut by the act
  {
    caseId: 'L6-ARTIFACT-UNDERCUT-BY-ACT',
    family: 'required artifact, undercut to the act it records',
    observation: 'A bakery runs a steam-raising boiler feeding the proving cabinets. It is in '
      + 'service and firing now. The written scheme of examination requires a periodic examination '
      + 'every fourteen months. The last report in the plant room folder is dated nineteen months '
      + 'ago. The engineering manager believes an examination was carried out in the spring but '
      + 'cannot produce a report, and the insurer that carries out the examinations has not been '
      + 'contacted. The boiler shows no leaks, the gauges read normally and the safety valve was '
      + 'lifted manually last week without incident.',
    decisionUnderAnalysis: 'whether the boiler may remain in service today',
    establishedFacts: [
      'the boiler is in service and firing',
      'the written scheme requires examination every fourteen months',
      'the last report held is nineteen months old',
      'no report exists for any later examination',
      'the boiler shows no leaks and the gauges read normally',
    ],
    owedProperties: [{
      key: 'L6-P1',
      proposition: 'whether a current report of examination exists for this vessel under its '
        + 'written scheme',
      kind: 'REQUIRED_ARTIFACT',
      whyGenuinelyOpen: 'The scheme makes a current report the precondition for keeping the vessel '
        + 'in service. The newest report held is out of interval and whether any later report '
        + 'exists is unstated. The vessel may remain in service or must be taken out of service on '
        + 'the answer, whatever its mechanical condition.',
      prohibited: [
        {
          kind: 'UNDERLYING_ACT_BENEATH_ARTIFACT',
          text: 'whether an examination of the vessel was actually carried out and passed',
        },
        {
          kind: 'ADJACENT_CONDITION',
          text: 'whether the boiler is in sound mechanical condition',
        },
        { kind: 'CONTROL_STATE', text: 'whether the safety valve lifts at its set pressure' },
      ],
    }],
    nonFacts: [
      'which insurer holds the plant policy',
      'how many proving cabinets the boiler feeds',
    ],
    restraintBasis: null,
    expectedDeclarationCount: 1,
    expectedControllingPropertyKeys: ['L6-P1'],
    requiredActSemanticsApply: false,
    requiredArtifactSemanticsApply: true,
    emittedDeclarationCount: 1,
    isCandidateStateBypassCase: false,
    output: {
      candidates: [
        {
          candidateKey: 'cand-pressure-system', assertedConditionState: 'INSUFFICIENT_EVIDENCE',
          confidence: 'MODERATE', requiresUserConfirmation: true,
          reasoning: 'A steam-raising boiler is in service past the interval its written scheme '
            + 'sets, and the examination position cannot be established from what is held.',
          carriesOwedPropertyKey: 'L6-P1', materialToDecision: true,
          reasoningNamesUnestablishedFact: true,
        },
      ],
      clarificationCount: 1,
      declarations: [{
        declarationId: 'DECL-1',
        missingFact: 'whether a competent person examination of the boiler was actually carried '
          + 'out and passed in the spring',
        affectedDecision: 'REQUIRED_CONTROL',
        branchA: 'an examination was carried out in the spring and the vessel passed',
        branchB: 'no examination was carried out in the spring',
        decisionIfA: 'the boiler may remain in service',
        decisionIfB: 'the boiler is taken out of service pending examination',
        attemptsOwedPropertyKey: 'L6-P1',
      }],
      uncertaintyStatements: [],
      summary: 'The boiler is past its examination interval and whether it was examined in the '
        + 'spring is not established.',
    },
    outputProvenance: 'AUTHORED_FOR_THIS_INSTRUMENT',
    expectedUnder224: {
      ...NONE_226,
      DECLARATION_RECALL: 'COMPLIANT',
      PROPERTY_IDENTITY: 'COMPLIANT',
      REQUIRED_ARTIFACT_CONTROL: 'COMPLIANT',
    },
    expectedUnder226: {
      ...NONE_226,
      DECLARATION_RECALL: 'COMPLIANT',
      PROPERTY_IDENTITY: 'DEFECTIVE',
      REQUIRED_ARTIFACT_CONTROL: 'COMPLIANT',
    },
    exercisesRootCause: 'RC7',
  },

  // ------------------------------------------------- required artifact, over-correction guard
  {
    caseId: 'L7-REQUIRED-ARTIFACT-LEGITIMATE',
    family: 'legitimate required artifact',
    observation: 'A five tonne overhead travelling crane in a fabrication bay is lifting welded '
      + 'frames today. The thorough examination certificate displayed by the pendant station '
      + 'expired four months ago. The maintenance contractor visited last month and the visit '
      + 'sheet records "crane checked, no defects". The crane runs smoothly, the hook and latch '
      + 'are sound and the chains show no distortion.',
    decisionUnderAnalysis: 'whether the crane may be used for lifting today',
    establishedFacts: [
      'the crane is lifting welded frames today',
      'the displayed thorough examination certificate expired four months ago',
      'the contractor visit sheet records the crane checked with no defects',
      'the hook, latch and chains are visually sound',
    ],
    owedProperties: [{
      key: 'L7-P1',
      proposition: 'whether a current thorough examination certificate is in force for this crane',
      kind: 'REQUIRED_ARTIFACT',
      whyGenuinelyOpen: 'A certificate in force is the precondition for using the crane. The one '
        + 'displayed is expired and whether a later one exists is unstated. A contractor visit '
        + 'sheet is stated and is not a thorough examination certificate.',
      prohibited: [
        {
          kind: 'UNDERLYING_ACT_BENEATH_ARTIFACT',
          text: 'whether the crane has actually been thoroughly examined within the interval',
        },
        { kind: 'ADJACENT_CONDITION', text: 'whether the crane is in sound mechanical condition' },
        {
          kind: 'EVIDENCE_PROXY',
          text: 'whether the contractor visit sheet records any defects',
        },
      ],
    }],
    nonFacts: [
      'which contractor carries out the maintenance visits',
      'what the frames being lifted weigh',
    ],
    restraintBasis: null,
    expectedDeclarationCount: 1,
    expectedControllingPropertyKeys: ['L7-P1'],
    requiredActSemanticsApply: false,
    requiredArtifactSemanticsApply: true,
    emittedDeclarationCount: 1,
    isCandidateStateBypassCase: false,
    output: {
      candidates: [
        {
          candidateKey: 'cand-lifting-equipment', assertedConditionState: 'INSUFFICIENT_EVIDENCE',
          confidence: 'MODERATE', requiresUserConfirmation: true,
          reasoning: 'Lifting equipment is in use with the displayed certificate out of date and '
            + 'no later certificate stated.',
          carriesOwedPropertyKey: 'L7-P1', materialToDecision: true,
          reasoningNamesUnestablishedFact: true,
        },
      ],
      clarificationCount: 1,
      declarations: [{
        declarationId: 'DECL-1',
        missingFact: 'whether a current thorough examination certificate is in force for this '
          + 'crane',
        affectedDecision: 'REQUIRED_CONTROL',
        branchA: 'a current thorough examination certificate is in force for the crane',
        branchB: 'no current thorough examination certificate is in force',
        decisionIfA: 'lifting may continue',
        decisionIfB: 'the crane is taken out of use until a certificate is in force',
        attemptsOwedPropertyKey: 'L7-P1',
      }],
      uncertaintyStatements: [],
      summary: 'The displayed thorough examination certificate is out of date and no current one '
        + 'is stated.',
    },
    outputProvenance: 'AUTHORED_FOR_THIS_INSTRUMENT',
    expectedUnder224: {
      ...NONE_226,
      DECLARATION_RECALL: 'COMPLIANT',
      PROPERTY_IDENTITY: 'COMPLIANT',
      REQUIRED_ARTIFACT_CONTROL: 'COMPLIANT',
    },
    expectedUnder226: {
      ...NONE_226,
      DECLARATION_RECALL: 'COMPLIANT',
      PROPERTY_IDENTITY: 'COMPLIANT',
      REQUIRED_ARTIFACT_CONTROL: 'COMPLIANT',
    },
    exercisesRootCause: null,
  },

  // ---------------------------------------------------------------- two independent properties
  {
    caseId: 'L8-INDEPENDENCE-TWO-PROPERTIES',
    family: 'two independent unresolved properties',
    observation: 'A mobile elevating work platform is being used to change high bay light '
      + 'fittings in a warehouse aisle. Two operatives are in the basket with a box of replacement '
      + 'fittings; the weight of the box is not stated and the machine\'s rated capacity plate has '
      + 'been painted over and cannot be read. The machine is standing on a suspended slab over a '
      + 'basement plant room; nobody can say what the slab is rated to carry and no structural '
      + 'drawings are held.',
    decisionUnderAnalysis: 'whether this platform may be used from this position today',
    establishedFacts: [
      'two operatives are in the basket with a box of replacement fittings',
      'the rated capacity plate is painted over and cannot be read',
      'the machine is standing on a suspended slab over a basement plant room',
      'no structural drawings are held',
    ],
    owedProperties: [
      {
        key: 'L8-P1',
        proposition: 'whether the load in the basket is within the machine\'s rated platform '
          + 'capacity',
        kind: 'HAZARD_STATE',
        whyGenuinelyOpen: 'Neither the rated capacity nor the weight in the basket is stated, and '
          + 'the plate that would carry the rating is unreadable. Whether the platform may be used '
          + 'as loaded turns on the answer.',
        prohibited: [
          { kind: 'DOCUMENT', text: 'whether the machine handbook can be found' },
          { kind: 'VERIFICATION_ACT', text: 'whether the basket load has been weighed' },
        ],
      },
      {
        key: 'L8-P2',
        proposition: 'whether the suspended slab will carry the machine\'s wheel loads at this '
          + 'position',
        kind: 'HAZARD_STATE',
        whyGenuinelyOpen: 'The slab is suspended over a basement and nothing supplied states what '
          + 'it is rated to carry or what the machine imposes. Whether the machine may stand here '
          + 'at all turns on the answer, and it is independent of what is in the basket.',
        prohibited: [
          { kind: 'VERIFICATION_ACT', text: 'whether the floor has been checked by an engineer' },
          { kind: 'DOCUMENT', text: 'whether structural drawings are held for the building' },
        ],
      },
    ],
    nonFacts: [
      'how many fittings are to be changed',
      'when the warehouse aisle was last resurfaced',
    ],
    restraintBasis: null,
    expectedDeclarationCount: 2,
    expectedControllingPropertyKeys: ['L8-P1', 'L8-P2'],
    requiredActSemanticsApply: false,
    requiredArtifactSemanticsApply: false,
    emittedDeclarationCount: 1,
    isCandidateStateBypassCase: true,
    output: {
      candidates: [
        {
          candidateKey: 'cand-overload', assertedConditionState: 'INSUFFICIENT_EVIDENCE',
          confidence: 'MODERATE', requiresUserConfirmation: true,
          reasoning: 'Two people and materials are in a basket whose rated capacity cannot be read.',
          carriesOwedPropertyKey: 'L8-P1', materialToDecision: true,
          reasoningNamesUnestablishedFact: true,
        },
        {
          candidateKey: 'cand-ground-bearing', assertedConditionState: 'ACTIVE',
          confidence: 'HIGH', requiresUserConfirmation: false,
          reasoning: 'The machine is set up on a suspended slab over a void, and what that slab is '
            + 'rated to carry is not something the supplied facts settle.',
          carriesOwedPropertyKey: 'L8-P2', materialToDecision: true,
          reasoningNamesUnestablishedFact: true,
        },
      ],
      clarificationCount: 1,
      declarations: [{
        declarationId: 'DECL-1',
        missingFact: 'whether the load in the basket is within the machine\'s rated platform '
          + 'capacity',
        affectedDecision: 'REQUIRED_CONTROL',
        branchA: 'the basket load is within the machine\'s rated platform capacity',
        branchB: 'the basket load exceeds the machine\'s rated platform capacity',
        decisionIfA: 'the fitting change may continue as arranged',
        decisionIfB: 'the load is reduced before the platform is raised again',
        attemptsOwedPropertyKey: 'L8-P1',
      }],
      uncertaintyStatements: [],
      summary: 'The platform capacity cannot be read and the basket load is unstated. Working over '
        + 'a suspended slab is noted as an active setup hazard.',
    },
    outputProvenance: 'AUTHORED_FOR_THIS_INSTRUMENT',
    expectedUnder224: {
      ...NONE_226,
      DECLARATION_RECALL: 'COMPLIANT',
      PROPERTY_IDENTITY: 'COMPLIANT',
      INDEPENDENCE: 'COMPLIANT',
      CANDIDATE_STATE_BYPASS: 'DEFECTIVE',
    },
    expectedUnder226: {
      ...NONE_226,
      DECLARATION_RECALL: 'DEFECTIVE',
      PROPERTY_IDENTITY: 'COMPLIANT',
      INDEPENDENCE: 'DEFECTIVE',
      CANDIDATE_STATE_BYPASS: 'COMPLIANT',
    },
    exercisesRootCause: 'RC5',
  },

  // ---------------------------------------------------------------- restraint, safe and negated
  {
    caseId: 'L9-RESTRAINT-SAFE-NEGATED',
    family: 'safe or negated restraint',
    observation: 'A technician in a school prep room is decanting a dilute buffer solution at a '
      + 'fume cupboard. The airflow alarm is fitted and sounded on test this morning, the sash is '
      + 'at the marked working height, and the thorough examination certificate taped to the sash '
      + 'is four months old against a fourteen month interval. The technician is wearing gloves '
      + 'and eye protection.',
    decisionUnderAnalysis: 'whether the technician may continue decanting at this fume cupboard',
    establishedFacts: [
      'the substance is a dilute buffer solution',
      'the airflow alarm is fitted and sounded on test this morning',
      'the sash is at the marked working height',
      'the examination certificate is four months old against a fourteen month interval',
      'the technician is wearing gloves and eye protection',
    ],
    owedProperties: [],
    nonFacts: [
      'which supplier provided the buffer solution',
      'how many decants are planned today',
    ],
    restraintBasis: 'Every control the decision turns on is stated and in date, the substance is a '
      + 'dilute buffer, and the containment is working and proved this morning. Nothing '
      + 'decision-critical is open, and manufacturing a gap here would be the opposite defect.',
    expectedDeclarationCount: 0,
    expectedControllingPropertyKeys: [],
    requiredActSemanticsApply: false,
    requiredArtifactSemanticsApply: false,
    emittedDeclarationCount: 0,
    isCandidateStateBypassCase: false,
    output: {
      candidates: [
        {
          candidateKey: 'cand-chemical-exposure', assertedConditionState: 'CONTROLLED',
          confidence: 'HIGH', requiresUserConfirmation: false,
          reasoning: 'Decanting a dilute buffer inside a working fume cupboard at the marked sash '
            + 'height with gloves and eye protection worn.',
          carriesOwedPropertyKey: null, materialToDecision: true,
          reasoningNamesUnestablishedFact: false,
        },
      ],
      clarificationCount: 0,
      declarations: [],
      uncertaintyStatements: [
        'No fact given indicates that the examination certificate, the alarm test, the sash '
        + 'position or the protective equipment has lapsed, and whichever way the unrecorded '
        + 'supplier of the buffer turns out, nothing done today changes.',
      ],
      summary: 'Containment is in place, proved this morning and in date, and the substance is a '
        + 'dilute buffer. The work may continue as it is.',
    },
    outputProvenance: 'AUTHORED_FOR_THIS_INSTRUMENT',
    expectedUnder224: { ...NONE_226, RESTRAINT: 'COMPLIANT' },
    expectedUnder226: { ...NONE_226, RESTRAINT: 'COMPLIANT' },
    exercisesRootCause: null,
  },

  // ------------------------------------------------- restraint, ordinary non-decision-critical
  {
    caseId: 'L10-RESTRAINT-ORDINARY-UNKNOWN',
    family: 'ordinary non-decision-critical restraint',
    observation: 'A pallet truck in a distribution warehouse has a worn hand grip and the operator '
      + 'says it is uncomfortable to hold. The braking, the forks and the wheels are sound and the '
      + 'truck is on its inspection schedule, last checked two weeks ago. Nobody knows when the '
      + 'grip was last replaced.',
    decisionUnderAnalysis: 'whether the pallet truck may continue in use today',
    establishedFacts: [
      'the braking, forks and wheels are sound',
      'the truck is on its inspection schedule and was last checked two weeks ago',
      'the hand grip is worn and uncomfortable',
    ],
    owedProperties: [],
    nonFacts: [
      'when the hand grip was last replaced',
      'which operator used the truck on the previous shift',
    ],
    restraintBasis: 'When the grip was last replaced is a real unknown that bears on nothing '
      + 'decided today: the truck\'s safety critical functions are stated sound and it is in date '
      + 'on its schedule. An unknown is owed only where resolving it is material to the decision '
      + 'under analysis.',
    expectedDeclarationCount: 0,
    expectedControllingPropertyKeys: [],
    requiredActSemanticsApply: false,
    requiredArtifactSemanticsApply: false,
    emittedDeclarationCount: 0,
    isCandidateStateBypassCase: false,
    output: {
      candidates: [
        {
          candidateKey: 'cand-grip-history', assertedConditionState: 'UNKNOWN', confidence: 'LOW',
          requiresUserConfirmation: true,
          reasoning: 'When the hand grip was last replaced is not recorded anywhere available.',
          carriesOwedPropertyKey: null, materialToDecision: false,
          reasoningNamesUnestablishedFact: true,
        },
      ],
      clarificationCount: 0,
      declarations: [],
      uncertaintyStatements: [
        'When the hand grip was last replaced is not recorded anywhere available, and it does not '
        + 'change what is done today either way: the braking, forks and wheels are stated sound '
        + 'and the truck is in date on its inspection schedule.',
      ],
      summary: 'A worn grip on a truck whose safety critical functions are sound and in date. '
        + 'Replace the grip as routine maintenance; nothing is held open.',
    },
    outputProvenance: 'AUTHORED_FOR_THIS_INSTRUMENT',
    expectedUnder224: { ...NONE_226, RESTRAINT: 'COMPLIANT' },
    expectedUnder226: { ...NONE_226, RESTRAINT: 'COMPLIANT' },
    exercisesRootCause: null,
  },
];

// ---------------------------------------------------------------- the contracts under test

export type ContractUnderTest226 = 'BASE_224' | 'REMEDIATED_226';

/**
 * Each rule is a transcription of what the INSTRUCTION says, not a judgement of my own. The field
 * that matters at §226 is `declarationTriggerReach`: what the contract's own trigger can see.
 */
export const CONTRACT_RULES_226 = {
  BASE_224: {
    declarationTriggerReach: 'SELF_REPORTED_UNRESOLVED_STATES_ONLY',
    declarationTriggerSource:
      '§224 THE DECLARATION TRIGGER: "Take every candidate you yourself put at UNKNOWN or '
      + 'INSUFFICIENT_EVIDENCE, every candidate you marked requiresUserConfirmation true, and every '
      + 'unknown you named in an uncertainty statement."',
    propertyRule: 'DENY_LIST_OF_ENUMERATED_KINDS',
    propertyRuleSource: '§224 GATE 13, over GATE 8 and GATE 12',
    refusedPropertyKinds: [
      'CONTROL_STATE', 'EVIDENCE_PROXY', 'VERIFICATION_ACT', 'DOCUMENT', 'ADJACENT_CONDITION',
    ] as readonly ProhibitedKind[],
    requiredArtifactCarveOutStated: false,
    requiredArtifactCarveOutNote:
      '§224 GATE 13 asserts "which GATE 8 already carves out". GATE 8 carves out the ACT only, and '
      + 'closes by sending a missing record to notEstablishedBecause. There is no artifact carve-out '
      + 'in the base, so an over-correction from the artifact to the act it records is not refused.',
    requiresOneEntryPerIndependentFact: true,
  },
  REMEDIATED_226: {
    declarationTriggerReach: 'EVERY_MATERIALLY_RELEVANT_CANDIDATE',
    declarationTriggerSource:
      '§226 THAT ENUMERATION IS WHERE YOU START AND NOT WHERE YOU STOP: "Take EVERY candidate that '
      + 'bears materially on the decision in front of you, whatever state you gave it."',
    propertyRule: 'SUFFICIENCY_TEST_PER_ENTRY',
    propertyRuleSource:
      '§226 GATE 14: grant branchA outright and ask whether the safety decision is then made. '
      + 'Applies to every entry with no precondition that the model first classify its property.',
    refusedPropertyKinds: PROHIBITED_KINDS,
    requiredArtifactCarveOutStated: true,
    requiredArtifactCarveOutNote:
      '§226 GATE 14 WHERE THE RECORD IS THE REQUIREMENT states the carve-out the base holds for the '
      + 'act, and gives the test that separates a record that is evidence from a record whose '
      + 'existence or currency is itself the requirement.',
    requiresOneEntryPerIndependentFact: true,
  },
} as const;

// ---------------------------------------------------------------- deterministic comparison

const STOP = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'to', 'of', 'in', 'on', 'at', 'for',
  'and', 'or', 'it', 'its', 'that', 'this', 'whether', 'has', 'have', 'had', 'not', 'no', 'any',
  'by', 'with', 'as', 'which', 'what', 'from', 'before', 'after', 'still', 'now', 'currently',
  'their', 'there', 'been', 'can', 'could', 'would', 'may', 'does', 'did', 'they', 'them',
]);

function tokens(s: string): Set<string> {
  return new Set(s.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/)
    .filter(t => t.length > 2 && !STOP.has(t)));
}

/** Jaccard overlap. Deterministic, auditable, and reported alongside every classification. */
export function overlap(a: string, b: string): number {
  const ta = tokens(a); const tb = tokens(b);
  if (ta.size === 0 || tb.size === 0) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter += 1;
  return inter / (ta.size + tb.size - inter);
}

/**
 * A declared property counts as the owed property only at or above this overlap. Below it, the
 * §226 sufficiency rule treats the entry as not naming the owed proposition -- which is the whole
 * point of an allow-list rule: an unanticipated substitution fails it without having been listed.
 */
export const OWED_MATCH_FLOOR = 0.30;

/** Two preregistered strings closer than this are treated as the same property in the preflight. */
export const DUPLICATE_COLLISION = 0.34;

export interface PropertyClassification226 {
  readonly declarationId: string;
  readonly declaredProperty: string;
  readonly nearestOwedKey: string | null;
  readonly nearestOwedScore: number;
  readonly nearestProhibitedKind: ProhibitedKind | null;
  readonly nearestProhibitedText: string | null;
  readonly nearestProhibitedScore: number;
  readonly classifiedAs: 'OWED_PROPERTY' | 'PROHIBITED_SUBSTITUTION' | 'UNMATCHED';
}

export function classifyDeclaredProperty226(
  c: Case226, d: DeclarationFixture226,
): PropertyClassification226 {
  let owedKey: string | null = null; let owedScore = 0;
  for (const p of c.owedProperties) {
    const s = overlap(d.missingFact, p.proposition);
    if (s > owedScore) { owedScore = s; owedKey = p.key; }
  }
  let pKind: ProhibitedKind | null = null; let pText: string | null = null; let pScore = 0;
  for (const p of c.owedProperties) {
    for (const f of p.prohibited) {
      const s = overlap(d.missingFact, f.text);
      if (s > pScore) { pScore = s; pKind = f.kind; pText = f.text; }
    }
  }
  const classifiedAs: PropertyClassification226['classifiedAs'] =
    owedScore >= OWED_MATCH_FLOOR && owedScore > pScore
      ? 'OWED_PROPERTY'
      : (pScore > owedScore ? 'PROHIBITED_SUBSTITUTION' : 'UNMATCHED');
  return {
    declarationId: d.declarationId,
    declaredProperty: d.missingFact,
    nearestOwedKey: owedKey,
    nearestOwedScore: Number(owedScore.toFixed(3)),
    nearestProhibitedKind: pKind,
    nearestProhibitedText: pText,
    nearestProhibitedScore: Number(pScore.toFixed(3)),
    classifiedAs,
  };
}

// ---------------------------------------------------------------- trigger reach

export interface TriggerReach {
  readonly candidateKey: string;
  readonly owedPropertyKey: string;
  readonly reached: boolean;
  readonly why: string;
}

/**
 * Does the contract's OWN declaration trigger bring this candidate into the test? This is the
 * §226 question. It reads only preregistered fields and the candidate's own self-reported labels.
 */
export function triggerReaches(
  c: Case226, k: CandidateFixture226, contract: ContractUnderTest226,
): TriggerReach {
  const owedKey = k.carriesOwedPropertyKey ?? '';
  if (contract === 'REMEDIATED_226') {
    return {
      candidateKey: k.candidateKey, owedPropertyKey: owedKey, reached: k.materialToDecision,
      why: k.materialToDecision
        ? 'the §226 trigger takes every candidate that bears materially on the decision, whatever '
          + `state was assigned; this one is ${k.assertedConditionState} and is reached`
        : 'the candidate does not bear materially on the decision under analysis',
    };
  }
  const selfUnresolved = k.assertedConditionState === 'UNKNOWN'
    || k.assertedConditionState === 'INSUFFICIENT_EVIDENCE';
  const namedInUncertainty = c.output.uncertaintyStatements.some(
    s => overlap(s, k.reasoning) >= 0.10);
  const reached = selfUnresolved || k.requiresUserConfirmation || namedInUncertainty;
  return {
    candidateKey: k.candidateKey, owedPropertyKey: owedKey, reached,
    why: reached
      ? `the §224 trigger enumerates it: state ${k.assertedConditionState}, `
        + `requiresUserConfirmation ${k.requiresUserConfirmation}, `
        + `named in an uncertainty statement ${namedInUncertainty}`
      : `the §224 trigger enumerates candidates at UNKNOWN or INSUFFICIENT_EVIDENCE, candidates `
        + `at requiresUserConfirmation true, and unknowns named in an uncertainty statement. This `
        + `candidate is ${k.assertedConditionState} at ${k.confidence} confidence with `
        + `requiresUserConfirmation false and is named in no uncertainty statement, so the trigger `
        + `never reaches it. The label the model chose decided whether the model had to declare the `
        + `fact that would justify the label`,
  };
}

// ---------------------------------------------------------------- the seven measures

export interface MeasureResult226 {
  readonly measure: Measure226;
  readonly verdict: Verdict226;
  readonly reason: string;
}

/**
 * Which owed properties did this fixture emit an entry FOR? Attribution is preregistered, not
 * inferred, and it is deliberately independent of whether the entry named the right property. An
 * entry that reaches for the owed gap and names a control state discharges RECALL and fails
 * PROPERTY_IDENTITY. Collapsing the two would make one gate answer for another.
 */
function coveredOwedKeys(c: Case226): Set<string> {
  const out = new Set<string>();
  for (const d of c.output.declarations) {
    if (d.attemptsOwedPropertyKey !== null) out.add(d.attemptsOwedPropertyKey);
  }
  return out;
}

function carrierFor(c: Case226, owedKey: string): CandidateFixture226 | undefined {
  return c.output.candidates.find(k => k.carriesOwedPropertyKey === owedKey);
}

const BLANKET_NEGATIVE =
  /no decision[- ]critical fact is missing|nothing (?:is )?(?:left )?open|no facts? (?:is|are) missing/i;

export function evaluateRecall226(
  c: Case226, contract: ContractUnderTest226,
): MeasureResult226 {
  if (c.owedProperties.length === 0) {
    return {
      measure: 'DECLARATION_RECALL', verdict: 'NOT_EXERCISED',
      reason: 'no property is owed on this case',
    };
  }
  const covered = coveredOwedKeys(c);
  const missing = c.owedProperties.filter(p => !covered.has(p.key));
  if (missing.length === 0) {
    return {
      measure: 'DECLARATION_RECALL', verdict: 'COMPLIANT',
      reason: `every owed property is named by an entry (${[...covered].join(', ')})`,
    };
  }
  const unreached = missing.filter(p => {
    const k = carrierFor(c, p.key);
    return k !== undefined && !triggerReaches(c, k, contract).reached;
  });
  if (unreached.length === missing.length) {
    const k = carrierFor(c, unreached[0].key);
    return {
      measure: 'DECLARATION_RECALL', verdict: 'COMPLIANT',
      reason: `${unreached.length} owed property/properties are unnamed, and the contract's own `
        + `declaration trigger never reaches the candidate(s) carrying them: `
        + `${k ? triggerReaches(c, k, contract).why : 'no carrying candidate'}. Under this `
        + 'contract the empty list is compliant. This is the defect, reproduced: the contract '
        + 'cannot tell this apart from correct restraint.',
    };
  }
  return {
    measure: 'DECLARATION_RECALL', verdict: 'DEFECTIVE',
    reason: `owed property/properties ${missing.map(p => p.key).join(', ')} are named by no entry, `
      + 'and the contract\'s declaration trigger reaches the candidate(s) carrying them, so the '
      + 'entry/entries are owed.'
      + (BLANKET_NEGATIVE.test(c.output.summary)
        ? ' The summary additionally asserts a blanket negative that contradicts the candidate.'
        : ''),
  };
}

export function evaluateRestraint226(
  c: Case226, contract: ContractUnderTest226,
): MeasureResult226 {
  if (c.owedProperties.length > 0) {
    return {
      measure: 'RESTRAINT', verdict: 'NOT_EXERCISED',
      reason: 'this case owes a property, so it cannot exercise restraint',
    };
  }
  if (c.output.declarations.length > 0) {
    return {
      measure: 'RESTRAINT', verdict: 'DEFECTIVE',
      reason: `${c.output.declarations.length} declaration(s) emitted where the frozen truth owes `
        + 'none',
    };
  }
  // Both contracts require a witnessed negative where a recognised unknown is set aside. §226
  // widens which candidates are reached, so a widened trigger must not convert restraint into a
  // false declaration: the witnessed negative is what discharges it, under either contract.
  const reached = c.output.candidates
    .filter(k => k.reasoningNamesUnestablishedFact)
    .filter(k => triggerReaches(c, k, contract).reached);
  const unwitnessed = reached.filter(k => !c.output.uncertaintyStatements.some(
    s => overlap(s, k.reasoning) >= 0.10
      && /does not change|no different|either way|whichever way|nothing done today|not decision-critical/i
        .test(s)));
  if (unwitnessed.length > 0) {
    return {
      measure: 'RESTRAINT', verdict: 'DEFECTIVE',
      reason: `restraint is correct here, but candidate(s) `
        + `${unwitnessed.map(k => k.candidateKey).join(', ')} were set aside without a witnessed `
        + 'negative, so the decision is unreadable in the output',
    };
  }
  return {
    measure: 'RESTRAINT', verdict: 'COMPLIANT',
    reason: 'no declaration emitted where the frozen truth owes none, and every recognised unknown '
      + `the trigger reaches carries a witnessed negative (${reached.length} reached)`,
  };
}

export function evaluatePropertyIdentity226(
  c: Case226, contract: ContractUnderTest226,
): {
  readonly result: MeasureResult226;
  readonly classifications: readonly PropertyClassification226[];
} {
  if (c.output.declarations.length === 0) {
    return {
      result: {
        measure: 'PROPERTY_IDENTITY', verdict: 'NOT_EXERCISED',
        reason: 'no declaration was emitted, so no property was selected to judge',
      },
      classifications: [],
    };
  }
  const rule = CONTRACT_RULES_226[contract];
  const cls = c.output.declarations.map(d => classifyDeclaredProperty226(c, d));
  const wrong = cls.filter(x => x.classifiedAs !== 'OWED_PROPERTY');
  const caught = wrong.filter(x => rule.propertyRule === 'SUFFICIENCY_TEST_PER_ENTRY'
    || (x.classifiedAs === 'PROHIBITED_SUBSTITUTION'
      && (rule.refusedPropertyKinds as readonly string[]).includes(x.nearestProhibitedKind ?? '')));
  const survived = wrong.filter(x => !caught.includes(x));
  if (caught.length > 0) {
    return {
      result: {
        measure: 'PROPERTY_IDENTITY', verdict: 'DEFECTIVE',
        reason: caught.map(x => x.classifiedAs === 'PROHIBITED_SUBSTITUTION'
          ? `${x.declarationId} names a ${x.nearestProhibitedKind} ("${x.nearestProhibitedText}", `
            + `overlap ${x.nearestProhibitedScore}) rather than the owed property (overlap `
            + `${x.nearestOwedScore}); ${rule.propertyRuleSource} refuses it`
          : `${x.declarationId} names no owed proposition (best overlap ${x.nearestOwedScore} `
            + `against a floor of ${OWED_MATCH_FLOOR}) and matches no enumerated near neighbour `
            + `either; ${rule.propertyRuleSource} refuses it because granting branchA leaves the `
            + 'decision unmade, without anyone having had to enumerate this substitution first')
          .join('; '),
      },
      classifications: cls,
    };
  }
  if (survived.length > 0) {
    return {
      result: {
        measure: 'PROPERTY_IDENTITY', verdict: 'COMPLIANT',
        reason: survived.map(x => x.classifiedAs === 'UNMATCHED'
          ? `${x.declarationId} names neither the owed property nor any enumerated near neighbour, `
            + 'and a deny-list rule has nothing to match it against, so the substitution survives. '
            + 'This is the defect, reproduced.'
          : `${x.declarationId} names a ${x.nearestProhibitedKind}, which this contract does not `
            + 'refuse. The substitution survives. This is the defect, reproduced.').join('; '),
      },
      classifications: cls,
    };
  }
  return {
    result: {
      measure: 'PROPERTY_IDENTITY', verdict: 'COMPLIANT',
      reason: cls.map(x => `${x.declarationId} -> ${x.nearestOwedKey} (overlap `
        + `${x.nearestOwedScore} against ${x.nearestProhibitedScore} for the nearest near `
        + 'neighbour)').join('; '),
    },
    classifications: cls,
  };
}

export function evaluateIndependence226(
  c: Case226, contract: ContractUnderTest226,
): MeasureResult226 {
  if (c.owedProperties.length < 2) {
    return {
      measure: 'INDEPENDENCE', verdict: 'NOT_EXERCISED',
      reason: 'fewer than two independent properties are owed',
    };
  }
  const covered = coveredOwedKeys(c);
  const missing = c.owedProperties.filter(p => !covered.has(p.key));
  if (missing.length === 0) {
    return {
      measure: 'INDEPENDENCE', verdict: 'COMPLIANT',
      reason: `${covered.size} entries for ${c.owedProperties.length} owed properties; no sibling `
        + 'was absorbed',
    };
  }
  const reachable = missing.filter(p => {
    const k = carrierFor(c, p.key);
    return k !== undefined && triggerReaches(c, k, contract).reached;
  });
  if (reachable.length === 0) {
    return {
      measure: 'INDEPENDENCE', verdict: 'COMPLIANT',
      reason: `${missing.length} sibling property/properties are unnamed, and the contract's own `
        + 'declaration trigger never reaches the candidate(s) carrying them, so it cannot require '
        + 'a second entry. This is the defect, reproduced: a sibling is absorbed and the contract '
        + 'cannot see it.',
    };
  }
  return {
    measure: 'INDEPENDENCE', verdict: 'DEFECTIVE',
    reason: `${c.owedProperties.length} independent properties are owed and `
      + `${covered.size} were named; ${reachable.map(p => p.key).join(', ')} is/are carried by a `
      + 'candidate the trigger reaches and was absorbed rather than declared',
  };
}

/**
 * Over-correction control. This does NOT ask whether the act or artifact was declared. It asks
 * whether a case where the act or the artifact IS the governing requirement was WRONGLY FLAGGED as
 * a substitution. A contract that pushes every property one level deeper would fail here.
 */
function evaluateOverCorrection(
  c: Case226, contract: ContractUnderTest226, kind: 'REQUIRED_ACT' | 'REQUIRED_ARTIFACT',
): MeasureResult226 {
  const measure: Measure226 = kind === 'REQUIRED_ACT'
    ? 'REQUIRED_ACT_CONTROL' : 'REQUIRED_ARTIFACT_CONTROL';
  const applies = kind === 'REQUIRED_ACT'
    ? c.requiredActSemanticsApply : c.requiredArtifactSemanticsApply;
  if (!applies) {
    return {
      measure, verdict: 'NOT_EXERCISED',
      reason: `${kind} semantics do not apply on this case`,
    };
  }
  if (c.output.declarations.length === 0) {
    return { measure, verdict: 'NOT_EXERCISED', reason: 'no declaration was emitted to judge' };
  }
  const owedOfKind = c.owedProperties.filter(p => p.kind === kind).map(p => p.key);
  const cls = c.output.declarations.map(d => classifyDeclaredProperty226(c, d));
  const correctlyNamed = cls.filter(x =>
    x.classifiedAs === 'OWED_PROPERTY' && owedOfKind.includes(x.nearestOwedKey ?? ''));
  if (correctlyNamed.length === 0) {
    return {
      measure, verdict: 'COMPLIANT',
      reason: `no entry names the owed ${kind}, so there is nothing for this contract to `
        + 'over-correct. The property-identity measure carries that failure; this measure is about '
        + 'the opposite error and records none.',
    };
  }
  const flagged = correctlyNamed.filter(x => {
    const r = evaluatePropertyIdentity226(c, contract);
    return r.result.verdict === 'DEFECTIVE'
      && r.classifications.some(y => y.declarationId === x.declarationId
        && y.classifiedAs !== 'OWED_PROPERTY');
  });
  if (flagged.length > 0) {
    return {
      measure, verdict: 'DEFECTIVE',
      reason: `over-correction: ${flagged.map(x => x.declarationId).join(', ')} names the owed `
        + `${kind}, which IS the governing requirement here, and the contract flagged it as a `
        + 'substitution',
    };
  }
  return {
    measure, verdict: 'COMPLIANT',
    reason: `the owed ${kind} is named and the contract does not push it one level deeper; `
      + `artifact carve-out stated by this contract: `
      + `${CONTRACT_RULES_226[contract].requiredArtifactCarveOutStated}`,
  };
}

export function evaluateRequiredActControl226(
  c: Case226, contract: ContractUnderTest226,
): MeasureResult226 {
  return evaluateOverCorrection(c, contract, 'REQUIRED_ACT');
}

export function evaluateRequiredArtifactControl226(
  c: Case226, contract: ContractUnderTest226,
): MeasureResult226 {
  return evaluateOverCorrection(c, contract, 'REQUIRED_ARTIFACT');
}

/**
 * The §226 mechanism, scored directly. Exercised only where an owed property went undeclared:
 * that is the only situation in which it matters whether the trigger could see it.
 */
export function evaluateCandidateStateBypass226(
  c: Case226, contract: ContractUnderTest226,
): MeasureResult226 {
  if (c.owedProperties.length === 0) {
    return {
      measure: 'CANDIDATE_STATE_BYPASS', verdict: 'NOT_EXERCISED',
      reason: 'no property is owed, so no declaration can be bypassed',
    };
  }
  const covered = coveredOwedKeys(c);
  const missing = c.owedProperties.filter(p => !covered.has(p.key));
  if (missing.length === 0) {
    return {
      measure: 'CANDIDATE_STATE_BYPASS', verdict: 'NOT_EXERCISED',
      reason: 'every owed property was declared, so the trigger had no opportunity to be bypassed',
    };
  }
  const bypassed = missing
    .map(p => carrierFor(c, p.key))
    .filter((k): k is CandidateFixture226 => k !== undefined)
    .filter(k => !triggerReaches(c, k, contract).reached);
  if (bypassed.length > 0) {
    return {
      measure: 'CANDIDATE_STATE_BYPASS', verdict: 'DEFECTIVE',
      reason: bypassed.map(k => `${k.candidateKey}: ${triggerReaches(c, k, contract).why}`)
        .join('; '),
    };
  }
  return {
    measure: 'CANDIDATE_STATE_BYPASS', verdict: 'COMPLIANT',
    reason: `every candidate carrying an undeclared owed property is reached by this contract's `
      + `declaration trigger (${missing.map(p => p.key).join(', ')}); no self-reported state `
      + 'exempts a candidate from the declaration analysis',
  };
}

export function evaluateAll226(
  c: Case226, contract: ContractUnderTest226,
): {
  readonly results: Readonly<Record<Measure226, MeasureResult226>>;
  readonly classifications: readonly PropertyClassification226[];
} {
  const pi = evaluatePropertyIdentity226(c, contract);
  return {
    results: {
      DECLARATION_RECALL: evaluateRecall226(c, contract),
      PROPERTY_IDENTITY: pi.result,
      INDEPENDENCE: evaluateIndependence226(c, contract),
      RESTRAINT: evaluateRestraint226(c, contract),
      REQUIRED_ACT_CONTROL: evaluateRequiredActControl226(c, contract),
      REQUIRED_ARTIFACT_CONTROL: evaluateRequiredArtifactControl226(c, contract),
      CANDIDATE_STATE_BYPASS: evaluateCandidateStateBypass226(c, contract),
    },
    classifications: pi.classifications,
  };
}

// ---------------------------------------------------------------- the preflight

export interface PreflightCheck {
  readonly id: string;
  readonly what: string;
  readonly passed: boolean;
  readonly detail: string;
}

export interface PreflightResult {
  readonly passed: boolean;
  readonly checks: readonly PreflightCheck[];
}

/**
 * MACHINE-CHECKABLE PREFLIGHT, RUN BEFORE THE INSTRUMENT IS FROZEN. §224's instrument carried an
 * authoring defect that only surfaced during scoring, and §225 carried a case whose second owed
 * property was stated as established by its own observation. Both are classes of error a preflight
 * catches. If any check here fails, the DEVELOPMENT instrument is repaired before freezing; a
 * frozen instrument is never revised.
 */
export function preflight226(cases: readonly Case226[] = CASES_226): PreflightResult {
  const checks: PreflightCheck[] = [];
  const add = (id: string, what: string, bad: readonly string[]): void => {
    checks.push({
      id, what, passed: bad.length === 0,
      detail: bad.length === 0 ? 'clean' : bad.join(' | '),
    });
  };

  // P1. No expected unresolved property is simultaneously stated as established.
  add('P1', 'no owed property collides with a stated established fact',
    cases.flatMap(c => c.owedProperties.flatMap(p => c.establishedFacts
      .map(f => ({ f, s: overlap(p.proposition, f) }))
      .filter(x => x.s >= DUPLICATE_COLLISION)
      .map(x => `${c.caseId}/${p.key} overlaps established fact "${x.f}" at ${x.s.toFixed(3)}`))));

  // P1b. Every owed property states why it is genuinely open.
  add('P1b', 'every owed property records why it is genuinely open',
    cases.flatMap(c => c.owedProperties
      .filter(p => p.whyGenuinelyOpen.trim().length < 40)
      .map(p => `${c.caseId}/${p.key} has no substantive whyGenuinelyOpen`)));

  // P2. Expected declaration count matches the enumerated unresolved properties.
  add('P2', 'expected declaration count equals the number of owed properties',
    cases.filter(c => c.expectedDeclarationCount !== c.owedProperties.length)
      .map(c => `${c.caseId}: expected ${c.expectedDeclarationCount}, owed `
        + `${c.owedProperties.length}`));

  // P2b. Expected controlling property keys match the owed set exactly.
  add('P2b', 'expected controlling property keys match the owed set exactly',
    cases.filter(c => {
      const a = [...c.expectedControllingPropertyKeys].sort().join(',');
      const b = c.owedProperties.map(p => p.key).sort().join(',');
      return a !== b;
    }).map(c => `${c.caseId}: keys do not match the owed set`));

  // P3. Every scored axis is explicitly preregistered, under both contracts.
  add('P3', 'every measure is preregistered for every case under both contracts',
    cases.flatMap(c => MEASURES_226.flatMap(m => [
      ...(c.expectedUnder224[m] === undefined ? [`${c.caseId}/${m} missing under §224`] : []),
      ...(c.expectedUnder226[m] === undefined ? [`${c.caseId}/${m} missing under §226`] : []),
    ])));

  // P4. No duplicate property under different wording.
  add('P4', 'no two owed properties in a case are the same property reworded',
    cases.flatMap(c => c.owedProperties.flatMap((p, i) => c.owedProperties.slice(i + 1)
      .map(q => ({ q, s: overlap(p.proposition, q.proposition) }))
      .filter(x => x.s >= DUPLICATE_COLLISION)
      .map(x => `${c.caseId}: ${p.key} and ${x.q.key} overlap at ${x.s.toFixed(3)}`))));

  // P4b. No near neighbour is the owed property reworded.
  add('P4b', 'no prohibited near neighbour is the owed property reworded',
    cases.flatMap(c => c.owedProperties.flatMap(p => p.prohibited
      .map(f => ({ f, s: overlap(p.proposition, f.text) }))
      .filter(x => x.s >= DUPLICATE_COLLISION)
      .map(x => `${c.caseId}/${p.key}: "${x.f.text}" overlaps the owed property at `
        + `${x.s.toFixed(3)}`))));

  // P5. Restraint cases genuinely contain zero decision-critical unresolved properties.
  add('P5', 'restraint cases owe nothing and declare nothing; owing cases state no restraint basis',
    cases.flatMap(c => {
      const bad: string[] = [];
      if (c.restraintBasis !== null && c.owedProperties.length > 0) {
        bad.push(`${c.caseId}: a restraint basis is stated and ${c.owedProperties.length} `
          + 'property/properties are owed');
      }
      if (c.restraintBasis === null && c.owedProperties.length === 0) {
        bad.push(`${c.caseId}: nothing is owed and no restraint basis is stated`);
      }
      if (c.restraintBasis !== null && c.output.declarations.length > 0) {
        bad.push(`${c.caseId}: a restraint case whose fixture emits a declaration`);
      }
      return bad;
    }));

  // P6. Closed kind sets.
  add('P6', 'every owed kind and every prohibited kind is in its closed set',
    cases.flatMap(c => [
      ...c.owedProperties.filter(p => !(OWED_KINDS as readonly string[]).includes(p.kind))
        .map(p => `${c.caseId}/${p.key}: owed kind ${p.kind}`),
      ...c.owedProperties.flatMap(p => p.prohibited
        .filter(f => !(PROHIBITED_KINDS as readonly string[]).includes(f.kind))
        .map(f => `${c.caseId}/${p.key}: prohibited kind ${f.kind}`)),
    ]));

  // P7. Required act / artifact flags agree with the owed kinds.
  add('P7', 'required act and artifact flags agree with the owed kinds',
    cases.flatMap(c => {
      const hasAct = c.owedProperties.some(p => p.kind === 'REQUIRED_ACT');
      const hasArt = c.owedProperties.some(p => p.kind === 'REQUIRED_ARTIFACT');
      const bad: string[] = [];
      if (hasAct !== c.requiredActSemanticsApply) bad.push(`${c.caseId}: act flag disagrees`);
      if (hasArt !== c.requiredArtifactSemanticsApply) {
        bad.push(`${c.caseId}: artifact flag disagrees`);
      }
      return bad;
    }));

  // P8. Non-facts are disjoint from established facts and from owed properties.
  add('P8', 'no enumerated non-fact is also an established fact or an owed property',
    cases.flatMap(c => c.nonFacts.flatMap(n => [
      ...c.establishedFacts.filter(f => overlap(n, f) >= DUPLICATE_COLLISION)
        .map(f => `${c.caseId}: non-fact "${n}" overlaps established fact "${f}"`),
      ...c.owedProperties.filter(p => overlap(n, p.proposition) >= DUPLICATE_COLLISION)
        .map(p => `${c.caseId}: non-fact "${n}" overlaps owed property ${p.key}`),
    ])));

  // P9. The fixture matches what the case says it emits, and carriers are well formed.
  add('P9', 'each fixture matches its stated emitted count and carries each owed property once',
    cases.flatMap(c => {
      const bad: string[] = [];
      if (c.output.declarations.length !== c.emittedDeclarationCount) {
        bad.push(`${c.caseId}: fixture emits ${c.output.declarations.length}, stated `
          + `${c.emittedDeclarationCount}`);
      }
      for (const k of c.output.candidates) {
        if (k.carriesOwedPropertyKey !== null
          && !c.owedProperties.some(p => p.key === k.carriesOwedPropertyKey)) {
          bad.push(`${c.caseId}/${k.candidateKey} carries unknown key ${k.carriesOwedPropertyKey}`);
        }
      }
      for (const p of c.owedProperties) {
        const n = c.output.candidates.filter(k => k.carriesOwedPropertyKey === p.key).length;
        if (n !== 1) bad.push(`${c.caseId}/${p.key} is carried by ${n} candidates, expected 1`);
      }
      return bad;
    }));

  // P10. Bypass cases are well formed: the carrier really is outside the §224 enumeration.
  add('P10', 'every preregistered bypass case has a carrier the §224 trigger cannot reach',
    cases.filter(c => c.isCandidateStateBypassCase).flatMap(c => {
      const carriers = c.output.candidates.filter(k => k.carriesOwedPropertyKey !== null);
      const escaping = carriers.filter(k => !triggerReaches(c, k, 'BASE_224').reached);
      if (escaping.length === 0) {
        return [`${c.caseId}: preregistered as a bypass case but every carrier is reached by §224`];
      }
      return escaping.filter(k => !k.reasoningNamesUnestablishedFact)
        .map(k => `${c.caseId}/${k.candidateKey}: escapes the §224 trigger but its own reasoning `
          + 'does not name an unestablished fact, so the bypass is not demonstrated');
    }));

  // P11. The allow-list floor is reachable: each owed proposition classifies as itself.
  add('P11', 'each owed proposition classifies as the owed property against its own near neighbours',
    cases.flatMap(c => c.owedProperties.map(p => {
      const probe = classifyDeclaredProperty226(c, {
        declarationId: `probe-${p.key}`, missingFact: p.proposition, affectedDecision: '',
        branchA: '', branchB: '', decisionIfA: '', decisionIfB: '',
        attemptsOwedPropertyKey: p.key,
      });
      return probe.classifiedAs === 'OWED_PROPERTY' && probe.nearestOwedKey === p.key
        ? null
        : `${c.caseId}/${p.key}: its own proposition classifies as ${probe.classifiedAs} `
          + `(owed ${probe.nearestOwedScore}, nearest neighbour ${probe.nearestProhibitedScore})`;
    }).filter((x): x is string => x !== null)));

  // P12. Each root cause is exercised by at least one case that discriminates the contracts.
  add('P12', 'each §226 root cause is exercised by a case whose preregistered verdicts differ',
    (['RC5', 'RC6', 'RC7'] as const).flatMap(rc => {
      const hits = cases.filter(c => c.exercisesRootCause === rc
        && MEASURES_226.some(m => c.expectedUnder224[m] !== c.expectedUnder226[m]));
      return hits.length === 0 ? [`${rc}: no case discriminates the contracts`] : [];
    }));

  // P13. Over-correction guards exist for both the act and the artifact.
  add('P13', 'a legitimate required act and a legitimate required artifact are both present',
    [
      ...(cases.some(c => c.requiredActSemanticsApply
        && c.expectedUnder226.PROPERTY_IDENTITY === 'COMPLIANT')
        ? [] : ['no legitimate required-act case is present']),
      ...(cases.some(c => c.requiredArtifactSemanticsApply
        && c.expectedUnder226.PROPERTY_IDENTITY === 'COMPLIANT')
        ? [] : ['no legitimate required-artifact case is present']),
    ]);

  // P14. Case identifiers are unique.
  add('P14', 'case identifiers are unique', (() => {
    const seen = new Set<string>(); const dup: string[] = [];
    for (const c of cases) { if (seen.has(c.caseId)) dup.push(c.caseId); seen.add(c.caseId); }
    return dup;
  })());

  // P15. Every emitted entry is attributed to a real owed property of its own case.
  add('P15', 'every emitted declaration is attributed to an owed property of its own case',
    cases.flatMap(c => c.output.declarations.flatMap(d => {
      if (d.attemptsOwedPropertyKey === null) {
        return [`${c.caseId}/${d.declarationId} is attributed to no owed property`];
      }
      return c.owedProperties.some(p => p.key === d.attemptsOwedPropertyKey)
        ? []
        : [`${c.caseId}/${d.declarationId} is attributed to unknown key `
          + `${d.attemptsOwedPropertyKey}`];
    })));

  // P16. THE CHECK THAT MUST PASS BEFORE THE FREEZE. The preregistered expectation table and the
  // evaluator must already agree, case by case, measure by measure, contract by contract. There is
  // no provider here and no outcome to see: a disagreement is purely an instrument-authoring
  // defect, and §224's instrument carried exactly that defect into scoring. Running it here means
  // the instrument cannot be frozen while its own two halves contradict each other -- and once it
  // is frozen, HAZLENZ_INVARIANTS 21 means it is never revised.
  add('P16', 'the preregistered expectations and the evaluator already agree, both contracts',
    cases.flatMap(c => (['BASE_224', 'REMEDIATED_226'] as const).flatMap(contract => {
      const r = evaluateAll226(c, contract);
      const table = contract === 'BASE_224' ? c.expectedUnder224 : c.expectedUnder226;
      return MEASURES_226
        .filter(m => r.results[m].verdict !== table[m])
        .map(m => `${c.caseId}/${m}/${contract}: preregistered ${table[m]}, evaluator says `
          + `${r.results[m].verdict}`);
    })));

  return { passed: checks.every(k => k.passed), checks };
}
