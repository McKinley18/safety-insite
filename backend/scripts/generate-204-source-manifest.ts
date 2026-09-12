/**
 * §204 -- CLOSURE SOURCE MANIFEST GENERATOR. DEVELOPMENT ONLY.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * Emits `verification/expert-hazlenz-successor-value-closure-2026-09-07/
 * SUCCESSOR-SOURCE-MANIFEST-204.json`: the frozen identity of the §204 closure contract
 * (`hazlenz.expert.204-successor-closure.v1`). Deterministic and idempotent, exactly as §203's
 * generator: actual file bytes, fixed §204-namespaced families, sorted keys, no timestamp.
 *
 * Ancestor pins cover BOTH ancestries: the five §203 successor modules (the direct ancestors this
 * contract composes onto) and the inherited §187/§192 pins, imported from the identity module and
 * never restated.
 */

import { createHash } from 'crypto';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';

import {
  CLOSURE_ANCESTOR_CONTRACT_VERSION, CLOSURE_ANCESTOR_PINS, CLOSURE_CONTRACT_VERSION,
  CLOSURE_MODULE_PLAN,
} from './lib/expert-204-closure-identity';

const REPO_ROOT = resolve(__dirname, '..', '..');
const EVIDENCE_DIR = join(
  REPO_ROOT, 'verification', 'expert-hazlenz-successor-value-closure-2026-09-07',
);
const MANIFEST_PATH = join(EVIDENCE_DIR, 'SUCCESSOR-SOURCE-MANIFEST-204.json');

/** The §204 successor glob families. Fixed here; a new family is a contract change. */
const FAMILY_PREFIXES = [
  'backend/scripts/lib/expert-204-',
  'backend/scripts/test-204-',
  'backend/scripts/verify-204-',
  'backend/scripts/generate-204-',
] as const;

const sha256OfFile = (absPath: string): string =>
  createHash('sha256').update(readFileSync(absPath)).digest('hex');

function enumerateClosureFiles(): string[] {
  const out: string[] = [];
  for (const dir of ['backend/scripts', 'backend/scripts/lib']) {
    for (const name of readdirSync(join(REPO_ROOT, dir))) {
      const rel = `${dir}/${name}`;
      if (!name.endsWith('.ts')) continue;
      if (FAMILY_PREFIXES.some(p => rel.startsWith(p))) out.push(rel);
    }
  }
  return out.sort();
}

function main(): void {
  const closureFiles = enumerateClosureFiles();
  const planned = new Set(CLOSURE_MODULE_PLAN.map(m => m.path));

  const closureSourceHashes: Record<string, string> = {};
  for (const rel of closureFiles) {
    closureSourceHashes[rel] = sha256OfFile(join(REPO_ROOT, rel));
  }

  const plannedButAbsent = CLOSURE_MODULE_PLAN
    .filter(m => !existsSync(join(REPO_ROOT, m.path)))
    .map(m => m.path)
    .sort();
  const unplannedPresent = closureFiles
    .filter(f => f.startsWith('backend/scripts/lib/expert-204-') && !planned.has(f))
    .sort();

  const ancestorPins: Record<string, { sha256: string; pinnedBy: string }> = {};
  for (const a of [...CLOSURE_ANCESTOR_PINS].sort((x, y) => x.path.localeCompare(y.path))) {
    ancestorPins[a.path] = { sha256: a.sha256, pinnedBy: a.pinnedBy };
  }

  const manifest = {
    artifact: 'SUCCESSOR-SOURCE-MANIFEST-204',
    closureContractVersion: CLOSURE_CONTRACT_VERSION,
    lineage: `${CLOSURE_ANCESTOR_CONTRACT_VERSION} -> ${CLOSURE_CONTRACT_VERSION}`,
    note: 'Frozen identity of the §204 closure contract. Ancestor hashes are recorded as '
      + 'ANCESTOR EVIDENCE covering both the §203 successor modules and the inherited §187/§192 '
      + 'pins -- they mirror, never replace, those freezes. Deterministic: no timestamp, sorted '
      + 'keys, actual file bytes.',
    closureSourceHashes,
    modulePlan: CLOSURE_MODULE_PLAN.map(m => ({
      path: m.path, lineage: m.lineage, composesOnto: m.composesOnto,
    })),
    plannedButAbsent,
    unplannedPresent,
    ancestorPins,
  };

  const payload = `${JSON.stringify(manifest, null, 2)}\n`;
  writeFileSync(MANIFEST_PATH, payload, 'utf8');

  process.stdout.write(`SUCCESSOR-SOURCE-MANIFEST-204 written: ${MANIFEST_PATH}\n`);
  process.stdout.write(`  closure files hashed  : ${closureFiles.length}\n`);
  process.stdout.write(`  ancestor pins recorded: ${CLOSURE_ANCESTOR_PINS.length}\n`);
  if (plannedButAbsent.length > 0) {
    process.stdout.write(`  PLANNED BUT ABSENT    : ${plannedButAbsent.join(', ')}\n`);
  }
  if (unplannedPresent.length > 0) {
    process.stdout.write(`  UNPLANNED lib modules : ${unplannedPresent.join(', ')}\n`);
  }
}

main();
