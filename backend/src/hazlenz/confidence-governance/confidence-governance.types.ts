export type ConfidenceLevel = 'high' | 'moderate' | 'low' | 'insufficient';

export interface ConfidenceInputs {
  observationUnderstandingConfidence: ConfidenceLevel;
  causalRiskConfidence: ConfidenceLevel;
  evidenceSufficiencyLevel: ConfidenceLevel;
  evidenceSufficiencyScore: number;
  scenarioConfidence: ConfidenceLevel;
  riskConfidence: ConfidenceLevel;
  standardsConfidence: ConfidenceLevel;
}

export interface ConfidenceGovernanceInput {
  observationUnderstanding?: any;
  causalRiskReasoning?: any;
  evidenceSufficiency?: any;
  scenarioIntelligence?: any;
  riskReasoning?: any;
  standardsReasoning?: any;
  calibrationMeta?: any;
  fusedText?: string;
}

export interface OutputPermissions {
  canSupportStrongRecommendation: boolean;
  canSupportStandardFamilySuggestion: boolean;
  canSupportCitationCandidate: boolean;
  canSupportCorrectiveAction: boolean;
  canSupportReportNarrative: boolean;
}

export interface AdvisoryGuardrails {
  advisoryOnly: true;
  doesNotDeclareViolation: true;
  doesNotCreateCitation: true;
  requiresQualifiedReview: true;
}

export interface ConfidenceGovernanceOutput {
  engine: 'safescope_confidence_governance_core';
  version: '0.1.0';
  finalConfidenceLevel: ConfidenceLevel;
  maximumSupportedConfidence: ConfidenceLevel;
  confidenceScore: number;
  confidenceInputs: ConfidenceInputs;
  downgradeReasons: string[];
  blockingEvidenceGaps: string[];
  humanReviewRequired: boolean;
  humanReviewReasons: string[];
  outputPermissions: OutputPermissions;
  decisionTrace: string[];
  advisoryGuardrails: AdvisoryGuardrails;
}
