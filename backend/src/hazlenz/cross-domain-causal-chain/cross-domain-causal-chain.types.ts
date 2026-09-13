import { EvidenceWeightingResult } from '../field-evidence-weighting/field-evidence-weighting.types';
import { MultiHazardDecompositionResult } from '../multi-hazard-decomposition/multi-hazard-decomposition.types';

export type CompoundRiskLevel = 'low' | 'moderate' | 'high' | 'critical' | 'uncertain';
export type ChainConfidence = 'strong' | 'moderate' | 'weak' | 'insufficient' | 'conflicting';

export interface CrossDomainCausalChainResult {
  version: string;
  primaryCausalChain: string[];
  contributingHazards: string[];
  initiatingConditions: string[];
  escalationFactors: string[];
  exposurePathways: string[];
  controlBreakdownPathways: string[];
  plausibleInjuryMechanisms: string[];
  compoundRiskLevel: CompoundRiskLevel;
  chainConfidence: ChainConfidence;
  missingCausalFacts: string[];
  contradictionLimits: string[];
  reviewerQuestions: string[];
  advisoryBoundary: string;
  doesNotDeclareViolation: boolean;
  requiresQualifiedReview: boolean;
}
