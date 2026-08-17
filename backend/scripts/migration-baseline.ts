import 'dotenv/config';
import { createHash } from 'crypto';
import { DataSource } from 'typeorm';
import { dataSource as applicationDataSource } from '../src/database/data-source';

type Catalog = {
  tables: string[];
  columns: Array<Record<string, unknown>>;
  indexes: Array<Record<string, unknown>>;
  constraints: Array<Record<string, unknown>>;
  enums: Array<Record<string, unknown>>;
};

const args = new Set(process.argv.slice(2));
const apply = args.has('--apply');
const jsonOnly = args.has('--json');
const referenceUrl = process.env.BASELINE_REFERENCE_DATABASE_URL;
const targetUrl = process.env.DATABASE_URL;
const excludedTables = ['migrations', 'schema_baseline_adoptions'];

function safeIdentity(value: string): string {
  const parsed = new URL(value);
  return `${parsed.hostname}:${parsed.port || '5432'}/${parsed.pathname.replace(/^\//, '')}`;
}

async function catalog(ds: DataSource): Promise<Catalog> {
  const excluded = excludedTables.map((_, index) => `$${index + 1}`).join(',');
  const parameters = excludedTables;
  const tables = await ds.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = current_schema() AND table_type = 'BASE TABLE'
      AND table_name NOT IN (${excluded}) ORDER BY table_name
  `, parameters);
  const columns = await ds.query(`
    SELECT table_name, column_name, data_type, udt_name, is_nullable,
      COALESCE(column_default, '') AS column_default
    FROM information_schema.columns
    WHERE table_schema = current_schema() AND table_name NOT IN (${excluded})
    ORDER BY table_name, ordinal_position
  `, parameters);
  const indexes = await ds.query(`
    SELECT tablename AS table_name, indexname AS index_name,
      regexp_replace(indexdef, '\\s+', ' ', 'g') AS definition
    FROM pg_indexes WHERE schemaname = current_schema()
      AND tablename NOT IN (${excluded}) ORDER BY tablename, indexname
  `, parameters);
  const constraints = await ds.query(`
    SELECT c.relname AS table_name, con.conname AS constraint_name,
      con.contype AS constraint_type, pg_get_constraintdef(con.oid, true) AS definition
    FROM pg_constraint con JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = current_schema() AND c.relname NOT IN (${excluded})
    ORDER BY c.relname, con.conname
  `, parameters);
  const enums = await ds.query(`
    SELECT t.typname AS enum_name, e.enumsortorder, e.enumlabel
    FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = current_schema() ORDER BY t.typname, e.enumsortorder
  `);
  return { tables: tables.map((row: any) => row.table_name), columns, indexes, constraints, enums };
}

function stable(value: unknown): string {
  return JSON.stringify(value);
}

function diffCatalog(expected: Catalog, actual: Catalog) {
  const sections = Object.keys(expected) as Array<keyof Catalog>;
  return sections.flatMap((section) => {
    const expectedRows = new Set((expected[section] as any[]).map(stable));
    const actualRows = new Set((actual[section] as any[]).map(stable));
    return [
      ...[...expectedRows].filter((row) => !actualRows.has(row)).map((row) => ({ section, kind: 'missing', value: JSON.parse(row) })),
      ...[...actualRows].filter((row) => !expectedRows.has(row)).map((row) => ({ section, kind: 'extra', value: JSON.parse(row) })),
    ];
  });
}

async function main() {
  if (!targetUrl || !referenceUrl) throw new Error('DATABASE_URL and BASELINE_REFERENCE_DATABASE_URL are required.');
  if (targetUrl === referenceUrl) throw new Error('Target and reference databases must be different.');
  const reference = new DataSource({ ...applicationDataSource.options, type: 'postgres', url: referenceUrl } as any);
  const target = new DataSource({ ...applicationDataSource.options, type: 'postgres', url: targetUrl } as any);
  await Promise.all([reference.initialize(), target.initialize()]);
  try {
    const [expected, actual] = await Promise.all([catalog(reference), catalog(target)]);
    const drift = diffCatalog(expected, actual);
    const fingerprint = createHash('sha256').update(stable(actual)).digest('hex');
    const expectedFingerprint = createHash('sha256').update(stable(expected)).digest('hex');
    const migrationRows = await target.query(`SELECT "timestamp", "name" FROM "migrations" ORDER BY "timestamp", "name"`).catch(() => []);
    const migrations = reference.migrations
      .map((migration: any) => {
        const name = migration.name;
        const match = name.match(/(\d{13})$/);
        if (!match) throw new Error(`Migration name lacks timestamp: ${name}`);
        return { timestamp: Number(match[1]), name };
      })
      .sort((a, b) => a.timestamp - b.timestamp || a.name.localeCompare(b.name));
    const historyState = migrationRows.length === 0 ? 'empty' :
      migrationRows.length === migrations.length &&
      stable(migrationRows.map((row: any) => ({ timestamp: Number(row.timestamp), name: row.name }))) === stable(migrations)
        ? 'complete' : 'partial';
    const compatible = drift.length === 0;
    const result: Record<string, unknown> = {
      mode: apply ? 'apply' : 'dry-run',
      database: safeIdentity(targetUrl),
      referenceDatabase: safeIdentity(referenceUrl),
      compatible,
      fingerprint,
      expectedFingerprint,
      currentMigrationCount: migrationRows.length,
      targetMigrationCount: migrations.length,
      historyState,
      migrationsToAdopt: historyState === 'empty' ? migrations : [],
      drift,
      warning: 'Take and verify a database backup before baseline adoption. This command never executes historical migration bodies.',
      applied: false,
    };
    if (!compatible) throw Object.assign(new Error(`Schema is incompatible: ${drift.length} catalog differences.`), { result });
    if (historyState === 'partial') throw Object.assign(new Error('Partial migration history is ambiguous and cannot be adopted.'), { result });
    if (apply && historyState === 'empty') {
      await target.transaction(async (manager) => {
        await manager.query(`SELECT pg_advisory_xact_lock(hashtext('safety-insite-migration-baseline'))`);
        const current = await manager.query(`SELECT COUNT(*)::int AS count FROM "migrations"`);
        if (Number(current[0].count) !== 0) throw new Error('Migration history changed concurrently; no records inserted.');
        for (const migration of migrations) {
          await manager.query(`INSERT INTO "migrations" ("timestamp", "name") VALUES ($1, $2)`, [migration.timestamp, migration.name]);
        }
        await manager.query(`
          CREATE TABLE IF NOT EXISTS "schema_baseline_adoptions" (
            "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "fingerprint" varchar NOT NULL,
            "migrationCount" integer NOT NULL, "adoptedAt" timestamptz NOT NULL DEFAULT now()
          )
        `);
        await manager.query(`INSERT INTO "schema_baseline_adoptions" ("fingerprint", "migrationCount") VALUES ($1, $2)`, [fingerprint, migrations.length]);
      });
      result.applied = true;
    }
    if (!jsonOnly) {
      console.log(`Migration baseline ${result.mode}: ${compatible ? 'COMPATIBLE' : 'INCOMPATIBLE'}`);
      console.log(`Database: ${result.database}; migrations ${migrationRows.length}/${migrations.length}; history ${historyState}`);
      console.log(result.warning);
    }
    console.log(JSON.stringify(result, null, 2));
  } catch (error: any) {
    if (error.result) console.error(JSON.stringify(error.result, null, 2));
    throw error;
  } finally {
    await Promise.all([reference.destroy(), target.destroy()]);
  }
}

main().catch((error) => {
  console.error(`FAIL: ${error.message}`);
  process.exitCode = 1;
});
