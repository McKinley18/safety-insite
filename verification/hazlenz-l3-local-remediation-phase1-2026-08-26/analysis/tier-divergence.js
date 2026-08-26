/**
 * WHERE THE TIERS DISAGREE -- the measurement Phase 9 (result-tier governance) needs.
 *
 * D-101 measured that the SCORED tier equals the VALIDATED tier on 93/93 and the BOUND tier on
 * 86/93. This enumerates the 7, in both processes, and says exactly what the binder did that the
 * scorer never saw. No truth label is read to select a row; truth is printed for reporting only,
 * after selection.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const H = require('../replay/recorded-output-replay');

const loaded = H.load();

/** assertedState as the recording defines it, recomputed from a state list the same way. */
const PRIORITY = ['ACTIVE', 'CONTROLLED', 'CORRECTED', 'REMOVED_FROM_SERVICE', 'NEGATED',
                  'HYPOTHETICAL', 'INSUFFICIENT_EVIDENCE', 'UNKNOWN'];
function assertedFrom(states) {
  if (!states || states.length === 0) return null;
  for (const s of PRIORITY) if (states.includes(s)) return s;
  return states[0];
}

const report = { processes: {}, divergentRows: {} };
for (const [label, rows] of [['A', loaded.A], ['B', loaded.B]]) {
  let validatedMatch = 0, boundMatch = 0, binderActed = 0;
  const divergent = [];
  for (const r of rows) {
    const scored = r.scoredTier.assertedState;
    const fromValidated = assertedFrom(r.validatorTier.validatedStates);
    const fromBound = r.binderTier ? assertedFrom(r.binderTier.boundStates) : null;
    if (scored === fromValidated) validatedMatch++;
    if (r.binderTier && scored === fromBound) boundMatch++;
    const acted = !!r.binderTier && ((r.binderTier.rejected || []).length > 0 || (r.binderTier.demoted || []).length > 0);
    if (acted) binderActed++;
    if (r.binderTier && scored !== fromBound) {
      divergent.push({
        rowId: r.rowId, scoredAssertedState: scored, validatedStates: r.validatorTier.validatedStates,
        boundStates: r.binderTier.boundStates, boundAssertedState: fromBound,
        rejected: r.binderTier.rejected, demoted: r.binderTier.demoted,
        truthForReportingOnly: r.truth,
      });
    }
  }
  report.processes[label] = {
    rows: rows.length,
    scoredMatchesValidatedTier: validatedMatch,
    scoredMatchesBoundTier: boundMatch,
    rowsWithBinderTier: rows.filter(r => r.binderTier).length,
    binderActedRows: binderActed,
  };
  report.divergentRows[label] = divergent;
}

console.log(JSON.stringify(report.processes, null, 2));
for (const label of ['A', 'B']) {
  console.log(`\n=== PROCESS ${label}: ${report.divergentRows[label].length} rows where the BOUND tier differs from the SCORED tier ===`);
  for (const d of report.divergentRows[label]) {
    console.log(`${d.rowId}  scored=${d.scoredAssertedState}  bound=${d.boundAssertedState}  boundStates=${JSON.stringify(d.boundStates)}`);
    console.log(`    rejected=${JSON.stringify(d.rejected)}  demoted=${JSON.stringify(d.demoted)}`);
    console.log(`    truth(reporting only): state=${d.truthForReportingOnly.conditionState} activeProhibited=${d.truthForReportingOnly.activeProhibited} HC=${d.truthForReportingOnly.highConsequence} clarExpected=${d.truthForReportingOnly.clarificationExpected}`);
  }
}
fs.writeFileSync(path.join(__dirname, '..', 'results', 'TIER_DIVERGENCE.json'), JSON.stringify(report, null, 2));
