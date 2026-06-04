import { SAFESCOPE_EQUIPMENT_TASK_MECHANISM_REGISTRY } from '../src/safescope-v2/equipment-knowledge/equipment-task-mechanism.registry';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const registry = SAFESCOPE_EQUIPMENT_TASK_MECHANISM_REGISTRY;

assert(registry.length >= 1, 'Task mechanism registry should include at least one equipment record.');

const conveyor = registry.find((record) => record.equipmentId === 'conveyor');
assert(Boolean(conveyor), 'Task mechanism registry must include conveyor.');
assert(conveyor?.equipmentGroup === 'aggregate_facility_equipment', 'Conveyor must be grouped as aggregate facility equipment.');

for (const record of registry) {
  assert(record.guardrails.contextOnly === true, `${record.equipmentId}: must be context-only.`);
  assert(record.guardrails.doesNotDeclareViolation === true, `${record.equipmentId}: must not declare violations.`);
  assert(record.guardrails.doesNotCreateCitation === true, `${record.equipmentId}: must not create citations.`);
  assert(record.guardrails.doesNotOverrideRegulation === true, `${record.equipmentId}: must not override regulation.`);
  assert(record.guardrails.requiresQualifiedReview === true, `${record.equipmentId}: must require qualified review.`);

  assert(record.components.length > 0, `${record.equipmentId}: components required.`);

  for (const component of record.components) {
    assert(Boolean(component.componentId), `${record.equipmentId}: componentId required.`);
    assert(Boolean(component.label), `${record.equipmentId}/${component.componentId}: label required.`);
    assert(component.aliases.length > 0, `${record.equipmentId}/${component.componentId}: aliases required.`);
    assert(Boolean(component.normalFunction), `${record.equipmentId}/${component.componentId}: normalFunction required.`);
    assert(component.hazardousEnergyOrMotion.length > 0, `${record.equipmentId}/${component.componentId}: hazardousEnergyOrMotion required.`);
    assert(component.commonTasks.length > 0, `${record.equipmentId}/${component.componentId}: commonTasks required.`);
    assert(component.failureModes.length > 0, `${record.equipmentId}/${component.componentId}: failureModes required.`);

    for (const failureMode of component.failureModes) {
      assert(Boolean(failureMode.failureModeId), `${record.equipmentId}/${component.componentId}: failureModeId required.`);
      assert(Boolean(failureMode.label), `${record.equipmentId}/${component.componentId}/${failureMode.failureModeId}: label required.`);
      assert(Boolean(failureMode.description), `${record.equipmentId}/${component.componentId}/${failureMode.failureModeId}: description required.`);
      assert(failureMode.likelyTaskContexts.length > 0, `${failureMode.failureModeId}: likelyTaskContexts required.`);
      assert(failureMode.harmMechanisms.length > 0, `${failureMode.failureModeId}: harmMechanisms required.`);
      assert(failureMode.likelyHazardDomains.length > 0, `${failureMode.failureModeId}: likelyHazardDomains required.`);
      assert(failureMode.evidenceQuestions.length > 0, `${failureMode.failureModeId}: evidenceQuestions required.`);
      assert(failureMode.immediateCautions.length > 0, `${failureMode.failureModeId}: immediateCautions required.`);
      assert(failureMode.correctiveActionThemes.length > 0, `${failureMode.failureModeId}: correctiveActionThemes required.`);
      assert(failureMode.verificationEvidence.length > 0, `${failureMode.failureModeId}: verificationEvidence required.`);
      assert(failureMode.conflictNotes.length > 0, `${failureMode.failureModeId}: conflictNotes required.`);
    }
  }
}

const tailPulley = conveyor?.components.find((component) => component.componentId === 'tail_pulley');
assert(Boolean(tailPulley), 'Conveyor must include tail_pulley component.');

if (!tailPulley) {
  throw new Error('Conveyor must include tail_pulley component.');
}

const missingGuard = tailPulley.failureModes.find((failureMode) => failureMode.failureModeId === 'missing_tail_pulley_guard');
assert(Boolean(missingGuard), 'Tail pulley must include missing_tail_pulley_guard failure mode.');

if (!missingGuard) {
  throw new Error('Tail pulley must include missing_tail_pulley_guard failure mode.');
}

assert(missingGuard.harmMechanisms.includes('caught_in_or_between'), 'Missing tail pulley guard must include caught-in/between mechanism.');
assert(missingGuard.harmMechanisms.includes('entanglement'), 'Missing tail pulley guard must include entanglement mechanism.');
assert(missingGuard.likelyHazardDomains.includes('machine_guarding'), 'Missing tail pulley guard must include machine_guarding domain.');
assert(missingGuard.likelyHazardDomains.includes('lockout_tagout'), 'Missing tail pulley guard must include lockout_tagout domain.');
assert(
  missingGuard.evidenceQuestions.some((question) => question.toLowerCase().includes('conveyor running')),
  'Missing tail pulley guard must ask whether conveyor is running/stopped/locked out.',
);

console.log('✅ SafeScope equipment task mechanism validation passed.');
console.log(`Equipment task mechanism records validated: ${registry.length}`);
