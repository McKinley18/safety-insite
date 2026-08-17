import { applyEvidenceFoundation } from '../src/safescope-v2/evidence/evidence-foundation';

function run(text: string, jurisdiction: string, extra: Record<string, unknown> = {}) {
  return applyEvidenceFoundation({ primaryCitation: '', clarificationQuestions: [] }, {
    text,
    structuredObservation: {
      narrative: text,
      jurisdiction,
      evidenceSource: ['visual'],
      controlsPresent: [],
      controlsMissing: [],
      unknownFacts: [],
      unresolvedContradictions: [],
      ...extra,
    },
  } as any);
}
function expect(value: unknown, message: string) {
  if (!value) throw new Error(message);
}

const cases = [
  [run('Technician repairs the drive while power remains on and no lock is fitted.', 'msha',
    { energyState: 'energized' }), '30 CFR 56.12016'],
  [run('Loose drumming rock hangs above the miner travelway.', 'msha'), '30 CFR 56.3200'],
  [run('Energized bare copper touches a wet frame held by a miner.', 'msha', { energyState: 'energized' }),
    '30 CFR 56.12025'],
  [run('Live bus bars are exposed and reachable in the occupied warehouse.', 'osha-general-industry',
    { energyState: 'energized' }), '29 CFR 1910.303'],
  [run('Occupied shift has its only exit chained shut.', 'osha-general-industry'), '29 CFR 1910.36'],
  [run('Employee is in a 7 foot trench without slope, shore, or shield.', 'osha-construction'),
    '29 CFR 1926.652(a)(1)'],
  [run('Crew members are beneath a suspended crane load.', 'osha-construction'), ''],
  [run('Crane boom works 8 feet from an energized line without a spotter or encroachment controls.',
    'osha-construction'), '29 CFR 1926.1408'],
] as const;
for (const [actual, citation] of cases) expect(actual.primaryCitation === citation,
  `Expected ${citation || 'candidate clarification'}, got ${actual.primaryCitation}`);

const corrected = run('Old record said missing guard; current machine is interlocked and passed testing.', 'unknown');
expect(corrected.primaryCitation === '' && corrected.risk.riskBand === 'Controlled', 'Corrected state not suppressed.');
const stable = run('Worker enters a 4 foot stable rock excavation with no cave-in hazard.', 'osha-construction');
expect(stable.primaryCitation === '' && stable.applicabilityDecisions[0].status === 'NOT_APPLICABLE',
  'Stable-rock exception not applied.');
const noise = run('Measured full shift exposure is 79 dBA TWA with no unusual impulse noise.',
  'osha-general-industry');
expect(noise.primaryCitation === '' && noise.applicabilityDecisions[0].status === 'NOT_APPLICABLE',
  'Noise threshold not applied.');
const unknownFallZone = cases[6][0];
expect(unknownFallZone.clarificationQuestions.length === 1 &&
  /permitted fall-zone procedure/i.test(unknownFallZone.clarificationQuestions[0].question),
  'Fall-zone clarification was not specific.');
const pluralFallZone = run(
  'A panel is suspended over laborers guiding it from beneath.',
  'osha-construction',
);
expect(pluralFallZone.applicabilityDecisions[0]?.status === 'UNKNOWN' &&
  pluralFallZone.applicabilityDecisions[0]?.requiredPredicates
    .find((item: any) => item.name === 'worker in fall zone')?.status === 'SUPPORTED',
  'Plural exposed-person language was not retained as a fall-zone candidate.');
expect(corrected.evidenceSnapshot.facts.every((item: any) => item.source && item.status),
  'Fact provenance/status missing.');

const clarifiedEnergy = applyEvidenceFoundation({}, {
  text: 'Mechanic repairs the drive.',
  structuredObservation: { narrative: 'Mechanic repairs the drive.', jurisdiction: 'msha' },
  clarificationAnswers: [
    { questionId: 'predicate-30-cfr-56-12016-hazardous-energy-present-or-capable', answer: 'Yes' },
    { questionId: 'predicate-30-cfr-56-12016-power-not-isolated-and-locked', answer: 'No' },
  ],
} as any);
expect(clarifiedEnergy.primaryCitation === '30 CFR 56.12016',
  'Clarification answers did not resolve energy predicates.');
const correctedFact = applyEvidenceFoundation({}, {
  text: 'Machine condition under review.',
  structuredObservation: { narrative: 'Machine condition under review.', jurisdiction: 'osha-general-industry' },
  evidenceSnapshot: {
    schemaVersion: '1.0',
    facts: [{
      id: 'prior-1', type: 'electricalLiveParts', value: 'exposed_and_reachable',
      source: 'user_confirmation', confidence: 1, status: 'confirmed',
      temporalState: 'current', reviewerStatus: 'user_confirmed',
    }, {
      id: 'prior-2', type: 'energyState', value: 'energized_or_operating',
      source: 'user_confirmation', confidence: 1, status: 'confirmed',
      temporalState: 'current', reviewerStatus: 'user_confirmed',
    }],
  },
} as any);
expect(correctedFact.primaryCitation === '29 CFR 1910.303',
  'User-confirmed evidence snapshot was not used in re-analysis.');
expect(correctedFact.evidenceSnapshot.facts.some((item: any) => item.reviewerStatus === 'user_confirmed'),
  'User correction provenance was not preserved.');
const correctedEnergy = applyEvidenceFoundation({}, {
  text: 'Mechanic repairs the drive while it could move.',
  structuredObservation: { narrative: 'Mechanic repairs the drive while it could move.', jurisdiction: 'msha' },
  evidenceSnapshot: {
    schemaVersion: '1.0',
    facts: [
      { type: 'energyState', value: 'deenergized', source: 'user_confirmation', status: 'confirmed' },
      { type: 'energyIsolationState', value: 'isolated_and_verified', source: 'user_confirmation', status: 'confirmed' },
    ],
  },
} as any);
expect(correctedEnergy.primaryCitation !== '30 CFR 56.12016',
  'Confirmed correction did not override lower-authority text inference.');
expect(run('Loader backup alarm made no sound and unit remained in use.', 'msha').primaryCitation ===
  '30 CFR 56.14132(a)', 'Failed backup alarm predicate was not supported.');
expect(run('Guard is bolted on and blocks reach to the nip while belt runs.', 'msha').primaryCitation === '',
  'Effective guard state was not suppressed.');
expect(run('Operator pulls a baler jam while it remains powered with no lock.', 'osha-general-industry')
  .primaryCitation === '29 CFR 1910.147', 'General-industry hazardous-energy predicate was not supported.');
expect(run('Secondary bottle is labeled with product and hazards and matches the SDS.',
  'osha-general-industry').primaryCitation === '', 'Compliant chemical label was not suppressed.');
expect(run('Open service pit beside the mechanic aisle has no guard.', 'osha-general-industry')
  .primaryCitation === '29 CFR 1910.28', 'Walking-working-surface opening was not supported.');
expect(run('Crew dry-cuts concrete block; visible dust surrounds them and no control is running.',
  'osha-construction').primaryCitation === '29 CFR 1926.1153', 'Silica predicate family was not supported.');
expect(run('Roofer at an open 14-ft edge with no fall protection.', 'osha-construction')
  .primaryCitation === '29 CFR 1926.501', 'Construction fall predicate family was not supported.');
const unknownPowerLine = run('Mobile crane set near overhead conductors.', 'osha-construction');
expect(unknownPowerLine.primaryCitation === '' &&
  unknownPowerLine.applicabilityDecisions.some((item: any) =>
    item.citation === '29 CFR 1926.1408' && item.status === 'UNKNOWN'),
  'Unknown crane power-line predicates were not retained as a candidate.');
expect(run('Live 480 bus is uncovered and an employee can touch it.', 'osha-general-industry')
  .primaryCitation === '29 CFR 1910.303', 'Voltage between live and bus tokens prevented electrical extraction.');
expect(run('Laborer is setting pipe in a 7-ft cut with no box, slope or shoring.', 'osha-construction')
  .primaryCitation === '29 CFR 1926.652(a)(1)', 'Field shorthand for excavation was not extracted.');
expect(run('Mason works from 16-ft scaffold platform with guardrail missing.', 'osha-construction')
  .primaryCitation === '29 CFR 1926.451(g)(1)', 'Scaffold-specific fall predicate was not prioritized.');
expect(run('Current condition: running tail pulley has an open reachable nip point and missing guard.',
  'msha').primaryCitation === '30 CFR 56.14107(a)',
  'The word current incorrectly converted an active missing-guard condition into a corrected state.');
expect(run('Worker entered a 7-ft trench with no slope, shore, shield, or stable rock.',
  'osha-construction').primaryCitation === '29 CFR 1926.652(a)(1)',
  'Negated stable-rock wording incorrectly activated the stable-rock exception.');
expect(run('Running drive has a missing guard at the reachable nip point.', 'msha')
  .primaryCitation === '30 CFR 56.14107(a)',
  'Missing-before-guard word order was not recognized.');
expect(run('A toy forklift model sits in a display case in the visitor lobby.', 'unknown')
  .assessmentDisposition === 'controlled_condition',
  'A nonoperational display replica was treated as occupational equipment.');
expect(run('Four-foot cut is confirmed stable rock and no worker is exposed to a cave-in zone.',
  'osha-construction').primaryCitation === '',
  'Word-number excavation shorthand bypassed the stable-rock safe-state decision.');
const contradictoryLoto = applyEvidenceFoundation({}, {
  text: 'Operator services the powered baler without lockout.',
  structuredObservation: {
    narrative: 'Operator services the powered baler without lockout.',
    jurisdiction: 'osha-general-industry',
    unresolvedContradictions: [{
      field: 'lockout', answerValue: 'controlled',
      reason: 'Independent evidence sources conflict.',
    }],
  },
} as any);
expect(contradictoryLoto.primaryCitation === '' &&
  contradictoryLoto.applicabilityDecisions[0]?.status === 'UNKNOWN' &&
  /conflicting account/i.test(contradictoryLoto.clarificationQuestions[0]?.question),
  'Unresolved contradiction did not downgrade a supported standard to candidate.');

console.log(JSON.stringify({ passed: true, assertions: 35 }));
