import { LearningCandidate } from './learning-candidate.types';
import { ReviewerFeedbackRecord } from '../reviewer-feedback.types';

export class LearningCandidateService {
  createCandidate(feedback: ReviewerFeedbackRecord, proposedChange: string): LearningCandidate {
    return {
      candidateId: `cand-${Date.now()}`,
      sourceFeedbackId: feedback.id,
      affectedComponent: 'unknown',
      proposedChangeType: 'registry_addition',
      reviewerDisposition: 'promote',
      requiredValidationBeforePromotion: ['qualified_safety_expert_review'],
      promotionBlockedUntilQualifiedApproval: true,
      advisoryGuardrails: {
        advisoryOnly: true,
        doesNotDeclareViolation: true,
        requiresQualifiedReview: true,
        doesNotSelfModifyWithoutApproval: true
      },
      status: 'pending_review',
      createdAt: new Date().toISOString()
    };
  }
}
