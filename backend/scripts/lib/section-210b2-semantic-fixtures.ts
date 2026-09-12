/**
 * §210B-2 -- LOCAL SEMANTIC FIXTURES. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * WHAT THESE FIXTURES ARE, STATED PLAINLY SO THEY ARE NOT MISREAD LATER:
 *
 * They are FROZEN EXPECTATIONS, not results. Each one records what a correct first pass would have
 * to produce for the distinction it targets, and the required property is written out beside the
 * proxy it must not be replaced by. Nothing here executes a model, and NO FIXTURE IN THIS FILE CAN
 * PASS OR FAIL ON MODEL BEHAVIOUR. The suite that reads them checks only that the instruction
 * carries the rule each fixture targets and that each fixture is itself well formed.
 *
 * Reporting a semantic PASS from this file would be the §204 vacuous-verdict error in a new place.
 */

export interface SemanticFixture {
  fixtureId: string;
  targets: 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6';
  rootCauseFamily: 'RC-A' | 'RC-C' | 'RC-D' | 'RC-E';
  scenario: string;
  /** The property a correct declaration must name. */
  requiredProperty: string;
  /** The property that must NOT replace it. Empty where the fixture expects no declaration. */
  prohibitedProxyProperty: string;
  requiredConjuncts: readonly string[];
  expectedDeclarationCount: number;
  evaluationQuestion: string;
}

export const SEMANTIC_FIXTURES: readonly SemanticFixture[] = [
  // ---- 1. present state vs proxy
  {
    fixtureId: 'FX-S1-A-AVAILABILITY',
    targets: 'S1', rootCauseFamily: 'RC-A',
    scenario: 'Respirators are stocked in a labelled cabinet beside the cutting bay. The inspector '
      + 'watched two operatives cutting kerbstones and could not see either operative\'s face from '
      + 'the doorway.',
    requiredProperty: 'whether the operatives are actually wearing respiratory protection while '
      + 'cutting',
    prohibitedProxyProperty: 'whether respiratory protection is available in the cabinet',
    requiredConjuncts: ['actual wearing', 'during the cutting now in progress'],
    expectedDeclarationCount: 1,
    evaluationQuestion: 'Does the declared property describe what the operatives are doing, or what '
      + 'the cabinet contains?',
  },
  {
    fixtureId: 'FX-S1-B-METHOD-EXISTS',
    targets: 'S1', rootCauseFamily: 'RC-A',
    scenario: 'The press has a documented accumulator bleed valve on its hydraulic schematic. A '
      + 'technician is working inside the die area. The observation does not state what was done to '
      + 'the accumulator before entry.',
    requiredProperty: 'whether the stored accumulator energy was actually released or restrained '
      + 'before the technician entered',
    prohibitedProxyProperty: 'whether a bleed valve exists on this press',
    requiredConjuncts: ['the action actually taken', 'before entry'],
    expectedDeclarationCount: 1,
    evaluationQuestion: 'Does the declared property describe the machine\'s energy state, or the '
      + 'machine\'s equipment list?',
  },
  {
    fixtureId: 'FX-S1-C-CHECK-HISTORY',
    targets: 'S1', rootCauseFamily: 'RC-A',
    scenario: 'A maintenance card shows the tool rest was checked at the start of shift. A new '
      + 'wheel was fitted after that check. The gap between rest and wheel was not measured during '
      + 'the visit.',
    requiredProperty: 'whether the gap between the tool rest and the wheel is actually within '
      + 'tolerance now, after the wheel change',
    prohibitedProxyProperty: 'whether a check was performed at the start of shift',
    requiredConjuncts: ['the actual present gap', 'after the wheel change'],
    expectedDeclarationCount: 1,
    evaluationQuestion: 'Does the declared property describe the clearance, or the paperwork?',
  },
  // ---- 2. decision-neutral unknown
  {
    fixtureId: 'FX-S5-DECISION-NEUTRAL',
    targets: 'S5', rootCauseFamily: 'RC-E',
    scenario: 'A hand lamp in a dry store has no visible PAT label. The lamp is unplugged and on a '
      + 'shelf, no work is in progress in the store, and nothing suggests an electrical defect.',
    requiredProperty: '',
    prohibitedProxyProperty: 'whether the hand lamp\'s portable appliance test is in date',
    requiredConjuncts: [],
    expectedDeclarationCount: 0,
    evaluationQuestion: 'Both answers leave the same thing done today. Was any declaration emitted?',
  },
  // ---- 3. structured emission reconciliation, with its paired control
  {
    fixtureId: 'FX-S2-MUST-EMIT',
    targets: 'S2', rootCauseFamily: 'RC-D',
    scenario: 'A pool of clear liquid lies under an energised charging rack while two operatives '
      + 'work at the rack. The observation does not identify the liquid and no source is visible.',
    requiredProperty: 'what the pooled liquid actually is, given that work continues at the '
      + 'energised rack above it',
    prohibitedProxyProperty: '',
    requiredConjuncts: ['identity of the liquid'],
    expectedDeclarationCount: 1,
    evaluationQuestion: 'The model raises this as unresolved and decision-critical. Does a '
      + 'declaration exist, or does it survive only as a question?',
  },
  {
    fixtureId: 'FX-S2-CONTROL-MUST-NOT-EMIT',
    targets: 'S2', rootCauseFamily: 'RC-E',
    scenario: 'The make and model of a compliant, correctly guarded bench grinder are not recorded '
      + 'anywhere in the observation. Everything bearing on today\'s decision about the machine is '
      + 'stated.',
    requiredProperty: '',
    prohibitedProxyProperty: 'the make and model of the grinder',
    requiredConjuncts: [],
    expectedDeclarationCount: 0,
    evaluationQuestion: 'Genuinely unknown, genuinely irrelevant to today. Was restraint kept?',
  },
  // ---- 4. conjunction
  {
    fixtureId: 'FX-S3-CONJUNCT-LOAD',
    targets: 'S3', rootCauseFamily: 'RC-C',
    scenario: 'A roofer crosses a fragile roof on crawling boards spanning 2.1 metres, carrying a '
      + 'bag of fixings and a cordless saw. The boards\' rated span is not marked.',
    requiredProperty: 'whether the crawling boards are rated to span 2.1 metres carrying the roofer '
      + 'together with the materials and tools being carried',
    prohibitedProxyProperty: 'whether the boards are rated to span 2.1 metres with a person on them',
    requiredConjuncts: ['the person', 'the materials and tools carried'],
    expectedDeclarationCount: 1,
    evaluationQuestion: 'Could branchA be true with the materials load still unknown?',
  },
  // ---- 5. temporal / sequence
  {
    fixtureId: 'FX-S3-TEMPORAL-SEQUENCE',
    targets: 'S3', rootCauseFamily: 'RC-C',
    scenario: 'An electrician says he tested for absence of voltage at the panel. No proving unit '
      + 'is visible at the point of work and he does not describe how the indicator was confirmed '
      + 'to be working.',
    requiredProperty: 'whether the voltage indicator was proved on a known source both before and '
      + 'after the absence-of-voltage test',
    prohibitedProxyProperty: 'whether a test for absence of voltage was carried out',
    requiredConjuncts: ['proved before the test', 'proved after the test'],
    expectedDeclarationCount: 1,
    evaluationQuestion: 'Do both sequence elements survive into the property, both branches and the '
      + 'question?',
  },
  // ---- 6. fact-local decision containment
  {
    fixtureId: 'FX-S4-DECISION-CONTAINMENT',
    targets: 'S4', rootCauseFamily: 'RC-E',
    scenario: 'A scaffold lift has an unknown tie pattern AND an unknown loading class, and both '
      + 'change what is done today. Two independent declarations are expected.',
    requiredProperty: 'each declaration\'s decisionIfA is confined to the fact it settles',
    prohibitedProxyProperty: 'a decisionIfA asserting the scaffold is safe to use or that work may '
      + 'continue generally',
    requiredConjuncts: ['fact-local consequence only'],
    expectedDeclarationCount: 2,
    evaluationQuestion: 'Does settling the tie pattern alone produce a claim about the scaffold as '
      + 'a whole while the loading class is still open?',
  },
  // ---- 7. governed requirement vs case fact
  {
    fixtureId: 'FX-S6-GOVERNED-NORMATIVE',
    targets: 'S6', rootCauseFamily: 'RC-A',
    scenario: 'A governed record states that stored energy must be dissipated or restrained before '
      + 'entry. The observation does not state what was done to the accumulator before the '
      + 'technician entered.',
    requiredProperty: 'whether the stored energy was actually dissipated or restrained before entry',
    prohibitedProxyProperty: 'that a means of dissipating stored energy exists on this machine, '
      + 'inferred from the record requiring one',
    requiredConjuncts: ['what actually occurred on this machine'],
    expectedDeclarationCount: 1,
    evaluationQuestion: 'Is the governed record used to explain why the fact matters, or as '
      + 'evidence that the action occurred?',
  },
];

/** Every fixture must be well formed before it can be used to judge anything. */
export function fixtureWellFormednessProblems(f: SemanticFixture): string[] {
  const p: string[] = [];
  if (f.expectedDeclarationCount === 0) {
    if (f.requiredProperty !== '') p.push('a no-declaration fixture must not name a required property');
    if (f.prohibitedProxyProperty === '') p.push('a no-declaration fixture must name what must not be declared');
  } else {
    if (f.requiredProperty === '') p.push('a declaration fixture must name the required property');
    if (f.requiredConjuncts.length === 0) p.push('a declaration fixture must name its conjuncts');
  }
  if (f.requiredProperty !== '' && f.requiredProperty === f.prohibitedProxyProperty) {
    p.push('required and prohibited properties are identical');
  }
  if (f.scenario.length < 80) p.push('scenario is too thin to judge');
  if (!f.evaluationQuestion.trim().endsWith('?')) p.push('evaluation question is not a question');
  return p;
}
