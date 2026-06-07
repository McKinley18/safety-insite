import { EvidenceWeightingResult } from '../field-evidence-weighting/field-evidence-weighting.types';
import { MultiHazardDecompositionResult } from '../multi-hazard-decomposition/multi-hazard-decomposition.types';

export interface RetrievalOutput {
  version: string;
  observationSummary: string;
  taxonomyRoute: any;
  approvedKnowledgeMatches: any[];
  scenarioMatches: any[];
  evaluatedScenarios: any[];
  topScenario?: any;
  evidenceWeighting: EvidenceWeightingResult;
  multiHazardDecomposition: MultiHazardDecompositionResult;
  draftKnowledgeWarnings: string[];
  applicabilityAssessment: string;
  confidence: number;
  evidenceGaps: string[];
  advisoryBoundaries: string[];
  recommendedReviewerActions: string[];
  fieldOutputNotes: string;
}
