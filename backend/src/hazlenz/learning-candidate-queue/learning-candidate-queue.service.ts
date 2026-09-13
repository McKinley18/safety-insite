import { Injectable } from '@nestjs/common';
import { LearningCandidate } from './learning-candidate-queue.types';

@Injectable()
export class LearningCandidateQueueService {
  
  createCandidate(correction: any, hrlgOutput: any): LearningCandidate {
    // Placeholder implementation for candidate creation.
    // Must gate against hrlgOutput eligibility.
    
    if (hrlgOutput.learningEligibility.eligibilityLevel === 'blocked') {
        return {
            candidateId: `cand-${Date.now()}`,
            reviewerCorrectionId: 'unknown',
            sourceContextId: 'unknown',
            status: 'blocked',
            eligibilityScore: 0,
            blockedReasons: ['HRLG blocked'],
            reviewerApprovalMetadata: { approvedBy: '', approvedAt: '', roleAccepted: false },
            advisoryGuardrails: { advisoryOnly: true, doesNotDeclareViolation: true, doesNotCreateCitation: true, requiresQualifiedReview: true }
        };
    }

    return {
      candidateId: `cand-${Date.now()}`,
      reviewerCorrectionId: 'corr-1',
      sourceContextId: 'snap-1',
      status: 'review_required',
      eligibilityScore: 0.8,
      blockedReasons: [],
      reviewerApprovalMetadata: { approvedBy: 'SafetyEngineer', approvedAt: '2026-06-06', roleAccepted: true },
      advisoryGuardrails: { advisoryOnly: true, doesNotDeclareViolation: true, doesNotCreateCitation: true, requiresQualifiedReview: true }
    };
  }
}
