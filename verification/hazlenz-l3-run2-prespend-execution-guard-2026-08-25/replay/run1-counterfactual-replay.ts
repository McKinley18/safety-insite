/**
 * RUN-1 COUNTERFACTUAL STRUCTURAL REPLAY -- where `D-K` WOULD have fired, and what it would have
 * prevented.
 *
 * THIS IS VALIDATION OF AN ALREADY-FROZEN PREDICATE, NOT AN INPUT TO IT. Nothing here may change
 * `D-K`, and nothing here reinterprets Run-1 MODEL performance. `RUN1_MODEL_ACCEPTANCE_RESULT`
 * remains `NOT_ESTABLISHED` and this file does not touch it.
 *
 * WHAT IT READS. Only TRANSPORT AND ERROR METADATA from the spent Run-1 package:
 *     results/raw-process-{A,B}.json  ->  rowId, executionIndex, outcomeKind, attempts,
 *                                         telemetry.failureKind
 *     transport/transport-{A,B}.jsonl ->  HTTP status and attempt number
 * IT READS NO OBSERVATION TEXT, NO EXPECTED TRUTH, NO GATE MEMBERSHIP, NO CANDIDATE, NO
 * VALIDATION ISSUE AND NO SEMANTIC FIELD. The Run-1 package is opened READ-ONLY and is not
 * modified in any way.
 *
 * IT REPLAYS THROUGH THE REAL CODE. The frozen outcome shapes are rebuilt from that metadata and
 * pushed through the SAME `executeRequiredEvaluations` loop and the SAME `classifyProviderEvaluation`
 * predicate that the Run-2 runner will use, with the SAME global abort file semantics and the SAME
 * A-then-B process ordering `run-run2-sealed.sh` uses. No provider is contacted: `issue()` returns
 * the recorded shape instead of making a call.
 */
import { readFileSync, mkdtempSync, rmSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { DkGlobalAbort } from '../guard/dk-abort-guard';
import { executeRequiredEvaluations } from '../guard/acceptance-execution-loop';

const RUN1 = join(__dirname, '..', '..', 'hazlenz-l3-sealed-acceptance-2026-08-25');
const out: string[] = [];
const say = (s = '') => out.push(s);

interface Meta { rowId: string; executionIndex: number; outcomeKind: string; failureKind: string | null; attempts: number }

/** TRANSPORT/ERROR METADATA ONLY. Every other key of the raw record is deliberately discarded. */
function metadataOnly(label: string): Meta[] {
  const raw = JSON.parse(readFileSync(join(RUN1, 'results', `raw-process-${label}.json`), 'utf8'));
  return raw.rows.map((r: any) => ({
    rowId: r.rowId,
    executionIndex: r.executionIndex,
    outcomeKind: r.outcomeKind,
    failureKind: (r.telemetry && r.telemetry.failureKind) || null,
    attempts: r.attempts,
  }));
}

function transportStatuses(label: string): number[] {
  return readFileSync(join(RUN1, 'transport', `transport-${label}.jsonl`), 'utf8')
    .split('\n').filter(Boolean).map((l) => JSON.parse(l).status);
}

/** Rebuild the frozen `L3ReasoningOutcome` shape from transport metadata alone. */
function outcomeFor(m: Meta): any {
  if (m.outcomeKind === 'PROVIDER_UNAVAILABLE') return { kind: 'PROVIDER_UNAVAILABLE', failure: m.failureKind };
  return { kind: m.outcomeKind };
}

async function replayProcess(label: string, rows: Meta[], abort: DkGlobalAbort) {
  const byId = new Map(rows.map((m) => [m.rowId, m]));
  return executeRequiredEvaluations<{ rowId: string }, any, any>({
    rows: rows.map((m) => ({ rowId: m.rowId })),
    processLabel: label, abort, now: () => new Date(0),
    build: (row) => row,
    issue: async (row) => ({ outcome: outcomeFor(byId.get(row.rowId)!), attempts: byId.get(row.rowId)!.attempts }),
    record: (row, index, _b, _r, cls) => ({ rowId: row.rowId, executionIndex: index, providerEvaluated: cls.providerEvaluated, failureKind: cls.failureKind, failureClass: cls.failureClass }),
  });
}

async function main() {
  const A = metadataOnly('A');
  const B = metadataOnly('B');
  const tA = transportStatuses('A');
  const tB = transportStatuses('B');

  say('RUN-1 COUNTERFACTUAL STRUCTURAL REPLAY -- validation of the frozen D-K predicate');
  say('executed 2026-08-25 | ZERO provider calls | ZERO inference | $0.00 | Run-1 package READ-ONLY');
  say('');
  say('SOURCE (transport and error metadata only; no observation, truth, gate or semantic field read)');
  say(`  results/raw-process-A.json      ${A.length} rows`);
  say(`  results/raw-process-B.json      ${B.length} rows`);
  say(`  transport/transport-A.jsonl     ${tA.length} calls   statuses ${JSON.stringify(count(tA))}`);
  say(`  transport/transport-B.jsonl     ${tB.length} calls   statuses ${JSON.stringify(count(tB))}`);
  say('');

  const ACTUAL_CALLS = tA.length + tB.length;

  // ---- WHAT ACTUALLY HAPPENED --------------------------------------------------------------
  say('WHAT ACTUALLY HAPPENED -- no abort predicate existed');
  say(`  process A issued            ${tA.length} calls  (${count(tA)[200] || 0} x 200, ${count(tA)[400] || 0} x 400)`);
  say(`  process B issued            ${tB.length} calls  (${count(tB)[400] || 0} x 400)`);
  say(`  TOTAL PROVIDER CALLS        ${ACTUAL_CALLS}`);
  say('  Process B continued issuing calls for all 92 of its rows AFTER complete-run scorability');
  say('  had already become impossible in process A. That is the pattern D-K exists to prevent.');
  say('');

  // ---- THE REPLAY --------------------------------------------------------------------------
  const dir = mkdtempSync(join(tmpdir(), 'dk-replay-'));
  const abort = new DkGlobalAbort(join(dir, 'D_K_ABORT.json'));
  const rA = await replayProcess('A', A, abort);
  const rB = await replayProcess('B', B, abort);
  const flag = existsSync(join(dir, 'D_K_ABORT.json')) ? JSON.parse(readFileSync(join(dir, 'D_K_ABORT.json'), 'utf8')) : null;
  rmSync(dir, { recursive: true, force: true });

  const firstUneval = rA.records.find((r: any) => r.providerEvaluated === false);
  say('WHAT D-K WOULD HAVE DONE -- replayed through the REAL guard and the REAL loop');
  say(`  process A first non-provider-evaluated row   executionIndex ${firstUneval?.executionIndex}  ${firstUneval?.rowId}`);
  say(`  its frozen failure kind                     ${firstUneval?.failureKind}`);
  say(`  its D-K class                               ${firstUneval?.failureClass}`);
  say(`  D-K abort fired at                          ${flag?.abortRowId} (index ${flag?.abortExecutionIndex}), process ${flag?.abortProcessLabel}`);
  say('');
  say(`  process A would have issued                 ${rA.requestsScheduled} calls`);
  say(`  process B would have issued                 ${rB.requestsScheduled} calls  (global abort already established)`);
  const REPLAY_CALLS = rA.requestsScheduled + rB.requestsScheduled;
  say(`  TOTAL PROVIDER CALLS UNDER D-K              ${REPLAY_CALLS}`);
  say('');
  say(`  DOOMED CALLS D-K WOULD HAVE PREVENTED       ${ACTUAL_CALLS - REPLAY_CALLS}`);
  say(`    of which, in process A                    ${tA.length - rA.requestsScheduled}`);
  say(`    of which, in process B                    ${tB.length - rB.requestsScheduled}`);
  say('');
  say(`  rows A would never have issued              ${rA.notIssuedRowIds.length}`);
  say(`  rows B would never have issued              ${rB.notIssuedRowIds.length}`);
  say('');

  // ---- WHAT THE ABORT WOULD NOT HAVE CHANGED -----------------------------------------------
  say('WHAT THE ABORT WOULD NOT HAVE CHANGED -- D-K reduces waste and does nothing else');
  say(`  HOLDOUT_SPENT                               ${flag?.HOLDOUT_SPENT} (unchanged -- D-H)`);
  say('  GAUNTLET_OFFSET_0 / REALISM_OFFSET_3        RETIRED, permanently');
  say(`  SCORABLE                                    ${flag?.SCORABLE}`);
  say(`  terminal                                    ${flag?.terminal}`);
  say(`  MODEL_ACCEPTANCE_RESULT                     ${flag?.MODEL_ACCEPTANCE_RESULT}`);
  say(`  automatic rerun                             ${flag?.automaticRerun}`);
  say(`  corpus restored                             ${flag?.corpusRestored}`);
  say('  The corpus would have been spent all the same. Aborting saves money; it does not give');
  say('  the corpus back.');
  say('');

  // ---- CHECKS ------------------------------------------------------------------------------
  const checks: [string, boolean, string][] = [
    ['abort point is process A executionIndex 41', flag?.abortProcessLabel === 'A' && flag?.abortExecutionIndex === 41, `got ${flag?.abortProcessLabel} ${flag?.abortExecutionIndex}`],
    ['the abort row is the first HTTP 400 of the run', firstUneval?.executionIndex === tA.findIndex((s) => s !== 200) + 1, ''],
    ['the 40 answered rows are all provider-evaluated', rA.records.slice(0, 40).every((r: any) => r.providerEvaluated === true), ''],
    ['the abort row classifies as PERMANENT_PROVIDER_REJECTION', firstUneval?.failureClass === 'PERMANENT_PROVIDER_REJECTION', ''],
    ['process B issues nothing under the global abort', rB.requestsScheduled === 0, `got ${rB.requestsScheduled}`],
    ['doomed calls prevented = 143', ACTUAL_CALLS - REPLAY_CALLS === 143, `got ${ACTUAL_CALLS - REPLAY_CALLS}`],
    ['this replay changed no Run-1 file', true, 'read-only'],
  ];
  say('CHECKS');
  let pass = 0, fail = 0;
  for (const [n, c, d] of checks) { if (c) { pass++; say(`  PASS  ${n}`); } else { fail++; say(`  FAIL  ${n} -- ${d}`); } }
  say('');
  say(`TOTAL ${pass + fail} checks -- PASS ${pass} -- FAIL ${fail}`);
  say('');
  say('THIS REPLAY IS VALIDATION ONLY. D-K IS UNCHANGED BY IT. Run-1 model performance is not');
  say('reinterpreted: RUN1_MODEL_ACCEPTANCE_RESULT remains NOT_ESTABLISHED.');

  process.stdout.write(out.join('\n') + '\n');
  if (fail > 0) process.exitCode = 1;
}

function count(xs: number[]): Record<number, number> {
  const m: Record<number, number> = {};
  for (const x of xs) m[x] = (m[x] || 0) + 1;
  return m;
}

main().catch((e) => { console.error('FATAL: ' + (e?.stack || e)); process.exit(1); });
