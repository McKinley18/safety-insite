import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { RegulatoryParagraph } from '../src/regulatory/entities/regulatory-paragraph.entity';

// Splits an eCFR bulk-XML section into individually addressable paragraph/subsection
// records, e.g. "29 CFR 1910.212(a)(1)". eCFR bulk XML represents each paragraph as a
// flat sibling <P> tag (no nesting), where the FIRST characters of the paragraph text
// carry its outline marker(s) -- "(a)", "(1)", "(i)", "(A)", or a compound leading
// marker like "(B)(1)" that opens a new level-4 item and its first level-5 child in
// the same <P>. There is no structural nesting in the source to lean on, so this
// reconstructs the outline path with a small state machine over marker TYPE
// (lower-letter / digit / lower-roman / upper-letter) and the current stack depth.
// Single characters that are ambiguous between a level-1 letter and a level-3 roman
// numeral (i, v, x, l, c, d, m) are disambiguated by what level the stack is
// currently sitting at (a roman numeral only ever follows a digit-level parent).
// This is a best-effort reconstruction of standard CFR outline conventions, not a
// guaranteed-exact parser -- known limitation documented in
// STANDARDS_PARAGRAPH_RESOLUTION.md.

type StackEntry = { level: number; value: string };

const ROMAN_SINGLE = new Set(['i', 'v', 'x', 'l', 'c', 'd', 'm']);
const ROMAN_MULTI = /^[ivxlcdm]{2,}$/i;

function classify(token: string, stack: StackEntry[]): number {
  if (/^\d+$/.test(token)) {
    const lastLevel = stack.length ? stack[stack.length - 1].level : 0;
    // A digit immediately after an upper-letter level (4) is the level-5 sub-item
    // convention seen in eCFR text, e.g. "(B)(1)". Otherwise it's the standard
    // level-2 numbered paragraph.
    return lastLevel === 4 ? 5 : 2;
  }
  if (/^[A-Z]$/.test(token)) return 4;
  if (ROMAN_MULTI.test(token)) return 3;
  if (/^[a-z]$/.test(token) && ROMAN_SINGLE.has(token)) {
    const lastLevel = stack.length ? stack[stack.length - 1].level : 0;
    // Ambiguous between level-1 letter and level-3 roman numeral. A roman numeral
    // only ever directly follows a level-2 (digit) or another level-3 entry.
    return lastLevel === 2 || lastLevel === 3 ? 3 : 1;
  }
  if (/^[a-z]$/.test(token)) return 1;
  return 0;
}

function applyToken(stack: StackEntry[], token: string): StackEntry[] {
  const level = classify(token, stack);
  if (!level) return stack;
  if (level === 1) return [{ level, value: token }];
  const next = stack.filter((entry) => entry.level < level);
  next.push({ level, value: token });
  return next;
}

function stripTags(text: string): string {
  return text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function extractLeadingMarkers(rawText: string): { markers: string[]; rest: string } {
  const text = rawText.trimStart();
  const markerRe = /^\(([A-Za-z0-9]+)\)\s*/;
  const markers: string[] = [];
  let remaining = text;
  let match: RegExpMatchArray | null;
  while ((match = remaining.match(markerRe))) {
    markers.push(match[1]);
    remaining = remaining.slice(match[0].length);
  }
  return { markers, rest: remaining };
}

function paragraphPathToLabel(stack: StackEntry[]): string {
  return stack.map((entry) => `(${entry.value})`).join('');
}

export function extractSectionParagraphs(
  sectionCitation: string,
  paragraphTexts: string[],
): Array<{ sectionCitation: string; label: string; paragraphPath: string; textPlain: string; sortOrder: number }> {
  let stack: StackEntry[] = [];
  const records: Array<{ sectionCitation: string; label: string; paragraphPath: string; textPlain: string; sortOrder: number }> = [];
  let sortOrder = 0;

  // eCFR text commonly opens a paragraph with a short heading immediately followed
  // by its first inline sub-marker, e.g. "(a) Machine guarding—(1) Types of
  // guarding. One or more methods..." -- the "(1)" is not a leading marker of the
  // NEXT <P>, it is inline within this one. Detected only in the first ~70 chars
  // of the remaining text, anchored to a dash/colon immediately before the "(",
  // to avoid misreading an unrelated parenthetical aside deeper in the sentence.
  const inlineHeadingMarkerRe = /^(.{0,70}?[—–:-])\s*\((\d+|[a-zA-Z]+)\)\s*/;

  for (const raw of paragraphTexts) {
    const cleaned = stripTags(raw);
    if (!cleaned) continue;
    const { markers, rest } = extractLeadingMarkers(cleaned);
    if (!markers.length) continue; // No addressable outline marker -- introductory text, skip.

    for (const marker of markers) {
      stack = applyToken(stack, marker);
    }
    if (!stack.length) continue;

    const inlineMatch = rest.match(inlineHeadingMarkerRe);
    if (inlineMatch) {
      const headingText = inlineMatch[1];
      const inlineMarker = inlineMatch[2];
      const remainder = rest.slice(inlineMatch[0].length);

      records.push({
        sectionCitation,
        label: paragraphPathToLabel(stack),
        paragraphPath: stack.map((entry) => entry.value).join('.'),
        textPlain: `${paragraphPathToLabel(stack)} ${headingText}`.trim(),
        sortOrder: sortOrder++,
      });

      stack = applyToken(stack, inlineMarker);
      if (stack.length) {
        records.push({
          sectionCitation,
          label: paragraphPathToLabel(stack),
          paragraphPath: stack.map((entry) => entry.value).join('.'),
          textPlain: `${paragraphPathToLabel(stack)} ${remainder}`.trim(),
          sortOrder: sortOrder++,
        });
      }
      continue;
    }

    records.push({
      sectionCitation,
      label: paragraphPathToLabel(stack),
      paragraphPath: stack.map((entry) => entry.value).join('.'),
      textPlain: `${paragraphPathToLabel(stack)} ${rest}`.trim(),
      sortOrder: sortOrder++,
    });
  }

  return records;
}

function extractPartXmlBlocks(xml: string, part: string): string[] {
  const partRegex = new RegExp(`<DIV5\\s+N="${part}"[^>]*TYPE="PART"[^>]*>`, 'gi');
  const blocks: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = partRegex.exec(xml)) !== null) {
    const start = match.index;
    const remainder = xml.slice(start + match[0].length);
    const nextPart = /<DIV5\s+N="[^"]+"[^>]*TYPE="PART"[^>]*>/i.exec(remainder);
    blocks.push(nextPart ? xml.slice(start, start + match[0].length + nextPart.index) : xml.slice(start));
  }
  return blocks;
}

function extractSectionBlocks(partXml: string): Array<{ citation: string; xml: string }> {
  const sectionRegex = /<DIV8[^>]*TYPE="SECTION"[^>]*>([\s\S]*?)<\/DIV8>/gi;
  const out: Array<{ citation: string; xml: string }> = [];
  let match: RegExpExecArray | null;
  while ((match = sectionRegex.exec(partXml)) !== null) {
    const block = match[0];
    const headMatch = block.match(/<HEAD>([\s\S]*?)<\/HEAD>/i);
    const headText = headMatch ? stripTags(headMatch[1]) : '';
    const numMatch = headText.match(/§\s*(\d+\.\d+(?:-\d+)?)/);
    if (!numMatch) continue;
    out.push({ citation: numMatch[1], xml: block });
  }
  return out;
}

function extractParagraphTexts(sectionXml: string): string[] {
  const pRegex = /<P>([\s\S]*?)<\/P>/gi;
  const texts: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = pRegex.exec(sectionXml)) !== null) {
    texts.push(match[1]);
  }
  return texts;
}

async function syncPart(ds: DataSource, opts: { titleNumber: string; part: string; bulkXmlUrl: string; citationPrefix: string }) {
  const axios = require('axios');
  const response = await axios.get(opts.bulkXmlUrl);
  const xml: string = response.data;
  const partBlocks = extractPartXmlBlocks(xml, opts.part);
  const repo = ds.getRepository(RegulatoryParagraph);

  let sectionsProcessed = 0;
  let paragraphsUpserted = 0;

  for (const partBlock of partBlocks) {
    const sections = extractSectionBlocks(partBlock);
    for (const section of sections) {
      let sectionNo = section.citation;
      if (sectionNo.startsWith(opts.part + '.' + opts.part)) {
        sectionNo = sectionNo.substring(opts.part.length + 1);
      }
      const citation = `${opts.citationPrefix} ${sectionNo}`;
      const paragraphTexts = extractParagraphTexts(section.xml);
      const records = extractSectionParagraphs(citation, paragraphTexts);
      sectionsProcessed++;
      for (const record of records) {
        await repo.upsert(record, ['sectionCitation', 'textPlain']);
        paragraphsUpserted++;
      }
    }
  }

  return { sectionsProcessed, paragraphsUpserted };
}

async function run() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl || !databaseUrl.includes('hazlenz_standards_verify_20260816')) {
    throw new Error(`Refusing to run: DATABASE_URL must target the disposable verification DB. Got: ${databaseUrl}`);
  }

  const ds = new DataSource({
    type: 'postgres',
    url: databaseUrl,
    entities: [RegulatoryParagraph],
    synchronize: false,
  });
  await ds.initialize();

  const targets = [
    { titleNumber: '29', part: '1910', bulkXmlUrl: 'https://www.govinfo.gov/bulkdata/ECFR/title-29/ECFR-title29.xml', citationPrefix: '29 CFR' },
    { titleNumber: '29', part: '1926', bulkXmlUrl: 'https://www.govinfo.gov/bulkdata/ECFR/title-29/ECFR-title29.xml', citationPrefix: '29 CFR' },
    { titleNumber: '30', part: '56', bulkXmlUrl: 'https://www.govinfo.gov/bulkdata/ECFR/title-30/ECFR-title30.xml', citationPrefix: '30 CFR' },
  ];

  for (const target of targets) {
    console.log(`Syncing paragraphs for ${target.citationPrefix} ${target.part}...`);
    const result = await syncPart(ds, target);
    console.log(target.part, result);
  }

  await ds.destroy();
}

if (require.main === module) {
  run().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
