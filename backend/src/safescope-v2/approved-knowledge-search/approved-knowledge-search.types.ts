export interface SearchResult {
  recordId: string;
  status: 'approved' | 'draft_candidate' | 'retired' | 'rejected';
  sourceUsability: 'approved_only' | 'draft_review_required' | 'not_usable';
  matchReasons: string[];
  reviewerWarning: string[];
  advisoryGuardrails: {
    advisoryOnly: boolean;
    doesNotDeclareViolation: boolean;
    doesNotCreateCitation: boolean;
    requiresQualifiedReview: boolean;
  };
}
