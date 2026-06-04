import { SAFESCOPE_HAZARD_UNIVERSE_REGISTRY } from '../src/safescope-v2/brain/hazard-universe/hazard-universe.registry';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

assert(SAFESCOPE_HAZARD_UNIVERSE_REGISTRY.length >= 20, 'Hazard universe should include at least 20 records.');

const ids = SAFESCOPE_HAZARD_UNIVERSE_REGISTRY.map((record) => record.hazardUniverseId);
assert(new Set(ids).size === ids.length, 'Hazard universe IDs must be unique.');

for (const record of SAFESCOPE_HAZARD_UNIVERSE_REGISTRY) {
  assert(record.hazardUniverseId.trim().length > 0, 'Hazard universe record ID is required.');
  assert(record.label.trim().length > 0, `${record.hazardUniverseId} label is required.`);
  assert(record.domain.trim().length > 0, `${record.hazardUniverseId} domain is required.`);
  assert(record.expectedMechanisms.length > 0, `${record.hazardUniverseId} must define expected mechanisms.`);
  assert(record.expectedControlThemes.length > 0, `${record.hazardUniverseId} must define expected control themes.`);
  assert(record.expectedEvidenceThemes.length > 0, `${record.hazardUniverseId} must define expected evidence themes.`);
  assert(record.typicalScenarioExamples.length > 0, `${record.hazardUniverseId} must define scenario examples.`);
}

const coreRecords = SAFESCOPE_HAZARD_UNIVERSE_REGISTRY.filter((record) => record.priority === 'core');
assert(coreRecords.length >= 12, 'Hazard universe should preserve a strong core hazard foundation.');

console.log('✅ SafeScope Hazard Universe validation passed.');
console.log(`Hazard universe records: ${SAFESCOPE_HAZARD_UNIVERSE_REGISTRY.length}`);
console.log(`Core records: ${coreRecords.length}`);
