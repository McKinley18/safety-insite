import { ObservationUnderstandingService } from '../src/safescope-v2/understanding/observation-understanding.service';
import { CausalRiskService } from '../src/safescope-v2/causal-risk/causal-risk.service';
import { EvidenceSufficiencyService } from '../src/safescope-v2/evidence-sufficiency-core/evidence-sufficiency.service';
import { ConfidenceGovernanceService } from '../src/safescope-v2/confidence-governance/confidence-governance.service';
import { OutputPolicyService } from '../src/safescope-v2/output-policy/output-policy.service';
import { DefensibleCorrectiveActionService } from '../src/safescope-v2/defensible-corrective-action/dca.service';
import { HumanReviewLearningGovernanceService } from '../src/safescope-v2/human-review-learning-governance/hrlg.service';

const observationEngine = new ObservationUnderstandingService();
const causalEngine = new CausalRiskService();
const evidenceEngine = new EvidenceSufficiencyService();
const governanceEngine = new ConfidenceGovernanceService();
const outputPolicyEngine = new OutputPolicyService();
const dcaEngine = new DefensibleCorrectiveActionService();
const hrlgEngine = new HumanReviewLearningGovernanceService();

type Expected = {
  eligibility?: string[];
  reviewPriority?: string[];
  requiresFocus?: string;
  blocksLearning?: boolean;
  needsMoreEvidence?: boolean;
  capturesExposure?: boolean;
  capturesJurisdiction?: boolean;
};

const cases: Array<{ id: string; text: string; expected: Expected }> = [
  {
    id: 'HRLG-001',
    text: 'MSHA mechanic is servicing a conveyor drive with the guard removed while the equipment is not locked out. Stored and rotating energy could start unexpectedly and employees are exposed.',
    expected: {
      eligibility: ['approved_candidate', 'review_required'],
      reviewPriority: ['critical', 'high'],
      requiresFocus: 'high-risk',
    },
  },
  {
    id: 'HRLG-002',
    text: 'Something looks dangerous here.',
    expected: {
      eligibility: ['blocked'],
      blocksLearning: true,
      needsMoreEvidence: true,
      requiresFocus: 'missing evidence',
    },
  },
  {
    id: 'HRLG-003',
    text: 'Unguarded moving conveyor tail pulley observed in the plant. Worker exposure, access, and proximity are not described.',
    expected: {
      eligibility: ['blocked', 'review_required'],
      capturesExposure: true,
      requiresFocus: 'exposure',
    },
  },
  {
    id: 'HRLG-004',
    text: 'Open floor hole with no cover or barricade near employees. Site jurisdiction is unknown.',
    expected: {
      eligibility: ['blocked'],
      capturesJurisdiction: true,
      requiresFocus: 'jurisdiction',
    },
  },
  {
    id: 'HRLG-005',
    text: 'Something is wrong with a machine but no task, worker exposure, equipment state, or location is described.',
    expected: {
      eligibility: ['blocked'],
      blocksLearning: true,
      needsMoreEvidence: true,
    },
  },
  {
    id: 'HRLG-006',
    text: 'OSHA general industry open floor hole is uncovered near employees, but no photos or supporting measurements are attached.',
    expected: {
      eligibility: ['review_required', 'blocked'],
      reviewPriority: ['medium', 'high', 'critical'],
      requiresFocus: 'learning eligibility',
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

    const calibrationMeta = {
      hazardFamily: observationUnderstanding.scenarioUnderstanding?.topScenario?.hazardFamily || 'unknown',
      scenarioFamily: observationUnderstanding.scenarioUnderstanding?.topScenario?.scenarioId || 'unknown',
      jurisdiction: observationUnderstanding.jurisdiction?.detected || 'unknown',
      mechanism: causalRiskReasoning.mechanismOfInjury,
      riskBand: causalRiskReasoning.confidence.level === 'high' ? 'high' : 'moderate',
      evidenceGaps: evidenceSufficiency.missingCriticalFacts,
    };

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
      calibrationMeta,
      fusedText: item.text,
    });

    const outputPolicy = await outputPolicyEngine.evaluateOutputPolicy(
      confidenceGovernance,
      evidenceSufficiency,
      causalRiskReasoning,
      observationUnderstanding,
      calibrationMeta,
      item.text
    );

    const dca = await dcaEngine.evaluateDCA(
      confidenceGovernance,
      evidenceSufficiency,
      causalRiskReasoning,
      observationUnderstanding,
      calibrationMeta,
      outputPolicy,
      item.text
    );

    const result = await hrlgEngine.evaluateHRLG(
      confidenceGovernance,
      evidenceSufficiency,
      causalRiskReasoning,
      dca,
      observationUnderstanding,
      calibrationMeta,
      outputPolicy
    );

    const errors: string[] = [];
    const expected = item.expected;

    if (!result.reviewRequired) {
      errors.push('human review should always be required');
    }

    if (expected.eligibility && !expected.eligibility.includes(result.learningEligibility.eligibilityLevel)) {
      errors.push(`eligibility expected one of ${expected.eligibility.join(', ')} got ${result.learningEligibility.eligibilityLevel}`);
    }

    if (expected.reviewPriority && !expected.reviewPriority.includes(result.reviewPriority)) {
      errors.push(`reviewPriority expected one of ${expected.reviewPriority.join(', ')} got ${result.reviewPriority}`);
    }

    if (expected.blocksLearning && result.learningEligibility.eligibleForLearningCandidate) {
      errors.push('learning candidate should be blocked');
    }

    if (expected.needsMoreEvidence && !result.reviewerDecisionOptions.needsMoreEvidence) {
      errors.push('needsMoreEvidence decision option should be true');
    }

    if (expected.capturesExposure && !result.correctionCapture.shouldCaptureCorrectedExposure) {
      errors.push('should capture corrected exposure');
    }

    if (expected.capturesJurisdiction && !result.correctionCapture.shouldCaptureCorrectedJurisdiction) {
      errors.push('should capture corrected jurisdiction');
    }

    if (expected.requiresFocus) {
      const haystack = [
        ...result.reviewFocusAreas,
        ...result.requiredReviewerConfirmations,
        ...result.learningEligibility.blockedReasons,
        ...result.auditTrailRequirements,
        ...result.governanceWarnings,
        ...result.decisionTrace,
      ].join(' ').toLowerCase();

      if (!haystack.includes(expected.requiresFocus)) {
        errors.push(`expected HRLG output to reference ${expected.requiresFocus}`);
      }
    }

    if (
      !result.advisoryGuardrails.advisoryOnly ||
      !result.advisoryGuardrails.doesNotDeclareViolation ||
      !result.advisoryGuardrails.doesNotCreateCitation ||
      !result.advisoryGuardrails.requiresQualifiedReview
    ) {
      errors.push('advisory guardrails were not preserved');
    }

    const allOutputText = JSON.stringify({
      ...result,
      advisoryGuardrails: undefined,
    }).toLowerCase();

    if (
      allOutputText.includes('automatically learn') ||
      allOutputText.includes('learn without review') ||
      allOutputText.includes('without reviewer approval') ||
      allOutputText.includes('write approved knowledge')
    ) {
      errors.push('HRLG output contains unsafe automatic-learning language');
    }

    if (errors.length) {
      failures += 1;
      console.error(`❌ ${item.id}`);
      for (const error of errors) console.error(`  - ${error}`);
      console.error(JSON.stringify(result, null, 2));
    } else {
      console.log(`✅ ${item.id}: ${result.learningEligibility.eligibilityLevel} / priority=${result.reviewPriority}`);
    }
  }

  if (failures > 0) {
    throw new Error(`${failures} human-review-learning-governance validation case(s) failed.`);
  }

  console.log('✅ SafeScope human review learning governance validation passed.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
