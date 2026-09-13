export type HazLenzRegulatoryApplicabilityStatus =
  | 'likely_applicable'
  | 'possibly_applicable'
  | 'insufficient_evidence'
  | 'likely_not_applicable';

export type HazLenzRegulatoryApplicabilityConfidence = 'low' | 'medium' | 'high';

export type HazLenzRegulatoryApplicabilityInput = {
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

export type HazLenzRegulatoryApplicabilityProfile = {
  citation: string;
  standardTitle: string;
  agencyOrAuthority: string;
  applicabilityStatus: HazLenzRegulatoryApplicabilityStatus;
  confidence: HazLenzRegulatoryApplicabilityConfidence;
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

export type HazLenzRegulatoryApplicabilityOutput = {
  engine: 'safescope_regulatory_applicability';
  mode: 'deterministic_offline';
  classification: string;
  profiles: HazLenzRegulatoryApplicabilityProfile[];
  primaryApplicabilityStatus: HazLenzRegulatoryApplicabilityStatus;
  strongestCandidateCitation: string;
  jurisdictionCautions: string[];
  evidenceGapsBlockingApplicability: string[];
  moreSpecificStandardWarnings: string[];
  confidence: HazLenzRegulatoryApplicabilityConfidence;
  requiresQualifiedReview: boolean;
  canInventStandards: false;
  canDeclareViolation: false;
  canFinalizeApplicabilityWithoutEvidence: false;
  canOverrideRegulations: false;
  canReduceHumanReview: false;
  sourceBoundary: string;
};
