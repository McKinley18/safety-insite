import {
  SafeScopeJurisdiction,
  SafeScopeReasoningDomain,
} from '../reasoning-orchestrator/reasoning-orchestrator.types';

export type SafeScopeMechanismPrecedenceInput = {
  normalizedText: string;
  jurisdiction: SafeScopeJurisdiction;
  hazardDomain: SafeScopeReasoningDomain;
  currentMechanismId?: string;
  currentPrimaryCitation?: string;
  siteType?: string;
  industryContext?: string;
  taskContext?: string;
  equipmentInvolved?: string;
};

export type SafeScopeMechanismPrecedenceResult = {
  mechanismId?: string;
  primaryCitationOverride?: string;
  reasonCodes: string[];
  confidenceImpact: 'none' | 'increase' | 'decrease';
  humanReviewRecommended: boolean;
};
