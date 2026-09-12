/**
 * §139 Phase 7 -- APPEND-ONLY, DURABLE-DURING-EXECUTION PERSISTENCE FOR `CohortRunRecord[]`.
 *
 * ==================== THE DEFECT THIS CLOSES ====================
 *
 * The 2026-09-01 formal run completed 195/195 calls and then lost every validated `ExpertAnalysis`
 * and every merged block at process exit. `runFormalCohort` RETURNED the `CohortRunRecord[]`;
 * `execute-formal-cohort-65.ts` wrote `EVALUATION-RESULT.json`, `ATTEMPT-LEDGER.json` and
 * `ADJUDICATION-QUEUE.json`, and never serialized `run.records`. The frozen end-to-end rescoring
 * path became permanently unavailable for that run.
 *
 * The measured cost is not hypothetical and is not a footnote. M06/M07/M09 were recoverable from
 * the adjudication artifacts, but the largest failing gate in the surface -- M14 order sensitivity
 * at 0.9219 against a 0.05 ceiling -- has NO attributable cause and can never have one from that
 * run, because the per-row scored projections were never written down. Four further diagnostic
 * questions are permanently unanswerable for the same reason.
 *
 * ==================== WHAT "APPEND-ONLY" MEANS HERE ====================
 *
 * One JSON object per line, flushed and `fsync`ed before `append` returns. A record that has been
 * appended has reached the disk, so a crash, a kill, a ceiling stop or an unhandled rejection at
 * call N+1 cannot erase calls 1..N. Nothing is ever rewritten: there is no update path, no
 * truncation and no compaction, because every one of those is a way for evidence to change after
 * the fact.
 *
 * ==================== WHAT THIS FILE IS NOT ====================
 *
 * It is NOT a reconstruction path. It reads back exactly the objects that were written and does no
 * inference, no defaulting and no repair -- a malformed line is reported, never patched. If the
 * store is incomplete, the correct outcome is a refusal to score, not a smaller-looking result.
 */

import { appendFileSync, closeSync, existsSync, fsyncSync, mkdirSync, openSync, readFileSync,
  writeSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';
import type { CohortRunRecord } from '../../src/safescope-v2/expert-hazlenz/expert-measure-scorers';

export const RUN_RECORD_STORE_VERSION = 'hazlenz.expert.run-record-store.v1' as const;

/** The file the store owns. One record per line, in completion order. */
export const RUN_RECORD_FILE = 'RUN-RECORDS.jsonl';

export interface RunRecordStore {
  /** Persist one record durably. Returns after the bytes are on disk. */
  append(record: CohortRunRecord): void;
  /** Records appended so far. Counting only; the store never holds them in memory. */
  count(): number;
  /** Close the underlying descriptor. Safe to call more than once. */
  close(): void;
  path: string;
}

/**
 * Open an append-only store. Refuses to reopen a store that already has content, because appending
 * a second run's records to a first run's file would silently produce an unscoreable mixture.
 */
export function createRunRecordStore(dir: string): RunRecordStore {
  mkdirSync(dir, { recursive: true });
  const path = join(dir, RUN_RECORD_FILE);
  if (existsSync(path) && readFileSync(path, 'utf8').trim().length > 0) {
    throw new Error(`${path} already has content -- refusing to append a second run into it`);
  }
  const fd = openSync(path, 'a');
  let appended = 0;
  let closed = false;
  return {
    path,
    append(record: CohortRunRecord): void {
      if (closed) throw new Error('run-record store is closed');
      // One line, no pretty-printing: a line IS the unit of durability.
      writeSync(fd, JSON.stringify(record) + '\n');
      // The whole point. Without this the records live in the page cache and a crash loses them,
      // which is materially the same defect the formal run hit.
      fsyncSync(fd);
      appended += 1;
    },
    count: () => appended,
    close(): void {
      if (closed) return;
      closed = true;
      closeSync(fd);
    },
  };
}

export interface RunRecordReadResult {
  records: CohortRunRecord[];
  /** Lines that could not be parsed. Reported, never skipped silently and never repaired. */
  problems: string[];
  sha256: string;
}

/** Read a store back. Pure: no defaulting, no inference, no repair. */
export function readRunRecordStore(dir: string): RunRecordReadResult {
  const path = join(dir, RUN_RECORD_FILE);
  if (!existsSync(path)) {
    return { records: [], problems: [`${RUN_RECORD_FILE} does not exist`], sha256: '' };
  }
  const raw = readFileSync(path, 'utf8');
  const records: CohortRunRecord[] = [];
  const problems: string[] = [];
  raw.split('\n').forEach((line, i) => {
    if (line.trim().length === 0) return;
    try {
      records.push(JSON.parse(line) as CohortRunRecord);
    } catch {
      problems.push(`line ${i + 1}: not valid JSON`);
    }
  });
  return { records, problems, sha256: createHash('sha256').update(raw).digest('hex') };
}

/**
 * ARTIFACT-COMPLETENESS PREFLIGHT. §139 Phase 7 requirement 6.
 *
 * Answers one question: could every frozen scorer be run again, right now, from what is on disk?
 * A cohort must not be called formally executable unless this returns empty. The check is
 * deliberately about SCORER INPUTS rather than about file sizes, because the 2026-09-01 run wrote
 * three large artifacts and still could not be rescored.
 */
export function runRecordCompletenessProblems(
  records: readonly CohortRunRecord[],
  expected: { rowOrder: readonly string[]; arms: readonly string[] },
): string[] {
  const problems: string[] = [];
  const seen = new Map<string, Set<string>>();
  for (const r of records) {
    const rowId = r.row?.source?.rowId;
    if (!rowId) { problems.push('a record carries no row identity'); continue; }
    const arms = seen.get(rowId) ?? new Set<string>();
    for (const c of r.calls ?? []) {
      if (!c.arm) { problems.push(`${rowId}: a call carries no arm identity`); continue; }
      if (arms.has(c.arm)) problems.push(`${rowId}: duplicate ${c.arm} call`);
      arms.add(c.arm);
      // The two fields the content scorers read. A PRESENT layer with no analysis is exactly the
      // shape that made the frozen path unavailable, so it is a completeness failure, not a warning.
      if (c.layerStatus === 'PRESENT' && !c.analysis) {
        problems.push(`${rowId}/${c.arm}: layer is PRESENT but no validated analysis was persisted`);
      }
      if (!Array.isArray(c.attempts)) {
        problems.push(`${rowId}/${c.arm}: attempt telemetry was not persisted`);
      }
    }
    seen.set(rowId, arms);
  }
  for (const rowId of expected.rowOrder) {
    const arms = seen.get(rowId);
    if (!arms) { problems.push(`${rowId}: no record persisted`); continue; }
    for (const arm of expected.arms) {
      if (!arms.has(arm)) problems.push(`${rowId}: no ${arm} call persisted`);
    }
  }
  const extra = [...seen.keys()].filter(r => !expected.rowOrder.includes(r));
  for (const rowId of extra) problems.push(`${rowId}: persisted but not in the frozen row order`);
  return problems;
}
