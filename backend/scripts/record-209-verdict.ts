/**
 * §209 -- RECORD ONE PRODUCT-OWNER VERDICT. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * ==================== THE ONLY SEMANTICS THAT MAY WRITE A VERDICT ====================
 *
 * §209: "Only PRODUCT_OWNER-attributed human verdicts may populate the 177 judgment slots. No
 * agent, deterministic scorer, heuristic, language model, or code path may write a product-owner
 * verdict."
 *
 * This script takes the verdict as an argument from the person running it and it DERIVES NOTHING:
 * there is no scorer here, no heuristic, no comparison against the frozen truth, and no default.
 * If `--verdict` is absent, nothing is written. That is the design — a recorder that could compute
 * a verdict would be an agent supplying one.
 *
 * The refusal ladder, the ledger-entry shape and the worksheet mutation now live in
 * `lib/section-209-recording-boundary.ts`, unchanged, so that the batch recorder
 * (`record-209-batch.ts`) is orchestration over THIS boundary rather than a second, weaker one.
 * This file is the single-verdict argument handling and nothing else.
 *
 * ==================== WHAT IT REFUSES ====================
 *
 *   UNKNOWN_SLOT                                 the slot id is not in the frozen instrument
 *   VALUE_NOT_IN_ALLOWED_VOCABULARY              the value is outside that slot's frozen vocabulary
 *   ATTRIBUTION_MUST_BE_PRODUCT_OWNER            any attribution other than PRODUCT_OWNER
 *   NOT_EXERCISED_REQUIRES_A_REASON              NOT_EXERCISED without a recorded reason
 *   CONFLICTING_REVISION_REQUIRES_EXPLICIT_FLAG  a different value over an existing one
 *   NO_OPPORTUNITY_SLOT_TAKES_ONLY_NOT_EXERCISED a frozen no-opportunity slot scored as anything else
 *
 * The last refusal matters: the eleven no-opportunity slots were fixed before adjudication and
 * carry a frozen reason. Scoring one would be the vacuous-verdict failure §204 refused.
 *
 * Every write is appended to `VERDICT-LEDGER-209.jsonl` before the worksheet is updated, so a
 * revision never destroys the value it replaced.
 */

import { appendFileSync, writeFileSync } from 'fs';

import {
  LIVE_PACKET_DIR, applyEntry, buildLedgerEntry, evaluateJudgment, findSlot, ledgerLine,
  packetDirFromArgv, packetPaths, readWorksheet, serialiseWorksheet,
} from './lib/section-209-recording-boundary';

const arg = (name: string): string | null => {
  const hit = process.argv.find(a => a.startsWith(`--${name}=`));
  return hit === undefined ? null : hit.slice(name.length + 3);
};

const slotId = arg('slot');
const verdict = arg('verdict');
const attribution = arg('attribution');
const batch = arg('batch');
const reason = arg('reason');
const isRevision = process.argv.includes('--revision');

const PACKET_DIR = packetDirFromArgv(process.argv);
const paths = packetPaths(PACKET_DIR);

// Explicitly typed as returning `never` so the compiler narrows what follows a refusal.
const refuse: (code: string, detail: string) => never = (code, detail) => {
  console.error(`§209 REFUSED: ${code}`);
  console.error(`  ${detail}`);
  console.error('  NOTHING WAS WRITTEN.');
  process.exit(1);
};

if (slotId === null || verdict === null || attribution === null || batch === null) {
  console.error('§209 usage:');
  console.error('  npx ts-node -T scripts/record-209-verdict.ts \\');
  console.error('    --slot=<SLOT_ID> --verdict=<VALUE> --attribution=PRODUCT_OWNER \\');
  console.error('    --batch=<BATCH_ID> [--reason="..."] [--revision]');
  console.error('');
  console.error('THIS SCRIPT DERIVES NOTHING. The verdict is supplied by the product owner or it '
    + 'is not supplied at all.');
  process.exit(1);
}

if (PACKET_DIR !== LIVE_PACKET_DIR) {
  console.log('§209 NON-AUTHORITATIVE PACKET DIRECTORY — this run does NOT touch the live packet:');
  console.log(`  ${PACKET_DIR}`);
}

const loaded = readWorksheet(paths);
if ('refusal' in loaded) refuse(loaded.refusal.code, loaded.refusal.detail);
const worksheet = loaded.worksheet;

const judgment = { slotId, verdict, attribution, batch, reason, isRevision };
const refusal = evaluateJudgment(worksheet, judgment);
if (refusal !== null) refuse(refusal.code, refusal.detail);

const slot = findSlot(worksheet, slotId)!;
const entry = buildLedgerEntry(worksheet, slot, judgment, new Date().toISOString());

// Ledger first: a revision must never be able to destroy the value it replaces.
appendFileSync(paths.ledger, ledgerLine(entry));

applyEntry(worksheet, slot, entry);
writeFileSync(paths.worksheet, serialiseWorksheet(worksheet));

console.log(`§209 RECORDED  ${slotId}  ${verdict}  PRODUCT_OWNER  batch=${batch}`);
if (entry.revisionOf !== null) {
  console.log(`  revision of "${String(entry.revisionOf)}" — both values retained in the ledger`);
}
console.log(`  ${worksheet.suppliedVerdictCount} of ${worksheet.slots.length} slots now carry a verdict`);
console.log('  provider calls: 0   database operations: 0');
