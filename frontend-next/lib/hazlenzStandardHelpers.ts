import { isDisplayableStandardCandidate } from "@/lib/inspection/standardDisplay";

export type HazLenzStandardCandidate = {
  citation: string;
  title?: string;
  standardText?: string;
  summary?: string;
  plainLanguageSummary?: string;
  fullText?: string;
  regulationText?: string;
  regulatoryText?: string;
  jurisdiction?: string;
  status?: string;
  applicabilityStatus?: "confirmed" | "probable" | "candidate" | "needs-more-evidence" | "not-applicable";
  confidence?: number;
  source?: string;
  rationale?: string;
  authority?: "primary" | "supporting" | "advisory" | "needs_more_evidence";
  evidenceGaps?: string[];
  matchReasons?: string[];
  isCandidate?: boolean;
  isDirectMatch?: boolean;
};

const GENERIC_STANDARD_LABEL_RE = /^(review|pending|candidate(?: standard)?|suggested candidate standard|fallback candidate standard|standard family|applicable standard|no specific standard selected yet|needs more evidence|review candidate standard|unknown|none|n\/a|na)$/i;

function looksLikeCitation(value: unknown) {
  const text = String(value || "").trim();
  return /\b(?:\d+\s*CFR\s*\d+|\d+\.\d+|\d+\s*CFR\s*Part\s*\d+)\b/i.test(text);
}

function isPlaceholderLabel(value: unknown) {
  return GENERIC_STANDARD_LABEL_RE.test(String(value || "").trim());
}

function cleanText(value: unknown) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function sanitizeTitle(value: any, citation: string) {
  const title = cleanText(
    value?.title ||
      value?.heading ||
      value?.name ||
      value?.sectionTitle ||
      value?.titleSummary ||
      value?.summary ||
      value?.description ||
      value?.citationTitle ||
      "",
  );

  if (!title || isPlaceholderLabel(title)) return citation || "";

  const stripped = citation
    ? title.replace(new RegExp(`^${String(citation).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*[—:-]*\\s*`, "i"), "").trim()
    : title;

  return stripped && !isPlaceholderLabel(stripped) ? stripped : (citation || "");
}

function normalizeCitation(value: any): string {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "object") {
    return String(
      value.citation ||
        value.reference ||
        value.standard ||
        value.standardCitation ||
        value.code ||
        ""
    ).trim();
  }
  return "";
}

function normalizeDecisionConfidence(candidate: any): number | undefined {
  const raw = candidate?.confidence ?? candidate?.confidenceScore ?? candidate?.score;
  const numeric = Number(raw);
  if (!Number.isFinite(numeric)) return undefined;
  if (numeric <= 1) return Math.max(0, Math.min(1, numeric));
  if (numeric <= 100) return Math.max(0, Math.min(1, numeric / 100));
  return Math.max(0, Math.min(1, numeric / 1000));
}

function toTextArray(value: any): string[] {
  const items = Array.isArray(value) ? value : value !== undefined && value !== null ? [value] : [];
  return items
    .map((item) => cleanText(typeof item === "string" ? item : item?.question || item?.prompt || item?.reason || item?.text || item?.title || item?.summary || item))
    .filter(Boolean);
}

function candidateFrom(value: any, source: string): HazLenzStandardCandidate | null {
  if (!isDisplayableStandardCandidate(value)) return null;

  const citation = normalizeCitation(value);
  if (!citation) return null;
  const title = sanitizeTitle(value, citation);

  const matchReasons = [
    ...toTextArray(value?.matchingReasons),
    ...toTextArray(value?.matchReasons),
    ...toTextArray(value?.rationale),
    ...toTextArray(value?.reason),
    ...toTextArray(value?.reasons),
    ...toTextArray(value?.supportReason),
    ...toTextArray(value?.supportReasonText),
  ];

  const evidenceGaps = [
    ...toTextArray(value?.evidenceNeeded),
    ...toTextArray(value?.evidenceGaps),
    ...toTextArray(value?.missingEvidence),
    ...toTextArray(value?.evidenceGapQuestions),
    ...toTextArray(value?.questions),
  ];

  if (typeof value === "string") {
    return { citation, title: citation, source };
  }

  return {
    citation,
    title: title || citation,
    jurisdiction: value.jurisdiction,
    status: value.status,
    confidence: normalizeDecisionConfidence(value),
    standardText: cleanText(value.standardText || value.fullText || value.regulationText || value.regulatoryText) || undefined,
    summary: cleanText(value.summary || value.plainLanguageSummary) || undefined,
    plainLanguageSummary: cleanText(value.plainLanguageSummary) || undefined,
    fullText: cleanText(value.fullText) || undefined,
    regulationText: cleanText(value.regulationText) || undefined,
    regulatoryText: cleanText(value.regulatoryText) || undefined,
    applicabilityStatus: value.applicabilityStatus,
    rationale:
      cleanText(value.rationale || value.reasoning || value.reason || value.explanation) || undefined,
    source,
    authority: value.authority,
    evidenceGaps: evidenceGaps.length ? evidenceGaps : undefined,
    matchReasons: matchReasons.length ? matchReasons : undefined,
    isCandidate: value.isCandidate,
    isDirectMatch: value.isDirectMatch,
  };
}

function pushUnique(
  list: HazLenzStandardCandidate[],
  seen: Set<string>,
  value: any,
  source: string,
) {
  if (Array.isArray(value)) {
    value.forEach((item) => pushUnique(list, seen, item, source));
    return;
  }

  const candidate = candidateFrom(value, source);
  if (!candidate) return;

  const key = candidate.citation.toLowerCase();
  if (seen.has(key)) return;

  seen.add(key);
  list.push(candidate);
}

export function getHazLenzSuggestedStandards(result: any): HazLenzStandardCandidate[] {
  const standards: HazLenzStandardCandidate[] = [];
  const seen = new Set<string>();

  if (!result) return standards;

  const canonicalDecisions = getHazLenzStandardDecisions(result);
  if (canonicalDecisions.length) {
    canonicalDecisions.forEach((standard) => pushUnique(standards, seen, standard, "standardDecisions"));
    return standards;
  }

  pushUnique(standards, seen, result.primaryStandards, "primaryStandards");
  pushUnique(standards, seen, result.supportingStandards, "supportingStandards");
  pushUnique(standards, seen, result.candidateStandards, "candidateStandards");
  pushUnique(standards, seen, result.standards, "standards");

  pushUnique(
    standards,
    seen,
    result.standardApplicability?.suggestedStandards,
    "standardApplicability.suggestedStandards",
  );

  pushUnique(
    standards,
    seen,
    result.standardsTraceability?.suggestedCitations,
    "standardsTraceability.suggestedCitations",
  );

  pushUnique(
    standards,
    seen,
    result.aiEvidenceContract?.standardsSourcesUsed,
    "aiEvidenceContract.standardsSourcesUsed",
  );

  pushUnique(
    standards,
    seen,
    result.generatedActions?.flatMap((action: any) => action.referenceStandards || []),
    "generatedActions.referenceStandards",
  );

  pushUnique(
    standards,
    seen,
    result.baseGeneratedActions?.flatMap((action: any) => action.referenceStandards || []),
    "baseGeneratedActions.referenceStandards",
  );

  pushUnique(
    standards,
    seen,
    result.standardsMatchExplanations?.map((item: any) => ({
      citation: item.reference,
      title: item.title,
      jurisdiction: item.jurisdiction,
      confidence: item.confidence,
      rationale: item.matchedFacts?.length
        ? `Matched facts: ${item.matchedFacts.join(", ")}`
        : undefined,
    })),
    "standardsMatchExplanations",
  );


  pushUnique(standards, seen, result.suggestedStandards, "suggestedStandards");

  pushUnique(
    standards,
    seen,
    result.standardApplicability?.matchedRules,
    "standardApplicability.matchedRules",
  );

  pushUnique(
    standards,
    seen,
    result.applicabilityIntelligence?.primaryApplicableStandards,
    "applicabilityIntelligence.primaryApplicableStandards",
  );

  pushUnique(
    standards,
    seen,
    result.standardsReasoning?.topDefensible,
    "standardsReasoning.topDefensible",
  );

  pushUnique(
    standards,
    seen,
    result.inspectionIntelligence?.candidateStandards,
    "inspectionIntelligence.candidateStandards",
  );

  pushUnique(
    standards,
    seen,
    result.standardApplicability?.suggestedStandards,
    "standardApplicability.suggestedStandards",
  );

  pushUnique(
    standards,
    seen,
    result.needsMoreEvidenceStandards,
    "needsMoreEvidenceStandards",
  );

  pushUnique(
    standards,
    seen,
    result.standardApplicability?.needsMoreEvidenceStandards,
    "standardApplicability.needsMoreEvidenceStandards",
  );

  return standards;
}

export function getHazLenzStandardDecisions(result: any): HazLenzStandardCandidate[] {
  const decisions = Array.isArray(result?.standardDecisions) ? result.standardDecisions : [];
  const seen = new Set<string>();
  const normalized: HazLenzStandardCandidate[] = [];

  for (const decision of decisions) {
    if (!decision) continue;
    if (decision.authority === "advisory") continue;

    const candidate = candidateFrom(decision, "standardDecisions");
    if (!candidate) continue;
    const key = candidate.citation.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    normalized.push(candidate);
  }

  return normalized;
}
