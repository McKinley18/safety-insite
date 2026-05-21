import { readFileSync } from "fs";
import { join } from "path";
import { buildSourceRegistryMetadata } from "../../sources/source-registry-metadata";

const OSHA_INTERPRETATION_METADATA = buildSourceRegistryMetadata(
  "osha-standard-interpretations",
);

export type OshaStandardInterpretationUrlItem = {
  url: string;
  titleHint?: string;
  standardTags?: string[];
  hazardTags?: string[];
  equipmentTags?: string[];
  taskTags?: string[];
  lessonTags?: string[];
};

export type OshaStandardInterpretationDiscoveryItem = {
  externalId: string;
  title: string;
  sourceUrl: string;
  summary: string;
  rawText: string;
  metadata: any;
};

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

  private loadUrls(): OshaStandardInterpretationUrlItem[] {
    const raw = readFileSync(this.sourceListPath, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.urls)) return [];

    return parsed.urls
      .map((item: any) => {
        if (typeof item === "string") return { url: item };
        return item;
      })
      .filter(
        (item: any) =>
          typeof item?.url === "string" && item.url.includes("osha.gov"),
      );
  }

  async discover(): Promise<OshaStandardInterpretationDiscoveryItem[]> {
    const urls = this.loadUrls();
    const results: OshaStandardInterpretationDiscoveryItem[] = [];

    for (const item of urls) {
      // NOTE: Placeholder for future ingestion logic
      console.log(`Discovery: Placeholder for ${item.url}`);
    }

    return results;
  }
}
