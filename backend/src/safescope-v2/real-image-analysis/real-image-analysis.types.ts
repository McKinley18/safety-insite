export interface ImageInput {
  id: string;
  fileName?: string;
  mimeType?: string;
  imageUrl?: string;
  localPath?: string;
  caption?: string;
  fieldNotes?: string;
  viewType?: string;
  simulatedVisionFindings?: string[];
}

export interface RealImageAnalysisInput {
  observationText: string;
  imageInputs: ImageInput[];
}

export interface VisualSignal {
  imageId: string;
  family: string;
  signal: string;
  support: "supports_observation" | "conflicts_with_observation" | "adds_new_concern" | "uncertain";
  confidence: "high" | "moderate" | "low";
  basis: string[];
}

export interface RealImageAnalysisResult {
  version: "real_image_analysis_v1";
  imageCount: number;
  visualSignals: VisualSignal[];
  imageEvidenceSummary: string;
  visualConfidenceImpact: "boost" | "neutral" | "downgrade" | "block";
  imageEvidenceLimitations: string[];
  recommendedPhotoFollowups: string[];
  requiresHumanVerification: boolean;
  advisoryBoundary: string;
}
