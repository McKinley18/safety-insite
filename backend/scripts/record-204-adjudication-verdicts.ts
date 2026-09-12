/**
 * §204 LANE A — ADDITIVE PRODUCT-OWNER VERDICT RECORDER.
 *
 * Records product-owner-supplied semantic verdicts into a §204 RUNNING COPY of the §202
 * adjudication worksheet. The §202 worksheet file is IMMUTABLE HISTORICAL EVIDENCE and is never
 * written; on first run it is seeded (byte-verified thereafter) into the §204 evidence directory,
 * and every subsequent batch applies to the running copy. All writes go through the §202
 * machinery — `recordVerdict` / `recordAdditive` from `expert-202-adjudication-grouping.ts` —
 * so every §202 refusal (non-PRODUCT_OWNER attribution, structural slots, vocabulary,
 * conflicting revision) holds verbatim here. This script adds NO second entry point: it is a
 * transport for product-owner answers, and it exits non-zero if ANY entry is refused.
 *
 * Usage: ts-node scripts/record-204-adjudication-verdicts.ts <batch.json>
 *   batch.json: {
 *     "batchId": string,
 *     "verdicts":  [{ "slotId": string, "verdict": string, "revision"?: true }],
 *     "additives": [{ "unitId": string, "field": "truthSpecificationDefect" | "reviewerNotes",
 *                     "text": string }]
 *   }
 * Every verdict/additive in a batch must be a product-owner-supplied judgment. No model-authored
 * verdict is representable (asserted by the underlying machinery and by test).
 */
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import {
  type Worksheet202, recordVerdict, recordAdditive,
} from './lib/expert-202-adjudication-grouping';

const REPO = path.resolve(__dirname, '..', '..');
const SECTION_202_WORKSHEET = path.join(
  REPO, 'verification/expert-hazlenz-governed-stage-integration-2026-09-07/ADJUDICATION-WORKSHEET-202.json');
const EVIDENCE_DIR = path.join(
  REPO, 'verification/expert-hazlenz-semantic-adjudication-204-2026-09-07');
const RUNNING = path.join(EVIDENCE_DIR, 'ADJUDICATION-WORKSHEET-204.json');
const SEED_RECORD = path.join(EVIDENCE_DIR, 'SEED-RECORD.json');
const LEDGER = path.join(EVIDENCE_DIR, 'VERDICT-LEDGER-204.jsonl');

const sha256 = (b: Buffer): string => crypto.createHash('sha256').update(b).digest('hex');
const fail = (msg: string): never => { console.error(`RECORD-204 FAIL: ${msg}`); process.exit(1); };

const batchPath = process.argv[2];
if (!batchPath) fail('no batch file supplied');
const batch = JSON.parse(fs.readFileSync(batchPath, 'utf8')) as {
  batchId: string;
  verdicts?: { slotId: string; verdict: string; revision?: true }[];
  additives?: { unitId: string; field: 'truthSpecificationDefect' | 'reviewerNotes'; text: string }[];
};
if (typeof batch.batchId !== 'string' || batch.batchId.length === 0) fail('batch.batchId missing');

// -- seed or load the running copy; the §202 file itself is never written and must not drift
const section202Bytes = fs.readFileSync(SECTION_202_WORKSHEET);
const section202Sha = sha256(section202Bytes);
fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
if (!fs.existsSync(RUNNING)) {
  fs.writeFileSync(RUNNING, section202Bytes);
  fs.writeFileSync(SEED_RECORD, JSON.stringify({
    seededFrom: path.relative(REPO, SECTION_202_WORKSHEET),
    seededFromSha256: section202Sha,
    seededAt: new Date().toISOString(),
    note: 'The §202 worksheet is immutable evidence; this §204 running copy is the additive '
      + 'adjudication surface. recordVerdict/recordAdditive semantics are §202\'s, unmodified.',
  }, null, 2) + '\n');
} else {
  const seed = JSON.parse(fs.readFileSync(SEED_RECORD, 'utf8')) as { seededFromSha256: string };
  if (seed.seededFromSha256 !== section202Sha) {
    fail('the immutable §202 worksheet no longer matches the recorded seed hash — investigate '
      + `before recording anything (recorded ${seed.seededFromSha256}, current ${section202Sha})`);
  }
}

const worksheet = JSON.parse(fs.readFileSync(RUNNING, 'utf8')) as Worksheet202;
const recordedAt = new Date().toISOString();
const ledgerLines: string[] = [];
let applied = 0;

for (const v of batch.verdicts ?? []) {
  const r = recordVerdict(worksheet, v.slotId, v.verdict, 'PRODUCT_OWNER',
    { recordedAt, revision: v.revision === true });
  if (!('ok' in r) || r.ok !== true) {
    fail(`verdict refused for ${v.slotId}: ${(r as { refusalCode?: string }).refusalCode} — `
      + `${(r as { detail?: string }).detail}`);
  }
  applied += 1;
  ledgerLines.push(JSON.stringify({
    kind: 'VERDICT', batchId: batch.batchId, slotId: v.slotId, verdict: v.verdict,
    attribution: 'PRODUCT_OWNER', recordedAt,
  }));
}
for (const a of batch.additives ?? []) {
  const r = recordAdditive(worksheet, a.unitId, a.field, a.text, 'PRODUCT_OWNER');
  if (!('ok' in (r as object)) || (r as { ok: boolean }).ok !== true) {
    fail(`additive refused for ${a.unitId}.${a.field}: ${JSON.stringify(r)}`);
  }
  ledgerLines.push(JSON.stringify({
    kind: 'ADDITIVE', batchId: batch.batchId, unitId: a.unitId, field: a.field, text: a.text,
    attribution: 'PRODUCT_OWNER', recordedAt,
  }));
}

fs.writeFileSync(RUNNING, JSON.stringify(worksheet, null, 2) + '\n');
fs.appendFileSync(LEDGER, ledgerLines.map(l => l + '\n').join(''));

const c = worksheet.completeness;
console.log('RECORD-204 OK');
console.log(`  batch                : ${batch.batchId}`);
console.log(`  applied this batch   : ${applied} verdict(s), ${(batch.additives ?? []).length} additive(s)`);
console.log(`  SUPPLIED             : ${c.supplied} / 120`);
console.log(`  REMAINING            : ${c.remaining} / 120`);
console.log(`  supplementary        : ${c.supplementarySupplied} / ${c.supplementaryTotalSlots} (separate, not in the 120)`);
