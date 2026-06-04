export type SafeScopeActionQualityRating =
  | "strong"
  | "adequate_with_review"
  | "interim_only"
  | "weak"
  | "insufficient";

export type SafeScopeControlLevel =
  | "elimination"
  | "substitution"
  | "engineering"
  | "isolation"
  | "administrative"
  | "ppe"
  | "unknown";

export type SafeScopeActionQualityInput = {
  classification: string;
  observationText: string;
  correctiveActions?: Array<{
    title?: string;
    description?: string;
    priority?: string;
    assignedRole?: string;
    dueDate?: string;
    requiresShutdown?: boolean;
    referenceStandards?: string[];
    verificationEvidence?: string[];
    suggestedFixes?: string[];
  }>;
  suggestedStandards?: any[];
  risk?: any;
  mechanismIntelligence?: any;
  evidenceSufficiency?: any;
};

export type SafeScopeActionQualityOutput = {
  engine: "safescope_action_quality";
  mode: "deterministic_offline";
  classification: string;
  overallRating: SafeScopeActionQualityRating;
  strongestControlLevel: SafeScopeControlLevel;
  actionStrengths: string[];
  actionWeaknesses: string[];
  missingActionElements: string[];
  recommendedActionImprovements: string[];
  verificationRequirements: string[];
  closureBlockers: string[];
  requiresSupervisorReview: boolean;
  canInventCorrectiveAction: false;
  canCloseWithoutVerification: false;
  canReduceHumanReview: false;
  sourceBoundary: string;
};
