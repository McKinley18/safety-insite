export type SafeScopeRegulatoryApplicabilityStatus =
  | 'likely_applicable'
  | 'possibly_applicable'
  | 'insufficient_evidence'
  | 'likely_not_applicable';

export type SafeScopeRegulatoryApplicabilityConfidence = 'low' | 'medium' | 'high';

export type SafeScopeRegulatoryApplicabilityInput = {
  classification: string;
  observationText: string;
  evidenceTexts?: string[];
  suggestedStandards?: any[];
  risk?: any;
  standardsIntent?: any;
  safetyHealthDomainMatrix?: any;
  hazardDomainIntelligence?: any;
  mechanismIntelligence?: any;
  evidenceSufficiency?: any;
  actionQuality?: any;
};

export type SafeScopeRegulatoryApplicabilityProfile = {
  citation: string;
  standardTitle: string;
  agencyOrAuthority: string;
  applicabilityStatus: SafeScopeRegulatoryApplicabilityStatus;
  confidence: SafeScopeRegulatoryApplicabilityConfidence;
  jurisdictionSignals: string[];
  taskSignals: string[];
  exposureSignals: string[];
  equipmentOrProcessSignals: string[];
  applicabilityFactsSupporting: string[];
  applicabilityFactsMissing: string[];
  nonApplicabilityIndicators: string[];
  moreSpecificStandardConsiderations: string[];
  evidenceNeededBeforeCitation: string[];
  cautionBeforeUse: string[];
  recommendedUse: string;
};

export type SafeScopeRegulatoryApplicabilityOutput = {
  engine: 'safescope_regulatory_applicability';
  mode: 'deterministic_offline';
  classification: string;
  profiles: SafeScopeRegulatoryApplicabilityProfile[];
  primaryApplicabilityStatus: SafeScopeRegulatoryApplicabilityStatus;
  strongestCandidateCitation: string;
  jurisdictionCautions: string[];
  evidenceGapsBlockingApplicability: string[];
  moreSpecificStandardWarnings: string[];
  confidence: SafeScopeRegulatoryApplicabilityConfidence;
  requiresQualifiedReview: boolean;
  canInventStandards: false;
  canDeclareViolation: false;
  canFinalizeApplicabilityWithoutEvidence: false;
  canOverrideRegulations: false;
  canReduceHumanReview: false;
  sourceBoundary: string;
};
