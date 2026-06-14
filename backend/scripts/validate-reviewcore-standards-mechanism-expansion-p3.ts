import { SafeScopeStandardsIntentIntelligenceService } from '../src/safescope-v2/standards-intent-intelligence/standards-intent-intelligence.service';
import * as fs from 'fs';
import * as path from 'path';

let errors = 0;

function assert(condition: unknown, message: string) {
  if (!condition) {
    errors++;
    console.error(`ERROR: ${message}`);
  }
}

const service = new SafeScopeStandardsIntentIntelligenceService();

const cases = [
  {
    name: 'cranes rigging hoisting',
    classification: 'cranes_rigging_hoisting',
    observationText: 'Worker standing under suspended load while crane lift is active and rigging capacity is unclear.',
    standard: { citation: 'candidate-cranes-rigging-hoisting', title: 'Cranes, rigging, hoisting, suspended load review candidate' },
    expectedMechanism: 'struck_by',
    expectedEvidence: 'load',
  },
  {
    name: 'bloodborne pathogens',
    classification: 'bloodborne_pathogens',
    observationText: 'Used needle found on floor with possible blood contamination and no sharps container visible.',
    standard: { citation: 'candidate-bloodborne-pathogens', title: 'Bloodborne pathogens and sharps exposure review candidate' },
    expectedMechanism: 'biological_exposure',
    expectedEvidence: 'sharps',
  },
  {
    name: 'ergonomics',
    classification: 'ergonomics',
    observationText: 'Employee manually lifts heavy boxes repeatedly from floor level with awkward reach and no mechanical assist.',
    standard: { citation: 'candidate-ergonomics', title: 'Ergonomics manual material handling review candidate' },
    expectedMechanism: 'ergonomic_force',
    expectedEvidence: 'frequency',
  },
  {
    name: 'trenching excavation',
    classification: 'trenching_and_excavation',
    observationText: 'Worker in trench with unclear depth, no visible protective system, spoil near edge, and no ladder visible.',
    standard: { citation: 'candidate-trenching-excavation', title: 'Trenching excavation protective system review candidate' },
    expectedMechanism: 'engulfment',
    expectedEvidence: 'depth',
  },
];

for (const item of cases) {
  const result = service.evaluate({
    classification: item.classification,
    observationText: item.observationText,
    suggestedStandards: [item.standard],
    evidenceSufficiency: { sufficientForStandardsRecommendation: false },
    safetyHealthDomainMatrix: {
      primaryDomain: item.classification,
      hazardousEnergies: ['gravity'],
      injuryMechanisms: [item.expectedMechanism],
      evidenceRequired: ['jurisdiction', item.expectedEvidence],
    },
  });

  const profile = result.standardIntentProfiles[0];
  const blob = JSON.stringify(result).toLowerCase();

  assert(result.engine === 'safescope_standards_intent_intelligence', `${item.name}: wrong engine`);
  assert(result.requiresQualifiedReview === true, `${item.name}: must require qualified review`);
  assert(result.canInventStandards === false, `${item.name}: must not invent standards`);
  assert(result.canDeclareViolation === false, `${item.name}: must not declare violation`);
  assert(result.canFinalizeApplicabilityWithoutEvidence === false, `${item.name}: must not finalize applicability without evidence`);
  assert(profile.confidence === 'medium' || profile.confidence === 'high', `${item.name}: expected medium/high profile confidence`);
  assert(blob.includes(item.expectedMechanism.toLowerCase()), `${item.name}: missing expected mechanism ${item.expectedMechanism}`);
  assert(blob.includes(item.expectedEvidence.toLowerCase()), `${item.name}: missing expected evidence ${item.expectedEvidence}`);
  assert(!blob.includes('citation issued'), `${item.name}: prohibited citation-issued language`);
  assert(!blob.includes('violation issued'), `${item.name}: prohibited violation-issued language`);
  assert(!blob.includes('guaranteed compliance'), `${item.name}: prohibited guarantee language`);
  assert(!blob.includes('no human review required'), `${item.name}: prohibited no-review language`);
}

const standardsIntentPath = path.join(__dirname, '../src/safescope-v2/standards-intent-intelligence/standards-intent-intelligence.service.ts');
const mechanismPath = path.join(__dirname, '../src/safescope-v2/mechanism-intelligence/mechanism-intelligence.service.ts');
const standardsText = fs.readFileSync(standardsIntentPath, 'utf8').toLowerCase();
const mechanismText = fs.readFileSync(mechanismPath, 'utf8').toLowerCase();

for (const domain of ['cranes_rigging_hoisting', 'bloodborne_pathogens', 'ergonomics', 'trenching_and_excavation']) {
  assert(standardsText.includes(domain), `standards intent missing audit-visible domain ${domain}`);
}

for (const domain of ['bloodborne_pathogens', 'industrial_hygiene']) {
  assert(mechanismText.includes(domain), `mechanism intelligence missing audit-visible domain ${domain}`);
}

if (errors > 0) {
  console.error(`ReviewCore P3 standards/mechanism expansion validation failed with ${errors} error(s).`);
  process.exit(1);
}

console.log('✅ ReviewCore P3 standards/mechanism expansion validation passed.');
