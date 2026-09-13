export interface FieldOutputV1 {
  version: 'v1';
  observationSummary: string;
  primaryDomain: string;
  confidence: number;
  fieldAssessment: string;
  whyItMatters: string;
  likelyMechanisms: string[];
  immediateActions: string[];
  durableCorrectiveActions: string[];
  evidenceGaps: string[];
  supervisorQuestions: string[];
  approvedKnowledgeReferences: any[];
  draftKnowledgeWarnings: string[];
  advisoryBoundaries: string[];
  reviewerRequired: boolean;
  cannotDeclareViolation: boolean;
  cannotCreateCitation: boolean;
}
