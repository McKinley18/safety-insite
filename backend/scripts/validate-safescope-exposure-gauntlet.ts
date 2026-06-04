import { ExposureIntelligenceService } from '../src/safescope-v2/exposure-intelligence/exposure-intelligence.service';

function assert(condition: any, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

const scenarios = [
  {
    name: 'Respirable silica dust',
    classification: 'Respirable Silica',
    observationText: 'Dry cutting concrete creates dust cloud.',
    contaminantOrAgent: 'Silica',
    // Missing concentration and duration
  },
  {
    name: 'Welding fume confined space',
    classification: 'Welding fume',
    observationText: 'Welding in confined space with no local exhaust.',
    contaminantOrAgent: 'Welding fume',
    concentrationValue: 5, // example
    durationMinutes: 120,
    shiftLengthHours: 8,
  },
];

async function main() {
  const service = new ExposureIntelligenceService();
  for (const scenario of scenarios) {
    const output = service.evaluate({
      classification: scenario.classification,
      observationText: scenario.observationText,
      contaminantOrAgent: scenario.contaminantOrAgent,
      concentrationValue: scenario.concentrationValue,
      durationMinutes: scenario.durationMinutes,
      shiftLengthHours: scenario.shiftLengthHours,
    });

    assert(output, `${scenario.name}: output must be present`);
    assert(output.sourceBoundary !== '', `${scenario.name}: sourceBoundary must be present`);
    assert(output.canInventExposureLimit === false, `${scenario.name}: cannot invent limits`);
    assert(output.canDeclareComplianceWithoutSampling === false, `${scenario.name}: cannot declare compliance without sampling`);
    assert(output.canReduceHumanReview === false, `${scenario.name}: cannot reduce human review`);
    
    if (scenario.name === 'Respirable silica dust') {
        assert(output.missingExposureInputs.length > 0, `${scenario.name}: missing inputs should be detected`);
        assert(output.requiresIndustrialHygieneReview === true, `${scenario.name}: should require IH review`);
    }
  }
  console.log('✅ SafeScope Exposure gauntlet passed.');
}

main().catch(console.error);
