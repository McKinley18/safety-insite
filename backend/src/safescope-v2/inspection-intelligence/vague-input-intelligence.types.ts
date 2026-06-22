import { SafeScopeReasoningDomain } from '../reasoning-orchestrator/reasoning-orchestrator.types';

export type VagueHazardFamily = {
  domain: SafeScopeReasoningDomain;
  confidence: 'low' | 'moderate';
  rationale: string;
};

export type VagueInputAnalysis = {
  isVague: boolean;
  observedFacts: string[];
  inferredPossibilities: string[];
  missingCriticalFacts: string[];
  likelyHazardFamilies: VagueHazardFamily[];
  immediateSafetyQuestions: string[];
  conservativeInterimControls: string[];
  immediateControls?: string[];
  interimControls?: string[];
  permanentEngineeringControls?: string[];
  uncertaintyReason?: string;
};

