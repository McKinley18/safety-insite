/**
 * §224 -- FIRST-PASS DECLARATION CAPABILITY INSTRUMENT. VALIDATION ONLY.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NOT IMPORTED BY ANY RUNTIME OR PROJECTION PATH.
 *
 * ==================== WHAT THIS INSTRUMENT CAN AND CANNOT ESTABLISH ====================
 *
 * It is a LOCAL instrument with no provider call, so it cannot establish that a model will behave
 * better. Per HAZLENZ_INVARIANTS, a contract change is never evidence that a behavioural defect is
 * repaired.
 *
 * What it CAN establish is CONTRACT DISCRIMINATION: given a first-pass output, does the contract's
 * own stated rule reach the right verdict about it -- declaration owed, declaration correctly
 * withheld, property correctly chosen, property substituted? A contract that cannot tell the §221
 * Class A failures apart from correct behaviour cannot be expected to change it either, and a
 * contract that flags correct restraint as a miss would make the system worse.
 *
 * The compliance evaluator lives here, in the harness. It is never imported by the projection, the
 * ledger, or any runtime module, and it never runs against live provider output. It scores authored
 * fixtures against preregistered truth, exactly as §207 and §221 instruments do.
 *
 * ==================== PREREGISTRATION ====================
 *
 * Every expected semantic property in CASES_224 was authored BEFORE the §224 remediation block was
 * written, and is frozen by the digest in SECTION-224-LOCAL-INSTRUMENT.json. Nothing here may be
 * revised after a result is seen.
 */

export const INSTRUMENT_224_VERSION = 'hazlenz.expert.224.declaration-capability.v1' as const;

/** The four measures. Each is reported separately; none may be averaged into the others. */
export const MEASURES_224 = ['RECALL', 'PRECISION', 'PROPERTY_IDENTITY', 'INDEPENDENCE'] as const;
export type Measure224 = typeof MEASURES_224[number];

export const AGGREGATE_SCORE_PERMITTED = false;

/** A candidate as the first pass emits it, reduced to the fields this instrument reads. */
export interface CandidateFixture224 {
  readonly candidateKey: string;
  readonly assertedConditionState:
  'ACTIVE' | 'CONTROLLED' | 'CORRECTED' | 'REMOVED_FROM_SERVICE' | 'NEGATED' | 'HYPOTHETICAL'
  | 'INSUFFICIENT_EVIDENCE' | 'UNKNOWN';
  readonly confidence: 'LOW' | 'MODERATE' | 'HIGH';
  readonly requiresUserConfirmation: boolean;
  readonly reasoning: string;
}

/** A declaration as the first pass emits it, reduced to the fields this instrument reads. */
export interface DeclarationFixture224 {
  readonly declarationId: string;
  readonly missingFact: string;
  readonly affectedDecision: string;
  readonly branchA: string;
  readonly branchB: string;
  readonly decisionIfA: string;
  readonly decisionIfB: string;
}

export interface OutputFixture224 {
  readonly candidates: readonly CandidateFixture224[];
  readonly clarificationCount: number;
  readonly declarations: readonly DeclarationFixture224[];
  readonly uncertaintyStatements: readonly string[];
  readonly summary: string;
}

/**
 * The preregistered truth for one owed property. `proposition` is the state whose truth controls
 * the safety decision. `forbiddenSubstitutions` are the near neighbours a first pass may reach for
 * instead; each is recorded with the KIND of substitution it is, because the kinds have different
 * remedies.
 */
export interface OwedProperty224 {
  readonly key: string;
  readonly proposition: string;
  readonly kind: 'HAZARD_STATE' | 'REQUIRED_ACT' | 'REQUIRED_ARTIFACT';
  readonly forbiddenSubstitutions: readonly {
    readonly kind: 'CONTROL_STATE' | 'EVIDENCE_PROXY' | 'VERIFICATION_ACT' | 'DOCUMENT'
    | 'ADJACENT_CONDITION';
    readonly text: string;
  }[];
}

export interface Case224 {
  readonly caseId: string;
  readonly family: string;
  readonly observation: string;
  /** Preregistered: the properties genuinely decision-controlling here. Empty means none is owed. */
  readonly owedProperties: readonly OwedProperty224[];
  /** Preregistered: why restraint is correct, where nothing is owed. */
  readonly restraintBasis: string | null;
  /** The output under test. For replay cases this is the §221-recorded output, reduced. */
  readonly output: OutputFixture224;
  readonly outputProvenance: 'SECTION_221_RECORDED' | 'AUTHORED_FOR_THIS_INSTRUMENT';
  /** Preregistered expected verdict per measure. NOT_EXERCISED where the case cannot exercise it. */
  readonly expected: Readonly<Record<Measure224, 'COMPLIANT' | 'DEFECTIVE' | 'NOT_EXERCISED'>>;
}

// ---------------------------------------------------------------- the ten cases

const NONE: Readonly<Record<Measure224, 'COMPLIANT' | 'DEFECTIVE' | 'NOT_EXERCISED'>> = {
  RECALL: 'NOT_EXERCISED', PRECISION: 'NOT_EXERCISED',
  PROPERTY_IDENTITY: 'NOT_EXERCISED', INDEPENDENCE: 'NOT_EXERCISED',
};

export const CASES_224: readonly Case224[] = [
  {
    caseId: 'C1-RECALL-WHICH-CONTROL',
    family: 'recognized concern must become declaration',
    observation: 'Fixed steel ladder to a syrup mezzanine, cage cut away from shoulder height up, '
      + 'no other fall protection. Rungs and stringers sound. Nobody has measured the rise.',
    owedProperties: [{
      key: 'P-RISE',
      proposition: 'what fall protection this ladder requires, which turns on the rise from the '
        + 'floor to the mezzanine deck',
      kind: 'HAZARD_STATE',
      forbiddenSubstitutions: [
        { kind: 'EVIDENCE_PROXY', text: 'whether the rise has been measured' },
        { kind: 'DOCUMENT', text: 'whether the mezzanine drawings are available' },
      ],
    }],
    restraintBasis: null,
    output: {
      candidates: [
        {
          candidateKey: 'cand-fall-cage-gap', assertedConditionState: 'ACTIVE', confidence: 'HIGH',
          requiresUserConfirmation: false,
          reasoning: 'Current unmitigated fall exposure during ordinary use of the ladder.',
        },
        {
          candidateKey: 'cand-unknown-rise', assertedConditionState: 'UNKNOWN', confidence: 'LOW',
          requiresUserConfirmation: true,
          reasoning: 'The height of the climb is relevant to how severe a fall from the uncaged '
            + 'section would be and to what fall protection requirements would typically scale '
            + 'with; it is a plausible severity-relevant fact currently unconfirmed.',
        },
      ],
      clarificationCount: 0,
      declarations: [],
      uncertaintyStatements: [
        'The exact vertical rise of the ladder is not established, which affects how severe a fall '
        + 'from the uncaged section could be, though the presence of the hazard itself does not '
        + 'depend on this figure.',
      ],
      summary: 'The exact rise is unmeasured, which is noted as a low-confidence severity-relevant '
        + 'gap, but it does not change the immediate need to address the missing fall protection.',
    },
    outputProvenance: 'SECTION_221_RECORDED',
    expected: { ...NONE, RECALL: 'DEFECTIVE' },
  },
  {
    caseId: 'C2-RECALL-CANDIDATE-CONTRADICTION',
    family: 'recognized concern must become declaration',
    observation: 'Spindle moulder with the Shaw guard and pressure pads removed, machinist hand '
      + 'feeding stock at the exposed cutter block without a push stick, intending to continue.',
    owedProperties: [{
      key: 'P-GUARDING',
      proposition: 'what guarding this cutter-block operation requires before the machine may run '
        + 'again',
      kind: 'HAZARD_STATE',
      forbiddenSubstitutions: [
        { kind: 'DOCUMENT', text: 'whether the machine handbook is available' },
        { kind: 'EVIDENCE_PROXY', text: 'whether the machinist has been trained' },
      ],
    }],
    restraintBasis: null,
    output: {
      candidates: [
        {
          candidateKey: 'CAND-1', assertedConditionState: 'ACTIVE', confidence: 'HIGH',
          requiresUserConfirmation: false,
          reasoning: 'Exposed rotating cutter block presents a direct entanglement hazard.',
        },
        {
          candidateKey: 'CAND-3', assertedConditionState: 'INSUFFICIENT_EVIDENCE',
          confidence: 'LOW', requiresUserConfirmation: true,
          reasoning: "Without knowledge of the machine's intended guarding configuration it cannot "
            + 'be confirmed whether the removed Shaw guard and pressure pads were the only guarding '
            + 'feature or whether additional devices should also be present, which is a distinct '
            + 'but related gap.',
        },
      ],
      clarificationCount: 0,
      declarations: [],
      uncertaintyStatements: [],
      summary: 'No decision-critical fact is missing: the current state, exposure, and lack of any '
        + 'control are all directly stated.',
    },
    outputProvenance: 'SECTION_221_RECORDED',
    expected: { ...NONE, RECALL: 'DEFECTIVE' },
  },
  {
    caseId: 'C3-PROPERTY-CONTROL-STATE',
    family: 'exact underlying property vs control state',
    observation: 'Plant room with a CO2 leak detection head bagged over since painting a fortnight '
      + 'ago. Two operatives entering and exiting during the shift. Nobody present has heard the '
      + 'ventilation fan start on its run-on timer.',
    owedProperties: [{
      key: 'P-ATMOSPHERE',
      proposition: 'whether the plant-room atmosphere is safe to enter',
      kind: 'HAZARD_STATE',
      forbiddenSubstitutions: [
        { kind: 'CONTROL_STATE', text: 'whether the ventilation fan is currently running' },
        { kind: 'CONTROL_STATE', text: 'whether the detection head is uncovered' },
        { kind: 'VERIFICATION_ACT', text: 'whether a portable CO2 reading has been taken' },
      ],
    }],
    restraintBasis: null,
    output: {
      candidates: [{
        candidateKey: 'cand-co2-detection-defeated', assertedConditionState: 'ACTIVE',
        confidence: 'HIGH', requiresUserConfirmation: false,
        reasoning: 'A CO2 leak detector covered by a plastic bag cannot sense gas in the room.',
      }],
      clarificationCount: 1,
      declarations: [{
        declarationId: 'decl-vent-state',
        missingFact: 'Whether the plant room ventilation fan is currently running (cycling) on its '
          + 'run-on timer',
        affectedDecision: 'REQUIRED_CONTROL',
        branchA: 'The fan is running and cycling normally per its run-on timer, providing active '
          + 'dilution of the room air',
        branchB: 'The fan has failed, stopped, or is not cycling, so no active dilution of the room '
          + 'air is occurring',
        decisionIfA: 'With the fan confirmed operating, some mechanical air change is present; '
          + 'entry can continue provided the taped-over detector is uncovered and functionally '
          + 'verified before further entries',
        decisionIfB: 'With the fan confirmed not running, the room has neither detection nor '
          + 'dilution; entry should be halted and a portable CO2 monitor used before anyone enters',
      }],
      uncertaintyStatements: [],
      summary: 'The detector is defeated and the ventilation state is unconfirmed.',
    },
    outputProvenance: 'SECTION_221_RECORDED',
    expected: { ...NONE, PROPERTY_IDENTITY: 'DEFECTIVE' },
  },
  {
    caseId: 'C4-PROPERTY-EVIDENCE-PROXY',
    family: 'exact underlying property vs evidence proxy',
    observation: 'Theatre flying system wire ropes in daily use. The rigging book records a proof '
      + 'load test two years ago and nothing since. The ropes have not been examined.',
    owedProperties: [{
      key: 'P-ROPE',
      proposition: 'whether the wire ropes are in a condition fit to carry the flown load',
      kind: 'HAZARD_STATE',
      forbiddenSubstitutions: [
        { kind: 'DOCUMENT', text: 'whether a current proof load test certificate exists' },
        { kind: 'EVIDENCE_PROXY', text: 'whether the annual proof load test has been carried out' },
        { kind: 'VERIFICATION_ACT', text: 'whether the ropes have been examined' },
      ],
    }],
    restraintBasis: null,
    output: {
      candidates: [{
        candidateKey: 'cand-rope', assertedConditionState: 'INSUFFICIENT_EVIDENCE',
        confidence: 'LOW', requiresUserConfirmation: true,
        reasoning: 'Rope condition is not established by the rigging book.',
      }],
      clarificationCount: 1,
      declarations: [{
        declarationId: 'decl-proof-test',
        missingFact: 'Whether the annual proof load test required by the rigging schedule has been '
          + 'carried out on the flying system wire ropes',
        affectedDecision: 'REQUIRED_CONTROL',
        branchA: 'The proof load test was carried out within the last twelve months and recorded '
          + 'elsewhere',
        branchB: 'No proof load test has been carried out since the entry two years ago',
        decisionIfA: 'The scheduled examination regime is current and flying may continue',
        decisionIfB: 'The flying system is taken out of use until the test is carried out',
      }],
      uncertaintyStatements: [],
      summary: 'The rigging book stops two years ago.',
    },
    outputProvenance: 'AUTHORED_FOR_THIS_INSTRUMENT',
    expected: { ...NONE, PROPERTY_IDENTITY: 'DEFECTIVE' },
  },
  {
    caseId: 'C5-REQUIRED-ACT-IS-THE-PROPERTY',
    family: 'exact property vs required act -- the act IS the property',
    observation: 'A conveyor drive is due for belt replacement. The isolation point is a lockable '
      + 'disconnector on the wall. The permit is signed but nobody can say whether the lock was '
      + 'actually applied and the stored energy bled down before the guard came off.',
    owedProperties: [{
      key: 'P-ISOLATION',
      proposition: 'whether the drive was locked off and the stored energy bled down before the '
        + 'guard was removed',
      kind: 'REQUIRED_ACT',
      forbiddenSubstitutions: [
        { kind: 'DOCUMENT', text: 'whether the permit was signed' },
      ],
    }],
    restraintBasis: null,
    output: {
      candidates: [{
        candidateKey: 'cand-iso', assertedConditionState: 'UNKNOWN', confidence: 'LOW',
        requiresUserConfirmation: true,
        reasoning: 'Isolation state at the time the guard came off is not established.',
      }],
      clarificationCount: 1,
      declarations: [{
        declarationId: 'decl-iso',
        missingFact: 'Whether the conveyor drive was locked off at the disconnector and the stored '
          + 'energy bled down before the guard was removed',
        affectedDecision: 'REQUIRED_CONTROL',
        branchA: 'The lock was applied and the drive bled down before the guard came off',
        branchB: 'The guard came off with the drive live or with stored energy still present',
        decisionIfA: 'The isolation requirement was met and work on the belt may continue under the '
          + 'existing permit',
        decisionIfB: 'Work stops, everyone stands clear, and the isolation is established and '
          + 'proved before the guard area is re-entered',
      }],
      uncertaintyStatements: [],
      summary: 'Isolation state before guard removal is not established.',
    },
    outputProvenance: 'AUTHORED_FOR_THIS_INSTRUMENT',
    expected: { ...NONE, PROPERTY_IDENTITY: 'COMPLIANT' },
  },
  {
    caseId: 'C6-REQUIRED-ARTIFACT-IS-THE-PROPERTY',
    family: 'exact property vs required artifact -- the artifact IS the property',
    observation: 'A mobile tower crane is rigged on site and due to lift tomorrow. No current '
      + 'thorough examination report is on site and the hire desk cannot say whether one exists.',
    owedProperties: [{
      key: 'P-TER',
      proposition: 'whether a current thorough examination report for this crane exists, which is '
        + 'itself the statutory precondition for the lift',
      kind: 'REQUIRED_ARTIFACT',
      forbiddenSubstitutions: [
        { kind: 'ADJACENT_CONDITION', text: 'whether the crane appears to be in good condition' },
      ],
    }],
    restraintBasis: null,
    output: {
      candidates: [{
        candidateKey: 'cand-ter', assertedConditionState: 'UNKNOWN', confidence: 'LOW',
        requiresUserConfirmation: true,
        reasoning: 'No current thorough examination report has been produced for this crane.',
      }],
      clarificationCount: 1,
      declarations: [{
        declarationId: 'decl-ter',
        missingFact: 'Whether a current thorough examination report exists for this crane',
        affectedDecision: 'REQUIRED_CONTROL',
        branchA: 'A current thorough examination report exists and can be produced',
        branchB: 'No current thorough examination report exists for this crane',
        decisionIfA: 'The statutory precondition for the lift is met and the lift may be planned',
        decisionIfB: 'The crane does not lift until a thorough examination has been carried out and '
          + 'the report issued',
      }],
      uncertaintyStatements: [],
      summary: 'No current thorough examination report is available on site.',
    },
    outputProvenance: 'AUTHORED_FOR_THIS_INSTRUMENT',
    expected: { ...NONE, PROPERTY_IDENTITY: 'COMPLIANT' },
  },
  {
    caseId: 'C7-ADJACENT-PROPERTY-TRAP',
    family: 'adjacent-property trap',
    observation: 'A hopper is hand cleared between batches. The access door interlock is fitted '
      + 'and tested working. Nobody can say how long the rotor takes to stop after the door opens, '
      + 'or how quickly an operator reaches into the hopper.',
    owedProperties: [{
      key: 'P-RUNDOWN',
      proposition: 'whether the rotor comes to rest before an operator can reach the hopper, that '
        + 'is whether run-down time is shorter than access time',
      kind: 'HAZARD_STATE',
      forbiddenSubstitutions: [
        { kind: 'CONTROL_STATE', text: 'whether the access door interlock is fitted and working' },
        { kind: 'VERIFICATION_ACT', text: 'whether a means exists to verify the rotor has stopped' },
        { kind: 'ADJACENT_CONDITION', text: 'whether a mandatory waiting time is posted' },
      ],
    }],
    restraintBasis: null,
    output: {
      candidates: [{
        candidateKey: 'cand-rundown', assertedConditionState: 'INSUFFICIENT_EVIDENCE',
        confidence: 'LOW', requiresUserConfirmation: true,
        reasoning: 'Rotor run-down behaviour relative to access is not established.',
      }],
      clarificationCount: 1,
      declarations: [{
        declarationId: 'decl-stop-means',
        missingFact: 'Whether a means exists to verify that the rotor has stopped before the '
          + 'operator reaches into the hopper',
        affectedDecision: 'REQUIRED_CONTROL',
        branchA: 'A means to verify rotor stoppage is available at the hopper',
        branchB: 'No means to verify rotor stoppage is available',
        decisionIfA: 'Hand clearing may continue with the verification step added to the procedure',
        decisionIfB: 'A mandatory waiting time or stop indication is required before hand clearing',
      }],
      uncertaintyStatements: [],
      summary: 'The interlock works; how long the rotor runs on is not established.',
    },
    outputProvenance: 'AUTHORED_FOR_THIS_INSTRUMENT',
    expected: { ...NONE, PROPERTY_IDENTITY: 'DEFECTIVE' },
  },
  {
    caseId: 'C8-MULTI-INDEPENDENT',
    family: 'multiple independent decision-critical facts',
    observation: 'A confined tank is to be entered. The last atmosphere reading was taken before '
      + 'the tank was washed out and nobody has taken one since. Separately, the agitator supply '
      + 'has been switched off at the panel but the isolation has not been locked or proved.',
    owedProperties: [
      {
        key: 'P-ATM',
        proposition: 'whether the tank atmosphere is safe to enter now, after the wash out',
        kind: 'HAZARD_STATE',
        forbiddenSubstitutions: [
          { kind: 'VERIFICATION_ACT', text: 'whether a fresh atmosphere reading has been taken' },
        ],
      },
      {
        key: 'P-ISO',
        proposition: 'whether the agitator is isolated at zero energy and that isolation proved',
        kind: 'HAZARD_STATE',
        forbiddenSubstitutions: [
          { kind: 'CONTROL_STATE', text: 'whether the panel switch is in the off position' },
        ],
      },
    ],
    restraintBasis: null,
    output: {
      candidates: [
        {
          candidateKey: 'cand-atm', assertedConditionState: 'UNKNOWN', confidence: 'LOW',
          requiresUserConfirmation: true,
          reasoning: 'Atmosphere after the wash out is not established.',
        },
        {
          candidateKey: 'cand-iso', assertedConditionState: 'UNKNOWN', confidence: 'LOW',
          requiresUserConfirmation: true,
          reasoning: 'Isolation is switched but not locked or proved.',
        },
      ],
      clarificationCount: 1,
      declarations: [{
        declarationId: 'decl-joined',
        missingFact: 'Whether the tank atmosphere is safe to enter and the agitator is isolated',
        affectedDecision: 'REQUIRED_CONTROL',
        branchA: 'The atmosphere is safe and the agitator is isolated',
        branchB: 'Either the atmosphere is unsafe or the agitator is not isolated',
        decisionIfA: 'Entry may proceed under the permit',
        decisionIfB: 'Entry is held until both are established',
      }],
      uncertaintyStatements: [],
      summary: 'Two conditions stand between the crew and entry.',
    },
    outputProvenance: 'AUTHORED_FOR_THIS_INSTRUMENT',
    expected: { ...NONE, INDEPENDENCE: 'DEFECTIVE' },
  },
  {
    caseId: 'C9-SAFE-NEGATED-RESTRAINT',
    family: 'genuinely safe / negated -- NO declaration is correct',
    observation: 'A guarded bench grinder. The tool rest is set at two millimetres, the eye shield '
      + 'is in place and the wheel was dressed and inspected this morning with the record signed. '
      + 'The operator is wearing the issued face shield.',
    owedProperties: [],
    restraintBasis: 'every control the hazard turns on is stated as present and current, and no '
      + 'answer to any remaining unknown would change what is done today.',
    output: {
      candidates: [{
        candidateKey: 'cand-grinder', assertedConditionState: 'CONTROLLED', confidence: 'HIGH',
        requiresUserConfirmation: false,
        reasoning: 'Tool rest gap, eye shield and dressing record are all stated as in order.',
      }],
      clarificationCount: 0,
      declarations: [],
      uncertaintyStatements: [],
      summary: 'The grinder is guarded and the controls are stated as present and current.',
    },
    outputProvenance: 'AUTHORED_FOR_THIS_INSTRUMENT',
    expected: { ...NONE, PRECISION: 'COMPLIANT' },
  },
  {
    caseId: 'C10-ORDINARY-NOT-DECISION-CRITICAL',
    family: 'ordinary non-decision-critical unknown -- NO declaration is correct',
    observation: 'A warehouse racking run is in good order and loaded within its plated capacity. '
      + 'The next scheduled rack inspection date is not recorded anywhere on site, though the last '
      + 'one was signed off six weeks ago.',
    owedProperties: [],
    restraintBasis: 'the next inspection date bears on a later decision, not on whether the racking '
      + 'may be loaded today; the current condition and the plated capacity are both established, '
      + 'so no answer changes what is done now.',
    output: {
      candidates: [{
        candidateKey: 'cand-rack-next', assertedConditionState: 'UNKNOWN', confidence: 'LOW',
        requiresUserConfirmation: true,
        reasoning: 'The next scheduled inspection date is not recorded on site.',
      }],
      clarificationCount: 0,
      declarations: [],
      uncertaintyStatements: [
        'The next scheduled rack inspection date is not recorded on site. It does not change what '
        + 'is done today either way: the racking is in good order, loaded within its plated '
        + 'capacity, and the last inspection was signed off six weeks ago.',
      ],
      summary: 'The racking is in good order and within its plated capacity.',
    },
    outputProvenance: 'AUTHORED_FOR_THIS_INSTRUMENT',
    expected: { ...NONE, PRECISION: 'COMPLIANT' },
  },
];

// ---------------------------------------------------------------- the contract rules under test

/**
 * The two contracts this instrument discriminates between. Each is a statement of what the
 * INSTRUCTION requires, transcribed from the instruction itself -- not a judgement of my own.
 */
export type ContractUnderTest = 'BASELINE_210J' | 'REMEDIATED_224';

export const CONTRACT_RULES = {
  BASELINE_210J: {
    declarationTrigger: 'SUBORDINATE_TO_CLARIFICATION',
    declarationTriggerSource:
      'STATING AN UNRESOLVED FACT IN FULL: "The test is the one you have already applied ... '
      + 'If you would not have asked about it, do not declare it."',
    negativeConclusionMustBeWitnessed: false,
    thresholdLimbs: ['WHETHER_WORK_MAY_PROCEED', 'WHAT_CORRECTIVE_DECISION'] as readonly string[],
    refusesPropertyKinds: ['EVIDENCE_PROXY', 'VERIFICATION_ACT', 'DOCUMENT'] as readonly string[],
    refusesPropertyKindsSource: 'GATE 8 and GATE 12: state, not the process that would establish it',
    requiresOneEntryPerIndependentFact: true,
  },
  REMEDIATED_224: {
    declarationTrigger: 'INDEPENDENT_OF_CLARIFICATION',
    declarationTriggerSource: '§224 THE DECLARATION TRIGGER',
    negativeConclusionMustBeWitnessed: true,
    thresholdLimbs: [
      'WHETHER_WORK_MAY_PROCEED', 'WHICH_CONTROL_IS_REQUIRED', 'WHAT_CORRECTIVE_DECISION',
    ] as readonly string[],
    refusesPropertyKinds: [
      'EVIDENCE_PROXY', 'VERIFICATION_ACT', 'DOCUMENT', 'CONTROL_STATE', 'ADJACENT_CONDITION',
    ] as readonly string[],
    refusesPropertyKindsSource: '§224 GATE 13, over GATE 8 and GATE 12',
    requiresOneEntryPerIndependentFact: true,
  },
} as const;

// ---------------------------------------------------------------- property classification

const STOP = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'to', 'of', 'in', 'on', 'at', 'for',
  'and', 'or', 'it', 'its', 'that', 'this', 'whether', 'has', 'have', 'had', 'not', 'no', 'any',
  'by', 'with', 'as', 'which', 'what', 'from', 'before', 'after', 'still', 'now', 'currently',
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

export interface PropertyClassification {
  readonly declarationId: string;
  readonly declaredProperty: string;
  readonly nearestOwedKey: string | null;
  readonly nearestOwedScore: number;
  readonly nearestForbiddenKind: string | null;
  readonly nearestForbiddenText: string | null;
  readonly nearestForbiddenScore: number;
  readonly classifiedAs: 'OWED_PROPERTY' | 'FORBIDDEN_SUBSTITUTION' | 'UNMATCHED';
}

/**
 * Classify one declared property against the case's preregistered truth. The comparison is a
 * deterministic overlap over preregistered strings; nothing here infers safety meaning, and every
 * score is reported so the classification can be checked rather than trusted.
 */
export function classifyDeclaredProperty(
  c: Case224, d: DeclarationFixture224,
): PropertyClassification {
  let owedKey: string | null = null; let owedScore = 0;
  for (const p of c.owedProperties) {
    const s = overlap(d.missingFact, p.proposition);
    if (s > owedScore) { owedScore = s; owedKey = p.key; }
  }
  let fKind: string | null = null; let fText: string | null = null; let fScore = 0;
  for (const p of c.owedProperties) {
    for (const f of p.forbiddenSubstitutions) {
      const s = overlap(d.missingFact, f.text);
      if (s > fScore) { fScore = s; fKind = f.kind; fText = f.text; }
    }
  }
  const classifiedAs = owedScore === 0 && fScore === 0
    ? 'UNMATCHED'
    : (fScore > owedScore ? 'FORBIDDEN_SUBSTITUTION' : 'OWED_PROPERTY');
  return {
    declarationId: d.declarationId, declaredProperty: d.missingFact,
    nearestOwedKey: owedKey, nearestOwedScore: Number(owedScore.toFixed(3)),
    nearestForbiddenKind: fKind, nearestForbiddenText: fText,
    nearestForbiddenScore: Number(fScore.toFixed(3)),
    classifiedAs,
  };
}

// ---------------------------------------------------------------- the four measures

export interface MeasureResult224 {
  readonly measure: Measure224;
  readonly verdict: 'COMPLIANT' | 'DEFECTIVE' | 'NOT_EXERCISED';
  readonly reason: string;
}

/** A candidate the first pass itself marked as unresolved. Its own words, not an inference. */
function selfDeclaredUnresolved(c: Case224): readonly CandidateFixture224[] {
  return c.output.candidates.filter(k =>
    k.assertedConditionState === 'UNKNOWN' || k.assertedConditionState === 'INSUFFICIENT_EVIDENCE');
}

/** Does any uncertainty statement witness a decision made about this candidate? */
function witnessedNegativeFor(c: Case224, k: CandidateFixture224): boolean {
  return c.output.uncertaintyStatements.some(s =>
    overlap(s, k.reasoning) >= 0.10
    && /does not change|no different|either way|not decision-critical|whichever way|bears on a later/i
      .test(s));
}

const BLANKET_NEGATIVE = /no decision[- ]critical fact is missing|nothing (?:is )?(?:left )?open|no facts? (?:is|are) missing/i;

export function evaluateRecall(c: Case224, contract: ContractUnderTest): MeasureResult224 {
  if (c.owedProperties.length === 0) {
    return { measure: 'RECALL', verdict: 'NOT_EXERCISED', reason: 'no property is owed on this case' };
  }
  const rule = CONTRACT_RULES[contract];
  const declared = c.output.declarations.length;
  if (declared > 0) {
    return { measure: 'RECALL', verdict: 'COMPLIANT', reason: `${declared} declaration(s) emitted` };
  }
  if (rule.declarationTrigger === 'SUBORDINATE_TO_CLARIFICATION') {
    if (c.output.clarificationCount === 0) {
      return {
        measure: 'RECALL', verdict: 'COMPLIANT',
        reason: 'the contract gates the declaration on the clarification. No question was asked, '
          + 'so under this contract no entry is owed and the empty list is compliant. This is the '
          + 'defect, reproduced: the contract cannot tell this apart from correct restraint.',
      };
    }
    return {
      measure: 'RECALL', verdict: 'DEFECTIVE',
      reason: 'a question was asked and no entry states the fact it would settle',
    };
  }
  const unresolved = selfDeclaredUnresolved(c);
  const unwitnessed = unresolved.filter(k => !witnessedNegativeFor(c, k));
  if (unwitnessed.length > 0) {
    return {
      measure: 'RECALL', verdict: 'DEFECTIVE',
      reason: `candidate(s) ${unwitnessed.map(k => k.candidateKey).join(', ')} stand at `
        + 'UNKNOWN or INSUFFICIENT_EVIDENCE with no declaration and no witnessed negative. The '
        + 'declaration trigger is independent of the clarification, so the entry is owed.'
        + (BLANKET_NEGATIVE.test(c.output.summary)
          ? ' The summary additionally asserts a blanket negative that contradicts the candidate.'
          : ''),
    };
  }
  return {
    measure: 'RECALL', verdict: 'DEFECTIVE',
    reason: 'a property is owed by the frozen truth and no entry states it',
  };
}

export function evaluatePrecision(c: Case224, contract: ContractUnderTest): MeasureResult224 {
  if (c.owedProperties.length > 0) {
    return {
      measure: 'PRECISION', verdict: 'NOT_EXERCISED',
      reason: 'this case owes a property, so it cannot exercise restraint',
    };
  }
  const rule = CONTRACT_RULES[contract];
  if (c.output.declarations.length > 0) {
    return {
      measure: 'PRECISION', verdict: 'DEFECTIVE',
      reason: `${c.output.declarations.length} declaration(s) emitted where the frozen truth owes none`,
    };
  }
  const unresolved = selfDeclaredUnresolved(c);
  if (rule.negativeConclusionMustBeWitnessed && unresolved.length > 0) {
    const unwitnessed = unresolved.filter(k => !witnessedNegativeFor(c, k));
    if (unwitnessed.length > 0) {
      return {
        measure: 'PRECISION', verdict: 'DEFECTIVE',
        reason: `restraint is correct here, but candidate(s) ${unwitnessed.map(k => k.candidateKey)
          .join(', ')} were set aside without a witnessed negative, so the decision is unreadable`,
      };
    }
    return {
      measure: 'PRECISION', verdict: 'COMPLIANT',
      reason: 'no declaration emitted, and every self-declared unresolved candidate carries a '
        + 'witnessed negative saying what does not change',
    };
  }
  return {
    measure: 'PRECISION', verdict: 'COMPLIANT',
    reason: 'no declaration emitted where the frozen truth owes none',
  };
}

export function evaluatePropertyIdentity(
  c: Case224, contract: ContractUnderTest,
): { readonly result: MeasureResult224; readonly classifications: readonly PropertyClassification[] } {
  if (c.output.declarations.length === 0) {
    return {
      result: {
        measure: 'PROPERTY_IDENTITY', verdict: 'NOT_EXERCISED',
        reason: 'no declaration was emitted, so no property was selected to judge',
      },
      classifications: [],
    };
  }
  const rule = CONTRACT_RULES[contract];
  const cls = c.output.declarations.map(d => classifyDeclaredProperty(c, d));
  const bad = cls.filter(x =>
    x.classifiedAs === 'FORBIDDEN_SUBSTITUTION'
    && rule.refusesPropertyKinds.includes(x.nearestForbiddenKind ?? ''));
  const missed = cls.filter(x =>
    x.classifiedAs === 'FORBIDDEN_SUBSTITUTION'
    && !rule.refusesPropertyKinds.includes(x.nearestForbiddenKind ?? ''));
  if (bad.length > 0) {
    return {
      result: {
        measure: 'PROPERTY_IDENTITY', verdict: 'DEFECTIVE',
        reason: bad.map(x => `${x.declarationId} names a ${x.nearestForbiddenKind} `
          + `("${x.nearestForbiddenText}", overlap ${x.nearestForbiddenScore}) rather than the owed `
          + `property (overlap ${x.nearestOwedScore}); ${rule.refusesPropertyKindsSource} refuses it`)
          .join('; '),
      },
      classifications: cls,
    };
  }
  if (missed.length > 0) {
    return {
      result: {
        measure: 'PROPERTY_IDENTITY', verdict: 'COMPLIANT',
        reason: missed.map(x => `${x.declarationId} names a ${x.nearestForbiddenKind} rather than `
          + 'the owed property, and this contract does not refuse that kind. The substitution '
          + 'survives. This is the defect, reproduced.').join('; '),
      },
      classifications: cls,
    };
  }
  return {
    result: {
      measure: 'PROPERTY_IDENTITY', verdict: 'COMPLIANT',
      reason: cls.map(x => `${x.declarationId} -> ${x.nearestOwedKey} (overlap `
        + `${x.nearestOwedScore} against ${x.nearestForbiddenScore} for the nearest substitution)`)
        .join('; '),
    },
    classifications: cls,
  };
}

export function evaluateIndependence(c: Case224): MeasureResult224 {
  if (c.owedProperties.length < 2) {
    return {
      measure: 'INDEPENDENCE', verdict: 'NOT_EXERCISED',
      reason: 'fewer than two independent properties are owed',
    };
  }
  if (c.output.declarations.length >= c.owedProperties.length) {
    return {
      measure: 'INDEPENDENCE', verdict: 'COMPLIANT',
      reason: `${c.output.declarations.length} entries for ${c.owedProperties.length} owed properties`,
    };
  }
  return {
    measure: 'INDEPENDENCE', verdict: 'DEFECTIVE',
    reason: `${c.owedProperties.length} independent properties are owed and `
      + `${c.output.declarations.length} entry/entries were emitted; independent facts were joined`,
  };
}
