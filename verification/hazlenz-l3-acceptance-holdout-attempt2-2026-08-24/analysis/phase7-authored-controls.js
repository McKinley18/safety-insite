#!/usr/bin/env node
/*
 * ATTEMPT 2 -- PHASE 7: materialize the 25 authored controls and re-derive every declared
 * gate-bearing cardinality from the FROZEN MEMBERSHIP RULE, never from a hard-coded total.
 * Runs BEFORE any source-row selection. Prints counts and booleans only -- no observation text.
 */
'use strict';
const { buildAuthoredControls, FROZEN_ALLOCATION } = require('../builder/authored-controls.js');

const c = buildAuthoredControls();
const rows = [];
const row = (q, declared, derived, basis) =>
  rows.push({ q, declared, derived, match: String(declared) === String(derived), basis });

const byFam = (f) => c.filter((x) => x.family === f).length;
const alloc = {};
for (const f of ['F1','F2','F3','F4','F5','F6','F7','F8']) alloc[f] = byFam(f);

for (const f of Object.keys(FROZEN_ALLOCATION)) row(`allocation ${f}`, FROZEN_ALLOCATION[f], alloc[f], 'frozen family template');
row('allocation sums to total', 25, Object.values(alloc).reduce((a,b)=>a+b,0), 'sum of frozen allocation');
row('authored control TOTAL', 25, c.length, 'materialized controls');

// G3 -- three independent derivations
row('G3 semantic  (clarificationExpected === true)', 6, c.filter((x)=>x.expect.clarificationExpected===true).length, 'truth semantics');
row('G3 flag      (inG3Denominator)',                6, c.filter((x)=>x.expect.inG3Denominator).length,             'family template flag');
row('G3 enumerated(F3 + F6)',                        6, alloc.F3 + alloc.F6,                                        'Amendment 1 enumeration');
// G4 -- three independent derivations, Amendment 2 / D-E value 21
row('G4 semantic  (truth state !== ACTIVE)',        21, c.filter((x)=>x.expect.conditionState!=='ACTIVE').length,   'truth semantics');
row('G4 flag      (inG4Denominator)',               21, c.filter((x)=>x.expect.inG4Denominator).length,             'family template flag');
row('G4 enumerated(F1..F6 + F8b)',                  21, ['F1','F2','F3','F4','F5','F6'].reduce((a,f)=>a+alloc[f],0)
                                                        + c.filter((x)=>x.familyVariant==='F8b').length,             'Amendment 2 D-E.1 enumeration');
// G7 -- three independent derivations
row('G7 semantic  (pole === CLARIFICATION_MUST_NOT_ASK)', 11, c.filter((x)=>x.pole==='CLARIFICATION_MUST_NOT_ASK').length, 'truth semantics');
row('G7 flag      (inG7Pole)',                            11, c.filter((x)=>x.expect.inG7Pole).length,                     'family template flag');
row('G7 enumerated(F1 + F2 + F7)',                        11, alloc.F1 + alloc.F2 + alloc.F7,                              'Amendment 1 enumeration');
// closure -- G4 and its ACTIVE-truth complement must be disjoint and exhaust the 25
const activeTruth = c.filter((x)=>x.expect.conditionState==='ACTIVE').length;
row('ACTIVE-truth complement (F7 + F8a)', 4, activeTruth, 'truth semantics');
row('closure  G4 + ACTIVE = total',      25, c.filter((x)=>x.expect.conditionState!=='ACTIVE').length + activeTruth, 'closure');
// D-D.4: G7 pole is composed EXCLUSIVELY of authored rows, and only F1/F2/F7 qualify
row('G7 pole outside F1/F2/F7',           0, c.filter((x)=>x.pole==='CLARIFICATION_MUST_NOT_ASK' && !['F1','F2','F7'].includes(x.family)).length, 'D-D.4');
// every control is AUTHORED_CONTROL and carries a non-empty distinct carrier
row('provenanceClass AUTHORED_CONTROL',  25, c.filter((x)=>x.provenanceClass==='AUTHORED_CONTROL').length, 'D-D.5');
row('distinct sourceIds',                25, new Set(c.map((x)=>x.sourceId)).size, 'D-D.6');
const NORM = (s)=>String(s==null?'':s).normalize('NFC').toLowerCase().replace(/\s+/g,' ').trim();
row('distinct NORM texts',               25, new Set(c.map((x)=>NORM(x.text))).size, 'D-D.6');
row('empty carriers',                     0, c.filter((x)=>NORM(x.text)==='').length, 'D-D.6');

let bad = 0;
console.log('== ATTEMPT 2 PHASE 7 -- AUTHORED CONTROLS, DECLARED vs DERIVED ==\n');
console.log('  ' + 'QUANTITY'.padEnd(50) + 'DECLARED'.padStart(10) + 'DERIVED'.padStart(10) + '   VERDICT');
console.log('  ' + '-'.repeat(96));
for (const r of rows) {
  if (!r.match) bad++;
  console.log('  ' + r.q.padEnd(50) + String(r.declared).padStart(10) + String(r.derived).padStart(10) +
              '   ' + (r.match ? 'MATCH' : '*** MISMATCH ***') + '   [' + r.basis + ']');
}
console.log(`\n  quantities checked: ${rows.length}   MATCH: ${rows.length - bad}   MISMATCH: ${bad}`);
console.log('\n  NO SOURCE ROW SELECTED. NO SOURCE IDENTIFIER READ. NO OBSERVATION TEXT PRINTED.');
console.log('  The positive stride remains UNOPENED: this phase imported only the authored-control module.');
process.exit(bad === 0 ? 0 : 1);
