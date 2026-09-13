/**
 * §277 — CLEAN UP DISPOSABLE RESOURCES THIS REPOSITORY CREATED, AND NOTHING ELSE.
 *
 * ==================== WHAT IT WILL AND WILL NOT DO ====================
 *
 * It drops databases that the registry attributes to a recorded invocation. It takes no
 * pattern, no prefix and no regular expression, and it never enumerates the server's
 * databases to decide what to remove. A `test_insite_*` database this machine's tooling did
 * not create is not its business, and after §276 -- where four such databases were dropped
 * because their NAMES matched -- that distinction is the whole design.
 *
 *   --list                 report what the ledger holds. Deletes nothing. The default.
 *   --run <runId>          drop exactly the outstanding resources of that run
 *   --abandoned            drop outstanding resources whose creating process is gone
 *   --dry-run              with either of the above: say what would happen, do nothing
 *
 * A resource whose row exists but whose database does not is released in the ledger rather
 * than reported as a failure: the goal state is reached either way.
 *
 * NO PRODUCTION INTERACTION. The connection host comes from the registry row itself, and a
 * protected database name is refused even if something managed to register one.
 */
import 'dotenv/config';
import { execFileSync } from 'child_process';
import {
  DisposableResource, compact, creatorIsAlive, outstanding, readRegistry, release,
} from './registry';

const PROTECTED_DATABASE_NAMES = [
  'safescope', 'hazlenz', 'sentinel_dev', 'sentinel_safety', 'postgres', 'template0', 'template1',
];

function adminUrl(resource: DisposableResource): string {
  const inherited = process.env.DATABASE_URL;
  if (!inherited) {
    throw new Error('§277 REFUSED: DATABASE_URL is unset, so there are no connection parameters '
      + 'to reach the server with. Its database NAME is never used as a target.');
  }
  const url = new URL(inherited);
  if (url.hostname !== resource.host || (url.port || '5432') !== resource.port) {
    throw new Error(
      `§277 REFUSED: ${resource.name} was registered on ${resource.host}:${resource.port}, but the `
      + `available connection is ${url.hostname}:${url.port || '5432'}. A registry written on `
      + 'another machine is not acted on here.',
    );
  }
  url.pathname = '/postgres';
  return url.toString();
}

function dropDatabase(resource: DisposableResource): 'dropped' | 'absent' {
  if (PROTECTED_DATABASE_NAMES.includes(resource.name)) {
    throw new Error(`§277 REFUSED: ${resource.name} is a protected database name and will not be dropped.`);
  }
  const url = adminUrl(resource);
  const exists = execFileSync('psql', [url, '-tAc',
    `SELECT 1 FROM pg_database WHERE datname = '${resource.name.replace(/'/g, "''")}'`],
  { encoding: 'utf8' }).trim();
  if (!exists) return 'absent';
  execFileSync('psql', [url, '-v', 'ON_ERROR_STOP=1', '-q', '-c',
    `DROP DATABASE IF EXISTS "${resource.name}"`], { stdio: 'pipe' });
  return 'dropped';
}

function main(): void {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const runIndex = args.indexOf('--run');
  const runId = runIndex >= 0 ? args[runIndex + 1] : undefined;
  const abandoned = args.includes('--abandoned');

  if (runIndex >= 0 && !runId) throw new Error('usage: cleanup --run <runId>');

  const all = readRegistry().resources;
  const live = outstanding();

  if (!runId && !abandoned) {
    console.log(JSON.stringify({
      registry: 'disposable-resources',
      totalRows: all.length,
      outstanding: live.length,
      released: all.length - live.length,
      resources: live.map(resource => ({
        name: resource.name, runId: resource.runId, createdAt: resource.createdAt,
        purpose: resource.purpose, creatorAlive: creatorIsAlive(resource),
      })),
      note: 'Nothing was deleted. Pass --run <runId> or --abandoned to act, and note that '
        + 'neither accepts a name pattern: a resource this ledger does not name cannot be '
        + 'removed by this tool.',
    }, null, 2));
    return;
  }

  const targets = runId
    ? outstanding(runId)
    : live.filter(resource => !creatorIsAlive(resource));

  if (targets.length === 0) {
    console.log(JSON.stringify({
      action: runId ? `run ${runId}` : 'abandoned', targets: 0,
      note: 'Nothing outstanding matched. No enumeration of the server was performed.',
    }, null, 2));
    return;
  }

  const results: Array<{ name: string; runId: string; outcome: string }> = [];
  for (const resource of targets) {
    if (dryRun) {
      results.push({ name: resource.name, runId: resource.runId, outcome: 'would-drop' });
      continue;
    }
    try {
      const outcome = dropDatabase(resource);
      release(resource.runId, resource.name);
      results.push({ name: resource.name, runId: resource.runId, outcome });
    } catch (error) {
      results.push({
        name: resource.name, runId: resource.runId,
        outcome: `failed: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }

  if (!dryRun) compact();

  console.log(JSON.stringify({
    action: runId ? `run ${runId}` : 'abandoned',
    dryRun,
    targets: targets.length,
    results,
    ownershipRule: 'Only resources this registry attributes to a recorded invocation were '
      + 'considered. No database was selected by name pattern.',
  }, null, 2));

  if (results.some(result => result.outcome.startsWith('failed'))) process.exit(1);
}

main();
