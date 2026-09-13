import {
  HazLenzJurisdiction,
  HazLenzReasoningDomain,
} from '../reasoning-orchestrator/reasoning-orchestrator.types';

export type HazLenzMechanismPrecedenceInput = {
  normalizedText: string;
  jurisdiction: HazLenzJurisdiction;
  hazardDomain: HazLenzReasoningDomain;
  currentMechanismId?: string;
  currentPrimaryCitation?: string;
  siteType?: string;
  industryContext?: string;
  taskContext?: string;
  equipmentInvolved?: string;
};

export type HazLenzMechanismPrecedenceResult = {
  mechanismId?: string;
  primaryCitationOverride?: string;
  reasonCodes: string[];
  confidenceImpact: 'none' | 'increase' | 'decrease';
  humanReviewRecommended: boolean;
};
