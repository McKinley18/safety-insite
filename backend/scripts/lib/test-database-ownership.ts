/**
 * KG-4C -- reusable mutating-suite database ownership guard.
 *
 * THE HAZARD THIS CLOSES. KG-4B recorded it plainly: `test:regulatory-release-lifecycle` REPLACES
 * every release row in whatever database it is pointed at, and it does not own one. Pointed at a
 * shared verification database it destroys another suite's evidence, and the damage is silent --
 * the suite passes, because from its own point of view it did exactly what it meant to do.
 *
 * WHY NAMING IS NOT ENOUGH. The existing convention is "mutate only a `test_*` database". That
 * catches the worst case (`safescope`) and misses the common one: `test_kg4b_shadow_20260820` is a
 * `test_*` database AND it is KG-4B's evidence corpus. A rule that cannot distinguish "disposable"
 * from "disposable and MINE" does not prevent the accident that actually happened.
 *
 * THE MECHANISM, AND WHY THIS ONE. Five were considered:
 *
 *   naming convention      -- already in use; cannot express ownership. Retained as a FLOOR, never
 *                             as the proof.
 *   ownership env token    -- an operator sets a variable asserting ownership. Rejected as the
 *                             primary proof: it is a claim by the caller, and the caller is the
 *                             thing being guarded. It is exactly what a copy-pasted command line
 *                             carries forward to the wrong database.
 *   ephemeral database id  -- strong, but requires the suite to create the database in-process,
 *                             which several existing suites deliberately do not do.
 *   suite-issued token     -- good, but a token held only in memory cannot survive the process, so
 *                             a second run of the same suite cannot recognise its own database.
 *   METADATA MARKER TABLE  -- CHOSEN. Ownership is recorded IN the database, by the suite that
 *                             claimed it, at claim time. It survives process restarts, it is visible
 *                             to a human with psql, it cannot be forged by a command line, and a
 *                             database that was never claimed has no marker at all -- so the DEFAULT
 *                             answer for any pre-existing database, including every KG evidence
 *                             corpus, is "not yours".
 *
 * The marker carries a random token as well as the suite name, so two different runs can be told
 * apart, and a suite that finds its own name with a different token knows a concurrent run exists.
 *
 * FAIL BEFORE THE FIRST MUTATION, NOT AFTER. A REFUSED claim performs ZERO writes -- the marker
 * table is probed read-only and is created only once the claim is authorized. An ACCEPTED claim
 * performs exactly one write, and that write is the claim itself. Everything else the suite does
 * happens only after the claim returns, so a suite that calls this at the top of `main()` cannot
 * reach its first destructive statement on a database it does not own.
 *
 * AN UNMARKED DATABASE IS REFUSED, AND THAT IS THE WHOLE POINT. The first version of this guard
 * treated "no marker" as "free to claim". Every pre-existing evidence database is unmarked, so that
 * version handed the destructive suite precisely the databases it exists to protect -- and it did:
 * pointed at KG-4B's corpus it claimed the database and the suite deleted every release row.
 * Claiming an unmarked database now requires a deliberate, database-SPECIFIC authorization.
 */

const { Client } = require('pg') as {
  Client: new (options: { connectionString: string }) => any;
};

/** Databases that are never disposable, whatever any marker says. Checked first, always. */
export const PROTECTED_DATABASE_NAMES: readonly string[] = Object.freeze([
  'safescope', 'sentinel_dev', 'sentinel_safety', 'postgres', 'template0', 'template1',
]);

/**
 * The floor. A disposable database must still look like one.
 *
 * Kept as a separate, earlier check than the marker so that a marker cannot be used to bless a
 * production-looking name: both conditions must hold, and neither substitutes for the other.
 */
const DISPOSABLE_NAME_PATTERN = /^test_[a-z0-9_]+$/i;

export const OWNERSHIP_TABLE = 'kg_test_database_ownership';

export type OwnershipRefusal =
  | 'NO_DATABASE_URL'
  | 'PROTECTED_DATABASE'
  | 'NAME_NOT_DISPOSABLE'
  | 'OWNED_BY_ANOTHER_SUITE'
  | 'UNCLAIMED_DATABASE'
  | 'CONNECTION_FAILED';

/**
 * The env var that authorizes claiming an UNMARKED database, and it must name that database
 * EXACTLY.
 *
 * Naming the database is the whole safety property. An operator who creates
 * `test_kg4c_mut_lifecycle` and sets this to `test_kg4c_mut_lifecycle` has made one deliberate
 * statement about one database. If that command line is later copy-pasted with a different
 * `DATABASE_URL` -- which is how the accident happens -- the names no longer agree and the claim is
 * refused. A boolean flag would carry forward silently; a name cannot.
 */
export const INITIALIZE_OWNERSHIP_ENV = 'KG_TEST_DB_INITIALIZE_OWNERSHIP';

export class DatabaseOwnershipRefused extends Error {
  constructor(readonly refusal: OwnershipRefusal, readonly database: string, detail: string) {
    super('REFUSED BEFORE MUTATION [' + refusal + '] database=' + database + ': ' + detail);
    this.name = 'DatabaseOwnershipRefused';
  }
}

export interface OwnershipClaim {
  database: string;
  host: string;
  suite: string;
  token: string;
  claimedAt: string;
  /** True when this process created the marker; false when it re-claimed its own existing one. */
  freshlyClaimed: boolean;
}

function parseTarget(databaseUrl: string): { database: string; host: string } {
  const url = new URL(databaseUrl);
  return { database: decodeURIComponent(url.pathname.replace(/^\//, '')), host: url.hostname };
}

/**
 * Claims a database for one mutating suite. Throws `DatabaseOwnershipRefused` if it cannot.
 *
 * Call this BEFORE the first mutation, and let it throw. Catching it to continue anyway defeats the
 * entire mechanism, so the error is deliberately a distinct class that a blanket `catch (e)` around
 * a suite body will re-throw if the suite follows the convention in `runOwnedMutatingSuite()`.
 */
export async function claimDatabaseOwnership(input: {
  suite: string;
  databaseUrl?: string | undefined;
  /**
   * Allows a suite to re-claim a database it already owns (the normal case for a re-run).
   * Set false to require a database with no prior marker at all.
   */
  allowReclaim?: boolean;
  /**
   * Authorizes claiming an UNMARKED database. Pass true only when this process created the
   * database itself moments ago; otherwise let the operator name it via
   * `KG_TEST_DB_INITIALIZE_OWNERSHIP`.
   */
  initializeOwnership?: boolean;
}): Promise<OwnershipClaim> {
  const databaseUrl = input.databaseUrl ?? process.env.DATABASE_URL;
  if (!databaseUrl || !String(databaseUrl).trim()) {
    throw new DatabaseOwnershipRefused('NO_DATABASE_URL', '(none)',
      'No DATABASE_URL resolved. A mutating suite must name its target explicitly.');
  }

  const { database, host } = parseTarget(databaseUrl);

  if (PROTECTED_DATABASE_NAMES.includes(database.toLowerCase())) {
    throw new DatabaseOwnershipRefused('PROTECTED_DATABASE', database,
      'This database is permanently protected and can never be claimed.');
  }
  if (!DISPOSABLE_NAME_PATTERN.test(database)) {
    throw new DatabaseOwnershipRefused('NAME_NOT_DISPOSABLE', database,
      'A mutating suite may only target a database named test_*.');
  }

  const client = new Client({ connectionString: databaseUrl });
  try {
    await client.connect();
  } catch (error) {
    throw new DatabaseOwnershipRefused('CONNECTION_FAILED', database, (error as Error).message);
  }

  try {
    // READ BEFORE WRITE, INCLUDING THE MARKER TABLE ITSELF.
    //
    // An earlier version ran `CREATE TABLE IF NOT EXISTS` before deciding whether the claim was
    // allowed, which meant a refused claim still created a table on somebody else's evidence
    // database. Harmless in content and still a write to a database this function had just decided
    // it had no right to touch. The existence probe below is read-only, so a refusal now leaves the
    // target byte-for-byte untouched.
    const tablePresent = await client.query(
      'SELECT 1 FROM information_schema.tables WHERE table_name = $1', [OWNERSHIP_TABLE],
    );

    const existing = tablePresent.rowCount
      ? await client.query(
          'SELECT owner_suite, ownership_token, claimed_at FROM ' + OWNERSHIP_TABLE + ' WHERE id = 1',
        )
      : { rowCount: 0, rows: [] as Array<Record<string, unknown>> };

    if (existing.rowCount && existing.rows[0]) {
      const owner = String(existing.rows[0].owner_suite);
      if (owner !== input.suite) {
        throw new DatabaseOwnershipRefused('OWNED_BY_ANOTHER_SUITE', database,
          "Marker names '" + owner + "'. Create your own disposable database instead.");
      }
      if (input.allowReclaim === false) {
        throw new DatabaseOwnershipRefused('OWNED_BY_ANOTHER_SUITE', database,
          'A marker already exists and allowReclaim is false; this suite requires a pristine database.');
      }
      return {
        database, host, suite: owner,
        token: String(existing.rows[0].ownership_token),
        claimedAt: new Date(existing.rows[0].claimed_at).toISOString(),
        freshlyClaimed: false,
      };
    }

    // NO MARKER MEANS NOT YOURS.
    //
    // This is the correction that matters, and it was learned the hard way: the first version of
    // this guard treated an unmarked database as free to claim. Every pre-existing evidence
    // database is unmarked -- that is precisely the population the guard exists to protect -- so
    // "unmarked means claimable" hands the destructive suite exactly the databases it must never
    // touch. Pointed at KG-4B's corpus, that version claimed it and the suite then deleted every
    // release row. Restoring it took a re-finalization and a manual repair of a tampered
    // `standards_master` row.
    //
    // Claiming an unmarked database is now a DELIBERATE, DATABASE-SPECIFIC act.
    const initializeRequested = input.initializeOwnership === true
      || String(process.env[INITIALIZE_OWNERSHIP_ENV] || '').trim() === database;

    if (!initializeRequested) {
      throw new DatabaseOwnershipRefused('UNCLAIMED_DATABASE', database,
        'This database carries no ownership marker, so it may be an existing evidence corpus. ' +
        'Create your own database and set ' + INITIALIZE_OWNERSHIP_ENV + '=' + database +
        ' (naming it exactly) to claim it.');
    }

    // Only now, with the claim authorized, is the marker table created.
    await client.query(
      'CREATE TABLE IF NOT EXISTS ' + OWNERSHIP_TABLE + ' (' +
      ' id integer PRIMARY KEY DEFAULT 1,' +
      ' owner_suite text NOT NULL,' +
      ' ownership_token text NOT NULL,' +
      ' claimed_at timestamptz NOT NULL DEFAULT now(),' +
      ' CONSTRAINT ' + OWNERSHIP_TABLE + '_single_row CHECK (id = 1))',
    );

    const token = 'own_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    await client.query(
      'INSERT INTO ' + OWNERSHIP_TABLE + ' (id, owner_suite, ownership_token) VALUES (1, $1, $2)',
      [input.suite, token],
    );
    return { database, host, suite: input.suite, token, claimedAt: new Date().toISOString(), freshlyClaimed: true };
  } finally {
    await client.end().catch(() => undefined);
  }
}

/**
 * Read-only ownership probe. Never writes, never creates the marker table.
 *
 * Used by the verification suite to inspect a database's ownership WITHOUT claiming it -- which is
 * the only honest way to test that an unowned database is refused.
 */
export async function inspectDatabaseOwnership(databaseUrl: string): Promise<{
  database: string;
  markerPresent: boolean;
  ownerSuite: string | null;
}> {
  const { database } = parseTarget(databaseUrl);
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    const present = await client.query(
      'SELECT 1 FROM information_schema.tables WHERE table_name = $1', [OWNERSHIP_TABLE],
    );
    if (!present.rowCount) return { database, markerPresent: false, ownerSuite: null };
    const row = await client.query('SELECT owner_suite FROM ' + OWNERSHIP_TABLE + ' WHERE id = 1');
    return {
      database,
      markerPresent: true,
      ownerSuite: row.rowCount && row.rows[0] ? String(row.rows[0].owner_suite) : null,
    };
  } finally {
    await client.end().catch(() => undefined);
  }
}

/**
 * The wrapper a mutating suite should use.
 *
 * Claims first, prints the resolved target the way the repository's data-protection rule requires,
 * and runs the body only on success. A refusal exits non-zero WITHOUT running the body, so the
 * suite fails before its first mutation rather than during it.
 */
export async function runOwnedMutatingSuite(input: {
  suite: string;
  databaseUrl?: string | undefined;
  allowReclaim?: boolean;
  initializeOwnership?: boolean;
  body: (claim: OwnershipClaim) => Promise<void>;
}): Promise<void> {
  let claim: OwnershipClaim;
  try {
    claim = await claimDatabaseOwnership(input);
  } catch (error) {
    if (error instanceof DatabaseOwnershipRefused) {
      console.error('');
      console.error('  ' + error.message);
      console.error('  No mutation was attempted.');
      console.error('');
      process.exit(1);
    }
    throw error;
  }
  console.log(
    '[db-ownership] suite=' + claim.suite + ' host=' + claim.host + ' database=' + claim.database +
    ' claim=' + (claim.freshlyClaimed ? 'NEW' : 'RECLAIMED'),
  );
  await input.body(claim);
}
