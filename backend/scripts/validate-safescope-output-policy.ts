import { ObservationUnderstandingService } from '../src/safescope-v2/understanding/observation-understanding.service';
import { CausalRiskService } from '../src/safescope-v2/causal-risk/causal-risk.service';
import { EvidenceSufficiencyService } from '../src/safescope-v2/evidence-sufficiency-core/evidence-sufficiency.service';
import { ConfidenceGovernanceService } from '../src/safescope-v2/confidence-governance/confidence-governance.service';
import { OutputPolicyService } from '../src/safescope-v2/output-policy/output-policy.service';

const observationEngine = new ObservationUnderstandingService();
const causalEngine = new CausalRiskService();
const evidenceEngine = new EvidenceSufficiencyService();
const governanceEngine = new ConfidenceGovernanceService();
const outputPolicyEngine = new OutputPolicyService();

type Expected = {
  strength?: string[];
  likelyHazard?: boolean;
  possibleHazard?: boolean;
  immediateControls?: boolean;
  permanentControls?: boolean;
  standardFamily?: boolean;
  citationCandidate?: boolean;
  executiveNarrative?: boolean;
  correctiveText?: boolean;
  questionsFirst?: boolean;
  allowedStandardLanguage?: string;
};

const cases: Array<{ id: string; text: string; expected: Expected }> = [
  {
    id: 'POLICY-001',
    text: 'MSHA mechanic is servicing a conveyor drive with the guard removed while the equipment is not locked out. Stored and rotating energy could start unexpectedly and employees are exposed.',
    expected: {
      strength: ['strong', 'moderate'],
      likelyHazard: true,
      immediateControls: true,
      correctiveText: true,
      citationCandidate: false,
    },
  },
  {
    id: 'POLICY-002',
    text: 'OSHA general industry employee is preparing to enter a tank with limited ventilation. No atmospheric test, attendant, permit, or rescue plan is documented.',
    expected: {
      strength: ['moderate', 'strong'],
      immediateControls: true,
      correctiveText: true,
      citationCandidate: false,
    },
  },
  {
    id: 'POLICY-003',
    text: 'Something looks dangerous here.',
    expected: {
      strength: ['questions_only'],
      likelyHazard: false,
      possibleHazard: false,
      immediateControls: false,
      permanentControls: false,
      standardFamily: false,
      citationCandidate: false,
      executiveNarrative: false,
      correctiveText: false,
      questionsFirst: true,
      allowedStandardLanguage: 'none',
    },
  },
  {
    id: 'POLICY-004',
    text: 'Unguarded moving conveyor tail pulley observed in the plant. Worker exposure, access, and proximity are not described.',
    expected: {
      strength: ['cautious'],
      likelyHazard: false,
      possibleHazard: true,
      citationCandidate: false,
      questionsFirst: true,
    },
  },
  {
    id: 'POLICY-005',
    text: 'Open floor hole with no cover or barricade near employees. Site jurisdiction is unknown.',
    expected: {
      citationCandidate: false,
      standardFamily: false,
      questionsFirst: true,
      allowedStandardLanguage: 'none',
    },
  },
  {
    id: 'POLICY-006',
    text: 'OSHA general industry open floor hole is uncovered near employees, but no photos or supporting measurements are attached.',
    expected: {
      strength: ['cautious', 'moderate'],
      citationCandidate: false,
      executiveNarrative: true,
      questionsFirst: true,
    },
  },
];

async function main() {
  let failures = 0;

  for (const item of cases) {
    const observationUnderstanding = observationEngine.evaluate(item.text);
    const causalRiskReasoning = await causalEngine.analyzeCausalRisk(observationUnderstanding, item.text);
    const evidenceSufficiency = await evidenceEngine.evaluateEvidenceSufficiency(
      observationUnderstanding,
      causalRiskReasoning,
      item.text
    );

    const confidenceGovernance = governanceEngine.govern({
      observationUnderstanding,
      causalRiskReasoning,
      evidenceSufficiency,
      scenarioIntelligence: {
        confidenceSignals: { score: observationUnderstanding.scenarioUnderstanding?.topScenario?.confidence ?? 0.2 },
      },
      riskReasoning: {
        confidence: causalRiskReasoning.confidence.score,
        initialRiskLevel: causalRiskReasoning.confidence.level === 'high' ? 'high' : 'moderate',
      },
      standardsReasoning: {
        topDefensible: [],
      },
      calibrationMeta: {
        riskBand: causalRiskReasoning.confidence.level === 'high' ? 'high' : 'moderate',
        evidenceGaps: evidenceSufficiency.missingCriticalFacts,
      },
      fusedText: item.text,
    });

    const result = await outputPolicyEngine.evaluateOutputPolicy(
      confidenceGovernance,
      evidenceSufficiency,
      causalRiskReasoning,
      observationUnderstanding,
      {
        riskBand: causalRiskReasoning.confidence.level === 'high' ? 'high' : 'moderate',
        evidenceGaps: evidenceSufficiency.missingCriticalFacts,
      },
      item.text
    );

    const errors: string[] = [];
    const expected = item.expected;

    if (expected.strength && !expected.strength.includes(result.allowedLanguageStrength)) {
      errors.push(`strength expected one of ${expected.strength.join(', ')} got ${result.allowedLanguageStrength}`);
    }

    const checks: Array<[keyof Expected, boolean]> = [
      ['likelyHazard', result.allowedOutputModes.canStateLikelyHazard],
      ['possibleHazard', result.allowedOutputModes.canStatePossibleHazard],
      ['immediateControls', result.allowedOutputModes.canRecommendImmediateControls],
      ['permanentControls', result.allowedOutputModes.canRecommendPermanentControls],
      ['standardFamily', result.allowedOutputModes.canReferenceStandardFamily],
      ['citationCandidate', result.allowedOutputModes.canReferenceCitationCandidate],
      ['executiveNarrative', result.allowedOutputModes.canGenerateExecutiveNarrative],
      ['correctiveText', result.allowedOutputModes.canGenerateCorrectiveActionText],
      ['questionsFirst', result.allowedOutputModes.mustAskReviewerQuestionsFirst],
    ];

    for (const [key, actual] of checks) {
      const expectedValue = expected[key];
      if (typeof expectedValue === 'boolean' && actual !== expectedValue) {
        errors.push(`${key} expected ${expectedValue} got ${actual}`);
      }
    }

    if (
      expected.allowedStandardLanguage &&
      result.standardsPolicy.allowedStandardLanguage !== expected.allowedStandardLanguage
    ) {
      errors.push(`allowedStandardLanguage expected ${expected.allowedStandardLanguage} got ${result.standardsPolicy.allowedStandardLanguage}`);
    }

    if (result.allowedOutputModes.canReferenceCitationCandidate) {
      errors.push('citation candidate support should remain blocked in this validation set');
    }

    if (!result.standardsPolicy.mustAvoidCitationDeclaration || !result.standardsPolicy.mustRequireApplicabilityReview) {
      errors.push('standards policy did not preserve citation/applicability safeguards');
    }

    if (!result.correctiveActionPolicy.mustAvoidViolationLanguage || !result.correctiveActionPolicy.mustRequireVerification) {
      errors.push('corrective action policy did not preserve verification/violation-language safeguards');
    }

    if (
      !result.advisoryGuardrails.advisoryOnly ||
      !result.advisoryGuardrails.doesNotDeclareViolation ||
      !result.advisoryGuardrails.doesNotCreateCitation ||
      !result.advisoryGuardrails.requiresQualifiedReview
    ) {
      errors.push('advisory guardrails were not preserved');
    }

    if (errors.length) {
      failures += 1;
      console.error(`❌ ${item.id}`);
      for (const error of errors) console.error(`  - ${error}`);
      console.error(JSON.stringify(result, null, 2));
    } else {
      console.log(`✅ ${item.id}: ${result.allowedLanguageStrength} / citation=${result.allowedOutputModes.canReferenceCitationCandidate}`);
    }
  }

  if (failures > 0) {
    throw new Error(`${failures} output-policy validation case(s) failed.`);
  }

  console.log('✅ SafeScope output policy validation passed.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
