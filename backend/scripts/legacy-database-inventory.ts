import 'dotenv/config';
import { createHash } from 'crypto';
import { writeFile } from 'fs/promises';
const { Client } = require('pg') as {
  Client: new (options: { connectionString: string }) => {
    connect(): Promise<void>;
    end(): Promise<void>;
    query(sql: string, parameters?: unknown[]): Promise<{ rows: Array<Record<string, any>> }>;
  };
};

const configuredUrl = process.env.LEGACY_SOURCE_DATABASE_URL;
if (!configuredUrl) throw new Error('LEGACY_SOURCE_DATABASE_URL is required.');
const url: string = configuredUrl;

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, child]) => `${JSON.stringify(key)}:${stable(child)}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function hash(value: unknown) {
  return createHash('sha256').update(stable(value)).digest('hex');
}

function quoted(identifier: string) {
  return `"${identifier.replace(/"/g, '""')}"`;
}

async function main() {
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    await client.query('BEGIN READ ONLY');
    const identity = (await client.query(`
      SELECT current_database() AS database, current_schema() AS schema,
        current_user AS database_user, pg_database_size(current_database())::text AS size_bytes
    `)).rows[0];
    const schemas = (await client.query(`
      SELECT schema_name FROM information_schema.schemata
      WHERE schema_name NOT LIKE 'pg_%' AND schema_name <> 'information_schema'
      ORDER BY schema_name
    `)).rows;
    const tables = (await client.query(`
      SELECT table_schema, table_name FROM information_schema.tables
      WHERE table_schema NOT LIKE 'pg_%' AND table_schema <> 'information_schema'
      ORDER BY table_schema, table_name
    `)).rows;
    const columns = (await client.query(`
      SELECT table_schema, table_name, ordinal_position, column_name, data_type, udt_name,
        is_nullable, is_generated, COALESCE(column_default, '') AS column_default
      FROM information_schema.columns WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
    `)).rows;
    const views = (await client.query(`
      SELECT table_schema, table_name, view_definition FROM information_schema.views
      WHERE table_schema = 'public' ORDER BY table_name
    `)).rows;
    const sequences = (await client.query(`
      SELECT sequence_schema, sequence_name, data_type FROM information_schema.sequences
      WHERE sequence_schema = 'public' ORDER BY sequence_name
    `)).rows;
    const indexes = (await client.query(`
      SELECT tablename AS table_name, indexname AS index_name,
        regexp_replace(indexdef, '\\s+', ' ', 'g') AS definition
      FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename, indexname
    `)).rows;
    const constraints = (await client.query(`
      SELECT c.relname AS table_name, con.conname AS constraint_name, con.contype AS constraint_type,
        pg_get_constraintdef(con.oid, true) AS definition
      FROM pg_constraint con JOIN pg_class c ON c.oid = con.conrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' ORDER BY c.relname, con.conname
    `)).rows;
    const enums = (await client.query(`
      SELECT t.typname AS enum_name, e.enumsortorder, e.enumlabel
      FROM pg_type t JOIN pg_enum e ON t.oid=e.enumtypid
      JOIN pg_namespace n ON n.oid=t.typnamespace
      WHERE n.nspname='public' ORDER BY t.typname,e.enumsortorder
    `)).rows;
    const extensions = (await client.query(`
      SELECT extname, extversion FROM pg_extension ORDER BY extname
    `)).rows;
    const rowCounts: Record<string, number> = {};
    for (const table of tables.filter((entry: any) => entry.table_schema === 'public')) {
      rowCounts[table.table_name] = Number((await client.query(
        `SELECT count(*)::int AS count FROM ${quoted(table.table_name)}`,
      )).rows[0].count);
    }
    const conditions = {
      duplicateLowercaseEmails: Number((await client.query(`
        SELECT count(*)::int AS count FROM (
          SELECT lower(email) FROM "user" GROUP BY lower(email) HAVING count(*) > 1
        ) duplicate
      `)).rows[0].count),
      usersWithoutCredential: Number((await client.query(`
        SELECT count(*)::int AS count FROM "user"
        WHERE "passwordHash" IS NULL AND password IS NULL
      `)).rows[0].count),
      usersWithAmbiguousCredential: Number((await client.query(`
        SELECT count(*)::int AS count FROM "user"
        WHERE "passwordHash" IS NOT NULL AND password IS NOT NULL AND "passwordHash" <> password
      `)).rows[0].count),
      usersWithMissingOrganization: Number((await client.query(`
        SELECT count(*)::int AS count FROM "user" u LEFT JOIN organization o ON o.id=u."organizationId"
        WHERE u."organizationId" IS NOT NULL AND o.id IS NULL
      `)).rows[0].count),
      orphanKnowledgeChunks: Number((await client.query(`
        SELECT count(*)::int AS count FROM safescope_knowledge_chunks c
        LEFT JOIN safescope_knowledge_documents d ON d.id=c."documentId" WHERE d.id IS NULL
      `)).rows[0].count),
      duplicateStandards: Number((await client.query(`
        SELECT count(*)::int AS count FROM (
          SELECT agency_code,citation FROM standards_master
          GROUP BY agency_code,citation HAVING count(*) > 1
        ) duplicate
      `)).rows[0].count),
      organizationLegacyPaths: Number((await client.query(`
        SELECT count(*)::int AS count FROM organization WHERE "logoPath" IS NOT NULL
      `)).rows[0].count),
    };
    const pathColumns = columns
      .filter((column: any) => /(?:path|url|uri|file|report|upload)/i.test(column.column_name))
      .map((column: any) => ({ table: column.table_name, column: column.column_name }));
    const catalog = { schemas, tables, columns, views, sequences, indexes, constraints, enums, extensions };
    const result = {
      formatVersion: 1,
      identity: {
        databaseName: identity.database,
        schema: identity.schema,
        databaseUser: identity.database_user,
        sizeBytes: identity.size_bytes,
        identityHash: hash({ database: identity.database, schema: identity.schema }),
      },
      catalog,
      rowCounts,
      dataConditions: conditions,
      pathColumns,
      migrationHistoryCount: rowCounts.migrations || 0,
      schemaFingerprint: hash(catalog),
      contentFingerprint: hash({ rowCounts, conditions }),
      sensitiveValuesIncluded: false,
    };
    await client.query('COMMIT');
    if (process.env.LEGACY_INVENTORY_OUTPUT) {
      await writeFile(process.env.LEGACY_INVENTORY_OUTPUT, `${JSON.stringify(result, null, 2)}\n`, { flag: 'wx' });
    }
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
