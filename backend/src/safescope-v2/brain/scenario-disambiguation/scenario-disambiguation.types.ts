import { SafeScopeReasoningDomain } from '../../reasoning-orchestrator/reasoning-orchestrator.types';

export type SafeScopeScenarioDisambiguationRecord = {
  scenarioId: string;
  label: string;
  targetDomain: SafeScopeReasoningDomain | 'struck_by';
  targetMechanism: string;
  targetCitation?: string;
  positiveSignals: string[];
  negativeSignals: string[];
  jurisdictionSignals: string[];
  industrySignals: string[];
  equipmentSignals: string[];
  taskSignals: string[];
  competingScenarioIds: string[];
  humanReviewTriggers: string[];
};

export type SafeScopeScenarioDisambiguationMatch = {
  record: SafeScopeScenarioDisambiguationRecord;
  score: number;
  positiveHits: string[];
  negativeHits: string[];
  jurisdictionHits: string[];
  industryHits: string[];
  equipmentHits: string[];
  taskHits: string[];
  confidence: 'low' | 'moderate' | 'high';
  humanReviewRecommended: boolean;
  reasonCodes: string[];
};

export type SafeScopeScenarioDisambiguationInput = {
  text: string;
  jurisdiction?: string;
  industryContext?: string;
  siteType?: string;
  taskContext?: string;
  equipmentInvolved?: string;
  limit?: number;
};

export type SafeScopeScenarioDisambiguationResult = {
  engine: 'safescope_scenario_disambiguation_v1';
  mode: 'read_only_governed_disambiguation';
  input: SafeScopeScenarioDisambiguationInput;
  matches: SafeScopeScenarioDisambiguationMatch[];
  selected?: SafeScopeScenarioDisambiguationMatch;
  boundary: {
    readOnly: true;
    advisoryOnly: true;
    canDeclareViolation: false;
    canCreateCitation: false;
    canBypassHumanReview: false;
  };
};
