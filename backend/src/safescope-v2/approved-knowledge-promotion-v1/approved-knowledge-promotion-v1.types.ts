export type PromotionDecision = 'approved' | 'rejected' | 'hold_for_review';

export interface PromotionMetadata {
  approvedBy: string;
  approvedAt: string;
  reviewerRole: string;
  changeReason: string;
  sourceVerified: boolean;
  applicabilityVerified: boolean;
  guardrailsVerified: boolean;
  duplicateReviewCompleted: boolean;
}

export interface PromotionResult {
  decision: PromotionDecision;
  reasons: string[];
  missingFields: string[];
  approvedRecordCandidate?: any;
}
