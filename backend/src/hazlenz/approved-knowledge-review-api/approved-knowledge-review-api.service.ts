import { Injectable } from '@nestjs/common';
import { ReviewDecision, ReviewMetadata, PromotionDecision } from './approved-knowledge-review-api.types';
import { ApprovedKnowledgeRegistryValidator } from '../approved-knowledge-registry/approved-knowledge-registry.validator';
import { ApprovedKnowledgeRecord } from '../approved-knowledge-registry/approved-knowledge-record.types';

@Injectable()
export class ApprovedKnowledgeReviewApiService {
  
  async createDecision(
    candidate: ApprovedKnowledgeRecord,
    metadata: ReviewMetadata,
    decision: PromotionDecision
  ): Promise<ReviewDecision> {
    
    // Placeholder implementation for review decision.
    const errors = ApprovedKnowledgeRegistryValidator.validate(candidate);
    
    const promotionEligible = errors.length === 0 && decision === 'approved';

    return {
      decisionId: `dec-${Date.now()}`,
      candidateRecordId: candidate.recordId,
      candidatePackId: 'unknown',
      decision,
      reviewer: metadata.approvedBy,
      reviewedAt: metadata.approvedAt,
      rationale: metadata.changeReason,
      sourceVerificationStatus: metadata.sourceVerified ? 'verified' : 'pending',
      duplicateReviewStatus: metadata.duplicateReviewCompleted ? 'completed' : 'pending',
      governanceAcknowledgement: metadata.guardrailsVerified,
      promotionEligible,
      promotionBlockedReasons: errors,
    };
  }
}
