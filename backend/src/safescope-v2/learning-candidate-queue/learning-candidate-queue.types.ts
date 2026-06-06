export type CandidateStatus = 'blocked' | 'review_required' | 'draft_candidate';

export interface LearningCandidate {
  candidateId: string;
  reviewerCorrectionId: string;
  sourceContextId: string;
  status: CandidateStatus;
  eligibilityScore: number;
  blockedReasons: string[];
  reviewerApprovalMetadata: {
    approvedBy: string;
    approvedAt: string;
    roleAccepted: boolean;
  };
  advisoryGuardrails: {
    advisoryOnly: boolean;
    doesNotDeclareViolation: boolean;
    doesNotCreateCitation: boolean;
    requiresQualifiedReview: boolean;
  };
}
