import { SafeScopeReasoningOrchestratorService } from '../src/safescope-v2/reasoning-orchestrator/reasoning-orchestrator.service';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

const service = new SafeScopeReasoningOrchestratorService();

const tailPulleyGuard = service.reason({
  hazardObservation: 'Missing guard on conveyor tail pulley with employee access to the nip point at the aggregate plant.',
  siteType: 'surface mine aggregate plant',
  taskContext: 'inspection during normal operation',
  industryContext: 'mining aggregate',
  equipmentInvolved: 'conveyor tail pulley',
  employeeExposureKnown: true,
});

assert(
  tailPulleyGuard.equipmentTaskMechanismContext.matched === true,
  'Tail pulley guard scenario should include task-mechanism context.',
);

const tailPulleyPrimary = tailPulleyGuard.equipmentTaskMechanismContext.primaryMatch;
assert(Boolean(tailPulleyPrimary), 'Tail pulley guard scenario should include a primary task-mechanism match.');

if (!tailPulleyPrimary) {
  throw new Error('Tail pulley guard primary match missing.');
}

assert(tailPulleyPrimary.equipmentId === 'conveyor', 'Tail pulley guard scenario should identify conveyor.');
assert(tailPulleyPrimary.componentId === 'tail_pulley', 'Tail pulley guard scenario should identify tail_pulley.');
assert(
  tailPulleyPrimary.failureModeId === 'missing_tail_pulley_guard',
  `Tail pulley guard scenario should identify missing_tail_pulley_guard, got ${tailPulleyPrimary.failureModeId}.`,
);
assert(tailPulleyPrimary.likelyHazardDomains.includes('machine_guarding'), 'Tail pulley guard scenario should include machine_guarding.');
assert(tailPulleyPrimary.likelyHazardDomains.includes('lockout_tagout'), 'Tail pulley guard scenario should include lockout_tagout.');
assert(tailPulleyPrimary.harmMechanisms.includes('caught_in_or_between'), 'Tail pulley guard scenario should include caught-in/between.');
assert(tailPulleyPrimary.evidenceQuestions.length > 0, 'Tail pulley guard scenario should include evidence questions.');
assert(tailPulleyPrimary.correctiveActionThemes.length > 0, 'Tail pulley guard scenario should include corrective action themes.');
assert(tailPulleyPrimary.verificationEvidence.length > 0, 'Tail pulley guard scenario should include verification evidence.');

assert(
  tailPulleyPrimary.guardrails.contextOnly === true,
  'Task-mechanism context must remain context-only.',
);
assert(
  tailPulleyPrimary.guardrails.doesNotDeclareViolation === true,
  'Task-mechanism context must not declare violations.',
);
assert(
  tailPulleyPrimary.guardrails.doesNotCreateCitation === true,
  'Task-mechanism context must not create citations.',
);
assert(
  tailPulleyPrimary.guardrails.doesNotOverrideRegulation === true,
  'Task-mechanism context must not override regulation.',
);
assert(
  tailPulleyPrimary.guardrails.requiresQualifiedReview === true,
  'Task-mechanism context must require qualified review.',
);

assert(
  tailPulleyGuard.conclusionBoundary.advisoryOnly === true,
  'Orchestrator conclusion boundary must remain advisory-only.',
);
assert(
  tailPulleyGuard.conclusionBoundary.doesNotDeclareViolation === true,
  'Orchestrator conclusion boundary must not declare violations.',
);
assert(
  tailPulleyGuard.conclusionBoundary.doesNotCreateCitation === true,
  'Orchestrator conclusion boundary must not create citations.',
);
assert(
  tailPulleyGuard.conclusionBoundary.requiresQualifiedReview === true,
  'Orchestrator conclusion boundary must require qualified review.',
);

const cleanup = service.reason({
  hazardObservation:
    'Employee cleaning material buildup near conveyor tail pulley; it was not clear whether the belt was locked out.',
  siteType: 'surface mine aggregate plant',
  taskContext: 'cleanup',
  industryContext: 'mining aggregate',
  equipmentInvolved: 'conveyor tail pulley',
  employeeExposureKnown: true,
});

const cleanupPrimary = cleanup.equipmentTaskMechanismContext.primaryMatch;
assert(Boolean(cleanupPrimary), 'Cleanup scenario should include primary task-mechanism match.');

if (!cleanupPrimary) {
  throw new Error('Cleanup primary match missing.');
}

assert(cleanupPrimary.equipmentId === 'conveyor', 'Cleanup scenario should identify conveyor.');
assert(cleanupPrimary.componentId === 'tail_pulley', 'Cleanup scenario should identify tail_pulley.');
assert(
  cleanupPrimary.failureModeId === 'tail_pulley_cleanup_without_energy_control',
  `Cleanup scenario should identify tail_pulley_cleanup_without_energy_control, got ${cleanupPrimary.failureModeId}.`,
);
assert(cleanupPrimary.likelyHazardDomains.includes('lockout_tagout'), 'Cleanup scenario should include lockout_tagout.');
assert(cleanupPrimary.harmMechanisms.includes('unexpected_startup'), 'Cleanup scenario should include unexpected_startup.');

const vague = service.reason({
  hazardObservation: 'There is a general concern at the plant.',
  siteType: 'surface mine aggregate plant',
  industryContext: 'mining aggregate',
});

assert(
  vague.equipmentTaskMechanismContext.matched === false,
  'Vague scenario should not force a task-mechanism match.',
);
assert(
  vague.equipmentTaskMechanismContext.evidenceGaps.length > 0,
  'Vague scenario should include task-mechanism evidence gaps.',
);

console.log('✅ SafeScope task-mechanism orchestrator integration validation passed.');
console.log(
  `Tail pulley context: ${tailPulleyPrimary.equipmentId}/${tailPulleyPrimary.componentId}/${tailPulleyPrimary.failureModeId} score=${tailPulleyPrimary.score}`,
);
console.log(
  `Cleanup context: ${cleanupPrimary.equipmentId}/${cleanupPrimary.componentId}/${cleanupPrimary.failureModeId} score=${cleanupPrimary.score}`,
);
