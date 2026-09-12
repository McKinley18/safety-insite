/**
 * §209 -- REPLAY A PRODUCT-OWNER-AUTHORED VERDICT FILE. ALL OR NOTHING.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * ==================== WHAT THIS IS, AND WHAT IT IS EMPHATICALLY NOT ====================
 *
 * This is TRANSPORT. A product owner authors 177 judgments in a file; this reads that file,
 * validates every line of it, and replays each line through the one recording boundary §209
 * already froze. It is orchestration around `record-209-verdict.ts`, not a second authority.
 *
 * It may parse and validate the fields. It may NOT determine what any field should contain. There
 * is no code path in this file that suggests a verdict, generates or rewrites or completes a
 * reason, infers a verdict from a reason (or a reason from a verdict), infers anything from the
 * frozen truth, the deterministic evidence or provider output, promotes AMBIGUOUS or
 * NOT_EXERCISED to something more convenient, or drops a judgment it could not place. Everything
 * it cannot record, it refuses by name and line number.
 *
 * Building this recorder does not advance acceptance. It moves no gate and decides no slot. The
 * terminal state remains PRODUCT_OWNER_ADJUDICATION_REQUIRED until a product owner supplies the
 * file.
 *
 * ==================== INPUT GRAMMAR ====================
 *
 *   slotId | verdict | reason
 *
 *   - One judgment per line, in the product owner's own order.
 *   - The field separator is `|`. The FIRST two occurrences delimit the fields; every later `|`
 *     belongs to the reason, so a reason may contain pipes.
 *   - Each field is stripped of leading/trailing ASCII whitespace -- that is delimiter padding in
 *     the `a | b | c` presentation form, not authored text. Interior text is untouched, and the
 *     raw untrimmed reason is preserved in the receipt so the strip is auditable.
 *   - An empty reason field records no reason (`null`), exactly as omitting `--reason` does on the
 *     single-verdict recorder. Where §209 REQUIRES a reason -- NOT_EXERCISED -- the frozen ladder
 *     refuses it, and this file does not decide that question for itself.
 *   - A line whose first character is `#` is a comment and a wholly blank line is skipped. Neither
 *     is silent: every skipped line is counted, listed by line number in the run output, and
 *     preserved verbatim in the receipt.
 *   - A single trailing newline at end of file is end-of-line, not an empty final judgment.
 *
 * ==================== ATOMICITY ====================
 *
 * The complete file is validated against an in-memory projection of the worksheet BEFORE the first
 * byte is written, and every refusal in the file is reported at once rather than one per run. If
 * any line is refused, ZERO verdicts are written. On the writing side the whole ledger block is
 * appended in a single call and the worksheet is rewritten immediately after; if that rewrite
 * fails the ledger is truncated back to its pre-batch length, so a crash between the two writes
 * cannot leave a half-applied batch.
 *
 * ==================== NO OVERWRITE ====================
 *
 * This recorder has NO revision mode. A slot that already carries a verdict is refused, even for
 * an identical value. Revising a recorded product-owner judgment stays where §209 put it: one
 * slot at a time, deliberately, through `record-209-verdict.ts --revision`. A later batch may
 * populate slots that are still open.
 */

import { appendFileSync, existsSync, readFileSync, statSync, truncateSync, writeFileSync } from 'fs';
import { createHash } from 'crypto';
import { join, resolve } from 'path';
import { TextDecoder } from 'util';

import {
  LIVE_PACKET_DIR, Section209Judgment, Section209Refusal, Section209Worksheet, applyEntry,
  buildLedgerEntry, evaluateJudgment, findSlot, ledgerLine, packetDirFromArgv, packetPaths,
  readWorksheet, serialiseWorksheet,
} from './lib/section-209-recording-boundary';

// ================================================================ arguments

const arg = (name: string): string | null => {
  const hit = process.argv.find(a => a.startsWith(`--${name}=`));
  return hit === undefined ? null : hit.slice(name.length + 3);
};

const file = arg('file');
const attribution = arg('attribution');
const batchId = arg('batch');
const isDryRun = process.argv.includes('--dry-run');

const PACKET_DIR = packetDirFromArgv(process.argv);
const paths = packetPaths(PACKET_DIR);

const sha256 = (b: Buffer | string): string => createHash('sha256').update(b).digest('hex');

const usage = (): never => {
  console.error('§209 batch usage:');
  console.error('  npx ts-node -T scripts/record-209-batch.ts \\');
  console.error('    --file=<VERDICT_FILE> --attribution=PRODUCT_OWNER --batch=<BATCH_ID> \\');
  console.error('    [--dry-run]');
  console.error('');
  console.error('  file grammar, one judgment per line:   slotId | verdict | reason');
  console.error('');
  console.error('THIS SCRIPT DERIVES NOTHING. Every verdict and every reason is read from the '
    + 'product-owner-authored file or it is not recorded at all.');
  process.exit(1);
};

if (file === null || attribution === null || batchId === null) usage();
if (process.argv.includes('--revision')) {
  console.error('§209 REFUSED: BATCH_RECORDER_HAS_NO_REVISION_MODE');
  console.error('  A batch may populate open slots only. Revising a recorded PRODUCT_OWNER '
    + 'judgment is done one slot at a time through record-209-verdict.ts --revision.');
  console.error('  NOTHING WAS WRITTEN.');
  process.exit(1);
}

// ================================================================ refusal accumulation

interface BatchRefusal { line: number | null; code: string; detail: string; raw: string | null }
const refusals: BatchRefusal[] = [];
const refuse = (code: string, detail: string, line: number | null = null,
  raw: string | null = null): void => { refusals.push({ code, detail, line, raw }); };

const abort = (): never => {
  console.error('');
  console.error(`§209 BATCH REFUSED — ${refusals.length} refusal(s). ZERO VERDICTS WERE WRITTEN.`);
  for (const r of refusals) {
    console.error(`  ${r.line === null ? 'file' : `line ${r.line}`}  ${r.code}`);
    console.error(`      ${r.detail}`);
    if (r.raw !== null) console.error(`      supplied: ${r.raw}`);
  }
  console.error('');
  console.error('  The batch is all-or-nothing. Nothing was appended to the ledger and the '
    + 'worksheet was not rewritten.');
  console.error('  provider calls: 0   database operations: 0');
  process.exit(1);
};

if (PACKET_DIR !== LIVE_PACKET_DIR) {
  console.log('§209 NON-AUTHORITATIVE PACKET DIRECTORY — this run does NOT touch the live packet:');
  console.log(`  ${PACKET_DIR}`);
}

// ================================================================ 1. input identity and encoding

const filePath = resolve(file as string);
if (!existsSync(filePath)) {
  refuse('BATCH_FILE_MISSING', `no verdict file at ${filePath}`);
  abort();
}
const rawBytes = readFileSync(filePath);
const inputSha256 = sha256(rawBytes);

if (!/^[A-Za-z0-9._-]+$/.test(batchId as string)) {
  refuse('BATCH_ID_MUST_BE_FILENAME_SAFE',
    `batch id "${String(batchId)}" is used in the receipt filename. Permitted characters: `
    + 'A-Z a-z 0-9 . _ -');
}

const hasBom = rawBytes.length >= 3
  && rawBytes[0] === 0xef && rawBytes[1] === 0xbb && rawBytes[2] === 0xbf;
const body = hasBom ? rawBytes.subarray(3) : rawBytes;

let decoded = '';
try {
  decoded = new TextDecoder('utf-8', { fatal: true }).decode(body);
} catch {
  refuse('BATCH_FILE_MALFORMED_ENCODING',
    'the verdict file is not valid UTF-8. It is not re-encoded, repaired or guessed at.');
  abort();
}

const hadCarriageReturns = decoded.includes('\r');
const text = decoded.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

// ================================================================ 2. lines

const segments = text.split('\n');
if (segments.length > 0 && segments[segments.length - 1] === '') segments.pop();

interface SkippedLine { line: number; kind: 'COMMENT' | 'BLANK'; text: string }
interface ParsedLine {
  line: number; raw: string; slotId: string; verdict: string;
  reason: string | null; reasonRaw: string;
}

const skipped: SkippedLine[] = [];
const parsed: ParsedLine[] = [];

segments.forEach((raw, i) => {
  const lineNo = i + 1;

  for (const ch of raw) {
    const code = ch.codePointAt(0) as number;
    if ((code < 0x20 && ch !== '\t') || code === 0x7f) {
      refuse('BATCH_FILE_CONTAINS_CONTROL_CHARACTER',
        `line contains control character U+${code.toString(16).toUpperCase().padStart(4, '0')}. `
        + 'It is not stripped, substituted or repaired.', lineNo, JSON.stringify(raw));
      return;
    }
  }

  if (raw.trim() === '') { skipped.push({ line: lineNo, kind: 'BLANK', text: raw }); return; }
  if (raw.startsWith('#')) { skipped.push({ line: lineNo, kind: 'COMMENT', text: raw }); return; }

  const firstPipe = raw.indexOf('|');
  const secondPipe = firstPipe === -1 ? -1 : raw.indexOf('|', firstPipe + 1);
  if (firstPipe === -1 || secondPipe === -1) {
    refuse('MALFORMED_DELIMITER_STRUCTURE',
      'a judgment line must be  slotId | verdict | reason  and carry at least two `|` separators. '
      + 'No field is inferred from a shorter line.', lineNo, raw);
    return;
  }

  const slotId = raw.slice(0, firstPipe).trim();
  const verdict = raw.slice(firstPipe + 1, secondPipe).trim();
  const reasonRaw = raw.slice(secondPipe + 1);
  const reasonTrimmed = reasonRaw.trim();

  if (slotId === '') {
    refuse('EMPTY_SLOT_ID_FIELD', 'the slot id field is empty and is not inferred from the file '
      + 'position, the surrounding lines or anything else.', lineNo, raw);
    return;
  }
  if (verdict === '') {
    refuse('EMPTY_VERDICT_FIELD', 'the verdict field is empty. A verdict is supplied by the '
      + 'product owner or it is not supplied at all; it is never defaulted.', lineNo, raw);
    return;
  }

  parsed.push({
    line: lineNo, raw, slotId, verdict,
    reason: reasonTrimmed === '' ? null : reasonTrimmed,
    reasonRaw,
  });
});

if (parsed.length === 0 && refusals.length === 0) {
  refuse('NO_JUDGMENTS_SUPPLIED',
    `the file parsed to zero judgment lines (${segments.length} physical line(s), `
    + `${skipped.length} comment/blank). A batch that records nothing is refused rather than `
    + 'reported as a success.');
}

// ================================================================ 3. worksheet, read once

const loaded = readWorksheet(paths);
if ('refusal' in loaded) { refuse(loaded.refusal.code, loaded.refusal.detail); abort(); }
const worksheetBytesBefore = readFileSync(paths.worksheet);
const worksheetShaBefore = sha256(worksheetBytesBefore);
const suppliedBefore = (loaded as { worksheet: Section209Worksheet }).worksheet.suppliedVerdictCount;
const slotCount = (loaded as { worksheet: Section209Worksheet }).worksheet.slots.length;

// A throwaway projection. Validation happens entirely here so that nothing on disk is touched
// until every line has passed.
const projection = JSON.parse(worksheetBytesBefore.toString('utf8')) as Section209Worksheet;

// ================================================================ 4. validate every line

const seen = new Map<string, number>();
const entriesToWrite: { parsed: ParsedLine; judgment: Section209Judgment }[] = [];

for (const p of parsed) {
  const firstAt = seen.get(p.slotId);
  if (firstAt !== undefined) {
    refuse('DUPLICATE_SLOT_IN_BATCH',
      `${p.slotId} was already supplied on line ${firstAt}. The batch does not choose between two `
      + 'judgments for one slot and does not record both.', p.line, p.raw);
    continue;
  }
  seen.set(p.slotId, p.line);

  const existing = findSlot(projection, p.slotId);
  if (existing !== undefined && existing.verdict !== null) {
    refuse('SLOT_ALREADY_CARRIES_A_VERDICT',
      `${p.slotId} already carries "${String(existing.verdict)}". The batch recorder never `
      + 'overwrites a recorded PRODUCT_OWNER judgment; a revision is made one slot at a time '
      + 'through record-209-verdict.ts --revision.', p.line, p.raw);
    continue;
  }

  const judgment: Section209Judgment = {
    slotId: p.slotId,
    verdict: p.verdict,
    attribution: attribution as string,
    batch: batchId as string,
    reason: p.reason,
    isRevision: false,
  };

  const refusal: Section209Refusal | null = evaluateJudgment(projection, judgment);
  if (refusal !== null) { refuse(refusal.code, refusal.detail, p.line, p.raw); continue; }

  // Advance the projection so a later line sees the state an earlier line would have created.
  const slot = findSlot(projection, p.slotId)!;
  applyEntry(projection, slot,
    buildLedgerEntry(projection, slot, judgment, '1970-01-01T00:00:00.000Z'));

  entriesToWrite.push({ parsed: p, judgment });
}

if (refusals.length > 0) abort();

// ================================================================ 5. report

const tally: Record<string, number> = {};
for (const e of entriesToWrite) tally[e.judgment.verdict] = (tally[e.judgment.verdict] ?? 0) + 1;

const ledgerBytesBefore = existsSync(paths.ledger) ? statSync(paths.ledger).size : 0;
const ledgerEntriesBefore = existsSync(paths.ledger)
  ? readFileSync(paths.ledger, 'utf8').split('\n').filter(Boolean).length : 0;

console.log(`================ §209 BATCH ${isDryRun ? 'DRY RUN' : 'APPLY'}`);
console.log(`  verdict file                    : ${filePath}`);
console.log(`  sha256                          : ${inputSha256}`);
console.log(`  bytes                           : ${rawBytes.length}`);
console.log(`  physical lines                  : ${segments.length}`);
console.log(`  parsed judgments                : ${parsed.length}`);
console.log(`  comment lines                   : ${skipped.filter(s => s.kind === 'COMMENT').length}`);
console.log(`  blank lines                     : ${skipped.filter(s => s.kind === 'BLANK').length}`);
console.log(`  byte-order mark stripped        : ${String(hasBom)}`);
console.log(`  CRLF normalised                 : ${String(hadCarriageReturns)}`);
console.log(`  attribution                     : ${String(attribution)}`);
console.log(`  batch id                        : ${String(batchId)}`);
console.log(`  slots in instrument             : ${slotCount}`);
console.log(`  verdicts before this batch      : ${suppliedBefore}`);
console.log(`  verdicts this batch would write : ${entriesToWrite.length}`);
console.log(`  refusals                        : 0`);
if (skipped.length > 0) {
  console.log('');
  console.log('  SKIPPED, NOT RECORDED (listed so no line disappears quietly):');
  for (const s of skipped) console.log(`    line ${String(s.line).padStart(4)}  ${s.kind}  ${s.text}`);
}
console.log('');
console.log('  verdict tally, as authored by the product owner:');
for (const [v, n] of Object.entries(tally).sort()) {
  console.log(`    ${v.padEnd(45)} ${String(n).padStart(4)}`);
}

if (isDryRun) {
  console.log('');
  console.log('  DRY RUN — every line parsed, every slot resolved, every refusal condition checked.');
  console.log('  verdicts written                : 0');
  console.log('  worksheet mutated               : no');
  console.log('  ledger appended                 : no');
  console.log('  receipt written                 : no');
  console.log('  provider calls: 0   database operations: 0');
  process.exit(0);
}

// ================================================================ 6. apply, all or nothing

if (sha256(readFileSync(paths.worksheet)) !== worksheetShaBefore) {
  refuse('WORKSHEET_CHANGED_DURING_VALIDATION',
    'the worksheet on disk changed between validation and writing. The batch was validated against '
    + 'a state that no longer exists and is refused rather than applied to a different one.');
  abort();
}

const recordedAt = new Date().toISOString();
const worksheet = (loaded as { worksheet: Section209Worksheet }).worksheet;
const receiptJudgments: unknown[] = [];
let ledgerBlock = '';

for (const { parsed: p, judgment } of entriesToWrite) {
  const slot = findSlot(worksheet, p.slotId)!;
  const entry = buildLedgerEntry(worksheet, slot, judgment, recordedAt);
  ledgerBlock += ledgerLine(entry);
  applyEntry(worksheet, slot, entry);
  receiptJudgments.push({
    line: p.line,
    slotId: p.slotId,
    verdict: p.verdict,
    reason: p.reason,
    reasonAsAuthoredUntrimmed: p.reasonRaw,
    attribution: 'PRODUCT_OWNER',
  });
}

// Ledger first, in one append, so a revision can never destroy the value it replaces and a
// half-written block cannot exist. If the worksheet rewrite then fails, the ledger is rolled back
// to its pre-batch length: the batch wrote zero verdicts or all of them, never some.
appendFileSync(paths.ledger, ledgerBlock);
try {
  writeFileSync(paths.worksheet, serialiseWorksheet(worksheet));
} catch (e) {
  truncateSync(paths.ledger, ledgerBytesBefore);
  console.error('§209 REFUSED: WORKSHEET_WRITE_FAILED');
  console.error(`  ${String(e)}`);
  console.error(`  The ledger was truncated back to ${ledgerBytesBefore} bytes. ZERO verdicts were `
    + 'recorded by this batch.');
  process.exit(1);
}

const worksheetAfter = readFileSync(paths.worksheet);
const ledgerAfter = readFileSync(paths.ledger);

const receipt = {
  artifact: 'SECTION_209_BATCH_RECORDING_RECEIPT',
  mode: 'APPLIED',
  batchId,
  attribution: 'PRODUCT_OWNER',
  authorship: 'Every slotId, verdict and reason below was read from the product-owner-authored '
    + 'file named here. No field was suggested, generated, completed, rewritten or inferred by '
    + 'this recorder, and this receipt carries no recommendation of any kind.',
  packetDirectory: PACKET_DIR,
  isAuthoritativePacket: PACKET_DIR === LIVE_PACKET_DIR,
  preregistrationIdentity: worksheet.preregistrationIdentity,
  input: {
    path: filePath,
    sha256: inputSha256,
    byteLength: rawBytes.length,
    byteOrderMarkStripped: hasBom,
    carriageReturnsNormalised: hadCarriageReturns,
    physicalLineCount: segments.length,
    parsedJudgmentCount: parsed.length,
    skippedLines: skipped,
  },
  judgments: receiptJudgments,
  verdictTally: tally,
  worksheet: {
    slotCount,
    suppliedVerdictCountBefore: suppliedBefore,
    suppliedVerdictCountAfter: worksheet.suppliedVerdictCount,
    status: worksheet.status,
    sha256Before: worksheetShaBefore,
    sha256After: sha256(worksheetAfter),
  },
  ledger: {
    entryCountBefore: ledgerEntriesBefore,
    entryCountAfter: ledgerAfter.toString('utf8').split('\n').filter(Boolean).length,
    byteLengthBefore: ledgerBytesBefore,
    byteLengthAfter: ledgerAfter.length,
    appendedEntryCount: entriesToWrite.length,
    sha256After: sha256(ledgerAfter),
  },
  recordedAt,
  providerCalls: 0,
  databaseOperations: 0,
  gateComputationPerformed: false,
  note: 'Recording a batch does not compute a gate and does not advance acceptance. Run '
    + 'check-209-completeness.ts to count what is now supplied and what remains open.',
};

const receiptPath = join(PACKET_DIR,
  `BATCH-RECEIPT-209-${String(batchId)}-${recordedAt.replace(/[:.]/g, '-')}.json`);
writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);

console.log('');
console.log(`§209 BATCH RECORDED  ${entriesToWrite.length} verdict(s)  PRODUCT_OWNER  `
  + `batch=${String(batchId)}`);
console.log(`  ${worksheet.suppliedVerdictCount} of ${slotCount} slots now carry a verdict`);
console.log(`  ledger entries                  : ${receipt.ledger.entryCountBefore} -> `
  + `${receipt.ledger.entryCountAfter}`);
console.log(`  receipt                         : ${receiptPath}`);
console.log('  gates were NOT computed. Recording a batch does not advance acceptance.');
console.log('  provider calls: 0   database operations: 0');
