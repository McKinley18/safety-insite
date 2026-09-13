#!/usr/bin/env node
/**
 * §268 — THE PRODUCTION MIGRATION COMMAND. RUNNABLE IN THE DEPLOYED ARTIFACT.
 *
 * ===============================================================================================
 * WHY THE EXISTING COMMAND COULD NOT BE USED.
 *
 *   "migration:run": "typeorm-ts-node-commonjs -d src/database/data-source.ts migration:run"
 *
 * That needs `ts-node` (a devDependency, and the runtime image installs with `--omit=dev`) and it
 * needs `src/` (the image copies `dist`, `scripts`, and four `src/safescope-v2` data directories —
 * `src/database` is not among them). So the one migration command in the repository could not run
 * in the artifact that gets deployed. §266 recorded this; it is why three migrations sit unapplied
 * while Render autoDeploy is on.
 *
 * ===============================================================================================
 * WHAT THIS USES INSTEAD, AND WHY EACH PIECE IS ACTUALLY PRESENT.
 *
 *   plain JavaScript          this file is `.js`, and `scripts/` is already COPYed into the runtime
 *                             image — `start:render` runs `scripts/render-start-diagnostic.js` from
 *                             it today, so the mechanism is proven by the current CMD.
 *   dist/database/data-source.js
 *                             `dist` is COPYed whole. `data-source.ts` already resolves its own
 *                             migrations glob by whether it is running as `.ts` or `.js`, so the
 *                             compiled datasource points at `dist/database/migrations/*.js`
 *                             WITHOUT any change to it.
 *   typeorm                   a production `dependency` (^0.3.31), not a devDependency, so it
 *                             survives `npm install --omit=dev`.
 *
 * Nothing here needs `ts-node`, `src/`, a devDependency, or an interactive shell step.
 *
 * ===============================================================================================
 * IT FAILS CLOSED, LOUDLY, AND WITH A NON-ZERO EXIT.
 *
 * The whole point of running migrations as a separate release step is that a failure must STOP the
 * release rather than fall through into application startup. So: any error exits non-zero, no error
 * is swallowed, and the process never returns 0 on a partial apply. `npm run start:release` chains
 * this with `&&` precisely so the shell enforces the ordering rather than a human remembering it.
 *
 * `--dry-run` reports what WOULD be applied and changes nothing, for the runbook's PREPARE step.
 */
'use strict';

const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run');

/**
 * §268. Emit the structured `migration.failed` event alongside the human-readable message, so a
 * failed release shows up in the same operational stream as everything else rather than only in
 * whoever's terminal ran it. Loaded from `dist` because this script is plain JavaScript running in
 * the production image; if the compiled emitter is not there — which is the very case where the
 * build is broken — the release still fails loudly through the console path below.
 */
function emitMigrationFailure(message) {
  try {
    const { emitOperationalEvent } = require(
      path.join(__dirname, '..', '..', 'dist', 'observability', 'operational-events.js'));
    emitOperationalEvent('migration.failed', { stage: 'release-migration', detail: message });
  } catch {
    // Never let the observability path mask the migration failure it is describing.
  }
}

function fail(message, error) {
  emitMigrationFailure(message);
  console.error(`\nRELEASE MIGRATION FAILED: ${message}`);
  if (error) console.error(String((error && error.stack) || error).slice(0, 4000));
  console.error('\nThe new application version MUST NOT be activated. The schema is in whatever '
    + 'state the last successful migration left it; TypeORM runs each migration in its own '
    + 'transaction, so no migration is half-applied.');
  process.exit(1);
}

async function main() {
  const target = process.env.DATABASE_URL;
  if (!target) fail('DATABASE_URL is not set, so there is no database to migrate.');

  // Printed so the release log records WHICH database was migrated. Credentials are never printed:
  // only host and database name, which are the two facts an operator needs to confirm the target.
  let host = 'unknown';
  let database = 'unknown';
  try {
    const parsed = new URL(target);
    host = parsed.hostname;
    database = parsed.pathname.replace(/^\//, '');
  } catch {
    fail('DATABASE_URL is not a parseable URL.');
  }
  console.log(`release migration target  host=${host} database=${database}`);

  const dataSourcePath = path.join(__dirname, '..', '..', 'dist', 'database', 'data-source.js');
  let dataSource;
  try {
    ({ dataSource } = require(dataSourcePath));
  } catch (error) {
    fail(`the compiled datasource could not be loaded from ${dataSourcePath}. The image must be `
      + 'built before migrations are run.', error);
  }
  if (!dataSource) fail(`${dataSourcePath} exported no \`dataSource\`.`);

  try {
    await dataSource.initialize();
  } catch (error) {
    fail('the database could not be reached.', error);
  }

  try {
    const pending = await dataSource.showMigrations();
    if (DRY_RUN) {
      console.log(pending
        ? 'DRY RUN: migrations are PENDING and would be applied by this command.'
        : 'DRY RUN: no migrations are pending.');
      await dataSource.destroy();
      process.exit(0);
    }
    if (!pending) {
      // Idempotent by design. A second invocation is a normal thing to happen during a retried
      // release and must be a no-op rather than an error or a re-apply.
      console.log('no migrations pending; nothing to apply.');
    } else {
      const applied = await dataSource.runMigrations({ transaction: 'each' });
      if (applied.length === 0) {
        fail('migrations were reported pending but none were applied.');
      }
      for (const migration of applied) {
        console.log(`applied  ${migration.timestamp}  ${migration.name}`);
      }
      console.log(`\n${applied.length} migration(s) applied.`);
    }
  } catch (error) {
    // Explicitly NOT swallowed. A release that continues past this point would activate code
    // against a schema that does not support it.
    await dataSource.destroy().catch(() => {});
    fail('a migration threw. No further migrations were attempted.', error);
  }

  // VERIFY SCHEMA, in the same command, so a release cannot skip it. Uses the same readiness
  // evaluation the running application serves at /health/ready, so the release step and the
  // runtime probe can never disagree about what "current" means.
  try {
    const { evaluateSchemaReadiness } = require(
      path.join(__dirname, '..', '..', 'dist', 'database', 'schema-readiness.js'));
    const readiness = await evaluateSchemaReadiness(dataSource);
    console.log(`\nschema verification  ${readiness.ready ? 'READY' : 'NOT READY'}`);
    console.log(`  expected schema version  ${readiness.expectedSchemaVersion}`);
    console.log(`  applied / expected       ${readiness.appliedCount}/${readiness.expectedCount}`);
    if (readiness.ahead.length) console.log(`  ahead of this build      ${readiness.ahead.join(', ')}`);
    if (!readiness.ready) {
      await dataSource.destroy().catch(() => {});
      fail(readiness.reason);
    }
  } catch (error) {
    if (error && error.__releaseFailure) throw error;
    await dataSource.destroy().catch(() => {});
    fail('post-migration schema verification could not be completed.', error);
  }

  await dataSource.destroy().catch(() => {});
  console.log('\nRELEASE MIGRATION OK — the new application version may now be activated.');
}

main().catch(error => fail('an unexpected error occurred.', error));
