import {
  runHazLenzClassify,
  runHazLenzOffline,
} from "@/lib/hazlenz";
import {
  getHazLenzScopeLabel,
  getHazLenzScopesForAgencyMode,
} from "./inspectionWorkflowHelpers";
import { getHazLenzStandardDecisions } from "@/lib/hazlenzStandardHelpers";

export async function runInspectionHazLenzReview(input: {
  forceOffline: boolean;
  isOfflineMode: boolean;
  agencyMode: string;
  hazardCategory: string;
  description: string;
  location: string;
  evidenceNotes: string;
  riskProfileId: "simple_4x4" | "standard_5x5" | "advanced_6x6";
  photos: any[];
  findings: any[];
}) {
  if (!input.description || input.description.trim().length === 0) {
    return {
      ok: false as const,
      status: "Add an observation description before running HazLenz AI.",
    };
  }

  if (input.isOfflineMode || input.forceOffline) {
    const result = await runHazLenzOffline({
      observationText: input.description,
      localInspectionId: "local-ins-" + Date.now(),
      localObservationId: "local-obs-" + Date.now(),
      offlineKnowledgePackVersion: "v1.0.0-seed",
    });

    return {
      ok: true as const,
      result,
      enableOfflineMode: input.forceOffline,
      autoSelectedStandards: [],
      autoSelectedActions: [],
      status: "HazLenz AI review complete.",
    };
  }

  const safeScopeScopes = getHazLenzScopesForAgencyMode(input.agencyMode);
  const safeScopeScopeLabel = getHazLenzScopeLabel(input.agencyMode);

  const result = await runHazLenzClassify({
    text: [
      `Hazard category: ${input.hazardCategory || "Unspecified"}`,
      `Observed condition: ${input.description || "No description provided"}`,
      `Location: ${input.location || "No location provided"}`,
      `Evidence notes: ${input.evidenceNotes || "No evidence notes provided"}`,
      `Regulatory scope: ${safeScopeScopeLabel}`,
    ].join("\n"),
    scopes: safeScopeScopes,
    riskProfileId: input.riskProfileId,
    visualAttachments: input.photos.map((photo: any) => ({
      id: photo.id,
      type: "photo",
      fileName: photo.name,
      caption: photo.caption,
      fieldNotes: photo.fieldNotes,
      viewType: photo.viewType || "unknown",
      capturedAt: photo.capturedAt,
    })),
    evidenceTexts: [
      input.evidenceNotes,
      input.location,
      input.photos.length ? `${input.photos.length} evidence photo(s) attached` : "",
      ...input.photos.map(
        (photo: any, index: number) =>
          `Photo ${index + 1}: ${photo.name || "evidence photo"}`,
      ),
    ].filter(Boolean),
    priorFindings: input.findings.map((finding: any) => ({
      id: finding.id,
      hazardCategory: finding.hazardCategory,
      classification: finding.safeScopeResult?.classification,
      description: finding.description,
      location: finding.location,
      riskScore: finding.riskScore,
      createdAt: finding.createdAt,
    })),
  });

  const canonicalStandards = getHazLenzStandardDecisions(result);
  const autoSelectedStandards = result?.isVague
    ? []
    : canonicalStandards.length > 0
      ? canonicalStandards.slice(0, 1)
      : Array.isArray(result?.suggestedStandards) && result.suggestedStandards.length > 0
        ? result.suggestedStandards.slice(0, 1)
        : Array.isArray(result?.inspectionIntelligence?.candidateStandards) && result.inspectionIntelligence.candidateStandards.length > 0
          ? result.inspectionIntelligence.candidateStandards.slice(0, 1)
          : result?.executiveJudgment?.topStandard
            ? [result.executiveJudgment.topStandard]
            : [];

  const autoSelectedActions = Array.isArray(result?.generatedActions)
    ? result.generatedActions.slice(0, 1).map((action: any) => ({
        ...action,
        source: "HazLenz AI",
      }))
    : [];

  return {
    ok: true as const,
    result,
    enableOfflineMode: false,
    autoSelectedStandards,
    autoSelectedActions,
    status: "HazLenz AI review complete.",
  };
}
