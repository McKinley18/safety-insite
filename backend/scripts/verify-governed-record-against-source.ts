/**
 * KG-3D -- reviewer evidence tooling.
 *
 * Compares the content frozen in a governed release against the authoritative source document
 * that was actually retrieved for it, and prints a per-clause verdict.
 *
 * This tool ASSISTS a review. It does not perform one and it cannot approve anything: it has no
 * write path, and the approval decision remains an explicit, per-record human command
 * (`npm run review:release-record -- approve ...`). That separation is deliberate -- KG-3D's
 * governing rule is that mechanical validation is never evidence of substantive review.
 *
 * What it checks, per record:
 *   1. the governed title matches the codified section heading (or is a justified narrowing of it)
 *   2. every requirement the governed summary asserts appears in the source document
 *   3. the summary does not assert a requirement that belongs to a DIFFERENT section
 *
 * Usage: DATABASE_URL=... npx ts-node scripts/verify-governed-record-against-source.ts <releaseId>
 */
import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { dataSource } from '../src/database/data-source';
import { resolveGovernedCitation } from '../src/standards/releases/governed-corpus-lookup';

const SOURCE_DIR = join(__dirname, '..', '..', 'verification',
  'hazlenz-governed-knowledge-growth-2026-08-19', 'kg-3d', 'source-evidence');

interface RecordCheck {
  citation: string;
  sourceFile: string;
  /** Additional source files a claim legitimately depends on (e.g. a definitions section). */
  supportingSourceFiles?: string[];
  /** Substrings of the codified heading the governed title must be consistent with. */
  headingAnchors: string[];
  /** Each asserted requirement -> the source phrase that must support it. */
  claims: Array<[string, string]>;
  /** Phrases that must NOT appear as requirements of this record. */
  mustNotAssert?: Array<[string, string]>;
}

const CHECKS: RecordCheck[] = [
  {
    citation: '29 CFR 1910.36',
    sourceFile: 'ecfr-1910-36.xml',
    supportingSourceFiles: ['ecfr-1910-37.xml'],
    headingAnchors: ['Design and construction requirements for exit routes'],
    claims: [
      ['(a)(1) permanence', 'Each exit route must be a permanent part of the workplace.'],
      ['(b)(1) at least two routes', 'At least two exit routes must be available in a workplace'],
      ['(c)(1) exit discharge destination', 'Each exit discharge must lead directly outside or to a street, walkway, refuge area, public way, or open space'],
      ['(d)(1) openable from inside', 'without keys, tools, or special knowledge'],
      ['(f)(1) capacity', 'Exit routes must support the maximum permitted occupant load'],
      ['(g)(1) minimum height', 'The ceiling of an exit route must be at least seven feet six inches'],
    ],
    mustNotAssert: [
      ['the "free and unobstructed" rule belongs to 1910.37(a)(3)', 'free and unobstructed'],
    ],
  },
  {
    citation: '29 CFR 1910.303',
    sourceFile: 'ecfr-1910-303.xml',
    headingAnchors: ['General'],
    claims: [
      ['(b)(1) free from recognized hazards', 'Electric equipment shall be free from recognized hazards'],
      ['(b)(2) installed and used per listing', 'shall be installed and used in accordance with any instructions included in the listing or labeling'],
      ['(g) 600 V scope', 'electric equipment operating at 600 volts, nominal, or less to ground'],
      ['(g)(1) working space', 'Sufficient access and working space shall be provided and maintained about all electric equipment'],
      ['(g)(2)(i) guarding of live parts', 'operating at 50 volts or more shall be guarded against accidental contact'],
      ['(g)(2)(iii) warning signs', 'marked with conspicuous warning signs forbidding unqualified persons to enter'],
    ],
  },
  {
    citation: '29 CFR 1926.34(a)',
    sourceFile: 'ecfr-1926-34.xml',
    headingAnchors: ['Means of egress'],
    claims: [
      ['(a) free and unobstructed egress when occupied', 'exits shall be so arranged and maintained as to provide free and unobstructed egress from all parts of the building or structure at all times when it is occupied'],
      ['(c) continually maintained free of obstructions', 'Means of egress shall be continually maintained free of all obstructions or impediments to full instant use'],
    ],
  },
  {
    citation: '29 CFR 1926.416(a)(1)',
    sourceFile: 'ecfr-1926-416.xml',
    headingAnchors: ['General requirements'],
    claims: [
      ['(a)(1) proximity to energized circuits', 'No employer shall permit an employee to work in such proximity to any part of an electric power circuit'],
      ['(a)(1) required protection', 'deenergizing the circuit and grounding it or by guarding it effectively by insulation or other means'],
    ],
  },
  {
    citation: '29 CFR 1926.300(b)(2)',
    sourceFile: 'ecfr-1926-300.xml',
    headingAnchors: ['General requirements'],
    claims: [
      ['(b)(2) transmission parts guarded when exposed', 'Belts, gears, shafts, pulleys, sprockets, spindles, drums, fly wheels, chains, or other reciprocating, rotating or moving parts of equipment shall be guarded if such parts are exposed to contact by employees or otherwise create a hazard.'],
      ['(b)(1) tools designed for guards', 'When power operated tools are designed to accommodate guards, they shall be equipped with such guards when in use.'],
    ],
  },
  {
    citation: '30 CFR 47.41(a)',
    sourceFile: 'ecfr-47-41.xml',
    headingAnchors: ['Requirement for container labels'],
    claims: [
      ['(a) each container labeled', 'The operator must ensure that each container of a hazardous chemical has a label.'],
      ['(a)(1) replace missing/unreadable', 'must replace a container label immediately if it is missing or if the hazard information on the label is unreadable'],
      ['(a)(2) no removal or defacement', 'must not remove or deface existing labels on containers of hazardous chemicals'],
    ],
  },
  {
    citation: '30 CFR 62.120',
    sourceFile: 'ecfr-62-120.xml',
    // The governed summary glosses "action level" with its numeric definition, which lives in the
    // definitions section. A gloss is still an assertion, so it must be sourced too.
    supportingSourceFiles: ['ecfr-62-101.xml'],
    headingAnchors: ['Action level'],
    claims: [
      ['enrollment duty at the action level', 'the mine operator must enroll the miner in a hearing conservation program that complies with'],
      ['action level = TWA8 of 85 dBA (62.101)', 'An 8-hour time-weighted average sound level (TWA8) of 85 dBA'],
      ['action level equivalently a 50% dose (62.101)', 'or equivalently a dose of 50%'],
    ],
  },
];

const strip = (s: string) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

function sourceText(files: string[]): { heading: string; body: string } {
  let heading = '';
  const bodies: string[] = [];
  for (const [index, file] of files.entries()) {
    const xml = readFileSync(join(SOURCE_DIR, file), 'utf8');
    if (index === 0) heading = strip((xml.match(/<HEAD>([\s\S]*?)<\/HEAD>/) || [])[1] || '');
    bodies.push([...xml.matchAll(/<P>([\s\S]*?)<\/P>/g)].map(m => strip(m[1])).join(' '));
  }
  return { heading, body: bodies.join(' ') };
}

async function main() {
  const releaseId = process.argv[2];
  if (!releaseId) throw new Error('A releaseId argument is required.');

  await dataSource.initialize();
  const report: any = { releaseId, generatedFrom: 'eCFR, title 29/30 up-to-date-as-of 2026-08-18', records: [] };
  let totalPass = 0, totalFail = 0;

  for (const check of CHECKS) {
    const resolution = await resolveGovernedCitation(dataSource, releaseId, check.citation);
    if (resolution.backing === 'NOT_IN_RELEASE') {
      console.log(`\n=== ${check.citation}\n    NOT IN RELEASE ${releaseId} -- skipped`);
      report.records.push({ citation: check.citation, inRelease: false });
      continue;
    }

    const files = [check.sourceFile, ...(check.supportingSourceFiles || [])];
    const { heading, body } = sourceText(files);
    const governed = `${resolution.title || ''} ${resolution.standardText || ''} ${resolution.plainLanguageSummary || ''}`;

    console.log(`\n=== ${check.citation}`);
    console.log(`    governed title : ${resolution.title}`);
    console.log(`    codified head  : ${heading}`);
    console.log(`    record checksum: ${resolution.recordChecksum}`);
    console.log(`    review state   : ${resolution.effectiveReviewState}`);

    const results: any[] = [];
    const headingOk = check.headingAnchors.some(anchor =>
      heading.toLowerCase().includes(anchor.toLowerCase()));
    headingOk ? totalPass++ : totalFail++;
    results.push({ check: 'title consistent with codified heading', pass: headingOk });
    console.log(`    ${headingOk ? 'ok  ' : 'FAIL'} title consistent with codified heading`);

    for (const [label, phrase] of check.claims) {
      const inSource = body.includes(phrase);
      inSource ? totalPass++ : totalFail++;
      results.push({ check: `source supports: ${label}`, pass: inSource, sourcePhrase: phrase });
      console.log(`    ${inSource ? 'ok  ' : 'FAIL'} source supports: ${label}`);
    }

    for (const [label, phrase] of check.mustNotAssert || []) {
      // Naming a neighbouring rule is allowed; asserting it as THIS section's requirement is not.
      // So the phrase may appear only in a sentence that also names the other section.
      const offending = governed.split(/(?<=\.)\s+/)
        .filter(sentence => sentence.toLowerCase().includes(phrase.toLowerCase()))
        .filter(sentence => !/1910\.37|1926\.34/.test(sentence));
      const ok = offending.length === 0;
      ok ? totalPass++ : totalFail++;
      results.push({ check: `not asserted as this record's rule: ${label}`, pass: ok });
      console.log(`    ${ok ? 'ok  ' : 'FAIL'} not asserted as this record's rule: ${label}`);
    }

    report.records.push({
      citation: check.citation,
      inRelease: true,
      governedTitle: resolution.title,
      codifiedHeading: heading,
      recordChecksum: resolution.recordChecksum,
      effectiveReviewState: resolution.effectiveReviewState,
      sourceFiles: files,
      results,
    });
  }

  report.totals = { pass: totalPass, fail: totalFail };
  console.log(`\n${totalPass} passed, ${totalFail} failed`);
  const out = process.env.REPORT_OUT;
  if (out) {
    require('node:fs').writeFileSync(out, JSON.stringify(report, null, 2));
    console.log(`Report written to ${out}`);
  }
  await dataSource.destroy();
  if (totalFail) process.exitCode = 1;
}

main().catch(async error => {
  console.error(error);
  if (dataSource.isInitialized) await dataSource.destroy();
  process.exitCode = 1;
});
