import { CausalRiskService } from '../src/safescope-v2/causal-risk/causal-risk.service';
import { ObservationUnderstandingService } from '../src/safescope-v2/understanding/observation-understanding.service';

type TestCase = {
  id: string;
  text: string;
  expectedMechanism: string;
  expectedEnergy?: string | string[];
  minimumConfidence: 'high' | 'moderate' | 'low' | 'insufficient';
  expectedMissingEvidenceIncludes?: string;
};

const cases: TestCase[] = [
  {
    id: 'CAUSAL-001',
    text: 'Mechanic is servicing a conveyor drive with the guard removed while the equipment is not locked out. Stored and rotating energy could start unexpectedly.',
    expectedMechanism: 'unexpected_startup',
    expectedEnergy: ['mechanical_motion', 'mechanical_rotation'],
    minimumConfidence: 'moderate',
  },
  {
    id: 'CAUSAL-002',
    text: 'Open floor hole in a walking surface is uncovered and employees are working nearby. No cover, guardrail, or barricade is installed.',
    expectedMechanism: 'fall_from_height',
    expectedEnergy: 'gravity',
    minimumConfidence: 'moderate',
  },
  {
    id: 'CAUSAL-003',
    text: 'Employee is preparing to enter a tank with limited ventilation. No atmospheric test, attendant, permit, or rescue plan is documented.',
    expectedMechanism: 'atmospheric_hazard_engulfment_or_entrapment',
    minimumConfidence: 'moderate',
  },
  {
    id: 'CAUSAL-004',
    text: 'Worker stands below a suspended load during crane lift. Sling appears damaged and no exclusion zone is established.',
    expectedMechanism: 'struck_by_falling_suspended_load',
    expectedEnergy: 'gravity',
    minimumConfidence: 'moderate',
  },
  {
    id: 'CAUSAL-005',
    text: 'Unlabeled chemical container is being used at a workstation. Employees are handling the material and no SDS or hazard label is available.',
    expectedMechanism: 'chemical_exposure_unknown_agent',
    expectedEnergy: 'chemical',
    minimumConfidence: 'moderate',
  },
  {
    id: 'CAUSAL-006',
    text: 'Something looks unsafe in the area.',
    expectedMechanism: 'unknown',
    minimumConfidence: 'insufficient',
    expectedMissingEvidenceIncludes: 'mechanism of injury',
  },
  {
    id: 'CAUSAL-007',
    text: 'Open used-oil container with no lid and used oil still inside near a walking path.',
    expectedMechanism: 'slip_trip_fall_same_level',
    expectedEnergy: 'gravity',
    minimumConfidence: 'moderate',
  },
];

const confidenceRank = {
  insufficient: 0,
  low: 1,
  moderate: 2,
  high: 3,
};

async function main() {
  const causalRiskService = new CausalRiskService();
  const understandingService = new ObservationUnderstandingService();

  let failures = 0;

  for (const testCase of cases) {
    const observationUnderstanding = understandingService.evaluate(testCase.text);
    const result = await causalRiskService.analyzeCausalRisk(observationUnderstanding, testCase.text);

    const errors: string[] = [];

    if (result.mechanismOfInjury !== testCase.expectedMechanism) {
      errors.push(`expected mechanism ${testCase.expectedMechanism}, got ${result.mechanismOfInjury}`);
    }

    if (testCase.expectedEnergy) {
      const expectedEnergies = Array.isArray(testCase.expectedEnergy)
        ? testCase.expectedEnergy
        : [testCase.expectedEnergy];

      if (!expectedEnergies.includes(result.primaryEnergySource)) {
        errors.push(`expected energy ${expectedEnergies.join(' or ')}, got ${result.primaryEnergySource}`);
      }
    }

    if (confidenceRank[result.confidence.level] < confidenceRank[testCase.minimumConfidence]) {
      errors.push(`expected confidence at least ${testCase.minimumConfidence}, got ${result.confidence.level}`);
    }

    if (
      testCase.expectedMissingEvidenceIncludes &&
      !result.missingEvidence.includes(testCase.expectedMissingEvidenceIncludes)
    ) {
      errors.push(`expected missing evidence to include ${testCase.expectedMissingEvidenceIncludes}`);
    }

    if (result.advisoryGuardrails.advisoryOnly !== true ||
        result.advisoryGuardrails.doesNotDeclareViolation !== true ||
        result.advisoryGuardrails.doesNotCreateCitation !== true ||
        result.advisoryGuardrails.requiresQualifiedReview !== true) {
      errors.push('advisory guardrails were not preserved');
    }

    if (!result.reasoningTrace.length) {
      errors.push('reasoning trace is empty');
    }

    if (errors.length) {
      failures += 1;
      console.error(`❌ ${testCase.id}`);
      for (const error of errors) console.error(`  - ${error}`);
      console.error(JSON.stringify(result, null, 2));
    } else {
      console.log(`✅ ${testCase.id}: ${result.mechanismOfInjury} / ${result.confidence.level}`);
    }
  }

  if (failures > 0) {
    throw new Error(`${failures} causal-risk reasoning case(s) failed.`);
  }

  console.log('✅ SafeScope causal-risk reasoning validation passed.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
