import { EvidenceWeightingResult } from '../field-evidence-weighting/field-evidence-weighting.types';

export interface RetrievalOutput {
  version: string;
  observationSummary: string;
  taxonomyRoute: any;
  approvedKnowledgeMatches: any[];
  scenarioMatches: any[];
  evaluatedScenarios: any[];
  topScenario?: any;
  evidenceWeighting: EvidenceWeightingResult;
  draftKnowledgeWarnings: string[];
  applicabilityAssessment: string;
  confidence: number;
  evidenceGaps: string[];
  advisoryBoundaries: string[];
  recommendedReviewerActions: string[];
  fieldOutputNotes: string;
}
