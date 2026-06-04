export type SafeScopeKnowledgeAuthorityTier =
  | "regulatory"
  | "government_guidance"
  | "consensus_standard"
  | "manufacturer_guidance"
  | "internal_validated"
  | "workspace_validated"
  | "unreviewed";

export type SafeScopeKnowledgeReviewStatus =
  | "approved"
  | "needs_review"
  | "rejected"
  | "quarantined";

export type SafeScopeKnowledgeType =
  | "regulatory_standard"
  | "regulatory_interpretation"
  | "hazard_mechanism"
  | "control_guidance"
  | "incident_learning"
  | "health_exposure"
  | "human_factors"
  | "inspection_question"
  | "corrective_action_pattern"
  | "verification_requirement";

export type SafeScopeKnowledgeMatch = {
  id?: string;
  title?: string;
  summary?: string;
  citation?: string;
  agency?: string;
  sourceName?: string;
  sourceType?: string;
  authorityTier?: SafeScopeKnowledgeAuthorityTier | string;
  reviewStatus?: SafeScopeKnowledgeReviewStatus | string;
  knowledgeType?: SafeScopeKnowledgeType | string;
  hazardFamilies?: string[];
  controlFamilies?: string[];
  evidenceQuestions?: string[];
  correctiveActionPatterns?: string[];
  verificationRequirements?: string[];
  healthExposureNotes?: string[];
  observationPatterns?: string[];
  confidence?: number;
  score?: number;
  reason?: string;
  [key: string]: any;
};

export type ExpertObservationInput = {
  classification: string;
  observationText?: string;
  suggestedStandards?: any[];
  evidenceContract?: any;
  nativeReasoning?: any;
  learningGovernance?: any;
  learningMemory?: any;
  knowledgeMatches?: SafeScopeKnowledgeMatch[];
};

export type ExpertObservationOutput = {
  engine: "safescope_expert_observations";
  mode: "deterministic_offline";
  classification: string;
  relatedHazardObservations: string[];
  relatedHealthObservations: string[];
  likelyExposurePathways: string[];
  likelyFailureModes: string[];
  missingEvidenceQuestions: string[];
  correctiveActionQualityNotes: string[];
  hierarchyOfControlsFeedback: string[];
  verificationEvidenceSuggestions: string[];
  relatedStandardsCautions: string[];
  confidenceCautions: string[];
  humanReviewTriggers: string[];
  sourceBoundary: string;
  canInventCitations: false;
  canOverrideStandards: false;
  canReduceHumanReview: false;
};
