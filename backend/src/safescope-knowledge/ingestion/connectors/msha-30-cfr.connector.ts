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
  sections: Array<{
    citation: string;
    sectionNumber: string;
    sectionHeading: string;
    sectionText: string;
  }>;
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
  return nextMatch
    ? xml.slice(start, start + startMatch[0].length + nextMatch.index)
    : xml.slice(start);
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

  const normalized = text.toLowerCase();
  if (blocked.some((b) => normalized.includes(b))) return false;

  const hasCfrMarker =
    normalized.includes(`§ ${part}.`) || normalized.includes(`${part}.`);
  const hasSubpart =
    normalized.includes(`subpart ${subpart.toLowerCase()}`) ||
    normalized.includes(`subpart ${subpart.toLowerCase()}—`) ||
    normalized.includes(`subpart ${subpart.toLowerCase()}-`);
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

        const rawStripped = stripHtml(subpartXml);
        if (!validateContent(rawStripped, item.part, item.subpart)) {
          console.warn(`Content invalid or blocked for: ${item.url}`);
          continue;
        }

        // Section Extraction: <DIV8 TYPE="SECTION"> ... </DIV8>
        const sectionRegex =
          /<DIV8[^>]*TYPE="SECTION"[^>]*>([\s\S]*?)<\/DIV8>/gi;
        const sections: any[] = [];
        let sectionMatch;
        while ((sectionMatch = sectionRegex.exec(subpartXml)) !== null) {
          const sectionHtml = sectionMatch[1];
          const headingMatch = sectionHtml.match(/<HEAD>([\s\S]*?)<\/HEAD>/i);
          const headingText = headingMatch ? stripHtml(headingMatch[1]) : "";
          const sectionNumberMatch = headingText.match(
            /§\s*(\d+\.\d+(?:-\d+)?)/,
          );
          const sectionNumber = sectionNumberMatch?.[1] || "";

          if (!sectionNumber) {
            continue;
          }

          sections.push({
            citation: `30 CFR ${sectionNumber}`,
            sectionNumber,
            sectionHeading: headingText || `§ ${sectionNumber}`,
            sectionText: stripHtml(sectionHtml),
            sourceUrl: `${item.url}#${sectionNumber}`,
          });
        }

        results.push({
          externalId: `msha-30-cfr-${slugFromUrl(item.url)}`,
          title: item.titleHint || "MSHA 30 CFR Standard",
          sourceUrl: item.url,
          summary: rawStripped.slice(0, 300) + "...",
          rawText: rawStripped,
          metadata: {
            ...MSHA_METADATA,
            standardTags: item.standardTags || [],
            hazardTags: item.hazardTags || [],
          },
          sections,
        });
      } catch (e) {
        console.warn(`Warning fetching ${item.fetchUrl}: ${e}`);
      }
    }
    return results;
  }
}
