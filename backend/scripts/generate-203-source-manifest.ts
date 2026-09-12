/**
 * §203 -- SUCCESSOR SOURCE MANIFEST GENERATOR. DEVELOPMENT ONLY.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * Emits `verification/expert-hazlenz-successor-boundary-hardening-2026-09-07/
 * SUCCESSOR-SOURCE-MANIFEST.json`, the §203 analogue of §187's `owedFactSourceHashes`: the frozen
 * identity of the successor development contract. Run by the ORCHESTRATOR ONLY, after
 * implementation freeze. Deterministic and idempotent: hashes are computed from actual file bytes,
 * files are enumerated by fixed §203-namespaced glob families, output key order is sorted, and no
 * timestamp enters the payload, so re-running over unchanged sources reproduces the identical file.
 *
 * The ancestor pins are recorded ALONGSIDE (never instead of) the §187 pins they mirror, labelled
 * as ancestor evidence, so `verify-203-source-integrity.ts` can distinguish SUCCESSOR drift from
 * ANCESTOR drift and report them as different failure classes.
 */

import { createHash } from 'crypto';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';

import {
  ANCESTOR_PINS, SUCCESSOR_CONTRACT_VERSION, SUCCESSOR_MODULE_PLAN,
} from './lib/expert-203-successor-identity';

const REPO_ROOT = resolve(__dirname, '..', '..');
const EVIDENCE_DIR = join(
  REPO_ROOT, 'verification', 'expert-hazlenz-successor-boundary-hardening-2026-09-07',
);
const MANIFEST_PATH = join(EVIDENCE_DIR, 'SUCCESSOR-SOURCE-MANIFEST.json');

/** The four §203 successor glob families. Fixed here; a new family is a contract change. */
const FAMILY_PREFIXES = [
  'backend/scripts/lib/expert-203-',
  'backend/scripts/test-203-',
  'backend/scripts/verify-203-',
  'backend/scripts/generate-203-',
] as const;

const sha256OfFile = (absPath: string): string =>
  createHash('sha256').update(readFileSync(absPath)).digest('hex');

function enumerateSuccessorFiles(): string[] {
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
  const successorFiles = enumerateSuccessorFiles();
  const planned = new Set(SUCCESSOR_MODULE_PLAN.map(m => m.path));

  const successorSourceHashes: Record<string, string> = {};
  for (const rel of successorFiles) {
    successorSourceHashes[rel] = sha256OfFile(join(REPO_ROOT, rel));
  }

  const plannedButAbsent = SUCCESSOR_MODULE_PLAN
    .filter(m => !existsSync(join(REPO_ROOT, m.path)))
    .map(m => m.path)
    .sort();
  const unplannedPresent = successorFiles
    .filter(f => f.startsWith('backend/scripts/lib/expert-203-') && !planned.has(f))
    .sort();

  const ancestorPins: Record<string, { sha256: string; pinnedBy: string }> = {};
  for (const a of [...ANCESTOR_PINS].sort((x, y) => x.path.localeCompare(y.path))) {
    ancestorPins[a.path] = { sha256: a.sha256, pinnedBy: a.pinnedBy };
  }

  const manifest = {
    artifact: 'SUCCESSOR-SOURCE-MANIFEST',
    successorContractVersion: SUCCESSOR_CONTRACT_VERSION,
    note: 'Frozen identity of the §203 successor development contract. Ancestor hashes are '
      + 'recorded as ANCESTOR EVIDENCE and mirror -- never replace -- the §187/§192 pins. '
      + 'Deterministic: no timestamp, sorted keys, actual file bytes.',
    successorSourceHashes,
    lineage: SUCCESSOR_MODULE_PLAN.map(m => ({
      path: m.path, lineage: m.lineage, ancestorPath: m.ancestorPath, owner: m.owner,
    })),
    plannedButAbsent,
    unplannedPresent,
    ancestorPins,
  };

  const payload = `${JSON.stringify(manifest, null, 2)}\n`;
  writeFileSync(MANIFEST_PATH, payload, 'utf8');

  process.stdout.write(`SUCCESSOR-SOURCE-MANIFEST written: ${MANIFEST_PATH}\n`);
  process.stdout.write(`  successor files hashed : ${successorFiles.length}\n`);
  process.stdout.write(`  ancestor pins recorded : ${ANCESTOR_PINS.length}\n`);
  if (plannedButAbsent.length > 0) {
    process.stdout.write(`  PLANNED BUT ABSENT     : ${plannedButAbsent.join(', ')}\n`);
  }
  if (unplannedPresent.length > 0) {
    process.stdout.write(`  UNPLANNED lib modules  : ${unplannedPresent.join(', ')}\n`);
  }
}

main();
