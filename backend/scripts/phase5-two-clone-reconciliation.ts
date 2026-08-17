const { Client } = require('pg') as { Client: new (options: { connectionString: string }) => any };
import { createHash } from 'crypto';

const urls = [process.env.CLONE_A_URL, process.env.CLONE_B_URL];
if (urls.some(value => !value)) throw new Error('CLONE_A_URL and CLONE_B_URL are required.');

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b))
      .map(([key, child]) => `${JSON.stringify(key)}:${stable(child)}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

async function assess(url: string) {
  const client = new Client({ connectionString: url });
  await client.connect();
  const identity = await client.query(`SELECT current_database() database, current_user db_user`);
  const catalog = await client.query(`
    SELECT table_name, column_name, data_type, is_nullable, COALESCE(column_default,'') column_default
    FROM information_schema.columns WHERE table_schema='public'
    ORDER BY table_name,column_name
  `);
  const tables = [...new Set(catalog.rows.map((row: any) => row.table_name))];
  const counts: Record<string, number> = {};
  for (const table of tables) {
    const safe = `"${String(table).replace(/"/g, '""')}"`;
    counts[table as string] = Number((await client.query(`SELECT count(*)::int count FROM ${safe}`)).rows[0].count);
  }
  const migrationCount = tables.includes('migrations')
    ? Number((await client.query(`SELECT count(*)::int count FROM migrations`)).rows[0].count) : 0;
  const ownershipChecks: Record<string, number | null> = {};
  for (const [key, table] of [['sites', 'site'], ['inspections', 'inspection'], ['legacyReports', 'reports']] as const) {
    if (!tables.includes(table)) { ownershipChecks[key] = null; continue; }
    const columns = new Set(catalog.rows.filter((row: any) => row.table_name === table).map((row: any) => row.column_name));
    if (columns.has('ownerUserId') && columns.has('organizationId')) {
      ownershipChecks[key] = Number((await client.query(
        `SELECT count(*)::int count FROM "${table}" WHERE ("ownerUserId" IS NULL) = ("organizationId" IS NULL)`,
      )).rows[0].count);
    } else if (columns.has('organizationId')) {
      ownershipChecks[key] = Number((await client.query(
        `SELECT count(*)::int count FROM "${table}" WHERE "organizationId" IS NULL`,
      )).rows[0].count);
    } else {
      ownershipChecks[key] = counts[table];
    }
  }
  const constraints = await client.query(`
    SELECT c.conname, c.contype, pg_get_constraintdef(c.oid) definition
    FROM pg_constraint c JOIN pg_namespace n ON n.oid=c.connamespace
    WHERE n.nspname='public' ORDER BY c.conname
  `);
  await client.end();
  return {
    database: identity.rows[0].database, migrationCount, tableCount: tables.length, rowCounts: counts,
    missingCanonicalTables: [
      'site', 'inspection', 'observations', 'inspection_findings', 'corrective_actions', 'tasks',
      'storage_objects', 'inspection_reports', 'inspection_report_versions',
    ].filter(table => !tables.includes(table)),
    ownershipChecks,
    schemaFingerprint: createHash('sha256').update(stable({ columns: catalog.rows, constraints: constraints.rows })).digest('hex'),
    contentFingerprint: createHash('sha256').update(stable({ counts, ownershipChecks, migrationCount })).digest('hex'),
  };
}

async function main() {
  const [a, b] = await Promise.all(urls.map(value => assess(value!)));
  const deterministic = a.schemaFingerprint === b.schemaFingerprint &&
    a.contentFingerprint === b.contentFingerprint && stable(a.rowCounts) === stable(b.rowCounts);
  const blockers = [];
  if (!deterministic) blockers.push('Clone fingerprints or row counts differ.');
  if (a.migrationCount === 0) blockers.push('Migration history is absent.');
  if (a.missingCanonicalTables.length) {
    blockers.push(`Canonical tables are absent: ${a.missingCanonicalTables.join(', ')}.`);
  }
  if (Object.values(a.ownershipChecks).some(value => value !== null && value > 0)) {
    blockers.push('Ambiguous ownership records require operator review/quarantine.');
  }
  const safeToAdopt = blockers.length === 0;
  console.log(JSON.stringify({ deterministic, safeToAdopt, blockers, cloneA: a, cloneB: b }, null, 2));
  if (!deterministic) process.exitCode = 1;
}
main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
