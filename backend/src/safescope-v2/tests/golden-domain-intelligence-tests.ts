import { SafeScopeIntelligenceOrchestrator } from '../orchestration/intelligence-orchestrator.service';

const orchestrator = new SafeScopeIntelligenceOrchestrator();

const scenarios = [
  {
    name: 'LOTO energy isolation',
    text: 'Maintenance employee clearing jam on energized conveyor. Equipment was not locked out and zero energy was not verified.',
    classification: 'Machine Guarding',
    domain: 'loto',
  },
  {
    name: 'mobile equipment traffic interaction',
    text: 'Pedestrian walking through loader blind spot near haul road traffic while truck was backing.',
    classification: 'Mobile Equipment / Traffic',
    domain: 'mobileEquipment',
  },
  {
    name: 'trenching excavation',
    text: 'Worker entered unprotected trench with spoil pile near edge and ladder missing.',
    classification: 'Trenching Excavation',
    domain: 'trenching',
  },
  {
    name: 'electrical energized panel',
    text: 'Worker troubleshooting energized electrical panel with exposed live parts.',
    classification: 'Electrical',
    domain: 'electrical',
  },
  {
    name: 'lifting rigging suspended load',
    text: 'Worker standing below suspended load during crane lift with damaged sling and unclear signal communication.',
    classification: 'Lifting Rigging',
    domain: 'liftingRigging',
  },
  {
    name: 'HazCom GHS chemical labeling',
    text: 'Unlabeled secondary container with flammable solvent stored near oxidizer. SDS unavailable.',
    classification: 'Hazard Communication',
    domain: 'hazcomGhs',
  },
];

let failures = 0;

for (const scenario of scenarios) {
  const result = orchestrator.evaluate({
    fusedText: scenario.text,
    promotedPrimary: {
      classification: scenario.classification,
      confidence: 0.85,
      evidenceTokens: [],
      risk: { riskScore: 15, riskBand: 'High' },
    },
    classifierResult: {
      ambiguityWarnings: [],
    },
    evidenceTexts: [],
    expandedContext: {},
    primaryStandardsResult: {
      suggestedStandards: [],
    },
    generatedActions: [],
    additionalHazards: [],
    priorFindings: [],
  });

  const domainResult = (result.domainIntelligence as Record<string, any> | undefined)?.[scenario.domain];

  if (!domainResult) {
    failures += 1;
    console.error(`❌ ${scenario.name}: expected ${scenario.domain} domain intelligence`);
    console.error(JSON.stringify(result.domainIntelligence, null, 2));
  } else {
    console.log(`✅ ${scenario.name}`);
  }
}

if (failures > 0) {
  throw new Error(`${failures} domain intelligence scenario(s) failed.`);
}

console.log('✅ SafeScope domain intelligence golden tests passed.');
