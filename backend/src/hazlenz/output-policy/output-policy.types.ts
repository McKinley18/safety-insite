export type LanguageStrength = 'strong' | 'moderate' | 'cautious' | 'questions_only';
export type ConfidenceLevel = 'high' | 'moderate' | 'low' | 'insufficient';

export interface AllowedOutputModes {
  canStateLikelyHazard: boolean;
  canStatePossibleHazard: boolean;
  canRecommendImmediateControls: boolean;
  canRecommendPermanentControls: boolean;
  canReferenceStandardFamily: boolean;
  canReferenceCitationCandidate: boolean;
  canGenerateExecutiveNarrative: boolean;
  canGenerateCorrectiveActionText: boolean;
  mustAskReviewerQuestionsFirst: boolean;
}

export interface NarrativePolicy {
  openingQualifier: string;
  conclusionBoundary: string;
  reviewInstruction: string;
}

export interface CorrectiveActionPolicy {
  allowedActionStrength: string;
  mustUseInterimControls: boolean;
  mustRequireVerification: boolean;
  mustAvoidViolationLanguage: boolean;
}

export interface StandardsPolicy {
  allowedStandardLanguage: 'none' | 'standard_family_only' | 'citation_candidate_with_review';
  mustAvoidCitationDeclaration: boolean;
  mustRequireApplicabilityReview: boolean;
}

export interface EvidencePolicy {
  missingEvidenceMustBeShown: boolean;
  reviewerQuestionsMustBeShown: boolean;
  confidenceDowngradeMustBeShown: boolean;
}

export interface AdvisoryGuardrails {
  advisoryOnly: boolean;
  doesNotDeclareViolation: boolean;
  doesNotCreateCitation: boolean;
  requiresQualifiedReview: boolean;
}

export interface OutputPolicyOutput {
  engine: string;
  version: string;
  allowedLanguageStrength: LanguageStrength;
  prohibitedPhrases: string[];
  requiredQualifiers: string[];
  allowedOutputModes: AllowedOutputModes;
  narrativePolicy: NarrativePolicy;
  correctiveActionPolicy: CorrectiveActionPolicy;
  standardsPolicy: StandardsPolicy;
  evidencePolicy: EvidencePolicy;
  decisionTrace: string[];
  advisoryGuardrails: AdvisoryGuardrails;
}
