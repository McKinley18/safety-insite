import { readFileSync } from "fs";
import { join } from "path";
import { buildSourceRegistryMetadata } from "../../sources/source-registry-metadata";

const MSHA_METADATA = buildSourceRegistryMetadata("msha-30-cfr-standards");

export type Msha30CfrUrlItem = {
  url: string;
  fetchUrl: string;
  part: string;
  subpart: string;
  titleHint?: string;
  hazardTags?: string[];
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

function stripHtml(xml: string) {
  let cleaned = xml.replace(
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

function extractXmlBlock(
  xml: string,
  startRegex: RegExp,
  nextRegex: RegExp,
): string | null {
  const startMatch = startRegex.exec(xml);
  if (!startMatch || startMatch.index < 0) return null;

  const start = startMatch.index;
  const remainder = xml.slice(start + startMatch[0].length);
  const nextMatch = nextRegex.exec(remainder);

  if (!nextMatch || nextMatch.index < 0) return xml.slice(start);

  return xml.slice(start, start + startMatch[0].length + nextMatch.index);
}

function extractSubpartXml(
  xml: string,
  part: string,
  subpart: string,
): string | null {
  const partBlock = extractXmlBlock(
    xml,
    new RegExp(`<DIV5\\s+N="${part}"[^>]*TYPE="PART"[^>]*>`, "i"),
    /<DIV5\s+N="[^"]+"[^>]*TYPE="PART"[^>]*>/i,
  );

  if (!partBlock) return null;

  return extractXmlBlock(
    partBlock,
    new RegExp(`<DIV6\\s+N="${subpart}"[^>]*TYPE="SUBPART"[^>]*>`, "i"),
    /<DIV6\s+N="[^"]+"[^>]*TYPE="SUBPART"[^>]*>/i,
  );
}

function validateContent(text: string, part: string, subpart: string): boolean {
  const blocked = [
    "request access",
    "automated scraping",
    "captcha",
    "please complete the captcha",
    "federal register :: request access",
  ];
  if (blocked.some((b) => text.toLowerCase().includes(b))) return false;
  // Look for § marker followed by part number
  const hasCfrMarker = text.includes(`§ ${part}.`) || text.includes(`${part}.`);
  const hasSubpart = text.includes(`Subpart ${subpart}`);
  return text.length > 500 && hasCfrMarker && hasSubpart;
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

  private loadUrls(): Msha30CfrUrlItem[] {
    const raw = readFileSync(this.sourceListPath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.urls) ? parsed.urls : [];
  }

  async discover(): Promise<Msha30CfrDiscoveryItem[]> {
    const items = this.loadUrls();
    const results: Msha30CfrDiscoveryItem[] = [];

    for (const item of items) {
      try {
        const response = await fetch(item.fetchUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const xml = await response.text();

        const subpartXml = extractSubpartXml(xml, item.part, item.subpart);

        if (!subpartXml) {
          console.warn(
            `Could not locate Part ${item.part} Subpart ${item.subpart} for: ${item.url}`,
          );
          continue;
        }

        const extracted = stripHtml(subpartXml);

        // Ensure markers exist
        if (!validateContent(extracted, item.part, item.subpart)) {
          console.warn(`Content invalid or blocked for: ${item.url}`);
          continue;
        }

        results.push({
          externalId: `msha-30-cfr-${slugFromUrl(item.url)}`,
          title: item.titleHint || "MSHA 30 CFR Standard",
          sourceUrl: item.url,
          summary: extracted.slice(0, 300) + "...",
          rawText: extracted,
          metadata: {
            ...MSHA_METADATA,
            standardTags: item.standardTags || [],
            hazardTags: item.hazardTags || [],
          },
        });
      } catch (e) {
        console.warn(`Warning fetching ${item.fetchUrl}: ${e}`);
      }
    }
    return results;
  }
}
