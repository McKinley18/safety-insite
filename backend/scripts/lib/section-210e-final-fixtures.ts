/**
 * §210E -- LOCAL FINAL-REMEDIATION FIXTURES. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * FROZEN EXPECTATIONS, not results. Nothing here executes a model, and NO FIXTURE IN THIS FILE CAN
 * PASS OR FAIL ON MODEL BEHAVIOUR. The suite that reads them checks only that the instruction
 * carries the rule each fixture targets, that the R7 contract check behaves as specified, and that
 * each fixture is itself well formed. Claiming a semantic PASS from this file would be the §204
 * vacuous-verdict error in a new place.
 *
 * ==================== THE COUNTER-CONTROLS ARE THE POINT ====================
 *
 * Four of the nine exist to catch OVERCORRECTION, which is the specific way a §210E fix would turn
 * into a §210F defect:
 *
 *   FX-R4-B  a case where naming a test in the property is CORRECT, so R4 cannot become "never
 *            write the word tested".
 *   FX-R6-B  a single-fact case where authorizing the work IS the right positive decision, so R6
 *            cannot become "always hedge".
 *   FX-R5-A  a BLOCKING question that IS correctly bound, so R5 is not satisfied by refusing to
 *            mark anything BLOCKING.
 *   FX-R7-C  a complete, real branch/decision set, so R7 cannot become a reason to withhold.
 *
 * None replays D1-D5, and none uses their vocabulary: no press, light curtain, ladle, drilling,
 * heading or ventilation duct, and no superficial renaming of one.
 */

export interface FinalFixture {
  fixtureId: string;
  targets: 'R4' | 'R5' | 'R6' | 'R7';
  /** PREVENT_DEFECT catches the §210D mechanism; PREVENT_OVERCORRECTION catches the fix going too far. */
  intent: 'PREVENT_DEFECT' | 'PREVENT_OVERCORRECTION';
  scenario: string;
  /** The shape that must not be emitted. Empty on an overcorrection counter-control. */
  incorrectShape: string;
  requiredOutcome: string;
  expectedDeclarationCount: number;
  decidedByGate: 'GATE 8' | 'GATE 9' | 'GATE 10' | 'GATE 11';
  evaluationQuestion: string;
}

export const FINAL_FIXTURES: readonly FinalFixture[] = [
  // ================================ 1 & 2. R4 property purity, and its counter-control
  {
    fixtureId: 'FX-R4-A-STATE-TRUE-BUT-UNMEASURED',
    targets: 'R4', intent: 'PREVENT_DEFECT',
    scenario: 'A ventilation damper in a paint mixing room is meant to sit closed while solvent is '
      + 'decanted, and the building management system that used to log its position was taken out '
      + 'of service during a controls upgrade six weeks ago. No position log exists for that '
      + 'period. Decanting is under way and the damper is out of sight above a false ceiling.',
    incorrectShape: 'missingFact asks whether the damper position has been logged, recorded or '
      + 'monitored since the controls upgrade, or joins that to the position with "and"',
    requiredOutcome: 'missingFact must describe the state: whether the damper is actually closed '
      + 'while decanting is in progress. The absent log belongs in notEstablishedBecause and in '
      + 'the copied span, and must stay there.',
    expectedDeclarationCount: 1,
    decidedByGate: 'GATE 8',
    evaluationQuestion: 'Picture the damper genuinely closed with no log of it. Is the declared '
      + 'property still unsatisfied? If so, the process was written instead of the state.',
  },
  {
    fixtureId: 'FX-R4-B-PROCESS-ITSELF-IS-THE-PROPERTY',
    targets: 'R4', intent: 'PREVENT_OVERCORRECTION',
    scenario: 'A rescue plan for work over water requires the throw-line and the powered rescue '
      + 'craft to be run up and proved at the start of each shift, because the craft has failed to '
      + 'start twice this month. The crew are already working from the pontoon. Nobody present '
      + 'could say whether the start-up proving was carried out this morning.',
    incorrectShape: '',
    requiredOutcome: 'here the ACT is the owed property. Whether the start-up proving was carried '
      + 'out this shift is legitimately the property, because performing it is what changes '
      + 'today\'s action. R4 must not rewrite this into a state-only property, and the '
      + 'counterfactual confirms it: in a world where the craft would start but nobody proved it, '
      + 'the property is genuinely still unsatisfied.',
    expectedDeclarationCount: 1,
    decidedByGate: 'GATE 8',
    evaluationQuestion: 'Does the rule still permit naming the act where performing the act is '
      + 'itself what is owed?',
  },
  // ================================ 3 & 4. R5 blocking-clarification binding
  {
    fixtureId: 'FX-R5-A-BLOCKING-QUESTION-CORRECTLY-BOUND',
    targets: 'R5', intent: 'PREVENT_OVERCORRECTION',
    scenario: 'A tail lift on a delivery vehicle is being used to lower a wheeled cage to the '
      + 'kerb. The lift platform has a roll-stop flap at its outer edge which is lying flat as the '
      + 'platform descends, and the driver is standing on the platform steadying the cage.',
    incorrectShape: '',
    requiredOutcome: 'a BLOCKING question about whether the roll-stop actually rises and holds on '
      + 'descent, bound by answersUnresolvedFactDeclarationId to the declaration stating that '
      + 'property. The binding is authored by the model and named explicitly.',
    expectedDeclarationCount: 1,
    decidedByGate: 'GATE 9',
    evaluationQuestion: 'Is the binding present and does it name the exact declaration that '
      + 'question would settle?',
  },
  {
    fixtureId: 'FX-R5-B-BLOCKING-QUESTION-WITHOUT-DECLARATION',
    targets: 'R5', intent: 'PREVENT_DEFECT',
    scenario: 'A pipe rack is being erected alongside a live process line. A permit is displayed '
      + 'at the access gate and the erection crew are bolting the second tier. The permit\'s '
      + 'listed isolation boundary could not be read from the gate and no one present had a copy.',
    incorrectShape: 'a BLOCKING question is asked about the isolation boundary while '
      + 'answersUnresolvedFactDeclarationId is absent and no declaration states that fact',
    requiredOutcome: 'the output is incomplete until the model either emits the declaration the '
      + 'question would settle and binds it, or concludes the question does not govern today\'s '
      + 'action and does not leave it at BLOCKING. A BLOCKING question naming no entry is invalid.',
    expectedDeclarationCount: 1,
    decidedByGate: 'GATE 9',
    evaluationQuestion: 'Does every BLOCKING question name the entry it settles, or get demoted on '
      + 'the record?',
  },
  // ================================ 5 & 6. R6 fact-local containment, and its counter-control
  {
    fixtureId: 'FX-R6-A-TWO-FACTS-POSITIVE-A-STAYS-LOCAL',
    targets: 'R6', intent: 'PREVENT_DEFECT',
    scenario: 'A cold store is being restocked by a rider truck. The evaporator above the racking '
      + 'aisle is shedding ice onto the floor of the aisle, and separately the truck\'s mast chain '
      + 'has a link with visible elongation that the driver mentioned but nobody has measured. '
      + 'Both were present throughout the visit and restocking continued.',
    incorrectShape: 'decisionIfA on either declaration authorizes restocking to continue, or says '
      + 'the aisle is safe to work, while the other declaration is still open',
    requiredOutcome: 'two declarations, and each positive decision confined to its own fact: the '
      + 'ice no longer blocks, or the chain no longer blocks, with the task still blocked by the '
      + 'other. Any wording carrying that meaning is acceptable; no exact form is required.',
    expectedDeclarationCount: 2,
    decidedByGate: 'GATE 10',
    evaluationQuestion: 'Does settling one fact stop short of authorizing the task while the '
      + 'sibling fact is open?',
  },
  {
    fixtureId: 'FX-R6-B-SINGLE-FACT-POSITIVE-A-MAY-AUTHORIZE',
    targets: 'R6', intent: 'PREVENT_OVERCORRECTION',
    scenario: 'A vacuum lifter is being used to place glazing units into a shopfront. Everything '
      + 'else about the operation was established during the visit: the exclusion area is set, the '
      + 'units are within the lifter\'s rated capacity, and the operator is trained and certified. '
      + 'The lifter\'s vacuum warning alarm did not sound during the pre-lift check and the '
      + 'operator was unsure whether it is meant to self-test.',
    incorrectShape: '',
    requiredOutcome: 'ONE declaration. Because nothing else is unresolved, decisionIfA may say the '
      + 'lift may proceed without qualification. R6 must NOT force a hedge here: qualifying a '
      + 'decision against siblings that do not exist would be a new defect.',
    expectedDeclarationCount: 1,
    decidedByGate: 'GATE 10',
    evaluationQuestion: 'Where nothing else is open, is an unqualified positive decision still '
      + 'permitted?',
  },
  // ================================ 7, 8 & 9. R7 placeholder semantics
  {
    fixtureId: 'FX-R7-A-PLACEHOLDER-BRANCH',
    targets: 'R7', intent: 'PREVENT_DEFECT',
    scenario: 'A brine pump seal is weeping into a bund in a chilled-water plant room, and the '
      + 'isolation valve upstream of the pump has no handle fitted. A fitter is preparing to '
      + 'change the seal and the plant is running.',
    incorrectShape: 'branchB is emitted as "placeholder" while branchA carries real content',
    requiredOutcome: 'the declaration is semantically invalid. A branch that states no factual '
      + 'condition cannot be told apart from the other, so the entry settles nothing. It is '
      + 'REFUSED by the contract, and the identified property is preserved under RR-7 as a record '
      + 'that can never be settled and can never close the analysis.',
    expectedDeclarationCount: 1,
    decidedByGate: 'GATE 11',
    evaluationQuestion: 'Does a filler branch prevent the declaration from being admitted, while '
      + 'the identified property still survives?',
  },
  {
    fixtureId: 'FX-R7-B-PLACEHOLDER-DECISION',
    targets: 'R7', intent: 'PREVENT_DEFECT',
    scenario: 'A mezzanine pallet gate in a distribution unit is propped open with a strap so that '
      + 'a conveyor can feed through it, and an operative is working within a metre of the open '
      + 'edge. The strap arrangement was in place for the whole visit.',
    incorrectShape: 'decisionIfA is emitted as "unused" or "n/a" while the branches carry real '
      + 'content',
    requiredOutcome: 'the declaration is semantically invalid. A decision that states no action '
      + 'leaves the reader unable to act on that answer. Refused by the contract, property '
      + 'preserved under RR-7.',
    expectedDeclarationCount: 1,
    decidedByGate: 'GATE 11',
    evaluationQuestion: 'Does a filler decision prevent admission while preserving the identified '
      + 'property?',
  },
  {
    fixtureId: 'FX-R7-C-COMPLETE-BRANCHES-AND-DECISIONS',
    targets: 'R7', intent: 'PREVENT_OVERCORRECTION',
    scenario: 'A skid-mounted generator supplying a site cabin has its earth electrode connection '
      + 'buried under spoil from a recent excavation, and continuity from the electrode to the '
      + 'generator frame could not be confirmed from the surface. The cabin is occupied and the '
      + 'generator is running.',
    incorrectShape: '',
    requiredOutcome: 'all four fields carry real content and the declaration is admitted normally. '
      + 'R7 must refuse only filler; a real branch containing an ordinary word such as "unknown" '
      + 'inside a full sentence is not filler and must not be refused.',
    expectedDeclarationCount: 1,
    decidedByGate: 'GATE 11',
    evaluationQuestion: 'Is a complete declaration still admitted, and is a real sentence '
      + 'containing an ordinary word never mistaken for filler?',
  },
];

/** Problems that make a fixture unable to discriminate. Empty means the set is well formed. */
export function finalFixtureProblems(): string[] {
  const problems: string[] = [];
  const ids = new Set<string>();
  const D_VOCAB =
    /power press|light curtain|clutch and brake|separation distance|ladle|reline|preheat|foundry|telehandler|overhead line|goalpost|development heading|jumbo|scaling bar|barred down|blast enclosure|blasting helmet|breathing-air compressor/i;
  for (const f of FINAL_FIXTURES) {
    if (ids.has(f.fixtureId)) problems.push(`${f.fixtureId}: duplicate id`);
    ids.add(f.fixtureId);
    if (D_VOCAB.test(f.scenario)) problems.push(`${f.fixtureId}: replays §210D vocabulary`);
    if (/D[1-5]\b/.test(f.scenario)) problems.push(`${f.fixtureId}: names a §210D case`);
    if (f.scenario.length < 180) problems.push(`${f.fixtureId}: scenario too thin`);
    if (/decision-critical|decision-neutral|\bproxy\b|placeholder|filler/i.test(f.scenario)) {
      problems.push(`${f.fixtureId}: the scenario labels its own answer`);
    }
    if (f.evaluationQuestion.length === 0) problems.push(`${f.fixtureId}: no evaluation question`);
    if (f.intent === 'PREVENT_DEFECT' && f.incorrectShape.length === 0) {
      problems.push(`${f.fixtureId}: prevents a defect but names no incorrect shape`);
    }
    if (f.intent === 'PREVENT_OVERCORRECTION' && f.incorrectShape.length !== 0) {
      problems.push(`${f.fixtureId}: a counter-control names an incorrect shape`);
    }
    if (f.expectedDeclarationCount < 1) {
      problems.push(`${f.fixtureId}: every §210E fixture expects at least one declaration`);
    }
  }
  for (const r of ['R4', 'R5', 'R6', 'R7'] as const) {
    if (!FINAL_FIXTURES.some(f => f.targets === r && f.intent === 'PREVENT_DEFECT')
      && !FINAL_FIXTURES.some(f => f.targets === r && f.intent === 'PREVENT_OVERCORRECTION')) {
      problems.push(`no fixture targets ${r}`);
    }
  }
  // Every rule that could over-restrain must carry a counter-control.
  for (const r of ['R4', 'R6', 'R7'] as const) {
    if (!FINAL_FIXTURES.some(f => f.targets === r && f.intent === 'PREVENT_OVERCORRECTION')) {
      problems.push(`${r} has no overcorrection counter-control`);
    }
  }
  return problems;
}
