/**
 * SYNTHETIC `D-K` VERIFICATION -- 12 required assertion groups, ZERO provider access.
 *
 * WHAT IS REAL HERE, AND WHAT IS SYNTHETIC.
 *   REAL:      `classifyProviderEvaluation` and `DkGlobalAbort` (guard/dk-abort-guard.ts)
 *              `executeRequiredEvaluations`  (guard/acceptance-execution-loop.ts)
 *              `OllamaReasoningProvider`     (the SHIPPED provider, byte-unmodified)
 *              `runValidatedReasoning`       (the SHIPPED frozen retry policy, byte-unmodified)
 *              `buildReasoningInput`         (the SHIPPED input builder, byte-unmodified)
 *              `acceptance-scorer-v2`        (the FROZEN Amendment-3 wrapper, byte-unmodified,
 *                                             which itself calls the FROZEN scorer ea5e50ae...)
 *   SYNTHETIC: the transport (a local 127.0.0.1 fixture), the holdout (93 rows authored HERE),
 *              and the observation text (authored HERE).
 *
 * NO ANTHROPIC ACCESS. NO CREDENTIAL READ. NO RUN-2 ROW IS OPENED, READ OR TRANSMITTED. The frozen
 * Run-2 holdout file is never opened by this suite -- not even to count its rows.
 *
 * NOTHING IS TUNED AGAINST RUN-1 SEMANTIC OUTPUT. Every fixture is built from row indices and
 * transport status codes alone.
 */
import { spawn, type ChildProcess } from 'child_process';
import { mkdtempSync, existsSync, readFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { createHash } from 'crypto';
import { buildReasoningInput } from '../../../backend/src/safescope-v2/reasoning-l3/reasoning-input-builder';
import { OllamaReasoningProvider, L3_2_INFERENCE_CONFIG } from '../../../backend/src/safescope-v2/reasoning-l3/ollama-reasoning-provider';
import { runValidatedReasoning, type L3RunResult } from '../../../backend/src/safescope-v2/reasoning-l3/reasoning-runner';
import { classifyProviderEvaluation, DkGlobalAbort, type DkClassification } from '../guard/dk-abort-guard';
import { executeRequiredEvaluations } from '../guard/acceptance-execution-loop';

const FIXTURE_PORT = Number(process.env.FIXTURE_PORT || 11991);
const FIXTURE = `http://127.0.0.1:${FIXTURE_PORT}`;
const COHORT = join(__dirname, '..', '..', '..', 'backend', 'scripts', 'ablate-l32g-state-separation.ts');
const FROZEN_COHORT_SHA = '73f74131b4f8cbb31ad57ba972e1e0edbcaaa275d27558866d8bc2a4e71c6521';

let PASS = 0, FAIL = 0;
const lines: string[] = [];
function ok(group: string, name: string, cond: boolean, detail = '') {
  if (cond) { PASS++; lines.push(`  PASS  [${group}] ${name}${detail ? ' -- ' + detail : ''}`); }
  else { FAIL++; lines.push(`  FAIL  [${group}] ${name}${detail ? ' -- ' + detail : ''}`); }
}
function head(t: string) { lines.push(''); lines.push(t); }

// =================================================================================================
// A SYNTHETIC 93-ROW HOLDOUT. Authored here. It carries no Run-2 content of any kind.
// =================================================================================================
const N = 93;
type SynRow = {
  rowId: string; provenanceClass: string;
  expect: { highConsequence: boolean; clarificationExpected: boolean; inG4Denominator: boolean;
            inG7Pole: boolean; conditionState: string; hazardEstablished: boolean;
            acceptableStates: string[]; activeProhibited: boolean; inG3Denominator: boolean };
};
function synthHoldout(): { holdoutId: string; rows: SynRow[] } {
  const rows: SynRow[] = [];
  for (let i = 1; i <= N; i++) {
    const highConsequence = i <= 36;                     // G1 denominator 36
    const inG7Pole = i >= 25 && i <= 35;                 // G7 pole 11
    const clarificationExpected = i >= 40 && i <= 69;    // G3 DEN_A 30, DISJOINT from the G7 pole
    const inG4Denominator = i >= 70 && i <= 90;          // G4 denominator 21
    rows.push({
      rowId: `SYN-${String(i).padStart(3, '0')}`,
      provenanceClass: i <= 38 ? 'INDEPENDENT_GAUNTLET' : i <= 68 ? 'INDEPENDENT_REALISM' : 'AUTHORED_CONTROL',
      expect: {
        highConsequence, clarificationExpected, inG4Denominator, inG7Pole,
        conditionState: inG4Denominator ? 'CONTROLLED' : 'ACTIVE',
        hazardEstablished: true, acceptableStates: ['ACTIVE', 'CONTROLLED'],
        activeProhibited: inG4Denominator, inG3Denominator: clarificationExpected,
      },
    });
  }
  return { holdoutId: 'synthetic.dk-verification.v1', rows };
}
const HOLDOUT = synthHoldout();

/** The record a perfectly answering provider would produce for a row. All ten fields. */
function goodRecord(row: SynRow, index: number, cls: DkClassification) {
  return {
    rowId: row.rowId,
    schemaValid: true,
    retries: 0,
    candidates: [{ candidateKey: `${row.rowId}-c1`, hazardFamily: 'F1', conditionState: row.expect.conditionState }],
    raisedClarification: row.expect.clarificationExpected,
    assertedState: row.expect.conditionState,
    nonRetryableValidationReasons: [] as string[],
    safetyConsequentialRejection: false,
    decisionBoundaryCodes: [] as string[],
    providerEvaluated: cls.providerEvaluated,
    providerFailureKind: cls.failureKind,
    providerFailureClass: cls.failureClass,
    executionIndex: index,
  };
}

/** Scripted frozen-outcome shapes. These are the EXACT shapes `reasoning-runner.ts` returns. */
const RUN_OK = { outcome: { kind: 'VALIDATED' }, attempts: 1 } as any as L3RunResult;
const RUN_PERMANENT = { outcome: { kind: 'PROVIDER_UNAVAILABLE', failure: 'PERMANENT_CONFIGURATION_ERROR' }, attempts: 1 } as any as L3RunResult;

function newAbort() {
  const dir = mkdtempSync(join(tmpdir(), 'dk-verify-'));
  return { dir, abort: new DkGlobalAbort(join(dir, 'D_K_ABORT.json'), join(dir, 'D_K_ABORT.jsonl')) };
}

/** Run one process through the REAL loop with a scripted transport. */
async function runProcess(label: string, abort: DkGlobalAbort, unevaluatedAt: number | null) {
  const issuedOrder: string[] = [];
  return executeRequiredEvaluations<SynRow, L3RunResult, any>({
    rows: HOLDOUT.rows, processLabel: label, abort,
    now: () => new Date(0),
    build: (row) => ({ row }),
    issue: async (row, index) => {
      issuedOrder.push(row.rowId);
      return unevaluatedAt !== null && index === unevaluatedAt ? RUN_PERMANENT : RUN_OK;
    },
    record: (row, index, _b, _r, cls) => goodRecord(row, index, cls),
  }).then((r) => ({ ...r, issuedOrder }));
}

/** The required process PAIR, run in sequence exactly as `run-run2-sealed.sh` runs them. */
async function runPair(aFailAt: number | null, bFailAt: number | null) {
  const { dir, abort } = newAbort();
  const A = await runProcess('A', abort, aFailAt);
  const B = await runProcess('B', abort, bFailAt);
  const flag = existsSync(join(dir, 'D_K_ABORT.json')) ? JSON.parse(readFileSync(join(dir, 'D_K_ABORT.json'), 'utf8')) : null;
  rmSync(dir, { recursive: true, force: true });
  return { A, B, flag, totalScheduled: A.requestsScheduled + B.requestsScheduled };
}

// =================================================================================================
// REAL-TRANSPORT SECTION -- the shipped provider and the frozen retry policy against a local fixture
// =================================================================================================
function fam(): string[] {
  const src = readFileSync(COHORT, 'utf8');
  if (createHash('sha256').update(src).digest('hex') !== FROZEN_COHORT_SHA) throw new Error('cohort digest mismatch');
  const block = src.slice(src.indexOf('\nconst FAM = ['));
  return JSON.parse(block.slice(block.indexOf('['), block.indexOf(']') + 1).replace(/'/g, '"').replace(/,\s*\]/, ']'));
}

async function script(entries: any[]) {
  await fetch(`${FIXTURE}/__script`, { method: 'POST', body: JSON.stringify(entries) });
}
async function issuedCount(): Promise<number> {
  return (await (await fetch(`${FIXTURE}/__issued`)).json() as any).issued;
}

/** Drive the REAL provider + REAL frozen runner once, and classify with the REAL guard. */
async function realCall(entries: any[]) {
  await script(entries);
  const built = buildReasoningInput({
    analysisId: 'dk-verification-synthetic',
    // Observation text authored for this fixture. It is not a Run-2 row and not a Run-1 row.
    observationText: 'Fixture observation authored for D-K transport verification only.',
    regulatoryContext: { value: 'unknown' as any, provenance: 'UNKNOWN' },
    allowedHazardFamilies: fam() as any,
  });
  const provider = new OllamaReasoningProvider({
    ...L3_2_INFERENCE_CONFIG, endpoint: FIXTURE, model: 'fixture-model', timeoutMs: 1500,
  });
  const run = await runValidatedReasoning(provider, built.input);
  return { run, cls: classifyProviderEvaluation(run), calls: await issuedCount() };
}

async function main() {
  // ---- start the local fixture ---------------------------------------------------------------
  const child: ChildProcess = spawn('node', [join(__dirname, 'fixture-transport-server.js')], {
    env: { ...process.env, FIXTURE_PORT: String(FIXTURE_PORT) }, stdio: ['ignore', 'pipe', 'pipe'],
  });
  await new Promise((r) => setTimeout(r, 700));

  try {
    // ===========================================================================================
    head('ASSERTION 1 -- 93/93 in A and 93/93 in B: D-K never fires, all 186 requests scheduled');
    {
      const { A, B, flag, totalScheduled } = await runPair(null, null);
      ok('1', 'A scheduled all 93 required requests', A.requestsScheduled === 93, `scheduled=${A.requestsScheduled}`);
      ok('1', 'B scheduled all 93 required requests', B.requestsScheduled === 93, `scheduled=${B.requestsScheduled}`);
      ok('1', 'all 186 required requests scheduled', totalScheduled === 186, `total=${totalScheduled}`);
      ok('1', 'D-K never fired', flag === null && !A.dkFired && !B.dkFired);
      ok('1', 'no row was left un-issued', A.notIssuedRowIds.length === 0 && B.notIssuedRowIds.length === 0);
      ok('1', 'A produced 93 scorer records', A.records.length === 93);
      ok('1', 'B produced 93 scorer records', B.records.length === 93);
      ok('1', 'allRequiredEvaluationsObtained is TRUE in both processes',
        A.allRequiredEvaluationsObtained === true && B.allRequiredEvaluationsObtained === true);
    }

    // ===========================================================================================
    head('ASSERTION 2 -- first required evaluation in A is unevaluated');
    {
      const { A, B, flag, totalScheduled } = await runPair(1, null);
      ok('2', 'D-K fired immediately', flag !== null && A.dkFiredLocally === true);
      ok('2', 'abort row is the FIRST row', flag?.abortRowId === 'SYN-001' && flag?.abortExecutionIndex === 1);
      ok('2', 'no later A request was scheduled', A.requestsScheduled === 1, `A scheduled=${A.requestsScheduled}`);
      ok('2', 'A issued exactly the first row', A.issuedOrder.length === 1 && A.issuedOrder[0] === 'SYN-001');
      ok('2', 'NO new B request scheduled after the global abort', B.requestsScheduled === 0, `B scheduled=${B.requestsScheduled}`);
      ok('2', 'B produced no scorer records', B.records.length === 0);
      ok('2', 'total requests 1, not 186', totalScheduled === 1, `total=${totalScheduled}`);
      ok('2', 'D-K did not fire a second time in B', B.dkFiredLocally === false);
      ok('2', 'abort attributes the run to process A', flag?.abortProcessLabel === 'A');
    }

    // ===========================================================================================
    head('ASSERTION 3 -- unevaluated result at A row 41');
    {
      const { A, B, flag, totalScheduled } = await runPair(41, null);
      ok('3', 'D-K fired at row 41', flag?.abortExecutionIndex === 41 && flag?.abortRowId === 'SYN-041');
      ok('3', 'exactly the 41 preceding-and-including requests remain', A.requestsScheduled === 41, `A scheduled=${A.requestsScheduled}`);
      ok('3', 'rows after the failure were NOT newly scheduled',
        A.issuedOrder.length === 41 && A.issuedOrder[40] === 'SYN-041' && !A.issuedOrder.includes('SYN-042'));
      ok('3', 'the 52 remaining A rows are recorded as NOT ISSUED', A.notIssuedRowIds.length === 52, `notIssued=${A.notIssuedRowIds.length}`);
      ok('3', 'the failing row itself IS recorded (raw evidence preserved)',
        A.records.length === 41 && A.records[40].rowId === 'SYN-041');
      ok('3', 'the failing row declares providerEvaluated=false', A.records[40].providerEvaluated === false);
      ok('3', 'the 40 preceding rows all declare providerEvaluated=true',
        A.records.slice(0, 40).every((r: any) => r.providerEvaluated === true));
      ok('3', 'process B issued nothing', B.requestsScheduled === 0);
      ok('3', 'total 41 requests instead of 186', totalScheduled === 41, `total=${totalScheduled}`);
    }

    // ===========================================================================================
    head('ASSERTION 4 -- unevaluated result in process B fires the GLOBAL abort');
    {
      const { A, B, flag, totalScheduled } = await runPair(null, 17);
      ok('4', 'A completed all 93 unaffected', A.requestsScheduled === 93 && A.dkFiredLocally === false);
      ok('4', 'D-K fired in B', B.dkFiredLocally === true && flag !== null);
      ok('4', 'the global abort is attributed to process B', flag?.abortProcessLabel === 'B' && flag?.abortRowId === 'SYN-017');
      ok('4', 'B stopped scheduling at its own failing row', B.requestsScheduled === 17, `B scheduled=${B.requestsScheduled}`);
      ok('4', 'the global abort state is visible to BOTH processes', B.dkFired === true);
      ok('4', 'total 110 requests instead of 186', totalScheduled === 110, `total=${totalScheduled}`);
    }
    {
      // The FIRST abort is the abort: a later firing must not rewrite which row ended the run.
      const { dir, abort } = newAbort();
      const A = await runProcess('A', abort, 41);
      const B = await runProcess('B', abort, 5);
      const flag = JSON.parse(readFileSync(join(dir, 'D_K_ABORT.json'), 'utf8'));
      ok('4', 'the FIRST abort record is never overwritten by the sibling process',
        flag.abortProcessLabel === 'A' && flag.abortRowId === 'SYN-041');
      ok('4', 'the sibling issued nothing once the abort existed', B.requestsScheduled === 0);
      rmSync(dir, { recursive: true, force: true });
    }

    // ===========================================================================================
    head('ASSERTION 5 -- MALFORMED model output counts as PROVIDER-EVALUATED  [REAL TRANSPORT]');
    {
      const r = await realCall([{ mode: 'OK', content: 'this is not json at all' }]);
      ok('5', 'the frozen provider classified it MALFORMED_STRUCTURED_OUTPUT',
        r.run.outcome.kind === 'MALFORMED_OUTPUT', `outcomeKind=${r.run.outcome.kind}`);
      ok('5', 'PROVIDER_EVALUATED = TRUE', r.cls.providerEvaluated === true);
      ok('5', 'classified PROVIDER_EVALUATED, not a transport failure', r.cls.failureClass === 'PROVIDER_EVALUATED');
      ok('5', 'the frozen retry ceiling of one was applied by the frozen runner, not by D-K',
        r.run.attempts === 2 && r.calls === 2, `attempts=${r.run.attempts} calls=${r.calls}`);

      const { dir, abort } = newAbort();
      const MALFORMED = { outcome: { kind: 'MALFORMED_OUTPUT' }, attempts: 2 } as any as L3RunResult;
      const res = await executeRequiredEvaluations<SynRow, L3RunResult, any>({
        rows: HOLDOUT.rows, processLabel: 'A', abort, now: () => new Date(0),
        build: (row) => ({ row }),
        issue: async (_row, index) => (index === 7 ? MALFORMED : RUN_OK),
        record: (row, index, _b, _r, cls) => ({ ...goodRecord(row, index, cls), schemaValid: index !== 7 }),
      });
      ok('5', 'D-K does NOT fire solely because output was malformed',
        res.dkFired === false && res.requestsScheduled === 93);
      ok('5', 'downstream G10 remains capable of failing: the row is recorded non-conforming',
        res.records[6].schemaValid === false && res.records[6].providerEvaluated === true);
      rmSync(dir, { recursive: true, force: true });
    }
    {
      // Truncation at the output limit is also MALFORMED_STRUCTURED_OUTPUT in the frozen provider.
      const r = await realCall([{ mode: 'TRUNCATED' }]);
      ok('5', 'output truncated at the limit is EVALUATED, not a transport failure',
        r.cls.providerEvaluated === true && r.run.outcome.kind === 'MALFORMED_OUTPUT');
    }

    // ===========================================================================================
    head('ASSERTION 6 -- PROVIDER REFUSAL with actual model output  [REAL TRANSPORT]');
    {
      const r = await realCall([{ mode: 'OK', content: JSON.stringify({ refusal: 'I cannot assist with that.' }) }]);
      ok('6', 'the frozen provider classified it PROVIDER_REFUSAL',
        (r.run.outcome as any).failure === 'PROVIDER_REFUSAL', `failure=${(r.run.outcome as any).failure}`);
      ok('6', 'PROVIDER_EVALUATED = TRUE where Amendment 3 freezes it', r.cls.providerEvaluated === true);
      ok('6', 'D-K did NOT convert a refusal into a transport failure', r.cls.failureClass === 'PROVIDER_EVALUATED');
      ok('6', 'a refusal is NOT retried by the frozen policy', r.run.attempts === 1 && r.calls === 1);

      const { dir, abort } = newAbort();
      const REFUSAL = { outcome: { kind: 'PROVIDER_UNAVAILABLE', failure: 'PROVIDER_REFUSAL' }, attempts: 1 } as any as L3RunResult;
      const res = await executeRequiredEvaluations<SynRow, L3RunResult, any>({
        rows: HOLDOUT.rows, processLabel: 'A', abort, now: () => new Date(0),
        build: (row) => ({ row }), issue: async (_r, i) => (i === 3 ? REFUSAL : RUN_OK),
        record: (row, index, _b, _r, cls) => goodRecord(row, index, cls),
      });
      ok('6', 'D-K does not fire on a refusal', res.dkFired === false && res.requestsScheduled === 93);
      rmSync(dir, { recursive: true, force: true });
    }

    // ===========================================================================================
    head('ASSERTION 7 -- D-K fires ONLY after the frozen retry policy is exhausted  [REAL TRANSPORT]');
    {
      const r = await realCall([{ status: 503 }, { status: 503 }]);
      ok('7', 'HTTP 5xx is TRANSIENT_ERROR in the frozen provider',
        (r.run.outcome as any).failure === 'TRANSIENT_ERROR', `failure=${(r.run.outcome as any).failure}`);
      ok('7', 'the frozen retry was taken -- 2 attempts, 2 transport calls', r.run.attempts === 2 && r.calls === 2);
      ok('7', 'exhausted transient retries ending in no provider evaluation => FALSE', r.cls.providerEvaluated === false);
      ok('7', 'classified TRANSIENT_TRANSPORT_FAILURE', r.cls.failureClass === 'TRANSIENT_TRANSPORT_FAILURE');
    }
    {
      const r = await realCall([{ status: 503 }, { mode: 'OK' }]);
      ok('7', 'a transient failure RECOVERED by the frozen retry is EVALUATED',
        r.cls.providerEvaluated === true, `outcomeKind=${r.run.outcome.kind}`);
      ok('7', 'D-K would not fire on a recovered row', r.cls.failureClass === 'PROVIDER_EVALUATED');
      ok('7', 'the recovery cost exactly the one frozen retry', r.run.attempts === 2 && r.calls === 2);
    }
    {
      const r = await realCall([{ status: 400 }, { status: 400 }]);
      ok('7', 'HTTP 4xx is PERMANENT_CONFIGURATION_ERROR in the frozen provider',
        (r.run.outcome as any).failure === 'PERMANENT_CONFIGURATION_ERROR');
      ok('7', 'a permanent rejection is NOT retried -- 1 attempt, 1 transport call',
        r.run.attempts === 1 && r.calls === 1, `attempts=${r.run.attempts} calls=${r.calls}`);
      ok('7', 'PROVIDER_EVALUATED = FALSE', r.cls.providerEvaluated === false);
      ok('7', 'classified PERMANENT_PROVIDER_REJECTION', r.cls.failureClass === 'PERMANENT_PROVIDER_REJECTION');
    }
    {
      const r = await realCall([{ mode: 'HANG' }, { mode: 'HANG' }]);
      ok('7', 'a hung transport is TIMEOUT in the frozen provider', r.run.outcome.kind === 'PROVIDER_TIMEOUT');
      ok('7', 'TIMEOUT took the frozen retry then gave up', r.run.attempts === 2);
      ok('7', 'PROVIDER_EVALUATED = FALSE on exhausted TIMEOUT', r.cls.providerEvaluated === false);
    }
    {
      // FAIL-CLOSED: an outcome kind or failure kind the predicate does not recognise.
      const c1 = classifyProviderEvaluation({ outcome: { kind: 'SOMETHING_NEW' } } as any);
      const c2 = classifyProviderEvaluation({ outcome: { kind: 'PROVIDER_UNAVAILABLE', failure: 'NEW_KIND' } } as any);
      ok('7', 'fail-closed on an unrecognised outcome kind',
        c1.providerEvaluated === false && c1.failureClass === 'UNRECOGNISED_OUTCOME');
      ok('7', 'fail-closed on an unrecognised failure kind',
        c2.providerEvaluated === false && c2.failureClass === 'UNRECOGNISED_OUTCOME');
    }

    // ===========================================================================================
    head('ASSERTION 8 -- no semantic retry is introduced');
    {
      const guardSrc = readFileSync(join(__dirname, '..', 'guard', 'dk-abort-guard.ts'), 'utf8');
      const loopSrc = readFileSync(join(__dirname, '..', 'guard', 'acceptance-execution-loop.ts'), 'utf8');
      const runnerSrc = readFileSync(join(__dirname, '..', 'runner', 'run-run2-acceptance.ts'), 'utf8');
      const noRetryVerb = (s: string) => !/\bretry\s*\(|reissue|reAsk|askAgain|attemptAgain/i.test(s);
      ok('8', 'the guard contains no retry primitive', noRetryVerb(guardSrc));
      ok('8', 'the loop contains no retry primitive', noRetryVerb(loopSrc));
      ok('8', 'the loop calls issue() exactly once per scheduled row',
        (loopSrc.match(/await hooks\.issue\(/g) || []).length === 1);
      ok('8', 'the runner calls runValidatedReasoning exactly once per scheduled row',
        (runnerSrc.match(/await runValidatedReasoning\(/g) || []).length === 1);
      const res = await realCall([{ status: 503 }, { status: 503 }, { mode: 'OK' }]);
      ok('8', 'no third call is ever issued for one row -- the ceiling of one is untouched',
        res.calls === 2, `calls=${res.calls}`);
    }

    // ===========================================================================================
    head('ASSERTION 9 -- HOLDOUT_SPENT = TRUE is irreversible once spend has begun');
    {
      const { dir, abort } = newAbort();
      const spendEvents: string[] = [];
      const res = await executeRequiredEvaluations<SynRow, L3RunResult, any>({
        rows: HOLDOUT.rows, processLabel: 'A', abort, now: () => new Date(0),
        build: (row) => ({ row }),
        onSpendInitiated: (row) => spendEvents.push(`HOLDOUT_SPEND_INITIATED:${row.rowId}`),
        issue: async (_r, i) => (i === 41 ? RUN_PERMANENT : RUN_OK),
        record: (row, index, _b, _r, cls) => goodRecord(row, index, cls),
      });
      const flag = JSON.parse(readFileSync(join(dir, 'D_K_ABORT.json'), 'utf8'));
      ok('9', 'spend was recorded BEFORE the first observation left the runner',
        spendEvents.length === 1 && spendEvents[0] === 'HOLDOUT_SPEND_INITIATED:SYN-001');
      ok('9', 'the abort record itself asserts HOLDOUT_SPENT = TRUE', flag.HOLDOUT_SPENT === true);
      ok('9', 'the abort record refuses to restore the corpus', flag.corpusRestored === false);
      ok('9', 'the abort record forbids an automatic rerun', flag.automaticRerun === 'NONE');
      ok('9', 'D-K fired but spend was not reverted', res.dkFired === true);
      const all = [
        readFileSync(join(__dirname, '..', 'guard', 'dk-abort-guard.ts'), 'utf8'),
        readFileSync(join(__dirname, '..', 'guard', 'acceptance-execution-loop.ts'), 'utf8'),
        readFileSync(join(__dirname, '..', 'runner', 'run-run2-acceptance.ts'), 'utf8'),
      ].join('\n');
      ok('9', 'no code path anywhere sets HOLDOUT_SPENT false or unretires an offset',
        !/HOLDOUT_SPENT\s*[:=]\s*false/i.test(all) && !/UNRETIRED|unspend|revertSpend/i.test(all));
      ok('9', 'the abort class exposes no clear/reset/unfire operation',
        !/\b(clear|reset|unfire|remove|delete|rm)\s*\(/.test(
          readFileSync(join(__dirname, '..', 'guard', 'dk-abort-guard.ts'), 'utf8').split('export class DkGlobalAbort')[1]));
      rmSync(dir, { recursive: true, force: true });
    }

    // ===========================================================================================
    head('ASSERTION 10 & 11 -- SCORABLE = FALSE after D-K, and no further request can restore it');
    {
      const v2 = require(join(__dirname, '..', '..', 'hazlenz-l3-run2-acceptance-holdout-2026-08-25',
        'scorer', 'acceptance-scorer-v2.frozen-copy.js'));

      // The control: a COMPLETE pair. The frozen arithmetic must be reachable and PASS.
      const complete = await runPair(null, null);
      const sComplete = v2.scoreAcceptanceV2(HOLDOUT, complete.A.records, complete.B.records);
      ok('10', 'CONTROL: a complete pair is SCORABLE under the frozen v2 wrapper', sComplete.scorable === true);
      ok('10', 'CONTROL: the frozen arithmetic is reachable and passes on a complete pair',
        sComplete.pass === true, `terminal=${sComplete.terminal}`);
      ok('10', 'CONTROL: complete provider evaluation is TRUE',
        sComplete.providerEvaluation.completeProviderEvaluation === true);

      // D-K fired at A row 41.
      const aborted = await runPair(41, null);
      const sAborted = v2.scoreAcceptanceV2(HOLDOUT, aborted.A.records, aborted.B.records);
      ok('10', 'SCORABLE = FALSE after D-K fires', sAborted.scorable === false);
      ok('10', 'terminal is the frozen NOT_SCORABLE terminal',
        sAborted.terminal === 'L3_ACCEPTANCE_NOT_SCORABLE — INCOMPLETE_PROVIDER_EVALUATION', sAborted.terminal);
      ok('10', 'INCOMPLETE_PROVIDER_EVALUATION is raised',
        sAborted.invalidReasons.includes('INCOMPLETE_PROVIDER_EVALUATION'));
      ok('10', 'pass is FALSE', sAborted.pass === false);
      ok('10', 'the un-issued rows are counted as NOT evaluated, never inferred as evaluated',
        sAborted.providerEvaluation.PROVIDER_EVALUATED_ROWS === 40,
        `evaluated=${sAborted.providerEvaluation.PROVIDER_EVALUATED_ROWS}`);

      // ASSERTION 11: no additional request can make SCORABLE true again once one required
      // provider evaluation is permanently absent. Give the run EVERY other row, perfectly
      // answered, in both processes -- the single absent evaluation still governs.
      const allButOneA = complete.A.records.filter((r: any) => r.rowId !== 'SYN-041');
      const s11a = v2.scoreAcceptanceV2(HOLDOUT, allButOneA, complete.B.records);
      ok('11', 'one missing required evaluation keeps SCORABLE = FALSE with 92/93 perfect',
        s11a.scorable === false && s11a.pass === false);
      const withFalseDecl = complete.A.records.map((r: any) =>
        r.rowId === 'SYN-041' ? { ...r, providerEvaluated: false } : r);
      const s11b = v2.scoreAcceptanceV2(HOLDOUT, withFalseDecl, complete.B.records);
      ok('11', 'a record present but declared NOT evaluated also keeps SCORABLE = FALSE',
        s11b.scorable === false && s11b.pass === false);
      const undeclared = complete.A.records.map((r: any) => {
        if (r.rowId !== 'SYN-041') return r;
        const { providerEvaluated, ...rest } = r; return rest;
      });
      const s11c = v2.scoreAcceptanceV2(HOLDOUT, undeclared, complete.B.records);
      ok('11', 'FAIL-CLOSED: an undeclared record cannot buy a pass',
        s11c.scorable === false && s11c.invalidReasons.includes('PROVIDER_EVALUATION_NOT_DECLARED'));
      const bShort = complete.B.records.filter((r: any) => r.rowId !== 'SYN-007');
      const s11d = v2.scoreAcceptanceV2(HOLDOUT, complete.A.records, bShort);
      ok('11', 'an absent evaluation in the SECOND required process also blocks SCORABLE',
        s11d.scorable === false && s11d.invalidReasons.includes('INCOMPLETE_PROVIDER_EVALUATION_PROCESS_B'));
      ok('11', 'no further request can restore scorability -- the aborted run stays NOT_SCORABLE '
        + 'under every one of these four completions',
        [s11a, s11b, s11c, s11d].every((s) => s.scorable === false && s.pass === false));
    }

    // ===========================================================================================
    head('ASSERTION 12 -- a complete successful run is behaviourally identical, D-K dormant');
    {
      // The reference: the SAME row loop with NO guard at all.
      const referenceRecords: any[] = [];
      const referenceIssued: string[] = [];
      let idx = 0;
      for (const row of HOLDOUT.rows) {
        idx += 1;
        referenceIssued.push(row.rowId);
        const run = RUN_OK;
        referenceRecords.push(goodRecord(row, idx, classifyProviderEvaluation(run)));
      }
      const { dir, abort } = newAbort();
      const guarded = await executeRequiredEvaluations<SynRow, L3RunResult, any>({
        rows: HOLDOUT.rows, processLabel: 'A', abort, now: () => new Date(0),
        build: (row) => ({ row }), issue: async () => RUN_OK,
        record: (row, index, _b, _r, cls) => goodRecord(row, index, cls),
      });
      const strip = (r: any) => { const { providerEvaluated, providerFailureKind, providerFailureClass, ...rest } = r; return rest; };
      ok('12', 'the same requests are issued, in the same order',
        JSON.stringify(guarded.issuedRowIds) === JSON.stringify(referenceIssued));
      ok('12', 'every scorer record is byte-identical once the D-K declaration is stripped',
        JSON.stringify(guarded.records.map(strip)) === JSON.stringify(referenceRecords.map(strip)));
      ok('12', 'the ONLY difference is the dormant D-K instrumentation',
        JSON.stringify(guarded.records) === JSON.stringify(referenceRecords)
        && guarded.records.every((r: any) => r.providerEvaluated === true && r.providerFailureKind === null));
      ok('12', 'no abort file is created on a complete run', !existsSync(join(dir, 'D_K_ABORT.json')));
      ok('12', 'the guard reports itself dormant', guarded.dkFired === false && guarded.dkAbort === null);
      rmSync(dir, { recursive: true, force: true });
    }

  } finally {
    child.kill('SIGTERM');
  }

  const header = [
    'SYNTHETIC D-K VERIFICATION -- verification/hazlenz-l3-run2-prespend-execution-guard-2026-08-25',
    'executed 2026-08-25',
    '',
    'ZERO Anthropic access. ZERO provider calls. ZERO credential reads. ZERO Run-2 rows opened,',
    'read or transmitted. Transport is a local 127.0.0.1 fixture; the holdout and every observation',
    'are authored inside the suite. The guard, the execution loop, the shipped provider, the frozen',
    'retry policy, the frozen input builder and the frozen v2 scorer are all the REAL ones.',
  ].join('\n');
  const body = `${header}\n${lines.join('\n')}\n\nTOTAL ${PASS + FAIL} assertions -- PASS ${PASS} -- FAIL ${FAIL}\n`;
  process.stdout.write(body);
  if (FAIL > 0) process.exitCode = 1;
}

main().catch((e) => { console.error('FATAL: ' + (e?.stack || e)); process.exit(1); });
