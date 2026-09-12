/**
 * §210G -- DECLARATION-WIDE SEMANTIC ALIGNMENT FIXTURES. R4B.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * Eight fixtures covering the eight distinctions the authorization names. Each carries a CONCRETE
 * declaration shape -- the five contract fields plus the bound question -- because R4B is about
 * whether those fields agree with each other, and a scenario alone cannot show that.
 *
 * These are FROZEN EXPECTATIONS, not results. None can pass or fail on model behaviour. R4B has no
 * deterministic half, so unlike §210E's R7 fixtures nothing here is executed against a checker that
 * reads meaning: the suite asserts the fixture SET is internally consistent -- that the alignment
 * verdict and the state-world placement never disagree, that every defect fixture names an
 * incorrect shape and every counter-control names none -- and asserts that no refusal code was
 * added to the projection.
 *
 * Three are counter-controls. Two of those (FX-R4B-E and FX-R4B-G) exist because the fix could
 * otherwise become the next defect: an entry whose property IS a required act must keep the act in
 * its branches, and a question asking for evidence must stay legal.
 */

export type AlignmentIntent = 'PREVENT_DEFECT' | 'PREVENT_OVERCORRECTION';

/** Where a shape's branches put the world in which the state is true and nothing was established. */
export type StateWorldPlacement =
  /** The branches classify it by the state, which is correct. */
  | 'TRUE_SIDE'
  /** The branches classify it as the adverse state because evidence is absent. The R4B defect. */
  | 'ADVERSE_SIDE'
  /** No such world: the act itself is the property, so the act not having occurred IS the state. */
  | 'NO_SUCH_WORLD_ACT_IS_THE_PROPERTY';

export interface AlignmentFixture {
  fixtureId: string;
  targets: 'R4B';
  intent: AlignmentIntent;
  scenario: string;
  /** Frozen, because the state-world test is meaningless without the decision it serves. */
  decisionUnderAnalysis: string;
  /** The declaration shape this fixture presents. */
  shape: {
    missingFact: string;
    branchA: string;
    branchB: string;
    decisionIfA: string;
    decisionIfB: string;
    boundQuestion: string;
  };
  /**
   * The property-selection answer. TRUE where perfect direct sight of the workplace would leave
   * the decision still turning on whether the required act was carried out.
   */
  processIsTheProperty: boolean;
  /** The frozen state-world question for this fixture, in its own terms. */
  stateWorldTest: string;
  stateTrueButUnestablishedWorldFallsOn: StateWorldPlacement;
  alignmentVerdict: 'ALIGNED' | 'DRIFTED_TO_EVIDENCE';
  /** The shape that must not be emitted. Empty on a counter-control. */
  incorrectShape: string;
  requiredOutcome: string;
  decidedByGate: 'GATE 12';
  evaluationQuestion: string;
}

export const ALIGNMENT_FIXTURES: readonly AlignmentFixture[] = [
  // ============================================================ 1. STATE ADEQUATE / TEST ABSENT
  {
    fixtureId: 'FX-R4B-A-STATE-ADEQUATE-TEST-ABSENT',
    targets: 'R4B',
    intent: 'PREVENT_DEFECT',
    scenario: 'The hoist rope on an overhead travelling crane in a steel stockholding bay runs over '
      + 'sheaves inside a boxed section of the crab and cannot be seen along most of its length. '
      + 'The rope examination that would normally have been carried out at the turn of the year was '
      + 'not done, because the contractor who holds the contract went into administration. Lifting '
      + 'is continuing on the bay through the visit.',
    decisionUnderAnalysis: 'whether lifting with this crane may continue now',
    shape: {
      missingFact: 'whether the hoist rope has deteriorated past the point at which it must be '
        + 'taken out of service',
      branchA: 'the rope is within its discard criteria along its whole length, including the '
        + 'hidden run over the sheaves',
      branchB: 'the rope has broken wires, corrosion or deformation past its discard criteria '
        + 'somewhere along its length',
      decisionIfA: 'lifting on this crane may continue',
      decisionIfB: 'stop lifting on this crane and take the rope out of service',
      boundQuestion: 'what does an examination of the rope over its full length, including the run '
        + 'inside the boxed section, show against its discard criteria?',
    },
    processIsTheProperty: false,
    stateWorldTest: 'a rope that is genuinely sound, with the examination never carried out, '
      + 'satisfies branchA. The missed examination is why the entry is unresolved; it is not a '
      + 'finding that the rope is worn.',
    stateTrueButUnestablishedWorldFallsOn: 'TRUE_SIDE',
    alignmentVerdict: 'ALIGNED',
    incorrectShape: 'branchB written as "the rope examination has not been carried out, or the '
      + 'rope is past its discard criteria", which would put a sound unexamined rope on the stop '
      + 'side',
    requiredOutcome: 'the property, both branches and both decisions all turn on the condition of '
      + 'the rope. The absent examination belongs in notEstablishedBecause and in the copied span.',
    decidedByGate: 'GATE 12',
    evaluationQuestion: 'Does the shape classify a sound but unexamined rope as branchA?',
  },

  // ============================================================ 2. STATE INADEQUATE / TEST SAYS ADEQUATE
  {
    fixtureId: 'FX-R4B-B-STATE-INADEQUATE-TEST-SAYS-ADEQUATE',
    targets: 'R4B',
    intent: 'PREVENT_DEFECT',
    scenario: 'A carbon steel line carrying wet process gas at a chemical works was checked for '
      + 'wall loss during the last outage. The readings were taken along the top of the horizontal '
      + 'run and all came back above the minimum. Wet gas lines on this plant have historically '
      + 'lost wall along the bottom of the run, where condensate lies, and no readings were taken '
      + 'there. The line is back in service at working pressure.',
    decisionUnderAnalysis: 'whether the line may stay in service at working pressure',
    shape: {
      missingFact: 'whether the remaining wall thickness along the bottom of the horizontal run is '
        + 'above the minimum the line needs at working pressure',
      branchA: 'the wall along the bottom of the run is above the minimum thickness',
      branchB: 'the wall along the bottom of the run has thinned below the minimum',
      decisionIfA: 'the line may stay in service at working pressure',
      decisionIfB: 'take the line out of service and repair or replace the thinned section before '
        + 'it is pressurised again',
      boundQuestion: 'what wall thickness readings taken along the bottom of the horizontal run '
        + 'does the line show now?',
    },
    processIsTheProperty: false,
    stateWorldTest: 'the passing readings do not settle the property, because they were taken '
      + 'somewhere else. A test result is evidence about the state and never replaces it: where '
      + 'the result and the state can come apart, the state is what the entry is about.',
    stateTrueButUnestablishedWorldFallsOn: 'TRUE_SIDE',
    alignmentVerdict: 'ALIGNED',
    incorrectShape: 'missingFact written as "whether wall thickness readings have been taken along '
      + 'the bottom of the run", or a branchA reading "the readings show the wall is above '
      + 'minimum", either of which would let a result taken at the wrong place settle the entry',
    requiredOutcome: 'the underlying wall thickness stays authoritative. A passing result from the '
      + 'wrong location does not move the entry to branchA, and the entry is not rewritten into '
      + 'whether readings exist.',
    decidedByGate: 'GATE 12',
    evaluationQuestion: 'Does the underlying state remain authoritative where an existing test '
      + 'result says adequate but does not bear on the property?',
  },

  // ============================================================ 3. CLEANING PROCESS vs RESIDUAL STATE
  {
    fixtureId: 'FX-R4B-C-CLEANING-PROCESS-VERSUS-RESIDUAL-STATE',
    targets: 'R4B',
    intent: 'PREVENT_DEFECT',
    scenario: 'The extract ductwork above a powder coating booth is stripped of deposit on a '
      + 'quarterly cycle because the deposit burns readily. The last strip-out is logged as done, '
      + 'but the crew who did it were pulled off part way through to deal with a breakdown and '
      + 'nobody signed the section above the oven roof. Coating is running and the oven is up to '
      + 'temperature.',
    decisionUnderAnalysis: 'whether coating may continue with the oven at temperature',
    shape: {
      missingFact: 'whether combustible deposit remains in the extract ductwork above the oven '
        + 'roof in a quantity that would carry a fire',
      branchA: 'the ductwork above the oven roof is clear of deposit',
      branchB: 'deposit remains in the ductwork above the oven roof in a quantity that would carry '
        + 'a fire',
      decisionIfA: 'coating may continue with the oven at temperature',
      decisionIfB: 'shut the oven down and clear the ductwork before coating restarts',
      boundQuestion: 'what does an internal inspection of the duct run above the oven roof show '
        + 'about the deposit remaining there?',
    },
    processIsTheProperty: false,
    stateWorldTest: 'a duct run that is genuinely clear, with the sheet unsigned and the strip-out '
      + 'interrupted, satisfies branchA. Whether the clean finished is how anyone would find out '
      + 'what is in the duct; what is in the duct is the hazard.',
    stateTrueButUnestablishedWorldFallsOn: 'TRUE_SIDE',
    alignmentVerdict: 'ALIGNED',
    incorrectShape: 'missingFact written as "whether the quarterly strip-out was completed above '
      + 'the oven roof", which is the establishment process substituted for the safety state',
    requiredOutcome: 'the property tracks the residue, not the cleaning. The unsigned section and '
      + 'the interrupted crew belong in notEstablishedBecause.',
    decidedByGate: 'GATE 12',
    evaluationQuestion: 'Where the decision turns on whether hazardous residue remains, does the '
      + 'property track the residue rather than whether cleaning completed?',
  },

  // ============================================================ 4. INSPECTION PROCESS vs LOAD CAPACITY
  {
    fixtureId: 'FX-R4B-D-INSPECTION-PROCESS-VERSUS-LOAD-CAPACITY',
    targets: 'R4B',
    intent: 'PREVENT_DEFECT',
    scenario: 'A run of floor grating covers the effluent sump in the plating shop. An operator '
      + 'reported one panel as springy underfoot several weeks ago and the report was entered but '
      + 'not closed out. A drum truck carrying a full drum of acid is routed across that run and is '
      + 'crossing it during the visit.',
    decisionUnderAnalysis: 'whether the loaded drum truck may keep crossing the grating run',
    shape: {
      missingFact: 'whether the grating panel over the sump will carry the loaded drum truck',
      branchA: 'the panel will carry the loaded drum truck without collapsing',
      branchB: 'the panel is corroded or distorted to the point where it will not carry the loaded '
        + 'drum truck',
      decisionIfA: 'the loaded drum truck may keep crossing the grating run',
      decisionIfB: 'stop routing the drum truck across the grating and keep the panel out of use '
        + 'until it is replaced or proved',
      boundQuestion: 'what does an examination of the reported panel, from above and from inside '
        + 'the sump, show about its remaining section and its bearing at the ends?',
    },
    processIsTheProperty: false,
    stateWorldTest: 'a panel that will genuinely carry the load, never inspected and its report '
      + 'never closed out, satisfies branchA. The open report is the reason for the entry; it is '
      + 'not the property.',
    stateTrueButUnestablishedWorldFallsOn: 'TRUE_SIDE',
    alignmentVerdict: 'ALIGNED',
    incorrectShape: 'missingFact written as "whether the reported panel has been inspected and '
      + 'signed off, or repaired", which is the establishment process substituted for load-bearing '
      + 'adequacy',
    requiredOutcome: 'the property tracks actual load-bearing adequacy, which is what is '
      + 'decision-critical here.',
    decidedByGate: 'GATE 12',
    evaluationQuestion: 'Where load-bearing adequacy is decision-critical, does the property track '
      + 'the capacity rather than whether an inspection happened?',
  },

  // ============================================================ 5. REQUIRED ACT IS THE PROPERTY
  {
    fixtureId: 'FX-R4B-E-REQUIRED-ACT-IS-THE-PROPERTY',
    targets: 'R4B',
    intent: 'PREVENT_OVERCORRECTION',
    scenario: 'The level transmitter on a bulk acid storage tank at a water treatment works has '
      + 'been out of service since the weekend, and while it is out the standing arrangement is '
      + 'that the duty operator reads the sight glass and logs the level every hour, and that the '
      + 'outgoing shift tells the incoming shift the arrangement is running. The night operator has '
      + 'taken over on his own. The day operator has gone and could not be asked whether he passed '
      + 'the arrangement on. A delivery is booked for the early hours.',
    decisionUnderAnalysis: 'whether the booked acid delivery may be taken on the night shift',
    shape: {
      missingFact: 'whether the night operator was told that the level transmitter is out of '
        + 'service and that the level must be read from the sight glass and logged every hour',
      branchA: 'the arrangement was passed on at handover and the night operator is working to it',
      branchB: 'the arrangement was not passed on, and the night operator is running the tank '
        + 'believing the transmitter is live',
      decisionIfA: 'the booked delivery may be taken on the night shift',
      decisionIfB: 'do not take the delivery until the night operator has been told the '
        + 'transmitter is out and the hourly sight-glass reading is running',
      boundQuestion: 'was the out-of-service transmitter and the hourly sight-glass arrangement '
        + 'passed to the night operator at handover?',
    },
    processIsTheProperty: true,
    stateWorldTest: 'perfect direct sight of the workplace does not settle this entry. The tank '
      + 'level, the sight glass and the transmitter can all be seen, and the decision still turns '
      + 'on whether the operator was told. There is no world in which the state is true and the act '
      + 'did not occur, because the act IS the state.',
    stateTrueButUnestablishedWorldFallsOn: 'NO_SUCH_WORLD_ACT_IS_THE_PROPERTY',
    alignmentVerdict: 'ALIGNED',
    incorrectShape: '',
    requiredOutcome: 'the act legitimately stays in missingFact AND in both branches. R4B must not '
      + 'rewrite this into a state-only property such as whether the level is currently known, and '
      + 'GATE 12 must not be read as pushing every branch toward a physical condition. This is the '
      + '§210F E4 shape and it is protected.',
    decidedByGate: 'GATE 12',
    evaluationQuestion: 'Does performance of the required act legitimately remain in the property '
      + 'and in the branches where the act itself is what changes the decision?',
  },

  // ============================================================ 6. PROPERTY CORRECT / BRANCHES PROXY
  {
    fixtureId: 'FX-R4B-F-PROPERTY-CORRECT-BRANCHES-PROXY',
    targets: 'R4B',
    intent: 'PREVENT_DEFECT',
    scenario: 'The head bearing on a bucket elevator in a feed mill has been noticed running warm '
      + 'by two operators on different shifts. The elevator is enclosed and handling meal. Nobody '
      + 'has put a thermometer on the bearing, and the fixed temperature probe fitted to the head '
      + 'shaft has been reading open-circuit since a lightning strike in the summer. The elevator '
      + 'is running.',
    decisionUnderAnalysis: 'whether the elevator may keep running on meal',
    shape: {
      missingFact: 'whether the head bearing is running hot enough to be an ignition source inside '
        + 'the elevator',
      branchA: 'temperature readings confirm the head bearing is within its normal running range',
      branchB: 'no temperature readings have been taken, or the readings show the bearing is '
        + 'running hot',
      decisionIfA: 'the elevator may keep running on meal',
      decisionIfB: 'stop the elevator and establish the bearing temperature before it is restarted',
      boundQuestion: 'what temperature is the head bearing actually running at?',
    },
    processIsTheProperty: false,
    stateWorldTest: 'a bearing that is genuinely running cool, with nobody having put a '
      + 'thermometer on it and the fixed probe dead, satisfies branchB\'s FIRST disjunct and is '
      + 'therefore classified as the adverse state. The branches divide tested from untested, not '
      + 'hot from cool.',
    stateTrueButUnestablishedWorldFallsOn: 'ADVERSE_SIDE',
    alignmentVerdict: 'DRIFTED_TO_EVIDENCE',
    incorrectShape: 'branchA conditioned on readings confirming the state, and branchB carrying '
      + '"no temperature readings have been taken" as a disjunct alongside the adverse state. This '
      + 'is the §210F E1 shape exactly: a correct property with branches that partition the '
      + 'evidence.',
    requiredOutcome: 'FAILS semantic alignment. The property is right and the entry is still wrong, '
      + 'because branchA and branchB do not divide the property. The repair is to bring the '
      + 'branches back to hot against not hot, and NOT to cut detail out of missingFact so that it '
      + 'agrees with the branches.',
    decidedByGate: 'GATE 12',
    evaluationQuestion: 'Is a correct property with evidence-partitioned branches recorded as a '
      + 'failure of declaration-wide alignment rather than as an acceptable entry?',
  },

  // ============================================================ 7. PROPERTY CORRECT / CLARIFICATION EVIDENCE-BASED
  {
    fixtureId: 'FX-R4B-G-PROPERTY-CORRECT-CLARIFICATION-EVIDENCE-BASED',
    targets: 'R4B',
    intent: 'PREVENT_OVERCORRECTION',
    scenario: 'The supply cable to a submersible pump in a quarry settlement lagoon was pulled '
      + 'through a duct that had standing water in it after the pump was changed. The cable is '
      + 'energised and men work around the lagoon edge. Nobody has put an instrument on the cable '
      + 'since it was pulled.',
    decisionUnderAnalysis: 'whether the pump may stay energised with men working at the lagoon edge',
    shape: {
      missingFact: 'whether the insulation of the pump supply cable has fallen below the safe '
        + 'minimum after being pulled through the flooded duct',
      branchA: 'the cable insulation is above the safe minimum along its whole run',
      branchB: 'the cable insulation has fallen below the safe minimum, so the cable can put a '
        + 'voltage onto the water or the pump body',
      decisionIfA: 'the pump may stay energised with men working at the lagoon edge',
      decisionIfB: 'isolate the pump and keep it isolated until the cable is replaced or proved',
      boundQuestion: 'what does an insulation resistance test on the pump supply cable, taken at '
        + 'the panel with the pump disconnected, read now?',
    },
    processIsTheProperty: false,
    stateWorldTest: 'the bound question asks for a measurement, and that is correct: the answer '
      + 'settles the insulation state, which is the property. Asking for the reading does not turn '
      + 'the property into whether a reading was taken, and the branches divide the insulation, not '
      + 'the testing.',
    stateTrueButUnestablishedWorldFallsOn: 'TRUE_SIDE',
    alignmentVerdict: 'ALIGNED',
    incorrectShape: '',
    requiredOutcome: 'VALID. A clarification may ask for evidence capable of settling the property '
      + 'and usually should. R4B must not be read as forbidding measurement language in a bound '
      + 'question, because that would leave the model no way to say what would settle the entry.',
    decidedByGate: 'GATE 12',
    evaluationQuestion: 'Does a bound question that asks for the measurement which settles the '
      + 'property remain valid, without changing the property?',
  },

  // ============================================================ 8. PROPERTY CORRECT / DECISION EVIDENCE-CONDITIONED
  {
    fixtureId: 'FX-R4B-H-PROPERTY-CORRECT-DECISION-EVIDENCE-CONDITIONED',
    targets: 'R4B',
    intent: 'PREVENT_DEFECT',
    scenario: 'A fume cupboard in the works laboratory is used to weigh out a sensitising hardener. '
      + 'The airflow indicator on the sash has been showing a lower figure than the technicians '
      + 'remember, and the sash is being worked at its normal height. Weighing is going on through '
      + 'the visit.',
    decisionUnderAnalysis: 'whether hardener may keep being weighed out in this fume cupboard',
    shape: {
      missingFact: 'whether the face velocity across the sash opening is above the minimum the '
        + 'cupboard needs to contain the hardener dust',
      branchA: 'the face velocity across the sash opening is above the minimum',
      branchB: 'the face velocity across the sash opening has fallen below the minimum, so dust can '
        + 'come out of the opening',
      decisionIfA: 'weighing may continue once the annual test certificate for the cupboard has '
        + 'been found and filed',
      decisionIfB: 'stop weighing in this cupboard until a test record is produced',
      boundQuestion: 'what face velocity does a traverse across the sash opening at working height '
        + 'read now?',
    },
    processIsTheProperty: false,
    stateWorldTest: 'the property and both branches divide the face velocity correctly. The '
      + 'DECISIONS do not follow from them: decisionIfA holds the work back for a certificate even '
      + 'where branchA is true, and decisionIfB stops the work for a missing record rather than '
      + 'for the low velocity. The drift is in the decisions alone.',
    stateTrueButUnestablishedWorldFallsOn: 'TRUE_SIDE',
    alignmentVerdict: 'DRIFTED_TO_EVIDENCE',
    incorrectShape: 'decisionIfA made conditional on locating and filing a certificate, and '
      + 'decisionIfB triggered by the absence of a record rather than by the low face velocity',
    requiredOutcome: 'FAILS semantic alignment. decisionIfA must follow from branchA being TRUE and '
      + 'decisionIfB from branchB being true. A decision conditioned on evidence collection is only '
      + 'correct where the evidence act is itself the frozen safety requirement, which it is not '
      + 'here: the requirement is containment, and the certificate is a record of it.',
    decidedByGate: 'GATE 12',
    evaluationQuestion: 'Is an entry whose decisions follow from evidence collection rather than '
      + 'from the truth of its own branches recorded as a failure of alignment?',
  },
];

/** Problems that make a fixture unable to discriminate. Empty means the set is well formed. */
export function alignmentFixtureProblems(): string[] {
  const problems: string[] = [];
  const ids = new Set<string>();

  /** §210F stimuli replayed, or noun-substituted, would not be new fixtures. */
  const F_VOCAB =
    /precast|casting bed|maturity probe|companion cube|lifting anchor|balance tank|spray ball|caustic circuit|cycle-complete|underrun|trailer lock|drummed lubricant|protective board|robot welding cell|reduced-speed cycle|locating pin|wire feed/i;
  /** §210D and §210E scenarios replayed would not be new either. */
  const DE_VOCAB =
    /power press|light curtain|clutch and brake|\bladle\b|reline|preheat|foundry|telehandler|overhead line|goalpost|development heading|jumbo|scaling bar|blast enclosure|blasting helmet|breathing-air compressor|paint mixing room|rescue craft|throw-line|tail lift|roll-stop|pipe rack|cold store|evaporator|mast chain|vacuum lifter|glazing|brine pump|mezzanine pallet gate|earth electrode/i;

  for (const f of ALIGNMENT_FIXTURES) {
    if (ids.has(f.fixtureId)) problems.push(`${f.fixtureId}: duplicate id`);
    ids.add(f.fixtureId);

    if (F_VOCAB.test(f.scenario)) problems.push(`${f.fixtureId}: replays §210F vocabulary`);
    if (DE_VOCAB.test(f.scenario)) problems.push(`${f.fixtureId}: replays §210D or §210E vocabulary`);
    if (/\bE[1-4]\b/.test(f.scenario)) problems.push(`${f.fixtureId}: names a §210F case`);
    if (/\bD[1-5]\b/.test(f.scenario)) problems.push(`${f.fixtureId}: names a §210D case`);
    if (f.scenario.length < 180) problems.push(`${f.fixtureId}: scenario too thin`);
    if (/decision-critical|decision-neutral|\bproxy\b|placeholder|filler|alignment|drift/i
      .test(f.scenario)) {
      problems.push(`${f.fixtureId}: the scenario labels its own answer`);
    }
    if (f.decisionUnderAnalysis.length < 20) problems.push(`${f.fixtureId}: decision unfrozen`);
    if (f.evaluationQuestion.length === 0) problems.push(`${f.fixtureId}: no evaluation question`);
    if (f.stateWorldTest.length < 40) problems.push(`${f.fixtureId}: state-world test unfrozen`);

    for (const [k, v] of Object.entries(f.shape)) {
      if (v.trim().length < 15) problems.push(`${f.fixtureId}: shape.${k} is too thin to judge`);
    }
    if (f.shape.branchA.trim().toLowerCase() === f.shape.branchB.trim().toLowerCase()) {
      problems.push(`${f.fixtureId}: branches are identical`);
    }
    if (f.shape.decisionIfA.trim().toLowerCase() === f.shape.decisionIfB.trim().toLowerCase()) {
      problems.push(`${f.fixtureId}: decisions do not diverge`);
    }

    if (f.intent === 'PREVENT_DEFECT' && f.incorrectShape.length === 0) {
      problems.push(`${f.fixtureId}: prevents a defect but names no incorrect shape`);
    }
    if (f.intent === 'PREVENT_OVERCORRECTION' && f.incorrectShape.length !== 0) {
      problems.push(`${f.fixtureId}: a counter-control names an incorrect shape`);
    }

    // THE INVARIANT. The alignment verdict and the state-world placement may never disagree.
    const drifted = f.alignmentVerdict === 'DRIFTED_TO_EVIDENCE';
    if (f.stateTrueButUnestablishedWorldFallsOn === 'ADVERSE_SIDE' && !drifted) {
      problems.push(`${f.fixtureId}: puts the state-true world on the adverse side yet calls the `
        + 'entry aligned');
    }
    if (f.stateTrueButUnestablishedWorldFallsOn === 'NO_SUCH_WORLD_ACT_IS_THE_PROPERTY'
      && !f.processIsTheProperty) {
      problems.push(`${f.fixtureId}: claims no state-true world exists but does not hold the act `
        + 'to be the property');
    }
    if (f.processIsTheProperty
      && f.stateTrueButUnestablishedWorldFallsOn !== 'NO_SUCH_WORLD_ACT_IS_THE_PROPERTY') {
      problems.push(`${f.fixtureId}: holds the act to be the property but still posits a `
        + 'state-true-and-unestablished world');
    }
    if (f.processIsTheProperty && drifted) {
      problems.push(`${f.fixtureId}: an act-is-the-property entry cannot drift to its own evidence`);
    }
  }

  // ---- coverage the authorization names, by construction rather than by count.
  const need: readonly [string, (f: AlignmentFixture) => boolean][] = [
    ['state adequate / test absent',
      f => f.fixtureId.includes('STATE-ADEQUATE-TEST-ABSENT')],
    ['state inadequate / test says adequate',
      f => f.fixtureId.includes('STATE-INADEQUATE-TEST-SAYS-ADEQUATE')],
    ['cleaning process versus residual state',
      f => f.fixtureId.includes('CLEANING-PROCESS')],
    ['inspection process versus load capacity',
      f => f.fixtureId.includes('INSPECTION-PROCESS')],
    ['required act is the property', f => f.processIsTheProperty],
    ['property correct / branches proxy',
      f => f.fixtureId.includes('BRANCHES-PROXY') && f.alignmentVerdict === 'DRIFTED_TO_EVIDENCE'],
    ['property correct / clarification evidence-based',
      f => f.fixtureId.includes('CLARIFICATION-EVIDENCE-BASED')
        && f.alignmentVerdict === 'ALIGNED'],
    ['property correct / decision evidence-conditioned',
      f => f.fixtureId.includes('DECISION-EVIDENCE-CONDITIONED')
        && f.alignmentVerdict === 'DRIFTED_TO_EVIDENCE'],
  ];
  for (const [name, pred] of need) {
    if (!ALIGNMENT_FIXTURES.some(pred)) problems.push(`no fixture covers: ${name}`);
  }

  // A rule that can over-restrain must carry a counter-control, and R4B can over-restrain twice.
  if (ALIGNMENT_FIXTURES.filter(f => f.intent === 'PREVENT_OVERCORRECTION').length < 2) {
    problems.push('R4B needs a counter-control for the act-shaped property AND for the '
      + 'evidence-seeking question; fewer than two are present');
  }
  // A set with no failing shape proves nothing about detection.
  if (!ALIGNMENT_FIXTURES.some(f => f.alignmentVerdict === 'DRIFTED_TO_EVIDENCE')) {
    problems.push('no fixture exhibits the defect the gate exists to prevent');
  }

  return problems;
}
