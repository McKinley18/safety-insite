import { ObservationUnderstandingService } from '../src/safescope-v2/understanding/observation-understanding.service';
import { CausalRiskService } from '../src/safescope-v2/causal-risk/causal-risk.service';
import { EvidenceSufficiencyService } from '../src/safescope-v2/evidence-sufficiency-core/evidence-sufficiency.service';
import { ConfidenceGovernanceService } from '../src/safescope-v2/confidence-governance/confidence-governance.service';
import { OutputPolicyService } from '../src/safescope-v2/output-policy/output-policy.service';
import { DefensibleCorrectiveActionService } from '../src/safescope-v2/defensible-corrective-action/dca.service';
import { HumanReviewLearningGovernanceService } from '../src/safescope-v2/human-review-learning-governance/hrlg.service';
import { SourceBackedApplicabilityGovernanceService } from '../src/safescope-v2/source-backed-applicability-governance/sbag.service';

const observationEngine = new ObservationUnderstandingService();
const causalEngine = new CausalRiskService();
const evidenceEngine = new EvidenceSufficiencyService();
const governanceEngine = new ConfidenceGovernanceService();
const outputPolicyEngine = new OutputPolicyService();
const dcaEngine = new DefensibleCorrectiveActionService();
const hrlgEngine = new HumanReviewLearningGovernanceService();
const sbagEngine = new SourceBackedApplicabilityGovernanceService();

type Expected = {
  canStandardFamily?: boolean;
  canCitationCandidate?: boolean;
  supportLevels?: string[];
  requiresJurisdictionConfirmation?: boolean;
  approvedKnowledge?: boolean;
  requiresSourceNeed?: string;
};

const cases: Array<{
  id: string;
  text: string;
  approvedKnowledge?: any;
  citationCandidates?: any[];
  expected: Expected;
}> = [
  {
    id: 'SBAG-001',
    text: 'MSHA mechanic is servicing a conveyor drive with the guard removed while the equipment is not locked out. Stored and rotating energy could start unexpectedly and employees are exposed.',
    expected: {
      canStandardFamily: true,
      canCitationCandidate: false,
      supportLevels: ['partially_supported', 'supported'],
      requiresJurisdictionConfirmation: false,
      approvedKnowledge: false,
      requiresSourceNeed: 'approved/source-backed knowledge',
    },
  },
  {
    id: 'SBAG-002',
    text: 'OSHA general industry employee is preparing to enter a tank with limited ventilation. No atmospheric test, attendant, permit, or rescue plan is documented.',
    expected: {
      canStandardFamily: true,
      canCitationCandidate: false,
      supportLevels: ['partially_supported', 'supported'],
      requiresJurisdictionConfirmation: false,
    },
  },
  {
    id: 'SBAG-003',
    text: 'Something looks dangerous here.',
    expected: {
      canStandardFamily: false,
      canCitationCandidate: false,
      supportLevels: ['unsupported'],
      requiresJurisdictionConfirmation: true,
    },
  },
  {
    id: 'SBAG-004',
    text: 'Open floor hole with no cover or barricade near employees. Site jurisdiction is unknown.',
    expected: {
      canStandardFamily: false,
      canCitationCandidate: false,
      supportLevels: ['weak', 'unsupported'],
      requiresJurisdictionConfirmation: true,
    },
  },
  {
    id: 'SBAG-005',
    text: 'Unguarded moving conveyor tail pulley observed in the plant. Worker exposure, access, and proximity are not described.',
    expected: {
      canCitationCandidate: false,
      supportLevels: ['weak', 'unsupported', 'partially_supported'],
    },
  },
  {
    id: 'SBAG-006',
    text: 'OSHA general industry open floor hole is uncovered near employees, but no photos or supporting measurements are attached.',
    expected: {
      canCitationCandidate: false,
      supportLevels: ['weak', 'partially_supported'],
      requiresSourceNeed: 'approved/source-backed knowledge',
    },
  },
  {
    id: 'SBAG-007',
    text: 'OSHA general industry open floor hole is uncovered near employees with photos showing employee access and missing cover.',
    approvedKnowledge: {
      records: [
        {
          citation: 'source-backed-candidate-placeholder',
          title: 'Walking-working surface opening protection source record',
          standardFamily: 'walking_working_surfaces_fall_protection',
        },
      ],
    },
    citationCandidates: [
      { citation: 'source-backed-candidate-placeholder', defensibilityScore: 0.9 },
    ],
    expected: {
      canStandardFamily: true,
      supportLevels: ['supported', 'partially_supported'],
      approvedKnowledge: true,
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
      mechanism: causalRiskReasoning.mechanismOfInjury || 'unknown',
      riskBand: causalRiskReasoning.confidence.level === 'high' ? 'high' : 'moderate',
      standardFamily:
        item.text.toLowerCase().includes('conveyor') || item.text.toLowerCase().includes('lockout') ? 'machine_guarding_energy_control' :
        item.text.toLowerCase().includes('confined') || item.text.toLowerCase().includes('tank') ? 'confined_space' :
        item.text.toLowerCase().includes('floor hole') || item.text.toLowerCase().includes('open edge') || item.text.toLowerCase().includes('fall') ? 'walking_working_surfaces_fall_protection' :
        'unknown',
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
        topDefensible: item.approvedKnowledge ? [{ defensibilityScore: 0.9 }] : [],
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

    await hrlgEngine.evaluateHRLG(
      confidenceGovernance,
      evidenceSufficiency,
      causalRiskReasoning,
      dca,
      observationUnderstanding,
      calibrationMeta,
      outputPolicy
    );

    const result = await sbagEngine.evaluateApplicability(
      confidenceGovernance,
      evidenceSufficiency,
      causalRiskReasoning,
      dca,
      observationUnderstanding,
      calibrationMeta,
      outputPolicy,
      item.text,
      [],
      item.citationCandidates || [],
      item.approvedKnowledge
    );

    const errors: string[] = [];
    const expected = item.expected;

    if (expected.canStandardFamily !== undefined && result.standardFamilySupport.canDiscussStandardFamily !== expected.canStandardFamily) {
      errors.push(`standard-family support expected ${expected.canStandardFamily} got ${result.standardFamilySupport.canDiscussStandardFamily}`);
    }

    if (expected.canCitationCandidate !== undefined && result.citationCandidateSupport.canDiscussCitationCandidate !== expected.canCitationCandidate) {
      errors.push(`citation-candidate support expected ${expected.canCitationCandidate} got ${result.citationCandidateSupport.canDiscussCitationCandidate}`);
    }

    if (expected.supportLevels && !expected.supportLevels.includes(result.applicabilitySupportLevel)) {
      errors.push(`support level expected one of ${expected.supportLevels.join(', ')} got ${result.applicabilitySupportLevel}`);
    }

    if (
      expected.requiresJurisdictionConfirmation !== undefined &&
      result.jurisdictionSupport.requiresJurisdictionConfirmation !== expected.requiresJurisdictionConfirmation
    ) {
      errors.push(`jurisdiction confirmation expected ${expected.requiresJurisdictionConfirmation} got ${result.jurisdictionSupport.requiresJurisdictionConfirmation}`);
    }

    if (
      expected.approvedKnowledge !== undefined &&
      result.sourceSupport.approvedKnowledgeAvailable !== expected.approvedKnowledge
    ) {
      errors.push(`approved knowledge availability expected ${expected.approvedKnowledge} got ${result.sourceSupport.approvedKnowledgeAvailable}`);
    }

    if (expected.requiresSourceNeed) {
      const haystack = [
        ...result.sourceSupport.missingSourceNeeds,
        ...result.applicabilityLimits,
        ...result.requiredReviewerConfirmations,
        ...result.citationCandidateSupport.blockedReasons,
      ].join(' ').toLowerCase();

      if (!haystack.includes(expected.requiresSourceNeed.toLowerCase())) {
        errors.push(`expected source/applicability output to mention ${expected.requiresSourceNeed}`);
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

    const policySafeOutput = {
      ...result,
      advisoryGuardrails: undefined,
      applicabilityLimits: result.applicabilityLimits.filter(limit => !limit.toLowerCase().includes('violation') && !limit.toLowerCase().includes('citation')),
      requiredReviewerConfirmations: result.requiredReviewerConfirmations.filter(item => !item.toLowerCase().includes('violation') && !item.toLowerCase().includes('citation')),
    };

    const allOutputText = JSON.stringify(policySafeOutput).toLowerCase();
    if (
      allOutputText.includes('declares violation') ||
      allOutputText.includes('creates citation') ||
      allOutputText.includes('is a violation') ||
      allOutputText.includes('will be cited') ||
      allOutputText.includes('citation issued') ||
      allOutputText.includes('violation exists')
    ) {
      errors.push('SBAG output used prohibited violation/citation declaration language');
    }

    if (errors.length) {
      failures += 1;
      console.error(`❌ ${item.id}`);
      for (const error of errors) console.error(`  - ${error}`);
      console.error(JSON.stringify(result, null, 2));
    } else {
      console.log(`✅ ${item.id}: ${result.applicabilitySupportLevel} / standardFamily=${result.standardFamilySupport.canDiscussStandardFamily} / citation=${result.citationCandidateSupport.canDiscussCitationCandidate}`);
    }
  }

  if (failures > 0) {
    throw new Error(`${failures} source-backed-applicability-governance validation case(s) failed.`);
  }

  console.log('✅ SafeScope source-backed applicability governance validation passed.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
