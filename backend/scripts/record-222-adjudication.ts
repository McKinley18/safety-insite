/**
 * §222 -- PRODUCT-OWNER ADJUDICATION RECORDER. APPEND-ONLY.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * This file records verdicts the PRODUCT OWNER has stated. It does not choose one, does not suggest
 * one, does not derive one from model output, and does not compute or display any gate outcome.
 *
 * Usage:  ts-node scripts/record-222-adjudication.ts '<json array of {slotId,verdict,note?}>'
 *
 * Every write is APPENDED to ADJUDICATION-LEDGER-222.jsonl. An earlier judgment is never rewritten:
 * a later entry for the same slot is recorded as an explicit AMENDMENT and both survive, so the
 * record of what was decided and when cannot be quietly altered.
 */

import { createHash } from 'crypto';
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..', '..');
const EVID = join(ROOT, 'verification',
  'expert-hazlenz-221-integrated-pipeline-validation-2026-09-10');
const PACKET = join(EVID, 'ADJUDICATION-PACKET-221.json');
const LEDGER = join(EVID, 'ADJUDICATION-LEDGER-222.jsonl');
const STATUS = join(EVID, 'ADJUDICATION-STATUS-222.json');

const FROZEN_DIGEST_221 = '82487b704e7601476481bbbe803d1b3299742478404e8df65f0149330302e1f6';
const PACKET_SHA = '893156ac55d121c9d77640c927116b14a2683feeb1fb49a15f7901b323138633';
const ATTRIBUTION = 'PRODUCT_OWNER' as const;

const sha = (b: Buffer | string): string => createHash('sha256').update(b).digest('hex');

// ---- integrity, before anything is written
const packetRaw = readFileSync(PACKET);
if (sha(packetRaw) !== PACKET_SHA) {
  throw new Error('§222 ABORT: the adjudication packet identity has changed');
}
const preregRaw = readFileSync(join(EVID, 'INTEGRATED-PREREGISTRATION-221.json'));
if (sha(preregRaw) !== FROZEN_DIGEST_221) {
  throw new Error('§222 ABORT: the frozen §221 digest has changed');
}
const packet = JSON.parse(packetRaw.toString('utf8'));
const slots = packet.slots as Array<Record<string, any>>;
const byId = new Map(slots.map(s => [String(s.slotId), s]));
const PERMITTED: readonly string[] = packet.ambiguityRule.permittedVerdicts;

// ---- read what is already recorded
interface Entry {
  seq: number; slotId: string; caseId: string; axis: string; question: string;
  feedsGate: string | null; verdict: string; attribution: string; note: string | null;
  amends: number | null; recordedAt: string;
}
const existing: Entry[] = existsSync(LEDGER)
  ? readFileSync(LEDGER, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l))
  : [];
const latestBySlot = new Map<string, Entry>();
for (const e of existing) latestBySlot.set(e.slotId, e);

const arg = process.argv[2];
if (arg === undefined || arg.trim() === '') {
  const open = slots.filter(s => !latestBySlot.has(String(s.slotId)));
  console.log(`recorded ${latestBySlot.size}/62 · open ${open.length}`);
  console.log('next open slots:', open.slice(0, 15).map(s => s.slotId).join(', ') || '(none)');
  process.exit(0);
}

const input = JSON.parse(arg) as Array<{ slotId: string; verdict: string; note?: string }>;
const refusals: string[] = [];
for (const r of input) {
  if (!byId.has(r.slotId)) refusals.push(`${r.slotId}: NOT_A_FROZEN_SLOT`);
  else if (!PERMITTED.includes(r.verdict)) {
    refusals.push(`${r.slotId}: VERDICT_NOT_PERMITTED (${r.verdict})`);
  }
}
if (refusals.length > 0) {
  console.log('§222 REFUSED — nothing was written:');
  for (const r of refusals) console.log('  ', r);
  process.exit(1);
}

let seq = existing.length;
const written: Entry[] = [];
for (const r of input) {
  const s = byId.get(r.slotId)!;
  const prior = latestBySlot.get(r.slotId);
  seq += 1;
  const entry: Entry = {
    seq,
    slotId: r.slotId,
    caseId: String(s.caseId),
    axis: String(s.axis),
    question: String(s.question),
    feedsGate: (s.feedsGate ?? null) as string | null,
    verdict: r.verdict,
    attribution: ATTRIBUTION,
    note: r.note ?? null,
    amends: prior === undefined ? null : prior.seq,
    recordedAt: new Date().toISOString(),
  };
  appendFileSync(LEDGER, `${JSON.stringify(entry)}\n`);
  latestBySlot.set(r.slotId, entry);
  written.push(entry);
}

const openSlots = slots.filter(s => !latestBySlot.has(String(s.slotId)));
writeFileSync(STATUS, JSON.stringify({
  artifact: 'SECTION-222-ADJUDICATION-STATUS',
  packetSha256: PACKET_SHA,
  frozenDigest221: FROZEN_DIGEST_221,
  slotsTotal: slots.length,
  slotsRecorded: latestBySlot.size,
  slotsOpen: openSlots.length,
  amendmentsRecorded: existing.concat(written).filter(e => e.amends !== null).length,
  everyRecordedJudgmentAttributedToProductOwner:
    existing.concat(written).every(e => e.attribution === ATTRIBUTION),
  gateOutcomesComputed: false,
  providerCallsDuringAdjudication: 0,
  databaseOperations: 0,
  updatedAt: new Date().toISOString(),
}, null, 2) + '\n');

console.log(`recorded ${written.length} judgment(s), attribution ${ATTRIBUTION}`
  + `${written.some(w => w.amends !== null) ? ' (includes amendment(s))' : ''}`);
console.log(`total recorded ${latestBySlot.size}/62 · remaining ${openSlots.length}`);
console.log('structural recording status: OK — append-only, packet identity unchanged');
