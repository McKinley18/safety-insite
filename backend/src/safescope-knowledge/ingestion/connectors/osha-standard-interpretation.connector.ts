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
  return html
    .replace(/<[^>]*>?/gm, " ")
    .replace(/\s+/g, " ")
    .trim();
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

    if (typeof item === "string") return { url };

    return { ...item, url };
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
      .map((item: any) => this.validateItem(item))
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
        const text = stripHtml(html);

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
