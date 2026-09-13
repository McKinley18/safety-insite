/**
 * §274 — RECOMPUTE THE SUCCESSOR CANDIDATE IDENTITY, AND REFUSE AN UNAUTHORISED DELTA. READ-ONLY.
 *
 * ZERO PROVIDER CALLS, ZERO DATABASE OPERATIONS, ZERO WRITES.
 *
 * §259 froze a candidate identity over twenty-two elements. §274 renamed the engine directory from
 * `src/safescope-v2/` to `src/hazlenz/`, which changed one comment line in each of two digested
 * files because both named that directory in prose. The identity is a digest over those elements,
 * so it moved. Pretending otherwise would have been the dishonest option.
 *
 * WHAT THIS COMMAND ADDS OVER SIMPLY RECORDING A NEW NUMBER. A successor identity is only
 * meaningful if something refuses to accept the wrong one. This recomputes all twenty-two elements
 * at the new paths and then asserts the SHAPE of the delta against §259:
 *
 *   - exactly two elements may differ, and only `adapter` and `envelope`;
 *   - every other element must be byte-identical to the frozen §259 value — including the contract
 *     version, the transmitted system prompt, the wire schema and the contract identities, which is
 *     what makes "prompts, schema, admission, verifier and settlement are unchanged" a checked
 *     statement rather than a claim;
 *   - for each differing element, the source diff against HEAD must be explicable by the authorised
 *     rename alone: every changed line, after `safescope-v2` -> `hazlenz`, must equal the new line.
 *
 * A semantic edit smuggled into either file would fail the third check even though the first two
 * would still pass, which is the point.
 */
import { execFileSync } from 'child_process';
import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';

import { DERIVATIONS } from './verify-262-candidate-identity';
import {
  EXPERT_CANDIDATE_IDENTITY_274, EXPERT_CANDIDATE_IDENTITY_259,
} from '../src/hazlenz/expert-hazlenz-product/expert-candidate-provenance';

const BACKEND = join(__dirname, '..');
const REPO = join(BACKEND, '..');
const FROZEN_259 = join(REPO, 'verification',
  'expert-hazlenz-259-carrier-coherence-2026-09-12', 'SECTION-259-SUCCESSOR-IDENTITY.json');

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

/** The only elements §274 authorises to move, and the files behind them. */
const AUTHORISED_DELTA: Readonly<Record<string, string>> = {
  adapter: 'src/hazlenz/expert-hazlenz-adapters/anthropic-expert-provider.ts',
  envelope: 'src/hazlenz/expert-hazlenz-adapters/expert-request-envelope.ts',
};
const OLD_PREFIX = 'src/safescope-v2/';
const NEW_PREFIX = 'src/hazlenz/';

/**
 * The pre-migration bytes, read at the RECORDED BASE COMMIT rather than at HEAD.
 *
 * Anchoring to HEAD would make this proof self-destructing: it would pass while the rename sat
 * uncommitted and fail forever after, because HEAD would then hold the new paths and the old ones
 * would not exist. A proof that only holds before the commit it certifies is not a proof.
 */
function baseBytes(newRelative: string): string | null {
  const migration = JSON.parse(readFileSync(join(REPO, 'verification', 'current',
    'SECTION-274-PATH-MIGRATION.json'), 'utf8')) as { preMigrationBaseCommit?: string };
  const base = migration.preMigrationBaseCommit;
  if (!base) return null;
  const oldRelative = newRelative.replace(NEW_PREFIX, OLD_PREFIX);
  try {
    return execFileSync('git', ['show', `${base}:backend/${oldRelative}`],
      { cwd: REPO, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  } catch { return null; }
}

/** Every changed line must be the old line with the authorised rename applied. Nothing else. */
function diffIsRenameOnly(newRelative: string): { ok: boolean; changed: number; unexplained: number } {
  const before = baseBytes(newRelative);
  if (before === null) return { ok: false, changed: -1, unexplained: -1 };
  const after = readFileSync(join(BACKEND, newRelative), 'utf8');
  const b = before.split('\n');
  const a = after.split('\n');
  if (b.length !== a.length) return { ok: false, changed: -1, unexplained: -1 };
  let changed = 0; let unexplained = 0;
  for (let i = 0; i < b.length; i += 1) {
    if (b[i] === a[i]) continue;
    changed += 1;
    if (b[i].split('safescope-v2').join('hazlenz') !== a[i]) unexplained += 1;
  }
  return { ok: unexplained === 0, changed, unexplained };
}

function main(): void {
  const frozen = JSON.parse(readFileSync(FROZEN_259, 'utf8')) as {
    elements: { element: string; value: string }[];
    successorCandidateIdentity259: string;
  };

  console.log('\n§274 successor candidate identity — read-only, 0 provider calls\n');

  let failures = 0;
  const lines: string[] = [];
  const moved: string[] = [];
  for (const element of frozen.elements) {
    const derive = (DERIVATIONS as Record<string, () => string>)[element.element];
    if (!derive) { failures += 1; console.log(`FAIL  ${element.element} has no derivation`); continue; }
    const value = derive();
    lines.push(`${element.element}=${value}`);
    if (value === element.value) continue;
    moved.push(element.element);
    if (!(element.element in AUTHORISED_DELTA)) {
      failures += 1;
      console.log(`FAIL  ${element.element.padEnd(28)} moved, and §274 authorises no change here`);
    }
  }

  console.log(`  elements recomputed              ${frozen.elements.length}`);
  console.log(`  elements identical to §259       ${frozen.elements.length - moved.length}`);
  console.log(`  elements moved                   ${moved.length}  [${moved.join(', ')}]`);

  // The semantic core must be untouched, stated as a check rather than a claim.
  const SEMANTIC = ['contractVersion', 'systemPrompt', 'wireSchema', 'contractIdentities259'];
  for (const key of SEMANTIC) {
    const same = !moved.includes(key);
    console.log(`  ${key.padEnd(32)} ${same ? 'UNCHANGED' : 'CHANGED — FAIL'}`);
    if (!same) failures += 1;
  }

  for (const [element, file] of Object.entries(AUTHORISED_DELTA)) {
    if (!moved.includes(element)) { console.log(`  ${element.padEnd(32)} unchanged`); continue; }
    const d = diffIsRenameOnly(file);
    console.log(`  ${element.padEnd(32)} ${d.changed} changed line(s), `
      + `${d.unexplained} unexplained ${d.ok ? '— PATH-RENAME-ONLY' : '— FAIL'}`);
    if (!d.ok) failures += 1;
  }

  const successor = sha(lines.join('\n'));
  console.log(`\n  predecessor §259 identity  ${frozen.successorCandidateIdentity259}`);
  console.log(`  recomputed successor       ${successor}`);
  console.log(`  compiled-in successor      ${EXPERT_CANDIDATE_IDENTITY_274}`);
  console.log(`  compiled-in predecessor    ${EXPERT_CANDIDATE_IDENTITY_259}`);

  if (successor !== EXPERT_CANDIDATE_IDENTITY_274) {
    failures += 1;
    console.log('FAIL  the compiled-in successor does not equal the recomputation');
  }
  if (EXPERT_CANDIDATE_IDENTITY_259 !== frozen.successorCandidateIdentity259) {
    failures += 1;
    console.log('FAIL  the retained predecessor constant no longer equals the frozen §259 artifact');
  }

  console.log(JSON.stringify({
    providerCalls: 0, databaseOperations: 0, filesWritten: 0,
    elementsChecked: frozen.elements.length, elementsMoved: moved.length,
    predecessor: frozen.successorCandidateIdentity259, successor, failures,
  }));

  if (failures > 0) { console.log('\nSUCCESSOR IDENTITY FAIL\n'); process.exit(1); }
  console.log('\nSUCCESSOR IDENTITY VERIFIED — delta is the authorised path rename only\n');
}

if (require.main === module) main();
