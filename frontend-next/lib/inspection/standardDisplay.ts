export function compactStandardValue(value: any): string {
  if (value === undefined || value === null || value === "") return "";

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value).trim();
  }

  if (Array.isArray(value)) {
    return value.map(compactStandardValue).filter(Boolean).join(" • ");
  }

  if (typeof value === "object") {
    return Object.entries(value)
      .map(([key, item]) => {
        const rendered = compactStandardValue(item);
        const label = key.replace(/([A-Z])/g, " $1").trim();
        return rendered ? `${label}: ${rendered}` : "";
      })
      .filter(Boolean)
      .join(" • ");
  }

  return String(value).trim();
}

export function getStandardCitation(standard: any): string {
  if (!standard) return "";

  return compactStandardValue(
    standard.citation ||
      standard.standard ||
      standard.standardNumber ||
      standard.regulation ||
      standard.regulationNumber ||
      standard.reference ||
      standard.id ||
      "",
  );
}

export function getStandardTitle(standard: any): string {
  if (!standard) return "";

  return compactStandardValue(
    standard.title ||
      standard.name ||
      standard.citationTitle ||
      standard.standardTitle ||
      standard.sectionTitle ||
      standard.heading ||
      "",
  );
}

export function getStandardSummary(standard: any): string {
  if (!standard) return "";

  return compactStandardValue(
    standard.plainLanguageSummary ||
      standard.summary ||
      standard.description ||
      standard.reasoning ||
      standard.reason ||
      standard.rationale ||
      standard.applicabilityReason ||
      standard.matchingReasons ||
      standard.why ||
      "",
  );
}

export function formatStandardDisplay(standard: any): string {
  if (!standard) return "Suggested standard";
  if (typeof standard === "string") return standard;

  const citation = getStandardCitation(standard);
  const title = getStandardTitle(standard);
  const summary = getStandardSummary(standard);

  return [citation, title, summary].filter(Boolean).join(" — ") || "Suggested standard";
}
