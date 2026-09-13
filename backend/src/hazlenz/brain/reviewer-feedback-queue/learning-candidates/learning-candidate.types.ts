import { ReviewerFeedbackRecord } from '../reviewer-feedback.types';

export type LearningCandidateStatus = 'pending_review' | 'approved' | 'rejected' | 'applied';

export type LearningCandidate = {
  candidateId: string;
  sourceFeedbackId: string;
  affectedComponent: string;
  proposedChangeType: 'registry_addition' | 'precedence_override' | 'evidence_gate_adjustment';
  reviewerDisposition: 'promote' | 'reject';
  requiredValidationBeforePromotion: string[];
  promotionBlockedUntilQualifiedApproval: boolean;
  advisoryGuardrails: {
    advisoryOnly: boolean;
    doesNotDeclareViolation: boolean;
    requiresQualifiedReview: boolean;
    doesNotSelfModifyWithoutApproval: boolean;
  };
  status: LearningCandidateStatus;
  createdAt: string;
};
