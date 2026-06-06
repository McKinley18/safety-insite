import { ObservationUnderstandingService } from '../src/safescope-v2/understanding/observation-understanding.service';
import { CausalRiskService } from '../src/safescope-v2/causal-risk/causal-risk.service';
import { EvidenceSufficiencyService } from '../src/safescope-v2/evidence-sufficiency-core/evidence-sufficiency.service';
import { ConfidenceGovernanceService } from '../src/safescope-v2/confidence-governance/confidence-governance.service';
import { OutputPolicyService } from '../src/safescope-v2/output-policy/output-policy.service';
import { DefensibleCorrectiveActionService } from '../src/safescope-v2/defensible-corrective-action/dca.service';

const observationEngine = new ObservationUnderstandingService();
const causalEngine = new CausalRiskService();
const evidenceEngine = new EvidenceSufficiencyService();
const governanceEngine = new ConfidenceGovernanceService();
const outputPolicyEngine = new OutputPolicyService();
const dcaEngine = new DefensibleCorrectiveActionService();

type Expected = {
  strength?: string[];
  immediate?: boolean;
  interim?: boolean;
  permanent?: boolean;
  verification?: boolean;
  mechanism?: string;
  controlToken?: string;
  reviewerToken?: string;
  blocked?: boolean;
  noProhibitedLanguage?: boolean;
};

const cases: Array<{ id: string; text: string; expected: Expected }> = [
  {
    id: 'DCA-001',
    text: 'MSHA mechanic is servicing a conveyor drive with the guard removed while the equipment is not locked out. Stored and rotating energy could start unexpectedly and employees are exposed.',
    expected: {
      strength: ['strong', 'moderate'],
      immediate: true,
      interim: true,
      permanent: true,
      verification: true,
      mechanism: 'unexpected_startup',
      controlToken: 'energy',
      noProhibitedLanguage: true,
    },
  },
  {
    id: 'DCA-002',
    text: 'OSHA general industry open floor hole with no cover or barricade near employees. Fall exposure is present.',
    expected: {
      strength: ['strong', 'moderate', 'cautious'],
      immediate: true,
      interim: true,
      verification: true,
      mechanism: 'fall_from_height',
      controlToken: 'cover',
      noProhibitedLanguage: true,
    },
  },
  {
    id: 'DCA-003',
    text: 'OSHA general industry employee is preparing to enter a tank with limited ventilation. No atmospheric test, attendant, permit, or rescue plan is documented.',
    expected: {
      strength: ['strong', 'moderate', 'cautious'],
      immediate: true,
      interim: true,
      verification: true,
      mechanism: 'atmospheric_hazard_engulfment_or_entrapment',
      controlToken: 'atmospheric',
      noProhibitedLanguage: true,
    },
  },
  {
    id: 'DCA-004',
    text: 'Something looks dangerous here.',
    expected: {
      strength: ['questions_only'],
      immediate: false,
      permanent: false,
      blocked: true,
      reviewerToken: 'hazard',
      noProhibitedLanguage: true,
    },
  },
  {
    id: 'DCA-005',
    text: 'Unguarded moving conveyor tail pulley observed in the plant. Worker exposure, access, and proximity are not described.',
    expected: {
      strength: ['cautious', 'questions_only'],
      reviewerToken: 'exposure',
      blocked: true,
      noProhibitedLanguage: true,
    },
  },
  {
    id: 'DCA-006',
    text: 'Open floor hole with no cover or barricade near employees. Site jurisdiction is unknown.',
    expected: {
      strength: ['cautious', 'moderate', 'questions_only'],
      reviewerToken: 'jurisdiction',
      noProhibitedLanguage: true,
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
      riskBand: causalRiskReasoning.confidence.level === 'high' ? 'high' : 'moderate',
      mechanism: causalRiskReasoning.mechanismOfInjury,
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

    const result = await dcaEngine.evaluateDCA(
      confidenceGovernance,
      evidenceSufficiency,
      causalRiskReasoning,
      observationUnderstanding,
      calibrationMeta,
      outputPolicy,
      item.text
    );

    const errors: string[] = [];
    const expected = item.expected;

    if (expected.strength && !expected.strength.includes(result.actionStrength)) {
      errors.push(`actionStrength expected one of ${expected.strength.join(', ')} got ${result.actionStrength}`);
    }

    if (expected.immediate !== undefined && (result.immediateActions.length > 0) !== expected.immediate) {
      errors.push(`immediate actions expected ${expected.immediate} got ${result.immediateActions.length}`);
    }

    if (expected.interim !== undefined && (result.interimControls.length > 0) !== expected.interim) {
      errors.push(`interim controls expected ${expected.interim} got ${result.interimControls.length}`);
    }

    if (expected.permanent !== undefined && (result.permanentCorrectiveActions.length > 0) !== expected.permanent) {
      errors.push(`permanent actions expected ${expected.permanent} got ${result.permanentCorrectiveActions.length}`);
    }

    if (expected.verification !== undefined && (result.verificationActions.length > 0) !== expected.verification) {
      errors.push(`verification actions expected ${expected.verification} got ${result.verificationActions.length}`);
    }

    const allActionText = [
      ...result.immediateActions,
      ...result.interimControls,
      ...result.permanentCorrectiveActions,
      ...result.verificationActions,
    ].map(action => [
      action.title,
      action.description,
      action.tiedMechanism,
      action.tiedFailedControl,
      action.tiedExposure,
      action.verificationMethod,
    ].join(' ')).join(' ').toLowerCase();

    const policySafeOutput = {
      ...result,
      advisoryGuardrails: undefined,
    };
    const allOutputText = JSON.stringify(policySafeOutput).toLowerCase();

    if (expected.mechanism && !allActionText.includes(expected.mechanism)) {
      errors.push(`expected actions tied to mechanism ${expected.mechanism}`);
    }

    if (expected.controlToken && !allActionText.includes(expected.controlToken)) {
      errors.push(`expected actions tied to control token ${expected.controlToken}`);
    }

    if (expected.reviewerToken) {
      const reviewText = [
        ...result.reviewerQuestions,
        ...result.assignedReviewNeeds,
        ...result.blockedActions,
        ...result.missingEvidenceBeforeFinalAction,
      ].join(' ').toLowerCase();

      if (!reviewText.includes(expected.reviewerToken)) {
        errors.push(`expected reviewer/blocking language to mention ${expected.reviewerToken}`);
      }
    }

    if (expected.blocked !== undefined && (result.blockedActions.length > 0) !== expected.blocked) {
      errors.push(`blocked actions expected ${expected.blocked} got ${result.blockedActions.length}`);
    }

    if (
      expected.noProhibitedLanguage &&
      ['violation', 'citation', 'cited', 'non-compliant', 'noncompliant', 'regulatory violation'].some(term => allOutputText.includes(term))
    ) {
      errors.push('DCA output used prohibited violation/citation/compliance language');
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
      console.log(`✅ ${item.id}: ${result.actionStrength} / immediate=${result.immediateActions.length} / permanent=${result.permanentCorrectiveActions.length}`);
    }
  }

  if (failures > 0) {
    throw new Error(`${failures} defensible-corrective-action validation case(s) failed.`);
  }

  console.log('✅ SafeScope defensible corrective action validation passed.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
