import { readFileSync } from "fs";
import { join } from "path";
import { buildSourceRegistryMetadata } from "../../sources/source-registry-metadata";

const MSHA_METADATA = buildSourceRegistryMetadata("msha-30-cfr-standards");

export type Msha30CfrUrlItem = {
  url: string;
  titleHint?: string;
  hazardTags?: string[];
  equipmentTags?: string[];
  taskTags?: string[];
  lessonTags?: string[];
  standardTags?: string[];
};

export type Msha30CfrDiscoveryItem = {
  externalId: string;
  title: string;
  sourceUrl: string;
  summary: string;
  rawText: string;
  metadata: any;
};

function stripHtml(html: string) {
  let cleaned = html.replace(
    /<(script|style|noscript|nav|footer|header|svg|form)[^>]*>[\s\S]*?<\/\1>/gi,
    " ",
  );
  cleaned = cleaned.replace(/<[^>]*>?/gm, " ");
  return cleaned.replace(/\s+/g, " ").trim();
}

function slugFromUrl(url: string) {
  return url
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export class Msha30CfrConnector {
  constructor(
    private readonly sourceListPath = join(
      process.cwd(),
      "src",
      "safescope-knowledge",
      "ingestion",
      "source-lists",
      "msha-30-cfr-core.json",
    ),
  ) {}

  private validateItem(item: any): Msha30CfrUrlItem | null {
    const url = typeof item === "string" ? item : item?.url;
    if (typeof url !== "string" || !url.startsWith("https://www.ecfr.gov")) {
      console.warn(`Skipping invalid MSHA CFR URL: ${String(url)}`);
      return null;
    }
    return typeof item === "string" ? { url } : { ...item, url };
  }

  private loadUrls(): Msha30CfrUrlItem[] {
    const raw = readFileSync(this.sourceListPath, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.urls)) return [];
    return parsed.urls
      .map((i: any) => this.validateItem(i))
      .filter(Boolean) as Msha30CfrUrlItem[];
  }

  async discover(): Promise<Msha30CfrDiscoveryItem[]> {
    const items = this.loadUrls();
    const results: Msha30CfrDiscoveryItem[] = [];

    for (const item of items) {
      try {
        const response = await fetch(item.url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const html = await response.text();
        const text = stripHtml(html);

        results.push({
          externalId: `msha-30-cfr-${slugFromUrl(item.url)}`,
          title: item.titleHint || "MSHA 30 CFR Standard",
          sourceUrl: item.url,
          summary: text.slice(0, 300) + "...",
          rawText: text,
          metadata: {
            ...MSHA_METADATA,
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
