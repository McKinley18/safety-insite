/**
 * ONE INSPECTION -> ONE RETAINED REPORT SNAPSHOT.
 *
 * Brings an existing database up to the v1.0 report contract. Under the previous contract a
 * reopened-and-recompleted inspection accumulated report versions: `version 2` became current and
 * `version 1` was marked `superseded` but kept, along with its frozen snapshot and its PDF. The
 * contract is now one current report per inspection, so those retained predecessors are obsolete
 * data, and hiding them in the UI while leaving the PDFs on disk would be the dishonest half of the
 * change.
 *
 * This is deliberately a SCRIPT and not part of migration 1800000017000. The obsolete rows are only
 * half the problem: their PDFs are objects in the storage provider, and a SQL migration cannot
 * delete an S3 object or a file. A migration that dropped the rows would silently orphan every
 * predecessor artifact -- exactly the outcome the contract forbids.
 *
 * DETERMINISM. For each report the retained snapshot is the HIGHEST `version` whose status is
 * `generated`. That is the row the product already served as current, so no report changes content
 * here. A report whose only rows are non-generated (a generation that never completed) is left
 * completely alone: it has nothing current to preserve and nothing proven to be obsolete.
 *
 * ORDERING. Read the inventory, prove the retained snapshot exists and has an artifact, and only
 * then delete predecessors. Nothing is deleted for a report whose current snapshot cannot be
 * confirmed.
 *
 * SAFETY. The resolved database is printed and must be an explicitly disposable verification
 * database. It refuses to run against the `safescope` development database and refuses to run
 * without --apply, which makes the default a read-only inventory.
 *
 *   DATABASE_URL=postgres://.../test_x npx ts-node scripts/retire-superseded-report-snapshots.ts
 *   DATABASE_URL=postgres://.../test_x npx ts-node scripts/retire-superseded-report-snapshots.ts --apply
 */
const { Client } = require('pg') as { Client: new (options: { connectionString: string }) => any };
import { resolve as resolvePath, sep } from 'path';
import { unlink } from 'fs/promises';

const PROTECTED_DATABASES = new Set(['safescope', 'sentinel_dev', 'sentinel_safety', 'postgres']);

type SnapshotRow = {
  id: string;
  reportId: string;
  inspectionId: string;
  version: number;
  status: string;
  storageObjectId: string | null;
  sha256: string | null;
};

async function main() {
  const connectionString = process.env.DATABASE_URL || '';
  if (!connectionString) throw new Error('DATABASE_URL is required.');
  const apply = process.argv.includes('--apply');

  const db = new Client({ connectionString });
  await db.connect();
  const target = (await db.query(
    `SELECT current_database() AS database, inet_server_addr()::text AS host, current_user AS "user"`,
  )).rows[0];
  console.log(`resolved target: database=${target.database} host=${target.host || 'local socket'} user=${target.user}`);
  if (PROTECTED_DATABASES.has(target.database)) {
    await db.end();
    throw new Error(`Refusing to run against "${target.database}". This script mutates report data and may only run against a disposable verification database.`);
  }
  if (!/^(test|insite|safety)_/.test(target.database)) {
    await db.end();
    throw new Error(`Refusing to run against "${target.database}": it is not positively identifiable as a disposable verification database (expected a test_/insite_/safety_ prefix).`);
  }

  const snapshots: SnapshotRow[] = (await db.query(
    `SELECT v.id, v."reportId", r."inspectionId", v.version, v.status, v."storageObjectId", v.sha256
       FROM inspection_report_versions v
       JOIN inspection_reports r ON r.id = v."reportId"
      ORDER BY v."reportId", v.version`,
  )).rows;

  const byReport = new Map<string, SnapshotRow[]>();
  for (const row of snapshots) {
    if (!byReport.has(row.reportId)) byReport.set(row.reportId, []);
    byReport.get(row.reportId)!.push(row);
  }

  const before = (await db.query(
    `SELECT (SELECT count(*)::int FROM inspection_reports) reports,
            (SELECT count(*)::int FROM inspection_report_versions) snapshots,
            (SELECT count(*)::int FROM storage_objects WHERE category='report' AND status='ready') "readyArtifacts"`,
  )).rows[0];

  const plan: Array<{ reportId: string; inspectionId: string; retain: SnapshotRow; retire: SnapshotRow[] }> = [];
  const skipped: Array<{ reportId: string; reason: string }> = [];
  for (const [reportId, rows] of byReport) {
    const generated = rows.filter(row => row.status === 'generated').sort((a, b) => b.version - a.version);
    const retain = generated[0];
    if (!retain) { skipped.push({ reportId, reason: 'no generated snapshot to establish as current' }); continue; }
    if (!retain.storageObjectId) { skipped.push({ reportId, reason: 'current snapshot has no stored artifact' }); continue; }
    const retire = rows.filter(row => row.id !== retain.id);
    if (retire.length) plan.push({ reportId, inspectionId: retain.inspectionId, retain, retire });
  }

  console.log(JSON.stringify({ before, reportsWithPredecessors: plan.length, skipped }, null, 2));
  for (const item of plan) {
    console.log(`report ${item.reportId} (inspection ${item.inspectionId}): retain v${item.retain.version} sha ${String(item.retain.sha256).slice(0, 12)}…, retire ${item.retire.map(row => `v${row.version}(${row.status})`).join(', ')}`);
  }

  if (!apply) {
    console.log('inventory only. Re-run with --apply to retire the predecessors listed above.');
    await db.end();
    return;
  }

  const localRoot = process.env.STORAGE_LOCAL_ROOT ? resolvePath(process.env.STORAGE_LOCAL_ROOT) : '';
  let rowsDeleted = 0;
  let artifactsRetired = 0;
  let bytesLeftInPlace = 0;

  for (const item of plan) {
    // Re-read the retained snapshot inside the same transaction that removes its predecessors, so
    // the current report is proven to still exist at the moment the deletion happens.
    await db.query('BEGIN');
    try {
      const confirmed = (await db.query(
        `SELECT id, "storageObjectId" FROM inspection_report_versions WHERE id=$1 AND status='generated' FOR UPDATE`,
        [item.retain.id],
      )).rows[0];
      if (!confirmed?.storageObjectId) throw new Error(`current snapshot ${item.retain.id} vanished; nothing retired for report ${item.reportId}`);
      const objectCheck = (await db.query(
        `SELECT id FROM storage_objects WHERE id=$1 AND status='ready' AND "deletedAt" IS NULL`,
        [confirmed.storageObjectId],
      )).rows[0];
      if (!objectCheck) throw new Error(`current artifact for report ${item.reportId} is not retrievable; nothing retired`);

      for (const stale of item.retire) {
        await db.query(`DELETE FROM inspection_report_versions WHERE id=$1`, [stale.id]);
        rowsDeleted += 1;
        if (stale.storageObjectId) {
          await db.query(
            `UPDATE storage_objects SET status='deleted', "deletedAt"=now() WHERE id=$1 AND status<>'deleted'`,
            [stale.storageObjectId],
          );
        }
      }
      await db.query('COMMIT');
    } catch (error) {
      await db.query('ROLLBACK');
      console.error(`report ${item.reportId}: ${error instanceof Error ? error.message : error}`);
      continue;
    }

    // Bytes are destroyed only after the row change has COMMITTED, so a failure here can only ever
    // leave a file no record points at -- never a record pointing at a file that is gone.
    for (const stale of item.retire) {
      if (!stale.storageObjectId) continue;
      const object = (await db.query(
        `SELECT "objectKey", provider FROM storage_objects WHERE id=$1`, [stale.storageObjectId],
      )).rows[0];
      if (!object) continue;
      if (object.provider !== 'local_test' || !localRoot) { bytesLeftInPlace += 1; continue; }
      const path = resolvePath(localRoot, object.objectKey);
      if (!path.startsWith(`${localRoot}${sep}`)) { bytesLeftInPlace += 1; continue; }
      // ENOENT is success, not a failure: the bytes are already absent, which is the state this
      // is trying to reach. Any other error means a file survived and must be reported as such.
      const removed = await unlink(path).then(() => true).catch((error: NodeJS.ErrnoException) => error.code === 'ENOENT');
      if (removed) artifactsRetired += 1; else bytesLeftInPlace += 1;
    }
  }

  const after = (await db.query(
    `SELECT (SELECT count(*)::int FROM inspection_reports) reports,
            (SELECT count(*)::int FROM inspection_report_versions) snapshots,
            (SELECT count(*)::int FROM storage_objects WHERE category='report' AND status='ready') "readyArtifacts",
            (SELECT count(*)::int FROM (
               SELECT "reportId" FROM inspection_report_versions GROUP BY "reportId" HAVING count(*) > 1
             ) t) "reportsWithMoreThanOneSnapshot"`,
  )).rows[0];

  console.log(JSON.stringify({ applied: true, rowsDeleted, artifactsRetired, bytesLeftInPlace, before, after }, null, 2));
  if (after.reportsWithMoreThanOneSnapshot !== 0) {
    process.exitCode = 1;
    console.error('INVARIANT NOT MET: a report still has more than one snapshot.');
  }
  await db.end();
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
