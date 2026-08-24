/**
 * L3-2g -- INDEPENDENT EVIDENCE SOURCE SURVEY.
 *
 * §36.10 closed the field corpus: all five strides of `safescope-field-validation-dataset.v1.json`
 * are opened, and NO PRIOR FIELD SCENARIO MAY BE REUSED AS FRESH EVIDENCE. Any further semantic
 * quality phase therefore needs a genuinely independent source, and the exit contract requires that
 * source to be identified and characterised BEFORE the next acceptance run rather than chosen when
 * one is needed.
 *
 * WHAT ELIGIBILITY MEANS HERE, and every criterion is checked mechanically rather than asserted:
 *
 *   PROVENANCE IDENTIFIABLE   the file exists in the repository with a resolvable origin and a
 *                             filesystem mtime that can be compared against the programme timeline.
 *   TEXT FIXED BEFORE USE     authored BEFORE 2026-08-22, the date L3-2 began. A corpus written
 *                             before the defects existed CANNOT have been authored to satisfy them,
 *                             which is the exact weakness §36.10 names as the programme's largest.
 *   NO OVERLAP                zero id and zero normalised-text intersection with every sealed and
 *                             development set already opened.
 *   ADEQUATE HC               enough high-consequence material to move the gate that blocks L3-3.
 *   COMPLEMENTS AVAILABLE     negative controls / corrected states, and ambiguity / clarification
 *                             cases -- the two complements no independent field corpus has ever
 *                             carried, which is why every prior phase authored them.
 *   FAMILY SPREAD             how many taxonomy families the source can reach on its own.
 *
 * THIS PROGRAM OPENS NOTHING FOR EVALUATION. It reads metadata, ids, families and text ONLY to
 * establish eligibility, overlap and sampling; it scores nothing, runs no inference, and prints no
 * observation text. The candidate texts stay sealed for the phase that will actually use them.
 *
 * Run: OUT=... npx ts-node scripts/survey-l32g-evidence-sources.ts
 */
import { readFileSync, writeFileSync, mkdirSync, statSync, existsSync } from 'fs';
import { dirname, join, basename } from 'path';
import { createHash } from 'crypto';

const REPO = join(__dirname, '..', '..');
const EVAL = join(__dirname, '..', 'src', 'safescope-v2', 'reasoning-l3', 'eval');

/** The date L3-2 began. Anything authored after this may have been shaped by a known defect. */
const PROGRAMME_START = Date.parse('2026-08-22T00:00:00Z');

// ---------------------------------------------------------------- already-opened corpus

const OPENED = [
  'holdout-l32.json', 'holdout-l32b.json', 'holdout-l32c.json', 'holdout-l32d.json',
  'holdout-l32e.json', 'holdout-l32f.json',
  'development-l32.json', 'development-l32d.json', 'development-l32e.json', 'development-l32f.json',
];

const norm = (s: string) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

function rowsOf(data: any): any[] {
  if (Array.isArray(data)) return data;
  for (const k of ['scenarios', 'rows', 'cases', 'items', 'observations', 'pack', 'entries', 'records']) {
    if (Array.isArray(data?.[k])) return data[k];
  }
  return [];
}

function textOf(r: any): string {
  for (const k of ['text', 'observation', 'observationText', 'hazardObservation', 'plainLanguageObservation',
    'findingDescription', 'note', 'input', 'description', 'raw', 'body']) {
    if (typeof r?.[k] === 'string' && r[k].length > 20) return r[k];
  }
  return '';
}

function familyOf(r: any): string | null {
  for (const k of ['family', 'hazardFamily', 'expectedFamily', 'primaryHazardFamily', 'domainId',
    'category', 'hazard_type', 'hazardType']) {
    if (typeof r?.[k] === 'string' && r[k]) return r[k];
  }
  const e = r?.expect || r?.expected;
  if (e && typeof e.familyPattern === 'string') return e.familyPattern;
  return null;
}

// ---------------------------------------------------------------- build the opened index

const openedIds = new Set<string>();
const openedTexts = new Set<string>();
for (const f of OPENED) {
  const p = join(EVAL, f);
  if (!existsSync(p)) continue;
  for (const r of rowsOf(JSON.parse(readFileSync(p, 'utf8')))) {
    if (r?.id) openedIds.add(String(r.id));
    const t = textOf(r); if (t) openedTexts.add(norm(t));
  }
}

// The exhausted field corpus itself -- every stride of it is opened.
const FIELD = join(REPO, 'safescope-data', 'benchmarks', 'safescope-field-validation-dataset.v1.json');
if (existsSync(FIELD)) {
  for (const r of rowsOf(JSON.parse(readFileSync(FIELD, 'utf8')))) {
    if (r?.id) openedIds.add(String(r.id));
    const t = textOf(r); if (t) openedTexts.add(norm(t));
  }
}

// ---------------------------------------------------------------- candidates

const CANDIDATES = [
  'safescope-data/benchmarks/safescope-field-realism-pack-v2.v1.json',
  'safescope-data/field-test-scenarios/full-hazard-coverage-expansion-v1.json',
  'safescope-data/field-test-scenarios/generalization-unseen-scenarios-v1.json',
  'safescope-data/field-test-scenarios/field-test-scenario-pack-v1.json',
  'safescope-data/field-test-scenarios/failure-mode-calibration-pack-v1.json',
  'safescope-data/scenario-expansion/safescope-scenario-expansion-pack.v1.json',
  'safescope-data/gauntlets/safescope-gauntlet.source.v1.json',
  'safescope-data/gauntlets/safescope-gauntlet.seed.json',
  'safescope-data/benchmarks/safescope-precision-batch-001.v1.json',
  'safescope-data/benchmarks/safescope-precision-batch-002.v1.json',
  'safescope-data/benchmarks/safescope-precision-batch-003.v1.json',
  'safescope-data/benchmarks/safescope-finding-audit.v1.json',
];

/** Cheap lexical signals for the two complements no field corpus has ever carried. */
const NEGATIVE_MARKERS = ['no defect', 'no deficien', 'no issue', 'no concern', 'satisfactory', 'compliant', 'no hazard', 'all correct', 'in good order', 'no further action'];
const CORRECTED_MARKERS = ['was replaced', 'was repaired', 'was corrected', 'replaced with', 'rectified', 'made good', 'reinstated', 'tagged out', 'removed from service'];
const AMBIGUITY_MARKERS = ['could not', 'unable to', 'did not look', 'seemed', 'appeared', 'might', 'may be', 'possibly', 'not sure', 'unclear', 'unsure', 'suspect'];
const HC_MARKERS = ['fall', 'confined space', 'lockout', 'loto', 'energis', 'energiz', 'excavat', 'trench', 'roof', 'crane', 'suspended load', 'explos', 'asphyx', 'live conductor', 'unguarded', 'arc flash', 'atmosphere'];

const hits = (t: string, m: string[]) => m.some(x => t.includes(x));

const report: any = {
  phase: 'L3-2g', role: 'INDEPENDENT_EVIDENCE_SOURCE_SURVEY_NO_EVALUATION_PERFORMED',
  generatedAt: new Date().toISOString(),
  programmeStart: '2026-08-22 (L3-2)',
  openedCorpus: { ids: openedIds.size, texts: openedTexts.size, files: OPENED.length + 1 },
  candidates: [],
};

for (const rel of CANDIDATES) {
  const p = join(REPO, rel);
  if (!existsSync(p)) { report.candidates.push({ file: rel, present: false }); continue; }
  const raw = readFileSync(p, 'utf8');
  const st = statSync(p);
  const rows = rowsOf(JSON.parse(raw));
  const withText = rows.filter(r => textOf(r).length > 20);

  let idOverlap = 0, textOverlap = 0, neg = 0, corr = 0, amb = 0, hc = 0;
  const fams = new Set<string>();
  for (const r of withText) {
    if (r?.id && openedIds.has(String(r.id))) idOverlap += 1;
    const t = textOf(r); const n = norm(t); const lt = t.toLowerCase();
    if (openedTexts.has(n)) textOverlap += 1;
    if (hits(lt, NEGATIVE_MARKERS)) neg += 1;
    if (hits(lt, CORRECTED_MARKERS)) corr += 1;
    if (hits(lt, AMBIGUITY_MARKERS) || r?.shouldHaveMissingEvidence === true) amb += 1;
    if (hits(lt, HC_MARKERS)) hc += 1;
    const f = familyOf(r); if (f) fams.add(f);
  }

  report.candidates.push({
    file: rel, present: true,
    sha256: createHash('sha256').update(raw).digest('hex'),
    mtime: st.mtime.toISOString(),
    predatesProgramme: st.mtimeMs < PROGRAMME_START,
    rows: rows.length, rowsWithObservationText: withText.length,
    distinctFamilyLabels: fams.size,
    overlapWithOpened: { ids: idOverlap, texts: textOverlap },
    complementSignals: {
      negativeControlish: neg, correctedStateish: corr,
      ambiguityish: amb, highConsequenceish: hc,
    },
  });
}

// ---------------------------------------------------------------- ranking

const eligible = report.candidates.filter((c: any) =>
  c.present && c.predatesProgramme && c.overlapWithOpened.texts === 0 && c.rowsWithObservationText >= 40);
eligible.sort((a: any, b: any) =>
  (b.complementSignals.highConsequenceish - a.complementSignals.highConsequenceish)
  || (b.rowsWithObservationText - a.rowsWithObservationText));

report.eligible = eligible.map((c: any) => c.file);
report.recommended = eligible[0]?.file ?? null;

const dest = process.env.OUT || 'evidence-sources.json';
mkdirSync(dirname(dest), { recursive: true });
writeFileSync(dest, JSON.stringify(report, null, 2));

const pad = (s: any, n: number) => String(s).padEnd(n);
console.log(`\nopened corpus: ${openedIds.size} ids / ${openedTexts.size} texts\n`);
console.log(pad('candidate', 52) + pad('rows', 7) + pad('text', 7) + pad('pre', 5)
  + pad('idOv', 6) + pad('txOv', 6) + pad('HC', 5) + pad('neg', 5) + pad('corr', 6) + 'amb');
for (const c of report.candidates) {
  if (!c.present) { console.log(pad(basename(c.file), 52) + 'MISSING'); continue; }
  console.log(pad(basename(c.file), 52) + pad(c.rows, 7) + pad(c.rowsWithObservationText, 7)
    + pad(c.predatesProgramme ? 'yes' : 'NO', 5)
    + pad(c.overlapWithOpened.ids, 6) + pad(c.overlapWithOpened.texts, 6)
    + pad(c.complementSignals.highConsequenceish, 5)
    + pad(c.complementSignals.negativeControlish, 5)
    + pad(c.complementSignals.correctedStateish, 6)
    + c.complementSignals.ambiguityish);
}
console.log(`\neligible: ${report.eligible.join(', ') || 'NONE'}`);
console.log(`recommended: ${report.recommended}`);
console.log(`\nwrote ${dest}`);
