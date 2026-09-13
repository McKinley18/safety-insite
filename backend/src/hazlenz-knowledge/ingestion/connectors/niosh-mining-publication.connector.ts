
import { readFileSync } from "fs";
import { join } from "path";

export type NioshMiningPublicationUrlItem = {
  url: string;
  titleHint?: string;
  hazardTags?: string[];
  equipmentTags?: string[];
  taskTags?: string[];
  standardTags?: string[];
  lessonTags?: string[];
};

export type NioshMiningPublicationDiscoveryItem = {
  externalId: string;
  title: string;
  sourceUrl: string;
  publishedAt?: string | null;
  summary: string;
  rawText: string;
  metadata: {
    hazardTags: string[];
    equipmentTags: string[];
    taskTags: string[];
    standardTags: string[];
    lessonTags: string[];
  };
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
      .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
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

function extractTitle(html: string, fallback: string) {
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1Match?.[1]) return stripHtml(h1Match[1]).slice(0, 180);

  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch?.[1]) return stripHtml(titleMatch[1]).slice(0, 180);

  return fallback;
}

function trimCdcPageText(text: string) {
  const startMarkers = [
    "Mining Topic",
    "Mining",
    "The National Institute for Occupational Safety and Health",
    "NIOSH Mining",
  ];

  const endMarkers = [
    "Page last reviewed",
    "Page last updated",
    "Centers for Disease Control and Prevention",
    "Exit Notification",
    "CONTACT CDC",
  ];

  let trimmed = text;

  const starts = startMarkers
    .map((marker) => trimmed.indexOf(marker))
    .filter((index) => index >= 0);

  if (starts.length) trimmed = trimmed.slice(Math.min(...starts));

  const ends = endMarkers
    .map((marker) => trimmed.indexOf(marker))
    .filter((index) => index > 0);

  if (ends.length) trimmed = trimmed.slice(0, Math.min(...ends));

  return normalizeWhitespace(trimmed);
}

function makeSummary(text: string) {
  return text
    .split(/[.!?]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 2)
    .join(". ")
    .slice(0, 500);
}

function inferTags(text: string, supplied: string[] = []) {
  const lower = text.toLowerCase();
  const tags = new Set(supplied);

  if (lower.includes("dust")) tags.add("respirable dust");
  if (lower.includes("silica")) tags.add("silica");
  if (lower.includes("noise")) tags.add("noise");
  if (lower.includes("hearing")) tags.add("hearing conservation");
  if (lower.includes("ventilation")) tags.add("ventilation");
  if (lower.includes("exposure")) tags.add("exposure assessment");
  if (lower.includes("control")) tags.add("control strategy");

  return Array.from(tags);
}

export class NioshMiningPublicationConnector {
  constructor(
    private readonly sourceListPath = join(
      process.cwd(),
      "src",
      "safescope-knowledge",
      "ingestion",
      "source-lists",
      "niosh-mining-publications.json",
    ),
  ) {}

  private loadUrls(): NioshMiningPublicationUrlItem[] {
    const raw = readFileSync(this.sourceListPath, "utf8");
    const parsed = JSON.parse(raw);

    if (parsed?.sourceKey !== "niosh-mining-publications") {
      throw new Error("Invalid source list: expected sourceKey niosh-mining-publications");
    }

    if (parsed?.agency !== "NIOSH") {
      throw new Error("Invalid source list: expected agency NIOSH");
    }

    return Array.isArray(parsed.urls)
      ? parsed.urls.filter((item: NioshMiningPublicationUrlItem) => item?.url)
      : [];
  }

  async discover(): Promise<NioshMiningPublicationDiscoveryItem[]> {
    const urls = this.loadUrls();
    const results: NioshMiningPublicationDiscoveryItem[] = [];

    for (const item of urls) {
      try {
        const response = await fetch(item.url, {
          headers: {
            "User-Agent":
              "SentinelSafetySafeScope/0.1 local governed safety research ingestion",
          },
        });

        if (!response.ok) {
          console.warn(`Skipped ${item.url}: HTTP ${response.status}`);
          continue;
        }

        const html = await response.text();
        const text = trimCdcPageText(stripHtml(html));

        if (text.length < 300) {
          console.warn(`Skipped ${item.url}: extracted text too short`);
          continue;
        }

        const title = extractTitle(
          html,
          item.titleHint || `NIOSH Mining Publication ${item.url}`,
        );

        const hazardTags = inferTags(text, item.hazardTags || []);

        results.push({
          externalId: `NIOSH-MINING-${slugFromUrl(item.url)}`.toUpperCase(),
          title,
          sourceUrl: item.url,
          publishedAt: null,
          summary: makeSummary(text),
          rawText: text.slice(0, 14000),
          metadata: {
            hazardTags,
            equipmentTags: item.equipmentTags || [],
            taskTags: item.taskTags || [],
            standardTags: item.standardTags || [],
            lessonTags: [
              ...(item.lessonTags || []),
              "federal research support",
              "not enforceable regulation",
              "qualified review recommended",
            ],
          },
        });
      } catch (error) {
        console.warn(
          `Error fetching ${item.url}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }

    return results;
  }
}
