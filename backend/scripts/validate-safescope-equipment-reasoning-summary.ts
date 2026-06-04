import { SafeScopeReasoningOrchestratorService } from '../src/safescope-v2/reasoning-orchestrator/reasoning-orchestrator.service';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

const service = new SafeScopeReasoningOrchestratorService();

const specificWithSupport = service.reason({
  hazardObservation: 'Missing guard on conveyor tail pulley with employee access to the nip point.',
  siteType: 'surface mine aggregate plant',
  taskContext: 'inspection',
  industryContext: 'mining aggregate',
  equipmentInvolved: 'conveyor tail pulley',
  employeeExposureKnown: true,
});

assert(
  specificWithSupport.equipmentTaskMechanismContext.matched === true,
  'Specific scenario should include task-mechanism context.',
);
assert(
  specificWithSupport.equipmentArchetypeContext.matched === true,
  'Specific scenario should include supporting archetype context.',
);
assert(
  specificWithSupport.equipmentReasoningSummary.primaryReasoningMode === 'specific_with_archetype_support',
  `Expected specific_with_archetype_support, got ${specificWithSupport.equipmentReasoningSummary.primaryReasoningMode}.`,
);
assert(
  specificWithSupport.equipmentReasoningSummary.primaryEquipmentContext.includes('Conveyor'),
  'Specific scenario summary should name Conveyor as primary context.',
);
assert(
  specificWithSupport.equipmentReasoningSummary.primaryMechanismOrArchetype.includes('Tail Pulley'),
  'Specific scenario summary should name the tail pulley mechanism.',
);
assert(
  specificWithSupport.equipmentReasoningSummary.supportingContext.some((item) => item.includes('Supporting archetype')),
  'Specific scenario summary should include supporting archetype context.',
);

const archetypeFallback = service.reason({
  hazardObservation: 'Guard removed from rotating coupling during cleanup on unknown plant equipment.',
  siteType: 'aggregate plant',
  taskContext: 'cleanup',
  industryContext: 'mining aggregate',
  employeeExposureKnown: true,
});

assert(
  archetypeFallback.equipmentTaskMechanismContext.matched === false,
  'Unknown rotating machinery should not force a specific task-mechanism match.',
);
assert(
  archetypeFallback.equipmentArchetypeContext.matched === true,
  'Unknown rotating machinery should include archetype context.',
);
assert(
  archetypeFallback.equipmentReasoningSummary.primaryReasoningMode === 'archetype_fallback',
  `Expected archetype_fallback, got ${archetypeFallback.equipmentReasoningSummary.primaryReasoningMode}.`,
);
assert(
  archetypeFallback.equipmentReasoningSummary.primaryEquipmentContext === 'Rotating Machinery',
  'Archetype fallback should use Rotating Machinery as primary equipment context.',
);
assert(
  archetypeFallback.equipmentReasoningSummary.primaryMechanismOrArchetype === 'rotating_machinery',
  'Archetype fallback should identify rotating_machinery as the mechanism/archetype.',
);

const insufficient = service.reason({
  hazardObservation: 'There is a concern in the area.',
  siteType: 'general area',
  industryContext: 'general industry',
});

assert(
  insufficient.equipmentTaskMechanismContext.matched === false,
  'Vague scenario should not include task-mechanism match.',
);
assert(
  insufficient.equipmentArchetypeContext.matched === false,
  'Vague scenario should not include archetype match.',
);
assert(
  insufficient.equipmentReasoningSummary.primaryReasoningMode === 'insufficient_equipment_context',
  `Expected insufficient_equipment_context, got ${insufficient.equipmentReasoningSummary.primaryReasoningMode}.`,
);
assert(
  insufficient.equipmentReasoningSummary.evidenceGaps.length > 0,
  'Insufficient equipment context should include evidence gaps.',
);
assert(
  insufficient.equipmentReasoningSummary.cautions.length > 0,
  'Insufficient equipment context should include cautions.',
);

for (const result of [specificWithSupport, archetypeFallback, insufficient]) {
  assert(
    result.equipmentReasoningSummary.guardrails.contextOnly === true,
    'Summary must remain context-only.',
  );
  assert(
    result.equipmentReasoningSummary.guardrails.advisoryOnly === true,
    'Summary must remain advisory-only.',
  );
  assert(
    result.equipmentReasoningSummary.guardrails.doesNotDeclareViolation === true,
    'Summary must not declare violations.',
  );
  assert(
    result.equipmentReasoningSummary.guardrails.doesNotCreateCitation === true,
    'Summary must not create citations.',
  );
  assert(
    result.equipmentReasoningSummary.guardrails.doesNotOverrideRegulation === true,
    'Summary must not override regulation.',
  );
  assert(
    result.equipmentReasoningSummary.guardrails.requiresQualifiedReview === true,
    'Summary must require qualified review.',
  );
  assert(result.equipmentReasoningSummary.rankingReasons.length > 0, 'Ranking reasons required.');
}

console.log('✅ SafeScope equipment reasoning summary validation passed.');
console.log(
  `Specific mode: ${specificWithSupport.equipmentReasoningSummary.primaryReasoningMode}`,
);
console.log(
  `Fallback mode: ${archetypeFallback.equipmentReasoningSummary.primaryReasoningMode}`,
);
console.log(
  `Insufficient mode: ${insufficient.equipmentReasoningSummary.primaryReasoningMode}`,
);
