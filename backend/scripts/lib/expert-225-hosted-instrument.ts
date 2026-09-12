/**
 * §225 -- BOUNDED HOSTED FIRST-PASS DECLARATION CAPABILITY CONFIRMATION: THE FROZEN INSTRUMENT.
 * 8 CASES · 2 ARMS · 16 PLANNED CALLS + 2 CONTINGENCY · CEILING 18 · SPEND CEILING USD 1.76.
 * ZERO DATABASE OPERATIONS. NO CUSTOMER ACTIVATION.
 *
 * ==================== WHAT §224 FROZE AND WHAT §225 AUTHORED ====================
 *
 * STATED BEFORE EXECUTION, NOT DISCOVERED AFTER IT.
 *
 * SECTION-224-HOSTED-CONFIRMATION-DESIGN.md froze, for each of eight cases: the case identity, the
 * SETTING, the TRAP it sets, and the FROZEN CONTROLLING PROPERTY. It also froze the arms, the
 * model, the caching posture, the call count, the projected spend, the ceiling, the judgment
 * structure and the acceptance criteria. It did NOT author the observation text, the supplied
 * context, the hazard families or the forbidden-substitution enumeration.
 *
 * §225 authors those, constrained by the frozen trap and the frozen controlling property. Each
 * `frozenBySection224` field below is quoted VERBATIM from the §224 table; each `authoredIn225`
 * field is new. The two are kept separate in the record so the provenance of every element is
 * checkable rather than asserted.
 *
 * THE RISK THIS CARRIES. The §225 case bodies were authored by the same session that wrote the
 * §224 remediation. The paired design means authoring bias cannot manufacture a DIFFERENCE between
 * the arms -- both arms receive byte-identical observations, context, schema and parameters, and
 * differ only in the system prompt. But the primary gates are absolute on the remediated arm, not
 * on the difference, so authoring bias could in principle manufacture a pass there. That is
 * recorded here, before any spend, and repeated in the report. It is not mitigated away and it
 * should weigh on how much the remediated-arm result is relied upon.
 *
 * WHAT IS NOT AUTHORED HERE. The forbidden substitutions are DIAGNOSTIC ANNOTATION, not truth.
 * Property identity is scored against the §224-frozen controlling proposition alone. The
 * substitution list only names what the near neighbours are, so a miss can be described.
 */

export const INSTRUMENT_225_VERSION = 'hazlenz.expert.225.hosted-confirmation.v1' as const;

export const MAX_PROVIDER_CALLS_225 = 18;
export const PLANNED_CALLS_225 = 16;
export const CONTINGENCY_CALLS_225 = 2;
export const SPEND_CEILING_USD_225 = 1.76;
export const PROJECTED_SPEND_USD_225 = 1.4002;
export const DATABASE_OPERATIONS_225 = 0;
export const RETRIES_AUTHORIZED_225 = 0;

export type Arm225 = 'PREDECESSOR_210J' | 'REMEDIATED_224';
export const ARMS_225: readonly Arm225[] = ['PREDECESSOR_210J', 'REMEDIATED_224'];

export type OwedKind225 = 'HAZARD_STATE' | 'REQUIRED_ACT' | 'REQUIRED_ARTIFACT';
export type SubstitutionKind225 =
  'CONTROL_STATE' | 'EVIDENCE_PROXY' | 'VERIFICATION_ACT' | 'DOCUMENT' | 'ADJACENT_CONDITION';

export interface OwedProperty225 {
  readonly key: string;
  /** VERBATIM from the §224 frozen table. */
  readonly proposition: string;
  readonly kind: OwedKind225;
  /** §225 diagnostic annotation. NOT truth. Property identity is scored on `proposition`. */
  readonly nearNeighbours: readonly { readonly kind: SubstitutionKind225; readonly text: string }[];
}

export interface HostedCase225 {
  readonly caseId: string;
  /** VERBATIM from the §224 frozen table. */
  readonly frozenBySection224: {
    readonly setting: string;
    readonly trap: string;
    readonly frozenControllingProperty: string;
  };
  readonly authoredIn225: {
    readonly observation: string;
    readonly suppliedContext: { readonly location: string; readonly task: string };
    readonly jurisdiction: string;
    readonly hazardFamilies: readonly string[];
    readonly decisionUnderAnalysis: string;
  };
  readonly owedProperties: readonly OwedProperty225[];
  /** Non-null only where the frozen truth owes nothing. */
  readonly restraintBasis: string | null;
  /** Which primary gate this case is the control for. */
  readonly primaryGate:
  'DECLARATION_RECALL' | 'PROPERTY_IDENTITY' | 'INDEPENDENCE' | 'RESTRAINT'
  | 'REQUIRED_ACT_CONTROL' | 'REQUIRED_ARTIFACT_CONTROL';
  /** Confirms freshness: no IG observation, hazard family or span is reused. */
  readonly derivedFromIgCase: null;
}

export const HOSTED_CASES_225: readonly HostedCase225[] = [
  {
    caseId: 'H1',
    frozenBySection224: {
      setting: 'Mezzanine edge protection removed for a delivery, reinstatement state unrecorded; '
        + 'drop height not measured',
      trap: 'IG1-type: hazard ACTIVE under both branches, so the unknown looks to change nothing',
      frozenControllingProperty: 'what edge protection this opening requires, which turns on the '
        + 'drop height',
    },
    authoredIn225: {
      observation: 'A section of the mezzanine edge protection in the parts store was taken out '
        + 'last Thursday so a pallet of shelving could be craned up. The guardrail and toeboard are '
        + 'stacked against the wall and have not gone back. Stores staff walk past the open edge '
        + 'several times a day to reach the racking beyond it. The deck and the remaining rails are '
        + 'in good order and firmly fixed. Nobody has measured the drop from the mezzanine deck to '
        + 'the floor below, and the mezzanine was installed by a contractor who has since ceased '
        + 'trading.',
      suppliedContext: {
        location: 'agricultural machinery dealership, parts store mezzanine',
        task: 'walking past an unprotected mezzanine edge to reach racking',
      },
      jurisdiction: 'osha-general-industry',
      hazardFamilies: ['work_at_height', 'structural_failure'],
      decisionUnderAnalysis: 'whether stores staff may continue to use the mezzanine today, and '
        + 'under what protection',
    },
    owedProperties: [{
      key: 'H1-P1',
      proposition: 'what edge protection this opening requires, which turns on the drop height',
      kind: 'HAZARD_STATE',
      nearNeighbours: [
        { kind: 'VERIFICATION_ACT', text: 'whether the drop height has been measured' },
        { kind: 'DOCUMENT', text: 'whether the mezzanine installation drawings can be obtained' },
        { kind: 'CONTROL_STATE', text: 'whether the guardrail has been put back' },
      ],
    }],
    restraintBasis: null,
    primaryGate: 'DECLARATION_RECALL',
    derivedFromIgCase: null,
  },
  {
    caseId: 'H2',
    frozenBySection224: {
      setting: 'Portable appliance in a wet area, no test record and no visible damage',
      trap: 'IG8-type: model concludes nothing is missing while carrying its own '
        + 'INSUFFICIENT_EVIDENCE candidate',
      frozenControllingProperty: 'whether the appliance is in a condition safe for use in a wet '
        + 'location',
    },
    authoredIn225: {
      observation: 'A 240 volt submersible pump is being used to clear standing water from the '
        + 'wash bay floor drain. The operator is standing in the water while the pump runs. The '
        + 'lead and plug look sound with no cuts or scorching visible, and the pump body is not '
        + 'damaged. There is no test label on the pump and the maintenance office has no record of '
        + 'it ever being tested. The supply is a wall socket in the wash bay; nobody on site can '
        + 'say whether that circuit has residual current protection.',
      suppliedContext: {
        location: 'commercial vehicle depot, vehicle wash bay',
        task: 'clearing standing water with a portable submersible pump while standing in it',
      },
      jurisdiction: 'osha-general-industry',
      hazardFamilies: ['electrical', 'slips_trips_falls'],
      decisionUnderAnalysis: 'whether the pump may continue to be used in the wash bay today',
    },
    owedProperties: [{
      key: 'H2-P1',
      proposition: 'whether the appliance is in a condition safe for use in a wet location',
      kind: 'HAZARD_STATE',
      nearNeighbours: [
        { kind: 'DOCUMENT', text: 'whether a portable appliance test record exists for the pump' },
        { kind: 'VERIFICATION_ACT', text: 'whether the pump has been tested' },
        { kind: 'CONTROL_STATE', text: 'whether the socket circuit has residual current protection' },
      ],
    }],
    restraintBasis: null,
    primaryGate: 'DECLARATION_RECALL',
    derivedFromIgCase: null,
  },
  {
    caseId: 'H3',
    frozenBySection224: {
      setting: 'Paint spray booth, extraction fan audible but no airflow indication, operator inside',
      trap: 'IG10-type: control state substituted for condition',
      frozenControllingProperty: 'whether the booth atmosphere is safe to occupy without '
        + 'respiratory protection',
    },
    authoredIn225: {
      observation: 'A sprayer is inside the booth applying two-pack primer to a tailgate. He is '
        + 'wearing overalls and gloves but no respirator. The extraction fan can be heard running '
        + 'and the booth door is closed. The airflow indicator gauge on the booth wall reads zero '
        + 'and the sprayer says it has read zero for months and that everyone ignores it. The '
        + 'filters were last changed at an unknown date; the booth log ends in March.',
      suppliedContext: {
        location: 'accident repair centre, spray booth',
        task: 'applying two-pack primer inside the booth without respiratory protection',
      },
      jurisdiction: 'osha-general-industry',
      hazardFamilies: ['chemical_exposure', 'respiratory'],
      decisionUnderAnalysis: 'whether the sprayer may continue working in the booth as he is',
    },
    owedProperties: [{
      key: 'H3-P1',
      proposition: 'whether the booth atmosphere is safe to occupy without respiratory protection',
      kind: 'HAZARD_STATE',
      nearNeighbours: [
        { kind: 'CONTROL_STATE', text: 'whether the extraction fan is running' },
        { kind: 'CONTROL_STATE', text: 'whether the airflow indicator is working' },
        { kind: 'VERIFICATION_ACT', text: 'whether the booth airflow has been measured' },
        { kind: 'DOCUMENT', text: 'whether the booth log is up to date' },
      ],
    }],
    restraintBasis: null,
    primaryGate: 'PROPERTY_IDENTITY',
    derivedFromIgCase: null,
  },
  {
    caseId: 'H4',
    frozenBySection224: {
      setting: 'Scaffold handed over with a green tag dated before the last high wind',
      trap: 'evidence-proxy trap: the tag is the obvious observable',
      frozenControllingProperty: 'whether the scaffold is in a condition fit to be worked from now',
    },
    authoredIn225: {
      observation: 'Bricklayers are loading out onto the third lift of an independent scaffold this '
        + 'morning. The scafftag at the base is green and signed off eleven days ago. The storm on '
        + 'Sunday night took slates off the roof of the building opposite. Nobody has been up the '
        + 'scaffold since, and the scaffolding contractor is not due back on site until Thursday. '
        + 'From the ground the scaffold looks upright and the ties that are visible are in place.',
      suppliedContext: {
        location: 'housing refurbishment site, rear elevation scaffold',
        task: 'loading out bricks and mortar onto the third lift',
      },
      jurisdiction: 'osha-construction',
      hazardFamilies: ['work_at_height', 'structural_failure'],
      decisionUnderAnalysis: 'whether the bricklayers may load out and work from the scaffold today',
    },
    owedProperties: [{
      key: 'H4-P1',
      proposition: 'whether the scaffold is in a condition fit to be worked from now',
      kind: 'HAZARD_STATE',
      nearNeighbours: [
        { kind: 'DOCUMENT', text: 'whether the scafftag is current' },
        { kind: 'VERIFICATION_ACT', text: 'whether the scaffold has been inspected since the storm' },
        { kind: 'ADJACENT_CONDITION', text: 'whether the scaffolding contractor can attend' },
      ],
    }],
    restraintBasis: null,
    primaryGate: 'PROPERTY_IDENTITY',
    derivedFromIgCase: null,
  },
  {
    caseId: 'H5',
    frozenBySection224: {
      setting: 'Excavation with a battery-powered pump running and a supply cable crossing the spoil',
      trap: 'multi-gap: two independent unknowns, invited to be joined',
      frozenControllingProperty: '(a) whether the excavation sides are stable; (b) whether the '
        + 'cable is protected from damage',
    },
    authoredIn225: {
      observation: 'A drainage trench about shoulder deep runs across the yard. A groundworker is '
        + 'in it connecting a gully. The sides are unsupported and the spoil is heaped along the '
        + 'top edge; the ground is made up and nobody has recorded what it consists of or had it '
        + 'assessed. A pump sits at the bottom of the trench running off a generator at the yard '
        + 'gate, and its supply cable runs up the trench side, over the spoil heap and across the '
        + 'haul route where the telehandler turns. The cable is not ducted, covered or slung.',
      suppliedContext: {
        location: 'builders merchant yard, drainage works',
        task: 'connecting a gully in an unsupported trench with a pump cable crossing the haul route',
      },
      jurisdiction: 'osha-construction',
      hazardFamilies: ['excavation_collapse', 'electrical'],
      decisionUnderAnalysis: 'whether the groundworker may continue working in the trench today',
    },
    owedProperties: [
      {
        key: 'H5-P1',
        proposition: 'whether the excavation sides are stable',
        kind: 'HAZARD_STATE',
        nearNeighbours: [
          { kind: 'VERIFICATION_ACT', text: 'whether the ground conditions have been assessed' },
          { kind: 'CONTROL_STATE', text: 'whether trench support has been installed' },
        ],
      },
      {
        key: 'H5-P2',
        proposition: 'whether the cable is protected from damage',
        kind: 'HAZARD_STATE',
        nearNeighbours: [
          { kind: 'CONTROL_STATE', text: 'whether the generator has residual current protection' },
          { kind: 'VERIFICATION_ACT', text: 'whether the cable has been inspected' },
        ],
      },
    ],
    restraintBasis: null,
    primaryGate: 'INDEPENDENCE',
    derivedFromIgCase: null,
  },
  {
    caseId: 'H6',
    frozenBySection224: {
      setting: 'Lift shaft work where the permit requires a second isolation to be proved, and '
        + 'nobody can say it was',
      trap: 'required-act control: the act IS the property; must not be over-corrected into a '
        + 'condition',
      frozenControllingProperty: 'whether the second isolation was applied and proved before entry',
    },
    authoredIn225: {
      observation: 'Two engineers are working on the car top in a goods lift shaft. The permit for '
        + 'this job requires two isolations before anyone enters the shaft: the main supply '
        + 'disconnector locked off, and a second isolation of the door operator circuit locked off '
        + 'and proved dead at the point of work. The main disconnector is visibly locked with two '
        + 'padlocks and a tag. The permit box for the second isolation is blank, the engineer who '
        + 'set up the job has gone to another site, and neither man on the car top can say whether '
        + 'the second isolation was applied and proved before they went in.',
      suppliedContext: {
        location: 'distribution centre, goods lift shaft',
        task: 'working on the lift car top under a two-isolation permit',
      },
      jurisdiction: 'osha-general-industry',
      hazardFamilies: ['electrical', 'machinery_entanglement'],
      decisionUnderAnalysis: 'whether the engineers may remain on the car top and continue working',
    },
    owedProperties: [{
      key: 'H6-P1',
      proposition: 'whether the second isolation was applied and proved before entry',
      kind: 'REQUIRED_ACT',
      nearNeighbours: [
        { kind: 'DOCUMENT', text: 'whether the permit box was filled in' },
      ],
    }],
    restraintBasis: null,
    primaryGate: 'REQUIRED_ACT_CONTROL',
    derivedFromIgCase: null,
  },
  {
    caseId: 'H7',
    frozenBySection224: {
      setting: 'Pressure vessel due for periodic examination with no report on site',
      trap: 'required-artifact control: the artifact IS the statutory precondition',
      frozenControllingProperty: 'whether a current examination report exists for this vessel',
    },
    authoredIn225: {
      observation: 'The bakery runs a steam-raising boiler feeding the proving cabinets. It is in '
        + 'service and firing now. The written scheme of examination requires a periodic '
        + 'examination every fourteen months. The last report in the plant room folder is dated '
        + 'nineteen months ago. The engineering manager believes an examination was carried out in '
        + 'the spring but cannot produce a report, and the insurer that carries out the '
        + 'examinations has not been contacted. The boiler itself shows no leaks, the gauges read '
        + 'normally and the safety valve was lifted manually last week without incident.',
      suppliedContext: {
        location: 'commercial bakery, boiler plant room',
        task: 'operating a steam-raising boiler in service',
      },
      jurisdiction: 'osha-general-industry',
      hazardFamilies: ['pressure_systems', 'thermal'],
      decisionUnderAnalysis: 'whether the boiler may remain in service today',
    },
    owedProperties: [{
      key: 'H7-P1',
      proposition: 'whether a current examination report exists for this vessel',
      kind: 'REQUIRED_ARTIFACT',
      nearNeighbours: [
        { kind: 'ADJACENT_CONDITION', text: 'whether the boiler appears to be in good condition' },
        { kind: 'CONTROL_STATE', text: 'whether the safety valve lifts' },
      ],
    }],
    restraintBasis: null,
    primaryGate: 'REQUIRED_ARTIFACT_CONTROL',
    derivedFromIgCase: null,
  },
  {
    caseId: 'H8',
    frozenBySection224: {
      setting: 'Fume cupboard with a current airflow certificate, sash at the marked height, alarm '
        + 'silent and tested this week',
      trap: 'restraint: every control stated present and current',
      frozenControllingProperty: 'none — no declaration is correct',
    },
    authoredIn225: {
      observation: 'A technician is decanting solvent inside a fume cupboard in the QC laboratory. '
        + 'The sash is down to the marked working height and the marker is clearly visible. The '
        + 'airflow certificate taped to the frame is dated five weeks ago and states a face '
        + 'velocity within the specified range. The low-flow alarm is silent and the laboratory '
        + 'log records that it was function-tested on Monday and sounded correctly. The technician '
        + 'is wearing the issued gloves and safety spectacles and the solvent container is closed '
        + 'between pours.',
      suppliedContext: {
        location: 'contract laboratory, quality control room',
        task: 'decanting solvent inside a fume cupboard',
      },
      jurisdiction: 'osha-general-industry',
      hazardFamilies: ['chemical_exposure', 'respiratory'],
      decisionUnderAnalysis: 'whether the technician may continue decanting as she is',
    },
    owedProperties: [],
    restraintBasis: 'every control the hazard turns on is stated as present and current: the sash '
      + 'is at the marked height, the face velocity is certified within range five weeks ago, the '
      + 'low-flow alarm was function-tested this week and is silent, and personal protection is '
      + 'worn. No answer to any remaining unknown changes what is done today.',
    primaryGate: 'RESTRAINT',
    derivedFromIgCase: null,
  },
];

// ---------------------------------------------------------------- the frozen gates

/**
 * Transcribed from SECTION-224-HOSTED-CONFIRMATION-DESIGN.md "## Acceptance", unchanged.
 * Each is pass/fail at zero occurrence on the REMEDIATED arm. The predecessor arm is diagnostic
 * comparison evidence and may never weaken one of these.
 */
export const PRIMARY_GATES_225 = [
  {
    id: 'G1', name: 'DECLARATION_RECALL',
    statement: 'recall of the frozen owed properties is 100%, with zero silent omissions',
    threshold: 'ZERO_OMISSION', scoredOn: 'REMEDIATED_224',
  },
  {
    id: 'G2', name: 'PROPERTY_IDENTITY',
    statement: 'controlling-property identity is 100%, with zero substitutions of any forbidden kind',
    threshold: 'ZERO_SUBSTITUTION', scoredOn: 'REMEDIATED_224',
  },
  {
    id: 'G3', name: 'INDEPENDENCE',
    statement: 'independence is 100% on H5',
    threshold: 'ZERO_JOINED_FACTS', scoredOn: 'REMEDIATED_224',
  },
  {
    id: 'G4', name: 'RESTRAINT',
    statement: 'zero declarations on H8',
    threshold: 'ZERO_FALSE_DECLARATION', scoredOn: 'REMEDIATED_224',
  },
  {
    id: 'G5', name: 'REQUIRED_ACT_CONTROL',
    statement: 'H6 retains its act-shaped property',
    threshold: 'ZERO_OVER_CORRECTION', scoredOn: 'REMEDIATED_224',
  },
  {
    id: 'G6', name: 'REQUIRED_ARTIFACT_CONTROL',
    statement: 'H7 retains its artifact-shaped property',
    threshold: 'ZERO_OVER_CORRECTION', scoredOn: 'REMEDIATED_224',
  },
  {
    id: 'G7', name: 'INSTRUMENT_DISCRIMINATES',
    statement: 'the §210J arm reproduces at least one of the three §221 failure shapes, without '
      + 'which the instrument has not demonstrated that it can discriminate at all',
    threshold: 'AT_LEAST_ONE', scoredOn: 'PREDECESSOR_210J',
  },
] as const;

export const GATE_RULE_225 = {
  reporting: 'PER_GATE_OCCURRENCE_COUNT',
  mayBeOffsetByAnAggregateScore: false,
  mayBeOffsetByAnotherGate: false,
  predecessorArmMayWeakenARemediatedGate: false,
  headlineAccuracyPercentageReported: false,
  notExercisedIsNeverAPass: true,
} as const;

/**
 * The §224 instrument-authoring defect, checked for dependency rather than assumed away.
 */
export const SECTION_224_DEFECT_DEPENDENCY = {
  defect: 'the §224 LOCAL instrument\'s per-case `expected` table understated which measures cases '
    + 'C3..C8 exercise; seven of forty conformance checks mismatched, every one resolving to '
    + 'COMPLIANT',
  affectedArtifact: 'SECTION-224-LOCAL-INSTRUMENT.json, cases C1..C10',
  doesSection225DependOnIt: false,
  why: 'the §225 cases are H1..H8, authored separately, and the §225 gates are transcribed from the '
    + '§224 design document\'s Acceptance section, which makes no reference to the local '
    + 'instrument\'s per-case expected table. No §225 truth, denominator, threshold or gate reads '
    + 'any C-case expectation.',
  actionTaken: 'the frozen §224 instrument is preserved exactly and is not repaired or rewritten',
} as const;

export const CASE_FRESHNESS_225 = {
  everyCaseDerivedFromAnIgCase: false,
  igObservationsReused: 0,
  igSpansReused: 0,
  igHazardFamiliesReused: 0,
  note: 'H1..H8 use settings, hazard families and spans that appear in no §221 case. H1, H2 and H3 '
    + 'reproduce the SHAPE of the IG1, IG8 and IG10 traps, which is what the frozen design '
    + 'requires, on entirely different facts.',
} as const;
