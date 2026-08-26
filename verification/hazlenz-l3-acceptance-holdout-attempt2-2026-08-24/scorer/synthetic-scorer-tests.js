#!/usr/bin/env node
/*
 * ATTEMPT 2 -- PHASE 16: SYNTHETIC SCORER VALIDATION.
 *
 * NO PROVIDER IS RUN. NO INFERENCE OCCURS. NO HOLDOUT SEMANTICS ARE CONSUMED.
 *
 * Every fixture below is SYNTHESIZED from the holdout's FROZEN TRUTH METADATA ONLY -- rowIds and
 * gate-membership flags. No fixture reads, quotes, or depends on any observation text, and the
 * expected gate outcome of every fixture is known BY CONSTRUCTION rather than by observation.
 *
 * The all-pass baseline is the synthetic "perfect run": schema-valid on every row, one candidate
 * on every row, a clarification raised on exactly the DEN_A rows and nowhere else, and a non-ACTIVE
 * asserted state on every G4-denominator row. Each subsequent case perturbs exactly one thing and
 * requires exactly the corresponding gate to fail.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { scoreAcceptance } = require('./acceptance-scorer.js');

const HOLDOUT = path.resolve(__dirname, '..', 'holdout', 'holdout-l3-acceptance-attempt2.json');
const holdout = JSON.parse(fs.readFileSync(HOLDOUT, 'utf8'));
const rows = holdout.rows;

const perfect = () => rows.map((r) => ({
  rowId: r.rowId,
  schemaValid: true,
  retries: 0,
  candidates: [{ id: 'c1' }],
  raisedClarification: r.expect.clarificationExpected === true,
  assertedState: r.expect.inG4Denominator ? (r.expect.conditionState || 'NEGATED') : 'ACTIVE',
  nonRetryableValidationReasons: [],
  safetyConsequentialRejection: false,
  decisionBoundaryCodes: [],
}));
const withRow = (res, rowId, patch) => res.map((x) => (x.rowId === rowId ? { ...x, ...patch } : x));
const pick = (pred) => rows.find(pred);

const cases = [];
const C = (name, expectation, fn) => cases.push({ name, expectation, fn });

// ---------------------------------------------------------------- baseline
C('all-pass baseline: every gate met', 'pass=true, failedGates=[]', () => {
  const s = scoreAcceptance(holdout, perfect(), perfect());
  return { ok: s.pass === true && s.failedGates.length === 0 && s.scorable === true,
           got: `pass=${s.pass} failed=[${s.failedGates}] scorable=${s.scorable}` };
});

// ---------------------------------------------------------------- individual gate failures
C('G1 fails: a high-consequence row yields zero candidates', 'G1 in failedGates', () => {
  const r = pick((x) => x.expect.highConsequence === true);
  const s = scoreAcceptance(holdout, withRow(perfect(), r.rowId, { candidates: [] }), perfect());
  return { ok: s.failedGates.includes('G1') && s.pass === false, got: `failed=[${s.failedGates}]` };
});

C('G2 fails: a clarification raised where none is expected', 'G2 in failedGates, precision < 1', () => {
  const r = pick((x) => x.expect.clarificationExpected === false && x.expect.inG7Pole === false);
  const s = scoreAcceptance(holdout, withRow(perfect(), r.rowId, { raisedClarification: true }), perfect());
  const g2 = s.gates.find((g) => g.name === 'G2');
  return { ok: s.failedGates.includes('G2') && g2.precision < 1, got: `failed=[${s.failedGates}] precision=${g2.precision}` };
});

C('G3 fails: a DEN_A row raises no clarification (recall_A < 1)', 'G3 in failedGates', () => {
  const r = pick((x) => x.expect.clarificationExpected === true);
  const s = scoreAcceptance(holdout, withRow(perfect(), r.rowId, { raisedClarification: false }), perfect());
  const g3 = s.gates.find((g) => g.name === 'G3');
  return { ok: s.failedGates.includes('G3') && g3.recallA < 1, got: `failed=[${s.failedGates}] recallA=${g3.recallA}` };
});

C('G4 fails: ACTIVE asserted on a G4-denominator row', 'G4 in failedGates', () => {
  const r = pick((x) => x.expect.inG4Denominator === true);
  const s = scoreAcceptance(holdout, withRow(perfect(), r.rowId, { assertedState: 'ACTIVE' }), perfect());
  return { ok: s.failedGates.includes('G4'), got: `failed=[${s.failedGates}]` };
});

C('G5 fails: one safety-consequential validator rejection', 'G5 in failedGates', () => {
  const s = scoreAcceptance(holdout, withRow(perfect(), rows[0].rowId, { safetyConsequentialRejection: true }), perfect());
  return { ok: s.failedGates.includes('G5'), got: `failed=[${s.failedGates}]` };
});

C('G6 fails: one NON_RETRYABLE_VALIDATION_REASONS code', 'G6 in failedGates, code counted', () => {
  const s = scoreAcceptance(holdout, withRow(perfect(), rows[0].rowId, { nonRetryableValidationReasons: ['SOME_CODE'] }), perfect());
  const g6 = s.gates.find((g) => g.name === 'G6');
  return { ok: s.failedGates.includes('G6') && g6.byCode.SOME_CODE === 1, got: `failed=[${s.failedGates}] byCode=${JSON.stringify(g6.byCode)}` };
});

C('G7 fails: a clarification raised on the MUST-NOT-ASK pole', 'G7 in failedGates', () => {
  const r = pick((x) => x.expect.inG7Pole === true);
  const s = scoreAcceptance(holdout, withRow(perfect(), r.rowId, { raisedClarification: true }), perfect());
  return { ok: s.failedGates.includes('G7'), got: `failed=[${s.failedGates}]` };
});

C('G8 fails: a decision-boundary code is emitted', 'G8 in failedGates', () => {
  const s = scoreAcceptance(holdout, withRow(perfect(), rows[0].rowId, { decisionBoundaryCodes: ['INVALID_CLARIFICATION_DEPENDENCY'] }), perfect());
  return { ok: s.failedGates.includes('G8'), got: `failed=[${s.failedGates}]` };
});

C('G8 ignores codes outside its two frozen codes', 'G8 passes on an unrelated code', () => {
  const s = scoreAcceptance(holdout, withRow(perfect(), rows[0].rowId, { decisionBoundaryCodes: ['UNRELATED_CODE'] }), perfect());
  return { ok: !s.failedGates.includes('G8'), got: `failed=[${s.failedGates}]` };
});

C('G9 fails: the two processes diverge materially on one row', 'G9 in failedGates', () => {
  const b = withRow(perfect(), rows[0].rowId, { assertedState: 'SOMETHING_ELSE' });
  const s = scoreAcceptance(holdout, perfect(), b);
  return { ok: s.failedGates.includes('G9'), got: `failed=[${s.failedGates}]` };
});

C('G9 cannot pass without a second isolated process', 'G9 in failedGates when process B absent', () => {
  const s = scoreAcceptance(holdout, perfect(), undefined);
  return { ok: s.failedGates.includes('G9'), got: `failed=[${s.failedGates}]` };
});

C('G10 fails: schema conformance below 99%', 'G10 in failedGates', () => {
  let res = perfect();
  for (const r of rows.slice(0, 2)) res = withRow(res, r.rowId, { schemaValid: false });
  const s = scoreAcceptance(holdout, res, res);
  const g10 = s.gates.find((g) => g.name === 'G10');
  return { ok: s.failedGates.includes('G10') && g10.rate < 0.99, got: `failed=[${s.failedGates}] rate=${g10.rate.toFixed(4)}` };
});

C('G10 counts >1 retry as non-conforming', 'a 2-retry row is not conforming', () => {
  const s = scoreAcceptance(holdout, withRow(perfect(), rows[0].rowId, { retries: 2 }), perfect());
  const g10 = s.gates.find((g) => g.name === 'G10');
  return { ok: g10.conforming === rows.length - 1, got: `conforming=${g10.conforming}/${rows.length}` };
});

// ---------------------------------------------------------------- hard-zero behaviour
C('hard-zero gates: exactly one violation is enough to fail', 'G4 fails on a single false ACTIVE', () => {
  const r = pick((x) => x.expect.inG4Denominator === true);
  const s = scoreAcceptance(holdout, withRow(perfect(), r.rowId, { assertedState: 'ACTIVE' }), perfect());
  const g4 = s.gates.find((g) => g.name === 'G4');
  return { ok: g4.violations === 1 && g4.pass === false, got: `violations=${g4.violations} pass=${g4.pass}` };
});

C('a failed hard gate is never softened into a percentage pass', 'G3 pass=false at 28/29', () => {
  const r = pick((x) => x.expect.clarificationExpected === true);
  const s = scoreAcceptance(holdout, withRow(perfect(), r.rowId, { raisedClarification: false }), perfect());
  const g3 = s.gates.find((g) => g.name === 'G3');
  return { ok: g3.pass === false && g3.recallA > 0.9 && g3.recallA < 1, got: `recallA=${g3.recallA.toFixed(4)} pass=${g3.pass}` };
});

// ---------------------------------------------------------------- G3 numerator/denominator arithmetic
C('G3 arithmetic: DEN_A == the frozen clarificationExpected set', 'DEN_A = 29, authored 6 + realism 23', () => {
  const s = scoreAcceptance(holdout, perfect(), perfect());
  const g3 = s.gates.find((g) => g.name === 'G3');
  const denA = rows.filter((r) => r.expect.clarificationExpected === true).length;
  const authored = rows.filter((r) => r.expect.clarificationExpected === true && r.provenanceClass === 'AUTHORED_CONTROL').length;
  return { ok: g3.denominatorA === denA && authored === 6, got: `DEN_A=${g3.denominatorA} authored=${authored} realism=${denA - authored}` };
});

C('G3-DEN.1: a zero-candidate DEN_A row STAYS in DEN_A and MISSES', 'DEN_A unchanged, NUM_A drops', () => {
  const r = pick((x) => x.expect.clarificationExpected === true);
  const s = scoreAcceptance(holdout, withRow(perfect(), r.rowId, { candidates: [], raisedClarification: false }), perfect());
  const g3 = s.gates.find((g) => g.name === 'G3');
  const denA = rows.filter((x) => x.expect.clarificationExpected === true).length;
  return { ok: g3.denominatorA === denA && g3.numeratorA === denA - 1 && !g3.pass,
           got: `DEN_A=${g3.denominatorA} NUM_A=${g3.numeratorA}` };
});

C('G3-DEN.2: a zero-candidate row is EXCLUDED from DEN_B', 'DEN_B drops by exactly 1', () => {
  const base = scoreAcceptance(holdout, perfect(), perfect()).gates.find((g) => g.name === 'G3');
  const r = pick((x) => x.expect.clarificationExpected === true);
  const s = scoreAcceptance(holdout, withRow(perfect(), r.rowId, { candidates: [], raisedClarification: false }), perfect());
  const g3 = s.gates.find((g) => g.name === 'G3');
  return { ok: g3.denominatorB === base.denominatorB - 1, got: `DEN_B ${base.denominatorB} -> ${g3.denominatorB}` };
});

C('G3-DEN: a malformed record REMAINS in DEN_A and MISSES', 'DEN_A unchanged, G3 fails', () => {
  const r = pick((x) => x.expect.clarificationExpected === true);
  const s = scoreAcceptance(holdout, withRow(perfect(), r.rowId, { schemaValid: false, raisedClarification: false }), perfect());
  const g3 = s.gates.find((g) => g.name === 'G3');
  const denA = rows.filter((x) => x.expect.clarificationExpected === true).length;
  return { ok: g3.denominatorA === denA && !g3.pass, got: `DEN_A=${g3.denominatorA} pass=${g3.pass}` };
});

C('G3-DEN.3: the two recalls are reported separately and never merged', 'recallA and recallB distinct fields', () => {
  const r = pick((x) => x.expect.clarificationExpected === true);
  const s = scoreAcceptance(holdout, withRow(perfect(), r.rowId, { candidates: [], raisedClarification: false }), perfect());
  const g3 = s.gates.find((g) => g.name === 'G3');
  return { ok: 'recallA' in g3 && 'recallB' in g3 && g3.recallA !== g3.recallB,
           got: `recallA=${g3.recallA.toFixed(4)} recallB=${g3.recallB}` };
});

// ---------------------------------------------------------------- G3 membership
C('G3 membership: DEN_A is exactly the clarificationExpected===true set', 'no other row enters DEN_A', () => {
  const s = scoreAcceptance(holdout, perfect(), perfect());
  const g3 = s.gates.find((g) => g.name === 'G3');
  const expected = rows.filter((r) => r.expect.clarificationExpected === true).length;
  const gauntletInDenA = rows.filter((r) => r.provenanceClass === 'INDEPENDENT_GAUNTLET' && r.expect.clarificationExpected === true).length;
  return { ok: g3.denominatorA === expected && gauntletInDenA === 0, got: `DEN_A=${g3.denominatorA} gauntlet-in-DEN_A=${gauntletInDenA}` };
});

// ---------------------------------------------------------------- G4 21-row membership
C('G4 membership: the denominator is exactly 21 authored non-ACTIVE rows', 'denominator=21, all AUTHORED', () => {
  const s = scoreAcceptance(holdout, perfect(), perfect());
  const g4 = s.gates.find((g) => g.name === 'G4');
  const allAuthored = rows.filter((r) => r.expect.inG4Denominator).every((r) => r.provenanceClass === 'AUTHORED_CONTROL');
  return { ok: g4.denominator === 21 && allAuthored, got: `denominator=${g4.denominator} allAuthored=${allAuthored}` };
});

C('G4 membership: the superseded 18 is not reachable', 'F6 IS inside the denominator', () => {
  const f6 = rows.filter((r) => r.family === 'F6');
  const f6InG4 = f6.filter((r) => r.expect.inG4Denominator === true).length;
  const denom = rows.filter((r) => r.expect.inG4Denominator).length;
  return { ok: f6.length === 3 && f6InG4 === 3 && denom === 21 && denom - f6InG4 === 18,
           got: `F6=${f6.length} F6-in-G4=${f6InG4} denominator=${denom} without-F6=${denom - f6InG4}` };
});

// ---------------------------------------------------------------- F3 / F6 false-ACTIVE behaviour
C('F3 ACTIVE is a G4 false-ACTIVE AND a G3 recall miss', 'both G3 and G4 fail (D-E.3)', () => {
  const r = pick((x) => x.family === 'F3');
  const s = scoreAcceptance(holdout, withRow(perfect(), r.rowId, { assertedState: 'ACTIVE', raisedClarification: false }), perfect());
  return { ok: s.failedGates.includes('G4') && s.failedGates.includes('G3'), got: `failed=[${s.failedGates}]` };
});

C('F6 ACTIVE is a G4 false-ACTIVE AND a G3 recall miss', 'both G3 and G4 fail (D-E.3)', () => {
  const r = pick((x) => x.family === 'F6');
  const s = scoreAcceptance(holdout, withRow(perfect(), r.rowId, { assertedState: 'ACTIVE', raisedClarification: false }), perfect());
  return { ok: s.failedGates.includes('G4') && s.failedGates.includes('G3'), got: `failed=[${s.failedGates}]` };
});

// ---------------------------------------------------------------- G7 membership
C('G7 membership: the pole is exactly 11 authored rows, F1+F2+F7', 'no independent row in the pole', () => {
  const pole = rows.filter((r) => r.expect.inG7Pole === true);
  const fams = [...new Set(pole.map((r) => r.family))].sort();
  const independentInPole = pole.filter((r) => r.provenanceClass !== 'AUTHORED_CONTROL').length;
  return { ok: pole.length === 11 && independentInPole === 0 && fams.join(',') === 'F1,F2,F7',
           got: `pole=${pole.length} families=${fams} independent=${independentInPole}` };
});

C('G7: F4/F5/F8 are NOT in the pole despite expectClarification=false', 'section 49.3 distinction preserved', () => {
  const wrong = rows.filter((r) => ['F4', 'F5', 'F8'].includes(r.family) && r.expect.inG7Pole === true).length;
  const r = pick((x) => x.family === 'F4');
  const s = scoreAcceptance(holdout, withRow(perfect(), r.rowId, { raisedClarification: true }), perfect());
  // a clarification on F4 is a G2 imprecision but NOT a G7 violation
  return { ok: wrong === 0 && s.failedGates.includes('G2') && !s.failedGates.includes('G7'),
           got: `F4/F5/F8-in-pole=${wrong} failed=[${s.failedGates}]` };
});

// ---------------------------------------------------------------- result-set handling
C('missing result: run is NOT scorable and NOT a pass', 'scorable=false, pass=false', () => {
  const s = scoreAcceptance(holdout, perfect().slice(1), perfect());
  return { ok: s.scorable === false && s.pass === false && s.invalidReasons.includes('MISSING_RESULTS'),
           got: `scorable=${s.scorable} pass=${s.pass} reasons=[${s.invalidReasons}]` };
});

C('extra result: run is NOT scorable', 'EXTRA_RESULTS recorded', () => {
  const s = scoreAcceptance(holdout, [...perfect(), { rowId: 'H2A-999', schemaValid: true, retries: 0, candidates: [] }], perfect());
  return { ok: s.scorable === false && s.invalidReasons.includes('EXTRA_RESULTS'),
           got: `scorable=${s.scorable} reasons=[${s.invalidReasons}]` };
});

C('duplicate result: run is NOT scorable', 'DUPLICATE_RESULTS recorded', () => {
  const p = perfect();
  const s = scoreAcceptance(holdout, [...p, p[0]], perfect());
  return { ok: s.scorable === false && s.invalidReasons.includes('DUPLICATE_RESULTS'),
           got: `scorable=${s.scorable} reasons=[${s.invalidReasons}]` };
});

C('malformed result record is rejected, not silently dropped', 'MALFORMED_RESULT_RECORD recorded', () => {
  const p = perfect();
  const s = scoreAcceptance(holdout, [...p.slice(1), { noRowId: true }], perfect());
  return { ok: s.scorable === false && s.invalidReasons.includes('MALFORMED_RESULT_RECORD'),
           got: `scorable=${s.scorable} reasons=[${s.invalidReasons}]` };
});

// ---------------------------------------------------------------- determinism and terminals
C('scoring is deterministic: identical inputs give identical output', 'two runs byte-identical', () => {
  const a = JSON.stringify(scoreAcceptance(holdout, perfect(), perfect()));
  const b = JSON.stringify(scoreAcceptance(holdout, perfect(), perfect()));
  return { ok: a === b, got: `identical=${a === b}` };
});

C('terminal classification: all gates met', 'L3_ACCEPTANCE_PASSED', () => {
  const s = scoreAcceptance(holdout, perfect(), perfect());
  return { ok: s.terminal === 'L3_ACCEPTANCE_PASSED — ALL_TEN_GATES_MET', got: s.terminal };
});

C('terminal classification: a gate fails', 'L3_ACCEPTANCE_FAILED names the gate', () => {
  const r = pick((x) => x.expect.inG4Denominator === true);
  const s = scoreAcceptance(holdout, withRow(perfect(), r.rowId, { assertedState: 'ACTIVE' }), perfect());
  return { ok: s.terminal.startsWith('L3_ACCEPTANCE_FAILED') && s.terminal.includes('G4'), got: s.terminal };
});

C('terminal classification: result set invalid', 'L3_ACCEPTANCE_NOT_SCORABLE', () => {
  const s = scoreAcceptance(holdout, perfect().slice(1), perfect());
  return { ok: s.terminal === 'L3_ACCEPTANCE_NOT_SCORABLE — RESULT_SET_INVALID', got: s.terminal };
});

// ---------------------------------------------------------------- by-provenance reporting
C('by-provenance table is produced for all three classes', 'independent numbers readable alone', () => {
  const s = scoreAcceptance(holdout, perfect(), perfect());
  const bp = s.byProvenance;
  return { ok: bp.INDEPENDENT_GAUNTLET.rows === 38 && bp.INDEPENDENT_REALISM.rows === 29 && bp.AUTHORED_CONTROL.rows === 25
              && bp.AUTHORED_CONTROL.g4Denominator === 21 && bp.INDEPENDENT_GAUNTLET.g4Denominator === 0,
           got: `G ${bp.INDEPENDENT_GAUNTLET.rows} / R ${bp.INDEPENDENT_REALISM.rows} / A ${bp.AUTHORED_CONTROL.rows}, authored G4 ${bp.AUTHORED_CONTROL.g4Denominator}` };
});

// ---------------------------------------------------------------- vacuous-pass protection
C('|DEN_A| = 0 is a scoring invalidity, never a vacuous 100%', 'not scorable on an empty denominator', () => {
  const stripped = { ...holdout, rows: rows.map((r) => ({ ...r, expect: { ...r.expect, clarificationExpected: false } })) };
  const res = stripped.rows.map((r) => ({ rowId: r.rowId, schemaValid: true, retries: 0, candidates: [{}],
    raisedClarification: false, assertedState: r.expect.inG4Denominator ? 'NEGATED' : 'ACTIVE',
    nonRetryableValidationReasons: [], safetyConsequentialRejection: false, decisionBoundaryCodes: [] }));
  const s = scoreAcceptance(stripped, res, res);
  return { ok: s.scorable === false && s.pass === false && s.invalidReasons.includes('DEN_A_EMPTY'),
           got: `scorable=${s.scorable} pass=${s.pass} reasons=[${s.invalidReasons}]` };
});

// ------------------------------------------------------------------------------------ report
let fail = 0;
console.log('== ATTEMPT 2 PHASE 16 -- SYNTHETIC SCORER VALIDATION ==');
console.log('   NO PROVIDER RUN. NO INFERENCE. NO HOLDOUT SEMANTICS CONSUMED.');
console.log('   Fixtures are synthesized from frozen truth metadata (rowIds and gate flags) only.\n');
for (const c of cases) {
  let r;
  try { r = c.fn(); } catch (e) { r = { ok: false, got: 'THREW: ' + e.message }; }
  if (!r.ok) fail++;
  console.log(`  ${r.ok ? 'PASS' : '*** FAIL ***'}  ${c.name}`);
  console.log(`         expected: ${c.expectation}`);
  console.log(`         observed: ${r.got}`);
}
console.log(`\n  cases: ${cases.length}   PASS: ${cases.length - fail}   FAIL: ${fail}`);
console.log('\n  No gate threshold was adjusted to make a case pass. No G1..G10 semantics were changed.');
process.exit(fail === 0 ? 0 : 1);
