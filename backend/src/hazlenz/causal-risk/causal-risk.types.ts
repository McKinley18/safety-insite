export type HazLenzCausalRiskConfidenceLevel =
  | 'high'
  | 'moderate'
  | 'low'
  | 'insufficient';

export type HazLenzCausalRiskOutput = {
  engine: 'safescope_causal_risk_reasoning';
  version: '0.1.0';
  primaryEnergySource: string;
  energyTransferPath: string;
  exposedTarget: string;
  initiatingCondition: string;
  failedOrMissingControl: string;
  mechanismOfInjury: string;
  credibleWorstCase: string;
  competingMechanisms: string[];
  missingEvidence: string[];
  confidence: {
    level: HazLenzCausalRiskConfidenceLevel;
    score: number;
    reasons: string[];
  };
  reasoningTrace: string[];
  advisoryGuardrails: {
    advisoryOnly: true;
    doesNotDeclareViolation: true;
    doesNotCreateCitation: true;
    requiresQualifiedReview: true;
  };
};
