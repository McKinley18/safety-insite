/**
 * §204 -- CLOSURE SOURCE INTEGRITY GATE. DEVELOPMENT ONLY.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * Recomputes every hash in `SUCCESSOR-SOURCE-MANIFEST-204.json` from actual file bytes and fails
 * loudly on ANY divergence. Two distinct failure classes, reported separately:
 *
 *   CLOSURE_DRIFT   a §204 closure file changed, appeared, or vanished since the manifest froze
 *   ANCESTOR_DRIFT  a §203 successor module OR a §187/§192-pinned ancestor no longer matches
 *
 * FAIL-CLOSED RULES (the project's audit standard): manifest absent -> MANIFEST_ABSENT exit 1;
 * manifest unparseable -> MANIFEST_UNREADABLE exit 1; any listed file unreadable -> drift for its
 * class; a §204-family file on disk that the manifest does not list -> CLOSURE_DRIFT (UNLISTED).
 */

import { createHash } from 'crypto';
import { readFileSync, readdirSync } from 'fs';
import { join, resolve } from 'path';

const REPO_ROOT = resolve(__dirname, '..', '..');
const MANIFEST_PATH = join(
  REPO_ROOT, 'verification', 'expert-hazlenz-successor-value-closure-2026-09-07',
  'SUCCESSOR-SOURCE-MANIFEST-204.json',
);

const FAMILY_PREFIXES = [
  'backend/scripts/lib/expert-204-',
  'backend/scripts/test-204-',
  'backend/scripts/verify-204-',
  'backend/scripts/generate-204-',
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
  label: 'CLOSURE_DRIFT' | 'ANCESTOR_DRIFT', expected: Record<string, string>,
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
  report('=== verify-204-source-integrity ===');

  let raw: string;
  try {
    raw = readFileSync(MANIFEST_PATH, 'utf8');
  } catch {
    report(`MANIFEST_ABSENT: ${MANIFEST_PATH}`);
    report('The closure contract has no frozen manifest. This gate FAILS until');
    report('generate-204-source-manifest.ts runs at implementation freeze. An absent manifest is');
    report('never a pass.');
    report('RESULT: FAIL (MANIFEST_ABSENT)');
    process.exit(1);
  }

  let manifest: {
    closureSourceHashes?: Record<string, string>;
    ancestorPins?: Record<string, { sha256: string }>;
  };
  try {
    manifest = JSON.parse(raw);
  } catch (e) {
    report(`MANIFEST_UNREADABLE: ${MANIFEST_PATH} -- ${String(e)}`);
    report('RESULT: FAIL (MANIFEST_UNREADABLE)');
    process.exit(1);
  }

  const closure = manifest.closureSourceHashes ?? {};
  const ancestors = Object.fromEntries(
    Object.entries(manifest.ancestorPins ?? {}).map(([p, v]) => [p, v.sha256]),
  );
  if (Object.keys(closure).length === 0 || Object.keys(ancestors).length === 0) {
    report('MANIFEST_UNREADABLE: closureSourceHashes or ancestorPins missing/empty');
    report('RESULT: FAIL (MANIFEST_UNREADABLE)');
    process.exit(1);
  }

  verifyClass('CLOSURE_DRIFT', closure);
  verifyClass('ANCESTOR_DRIFT', ancestors);

  for (const dir of ['backend/scripts', 'backend/scripts/lib']) {
    let names: string[];
    try {
      names = readdirSync(join(REPO_ROOT, dir));
    } catch {
      problems.push(`CLOSURE_DRIFT UNREADABLE ${dir} -- directory cannot be enumerated`);
      continue;
    }
    for (const name of names) {
      const rel = `${dir}/${name}`;
      if (!name.endsWith('.ts')) continue;
      if (!FAMILY_PREFIXES.some(p => rel.startsWith(p))) continue;
      if (!(rel in closure)) {
        problems.push(`CLOSURE_DRIFT UNLISTED ${rel} -- exists on disk, absent from the manifest`);
      }
    }
  }

  report(`files checked          : ${checked}`);
  report(`closure drift          : ${problems.filter(p => p.startsWith('CLOSURE_DRIFT')).length}`);
  report(`ancestor drift         : ${problems.filter(p => p.startsWith('ANCESTOR_DRIFT')).length}`);
  if (problems.length > 0) {
    for (const p of problems) report(`  ${p}`);
    report('RESULT: FAIL');
    process.exit(1);
  }
  report('RESULT: PASS -- closure contract and both frozen ancestries byte-identical');
}

main();
