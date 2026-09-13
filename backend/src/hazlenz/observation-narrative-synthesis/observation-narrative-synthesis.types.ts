import { EvidenceWeightingResult } from '../field-evidence-weighting/field-evidence-weighting.types';
import { MultiHazardDecompositionResult } from '../multi-hazard-decomposition/multi-hazard-decomposition.types';

export interface ObservationNarrativeSynthesisInput {
  observationText: string;
  taxonomyRoute: any;
  approvedKnowledgeMatches: any[];
  scenarioMatches: any[];
  evaluatedScenarios: any[];
  evidenceWeighting: EvidenceWeightingResult;
  multiHazardAnalysis: MultiHazardDecompositionResult;
  context?: any;
}

export interface ObservationNarrativeSynthesisResult {
  version: string;
  narrativeSummary: string;
  primaryConcern: string;
  secondaryConcerns: string[];
  evidenceBasis: string;
  uncertaintyStatement: string;
  contradictionStatement: string;
  missingInformationStatement: string;
  immediateActionNarrative: string;
  reviewerQuestionNarrative: string;
  advisoryBoundary: string;
  confidenceLabel: string;
  reasoningTrace: string[];
}
