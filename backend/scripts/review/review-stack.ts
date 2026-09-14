/**
 * §279 — BRING UP THE REAL LOCAL STACK FOR A PAGE-REVIEW BATCH, AND TEAR IT DOWN AGAIN.
 *
 * WHY THIS EXISTS. Batch 1 of the page review was set up by hand. Every batch after it needs the
 * same five things to be true at once, and "remembered correctly five times" is not a property a
 * review's evidence should rest on:
 *
 *   1. a REGISTERED DISPOSABLE database (§277 ownership rules) -- never the development one;
 *   2. migrations applied to it, so the product runs against the schema it actually ships;
 *   3. `DEV_AUTH_BYPASS=false`, so the review measures the guard rather than the bypass;
 *   4. NO reachable provider -- `ANTHROPIC_API_KEY` is deleted from the child environment and
 *      `EXPERT_EXECUTION_ENABLED=false`, so a provider call is not merely "not made", it is
 *      not possible;
 *   5. the database dropped and the ledger row released when the review is finished.
 *
 * It does not seed and it does not drive a browser. It brings the backend up, prints the
 * connection facts, and waits. The seeding and the review are separate instruments, so a defect
 * in one cannot quietly rewrite the other.
 *
 * Usage:
 *   ts-node scripts/review/review-stack.ts            # holds until SIGINT/SIGTERM
 *   REVIEW_DB_ONLY=1 ts-node scripts/review/review-stack.ts   # create + migrate, print, exit
 */
import 'dotenv/config';
import { execFileSync, spawn } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { newRunId, register, release } from '../disposable/registry';

const BACKEND = join(__dirname, '..', '..');

const PROTECTED_DATABASE_NAMES = [
  'hazlenz', 'sentinel_dev', 'sentinel_safety', 'postgres', 'template0', 'template1',
];

function connectionBase(): URL {
  const inherited = process.env.DATABASE_URL;
  if (!inherited) {
    throw new Error('REFUSED: DATABASE_URL is unset, so there is no host to create a disposable '
      + 'database on. It is read for connection parameters only; its database name is never used '
      + 'as the target.');
  }
  return new URL(inherited);
}

function main(): void {
  const base = connectionBase();
  console.log(`inherited DATABASE_URL names database "${base.pathname.replace(/^\//, '')}" — `
    + 'used for connection parameters only, never as the target');

  const name = `test_insite_review_${Date.now()}_${Math.floor(Math.random() * 1e4)}`;
  if (PROTECTED_DATABASE_NAMES.includes(name) || !/^test_insite_[a-z0-9_]+$/.test(name)) {
    throw new Error(`REFUSED: generated target ${name} is not a disposable test_insite_* name`);
  }
  const target = new URL(base.toString());
  target.pathname = `/${name}`;

  const admin = new URL(base.toString());
  admin.pathname = '/postgres';
  const psql = (sql: string) => execFileSync('psql', [admin.toString(), '-v', 'ON_ERROR_STOP=1',
    '-q', '-c', sql], { stdio: 'pipe' });

  // Registered BEFORE it exists, so a run killed between CREATE and the first request still
  // leaves an OWNED record rather than an anonymous database.
  const runId = newRunId();
  register({
    kind: 'database',
    name,
    host: target.hostname,
    port: target.port || '5432',
    runId,
    createdByPid: process.pid,
    purpose: '§279 page-review stack',
  });
  console.log(`registered as run ${runId}`);

  psql(`CREATE DATABASE "${name}"`);
  console.log(`created ${name}`);

  // The child environment. Two deletions matter as much as the assignments: no provider key can
  // be read from `process.env` if it is not there, and no bypass can be honoured if it is false.
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    DATABASE_URL: target.toString(),
    DB_NAME: name,
    DB_DATABASE: name,
    NODE_ENV: 'development',
    DEV_AUTH_BYPASS: 'false',
    EXPERT_EXECUTION_ENABLED: 'false',
  };
  delete env.ANTHROPIC_API_KEY;

  let dropped = false;
  const teardown = () => {
    if (dropped) return;
    dropped = true;
    try {
      psql(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`);
      release(runId, name);
      console.log(`dropped ${name}`);
    } catch (error) {
      console.error(`WARNING: could not drop ${name}: ${String(error)}`);
      console.error(`  it remains registered to run ${runId}; `
        + 'run `npm run disposable:cleanup -- --abandoned` to remove it with ownership proven.');
    }
  };

  try {
    execFileSync('npm', ['run', 'migration:run'], { cwd: BACKEND, env, stdio: 'pipe' });
    console.log('migrations applied');
  } catch (error) {
    console.error('migration failed');
    console.error(String((error as { stdout?: Buffer }).stdout || ''));
    console.error(String((error as { stderr?: Buffer }).stderr || ''));
    teardown();
    process.exit(1);
  }

  const facts = {
    runId,
    database: name,
    host: target.hostname,
    port: target.port || '5432',
    devAuthBypass: false,
    expertExecutionEnabled: false,
    providerKeyPresentInChildEnv: false,
  };
  writeFileSync(join(BACKEND, '.review-stack.json'), JSON.stringify(facts, null, 2));
  console.log(`STACK_FACTS ${JSON.stringify(facts)}`);

  if (process.env.REVIEW_DB_ONLY === '1') {
    console.log('REVIEW_DB_ONLY: database created and migrated; NOT dropping. '
      + `Release it with: npm run review:stack:release -- ${runId} ${name}`);
    return;
  }

  const server = spawn('npm', ['run', 'dev'], { cwd: BACKEND, env, stdio: 'inherit' });
  const stop = () => {
    server.kill('SIGTERM');
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
  server.on('exit', (code) => {
    teardown();
    process.exit(code ?? 0);
  });
}

main();
