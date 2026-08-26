#!/usr/bin/env node
/*
 * L3 RUN-2 COST ACCOUNTING -- DOCUMENTATION ONLY.
 *
 * Derived entirely from evidence this run already produced: the frozen shim's own transport logs
 * and the two raw result files. NO ADDITIONAL PROVIDER CALL IS MADE TO IMPROVE COST ACCOUNTING.
 *
 * Pricing is taken from governed evidence, not invented: claude-sonnet-5 at $2/MTok input and
 * $10/MTok output (L3-2o provider/OFFICIAL_DOCUMENTATION.md assertion 13, source URL with a
 * 2026-08-24 retrieval date, independently matched by the bundled claude-api reference table).
 *
 * `outputTokens` is usage.output_tokens and ALREADY INCLUDES adaptive thinking tokens, because the
 * frozen shim omits `thinking` and `output_config.effort`. No prompt caching was ever requested --
 * the shim sets no cache_control anywhere -- so full UNCACHED input pricing applies, which is also
 * the conservative direction. Rejected calls carry no token fields and bill $0.
 */
'use strict';
const fs = require('fs'), path = require('path');
const P = path.join(__dirname, '..');
const IN_PER_MTOK = 2, OUT_PER_MTOK = 10;
const out = [];
const say = (s = '') => out.push(s);

const read = (p) => (fs.existsSync(p) ? fs.readFileSync(p, 'utf8').split('\n').filter(Boolean).map(JSON.parse) : []);
const tA = read(path.join(P, 'transport', 'transport-A.jsonl'));
const tB = read(path.join(P, 'transport', 'transport-B.jsonl'));

const rawPath = (L) => path.join(P, 'results', `raw-process-${L}.json`);
const raw = (L) => (fs.existsSync(rawPath(L)) ? JSON.parse(fs.readFileSync(rawPath(L), 'utf8')) : null);
const rA = raw('A'), rB = raw('B');

say('L3 RUN-2 SEALED ACCEPTANCE -- COST AND CALL ACCOUNTING');
say('DOCUMENTATION ONLY. No additional provider call was made to produce this.');
say('pricing: claude-sonnet-5  $2 / MTok input, $10 / MTok output (L3-2o assertion 13)');
say('');

let grandCalls = 0, grandIn = 0, grandOut = 0, grandCost = 0;
for (const [L, t, r] of [['A', tA, rA], ['B', tB, rB]]) {
  const byStatus = {};
  let ins = 0, outs = 0, withUsage = 0;
  for (const c of t) {
    byStatus[c.status] = (byStatus[c.status] || 0) + 1;
    if (typeof c.promptTokens === 'number') { ins += c.promptTokens; withUsage++; }
    if (typeof c.outputTokens === 'number') outs += c.outputTokens;
  }
  const cost = (ins / 1e6) * IN_PER_MTOK + (outs / 1e6) * OUT_PER_MTOK;
  grandCalls += t.length; grandIn += ins; grandOut += outs; grandCost += cost;

  say(`PROCESS ${L}`);
  say(`  provider calls                  ${t.length}`);
  say(`  HTTP status counts              ${JSON.stringify(byStatus)}`);
  say(`  calls returning usage           ${withUsage}`);
  say(`  input tokens                    ${ins.toLocaleString()}${withUsage ? `   mean ${(ins / withUsage).toFixed(2)}` : ''}`);
  say(`  output tokens                   ${outs.toLocaleString()}${withUsage ? `   mean ${(outs / withUsage).toFixed(2)}` : ''}`);
  say(`  cost                            $${cost.toFixed(6)}`);
  if (r) {
    const retries = r.rows.reduce((a, x) => a + (x.retries || 0), 0);
    const attempts = r.rows.reduce((a, x) => a + (x.attempts || 0), 0);
    const evaluated = r.rows.filter((x) => x.providerEvaluated === true).length;
    const kinds = {};
    for (const x of r.rows) kinds[x.outcomeKind] = (kinds[x.outcomeKind] || 0) + 1;
    say(`  rows recorded                   ${r.rows.length}`);
    say(`  requests scheduled              ${r.requestsScheduled}`);
    say(`  rows never issued (D-K)         ${(r.notIssuedRowIds || []).length}`);
    say(`  provider-evaluated rows         ${evaluated}`);
    say(`  total attempts                  ${attempts}`);
    say(`  extra attempts beyond the first ${retries}   (frozen transport + shape retry, ceiling of one)`);
    say(`  outcome kinds                   ${JSON.stringify(kinds)}`);
    say(`  D-K fired in this process       ${r.dkFiredInThisProcess}`);
  }
  say('');
}

say('TOTAL');
say(`  provider calls                    ${grandCalls}`);
say(`  input tokens                      ${grandIn.toLocaleString()}`);
say(`  output tokens                     ${grandOut.toLocaleString()}`);
say(`  ACTUAL API COST                   $${grandCost.toFixed(6)}`);
say('');
say('AGAINST THE GOVERNED PROJECTIONS (D-97 / D-98, unchanged)');
say(`  A observed-mean projection        $5.691860`);
say(`  B observed-max envelope           $14.430996`);
say(`  C governed requirement (B x 1.25) $18.038745`);
say(`  user-attested available credit    $40.00`);
say(`  actual as a fraction of C         ${(grandCost / 18.038745 * 100).toFixed(2)}%`);
say(`  credit remaining (attested basis) $${(40 - grandCost).toFixed(6)}`);
say('');

const flag = path.join(P, 'spend', 'D_K_ABORT.json');
if (fs.existsSync(flag)) {
  const f = JSON.parse(fs.readFileSync(flag, 'utf8'));
  const issued = grandCalls;
  const wouldHave = 186;
  say('D-K AVOIDED CALLS');
  say(`  D-K fired at                      ${f.abortRowId} (index ${f.abortExecutionIndex}), process ${f.abortProcessLabel}`);
  say(`  failure kind / class              ${f.failureKind} / ${f.failureClass}`);
  say(`  provider calls actually issued    ${issued}`);
  say(`  required evaluations if unaborted  >= ${wouldHave}`);
  say(`  calls D-K prevented (lower bound)  ${Math.max(0, wouldHave - issued)}`);
  say('  D-K reduced waste. IT DID NOT RESTORE THE CORPUS.');
} else {
  say('D-K AVOIDED CALLS');
  say('  D-K did not fire. No calls were avoided and none needed to be.');
}
say('');
say('RUN2_HOLDOUT_SPENT = TRUE | GAUNTLET_OFFSET_1 = RETIRED | REALISM_OFFSET_0 = RETIRED');
say('Spend follows from TRANSMISSION alone (D-H) and is independent of this accounting.');

const text = out.join('\n') + '\n';
fs.writeFileSync(path.join(__dirname, 'COST_ACCOUNTING.txt'), text);
process.stdout.write(text);
