import { existsSync, readdirSync } from 'fs';
import { join } from 'path';

/**
 * The ONLY capability this module needs from a data source: run one SQL string and get rows back.
 *
 * Declared structurally rather than as `Pick<DataSource, 'query'>` because TypeORM's `query` is
 * generic, and depending on the generic signature would force every caller — including a fixture
 * in a test — to satisfy a type parameter it has no opinion about. Narrowing to what is actually
 * used also means the readiness rules can be proven against literal fixtures with no database at
 * all, which is what makes the fail-closed branches testable.
 */
export interface MigrationTableReader {
  query(sql: string): Promise<Array<{ timestamp: string | number }>>;
}

/**
 * §268 — IS THIS PROCESS SAFE TO SERVE AGAINST THE SCHEMA IT FOUND?
 *
 * ===============================================================================================
 * WHY THIS EXISTS.
 *
 * §266 established that the production image cannot run migrations and that nothing runs them at
 * boot: `migrationsRun` is false, `start:render` does not migrate, and the only migration script
 * was source-oriented. So code can deploy ahead of schema. §266 also measured the consequence and
 * it is not subtle: `HazLenzAnalysis` declares `producer`, `analysisState`, `confirmationRequired`,
 * `expertExecutionId` and `settlementReviewId`, TypeORM selects all of them, and EVERY read of
 * `hazlenz_analyses` fails against a schema that predates them — including the core deterministic
 * `finalizeFinding` path. The failure is not confined to Expert.
 *
 * A process in that state is RUNNING. It answers `/health/live`. It accepts connections. It is not
 * SAFE TO SERVE, and until §268 nothing in the product could tell those two states apart.
 *
 * ===============================================================================================
 * WHAT IT COMPARES, AND WHY IT COMPARES TIMESTAMPS.
 *
 * EXPECTED comes from the migration files that shipped in THIS artifact — the same directory the
 * datasource points its CLI at, resolved the same way (`.ts` when running from source, `dist`
 * otherwise). It is therefore self-maintaining: adding a migration adds an expectation, with no
 * second list to forget to update. A hand-maintained "expected schema version" constant is exactly
 * the thing that goes stale one release after someone writes it.
 *
 * APPLIED comes from TypeORM's own `migrations` table.
 *
 * The comparison is on the numeric TIMESTAMP, which is the migration's identity for ordering and
 * for TypeORM's own applied/not-applied decision. Class names are not compared: a rename is a
 * source-level event that does not change which migration ran, and comparing names would report a
 * false gap for a real schema that is entirely correct.
 *
 * ===============================================================================================
 * IT FAILS CLOSED, IN EVERY DIRECTION IT CAN FAIL.
 *
 *   - no `migrations` table at all        -> NOT READY (a database that has never been migrated)
 *   - the table cannot be queried         -> NOT READY (never "probably fine")
 *   - no migration files found in the artifact -> NOT READY, and reported as an ARTIFACT fault
 *     rather than a schema fault, because "expected: none" would otherwise make every database
 *     trivially ready — the check would pass loudest exactly when it had lost the ability to check.
 *
 * A schema AHEAD of this artifact (applied migrations this build does not know about) is NOT a
 * readiness failure. That is the normal and intended state during a code rollback onto a
 * forward-migrated database, which the §268 rollback model depends on being able to do. It is
 * reported so an operator can see it.
 */
export interface SchemaReadiness {
  readonly ready: boolean;
  readonly reason: string;
  /** Migration timestamps shipped in this artifact. */
  readonly expectedCount: number;
  /** Of those, how many the database reports as applied. */
  readonly appliedCount: number;
  /** Expected by this artifact and NOT applied. Any entry here means NOT READY. */
  readonly missing: readonly string[];
  /**
   * Applied but unknown to this artifact — the database is AHEAD. Not a failure; this is what a
   * deliberate code rollback onto a forward-migrated database looks like.
   */
  readonly ahead: readonly string[];
  /** The newest migration timestamp this artifact expects. The deployable schema marker. */
  readonly expectedSchemaVersion: string | null;
}

const MIGRATION_FILE = /^(\d+)-.+\.(js|ts)$/;

/**
 * The migrations directory belonging to THIS artifact, resolved the way `data-source.ts` resolves
 * it, so the readiness check and the migration command can never disagree about what shipped.
 */
export function resolveMigrationsDirectory(): string {
  const compiled = __filename.endsWith('.js');
  // `__dirname` is `<root>/dist/database` when compiled and `<root>/src/database` from source, so
  // the sibling directory is correct in both cases without knowing the project root.
  const dir = join(__dirname, 'migrations');
  if (existsSync(dir)) return dir;
  // A defensive second look only for the source case, where a partially built tree can leave the
  // compiled sibling missing. It never invents a directory: a miss is reported as an artifact fault.
  return compiled ? dir : join(__dirname, '..', '..', 'src', 'database', 'migrations');
}

export function expectedMigrationTimestamps(directory = resolveMigrationsDirectory()): string[] {
  if (!existsSync(directory)) return [];
  const seen = new Set<string>();
  for (const entry of readdirSync(directory)) {
    const match = MIGRATION_FILE.exec(entry);
    // `.js` and `.d.ts`/`.ts` siblings can both be present in a built tree; the Set collapses them
    // to the one migration they describe.
    if (match && !entry.endsWith('.d.ts')) seen.add(match[1]);
  }
  return [...seen].sort((a, b) => Number(a) - Number(b));
}

export async function evaluateSchemaReadiness(
  dataSource: MigrationTableReader,
  directory = resolveMigrationsDirectory(),
): Promise<SchemaReadiness> {
  const expected = expectedMigrationTimestamps(directory);
  const expectedSchemaVersion = expected.length ? expected[expected.length - 1] : null;

  if (expected.length === 0) {
    return {
      ready: false,
      reason: 'ARTIFACT_CARRIES_NO_MIGRATIONS: this build shipped no migration files, so its schema '
        + 'expectation cannot be established. This is a build/packaging fault, not a database fault.',
      expectedCount: 0, appliedCount: 0, missing: [], ahead: [], expectedSchemaVersion: null,
    };
  }

  let rows: Array<{ timestamp: string | number }>;
  try {
    rows = await dataSource.query('SELECT "timestamp" FROM migrations');
  } catch {
    // Includes "relation migrations does not exist", which is a database that has never been
    // migrated at all — the single most important case to refuse.
    return {
      ready: false,
      reason: 'MIGRATIONS_TABLE_UNREADABLE: the migrations table could not be read, so no applied '
        + 'schema version can be established. A database that has never been migrated reports this.',
      expectedCount: expected.length, appliedCount: 0, missing: expected, ahead: [],
      expectedSchemaVersion,
    };
  }

  const applied = new Set(rows.map(row => String(row.timestamp)));
  const missing = expected.filter(timestamp => !applied.has(timestamp));
  const expectedSet = new Set(expected);
  const ahead = [...applied].filter(timestamp => !expectedSet.has(timestamp))
    .sort((a, b) => Number(a) - Number(b));

  if (missing.length > 0) {
    return {
      ready: false,
      reason: `SCHEMA_BEHIND_CODE: ${missing.length} migration(s) this build requires are not `
        + `applied (${missing.join(', ')}). Serving now would fail every read of the tables they `
        + 'create or alter. Run the release migration command before activating this version.',
      expectedCount: expected.length, appliedCount: expected.length - missing.length,
      missing, ahead, expectedSchemaVersion,
    };
  }

  return {
    ready: true,
    reason: ahead.length > 0
      ? `READY_SCHEMA_AHEAD: every migration this build requires is applied, and the database also `
        + `carries ${ahead.length} newer migration(s) this build does not know about. That is the `
        + 'expected shape of a deliberate code rollback onto a forward-migrated database.'
      : 'READY: every migration this build requires is applied.',
    expectedCount: expected.length, appliedCount: expected.length,
    missing: [], ahead, expectedSchemaVersion,
  };
}
