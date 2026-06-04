import { ReviewerFeedbackRecord, FeedbackType } from './reviewer-feedback.types';
import { SafeScopeNormalizedObservationContext } from '../observation-context/observation-context.types';

// In-memory queue storage for now
const feedbackQueue: ReviewerFeedbackRecord[] = [];

export class ReviewerFeedbackQueueService {
  createFeedback(
    sourceObservationId: string,
    rawObservation: string,
    context: SafeScopeNormalizedObservationContext,
    reviewerRole: string,
    feedbackType: FeedbackType,
    notes: string
  ): ReviewerFeedbackRecord {
    const feedback: ReviewerFeedbackRecord = {
      id: `feedback-${Date.now()}`,
      createdAt: new Date().toISOString(),
      reviewerRole,
      sourceObservationId,
      rawObservation,
      normalizedContextSnapshot: context,
      feedbackType,
      feedbackSeverity: this.classifySeverity(feedbackType),
      reviewerNotes: notes,
      recommendedDisposition: 'pending_review',
      status: 'pending_review',
      advisoryGuardrails: {
        advisoryOnly: true,
        doesNotDeclareViolation: true,
        requiresQualifiedReview: true,
        doesNotSelfModifyWithoutApproval: true
      }
    };
    
    feedbackQueue.push(feedback);
    return feedback;
  }

  private classifySeverity(type: FeedbackType): 'low' | 'moderate' | 'high' | 'critical' {
    if (type === 'unsafe_or_misleading') return 'critical';
    if (type === 'incorrect') return 'high';
    if (type === 'missing') return 'moderate';
    return 'low';
  }

  getPendingFeedback(): ReviewerFeedbackRecord[] {
    return feedbackQueue.filter(f => f.status === 'pending_review');
  }
}
