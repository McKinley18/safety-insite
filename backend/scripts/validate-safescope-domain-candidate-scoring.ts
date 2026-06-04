import { SafeScopeReasoningOrchestratorService } from '../src/safescope-v2/reasoning-orchestrator/reasoning-orchestrator.service';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const service = new SafeScopeReasoningOrchestratorService();

const cases = [
  {
    name: 'Powered haulage wins over traffic control for active haulage route',
    expectedDomain: 'powered_haulage',
    request: {
      hazardObservation: 'Active haulage route passes beside pedestrian maintenance zone with no separation or traffic control plan.',
      siteType: 'surface aggregate mine',
      taskContext: 'maintenance area haulage inspection',
      industryContext: 'mining',
      photosAvailable: true,
      employeeExposureKnown: true,
      equipmentInvolved: 'haulage route',
    },
  },
  {
    name: 'Traffic control wins for forklift traffic crossing pedestrian walkway',
    expectedDomain: 'traffic_control',
    request: {
      hazardObservation: 'Forklift traffic crossing pedestrian walkway without signage, barriers, or traffic control.',
      siteType: 'general industry facility',
      taskContext: 'warehouse inspection',
      industryContext: 'manufacturing',
      photosAvailable: true,
      employeeExposureKnown: true,
      equipmentInvolved: 'forklift traffic',
    },
  },
  {
    name: 'Machine guarding wins for guarded-by-location moving belt and pulley',
    expectedDomain: 'machine_guarding',
    request: {
      hazardObservation: 'Moving belt and pulley are elevated above normal reach, but access ladder is nearby and maintenance employees work in the area.',
      siteType: 'surface aggregate mine',
      taskContext: 'plant maintenance area inspection',
      industryContext: 'mining',
      photosAvailable: true,
      employeeExposureKnown: true,
      equipmentInvolved: 'elevated belt and pulley',
    },
  },
  {
    name: 'Electrical wins for arc flash energized panel work',
    expectedDomain: 'electrical',
    request: {
      hazardObservation: 'Employee working inside energized electrical panel with arc flash boundary and PPE requirements unclear.',
      siteType: 'general industry facility',
      taskContext: 'energized electrical troubleshooting',
      industryContext: 'manufacturing',
      photosAvailable: true,
      employeeExposureKnown: true,
      equipmentInvolved: 'energized electrical panel',
    },
  },
];

for (const testCase of cases) {
  const result = service.reason(testCase.request as any);

  assert(
    result.hazardClassification.primaryDomain === testCase.expectedDomain,
    `${testCase.name}: expected ${testCase.expectedDomain}, received ${result.hazardClassification.primaryDomain}. Reasons: ${result.hazardClassification.reasons.join(' | ')}`,
  );

  assert(
    result.hazardClassification.reasons.some((reason) => reason.includes('Matched terms:')),
    `${testCase.name}: classification should include matched terms.`,
  );

  assert(
    result.hazardClassification.reasons.some((reason) => reason.includes('Candidate score:')),
    `${testCase.name}: classification should include candidate score.`,
  );

  assert(result.conclusionBoundary.doesNotDeclareViolation === true, `${testCase.name}: must not declare violations.`);
  assert(result.conclusionBoundary.doesNotCreateCitation === true, `${testCase.name}: must not create citations.`);
}

console.log('✅ SafeScope domain candidate scoring validation passed.');
console.log(`Cases validated: ${cases.length}/${cases.length}`);
