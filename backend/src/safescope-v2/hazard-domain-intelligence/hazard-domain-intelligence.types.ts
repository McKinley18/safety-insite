export type SafeScopeHazardDomainConfidence = 'low' | 'medium' | 'high';

export type SafeScopeHazardDomainProfile = {
  domain: string;
  aliases: string[];
  keywords: string[];
  hazardFamilies: string[];
  hazardousEnergies: string[];
  injuryMechanisms: string[];
  healthMechanisms: string[];
  exposureRoutes: string[];
  commonFailureModes: string[];
  additionalHazardsToConsider: string[];
  evidenceNeeded: string[];
  mitigationStrategies: string[];
  weakOrInsufficientControls: string[];
  verificationEvidence: string[];
  closureRequirements: string[];
  humanReviewTriggers: string[];
};

export type SafeScopeHazardDomainIntelligenceInput = {
  classification: string;
  observationText: string;
  evidenceTexts?: string[];
  suggestedStandards?: any[];
  risk?: any;
  mechanismIntelligence?: any;
  exposureIntelligence?: any;
  evidenceSufficiency?: any;
  actionQuality?: any;
  causalChain?: any;
  controlEffectiveness?: any;
};

export type SafeScopeHazardDomainIntelligenceOutput = {
  engine: 'safescope_hazard_domain_intelligence';
  mode: 'deterministic_offline';
  classification: string;
  primaryDomain: string;
  relatedDomains: string[];
  hazardFamilies: string[];
  hazardousEnergies: string[];
  injuryMechanisms: string[];
  healthMechanisms: string[];
  exposureRoutes: string[];
  commonFailureModes: string[];
  additionalHazardsToConsider: string[];
  evidenceNeeded: string[];
  mitigationStrategies: string[];
  weakOrInsufficientControls: string[];
  verificationEvidence: string[];
  closureRequirements: string[];
  humanReviewTriggers: string[];
  confidence: SafeScopeHazardDomainConfidence;
  matchedDomainCount: number;
  matchedKeywordCount: number;
  requiresQualifiedReview: boolean;
  canInventStandards: false;
  canOverrideRegulations: false;
  canFinalizeWithoutHumanReview: false;
  sourceBoundary: string;
};
