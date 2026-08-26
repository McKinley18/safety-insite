#!/usr/bin/env node
/*
 * PHASE 11 -- FREEZE RAW RESULTS BEFORE SCORING.
 *
 * Every raw artifact this run produced is hashed and summarised HERE, before the scorer is
 * invoked. Nothing in this file interprets a gate, and nothing it reads is modified after scoring.
 *
 * It reports structure and transport facts only: counts, digests, provider-evaluation state,
 * returned-model identity, binder and validator outcome tallies, retry accounting and D-K state.
 * It reads no observation text and prints none.
 */
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const P = path.join(__dirname, '..');
const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const out = [];
const say = (s = '') => out.push(s);
const tally = (xs) => { const m = {}; for (const x of xs) m[x] = (m[x] || 0) + 1; return m; };

const holdout = JSON.parse(fs.readFileSync(path.join(P, '..', 'hazlenz-l3-run2-acceptance-holdout-2026-08-25', 'holdout', 'holdout-l3-acceptance-run2.json'), 'utf8'));
const expectedIds = holdout.rows.map((r) => r.rowId);

say('L3 RUN-2 SEALED ACCEPTANCE -- RAW RESULT FREEZE');
say('PHASE 11. Frozen BEFORE any G1-G10 scoring. Raw evidence is not modified after scoring.');
say('');
say(`holdout sha256                 ${sha(path.join(P, '..', 'hazlenz-l3-run2-acceptance-holdout-2026-08-25', 'holdout', 'holdout-l3-acceptance-run2.json'))}`);
say(`expected rows per process      ${expectedIds.length}`);
say(`expected required evaluations  ${expectedIds.length * 2}`);
say('');

const summary = { processes: {}, dk: null };

for (const L of ['A', 'B']) {
  const rp = path.join(P, 'results', `raw-process-${L}.json`);
  const tp = path.join(P, 'transport', `transport-${L}.jsonl`);
  say(`================ PROCESS ${L} ================`);
  if (!fs.existsSync(rp)) {
    say('  NO RAW RESULT FILE. The process did not complete and wrote nothing.');
    if (fs.existsSync(tp)) say(`  transport log present: ${sha(tp)}  ${fs.readFileSync(tp, 'utf8').split('\n').filter(Boolean).length} calls`);
    say('');
    summary.processes[L] = { rawResultPresent: false };
    continue;
  }
  const r = JSON.parse(fs.readFileSync(rp, 'utf8'));
  const rows = r.rows;
  const t = fs.existsSync(tp) ? fs.readFileSync(tp, 'utf8').split('\n').filter(Boolean).map(JSON.parse) : [];

  const evaluatedIds = rows.filter((x) => x.providerEvaluated === true).map((x) => x.rowId);
  const notEvaluated = expectedIds.filter((id) => !evaluatedIds.includes(id));
  const undeclared = rows.filter((x) => typeof x.providerEvaluated !== 'boolean').map((x) => x.rowId);

  say(`  raw result sha256            ${sha(rp)}`);
  say(`  transport log sha256         ${t.length ? sha(tp) : '(none)'}`);
  say(`  pid / started / finished     ${r.pid} / ${r.startedAt} / ${r.finishedAt}`);
  say(`  holdout asserted             ${r.holdoutSha256}`);
  say(`  run schema asserted          ${r.runSchemaSha256}`);
  say(`  system prompt asserted       ${r.systemPromptSha256}`);
  say(`  requested model              ${r.requestedModel}`);
  say('');
  say(`  rows expected                ${expectedIds.length}`);
  say(`  rows attempted (issued)      ${r.requestsScheduled}`);
  say(`  rows recorded                ${rows.length}`);
  say(`  rows never issued            ${(r.notIssuedRowIds || []).length}`);
  say(`  PROVIDER_EVALUATED rows      ${evaluatedIds.length}`);
  say(`  NOT provider-evaluated       ${notEvaluated.length}${notEvaluated.length ? '  ' + JSON.stringify(notEvaluated.slice(0, 10)) : ''}`);
  say(`  undeclared providerEvaluated ${undeclared.length}`);
  say(`  row-id SET EQUALITY          ${notEvaluated.length === 0 && evaluatedIds.length === expectedIds.length}`);
  say('');
  say(`  provider calls               ${t.length}   (r.providerCalls = ${r.providerCalls})`);
  say(`  HTTP status counts           ${JSON.stringify(tally(t.map((c) => c.status)))}`);
  say(`  returned model identities    ${JSON.stringify(tally(t.map((c) => c.respondedModel)))}`);
  say(`  stop reasons                 ${JSON.stringify(tally(t.map((c) => c.stopReason)))}`);
  say(`  attempts per row             ${JSON.stringify(tally(rows.map((x) => x.attempts)))}`);
  say(`  retries beyond the first     ${rows.reduce((a, x) => a + (x.retries || 0), 0)}`);
  say('');
  say(`  outcome kinds                ${JSON.stringify(tally(rows.map((x) => x.outcomeKind)))}`);
  say(`  provider failure kinds       ${JSON.stringify(tally(rows.map((x) => x.providerFailureKind)))}`);
  say(`  provider failure classes     ${JSON.stringify(tally(rows.map((x) => x.providerFailureClass)))}`);
  say('');
  say('  VALIDATOR OUTCOMES');
  say(`    validation states          ${JSON.stringify(tally(rows.map((x) => x.validationState)))}`);
  say(`    schemaValid true/false     ${JSON.stringify(tally(rows.map((x) => x.schemaValid)))}`);
  say(`    rows with any issue code   ${rows.filter((x) => (x.validationIssueCodes || []).length).length}`);
  say(`    issue codes seen           ${JSON.stringify(tally(rows.flatMap((x) => x.validationIssueCodes || [])))}`);
  say(`    non-retryable codes seen   ${JSON.stringify(tally(rows.flatMap((x) => x.nonRetryableValidationReasons || [])))}`);
  say(`    safetyConsequentialReject  ${rows.filter((x) => x.safetyConsequentialRejection === true).length}`);
  say('');
  say('  BINDER OUTCOMES (D-58: the SEMANTIC tier, never merged with the VALIDATED tier)');
  const withSem = rows.filter((x) => x.semanticTier);
  say(`    rows reaching the binder   ${withSem.length}`);
  say(`    bound hazard counts        ${JSON.stringify(tally(withSem.map((x) => x.semanticTier.boundHazardCount)))}`);
  say(`    rows asserting ACTIVE      ${withSem.filter((x) => x.semanticTier.boundAssertsActive).length}`);
  say(`    binder rejections          ${withSem.reduce((a, x) => a + x.semanticTier.rejected.length, 0)}`);
  say(`    binder demotions           ${withSem.reduce((a, x) => a + x.semanticTier.demoted.length, 0)}`);
  say(`    binder rejection codes     ${JSON.stringify(tally(withSem.flatMap((x) => x.semanticTier.rejected.flatMap((y) => y.codes))))}`);
  say('');
  say('  VALIDATED-TIER SUMMARY (scorer input, recorded not interpreted)');
  say(`    validated hazard counts    ${JSON.stringify(tally(rows.map((x) => x.validatedHazardCount)))}`);
  say(`    assertedState              ${JSON.stringify(tally(rows.map((x) => x.assertedState)))}`);
  say(`    raisedClarification        ${JSON.stringify(tally(rows.map((x) => x.raisedClarification)))}`);
  say('');
  say(`  D-K fired in this process    ${r.dkFiredInThisProcess}`);
  say(`  D-K global state observed    ${r.dkFired}`);
  say('');
  summary.processes[L] = {
    rawResultPresent: true, rawResultSha256: sha(rp),
    transportSha256: t.length ? sha(tp) : null,
    rowsExpected: expectedIds.length, rowsAttempted: r.requestsScheduled, rowsRecorded: rows.length,
    providerEvaluatedRows: evaluatedIds.length, notEvaluatedRowIds: notEvaluated,
    setEquality: notEvaluated.length === 0 && evaluatedIds.length === expectedIds.length,
    providerCalls: t.length, httpStatuses: tally(t.map((c) => c.status)),
    returnedModels: tally(t.map((c) => c.respondedModel)),
    dkFiredInThisProcess: r.dkFiredInThisProcess,
  };
}

const flag = path.join(P, 'spend', 'D_K_ABORT.json');
say('================ D-K STATE ================');
if (fs.existsSync(flag)) {
  const f = JSON.parse(fs.readFileSync(flag, 'utf8'));
  say(`  D_K_FIRED = TRUE   sha256 ${sha(flag)}`);
  say(`  ${JSON.stringify(f, null, 2).split('\n').join('\n  ')}`);
  summary.dk = f;
} else {
  say('  D_K_FIRED = FALSE. No abort flag exists. The guard was armed and stayed dormant.');
  summary.dk = false;
}
say('');
say('================ SPEND ================');
const spend = path.join(P, 'spend', 'SPEND_TRANSITION.jsonl');
say(`  SPEND_TRANSITION.jsonl sha256  ${sha(spend)}`);
for (const l of fs.readFileSync(spend, 'utf8').split('\n').filter(Boolean)) say(`  ${l}`);
say('');
say('  RUN2_HOLDOUT_SPENT = TRUE | GAUNTLET_OFFSET_1 = RETIRED | REALISM_OFFSET_0 = RETIRED');
say('  Caused by TRANSMISSION alone (D-H). Independent of scorability and of every terminal below.');

fs.writeFileSync(path.join(__dirname, 'RAW_RESULT_FREEZE.txt'), out.join('\n') + '\n');
fs.writeFileSync(path.join(__dirname, 'RAW_RESULT_SUMMARY.json'), JSON.stringify(summary, null, 2) + '\n');
process.stdout.write(out.join('\n') + '\n');
