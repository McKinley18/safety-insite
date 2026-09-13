import { Injectable } from '@nestjs/common';
import { OutputPolicyOutput, LanguageStrength } from './output-policy.types';

type ConfidenceLevel = 'high' | 'moderate' | 'low' | 'insufficient';

@Injectable()
export class OutputPolicyService {
  private readonly engineVersion = '0.1.0';

  async evaluateOutputPolicy(
    confidenceGovernance: any,
    evidenceSufficiency: any,
    causalRiskReasoning: any,
    observationUnderstanding: any,
    calibrationMeta: any,
    fusedText: string
  ): Promise<OutputPolicyOutput> {
    const text = String(fusedText || '').toLowerCase();
    const finalConfidence = this.normalizeConfidence(confidenceGovernance?.finalConfidenceLevel);
    const maxConfidence = this.normalizeConfidence(confidenceGovernance?.maximumSupportedConfidence);
    const sufficiencyLevel = String(evidenceSufficiency?.sufficiencyLevel || 'insufficient');

    const permissions = confidenceGovernance?.outputPermissions || {};
    const gaps = [
      ...(Array.isArray(confidenceGovernance?.blockingEvidenceGaps) ? confidenceGovernance.blockingEvidenceGaps : []),
      ...(Array.isArray(evidenceSufficiency?.missingCriticalFacts) ? evidenceSufficiency.missingCriticalFacts : []),
      ...(Array.isArray(calibrationMeta?.evidenceGaps) ? calibrationMeta.evidenceGaps : []),
    ].map(String);

    const gapText = gaps.join(' ').toLowerCase();

    const jurisdictionWeak =
      gapText.includes('jurisdiction') ||
      Number(evidenceSufficiency?.factScores?.jurisdictionClarity ?? 1) < 0.6;

    const exposureWeak =
      gapText.includes('exposure') ||
      Number(evidenceSufficiency?.factScores?.exposureClarity ?? 1) < 0.6 ||
      text.includes('exposure, access, and proximity are not described');

    const supportWeak =
      gapText.includes('supporting evidence') ||
      Number(evidenceSufficiency?.factScores?.evidenceSupport ?? 1) < 0.45;

    let allowedLanguageStrength: LanguageStrength = 'questions_only';

    if (
      maxConfidence === 'high' &&
      sufficiencyLevel === 'sufficient' &&
      permissions.canSupportStrongRecommendation === true &&
      !exposureWeak
    ) {
      allowedLanguageStrength = 'strong';
    } else if (
      ['high', 'moderate'].includes(maxConfidence) &&
      ['sufficient', 'partially_sufficient'].includes(sufficiencyLevel) &&
      permissions.canSupportCorrectiveAction === true
    ) {
      allowedLanguageStrength = 'moderate';
    } else if (
      maxConfidence === 'low' ||
      sufficiencyLevel === 'weak' ||
      permissions.canSupportReportNarrative === true
    ) {
      allowedLanguageStrength = 'cautious';
    }

    if (finalConfidence === 'insufficient' || sufficiencyLevel === 'insufficient') {
      allowedLanguageStrength = 'questions_only';
    }

    const mustAskReviewerQuestionsFirst =
      allowedLanguageStrength === 'questions_only' ||
      exposureWeak ||
      jurisdictionWeak ||
      supportWeak ||
      finalConfidence === 'low' ||
      finalConfidence === 'insufficient';

    const canStateLikelyHazard =
      ['strong', 'moderate'].includes(allowedLanguageStrength) &&
      !exposureWeak;

    const canStatePossibleHazard =
      allowedLanguageStrength !== 'questions_only';

    const canRecommendImmediateControls =
      permissions.canSupportCorrectiveAction === true &&
      allowedLanguageStrength !== 'questions_only';

    const canRecommendPermanentControls =
      permissions.canSupportCorrectiveAction === true &&
      ['strong', 'moderate'].includes(allowedLanguageStrength) &&
      !supportWeak;

    const canReferenceStandardFamily =
      permissions.canSupportStandardFamilySuggestion === true &&
      !jurisdictionWeak &&
      ['strong', 'moderate'].includes(allowedLanguageStrength);

    const canReferenceCitationCandidate =
      permissions.canSupportCitationCandidate === true &&
      !jurisdictionWeak &&
      !supportWeak &&
      allowedLanguageStrength === 'strong';

    const canGenerateExecutiveNarrative =
      permissions.canSupportReportNarrative === true &&
      allowedLanguageStrength !== 'questions_only';

    const canGenerateCorrectiveActionText =
      permissions.canSupportCorrectiveAction === true &&
      allowedLanguageStrength !== 'questions_only';

    const requiredQualifiers = Array.from(new Set([
      'Advisory only',
      'Requires qualified human review',
      jurisdictionWeak ? 'Jurisdiction/applicability must be confirmed before relying on standards language' : '',
      exposureWeak ? 'Worker exposure and proximity must be confirmed' : '',
      supportWeak ? 'Supporting evidence should be verified' : '',
    ].filter(Boolean)));

    return {
      engine: 'safescope_output_policy_governor',
      version: this.engineVersion,
      allowedLanguageStrength,
      prohibitedPhrases: [
        'violation',
        'violated',
        'citation',
        'cited',
        'non-compliant',
        'noncompliant',
        'will be cited',
        'is illegal',
      ],
      requiredQualifiers,
      allowedOutputModes: {
        canStateLikelyHazard,
        canStatePossibleHazard,
        canRecommendImmediateControls,
        canRecommendPermanentControls,
        canReferenceStandardFamily,
        canReferenceCitationCandidate,
        canGenerateExecutiveNarrative,
        canGenerateCorrectiveActionText,
        mustAskReviewerQuestionsFirst,
      },
      narrativePolicy: {
        openingQualifier: this.openingQualifier(allowedLanguageStrength),
        conclusionBoundary: 'HazLenz AI provides advisory safety reasoning only and does not declare violations or create citations.',
        reviewInstruction: 'A qualified reviewer must confirm facts, jurisdiction, applicability, and corrective-action adequacy before final reliance.',
      },
      correctiveActionPolicy: {
        allowedActionStrength: this.actionStrength(allowedLanguageStrength),
        mustUseInterimControls: allowedLanguageStrength !== 'questions_only',
        mustRequireVerification: true,
        mustAvoidViolationLanguage: true,
      },
      standardsPolicy: {
        allowedStandardLanguage: canReferenceCitationCandidate
          ? 'citation_candidate_with_review'
          : canReferenceStandardFamily
            ? 'standard_family_only'
            : 'none',
        mustAvoidCitationDeclaration: true,
        mustRequireApplicabilityReview: true,
      },
      evidencePolicy: {
        missingEvidenceMustBeShown: gaps.length > 0 || mustAskReviewerQuestionsFirst,
        reviewerQuestionsMustBeShown: mustAskReviewerQuestionsFirst,
        confidenceDowngradeMustBeShown:
          Array.isArray(confidenceGovernance?.downgradeReasons) &&
          confidenceGovernance.downgradeReasons.length > 0,
      },
      decisionTrace: [
        'Evaluated output policy after confidence governance.',
        `Confidence governance maximum supported confidence: ${maxConfidence}.`,
        `Evidence sufficiency level: ${sufficiencyLevel}.`,
        `Selected language strength: ${allowedLanguageStrength}.`,
        canReferenceCitationCandidate
          ? 'Citation-candidate language is allowed only as reviewed candidate language.'
          : 'Citation-candidate language is blocked or limited.',
        'Violation/citation declaration language remains prohibited.',
        'Preserved advisory-only boundary and qualified-review requirement.',
      ],
      advisoryGuardrails: {
        advisoryOnly: true,
        doesNotDeclareViolation: true,
        doesNotCreateCitation: true,
        requiresQualifiedReview: true,
      },
    };
  }

  private normalizeConfidence(level: unknown): ConfidenceLevel {
    return level === 'high' || level === 'moderate' || level === 'low' || level === 'insufficient'
      ? level
      : 'insufficient';
  }

  private openingQualifier(strength: LanguageStrength): string {
    if (strength === 'strong') return 'Based on the available evidence, HazLenz AI can provide a strong advisory safety recommendation.';
    if (strength === 'moderate') return 'Based on the available evidence, HazLenz AI can provide a moderate advisory safety recommendation with review required.';
    if (strength === 'cautious') return 'Evidence supports cautious advisory discussion, but key facts should be confirmed.';
    return 'Information is insufficient for strong conclusions; reviewer questions should be addressed first.';
  }

  private actionStrength(strength: LanguageStrength): string {
    if (strength === 'strong') return 'strong_advisory';
    if (strength === 'moderate') return 'moderate_advisory';
    if (strength === 'cautious') return 'cautious_interim_only';
    return 'none';
  }
}
