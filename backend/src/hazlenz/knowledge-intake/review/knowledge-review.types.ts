import { KnowledgeRecord, ReviewStatus } from '../knowledge-intake.types';

export type KnowledgeReviewDecision = 'mark_pending_review' | 'reject' | 'approve_by_human';

export type KnowledgeReviewerRole =
  | 'safety_professional'
  | 'industrial_hygienist'
  | 'compliance_manager'
  | 'system_admin';

export type KnowledgeReviewRequest = {
  reviewerId: string;
  reviewerRole: KnowledgeReviewerRole;
  decision: KnowledgeReviewDecision;
  rationale: string;
  reviewedAt: string;
};

export type KnowledgeReviewResult = {
  record: KnowledgeRecord;
  previousStatus: ReviewStatus;
  newStatus: ReviewStatus;
  approvedForUse: boolean;
  reviewerId: string;
  reviewerRole: KnowledgeReviewerRole;
  reviewedAt: string;
  rationale: string;
  sourceBoundary: string;
};
