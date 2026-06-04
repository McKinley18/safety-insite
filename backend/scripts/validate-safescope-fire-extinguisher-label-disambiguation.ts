import { SafeScopeReasoningOrchestratorService } from '../src/safescope-v2/reasoning-orchestrator/reasoning-orchestrator.service';

type ExpectedCase = {
  id: string;
  hazardObservation: string;
  equipmentInvolved?: string;
  taskContext?: string;
  expectedDomain: string;
  expectedCitation: string;
  expectedMechanism: string;
  mustNotScenarioId?: string;
};

const cases: ExpectedCase[] = [
  {
    id: 'fire-extinguisher-label-not-legible',
    hazardObservation: 'Label on fire extinguisher is not legible.',
    equipmentInvolved: 'portable fire extinguisher',
    taskContext: 'workplace inspection',
    expectedDomain: 'fire_protection',
    expectedCitation: '29 CFR 1910.157(c)(1)',
    expectedMechanism: 'fire_extinguisher_access_failure',
    mustNotScenarioId: 'general-industry-powered-overhead-door-crush-point',
  },
  {
    id: 'fire-extinguisher-inspection-tag-not-legible',
    hazardObservation: 'The inspection tag on the portable fire extinguisher is not legible and the monthly inspection status cannot be verified.',
    equipmentInvolved: 'portable fire extinguisher',
    taskContext: 'workplace inspection',
    expectedDomain: 'fire_protection',
    expectedCitation: '29 CFR 1910.157(c)(1)',
    expectedMechanism: 'fire_extinguisher_access_failure',
    mustNotScenarioId: 'general-industry-powered-overhead-door-crush-point',
  },
  {
    id: 'chemical-container-label-not-legible',
    hazardObservation: 'Chemical container label is not legible and employees cannot identify the contents or hazards.',
    equipmentInvolved: 'chemical container',
    taskContext: 'chemical storage inspection',
    expectedDomain: 'hazardous_materials',
    expectedCitation: '29 CFR 1910.1200',
    expectedMechanism: 'chemical_exposure',
    mustNotScenarioId: 'general-industry-powered-overhead-door-crush-point',
  },
];

const service = new SafeScopeReasoningOrchestratorService();

let failures = 0;

for (const item of cases) {
  const result: any = service.reason({
    hazardObservation: item.hazardObservation,
    siteType: 'general industry facility',
    industryContext: 'OSHA general industry',
    taskContext: item.taskContext,
    equipmentInvolved: item.equipmentInvolved,
    photosAvailable: false,
    employeeExposureKnown: false,
    measurementsAvailable: false,
    enableApprovedKnowledgeContext: true,
  });

  const packet = result.brainSnapshot?.situationalAwarenessPacket;
  const actualDomain = result.hazardClassification?.primaryDomain;
  const actualCitation = result.primaryCitation || packet?.summary?.likelyCitation;
  const actualMechanism =
    result.equipmentTaskMechanismContext?.primaryMatch?.failureModeLabel ||
    packet?.summary?.likelyMechanism;
  const actualScenarioId = packet?.summary?.selectedScenarioId;

  const problems: string[] = [];

  if (actualDomain !== item.expectedDomain) {
    problems.push(`domain expected ${item.expectedDomain}, got ${actualDomain}`);
  }

  if (actualCitation !== item.expectedCitation) {
    problems.push(`citation expected ${item.expectedCitation}, got ${actualCitation}`);
  }

  if (actualMechanism !== item.expectedMechanism) {
    problems.push(`mechanism expected ${item.expectedMechanism}, got ${actualMechanism}`);
  }

  if (item.mustNotScenarioId && actualScenarioId === item.mustNotScenarioId) {
    problems.push(`unexpected leaked scenario ${actualScenarioId}`);
  }

  if (problems.length) {
    failures += 1;
    console.error(`❌ ${item.id}`);
    console.error(problems.join('\n'));
    console.error(JSON.stringify({
      observation: item.hazardObservation,
      actualDomain,
      actualCitation,
      actualMechanism,
      actualScenarioId,
      selectedScenarioLabel: packet?.summary?.selectedScenarioLabel,
      likelyControls: packet?.summary?.likelyControls?.slice(0, 5),
      criticalEvidenceQuestions: packet?.summary?.criticalEvidenceQuestions?.slice(0, 5),
      warnings: packet?.summary?.decisionWarnings,
    }, null, 2));
  } else {
    console.log(`✅ ${item.id}`);
  }
}

if (failures > 0) {
  throw new Error(`${failures} fire extinguisher/HazCom disambiguation regression case(s) failed.`);
}

console.log('✅ SafeScope fire extinguisher label disambiguation validation passed.');
