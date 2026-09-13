export interface ApplicabilityRetrievalResult {
  retrievalDecision: 'no_retrieval' | 'draft_context_only' | 'approved_context_available' | 'blocked';
  matchedRecords: string[];
  draftRecords: string[];
  approvedRecords: string[];
  requiredReviewerConfirmations: string[];
  evidenceQuestions: string[];
  applicabilityWarnings: string[];
  advisoryGuardrails: {
    advisoryOnly: boolean;
    doesNotDeclareViolation: boolean;
    doesNotCreateCitation: boolean;
    requiresQualifiedReview: boolean;
  };
}
