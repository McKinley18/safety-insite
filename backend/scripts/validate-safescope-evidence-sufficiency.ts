import { ObservationUnderstandingService } from '../src/safescope-v2/understanding/observation-understanding.service';
import { CausalRiskService } from '../src/safescope-v2/causal-risk/causal-risk.service';
import { EvidenceSufficiencyService } from '../src/safescope-v2/evidence-sufficiency-core/evidence-sufficiency.service';

type ValidationCase = {
  id: string;
  text: string;
  expectedLevels: string[];
  requiredSignals: string[];
  requireDowngrade?: boolean;
};

const cases: ValidationCase[] = [
  {
    id: 'EVIDENCE-001',
    text: 'MSHA mechanic is servicing a conveyor drive with the guard removed while the equipment is not locked out. Stored and rotating energy could start unexpectedly.',
    expectedLevels: ['sufficient', 'partially_sufficient'],
    requiredSignals: ['exposure', 'energy', 'control', 'mechanism'],
  },
  {
    id: 'EVIDENCE-002',
    text: 'OSHA general industry open floor hole in a walking surface is uncovered and employees are working nearby. No cover, guardrail, or barricade is installed.',
    expectedLevels: ['sufficient', 'partially_sufficient'],
    requiredSignals: ['exposure', 'energy', 'control'],
  },
  {
    id: 'EVIDENCE-003',
    text: 'OSHA general industry employee is preparing to enter a tank with limited ventilation. No atmospheric test, attendant, permit, or rescue plan is documented.',
    expectedLevels: ['sufficient', 'partially_sufficient'],
    requiredSignals: ['exposure', 'energy', 'control', 'mechanism'],
  },
  {
    id: 'EVIDENCE-004',
    text: 'Something looks dangerous here.',
    expectedLevels: ['insufficient'],
    requiredSignals: ['questions', 'missing'],
    requireDowngrade: true,
  },
  {
    id: 'EVIDENCE-005',
    text: 'OSHA construction unprotected roof edge with no guardrail or personal fall protection visible.',
    expectedLevels: ['weak', 'partially_sufficient'],
    requiredSignals: ['missing_exposure', 'downgrade'],
    requireDowngrade: true,
  },
  {
    id: 'EVIDENCE-006',
    text: 'Unlabeled chemical container is being used at a workstation. Employees are handling the material and no SDS or hazard label is available.',
    expectedLevels: ['partially_sufficient', 'sufficient'],
    requiredSignals: ['jurisdiction_question'],
  },
];

function fail(id: string, message: string, result: any): number {
  console.error(`❌ ${id}: ${message}`);
  console.error(JSON.stringify(result, null, 2));
  return 1;
}

async function main() {
  const understandingService = new ObservationUnderstandingService();
  const causalRiskService = new CausalRiskService();
  const evidenceService = new EvidenceSufficiencyService();

  let failures = 0;

  for (const item of cases) {
    const observationUnderstanding = understandingService.evaluate(item.text);
    const causalRiskReasoning = await causalRiskService.analyzeCausalRisk(observationUnderstanding, item.text);
    const result = await evidenceService.evaluateEvidenceSufficiency(
      observationUnderstanding,
      causalRiskReasoning,
      item.text
    );

    if (!item.expectedLevels.includes(result.sufficiencyLevel)) {
      failures += fail(item.id, `expected level ${item.expectedLevels.join(' or ')}, got ${result.sufficiencyLevel}`, result);
      continue;
    }

    if (item.requireDowngrade && !result.confidenceImpact.shouldDowngradeConfidence) {
      failures += fail(item.id, 'expected confidence downgrade', result);
      continue;
    }

    let caseFailed = false;

    for (const signal of item.requiredSignals) {
      const missing = result.missingCriticalFacts.join(' ').toLowerCase();
      const questions = result.recommendedReviewerQuestions.join(' ').toLowerCase();

      const passed =
        signal === 'exposure' ? result.factScores.exposureClarity >= 0.6 :
        signal === 'energy' ? result.factScores.energyClarity >= 0.6 :
        signal === 'control' ? result.factScores.controlFailureClarity >= 0.6 :
        signal === 'mechanism' ? result.factScores.mechanismClarity >= 0.6 :
        signal === 'questions' ? result.recommendedReviewerQuestions.length > 0 :
        signal === 'missing' ? result.missingCriticalFacts.length > 0 :
        signal === 'missing_exposure' ? missing.includes('worker exposure') || questions.includes('worker') || questions.includes('exposed') :
        signal === 'downgrade' ? result.confidenceImpact.shouldDowngradeConfidence :
        signal === 'jurisdiction_question' ? missing.includes('jurisdiction') || questions.includes('jurisdiction') || questions.includes('site type') :
        false;

      if (!passed) {
        failures += fail(item.id, `missing required signal: ${signal}`, result);
        caseFailed = true;
        break;
      }
    }

    if (caseFailed) {
      continue;
    }

    if (result.advisoryGuardrails?.advisoryOnly !== true || result.advisoryGuardrails?.doesNotCreateCitation !== true) {
      failures += fail(item.id, 'advisory guardrails missing or weakened', result);
      continue;
    }

    console.log(`✅ ${item.id}: ${result.sufficiencyLevel} / score=${result.overallScore}`);
  }

  if (failures > 0) {
    throw new Error(`${failures} evidence-sufficiency validation case(s) failed.`);
  }

  console.log('✅ SafeScope evidence sufficiency validation passed.');
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
