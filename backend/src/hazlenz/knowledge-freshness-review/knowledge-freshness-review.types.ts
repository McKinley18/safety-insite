export type ReviewStatus = 'current' | 'review_due' | 'stale' | 'unknown_date';
export type ReviewPriority = 'low' | 'medium' | 'high' | 'critical';

export interface KnowledgeFreshnessOutput {
  reviewStatus: ReviewStatus;
  reviewPriority: ReviewPriority;
  reasons: string[];
  nextReviewDue: string;
  reviewerRequirements: string[];
  advisoryGuardrails: {
    advisoryOnly: boolean;
    doesNotDeclareViolation: boolean;
    doesNotCreateCitation: boolean;
    requiresQualifiedReview: boolean;
  };
}
