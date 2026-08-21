/**
 * KG-4E -- normalized report/PDF invariance oracle.
 *
 * THE QUESTION. Do an eligible SHADOW analysis and an equivalent LEGACY analysis produce the same
 * customer-facing report?
 *
 * WHY NOT PDF BYTE EQUALITY. Two reports generated from two different inspections are never
 * byte-equal and never could be: the inspection carries its own uuid (printed as the record
 * reference), and PDFKit stamps a CreationDate. Asserting byte equality would fail for reasons that
 * have nothing to do with SHADOW, and the usual repair -- widening an ignore list until it passes --
 * ends with an oracle that proves nothing. So volatility is DERIVED, exactly as KG-4B derived it for
 * the classify payload: two LEGACY reports from two separate but identically-parameterised
 * inspections establish what differs between any two runs of identical code, and only that is
 * excluded from the LEGACY-versus-SHADOW comparison that follows.
 *
 * WHAT IS COMPARED. Text and structure extracted with poppler (`pdftotext`, `pdfinfo`, `pdffonts`)
 * -- the repository's available non-OCR path. No rasterisation, no recognition, no guessing:
 * `pdftotext` reads the content stream the generator actually wrote.
 *
 *   page count · per-page line structure · section headings and their order · every text line
 *   (citations, standard titles and text, applicability/confidence wording, corrective actions,
 *   risk presentation, assignment lines, notes rules, headers, footers, disclosures) · embedded
 *   fonts · document metadata.
 *
 * THREE ORACLES, AND WHY THREE. A single one can be satisfied for the wrong reason.
 *
 *   1. STRUCTURAL  -- page count and per-page line counts must match exactly. Catches a layout
 *                     shift that a text-only diff would silently absorb.
 *   2. POSITIONAL  -- line i of page p compared to line i of page p, with the positions that
 *                     differed between the two LEGACY probes excluded. Catches reordering.
 *   3. TOKEN-SET   -- the multiset of non-volatile tokens across the whole document. Catches
 *                     content that moved between pages, which the positional oracle would report
 *                     as two differences rather than as a move.
 *
 * NON-VACUITY. A comparison whose volatile set swallows the document, or which compares an empty
 * document, is refused rather than reported as agreement.
 *
 * Env: PDF_DIR, VOLATILITY_A, VOLATILITY_B, LEFT, RIGHT (labels), REPORT_OUT, EXPECT
 */

import { execFileSync } from 'child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';

const PDF_DIR = process.env.PDF_DIR || '';
const VOL_A = process.env.VOLATILITY_A || 'legacy-A';
const VOL_B = process.env.VOLATILITY_B || 'legacy-B';
const LEFT = process.env.LEFT || 'legacy-A';
const RIGHT = process.env.RIGHT || 'shadow-A';
const REPORT_OUT = process.env.REPORT_OUT || '';
const EXPECT = (process.env.EXPECT || 'IDENTICAL').toUpperCase();

/**
 * The terms that must never reach a customer report. Internal governance vocabulary, the shadow
 * subsystem's own names, and the telemetry schema. Matched case-insensitively against the extracted
 * text of every page, so a term that appears only in a footer or a badge is still caught.
 *
 * `SHADOW` is matched as a bare word rather than a substring: "overshadowed" is ordinary English and
 * a test that cannot tell the two apart gets disabled the first time it fires on prose.
 */
const FORBIDDEN: Array<{ label: string; pattern: RegExp }> = [
  { label: 'SHADOW (bare word)', pattern: /\bshadow(?:s|ed|ing)?\b/i },
  { label: 'governedDeliveryState', pattern: /governed\s*delivery\s*state/i },
  { label: 'governedFallbackReason', pattern: /governed\s*fallback\s*reason/i },
  { label: 'governedTextUnavailable', pattern: /governed\s*text\s*unavailable/i },
  { label: 'governed (bare word)', pattern: /\bgoverned\b/i },
  { label: 'knowledgeReleaseId', pattern: /knowledge\s*release\s*id/i },
  { label: 'release id literal (federal-core-*)', pattern: /federal-core-\d{4}-\d{2}-\d{2}/i },
  { label: 'manifestChecksum', pattern: /manifest\s*checksum/i },
  { label: 'approvalDigest', pattern: /approval\s*digest/i },
  { label: 'substantiveContentDigest', pattern: /substantive\s*content\s*digest/i },
  { label: 'sourceIdentityDigest', pattern: /source\s*identity\s*digest/i },
  { label: 'correlationId', pattern: /correlation\s*id/i },
  { label: 'eventKey', pattern: /event\s*key/i },
  { label: 'findingKey (telemetry field)', pattern: /finding\s*key/i },
  { label: 'kg4c.shadow-comparison', pattern: /kg4[a-z]\.shadow-comparison/i },
  { label: 'mismatch', pattern: /\bmismatch(?:es|ed)?\b/i },
  { label: 'BLOCKING severity', pattern: /\bBLOCKING\b/ },
  { label: 'EXACT_MATCH', pattern: /\bEXACT_MATCH\b/i },
  { label: 'GOVERNED_MISSING', pattern: /\bGOVERNED_MISSING\b/i },
  { label: 'GRANULARITY_DIFFERENCE', pattern: /\bGRANULARITY_DIFFERENCE\b/i },
  { label: 'APPLICABILITY_DIFFERENCE', pattern: /\bAPPLICABILITY_DIFFERENCE\b/i },
  { label: 'APPROVED_EXACT', pattern: /\bAPPROVED_EXACT\b/i },
  { label: 'APPROVED_SECTION_ONLY', pattern: /\bAPPROVED_SECTION_ONLY\b/i },
  { label: 'NOT_IN_RELEASE', pattern: /\bNOT_IN_RELEASE\b/i },
  { label: 'RESOLVER_UNAVAILABLE', pattern: /\bRESOLVER_UNAVAILABLE\b/i },
  { label: 'LEGACY_TEXT_UNVERIFIED', pattern: /\bLEGACY_TEXT_UNVERIFIED\b/i },
  { label: 'CITATION_ONLY_NO_TEXT', pattern: /\bCITATION_ONLY_NO_TEXT\b/i },
  { label: 'GOVERNED_VERIFIED_TEXT', pattern: /\bGOVERNED_VERIFIED_TEXT\b/i },
  { label: 'GOVERNED_WITH_FALLBACK', pattern: /GOVERNED_WITH_FALLBACK/i },
  { label: 'GOVERNED_STRICT', pattern: /GOVERNED_STRICT/i },
  { label: 'GOVERNED_CUTOVER_ (env prefix)', pattern: /GOVERNED_CUTOVER_/i },
  { label: 'STAGE_n_ cohort name', pattern: /STAGE_\d_[A-Z_]+/ },
  { label: 'circuit breaker', pattern: /circuit\s*breaker/i },
  { label: 'kill switch', pattern: /kill\s*switch/i },
  { label: 'privacy canary', pattern: /privacy\s*canary/i },
  { label: 'telemetry', pattern: /\btelemetry\b/i },
  { label: 'allowlist', pattern: /\ballowlist(?:ed)?\b/i },
  { label: 'cutover', pattern: /\bcutover\b/i },
];

interface Extracted {
  label: string;
  case: string;
  pdfPath: string;
  pageCount: number;
  /** Per page, the non-empty trimmed text lines in reading order. */
  pages: string[][];
  linesPerPage: number[];
  headings: string[];
  fonts: string[];
  producer: string;
  pdfVersion: string;
  pageSize: string;
  fileBytes: number;
  fileSha256: string;
}

function run(command: string, args: string[]): string {
  return execFileSync(command, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

/** Section headings the renderer emits, plus the per-finding headings it generates. */
const HEADING = /^(Executive Summary|Findings Summary|Detailed Findings|Management Follow-Up|Assessment Basis and Limitations|Corrective Action Summary|Finding \d+ — .*)$/;

function extract(label: string, caseId: string, pdfPath: string): Extracted {
  const raw = run('pdftotext', ['-layout', '-enc', 'UTF-8', pdfPath, '-']);
  const info = run('pdfinfo', [pdfPath]);
  let fonts: string[] = [];
  try {
    fonts = run('pdffonts', [pdfPath]).split('\n').slice(2)
      .map((line) => line.trim().split(/\s+/)[0]).filter(Boolean).sort();
  } catch { fonts = []; }

  // \f is pdftotext's page separator.
  const pageTexts = raw.split('\f');
  if (pageTexts.length && pageTexts[pageTexts.length - 1].trim() === '') pageTexts.pop();
  const pages = pageTexts.map((page) => page.split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim()).filter(Boolean));

  const field = (name: string): string => {
    const match = new RegExp('^' + name + ':\\s*(.*)$', 'm').exec(info);
    return match ? match[1].trim() : '';
  };

  const bytes = readFileSync(pdfPath);
  const sha = require('crypto').createHash('sha256').update(bytes).digest('hex');

  return {
    label, case: caseId, pdfPath,
    pageCount: Number(field('Pages')) || pages.length,
    pages,
    linesPerPage: pages.map((page) => page.length),
    headings: pages.flat().filter((line) => HEADING.test(line)),
    fonts,
    producer: field('Producer'),
    pdfVersion: field('PDF version'),
    pageSize: field('Page size'),
    fileBytes: bytes.length,
    fileSha256: sha,
  };
}

/** Positions (page,line) whose text differs between two same-configuration runs. */
function volatilePositions(a: Extracted, b: Extracted): Set<string> {
  const positions = new Set<string>();
  const pageCount = Math.max(a.pages.length, b.pages.length);
  for (let p = 0; p < pageCount; p++) {
    const left = a.pages[p] || [];
    const right = b.pages[p] || [];
    const lineCount = Math.max(left.length, right.length);
    for (let i = 0; i < lineCount; i++) {
      if (left[i] !== right[i]) positions.add(p + ':' + i);
    }
  }
  return positions;
}

/**
 * The token multiset drawn from the NON-volatile positions of a document.
 *
 * KG4E-DISC-01, recorded because the first version of this oracle was wrong in an instructive way.
 * It derived volatility as a set of literal token VALUES observed to differ between the two LEGACY
 * probes -- {E45BD25A, 8D498838} for the record reference. A third run necessarily carries a third
 * value (0122BDE6), which is not in that set, so every case reported a difference for a field the
 * oracle had already recognised as volatile. A volatility set of literal values cannot generalise
 * beyond the two runs that produced it; a volatility set of POSITIONS can. The positional oracle was
 * right all along and reported zero differences; only the token-set oracle had to be corrected.
 *
 * Drawing the bag from non-volatile positions keeps what the token-set oracle exists for -- content
 * that MOVED between pages appears at a stable position on one side and not the other, so the
 * multisets still disagree -- without re-flagging a field already known to vary.
 */
function stableTokenBag(x: Extracted, volatile: Set<string>): Map<string, number> {
  const counts = new Map<string, number>();
  x.pages.forEach((page, p) => {
    page.forEach((line, i) => {
      if (volatile.has(p + ':' + i)) return;
      for (const token of line.split(/\s+/).filter(Boolean)) {
        counts.set(token, (counts.get(token) || 0) + 1);
      }
    });
  });
  return counts;
}

function forbiddenHits(x: Extracted): Array<{ term: string; page: number; line: string }> {
  const hits: Array<{ term: string; page: number; line: string }> = [];
  x.pages.forEach((page, index) => {
    for (const line of page) {
      for (const entry of FORBIDDEN) {
        if (entry.pattern.test(line)) hits.push({ term: entry.label, page: index + 1, line });
      }
    }
  });
  return hits;
}

function main(): void {
  if (!PDF_DIR) throw new Error('PDF_DIR is required');
  const manifest = (label: string) =>
    JSON.parse(readFileSync(join(PDF_DIR, label + '__manifest.json'), 'utf8')) as
      { label: string; cases: Array<Record<string, any>> };

  const mLeft = manifest(LEFT);
  const caseIds = mLeft.cases.map((entry) => String(entry.case));

  const results: Array<Record<string, unknown>> = [];
  const failures: string[] = [];
  let invariant = 0;
  let differing = 0;
  const allForbidden: Array<Record<string, unknown>> = [];

  for (const caseId of caseIds) {
    const path = (label: string) => join(PDF_DIR, label + '__' + caseId + '.pdf');
    for (const label of [VOL_A, VOL_B, LEFT, RIGHT]) {
      if (!existsSync(path(label))) throw new Error('missing PDF: ' + path(label));
    }
    const volA = extract(VOL_A, caseId, path(VOL_A));
    const volB = extract(VOL_B, caseId, path(VOL_B));
    const left = extract(LEFT, caseId, path(LEFT));
    const right = extract(RIGHT, caseId, path(RIGHT));

    const positions = volatilePositions(volA, volB);

    // ---------------------------------------------------------------- oracle 1: structure
    const structural: string[] = [];
    if (left.pageCount !== right.pageCount) {
      structural.push('pageCount ' + left.pageCount + ' vs ' + right.pageCount);
    }
    if (JSON.stringify(left.linesPerPage) !== JSON.stringify(right.linesPerPage)) {
      structural.push('linesPerPage ' + JSON.stringify(left.linesPerPage) + ' vs ' + JSON.stringify(right.linesPerPage));
    }
    if (JSON.stringify(left.headings) !== JSON.stringify(right.headings)) {
      structural.push('section headings/order differ');
    }
    if (JSON.stringify(left.fonts) !== JSON.stringify(right.fonts)) {
      structural.push('embedded fonts differ');
    }
    if (left.pageSize !== right.pageSize) structural.push('page size differs');
    if (left.pdfVersion !== right.pdfVersion) structural.push('pdf version differs');
    if (left.producer !== right.producer) structural.push('producer differs');

    // ---------------------------------------------------------------- oracle 2: positional
    const positionalDiffs: Array<{ page: number; line: number }> = [];
    const pageCount = Math.max(left.pages.length, right.pages.length);
    for (let p = 0; p < pageCount; p++) {
      const l = left.pages[p] || [];
      const r = right.pages[p] || [];
      const n = Math.max(l.length, r.length);
      for (let i = 0; i < n; i++) {
        if (positions.has(p + ':' + i)) continue;
        if (l[i] !== r[i]) positionalDiffs.push({ page: p + 1, line: i });
      }
    }

    // ---------------------------------------------------------------- oracle 3: token multiset
    const bagL = stableTokenBag(left, positions);
    const bagR = stableTokenBag(right, positions);
    const tokenDiffs: string[] = [];
    for (const [t, n] of bagL) if ((bagR.get(t) || 0) !== n) tokenDiffs.push(t);
    for (const [t, n] of bagR) if ((bagL.get(t) || 0) !== n && !tokenDiffs.includes(t)) tokenDiffs.push(t);

    // ---------------------------------------------------------------- non-vacuity
    const stableLines = left.pages.flat().length - positions.size;
    const stableTokens = bagL.size;
    const vacuous = left.pages.flat().length === 0 || stableLines <= 0 || stableTokens < 20;

    // ---------------------------------------------------------------- forbidden terms
    const hitsRight = forbiddenHits(right);
    const hitsLeft = forbiddenHits(left);
    for (const hit of hitsRight) allForbidden.push({ case: caseId, side: RIGHT, ...hit });
    for (const hit of hitsLeft) allForbidden.push({ case: caseId, side: LEFT, ...hit });

    const ok = structural.length === 0 && positionalDiffs.length === 0 && tokenDiffs.length === 0;
    if (ok) invariant += 1; else differing += 1;

    results.push({
      case: caseId,
      verdict: ok ? 'INVARIANT' : 'DIFFERENT',
      pageCount: left.pageCount,
      linesPerPage: left.linesPerPage,
      totalLines: left.pages.flat().length,
      headingCount: left.headings.length,
      headings: left.headings,
      volatilePositions: positions.size,
      volatilePositionList: [...positions],
      stableLinesCompared: stableLines,
      stableDistinctTokensCompared: stableTokens,
      structuralDifferences: structural,
      positionalDifferences: positionalDiffs,
      tokenDifferences: tokenDiffs,
      fonts: left.fonts,
      producer: left.producer,
      pdfVersion: left.pdfVersion,
      pageSize: left.pageSize,
      fileBytes: { [LEFT]: left.fileBytes, [RIGHT]: right.fileBytes },
      fileSha256: { [LEFT]: left.fileSha256, [RIGHT]: right.fileSha256 },
      bytesIdentical: left.fileSha256 === right.fileSha256,
      forbiddenTermHits: hitsRight.length + hitsLeft.length,
    });

    if (vacuous) failures.push(caseId + ': NON-VACUITY -- nothing meaningful was compared');
    if (EXPECT === 'IDENTICAL' && !ok) {
      failures.push(caseId + ': ' + [...structural,
        positionalDiffs.length ? positionalDiffs.length + ' positional line differences' : '',
        tokenDiffs.length ? 'tokens: ' + tokenDiffs.slice(0, 12).join(' | ') : '',
      ].filter(Boolean).join('; '));
    }
  }

  if (allForbidden.length) {
    failures.push('FORBIDDEN TERMS in generated reports: ' + allForbidden.length + ' hit(s)');
  }
  if (!caseIds.length) failures.push('NON-VACUITY: no cases compared');

  const report = {
    generatedBy: 'compare-kg4e-report-invariance.ts',
    left: LEFT, right: RIGHT,
    volatilityDerivedFrom: [VOL_A, VOL_B],
    expect: EXPECT,
    caseCount: caseIds.length,
    invariant, differing,
    forbiddenTermPatternCount: FORBIDDEN.length,
    forbiddenTermHits: allForbidden,
    cases: results,
    passed: failures.length === 0,
    failures,
  };

  if (REPORT_OUT) {
    mkdirSync(dirname(REPORT_OUT), { recursive: true });
    writeFileSync(REPORT_OUT, JSON.stringify(report, null, 2) + '\n');
  }

  console.log('');
  console.log(LEFT + '  vs  ' + RIGHT + '   (volatility from ' + VOL_A + ' / ' + VOL_B + ')');
  console.log('  cases                 : ' + caseIds.length);
  console.log('  invariant             : ' + invariant);
  console.log('  differing             : ' + differing);
  console.log('  forbidden patterns    : ' + FORBIDDEN.length);
  console.log('  forbidden term hits   : ' + allForbidden.length);
  console.log('');
  for (const entry of results) {
    console.log('  ' + String(entry.case).padEnd(12) + String(entry.verdict).padEnd(11) +
      'pages ' + entry.pageCount + '  lines ' + entry.totalLines +
      '  volatile ' + entry.volatilePositions + ' pos' +
      '  compared ' + entry.stableLinesCompared + ' lines, ' + entry.stableDistinctTokensCompared + ' tokens');
  }
  console.log('');
  if (failures.length) {
    for (const failure of failures) console.error('  FAIL  ' + failure);
    for (const hit of allForbidden.slice(0, 20)) {
      console.error('  FORBIDDEN  [' + hit.side + '/' + hit.case + ' p' + hit.page + '] ' +
        hit.term + '  ::  ' + String(hit.line).slice(0, 160));
    }
    console.log('kg4e-report-invariance: FAILED');
    process.exitCode = 1;
  } else {
    console.log('kg4e-report-invariance: PASSED (' + invariant + '/' + caseIds.length + ' invariant, 0 forbidden terms)');
  }
}

main();
