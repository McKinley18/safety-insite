/**
 * §203 -- SUCCESSOR SOURCE INTEGRITY GATE. DEVELOPMENT ONLY.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * Recomputes every hash in `SUCCESSOR-SOURCE-MANIFEST.json` from actual file bytes and fails
 * loudly on ANY divergence. Two distinct failure classes, reported separately:
 *
 *   SUCCESSOR_DRIFT  a §203 successor file changed, appeared, or vanished since the manifest froze
 *   ANCESTOR_DRIFT   a §187/§192-pinned ancestor file no longer matches its frozen hash
 *
 * FAIL-CLOSED RULES (the project's audit standard: a check that cannot read its target must fail
 * visibly; silence and success are never the same observable outcome):
 *   - manifest absent            -> MANIFEST_ABSENT, exit 1 (not a pass)
 *   - manifest unparseable       -> MANIFEST_UNREADABLE, exit 1
 *   - any listed file unreadable -> counted as drift for its class, exit 1, per-file report
 *   - a successor-family file on disk that the manifest does not list -> SUCCESSOR_DRIFT (UNLISTED)
 */

import { createHash } from 'crypto';
import { readFileSync, readdirSync } from 'fs';
import { join, resolve } from 'path';

const REPO_ROOT = resolve(__dirname, '..', '..');
const MANIFEST_PATH = join(
  REPO_ROOT, 'verification', 'expert-hazlenz-successor-boundary-hardening-2026-09-07',
  'SUCCESSOR-SOURCE-MANIFEST.json',
);

const FAMILY_PREFIXES = [
  'backend/scripts/lib/expert-203-',
  'backend/scripts/test-203-',
  'backend/scripts/verify-203-',
  'backend/scripts/generate-203-',
] as const;

const problems: string[] = [];
let checked = 0;

const report = (line: string): void => { process.stdout.write(`${line}\n`); };

function sha256OrNull(absPath: string): string | null {
  try {
    return createHash('sha256').update(readFileSync(absPath)).digest('hex');
  } catch {
    return null;
  }
}

function verifyClass(
  label: 'SUCCESSOR_DRIFT' | 'ANCESTOR_DRIFT', expected: Record<string, string>,
): void {
  for (const [rel, want] of Object.entries(expected).sort(([a], [b]) => a.localeCompare(b))) {
    checked += 1;
    const got = sha256OrNull(join(REPO_ROOT, rel));
    if (got === null) {
      problems.push(`${label} UNREADABLE ${rel} -- expected ${want}, file cannot be read`);
    } else if (got !== want) {
      problems.push(`${label} MISMATCH ${rel}\n    expected ${want}\n    actual   ${got}`);
    }
  }
}

function main(): void {
  report('=== verify-203-source-integrity ===');

  let raw: string;
  try {
    raw = readFileSync(MANIFEST_PATH, 'utf8');
  } catch {
    report(`MANIFEST_ABSENT: ${MANIFEST_PATH}`);
    report('The successor contract has no frozen manifest. This gate FAILS until the orchestrator');
    report('runs generate-203-source-manifest.ts at implementation freeze. An absent manifest is');
    report('never a pass.');
    report('RESULT: FAIL (MANIFEST_ABSENT)');
    process.exit(1);
  }

  let manifest: {
    successorSourceHashes?: Record<string, string>;
    ancestorPins?: Record<string, { sha256: string }>;
  };
  try {
    manifest = JSON.parse(raw);
  } catch (e) {
    report(`MANIFEST_UNREADABLE: ${MANIFEST_PATH} -- ${String(e)}`);
    report('RESULT: FAIL (MANIFEST_UNREADABLE)');
    process.exit(1);
  }

  const successor = manifest.successorSourceHashes ?? {};
  const ancestors = Object.fromEntries(
    Object.entries(manifest.ancestorPins ?? {}).map(([p, v]) => [p, v.sha256]),
  );
  if (Object.keys(successor).length === 0 || Object.keys(ancestors).length === 0) {
    report('MANIFEST_UNREADABLE: successorSourceHashes or ancestorPins missing/empty');
    report('RESULT: FAIL (MANIFEST_UNREADABLE)');
    process.exit(1);
  }

  verifyClass('SUCCESSOR_DRIFT', successor);
  verifyClass('ANCESTOR_DRIFT', ancestors);

  // A successor-family file on disk that the manifest never froze is drift too.
  for (const dir of ['backend/scripts', 'backend/scripts/lib']) {
    let names: string[];
    try {
      names = readdirSync(join(REPO_ROOT, dir));
    } catch {
      problems.push(`SUCCESSOR_DRIFT UNREADABLE ${dir} -- directory cannot be enumerated`);
      continue;
    }
    for (const name of names) {
      const rel = `${dir}/${name}`;
      if (!name.endsWith('.ts')) continue;
      if (!FAMILY_PREFIXES.some(p => rel.startsWith(p))) continue;
      if (!(rel in successor)) {
        problems.push(`SUCCESSOR_DRIFT UNLISTED ${rel} -- exists on disk, absent from the manifest`);
      }
    }
  }

  report(`files checked          : ${checked}`);
  report(`successor drift        : ${problems.filter(p => p.startsWith('SUCCESSOR_DRIFT')).length}`);
  report(`ancestor drift         : ${problems.filter(p => p.startsWith('ANCESTOR_DRIFT')).length}`);
  if (problems.length > 0) {
    for (const p of problems) report(`  ${p}`);
    report('RESULT: FAIL');
    process.exit(1);
  }
  report('RESULT: PASS -- successor contract and frozen ancestry both byte-identical');
}

main();
