/**
 * §227 -- FINAL BOUNDED HOSTED FIRST-PASS SEMANTIC CAPABILITY CONFIRMATION: THE FROZEN INSTRUMENT.
 * 8 CASES · 1 ARM · 8 PLANNED CALLS + 2 CONTINGENCY · CEILING 10 · SPEND CEILING USD 1.10.
 * ZERO DATABASE OPERATIONS. NO CUSTOMER ACTIVATION.
 *
 * ==================== WHAT §226 FROZE AND WHAT §227 AUTHORS ====================
 *
 * STATED BEFORE EXECUTION, NOT DISCOVERED AFTER IT.
 *
 * `SECTION-226-HOSTED-CONFIRMATION-DESIGN.md` froze the shape of this run: eight cases, one per
 * required coverage shape, single arm on the §226 contract, one call per case plus two contingency
 * calls spendable only on transport failure, the model, the caching posture, the projected spend,
 * the hard ceiling, the seven hard gates, the no-aggregate-compensation rule, the case-authoring
 * discipline, the preflight, and the stop rule. It explicitly did NOT author the case texts:
 *
 *   "the case texts it calls for are not authored here -- they are authored, preflighted and frozen
 *    in the authorized slice, before the first call."
 *
 * §227 authors them, each constrained by its frozen shape. `frozenBySection226` is quoted verbatim
 * from the design table; `authoredIn227` is new. The two are kept separate in the record so the
 * provenance of every element is checkable rather than asserted.
 *
 * ==================== THE LIMITATION THIS RUN CARRIES ====================
 *
 * THIS IS A SINGLE-ARM CONFIRMATION. There is no predecessor leg and no difference measure. Every
 * gate is absolute on the §226 arm.
 *
 * A PASS THEREFORE CANNOT SEPARATE CONTRACT CAPABILITY FROM CASE-AUTHORING EFFECTS. The cases below
 * were authored by the same session that wrote the §226 remediation. Nothing in a single-arm design
 * prevents an author from writing cases the contract happens to suit. That is recorded here, before
 * any spend, and repeated in the report. It is NOT mitigated away, and it must weigh on how much
 * this result is relied upon.
 *
 * It is accepted for one stated reason: §225 already supplied controlled paired-arm evidence that
 * the instruction is what moved the targeted behaviour, on eight byte-identical paired cases. That
 * question does not need re-purchasing. §227 answers only:
 *
 *   DOES THE CURRENT CANDIDATE CONTRACT SATISFY THE FROZEN CAPABILITY REQUIREMENTS ON THESE FRESH
 *   CASES?
 *
 * No more than that may be claimed from it.
 *
 * ==================== WHAT COUNTS AS RECALL ====================
 *
 * A decision-critical property counts as recalled ONLY when the required structured declaration
 * exists in `unresolvedFactDeclarations`. Recognition in prose, in hazard-candidate reasoning, in
 * an uncertainty statement, in a clarification or in the summary does NOT substitute for it. This
 * is the whole point of the defect family under test, and it is stated before execution.
 *
 * ==================== WHAT IS AND IS NOT TRUTH HERE ====================
 *
 * `proposition` is truth: property identity is scored against it alone. `prohibited` is DIAGNOSTIC
 * ANNOTATION naming the near neighbours, so a miss can be described rather than merely asserted. A
 * declaration is not wrong because it matches an annotation and not right because it misses one.
 */

export const INSTRUMENT_227_VERSION = 'hazlenz.expert.227.hosted-capability-confirmation.v1' as const;

export const MAX_PROVIDER_CALLS_227 = 10;
export const PLANNED_CALLS_227 = 8;
export const CONTINGENCY_CALLS_227 = 2;
export const SPEND_CEILING_USD_227 = 1.10;
export const PROJECTED_SPEND_USD_227 = 0.72;
export const DATABASE_OPERATIONS_227 = 0;
export const SEMANTIC_PREFERENCE_RETRIES_AUTHORIZED_227 = 0;

/**
 * The ONLY authorized reason to spend a contingency call, transcribed from the §226 design. A
 * contingency call spent for any other reason is a protocol violation and ends the run.
 */
export const CONTINGENCY_POLICY_227 = {
  authorizedReason:
    'a transport or HTTP failure with no usable response — failureClass TRANSPORT_TRANSIENT or '
    + 'TRANSPORT_STRUCTURAL, where the call did not reach inference',
  forbiddenReasons: [
    'replacing a semantically wrong answer',
    'improving a score',
    'testing revised wording',
    'modifying a case',
    'obtaining a second draw because the first answer was unfavourable',
  ],
  everyUseMustRecordItsExactReason: true,
} as const;

export type Arm227 = 'REMEDIATED_226';
export const ARM_227: Arm227 = 'REMEDIATED_226';
export const SINGLE_ARM_BY_DESIGN = true;

export type OwedKind227 = 'HAZARD_STATE' | 'REQUIRED_ACT' | 'REQUIRED_ARTIFACT';

export type ProhibitedKind227 =
  'CONTROL_STATE' | 'EVIDENCE_PROXY' | 'VERIFICATION_ACT' | 'DOCUMENT' | 'PROCESS_STEP'
  | 'ADJACENT_CONDITION' | 'UNDERLYING_ACT_BENEATH_ARTIFACT';

export type Shape227 =
  'CANDIDATE_STATE_BYPASS' | 'CONTROL_STATE_PROXY' | 'VERIFICATION_ACT_PROXY'
  | 'LEGITIMATE_REQUIRED_ACT' | 'LEGITIMATE_REQUIRED_ARTIFACT' | 'TWO_INDEPENDENT_PROPERTIES'
  | 'SAFE_OR_NEGATED_RESTRAINT' | 'ORDINARY_NON_DECISION_CRITICAL_RESTRAINT';

export type Measure227 =
  'DECLARATION_RECALL' | 'PROPERTY_IDENTITY' | 'INDEPENDENCE' | 'RESTRAINT'
  | 'REQUIRED_ACT_CONTROL' | 'REQUIRED_ARTIFACT_CONTROL' | 'CANDIDATE_STATE_BYPASS';

export const MEASURES_227: readonly Measure227[] = [
  'DECLARATION_RECALL', 'PROPERTY_IDENTITY', 'INDEPENDENCE', 'RESTRAINT',
  'REQUIRED_ACT_CONTROL', 'REQUIRED_ARTIFACT_CONTROL', 'CANDIDATE_STATE_BYPASS',
];

export interface OwedProperty227 {
  readonly key: string;
  /** TRUTH. Property identity is scored against this proposition alone. */
  readonly proposition: string;
  readonly kind: OwedKind227;
  /** Why this is genuinely open on the supplied facts. Required, non-empty. */
  readonly whyGenuinelyOpen: string;
  /** DIAGNOSTIC ANNOTATION, not truth. Names the near neighbours so a miss can be described. */
  readonly prohibited: readonly { readonly kind: ProhibitedKind227; readonly text: string }[];
}

export interface HostedCase227 {
  readonly caseId: string;
  /** VERBATIM from the §226 frozen design table. */
  readonly frozenBySection226: {
    readonly shape: Shape227;
    readonly whatItTests: string;
    readonly primaryGate: string;
  };
  readonly authoredIn227: {
    readonly observation: string;
    readonly suppliedContext: { readonly location: string; readonly task: string };
    readonly jurisdiction: string;
    readonly hazardFamilies: readonly string[];
    readonly decisionUnderAnalysis: string;
  };
  /** What the supplied observation actually states. Nothing owed may appear here. */
  readonly establishedFacts: readonly string[];
  /** The properties genuinely decision-controlling here. Empty means none is owed. */
  readonly owedProperties: readonly OwedProperty227[];
  /** Real unknowns that bear on nothing decided today. Never owed. */
  readonly nonFacts: readonly string[];
  /** Non-null only where the frozen truth owes nothing. */
  readonly restraintBasis: string | null;
  readonly expectedDeclarationCount: number;
  readonly expectedControllingPropertyKeys: readonly string[];
  readonly requiredActSemanticsApply: boolean;
  readonly requiredArtifactSemanticsApply: boolean;
  /** Every measure this case genuinely exercises gets a judgment slot. §221 D1, closed here. */
  readonly scoredMeasures: readonly Measure227[];
  /** Freshness attestation: no observation, hazard family or span reused from a prior cohort. */
  readonly derivedFromPriorCase: null;
}

// ---------------------------------------------------------------- the eight cases

export const HOSTED_CASES_227: readonly HostedCase227[] = [
  {
    caseId: 'K1',
    frozenBySection226: {
      shape: 'CANDIDATE_STATE_BYPASS',
      whatItTests: 'an owed property sitting under a candidate the model has every invitation to '
        + 'assert ACTIVE or CONTROLLED',
      primaryGate: 'G1',
    },
    authoredIn227: {
      observation: 'A contractor is cutting through a redundant steel pipe with a petrol '
        + 'cut-off saw inside the bunded area of a farm chemical store. Sparks are coming off the '
        + 'cut and falling onto the bund floor. The pipe was part of a dosing line that was drained '
        + 'and capped several years ago; nobody on the farm can say what product it carried and no '
        + 'test of the residue inside it has been done. A dry powder extinguisher is on the ground '
        + 'beside the work and a second man is standing by as fire watch.',
      suppliedContext: {
        location: 'arable farm, chemical store bunded area',
        task: 'cutting out a redundant dosing pipe with a petrol cut-off saw',
      },
      jurisdiction: 'osha-general-industry',
      hazardFamilies: ['fire_and_explosion', 'chemical_exposure'],
      decisionUnderAnalysis: 'whether the cutting may go ahead today, and under what precautions',
    },
    establishedFacts: [
      'a petrol cut-off saw is being used on the pipe and sparks are being produced',
      'the work is inside the bunded area of a chemical store',
      'the pipe was drained and capped several years ago',
      'nobody can say what product the line carried',
      'no test of the residue inside the pipe has been done',
      'a dry powder extinguisher and a fire watch are present',
    ],
    owedProperties: [{
      key: 'K1-P1',
      proposition: 'whether the residue remaining inside this pipe can ignite or explode when the '
        + 'pipe is cut',
      kind: 'HAZARD_STATE',
      whyGenuinelyOpen: 'The product the line carried is not stated and nobody present can name it, '
        + 'and no test of the residue has been done. Draining and capping a line is stated and does '
        + 'not establish that nothing ignitable remains in it. Whether ordinary hot-work precautions '
        + 'suffice, or the pipe must be cleaned, purged or cold-cut instead, turns on the answer.',
      prohibited: [
        { kind: 'CONTROL_STATE', text: 'whether a fire watch and an extinguisher are in place' },
        { kind: 'VERIFICATION_ACT', text: 'whether the pipe has been tested for residue' },
        { kind: 'DOCUMENT', text: 'whether the product records for the dosing line can be found' },
        { kind: 'PROCESS_STEP', text: 'whether a hot work permit has been raised' },
        { kind: 'ADJACENT_CONDITION', text: 'whether sparks are reaching combustible material' },
      ],
    }],
    nonFacts: [
      'who last operated the dosing line before it was capped',
      'how many metres of pipe are to be removed',
    ],
    restraintBasis: null,
    expectedDeclarationCount: 1,
    expectedControllingPropertyKeys: ['K1-P1'],
    requiredActSemanticsApply: false,
    requiredArtifactSemanticsApply: false,
    scoredMeasures: ['DECLARATION_RECALL', 'PROPERTY_IDENTITY', 'CANDIDATE_STATE_BYPASS'],
    derivedFromPriorCase: null,
  },

  {
    caseId: 'K2',
    frozenBySection226: {
      shape: 'CONTROL_STATE_PROXY',
      whatItTests: 'a working, audible, visible control standing between the model and the condition',
      primaryGate: 'G2',
    },
    authoredIn227: {
      observation: 'In a press shop the operators on the blanking line are wearing ear defenders '
        + 'rated SNR 30. The defenders are in good condition, correctly fitted and worn throughout '
        + 'the shift, and spares are kept at the line. The line was re-configured last month and a '
        + 'larger blanking press was installed in place of two smaller ones. The noise survey held '
        + 'on file was carried out before that change and recorded 92 dB(A) at these workstations. '
        + 'No measurement has been taken since the new press went in.',
      suppliedContext: {
        location: 'metal pressing works, blanking line',
        task: 'operating a newly installed blanking press',
      },
      jurisdiction: 'osha-general-industry',
      hazardFamilies: ['noise'],
      decisionUnderAnalysis: 'whether the blanking line may run today with the hearing protection '
        + 'currently in use',
    },
    establishedFacts: [
      'operators are wearing correctly fitted SNR 30 ear defenders throughout the shift',
      'the line was re-configured last month with a larger blanking press',
      'the noise survey on file predates that change and recorded 92 dB(A)',
      'no measurement has been taken since the new press was installed',
    ],
    owedProperties: [{
      key: 'K2-P1',
      proposition: 'whether the noise these operators are actually exposed to at the ear is within '
        + 'the exposure limit value',
      kind: 'HAZARD_STATE',
      whyGenuinelyOpen: 'The only noise figure supplied describes a machine arrangement that no '
        + 'longer exists. Nothing supplied states what the new press produces, so the exposure the '
        + 'defenders have to bring down is unstated. Whether the line may run as it is, or must be '
        + 'stopped or engineered, turns on the answer.',
      prohibited: [
        { kind: 'CONTROL_STATE', text: 'whether the operators are wearing hearing protection' },
        {
          kind: 'CONTROL_STATE',
          text: 'whether the SNR 30 defenders provide sufficient attenuation',
        },
        {
          kind: 'VERIFICATION_ACT',
          text: 'whether a noise survey has been carried out since the re-configuration',
        },
        { kind: 'DOCUMENT', text: 'whether the previous noise survey report is available' },
      ],
    }],
    nonFacts: [
      'which manufacturer supplied the new blanking press',
      'how many blanks the line is scheduled to produce today',
    ],
    restraintBasis: null,
    expectedDeclarationCount: 1,
    expectedControllingPropertyKeys: ['K2-P1'],
    requiredActSemanticsApply: false,
    requiredArtifactSemanticsApply: false,
    scoredMeasures: ['DECLARATION_RECALL', 'PROPERTY_IDENTITY'],
    derivedFromPriorCase: null,
  },

  {
    caseId: 'K3',
    frozenBySection226: {
      shape: 'VERIFICATION_ACT_PROXY',
      whatItTests: 'a condition whose obvious question is whether anyone has checked it',
      primaryGate: 'G2',
    },
    authoredIn227: {
      observation: 'A forklift struck the end upright of a run of pallet racking in a distribution '
        + 'warehouse three weeks ago. The upright carries a visible bow about a metre above floor '
        + 'level. Loaded pallets are still on that bay at three levels and pickers work the aisle '
        + 'through the day. The manufacturer\'s load notice is fixed to the end frame. No record of '
        + 'any racking inspection since the impact is held, and nobody can say whether the damage '
        + 'has been measured against the manufacturer\'s deflection criteria.',
      suppliedContext: {
        location: 'distribution warehouse, ambient pick aisle',
        task: 'picking from a bay whose end upright was struck by a forklift',
      },
      jurisdiction: 'osha-general-industry',
      hazardFamilies: ['structural_failure', 'struck_by'],
      decisionUnderAnalysis: 'whether the loaded pallets may stay on this bay and whether the aisle '
        + 'may be worked today',
    },
    establishedFacts: [
      'the end upright was struck by a forklift three weeks ago and carries a visible bow',
      'loaded pallets remain on the bay at three levels',
      'pickers work the aisle through the day',
      'the manufacturer\'s load notice is fixed to the end frame',
      'no record of any racking inspection since the impact is held',
    ],
    owedProperties: [{
      key: 'K3-P1',
      proposition: 'whether this damaged upright will still carry the loads that are on the bay',
      kind: 'HAZARD_STATE',
      whyGenuinelyOpen: 'A visible bow is stated and the load notice is stated, and neither states '
        + 'what the damaged member will now carry. Nothing supplied gives the size of the deflection '
        + 'or the load on the bay. Whether the bay must be off-loaded and the aisle closed now, or '
        + 'may be worked while a repair is arranged, turns on the answer.',
      prohibited: [
        {
          kind: 'VERIFICATION_ACT',
          text: 'whether the racking has been inspected since the impact',
        },
        {
          kind: 'VERIFICATION_ACT',
          text: 'whether the damage has been measured against the manufacturer\'s criteria',
        },
        { kind: 'DOCUMENT', text: 'whether a racking inspection report exists' },
        { kind: 'CONTROL_STATE', text: 'whether the bay has been off-loaded or barriered' },
        { kind: 'PROCESS_STEP', text: 'whether the impact was reported to the racking supplier' },
      ],
    }],
    nonFacts: [
      'which driver struck the upright',
      'what the pallets on the bay contain',
    ],
    restraintBasis: null,
    expectedDeclarationCount: 1,
    expectedControllingPropertyKeys: ['K3-P1'],
    requiredActSemanticsApply: false,
    requiredArtifactSemanticsApply: false,
    scoredMeasures: ['DECLARATION_RECALL', 'PROPERTY_IDENTITY'],
    derivedFromPriorCase: null,
  },

  {
    caseId: 'K4',
    frozenBySection226: {
      shape: 'LEGITIMATE_REQUIRED_ACT',
      whatItTests: 'the act IS the governing requirement; must not be over-corrected into a '
        + 'condition',
      primaryGate: 'G5',
    },
    authoredIn227: {
      observation: 'A heating engineer replaced a length of gas pipework serving the ranges in a '
        + 'commercial kitchen and reconnected the appliances yesterday afternoon. The company '
        + 'procedure, and the regulations it is written to, make a tightness test and a purge the '
        + 'precondition for putting the installation back into use. The engineer has finished on '
        + 'site and is not contactable this morning. The head chef has the ranges lit for the '
        + 'breakfast service. Nobody in the kitchen can say whether the test and the purge were '
        + 'done before the ranges were first used. The new joints look sound and there is no smell '
        + 'of gas in the kitchen.',
      suppliedContext: {
        location: 'commercial kitchen, gas range line',
        task: 'returning replaced gas pipework to use',
      },
      jurisdiction: 'osha-general-industry',
      hazardFamilies: ['fire_and_explosion', 'gas_systems'],
      decisionUnderAnalysis: 'whether the ranges may be used for the lunch service today',
    },
    establishedFacts: [
      'a length of gas pipework was replaced and the appliances reconnected yesterday afternoon',
      'procedure and regulation make the test and the purge the precondition for recommissioning',
      'the engineer has left site and is not contactable this morning',
      'the ranges are lit for the breakfast service',
      'the new joints look sound and there is no smell of gas',
    ],
    owedProperties: [{
      key: 'K4-P1',
      proposition: 'whether the tightness test and purge were carried out on this installation '
        + 'before it was put back into use',
      kind: 'REQUIRED_ACT',
      whyGenuinelyOpen: 'Procedure makes performing the test and the purge the precondition for '
        + 'returning the installation to use. Nobody present can say whether it happened and the '
        + 'engineer is not contactable, so the supplied facts neither state that it was done nor '
        + 'state that it was not. Joints looking sound is stated and does not establish it. Whether '
        + 'the ranges may run now or must be shut off turns on whether the act happened.',
      prohibited: [
        {
          kind: 'ADJACENT_CONDITION',
          text: 'whether the replaced pipework is actually gas tight',
        },
        { kind: 'DOCUMENT', text: 'whether a tightness test certificate has been issued' },
        { kind: 'CONTROL_STATE', text: 'whether the appliances are isolated at the meter' },
      ],
    }],
    nonFacts: [
      'which merchant supplied the replacement pipe',
      'how many covers the kitchen expects this morning',
    ],
    restraintBasis: null,
    expectedDeclarationCount: 1,
    expectedControllingPropertyKeys: ['K4-P1'],
    requiredActSemanticsApply: true,
    requiredArtifactSemanticsApply: false,
    scoredMeasures: ['DECLARATION_RECALL', 'PROPERTY_IDENTITY', 'REQUIRED_ACT_CONTROL'],
    derivedFromPriorCase: null,
  },

  {
    caseId: 'K5',
    frozenBySection226: {
      shape: 'LEGITIMATE_REQUIRED_ARTIFACT',
      whatItTests: 'the existence or currency of a record IS the statutory precondition; must not '
        + 'be undercut to the act it records',
      primaryGate: 'G6',
    },
    authoredIn227: {
      observation: 'A licensed contractor has built a full enclosure in a plant room to remove '
        + 'asbestos insulating board from around the pipework. The enclosure has been smoke tested '
        + 'and held, the negative pressure unit is running with a filter test dated this week, the '
        + 'operatives\' respiratory protective equipment is face-fit tested and in date, and the '
        + 'plan of work is on site and signed. The statutory notification of the work to the '
        + 'enforcing authority cannot be produced, and nobody on site can say whether it was sent '
        + 'fourteen days ago, sent late, or sent at all.',
      suppliedContext: {
        location: 'commercial premises, basement plant room',
        task: 'licensed removal of asbestos insulating board from pipework',
      },
      jurisdiction: 'osha-general-industry',
      hazardFamilies: ['asbestos', 'respiratory'],
      decisionUnderAnalysis: 'whether the removal work may start today',
    },
    establishedFacts: [
      'the enclosure has been smoke tested and held',
      'the negative pressure unit is running with a filter test dated this week',
      'the operatives\' respiratory protective equipment is face-fit tested and in date',
      'the plan of work is on site and signed',
      'the statutory notification cannot be produced and nobody can say whether it was sent',
    ],
    owedProperties: [{
      key: 'K5-P1',
      proposition: 'whether a valid statutory notification of this work exists and was given the '
        + 'required period of notice',
      kind: 'REQUIRED_ARTIFACT',
      whyGenuinelyOpen: 'The notification with its notice period is the precondition for starting '
        + 'licensed work, and it stops the work by itself whatever the enclosure looks like. Every '
        + 'physical control is stated and in date, so nothing about the containment is open. Whether '
        + 'the job may start today or must wait turns on whether the notification exists and ran.',
      prohibited: [
        {
          kind: 'UNDERLYING_ACT_BENEATH_ARTIFACT',
          text: 'whether the enforcing authority was actually told about this work',
        },
        { kind: 'ADJACENT_CONDITION', text: 'whether the enclosure will contain the fibres' },
        { kind: 'CONTROL_STATE', text: 'whether the negative pressure unit is running' },
        { kind: 'PROCESS_STEP', text: 'whether the plan of work has been followed' },
      ],
    }],
    nonFacts: [
      'which laboratory carried out the filter test',
      'how many square metres of board are to be removed',
    ],
    restraintBasis: null,
    expectedDeclarationCount: 1,
    expectedControllingPropertyKeys: ['K5-P1'],
    requiredActSemanticsApply: false,
    requiredArtifactSemanticsApply: true,
    scoredMeasures: ['DECLARATION_RECALL', 'PROPERTY_IDENTITY', 'REQUIRED_ARTIFACT_CONTROL'],
    derivedFromPriorCase: null,
  },

  {
    caseId: 'K6',
    frozenBySection226: {
      shape: 'TWO_INDEPENDENT_PROPERTIES',
      whatItTests: 'both genuinely open on the supplied facts, neither entailed by the other, and '
        + 'the work activity invites joining them',
      primaryGate: 'G3',
    },
    authoredIn227: {
      observation: 'A contractor is setting up to core drill a 150 millimetre hole through the '
        + 'first floor concrete slab of an occupied office building so that a new soil pipe can be '
        + 'run. The building dates from 1998 and no as-built drawings for the slab can be found; the '
        + 'slab has not been scanned. The room directly below the drilling position is open plan '
        + 'office and is in use; nobody can say whether it has been cleared for the drilling or '
        + 'whether anyone will be beneath the position while the core is cut. The drill rig is '
        + 'anchored and the operator has a water catchment tray fitted.',
      suppliedContext: {
        location: 'occupied office building, first floor',
        task: 'core drilling through a concrete floor slab',
      },
      jurisdiction: 'osha-general-industry',
      hazardFamilies: ['structural_failure', 'struck_by'],
      decisionUnderAnalysis: 'whether this core may be drilled today',
    },
    establishedFacts: [
      'a 150 millimetre core is to be drilled through the first floor slab',
      'the building dates from 1998 and no as-built drawings can be found',
      'the slab has not been scanned',
      'the room directly below is open plan office and is in use',
      'the drill rig is anchored and a water catchment tray is fitted',
    ],
    owedProperties: [
      {
        key: 'K6-P1',
        proposition: 'whether this slab contains post-tensioned tendons or reinforcement on the '
          + 'line of the core',
        kind: 'HAZARD_STATE',
        whyGenuinelyOpen: 'Neither the drawings nor a scan is available, so what is inside the slab '
          + 'at this position is unstated. Whether the core may be cut here at all, or must be '
          + 'moved, turns on the answer.',
        prohibited: [
          { kind: 'VERIFICATION_ACT', text: 'whether the slab has been scanned' },
          { kind: 'DOCUMENT', text: 'whether as-built drawings for the slab can be obtained' },
        ],
      },
      {
        key: 'K6-P2',
        proposition: 'whether the space directly beneath the core position is clear of people for '
          + 'the duration of the cut',
        kind: 'HAZARD_STATE',
        whyGenuinelyOpen: 'The room below is stated to be in use and whether it has been cleared, '
          + 'or will be occupied while the core is cut, is unstated. Whether the drilling may begin '
          + 'now or the area below must be cleared and held first turns on the answer, and it is '
          + 'independent of what is inside the slab.',
        prohibited: [
          { kind: 'CONTROL_STATE', text: 'whether a barrier has been put up in the room below' },
          { kind: 'PROCESS_STEP', text: 'whether the office below has been notified of the work' },
        ],
      },
    ],
    nonFacts: [
      'which contractor fitted the original soil pipes',
      'how long the core is expected to take to cut',
    ],
    restraintBasis: null,
    expectedDeclarationCount: 2,
    expectedControllingPropertyKeys: ['K6-P1', 'K6-P2'],
    requiredActSemanticsApply: false,
    requiredArtifactSemanticsApply: false,
    scoredMeasures: ['DECLARATION_RECALL', 'PROPERTY_IDENTITY', 'INDEPENDENCE'],
    derivedFromPriorCase: null,
  },

  {
    caseId: 'K7',
    frozenBySection226: {
      shape: 'SAFE_OR_NEGATED_RESTRAINT',
      whatItTests: 'an established-safe condition that must not be manufactured into a hazard',
      primaryGate: 'G4',
    },
    authoredIn227: {
      observation: 'A counterbalance forklift in a builders\' merchant yard is moving banded packs '
        + 'of concrete blocks. The driver completed and signed the daily pre-use check this '
        + 'morning; the forks, mast chains and hydraulics were checked and are sound. The thorough '
        + 'examination certificate displayed on the dash is three months old against a twelve month '
        + 'interval. The driver\'s in-date licence for this truck is displayed. The pack weight is '
        + 'marked on the band and is well within the rated capacity on the truck\'s plate at the '
        + 'lift height being used. The yard is level and dry and is separated from the pedestrian '
        + 'route by a fixed barrier.',
      suppliedContext: {
        location: 'builders\' merchant, external stock yard',
        task: 'moving banded packs of concrete blocks with a counterbalance forklift',
      },
      jurisdiction: 'osha-general-industry',
      hazardFamilies: ['vehicle_operations', 'struck_by'],
      decisionUnderAnalysis: 'whether the forklift may continue moving block packs today',
    },
    establishedFacts: [
      'the daily pre-use check was completed and signed this morning',
      'the forks, mast chains and hydraulics were checked and are sound',
      'the thorough examination certificate is three months old against a twelve month interval',
      'the driver holds an in-date licence for this truck and it is displayed',
      'the pack weight is marked and is within the rated capacity at the lift height used',
      'the yard is level and dry and is separated from pedestrians by a fixed barrier',
    ],
    owedProperties: [],
    nonFacts: [
      'which supplier manufactured the concrete blocks',
      'how many packs remain to be moved today',
    ],
    restraintBasis: 'Every control the decision turns on is stated and current: the machine is in '
      + 'date and checked, the driver is authorised, the load is within capacity at the height used, '
      + 'and pedestrians are separated by a fixed barrier. Nothing decision-critical is open, and '
      + 'manufacturing a gap here to look thorough is the opposite defect and costs as much.',
    expectedDeclarationCount: 0,
    expectedControllingPropertyKeys: [],
    requiredActSemanticsApply: false,
    requiredArtifactSemanticsApply: false,
    scoredMeasures: ['RESTRAINT'],
    derivedFromPriorCase: null,
  },

  {
    caseId: 'K8',
    frozenBySection226: {
      shape: 'ORDINARY_NON_DECISION_CRITICAL_RESTRAINT',
      whatItTests: 'a real unknown that bears on nothing decided today',
      primaryGate: 'G4',
    },
    authoredIn227: {
      observation: 'A wall mounted water boiler in an office kitchen drips slightly from its tap '
        + 'into the drip tray beneath it. The tray is draining to waste and the floor below is dry. '
        + 'The unit is supplied from a residual current protected circuit and the electrical '
        + 'installation condition report for the office is current. The boiler\'s temperature cut '
        + 'out was tested and recorded at the service two months ago. Nobody can say when the drip '
        + 'started or who first reported it.',
      suppliedContext: {
        location: 'office kitchen',
        task: 'drawing hot water from a wall mounted boiler',
      },
      jurisdiction: 'osha-general-industry',
      hazardFamilies: ['thermal', 'electrical'],
      decisionUnderAnalysis: 'whether the water boiler may remain in use today',
    },
    establishedFacts: [
      'the boiler drips into a drip tray which is draining to waste',
      'the floor below is dry',
      'the unit is on a residual current protected circuit',
      'the electrical installation condition report for the office is current',
      'the temperature cut out was tested and recorded at the service two months ago',
    ],
    nonFacts: [
      'when the drip started',
      'who first reported the drip',
    ],
    owedProperties: [],
    restraintBasis: 'How long the tap has been dripping is a real unknown, and it bears on nothing '
      + 'decided today: the tray is draining, the floor is dry, the supply is protected and in date, '
      + 'and the cut out was tested two months ago. An unknown is owed only where resolving it is '
      + 'material to the decision under analysis.',
    expectedDeclarationCount: 0,
    expectedControllingPropertyKeys: [],
    requiredActSemanticsApply: false,
    requiredArtifactSemanticsApply: false,
    scoredMeasures: ['RESTRAINT'],
    derivedFromPriorCase: null,
  },
];

// ---------------------------------------------------------------- the seven hard gates

export interface Gate227 {
  readonly id: string;
  readonly measure: Measure227;
  readonly requirement: string;
  readonly appliesToCases: readonly string[];
}

export const PRIMARY_GATES_227: readonly Gate227[] = [
  {
    id: 'G1', measure: 'DECLARATION_RECALL',
    requirement: 'decision-critical declaration recall 100%',
    appliesToCases: ['K1', 'K2', 'K3', 'K4', 'K5', 'K6'],
  },
  {
    id: 'G2', measure: 'PROPERTY_IDENTITY',
    requirement: 'exact controlling-property identity 100%',
    appliesToCases: ['K1', 'K2', 'K3', 'K4', 'K5', 'K6'],
  },
  {
    id: 'G3', measure: 'INDEPENDENCE',
    requirement: 'independent property preservation 100%',
    appliesToCases: ['K6'],
  },
  {
    id: 'G4', measure: 'RESTRAINT',
    requirement: 'false decision-critical declarations on a restraint case 0',
    appliesToCases: ['K7', 'K8'],
  },
  {
    id: 'G5', measure: 'REQUIRED_ACT_CONTROL',
    requirement: 'required-act over-corrections 0',
    appliesToCases: ['K4'],
  },
  {
    id: 'G6', measure: 'REQUIRED_ARTIFACT_CONTROL',
    requirement: 'required-artifact over-corrections 0',
    appliesToCases: ['K5'],
  },
  {
    id: 'G7', measure: 'CANDIDATE_STATE_BYPASS',
    requirement: 'candidate-state bypasses 0',
    appliesToCases: ['K1'],
  },
];

export const GATE_RULE_227 = {
  aggregateCompensationPermitted: false,
  rule: 'Each gate is pass/fail at the stated occurrence. No gate may be offset by another gate, by '
    + 'an aggregate score, by a headline accuracy figure, or by the size of the improvement over '
    + '§224 or §225 (HAZLENZ_INVARIANTS 22).',
  notExercised: 'A gate with no genuine opportunity to fail on any case is recorded NOT_EXERCISED, '
    + 'which is never CORRECT and never a pass (invariant 23).',
  ambiguous: 'AMBIGUOUS on a hard-gate judgment means the gate cannot pass from that judgment, and '
    + 'may not be resolved after the fact to obtain a terminal (invariant 24).',
  structuralFailures: 'A structural, contract or tooling failure is recorded as such and is never '
    + 'converted into a semantic verdict about the model (invariant 25).',
  borderline: 'A close judgment is marked BORDERLINE and flagged for re-adjudication. A borderline '
    + 'judgment does not change a gate outcome by itself.',
  recallDefinition: 'A decision-critical property counts as recalled ONLY when the required '
    + 'structured declaration exists. Prose, candidate reasoning, uncertainty, clarification and '
    + 'summary do not substitute for it.',
} as const;

export const AUTHORING_LIMITATION_227 = {
  singleArm: true,
  statedBeforeSpend: true,
  limitation:
    'This is a single-arm confirmation. A pass cannot independently separate contract capability '
    + 'from case-authoring effects: the cases were authored by the same session that wrote the §226 '
    + 'remediation, and no paired leg constrains that here.',
  whyAccepted:
    '§225 already supplied controlled paired-arm evidence, on eight byte-identical paired cases, '
    + 'that the instruction is what moved the targeted behaviour. §227 answers only whether the '
    + 'current candidate contract satisfies the frozen capability requirements on these fresh '
    + 'cases.',
  notMitigated: true,
  mustNotBeConcealedOrRetrospectivelyMitigated: true,
} as const;

// ---------------------------------------------------------------- deterministic comparison

const STOP = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'to', 'of', 'in', 'on', 'at', 'for',
  'and', 'or', 'it', 'its', 'that', 'this', 'whether', 'has', 'have', 'had', 'not', 'no', 'any',
  'by', 'with', 'as', 'which', 'what', 'from', 'before', 'after', 'still', 'now', 'currently',
  'their', 'there', 'can', 'could', 'would', 'may', 'does', 'did', 'they', 'them',
]);

function tokens(s: string): Set<string> {
  return new Set(s.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/)
    .filter(t => t.length > 2 && !STOP.has(t)));
}

/** Jaccard overlap. Deterministic, auditable, reported alongside every judgment as support. */
export function overlap227(a: string, b: string): number {
  const ta = tokens(a); const tb = tokens(b);
  if (ta.size === 0 || tb.size === 0) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter += 1;
  return inter / (ta.size + tb.size - inter);
}

/** Two preregistered strings closer than this are treated as the same property in the preflight. */
export const DUPLICATE_COLLISION_227 = 0.34;

// ---------------------------------------------------------------- the preflight

export interface PreflightCheck227 {
  readonly id: string;
  readonly what: string;
  readonly passed: boolean;
  readonly detail: string;
}

export interface PreflightResult227 {
  readonly passed: boolean;
  readonly checks: readonly PreflightCheck227[];
}

/**
 * THE §226 TRUTH-CONSISTENCY PREFLIGHT, APPLIED TO THE HOSTED CASES, PLUS THE §227 PRE-SPEND
 * INTEGRITY CHECKS. Every check runs BEFORE the protocol is frozen and before the first provider
 * call. A failure repairs the case, never the check. Once frozen, nothing here is revised.
 */
export function preflight227(
  cases: readonly HostedCase227[] = HOSTED_CASES_227,
): PreflightResult227 {
  const checks: PreflightCheck227[] = [];
  const add = (id: string, what: string, bad: readonly string[]): void => {
    checks.push({
      id, what, passed: bad.length === 0,
      detail: bad.length === 0 ? 'clean' : bad.join(' | '),
    });
  };

  // ---- §227 pre-spend integrity 1: exactly eight fresh primary cases
  add('P0', 'exactly 8 fresh primary cases exist, each attesting no prior-cohort derivation',
    [
      ...(cases.length === 8 ? [] : [`case count is ${cases.length}, expected 8`]),
      ...cases.filter(c => c.derivedFromPriorCase !== null)
        .map(c => `${c.caseId} declares a prior-cohort derivation`),
    ]);

  // ---- P1. no expected unresolved property is simultaneously established
  add('P1', 'no owed property collides with a stated established fact',
    cases.flatMap(c => c.owedProperties.flatMap(p => c.establishedFacts
      .map(f => ({ f, s: overlap227(p.proposition, f) }))
      .filter(x => x.s >= DUPLICATE_COLLISION_227)
      .map(x => `${c.caseId}/${p.key} overlaps established fact "${x.f}" at ${x.s.toFixed(3)}`))));

  add('P1b', 'every owed property records why it is genuinely open',
    cases.flatMap(c => c.owedProperties
      .filter(p => p.whyGenuinelyOpen.trim().length < 40)
      .map(p => `${c.caseId}/${p.key} has no substantive whyGenuinelyOpen`)));

  // ---- P2. expected declaration count is frozen and matches the enumeration
  add('P2', 'expected declaration count equals the number of owed properties',
    cases.filter(c => c.expectedDeclarationCount !== c.owedProperties.length)
      .map(c => `${c.caseId}: expected ${c.expectedDeclarationCount}, owed `
        + `${c.owedProperties.length}`));

  add('P2b', 'the exact controlling property keys are frozen and match the owed set',
    cases.filter(c => [...c.expectedControllingPropertyKeys].sort().join(',')
      !== c.owedProperties.map(p => p.key).sort().join(','))
      .map(c => `${c.caseId}: keys do not match the owed set`));

  // ---- P3. every established fact and every non-fact is explicitly enumerated
  add('P3', 'every case enumerates established facts and non-facts explicitly',
    cases.flatMap(c => [
      ...(c.establishedFacts.length === 0 ? [`${c.caseId}: no established facts enumerated`] : []),
      ...(c.nonFacts.length === 0 ? [`${c.caseId}: no non-facts enumerated`] : []),
    ]));

  // ---- P4. no duplicate property under different wording
  add('P4', 'no two owed properties in a case are the same property reworded',
    cases.flatMap(c => c.owedProperties.flatMap((p, i) => c.owedProperties.slice(i + 1)
      .map(q => ({ q, s: overlap227(p.proposition, q.proposition) }))
      .filter(x => x.s >= DUPLICATE_COLLISION_227)
      .map(x => `${c.caseId}: ${p.key} and ${x.q.key} overlap at ${x.s.toFixed(3)}`))));

  add('P4b', 'no prohibited near neighbour is the owed property reworded',
    cases.flatMap(c => c.owedProperties.flatMap(p => p.prohibited
      .map(f => ({ f, s: overlap227(p.proposition, f.text) }))
      .filter(x => x.s >= DUPLICATE_COLLISION_227)
      .map(x => `${c.caseId}/${p.key}: "${x.f.text}" overlaps the owed property at `
        + `${x.s.toFixed(3)}`))));

  // ---- P5. restraint cases contain zero decision-critical unresolved properties
  add('P5', 'restraint cases owe nothing and state why; owing cases state no restraint basis',
    cases.flatMap(c => {
      const bad: string[] = [];
      if (c.restraintBasis !== null && c.owedProperties.length > 0) {
        bad.push(`${c.caseId}: a restraint basis is stated and ${c.owedProperties.length} owed`);
      }
      if (c.restraintBasis === null && c.owedProperties.length === 0) {
        bad.push(`${c.caseId}: nothing is owed and no restraint basis is stated`);
      }
      return bad;
    }));

  // ---- P6. prohibited proxy / adjacent properties explicit where applicable
  add('P6', 'every owed property enumerates its prohibited proxy and adjacent near neighbours',
    cases.flatMap(c => c.owedProperties.filter(p => p.prohibited.length < 2)
      .map(p => `${c.caseId}/${p.key} enumerates fewer than two near neighbours`)));

  add('P6b', 'every prohibited kind is in the closed set',
    cases.flatMap(c => c.owedProperties.flatMap(p => p.prohibited
      .filter(f => ![
        'CONTROL_STATE', 'EVIDENCE_PROXY', 'VERIFICATION_ACT', 'DOCUMENT', 'PROCESS_STEP',
        'ADJACENT_CONDITION', 'UNDERLYING_ACT_BENEATH_ARTIFACT',
      ].includes(f.kind))
      .map(f => `${c.caseId}/${p.key}: prohibited kind ${f.kind}`))));

  // ---- P7. required act / artifact semantics frozen where applicable
  add('P7', 'required act and artifact flags agree with the owed kinds',
    cases.flatMap(c => {
      const hasAct = c.owedProperties.some(p => p.kind === 'REQUIRED_ACT');
      const hasArt = c.owedProperties.some(p => p.kind === 'REQUIRED_ARTIFACT');
      const bad: string[] = [];
      if (hasAct !== c.requiredActSemanticsApply) bad.push(`${c.caseId}: act flag disagrees`);
      if (hasArt !== c.requiredArtifactSemanticsApply) bad.push(`${c.caseId}: artifact flag `
        + 'disagrees');
      return bad;
    }));

  // ---- P8. non-facts disjoint from established facts and owed properties
  add('P8', 'no enumerated non-fact is also an established fact or an owed property',
    cases.flatMap(c => c.nonFacts.flatMap(n => [
      ...c.establishedFacts.filter(f => overlap227(n, f) >= DUPLICATE_COLLISION_227)
        .map(f => `${c.caseId}: non-fact "${n}" overlaps established fact "${f}"`),
      ...c.owedProperties.filter(p => overlap227(n, p.proposition) >= DUPLICATE_COLLISION_227)
        .map(p => `${c.caseId}: non-fact "${n}" overlaps owed property ${p.key}`),
    ])));

  // ---- P9. all scored axes preregistered, and every gate has its cases
  add('P9', 'every case preregisters the measures it exercises, and they agree with the gates',
    cases.flatMap(c => {
      const bad: string[] = [];
      if (c.scoredMeasures.length === 0) bad.push(`${c.caseId}: no scored measure preregistered`);
      for (const g of PRIMARY_GATES_227) {
        const listed = g.appliesToCases.includes(c.caseId);
        const scored = c.scoredMeasures.includes(g.measure);
        if (listed !== scored) {
          bad.push(`${c.caseId}: gate ${g.id} listing (${listed}) disagrees with scoredMeasures `
            + `(${scored})`);
        }
      }
      return bad;
    }));

  add('P9b', 'every gate names at least one case, so no gate is vacuous',
    PRIMARY_GATES_227.filter(g => g.appliesToCases.length === 0)
      .map(g => `${g.id} names no case`));

  // ---- P10. case identifiers unique
  add('P10', 'case identifiers are unique', (() => {
    const seen = new Set<string>(); const dup: string[] = [];
    for (const c of cases) { if (seen.has(c.caseId)) dup.push(c.caseId); seen.add(c.caseId); }
    return dup;
  })());

  // ---- P11. each required §226 shape is covered exactly once
  add('P11', 'each of the eight frozen §226 shapes is covered exactly once', (() => {
    const required: Shape227[] = [
      'CANDIDATE_STATE_BYPASS', 'CONTROL_STATE_PROXY', 'VERIFICATION_ACT_PROXY',
      'LEGITIMATE_REQUIRED_ACT', 'LEGITIMATE_REQUIRED_ARTIFACT', 'TWO_INDEPENDENT_PROPERTIES',
      'SAFE_OR_NEGATED_RESTRAINT', 'ORDINARY_NON_DECISION_CRITICAL_RESTRAINT',
    ];
    const got = cases.map(c => c.frozenBySection226.shape);
    return required
      .filter(s => got.filter(x => x === s).length !== 1)
      .map(s => `${s} is covered ${got.filter(x => x === s).length} times, expected 1`);
  })());

  // ---- P12. the independence case really owes two independent properties
  add('P12', 'the two-independent-properties case owes exactly two, neither entailing the other',
    cases.filter(c => c.frozenBySection226.shape === 'TWO_INDEPENDENT_PROPERTIES')
      .flatMap(c => c.owedProperties.length === 2
        ? [] : [`${c.caseId} owes ${c.owedProperties.length}, expected 2`]));

  // ---- P13. the legitimate act and artifact cases carry the right owed kind
  add('P13', 'the legitimate required-act and required-artifact cases owe that kind',
    [
      ...cases.filter(c => c.frozenBySection226.shape === 'LEGITIMATE_REQUIRED_ACT')
        .filter(c => !c.owedProperties.some(p => p.kind === 'REQUIRED_ACT'))
        .map(c => `${c.caseId} is the legitimate-act case but owes no REQUIRED_ACT`),
      ...cases.filter(c => c.frozenBySection226.shape === 'LEGITIMATE_REQUIRED_ARTIFACT')
        .filter(c => !c.owedProperties.some(p => p.kind === 'REQUIRED_ARTIFACT'))
        .map(c => `${c.caseId} is the legitimate-artifact case but owes no REQUIRED_ARTIFACT`),
    ]);

  // ---- P14. the artifact case annotates the undercut it exists to refuse
  add('P14', 'the required-artifact case annotates the underlying act beneath the artifact',
    cases.filter(c => c.requiredArtifactSemanticsApply)
      .filter(c => !c.owedProperties.some(p => p.kind === 'REQUIRED_ARTIFACT'
        && p.prohibited.some(f => f.kind === 'UNDERLYING_ACT_BENEATH_ARTIFACT')))
      .map(c => `${c.caseId} does not annotate the underlying-act undercut`));

  // ---- P15. the bypass case gives the model a genuine invitation to assert a settled state
  add('P15', 'the candidate-state bypass case owes a property and enumerates a control-state proxy',
    cases.filter(c => c.frozenBySection226.shape === 'CANDIDATE_STATE_BYPASS')
      .flatMap(c => [
        ...(c.owedProperties.length >= 1 ? [] : [`${c.caseId} owes nothing`]),
        ...(c.owedProperties.some(p => p.prohibited.some(f => f.kind === 'CONTROL_STATE'))
          ? [] : [`${c.caseId} enumerates no control-state proxy`]),
      ]));

  return { passed: checks.every(k => k.passed), checks };
}
