/**
 * KG-4C section 19 -- the mutating-suite database ownership guard.
 *
 * OWNS ITS OWN DATABASES. Creates `test_kg4c_own_owned`, `test_kg4c_own_unowned` and
 * `test_kg4c_own_foreign` at the start, drops them at the end, and touches nothing else. It
 * deliberately does NOT use `SOURCE_DB` or any existing corpus: a suite that verifies an
 * anti-damage mechanism must not be able to cause the damage it is testing for.
 *
 * WHAT IT PROVES, AND WHY EACH CASE MATTERS.
 *
 *   unowned database      -> REFUSED, and the proof is that a canary row placed beforehand is
 *                            still there afterwards. "It refused" is a claim about a return value;
 *                            "the data is untouched" is a claim about the world.
 *   foreign-owned         -> REFUSED. This is the case that actually happened: a `test_*` database
 *                            that is disposable AND belongs to another suite's evidence.
 *   protected name        -> REFUSED before any connection is attempted.
 *   non-disposable name   -> REFUSED.
 *   owned database        -> PERMITTED, so the guard is not merely refusing everything.
 *
 * Run:  npm run test:kg4c-db-ownership
 */

const { Client } = require('pg') as {
  Client: new (options: { connectionString: string }) => any;
};
import { execFileSync } from 'child_process';
import { userInfo } from 'os';

import {
  claimDatabaseOwnership, inspectDatabaseOwnership, DatabaseOwnershipRefused,
  PROTECTED_DATABASE_NAMES, OWNERSHIP_TABLE,
} from './lib/test-database-ownership';

const checks: string[] = [];
const failures: string[] = [];

function check(condition: unknown, message: string): void {
  if (condition) checks.push(message);
  else failures.push(message);
}

const USER = process.env.PGUSER || userInfo().username;
const HOST = process.env.PGHOST || '127.0.0.1';
const OWNED = 'test_kg4c_own_owned';
const UNOWNED = 'test_kg4c_own_unowned';
const FOREIGN = 'test_kg4c_own_foreign';
const ALL_OWNED_BY_THIS_SUITE = [OWNED, UNOWNED, FOREIGN];

const url = (database: string) => 'postgresql://' + USER + '@' + HOST + ':5432/' + database;

function psqlAdmin(args: string[]): void {
  execFileSync(args[0], args.slice(1), { stdio: 'pipe' });
}

function createDatabase(name: string): void {
  try { psqlAdmin(['dropdb', '-h', HOST, '-U', USER, '--if-exists', name]); } catch { /* fine */ }
  psqlAdmin(['createdb', '-h', HOST, '-U', USER, name]);
}

function dropDatabase(name: string): void {
  try { psqlAdmin(['dropdb', '-h', HOST, '-U', USER, '--if-exists', name]); } catch { /* fine */ }
}

/** A row a destructive suite would delete. Its survival is the proof that nothing ran. */
async function placeCanary(database: string): Promise<void> {
  const client = new Client({ connectionString: url(database) });
  await client.connect();
  try {
    await client.query('CREATE TABLE evidence_canary (id integer PRIMARY KEY, note text)');
    await client.query("INSERT INTO evidence_canary VALUES (1, 'another suite evidence')");
  } finally {
    await client.end();
  }
}

async function canaryIntact(database: string): Promise<boolean> {
  const client = new Client({ connectionString: url(database) });
  await client.connect();
  try {
    const result = await client.query('SELECT note FROM evidence_canary WHERE id = 1');
    return result.rowCount === 1 && result.rows[0].note === 'another suite evidence';
  } finally {
    await client.end();
  }
}

/**
 * The thing being guarded: a stand-in for `test:regulatory-release-lifecycle`, which replaces every
 * release row. It claims first and mutates second, exactly as the real suite now does.
 */
async function destructiveSuite(suiteName: string, database: string): Promise<'MUTATED' | 'REFUSED'> {
  try {
    await claimDatabaseOwnership({ suite: suiteName, databaseUrl: url(database) });
  } catch (error) {
    if (error instanceof DatabaseOwnershipRefused) return 'REFUSED';
    throw error;
  }
  const client = new Client({ connectionString: url(database) });
  await client.connect();
  try {
    await client.query('DROP TABLE IF EXISTS evidence_canary');
    return 'MUTATED';
  } finally {
    await client.end();
  }
}

async function main(): Promise<void> {
  console.log('Resolved ownership-guard targets: host=' + HOST + ' databases=' + ALL_OWNED_BY_THIS_SUITE.join(', '));

  // ---------------------------------------------------------------- refusals that never connect

  for (const protectedName of PROTECTED_DATABASE_NAMES) {
    let refusal = '';
    try {
      await claimDatabaseOwnership({ suite: 'kg4c-probe', databaseUrl: url(protectedName) });
    } catch (error) {
      refusal = error instanceof DatabaseOwnershipRefused ? error.refusal : 'OTHER';
    }
    check(refusal === 'PROTECTED_DATABASE',
      'protected database "' + protectedName + '" is refused (got ' + refusal + ')');
  }

  // `testing_scratch` is the boundary that matters: it starts with "test" but NOT with "test_",
  // so it must be refused. The floor is deliberately case-INSENSITIVE (a database called
  // `TEST_kg4c_x` is still plainly disposable), which is why no upper-case variant appears here.
  for (const badName of ['insite_prod', 'production', 'kg4c_scratch', 'testing_scratch']) {
    let refusal = '';
    try {
      await claimDatabaseOwnership({ suite: 'kg4c-probe', databaseUrl: url(badName) });
    } catch (error) {
      refusal = error instanceof DatabaseOwnershipRefused ? error.refusal : 'OTHER';
    }
    check(refusal === 'NAME_NOT_DISPOSABLE' || refusal === 'PROTECTED_DATABASE',
      'non-disposable name "' + badName + '" is refused (got ' + refusal + ')');
  }

  let missingUrlRefusal = '';
  try {
    await claimDatabaseOwnership({ suite: 'kg4c-probe', databaseUrl: '' });
  } catch (error) {
    missingUrlRefusal = error instanceof DatabaseOwnershipRefused ? error.refusal : 'OTHER';
  }
  check(missingUrlRefusal === 'NO_DATABASE_URL', 'an unresolved DATABASE_URL is refused');

  // ---------------------------------------------------------------- unowned database

  createDatabase(UNOWNED);
  await placeCanary(UNOWNED);

  const beforeUnowned = await inspectDatabaseOwnership(url(UNOWNED));
  check(!beforeUnowned.markerPresent,
    'a freshly created database carries NO ownership marker -- the default answer is "not yours"');

  // THE REGRESSION THAT MATTERS. A pre-existing evidence database is exactly this shape:
  // disposable name, no marker. The FIRST version of this guard treated that as free to claim, and
  // the first version of THIS TEST asserted that behaviour was correct -- so the suite passed while
  // the mechanism was backwards. Pointed at KG-4B's corpus it claimed the database and deleted
  // every release row. The assertion below is the corrected one: unmarked means REFUSED.
  const unownedOutcome = await destructiveSuite('test:regulatory-release-lifecycle', UNOWNED);
  check(unownedOutcome === 'REFUSED',
    'an UNMARKED disposable database is REFUSED -- every pre-existing evidence corpus is unmarked (got '
    + unownedOutcome + ')');
  check(await canaryIntact(UNOWNED),
    'the unmarked database is INTACT after the refusal -- no mutation was attempted');

  // Claiming an unmarked database requires naming it EXACTLY.
  let wrongNameRefusal = '';
  process.env.KG_TEST_DB_INITIALIZE_OWNERSHIP = 'test_some_other_database';
  try {
    await claimDatabaseOwnership({ suite: 'suite-x', databaseUrl: url(UNOWNED) });
  } catch (error) {
    wrongNameRefusal = error instanceof DatabaseOwnershipRefused ? error.refusal : 'OTHER';
  }
  check(wrongNameRefusal === 'UNCLAIMED_DATABASE',
    'an initialize-ownership token naming a DIFFERENT database does not authorize this one');
  check(await canaryIntact(UNOWNED), 'a mis-named initialize token leaves the database untouched');

  process.env.KG_TEST_DB_INITIALIZE_OWNERSHIP = UNOWNED;
  const namedClaim = await claimDatabaseOwnership({ suite: 'suite-x', databaseUrl: url(UNOWNED) });
  check(namedClaim.freshlyClaimed,
    'naming the database EXACTLY authorizes the initial claim');
  delete process.env.KG_TEST_DB_INITIALIZE_OWNERSHIP;

  // In-process creation may claim directly, without an env token.
  createDatabase(UNOWNED);
  const inProcessClaim = await claimDatabaseOwnership({
    suite: 'suite-y', databaseUrl: url(UNOWNED), initializeOwnership: true,
  });
  check(inProcessClaim.freshlyClaimed,
    'a suite that created the database in-process may claim it directly');

  // ---------------------------------------------------------------- foreign-owned database
  //
  // The case that actually caused damage: `test_*`, disposable, and already another suite's.

  createDatabase(FOREIGN);
  await placeCanary(FOREIGN);
  await claimDatabaseOwnership({
    suite: 'test:kg4b-shadow-corpus', databaseUrl: url(FOREIGN), initializeOwnership: true,
  });

  const foreignBefore = await inspectDatabaseOwnership(url(FOREIGN));
  check(foreignBefore.markerPresent && foreignBefore.ownerSuite === 'test:kg4b-shadow-corpus',
    'the foreign database records its owning suite in the marker table');

  const foreignOutcome = await destructiveSuite('test:regulatory-release-lifecycle', FOREIGN);
  check(foreignOutcome === 'REFUSED',
    'a suite is REFUSED on a disposable database owned by ANOTHER suite (got ' + foreignOutcome + ')');
  check(await canaryIntact(FOREIGN),
    'the other suite evidence is INTACT after the refusal -- the guard fired BEFORE the first mutation');

  const foreignAfter = await inspectDatabaseOwnership(url(FOREIGN));
  check(foreignAfter.ownerSuite === 'test:kg4b-shadow-corpus',
    'a refused claim does not overwrite the existing ownership marker');

  // ---------------------------------------------------------------- owned database

  createDatabase(OWNED);
  await placeCanary(OWNED);

  const firstClaim = await claimDatabaseOwnership({
    suite: 'test:regulatory-release-lifecycle', databaseUrl: url(OWNED), initializeOwnership: true,
  });
  check(firstClaim.freshlyClaimed, 'the first claim on a pristine database is reported as NEW');
  check(firstClaim.database === OWNED, 'the claim names the resolved database');
  check(firstClaim.token.length > 8, 'the claim carries an ownership token');

  const reclaim = await claimDatabaseOwnership({
    suite: 'test:regulatory-release-lifecycle', databaseUrl: url(OWNED),
  });
  check(!reclaim.freshlyClaimed, 're-running the same suite RECLAIMS rather than failing');
  check(reclaim.token === firstClaim.token, 'a reclaim returns the original ownership token');

  const ownedOutcome = await destructiveSuite('test:regulatory-release-lifecycle', OWNED);
  check(ownedOutcome === 'MUTATED',
    'the owning suite is PERMITTED to mutate its own database -- the guard is not vacuous');

  // ---------------------------------------------------------------- pristine-only mode

  createDatabase(UNOWNED);
  await claimDatabaseOwnership({ suite: 'suite-a', databaseUrl: url(UNOWNED), initializeOwnership: true });
  let reclaimRefusal = '';
  try {
    await claimDatabaseOwnership({ suite: 'suite-a', databaseUrl: url(UNOWNED), allowReclaim: false });
  } catch (error) {
    reclaimRefusal = error instanceof DatabaseOwnershipRefused ? error.refusal : 'OTHER';
  }
  check(reclaimRefusal === 'OWNED_BY_ANOTHER_SUITE',
    'a suite that requires a pristine database refuses even its own prior marker');

  // ---------------------------------------------------------------- the marker itself

  const markerClient = new Client({ connectionString: url(OWNED) });
  await markerClient.connect();
  try {
    const columns = await markerClient.query(
      'SELECT column_name FROM information_schema.columns WHERE table_name = $1 ORDER BY column_name',
      [OWNERSHIP_TABLE],
    );
    const names = columns.rows.map((row: { column_name: string }) => row.column_name);
    check(names.includes('owner_suite') && names.includes('ownership_token') && names.includes('claimed_at'),
      'the marker table records suite, token and claim time');
    const rows = await markerClient.query('SELECT COUNT(*)::int AS n FROM ' + OWNERSHIP_TABLE);
    check(rows.rows[0].n === 1, 'the marker table holds exactly one ownership row');
  } finally {
    await markerClient.end();
  }

  // ---------------------------------------------------------------- cleanup

  for (const database of ALL_OWNED_BY_THIS_SUITE) dropDatabase(database);
  console.log('dropped ' + ALL_OWNED_BY_THIS_SUITE.length + ' databases created by this suite');
}

main()
  .then(() => {
    console.log('');
    console.log('kg4c-db-ownership: ' + checks.length + ' passed, ' + failures.length + ' failed');
    for (const entry of checks) console.log('  ok  ' + entry);
    if (failures.length) {
      for (const entry of failures) console.error('  FAIL  ' + entry);
      process.exitCode = 1;
    }
  })
  .catch((error) => {
    for (const database of ALL_OWNED_BY_THIS_SUITE) dropDatabase(database);
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
