/**
 * BINDER REJECTION PRECISION -- the measurement Phase 9 (result-tier governance) turns on.
 *
 * Promoting the BOUND tier to authoritative is only defensible if the binder's rejections are RIGHT.
 * This measures that directly: on every row where the binder deleted every candidate, did the state
 * it deleted MATCH the frozen holdout truth?
 *
 * Row selection is by recorded structure (binder rejected, nothing bound). Truth is joined only
 * afterwards, to score. No row is chosen because of its truth.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const H = require('../replay/recorded-output-replay');

const loaded = H.load();
const report = {};
for (const [label, rows] of [['A', loaded.A], ['B', loaded.B]]) {
  const acted = rows.filter(r => r.binderTier && (r.binderTier.rejected || []).length > 0 && (r.binderTier.boundStates || []).length === 0);
  const detail = acted.map(r => {
    const deleted = r.validatorTier.validatedStates || [];
    const truthState = r.truth.conditionState;
    const acceptable = r.truth.acceptableStates;
    const verdict = truthState === null && !acceptable
      ? 'TRUTH_DOES_NOT_PIN_A_STATE'
      : (deleted.some(s => s === truthState || (Array.isArray(acceptable) && acceptable.includes(s)))
          ? 'DELETED_A_STATE_THAT_MATCHES_TRUTH'
          : 'DELETED_A_STATE_TRUTH_DOES_NOT_SUPPORT');
    return { rowId: r.rowId, deletedStates: deleted, codes: (r.binderTier.rejected || []).map(x => x.codes).flat(),
      truthState, acceptableStates: acceptable, activeProhibited: r.truth.activeProhibited,
      highConsequence: r.truth.highConsequence, verdict };
  });
  const wrong = detail.filter(d => d.verdict === 'DELETED_A_STATE_THAT_MATCHES_TRUTH').length;
  const right = detail.filter(d => d.verdict === 'DELETED_A_STATE_TRUTH_DOES_NOT_SUPPORT').length;
  const unpinned = detail.filter(d => d.verdict === 'TRUTH_DOES_NOT_PIN_A_STATE').length;
  report[label] = { rowsWhereBinderDeletedEverything: acted.length, deletedACorrectState: wrong,
    deletedAnUnsupportedState: right, truthDoesNotPinAState: unpinned, detail };
  console.log(`\n=== PROCESS ${label}: binder deleted every candidate on ${acted.length} rows ===`);
  for (const d of detail) console.log(`  ${d.rowId}  deleted=${JSON.stringify(d.deletedStates)}  truth=${d.truthState}  -> ${d.verdict}`);
  const decidable = wrong + right;
  console.log(`  deleted a state MATCHING truth: ${wrong}/${decidable} decidable  (${decidable ? (wrong/decidable*100).toFixed(1) : 'n/a'}%)`);
  console.log(`  truth does not pin a state:     ${unpinned}`);
}
fs.writeFileSync(path.join(__dirname, '..', 'results', 'BINDER_REJECTION_PRECISION.json'), JSON.stringify(report, null, 2));
