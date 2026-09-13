
import { readFileSync } from "fs";
import { join } from "path";

export type OshaIncidentDatabaseUrlItem = {
  url: string;
  titleHint?: string;
  hazardTags?: string[];
  equipmentTags?: string[];
  taskTags?: string[];
  standardTags?: string[];
  lessonTags?: string[];
};

export type OshaIncidentDatabaseDiscoveryItem = {
  externalId: string;
  title: string;
  sourceUrl: string;
  summary: string;
  rawText: string;
  hazardTags: string[];
  equipmentTags: string[];
  taskTags: string[];
  standardTags: string[];
  lessonTags: string[];
};

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function stripHtml(html: string) {
  return normalizeWhitespace(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">"),
  );
}

function slugFromUrl(url: string) {
  return url
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function makeSummary(text: string) {
  const sentences = text
    .split(/[.!?]/)
    .map((item) => item.trim())
    .filter(Boolean);

  return sentences.slice(0, 3).join(". ").slice(0, 700);
}

function extractTitle(html: string, fallback: string) {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch?.[1]) return normalizeWhitespace(stripHtml(titleMatch[1])).slice(0, 180);

  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1Match?.[1]) return normalizeWhitespace(stripHtml(h1Match[1])).slice(0, 180);

  return fallback;
}

function trimIncidentDatabaseText(text: string) {
  const startMarkers = [
    "Investigation Summaries",
    "Accident Investigation Search",
    "The summaries currently available",
    "OSHA Integrated Management Information System",
  ];

  const endMarkers = [
    "Freedom of Information Act",
    "U.S. Department of Labor",
    "Occupational Safety and Health Administration",
  ];

  let trimmed = text;

  const starts = startMarkers
    .map((marker) => trimmed.indexOf(marker))
    .filter((index) => index >= 0);

  if (starts.length) {
    trimmed = trimmed.slice(Math.min(...starts));
  }

  const ends = endMarkers
    .map((marker) => trimmed.indexOf(marker))
    .filter((index) => index > 0);

  if (ends.length) {
    trimmed = trimmed.slice(0, Math.min(...ends));
  }

  return normalizeWhitespace(trimmed);
}

export class OshaIncidentDatabaseConnector {
  constructor(
    private readonly sourceListPath = join(
      process.cwd(),
      "src",
      "safescope-knowledge",
      "ingestion",
      "source-lists",
      "osha-incident-database.json",
    ),
  ) {}

  private loadUrls(): OshaIncidentDatabaseUrlItem[] {
    const raw = readFileSync(this.sourceListPath, "utf8");
    const parsed = JSON.parse(raw);

    if (!parsed || !Array.isArray(parsed.urls)) {
      throw new Error("OSHA incident database source list must include urls.");
    }

    return parsed.urls.filter((item: OshaIncidentDatabaseUrlItem) => item?.url);
  }

  async discover(): Promise<OshaIncidentDatabaseDiscoveryItem[]> {
    const urls = this.loadUrls();
    const results: OshaIncidentDatabaseDiscoveryItem[] = [];

    for (const item of urls) {
      const response = await fetch(item.url, {
        headers: {
          "User-Agent": "SentinelSafetySafeScope/0.1 local governed safety research ingestion",
        },
      });

      if (!response.ok) {
        console.warn(`Skipped ${item.url}: HTTP ${response.status}`);
        continue;
      }

      const html = await response.text();
      const pageText = stripHtml(html);
      const text = trimIncidentDatabaseText(pageText);

      const fallbackText = [
        item.titleHint || "OSHA Accident Investigation Search",
        "OSHA's accident investigation and fatality/catastrophe information is used by SafeScope as an official incident-database source profile for incident-pattern learning, trend intelligence, recurrence detection, and fatality prevention context.",
        "This source is not treated as an enforceable citation by itself. It supports incident learning and pattern recognition only, and SafeScope must continue to rely on OSHA standards, MSHA standards, and qualified review for final compliance determinations.",
        "Relevant learning signals include fatality and catastrophe patterns, accident investigation summaries, event type, task context, equipment involved, causal themes, and recurrence prevention opportunities.",
      ].join(" ");

      const finalText = text.length >= 200 ? text : fallbackText;

      if (text.length < 200) {
        console.warn(
          `Using governed source-profile fallback for ${item.url}: extracted text too short`,
        );
      }

      const title = extractTitle(
        html,
        item.titleHint || "OSHA Incident Database",
      );

      results.push({
        externalId: slugFromUrl(item.url),
        title,
        sourceUrl: item.url,
        summary: makeSummary(finalText),
        rawText: finalText.slice(0, 12000),
        hazardTags: item.hazardTags || [],
        equipmentTags: item.equipmentTags || [],
        taskTags: item.taskTags || [],
        standardTags: item.standardTags || [],
        lessonTags: item.lessonTags || [],
      });
    }

    return results;
  }
}
