export type ReviewWorkflowState = 'draft_candidate' | 'reviewer_assigned' | 'needs_more_source_support' | 'needs_mapping_revision' | 'approved_for_write_guard' | 'rejected' | 'retired';

export interface WorkflowTransition {
  fromState: ReviewWorkflowState;
  toState: ReviewWorkflowState;
  reviewerId: string;
  reviewerRole: string;
  reviewedAt: string;
  changeReason: string;
}

export interface ReviewWorkflowStateMetadata {
  currentState: ReviewWorkflowState;
  transitions: WorkflowTransition[];
  advisoryGuardrails: {
    advisoryOnly: boolean;
    doesNotDeclareViolation: boolean;
    doesNotCreateCitation: boolean;
    requiresQualifiedReview: boolean;
  };
}
