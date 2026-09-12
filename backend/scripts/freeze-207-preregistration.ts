/**
 * §207 -- FREEZE THE PREREGISTRATION RECORD.
 *
 * WRITES ONE FILE. MAKES ZERO PROVIDER CALLS AND ZERO DATABASE OPERATIONS. EXECUTES NOTHING.
 *
 * Idempotent by construction: the payload carries no timestamp, so re-running reproduces the same
 * `payloadSha256`. If an existing record is present and its digest differs, this script REFUSES
 * rather than overwriting — an immutable record that a script silently replaces is not immutable.
 * Pass --allow-refreeze to replace it deliberately, which is the amendment path and must be
 * accompanied by a new pin in `expert-207-execution-gate.ts`.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';

import {
  PREREGISTRATION_FILE, SECTION_207_DIR,
  buildPreregistrationRecord, canonicalise, preregistrationIdentity, sha256Hex,
  verifyPreregistrationRecord,
} from './lib/expert-207-preregistration';

const repoRoot = join(__dirname, '..', '..');
const outPath = join(repoRoot, 'verification', SECTION_207_DIR, PREREGISTRATION_FILE);
const allowRefreeze = process.argv.includes('--allow-refreeze');

const identity = preregistrationIdentity();
console.log(`§207 preregistration identity (sha256 of canonical payload):\n  ${identity}\n`);

if (existsSync(outPath) && !allowRefreeze) {
  const existing = JSON.parse(readFileSync(outPath, 'utf8')) as {
    envelope?: { payloadSha256?: string };
  };
  const recorded = existing.envelope?.payloadSha256;
  if (recorded === identity) {
    console.log(`already frozen with this identity at ${outPath} — nothing to do`);
    process.exit(0);
  }
  console.error(
    `REFUSING TO OVERWRITE. ${outPath} exists with identity ${recorded ?? 'none'}, which differs `
    + `from the current source identity ${identity}. Re-freezing is an AMENDMENT: it needs a `
    + 'recorded reason, a new pin in expert-207-execution-gate.ts, and --allow-refreeze.');
  process.exit(1);
}

const record = buildPreregistrationRecord(new Date().toISOString());
const verification = verifyPreregistrationRecord(record);
if (verification.code !== 'VERIFIED') {
  console.error(`ABORT: the record does not verify against its own source: ${verification.code}`);
  process.exit(1);
}

mkdirSync(dirname(outPath), { recursive: true });
const serialised = `${JSON.stringify(record, null, 2)}\n`;
writeFileSync(outPath, serialised, 'utf8');

console.log(`wrote ${outPath}`);
console.log(`  file bytes        : ${Buffer.byteLength(serialised, 'utf8')}`);
console.log(`  file sha256       : ${sha256Hex(serialised)}`);
console.log(`  payload sha256    : ${record.envelope.payloadSha256}`);
console.log(`  canonical bytes   : ${Buffer.byteLength(canonicalise(record.payload), 'utf8')}`);
console.log('\nPIN THIS IN expert-207-execution-gate.ts:');
console.log(`  EXPECTED_PREREGISTRATION_IDENTITY = '${identity}'`);
console.log('\nprovider calls: 0   database operations: 0   cohort authorized: NO');
