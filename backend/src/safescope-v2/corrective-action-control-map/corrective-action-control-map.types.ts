export interface ControlMapOutput {
  preferredControlFamilies: string[];
  immediateControls: string[];
  permanentControls: string[];
  verificationMethods: string[];
  weakActionsToAvoid: string[];
  requiredReviewerChecks: string[];
  advisoryGuardrails: {
    advisoryOnly: boolean;
    doesNotDeclareViolation: boolean;
    doesNotCreateCitation: boolean;
    requiresQualifiedReview: boolean;
  };
}
