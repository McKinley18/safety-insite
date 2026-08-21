/**
 * KG-2 -- regulatory release lifecycle and active-pointer verification.
 *
 * Runs entirely against a disposable database. Builds its own release fixtures out of a
 * disposable standards corpus, so it never depends on -- or mutates -- the real seeded
 * release.
 *
 * Covers:
 *   1. lifecycle map invariants (no active release before KG-2 activation)
 *   2. activation gates, including a release that fails one
 *   3. atomic activation (A active, no prior active)
 *   4. supersession (B active -> A superseded)
 *   5. idempotent re-activation
 *   6. concurrent activation cannot produce two active releases
 *   7. explicit rollback to an exact release
 *   8. tampered release refused (manifest recomputation)
 *   9. finalizer immutability guard
 *  10. audit trail rows for success and refusal
 *  11. shadow-diff interface numbers for KG-3
 */
import 'dotenv/config';
import { dataSource } from '../src/database/data-source';
import {
  RegulatoryReleaseLifecycleService,
  ReleaseActivationRefused,
} from '../src/standards/releases/regulatory-release-lifecycle.service';
import {
  RELEASE_MANIFEST_ORDER_BY,
  RELEASE_MANIFEST_SELECT_COLUMNS,
  computeReleaseManifest,
  computeSnapshotManifest,
  normalizeStandardRecord,
} from '../src/standards/releases/release-manifest';
import { assessReviewState } from '../src/standards/releases/review-state';
import { releaseCitationKey } from '../src/standards/releases/citation-identity';
import { claimDatabaseOwnership, DatabaseOwnershipRefused } from './lib/test-database-ownership';

const checks: string[] = [];
function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(`FAILED: ${message}`);
  checks.push(message);
}

const ACTOR = 'kg2-verification';

/** KG-4C: the identity this suite claims its disposable database under. */
const SUITE_NAME = 'test:regulatory-release-lifecycle';

/**
 * Builds a finalized release fixture.
 *
 * KG-3A: a release is now an IMMUTABLE SNAPSHOT, so the fixture writes
 * `regulatory_release_records` and folds the manifest over that snapshot -- exactly as
 * finalize-regulatory-release.ts does. It no longer relies on `standards_master.release_id`,
 * which could only ever name one release per row and was the cause of defect C.
 *
 * `approve: true` simulates a reviewer having approved these records. That is a legitimate
 * fixture for exercising activation; it is never applied to the real seeded corpus.
 */
async function finalizeFixture(releaseId: string, citations: string[], opts: { approve: boolean }) {
  const rows = await dataSource.query(
    `SELECT ${RELEASE_MANIFEST_SELECT_COLUMNS} FROM standards_master
     WHERE citation = ANY($1) ORDER BY ${RELEASE_MANIFEST_ORDER_BY}`,
    [citations],
  );
  const manifest = computeReleaseManifest(rows);

  await dataSource.query(`DELETE FROM regulatory_release_records WHERE "releaseId" = $1`, [releaseId]);
  for (const record of manifest.records) {
    const row = record.row;
    const assessment = opts.approve
      ? { state: 'reviewer_approved', reason: 'Fixture: reviewer approval simulated.' }
      : assessReviewState({ ...row, normalized_record_checksum: record.checksum });
    await dataSource.query(
      `INSERT INTO regulatory_release_records
         ("releaseId","standardId","agencyCode","citation","citationKey","recordChecksum",
          "reviewState","reviewStateReason","payload")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [releaseId, row.id, row.agency_code ?? null, row.citation, releaseCitationKey(row.citation),
        record.checksum, assessment.state, assessment.reason,
        JSON.stringify(normalizeStandardRecord(row))],
    );
  }

  const snapshotRows = await dataSource.query(
    `SELECT "agencyCode", citation, "recordChecksum" FROM regulatory_release_records
     WHERE "releaseId" = $1 ORDER BY "agencyCode", citation`, [releaseId],
  );
  const snapshotManifest = computeSnapshotManifest(snapshotRows);
  await dataSource.query(
    `INSERT INTO regulatory_releases
       ("releaseId","releaseVersion","status","manifestChecksum","parserVersion","recordCount")
     VALUES ($1,$2,'provisional',$3,'kg2-fixture-normalizer',$4)
     ON CONFLICT ("releaseId") DO UPDATE SET
       "manifestChecksum" = EXCLUDED."manifestChecksum",
       "recordCount" = EXCLUDED."recordCount",
       "status" = 'provisional'`,
    [releaseId, releaseId.split('.').pop() || '1',
      snapshotManifest.manifestChecksum, snapshotManifest.recordCount],
  );
  return snapshotManifest;
}

async function statusOf(releaseId: string): Promise<string | null> {
  const [row] = await dataSource.query(
    `SELECT status FROM regulatory_releases WHERE "releaseId" = $1`, [releaseId],
  );
  return row?.status ?? null;
}

async function activeCount(): Promise<number> {
  const [row] = await dataSource.query(
    `SELECT COUNT(*)::int AS n FROM regulatory_releases WHERE status = 'active'`,
  );
  return row.n;
}

async function main() {
  const target = new URL(process.env.DATABASE_URL || 'postgresql://localhost/UNSET');
  const dbName = target.pathname.replace('/', '');
  console.log(`Resolved database target: host=${target.hostname} database=${dbName}`);
  if (dbName === 'safescope' || !/^test_/.test(dbName)) {
    throw new Error(`Refusing to run against a non-disposable database: ${dbName}`);
  }

  // KG-4C. The name check above is a FLOOR, not a proof of ownership: `test_kg4b_shadow_20260820`
  // satisfies it and is KG-4B's evidence corpus. This suite REPLACES every release row, so it must
  // prove the database is not merely disposable but ITS OWN. The claim is the first write it makes;
  // a refusal exits before `dataSource.initialize()` and therefore before any mutation.
  try {
    const claim = await claimDatabaseOwnership({ suite: SUITE_NAME });
    console.log(
      `[db-ownership] suite=${claim.suite} database=${claim.database} ` +
      `claim=${claim.freshlyClaimed ? 'NEW' : 'RECLAIMED'}`,
    );
  } catch (error) {
    if (error instanceof DatabaseOwnershipRefused) {
      console.error(`\n  ${error.message}\n  No mutation was attempted.\n`);
      process.exit(1);
    }
    throw error;
  }

  await dataSource.initialize();
  const service = new RegulatoryReleaseLifecycleService(dataSource);

  // Self-resetting so the suite is re-runnable and order-independent alongside the KG-3A
  // suite, which leaves a release active. Disposable DB only -- the guard above refuses
  // anything else. (That the KG-2 migration itself introduces no active release was verified
  // on a fresh database in KG-2 and is re-verified by the migration step, not by this reset.)
  await dataSource.query(`DELETE FROM knowledge_release_events`);
  await dataSource.query(`DELETE FROM regulatory_release_records`);
  await dataSource.query(`DELETE FROM regulatory_releases`);

  const RELEASE_A = 'kg2-fixture-release.A';
  const RELEASE_B = 'kg2-fixture-release.B';
  const RELEASE_C = 'kg2-fixture-release.C';
  const RELEASE_T = 'kg2-fixture-release.TAMPERED';

  // Disposable corpus slices. Distinct citations so the fixtures do not overlap.
  const all: Array<{ citation: string }> = await dataSource.query(
    `SELECT citation FROM standards_master ORDER BY agency_code, citation`,
  );
  assert(all.length >= 11, `Disposable corpus has enough standards to slice (${all.length}).`);
  // Disjoint slices: a fixture stamps release_id onto its rows, so two fixtures sharing a
  // citation would steal each other's records and break the loser's manifest.
  const citationsA = all.slice(0, 3).map(r => r.citation);
  const citationsB = all.slice(3, 6).map(r => r.citation);
  const citationsC = all.slice(6, 7).map(r => r.citation);
  const citationsT = all.slice(7, 8).map(r => r.citation);
  const citationsRace = all.slice(8, 11).map(r => r.citation);

  // ------------------------------------------------------------------ 1. starting state
  assert(await activeCount() === 0, 'No release is active before any activation (KG-2 adds no active row).');
  assert(await service.getActiveRelease() === null, 'getActiveRelease() returns null when nothing is active.');

  // ------------------------------------------------------------------ 2. gates
  await finalizeFixture(RELEASE_A, citationsA, { approve: true });
  await finalizeFixture(RELEASE_B, citationsB, { approve: true });
  // C fails exactly one mandatory gate: no record survives the governed filter.
  await finalizeFixture(RELEASE_C, citationsC, { approve: false });

  const eligA = await service.evaluateActivation(RELEASE_A, ['provisional']);
  assert(eligA.eligible && eligA.failedGates.length === 0,
    `Release A passes every activation gate (${eligA.gates.length} gates evaluated).`);

  const eligC = await service.evaluateActivation(RELEASE_C, ['provisional']);
  assert(!eligC.eligible, 'Release C is refused activation.');
  assert(eligC.failedGates.length === 1 && eligC.failedGates[0] === 'governedRecordsPresent',
    `Release C fails exactly the governed-records gate (got ${JSON.stringify(eligC.failedGates)}).`);

  const eligMissing = await service.evaluateActivation('kg2-does-not-exist', ['provisional']);
  assert(!eligMissing.eligible && eligMissing.failedGates.includes('releaseExists'),
    'A non-existent release cannot be activated.');

  // ------------------------------------------------------- 3. first activation is atomic
  const activatedA = await service.activate(RELEASE_A, ACTOR, 'KG-2 first activation');
  assert(activatedA.outcome === 'activated' && activatedA.previousReleaseId === null,
    'First activation succeeds with no prior active release.');
  assert(await statusOf(RELEASE_A) === 'active', 'Release A is active.');
  assert(await activeCount() === 1, 'Exactly one release is active after first activation.');

  // ------------------------------------------------------------- 4. supersession on B
  const activatedB = await service.activate(RELEASE_B, ACTOR, 'KG-2 forward promotion');
  assert(activatedB.outcome === 'activated' && activatedB.previousReleaseId === RELEASE_A,
    'Activating B reports A as the previous release.');
  assert(await statusOf(RELEASE_B) === 'active', 'Release B is active.');
  assert(await statusOf(RELEASE_A) === 'superseded', 'Release A is superseded, not deleted.');
  assert(await activeCount() === 1, 'Still exactly one active release after promotion.');
  const [bRow] = await dataSource.query(
    `SELECT "parentReleaseId", "activatedAt" FROM regulatory_releases WHERE "releaseId" = $1`, [RELEASE_B],
  );
  assert(bRow.parentReleaseId === RELEASE_A,
    'B records A as parentReleaseId at activation time (rollback target, not reconstructed).');
  assert(!!bRow.activatedAt, 'activatedAt is stamped.');

  // ---------------------------------------------------------- 5. idempotent re-activation
  const again = await service.activate(RELEASE_B, ACTOR, 'repeat');
  assert(again.outcome === 'already_active', 'Re-activating the active release is an idempotent no-op.');
  assert(await activeCount() === 1 && await statusOf(RELEASE_A) === 'superseded',
    'Idempotent re-activation changes nothing else.');

  // --------------------------------------------------------- 6. C refused, B still active
  let refused: unknown = null;
  try {
    await service.activate(RELEASE_C, ACTOR, 'should be refused');
  } catch (error) { refused = error; }
  assert(refused instanceof ReleaseActivationRefused, 'Activating invalid release C throws a refusal.');
  assert(await statusOf(RELEASE_B) === 'active' && await statusOf(RELEASE_C) === 'provisional',
    'After a refused activation, B remains active and C remains provisional.');
  assert(await activeCount() === 1, 'A refused activation leaves exactly one active release.');

  // ------------------------------------------------------------------ 7. concurrency
  // Two different releases race to activate. The partial unique index plus the advisory lock
  // must make exactly one win -- never two active rows.
  await finalizeFixture(RELEASE_A, citationsA, { approve: true });   // back to provisional
  const raceReleaseId = 'kg2-fixture-release.RACE';
  await finalizeFixture(raceReleaseId, citationsRace, { approve: true });
  await dataSource.query(`UPDATE regulatory_releases SET status = 'provisional' WHERE "releaseId" = $1`, [RELEASE_B]);
  await dataSource.query(`UPDATE regulatory_releases SET status = 'superseded' WHERE status = 'active'`);
  await dataSource.query(`UPDATE regulatory_releases SET status = 'provisional' WHERE "releaseId" = ANY($1)`,
    [[RELEASE_A, raceReleaseId]]);
  assert(await activeCount() === 0, 'Race fixture starts with no active release.');

  const raceResults = await Promise.allSettled([
    service.activate(RELEASE_A, `${ACTOR}-racer-1`, 'concurrent'),
    service.activate(raceReleaseId, `${ACTOR}-racer-2`, 'concurrent'),
  ]);
  const fulfilled = raceResults.filter(r => r.status === 'fulfilled').length;
  assert(await activeCount() === 1,
    `Concurrent activation of two releases leaves exactly one active (settled: ${fulfilled} fulfilled).`);

  // The advisory lock serializes callers, so the race above resolves in order rather than
  // colliding. The HARD guarantee is the partial unique index: prove directly that the
  // database itself refuses a second active row even when application logic is bypassed.
  let doubleActive: unknown = null;
  try {
    await dataSource.query(
      `UPDATE regulatory_releases SET status = 'active' WHERE "releaseId" = $1`, [RELEASE_C],
    );
  } catch (error) { doubleActive = error; }
  assert(doubleActive, 'The database itself refuses a second active release (partial unique index).');
  assert(await activeCount() === 1, 'Still exactly one active release after the bypass attempt.');

  // ------------------------------------------------------------------ 8. explicit rollback
  // Normalise to a known state: B active, A superseded.
  await dataSource.query(`UPDATE regulatory_releases SET status = 'superseded' WHERE status = 'active'`);
  await dataSource.query(`UPDATE regulatory_releases SET status = 'provisional' WHERE "releaseId" = $1`, [RELEASE_B]);
  await service.activate(RELEASE_B, ACTOR, 'set up rollback scenario');
  assert(await statusOf(RELEASE_B) === 'active' && await statusOf(RELEASE_A) === 'superseded',
    'Rollback scenario prepared: B active, A superseded.');

  const rolled = await service.rollbackTo(RELEASE_A, ACTOR, 'KG-2 rollback verification');
  assert(rolled.outcome === 'rolled_back' && rolled.previousReleaseId === RELEASE_B,
    'Rollback targets an exact named release and reports the release it replaced.');
  assert(await statusOf(RELEASE_A) === 'active', 'After rollback, A is active again.');
  assert(await statusOf(RELEASE_B) === 'rolled_back', 'After rollback, B is marked rolled_back and retained.');
  assert(await activeCount() === 1, 'Exactly one active release after rollback.');
  const [bStillThere] = await dataSource.query(
    `SELECT "releaseId","manifestChecksum" FROM regulatory_releases WHERE "releaseId" = $1`, [RELEASE_B],
  );
  assert(!!bStillThere?.manifestChecksum, 'Rolled-back release B is retained in full, not deleted.');

  // ------------------------------------------------------- 9. tampered release is refused
  await finalizeFixture(RELEASE_T, citationsT, { approve: true });
  const beforeTamper = await service.evaluateActivation(RELEASE_T, ['provisional']);
  assert(beforeTamper.eligible, 'Untampered fixture release T is eligible before mutation.');

  // KG-3A: mutating the LIVE corpus must no longer disturb a finalized release. Before the
  // snapshot existed, this edit broke the release's manifest, because verification read
  // standards_master. That coupling is what made releases non-immutable.
  await dataSource.query(
    `UPDATE standards_master SET standard_text = standard_text || ' [live corpus edited after finalization]'
     WHERE citation = ANY($1)`, [citationsT],
  );
  const afterLiveEdit = await service.evaluateActivation(RELEASE_T, ['provisional']);
  assert(afterLiveEdit.eligible,
    'Editing the live corpus after finalization does NOT invalidate the frozen release snapshot.');

  // Tampering with the snapshot itself is what must be caught.
  await dataSource.query(
    `UPDATE regulatory_release_records
     SET "recordChecksum" = repeat('0', 64) WHERE "releaseId" = $1`, [RELEASE_T],
  );
  const afterTamper = await service.evaluateActivation(RELEASE_T, ['provisional']);
  assert(!afterTamper.eligible && afterTamper.failedGates.includes('manifestChecksumVerifies'),
    'A tampered release snapshot is detected and blocks activation.');
  let tamperRefused: unknown = null;
  try { await service.activate(RELEASE_T, ACTOR, 'tampered'); } catch (e) { tamperRefused = e; }
  assert(tamperRefused instanceof ReleaseActivationRefused, 'Activating a tampered release throws a refusal.');
  assert(await statusOf(RELEASE_A) === 'active', 'A remains active after the tampered activation attempt.');

  // ------------------------------------------------------------------ 10. audit trail
  const events = await dataSource.query(
    `SELECT event, outcome, "fromReleaseId", "toReleaseId", actor, reason
     FROM knowledge_release_events ORDER BY "createdAt"`,
  );
  assert(events.length >= 5, `Pointer movements are audited (${events.length} events).`);
  assert(events.some((e: any) => e.event === 'activation' && e.outcome === 'succeeded'
    && e.toReleaseId === RELEASE_B && e.fromReleaseId === RELEASE_A),
    'A successful promotion records both from- and to-release.');
  assert(events.some((e: any) => e.event === 'rollback' && e.outcome === 'succeeded'
    && e.toReleaseId === RELEASE_A && e.fromReleaseId === RELEASE_B),
    'The rollback is audited with its exact target.');
  const refusals = events.filter((e: any) => e.outcome === 'refused');
  assert(refusals.length >= 2 && refusals.every((e: any) => !!e.actor),
    `Refused activations are audited too (${refusals.length} refusals recorded).`);

  // ------------------------------------------------- 11. shadow-diff interface for KG-3
  const scopeA = await service.describeReleaseScope(RELEASE_A);
  assert(scopeA.totalRecords === citationsA.length && scopeA.governedRecords === citationsA.length,
    `Shadow interface reports release A scope (${scopeA.governedRecords}/${scopeA.totalRecords} governed).`);
  const scopeC = await service.describeReleaseScope(RELEASE_C);
  assert(scopeC.totalRecords > 0 && scopeC.governedRecords === 0
    && (scopeC.mechanicallyValidatedRecords + scopeC.unreviewedRecords) === scopeC.totalRecords,
    'Shadow interface exposes an unreviewed release as contributing zero governed records.');

  await dataSource.destroy();
  console.log(`\nregulatory-release-lifecycle: ${checks.length}/${checks.length} checks passed`);
  for (const check of checks) console.log(`  ok  ${check}`);
}

main().catch(async error => {
  if (dataSource.isInitialized) await dataSource.destroy();
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
