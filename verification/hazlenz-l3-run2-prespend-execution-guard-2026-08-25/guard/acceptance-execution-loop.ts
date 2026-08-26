/**
 * THE RUN-2 REQUIRED-EVALUATION SCHEDULER — the exact execution seam `D-K` is wired into.
 *
 * Every required Run-2 provider evaluation passes through this one loop, in both required
 * processes. The transitions it owns are exactly:
 *
 *     next-row scheduling decision            <-- the GLOBAL D-K abort gate is HERE, pre-issue
 *       -> request construction               (caller's `build`, frozen input builder)
 *       -> provider transport                 (caller's `issue`, frozen shim + frozen provider)
 *       -> frozen retry policy                (inside `runValidatedReasoning`, UNCHANGED)
 *       -> provider-evaluated classification  <-- D-G.3, the earliest deterministic point
 *       -> result recording                   (caller's `record`)
 *       -> next-row scheduling decision       <-- the LOCAL D-K abort fires HERE
 *
 * THE EARLIEST DETERMINISTIC POINT AT WHICH `D-K` CAN KNOW `PROVIDER_EVALUATED = FALSE` after the
 * frozen retry policy is exhausted is the instant `issue()` resolves. `runValidatedReasoning` does
 * not return until BOTH the transport retry ceiling of one and the single frozen SHAPE retry have
 * been applied, so the very first observation of its return value is already post-retry. There is
 * no earlier point, and waiting any longer would issue a request that `D-G.2` has already proved
 * incapable of changing the terminal.
 *
 * WHY THE ABORT IS CHECKED BEFORE `build` AS WELL AS AFTER `issue`: the pre-issue check is what
 * makes the abort GLOBAL. A sibling process that fired `D-K` may be at any point in its own loop;
 * this process must issue NO NEW REQUEST once that has happened. The check is between rows and
 * never mid-flight, so an already-issued request always completes and its raw evidence is
 * recorded intact.
 *
 * WHAT THIS LOOP DOES NOT DO: it does not retry, does not reorder, does not skip discretionarily,
 * does not read observation text, expected truth, gate membership or hazard family, and does not
 * inspect answer quality. On a run in which every required evaluation is provider-evaluated it is
 * behaviourally identical to an unguarded loop — the guard is dormant and every required request
 * is scheduled.
 */
import { classifyProviderEvaluation, DkGlobalAbort, type DkClassification, type DkAbortRecord, type RunOutcomeLike } from './dk-abort-guard';

export interface RowLike { rowId: string }

export interface LoopHooks<TRow extends RowLike, TRun extends RunOutcomeLike, TRecord> {
  rows: readonly TRow[];
  /** Frozen input construction. Runs only for rows this loop decides to schedule. */
  build: (row: TRow, index: number) => any;
  /** Frozen transport + frozen retry policy. Resolves ONLY after the retry policy is exhausted. */
  issue: (row: TRow, index: number, built: any) => Promise<TRun>;
  /** Builds the frozen nine-field scorer record PLUS the `providerEvaluated` declaration. */
  record: (row: TRow, index: number, built: any, run: TRun, classification: DkClassification) => TRecord;
  /** Fired once, immediately before the first observation of this process leaves the runner. */
  onSpendInitiated?: (row: TRow) => void;
  onRowComplete?: (row: TRow, index: number, classification: DkClassification) => void;
  abort: DkGlobalAbort;
  processLabel: string;
  /** Injectable only so synthetic fixtures are deterministic. Never read by the predicate. */
  now?: () => Date;
}

export interface LoopReport<TRecord> {
  /** Scorer-input records, one per row for which a provider evaluation was actually obtained or
   *  attempted-and-exhausted. Rows never issued get NO record — `D-G.3` forbids inferring
   *  `PROVIDER_EVALUATED` from record existence, so a placeholder would be a lie in either
   *  direction. Their absence is what the validity gate reads. */
  records: TRecord[];
  /** Rows for which NO request was ever issued because the global abort was already established. */
  notIssuedRowIds: string[];
  /** Rows for which a request WAS issued, in order. */
  issuedRowIds: string[];
  requestsScheduled: number;
  dkFired: boolean;
  dkFiredLocally: boolean;
  dkAbort: DkAbortRecord | null;
  /** `D-K.3`. False from the moment one required provider evaluation is permanently absent. */
  allRequiredEvaluationsObtained: boolean;
}

export async function executeRequiredEvaluations<TRow extends RowLike, TRun extends RunOutcomeLike, TRecord>(
  hooks: LoopHooks<TRow, TRun, TRecord>,
): Promise<LoopReport<TRecord>> {
  const now = hooks.now ?? (() => new Date());
  const records: TRecord[] = [];
  const issuedRowIds: string[] = [];
  const notIssuedRowIds: string[] = [];
  let dkFiredLocally = false;
  let spendInitiated = false;

  let index = 0;
  for (const row of hooks.rows) {
    index += 1;

    // ---- GLOBAL D-K GATE, PRE-ISSUE --------------------------------------------------------
    // Once the abort state exists — set by THIS process or by the required sibling process — no
    // new provider request is issued in this process. Nothing is retried, nothing is resumed.
    if (hooks.abort.isAborted()) {
      notIssuedRowIds.push(row.rowId);
      continue;
    }

    const built = hooks.build(row, index);

    // `D-H`: spend is caused by TRANSMISSION and is recorded BEFORE the first observation leaves
    // this runner. It is never conditioned on, or reverted by, any scoring or abort outcome.
    if (!spendInitiated) {
      spendInitiated = true;
      hooks.onSpendInitiated?.(row);
    }

    issuedRowIds.push(row.rowId);
    const run = await hooks.issue(row, index, built);

    // ---- D-G.3 CLASSIFICATION — the earliest deterministic post-retry observation ------------
    const classification = classifyProviderEvaluation(run);
    records.push(hooks.record(row, index, built, run, classification));
    hooks.onRowComplete?.(row, index, classification);

    // ---- D-K.2 -----------------------------------------------------------------------------
    // "After spend, the run ABORTS at the first required row that ends PROVIDER_EVALUATED = FALSE
    //  once the frozen retry policy for that row is exhausted."
    // No streak. No threshold. No tuning constant. First one, every time.
    if (!classification.providerEvaluated) {
      dkFiredLocally = true;
      hooks.abort.fire({
        event: 'D_K_ABORT',
        abortRowId: row.rowId,
        abortExecutionIndex: index,
        abortProcessLabel: hooks.processLabel,
        abortPid: process.pid,
        failureKind: classification.failureKind,
        outcomeKind: classification.outcomeKind,
        failureClass: classification.failureClass,
        ts: now().toISOString(),
        HOLDOUT_SPENT: true,
        SCORABLE: false,
        terminal: 'L3_ACCEPTANCE_NOT_SCORABLE — INCOMPLETE_PROVIDER_EVALUATION',
        MODEL_ACCEPTANCE_RESULT: 'NOT_ESTABLISHED',
        automaticRerun: 'NONE',
        corpusRestored: false,
      });
      // Stop scheduling in THIS process. The remaining rows are recorded as not-issued so the
      // evidence says plainly which rows never reached a provider.
      for (let j = index; j < hooks.rows.length; j += 1) notIssuedRowIds.push(hooks.rows[j].rowId);
      break;
    }
  }

  const dkAbort = hooks.abort.read();
  return {
    records,
    notIssuedRowIds,
    issuedRowIds,
    requestsScheduled: issuedRowIds.length,
    dkFired: dkAbort !== null,
    dkFiredLocally,
    dkAbort,
    allRequiredEvaluationsObtained: dkAbort === null && notIssuedRowIds.length === 0
      && records.length === hooks.rows.length,
  };
}
