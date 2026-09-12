/**
 * §210C -- LOCAL RESIDUAL FIXTURES. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * WHAT THESE FIXTURES ARE, STATED PLAINLY SO THEY ARE NOT MISREAD LATER:
 *
 * They are FROZEN EXPECTATIONS, not results. Each records what a correct first pass would have to
 * produce for the distinction it targets. Nothing here executes a model, and NO FIXTURE IN THIS
 * FILE CAN PASS OR FAIL ON MODEL BEHAVIOUR. The suite that reads them checks only that the
 * instruction carries the rule each fixture targets and that each fixture is itself well formed.
 *
 * Reporting a semantic PASS from this file would be the §204 vacuous-verdict error in a new place.
 * A semantic PASS may only be claimed from a hosted run.
 *
 * ==================== WHY NONE OF THESE IS A PB CASE ====================
 *
 * PB-01 … PB-08 are spent. Replaying one here would let a fixture "pass" by having been written
 * with the answer in hand, and would quietly turn a frozen hosted stimulus into a local unit test.
 * Every scenario below is a new situation in a different setting, and none uses the vocabulary of
 * any PB case -- no cut-off saw, extraction ventilation, chain sling, double block and bleed, fuel
 * bay or crane certificate. Each targets the MECHANISM, not the case.
 */

export interface ResidualFixture {
  fixtureId: string;
  targets: 'R1' | 'R2' | 'R3' | 'PROTECTED';
  /** What the fixture is for: a defect to prevent, or a passing behaviour to protect. */
  intent: 'PREVENT_DEFECT' | 'PROTECT_GAIN';
  scenario: string;
  /** The malformed shape the model must not emit. Empty where the fixture protects a gain. */
  inconsistentShape: string;
  /** What a correct first pass must produce instead. */
  requiredOutcome: string;
  expectedDeclarationCount: number;
  /** The gate that decides this fixture, named so the suite can assert the rule is present. */
  decidedByGate: 'GATE 1' | 'GATE 2' | 'GATE 3' | 'EXISTING';
  evaluationQuestion: string;
}

export const RESIDUAL_FIXTURES: readonly ResidualFixture[] = [
  // ================================ 1. property vs downstream semantics (R1)
  {
    fixtureId: 'FX-R1-A-CONJUNCT-DROPPED-FROM-PROPERTY',
    targets: 'R1', intent: 'PREVENT_DEFECT',
    scenario: 'A temporary edge platform is planked out over a stairwell void. The planks are '
      + 'marked with a span rating. Two operatives are carrying a cast iron soil stack across it '
      + 'together. Neither the span between bearers nor the combined weight being carried was '
      + 'measured during the visit.',
    inconsistentShape: 'missingFact names only the span between bearers, while branchA and the '
      + 'question both turn on whether the planks carry that span AT the load being crossed with',
    requiredOutcome: 'missingFact must carry both parts at once: whether the planking is rated for '
      + 'the span in use AND for the combined load being carried across it',
    expectedDeclarationCount: 1,
    decidedByGate: 'GATE 1',
    evaluationQuestion: 'Does the authoritative property carry every conjunct its own branches and '
      + 'question rely on, or only one of them?',
  },
  {
    fixtureId: 'FX-R1-B-SEQUENCE-DROPPED-FROM-PROPERTY',
    targets: 'R1', intent: 'PREVENT_DEFECT',
    scenario: 'A confined chamber is about to be entered. A gas reading was taken at the access '
      + 'hatch and recorded as clear. The chamber was then left open overnight and a drain line '
      + 'into it was reconnected this morning. The entrant is at the hatch with a harness on.',
    inconsistentShape: 'missingFact names only that the atmosphere was tested, while the branches '
      + 'and the question both turn on a reading taken AFTER the reconnection and immediately '
      + 'before this entry',
    requiredOutcome: 'missingFact must keep the timing its own branches depend on: whether the '
      + 'atmosphere is proved safe now, after the line was reconnected and immediately before entry',
    expectedDeclarationCount: 1,
    decidedByGate: 'GATE 1',
    evaluationQuestion: 'Does the property keep the sequence qualifier that its branches and '
      + 'question already rely on?',
  },
  // ================================ 2. property vs check proxy (R1)
  {
    fixtureId: 'FX-R1-C-CHECK-PROXY-IN-PROPERTY',
    targets: 'R1', intent: 'PREVENT_DEFECT',
    scenario: 'A powered roller door across a loading bay has a safety edge along its bottom rail. '
      + 'The bay was handed back from a refit last week. Vehicles are passing under the door '
      + 'through the shift and no one present could say what was done to the edge at handback.',
    inconsistentShape: 'missingFact asks whether the safety edge has been tested since the refit, '
      + 'while branchA and branchB actually settle whether the edge stops and reverses the door on '
      + 'contact',
    requiredOutcome: 'missingFact must describe the present functional state its branches settle: '
      + 'whether the safety edge actually stops and reverses the door when it meets an obstruction',
    expectedDeclarationCount: 1,
    decidedByGate: 'GATE 1',
    evaluationQuestion: 'Does the property describe the present functional state, or the history of '
      + 'a check on it?',
  },
  // ================================ 3. orphan decision-critical clarification (R2)
  {
    fixtureId: 'FX-R2-A-ORPHANED-DECISION-CRITICAL-QUESTION',
    targets: 'R2', intent: 'PREVENT_DEFECT',
    scenario: 'A tower scaffold has been moved to a new position against a facade. Its outriggers '
      + 'are visible on two sides only; the other two faces are hard against planting and could '
      + 'not be seen. Two operatives are working from the top lift.',
    inconsistentShape: 'a question is asked about whether the remaining outriggers are deployed and '
      + 'footed, which would change whether the lift is used today, but no entry in '
      + '`unresolvedFactDeclarations` states that fact',
    requiredOutcome: 'the model must either emit the corresponding declaration, or conclude the '
      + 'question does not change today\'s action and handle it as the contract already allows. It '
      + 'may not leave a question that governs today\'s action pointing at nothing.',
    expectedDeclarationCount: 1,
    decidedByGate: 'GATE 2',
    evaluationQuestion: 'Is every question that changes today\'s action accounted for by a '
      + 'declaration, or demoted on the record?',
  },
  // ================================ 4. decision-neutral declaration (R3)
  {
    fixtureId: 'FX-R3-A-SAME-ACTION-EITHER-WAY',
    targets: 'R3', intent: 'PREVENT_DEFECT',
    scenario: 'A skip in a fenced compound holds mixed demolition waste. The waste transfer '
      + 'paperwork for the last collection is not on site and no one present knows whether the '
      + 'carrier is registered. The compound is locked, no one is working in it, and the skip is '
      + 'not due for collection during the visit.',
    inconsistentShape: 'a declaration is emitted about the carrier registration although the same '
      + 'thing is done today under either answer: the compound stays locked and the skip stays '
      + 'where it is',
    requiredOutcome: 'no owed declaration. The fact is unknown, genuinely regulated and worth '
      + 'recording, and it still changes nothing about what is done today.',
    expectedDeclarationCount: 0,
    decidedByGate: 'GATE 3',
    evaluationQuestion: 'Do the two branches require materially different action NOW, or only '
      + 'different paperwork?',
  },
  // ================================ 5. future-only divergence (R3)
  {
    fixtureId: 'FX-R3-B-FUTURE-ONLY-DIVERGENCE',
    targets: 'R3', intent: 'PREVENT_DEFECT',
    scenario: 'A passenger hoist on a facade is shut down for a rope replacement. Its controls are '
      + 'isolated and tagged, the car is landed and the ground enclosure is padlocked. The record '
      + 'of its last statutory examination is held off site and its date is not known. No one is '
      + 'to ride the hoist until the rope work is finished.',
    inconsistentShape: 'a declaration is emitted whose branches diverge only about what must happen '
      + 'before the hoist carries passengers again, not about anything done today',
    requiredOutcome: 'no owed declaration for today\'s decision. A difference that appears only at '
      + 'return to service is not a difference today -- unless the decision actually under analysis '
      + 'IS that return to service, in which case it is owed and must be declared.',
    expectedDeclarationCount: 0,
    decidedByGate: 'GATE 3',
    evaluationQuestion: 'Does the divergence land on today\'s action, or only on a later decision '
      + 'that is not the one being analysed?',
  },
  // ================================ 6. protected multi-gap control (G)
  {
    fixtureId: 'FX-PROTECTED-TWO-INDEPENDENT-CURRENT-GAPS',
    targets: 'PROTECTED', intent: 'PROTECT_GAIN',
    scenario: 'In a bottling hall, a floor gully cover is missing beside a walkway that operators '
      + 'use through the shift. Separately, the interlock on the capping machine guard has been '
      + 'found taped over, and the machine is running. Both were in that state throughout the '
      + 'visit.',
    inconsistentShape: 'the two are merged into one conjunctive declaration, or one is dropped '
      + 'because the other was declared',
    requiredOutcome: 'two separate declarations. They need different evidence, have independent '
      + 'branches, are independently settleable, and change different actions today. §210C\'s '
      + 'gates are applied per entry and must not merge or suppress either one.',
    expectedDeclarationCount: 2,
    decidedByGate: 'EXISTING',
    evaluationQuestion: 'Do two genuinely independent current-action gaps still emit as two '
      + 'declarations after the gates are applied?',
  },
  // ================================ 7. protected fact-local decision control (H)
  {
    fixtureId: 'FX-PROTECTED-FACT-LOCAL-SETTLEMENT',
    targets: 'PROTECTED', intent: 'PROTECT_GAIN',
    scenario: 'A mobile crane is set up on a slab. Whether the outrigger mats are on ground proved '
      + 'to carry the corner loads is unknown, and separately whether the load radius chart in use '
      + 'matches the boom configuration rigged is unknown. Both bear on the lift about to be made.',
    inconsistentShape: 'settling the ground bearing produces a decision that declares the lift safe '
      + 'to proceed, or the setup adequate, while the radius chart question is still open',
    requiredOutcome: 'settling one fact resolves one fact. Its decision may say what follows for '
      + 'ground bearing and no more; the other declaration survives untouched and is still owed.',
    expectedDeclarationCount: 2,
    decidedByGate: 'EXISTING',
    evaluationQuestion: 'Does a positive settlement of one fact stay local to that fact while the '
      + 'other remains open?',
  },
];

/** Problems that make a fixture unable to discriminate. Empty means the set is well formed. */
export function residualFixtureProblems(): string[] {
  const problems: string[] = [];
  const ids = new Set<string>();
  const banned =
    /kerb|cut-off saw|bowser|local exhaust|LEV|capture arm|chain sling|sling leg|block valve|bleed|bund|dispenser|fuel bay|thorough examination certificate|scissor lift|pallet racking/i;
  for (const f of RESIDUAL_FIXTURES) {
    if (ids.has(f.fixtureId)) problems.push(`${f.fixtureId}: duplicate id`);
    ids.add(f.fixtureId);
    if (banned.test(f.scenario)) problems.push(`${f.fixtureId}: replays PB-case vocabulary`);
    if (f.scenario.length < 180) problems.push(`${f.fixtureId}: scenario too thin to discriminate`);
    if (/decision-critical|decision-neutral|conjunct|proxy|owed fact/i.test(f.scenario)) {
      problems.push(`${f.fixtureId}: the scenario labels its own answer`);
    }
    if (f.evaluationQuestion.length === 0) problems.push(`${f.fixtureId}: no evaluation question`);
    if (f.intent === 'PREVENT_DEFECT' && f.inconsistentShape.length === 0) {
      problems.push(`${f.fixtureId}: prevents a defect but does not name the shape`);
    }
    if (f.intent === 'PROTECT_GAIN' && f.expectedDeclarationCount === 0) {
      problems.push(`${f.fixtureId}: protects a gain but expects no declaration`);
    }
    if (f.expectedDeclarationCount === 0 && f.targets !== 'R3') {
      problems.push(`${f.fixtureId}: only an R3 fixture may expect zero declarations`);
    }
  }
  for (const r of ['R1', 'R2', 'R3', 'PROTECTED'] as const) {
    if (!RESIDUAL_FIXTURES.some(f => f.targets === r)) problems.push(`no fixture targets ${r}`);
  }
  return problems;
}
