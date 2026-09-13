/**
 * §277 — DISPOSABLE-RESOURCE CLEANUP SAFETY. A RELEASE GATE.
 *
 * ==================== THE INCIDENT THIS EXISTS TO PREVENT ====================
 *
 * §276 ended by dropping four disposable databases that did not belong to that session.
 * They were selected the only way they could be at the time -- by matching
 * `test_insite_1789…` against `psql -l` -- and the pattern was right about their shape and
 * wrong about their owner.
 *
 * A name pattern says what a resource IS. Cleanup needs to know who CREATED it.
 *
 * ==================== WHAT THIS PINS ====================
 *
 * An older, unrelated disposable database survives the cleanup of a new run. That is the
 * whole gate, and it is measured against a real database on a real server -- not against a
 * mocked registry, because the thing that failed was a real `dropdb`.
 *
 * NO PRODUCTION INTERACTION. Every database this creates is made by this file, on the host
 * in DATABASE_URL, and removed by this file.
 *
 * Run: npm run test:277-disposable-cleanup
 */
import 'dotenv/config';
import { execFileSync } from 'child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

let pass = 0; let fail = 0; const failures: string[] = [];
const ok = (id: string, cond: boolean, d = ''): void => {
  if (cond) { pass++; console.log(`ok    ${id}${d ? '  [' + d + ']' : ''}`); }
  else { fail++; failures.push(id); console.log(`FAIL  ${id}${d ? '  [' + d + ']' : ''}`); }
};

const BACKEND = join(__dirname, '..');
const sandbox = mkdtempSync(join(tmpdir(), 'insite-277-registry-'));
const REGISTRY = join(sandbox, 'disposable-resources.json');
process.env.DISPOSABLE_REGISTRY_PATH = REGISTRY;

// Imported AFTER the registry path is set, because the module resolves it at load time.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const registry = require('./disposable/registry') as typeof import('./disposable/registry');

function connection(): URL {
  const inherited = process.env.DATABASE_URL;
  if (!inherited) throw new Error('§277 REFUSED: DATABASE_URL is unset.');
  const url = new URL(inherited);
  url.pathname = '/postgres';
  return url;
}

const admin = connection();
const psql = (sql: string) => execFileSync('psql', [admin.toString(), '-v', 'ON_ERROR_STOP=1', '-q', '-c', sql], { stdio: 'pipe' });
const exists = (name: string) => execFileSync('psql', [admin.toString(), '-tAc',
  `SELECT 1 FROM pg_database WHERE datname = '${name}'`], { encoding: 'utf8' }).trim() === '1';

const stamp = Date.now();
/**
 * The bystander. Named EXACTLY like the databases §276 deleted -- same `test_insite_` prefix,
 * same numeric shape -- so the gate is measured against the real confusion rather than an
 * easily distinguished one. It is never registered, because a crashed run leaves no row.
 */
const BYSTANDER = `test_insite_${stamp - 999999}_bystander`;
/** The new run's own database, registered and therefore owned. */
const OWNED = `test_insite_${stamp}_owned`;

function cleanup(args: string[]): { status: number; out: string } {
  try {
    const out = execFileSync('npx', ['ts-node', 'scripts/disposable/cleanup.ts', ...args], {
      cwd: BACKEND, encoding: 'utf8',
      env: { ...process.env, DISPOSABLE_REGISTRY_PATH: REGISTRY },
    });
    return { status: 0, out };
  } catch (error) {
    const e = error as { status?: number; stdout?: string; stderr?: string };
    return { status: e.status ?? 1, out: `${e.stdout || ''}${e.stderr || ''}` };
  }
}

function main(): void {
  console.log(`registry sandbox: ${REGISTRY}\n`);

  psql(`CREATE DATABASE "${BYSTANDER}"`);
  psql(`CREATE DATABASE "${OWNED}"`);
  ok('S1 both databases exist to begin with', exists(BYSTANDER) && exists(OWNED), `${BYSTANDER}, ${OWNED}`);

  const runId = registry.newRunId();
  registry.register({
    kind: 'database', name: OWNED,
    host: admin.hostname, port: admin.port || '5432',
    runId, createdByPid: process.pid, purpose: '§277 cleanup-safety gate',
  });
  ok('S2 only the new run\'s database is registered',
    registry.outstanding().length === 1 && registry.outstanding()[0].name === OWNED,
    registry.outstanding().map(r => r.name).join(','));
  ok('S3 the bystander is NOT registered, exactly as a crashed run would leave it',
    registry.ownershipOf(BYSTANDER, admin.hostname, admin.port || '5432') === null);

  // =====================================================================================
  // THE GATE. Clean up the new run. The older, unrelated database must survive.
  // =====================================================================================
  const result = cleanup(['--run', runId]);
  ok('C1 cleanup of the new run succeeds', result.status === 0, result.out.slice(0, 200));
  ok('C2 THE OLDER UNRELATED DATABASE SURVIVES', exists(BYSTANDER),
    `${BYSTANDER} — §276 dropped four databases of exactly this shape`);
  ok('C3 the run\'s own database is gone', !exists(OWNED), OWNED);
  ok('C4 and its ledger row is released', registry.outstanding().length === 0,
    registry.outstanding().map(r => r.name).join(','));

  // =====================================================================================
  // THE TOOL OFFERS NO WAY TO ASK FOR A PATTERN. Not "it refuses one" -- there is no
  // argument that takes one, which is a stronger property than a rejected input.
  // =====================================================================================
  const source = readFileSync(join(BACKEND, 'scripts/disposable/cleanup.ts'), 'utf8');
  ok('P1 cleanup enumerates no databases from the server',
    !/FROM pg_database WHERE datname LIKE|pg_database\s*$|datname ~/.test(source)
    && !/psql -l|--list-databases/.test(source));
  ok('P2 it accepts no pattern, prefix or regex argument',
    !/--pattern|--prefix|--match|--like|--regex/.test(source));
  const registrySource = readFileSync(join(BACKEND, 'scripts/disposable/registry.ts'), 'utf8');
  ok('P3 the registry exposes no pattern-based ownership question',
    !/ownershipByPattern|matchingResources|resourcesLike/.test(registrySource));

  // =====================================================================================
  // ABANDONED RESOURCES ARE STILL CLEANED BY OWNERSHIP, NOT BY SHAPE.
  // =====================================================================================
  const orphanRun = registry.newRunId();
  const ORPHAN = `test_insite_${stamp}_orphan`;
  psql(`CREATE DATABASE "${ORPHAN}"`);
  registry.register({
    kind: 'database', name: ORPHAN,
    host: admin.hostname, port: admin.port || '5432',
    // A pid that cannot be alive: the creating run is gone, which is what "abandoned" means.
    runId: orphanRun, createdByPid: 2147483646, purpose: '§277 abandoned-run fixture',
  });

  const dry = cleanup(['--abandoned', '--dry-run']);
  ok('A1 a dry run reports what it would remove and removes nothing',
    dry.status === 0 && /would-drop/.test(dry.out) && exists(ORPHAN), dry.out.slice(0, 160));

  const abandoned = cleanup(['--abandoned']);
  ok('A2 the abandoned resource is removed', abandoned.status === 0 && !exists(ORPHAN), ORPHAN);
  ok('A3 and the bystander STILL survives that too', exists(BYSTANDER), BYSTANDER);

  // =====================================================================================
  // THE DEFAULT IS TO REPORT, NOT TO ACT.
  // =====================================================================================
  psql(`CREATE DATABASE "${OWNED}"`);
  const listRun = registry.newRunId();
  registry.register({
    kind: 'database', name: OWNED, host: admin.hostname, port: admin.port || '5432',
    runId: listRun, createdByPid: process.pid, purpose: '§277 default-mode fixture',
  });
  const listed = cleanup([]);
  ok('D1 the default mode deletes nothing', listed.status === 0 && exists(OWNED), '');
  ok('D2 and reports the outstanding resource', /"outstanding": 1/.test(listed.out), listed.out.slice(0, 160));
  cleanup(['--run', listRun]);

  // =====================================================================================
  // AN UNREADABLE LEDGER IS NOT AN EMPTY ONE. Treating it as empty would make every
  // existing resource look unowned, which is the §276 mistake arriving by another road.
  // =====================================================================================
  writeFileSync(REGISTRY, '{ this is not json');
  const corrupted = cleanup(['--abandoned']);
  ok('R1 a corrupted registry causes a refusal, not an empty-ledger assumption',
    corrupted.status !== 0 && /REFUSED/.test(corrupted.out), corrupted.out.slice(0, 160));
  ok('R2 and nothing was deleted during that refusal', exists(BYSTANDER), BYSTANDER);

  // Teardown: this file created the bystander, so this file removes it.
  rmSync(REGISTRY, { force: true });
  psql(`DROP DATABASE IF EXISTS "${BYSTANDER}"`);
  psql(`DROP DATABASE IF EXISTS "${OWNED}"`);
  psql(`DROP DATABASE IF EXISTS "${ORPHAN}"`);
  rmSync(sandbox, { recursive: true, force: true });
  ok('Z1 the gate removes its own fixtures', !exists(BYSTANDER) && !exists(OWNED) && !exists(ORPHAN));
  ok('Z2 and leaves no registry sandbox behind', !existsSync(sandbox));

  console.log(`\n${pass} passed, ${fail} failed.`);
  if (fail > 0) {
    console.error(`\nFAILED: ${failures.join(', ')}`);
    console.error('A cleanup operation may delete a resource only when ownership is positively '
      + 'attributable to a recorded invocation. Matching a name pattern is not ownership.');
    process.exit(1);
  }
  console.log('§277 disposable-resource cleanup safety: PASS');
}

try {
  main();
} catch (error) {
  console.error(error);
  // Best effort: never leave this gate's own fixtures behind, whatever went wrong.
  for (const name of [BYSTANDER, OWNED]) {
    try { psql(`DROP DATABASE IF EXISTS "${name}"`); } catch { /* reported above */ }
  }
  rmSync(sandbox, { recursive: true, force: true });
  process.exit(1);
}
