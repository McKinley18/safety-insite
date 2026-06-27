import { getHazLenzStandardDecisions } from "@/lib/hazlenzStandardHelpers";
import { isDisplayableStandardCandidate } from "@/lib/inspection/standardDisplay";

export function asArray(value: any): any[] {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

export function standardKey(standard: any): string {
  return String(
    standard?.id ||
      standard?.citation ||
      standard?.standard ||
      standard?.standardNumber ||
      standard?.label ||
      standard?.title ||
      standard?.heading ||
      JSON.stringify(standard),
  );
}

export function normalizeHazLenzStandard(standard: any, source = "candidate") {
  if (!standard) return null;

  if (typeof standard === "string") {
    return isDisplayableStandardCandidate({ citation: standard })
      ? {
          citation: standard,
          heading: standard,
          title: standard,
          summary: "",
          source,
        }
      : null;
  }

  const citation =
    standard.citation ||
    standard.standard ||
    standard.standardNumber ||
    standard.code ||
    standard.reference ||
    "";

  if (!isDisplayableStandardCandidate({ ...standard, citation })) return null;

  return {
    ...standard,
    citation,
    heading:
      standard.heading ||
      standard.title ||
      standard.name ||
      standard.label ||
      standard.citation ||
      "Applicable standard",
    summary:
      standard.summary ||
      standard.plainLanguageSummary ||
      standard.titleSummary ||
      standard.reasoning ||
      standard.reason ||
      standard.description ||
      "",
    source,
  };
}

export function getHazLenzPrimaryStandards(result: any): any[] {
  const canonical = getHazLenzStandardDecisions(result);
  if (canonical.length) {
    const primary = canonical.filter((standard) => standard.authority === "primary");
    const supporting = canonical.filter((standard) => standard.authority === "supporting");
    const needsMore = canonical.filter((standard) => standard.authority === "needs_more_evidence");
    const preferred = primary.length > 0 ? primary : supporting.length > 0 ? supporting : needsMore;

    const seen = new Set<string>();
    const unique: any[] = [];
    for (const standard of preferred) {
      const key = standardKey(standard);
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(standard);
    }
    return unique.slice(0, 3);
  }

  const raw = [
    ...asArray(result?.primaryStandards).map((s) =>
      normalizeHazLenzStandard(s, "primaryStandards"),
    ),
    ...asArray(result?.suggestedStandards).map((s) =>
      normalizeHazLenzStandard(s, "suggestedStandards"),
    ),
    ...asArray(result?.standardsReasoning?.topDefensible).map((s) =>
      normalizeHazLenzStandard(s, "topDefensible"),
    ),
    ...asArray(result?.applicableStandards).map((s) =>
      normalizeHazLenzStandard(s, "applicableStandards"),
    ),
    ...asArray(result?.standardApplicability?.suggestedStandards).map((s) =>
      normalizeHazLenzStandard(s, "standardApplicability.suggestedStandards"),
    ),
    ...asArray(result?.needsMoreEvidenceStandards).map((s) =>
      normalizeHazLenzStandard(s, "needsMoreEvidenceStandards"),
    ),
    ...asArray(result?.standardApplicability?.needsMoreEvidenceStandards).map((s) =>
      normalizeHazLenzStandard(s, "standardApplicability.needsMoreEvidenceStandards"),
    ),
    ...asArray(result?.standardFamilyCandidates).map((s) =>
      normalizeHazLenzStandard(s, "standardFamilyCandidates"),
    ),
  ].filter(Boolean);

  const seen = new Set<string>();
  const unique: any[] = [];

  for (const standard of raw) {
    const key = standardKey(standard);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(standard);
  }

  return unique.slice(0, 3);
}

export function getHazLenzSupportingStandards(result: any): any[] {
  const canonical = getHazLenzStandardDecisions(result);
  if (canonical.length) {
    const primaryKeys = new Set(getHazLenzPrimaryStandards(result).map(standardKey));
    return canonical
      .filter((standard) => standard.authority === "supporting" || standard.authority === "advisory")
      .filter((standard) => !primaryKeys.has(standardKey(standard)))
      .slice(0, 4);
  }

  const primaryKeys = new Set(getHazLenzPrimaryStandards(result).map(standardKey));

  const raw = [
    ...asArray(result?.supportingStandards).map((s) =>
      normalizeHazLenzStandard(s, "supportingStandards"),
    ),
    ...asArray(result?.standardsReasoning?.supporting).map((s) =>
      normalizeHazLenzStandard(s, "supportingReasoning"),
    ),
  ].filter(Boolean);

  const seen = new Set<string>();
  const unique: any[] = [];

  for (const standard of raw) {
    const key = standardKey(standard);
    if (primaryKeys.has(key) || seen.has(key)) continue;
    seen.add(key);
    unique.push(standard);
  }

  return unique.slice(0, 4);
}
