#!/usr/bin/env node
/*
 * G9 MATERIALITY CLASSIFICATION AND DIAGNOSTIC COUNTERFACTUALS.
 *
 * ZERO PROVIDER CALLS. Reads only the already-spent Run-2 evidence and the frozen holdout's truth
 * metadata. NO UNSPENT CORPUS IS OPENED. The scorer is NOT modified and the frozen result is NOT
 * changed: every counterfactual below is DIAGNOSTIC and is reported alongside, never instead of,
 * the frozen verdict.
 *
 *   RUN 2 REMAINS  L3_ACCEPTANCE_FAILED — G1,G2,G3,G4,G5,G6,G9
 *                  MODEL_ACCEPTANCE_RESULT = ESTABLISHED_FAIL
 *   NO COUNTERFACTUAL CREATES A RETROACTIVE PASS.
 */
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const ROOT = path.join(__dirname, '..', '..', '..');
const R2 = path.join(ROOT, 'verification', 'hazlenz-l3-run2-sealed-acceptance-2026-08-25');
const HOLDOUT_P = path.join(ROOT, 'verification', 'hazlenz-l3-run2-acceptance-holdout-2026-08-25', 'holdout', 'holdout-l3-acceptance-run2.json');
const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');

const EXPECT = {
  [HOLDOUT_P]: 'f887cfd1fb7ed030c9b95866775094f64c79222a7145c8ca4c95e1f956b05f8f',
  [path.join(R2, 'results', 'raw-process-A.json')]: 'b666da3cfb68614001b5664c61a153420cba21d7d450173f9a4f43c9e4a8e3c3',
  [path.join(R2, 'results', 'raw-process-B.json')]: '514b6c2ed91c647abeef24d12447c034c719891daff969919b5fdfa323be641f',
};
for (const [p, e] of Object.entries(EXPECT)) {
  if (sha(p) !== e) throw new Error(`EVIDENCE DRIFT on ${p}. REFUSING TO ANALYSE.`);
}

const holdout = JSON.parse(fs.readFileSync(HOLDOUT_P, 'utf8'));
const rawA = JSON.parse(fs.readFileSync(path.join(R2, 'results', 'raw-process-A.json'), 'utf8'));
const rawB = JSON.parse(fs.readFileSync(path.join(R2, 'results', 'raw-process-B.json'), 'utf8'));
const frozen = JSON.parse(fs.readFileSync(path.join(R2, 'scoring', 'ACCEPTANCE_SCORE.json'), 'utf8')).score;
const A = new Map(rawA.rows.map((r) => [r.rowId, r]));
const B = new Map(rawB.rows.map((r) => [r.rowId, r]));
const rows = holdout.rows;

const hasCandidate = (r) => !!r && Array.isArray(r.candidates) && r.candidates.length > 0;
const out = [];
const say = (s = '') => out.push(s);

// =================================================================================================
// PART 1 -- WHAT G9 ACTUALLY COMPARES, AND WHAT IT DOES NOT
// =================================================================================================
// The frozen projection, transcribed verbatim from ea5e50ae...
const PROJECTIONS = {
  // A -- exactly what the frozen scorer compares today.
  A_frozen_G9: (r) => JSON.stringify({
    state: r ? (r.assertedState === undefined ? null : r.assertedState) : null,
    clar: r ? r.raisedClarification === true : null,
    any: hasCandidate(r),
  }),
  // B -- SAFETY-DECISION equivalence: did we assert an active hazard, and did we ask a question?
  B_safety_decision: (r) => JSON.stringify({
    assertsActive: !!r && r.assertedState === 'ACTIVE',
    clar: !!r && r.raisedClarification === true,
  }),
  // C -- CUSTOMER-VISIBLE outcome equivalence: the safety conclusion alone.
  C_customer_visible: (r) => JSON.stringify({
    assertsActive: !!r && r.assertedState === 'ACTIVE',
  }),
  // D -- state + decision-critical clarification, WITHOUT the separate hasCandidate flag.
  D_state_plus_clarification: (r) => JSON.stringify({
    state: r ? (r.assertedState === undefined ? null : r.assertedState) : null,
    clar: r ? r.raisedClarification === true : null,
  }),
};

const divergentUnder = (proj) => rows.filter((r) => proj(A.get(r.rowId)) !== proj(B.get(r.rowId) || null));

// Is the `any` field redundant with `state`? Measured, not assumed.
const anyRedundant = rows.every((r) => {
  for (const M of [A, B]) {
    const x = M.get(r.rowId);
    const stateNull = !x || x.assertedState === null || x.assertedState === undefined;
    if (stateNull !== !hasCandidate(x)) return false;
  }
  return true;
});

say('G9 GOVERNANCE REVIEW -- WHAT G9 MEASURES, AND WHAT IT DOES NOT');
say('ZERO provider calls. $0.00. No unspent corpus opened. The frozen result is unchanged.');
say('');
say('THE FROZEN G9 PROJECTION, VERBATIM FROM ea5e50ae...:');
say('    material(res) = { state: assertedState, clar: raisedClarification, any: hasCandidate }');
say('    denominator 93 (ALL rows) | comparison unit: one holdout row | threshold 100% | HARD');
say('');
say('FIELDS G9 COMPARES (3):');
say('    assertedState        the VALIDATED-tier condition state');
say('    raisedClarification  boolean -- was a question raised at all');
say('    hasCandidate         boolean -- was any hazard candidate recognised');
say('');
say('FIELDS G9 DOES **NOT** COMPARE -- this is the decisive structural fact:');
say('    evidence spans/offsets ... NOT compared    corrective-action text ..... NOT compared');
say('    rationale / wording ...... NOT compared    candidate keys ............. NOT compared');
say('    hazard family ............ NOT compared    number of candidates ....... NOT compared');
say('    binder outcomes .......... NOT compared    validator issue codes ...... NOT compared');
say('');
say('  => G9 IS ALREADY A DECISION-LEVEL GATE, NOT A STRUCTURAL ONE. It cannot be failed by');
say('     wording, span or representational variation, because it never looks at them.');
say('     The category "G9-S3 NON_MATERIAL_REPRESENTATIONAL_DIVERGENCE" is therefore');
say('     STRUCTURALLY EMPTY FOR G9 BY CONSTRUCTION -- not empty by luck on this corpus.');
say('');
say(`  Is the third field redundant with the first? MEASURED: ${anyRedundant}`);
say('  (assertedState is null exactly when no candidate exists, on all 186 records, so `any`');
say('   carries no information beyond `state` on this corpus.)');
say('');
say('WHICH REPRODUCIBILITY PROPERTY DOES G9 CURRENTLY MEASURE?');
say('    A. exact structural reproducibility ....... NO  -- spans/wording/families all ignored');
say('    B. decision reproducibility ............... YES -- this is what it measures');
say('    C. safety-outcome reproducibility ......... PARTLY -- it is a superset of C: it also');
say('                                                counts non-ACTIVE state distinctions and');
say('                                                hazard-recognition presence');
say('    D. customer-visible reproducibility ....... NOT DIRECTLY -- depends on what the product');
say('                                                surfaces; see the materiality table below');
say('');

// =================================================================================================
// PART 2 -- MATERIALITY CLASSIFICATION OF THE 14 DIVERGENCES
// =================================================================================================
const truth = new Map(rows.map((r) => [r.rowId, r]));
const g9rows = divergentUnder(PROJECTIONS.A_frozen_G9);

function classify(a, b) {
  const aActive = !!a && a.assertedState === 'ACTIVE';
  const bActive = !!b && b.assertedState === 'ACTIVE';
  const aClar = !!a && a.raisedClarification === true;
  const bClar = !!b && b.raisedClarification === true;
  const reasons = [];
  if (aActive !== bActive) reasons.push('ACTIVE asserted in exactly one process');
  if (aClar !== bClar) reasons.push('clarification raised in exactly one process');
  if (reasons.length) return { cls: 'G9-S1', why: reasons.join(' AND '), customerMaterial: true };
  // Neither asserts ACTIVE and both agree on whether to ask. What remains is whether a
  // non-active candidate was surfaced at all.
  const aState = a ? a.assertedState : null, bState = b ? b.assertedState : null;
  if (aState !== bState) {
    return { cls: 'G9-S2',
      why: `both processes agree there is NO active hazard and agree on the clarification decision; they differ only in whether a non-active candidate was surfaced (${aState} vs ${bState}). Traceability and downstream processing differ; the safety conclusion does not.`,
      customerMaterial: false };
  }
  return { cls: 'G9-S3', why: 'representational only', customerMaterial: false };
}

say('================================================================================');
say('PART 2 -- MATERIALITY OF THE 14 G9 DIVERGENCES');
say('================================================================================');
say('');
const counts = { 'G9-S1': 0, 'G9-S2': 0, 'G9-S3': 0 };
const perRow = [];
for (const r of g9rows) {
  const a = A.get(r.rowId), b = B.get(r.rowId), t = truth.get(r.rowId);
  const c = classify(a, b);
  counts[c.cls]++;
  const fields = [];
  if ((a ? a.assertedState : null) !== (b ? b.assertedState : null)) fields.push('assertedState');
  if ((!!a && a.raisedClarification) !== (!!b && b.raisedClarification)) fields.push('raisedClarification');
  if (hasCandidate(a) !== hasCandidate(b)) fields.push('hasCandidate');
  const otherGates = [];
  if (t.expect.highConsequence && !hasCandidate(a)) otherGates.push('G1');
  if ((!!a && a.raisedClarification) && t.expect.clarificationExpected !== true) otherGates.push('G2');
  if (t.expect.clarificationExpected === true && !(!!a && a.raisedClarification)) otherGates.push('G3');
  if (t.expect.inG4Denominator && a && a.assertedState === 'ACTIVE') otherGates.push('G4');
  if (a && a.safetyConsequentialRejection) otherGates.push('G5');
  if (a && (a.nonRetryableValidationReasons || []).length) otherGates.push('G6');
  perRow.push({ rowId: r.rowId, provenanceClass: r.provenanceClass, familyVariant: r.familyVariant,
    A: { state: a ? a.assertedState : null, clar: !!a && a.raisedClarification, any: hasCandidate(a) },
    B: { state: b ? b.assertedState : null, clar: !!b && b.raisedClarification, any: hasCandidate(b) },
    differingFields: fields, classification: c.cls, reason: c.why,
    overlapsGates: otherGates, customerCouldReceiveDifferentSafetyConclusion: c.customerMaterial });
  say(`${r.rowId}  ${r.provenanceClass}${r.familyVariant ? ' / ' + r.familyVariant : ''}   ${c.cls}`);
  say(`   A: state=${a ? a.assertedState : null} clar=${!!a && a.raisedClarification} any=${hasCandidate(a)}`);
  say(`   B: state=${b ? b.assertedState : null} clar=${!!b && b.raisedClarification} any=${hasCandidate(b)}`);
  say(`   differing fields: ${fields.join(', ')}`);
  say(`   overlaps: ${otherGates.length ? otherGates.join(',') : 'none (G9 only)'}`);
  say(`   customer could receive a materially different safety conclusion: ${c.customerMaterial ? 'YES' : 'NO'}`);
  say(`   reason: ${c.why}`);
  say('');
}
say(`TOTALS   G9-S1 ${counts['G9-S1']}   G9-S2 ${counts['G9-S2']}   G9-S3 ${counts['G9-S3']}   (of ${g9rows.length})`);
say('');
say('G9-S3 is EMPTY BY CONSTRUCTION, not by chance: G9 never compares a representational field.');
say('');

// =================================================================================================
// PART 3 -- DIAGNOSTIC COUNTERFACTUALS
// =================================================================================================
say('================================================================================');
say('PART 3 -- DIAGNOSTIC COUNTERFACTUALS  *** NOT A RESCORE. NOT A RETROACTIVE PASS. ***');
say('================================================================================');
say('');
const results = {};
for (const [name, proj] of Object.entries(PROJECTIONS)) {
  const d = divergentUnder(proj);
  results[name] = { divergent: d.length, reproducibility: (93 - d.length) / 93, rowIds: d.map((r) => r.rowId) };
  say(`  ${name.padEnd(28)} divergent ${String(d.length).padStart(2)} / 93   reproducibility ${((93 - d.length) / 93 * 100).toFixed(2)}%`);
}
say('');
say(`  FROZEN G9 AS SCORED: ${frozen.gates.find((g) => g.name === 'G9').violations} divergent, `
  + `${(frozen.gates.find((g) => g.name === 'G9').reproducibility * 100).toFixed(2)}% -- and the counterfactual A reproduces it exactly: `
  + `${results.A_frozen_G9.divergent === frozen.gates.find((g) => g.name === 'G9').violations}`);
say('');
say('  EVEN UNDER THE MOST PERMISSIVE PROJECTION (C, the safety conclusion alone), Run 2 does NOT');
say(`  reach 100%: ${results.C_customer_visible.divergent} rows still differ. AND SEVEN OTHER GATES`);
say('  FAILED INDEPENDENTLY OF G9 -- G1, G2, G3, G4, G5 and G6 are unaffected by any G9 projection.');
say('  NO CHOICE OF G9 DEFINITION TURNS RUN 2 INTO A PASS. The frozen terminal is not in play.');
say('');
say(`  RUN 2 REMAINS: ${frozen.terminal}`);
say(`  MODEL_ACCEPTANCE_RESULT = ${frozen.modelAcceptanceResult}`);

fs.writeFileSync(path.join(__dirname, 'G9_MATERIALITY.txt'), out.join('\n') + '\n');
fs.writeFileSync(path.join(__dirname, 'G9_MATERIALITY.json'), JSON.stringify({
  providerCalls: 0, apiCostUsd: 0,
  frozenTerminal: frozen.terminal, frozenModelAcceptanceResult: frozen.modelAcceptanceResult,
  frozenG9: frozen.gates.find((g) => g.name === 'G9'),
  g9ComparesFields: ['assertedState', 'raisedClarification', 'hasCandidate'],
  g9DoesNotCompare: ['evidence spans', 'corrective-action text', 'rationale/wording', 'candidate keys', 'hazard family', 'candidate count', 'binder outcomes', 'validator issue codes'],
  hasCandidateRedundantWithState: anyRedundant,
  materiality: counts, perRow, counterfactuals: results,
  noCounterfactualCreatesAPass: true,
}, null, 2) + '\n');
process.stdout.write(out.join('\n') + '\n');
