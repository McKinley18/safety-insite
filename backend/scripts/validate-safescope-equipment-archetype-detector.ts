import { SafeScopeEquipmentArchetypeDetectorService } from '../src/safescope-v2/equipment-knowledge/equipment-archetype-detector.service';
import { SafeScopeEquipmentArchetypeId } from '../src/safescope-v2/equipment-knowledge/equipment-archetype.types';
import {
  SafeScopeHarmMechanism,
  SafeScopeTaskContext,
} from '../src/safescope-v2/equipment-knowledge/equipment-task-mechanism.types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

type ArchetypeScenario = {
  name: string;
  description: string;
  taskContext?: SafeScopeTaskContext;
  expectedArchetypeId: SafeScopeEquipmentArchetypeId;
  expectedDomains: string[];
  expectedMechanisms: SafeScopeHarmMechanism[];
};

const detector = new SafeScopeEquipmentArchetypeDetectorService();

const scenarios: ArchetypeScenario[] = [
  {
    name: 'unknown rotating coupling guard removed',
    description: 'Guard removed from rotating coupling during cleanup on unknown plant equipment.',
    taskContext: 'cleanup',
    expectedArchetypeId: 'rotating_machinery',
    expectedDomains: ['machine_guarding', 'lockout_tagout'],
    expectedMechanisms: ['caught_in_or_between', 'entanglement'],
  },
  {
    name: 'generic conveyor cleanup exposure',
    description: 'Employee cleaning material buildup around moving conveyor belt and pulley.',
    taskContext: 'cleanup',
    expectedArchetypeId: 'powered_conveyor_system',
    expectedDomains: ['machine_guarding', 'lockout_tagout'],
    expectedMechanisms: ['caught_in_or_between', 'unexpected_startup'],
  },
  {
    name: 'mobile equipment backing blind spot',
    description: 'Mobile equipment backing near pedestrians in blind spot with no separation controls.',
    taskContext: 'normal_operation',
    expectedArchetypeId: 'mobile_equipment',
    expectedDomains: ['mobile_equipment', 'traffic_control'],
    expectedMechanisms: ['struck_by', 'traffic_interaction'],
  },
  {
    name: 'generic exposed live parts',
    description: 'Open electrical cabinet with exposed live parts during energized troubleshooting.',
    taskContext: 'troubleshooting',
    expectedArchetypeId: 'electrical_energy_equipment',
    expectedDomains: ['electrical', 'lockout_tagout'],
    expectedMechanisms: ['electrical_contact', 'arc_flash'],
  },
  {
    name: 'generic ladder access setup',
    description: 'Portable ladder not secured and employee overreaching while accessing elevated work.',
    taskContext: 'travel_access',
    expectedArchetypeId: 'temporary_access_equipment',
    expectedDomains: ['fall_protection', 'walking_working_surfaces'],
    expectedMechanisms: ['fall_from_elevation', 'fall_on_same_level'],
  },
  {
    name: 'generic trench protective system',
    description: 'Worker in trench with protective system unclear and spoil pile near trench edge.',
    taskContext: 'inspection',
    expectedArchetypeId: 'excavation_ground_opening',
    expectedDomains: ['excavation_trenching', 'ground_control'],
    expectedMechanisms: ['unsupported_ground_or_collapse', 'crushed_by'],
  },
];

for (const scenario of scenarios) {
  const result = detector.detect({
    description: scenario.description,
    taskContext: scenario.taskContext,
  });

  assert(result.matched, `${scenario.name}: detector should return a match.`);
  assert(result.reasoningMode === 'archetype_fallback_context', `${scenario.name}: expected archetype fallback context mode.`);
  assert(Boolean(result.primaryMatch), `${scenario.name}: primary archetype match required.`);

  const primary = result.primaryMatch;

  if (!primary) {
    throw new Error(`${scenario.name}: primary match missing.`);
  }

  assert(
    primary.archetypeId === scenario.expectedArchetypeId,
    `${scenario.name}: expected ${scenario.expectedArchetypeId}, got ${primary.archetypeId}.`,
  );
  assert(primary.score >= 10, `${scenario.name}: expected score at least 10, got ${primary.score}.`);
  assert(['high', 'medium', 'low'].includes(primary.confidence), `${scenario.name}: confidence required.`);

  for (const domain of scenario.expectedDomains) {
    assert(primary.likelyHazardDomains.includes(domain as any), `${scenario.name}: expected domain ${domain}.`);
  }

  for (const mechanism of scenario.expectedMechanisms) {
    assert(primary.harmMechanisms.includes(mechanism), `${scenario.name}: expected mechanism ${mechanism}.`);
  }

  assert(primary.evidenceQuestions.length > 0, `${scenario.name}: evidence questions required.`);
  assert(primary.immediateCautions.length > 0, `${scenario.name}: cautions required.`);
  assert(primary.correctiveActionThemes.length > 0, `${scenario.name}: corrective themes required.`);
  assert(primary.verificationEvidence.length > 0, `${scenario.name}: verification evidence required.`);
  assert(primary.specificRecordHandoffHints.length > 0, `${scenario.name}: handoff hints required.`);

  assert(primary.guardrails.contextOnly === true, `${scenario.name}: must be context-only.`);
  assert(primary.guardrails.doesNotDeclareViolation === true, `${scenario.name}: must not declare violations.`);
  assert(primary.guardrails.doesNotCreateCitation === true, `${scenario.name}: must not create citations.`);
  assert(primary.guardrails.doesNotOverrideRegulation === true, `${scenario.name}: must not override regulation.`);
  assert(primary.guardrails.requiresQualifiedReview === true, `${scenario.name}: must require qualified review.`);

  console.log(`✅ ${scenario.name}`);
  console.log(`   ${primary.archetypeId} score=${primary.score} confidence=${primary.confidence}`);
}

const vague = detector.detect({
  description: 'There is a concern in the area.',
});

assert(vague.matched === false, 'Vague area concern should not force an archetype match.');
assert(vague.reasoningMode === 'no_archetype_context', 'Vague area concern should return no_archetype_context.');
assert(vague.evidenceGaps.length > 0, 'Vague archetype result should include evidence gaps.');
assert(vague.cautions.length > 0, 'Vague archetype result should include cautions.');

console.log('✅ vague archetype guardrail');
console.log('✅ SafeScope equipment archetype detector validation passed.');
