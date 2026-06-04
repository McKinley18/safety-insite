export type SafeScopeDecisionConfidenceLevel =
  | 'high'
  | 'moderate'
  | 'low'
  | 'hold';

export type SafeScopeDecisionDisposition =
  | 'proceed_with_advisory_output'
  | 'proceed_with_human_review'
  | 'hold_for_critical_evidence';

export type SafeScopeDecisionConfidenceInput = {
  nativePrimaryCitation?: string;
  brainLikelyCitation?: string;
  nativeMechanism?: string;
  brainLikelyMechanism?: string;
  scenarioConfidence?: 'low' | 'moderate' | 'high';
  scenarioHumanReviewRecommended?: boolean;
  evidenceGapHighestSeverity?: 'low' | 'medium' | 'high' | 'critical';
  evidenceGapDisposition?:
    | 'proceed_with_advisory_context'
    | 'proceed_with_human_review'
    | 'hold_for_critical_evidence';
  criticalEvidenceQuestionCount?: number;
  likelyControlCount?: number;
  regulatoryMatchCount?: number;
  mechanismMatchCount?: number;
  evidenceMatchCount?: number;
  controlMatchCount?: number;
};

export type SafeScopeDecisionConfidenceResult = {
  engine: 'safescope_decision_confidence_v1';
  mode: 'read_only_defensibility_assessment';
  input: SafeScopeDecisionConfidenceInput;
  confidenceLevel: SafeScopeDecisionConfidenceLevel;
  defensibilityScore: number;
  recommendedDisposition: SafeScopeDecisionDisposition;
  reasonCodes: string[];
  warnings: string[];
  boundary: {
    readOnly: true;
    advisoryOnly: true;
    canDeclareViolation: false;
    canCreateCitation: false;
    canOverrideRegulation: false;
    canBypassHumanReview: false;
  };
};
