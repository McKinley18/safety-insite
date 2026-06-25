import { isDisplayableStandardCandidate } from "@/lib/inspection/standardDisplay";

export type HazLenzStandardCandidate = {
  citation: string;
  title?: string;
  jurisdiction?: string;
  status?: string;
  confidence?: number;
  source?: string;
  rationale?: string;
};

function looksLikeCitation(value: unknown) {
  const text = String(value || "").trim();
  return /\b(?:\d+\s*CFR\s*\d+|\d+\.\d+|\d+\s*CFR\s*Part\s*\d+)\b/i.test(text);
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

function candidateFrom(value: any, source: string): HazLenzStandardCandidate | null {
  if (!isDisplayableStandardCandidate(value)) return null;

  const citation = normalizeCitation(value);
  if (!citation) return null;

  if (typeof value === "string") {
    return { citation, source };
  }

  return {
    citation,
    title:
      value.title ||
      value.standardTitle ||
      value.titleSummary ||
      value.name ||
      value.summary,
    jurisdiction: value.jurisdiction,
    status: value.status,
    confidence:
      value.confidence ??
      value.confidenceScore ??
      value.score,
    rationale:
      value.rationale ||
      value.reasoning ||
      value.reason ||
      value.explanation,
    source,
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
