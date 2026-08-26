/**
 * L3 FINAL SINGLE-USE SEALED ACCEPTANCE -- SCORING DRIVER.
 *
 * It REQUIRES the frozen scorer and calls it. It does not reimplement, wrap, adjust, pre-process
 * or post-process any gate. Its only work is:
 *   1. assert the scorer file digest is ea5e50ae... and the holdout digest is 69665e41...
 *   2. project each raw result row onto EXACTLY the nine fields of the frozen result-record
 *      contract, taking them verbatim from the raw result -- no recomputation, no repair
 *   3. call scoreAcceptance(holdout, resultsA, resultsB)
 *   4. print and persist what it returns, unaltered
 *
 * NO RESULT IS MANUALLY PRE-PROCESSED TO IMPROVE SCORING. A row that failed stays failed.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..', '..', '..');
const A2 = path.join(ROOT, 'verification', 'hazlenz-l3-acceptance-holdout-attempt2-2026-08-24');
const SCORER = path.join(A2, 'scorer', 'acceptance-scorer.js');
const HOLDOUT = path.join(A2, 'holdout', 'holdout-l3-acceptance-attempt2.json');

const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');

const SCORER_SHA = 'ea5e50aea265370c9de72245c1c34075b44f0c3f2c8c91303c2f5eb92097d0b6';
const HOLDOUT_SHA = '69665e41d975f67515bf9864e221a4b05c0811e4c48089e4671c8a2ae1cc094c';

const gotScorer = sha(SCORER), gotHoldout = sha(HOLDOUT);
if (gotScorer !== SCORER_SHA) throw new Error(`scorer digest mismatch: ${gotScorer}`);
if (gotHoldout !== HOLDOUT_SHA) throw new Error(`holdout digest mismatch: ${gotHoldout}`);

const { scoreAcceptance, SCORER_ID } = require(SCORER);
const holdout = JSON.parse(fs.readFileSync(HOLDOUT, 'utf8'));

/** EXACTLY the nine fields of the frozen contract, taken verbatim. Nothing else is passed. */
const project = (r) => ({
  rowId: r.rowId,
  schemaValid: r.schemaValid,
  retries: r.retries,
  candidates: r.candidates,
  raisedClarification: r.raisedClarification,
  assertedState: r.assertedState,
  nonRetryableValidationReasons: r.nonRetryableValidationReasons,
  safetyConsequentialRejection: r.safetyConsequentialRejection,
  decisionBoundaryCodes: r.decisionBoundaryCodes,
});

const rawA = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const rawB = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
const resultsA = rawA.rows.map(project);
const resultsB = rawB.rows.map(project);

const score = scoreAcceptance(holdout, resultsA, resultsB);

const envelope = {
  phase: 'L3 FINAL SINGLE-USE SEALED ACCEPTANCE',
  scoredAt: new Date().toISOString(),
  scorerId: SCORER_ID,
  scorerPath: 'verification/hazlenz-l3-acceptance-holdout-attempt2-2026-08-24/scorer/acceptance-scorer.js',
  scorerSha256: gotScorer,
  holdoutSha256: gotHoldout,
  gateDeclarationSha256: 'f54e649aa9c65fe3dcd62dc27cb8d65e72050d529910cf2ca3303a0d71031b97',
  rawResultA: { path: process.argv[2], sha256: sha(process.argv[2]), rows: rawA.rows.length, providerCalls: rawA.providerCalls },
  rawResultB: { path: process.argv[3], sha256: sha(process.argv[3]), rows: rawB.rows.length, providerCalls: rawB.providerCalls },
  scoredProcess: 'A (process B supplied ONLY as the G9 second isolated process, exactly as the frozen scorer takes it)',
  result: score,
};

const OUT = process.argv[4];
fs.writeFileSync(OUT, JSON.stringify(envelope, null, 2));

// ---- human-readable gate table -------------------------------------------------------------
console.log('L3 FINAL SEALED ACCEPTANCE -- FROZEN SCORER RESULT');
console.log('scorer      ' + SCORER_ID);
console.log('scorer sha  ' + gotScorer);
console.log('holdout sha ' + gotHoldout);
console.log('');
console.log('scorable          ' + score.scorable);
console.log('invalid reasons   ' + (score.invalidReasons.length ? score.invalidReasons.join(',') : '(none)'));
console.log('result set        expected ' + score.resultSet.expected + '  received ' + score.resultSet.received
  + '  missing ' + score.resultSet.missing.length + '  extra ' + score.resultSet.extra.length
  + '  duplicates ' + score.resultSet.duplicates.length);
console.log('');
console.log('gate  class      threshold                              measured                         verdict');
console.log('----  ---------  -------------------------------------  -------------------------------  -------');
for (const g of score.gates) {
  let measured;
  if (g.name === 'G3') {
    measured = `A ${g.numeratorA}/${g.denominatorA}` + (g.recallA === null ? '' : ` = ${(g.recallA * 100).toFixed(1)}%`)
             + ` | B ${g.numeratorB}/${g.denominatorB}` + (g.recallB === null ? '' : ` = ${(g.recallB * 100).toFixed(1)}%`);
  } else if (g.name === 'G2') {
    measured = `${g.violations} imprecise of ${g.denominator} raised (${(g.precision * 100).toFixed(1)}%)`;
  } else if (g.name === 'G10') {
    measured = `${g.conforming}/${g.denominator} = ${(g.rate * 100).toFixed(1)}%`;
  } else if (g.name === 'G9') {
    measured = g.violations === null ? 'NOT MEASURABLE' : `${g.violations} divergent of ${g.denominator} (${(g.reproducibility * 100).toFixed(1)}%)`;
  } else {
    measured = `${g.violations} of ${g.denominator}`;
  }
  console.log(`${g.name.padEnd(6)}${(g.hard ? 'HARD' : 'THRESHOLD').padEnd(11)}${String(g.threshold).padEnd(39)}${measured.padEnd(33)}${g.pass ? 'PASS' : 'FAIL'}`);
}
console.log('');
for (const g of score.gates) {
  if (g.byCode && Object.keys(g.byCode).length) console.log(`${g.name} codes: ${JSON.stringify(g.byCode)}`);
}
console.log('');
console.log('BY PROVENANCE (section 36.5, MANDATORY, never merged):');
for (const [k, v] of Object.entries(score.byProvenance)) {
  console.log(`  ${k.padEnd(22)} rows ${String(v.rows).padStart(2)}  G1 ${v.g1Misses}/${v.g1Denominator}  `
    + `G3A ${v.g3NumeratorA}/${v.g3DenominatorA}  G3B ${v.g3NumeratorB}/${v.g3DenominatorB}  `
    + `G4 ${v.g4FalseActive}/${v.g4Denominator}  G7 ${v.g7Violations}/${v.g7Pole}  schema ${v.schemaConforming}/${v.rows}`);
}
console.log('');
console.log('failed gates      ' + (score.failedGates.length ? score.failedGates.join(',') : '(none)'));
console.log('TERMINAL          ' + score.terminal);
console.log('pass              ' + score.pass);
console.log('');
console.log('wrote ' + OUT);
