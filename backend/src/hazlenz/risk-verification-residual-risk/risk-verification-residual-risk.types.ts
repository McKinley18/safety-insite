import { EvidenceWeightingResult } from '../field-evidence-weighting/field-evidence-weighting.types';
import { MultiHazardDecompositionResult } from '../multi-hazard-decomposition/multi-hazard-decomposition.types';
import { CrossDomainCausalChainResult } from '../cross-domain-causal-chain/cross-domain-causal-chain.types';
import { CorrectiveActionStrategyResult } from '../corrective-action-strategy-ranking/corrective-action-strategy-ranking.types';

export type VerificationStatus = 
  | 'not_ready_for_verification'
  | 'verification_needed'
  | 'partially_verified'
  | 'verified_controlled'
  | 'residual_risk_remaining'
  | 'escalation_required';

export type ResidualRiskLevel = 
  | 'none'
  | 'low'
  | 'moderate'
  | 'high'
  | 'critical'
  | 'unknown';

export type ActionEffectiveness = 
  | 'effective'
  | 'partially_effective'
  | 'weak'
  | 'ineffective'
  | 'unknown';

export interface RiskVerificationResidualRiskResult {
  verificationStatus: VerificationStatus;
  residualRiskLevel: ResidualRiskLevel;
  actionEffectiveness: ActionEffectiveness;
  addressedMechanisms: string[];
  unaddressedMechanisms: string[];
  verificationSteps: string[];
  residualRiskReasons: string[];
  additionalControlsNeeded: string[];
  weakActionWarnings: string[];
  reviewerQuestions: string[];
  confidenceAdjustment: number;
  advisoryBoundary: string;
}
