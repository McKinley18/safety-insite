export type ReviewPriority = 'critical' | 'high' | 'medium' | 'low';
export type EligibilityLevel = 'approved_candidate' | 'review_required' | 'blocked';

export interface ReviewerDecisionOptions {
  accept: boolean;
  acceptWithEdits: boolean;
  reject: boolean;
  needsMoreEvidence: boolean;
  escalate: boolean;
}

export interface CorrectionCapture {
  shouldCaptureCorrectedHazardFamily: boolean;
  shouldCaptureCorrectedMechanism: boolean;
  shouldCaptureCorrectedExposure: boolean;
  shouldCaptureCorrectedControls: boolean;
  shouldCaptureCorrectedJurisdiction: boolean;
  shouldCaptureCorrectedStandardFamily: boolean;
  shouldCaptureCorrectedCorrectiveActions: boolean;
}

export interface LearningEligibility {
  eligibleForLearningCandidate: boolean;
  eligibilityLevel: EligibilityLevel;
  blockedReasons: string[];
  requiredApprovals: string[];
}

export interface AdvisoryGuardrails {
  advisoryOnly: boolean;
  doesNotDeclareViolation: boolean;
  doesNotCreateCitation: boolean;
  requiresQualifiedReview: boolean;
}

export interface HumanReviewLearningGovernanceOutput {
  engine: string;
  version: string;
  reviewRequired: boolean;
  reviewPriority: ReviewPriority;
  reviewerDecisionOptions: ReviewerDecisionOptions;
  reviewFocusAreas: string[];
  requiredReviewerConfirmations: string[];
  correctionCapture: CorrectionCapture;
  learningEligibility: LearningEligibility;
  auditTrailRequirements: string[];
  governanceWarnings: string[];
  decisionTrace: string[];
  advisoryGuardrails: AdvisoryGuardrails;
}
