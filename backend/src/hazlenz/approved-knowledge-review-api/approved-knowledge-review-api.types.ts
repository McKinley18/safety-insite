export type PromotionDecision = 'approved' | 'rejected' | 'hold_for_review';

export interface ReviewMetadata {
  approvedBy: string;
  approvedAt: string;
  reviewerRole: string;
  changeReason: string;
  sourceVerified: boolean;
  applicabilityVerified: boolean;
  guardrailsVerified: boolean;
  duplicateReviewCompleted: boolean;
}

export interface ReviewDecision {
  decisionId: string;
  candidateRecordId: string;
  candidatePackId: string;
  decision: PromotionDecision;
  reviewer: string;
  reviewedAt: string;
  rationale: string;
  sourceVerificationStatus: string;
  duplicateReviewStatus: string;
  governanceAcknowledgement: boolean;
  promotionEligible: boolean;
  promotionBlockedReasons: string[];
}
