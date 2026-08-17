import 'dotenv/config';
import { createHash } from 'crypto';
const { Client } = require('pg') as {
  Client: new (options: { connectionString: string }) => {
    connect(): Promise<void>;
    end(): Promise<void>;
    query(sql: string, parameters?: unknown[]): Promise<{ rows: Array<Record<string, any>> }>;
  };
};

const urls = [process.env.ADOPTION_A_URL, process.env.ADOPTION_B_URL];
if (urls.some((url) => !url)) throw new Error('ADOPTION_A_URL and ADOPTION_B_URL are required.');
const conserved = [
  'organization', 'user', 'user_subscription', 'standards_master',
  'safescope_knowledge_documents', 'safescope_knowledge_chunks',
  'safescope_knowledge_sources', 'safescope_knowledge_ingestion_runs',
  'safescope_knowledge_retrieval_logs',
];

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b))
      .map(([key, child]) => `${JSON.stringify(key)}:${stable(child)}`).join(',')}}`;
  }
  return JSON.stringify(value);
}
function hash(value: unknown) {
  return createHash('sha256').update(stable(value)).digest('hex');
}
function q(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

async function assess(url: string) {
  const client = new Client({ connectionString: url! });
  await client.connect();
  try {
    const identity = (await client.query('SELECT current_database() AS database')).rows[0];
    const catalog = (await client.query(`
      SELECT table_name,column_name,data_type,udt_name,is_nullable,COALESCE(column_default,'') column_default
      FROM information_schema.columns WHERE table_schema='public'
      ORDER BY table_name,ordinal_position
    `)).rows;
    const constraints = (await client.query(`
      SELECT c.relname table_name,con.conname,con.contype,pg_get_constraintdef(con.oid,true) definition
      FROM pg_constraint con JOIN pg_class c ON c.oid=con.conrelid
      JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public'
      ORDER BY c.relname,con.conname
    `)).rows.map((row) => ({
      ...row,
      definition: String(row.definition).replace(/::(?:character varying|text)(?:\[\])?/g, ''),
    }));
    const counts: Record<string, number> = {};
    const content: Record<string, string[]> = {};
    for (const table of conserved) {
      const tableRows = (await client.query(`SELECT * FROM ${q(table)} ORDER BY id`)).rows;
      counts[table] = tableRows.length;
      content[table] = tableRows.map((row) => hash(row));
    }
    counts.organization_memberships = Number((await client.query(
      'SELECT count(*)::int count FROM organization_memberships',
    )).rows[0].count);
    const migrations = (await client.query('SELECT name FROM migrations ORDER BY timestamp,name')).rows
      .map(row => String(row.name));
    counts.migrations = migrations.length;
    const provenance = (await client.query(`
      SELECT status,"sourceRowCount","adoptedRowCount","quarantinedRowCount",
        "sourceSchemaFingerprint","sourceContentFingerprint"
      FROM legacy_adoption_runs
    `)).rows;
    const orphans = {
      membershipUser: Number((await client.query(`
        SELECT count(*)::int count FROM organization_memberships m
        LEFT JOIN "user" u ON u.id=m."userId" WHERE u.id IS NULL
      `)).rows[0].count),
      membershipOrganization: Number((await client.query(`
        SELECT count(*)::int count FROM organization_memberships m
        LEFT JOIN organization o ON o.id=m."organizationId" WHERE o.id IS NULL
      `)).rows[0].count),
      knowledgeChunk: Number((await client.query(`
        SELECT count(*)::int count FROM safescope_knowledge_chunks c
        LEFT JOIN safescope_knowledge_documents d ON d.id=c."documentId" WHERE d.id IS NULL
      `)).rows[0].count),
    };
    return {
      database: identity.database,
      schemaFingerprint: hash({ catalog, constraints }),
      canonicalContentFingerprint: hash(content),
      counts,
      migrations,
      provenance,
      orphans,
    };
  } finally {
    await client.end();
  }
}

async function main() {
  const [a, b] = await Promise.all(urls.map((url) => assess(url!)));
  const matchingSchemas = a.schemaFingerprint === b.schemaFingerprint;
  const matchingContent = a.canonicalContentFingerprint === b.canonicalContentFingerprint;
  const matchingCounts = stable(a.counts) === stable(b.counts);
  const zeroOrphans = Object.values(a.orphans).every((count) => count === 0) &&
    Object.values(b.orphans).every((count) => count === 0);
  const migrationHistoryMatches = stable(a.migrations) === stable(b.migrations) &&
    a.migrations.includes('LegacyAdoptionProvenance1800000003000') &&
    a.migrations.includes('RegulatorySourceChecksums1800000005200');
  const passed = matchingSchemas && matchingContent && matchingCounts && zeroOrphans &&
    migrationHistoryMatches;
  console.log(JSON.stringify({
    passed, matchingSchemas, matchingContent, matchingCounts, zeroOrphans,
    migrationHistoryMatches, cloneA: a, cloneB: b,
  }, null, 2));
  if (!passed) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
