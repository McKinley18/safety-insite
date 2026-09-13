export type StandardFamilyCandidateRecord = {
  id: string;
  title: string;
  jurisdictionContext: string[]; 
  candidateFamily: string;
  relatedScenarioFamilies: string[];
  relatedHazardDomains: string[];
  relatedEquipmentIndicators: string[];
  relatedTaskIndicators: string[];
  relatedMechanismOfInjuryIndicators: string[];
  relatedExposureIndicators: string[];
  relatedMissingControlIndicators: string[];
  evidenceRequired: string[];
  evidenceGaps: string[];
  confidenceBoosters: string[];
  confidenceReducers: string[];
  humanReviewTriggers: string[];
  reasoningNotes: string[];
  advisoryGuardrails: {
    advisoryOnly: boolean;
    doesNotDeclareViolation: boolean;
    requiresQualifiedReview: boolean;
  };
};
