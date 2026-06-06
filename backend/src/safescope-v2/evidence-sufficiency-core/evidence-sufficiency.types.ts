export type SufficiencyLevel = 'sufficient' | 'partially_sufficient' | 'weak' | 'insufficient';
export type ConfidenceLevel = 'high' | 'moderate' | 'low' | 'insufficient';

export interface FactScores {
  observationClarity: number;
  equipmentClarity: number;
  taskClarity: number;
  exposureClarity: number;
  energyClarity: number;
  controlFailureClarity: number;
  mechanismClarity: number;
  jurisdictionClarity: number;
  evidenceSupport: number;
}

export interface ConfidenceImpact {
  shouldDowngradeConfidence: boolean;
  downgradeReason: string;
  maximumSupportedConfidence: ConfidenceLevel;
}

export interface AdvisoryGuardrails {
  advisoryOnly: boolean;
  doesNotDeclareViolation: boolean;
  doesNotCreateCitation: boolean;
  requiresQualifiedReview: boolean;
}

export interface EvidenceSufficiencyOutput {
  engine: string;
  version: string;
  sufficiencyLevel: SufficiencyLevel;
  overallScore: number;
  factScores: FactScores;
  strongestFacts: string[];
  weakestFacts: string[];
  missingCriticalFacts: string[];
  recommendedReviewerQuestions: string[];
  confidenceImpact: ConfidenceImpact;
  reasoningTrace: string[];
  advisoryGuardrails: AdvisoryGuardrails;
}
