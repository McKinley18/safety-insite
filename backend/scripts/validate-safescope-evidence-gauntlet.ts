import { SafeScopeNativeReasoningService } from '../src/safescope-v2/native-reasoning/native-reasoning.service';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const service = new SafeScopeNativeReasoningService();

const scenarios = [
  {
    name: 'Machine guarding missing energy state',
    input: {
      classification: 'Machine Guarding',
      observationText: 'Conveyor nip point is exposed near employee work area.',
      evidenceTexts: ['Photo shows exposed conveyor nip point near walkway.'],
      suggestedStandards: [{ citation: '30 CFR 56.14107(a)', rationale: 'Guard moving machine parts that could contact employees.' }],
      risk: { riskBand: 'High', requiresShutdown: true },
      aiEvidenceContract: {
        missingInputs: ['unknown worker access', 'unclear equipment state'],
        reviewTriggers: ['Energy-control status requires supervisor verification.'],
        canFinalizeWithoutHumanReview: false,
      },
    },
    expectedMissingAny: ['energy state', 'worker access', 'equipment'],
    shouldAllowClosure: false,
  },
  {
    name: 'Electrical exposure missing qualified review',
    input: {
      classification: 'Electrical',
      observationText: 'Electrical panel cover is open with exposed conductors in maintenance area.',
      evidenceTexts: ['Photo shows open panel cover and exposed conductors.'],
      suggestedStandards: [{ citation: '29 CFR 1910 Subpart S', rationale: 'Electrical equipment must be protected from worker contact.' }],
      risk: { riskBand: 'Critical', fatalityPotential: true },
      aiEvidenceContract: {
        missingInputs: ['energized state not verified'],
        reviewTriggers: ['Qualified electrical review required.'],
        canFinalizeWithoutHumanReview: false,
      },
    },
    expectedMissingAny: ['energized', 'qualified', 'energy'],
    shouldAllowClosure: false,
  },
  {
    name: 'Hazcom unlabeled container missing identity and SDS',
    input: {
      classification: 'Hazard Communication',
      observationText: 'Unlabeled secondary chemical container found near workbench.',
      evidenceTexts: ['Photo shows unlabeled bottle.'],
      suggestedStandards: [{ citation: '29 CFR 1910.1200', rationale: 'Chemical containers require hazard communication controls.' }],
      risk: { riskBand: 'Medium' },
      aiEvidenceContract: {
        missingInputs: ['chemical identity unknown', 'SDS not verified'],
        reviewTriggers: ['Unknown chemical identity requires review.'],
        canFinalizeWithoutHumanReview: false,
      },
    },
    expectedMissingAny: ['chemical', 'SDS', 'identity', 'label'],
    shouldAllowClosure: false,
  },
  {
    name: 'Low context unclassified case blocks closure',
    input: {
      classification: 'Unclassified',
      observationText: 'Unsafe condition observed.',
      evidenceTexts: [],
      suggestedStandards: [],
      risk: { riskBand: 'Unknown' },
      aiEvidenceContract: {
        missingInputs: ['task not described', 'employee exposure not described', 'controls not described'],
        reviewTriggers: ['Insufficient context.'],
        canFinalizeWithoutHumanReview: false,
      },
    },
    expectedMissingAny: ['task', 'exposure', 'controls', 'evidence'],
    shouldAllowClosure: false,
  },
];

async function main() {
  const results = [];

  for (const scenario of scenarios) {
    const result = service.evaluate(scenario.input as any);
    const evidence = result.evidenceSufficiency;

    assert(evidence, `${scenario.name}: evidenceSufficiency must be present`);
    assert(evidence.engine === 'safescope_evidence_sufficiency', `${scenario.name}: wrong evidence engine`);
    assert(evidence.mode === 'deterministic_offline', `${scenario.name}: evidence mode must be deterministic_offline`);

    assert(Array.isArray(evidence.missingCriticalEvidence), `${scenario.name}: missingCriticalEvidence must be array`);
    assert(Array.isArray(evidence.recommendedEvidenceToCapture), `${scenario.name}: recommendedEvidenceToCapture must be array`);
    assert(Array.isArray(evidence.evidenceWeaknesses), `${scenario.name}: evidenceWeaknesses must be array`);
    assert(Array.isArray(evidence.requiredHumanReviewReasons), `${scenario.name}: requiredHumanReviewReasons must be array`);

    const combinedMissing = [
      ...evidence.missingCriticalEvidence,
      ...evidence.recommendedEvidenceToCapture,
      ...evidence.evidenceWeaknesses,
      ...evidence.requiredHumanReviewReasons,
    ].join(' ').toLowerCase();

    assert(
      scenario.expectedMissingAny.some((term) => combinedMissing.includes(term.toLowerCase())),
      `${scenario.name}: expected missing evidence term not found. Expected one of ${scenario.expectedMissingAny.join(', ')}`,
    );

    assert(
      evidence.sufficientForClosure === scenario.shouldAllowClosure,
      `${scenario.name}: sufficientForClosure should be ${scenario.shouldAllowClosure}`,
    );

    assert(evidence.canInventEvidence === false, `${scenario.name}: evidence engine cannot invent evidence`);
    assert(evidence.canFinalizeWithoutEvidence === false, `${scenario.name}: evidence engine cannot finalize without evidence`);
    assert(evidence.canReduceHumanReview === false, `${scenario.name}: evidence engine cannot reduce human review`);

    results.push({
      scenario: scenario.name,
      sufficientForHazardRecognition: evidence.sufficientForHazardRecognition,
      sufficientForStandardsRecommendation: evidence.sufficientForStandardsRecommendation,
      sufficientForCorrectiveAction: evidence.sufficientForCorrectiveAction,
      sufficientForClosure: evidence.sufficientForClosure,
      missingCriticalEvidence: evidence.missingCriticalEvidence.length,
      recommendedEvidenceToCapture: evidence.recommendedEvidenceToCapture.length,
      requiredHumanReviewReasons: evidence.requiredHumanReviewReasons.length,
      confidenceImpact: evidence.confidenceImpact,
    });
  }

  console.log('✅ SafeScope evidence sufficiency gauntlet passed.');
  console.log(JSON.stringify(results, null, 2));
}

main().catch((error) => {
  console.error('❌ SafeScope evidence sufficiency gauntlet failed.');
  console.error(error);
  process.exit(1);
});
