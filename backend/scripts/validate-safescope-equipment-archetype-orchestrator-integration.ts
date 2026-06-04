import { SafeScopeReasoningOrchestratorService } from '../src/safescope-v2/reasoning-orchestrator/reasoning-orchestrator.service';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

const service = new SafeScopeReasoningOrchestratorService();

const unknownRotating = service.reason({
  hazardObservation:
    'Guard removed from rotating coupling during cleanup on unknown plant equipment with employee access.',
  siteType: 'aggregate plant',
  taskContext: 'cleanup',
  industryContext: 'mining aggregate',
  employeeExposureKnown: true,
});

assert(
  unknownRotating.equipmentArchetypeContext.matched === true,
  'Unknown rotating equipment should produce archetype context.',
);
assert(
  unknownRotating.equipmentArchetypeContext.reasoningMode === 'archetype_fallback_context',
  'Unknown rotating equipment should use archetype fallback context.',
);

const rotatingPrimary = unknownRotating.equipmentArchetypeContext.primaryMatch;
assert(Boolean(rotatingPrimary), 'Unknown rotating equipment should include primary archetype match.');

if (!rotatingPrimary) {
  throw new Error('Rotating machinery primary archetype match missing.');
}

assert(
  rotatingPrimary.archetypeId === 'rotating_machinery',
  `Expected rotating_machinery archetype, got ${rotatingPrimary.archetypeId}.`,
);
assert(
  rotatingPrimary.likelyHazardDomains.includes('machine_guarding'),
  'Rotating machinery archetype should include machine_guarding.',
);
assert(
  rotatingPrimary.likelyHazardDomains.includes('lockout_tagout'),
  'Rotating machinery archetype should include lockout_tagout.',
);
assert(
  rotatingPrimary.harmMechanisms.includes('caught_in_or_between'),
  'Rotating machinery archetype should include caught-in/between.',
);
assert(
  rotatingPrimary.harmMechanisms.includes('entanglement'),
  'Rotating machinery archetype should include entanglement.',
);
assert(rotatingPrimary.evidenceQuestions.length > 0, 'Rotating machinery archetype should include evidence questions.');
assert(rotatingPrimary.immediateCautions.length > 0, 'Rotating machinery archetype should include cautions.');
assert(rotatingPrimary.correctiveActionThemes.length > 0, 'Rotating machinery archetype should include corrective themes.');
assert(rotatingPrimary.verificationEvidence.length > 0, 'Rotating machinery archetype should include verification evidence.');
assert(rotatingPrimary.specificRecordHandoffHints.length > 0, 'Rotating machinery archetype should include handoff hints.');

assert(rotatingPrimary.guardrails.contextOnly === true, 'Archetype context must remain context-only.');
assert(rotatingPrimary.guardrails.doesNotDeclareViolation === true, 'Archetype context must not declare violations.');
assert(rotatingPrimary.guardrails.doesNotCreateCitation === true, 'Archetype context must not create citations.');
assert(rotatingPrimary.guardrails.doesNotOverrideRegulation === true, 'Archetype context must not override regulation.');
assert(rotatingPrimary.guardrails.requiresQualifiedReview === true, 'Archetype context must require qualified review.');

assert(
  unknownRotating.conclusionBoundary.advisoryOnly === true,
  'Orchestrator conclusion boundary must remain advisory-only.',
);
assert(
  unknownRotating.conclusionBoundary.doesNotDeclareViolation === true,
  'Orchestrator conclusion boundary must not declare violations.',
);
assert(
  unknownRotating.conclusionBoundary.doesNotCreateCitation === true,
  'Orchestrator conclusion boundary must not create citations.',
);
assert(
  unknownRotating.conclusionBoundary.requiresQualifiedReview === true,
  'Orchestrator conclusion boundary must require qualified review.',
);

const knownConveyor = service.reason({
  hazardObservation:
    'Missing guard on conveyor tail pulley with employee access to the nip point.',
  siteType: 'surface mine aggregate plant',
  taskContext: 'inspection',
  industryContext: 'mining aggregate',
  equipmentInvolved: 'conveyor tail pulley',
  employeeExposureKnown: true,
});

assert(
  knownConveyor.equipmentTaskMechanismContext.matched === true,
  'Known conveyor scenario should retain specific task-mechanism context.',
);
assert(
  knownConveyor.equipmentTaskMechanismContext.primaryMatch?.failureModeId === 'missing_tail_pulley_guard',
  'Known conveyor scenario should identify the specific tail pulley failure mode.',
);
assert(
  knownConveyor.equipmentArchetypeContext.matched === true,
  'Known conveyor scenario should also provide supporting archetype context.',
);

const conveyorArchetype = knownConveyor.equipmentArchetypeContext.primaryMatch;
assert(Boolean(conveyorArchetype), 'Known conveyor scenario should include archetype primary match.');

if (!conveyorArchetype) {
  throw new Error('Known conveyor archetype primary match missing.');
}

assert(
  conveyorArchetype.archetypeId === 'powered_conveyor_system',
  `Known conveyor scenario should prefer powered_conveyor_system archetype, got ${conveyorArchetype.archetypeId}.`,
);

const vague = service.reason({
  hazardObservation: 'There is a concern in the area.',
  siteType: 'general area',
  industryContext: 'general industry',
});

assert(
  vague.equipmentArchetypeContext.matched === false,
  'Vague scenario should not force archetype context.',
);
assert(
  vague.equipmentArchetypeContext.evidenceGaps.length > 0,
  'Vague scenario should include archetype evidence gaps.',
);

console.log('✅ SafeScope equipment archetype orchestrator integration validation passed.');
console.log(
  `Unknown rotating archetype: ${rotatingPrimary.archetypeId} score=${rotatingPrimary.score}`,
);
console.log(
  `Known conveyor archetype: ${conveyorArchetype.archetypeId} score=${conveyorArchetype.score}`,
);
