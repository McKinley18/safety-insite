/**
 * RUN2_RECORDED_OUTPUT_COUNTERFACTUAL_REPLAY -- candidate downstream architectures.
 *
 * THIS IS NOT AN ACCEPTANCE RESULT AND IT IS NOT A NEW MEASUREMENT OF THE PROVIDER. It answers one
 * question only: had the proposed deterministic downstream architecture processed the SAME
 * already-recorded provider outputs, which gate failures would have changed?
 *
 * The frozen Run-2 terminal is untouched by everything here.
 *
 * Every transform below reads ONLY recorded structure. None reads a truth label, a row id, a
 * provenance class, a family variant or an expected-gate membership -- the harness refuses a
 * transform that touches truth, and no transform names a row.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const H = require('../replay/recorded-output-replay');

const UNDECIDED = ['INSUFFICIENT_EVIDENCE', 'UNKNOWN'];
const PRIORITY = ['ACTIVE', 'CONTROLLED', 'CORRECTED', 'REMOVED_FROM_SERVICE', 'NEGATED',
                  'HYPOTHETICAL', 'INSUFFICIENT_EVIDENCE', 'UNKNOWN'];
const assertedFrom = (states) => {
  if (!states || states.length === 0) return null;
  for (const s of PRIORITY) if (states.includes(s)) return s;
  return states[0];
};

/** Rebuild the scored candidate list from a state list, preserving keys/families where they exist. */
function candidatesFor(view, states) {
  const src = view.scoredTier.candidates || [];
  return states.map((s, i) => ({
    candidateKey: (src[i] && src[i].candidateKey) || `bound-${i}`,
    hazardFamily: (src[i] && src[i].hazardFamily) || (src[0] && src[0].hazardFamily) || 'unknown',
    conditionState: s,
  }));
}

/* ----------------------------------------------------------------- S1: authoritative tier = BOUND */
const S1_boundTier = (view) => {
  if (!view.binderTier) return view.scoredTier;
  const states = view.binderTier.boundStates || [];
  return { ...view.scoredTier, candidates: candidatesFor(view, states), assertedState: assertedFrom(states) };
};

/* ------------------- S2: BOUND tier + DEMOTE-RATHER-THAN-DELETE for state-unsupported rejections */
const STATE_UNSUPPORTED = 'SEMANTIC_STATE_UNSUPPORTED_BY_EVIDENCE';
function demoteStateUnsupported(view) {
  if (!view.binderTier) return null;
  const rejected = view.binderTier.rejected || [];
  const demotable = rejected.filter(r => (r.codes || []).length === 1 && r.codes[0] === STATE_UNSUPPORTED);
  if (demotable.length === 0) return null;
  return (view.binderTier.boundStates || []).concat(demotable.map(() => 'INSUFFICIENT_EVIDENCE'));
}
const S2_boundPlusDemote = (view) => {
  const base = S1_boundTier(view);
  const states = demoteStateUnsupported(view);
  if (!states) return base;
  return { ...base, candidates: candidatesFor(view, states), assertedState: assertedFrom(states) };
};

/* --------- S3: S2 + a clarification travels with every demoted candidate (the carrier question) */
const S3_boundPlusDemotePlusClarification = (view) => {
  const s2 = S2_boundPlusDemote(view);
  const states = demoteStateUnsupported(view);
  if (!states) return s2;
  return { ...s2, raisedClarification: true };
};

/* -- S4: RC-2 proposal-level approximation. ACTIVE alongside a candidate the model itself left
      undecided, with a candidate-borne question, is a proposal that has not decided. */
const S4_activeWithSelfDeclaredUndecided = (view) => {
  const states = (view.scoredTier.candidates || []).map(c => c.conditionState);
  const active = view.scoredTier.assertedState === 'ACTIVE';
  const undecidedSibling = states.some(s => UNDECIDED.includes(s));
  const carried = view.providerTier.candidateBorneClarification === true;
  if (!(active && undecidedSibling && carried)) return view.scoredTier;
  const next = states.map(s => (s === 'ACTIVE' ? 'INSUFFICIENT_EVIDENCE' : s));
  return { ...view.scoredTier, candidates: candidatesFor(view, next), assertedState: assertedFrom(next) };
};

/* ----------------------------------------------------------------- S5: S2 composed with S4 */
const S5_combined = (view) => {
  const s2 = S2_boundPlusDemote(view);
  const s4 = S4_activeWithSelfDeclaredUndecided({ ...view, scoredTier: s2 });
  return s4;
};

const SCENARIOS = [
  ['S0_IDENTITY_baseline', H.IDENTITY],
  ['S1_authoritative_tier_BOUND', S1_boundTier],
  ['S2_BOUND_plus_demote_not_delete', S2_boundPlusDemote],
  ['S3_S2_plus_carrier_clarification', S3_boundPlusDemotePlusClarification],
  ['S4_RC2_proposal_level_approximation', S4_activeWithSelfDeclaredUndecided],
  ['S5_S2_plus_S4', S5_combined],
];

const loaded = H.load();
const gate = (s, n) => s.gates.find(g => g.name === n);
const rows = [];
const full = {};

for (const [label, t] of SCENARIOS) {
  const r = H.replay(loaded, t, { label });
  const s = r.score;
  full[label] = s;
  rows.push({
    label,
    G1: gate(s, 'G1').violations,
    G2: gate(s, 'G2').violations,
    G3missA: gate(s, 'G3').denominatorA - gate(s, 'G3').numeratorA,
    G3recallA: gate(s, 'G3').recallA,
    G3recallB: gate(s, 'G3').recallB,
    G4: gate(s, 'G4').violations,
    G5: gate(s, 'G5').violations,
    G6: gate(s, 'G6').violations,
    G7: gate(s, 'G7').violations,
    G8: gate(s, 'G8').violations,
    G9: gate(s, 'G9').violations,
    G10rate: gate(s, 'G10').rate,
    failed: s.failedGates.join(','),
  });
}

const pad = (v, n) => String(v).padStart(n);
console.log('scenario                                 G1  G2  G3miss  G4  G5  G6  G7  G8  G9   failed');
for (const r of rows) {
  console.log(`${r.label.padEnd(38)} ${pad(r.G1,3)} ${pad(r.G2,3)} ${pad(r.G3missA,7)} ${pad(r.G4,3)} ${pad(r.G5,3)} ${pad(r.G6,3)} ${pad(r.G7,3)} ${pad(r.G8,3)} ${pad(r.G9,3)}   ${r.failed}`);
}
fs.writeFileSync(path.join(__dirname, '..', 'results', 'COUNTERFACTUAL_SCENARIOS.json'),
  JSON.stringify({ note: 'RUN2_RECORDED_OUTPUT_COUNTERFACTUAL_REPLAY -- diagnostic only, not an acceptance result', rows, full }, null, 2));
