function cleanText(value: unknown) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .replace(/\s+—\s+/g, " — ")
    .trim();
}

export function getStandardCitation(standard: any) {
  const raw =
    standard?.citation ||
    standard?.standard ||
    standard?.standardNumber ||
    standard?.code ||
    "";

  const text = cleanText(raw);

  const match =
    text.match(/\b\d+\s+CFR\s+\d+(?:\.\d+)?(?:\([a-z0-9]+\))*/i) ||
    text.match(/\b(?:§\s*)?\d+\.\d+(?:\([a-z0-9]+\))*/i);

  if (!match) return text;

  const value = match[0].replace(/^§\s*/, "").trim();

  if (/CFR/i.test(value)) return value.replace(/\s+/g, " ");

  if (/^(?:1910|1926)\./i.test(value)) return `29 CFR ${value}`;
  if (/^(?:56|57|75|77)\./i.test(value)) return `30 CFR ${value}`;
  return value || text;
}

function looksLikeGenericStandardLabel(value: string) {
  const text = cleanText(value).toLowerCase();
  if (!text) return true;

  return /^(review|pending|candidate standard|suggested candidate standard|fallback candidate standard|standard family|applicable standard|no specific standard selected yet|needs more evidence|review candidate standard|unknown|none|n\/a|na)(?:\s|$)/i.test(text) ||
    /\breview candidate standard\b/i.test(text) ||
    /\bstandard family\b/i.test(text);
}

function looksLikeCitationText(value: string) {
  const text = cleanText(value);
  if (!text) return false;

  return /\b(?:\d+\s*CFR\s*\d+(?:\.\d+)?(?:\([a-z0-9]+\))*|\d+\.\d+(?:\([a-z0-9]+\))*)\b/i.test(text);
}

export function isDisplayableStandardCandidate(standard: any) {
  const citation = getStandardCitation(standard);
  if (!looksLikeCitationText(citation)) return false;
  if (looksLikeGenericStandardLabel(citation)) return false;

  return true;
}

export function getStandardTitle(standard: any) {
  const citation = getStandardCitation(standard);
  const shortCitation = citation.replace(/^(?:29|30) CFR\s+/i, "");

  let title = cleanText(
    standard?.title ||
      standard?.heading ||
      standard?.name ||
      standard?.sectionTitle ||
      "",
  );

  title = title
    .replace(new RegExp(`^${escapeRegExp(citation)}\\s*[—:-]*\\s*`, "i"), "")
    .replace(new RegExp(`^§?\\s*${escapeRegExp(shortCitation)}\\s*`, "i"), "")
    .replace(/^§\s*/, "")
    .replace(/\s*[—:-]\s*$/, "")
    .trim();

  const duplicated = title.split(" — ");
  if (duplicated.length > 1) {
    title = Array.from(new Set(duplicated.map((part) => part.trim()).filter(Boolean))).join(" — ");
  }

  return title || "Applicable standard";
}

export function getStandardSummary(standard: any) {
  const citation = getStandardCitation(standard);
  const title = getStandardTitle(standard);
  const shortCitation = citation.replace(/^(?:29|30) CFR\s+/i, "");

  let summary = cleanText(
    standard?.standardText ||
      standard?.plainLanguageSummary ||
      standard?.summary ||
      standard?.rationale ||
      standard?.description ||
      standard?.text ||
      standard?.body ||
      "",
  );

  summary = summary
    .replace(new RegExp(`^${escapeRegExp(citation)}\\s*[—:-]*\\s*`, "i"), "")
    .replace(new RegExp(`^§?\\s*${escapeRegExp(shortCitation)}\\s*${escapeRegExp(title)}\\.?\\s*[—:-]*\\s*`, "i"), "")
    .replace(new RegExp(`^§?\\s*${escapeRegExp(shortCitation)}\\s*`, "i"), "")
    .replace(new RegExp(`^${escapeRegExp(title)}\\.?\\s*[—:-]*\\s*`, "i"), "")
    .replace(/^§\s*/, "")
    .trim();

  summary = collapseDuplicateSentences(summary);

  if (
    !summary ||
    summary === title ||
    summary === citation ||
    /\b(candidate standard|suggested candidate standard|fallback candidate standard|review needed|review candidate standard|standard family|no specific standard selected yet|needs more evidence|unknown|none|n\/a|na)\b/i.test(summary)
  ) {
    return "";
  }

  if (summary.length > 340) {
    summary = summary.slice(0, 337).replace(/\s+\S*$/, "") + "...";
  }

  return summary;
}

export type StandardDisplayText = {
  label: "Official standard text" | "Summary" | "HazLenz explanation" | "Unavailable";
  text: string;
  sourceField?: string;
};

export function getStandardDisplayText(standard: any): StandardDisplayText {
  const officialText = cleanText(
    standard?.standardText ||
      standard?.regulatoryText ||
      standard?.regulationText ||
      standard?.fullText ||
      "",
  );
  if (officialText) {
    return {
      label: "Official standard text",
      text: officialText,
      sourceField: standard?.standardText
        ? "standardText"
        : standard?.regulatoryText
          ? "regulatoryText"
          : standard?.regulationText
            ? "regulationText"
            : "fullText",
    };
  }

  const summary = cleanText(
    standard?.plainLanguageSummary ||
      standard?.approvedSummary ||
      standard?.summary ||
      standard?.titleSummary ||
      "",
  );
  if (summary && !looksLikeGenericStandardLabel(summary)) {
    return {
      label: "Summary",
      text: collapseDuplicateSentences(summary),
      sourceField: standard?.plainLanguageSummary
        ? "plainLanguageSummary"
        : standard?.approvedSummary
          ? "approvedSummary"
          : standard?.summary
            ? "summary"
            : "titleSummary",
    };
  }

  const explanation = cleanText(
    standard?.rationale ||
      standard?.reasoning ||
      standard?.reason ||
      standard?.explanation ||
      standard?.description ||
      standard?.body ||
      standard?.text ||
      "",
  );
  if (explanation && !looksLikeGenericStandardLabel(explanation)) {
    return {
      label: "HazLenz explanation",
      text: collapseDuplicateSentences(explanation),
      sourceField: standard?.rationale
        ? "rationale"
        : standard?.reasoning
          ? "reasoning"
          : standard?.reason
            ? "reason"
            : standard?.explanation
              ? "explanation"
              : standard?.description
                ? "description"
                : standard?.body
                  ? "body"
                  : "text",
    };
  }

  return {
    label: "Unavailable",
    text: "No standard text or approved summary is available for this matched standard.",
  };
}

export function formatStandardDisplay(standard: any) {
  if (!isDisplayableStandardCandidate(standard)) return "";

  const citation = getStandardCitation(standard);
  const title = getStandardTitle(standard);

  if (!citation && !title) return "Applicable standard";
  if (!citation) return title;
  if (
    !title ||
    title === "Applicable standard" ||
    /\b(candidate standard|suggested candidate standard|fallback candidate standard|review needed|review candidate standard|standard family|no specific standard selected yet|needs more evidence|unknown|none|n\/a|na)\b/i.test(title)
  ) {
    return citation;
  }

  return `${citation} — ${title}`;
}

export function dedupeStandards(standards: any[] = []) {
  const seen = new Set<string>();

  return standards.filter((standard) => {
    const key = [
      getStandardCitation(standard),
      getStandardTitle(standard),
    ]
      .join("|")
      .toLowerCase();

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function collapseDuplicateSentences(text: string) {
  const parts = text
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  const seen = new Set<string>();
  const unique: string[] = [];

  for (const part of parts) {
    const key = part.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(part);
  }

  return unique.join(" ");
}

function escapeRegExp(value: string) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
