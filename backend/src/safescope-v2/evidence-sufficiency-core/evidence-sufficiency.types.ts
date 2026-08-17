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

export interface EvidenceFactTraceEntry {
  factId: string;
  type: string;
  value: string | number | boolean | string[] | null;
  source: string;
  status: string;
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
  /**
   * V5-C02: purely additive provenance -- the shared EvidenceFact[] entries (from
   * shared-evidence-facts.ts, the same extraction path evidence-foundation.ts uses) that back this
   * evaluation's `fusedText`. Never read by, or derived from, any field above; present only so a
   * caller can trace this evaluation back to specific evidence facts with a known source/status.
   * Omitted (not an empty array) when the caller did not supply a shared fact array.
   */
  evidenceFactTrace?: EvidenceFactTraceEntry[];
}
