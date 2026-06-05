import { HierarchyLevel } from './scenario-family.types';

export type RiskReasoning = {
  riskReasoningId: string;
  scenarioFamilyId: string;
  hazardDomain: string;
  mechanismOfInjury: string;
  credibleWorstCaseOutcome: string;
  severityEstimate: 'low' | 'moderate' | 'high' | 'serious' | 'critical';
  likelihoodEstimate: 'unlikely' | 'possible' | 'likely' | 'frequent';
  exposureFrequency: 'rare' | 'occasional' | 'frequent' | 'continuous';
  exposureDuration: string;
  exposedPopulation: number;
  energySourceSeverity: 'low' | 'moderate' | 'high' | 'critical';
  controlFailureSeverity: 'low' | 'moderate' | 'high' | 'critical';
  existingControls: string[];
  missingOrFailedControls: string[];
  uncertaintyFactors: string[];
  evidenceGaps: string[];
  initialRiskLevel: 'low' | 'moderate' | 'high' | 'serious' | 'critical' | 'unknown';
  residualRiskLevel: 'low' | 'moderate' | 'high' | 'serious' | 'critical' | 'unknown';
  riskDrivers: string[];
  riskReducers: string[];
  urgencyLevel: 'monitor' | 'scheduled' | 'prompt' | 'urgent' | 'immediate' | 'unknown';
  suggestedDueDateLogic: string;
  verificationRequirements: string[];
  confidence: number;
  humanReviewTriggers: string[];
  advisoryGuardrails: {
    advisoryOnly: boolean;
    doesNotDeclareViolation: boolean;
    requiresQualifiedReview: boolean;
  };
};
