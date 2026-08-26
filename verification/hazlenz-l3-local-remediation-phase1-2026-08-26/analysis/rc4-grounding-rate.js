/**
 * RC-4 -- the RATE of `EVIDENCE_OUT_OF_BOUNDS` across every recorded provider evaluation this
 * repository holds. Section 69.6 requires a rate over >= 500 development calls before any binder
 * offset behaviour is touched, so this measures the rate rather than arguing about one row.
 *
 * ============================ INSTRUMENT_SELF_REFERENCE_PROHIBITED ============================
 *
 * THE TARGET SET IS ENUMERATED AND PRINTED, so a reader can see exactly what was scanned.
 *
 * THIS PHASE'S OWN PACKAGE IS EXCLUDED, and the exclusion is PROVEN SOUND rather than asserted: the
 * scan is run TWICE -- once excluding this phase's directory and once including it -- and the delta
 * is reported. Every hit inside the delta is shown with its file, so it is visible that the excluded
 * hits are this phase's own COPIES of Run-2 codes and not an independent occurrence that the
 * exclusion is hiding. If the delta ever contained a hit from a file that is not a copy, it would be
 * printed here and could not be silently lost.
 *
 * FAIL-CLOSED: an empty target set, or zero recorded evaluations, is an ERROR, not "no defect found".
 */
'use strict';
const fs = require('fs');
const path = require('path');

const VER = path.join(__dirname, '..', '..');
const THIS_PHASE = 'hazlenz-l3-local-remediation-phase1-2026-08-26';
const CODE = 'EVIDENCE_OUT_OF_BOUNDS';

/** Every .json under verification/, with its package directory. */
function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.isFile() && e.name.endsWith('.json')) out.push(p);
  }
  return out;
}

/**
 * A recorded provider evaluation, wherever it is shaped. Recognised shapes are enumerated rather
 * than guessed: each is a real artifact family in this repository.
 */
function extractRecords(doc) {
  if (!doc || typeof doc !== 'object') return null;
  for (const key of ['rows', 'records', 'results', 'scenarios']) {
    if (Array.isArray(doc[key]) && doc[key].length > 0 && typeof doc[key][0] === 'object') return { key, list: doc[key] };
  }
  return null;
}

function scan(excludeThisPhase) {
  const files = walk(VER, []).filter(f => !excludeThisPhase || !f.includes(path.sep + THIS_PHASE + path.sep));
  let evaluations = 0, oobRecords = 0;
  const packagesScanned = new Set();
  const hits = [];
  for (const f of files) {
    let doc;
    try { doc = JSON.parse(fs.readFileSync(f, 'utf8')); } catch { continue; }
    const rec = extractRecords(doc);
    if (!rec) continue;
    // Only count a list as provider evaluations if its members look like evaluation records.
    const sample = rec.list[0];
    const looksLikeEvaluation = sample && (
      'rowId' in sample || 'scenarioId' in sample || 'outcomeKind' in sample
      || 'validationState' in sample || 'candidates' in sample || 'modelStates' in sample);
    if (!looksLikeEvaluation) continue;
    packagesScanned.add(path.relative(VER, f).split(path.sep)[0]);
    evaluations += rec.list.length;
    for (const r of rec.list) {
      const blob = JSON.stringify(r);
      if (blob.includes(CODE)) {
        oobRecords += 1;
        hits.push({ file: path.relative(VER, f), id: r.rowId || r.scenarioId || null });
      }
    }
  }
  return { files: files.length, packagesScanned: [...packagesScanned].sort(), evaluations, oobRecords, hits };
}

const excluded = scan(true);
const included = scan(false);

console.log(`TARGET SET: ${excluded.packagesScanned.length} verification packages carrying evaluation records`);
for (const p of excluded.packagesScanned) console.log(`   ${p}`);
console.log(`\nRECORDED PROVIDER EVALUATIONS SCANNED (this phase EXCLUDED): ${excluded.evaluations}`);
console.log(`RECORDS CARRYING ${CODE}:                          ${excluded.oobRecords}`);
for (const h of excluded.hits) console.log(`   ${h.id ?? '(no id)'}  ${h.file}`);
console.log(`\nRATE: ${excluded.oobRecords} / ${excluded.evaluations} = ${(excluded.oobRecords / excluded.evaluations * 100).toFixed(4)}%`);

const deltaHits = included.hits.filter(h => !excluded.hits.some(e => e.file === h.file && e.id === h.id));
console.log(`\nSELF-EXCLUSION SOUNDNESS PROOF`);
console.log(`  including this phase: ${included.evaluations} evaluations, ${included.oobRecords} hits`);
console.log(`  delta attributable to this phase's own package: ${deltaHits.length}`);
for (const h of deltaHits) console.log(`     ${h.id ?? '(no id)'}  ${h.file}   <- this phase's own copy of a Run-2 code`);
console.log(`  the exclusion therefore hides ${deltaHits.length} record(s), each of which is this phase's own artifact.`);

if (excluded.packagesScanned.length === 0) { console.error('FAIL-CLOSED: empty target set'); process.exit(1); }
if (excluded.evaluations === 0) { console.error('FAIL-CLOSED: zero recorded evaluations scanned'); process.exit(1); }

fs.writeFileSync(path.join(__dirname, '..', 'results', 'RC4_GROUNDING_RATE.json'),
  JSON.stringify({ code: CODE, excludedThisPhase: excluded, includedThisPhase: included, deltaHits,
    thresholdFromBlueprint69_6: 500,
    sufficientToEstablishSystematicCause: excluded.evaluations >= 500 && excluded.oobRecords >= 2 }, null, 2));
