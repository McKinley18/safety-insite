import { readFileSync } from "fs";
import { join } from "path";
import {
  buildSourceRegistryMetadata,
  mergeUniqueTags,
} from "../../sources/source-registry-metadata";

const MSHA_FATALITY_SOURCE_METADATA = buildSourceRegistryMetadata(
  "msha-fatality-reports",
);

export type MshaFatalityUrlItem = {
  url: string;
  titleHint?: string;
  hazardTags?: string[];
  equipmentTags?: string[];
  taskTags?: string[];
  lessonTags?: string[];
};

export type MshaFatalityDiscoveryItem = {
  externalId: string;
  title: string;
  sourceUrl: string;
  publishedAt?: string | null;
  summary: string;
  rawText: string;
  hazardTags: string[];
  equipmentTags: string[];
  taskTags: string[];
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

function inferHazardTags(text: string, supplied: string[] = []) {
  const lower = text.toLowerCase();
  const tags = new Set(supplied);

  if (
    lower.includes("conveyor") ||
    lower.includes("belt") ||
    lower.includes("pulley")
  ) {
    tags.add("machine guarding");
    tags.add("conveyor");
    tags.add("entanglement");
    tags.add("pinch point");
  }

  if (
    lower.includes("mobile equipment") ||
    lower.includes("truck") ||
    lower.includes("loader")
  ) {
    tags.add("mobile equipment");
    tags.add("struck by");
  }

  if (
    lower.includes("fall") ||
    lower.includes("elevated") ||
    lower.includes("ladder")
  ) {
    tags.add("fall hazard");
  }

  if (lower.includes("electrical") || lower.includes("energized")) {
    tags.add("electrical");
    tags.add("hazardous energy");
  }

  if (
    lower.includes("confined space") ||
    lower.includes("silo") ||
    lower.includes("tank")
  ) {
    tags.add("confined space");
  }

  if (lower.includes("trench") || lower.includes("excavation")) {
    tags.add("trenching");
    tags.add("excavation");
  }

  tags.add("fatality learning");
  tags.add("case study");

  return Array.from(tags);
}

function inferEquipmentTags(text: string, supplied: string[] = []) {
  const lower = text.toLowerCase();
  const tags = new Set(supplied);

  [
    "conveyor",
    "belt",
    "pulley",
    "loader",
    "haul truck",
    "truck",
    "forklift",
    "ladder",
    "electrical panel",
    "tank",
    "silo",
    "excavation",
    "trench",
  ].forEach((term) => {
    if (lower.includes(term)) tags.add(term);
  });

  return Array.from(tags);
}

function inferTaskTags(text: string, supplied: string[] = []) {
  const lower = text.toLowerCase();
  const tags = new Set(supplied);

  [
    "maintenance",
    "cleanup",
    "inspection",
    "repair",
    "travel",
    "loading",
    "dumping",
    "servicing",
  ].forEach((term) => {
    if (lower.includes(term)) tags.add(term);
  });

  tags.add("incident review");

  return Array.from(tags);
}

function inferLessonTags(text: string, supplied: string[] = []) {
  const lower = text.toLowerCase();
  const tags = new Set(supplied);

  if (lower.includes("guard")) tags.add("guarding verification");
  if (lower.includes("lock") || lower.includes("tag"))
    tags.add("hazardous energy control");
  if (lower.includes("training")) tags.add("training and task planning");
  if (lower.includes("examination")) tags.add("workplace examination");
  if (lower.includes("berm") || lower.includes("traffic"))
    tags.add("traffic control");
  if (lower.includes("blind")) tags.add("blind spot control");

  tags.add("fatality prevention");
  tags.add("incident learning");

  return Array.from(tags);
}

function trimMshaFatalityText(text: string) {
  const preferredStartMarkers = [
    "METAL/NONMETAL MINE FATALITY",
    "COAL MINE FATALITY",
    "MINE FATALITY",
    "Accident Report:",
    "Fatality Reference",
    "PDF Version",
  ];

  const fallbackStartMarkers = [
    "Breadcrumb Home Data and Reports Fatality Reports",
    "Home Data and Reports Fatality Reports",
  ];

  const endMarkers = [
    "Scroll to Top",
    "Forms Fatality Database",
    "U.S. Department of Labor Mine Safety and Health Administration",
    "Freedom of Information Act",
    "Important Website Notices",
  ];

  let trimmed = text;

  const preferredStartIndexes = preferredStartMarkers
    .map((marker) => trimmed.indexOf(marker))
    .filter((index) => index >= 0);

  if (preferredStartIndexes.length) {
    trimmed = trimmed.slice(Math.min(...preferredStartIndexes));
  } else {
    const fallbackStartIndexes = fallbackStartMarkers
      .map((marker) => trimmed.indexOf(marker))
      .filter((index) => index >= 0);

    if (fallbackStartIndexes.length) {
      trimmed = trimmed.slice(Math.min(...fallbackStartIndexes));
    }
  }

  const endIndexes = endMarkers
    .map((marker) => trimmed.indexOf(marker))
    .filter((index) => index > 0);

  if (endIndexes.length) {
    trimmed = trimmed.slice(0, Math.min(...endIndexes));
  }

  return normalizeWhitespace(trimmed);
}

function makeSummary(text: string) {
  const sentences = text
    .split(/[.!?]/)
    .map((item) => item.trim())
    .filter(Boolean);

  return sentences.slice(0, 2).join(". ").slice(0, 500);
}

function extractTitle(html: string, fallback: string) {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch?.[1]) {
    return normalizeWhitespace(stripHtml(titleMatch[1])).slice(0, 180);
  }

  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1Match?.[1]) {
    return normalizeWhitespace(stripHtml(h1Match[1])).slice(0, 180);
  }

  return fallback;
}

export class MshaFatalityConnector {
  constructor(
    private readonly sourceListPath = join(
      process.cwd(),
      "src",
      "safescope-knowledge",
      "ingestion",
      "source-lists",
      "msha-fatality-urls.json",
    ),
  ) {}

  private loadUrls(): MshaFatalityUrlItem[] {
    const raw = readFileSync(this.sourceListPath, "utf8");
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      throw new Error("MSHA fatality URL source list must be an array.");
    }

    return parsed.filter((item) => item?.url);
  }

  async discover(): Promise<MshaFatalityDiscoveryItem[]> {
    const urls = this.loadUrls();
    const results: MshaFatalityDiscoveryItem[] = [];

    for (const item of urls) {
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
      const pageText = stripHtml(html);
      const text = trimMshaFatalityText(pageText);

      if (text.length < 300) {
        console.warn(`Skipped ${item.url}: extracted text too short`);
        continue;
      }

      const title = extractTitle(
        html,
        item.titleHint || `MSHA Fatality Report ${item.url}`,
      );

      results.push({
        externalId: slugFromUrl(item.url),
        title,
        sourceUrl: item.url,
        publishedAt: null,
        summary: makeSummary(text),
        rawText: text.slice(0, 12000),
        hazardTags: inferHazardTags(text, item.hazardTags || []),
        equipmentTags: inferEquipmentTags(text, item.equipmentTags || []),
        taskTags: inferTaskTags(text, item.taskTags || []),
        lessonTags: inferLessonTags(text, item.lessonTags || []),
      });
    }

    return results;
  }
}
