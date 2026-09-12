/**
 * §209 -- THE RECORDING BOUNDARY. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * ==================== WHY THIS MODULE EXISTS ====================
 *
 * §209 permits exactly one writer of a product-owner verdict, and `record-209-verdict.ts` was it.
 * A batch recorder that re-implemented the refusal ladder would be a SECOND authority system: a
 * weaker parallel path that could drift from the first and admit a verdict the single recorder
 * would have refused. So the ladder was lifted out of the CLI unchanged and put here, and both
 * `record-209-verdict.ts` (one verdict) and `record-209-batch.ts` (a product-owner-authored file
 * of verdicts) are now thin argument handling over this one module.
 *
 * The extraction is BEHAVIOUR-PRESERVING BY CONSTRUCTION: the refusal codes, the order they are
 * evaluated in, the detail text, the ledger-entry shape, the worksheet mutation and the status
 * string were moved verbatim. `test-209-batch-recorder.ts` re-asserts single-verdict behaviour
 * against the real CLI so the claim is checked rather than asserted.
 *
 * ==================== WHAT THIS MODULE STILL REFUSES TO DO ====================
 *
 * It DERIVES NOTHING. There is no scorer here, no heuristic, no comparison against the frozen
 * truth, no default and no repair. `evaluateJudgment` is a pure predicate over a caller-supplied
 * judgment: it may answer "this may not be written, and here is the frozen rule that forbids it",
 * and it may never answer "here is what should have been written instead". A function that could
 * supply, complete or infer a verdict would be an agent adjudicating, which §209 forbids.
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

/** The authoritative §209 packet. Anything else is a fixture and must announce itself as one. */
export const LIVE_PACKET_DIR = join(
  __dirname, '..', '..', '..', 'verification',
  'expert-hazlenz-frozen-cohort-adjudication-209-2026-09-08');

export interface Section209PacketPaths {
  dir: string;
  worksheet: string;
  ledger: string;
}

export const packetPaths = (dir: string): Section209PacketPaths => ({
  dir,
  worksheet: join(dir, 'ADJUDICATION-WORKSHEET-209.json'),
  ledger: join(dir, 'VERDICT-LEDGER-209.jsonl'),
});

/**
 * `--packet-dir=` exists so the suite can prove these semantics against a fixture without ever
 * touching the live 177-slot packet. It defaults to the live packet, and every caller announces
 * loudly when it has been redirected -- a silent redirect of where verdicts land would be worse
 * than no override at all.
 */
export const packetDirFromArgv = (argv: string[]): string => {
  const hit = argv.find(a => a.startsWith('--packet-dir='));
  return hit === undefined ? LIVE_PACKET_DIR : hit.slice('--packet-dir='.length);
};

export interface Section209Slot {
  slotId: string;
  caseId: string;
  axisId: string;
  factKey: string | null;
  allowedVocabulary: string[];
  structuralNotExercised: string | null;
  verdict: string | null;
  attribution: string | null;
  recordedAt: string | null;
  recordedInBatch: string | null;
  revisionOf: string | null;
  reason: string | null;
  [k: string]: unknown;
}

export interface Section209Worksheet {
  status: string;
  preregistrationIdentity: string;
  suppliedVerdictCount: number;
  slots: Section209Slot[];
  [k: string]: unknown;
}

/** Exactly the fields the single recorder took from argv. Nothing here is derivable. */
export interface Section209Judgment {
  slotId: string;
  verdict: string;
  attribution: string;
  batch: string;
  reason: string | null;
  isRevision: boolean;
}

export interface Section209Refusal {
  code: string;
  detail: string;
}

export interface Section209LedgerEntry {
  slotId: string;
  caseId: string;
  axisId: string;
  factKey: string | null;
  verdict: string;
  attribution: 'PRODUCT_OWNER';
  batch: string;
  reason: string | null;
  revisionOf: string | null;
  recordedAt: string;
  preregistrationIdentity: string;
}

export const readWorksheet = (
  paths: Section209PacketPaths,
): { worksheet: Section209Worksheet } | { refusal: Section209Refusal } => {
  if (!existsSync(paths.worksheet)) {
    return { refusal: { code: 'WORKSHEET_MISSING', detail: `no §209 worksheet at ${paths.worksheet}` } };
  }
  return { worksheet: JSON.parse(readFileSync(paths.worksheet, 'utf8')) as Section209Worksheet };
};

export const findSlot = (
  worksheet: Section209Worksheet, slotId: string,
): Section209Slot | undefined => worksheet.slots.find(s => s.slotId === slotId);

/**
 * THE REFUSAL LADDER, in the order §209 froze it. Pure: reads the worksheet, writes nothing,
 * returns null when the supplied judgment may be recorded exactly as supplied.
 */
export const evaluateJudgment = (
  worksheet: Section209Worksheet, j: Section209Judgment,
): Section209Refusal | null => {
  const slot = findSlot(worksheet, j.slotId);

  if (slot === undefined) {
    return {
      code: 'UNKNOWN_SLOT',
      detail: `${j.slotId} is not a slot in the frozen §209 instrument`,
    };
  }
  if (j.attribution !== 'PRODUCT_OWNER') {
    return {
      code: 'ATTRIBUTION_MUST_BE_PRODUCT_OWNER',
      detail: `attribution "${j.attribution}" was supplied. Only a product owner may author a `
        + 'verdict; no agent, scorer, heuristic, language model or code path may.',
    };
  }
  if (!slot.allowedVocabulary.includes(j.verdict)) {
    return {
      code: 'VALUE_NOT_IN_ALLOWED_VOCABULARY',
      detail: `"${j.verdict}" is not permitted on ${j.slotId}. Permitted: `
        + `${slot.allowedVocabulary.join(', ')}`,
    };
  }
  if (j.verdict === 'NOT_EXERCISED' && (j.reason === null || j.reason.trim().length < 10)) {
    return {
      code: 'NOT_EXERCISED_REQUIRES_A_REASON',
      detail: 'NOT_EXERCISED is permitted only where the design targeted an axis and the '
        + 'opportunity did not materialise, and it must carry a recorded reason naming what did not '
        + 'materialise. A vacuous CORRECT is forbidden and so is an unexplained NOT_EXERCISED.',
    };
  }
  if (slot.structuralNotExercised !== null && j.verdict !== 'NOT_EXERCISED') {
    return {
      code: 'NO_OPPORTUNITY_SLOT_TAKES_ONLY_NOT_EXERCISED',
      detail: `${j.slotId} was frozen as having no opportunity before adjudication began. Its `
        + `frozen reason is: ${String(slot.structuralNotExercised)}`,
    };
  }
  if (slot.verdict !== null && slot.verdict !== j.verdict && !j.isRevision) {
    return {
      code: 'CONFLICTING_REVISION_REQUIRES_EXPLICIT_FLAG',
      detail: `${j.slotId} already carries "${String(slot.verdict)}" and "${j.verdict}" was `
        + 'supplied. Pass --revision with a --reason to record a revision; both values are retained '
        + 'in the ledger.',
    };
  }
  if (slot.verdict !== null && j.isRevision && (j.reason === null || j.reason.trim().length < 10)) {
    return {
      code: 'REVISION_REQUIRES_A_REASON',
      detail: 'a revision must carry a recorded reason, and the reason must not be the gate outcome.',
    };
  }
  return null;
};

/**
 * Builds the ledger entry. MUST be called before `applyEntry`, because `revisionOf` is the value
 * the slot carried BEFORE the write -- that ordering is what makes a revision non-destructive.
 */
export const buildLedgerEntry = (
  worksheet: Section209Worksheet, slot: Section209Slot, j: Section209Judgment, recordedAt: string,
): Section209LedgerEntry => ({
  slotId: j.slotId,
  caseId: slot.caseId,
  axisId: slot.axisId,
  factKey: slot.factKey,
  verdict: j.verdict,
  attribution: 'PRODUCT_OWNER',
  batch: j.batch,
  reason: j.reason,
  revisionOf: slot.verdict,
  recordedAt,
  preregistrationIdentity: worksheet.preregistrationIdentity,
});

export const applyEntry = (
  worksheet: Section209Worksheet, slot: Section209Slot, entry: Section209LedgerEntry,
): void => {
  slot.verdict = entry.verdict;
  slot.attribution = 'PRODUCT_OWNER';
  slot.recordedAt = entry.recordedAt;
  slot.recordedInBatch = entry.batch;
  slot.reason = entry.reason;
  slot.revisionOf = entry.revisionOf;

  worksheet.suppliedVerdictCount = worksheet.slots.filter(
    s => typeof s.verdict === 'string' && s.verdict.length > 0).length;
  worksheet.status = worksheet.suppliedVerdictCount === worksheet.slots.length
    ? 'ALL SLOTS CARRY A PRODUCT_OWNER VERDICT'
    : `OPEN — ${worksheet.suppliedVerdictCount} of ${worksheet.slots.length} slots carry a `
      + 'PRODUCT_OWNER verdict';
};

export const serialiseWorksheet = (worksheet: Section209Worksheet): string =>
  `${JSON.stringify(worksheet, null, 2)}\n`;

export const ledgerLine = (entry: Section209LedgerEntry): string =>
  `${JSON.stringify(entry)}\n`;
