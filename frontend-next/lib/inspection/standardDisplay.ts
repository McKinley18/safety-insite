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

  return value ? `30 CFR ${value}` : text;
}

export function getStandardTitle(standard: any) {
  const citation = getStandardCitation(standard);
  const shortCitation = citation.replace(/^30 CFR\s+/i, "");

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
  const shortCitation = citation.replace(/^30 CFR\s+/i, "");

  let summary = cleanText(
    standard?.summary ||
      standard?.rationale ||
      standard?.text ||
      standard?.standardText ||
      standard?.description ||
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

  if (summary.length > 340) {
    summary = summary.slice(0, 337).replace(/\s+\S*$/, "") + "...";
  }

  return summary;
}

export function formatStandardDisplay(standard: any) {
  const citation = getStandardCitation(standard);
  const title = getStandardTitle(standard);

  if (!citation && !title) return "Applicable standard";
  if (!citation) return title;
  if (!title || title === "Applicable standard") return citation;

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
