import { SAFESCOPE_EQUIPMENT_KNOWLEDGE_REGISTRY } from '../src/safescope-v2/equipment-knowledge/equipment-knowledge.registry';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const registry = SAFESCOPE_EQUIPMENT_KNOWLEDGE_REGISTRY;

assert(registry.engine === 'safescope_equipment_knowledge_registry_v1', 'Equipment registry engine changed.');
assert(registry.mode === 'read_only_test_only_context', 'Equipment registry mode changed.');
assert(registry.guardrails.readOnly === true, 'Equipment registry must be read-only.');
assert(registry.guardrails.contextOnly === true, 'Equipment registry must be context-only.');
assert(registry.guardrails.doesNotModifyReasoning === true, 'Equipment registry must not modify reasoning.');
assert(registry.guardrails.doesNotDeclareViolation === true, 'Equipment registry must not declare violations.');
assert(registry.guardrails.doesNotCreateCitation === true, 'Equipment registry must not create citations.');
assert(registry.guardrails.doesNotUseUnapprovedKnowledge === true, 'Equipment registry must not use unapproved knowledge.');

assert(registry.records.length >= 10, 'Equipment registry should include at least ten starter equipment records.');

const requiredEquipment = ['haul_truck', 'front_end_loader', 'forklift', 'excavator', 'dozer', 'skid_steer', 'aerial_lift', 'telehandler', 'conveyor', 'electrical_panel'];
for (const equipmentId of requiredEquipment) {
  assert(
    registry.records.some((record) => record.equipmentId === equipmentId),
    `Missing required equipment record: ${equipmentId}`,
  );
}

const ids = new Set<string>();
for (const record of registry.records) {
  assert(!ids.has(record.equipmentId), `Duplicate equipmentId: ${record.equipmentId}`);
  ids.add(record.equipmentId);

  assert(Boolean(record.label), `${record.equipmentId}: missing label.`);
  assert(Boolean(record.category), `${record.equipmentId}: missing category.`);
  assert(record.aliases.length > 0, `${record.equipmentId}: aliases required.`);
  assert(record.commonJurisdictions.length > 0, `${record.equipmentId}: commonJurisdictions required.`);
  assert(record.commonHazardDomains.length > 0, `${record.equipmentId}: commonHazardDomains required.`);
  assert(record.systems.length > 0, `${record.equipmentId}: systems required.`);
  assert(record.commonScenarioTriggers.length > 0, `${record.equipmentId}: commonScenarioTriggers required.`);
  assert(record.inspectionFocusAreas.length > 0, `${record.equipmentId}: inspectionFocusAreas required.`);
  assert(record.correctiveActionThemes.length > 0, `${record.equipmentId}: correctiveActionThemes required.`);
  assert(record.conflictNotes.length > 0, `${record.equipmentId}: conflictNotes required.`);

  assert(record.guardrails.contextOnly === true, `${record.equipmentId}: must be context-only.`);
  assert(record.guardrails.doesNotDeclareViolation === true, `${record.equipmentId}: must not declare violations.`);
  assert(record.guardrails.doesNotCreateCitation === true, `${record.equipmentId}: must not create citations.`);
  assert(record.guardrails.doesNotOverrideRegulation === true, `${record.equipmentId}: must not override regulation.`);
  assert(record.guardrails.requiresQualifiedReview === true, `${record.equipmentId}: must require qualified review.`);

  for (const system of record.systems) {
    assert(Boolean(system.systemId), `${record.equipmentId}: system missing systemId.`);
    assert(Boolean(system.label), `${record.equipmentId}/${system.systemId}: system missing label.`);
    assert(system.commonFailureModes.length > 0, `${record.equipmentId}/${system.systemId}: commonFailureModes required.`);
    assert(system.relatedHazardDomains.length > 0, `${record.equipmentId}/${system.systemId}: relatedHazardDomains required.`);
    assert(system.evidenceQuestions.length > 0, `${record.equipmentId}/${system.systemId}: evidenceQuestions required.`);
    assert(system.verificationEvidence.length > 0, `${record.equipmentId}/${system.systemId}: verificationEvidence required.`);
  }
}

console.log('✅ SafeScope equipment knowledge registry validation passed.');
console.log(`Equipment records validated: ${registry.records.length}`);
