/**
 * THE HARD VETOES, MEASURED SUBSTANTIVELY RATHER THAN THROUGH THE GATES.
 *
 * WHY THIS FILE EXISTS. `G1` counts a high-consequence MISS as "no validated candidate at all". A
 * change that keeps a candidate but strips its ACTIVE assertion is a real safety downgrade that
 * `G1` CANNOT SEE. Scoring a remediation on the gate table alone would therefore reward exactly the
 * `D-59` trade this programme has already paid for once.
 *
 * So the vetoes are measured on the substance:
 *
 *   HC_ACTIVE        truth-high-consequence rows on which the run still asserts ACTIVE
 *   HC_ANY           truth-high-consequence rows on which the run produces any candidate  (= G1's view)
 *   FALSE_ACTIVE     rows whose truth prohibits ACTIVE on which the run asserts ACTIVE
 *   HAZARD_RECOGNISED rows on which any candidate at all survives
 *   CLAR_RAISED      rows on which a clarification is raised
 *   CLAR_PRECISION   raised ∧ expected / raised
 *   CLAR_RECALL      raised ∧ expected / expected
 *
 * Truth is read HERE, offline, to score. It is never handed to a transform.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const H = require('../replay/recorded-output-replay');
const S = require('./counterfactual-scenarios-lib');

const loaded = H.load();

function measure(rows) {
  const hc = rows.filter(r => r.truth.highConsequence === true);
  const prohibited = rows.filter(r => r.truth.activeProhibited === true);
  const expected = rows.filter(r => r.truth.clarificationExpected === true);
  const raised = rows.filter(r => r.scoredTier.raisedClarification === true);
  const raisedExpected = raised.filter(r => r.truth.clarificationExpected === true);
  return {
    rows: rows.length,
    HC_DEN: hc.length,
    HC_ACTIVE: hc.filter(r => r.scoredTier.assertedState === 'ACTIVE').length,
    HC_ANY: hc.filter(r => (r.scoredTier.candidates || []).length > 0).length,
    FALSE_ACTIVE_DEN: prohibited.length,
    FALSE_ACTIVE: prohibited.filter(r => r.scoredTier.assertedState === 'ACTIVE').length,
    HAZARD_RECOGNISED: rows.filter(r => (r.scoredTier.candidates || []).length > 0).length,
    CLAR_RAISED: raised.length,
    CLAR_PRECISION: raised.length === 0 ? null : raisedExpected.length / raised.length,
    CLAR_RECALL: expected.length === 0 ? null : raisedExpected.length / expected.length,
  };
}

const out = {};
for (const [label, t] of S.SCENARIOS) {
  const A = loaded.A.map(r => H.applyTransform(r, t));
  const B = loaded.B.map(r => H.applyTransform(r, t));
  out[label] = { A: measure(A), B: measure(B) };
}

const base = out['S0_IDENTITY_baseline'];
const keys = ['HC_ACTIVE', 'HC_ANY', 'FALSE_ACTIVE', 'HAZARD_RECOGNISED', 'CLAR_RAISED'];
console.log('scenario                                proc  ' + keys.map(k => k.padStart(18)).join('') + '   CLAR_PREC  CLAR_REC');
for (const [label] of S.SCENARIOS) {
  for (const p of ['A', 'B']) {
    const m = out[label][p], b = base[p];
    const cells = keys.map(k => {
      const d = m[k] - b[k];
      return `${m[k]}${d === 0 ? '' : (d > 0 ? ` (+${d})` : ` (${d})`)}`.padStart(18);
    }).join('');
    console.log(`${label.padEnd(38)} ${p}   ${cells}   ${(m.CLAR_PRECISION*100).toFixed(1)}%     ${(m.CLAR_RECALL*100).toFixed(1)}%`);
  }
}
console.log(`\nDenominators: HC=${base.A.HC_DEN}  activeProhibited=${base.A.FALSE_ACTIVE_DEN}  clarificationExpected=${loaded.A.filter(r=>r.truth.clarificationExpected).length}  rows=${base.A.rows}`);
fs.writeFileSync(path.join(__dirname, '..', 'results', 'SAFETY_VETOES.json'), JSON.stringify(out, null, 2));
