/**
 * HARNESS FIDELITY PROOF -- the positive and negative controls for the replay harness.
 *
 * POSITIVE CONTROL. Replaying the recorded output through the IDENTITY transform must reproduce the
 * FROZEN Run-2 verdict EXACTLY: same terminal, same failedGates, same per-gate arithmetic, same
 * modelAcceptanceResult. If it does not, the harness is not measuring Run 2 and no counterfactual
 * built on it means anything.
 *
 * NEGATIVE CONTROL. A deliberately wrong transform (assert ACTIVE everywhere) must move the gates.
 * A harness that returns the frozen numbers no matter what it is fed proves nothing.
 *
 * FAIL-CLOSED. An empty row set is an error, not a pass.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const H = require('./recorded-output-replay');

const frozenScorePath = path.join(__dirname, '..', '..',
  'hazlenz-l3-run2-sealed-acceptance-2026-08-25', 'scoring', 'ACCEPTANCE_SCORE.json');
const frozen = JSON.parse(fs.readFileSync(frozenScorePath, 'utf8')).score;

const loaded = H.load();
if (loaded.A.length === 0 || loaded.B.length === 0) throw new Error('FAIL-CLOSED: empty recorded row set');

const identity = H.replay(loaded, H.IDENTITY, { label: 'IDENTITY' });
const s = identity.score;

const gateOf = (score, name) => score.gates.find(g => g.name === name);
const checks = [];
const check = (id, pass, detail) => checks.push({ id, pass, detail });

check('terminal matches frozen', s.terminal === frozen.terminal, `${s.terminal} | frozen ${frozen.terminal}`);
check('failedGates match frozen', JSON.stringify(s.failedGates) === JSON.stringify(frozen.failedGates),
  `${JSON.stringify(s.failedGates)} | frozen ${JSON.stringify(frozen.failedGates)}`);
check('modelAcceptanceResult matches frozen', s.modelAcceptanceResult === frozen.modelAcceptanceResult,
  `${s.modelAcceptanceResult}`);
check('scorable matches frozen', s.scorable === frozen.scorable, String(s.scorable));
check('pass matches frozen', s.pass === frozen.pass, String(s.pass));
for (const g of frozen.gates) {
  const got = gateOf(s, g.name);
  check(`gate ${g.name} byte-identical`, JSON.stringify(got) === JSON.stringify(g),
    JSON.stringify(got) === JSON.stringify(g) ? 'identical' : `got ${JSON.stringify(got)} | frozen ${JSON.stringify(g)}`);
}
check('byProvenance byte-identical', JSON.stringify(s.byProvenance) === JSON.stringify(frozen.byProvenance), '');
check('providerEvaluation complete', s.providerEvaluation.completeProviderEvaluation === true, '');
check('provider calls this replay = 0', identity.providerCalls === 0, '0');

// ---- NEGATIVE CONTROL: a wrong transform must move the arithmetic.
const allActive = (view) => ({
  ...view.scoredTier,
  assertedState: 'ACTIVE',
  candidates: view.scoredTier.candidates.length ? view.scoredTier.candidates
    : [{ candidateKey: 'x', hazardFamily: 'falls', conditionState: 'ACTIVE' }],
});
const neg = H.replay(loaded, allActive, { label: 'NEGATIVE_CONTROL_ALL_ACTIVE' });
check('negative control moves G4', gateOf(neg.score, 'G4').violations !== gateOf(s, 'G4').violations,
  `G4 ${gateOf(s, 'G4').violations} -> ${gateOf(neg.score, 'G4').violations}`);
check('negative control moves G9', gateOf(neg.score, 'G9').violations !== gateOf(s, 'G9').violations,
  `G9 ${gateOf(s, 'G9').violations} -> ${gateOf(neg.score, 'G9').violations}`);

// ---- TRUTH-LEAK GUARD: a transform that reads truth must be refused.
let refused = false;
try { H.replay(loaded, (v) => { void v.truth; return v.scoredTier; }, { label: 'LEAK' }); }
catch (e) { refused = /TRANSFORM CONTRACT VIOLATION/.test(String(e.message)); }
check('truth-reading transform refused', refused, '');

// ---- NETWORK SEAL: the seal must actually intercept.
const seal = H.sealNetwork();
let sealed = false;
try { require('https').request('https://example.invalid'); } catch (e) { sealed = /ZERO-COST REPLAY VIOLATION/.test(String(e.message)); }
seal.release();
check('network seal intercepts https.request', sealed, '');

const passed = checks.filter(c => c.pass).length;
for (const c of checks) console.log(`${c.pass ? 'PASS' : 'FAIL'}  ${c.id}${c.detail ? '  --  ' + c.detail : ''}`);
console.log(`\nHARNESS FIDELITY: ${passed}/${checks.length}`);
fs.writeFileSync(path.join(__dirname, '..', 'results', 'HARNESS_FIDELITY.json'),
  JSON.stringify({ checks, passed, total: checks.length, providerCalls: 0, apiCostUsd: 0 }, null, 2));
if (passed !== checks.length) process.exit(1);
