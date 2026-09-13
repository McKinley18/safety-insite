/**
 * §277 — THE DISPOSABLE-RESOURCE REGISTRY. OWNERSHIP, NOT PATTERN MATCHING.
 *
 * ==================== WHY THIS EXISTS ====================
 *
 * §276 ended with four disposable databases being dropped that did not belong to that
 * session. They were selected the only way they could be selected at the time -- by matching
 * `test_insite_1789…` against the output of `psql -l` -- and the pattern was right about
 * their shape and wrong about their owner. They were orphans of earlier crashed runs, so
 * nothing was lost that mattered; the reason nothing was lost is luck, not design.
 *
 * A name pattern says what a resource IS. It cannot say who CREATED it, and cleanup needs
 * the second question answered. `with-disposable-db.ts` has always been careful in the
 * happy path -- it drops exactly the one name it generated -- but a run that is killed
 * leaves that name behind with nothing recording who made it, and the next person to tidy
 * up has only the pattern to go on.
 *
 * ==================== THE RULE ====================
 *
 * A cleanup operation may delete a resource only when ownership is positively attributable
 * to a recorded invocation. Every disposable resource this repository's tooling creates is
 * registered here at creation, under a unique run id, and released when it is dropped.
 * `cleanup.ts` will delete only what this ledger names -- it takes no pattern, and there is
 * deliberately no way to ask it for one.
 *
 * ==================== WHAT THIS DELIBERATELY IS NOT ====================
 *
 * It is not a lock, and it is not a permission system. A resource missing from the ledger is
 * simply not cleanable by this tool; it is left alone and reported, which is the correct
 * outcome for something whose owner is unknown. Being unable to prove ownership is a reason
 * to stop, never a reason to guess.
 */
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { randomUUID } from 'crypto';

const BACKEND = join(__dirname, '..', '..');

/** Gitignored: this is machine-local state about one machine's databases, not source. */
export const REGISTRY_PATH = process.env.DISPOSABLE_REGISTRY_PATH
  || join(BACKEND, '.disposable-resources.json');

export type DisposableResource = {
  /** Only databases today. The shape is kept general so a bucket or a directory can join it. */
  kind: 'database';
  /** The resource's own identifier -- for a database, its name. */
  name: string;
  /** Connection host and port, so a registry from another machine is never acted on here. */
  host: string;
  port: string;
  /** The invocation that created it. */
  runId: string;
  /** The OS process that created it, so an abandoned run can be recognised as abandoned. */
  createdByPid: number;
  createdAt: string;
  /** What the run was for, in a few words. Purely so a human reading the ledger can tell. */
  purpose: string;
  /** Set when the resource has been dropped. A released row is history, never a target. */
  releasedAt: string | null;
};

type RegistryFile = { version: 1; resources: DisposableResource[] };

function empty(): RegistryFile {
  return { version: 1, resources: [] };
}

export function readRegistry(): RegistryFile {
  if (!existsSync(REGISTRY_PATH)) return empty();
  try {
    const parsed = JSON.parse(readFileSync(REGISTRY_PATH, 'utf8'));
    if (!parsed || !Array.isArray(parsed.resources)) return empty();
    return { version: 1, resources: parsed.resources as DisposableResource[] };
  } catch {
    /**
     * An unreadable ledger must NOT be treated as an empty one. Returning `empty()` here
     * would mean "nothing is registered", and a caller acting on that would conclude that
     * every existing disposable database is unowned -- which is the §276 mistake arriving by
     * a different road. Refusing is the only safe reading.
     */
    throw new Error(
      `§277 REFUSED: the disposable-resource registry at ${REGISTRY_PATH} could not be read. `
      + 'Refusing to proceed: an unreadable ledger is not an empty one, and treating it as '
      + 'empty would make every existing resource look unowned.',
    );
  }
}

function writeRegistry(file: RegistryFile): void {
  mkdirSync(dirname(REGISTRY_PATH), { recursive: true });
  // Written via a temp file and renamed, so a crash mid-write cannot leave a truncated
  // ledger -- which `readRegistry` would then refuse, blocking every later cleanup.
  const temporary = `${REGISTRY_PATH}.${process.pid}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(file, null, 2)}\n`);
  renameSync(temporary, REGISTRY_PATH);
}

export function newRunId(): string {
  return randomUUID();
}

export function register(resource: Omit<DisposableResource, 'createdAt' | 'releasedAt'>): DisposableResource {
  const file = readRegistry();
  const entry: DisposableResource = { ...resource, createdAt: new Date().toISOString(), releasedAt: null };
  file.resources.push(entry);
  writeRegistry(file);
  return entry;
}

export function release(runId: string, name: string): void {
  const file = readRegistry();
  for (const resource of file.resources) {
    if (resource.runId === runId && resource.name === name && !resource.releasedAt) {
      resource.releasedAt = new Date().toISOString();
    }
  }
  writeRegistry(file);
}

/** Resources this ledger still holds as live, optionally narrowed to one run. */
export function outstanding(runId?: string): DisposableResource[] {
  return readRegistry().resources.filter(
    resource => !resource.releasedAt && (runId === undefined || resource.runId === runId),
  );
}

/**
 * Whether the process that created a resource is still running.
 *
 * `kill(pid, 0)` signals nothing and only reports reachability. A pid can of course be
 * reused, which is why this is used ONLY to decide whether an already-registered resource is
 * abandoned -- never to decide whether a resource is ours. Ownership comes from the ledger.
 */
export function creatorIsAlive(resource: DisposableResource): boolean {
  try {
    process.kill(resource.createdByPid, 0);
    return true;
  } catch {
    return false;
  }
}

/**
 * THE ONLY WAY TO ASK "MAY I DELETE THIS?".
 *
 * Answers for a NAMED resource against a REGISTERED run. There is no variant taking a
 * pattern, a prefix or a regular expression, and that absence is the point: a function that
 * accepted one would be used, and the §276 incident is what using one looks like.
 */
export function ownershipOf(name: string, host: string, port: string): DisposableResource | null {
  return outstanding().find(
    resource => resource.name === name && resource.host === host && resource.port === port,
  ) || null;
}

/** Drops released rows older than the retention window, so the ledger cannot grow forever. */
export function compact(retentionDays = 30): number {
  const file = readRegistry();
  const cutoff = Date.now() - retentionDays * 86400000;
  const before = file.resources.length;
  file.resources = file.resources.filter(resource => {
    if (!resource.releasedAt) return true;
    return new Date(resource.releasedAt).getTime() >= cutoff;
  });
  if (file.resources.length !== before) writeRegistry(file);
  return before - file.resources.length;
}
