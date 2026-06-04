export type SafeScopeEvidenceConfidenceImpact =
  | "none"
  | "low"
  | "medium"
  | "high";

export type EvidenceSufficiencyInput = {
  classification: string;
  observationText?: string;
  evidenceTexts?: string[];
  suggestedStandards?: any[];
  aiEvidenceContract?: any;
  expertObservations?: any;
  mechanismIntelligence?: any;
  exposureIntelligence?: any;
  risk?: any;
};

export type EvidenceSufficiencyOutput = {
  engine: "safescope_evidence_sufficiency";
  mode: "deterministic_offline";
  classification: string;

  sufficientForHazardRecognition: boolean;
  sufficientForStandardsRecommendation: boolean;
  sufficientForCorrectiveAction: boolean;
  sufficientForClosure: boolean;

  missingCriticalEvidence: string[];
  recommendedEvidenceToCapture: string[];
  evidenceStrengths: string[];
  evidenceWeaknesses: string[];

  requiredHumanReviewReasons: string[];
  confidenceImpact: SafeScopeEvidenceConfidenceImpact;

  canInventEvidence: false;
  canFinalizeWithoutEvidence: false;
  canReduceHumanReview: false;

  sourceBoundary: string;
};
