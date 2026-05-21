import { readFileSync } from "fs";
import { join } from "path";
import { buildSourceRegistryMetadata } from "../../sources/source-registry-metadata";

const OSHA_METADATA = buildSourceRegistryMetadata(
  "osha-standard-interpretations",
);

export type OshaUrlItem = {
  url: string;
  titleHint?: string;
  standardTags?: string[];
  hazardTags?: string[];
  equipmentTags?: string[];
  taskTags?: string[];
  lessonTags?: string[];
};

export type OshaDiscoveryItem = {
  externalId: string;
  title: string;
  sourceUrl: string;
  summary: string;
  rawText: string;
  metadata: any;
};

function stripHtml(html: string) {
  // Remove non-content tags
  let cleaned = html.replace(
    /<(script|style|noscript|nav|footer|header|svg|form)[^>]*>[\s\S]*?<\/\1>/gi,
    " ",
  );
  // Remove boilerplate blocks
  cleaned = cleaned.replace(/<div id="goog-gt-tt"[^>]*>[\s\S]*?<\/div>/gi, " ");
  cleaned = cleaned.replace(
    /<select[^>]*id="[^"]*language[^"]*"[^>]*>[\s\S]*?<\/select>/gi,
    " ",
  );
  // Remove all other tags
  cleaned = cleaned.replace(/<[^>]*>?/gm, " ");
  // Clean whitespace
  return cleaned.replace(/\s+/g, " ").trim();
}

function extractInterpretationBody(text: string) {
  const preferredStarts = [
    /Questions?:/i,
    /Responses?:/i,
    /Dear\s+/i,
    /Standard Number:/i,
  ];

  for (const pattern of preferredStarts) {
    const index = text.search(pattern);
    if (index !== -1) return text.substring(index).trim();
  }

  return text.trim();
}

function slugFromUrl(url: string) {
  return url
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export class OshaStandardInterpretationConnector {
  constructor(
    private readonly sourceListPath = join(
      process.cwd(),
      "src",
      "safescope-knowledge",
      "ingestion",
      "source-lists",
      "osha-standard-interpretations.json",
    ),
  ) {}

  private validateItem(item: any): OshaUrlItem | null {
    const url = typeof item === "string" ? item : item?.url;
    if (typeof url !== "string" || !url.startsWith("https://www.osha.gov")) {
      console.warn(`Skipping invalid OSHA interpretation URL: ${String(url)}`);
      return null;
    }
    if (!url.includes("/laws-regs/standardinterpretations/")) {
      console.warn(`Skipping non-interpretation OSHA URL: ${url}`);
      return null;
    }
    return typeof item === "string" ? { url } : { ...item, url };
  }

  private loadUrls(): OshaUrlItem[] {
    const raw = readFileSync(this.sourceListPath, "utf8");
    const parsed = JSON.parse(raw);

    if (parsed.sourceKey !== "osha-standard-interpretations") {
      throw new Error(
        "Invalid source list: expected sourceKey osha-standard-interpretations",
      );
    }

    if (parsed.agency !== "OSHA") {
      throw new Error("Invalid source list: expected agency OSHA");
    }

    if (!Array.isArray(parsed.urls)) return [];
    return parsed.urls
      .map((i: any) => this.validateItem(i))
      .filter(Boolean) as OshaUrlItem[];
  }

  async discover(): Promise<OshaDiscoveryItem[]> {
    const items = this.loadUrls();
    const results: OshaDiscoveryItem[] = [];

    for (const item of items) {
      try {
        const response = await fetch(item.url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const html = await response.text();
        const rawStripped = stripHtml(html);
        const text = extractInterpretationBody(rawStripped);

        results.push({
          externalId: `osha-int-${slugFromUrl(item.url)}`,
          title: item.titleHint || "OSHA Standard Interpretation",
          sourceUrl: item.url,
          summary: text.slice(0, 300) + "...",
          rawText: text,
          metadata: {
            ...OSHA_METADATA,
            standardTags: item.standardTags || [],
            hazardTags: item.hazardTags || [],
          },
        });
      } catch (e) {
        console.error(`Error fetching ${item.url}:`, e);
      }
    }
    return results;
  }
}
