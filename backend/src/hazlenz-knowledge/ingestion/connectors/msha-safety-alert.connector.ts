import { readFileSync } from "fs";
import { join } from "path";
import { buildSourceRegistryMetadata } from "../../sources/source-registry-metadata";

const MSHA_METADATA = buildSourceRegistryMetadata("msha-safety-alerts");

export type MshaAlertUrlItem = {
  url: string;
  titleHint?: string;
  standardTags?: string[];
  hazardTags?: string[];
  equipmentTags?: string[];
  taskTags?: string[];
  lessonTags?: string[];
};

export type MshaAlertDiscoveryItem = {
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

export class MshaSafetyAlertConnector {
  constructor(
    private readonly sourceListPath = join(
      process.cwd(),
      "src",
      "safescope-knowledge",
      "ingestion",
      "source-lists",
      "msha-safety-alerts.json",
    ),
  ) {}

  private validateItem(item: any): MshaAlertUrlItem | null {
    const url = typeof item === "string" ? item : item?.url;
    if (typeof url !== "string" || !url.startsWith("https://www.msha.gov")) {
      console.warn(`Skipping invalid MSHA URL: ${String(url)}`);
      return null;
    }
    return typeof item === "string" ? { url } : { ...item, url };
  }

  private loadUrls(): MshaAlertUrlItem[] {
    const raw = readFileSync(this.sourceListPath, "utf8");
    const parsed = JSON.parse(raw);

    if (parsed.sourceKey !== "msha-safety-alerts") {
      throw new Error(
        "Invalid source list: expected sourceKey msha-safety-alerts",
      );
    }

    if (parsed.agency !== "MSHA") {
      throw new Error("Invalid source list: expected agency MSHA");
    }

    if (!Array.isArray(parsed.urls)) return [];
    return parsed.urls
      .map((i: any) => this.validateItem(i))
      .filter(Boolean) as MshaAlertUrlItem[];
  }

  async discover(): Promise<MshaAlertDiscoveryItem[]> {
    const items = this.loadUrls();
    const results: MshaAlertDiscoveryItem[] = [];

    for (const item of items) {
      try {
        const response = await fetch(item.url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const html = await response.text();
        const text = stripHtml(html);

        results.push({
          externalId: `msha-alert-${slugFromUrl(item.url)}`,
          title: item.titleHint || "MSHA Safety Alert",
          sourceUrl: item.url,
          summary: text.slice(0, 300) + "...",
          rawText: text,
          metadata: {
            ...MSHA_METADATA,
            standardTags: item.standardTags || [],
            hazardTags: item.hazardTags || [],
            equipmentTags: item.equipmentTags || [],
            taskTags: item.taskTags || [],
            lessonTags: item.lessonTags || [],
          },
        });
      } catch (e) {
        console.error(`Error fetching ${item.url}:`, e);
      }
    }
    return results;
  }
}
