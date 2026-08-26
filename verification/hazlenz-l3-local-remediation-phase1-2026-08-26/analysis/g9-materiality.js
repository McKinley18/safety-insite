/**
 * G9 DIVERGENCE MATERIALITY, BEFORE AND AFTER -- the Phase-5 (RC-3 containment) measurement.
 *
 * The materiality classes are section 69.3's, used verbatim and NOT redefined:
 *   G9-S1  a SAFETY-DECISION divergence -- ACTIVE asserted, or a clarification raised, in exactly
 *          one process.
 *   G9-S2  both processes agree on the safety conclusion and the clarification decision, and differ
 *          only in whether a NON-ACTIVE candidate was surfaced.
 *   G9-S3  non-material representational divergence. Structurally empty for G9 by construction.
 *
 * G9 itself is NOT amended, NOT reprojected and NOT reinterpreted here. This file classifies the
 * divergences the FROZEN G9 projection already counts, so a remediation can be judged on whether it
 * removed SAFETY-MATERIAL divergence or merely removed rows.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const H = require('../replay/recorded-output-replay');
const S = require('./counterfactual-scenarios-lib');

const loaded = H.load();
const hasCandidate = (r) => Array.isArray(r.scoredTier.candidates) && r.scoredTier.candidates.length > 0;
/** The frozen G9 projection, character-for-character in behaviour. */
const material = (r) => JSON.stringify({
  state: r ? (r.scoredTier.assertedState === undefined ? null : r.scoredTier.assertedState) : null,
  clar: r ? r.scoredTier.raisedClarification === true : null,
  any: r ? hasCandidate(r) : false,
});

function classify(a, b) {
  const activeA = a && a.scoredTier.assertedState === 'ACTIVE';
  const activeB = b && b.scoredTier.assertedState === 'ACTIVE';
  const clarA = !!(a && a.scoredTier.raisedClarification === true);
  const clarB = !!(b && b.scoredTier.raisedClarification === true);
  if (activeA !== activeB || clarA !== clarB) return 'G9-S1';
  return 'G9-S2';
}

const out = {};
for (const [label, t] of S.SCENARIOS) {
  const A = new Map(loaded.A.map(r => [r.rowId, H.applyTransform(r, t)]));
  const B = new Map(loaded.B.map(r => [r.rowId, H.applyTransform(r, t)]));
  const divergent = [];
  for (const id of A.keys()) {
    const a = A.get(id), b = B.get(id);
    if (material(a) === material(b)) continue;
    divergent.push({ id, klass: classify(a, b),
      a: { state: a.scoredTier.assertedState, clar: a.scoredTier.raisedClarification, any: hasCandidate(a) },
      b: { state: b.scoredTier.assertedState, clar: b.scoredTier.raisedClarification, any: hasCandidate(b) } });
  }
  out[label] = {
    divergent: divergent.length,
    reproducibility: (93 - divergent.length) / 93,
    'G9-S1_safety_material': divergent.filter(d => d.klass === 'G9-S1').length,
    'G9-S2_traceability_only': divergent.filter(d => d.klass === 'G9-S2').length,
    rows: divergent,
  };
}

console.log('scenario                                divergent  reproducibility  G9-S1(safety)  G9-S2(traceability)');
for (const [label] of S.SCENARIOS) {
  const o = out[label];
  console.log(`${label.padEnd(38)} ${String(o.divergent).padStart(9)}  ${(o.reproducibility*100).toFixed(2).padStart(14)}%  ${String(o['G9-S1_safety_material']).padStart(13)}  ${String(o['G9-S2_traceability_only']).padStart(19)}`);
}
console.log('\n--- baseline divergent rows ---');
for (const d of out['S0_IDENTITY_baseline'].rows) console.log(`  ${d.id} ${d.klass}  A=${JSON.stringify(d.a)}  B=${JSON.stringify(d.b)}`);
console.log('\n--- rows the BOUND-tier scenario removes from divergence ---');
const baseIds = new Set(out['S0_IDENTITY_baseline'].rows.map(d => d.id));
const s1Ids = new Set(out['S1_authoritative_tier_BOUND'].rows.map(d => d.id));
for (const id of baseIds) if (!s1Ids.has(id)) {
  const d = out['S0_IDENTITY_baseline'].rows.find(x => x.id === id);
  console.log(`  ${id} ${d.klass}  converged`);
}
for (const id of s1Ids) if (!baseIds.has(id)) console.log(`  ${id}  NEWLY divergent under the bound tier`);
fs.writeFileSync(path.join(__dirname, '..', 'results', 'G9_MATERIALITY.json'), JSON.stringify(out, null, 2));
