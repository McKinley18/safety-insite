import * as fs from "fs";
import * as path from "path";

export type MshaProgramPolicyManualItem = {
  externalId: string;
  title: string;
  sourceUrl: string;
  summary: string;
  rawText: string;
  publishedAt?: string | null;
  metadata: {
    hazardTags: string[];
    equipmentTags: string[];
    taskTags: string[];
    standardTags: string[];
    lessonTags: string[];
  };
};

function slugFromUrl(url: string) {
  return url
    .replace(/^https?:\/\//, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function summarize(text: string) {
  const firstSentences = text.split(/[.!?]/).slice(0, 3).join(". ").trim();
  return firstSentences.slice(0, 500);
}

function loadSourceList() {
  const filePath = path.join(
    __dirname,
    "..",
    "source-lists",
    "msha-program-policy-manual.json",
  );

  const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));

  if (parsed.sourceKey !== "msha-program-policy-manual") {
    throw new Error("Invalid source list: expected sourceKey msha-program-policy-manual");
  }

  if (parsed.agency !== "MSHA") {
    throw new Error("Invalid source list: expected agency MSHA");
  }

  if (!Array.isArray(parsed.urls)) {
    throw new Error("Invalid MSHA PPM source list: urls must be an array.");
  }

  return parsed.urls;
}

export class MshaProgramPolicyManualConnector {
  async discover(): Promise<MshaProgramPolicyManualItem[]> {
    const items = loadSourceList();
    const discovered: MshaProgramPolicyManualItem[] = [];

    for (const item of items) {
      try {
        if (!String(item.url || "").startsWith("https://www.msha.gov/")) {
          console.warn(`Skipping invalid MSHA PPM URL: ${String(item.url)}`);
          continue;
        }

        const response = await fetch(item.url);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const html = await response.text();
        const text = stripHtml(html);

        if (!text || text.length < 250) {
          throw new Error("Content invalid or blocked.");
        }

        discovered.push({
          externalId: `msha-ppm-${slugFromUrl(item.url)}`,
          title: item.titleHint || "MSHA Program Policy Manual",
          sourceUrl: item.url,
          summary: summarize(text),
          rawText: text,
          publishedAt: item.publishedAt || null,
          metadata: {
            hazardTags: item.hazardTags || [],
            equipmentTags: item.equipmentTags || [],
            taskTags: item.taskTags || [],
            standardTags: item.standardTags || ["MSHA PPM"],
            lessonTags: item.lessonTags || [],
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

    return discovered;
  }
}
