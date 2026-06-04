import { SafeScopeCorrectiveActionReasoningService } from '../src/safescope-v2/reasoning-orchestrator/corrective-actions/corrective-action-reasoning.service';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const service = new SafeScopeCorrectiveActionReasoningService();

const machineGuarding = service.reason({
  hazardObservation: 'Unguarded conveyor tail pulley with employee access during cleanup.',
  jurisdiction: 'msha',
  hazardDomain: 'machine_guarding',
  employeeExposureKnown: true,
  equipmentInvolved: 'conveyor tail pulley',
  missingEvidence: [],
});

assert(machineGuarding.engine === 'safescope_corrective_action_reasoning_v1', 'Unexpected corrective action engine.');
assert(machineGuarding.mode === 'deterministic_test_only_advisory', 'Unexpected corrective action mode.');
assert(machineGuarding.productionReasoningModified === false, 'Corrective action reasoning must not modify production reasoning.');
assert(machineGuarding.recommendations.length >= 3, 'Expected multiple machine guarding recommendations.');
assert(machineGuarding.summary.immediateCount >= 1, 'Expected at least one immediate recommendation for known exposure.');
assert(machineGuarding.summary.engineeringCount >= 1, 'Expected at least one engineering control.');
assert(machineGuarding.summary.verificationCount >= 1, 'Expected verification recommendation.');
assert(
  machineGuarding.recommendations.some((item) => item.controlLevel === 'engineering' && item.action.toLowerCase().includes('guard')),
  'Expected guarding-related engineering recommendation.',
);
assert(machineGuarding.reasoningBoundary.advisoryOnly === true, 'Corrective action reasoning must be advisory only.');
assert(machineGuarding.reasoningBoundary.doesNotDeclareViolation === true, 'Corrective action reasoning must not declare violations.');
assert(machineGuarding.reasoningBoundary.doesNotGuaranteeAbatement === true, 'Corrective action reasoning must not guarantee abatement.');
assert(machineGuarding.reasoningBoundary.requiresQualifiedReview === true, 'Corrective action reasoning must require qualified review.');
assert(machineGuarding.reasoningBoundary.requiresSiteSpecificValidation === true, 'Corrective action reasoning must require site-specific validation.');

const healthExposure = service.reason({
  hazardObservation: 'Possible respirable silica dust exposure during dry sweeping.',
  jurisdiction: 'osha_general_industry',
  hazardDomain: 'health_exposure',
  employeeExposureKnown: true,
  missingEvidence: [
    {
      field: 'measurementsAvailable',
      reason: 'Sampling data is not available.',
      importance: 'high',
    },
  ],
});

assert(
  healthExposure.recommendations.some((item) => item.action.toLowerCase().includes('sampling')),
  'Expected sampling-related recommendation for health exposure.',
);
assert(
  healthExposure.recommendations.some((item) => item.controlLevel === 'verification'),
  'Expected verification control for health exposure.',
);

const unknown = service.reason({
  hazardObservation: 'Possible issue observed.',
  jurisdiction: 'unclear',
  hazardDomain: 'unknown',
  missingEvidence: [
    {
      field: 'siteType',
      reason: 'Site type is not known.',
      importance: 'high',
    },
  ],
});

assert(
  unknown.recommendations.some((item) => item.action.toLowerCase().includes('additional facts')),
  'Expected additional-facts recommendation for unknown hazard.',
);
assert(unknown.reasoningBoundary.doesNotDeclareViolation === true, 'Unknown hazard still must not declare violations.');

console.log('✅ SafeScope corrective action reasoning validation passed.');
