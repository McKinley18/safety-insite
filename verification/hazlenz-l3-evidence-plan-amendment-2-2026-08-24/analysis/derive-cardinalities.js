#!/usr/bin/env node
/*
 * AMENDMENT 2 -- PHASE 3 DERIVED-CARDINALITY CONSISTENCY GATE
 *
 * For EVERY frozen acceptance quantity whose membership is specified by an enumeration or a
 * deterministic predicate AND whose expected cardinality is declared, this tool independently
 * DERIVES the membership and its cardinality from the frozen rule and requires EXACT EQUALITY.
 *
 * A declared number is NEVER accepted because it appeared in Amendment 1.
 *
 * Gate memberships are derived TWICE and cross-checked:
 *   (a) from TRUTH SEMANTICS  -- e.g. G4 = "every authored row whose truth state is non-ACTIVE"
 *   (b) from the DECLARED FLAG on the frozen family template
 * A disagreement between (a) and (b) is itself a contradiction.
 *
 * CONTRACT: prints NO observation text, NO source identifiers, selects NO row, materialises nothing,
 * invokes no model or provider, transmits nothing.
 */
'use strict';
const fs = require('fs');
const crypto = require('crypto');

const CONTROLS_MOD = 'verification/hazlenz-l3-acceptance-holdout-frozen-2026-08-24/builder/authored-controls.js';
const { buildAuthoredControls, FROZEN_ALLOCATION } = require('./' +
  require('path').relative(__dirname, CONTROLS_MOD).split(require('path').sep).join('/'));

const rowsOf = (d) => Array.isArray(d) ? d
  : (d.scenarios || d.rows || d.items || d.data || d.entries || Object.values(d).find((v) => Array.isArray(v)) || []);
const NORM = (s) => String(s == null ? '' : s).normalize('NFC').toLowerCase().replace(/\s+/g, ' ').trim();
const CMP = (a, b) => Buffer.compare(Buffer.from(String(a), 'utf8'), Buffer.from(String(b), 'utf8'));
const OFFSET = (hex, m) => parseInt(hex.slice(-8), 16) % m;
const load = (p) => { const b = fs.readFileSync(p); return { buf: b, sha: crypto.createHash('sha256').update(b).digest('hex'), rows: rowsOf(JSON.parse(b.toString('utf8'))) }; };

const G = load('safescope-data/gauntlets/safescope-gauntlet.source.v1.json');
const S = load('safescope-data/gauntlets/safescope-gauntlet.seed.json');
const R = load('safescope-data/benchmarks/safescope-field-realism-pack-v2.v1.json');
const controls = buildAuthoredControls();

// deterministic reservation, derived -- never hard-coded
const reserve = (src, key, m) => {
  const keys = src.rows.map((r) => String(r[key])).sort(CMP);
  const k = OFFSET(src.sha, m);
  return { k, sizes: [...Array(m).keys()].map((o) => keys.filter((_, i) => i % m === o).length),
           selected: keys.filter((_, i) => i % m === k).length };
};
const gRes = reserve(G, 'scenarioId', 4);
const rRes = reserve(R, 'id', 4);

const byFamily = (f) => controls.filter((c) => c.family === f).length;
const alloc = {}; for (const f of ['F1','F2','F3','F4','F5','F6','F7','F8']) alloc[f] = byFamily(f);

// --- gate memberships derived TWO independent ways -------------------------------
const g3_semantic = controls.filter((c) => c.expect.clarificationExpected === true).length;
const g3_flag     = controls.filter((c) => c.expect.inG3Denominator).length;
const g4_semantic = controls.filter((c) => c.expect.conditionState !== 'ACTIVE').length;   // "non-ACTIVE truth state"
const g4_flag     = controls.filter((c) => c.expect.inG4Denominator).length;
const g7_semantic = controls.filter((c) => c.pole === 'CLARIFICATION_MUST_NOT_ASK').length;
const g7_flag     = controls.filter((c) => c.expect.inG7Pole).length;
// enumerated-set derivation, straight from the frozen family list Amendment 1 names
const g4_enumerated = ['F1','F2','F3','F4','F5','F6'].reduce((a, f) => a + alloc[f], 0)
                    + controls.filter((c) => c.familyVariant === 'F8b').length;
const g7_enumerated = ['F1','F2','F7'].reduce((a, f) => a + alloc[f], 0);
const g3_enumerated = ['F3','F6'].reduce((a, f) => a + alloc[f], 0);

// --- distinct-text inventory -----------------------------------------------------
const TG = new Set(G.rows.map((r) => NORM(r.observation)).filter(Boolean));
const TS = new Set(S.rows.map((r) => NORM(r.observation)).filter(Boolean));
const TR = new Set(R.rows.map((r) => NORM(r.hazardObservation)).filter(Boolean));

const rows = [];
const row = (q, declared, derived, basis) =>
  rows.push({ q, declared, derived, match: String(declared) === String(derived), basis });

// ---- SOURCE / RESERVATION ----
row('gauntlet physical rows',            150, G.rows.length,   'source file');
row('gauntlet.seed physical rows',       100, S.rows.length,   'source file');
row('realism physical rows',             117, R.rows.length,   'source file');
row('gauntlet offset k (D-A)',             0, gRes.k,          'OFFSET(sha256,4)');
row('gauntlet partition sizes',  '38,38,37,37', gRes.sizes.join(','), 'CMP(scenarioId) asc, i%4');
row('gauntlet SELECTED rows',             38, gRes.selected,   'i % 4 === 0');
row('realism offset k (D-B)',              3, rRes.k,          'OFFSET(sha256,4)');
row('realism partition sizes',   '30,29,29,29', rRes.sizes.join(','), 'CMP(id) asc, i%4');
row('realism SELECTED rows',              29, rRes.selected,   'i % 4 === 3');
// ---- INVENTORY ----
row('physical source rows total',        367, G.rows.length + S.rows.length + R.rows.length, 'sum of sources');
row('distinct NORM texts total',         366, TG.size + TS.size + TR.size, 'NORM over carriers');
row('gauntlet.seed distinct texts',       99, TS.size,         'NORM over observation');
// ---- D-C AMBIGUITY TRUTH ----
row('shouldHaveMissingEvidence true',     87, R.rows.filter((r) => r.shouldHaveMissingEvidence === true).length,  'frozen field');
row('shouldHaveMissingEvidence false',     2, R.rows.filter((r) => r.shouldHaveMissingEvidence === false).length, 'frozen field');
row('shouldHaveMissingEvidence absent',   28, R.rows.filter((r) => !('shouldHaveMissingEvidence' in r)).length,   'frozen field');
row('shouldHaveMissingEvidence present',  89, R.rows.filter((r) => 'shouldHaveMissingEvidence' in r).length,      'frozen field');
// ---- D-D ALLOCATION ----
for (const f of Object.keys(FROZEN_ALLOCATION)) row(`authored allocation ${f}`, FROZEN_ALLOCATION[f], alloc[f], 'frozen family template');
row('authored control TOTAL',             25, controls.length, 'frozen family template');
// ---- COMPOSITION ----
row('holdout TOTAL rows',                 92, gRes.selected + rRes.selected + controls.length, 'D-A + D-B + D-D');
row('INDEPENDENT rows',                   67, gRes.selected + rRes.selected, 'D-A + D-B');
row('INDEPENDENT share (1dp %)',      '72.8', (((gRes.selected + rRes.selected) / (gRes.selected + rRes.selected + controls.length)) * 100).toFixed(1), '67 / 92');
// ---- GATE DENOMINATORS: declared vs BOTH derivations ----
row('G3 authored (semantic: clarificationExpected===true)', 6, g3_semantic,   'truth semantics');
row('G3 authored (declared flag inG3Denominator)',          6, g3_flag,       'family template flag');
row('G3 authored (enumerated F3+F6)',                       6, g3_enumerated, 'Amendment 1 enumeration');
row('G7 pole (semantic: pole===CLARIFICATION_MUST_NOT_ASK)',11, g7_semantic,  'truth semantics');
row('G7 pole (declared flag inG7Pole)',                     11, g7_flag,      'family template flag');
row('G7 pole (enumerated F1+F2+F7)',                        11, g7_enumerated,'Amendment 1 enumeration');
row('G4 denominator (semantic: truth state non-ACTIVE)',    21, g4_semantic,  'truth semantics');
row('G4 denominator (declared flag inG4Denominator)',       21, g4_flag,      'family template flag');
row('G4 denominator (enumerated F1..F6 + F8b)',             21, g4_enumerated,'Amendment 1 enumeration');
// ---- closure check: G4 members + ACTIVE-truth members must exhaust the 25 ----
row('authored ACTIVE-truth rows (F7 + F8a)',                 4, controls.filter((c) => c.expect.conditionState === 'ACTIVE').length, 'truth semantics');
row('G4 members + ACTIVE members = total',                  25, g4_semantic + controls.filter((c) => c.expect.conditionState === 'ACTIVE').length, 'closure');

let mismatch = 0;
console.log('== PHASE 3 -- DECLARED vs INDEPENDENTLY DERIVED ==\n');
console.log('  ' + 'QUANTITY'.padEnd(56) + 'DECLARED'.padStart(12) + 'DERIVED'.padStart(14) + '   VERDICT');
console.log('  ' + '-'.repeat(104));
for (const r of rows) {
  if (!r.match) mismatch++;
  console.log('  ' + r.q.padEnd(56) + String(r.declared).padStart(12) + String(r.derived).padStart(14) +
              '   ' + (r.match ? 'MATCH' : '*** MISMATCH ***') + '   [' + r.basis + ']');
}
console.log('');
console.log(`  quantities checked: ${rows.length}   MATCH: ${rows.length - mismatch}   MISMATCH: ${mismatch}`);
console.log('');
console.log('  NOTE: the "declared" column for G4 carries the AMENDMENT 2 value (21). Amendment 1');
console.log('        declared 18 against an enumerated membership of 21 -- the contradiction D-87 recorded.');
console.log('        Amendment 2 changes ONLY that number. No family joins or leaves G4.');
console.log('');
console.log('NO ROW SELECTED. NO IDENTIFIER PRINTED. NO OBSERVATION TEXT PRINTED. NOTHING MATERIALISED.');
process.exit(mismatch === 0 ? 0 : 1);
