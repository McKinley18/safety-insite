/**
 * §263 — THE EVIDENCE INTEGRITY GUARD. READ-ONLY, AND THAT IS THE WHOLE POINT.
 *
 * ---------------------------------------------------------------------------------------------
 * THE FAILURE THIS EXISTS FOR.
 *
 * §258 ran two verification scripts that quietly overwrote members of the frozen §252 and §243
 * evidence packages. It was invisible, because the bytes they produced that time happened to be
 * identical. §259 ran the same scripts, the results had moved, and only then did anyone look. The
 * evidence base had been mutable all along and nothing said so.
 *
 * So this guard answers one question — did accepted evidence change? — and it answers it WITHOUT
 * writing anything, because a guard that rewrites what it checks cannot fail.
 *
 * ---------------------------------------------------------------------------------------------
 * TWO CHECKS, BECAUSE THEY CATCH DIFFERENT THINGS.
 *
 *   1. WORKTREE DRIFT, against git. Every tracked file under `verification/` is compared with
 *      HEAD. This catches the §258 case exactly: a script ran, rewrote a package member, and the
 *      change is sitting in the working tree waiting to be committed by accident. It needs no
 *      baseline file of its own, so there is no baseline to forget to update and none to disagree
 *      with reality.
 *
 *   2. MANIFEST INTEGRITY, against each package's own `*.sha256`. Eighty-eight packages already
 *      record the digest of every member they contain. Recomputing them catches a mutation that
 *      was COMMITTED — which check 1 cannot see, because once it is in HEAD the working tree is
 *      clean and the corruption looks like the truth.
 *
 * Untracked files under `verification/` are reported separately and are NOT failures: a new
 * successor package is untracked before it is committed, and treating that as evidence corruption
 * would make the guard cry wolf on every section.
 */
import { execFileSync } from 'child_process';
import { createHash } from 'crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const REPO = join(__dirname, '..', '..', '..');
const EVIDENCE = join(REPO, 'verification');

/**
 * THREE BUCKETS, BECAUSE THEY MEAN THREE DIFFERENT THINGS AND COLLAPSING THEM MAKES THE GUARD
 * USELESS IN BOTH DIRECTIONS.
 *
 *   WORKTREE DRIFT is the §258 failure exactly: a script ran and rewrote a committed package member,
 *   and the change is sitting unstaged. This must be zero and is the only bucket that is a fault by
 *   itself.
 *
 *   IN-PACKAGE MISMATCH is a member whose bytes disagree with its OWN package manifest in the
 *   committed state. Two such cases already exist and predate this section (§234 and §236 judgment
 *   files, whose committed bytes have never matched their recorded digests). They are recorded as a
 *   BASELINE rather than silently excluded, so the guard fails on a NEW one while not failing
 *   forever on an old one it cannot fix without rewriting history.
 *
 *   EXTERNAL REFERENCE DRIFT is a manifest line naming a file OUTSIDE its package -- live source
 *   under `backend/`, or a document under `docs/`. Those digests record what the file was when the
 *   section froze, and the file has legitimately moved on since. This is not corruption; it is a
 *   historical pointer doing its job, and reporting it as a fault would mean every future source
 *   edit "corrupts" the evidence base.
 */
export interface EvidenceIntegrityResult {
  readonly trackedModified: string[];
  readonly trackedDeleted: string[];
  readonly untrackedAdded: number;
  readonly manifestsChecked: number;
  readonly manifestMembersChecked: number;
  readonly inPackageMismatches: { manifest: string; member: string; reason: string }[];
  readonly externalReferenceDrift: { manifest: string; member: string }[];
  readonly newInPackageMismatches: { manifest: string; member: string; reason: string }[];
  readonly preExistingWorktree: string[];
  readonly newWorktreeModified: string[];
  readonly newWorktreeDeleted: string[];
  readonly worktreeDrift: number;
  readonly drift: number;
}

/**
 * The known, pre-existing in-package mismatches. Recorded from the committed state at §263 and
 * carried as data so a NEW one is visible immediately. Each is a case where the bytes in HEAD have
 * never matched the digest the same commit recorded for them.
 */
const BASELINE_PATH = join(__dirname, '..', '..', '..',
  'verification', 'current', 'EVIDENCE-BASELINE.json');

interface Baseline {
  knownInPackageMismatches: { manifest: string; member: string }[];
  preExistingWorktreeState?: { deleted?: string[]; modified?: string[] };
}

function baseline(): Baseline {
  if (!existsSync(BASELINE_PATH)) return { knownInPackageMismatches: [] };
  return JSON.parse(readFileSync(BASELINE_PATH, 'utf8')) as Baseline;
}

function git(args: string[]): string {
  return execFileSync('git', args, { cwd: REPO, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

const sha256 = (buffer: Buffer): string => createHash('sha256').update(buffer).digest('hex');

/** Every `*.sha256` manifest in the evidence tree, one level down from a package directory. */
function manifests(): string[] {
  if (!existsSync(EVIDENCE)) return [];
  const found: string[] = [];
  for (const name of readdirSync(EVIDENCE)) {
    const dir = join(EVIDENCE, name);
    if (!statSync(dir).isDirectory()) continue;
    for (const member of readdirSync(dir)) {
      if (member.endsWith('.sha256')) found.push(join(dir, member));
    }
  }
  return found.sort();
}

export function checkEvidenceIntegrity(): EvidenceIntegrityResult {
  // ---- 1. worktree drift against HEAD, tracked files only.
  const status = git(['status', '--porcelain', '--', 'verification/'])
    .split('\n').filter(Boolean);
  const trackedModified: string[] = [];
  const trackedDeleted: string[] = [];
  let untrackedAdded = 0;
  for (const line of status) {
    const code = line.slice(0, 2);
    const path = line.slice(3).replace(/^"|"$/g, '');
    if (code === '??') { untrackedAdded += 1; continue; }
    if (code.includes('D')) trackedDeleted.push(path);
    else trackedModified.push(path);
  }

  // ---- 2. each package's own manifest, recomputed.
  const inPackage: { manifest: string; member: string; reason: string }[] = [];
  const external: { manifest: string; member: string }[] = [];
  let members = 0;
  const found = manifests();
  for (const manifest of found) {
    const dir = join(manifest, '..');
    for (const line of readFileSync(manifest, 'utf8').split('\n')) {
      const match = /^([0-9a-f]{64})\s+\*?(.+)$/.exec(line.trim());
      if (!match) continue;
      members += 1;
      const [, expected, name] = match;
      // TWO CONVENTIONS EXIST IN THE TREE AND BOTH ARE LEGITIMATE. Most manifests name members
      // relative to their own package directory; several name them relative to the repository
      // root, including members that live outside `verification/` entirely (§223 records the
      // `docs/hazlenz/` documents it froze). Resolving only one convention reported thousands of
      // absent members that are present, which would have made this guard useless by crying wolf.
      const packageRelative = join(dir, name);
      const repoRelative = join(REPO, name);
      const insidePackage = existsSync(packageRelative);
      const target = insidePackage ? packageRelative
        : existsSync(repoRelative) ? repoRelative : null;
      const record = { manifest: relative(REPO, manifest), member: name };
      if (target === null) {
        // A manifest line that names no file. Some manifests digest a whole PACKAGE under a bare
        // name rather than a file; those are recorded as external references rather than as an
        // absent member, because there is no file for them to be absent from.
        if (/\.[a-z0-9]{2,5}$/i.test(name)) inPackage.push({ ...record, reason: 'MEMBER_ABSENT' });
        else external.push(record);
        continue;
      }
      const actual = sha256(readFileSync(target));
      if (actual === expected) continue;
      if (insidePackage) {
        inPackage.push({
          ...record,
          reason: `DIGEST_MISMATCH recorded ${expected.slice(0, 16)} actual ${actual.slice(0, 16)}`,
        });
      } else {
        external.push(record);
      }
    }
  }

  const base = baseline();
  const known = new Set(base.knownInPackageMismatches.map(m => `${m.manifest}::${m.member}`));
  const newMismatches = inPackage.filter(m => !known.has(`${m.manifest}::${m.member}`));

  // PRE-EXISTING worktree conditions are reported but do not set the exit code. Each one is named
  // in the committed baseline with the evidence establishing what it is, so the guard's failure
  // means "something changed on YOUR watch" rather than "this repository has an old scar". A guard
  // that always fails is a guard the next operator turns off.
  const preDeleted = new Set(base.preExistingWorktreeState?.deleted ?? []);
  const preModified = new Set(base.preExistingWorktreeState?.modified ?? []);
  const newModified = trackedModified.filter(p => !preModified.has(p));
  const newDeleted = trackedDeleted.filter(p => !preDeleted.has(p));
  const worktreeDrift = newModified.length + newDeleted.length;

  return {
    trackedModified, trackedDeleted, untrackedAdded,
    preExistingWorktree: trackedModified.filter(p => preModified.has(p))
      .concat(trackedDeleted.filter(p => preDeleted.has(p))),
    newWorktreeModified: newModified,
    newWorktreeDeleted: newDeleted,
    manifestsChecked: found.length,
    manifestMembersChecked: members,
    inPackageMismatches: inPackage,
    externalReferenceDrift: external,
    newInPackageMismatches: newMismatches,
    worktreeDrift,
    drift: worktreeDrift + newMismatches.length,
  };
}

function main(): void {
  const verbose = process.argv.includes('--verbose');
  const result = checkEvidenceIntegrity();
  console.log(`Accepted evidence drift: ${result.drift === 0 ? 'PASS (0)' : `FAIL (${result.drift})`}`);
  console.log(`  manifests checked          ${result.manifestsChecked}`);
  console.log(`  members verified           ${result.manifestMembersChecked}`);
  console.log(`  worktree drift vs HEAD     ${result.worktreeDrift} new `
    + `(${result.preExistingWorktree.length} pre-existing, see EVIDENCE-BASELINE.json)`);
  console.log(`  in-package mismatches      ${result.inPackageMismatches.length} `
    + `(${result.newInPackageMismatches.length} new, rest baseline)`);
  console.log(`  external pointer drift     ${result.externalReferenceDrift.length} (informational)`);
  console.log(`  untracked (not a fault)    ${result.untrackedAdded}`);
  if (verbose || result.drift > 0) {
    for (const p of result.newWorktreeModified) console.log(`  MODIFIED  ${p}`);
    for (const p of result.newWorktreeDeleted) console.log(`  DELETED   ${p}`);
    for (const m of result.newInPackageMismatches) {
      console.log(`  NEW MISMATCH  ${m.manifest} :: ${m.member} :: ${m.reason}`);
    }
  }
  for (const p of result.preExistingWorktree) console.log(`  PRE-EXISTING  ${p}`);
  if (verbose) {
    for (const m of result.inPackageMismatches) {
      console.log(`  baseline  ${m.manifest} :: ${m.member}`);
    }
  }
  if (result.drift > 0) process.exit(1);
}

if (require.main === module) main();
