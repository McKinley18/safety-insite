/**
 * §204 -- RAW-NUL TEXT INTEGRITY GATE. DEVELOPMENT ONLY.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * Same contract as §203's gate: reads FILE BYTES via fs (never grep, never a text decode) across
 * every §204 file -- the four closure script families plus every file in the §204 evidence
 * directory -- and fails with exit 1 and a per-file byte-offset report on any 0x00 byte. A gate
 * that cannot read its target, or that matches zero targets, FAILS rather than passing silently.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';

const REPO_ROOT = resolve(__dirname, '..', '..');
const EVIDENCE_DIR = join(
  REPO_ROOT, 'verification', 'expert-hazlenz-successor-value-closure-2026-09-07',
);

const FAMILY_PREFIXES = [
  'backend/scripts/lib/expert-204-',
  'backend/scripts/test-204-',
  'backend/scripts/verify-204-',
  'backend/scripts/generate-204-',
] as const;

const report = (line: string): void => { process.stdout.write(`${line}\n`); };

function targets(): string[] {
  const out: string[] = [];
  for (const dir of ['backend/scripts', 'backend/scripts/lib']) {
    for (const name of readdirSync(join(REPO_ROOT, dir))) {
      const rel = `${dir}/${name}`;
      if (name.endsWith('.ts') && FAMILY_PREFIXES.some(p => rel.startsWith(p))) {
        out.push(join(REPO_ROOT, rel));
      }
    }
  }
  const walk = (dir: string): void => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p);
      else out.push(p);
    }
  };
  try {
    walk(EVIDENCE_DIR);
  } catch {
    report(`EVIDENCE_DIR_UNREADABLE: ${EVIDENCE_DIR}`);
    report('RESULT: FAIL -- a gate that cannot read its target must fail, not pass');
    process.exit(1);
  }
  return out.sort();
}

function main(): void {
  report('=== verify-204-text-integrity (raw 0x00 byte gate) ===');
  const files = targets();
  if (files.length === 0) {
    report('NO_TARGETS_FOUND: zero §204 files matched. An empty scan proves nothing.');
    report('RESULT: FAIL');
    process.exit(1);
  }

  let violations = 0;
  for (const f of files) {
    let bytes: Buffer;
    try {
      bytes = readFileSync(f);
    } catch {
      report(`  UNREADABLE ${f}`);
      violations += 1;
      continue;
    }
    const offsets: number[] = [];
    for (let i = 0; i < bytes.length; i += 1) {
      if (bytes[i] === 0) offsets.push(i);
    }
    if (offsets.length > 0) {
      violations += 1;
      report(`  RAW_NUL ${f} -- ${offsets.length} zero byte(s) at offset(s) `
        + `${offsets.slice(0, 16).join(', ')}${offsets.length > 16 ? ', ...' : ''}`);
    }
  }

  report(`files scanned (byte-safe): ${files.length}`);
  report(`files in violation       : ${violations}`);
  if (violations > 0) {
    report('RESULT: FAIL -- raw 0x00 bytes are forbidden in §204 artifacts');
    process.exit(1);
  }
  report('RESULT: PASS -- no raw NUL byte in any §204 file');
}

main();
