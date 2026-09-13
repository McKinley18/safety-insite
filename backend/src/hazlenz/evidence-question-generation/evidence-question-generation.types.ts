export interface EvidenceQuestionOutput {
  evidenceQuestions: string[];
  priorityQuestions: string[];
  reviewerOnlyQuestions: string[];
  missingFacts: string[];
  questionSourceTrace: string[];
  advisoryGuardrails: {
    advisoryOnly: boolean;
    doesNotDeclareViolation: boolean;
    doesNotCreateCitation: boolean;
    requiresQualifiedReview: boolean;
  };
}
