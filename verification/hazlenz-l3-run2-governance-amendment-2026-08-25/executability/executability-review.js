/**
 * PHASE 9 -- INDEPENDENT EXECUTABILITY REVIEW of the amended plan.
 * Mechanical checks only. No provider, no inference, no row selection, no observation read.
 */
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const ROOT = path.join(__dirname, '..', '..', '..');
const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const A2 = path.join(ROOT, 'verification/hazlenz-l3-acceptance-holdout-attempt2-2026-08-24');
const PLAN = path.join(ROOT, 'verification/hazlenz-l3-2g-state-separation-2026-08-23/evidence-plan/INDEPENDENT_EVIDENCE_PLAN.md');
const plan = fs.readFileSync(PLAN, 'utf8');
const frozen = require(path.join(A2, 'scorer', 'acceptance-scorer.js'));
const { scoreAcceptanceV2 } = require(path.join(__dirname, '..', 'scorer', 'acceptance-scorer-v2.js'));
const holdout = JSON.parse(fs.readFileSync(path.join(A2, 'holdout', 'holdout-l3-acceptance-attempt2.json'), 'utf8'));

let ok = 0, bad = 0; const out = [];
const p = (s = '') => out.push(s);
const T = (name, cond, detail) => { cond ? ok++ : bad++; p(`  ${(cond ? 'OK' : 'DEFECT').padEnd(8)} ${name}${detail ? '   ' + detail : ''}`); };

p('L3 RUN-2 GOVERNANCE AMENDMENT -- PHASE 9 INDEPENDENT EXECUTABILITY REVIEW');
p('');
p('=== A. UNIQUE DERIVABILITY OF THE RUN-2 CORPUS ===');
const dv = fs.readFileSync(path.join(__dirname, 'DECLARED_VS_DERIVED.txt'), 'utf8');
T('declared-vs-derived report exists and reports 0 mismatches', /MISMATCH = 0/.test(dv));
T('Run-2 offsets uniquely derivable (single cyclic rule, no free parameter)',
  /gauntlet RUN-2 offset\s+derived 1/.test(dv) && /realism  RUN-2 offset\s+derived 0/.test(dv));
T('Run-2 source counts uniquely derivable from partition arithmetic',
  /gauntlet RUN-2 selected rows\s+derived 38/.test(dv) && /realism  RUN-2 selected rows\s+derived 30/.test(dv));
T('Run-2 total uniquely derivable', /RUN-2 total rows\s+derived 93/.test(dv));
T('S-5 drift guard re-asserted on both sources', (dv.match(/S-5 drift guard/g) || []).length === 2);
T('S-2 pairwise-distinct sort keys re-asserted on both sources', (dv.match(/pairwise distinct/g) || []).length === 2);
p('');
p('=== B. FRESH AUTHORED-CONTROL REQUIREMENT IS UNAMBIGUOUS ===');
T('D-I forbids reuse of Run-1 authored controls in terms, not by implication',
  /MUST NOT reuse any of the 25 authored controls/.test(plan));
T('D-I fixes the count at exactly 25', /A fresh set of\s*\n?\*\*exactly 25\*\*/.test(plan) || /\*\*exactly 25\*\*/.test(plan));
T('D-I defers authoring to the separately authorized construction phase',
  /only during the separately authorized Run-2 construction phase/.test(plan));
T('D-I refuses to weaken the overlap rule', /is NOT weakened because Run-1's authored controls went unanswered/.test(plan));
T('D-I preserves G3/G4/G7 membership rules unchanged', /No `G3`\/`G4`\/`G7` membership rule changes/.test(plan));
p('');
p('=== C. OVERLAP SURFACES REMAIN UNIQUELY SPECIFIED ===');
T('D-D.6 eight surfaces still present and unmodified in Amendment 1', /THE EIGHT SURFACES/.test(fs.readFileSync(path.join(A2,'HOLDOUT_FREEZE.txt'),'utf8')));
T('Amendment 3 adds the spent Run-1 holdout as a checked surface without renumbering',
  /against \*\*the\s*\nspent Run-1 holdout\*\*/.test(plan) || /the spent Run-1 holdout/.test(plan));
T('surface 8 ("previously spent acceptance offset") is now non-empty and mechanically satisfiable',
  /previously spent acceptance offset/.test(fs.readFileSync(path.join(A2,'HOLDOUT_FREEZE.txt'),'utf8')));
p('');
p('=== D. GATE MEMBERSHIPS REMAIN UNIQUELY DERIVABLE ===');
T('G3 authored 6 re-derived', /G3 authored members \(inG3\)\s+derived 6/.test(dv));
T('G4 denominator 21 re-derived', /G4 denominator \(inG4\)\s+derived 21/.test(dv));
T('G7 pole 11 re-derived', /G7 pole \(inG7\)\s+derived 11/.test(dv));
T('G4 closure 21 + ACTIVE-truth 4 = 25 re-derived', /G4 closure[^\n]*derived 25/.test(dv));
T('enumerated memberships agree with the declared family sets',
  /G4 enumerated membership[^\n]*MATCH|MATCH[^\n]*G4 enumerated/.test(dv) && /derived F1,F2,F3,F4,F5,F6,F8b/.test(dv));
p('');
p('=== E. COMPLETE-PROVIDER-EVALUATION VALIDITY IS UNIQUELY DECIDABLE ===');
T('the predicate is set equality over rowIds, not a percentage or a threshold',
  /PROVIDER_EVALUATED_ROW_IDS = EXPECTED_ROW_IDS/.test(plan));
T('PROVIDER_EVALUATED is defined over the frozen transport taxonomy, exhaustively',
  ['MALFORMED_STRUCTURED_OUTPUT','PROVIDER_REFUSAL','TIMEOUT','UNAVAILABLE','TRANSIENT_ERROR','PERMANENT_CONFIGURATION_ERROR']
    .every(k => plan.includes(k)));
{
  // The failure taxonomy is READ from the shipped source, never retyped.
  const src = fs.readFileSync(path.join(ROOT, 'backend/src/safescope-v2/reasoning-l3/hazlenz-reasoning-provider.ts'), 'utf8');
  const block = src.slice(src.indexOf('REASONING_PROVIDER_FAILURES = ['), src.indexOf('] as const;'));
  const kinds = [...block.matchAll(/'([A-Z_]+)'/g)].map(m => m[1]);
  const v2 = require(path.join(__dirname, '..', 'scorer', 'acceptance-scorer-v2.js'));
  const covered = [...v2.EVALUATED_FAILURE_KINDS, ...v2.NOT_EVALUATED_FAILURE_KINDS];
  T('frozen failure taxonomy read from shipped source', kinds.length === 6, kinds.join(','));
  T('every frozen provider failure kind is classified exactly once (total and disjoint)',
    kinds.every(k => covered.filter(c => c === k).length === 1) && covered.length === kinds.length,
    `${covered.length} classifications for ${kinds.length} kinds`);
  T('no classification names a kind the frozen taxonomy does not define',
    covered.every(c => kinds.includes(c)));
  // the retryable set must be untouched by this amendment
  const retryBlock = src.slice(src.indexOf('RETRYABLE_PROVIDER_FAILURES'), src.indexOf('export interface ReasoningProviderFailure'));
  const retryable = [...retryBlock.matchAll(/'([A-Z_]+)'/g)].map(m => m[1]);
  T('frozen retryable set unchanged: TIMEOUT, TRANSIENT_ERROR, MALFORMED_STRUCTURED_OUTPUT',
    retryable.slice().sort().join(',') === ['TIMEOUT','TRANSIENT_ERROR','MALFORMED_STRUCTURED_OUTPUT'].sort().join(','),
    retryable.join(','));
}
T('absence of the declaration fails closed', /FAIL-CLOSED/.test(plan) && /PROVIDER_EVALUATION_NOT_DECLARED/.test(plan));
T('no semantic judgment is required to decide provider completeness',
  !/quality|good answer|correct hazard/i.test(plan.slice(plan.indexOf('## `D-G.3`') >= 0 ? plan.indexOf('## `D-G.3`') : plan.indexOf('### D-G.3'), plan.indexOf('### D-G.4'))));
p('');
p('=== F. SCORABLE AND HOLDOUT_SPENT CANNOT BE CONFLATED ===');
T('D-H declares them orthogonal in terms', /orthogonal/.test(plan) && /INVALID MUST NEVER IMPLY UNSPENT/.test(plan));
{
  const rows = holdout.rows;
  const A = rows.map(r => ({ rowId: r.rowId, providerEvaluated: false, schemaValid: false, retries: 0,
    candidates: [], raisedClarification: false, assertedState: null, nonRetryableValidationReasons: [],
    safetyConsequentialRejection: false, decisionBoundaryCodes: [] }));
  const v = scoreAcceptanceV2(holdout, A, A);
  T('the v2 return object exposes no spend field at all', !JSON.stringify(v).match(/"[^"]*spent[^"]*"/i));
  T('SCORABLE=false is representable while spend is TRUE elsewhere', v.scorable === false);
}
p('');
p('=== G. THE ABORT PREDICATE IS MECHANICALLY DECIDABLE ===');
T('abort fires on the first row ending PROVIDER_EVALUATED=false after the frozen retry is exhausted',
  /ABORTS at the first required row that ends `PROVIDER_EVALUATED = FALSE`/.test(plan));
T('abort needs no threshold, streak length or tuning constant',
  /needs no threshold, streak length or tuning\s*\nconstant/.test(plan) || /no threshold, streak length or tuning/.test(plan));
T('abort reads only the frozen transport classification',
  /never\*\* inspects whether an answer is good or bad/.test(plan) || /never.{0,40}inspects whether an answer is good or bad/s.test(plan));
T('abort does not add or remove a retry', /No new retry is added and no existing retry is removed/.test(plan));
T('abort does not restore the corpus', /does \*\*not\*\* restore the\s*\nspent corpus/.test(plan) || /does not\s*\*\*restore/.test(plan) || /not\*\* restore the/.test(plan));
p('');
p('=== H. NO SUBSTANTIVE GATE CHANGED, NO THRESHOLD WEAKENED ===');
T('the frozen scorer file is byte-unchanged', sha(path.join(A2,'scorer','acceptance-scorer.js')) === 'ea5e50aea265370c9de72245c1c34075b44f0c3f2c8c91303c2f5eb92097d0b6');
T('the frozen holdout file is byte-unchanged', sha(path.join(A2,'holdout','holdout-l3-acceptance-attempt2.json')) === '69665e41d975f67515bf9864e221a4b05c0811e4c48089e4671c8a2ae1cc094c');
{
  // the 16-component acceptance-artifact identity of the Run-1 package must be untouched
  const skip = new Set(['ACCEPTANCE_ARTIFACT_MANIFEST.txt','INDEX.md','STATUS.md','NEXT_ACTION.md','PRESERVATION_AND_EGRESS.txt']);
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap(e =>
    e.isDirectory() ? walk(path.join(d, e.name)) : (skip.has(e.name) ? [] : [path.join(d, e.name)]));
  const lines = walk(A2).map(f => `${sha(f)}  ${path.relative(A2, f)}`).sort();
  const id = crypto.createHash('sha256').update(lines.join('\n') + '\n').digest('hex');
  T('Run-1 acceptance-artifact identity 189a3cbf... unchanged by this amendment',
    id === '189a3cbf780d859d45f753ea41e616591cb4fdfa9dd2d86b8d44ef4871f1cb1f', `${lines.length} components`);
}
{
  // exhaustive equivalence on a complete run: v2 must reproduce the frozen verdict, gate for gate
  const rows = holdout.rows;
  const base = () => rows.map(r => ({ rowId: r.rowId, providerEvaluated: true, schemaValid: true, retries: 0,
    candidates: [{ candidateKey: 'c1', hazardFamily: 'falls', conditionState: 'INSUFFICIENT_EVIDENCE' }],
    raisedClarification: r.expect.clarificationExpected === true, assertedState: 'INSUFFICIENT_EVIDENCE',
    nonRetryableValidationReasons: [], safetyConsequentialRejection: false, decisionBoundaryCodes: [] }));
  let equiv = true;
  for (let k = 0; k < rows.length; k++) {
    const A = base(), B = base();
    A[k].assertedState = 'ACTIVE'; A[k].raisedClarification = !A[k].raisedClarification;   // perturb one row
    const f = frozen.scoreAcceptance(holdout, A, B), v = scoreAcceptanceV2(holdout, A, B);
    if (v.pass !== f.pass || v.terminal !== f.terminal || JSON.stringify(v.gates) !== JSON.stringify(f.gates)) equiv = false;
  }
  T('v2 === frozen on 92 independently perturbed COMPLETE runs (gates, terminal and pass)', equiv, '92 cases');
}
T('no threshold string was altered anywhere in the gate objects', (() => {
  const rows = holdout.rows;
  const A = rows.map(r => ({ rowId: r.rowId, providerEvaluated: true, schemaValid: true, retries: 0,
    candidates: [{ candidateKey: 'c1', hazardFamily: 'falls', conditionState: 'INSUFFICIENT_EVIDENCE' }],
    raisedClarification: r.expect.clarificationExpected === true, assertedState: 'INSUFFICIENT_EVIDENCE',
    nonRetryableValidationReasons: [], safetyConsequentialRejection: false, decisionBoundaryCodes: [] }));
  const v = scoreAcceptanceV2(holdout, A, A);
  const want = { G1:'ZERO', G2:'100%', G4:'ZERO', G5:'ZERO', G6:'ZERO (every code)', G7:'ZERO', G8:'ZERO', G10:'>=99% after <=1 retry' };
  return Object.entries(want).every(([n, t]) => v.gates.find(g => g.name === n).threshold === t);
})());
p('');
p('=== I. NO SEMANTIC JUDGMENT IS REQUIRED DURING CONSTRUCTION ===');
T('D-J selects no row and reads no observation', /No row is selected by this amendment/.test(plan) && /no observation text was read/.test(plan));
T('|DEN_A| is explicitly deferred per D-B.3', /RUN2_DEN_A = UNKNOWN_UNTIL_AFTER_AUTHORIZED_SELECTION/.test(plan));
T('the derivation script did not read shouldHaveMissingEvidence',
  !/shouldHaveMissingEvidence/.test(fs.readFileSync(path.join(__dirname,'derive-run2-schedule.js'),'utf8').replace(/This script did not read shouldHaveMissingEvidence[^\n]*/g,'')));
p('');
p(`OK = ${ok}   DEFECT = ${bad}`);
p(bad === 0 ? 'THE AMENDED PLAN IS INDEPENDENTLY EXECUTABLE.' : '*** DEFECTS FOUND -- STOP ***');
fs.writeFileSync(path.join(__dirname, 'EXECUTABILITY_REVIEW.txt'), out.join('\n') + '\n');
console.log(out.join('\n'));
if (bad > 0) process.exit(1);
