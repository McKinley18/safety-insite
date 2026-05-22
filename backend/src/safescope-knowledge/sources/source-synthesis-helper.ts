import {
  getSourceRole,
  ROLE_LABELS,
  ROLE_GUIDANCE,
  SourceRole,
} from "./source-role-helper";
import { getSourceGovernance } from "./source-governance-helper";

type KnowledgeMatchForSynthesis = {
  title: string;
  citation?: string | null;
  sourceType?: string | null;
  sourceRole?: string | null;
  sourceRoleLabel?: string | null;
  authorityTier?: number | null;
  usageGuidance?: string | null;
  sourceUrl?: string | null;
  score?: number | null;
  excerpt?: string | null;
  isPrimaryAuthority?: boolean;
};

function preview(value?: string | null) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 280);
}

function toItem(match: KnowledgeMatchForSynthesis) {
  const role = (match.sourceRole ||
    getSourceRole(
      match.sourceType || "",
      match.authorityTier || 5,
    )) as SourceRole;
  const governance = getSourceGovernance(
    match.sourceType || "",
    match.authorityTier || 5,
  );
  return {
    title: match.title,
    citation: match.citation || null,
    sourceRoleLabel: match.sourceRoleLabel || ROLE_LABELS[role],
    authorityTier: match.authorityTier || null,
    usageGuidance: match.usageGuidance || ROLE_GUIDANCE[role],
    sourceUrl: match.sourceUrl || null,
    score: match.score || 0,
    excerpt: preview(match.excerpt),
    sourceGovernance: governance,
  };
}

export function buildSourceSynthesis(matches: KnowledgeMatchForSynthesis[]) {
  const synthesis = {
    primaryRegulatoryBasis: [] as ReturnType<typeof toItem>[],
    officialGuidance: [] as ReturnType<typeof toItem>[],
    incidentLearning: [] as ReturnType<typeof toItem>[],
    bestPracticeGuidance: [] as ReturnType<typeof toItem>[],
    internalContext: [] as ReturnType<typeof toItem>[],
    supportingReferences: [] as ReturnType<typeof toItem>[],
    counts: {
      primaryRegulatoryBasis: 0,
      officialGuidance: 0,
      incidentLearning: 0,
      bestPracticeGuidance: 0,
      internalContext: 0,
      supportingReferences: 0,
    },
    finalReasoningSummary: "",
    complianceCaution:
      "SafeScope separates enforceable standards from guidance, incident learning, and best-practice references. Final compliance determinations require qualified safety review.",
  };

  for (const match of matches || []) {
    const item = toItem(match);
    const role = (match.sourceRole ||
      getSourceRole(
        match.sourceType || "",
        match.authorityTier || 5,
      )) as SourceRole;
    const gov = item.sourceGovernance;

    const isPrimary =
      match.isPrimaryAuthority ||
      role === "regulatory_citation" ||
      gov.reasoningUse === "primary_compliance_basis" ||
      gov.trustLimits.canCiteAsStandard ||
      (match.sourceType === "regulation" && match.authorityTier === 1);

    if (isPrimary) synthesis.primaryRegulatoryBasis.push(item);
    else if (["official_interpretation", "enforcement_policy"].includes(role))
      synthesis.officialGuidance.push(item);
    else if (["fatality_learning", "incident_investigation"].includes(role))
      synthesis.incidentLearning.push(item);
    else if (["safety_alert_or_best_practice"].includes(role))
      synthesis.bestPracticeGuidance.push(item);
    else if (role === "internal_site_memory")
      synthesis.internalContext.push(item);
    else synthesis.supportingReferences.push(item);
  }

  synthesis.counts = {
    primaryRegulatoryBasis: synthesis.primaryRegulatoryBasis.length,
    officialGuidance: synthesis.officialGuidance.length,
    incidentLearning: synthesis.incidentLearning.length,
    bestPracticeGuidance: synthesis.bestPracticeGuidance.length,
    internalContext: synthesis.internalContext.length,
    supportingReferences: synthesis.supportingReferences.length,
  };

  const summaryParts: string[] = [];
  if (synthesis.primaryRegulatoryBasis.length)
    summaryParts.push(
      "Primary regulatory sources were found and should be treated as the strongest compliance basis.",
    );
  if (synthesis.officialGuidance.length)
    summaryParts.push(
      "Official interpretation/guidance supports how the requirement may apply, but does not replace the regulation.",
    );
  if (synthesis.incidentLearning.length)
    summaryParts.push(
      "Incident learning supports hazard recognition and prevention lessons.",
    );
  if (synthesis.bestPracticeGuidance.length)
    summaryParts.push(
      "Safety alerts and best-practice guidance support preventive controls and corrective action planning.",
    );
  if (synthesis.internalContext.length)
    summaryParts.push(
      "Internal site memory supports local context and requires qualified review.",
    );
  if (!summaryParts.length && synthesis.supportingReferences.length)
    summaryParts.push(
      "Supporting references were found, but no primary regulatory basis was identified.",
    );

  synthesis.finalReasoningSummary =
    summaryParts.join(" ") ||
    "No supporting sources were found for this retrieval.";
  return synthesis;
}
