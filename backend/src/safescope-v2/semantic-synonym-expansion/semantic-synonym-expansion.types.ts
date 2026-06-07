import { EvidenceWeightingResult } from '../field-evidence-weighting/field-evidence-weighting.types';
import { MultiHazardDecompositionResult } from '../multi-hazard-decomposition/multi-hazard-decomposition.types';
import { JurisdictionApplicabilityResult } from '../jurisdiction-applicability-decision-tree/jurisdiction-applicability-decision-tree.types';

export interface SemanticSynonymExpansionInput {
  observationText: string;
  taxonomyRoute: any;
  context: any;
  jurisdictionAssessment: JurisdictionApplicabilityResult;
  evidenceWeighting: EvidenceWeightingResult;
  multiHazardAnalysis: MultiHazardDecompositionResult;
}

export interface SemanticSynonymExpansionResult {
  version: string;
  normalizedObservationText: string;
  expandedSignals: string[];
  detectedSynonymGroups: string[];
  primarySemanticFamilies: string[];
  semanticConfidenceScore: number;
  matchedCanonicalTerms: string[];
  unmappedTerms: string[];
  possibleAmbiguities: string[];
  governanceWarnings: string[];
  reviewerQuestions: string[];
  advisoryBoundary: string;
}
