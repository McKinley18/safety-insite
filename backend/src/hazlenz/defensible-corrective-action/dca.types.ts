export type ActionStrength = 'strong' | 'moderate' | 'cautious' | 'questions_only';

export interface ActionItem {
  actionType: 'immediate' | 'interim' | 'permanent' | 'verification';
  title: string;
  description: string;
  tiedMechanism: string;
  tiedFailedControl: string;
  tiedExposure: string;
  verificationMethod: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  requiresHumanReview: boolean;
}

export interface AdvisoryGuardrails {
  advisoryOnly: boolean;
  doesNotDeclareViolation: boolean;
  doesNotCreateCitation: boolean;
  requiresQualifiedReview: boolean;
}

export interface DefensibleCorrectiveActionOutput {
  engine: string;
  version: string;
  actionStrength: ActionStrength;
  immediateActions: ActionItem[];
  interimControls: ActionItem[];
  permanentCorrectiveActions: ActionItem[];
  verificationActions: ActionItem[];
  assignedReviewNeeds: string[];
  actionRationale: string;
  blockedActions: string[];
  missingEvidenceBeforeFinalAction: string[];
  reviewerQuestions: string[];
  languagePolicyApplied: string;
  confidenceLimits: string;
  advisoryGuardrails: AdvisoryGuardrails;
}
