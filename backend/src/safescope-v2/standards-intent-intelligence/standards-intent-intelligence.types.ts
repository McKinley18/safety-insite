export type SafeScopeStandardsIntentConfidence = 'low' | 'medium' | 'high';

export type SafeScopeStandardIntentProfile = {
  citation: string;
  standardTitle: string;
  agencyOrAuthority: string;
  likelyRegulatoryIntent: string[];
  protectedPersons: string[];
  preventedEvents: string[];
  hazardMechanismsAddressed: string[];
  applicabilityEvidenceNeeded: string[];
  nonApplicabilityQuestions: string[];
  minimumControlIntent: string[];
  strongComplianceIndicators: string[];
  weakOrInsufficientIndicators: string[];
  relatedHazardsToCheck: string[];
  verificationEvidence: string[];
  closureCautions: string[];
  confidence: SafeScopeStandardsIntentConfidence;
};

export type SafeScopeStandardsIntentInput = {
  classification: string;
  observationText: string;
  suggestedStandards?: any[];
  risk?: any;
  hazardDomainIntelligence?: any;
  safetyHealthDomainMatrix?: any;
  mechanismIntelligence?: any;
  evidenceSufficiency?: any;
  actionQuality?: any;
};

export type SafeScopeStandardsIntentOutput = {
  engine: 'safescope_standards_intent_intelligence';
  mode: 'deterministic_offline';
  classification: string;
  standardIntentProfiles: SafeScopeStandardIntentProfile[];
  commonIntentThemes: string[];
  standardsCoverageGaps: string[];
  evidenceGapsBlockingApplicability: string[];
  mitigationIntentSummary: string[];
  crossCheckHazards: string[];
  regulatoryCautionNotes: string[];
  confidence: SafeScopeStandardsIntentConfidence;
  requiresQualifiedReview: boolean;
  canInventStandards: false;
  canDeclareViolation: false;
  canFinalizeApplicabilityWithoutEvidence: false;
  canReduceHumanReview: false;
  sourceBoundary: string;
};
