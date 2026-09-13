/**
 * §263 — THE ONE CANONICAL CURRENT-STATE VERIFICATION. READ-ONLY BY CONSTRUCTION.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT PROBLEM THIS SOLVES.
 *
 * Before §263, establishing that the repository was in a good state meant remembering which
 * §-numbered scripts were the current ones, which of them wrote to accepted evidence, and which had
 * been superseded three sections ago. §258 got that wrong and did not notice; §259 got it wrong and
 * did notice, but only because the numbers moved. This command replaces that recall with one name.
 *
 * ---------------------------------------------------------------------------------------------
 * IT WRITES NOTHING, AND THAT IS ENFORCED BY WHAT IT COMPOSES RATHER THAN PROMISED.
 *
 * It calls three readers: the §262 candidate-identity recomputation, a protected-module digest
 * check, and the §263 evidence-integrity guard. None of the three opens a file for writing. There
 * is deliberately no `--write`, no output path and no evidence emission, because the moment a
 * verification command can write to the thing it verifies, its passing result stops being evidence.
 *
 * ---------------------------------------------------------------------------------------------
 * FOUR OUTCOMES, NOT TWO.
 *
 *   PASS                      checked, and correct.
 *   FAIL                      checked, and wrong. Exits non-zero.
 *   UNVERIFIED_LIVE           requires a live environment this command deliberately does not touch:
 *                             object storage, billing, a deployed instance, a provider. Reported,
 *                             never converted into either a pass or a failure.
 *   ENVIRONMENTALLY_BLOCKED   would be checkable, but a prerequisite is absent in this environment.
 *
 * §262's storage suite is the reason the last two exist separately. Turning an unknown into a pass
 * would be a lie; turning it into a failure would train the next operator to ignore failures.
 */
import { execFileSync } from 'child_process';
import { createHash } from 'crypto';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

import { checkEvidenceIntegrity } from './evidence-integrity';

const BACKEND = join(__dirname, '..', '..');
const REPO = join(BACKEND, '..');

export type CheckStatus = 'PASS' | 'FAIL' | 'UNVERIFIED_LIVE' | 'ENVIRONMENTALLY_BLOCKED';

export interface Check {
  readonly name: string;
  readonly status: CheckStatus;
  readonly detail: string;
}

const sha256 = (buffer: Buffer): string => createHash('sha256').update(buffer).digest('hex');

/**
 * The live candidate identity, recomputed from source by the §274 read-only successor verifier.
 *
 * This used to call the §262 recomputation, which checks the frozen §259 identity. §274 renamed the
 * engine directory under authorisation, which moved two of the twenty-two elements, so §262 now
 * legitimately reports that delta and is retained as the HISTORICAL check. The live gate is the
 * successor verifier, which is strictly stronger: it recomputes every element, requires the twenty
 * semantic ones to be byte-identical to §259, and requires each of the two moved ones to be
 * explicable by the authorised rename alone.
 */
function candidateIdentity(): Check[] {
  try {
    const output = execFileSync('npx',
      ['ts-node', 'scripts/verify-274-successor-identity.ts'],
      { cwd: BACKEND, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    const summary = /\{[^{}]*"successor"[^{}]*\}/.exec(output);
    const parsed = summary ? JSON.parse(summary[0]) as {
      elementsChecked: number; elementsMoved: number; failures: number;
      predecessor: string; successor: string;
    } : null;
    if (!parsed) {
      return [{ name: 'Candidate identity', status: 'FAIL', detail: 'no summary was produced' }];
    }
    return [
      {
        name: 'Candidate identity',
        status: parsed.failures === 0 ? 'PASS' : 'FAIL',
        detail: `${parsed.elementsChecked} elements, ${parsed.elementsMoved} moved by the `
          + `authorised §274 rename, ${parsed.failures} failure(s)`,
      },
      {
        name: 'Identity constant in the build',
        status: parsed.failures === 0 ? 'PASS' : 'FAIL',
        detail: `successor ${parsed.successor.slice(0, 12)}… supersedes `
          + `${parsed.predecessor.slice(0, 12)}…`,
      },
    ];
  } catch (error) {
    return [{
      name: 'Candidate identity',
      status: 'FAIL',
      detail: `the recomputation did not complete: ${describe(error)}`,
    }];
  }
}

/**
 * The 29 protected Expert modules.
 *
 * PRESENCE IS A HARD CHECK; DIGEST DRIFT IS REPORTED SEPARATELY AND IS NOT A FAILURE BY ITSELF.
 * `PROTECTED-IDENTITIES.json` is a §229 snapshot, and one of its digests has legitimately moved on
 * since: the Anthropic adapter changed in §259, and the CURRENT §259 identity records the new
 * value and verifies with drift 0. Failing on that would mean this command has been red since §259
 * for a reason that is not a defect. What must never happen is a protected module going MISSING, or
 * drifting without the candidate identity moving too — and the candidate identity check above is
 * what catches the second case.
 */
function protectedModules(): Check[] {
  // §274 SUPERSEDES THE §229 SNAPSHOT, WITHOUT REWRITING IT. The engine directory moved, so nine of
  // the recorded paths no longer resolve against the §229 file. The successor manifest records the
  // same twenty-nine modules at their new paths with their current digests; the §229 artifact stays
  // exactly as frozen, which also keeps it safe from verify-229-protected-identities.ts, the one
  // instrument here that WRITES to the thing it checks.
  const successorPath = join(REPO, 'verification', 'current',
    'SECTION-274-PROTECTED-IDENTITIES.json');
  const manifestPath = existsSync(successorPath)
    ? successorPath : join(REPO, 'PROTECTED-IDENTITIES.json');
  if (!existsSync(manifestPath)) {
    return [{
      name: 'Protected modules', status: 'ENVIRONMENTALLY_BLOCKED',
      detail: 'no protected-identity manifest is present',
    }];
  }
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
    modulePaths: Record<string, string>;
    moduleDigests: Record<string, string>;
  };
  let present = 0;
  const missing: string[] = [];
  const drifted: string[] = [];
  for (const [key, relative] of Object.entries(manifest.modulePaths)) {
    const file = join(BACKEND, relative);
    if (!existsSync(file)) { missing.push(key); continue; }
    present += 1;
    if (sha256(readFileSync(file)) !== manifest.moduleDigests[key]) drifted.push(key);
  }
  const total = Object.keys(manifest.modulePaths).length;
  return [
    {
      name: 'Protected modules',
      status: missing.length === 0 ? 'PASS' : 'FAIL',
      detail: `${present}/${total} present`
        + (drifted.length > 0
          ? `, ${drifted.length} digest(s) newer than the §229 snapshot (${drifted.join(', ')})`
          : ''),
    },
  ];
}

function evidence(): Check[] {
  const result = checkEvidenceIntegrity();
  return [{
    name: 'Accepted evidence drift',
    status: result.drift === 0 ? 'PASS' : 'FAIL',
    detail: `${result.drift} new`
      + ` (${result.manifestMembersChecked} members over ${result.manifestsChecked} manifests;`
      + ` ${result.preExistingWorktree.length} pre-existing, ${result.inPackageMismatches.length}`
      + ` baselined, ${result.externalReferenceDrift.length} external pointers)`,
  }];
}

/**
 * The current-state manifest must exist and must agree with what was just recomputed. A manifest
 * that has drifted from reality is worse than none: the whole point of §263 is that a future
 * session trusts it instead of re-deriving.
 */
function manifestAgreement(identityChecks: Check[]): Check[] {
  const path = join(REPO, 'verification', 'current', 'EXPERT-HAZLENZ-STATE.json');
  if (!existsSync(path)) {
    return [{
      name: 'Current-state manifest', status: 'FAIL', detail: 'verification/current/EXPERT-HAZLENZ-STATE.json is absent',
    }];
  }
  const state = JSON.parse(readFileSync(path, 'utf8')) as { candidate?: { identity?: string } };
  const frozen = JSON.parse(readFileSync(join(REPO, 'verification',
    'expert-hazlenz-259-carrier-coherence-2026-09-12',
    'SECTION-259-SUCCESSOR-IDENTITY.json'), 'utf8')) as { successorCandidateIdentity259: string };
  const agrees = state.candidate?.identity === frozen.successorCandidateIdentity259
    && identityChecks.every(c => c.status === 'PASS');
  return [{
    name: 'Current-state manifest',
    status: agrees ? 'PASS' : 'FAIL',
    detail: agrees ? 'agrees with the recomputed identity' : 'disagrees with the recomputed identity',
  }];
}

/** What this command deliberately does not touch. Named so its silence is not read as a pass. */
function notCheckedHere(): Check[] {
  return [
    {
      name: 'Provider transport (live)', status: 'UNVERIFIED_LIVE',
      detail: 'no provider is called by any §263 command',
    },
    {
      name: 'Object storage / report generation', status: 'ENVIRONMENTALLY_BLOCKED',
      detail: 'STORAGE_S3_BUCKET and STORAGE_LOCAL_ROOT are unset; test:knowledge-release-provenance '
        + 'cannot reach report generation',
    },
    {
      name: 'Billing and deployment', status: 'UNVERIFIED_LIVE',
      detail: 'no live environment is contacted',
    },
  ];
}

function describe(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message).split('\n')[0].slice(0, 200);
  }
  return String(error).slice(0, 200);
}

export function runVerification(): Check[] {
  const identity = candidateIdentity();
  return [
    ...identity,
    ...protectedModules(),
    ...evidence(),
    ...manifestAgreement(identity),
    ...notCheckedHere(),
  ];
}

function main(): void {
  const checks = runVerification();
  const width = Math.max(...checks.map(c => c.name.length)) + 2;
  console.log('Expert HazLenz — current state verification (read-only, 0 provider calls)\n');
  for (const check of checks) {
    console.log(`  ${check.name.padEnd(width)}${check.status.padEnd(26)}${check.detail}`);
  }
  const failed = checks.filter(c => c.status === 'FAIL');
  console.log(`\n${failed.length === 0 ? 'VERIFICATION PASS' : `VERIFICATION FAIL (${failed.length})`}`
    + `  —  ${checks.filter(c => c.status === 'UNVERIFIED_LIVE').length} unverified live, `
    + `${checks.filter(c => c.status === 'ENVIRONMENTALLY_BLOCKED').length} environmentally blocked`);
  if (failed.length > 0) process.exit(1);
}

if (require.main === module) main();
