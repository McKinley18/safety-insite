export interface RetrievalOutput {
  version: string;
  observationSummary: string;
  taxonomyRoute: any;
  approvedKnowledgeMatches: any[];
  draftKnowledgeWarnings: string[];
  applicabilityAssessment: string;
  confidence: number;
  evidenceGaps: string[];
  advisoryBoundaries: string[];
  recommendedReviewerActions: string[];
  fieldOutputNotes: string;
}
