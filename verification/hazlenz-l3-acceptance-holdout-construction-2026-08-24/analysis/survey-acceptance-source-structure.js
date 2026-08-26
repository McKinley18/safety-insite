#!/usr/bin/env node
/*
 * L3 ACCEPTANCE HOLDOUT CONSTRUCTION -- READ-ONLY STRUCTURAL SURVEY
 *
 * Purpose: establish, WITHOUT opening the corpus for evaluation, whether the frozen
 * INDEPENDENT_EVIDENCE_PLAN can be executed into a concrete holdout without discretionary
 * selection. It reads field NAMES, row COUNTS, structural flags and normalised-text
 * INTERSECTION COUNTS only.
 *
 * CONTRACT -- this tool:
 *   - prints NO observation text
 *   - prints NO scenario identifiers
 *   - performs NO selection and materialises NO rows
 *   - invokes NO model and NO provider abstraction
 *   - transmits NOTHING externally
 *   - writes to NO file under safescope-data/
 *
 * It is the same class of act as survey-l32g-evidence-sources.ts, which "printed no observation
 * text and ran no inference and no scoring" (D-83).
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = process.argv[2] || process.cwd();
const SOURCES = {
  'gauntlet.source.v1':    'safescope-data/gauntlets/safescope-gauntlet.source.v1.json',
  'gauntlet.seed':         'safescope-data/gauntlets/safescope-gauntlet.seed.json',
  'field-realism-pack-v2': 'safescope-data/benchmarks/safescope-field-realism-pack-v2.v1.json',
};

const rowsOf = (d) => Array.isArray(d) ? d
  : (d.scenarios || d.rows || d.items || d.data || d.entries
     || Object.values(d).find((v) => Array.isArray(v)) || []);
const tally = (rows, f) => rows.reduce((a, r) => { const k = String(r[f]); a[k] = (a[k] || 0) + 1; return a; }, {});
const norm = (s) => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();

const loaded = {};
console.log('== 1. SOURCE IDENTITY AND INTEGRITY ==');
for (const [label, rel] of Object.entries(SOURCES)) {
  const abs = path.join(ROOT, rel);
  const buf = fs.readFileSync(abs);
  const sha = crypto.createHash('sha256').update(buf).digest('hex');
  const rows = rowsOf(JSON.parse(buf.toString('utf8')));
  loaded[label] = rows;
  console.log(`  ${label}`);
  console.log(`    path   : ${rel}`);
  console.log(`    sha256 : ${sha}`);
  console.log(`    bytes  : ${buf.length}`);
  console.log(`    rows   : ${rows.length}`);
  console.log(`    fields : ${rows.length ? Object.keys(rows[0]).sort().join(',') : '(none)'}`);
}

console.log('');
console.log('== 2. SELECTION-KEY AVAILABILITY (the plan sorts by `scenarioId`) ==');
for (const [label, rows] of Object.entries(loaded)) {
  const withScenarioId = rows.filter((r) => 'scenarioId' in r).length;
  const uniqScenarioId = new Set(rows.map((r) => r.scenarioId)).size;
  console.log(`  ${label}: scenarioId present on ${withScenarioId}/${rows.length} (distinct ${withScenarioId ? uniqScenarioId : 0})`);
}

console.log('');
console.log('== 3. OBSERVATION-CARRIER AVAILABILITY (the plan carries `observation` verbatim) ==');
for (const [label, rows] of Object.entries(loaded)) {
  const obs = rows.filter((r) => 'observation' in r).length;
  const haz = rows.filter((r) => 'hazardObservation' in r).length;
  console.log(`  ${label}: observation on ${obs}/${rows.length} | hazardObservation on ${haz}/${rows.length}`);
}

console.log('');
console.log('== 4. STRATUM CHARACTERISATION ==');
const src = loaded['gauntlet.source.v1'];
console.log('  gauntlet.source.v1');
console.log('    severityExpectation:', JSON.stringify(tally(src, 'severityExpectation')));
console.log('    sourceType         :', JSON.stringify(tally(src, 'sourceType')));
console.log('    agency             :', JSON.stringify(tally(src, 'agency')));
console.log('    distinct primaryHazardFamily:', new Set(src.map((r) => r.primaryHazardFamily)).size);
console.log('    sourceId present   :', src.filter((r) => r.sourceId != null).length);
const seed = loaded['gauntlet.seed'];
console.log('  gauntlet.seed');
console.log('    severityExpectation:', JSON.stringify(tally(seed, 'severityExpectation')));
const rp = loaded['field-realism-pack-v2'];
console.log('  field-realism-pack-v2 -- the ambiguity/clarification denominator');
console.log('    shouldHaveMissingEvidence === true :', rp.filter((r) => r.shouldHaveMissingEvidence === true).length);
console.log('    shouldHaveMissingEvidence === false:', rp.filter((r) => r.shouldHaveMissingEvidence === false).length);
console.log('    field ABSENT on                    :', rp.filter((r) => !('shouldHaveMissingEvidence' in r)).length);
console.log('    photosAvailable present            :', rp.filter((r) => 'photosAvailable' in r).length);
console.log('    employeeExposureKnown present      :', rp.filter((r) => 'employeeExposureKnown' in r).length);

console.log('');
console.log('== 5. CROSS-SOURCE DISJOINTNESS (normalised text, COUNTS ONLY) ==');
const textsOf = (rows) => new Set(rows.map((r) => norm(r.observation ?? r.hazardObservation)).filter(Boolean));
const A = textsOf(src), B = textsOf(seed), C = textsOf(rp);
const inter = (x, y) => [...x].filter((v) => y.has(v)).length;
console.log(`  source.v1 x seed    : ${inter(A, B)}`);
console.log(`  source.v1 x realism : ${inter(A, C)}`);
console.log(`  seed x realism      : ${inter(B, C)}`);
console.log(`  distinct texts      : source.v1=${A.size} seed=${B.size} realism=${C.size} TOTAL=${A.size + B.size + C.size}`);
console.log(`  raw rows            : source.v1=${src.length} seed=${seed.length} realism=${rp.length} TOTAL=${src.length + seed.length + rp.length}`);
console.log('');
console.log('NO ROW WAS SELECTED. NO OBSERVATION TEXT WAS PRINTED. NO INFERENCE WAS RUN.');
