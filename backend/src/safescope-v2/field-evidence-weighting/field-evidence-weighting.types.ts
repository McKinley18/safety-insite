export type EvidenceGrade = 'strong' | 'moderate' | 'weak' | 'insufficient' | 'conflicting';

export interface FieldEvidenceWeightingInput {
  observationText: string;
  taxonomyRoute?: any;
  approvedKnowledgeMatches?: any[];
  evaluatedScenarioMatches?: any[];
  context?: any;
}

export interface EvidenceWeightingResult {
  evidenceStrengthScore: number;
  exposureClarityScore: number;
  controlFailureClarityScore: number;
  energyStateClarityScore: number;
  contradictionPenalty: number;
  missingFactPenalty: number;
  finalEvidenceConfidence: number;
  evidenceGrade: EvidenceGrade;
  detectedContradictions: string[];
  missingCriticalFacts: string[];
  supportingSignals: string[];
  weakeningSignals: string[];
  reviewerQuestions: string[];
  advisoryBoundary: string;
}
