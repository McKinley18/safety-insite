export type HazLenzActionQualityRating =
  | "strong"
  | "adequate_with_review"
  | "interim_only"
  | "weak"
  | "insufficient";

export type HazLenzControlLevel =
  | "elimination"
  | "substitution"
  | "engineering"
  | "isolation"
  | "administrative"
  | "ppe"
  | "unknown";

export type HazLenzActionQualityInput = {
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

export type HazLenzActionQualityOutput = {
  engine: "safescope_action_quality";
  mode: "deterministic_offline";
  classification: string;
  overallRating: HazLenzActionQualityRating;
  strongestControlLevel: HazLenzControlLevel;
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
