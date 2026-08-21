/**
 * KG-4D Phase 19 -- INDEPENDENT BLACK-BOX verification of the database ownership guard.
 *
 * WHY THIS EXISTS, AND WHY IT MAY NOT IMPORT THE GUARD.
 *
 * KG-4C's first ownership guard destroyed KG-4B's evidence corpus, and its own suite passed 26/26
 * while it did so -- because an assertion in that suite stated the defective behaviour was correct.
 * A test that shares the implementation's assumptions will agree with the implementation's bugs.
 *
 * This verifier therefore imports NOTHING from `scripts/lib/test-database-ownership`. It knows only:
 *
 *   - how to create a disposable database and put sentinel rows in it (plain SQL);
 *   - how to run the mutating suite the way an operator would (`npm run …` as a child process);
 *   - how to read the database back afterwards (plain SQL).
 *
 * It never asks the guard what it decided. It asks the DATABASE what happened. "It returned a
 * refusal" is a claim about a return value; "the rows are still there" is a claim about the world,
 * and only the second one would have caught the KG-4C incident.
 *
 * OWNS ITS OWN DATABASES and reuses no KG-4B or KG-4C evidence corpus.
 *
 * Run:  npm run test:kg4d-db-ownership-blackbox
 */

const { Client } = require('pg') as {
  Client: new (options: { connectionString: string }) => any;
};
import { execFileSync, spawnSync } from 'child_process';
import { userInfo } from 'os';
import { createHash } from 'crypto';

const checks: string[] = [];
const failures: string[] = [];
function check(condition: unknown, message: string): void {
  if (condition) checks.push(message); else failures.push(message);
}

const USER = process.env.PGUSER || userInfo().username;
const HOST = process.env.PGHOST || '127.0.0.1';
const UNMARKED = 'test_kg4d_bb_unmarked';
const FOREIGN = 'test_kg4d_bb_foreign';
const OWNED = 'test_kg4d_bb_owned';
const ALL = [UNMARKED, FOREIGN, OWNED];

const url = (database: string) => 'postgresql://' + USER + '@' + HOST + ':5432/' + database;

function admin(command: string, args: string[]): void {
  try { execFileSync(command, args, { stdio: 'pipe' }); } catch { /* non-fatal for drops */ }
}
function createDatabase(name: string): void {
  admin('dropdb', ['-h', HOST, '-U', USER, '--if-exists', name]);
  execFileSync('createdb', ['-h', HOST, '-U', USER, name], { stdio: 'pipe' });
}

async function sql(database: string, statement: string, params: unknown[] = []): Promise<any[]> {
  const client = new Client({ connectionString: url(database) });
  await client.connect();
  try { return (await client.query(statement, params)).rows; } finally { await client.end(); }
}

/**
 * Sentinel rows shaped like the release tables the lifecycle suite replaces. If the suite runs, it
 * deletes them; if the guard works, they are untouched.
 */
async function placeSentinels(database: string): Promise<void> {
  await sql(database, `CREATE TABLE regulatory_releases (
    "releaseId" varchar(120) PRIMARY KEY, status varchar(24), "manifestChecksum" text,
    "recordCount" integer, "releaseVersion" varchar(64), "parserVersion" varchar(64))`);
  await sql(database, `CREATE TABLE regulatory_release_records (
    id serial PRIMARY KEY, "releaseId" varchar(120), citation text, "recordChecksum" text)`);
  await sql(database, `CREATE TABLE regulatory_release_record_reviews (
    id serial PRIMARY KEY, "releaseId" varchar(120), "citationKey" text, decision text)`);
  await sql(database, `CREATE TABLE knowledge_release_events (id serial PRIMARY KEY, event text)`);

  await sql(database,
    `INSERT INTO regulatory_releases VALUES ('kg4d-sentinel.1','active','sentinel-manifest',3,'1','p')`);
  for (const citation of ['29 CFR 1926.501', '29 CFR 1910.212(a)(1)', '30 CFR 56.14132']) {
    await sql(database,
      `INSERT INTO regulatory_release_records ("releaseId", citation, "recordChecksum") VALUES ($1,$2,$3)`,
      ['kg4d-sentinel.1', citation, createHash('sha256').update(citation).digest('hex')]);
  }
  await sql(database,
    `INSERT INTO regulatory_release_record_reviews ("releaseId","citationKey",decision)
     VALUES ('kg4d-sentinel.1','1926.501','approved')`);
  await sql(database, `INSERT INTO knowledge_release_events (event) VALUES ('sentinel-activation')`);
}

/** A content digest over the sentinel data. Any deletion or replacement changes it. */
async function sentinelDigest(database: string): Promise<string> {
  const releases = await sql(database,
    `SELECT "releaseId", status, "manifestChecksum", "recordCount" FROM regulatory_releases ORDER BY "releaseId"`);
  const records = await sql(database,
    `SELECT "releaseId", citation, "recordChecksum" FROM regulatory_release_records ORDER BY citation`);
  const reviews = await sql(database,
    `SELECT "releaseId", "citationKey", decision FROM regulatory_release_record_reviews ORDER BY id`);
  const events = await sql(database, `SELECT event FROM knowledge_release_events ORDER BY id`);
  return createHash('sha256')
    .update(JSON.stringify({ releases, records, reviews, events }))
    .digest('hex');
}

/** Runs the mutating suite exactly as an operator would: the registered npm command. */
function runLifecycleSuite(database: string, extraEnv: Record<string, string> = {}): {
  status: number; stdout: string; stderr: string;
} {
  const result = spawnSync('npm', ['run', 'test:regulatory-release-lifecycle'], {
    cwd: process.cwd(),
    env: { ...process.env, DATABASE_URL: url(database), ...extraEnv },
    encoding: 'utf8',
    timeout: 180_000,
  });
  return {
    status: result.status ?? -1,
    stdout: String(result.stdout || ''),
    stderr: String(result.stderr || ''),
  };
}

async function main(): Promise<void> {
  console.log('Resolved black-box targets: host=' + HOST + ' databases=' + ALL.join(', '));

  // ---------------------------------------------------------------- 1. UNMARKED database

  createDatabase(UNMARKED);
  await placeSentinels(UNMARKED);
  const unmarkedBefore = await sentinelDigest(UNMARKED);
  const unmarkedCountsBefore = await sql(UNMARKED,
    `SELECT (SELECT count(*) FROM regulatory_releases) AS releases,
            (SELECT count(*) FROM regulatory_release_records) AS records,
            (SELECT count(*) FROM regulatory_release_record_reviews) AS reviews`);

  const markerBefore = await sql(UNMARKED,
    `SELECT count(*)::int AS n FROM information_schema.tables WHERE table_name='kg_test_database_ownership'`);
  check(Number(markerBefore[0].n) === 0, 'the unmarked database starts with NO ownership marker table');

  const unmarkedRun = runLifecycleSuite(UNMARKED);
  check(unmarkedRun.status !== 0,
    'the mutating suite EXITS NON-ZERO on an unmarked database (status ' + unmarkedRun.status + ')');
  check(/UNCLAIMED_DATABASE/.test(unmarkedRun.stdout + unmarkedRun.stderr),
    'the refusal names UNCLAIMED_DATABASE');
  check(/No mutation was attempted/.test(unmarkedRun.stdout + unmarkedRun.stderr),
    'the refusal states that no mutation was attempted');

  const unmarkedAfter = await sentinelDigest(UNMARKED);
  const unmarkedCountsAfter = await sql(UNMARKED,
    `SELECT (SELECT count(*) FROM regulatory_releases) AS releases,
            (SELECT count(*) FROM regulatory_release_records) AS records,
            (SELECT count(*) FROM regulatory_release_record_reviews) AS reviews`);
  check(unmarkedBefore === unmarkedAfter,
    'INDEPENDENTLY VERIFIED: the sentinel digest is unchanged after the refusal');
  check(JSON.stringify(unmarkedCountsBefore) === JSON.stringify(unmarkedCountsAfter),
    'INDEPENDENTLY VERIFIED: every sentinel row count is unchanged (' +
    JSON.stringify(unmarkedCountsAfter[0]) + ')');

  const markerAfter = await sql(UNMARKED,
    `SELECT count(*)::int AS n FROM information_schema.tables WHERE table_name='kg_test_database_ownership'`);
  check(Number(markerAfter[0].n) === 0,
    'a refused claim created NO marker table -- the refusal performed ZERO writes');

  // ---------------------------------------------------------------- 2. WRONG ownership identity

  createDatabase(FOREIGN);
  await placeSentinels(FOREIGN);
  // Plant a marker naming a DIFFERENT suite, using plain SQL rather than the guard's own API.
  await sql(FOREIGN, `CREATE TABLE kg_test_database_ownership (
    id integer PRIMARY KEY DEFAULT 1, owner_suite text NOT NULL,
    ownership_token text NOT NULL, claimed_at timestamptz NOT NULL DEFAULT now())`);
  await sql(FOREIGN,
    `INSERT INTO kg_test_database_ownership (id, owner_suite, ownership_token)
     VALUES (1, 'some-other-evidence-suite', 'token-belonging-to-someone-else')`);

  const foreignBefore = await sentinelDigest(FOREIGN);
  const foreignRun = runLifecycleSuite(FOREIGN);
  check(foreignRun.status !== 0,
    'the mutating suite EXITS NON-ZERO on a database owned by another suite (status ' + foreignRun.status + ')');
  check(/OWNED_BY_ANOTHER_SUITE/.test(foreignRun.stdout + foreignRun.stderr),
    'the refusal names OWNED_BY_ANOTHER_SUITE');
  check(await sentinelDigest(FOREIGN) === foreignBefore,
    'INDEPENDENTLY VERIFIED: the foreign-owned sentinel data is unchanged');
  const foreignOwner = await sql(FOREIGN, `SELECT owner_suite FROM kg_test_database_ownership WHERE id=1`);
  check(foreignOwner[0].owner_suite === 'some-other-evidence-suite',
    'the existing ownership marker was not overwritten by the refused claim');

  // A wrong-named initialize token must not unlock somebody else's database either.
  const wrongToken = runLifecycleSuite(FOREIGN, { KG_TEST_DB_INITIALIZE_OWNERSHIP: UNMARKED });
  check(wrongToken.status !== 0,
    'an initialize token naming a DIFFERENT database does not unlock this one');
  check(await sentinelDigest(FOREIGN) === foreignBefore,
    'INDEPENDENTLY VERIFIED: a mis-named initialize token left the data unchanged');

  // ---------------------------------------------------------------- 3. CORRECTLY owned database

  createDatabase(OWNED);
  // A real run needs the real schema, so migrate and seed this one -- it is ours.
  const migrate = spawnSync('npm', ['run', 'migration:run'], {
    cwd: process.cwd(), env: { ...process.env, DATABASE_URL: url(OWNED) },
    encoding: 'utf8', timeout: 300_000,
  });
  check(migrate.status === 0, 'the owned database migrates successfully');
  const seed = spawnSync('npm', ['run', 'seed:safescope-standards'], {
    cwd: process.cwd(), env: { ...process.env, DATABASE_URL: url(OWNED) },
    encoding: 'utf8', timeout: 600_000,
  });
  check(seed.status === 0, 'the owned database seeds successfully');

  const ownedRun = runLifecycleSuite(OWNED, { KG_TEST_DB_INITIALIZE_OWNERSHIP: OWNED });
  check(ownedRun.status === 0,
    'the mutating suite SUCCEEDS on a database it explicitly owns (status ' + ownedRun.status + ')');
  check(/checks passed/.test(ownedRun.stdout),
    'the owned run actually executed its assertions -- the guard is not vacuously refusing everything');

  const ownedMarker = await sql(OWNED, `SELECT owner_suite FROM kg_test_database_ownership WHERE id=1`);
  check(ownedMarker[0]?.owner_suite === 'test:regulatory-release-lifecycle',
    'the owned database records the claiming suite in its marker');

  const ownedReleases = await sql(OWNED, `SELECT count(*)::int AS n FROM regulatory_releases`);
  check(Number(ownedReleases[0].n) > 0,
    'the owned database DID get mutated (fixture releases present: ' + ownedReleases[0].n + ')');

  // ---------------------------------------------------------------- cleanup

  for (const database of ALL) admin('dropdb', ['-h', HOST, '-U', USER, '--if-exists', database]);
  console.log('dropped ' + ALL.length + ' databases created by this verifier');
}

main()
  .then(() => {
    console.log('');
    console.log('kg4d-db-ownership-blackbox: ' + checks.length + ' passed, ' + failures.length + ' failed');
    for (const entry of checks) console.log('  ok  ' + entry);
    if (failures.length) {
      for (const entry of failures) console.error('  FAIL  ' + entry);
      process.exitCode = 1;
    }
  })
  .catch((error) => {
    for (const database of ALL) admin('dropdb', ['-h', HOST, '-U', USER, '--if-exists', database]);
    console.error(error instanceof Error ? error.stack : error);
    process.exitCode = 1;
  });
