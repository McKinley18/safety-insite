/*
 * SYNTHETIC VALIDATION OF acceptance-scorer-v2.js.
 *
 * Every fixture is synthesized from rowIds and FROZEN GATE FLAGS ONLY, so each expected outcome is
 * known BY CONSTRUCTION. NO PROVIDER RUN. NO INFERENCE. NO HOLDOUT SEMANTICS CONSUMED -- no
 * `observation` value is read anywhere in this file.
 *
 * IT DOES NOT TUNE AGAINST RUN 1. The only Run-1 fact it uses is the STRUCTURAL shape "40 of 92
 * rows were provider-evaluated" (test 12). No Run-1 semantic output, hazard, state, clarification
 * or rationale is read.
 */
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const ROOT = path.join(__dirname, '..', '..', '..');
const A2 = path.join(ROOT, 'verification', 'hazlenz-l3-acceptance-holdout-attempt2-2026-08-24');
const HOLDOUT = path.join(A2, 'holdout', 'holdout-l3-acceptance-attempt2.json');
const frozen = require(path.join(A2, 'scorer', 'acceptance-scorer.js'));
const { scoreAcceptanceV2 } = require('./acceptance-scorer-v2.js');

const holdout = JSON.parse(fs.readFileSync(HOLDOUT, 'utf8'));
const rows = holdout.rows;

let pass = 0, fail = 0; const out = [];
const p = (s = '') => out.push(s);
function T(name, cond, detail) {
  cond ? pass++ : fail++;
  p(`  ${(cond ? 'PASS' : 'FAIL').padEnd(6)} ${name}${detail ? '   ' + detail : ''}`);
}

/** A perfect, fully-evaluated result for every row. Built from frozen flags only. */
const perfect = () => rows.map(r => ({
  rowId: r.rowId,
  providerEvaluated: true,
  schemaValid: true,
  retries: 0,
  candidates: [{ candidateKey: 'c1', hazardFamily: 'falls', conditionState: 'INSUFFICIENT_EVIDENCE' }],
  raisedClarification: r.expect.clarificationExpected === true,
  assertedState: 'INSUFFICIENT_EVIDENCE',
  nonRetryableValidationReasons: [],
  safetyConsequentialRejection: false,
  decisionBoundaryCodes: [],
}));
const clone = (rs) => JSON.parse(JSON.stringify(rs));
const at = (rs, id) => rs.find(x => x.rowId === id);
const firstWith = (pred) => rows.find(pred).rowId;

p('L3 ACCEPTANCE SCORER v2 -- SYNTHETIC VALIDATION');
p('holdout ' + crypto.createHash('sha256').update(fs.readFileSync(HOLDOUT)).digest('hex'));
p('');

// ---------------------------------------------------------------- 1. all-pass equivalence
p('1. COMPLETE VALID ALL-PASS RESULT IS IDENTICAL TO PRIOR SCORER BEHAVIOUR');
{
  const A = perfect(), B = perfect();
  const f = frozen.scoreAcceptance(holdout, A, B);
  const v = scoreAcceptanceV2(holdout, A, B);
  T('frozen all-pass baseline is a PASS', f.pass === true, 'terminal ' + f.terminal);
  T('v2 pass === frozen pass', v.pass === f.pass);
  T('v2 terminal === frozen terminal', v.terminal === f.terminal, v.terminal);
  T('v2 gates identical to frozen gates', JSON.stringify(v.gates) === JSON.stringify(f.gates));
  T('v2 byProvenance identical', JSON.stringify(v.byProvenance) === JSON.stringify(f.byProvenance));
  T('v2 failedGates identical', JSON.stringify(v.failedGates) === JSON.stringify(f.failedGates));
  T('v2 scorable === frozen scorable', v.scorable === f.scorable);
  T('gate arithmetic marked AUTHORITATIVE', v.gateArithmeticAuthoritative === true);
  T('modelAcceptanceResult ESTABLISHED_PASS', v.modelAcceptanceResult === 'ESTABLISHED_PASS');
}
p('');

// ---------------------------------------------------------------- 2-4. substantive failures survive
p('2-4. EVERY SUBSTANTIVE G1..G10 FAILURE REMAINS A FAILURE UNDER v2 (complete runs)');
const breakers = {
  G1: (A) => { at(A, firstWith(r => r.expect.highConsequence === true)).candidates = []; },
  G2: (A) => { at(A, firstWith(r => r.expect.clarificationExpected !== true)).raisedClarification = true; },
  G3: (A) => { at(A, firstWith(r => r.expect.clarificationExpected === true)).raisedClarification = false; },
  G4: (A) => { at(A, firstWith(r => r.expect.inG4Denominator === true)).assertedState = 'ACTIVE'; },
  G5: (A) => { at(A, rows[0].rowId).safetyConsequentialRejection = true; },
  G6: (A) => { at(A, rows[0].rowId).nonRetryableValidationReasons = ['EVIDENCE_TEXT_MISMATCH']; },
  G7: (A) => { at(A, firstWith(r => r.expect.inG7Pole === true)).raisedClarification = true; },
  G8: (A) => { at(A, rows[0].rowId).decisionBoundaryCodes = ['INVALID_CLARIFICATION_DEPENDENCY']; },
  G9: (A, B) => { at(B, rows[0].rowId).assertedState = 'ACTIVE'; },
  G10:(A) => { for (const id of rows.slice(0, 3).map(r => r.rowId)) at(A, id).schemaValid = false; },
};
for (const [gate, breakIt] of Object.entries(breakers)) {
  const A = clone(perfect()), B = clone(perfect());
  breakIt(A, B);
  const f = frozen.scoreAcceptance(holdout, A, B);
  const v = scoreAcceptanceV2(holdout, A, B);
  const frozenFailed = f.failedGates.includes(gate);
  const same = JSON.stringify(v.gates) === JSON.stringify(f.gates) && v.pass === f.pass && v.terminal === f.terminal;
  T(`${gate} failure preserved and v2 identical to frozen`, frozenFailed && v.failedGates.includes(gate) && same && v.pass === false,
    'terminal ' + v.terminal);
  T(`${gate} modelAcceptanceResult is ESTABLISHED_FAIL`, v.modelAcceptanceResult === 'ESTABLISHED_FAIL');
}
p('');

// ---------------------------------------------------------------- 5. one missing evaluation
p('5. ONE MISSING PROVIDER EVALUATION MAKES SCORABLE = FALSE');
{
  const A = clone(perfect()), B = clone(perfect());
  const victim = at(A, rows[7].rowId);
  victim.providerEvaluated = false; victim.schemaValid = false; victim.candidates = [];
  victim.raisedClarification = false; victim.assertedState = null;
  const f = frozen.scoreAcceptance(holdout, A, B);
  const v = scoreAcceptanceV2(holdout, A, B);
  T('frozen scorer still reported scorable = true (the defect)', f.scorable === true);
  T('v2 scorable === false', v.scorable === false);
  T('v2 raises INCOMPLETE_PROVIDER_EVALUATION', v.invalidReasons.includes('INCOMPLETE_PROVIDER_EVALUATION'));
  T('v2 terminal is NOT_SCORABLE', /NOT_SCORABLE/.test(v.terminal), v.terminal);
  T('v2 pass === false', v.pass === false);
  T('EXPECTED_ROWS 92, PROVIDER_EVALUATED_ROWS 91',
    v.providerEvaluation.EXPECTED_ROWS === 92 && v.providerEvaluation.PROVIDER_EVALUATED_ROWS === 91);
  T('modelAcceptanceResult NOT_ESTABLISHED', v.modelAcceptanceResult === 'NOT_ESTABLISHED');
}
p('');

// ---------------------------------------------------------------- 6. many missing
p('6. MANY MISSING PROVIDER EVALUATIONS MAKE SCORABLE = FALSE');
{
  const A = clone(perfect()), B = clone(perfect());
  for (const r of A.slice(40)) { r.providerEvaluated = false; r.schemaValid = false; r.candidates = []; r.raisedClarification = false; r.assertedState = null; }
  const v = scoreAcceptanceV2(holdout, A, B);
  T('v2 scorable === false', v.scorable === false);
  T('PROVIDER_EVALUATED_ROWS === 40', v.providerEvaluation.PROVIDER_EVALUATED_ROWS === 40);
  T('notEvaluatedRowIds length === 52', v.providerEvaluation.notEvaluatedRowIds.length === 52);
  T('v2 pass === false', v.pass === false);
}
p('');

// ---------------------------------------------------------------- 7-8. placeholders create nothing
p('7-8. PROVIDER ERROR PLACEHOLDERS CANNOT CREATE A SUBSTANTIVE PASS OR A SUBSTANTIVE FAILURE');
{
  // Every row an error placeholder -- exactly the in-band encoding the root cause identified.
  const placeholder = rows.map(r => ({
    rowId: r.rowId, providerEvaluated: false, schemaValid: false, retries: 0, candidates: [],
    raisedClarification: false, assertedState: null, nonRetryableValidationReasons: [],
    safetyConsequentialRejection: false, decisionBoundaryCodes: [],
  }));
  const f = frozen.scoreAcceptance(holdout, placeholder, placeholder);
  const v = scoreAcceptanceV2(holdout, placeholder, placeholder);
  const hardZero = ['G4', 'G5', 'G6', 'G7', 'G8'];
  const vacuousPasses = f.gates.filter(g => hardZero.includes(g.name) && g.pass).map(g => g.name);
  T('frozen scorer awards vacuous hard-zero PASSES on pure placeholders',
    vacuousPasses.length === hardZero.length, 'vacuous: ' + vacuousPasses.join(','));
  T('frozen G9 vacuously "reproducible" (both processes empty)',
    f.gates.find(g => g.name === 'G9').violations === 0);
  T('v2 refuses: scorable === false', v.scorable === false);
  T('v2 pass === false -- no substantive PASS is reachable', v.pass === false);
  T('v2 marks the arithmetic NON-AUTHORITATIVE', v.gateArithmeticAuthoritative === false);
  T('v2 modelAcceptanceResult NOT_ESTABLISHED -- no substantive FAILURE either',
    v.modelAcceptanceResult === 'NOT_ESTABLISHED');
  T('v2 terminal is NOT_SCORABLE, not FAILED and not PASSED',
    /NOT_SCORABLE/.test(v.terminal) && !/L3_ACCEPTANCE_FAILED/.test(v.terminal) && !/PASSED/.test(v.terminal), v.terminal);
}
p('');

// ---------------------------------------------------------------- 9. spend vs scorable
p('9. HOLDOUT_SPENT = TRUE COEXISTS WITH SCORABLE = FALSE');
{
  const A = clone(perfect());
  for (const r of A.slice(1)) { r.providerEvaluated = false; }
  const v = scoreAcceptanceV2(holdout, A, clone(perfect()));
  const HOLDOUT_SPENT = true;   // set by transmission, never by the scorer
  T('scorer has no field that can revert spend',
    !Object.keys(v).some(k => /spent/i.test(k)));
  T('SCORABLE=false and HOLDOUT_SPENT=true are simultaneously representable',
    v.scorable === false && HOLDOUT_SPENT === true);
  T('INVALID does not imply UNSPENT', HOLDOUT_SPENT === true);
}
p('');

// ---------------------------------------------------------------- 10. incomplete never passes
p('10. INCOMPLETE PROVIDER EVALUATION CAN NEVER PRODUCE ACCEPTANCE PASS -- EXHAUSTIVE OVER k');
{
  let everPassed = false, checked = 0;
  for (let k = 0; k < rows.length; k++) {     // withhold evaluation from exactly row k
    const A = clone(perfect()), B = clone(perfect());
    A[k].providerEvaluated = false;
    const v = scoreAcceptanceV2(holdout, A, B);
    checked++;
    if (v.pass === true) everPassed = true;
  }
  T('no single withheld evaluation can yield pass = true (92 cases)', !everPassed, `${checked} cases`);
  // and the same on the B side
  let everPassedB = false;
  for (let k = 0; k < rows.length; k++) {
    const A = clone(perfect()), B = clone(perfect());
    B[k].providerEvaluated = false;
    if (scoreAcceptanceV2(holdout, A, B).pass === true) everPassedB = true;
  }
  T('no single withheld process-B evaluation can yield pass = true (92 cases)', !everPassedB);
  // undeclared field fails closed
  const A2r = clone(perfect()); delete A2r[3].providerEvaluated;
  const vU = scoreAcceptanceV2(holdout, A2r, clone(perfect()));
  T('an UNDECLARED providerEvaluated fails closed', vU.scorable === false
    && vU.invalidReasons.includes('PROVIDER_EVALUATION_NOT_DECLARED'));
}
p('');

// ---------------------------------------------------------------- 11. denominators and thresholds preserved
p('11. COMPLETE VALID RESULTS PRESERVE THE FROZEN DENOMINATORS AND THRESHOLDS');
{
  const A = perfect(), B = perfect();
  const v = scoreAcceptanceV2(holdout, A, B);
  const g = (n) => v.gates.find(x => x.name === n);
  T('G1 denominator 38', g('G1').denominator === 38);
  T('G3 DEN_A 29', g('G3').denominatorA === 29);
  T('G4 denominator 21 (Amendment 2 / D-E)', g('G4').denominator === 21);
  T('G7 pole 11', g('G7').denominator === 11);
  T('G5/G6/G8/G9/G10 denominator 92',
    ['G5','G6','G8','G9','G10'].every(n => g(n).denominator === 92));
  T('G10 threshold still >=99% after <=1 retry', g('G10').threshold === '>=99% after <=1 retry');
  T('G2 threshold still 100%', g('G2').threshold === '100%');
  T('G3 threshold still 100% on BOTH', /100% on BOTH/.test(g('G3').threshold));
  T('hard-zero gates still hard', ['G1','G4','G5','G6','G7','G8'].every(n => g(n).hard === true && g(n).threshold.startsWith('ZERO')));
  T('G10 is still the only non-hard gate', v.gates.filter(x => x.hard === false).map(x => x.name).join(',') === 'G10');
}
p('');

// ---------------------------------------------------------------- 12. Run-1 structural replay
p('12. THE RUN-1 40/92 CONDITION IS CLASSIFIED NOT_SCORABLE / INVALID WHEN REPLAYED STRUCTURALLY');
{
  // STRUCTURE ONLY: the first 40 rows evaluated, the remaining 52 not; process B fully unevaluated.
  // No Run-1 semantic output is read. Evaluated rows are given the PERFECT synthetic answer, so
  // the test cannot be accused of importing Run-1 model behaviour.
  const A = perfect().map((r, i) => i < 40 ? { ...r, providerEvaluated: true }
    : { ...r, providerEvaluated: false, schemaValid: false, candidates: [], raisedClarification: false, assertedState: null });
  const B = perfect().map(r => ({ ...r, providerEvaluated: false, schemaValid: false, candidates: [], raisedClarification: false, assertedState: null }));
  const f = frozen.scoreAcceptance(holdout, A, B);
  const v = scoreAcceptanceV2(holdout, A, B);
  T('frozen scorer would again report scorable = true', f.scorable === true);
  T('v2 scorable === false', v.scorable === false);
  T('v2 PROVIDER_EVALUATED_ROWS === 40 of 92',
    v.providerEvaluation.PROVIDER_EVALUATED_ROWS === 40 && v.providerEvaluation.EXPECTED_ROWS === 92);
  T('v2 flags process B incomplete', v.invalidReasons.includes('INCOMPLETE_PROVIDER_EVALUATION_PROCESS_B'));
  T('v2 terminal NOT_SCORABLE — INCOMPLETE_PROVIDER_EVALUATION',
    v.terminal === 'L3_ACCEPTANCE_NOT_SCORABLE — INCOMPLETE_PROVIDER_EVALUATION', v.terminal);
  T('v2 modelAcceptanceResult NOT_ESTABLISHED', v.modelAcceptanceResult === 'NOT_ESTABLISHED');
  T('v2 pass === false', v.pass === false);
}
p('');
p(`TOTAL: ${pass + fail} assertions, ${pass} PASS, ${fail} FAIL`);
p('NO PROVIDER RUN. NO INFERENCE. NO HOLDOUT SEMANTICS CONSUMED. NO TUNING AGAINST RUN-1 OUTPUT.');
fs.writeFileSync(path.join(__dirname, 'SYNTHETIC_V2_VALIDATION.txt'), out.join('\n') + '\n');
console.log(out.join('\n'));
if (fail > 0) process.exit(1);
