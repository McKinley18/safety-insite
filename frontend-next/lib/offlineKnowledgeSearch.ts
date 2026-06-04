import {
  loadOfflineBrainBundle,
  type SafeScopeOfflineBrainBundle,
} from "./offlineBrainStorage";

const STOP_WORDS = new Set([
  "the",
  "and",
  "or",
  "a",
  "an",
  "to",
  "of",
  "in",
  "on",
  "for",
  "with",
  "near",
  "by",
  "at",
  "from",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "this",
  "that",
  "it",
  "as",
  "into",

  "hazard",
  "condition",
  "conditions",
  "evidence",
  "scope",
  "all",
  "review",
  "safe",
  "safety",
  "safescope",
  "photo",
  "attached",
  "area",
  "work",
  "working",
]);

function tokenize(value: string) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s/-]/g, " ")
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term.length > 2 && !STOP_WORDS.has(term));
}

function includesTerm(value: string, term: string) {
  return String(value || "")
    .toLowerCase()
    .includes(term);
}

function scoreChunk(query: string, terms: string[], chunk: any) {
  const text = [
    chunk.chunkText,
    chunk.chunkSummary,
    chunk.citation,
    ...(chunk.hazardTags || []),
    ...(chunk.equipmentTags || []),
    ...(chunk.taskTags || []),
    ...(chunk.standardTags || []),
    ...(chunk.lessonTags || []),
  ]
    .join(" ")
    .toLowerCase();

  let score = 0;

  for (const term of terms) {
    if (includesTerm(text, term)) score += 8;
    if ((chunk.hazardTags || []).some((tag: string) => includesTerm(tag, term)))
      score += 14;
    if (
      (chunk.equipmentTags || []).some((tag: string) => includesTerm(tag, term))
    )
      score += 12;
    if ((chunk.lessonTags || []).some((tag: string) => includesTerm(tag, term)))
      score += 8;
    if (
      (chunk.standardTags || []).some((tag: string) => includesTerm(tag, term))
    )
      score += 8;
  }

  const authorityTier = Number(chunk.authorityTier || 5);
  score += Math.max(0, 12 - authorityTier * 2);

  const confidenceWeight = Number(chunk.confidenceWeight || 0.5);
  score *= confidenceWeight;

  if (text.includes(query.toLowerCase())) score += 25;

  return Math.round(score);
}

function explainMatch(terms: string[], chunk: any) {
  const text = [
    chunk.chunkText,
    chunk.chunkSummary,
    chunk.citation,
    ...(chunk.hazardTags || []),
    ...(chunk.equipmentTags || []),
    ...(chunk.taskTags || []),
    ...(chunk.standardTags || []),
    ...(chunk.lessonTags || []),
  ]
    .join(" ")
    .toLowerCase();

  const matchedTerms = terms.filter((term) => text.includes(term)).slice(0, 8);

  return [
    matchedTerms.length ? `Matched terms: ${matchedTerms.join(", ")}` : null,
    `Authority tier ${chunk.authorityTier || 5}`,
    chunk.citation ? `Reference: ${chunk.citation}` : null,
    "Offline approved brain bundle",
  ]
    .filter(Boolean)
    .join(" · ");
}

function evidenceGaps(query: string, matches: any[]) {
  const lower = query.toLowerCase();
  const gaps: string[] = [];

  if (!lower.includes("photo") && !lower.includes("image")) {
    gaps.push("Confirm visible evidence or attach a supporting photo.");
  }

  if (
    lower.includes("machine") ||
    lower.includes("conveyor") ||
    lower.includes("guard") ||
    lower.includes("equipment")
  ) {
    gaps.push(
      "Confirm operating/energy state and whether maintenance is involved.",
    );
  }

  if (
    lower.includes("fall") ||
    lower.includes("platform") ||
    lower.includes("ladder")
  ) {
    gaps.push(
      "Confirm working height, edge protection, access method, and fall protection status.",
    );
  }

  if (
    lower.includes("electrical") ||
    lower.includes("panel") ||
    lower.includes("cord")
  ) {
    gaps.push(
      "Confirm whether parts are energized and whether qualified electrical review is required.",
    );
  }

  if (lower.includes("trench") || lower.includes("excavation")) {
    gaps.push(
      "Confirm excavation depth, soil condition, protective system, spoil location, and competent person review.",
    );
  }

  if (!matches.length) {
    gaps.push(
      "No approved offline reference matched strongly. Run online SafeScope review when available.",
    );
  }

  return Array.from(new Set(gaps)).slice(0, 4);
}

export function searchOfflineKnowledgeBrain(input: {
  query: string;
  agency?: string;
  limit?: number;
  bundle?: SafeScopeOfflineBrainBundle | null;
}) {
  const bundle = input.bundle || loadOfflineBrainBundle();
  const query = String(input.query || "").trim();
  const agency = String(input.agency || "all");
  const limit = input.limit || 8;

  if (!bundle || !query) {
    return {
      offline: true,
      available: Boolean(bundle),
      query,
      confidence: 0,
      matches: [],
      reasoning: {
        evidenceGaps: ["Offline brain bundle is not available."],
        caution:
          "SafeScope could not access the approved local knowledge bundle.",
      },
    };
  }

  const terms = tokenize(query);

  const documentsById = new Map(
    (bundle.documents || []).map((document: any) => [document.id, document]),
  );

  const scored = (bundle.chunks || [])
    .map((chunk: any) => {
      const document = documentsById.get(chunk.documentId) || {};
      const agencyMatches =
        agency === "all" ||
        !agency ||
        String((document as any).agency || "").toLowerCase() ===
          agency.toLowerCase();

      if (!agencyMatches) return null;

      const score = scoreChunk(query, terms, chunk);
      if (score < 18) return null;

      return {
        chunk,
        document,
        score,
      };
    })
    .filter(Boolean)
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, limit);

  const matches = scored.map((item: any) => ({
    chunkId: item.chunk.id,
    documentId: item.chunk.documentId,
    title: item.document.title,
    agency: item.document.agency,
    sourceType: item.document.sourceType,
    authorityTier: item.chunk.authorityTier,
    citation: item.chunk.citation,
    sourceUrl: item.document.sourceUrl,
    sectionHeading: item.chunk.sectionHeading,
    excerpt: item.chunk.chunkText,
    tags: {
      hazards: item.chunk.hazardTags || [],
      equipment: item.chunk.equipmentTags || [],
      tasks: item.chunk.taskTags || [],
      standards: item.chunk.standardTags || [],
      lessons: item.chunk.lessonTags || [],
    },
    score: item.score,
    reason: explainMatch(terms, item.chunk),
  }));

  const maxScore = matches[0]?.score || 0;

  return {
    offline: true,
    available: true,
    query,
    bundleVersion: bundle.version,
    generatedAt: bundle.generatedAt,
    confidence: Math.min(0.95, Number((maxScore / 100).toFixed(2))),
    matches,
    reasoning: {
      evidenceGaps: evidenceGaps(query, matches),
      caution:
        "Offline SafeScope references the last approved local brain bundle. Final compliance decisions require qualified review.",
    },
  };
}
