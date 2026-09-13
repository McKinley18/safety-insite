export type HazLenzDomainMatrixConfidence = 'low' | 'medium' | 'high';

export type HazLenzDomainMatrixDomain = {
  domain: string;
  aliases: string[];
  hazardFamilies: string[];
  hazardousEnergies: string[];
  injuryMechanisms: string[];
  healthMechanisms: string[];
  exposureRoutes: string[];
  commonFailureModes: string[];
  relatedDomains: string[];
  evidenceRequired: string[];
  strongControls: string[];
  weakControls: string[];
  mitigationStrategies: string[];
  verificationRequirements: string[];
  closureRequirements: string[];
  humanReviewTriggers: string[];
  regulatoryCautionNotes: string[];
};

export type HazLenzSafetyHealthDomainMatrixInput = {
  classification: string;
  observationText?: string;
  evidenceTexts?: string[];
  suggestedStandards?: any[];
  risk?: any;
  hazardDomainIntelligence?: any;
  mechanismIntelligence?: any;
  exposureIntelligence?: any;
  evidenceSufficiency?: any;
  actionQuality?: any;
  causalChain?: any;
  controlEffectiveness?: any;
};

export type HazLenzSafetyHealthDomainMatrixOutput = {
  engine: 'safescope_safety_health_domain_matrix';
  mode: 'deterministic_offline';
  classification: string;
  matchedDomains: string[];
  primaryDomain: string;
  relatedDomains: string[];
  hazardFamilies: string[];
  hazardousEnergies: string[];
  injuryMechanisms: string[];
  healthMechanisms: string[];
  exposureRoutes: string[];
  commonFailureModes: string[];
  additionalHazardsToConsider: string[];
  evidenceRequired: string[];
  strongControls: string[];
  weakControls: string[];
  mitigationStrategies: string[];
  verificationRequirements: string[];
  closureRequirements: string[];
  humanReviewTriggers: string[];
  regulatoryCautionNotes: string[];
  confidence: HazLenzDomainMatrixConfidence;
  matchedDomainCount: number;
  matchedKeywordCount: number;
  matrixDomainCount: number;
  requiresQualifiedReview: boolean;
  canInventStandards: false;
  canOverrideRegulations: false;
  canFinalizeWithoutHumanReview: false;
  sourceBoundary: string;
};
