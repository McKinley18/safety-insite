export type ConfidenceSignals = {
  score: number;
  reasoning: string[];
};

export type EvidenceGaps = {
  missingEvidence: string[];
  ambiguities: string[];
  conflicts: string[];
};

export type SafeScopeNormalizedObservationContext = {
  rawObservation: string;
  normalizedText: string;
  matchedTerms: string[];
  detectedEquipment: string[];
  detectedTasks: string[];
  detectedUnsafeConditions: string[];
  detectedOperationalStates: string[];
  detectedEnergySources: string[];
  detectedMechanismsOfInjury: string[];
  detectedExposureSignals: string[];
  detectedControls: string[];
  detectedMissingOrFailedControls: string[];
  detectedJurisdictionSignals: string[];
  detectedIndustrySignals: string[];
  ambiguitySignals: string[];
  conflictSignals: string[];
  photoLikeDescriptionSignals: string[];
  employeeExposureKnown: boolean;
  employeeExposureUnclear: boolean;
  taskContextKnown: boolean;
  operationalStateKnown: boolean;
  confidenceSignals: ConfidenceSignals;
  evidenceGaps: EvidenceGaps;
  trace: string[];
  advisoryGuardrails: {
    advisoryOnly: boolean;
    doesNotDeclareViolation: boolean;
    requiresQualifiedReview: boolean;
  };
};
