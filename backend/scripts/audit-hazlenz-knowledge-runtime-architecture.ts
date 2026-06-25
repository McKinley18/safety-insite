import 'dotenv/config';
const { Client } = require('pg');
import { execSync } from 'child_process';
const path = require('path');

type TableCount = {
  table: string;
  exists: boolean;
  count: number | null;
};

const ROOT = path.resolve(__dirname, '..', '..');

const KNOWLEDGE_TABLES = [
  'standards_master',
  'safescope_knowledge_sources',
  'safescope_knowledge_documents',
  'safescope_knowledge_chunks',
  'safescope_knowledge_ingestion_runs',
  'knowledge_documents',
  'knowledge_chunks',
];

function shell(command: string): string {
  return execSync(command, {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: '/bin/bash',
  }).trim();
}

async function tableExists(client: any, table: string): Promise<boolean> {
  const result = await client.query(
    `
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = $1
      ) AS exists;
    `,
    [table],
  );

  return Boolean(result.rows[0]?.exists);
}

async function countTable(client: any, table: string): Promise<TableCount> {
  const exists = await tableExists(client, table);
  if (!exists) return { table, exists: false, count: null };

  const result = await client.query(`SELECT COUNT(*)::int AS count FROM "${table}"`);
  return { table, exists: true, count: Number(result.rows[0]?.count || 0) };
}

async function sourceCounts(client: any, table: string) {
  if (!(await tableExists(client, table))) return null;

  const columns = await client.query(
    `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
      ORDER BY ordinal_position;
    `,
    [table],
  );

  const names: string[] = columns.rows.map((row: any) => row.column_name);
  const agencyColumn = names.find((name: string) => /agency/i.test(name));
  const sourceTypeColumn = names.find((name: string) => /source.*type|type/i.test(name));
  const authorityColumn = names.find((name: string) => /authority.*tier/i.test(name));

  const output: Record<string, any> = { table, columns: names };

  if (agencyColumn) {
    output.byAgency = (
      await client.query(
        `
          SELECT "${agencyColumn}" AS agency, COUNT(*)::int AS count
          FROM "${table}"
          GROUP BY "${agencyColumn}"
          ORDER BY count DESC, agency
          LIMIT 50;
        `,
      )
    ).rows;
  }

  if (sourceTypeColumn) {
    output.bySourceType = (
      await client.query(
        `
          SELECT "${sourceTypeColumn}" AS source_type, COUNT(*)::int AS count
          FROM "${table}"
          GROUP BY "${sourceTypeColumn}"
          ORDER BY count DESC, source_type
          LIMIT 50;
        `,
      )
    ).rows;
  }

  if (authorityColumn) {
    output.byAuthorityTier = (
      await client.query(
        `
          SELECT "${authorityColumn}" AS authority_tier, COUNT(*)::int AS count
          FROM "${table}"
          GROUP BY "${authorityColumn}"
          ORDER BY authority_tier;
        `,
      )
    ).rows;
  }

  return output;
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required.');
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  console.log('==================================================');
  console.log('HazLenz Knowledge Runtime Architecture Audit');
  console.log('==================================================');

  console.log('\n1) Runtime DB table counts');
  const tableCounts: TableCount[] = [];
  for (const table of KNOWLEDGE_TABLES) {
    tableCounts.push(await countTable(client, table));
  }
  console.table(tableCounts);

  console.log('\n2) standards_master authority/source distribution');
  if (await tableExists(client, 'standards_master')) {
    const counts = await sourceCounts(client, 'standards_master');
    console.log(JSON.stringify(counts, null, 2));

    const sparseMetadata = await client.query(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE source_name IS NULL OR source_name = '')::int AS missing_source_name,
        COUNT(*) FILTER (WHERE source_type IS NULL OR source_type = '')::int AS missing_source_type,
        COUNT(*) FILTER (WHERE allowed_use IS NULL OR allowed_use = '')::int AS missing_allowed_use,
        COUNT(*) FILTER (WHERE plain_language_summary IS NULL OR plain_language_summary = '')::int AS missing_summary
      FROM standards_master;
    `);
    console.table(sparseMetadata.rows);
  }

  console.log('\n3) Source citation footprint');
  const uniqueCitationCount = shell(`
    grep -RhoE "([0-9]{2} CFR )?[0-9]{2,4}\\.[0-9]+[a-zA-Z0-9().-]*|29 CFR [0-9]{4}\\.[0-9]+[a-zA-Z0-9().-]*|30 CFR [0-9]{2}\\.[0-9]+[a-zA-Z0-9().-]*|49 CFR [0-9]{3}\\.[0-9]+[a-zA-Z0-9().-]*" \
      backend/src \
      --include="*.ts" \
      --include="*.json" \
      | sort -u | wc -l
  `);
  console.log(`Unique citation-like references in source: ${uniqueCitationCount.trim()}`);

  console.log('\n4) Runtime risk scan');
  const eagerLoadMatches = shell(`
    grep -R "find(.*standards\\|findAndCount\\|standards_master\\|getRepository(Standard).*find\\|createQueryBuilder('s')" \
      backend/src \
      --include="*.ts" \
      -n || true
  `);
  console.log(eagerLoadMatches || 'No obvious eager standards loads found by simple scan.');

  console.log('\n5) Recommended architecture status');
  const standardsCount = tableCounts.find((row) => row.table === 'standards_master')?.count || 0;
  const knowledgeChunkCount =
    (tableCounts.find((row) => row.table === 'safescope_knowledge_chunks')?.count || 0) +
    (tableCounts.find((row) => row.table === 'knowledge_chunks')?.count || 0);

  const recommendations: string[] = [];

  if (standardsCount < 100) {
    recommendations.push('Populate standards_master from STANDARDS_INTELLIGENCE_SEED, but keep retrieval candidate-scoped.');
  }

  if (knowledgeChunkCount === 0) {
    recommendations.push('Seed supplemental knowledge sources separately; do not mix NIOSH/ANSI/NFPA/DOT into primary standards.');
  }

  recommendations.push('Do not preload all standards/chunks during classify.');
  recommendations.push('Use HazLenz brain to produce candidate families/citations, then query DB by those candidates.');
  recommendations.push('Keep OSHA/MSHA as candidate enforceable standards; keep ANSI/NIOSH/NFPA/DOT as supporting guidance.');

  console.table(recommendations.map((recommendation, index) => ({ step: index + 1, recommendation })));

  await client.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
