import { HierarchyLevel } from '../scenario-family-knowledge/scenario-family.types';

export type CorrectiveActionReasoning = {
  scenarioFamilyId: string;
  hazardDomain: string;
  mechanismOfInjury: string;
  exposurePathway: string;
  missingOrFailedControls: string[];
  immediateActions: string[];
  interimControls: string[];
  permanentCorrections: string[];
  administrativeFollowUps: string[];
  verificationSteps: string[];
  evidenceNeededBeforeFinalizing: string[];
  responsibleRoleSuggestions: string[];
  urgencyLevel: 'low' | 'moderate' | 'high' | 'critical';
  controlHierarchyLevel: HierarchyLevel;
  standardFamilyReviewLinks: string[];
  confidence: number;
  humanReviewTriggers: string[];
  advisoryGuardrails: {
    advisoryOnly: boolean;
    doesNotDeclareViolation: boolean;
    requiresQualifiedReview: boolean;
  };
  // Narrative-ready fields
  immediateActionNarrative: string;
  interimControlNarrative: string;
  permanentCorrectionNarrative: string;
  administrativeFollowUpNarrative: string;
  verificationNarrative: string;
};
