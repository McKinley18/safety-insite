export type AbsorptionDecision = 'categorize_only' | 'create_learning_candidate' | 'hold_for_review' | 'reject';

export interface HazardAbsorptionOutput {
  absorptionDecision: AbsorptionDecision;
  primaryDomain: string;
  secondaryDomains: string[];
  hazardFamilies: string[];
  mechanisms: string[];
  equipmentGroups: string[];
  taskContexts: string[];
  jurisdictionAssessment: string;
  evidenceQuestions: string[];
  requiredFacts: string[];
  correctiveActionControlFamilies: string[];
  duplicateKeys: string[];
  prohibitedLanguageFlags: boolean;
  advisoryBoundary: boolean;
  reasons: string[];
  learningCandidateDraft?: any;
}
