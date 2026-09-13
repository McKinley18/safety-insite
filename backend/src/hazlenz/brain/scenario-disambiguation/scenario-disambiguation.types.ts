import { HazLenzReasoningDomain } from '../../reasoning-orchestrator/reasoning-orchestrator.types';

export type HazLenzScenarioDisambiguationRecord = {
  scenarioId: string;
  label: string;
  targetDomain: HazLenzReasoningDomain | 'struck_by';
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

export type HazLenzScenarioDisambiguationMatch = {
  record: HazLenzScenarioDisambiguationRecord;
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

export type HazLenzScenarioDisambiguationInput = {
  text: string;
  jurisdiction?: string;
  industryContext?: string;
  siteType?: string;
  taskContext?: string;
  equipmentInvolved?: string;
  limit?: number;
};

export type HazLenzScenarioDisambiguationResult = {
  engine: 'safescope_scenario_disambiguation_v1';
  mode: 'read_only_governed_disambiguation';
  input: HazLenzScenarioDisambiguationInput;
  matches: HazLenzScenarioDisambiguationMatch[];
  selected?: HazLenzScenarioDisambiguationMatch;
  boundary: {
    readOnly: true;
    advisoryOnly: true;
    canDeclareViolation: false;
    canCreateCitation: false;
    canBypassHumanReview: false;
  };
};
