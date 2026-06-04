import { SafeScopeIntelligenceOrchestrator } from '../orchestration/intelligence-orchestrator.service';

type GoldenScenario = {
  name: string;
  input: {
    text: string;
    classification: string;
    confidence?: number;
    risk?: any;
    standards?: any[];
    additionalHazards?: any[];
    priorFindings?: any[];
  };
  expect: {
    energySource?: string;
    operationalState?: string;
    contradiction?: boolean;
    barrierAdequacy?: string;
    cascadePotential?: string;
  };
};

const orchestrator = new SafeScopeIntelligenceOrchestrator();

const scenarios: GoldenScenario[] = [
  {
    name: 'permit required confined space tank entry',
    input: {
      text: 'Worker preparing to enter tank with limited egress, possible oxygen deficiency, ventilation needed, attendant not assigned.',
      classification: 'Confined Space',
      confidence: 0.84,
      risk: { riskScore: 22, riskBand: 'Critical', requiresShutdown: true },
      standards: [{ citation: '29 CFR 1910.146', source: ['curated', 'cfr_database'] }],
    },
    expect: {
      energySource: 'chemical/industrial hygiene',
    },
  },
  {
    name: 'unguarded conveyor during operation',
    input: {
      text: 'Employee working near an unguarded moving conveyor belt and exposed pinch point while production was operating.',
      classification: 'Machine Guarding',
      confidence: 0.86,
      risk: { riskScore: 20, riskBand: 'Critical', requiresShutdown: true },
      standards: [{ citation: '30 CFR 56.14107', source: ['curated', 'cfr_database'] }],
    },
    expect: {
      energySource: 'kinetic/mechanical',
      operationalState: 'production_or_active_operation',
      barrierAdequacy: 'weak',
    },
  },
  {
    name: 'energized panel contradiction',
    input: {
      text: 'Panel was described as de-energized but also live and energized while worker was troubleshooting.',
      classification: 'Electrical',
      confidence: 0.72,
      risk: { riskScore: 18, riskBand: 'High' },
      standards: [{ citation: '29 CFR 1910.303', source: ['cfr_database'] }],
    },
    expect: {
      energySource: 'electrical',
      contradiction: true,
    },
  },
  {
    name: 'mobile equipment pedestrian line of fire',
    input: {
      text: 'Pedestrian walking through blind spot near operating loader traffic, positioned between truck and stockpile.',
      classification: 'Powered Mobile Equipment',
      confidence: 0.82,
      risk: { riskScore: 16, riskBand: 'High' },
      additionalHazards: [{ classification: 'Housekeeping' }],
    },
    expect: {
      energySource: 'mobile equipment kinetic energy',
      cascadePotential: 'elevated',
    },
  },
];

let failures = 0;

for (const scenario of scenarios) {
  const result = orchestrator.evaluate({
    fusedText: scenario.input.text,
    promotedPrimary: {
      classification: scenario.input.classification,
      confidence: scenario.input.confidence ?? 0.8,
      evidenceTokens: [],
      risk: scenario.input.risk || {},
    },
    classifierResult: {
      ambiguityWarnings: [],
    },
    evidenceTexts: [],
    expandedContext: {},
    primaryStandardsResult: {
      suggestedStandards: scenario.input.standards || [],
    },
    generatedActions: [
      {
        title: 'Correct hazard',
        description: 'Install, verify, and document effective controls.',
        suggestedFixes: ['Install guard or control exposure', 'Verify correction before closure'],
      },
    ],
    additionalHazards: scenario.input.additionalHazards || [],
    priorFindings: scenario.input.priorFindings || [],
  });

  const checks = [
    scenario.expect.energySource
      ? result.energyTransferIntelligence?.dominantEnergySource === scenario.expect.energySource
      : true,
    scenario.expect.operationalState
      ? result.operationalState?.primaryState === scenario.expect.operationalState
      : true,
    typeof scenario.expect.contradiction === 'boolean'
      ? result.contradictionIntelligence?.contradictionsDetected === scenario.expect.contradiction
      : true,
    scenario.expect.barrierAdequacy
      ? result.barrierIntelligence?.barrierAdequacy === scenario.expect.barrierAdequacy
      : true,
    scenario.expect.cascadePotential
      ? result.correlationIntelligence?.cascadePotential === scenario.expect.cascadePotential
      : true,
  ];

  const passed = checks.every(Boolean);

  if (!passed) {
    failures += 1;
    console.error(`❌ ${scenario.name}`);
    console.error(JSON.stringify(result, null, 2));
  } else {
    console.log(`✅ ${scenario.name}`);
  }
}

if (failures > 0) {
  throw new Error(`${failures} golden operational reasoning scenario(s) failed.`);
}

console.log('✅ SafeScope operational reasoning golden tests passed.');
