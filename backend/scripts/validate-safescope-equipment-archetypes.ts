import { SAFESCOPE_EQUIPMENT_ARCHETYPE_REGISTRY } from '../src/safescope-v2/equipment-knowledge/equipment-archetype.registry';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

const registry = SAFESCOPE_EQUIPMENT_ARCHETYPE_REGISTRY;

assert(registry.engine === 'safescope_equipment_archetype_registry_v1', 'Registry engine mismatch.');
assert(registry.mode === 'generalized_equipment_reasoning_context_only', 'Registry mode mismatch.');
assert(registry.records.length >= 7, 'Expected at least 7 initial archetype records.');

const requiredArchetypes = [
  'rotating_machinery',
  'powered_conveyor_system',
  'mobile_equipment',
  'electrical_energy_equipment',
  'elevated_work_platform',
  'temporary_access_equipment',
  'excavation_ground_opening',
];

for (const required of requiredArchetypes) {
  assert(
    registry.records.some((record) => record.archetypeId === required),
    `Missing required archetype: ${required}.`,
  );
}

const seen = new Set<string>();

for (const record of registry.records) {
  assert(!seen.has(record.archetypeId), `${record.archetypeId}: duplicate archetypeId.`);
  seen.add(record.archetypeId);

  assert(Boolean(record.label), `${record.archetypeId}: label required.`);
  assert(Boolean(record.description), `${record.archetypeId}: description required.`);
  assert(record.exampleEquipment.length > 0, `${record.archetypeId}: exampleEquipment required.`);
  assert(record.commonComponentClasses.length > 0, `${record.archetypeId}: commonComponentClasses required.`);
  assert(record.commonTasks.length > 0, `${record.archetypeId}: commonTasks required.`);
  assert(record.harmMechanisms.length > 0, `${record.archetypeId}: harmMechanisms required.`);
  assert(record.likelyHazardDomains.length > 0, `${record.archetypeId}: likelyHazardDomains required.`);
  assert(record.detectionSignals.strong.length > 0, `${record.archetypeId}: strong signals required.`);
  assert(record.detectionSignals.medium.length > 0, `${record.archetypeId}: medium signals required.`);
  assert(record.detectionSignals.weak.length > 0, `${record.archetypeId}: weak signals required.`);
  assert(record.evidenceQuestions.length > 0, `${record.archetypeId}: evidenceQuestions required.`);
  assert(record.immediateCautions.length > 0, `${record.archetypeId}: immediateCautions required.`);
  assert(record.correctiveActionThemes.length > 0, `${record.archetypeId}: correctiveActionThemes required.`);
  assert(record.verificationEvidence.length > 0, `${record.archetypeId}: verificationEvidence required.`);
  assert(record.specificRecordHandoffHints.length > 0, `${record.archetypeId}: specificRecordHandoffHints required.`);

  assert(record.guardrails.contextOnly === true, `${record.archetypeId}: must be context-only.`);
  assert(record.guardrails.doesNotDeclareViolation === true, `${record.archetypeId}: must not declare violations.`);
  assert(record.guardrails.doesNotCreateCitation === true, `${record.archetypeId}: must not create citations.`);
  assert(record.guardrails.doesNotOverrideRegulation === true, `${record.archetypeId}: must not override regulation.`);
  assert(record.guardrails.requiresQualifiedReview === true, `${record.archetypeId}: must require qualified review.`);
}

console.log('✅ SafeScope equipment archetype registry validation passed.');
console.log(`Equipment archetypes validated: ${registry.records.length}`);
