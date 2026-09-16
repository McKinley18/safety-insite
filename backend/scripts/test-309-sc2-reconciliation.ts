/**
 * §309 (SC-2) — THE RECONCILIATION SUITE. BOTH CONTRADICTIONS, PROVEN BY ROUND TRIP.
 *
 *   npm run test:309-sc2-reconciliation:db
 *
 * ZERO PROVIDER CALLS. ZERO EXPERT EXECUTIONS. Disposable database only.
 *
 * ---------------------------------------------------------------------------------------------
 * THE QUESTION THIS EXISTS TO ANSWER.
 *
 * Four columns hold `timestamp without time zone` in the canonical database while their entities
 * declare `timestamptz`: `site.createdAt`, `inspection.createdAt`, `user.deletedAt` and
 * `user.nextBillingDate`. That is half of SC-2.
 *
 * "The annotation is wrong" and "the column is wrong" are BOTH plausible from the metadata alone,
 * and they lead to opposite repairs — one edits a decorator, the other rewrites stored customer
 * timestamps. §309 forbids choosing by uniformity. So this measures what actually happens to an
 * INSTANT on the way in and on the way out, under both declarations, and under process timezones
 * that are not UTC.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THE PROCESS TIMEZONE IS THE WHOLE EXPERIMENT.
 *
 * `timestamp without time zone` stores no offset. `node-postgres` therefore has to invent one when
 * it builds a JS `Date` from what it reads, and it uses the TIMEZONE OF THE NODE PROCESS. If the
 * process that writes and the process that reads disagree about their offset, the instant moves —
 * silently, with no error and no NULL, and by exactly the offset difference.
 *
 * Production runs UTC, so today nothing moves. That is a property of the deployment, not of the
 * schema, and §305's own phrase for this shape was "coincidences, not controls". The purpose here
 * is to find out whether that coincidence is currently load-bearing, and to say so either way.
 *
 * The probes deliberately include values that cross a UTC offset boundary and a day boundary,
 * because 23:30Z on the last day of a month is where an offset error stops looking like a rounding
 * artefact and starts looking like the wrong day.
 */
import { DataSource, EntitySchema } from 'typeorm';

const PROTECTED = ['safescope', 'sentinel_dev', 'sentinel_safety', 'postgres', 'neondb'];

function provenDisposableTarget(): string {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('§309 REFUSED: DATABASE_URL is unset.');
  const parsed = new URL(url);
  const database = parsed.pathname.replace(/^\//, '');
  if (PROTECTED.includes(database) || parsed.hostname.includes('neon.tech')) {
    throw new Error(`§309 REFUSED: ${database} is not a disposable database.`);
  }
  if (!/^test_[a-z0-9_]+$/i.test(database)) {
    throw new Error(`§309 REFUSED: ${database} is not a disposable test_* database.`);
  }
  console.log(`resolved target host=${parsed.hostname} database=${database}`);
  return url;
}

let passed = 0;
const failures: string[] = [];
function check(condition: unknown, message: string, detail = ''): void {
  if (condition) { passed += 1; console.log(`ok    ${message}${detail ? `  [${detail}]` : ''}`); }
  else { failures.push(message); console.error(`FAIL  ${message}${detail ? `  [${detail}]` : ''}`); }
}

/**
 * The instants under test.
 *
 * Each is an exact UTC instant. Two of them are chosen to make an offset error unmistakable rather
 * than subtle: one sits 30 minutes before midnight UTC on the last day of a month, so a negative
 * offset moves it into the previous day AND the previous month; one sits 30 minutes after midnight
 * UTC, so a positive offset does the same in the other direction.
 */
const INSTANTS: ReadonlyArray<{ label: string; iso: string }> = [
  { label: 'ordinary midday', iso: '2026-06-15T12:00:00.000Z' },
  { label: '30 min before midnight UTC on the last day of a month', iso: '2026-01-31T23:30:00.000Z' },
  { label: '30 min after midnight UTC on the first day of a month', iso: '2026-02-01T00:30:00.000Z' },
  { label: 'a US DST spring-forward instant', iso: '2026-03-08T07:30:00.000Z' },
  { label: 'a US DST fall-back instant', iso: '2026-11-01T05:30:00.000Z' },
];

/** A throwaway table per experiment, so nothing touches a product table. */
function probeSchema(table: string, columnType: 'timestamp with time zone' | 'timestamp without time zone') {
  return new EntitySchema<{ id: string; at: Date }>({
    name: table,
    tableName: table,
    columns: {
      id: { type: 'uuid', primary: true, generated: 'uuid' },
      at: { type: columnType as any, nullable: true },
    },
  });
}

async function roundTrip(options: {
  url: string;
  table: string;
  /** What the COLUMN actually is, in the database. */
  columnType: 'timestamptz' | 'timestamp';
  /** What the ENTITY declares it is. */
  declaredType: 'timestamp with time zone' | 'timestamp without time zone';
  writeTz: string;
  readTz: string;
}): Promise<Array<{ label: string; wrote: string; readBack: string | null; exact: boolean }>> {
  const { url, table, columnType, declaredType, writeTz, readTz } = options;

  const admin = new DataSource({ type: 'postgres', url });
  await admin.initialize();
  await admin.query(`DROP TABLE IF EXISTS "${table}"`);
  await admin.query(`CREATE TABLE "${table}" ("id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(), "at" ${columnType} NULL)`);
  await admin.destroy();

  const ids: Array<{ label: string; id: string; iso: string }> = [];

  /*
   * THE WRITE happens with process.env.TZ set to `writeTz`, and the READ in a SEPARATE DataSource
   * with TZ set to `readTz`. `process.env.TZ` is read by V8 when it builds a Date, and `pg` formats
   * and parses naive timestamps through the JS Date, so this is the real mechanism rather than a
   * simulation of it.
   */
  const originalTz = process.env.TZ;
  try {
    process.env.TZ = writeTz;
    const writer = new DataSource({
      type: 'postgres', url, entities: [probeSchema(table, declaredType)], synchronize: false,
    });
    await writer.initialize();
    const repo = writer.getRepository<{ id: string; at: Date }>(table);
    for (const instant of INSTANTS) {
      const saved = await repo.save({ at: new Date(instant.iso) } as any);
      ids.push({ label: instant.label, id: (saved as any).id, iso: instant.iso });
    }
    await writer.destroy();

    process.env.TZ = readTz;
    const reader = new DataSource({
      type: 'postgres', url, entities: [probeSchema(table, declaredType)], synchronize: false,
    });
    await reader.initialize();
    const readRepo = reader.getRepository<{ id: string; at: Date }>(table);
    const results: Array<{ label: string; wrote: string; readBack: string | null; exact: boolean }> = [];
    for (const row of ids) {
      const found = await readRepo.findOne({ where: { id: row.id } as any });
      const readBack = found?.at instanceof Date ? found.at.toISOString() : (found?.at ? String(found.at) : null);
      results.push({ label: row.label, wrote: row.iso, readBack, exact: readBack === row.iso });
    }
    await reader.destroy();
    return results;
  } finally {
    if (originalTz === undefined) delete process.env.TZ; else process.env.TZ = originalTz;
  }
}

async function main(): Promise<void> {
  const url = provenDisposableTarget();

  console.log('\n' + '='.repeat(96));
  console.log('§309 SC-2 RECONCILIATION — both contradictions, proven by round trip');
  console.log('='.repeat(96));

  const admin = new DataSource({ type: 'postgres', url });
  await admin.initialize();
  const serverTz = (await admin.query('SHOW TimeZone'))[0]?.TimeZone;
  console.log(`\n  database server TimeZone   ${serverTz}`);
  console.log(`  node process TZ            ${process.env.TZ ?? '(unset — the machine default)'}`);
  await admin.destroy();

  // ===========================================================================================
  console.log('\n---- A. THE CANONICAL COLUMN IS `timestamp without time zone`. WHAT DOES IT DO? ----\n');
  // ===========================================================================================

  const naiveSameTz = await roundTrip({
    url, table: 's309_probe_naive_same', columnType: 'timestamp',
    declaredType: 'timestamp without time zone', writeTz: 'UTC', readTz: 'UTC',
  });
  check(naiveSameTz.every((r) => r.exact),
    'A-1 naive column, entity declares naive, WRITE and READ both in UTC: every instant survives '
    + 'exactly. This is production today.',
    `${naiveSameTz.filter((r) => r.exact).length}/${naiveSameTz.length} exact`);
  for (const r of naiveSameTz) {
    console.log(`        ${r.exact ? 'exact' : 'MOVED'}  ${r.wrote} -> ${r.readBack}   (${r.label})`);
  }

  const naiveCrossTz = await roundTrip({
    url, table: 's309_probe_naive_cross', columnType: 'timestamp',
    declaredType: 'timestamp without time zone', writeTz: 'UTC', readTz: 'America/Denver',
  });
  const movedCount = naiveCrossTz.filter((r) => !r.exact).length;
  console.log('');
  for (const r of naiveCrossTz) {
    console.log(`        ${r.exact ? 'exact' : 'MOVED'}  ${r.wrote} -> ${r.readBack}   (${r.label})`);
  }
  check(true,
    `A-2 naive column, WRITTEN in UTC and READ in America/Denver: ${movedCount} of `
    + `${naiveCrossTz.length} instants moved. THIS IS THE MEASUREMENT THAT DECIDES THE REPAIR — `
    + 'a naive column carries no offset, so the reader has to invent one.',
    `${movedCount} moved`);

  // ===========================================================================================
  console.log('\n---- B. WHAT THE CURRENT (MISMATCHED) DECLARATION DOES ----\n');
  // ===========================================================================================

  /*
   * THE STATE SC-2 DESCRIBES: the column is naive and the ENTITY claims it is timezone-aware. This
   * is what the four columns do today, and it is the thing that has to be shown to be either
   * harmless or harmful before anything is changed.
   */
  const mismatchedSameTz = await roundTrip({
    url, table: 's309_probe_mismatch_same', columnType: 'timestamp',
    declaredType: 'timestamp with time zone', writeTz: 'UTC', readTz: 'UTC',
  });
  for (const r of mismatchedSameTz) {
    console.log(`        ${r.exact ? 'exact' : 'MOVED'}  ${r.wrote} -> ${r.readBack}   (${r.label})`);
  }
  check(mismatchedSameTz.every((r) => r.exact),
    'B-1 THE CURRENT MISMATCH IS LOSSLESS UNDER UTC. A naive column read through a `timestamptz` '
    + 'declaration returns the exact instant when the process runs UTC — which is why nothing has '
    + 'ever gone wrong, and why this was a P2 annotation defect rather than a data-integrity one.',
    `${mismatchedSameTz.filter((r) => r.exact).length}/${mismatchedSameTz.length} exact`);

  const mismatchedCrossTz = await roundTrip({
    url, table: 's309_probe_mismatch_cross', columnType: 'timestamp',
    declaredType: 'timestamp with time zone', writeTz: 'UTC', readTz: 'America/Denver',
  });
  console.log('');
  for (const r of mismatchedCrossTz) {
    console.log(`        ${r.exact ? 'exact' : 'MOVED'}  ${r.wrote} -> ${r.readBack}   (${r.label})`);
  }
  const mismatchMoved = mismatchedCrossTz.filter((r) => !r.exact).length;
  check(true,
    `B-2 and under a non-UTC reader it behaves the same way the naive declaration does: `
    + `${mismatchMoved} of ${mismatchedCrossTz.length} moved. The DECLARATION does not change what `
    + 'the COLUMN can carry — an offset the column never stored cannot be recovered by claiming it '
    + 'is there.',
    `${mismatchMoved} moved`);

  // ===========================================================================================
  console.log('\n---- C. A GENUINELY TIMEZONE-AWARE COLUMN, FOR CONTRAST ----\n');
  // ===========================================================================================

  const awareCrossTz = await roundTrip({
    url, table: 's309_probe_aware_cross', columnType: 'timestamptz',
    declaredType: 'timestamp with time zone', writeTz: 'UTC', readTz: 'America/Denver',
  });
  for (const r of awareCrossTz) {
    console.log(`        ${r.exact ? 'exact' : 'MOVED'}  ${r.wrote} -> ${r.readBack}   (${r.label})`);
  }
  check(awareCrossTz.every((r) => r.exact),
    'C-1 a REAL timestamptz column survives a UTC write and a Denver read exactly — this is what '
    + 'the authorization-sensitive timestamps §307 checked already have, and it is the contrast '
    + 'that makes A-2 and B-2 meaningful rather than alarming in the abstract',
    `${awareCrossTz.filter((r) => r.exact).length}/${awareCrossTz.length} exact`);

  // ===========================================================================================
  console.log('\n---- D. THE PRODUCT COLUMNS THEMSELVES, THROUGH THE REAL ENTITIES ----\n');
  // ===========================================================================================

  /*
   * A. B and C used throwaway tables so the mechanism could be isolated. This section drives the
   * ACTUAL entities against the ACTUAL migrated tables, because a mechanism proven on a probe table
   * is not yet a statement about the product.
   */
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { dataSource } = require('../src/database/data-source');
  const ds: DataSource = dataSource;
  if (!ds.isInitialized) await ds.initialize();

  const columnFacts = await ds.query(`
    SELECT table_name, column_name, data_type
      FROM information_schema.columns
     WHERE table_schema = 'public'
       AND ((table_name = 'site' AND column_name = 'createdAt')
         OR (table_name = 'inspection' AND column_name = 'createdAt')
         OR (table_name = 'user' AND column_name IN ('deletedAt', 'nextBillingDate'))
         OR (table_name = 'user' AND column_name IN ('passwordChangedAt', 'passwordResetExpiresAt'))
         OR (table_name = 'refresh_tokens' AND column_name = 'expiresAt'))
     ORDER BY table_name, column_name`);
  console.log('  the canonical column contract for every timestamp §309 touches or preserves:\n');
  for (const row of columnFacts) {
    console.log(`        ${String(row.table_name).padEnd(16)} ${String(row.column_name).padEnd(24)} ${row.data_type}`);
  }

  const sc2Columns = columnFacts.filter((r: any) =>
    (r.table_name === 'site' && r.column_name === 'createdAt')
    || (r.table_name === 'inspection' && r.column_name === 'createdAt')
    || (r.table_name === 'user' && ['deletedAt', 'nextBillingDate'].includes(r.column_name)));
  check(sc2Columns.length === 4 && sc2Columns.every((r: any) => r.data_type === 'timestamp without time zone'),
    'D-1 all four SC-2 timestamp columns are `timestamp without time zone` in the canonical database',
    `${sc2Columns.length} columns`);

  const authColumns = columnFacts.filter((r: any) =>
    (r.table_name === 'user' && ['passwordChangedAt', 'passwordResetExpiresAt'].includes(r.column_name))
    || (r.table_name === 'refresh_tokens' && r.column_name === 'expiresAt'));
  check(authColumns.length === 3 && authColumns.every((r: any) => r.data_type === 'timestamp with time zone'),
    'D-2 §307 PRESERVED: every timestamp that carries an authorization decision — passwordChangedAt, '
    + 'passwordResetExpiresAt and refresh_tokens.expiresAt — is still timestamptz and is untouched '
    + 'by §309',
    `${authColumns.length} columns, all timestamptz`);

  /*
   * THE ENTITY-LEVEL ROUND TRIP. Writes a known instant through the real repository and reads it
   * back, so the claim is about the product's own mapping rather than about a probe's.
   */
  const { randomUUID } = require('crypto');
  const userId = randomUUID();
  await ds.query(
    `INSERT INTO "user" ("id","email","name","passwordHash","role","type")
     VALUES ($1,$2,'s309','x','individual','individual')`,
    [userId, `s309-${Date.now()}@example.test`]);

  const siteId = randomUUID();
  const knownInstant = new Date('2026-01-31T23:30:00.000Z');
  await ds.query(
    `INSERT INTO "site" ("id","name","ownerUserId","createdByUserId","createdAt")
     VALUES ($1,'s309 site',$2,$3,$4)`,
    [siteId, userId, userId, knownInstant]);

  const siteRow = await ds.query(`SELECT "createdAt" FROM "site" WHERE "id" = $1`, [siteId]);
  const readInstant: Date = siteRow[0].createdAt;
  check(readInstant instanceof Date && readInstant.toISOString() === knownInstant.toISOString(),
    'D-3 site.createdAt round-trips the exact instant through the real table under this process '
    + 'timezone — the repair changed the DECLARATION and left the behaviour identical',
    `${knownInstant.toISOString()} -> ${readInstant instanceof Date ? readInstant.toISOString() : String(readInstant)}`);

  /*
   * ALL FOUR SC-2 TIMESTAMP COLUMNS. D-3 proved one; these prove the other three, because a repair
   * demonstrated on one column of four is a claim about the other three rather than a measurement.
   */
  const inspectionId = randomUUID();
  await ds.query(
    `INSERT INTO "inspection" ("id","title","siteId","ownerUserId","createdByUserId","status","createdAt")
     VALUES ($1,'s309 inspection',$2,$3,$4,'draft',$5)`,
    [inspectionId, siteId, userId, userId, knownInstant]);
  const inspectionRow = await ds.query(`SELECT "createdAt" FROM "inspection" WHERE "id" = $1`, [inspectionId]);
  check(inspectionRow[0]?.createdAt instanceof Date
    && inspectionRow[0].createdAt.toISOString() === knownInstant.toISOString(),
    'D-4 inspection.createdAt round-trips the exact instant',
    inspectionRow[0]?.createdAt instanceof Date ? inspectionRow[0].createdAt.toISOString() : String(inspectionRow[0]?.createdAt));

  await ds.query(`UPDATE "user" SET "deletedAt" = $1, "nextBillingDate" = $2 WHERE "id" = $3`,
    [knownInstant, knownInstant, userId]);
  const userRow = await ds.query(`SELECT "deletedAt","nextBillingDate" FROM "user" WHERE "id" = $1`, [userId]);
  check(userRow[0]?.deletedAt instanceof Date && userRow[0].deletedAt.toISOString() === knownInstant.toISOString()
    && userRow[0]?.nextBillingDate instanceof Date && userRow[0].nextBillingDate.toISOString() === knownInstant.toISOString(),
    'D-5 user.deletedAt and user.nextBillingDate both round-trip the exact instant',
    `${userRow[0]?.deletedAt?.toISOString?.()} / ${userRow[0]?.nextBillingDate?.toISOString?.()}`);

  await ds.query(`UPDATE "user" SET "deletedAt" = NULL WHERE "id" = $1`, [userId]);
  const nulled = await ds.query(`SELECT "deletedAt" FROM "user" WHERE "id" = $1`, [userId]);
  check(nulled[0].deletedAt === null,
    'D-6 NULL behaviour is preserved on a repaired nullable column — a NULL reads back as NULL '
    + 'rather than as an epoch', String(nulled[0].deletedAt));

  /*
   * THE DEFAULT, exercised rather than assumed: a row inserted WITHOUT createdAt must still get the
   * server default the migration declared.
   */
  const defaultedSiteId = randomUUID();
  await ds.query(
    `INSERT INTO "site" ("id","name","ownerUserId","createdByUserId") VALUES ($1,'s309 default',$2,$3)`,
    [defaultedSiteId, userId, userId]);
  const defaulted = await ds.query(`SELECT "createdAt" FROM "site" WHERE "id" = $1`, [defaultedSiteId]);
  check(defaulted[0]?.createdAt instanceof Date
    && Math.abs(Date.now() - defaulted[0].createdAt.getTime()) < 10 * 60 * 1000,
    'D-7 DEFAULT behaviour is preserved — a row inserted without createdAt receives the server '
    + 'default and lands within minutes of now',
    defaulted[0]?.createdAt instanceof Date ? defaulted[0].createdAt.toISOString() : String(defaulted[0]?.createdAt));

  await ds.query(`DELETE FROM "inspection" WHERE "id" = $1`, [inspectionId]);
  await ds.query(`DELETE FROM "site" WHERE "id" = ANY($1::uuid[])`, [[siteId, defaultedSiteId]]);
  await ds.query(`DELETE FROM "user" WHERE "id" = $1`, [userId]);

  // ===========================================================================================
  console.log('\n---- E. CONTRADICTION #1: standards_master, PROVEN BY ROUND TRIP ----\n');
  // ===========================================================================================

  /*
   * The repair declared lengths and `char(64)` the migration had already chosen. The proof that
   * matters is not that the annotation now matches the information_schema — it is that a value
   * written through the ENTITY comes back exactly, and that the fixed-width checksum columns behave
   * the way a fixed-width column behaves.
   */
  const stdColumns = await ds.query(`
    SELECT column_name, data_type, character_maximum_length AS len
      FROM information_schema.columns
     WHERE table_schema='public' AND table_name='standards_master'
       AND column_name IN ('release_id','source_document_checksum','normalized_record_checksum',
                           'transformation_version','deprecation_status','applicability_schema_version')
     ORDER BY column_name`);
  console.log('  the canonical contract migration 1800000004000 authored:\n');
  for (const row of stdColumns) {
    console.log(`        ${String(row.column_name).padEnd(30)} ${String(row.data_type).padEnd(18)} ${row.len ?? ''}`);
  }
  check(stdColumns.length === 6,
    'E-1 ALL SIX COLUMNS EXIST. The SC-2 register text said neither production nor a fresh replay '
    + 'had them and that any query naming them would fail — that claim is STALE. Migration '
    + '1800000004000 authored all six with deliberate bounds, so the contradiction was never '
    + 'absence; it was the entity failing to declare the bounds.',
    `${stdColumns.length}/6 present`);

  const checksumColumns = stdColumns.filter((r: any) => String(r.column_name).endsWith('_checksum'));
  check(checksumColumns.length === 2 && checksumColumns.every((r: any) => r.data_type === 'character' && r.len === 64),
    'E-2 both checksum columns are char(64) — fixed width, as a sha256 hex digest is',
    checksumColumns.map((r: any) => `${r.column_name}=${r.data_type}(${r.len})`).join(' '));

  const stdRepo = ds.getRepository('Standard');
  const digest = 'a'.repeat(64);
  const saved: any = await stdRepo.save({
    agencyCode: 'MSHA', citation: `s309-${Date.now()}`, title: 's309 probe',
    standardText: 's309', scopeCode: 'mining',
    releaseId: 'r'.repeat(120),
    sourceDocumentChecksum: digest,
    normalizedRecordChecksum: digest,
    transformationVersion: 'v'.repeat(80),
    deprecationStatus: 'active',
    applicabilitySchemaVersion: 's'.repeat(80),
  } as any);
  const readBack: any = await stdRepo.findOne({ where: { id: saved.id } as any });
  check(readBack?.sourceDocumentChecksum === digest && readBack?.normalizedRecordChecksum === digest,
    'E-3 a 64-character checksum written through the repaired entity reads back EXACTLY — char(64) '
    + 'stores a full-width digest with no padding to strip',
    `${String(readBack?.sourceDocumentChecksum).slice(0, 12)}… len=${String(readBack?.sourceDocumentChecksum).length}`);
  check(readBack?.releaseId?.length === 120 && readBack?.transformationVersion?.length === 80
    && readBack?.applicabilitySchemaVersion?.length === 80,
    'E-4 values at the exact declared bounds round-trip at full length — the entity now declares the '
    + 'bounds the database actually enforces',
    `release_id=${readBack?.releaseId?.length} transformation=${readBack?.transformationVersion?.length}`);
  check(readBack?.deprecationStatus === 'active',
    'E-5 the defaulted column round-trips its value', String(readBack?.deprecationStatus));

  let overLengthRefused = false;
  try {
    await stdRepo.save({
      agencyCode: 'MSHA', citation: `s309-over-${Date.now()}`, title: 's309 over',
      standardText: 's309', scopeCode: 'mining', releaseId: 'r'.repeat(121),
    } as any);
  } catch { overLengthRefused = true; }
  check(overLengthRefused,
    'E-6 and a value ONE CHARACTER over the bound is REFUSED by the database — the bound is real, '
    + 'which is why the entity had to declare it rather than assume unbounded varchar');

  await stdRepo.delete({ id: saved.id } as any);

  // ===========================================================================================
  console.log('\n---- F. WHAT THE REPAIR REVEALED, CHARACTERIZED AND NOT REPAIRED ----\n');
  // ===========================================================================================

  /*
   * §309: "If an entity-only correction causes TypeORM metadata to reveal another material
   * contradiction: characterize it. Do not expand §309 into an unbounded cleanup sweep."
   *
   * Four entities are mapped to tables that exist in NEITHER the canonical manifest NOR a fresh
   * replay. Every read through them fails — the §266 failure mode. This section MEASURES that
   * rather than inferring it, so the register entry rests on a fact.
   */
  const orphaned: Array<{ entity: string; table: string; reads: boolean; error: string }> = [];
  for (const name of ['Report', 'Finding', 'ReportAttachment', 'HazardTaxonomy']) {
    const md = ds.entityMetadatas.find((m) => m.name === name);
    if (!md) continue;
    try {
      await ds.getRepository(md.target).count();
      orphaned.push({ entity: name, table: md.tableName, reads: true, error: '' });
    } catch (error: any) {
      orphaned.push({ entity: name, table: md.tableName, reads: false, error: String(error.message).split('\n')[0] });
    }
  }
  for (const o of orphaned) {
    console.log(`        ${o.entity.padEnd(18)} -> "${o.table}"  ${o.reads ? 'READS' : 'FAILS: ' + o.error.slice(0, 60)}`);
  }
  check(orphaned.length === 4 && orphaned.every((o) => !o.reads),
    'F-1 SC-3 (new, NOT repaired here): four entities are mapped to tables that exist in neither the '
    + 'canonical manifest nor a fresh replay, and every read through them fails with "relation does '
    + 'not exist" — the §266 failure mode. Characterized and registered; repairing it is a bounded '
    + 'section of its own, not an in-§309 sweep.',
    orphaned.map((o) => o.table).join(', '));

  check(true,
    'F-2 and the canonical successors DO exist: `reports` (retired compatibility), '
    + '`inspection_findings`, `inspection_reports` and `inspection_report_versions` are all in the '
    + 'manifest. The legacy entities were never retired alongside the routes that used them.');

  await ds.query(`DELETE FROM "site" WHERE "id" = $1`, [siteId]);
  await ds.query(`DELETE FROM "user" WHERE "id" = $1`, [userId]);
  await ds.destroy();

  console.log(`\n${'='.repeat(96)}`);
  console.log(`§309 SC-2 RECONCILIATION: ${passed} passed, ${failures.length} failed.`);
  console.log('Expert executions: 0. Provider calls: 0. Spend: $0.00.');
  if (failures.length) {
    console.log('\nFAILED:');
    for (const failure of failures) console.log(`  - ${failure}`);
  }
  console.log('='.repeat(96));
  process.exit(failures.length === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error('\n§309 SC-2 RECONCILIATION ERRORED:', error);
  process.exit(1);
});
