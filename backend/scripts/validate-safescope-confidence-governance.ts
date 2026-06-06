import { ObservationUnderstandingService } from '../src/safescope-v2/understanding/observation-understanding.service';
import { CausalRiskService } from '../src/safescope-v2/causal-risk/causal-risk.service';
import { EvidenceSufficiencyService } from '../src/safescope-v2/evidence-sufficiency-core/evidence-sufficiency.service';
import { ConfidenceGovernanceService } from '../src/safescope-v2/confidence-governance/confidence-governance.service';

const observationEngine = new ObservationUnderstandingService();
const causalEngine = new CausalRiskService();
const evidenceEngine = new EvidenceSufficiencyService();
const governanceEngine = new ConfidenceGovernanceService();

type Expected = {
  strongRecommendation?: boolean;
  correctiveAction?: boolean;
  standardFamily?: boolean;
  citationCandidate?: boolean;
  reportNarrative?: boolean;
  humanReview?: boolean;
  maxConfidence?: string[];
  requiresGap?: string;
};

const cases: Array<{ id: string; text: string; expected: Expected }> = [
  {
    id: 'GOV-001',
    text: 'MSHA mechanic is servicing a conveyor drive with the guard removed while the equipment is not locked out. Stored and rotating energy could start unexpectedly and employees are exposed.',
    expected: {
      strongRecommendation: true,
      correctiveAction: true,
      humanReview: true,
      citationCandidate: false,
      maxConfidence: ['high', 'moderate'],
    },
  },
  {
    id: 'GOV-002',
    text: 'OSHA general industry employee is preparing to enter a tank with limited ventilation. No atmospheric test, attendant, permit, or rescue plan is documented.',
    expected: {
      strongRecommendation: true,
      correctiveAction: true,
      humanReview: true,
      citationCandidate: false,
      maxConfidence: ['high', 'moderate'],
    },
  },
  {
    id: 'GOV-003',
    text: 'Something looks dangerous here.',
    expected: {
      strongRecommendation: false,
      correctiveAction: false,
      standardFamily: false,
      citationCandidate: false,
      reportNarrative: false,
      humanReview: true,
      maxConfidence: ['insufficient'],
    },
  },
  {
    id: 'GOV-004',
    text: 'Unguarded moving conveyor tail pulley observed in the plant. Worker exposure, access, and proximity are not described.',
    expected: {
      citationCandidate: false,
      humanReview: true,
      maxConfidence: ['moderate', 'low', 'insufficient'],
      requiresGap: 'exposure',
    },
  },
  {
    id: 'GOV-005',
    text: 'Open floor hole with no cover or barricade near employees. Site jurisdiction is unknown.',
    expected: {
      citationCandidate: false,
      humanReview: true,
      requiresGap: 'jurisdiction',
    },
  },
  {
    id: 'GOV-006',
    text: 'OSHA general industry open floor hole is uncovered near employees, but no photos or supporting measurements are attached.',
    expected: {
      reportNarrative: true,
      citationCandidate: false,
      humanReview: true,
      maxConfidence: ['moderate', 'low'],
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

    const result = governanceEngine.govern({
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

    const errors: string[] = [];
    const expected = item.expected;

    if (expected.strongRecommendation !== undefined && result.outputPermissions.canSupportStrongRecommendation !== expected.strongRecommendation) {
      errors.push(`strongRecommendation expected ${expected.strongRecommendation} got ${result.outputPermissions.canSupportStrongRecommendation}`);
    }

    if (expected.correctiveAction !== undefined && result.outputPermissions.canSupportCorrectiveAction !== expected.correctiveAction) {
      errors.push(`correctiveAction expected ${expected.correctiveAction} got ${result.outputPermissions.canSupportCorrectiveAction}`);
    }

    if (expected.standardFamily !== undefined && result.outputPermissions.canSupportStandardFamilySuggestion !== expected.standardFamily) {
      errors.push(`standardFamily expected ${expected.standardFamily} got ${result.outputPermissions.canSupportStandardFamilySuggestion}`);
    }

    if (expected.citationCandidate !== undefined && result.outputPermissions.canSupportCitationCandidate !== expected.citationCandidate) {
      errors.push(`citationCandidate expected ${expected.citationCandidate} got ${result.outputPermissions.canSupportCitationCandidate}`);
    }

    if (expected.reportNarrative !== undefined && result.outputPermissions.canSupportReportNarrative !== expected.reportNarrative) {
      errors.push(`reportNarrative expected ${expected.reportNarrative} got ${result.outputPermissions.canSupportReportNarrative}`);
    }

    if (expected.humanReview !== undefined && result.humanReviewRequired !== expected.humanReview) {
      errors.push(`humanReview expected ${expected.humanReview} got ${result.humanReviewRequired}`);
    }

    if (expected.maxConfidence && !expected.maxConfidence.includes(result.maximumSupportedConfidence)) {
      errors.push(`maximumSupportedConfidence expected one of ${expected.maxConfidence.join(', ')} got ${result.maximumSupportedConfidence}`);
    }

    if (expected.requiresGap) {
      const haystack = [
        ...result.blockingEvidenceGaps,
        ...result.downgradeReasons,
        ...result.humanReviewReasons,
        ...evidenceSufficiency.recommendedReviewerQuestions,
      ].join(' ').toLowerCase();

      if (!haystack.includes(expected.requiresGap)) {
        errors.push(`expected governance output to reference missing/weak ${expected.requiresGap}`);
      }
    }

    if (!result.advisoryGuardrails.advisoryOnly || !result.advisoryGuardrails.doesNotDeclareViolation || !result.advisoryGuardrails.doesNotCreateCitation || !result.advisoryGuardrails.requiresQualifiedReview) {
      errors.push('advisory guardrails were not preserved');
    }

    if (errors.length) {
      failures += 1;
      console.error(`❌ ${item.id}`);
      for (const error of errors) console.error(`  - ${error}`);
      console.error(JSON.stringify(result, null, 2));
    } else {
      console.log(`✅ ${item.id}: ${result.maximumSupportedConfidence} / citation=${result.outputPermissions.canSupportCitationCandidate}`);
    }
  }

  if (failures > 0) {
    throw new Error(`${failures} confidence-governance validation case(s) failed.`);
  }

  console.log('✅ SafeScope confidence governance validation passed.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
