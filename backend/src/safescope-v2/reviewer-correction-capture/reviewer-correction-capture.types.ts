export type ReviewerDecision = 'accept' | 'accept_with_edits' | 'reject' | 'needs_more_evidence' | 'escalate';

export interface ReviewerCorrection {
  originalSafeScopeSnapshotId: string;
  reviewerDecision: ReviewerDecision;
  correctedHazardFamily?: string;
  correctedMechanism?: string;
  correctedExposure?: string;
  correctedControls?: string[];
  correctedJurisdiction?: string;
  correctedStandardFamily?: string;
  correctedCorrectiveActions?: string[];
  reviewerId: string;
  reviewerRole: string;
  reviewedAt: string;
  changeReason?: string;
  learningCandidateRecommended: boolean;
  advisoryGuardrails: {
    advisoryOnly: boolean;
    doesNotDeclareViolation: boolean;
    doesNotCreateCitation: boolean;
    requiresQualifiedReview: boolean;
  };
}
