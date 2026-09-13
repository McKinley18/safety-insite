import { EvidenceWeightingResult } from '../field-evidence-weighting/field-evidence-weighting.types';
import { MultiHazardDecompositionResult } from '../multi-hazard-decomposition/multi-hazard-decomposition.types';
import { ObservationNarrativeSynthesisResult } from '../observation-narrative-synthesis/observation-narrative-synthesis.types';
import { CrossDomainCausalChainResult } from '../cross-domain-causal-chain/cross-domain-causal-chain.types';

export type ActionType = 'immediate' | 'interim' | 'permanent' | 'verification' | 'weak_action_to_avoid' | 'question';
export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type ActionPosture = 'act_now' | 'verify_then_act' | 'questions_only' | 'monitor' | 'escalate_review';

export interface RankedAction {
  id: string;
  actionType: ActionType;
  priority: Priority;
  controlFamily: string;
  actionText: string;
  reason: string;
  linkedHazardDomains: string[];
  linkedScenarioIds: string[];
  linkedCausalChains: string[];
  evidenceDependency: string;
  confidence: number;
  requiresHumanVerification: boolean;
}

export interface CorrectiveActionStrategyResult {
  strategyVersion: string;
  rankedActions: RankedAction[];
  immediateControls: RankedAction[];
  interimControls: RankedAction[];
  permanentControls: RankedAction[];
  verificationSteps: RankedAction[];
  weakActionsToAvoid: RankedAction[];
  supervisorQuestions: RankedAction[];
  rankingRationale: string[];
  confidence: number;
  actionPosture: ActionPosture;
  advisoryBoundary: string;
}
