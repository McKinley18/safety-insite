/**
 * §263 — RUN A COMMAND AGAINST A DISPOSABLE DATABASE THIS SCRIPT CREATES AND DROPS.
 *
 * WHY THIS EXISTS. Before §263, running the §262 integration suite meant remembering to create a
 * `test_*` database, remembering to migrate it, remembering to pass DATABASE_URL, remembering to
 * unset DEV_AUTH_BYPASS so the authorization cases exercise the guard rather than the bypass, and
 * remembering to drop the database afterwards. Five things to remember is five things to get wrong,
 * and the one that matters — pointing a mutating suite at the development database — is the one
 * with no undo.
 *
 * THE TARGET IS CONSTRUCTED HERE AND NOWHERE ELSE. The name is generated, always `test_insite_*`,
 * always on the host in DATABASE_URL, and the resolved target is printed before anything runs. An
 * inherited DATABASE_URL is deliberately NOT reused as the target: it is read only for its
 * connection parameters, because in this repository it resolves to the development database.
 */
import 'dotenv/config';
import { execFileSync, spawnSync } from 'child_process';
import { join } from 'path';
import { newRunId, register, release } from '../disposable/registry';

const BACKEND = join(__dirname, '..', '..');

const PROTECTED_DATABASE_NAMES = [
  'hazlenz', 'sentinel_dev', 'sentinel_safety', 'postgres', 'template0', 'template1',
];

function connectionBase(): URL {
  const inherited = process.env.DATABASE_URL;
  if (!inherited) {
    throw new Error('§263 REFUSED: DATABASE_URL is unset, so there is no host to create a '
      + 'disposable database on. It is read for connection parameters only; its database name is '
      + 'never used as the target.');
  }
  return new URL(inherited);
}

function main(): void {
  const command = process.argv.slice(2);
  if (command.length === 0) {
    throw new Error('usage: with-disposable-db <npm-script-name> [more...]');
  }

  const base = connectionBase();
  // Stated out loud, because the inherited value in this repository is the DEVELOPMENT database and
  // the whole safety of this wrapper rests on never using its name.
  console.log(`inherited DATABASE_URL names database "${base.pathname.replace(/^\//, '')}" — `
    + 'used for connection parameters only, never as the target');
  const name = `test_insite_${Date.now()}_${Math.floor(Math.random() * 1e4)}`;
  if (PROTECTED_DATABASE_NAMES.includes(name) || !/^test_insite_[a-z0-9_]+$/.test(name)) {
    throw new Error(`§263 REFUSED: generated target ${name} is not a disposable test_insite_* name`);
  }
  const target = new URL(base.toString());
  target.pathname = `/${name}`;

  console.log(`disposable target host=${target.hostname} port=${target.port || 5432} database=${name}`);
  const admin = new URL(base.toString());
  admin.pathname = '/postgres';

  const psql = (sql: string) => execFileSync('psql', [admin.toString(), '-v', 'ON_ERROR_STOP=1',
    '-q', '-c', sql], { stdio: 'pipe' });

  /**
   * §277. REGISTERED BEFORE IT EXISTS, so a run killed between the CREATE and the first line
   * of the suite still leaves an OWNED record rather than an anonymous database. An
   * unregistered leftover can only ever be cleaned by matching its name, and §276 is what
   * matching a name looks like when the match is right about the shape and wrong about the
   * owner.
   */
  const runId = newRunId();
  register({
    kind: 'database',
    name,
    host: target.hostname,
    port: target.port || '5432',
    runId,
    createdByPid: process.pid,
    purpose: `with-disposable-db ${command.join(' ')}`.slice(0, 200),
  });
  console.log(`registered as run ${runId}`);

  psql(`CREATE DATABASE "${name}"`);
  let code = 1;
  try {
    const env = {
      ...process.env,
      DATABASE_URL: target.toString(),
      NODE_ENV: 'test',
      // The developer .env enables the local authentication bypass. An authorization suite run
      // under it measures the bypass instead of the route, so it is forced off here rather than
      // left to whoever remembers.
      DEV_AUTH_BYPASS: 'false',
    };
    execFileSync('npm', ['run', 'migration:run'], { cwd: BACKEND, env, stdio: 'pipe' });
    const run = spawnSync('npm', ['run', ...command], { cwd: BACKEND, env, stdio: 'inherit' });
    code = run.status ?? 1;
  } finally {
    // Dropped whether the suite passed or failed. A disposable database left behind is a database
    // someone eventually points something at.
    //
    // §277. The ledger row is RELEASED only after the drop succeeds. If the drop fails the row
    // stays outstanding, which is what lets `cleanup --abandoned` finish the job later with
    // ownership still proven -- rather than leaving a database nobody can safely claim.
    try {
      psql(`DROP DATABASE IF EXISTS "${name}"`);
      release(runId, name);
      console.log(`dropped ${name}`);
    } catch (error) {
      console.error(`WARNING: could not drop ${name}: ${String(error)}`);
      console.error(`  it remains registered to run ${runId}; `
        + 'run `npm run disposable:cleanup -- --abandoned` to remove it with ownership proven.');
    }
  }
  process.exit(code);
}

main();
