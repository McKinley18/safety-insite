import 'dotenv/config';
import { createHash } from 'crypto';
const { Client } = require('pg') as {
  Client: new (options: { connectionString: string }) => {
    connect(): Promise<void>;
    end(): Promise<void>;
    query(sql: string, parameters?: unknown[]): Promise<{ rows: Row[] }>;
  };
};

type Row = Record<string, any>;
const sourceUrl = process.env.LEGACY_SOURCE_DATABASE_URL;
const targetUrl = process.env.ADOPTION_TARGET_DATABASE_URL;
const apply = process.argv.includes('--apply');
const operatorLabel = process.env.ADOPTION_OPERATOR_LABEL || '';
const supported = new Set([
  'migrations', 'organization', 'user', 'user_subscription', 'standards_master',
  'safescope_knowledge_documents', 'safescope_knowledge_chunks',
  'safescope_knowledge_sources', 'safescope_knowledge_ingestion_runs',
  'safescope_knowledge_retrieval_logs',
]);
const copyTables = [
  'organization', 'user', 'standards_master', 'safescope_knowledge_sources',
  'safescope_knowledge_documents', 'safescope_knowledge_chunks',
  'safescope_knowledge_ingestion_runs', 'safescope_knowledge_retrieval_logs',
  'user_subscription',
];

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
function q(identifier: string) {
  return `"${identifier.replace(/"/g, '""')}"`;
}
function safeIdentity(url: string) {
  const parsed = new URL(url);
  return `${parsed.hostname}:${parsed.port || '5432'}/${parsed.pathname.replace(/^\//, '')}`;
}
function sourceIdentityHash(url: string) {
  return hash(safeIdentity(url));
}

type PgClient = InstanceType<typeof Client>;

async function rows(client: PgClient, table: string): Promise<Row[]> {
  return (await client.query(`SELECT * FROM ${q(table)} ORDER BY id`)).rows;
}
async function count(client: PgClient, table: string): Promise<number> {
  return Number((await client.query(`SELECT count(*)::int AS count FROM ${q(table)}`)).rows[0].count);
}
async function insert(client: PgClient, table: string, data: Row) {
  const entries = Object.entries(data);
  const sql = `INSERT INTO ${q(table)} (${entries.map(([key]) => q(key)).join(',')})
    VALUES (${entries.map((_, index) => `$${index + 1}`).join(',')})`;
  await client.query(sql, entries.map(([, value]) => value));
}

function organization(row: Row): Row {
  return {
    id: row.id, name: row.name, logoPath: null, riskProfileId: row.riskProfileId || 'standard_5x5',
    planCode: row.planCode || 'free', createdAt: row.createdAt || new Date(),
  };
}
function user(row: Row): Row {
  return {
    id: row.id,
    name: row.name || [row.firstName, row.lastName].filter(Boolean).join(' ') || row.email,
    email: String(row.email).trim().toLowerCase(),
    passwordHash: row.passwordHash || row.password,
    type: row.type || 'individual',
    planCode: row.planCode || 'free',
    role: row.role || 'Auditor',
    subscriptionStatus: row.subscriptionStatus || 'none',
    nextBillingDate: row.nextBillingDate || null,
    deletedAt: row.deletedAt || null,
    organizationId: row.organizationId || null,
    passwordResetTokenHash: null,
    passwordResetExpiresAt: null,
    passwordChangedAt: null,
  };
}

function normalizeTable(table: string, row: Row): Row {
  if (table === 'organization') return organization(row);
  if (table === 'user') return user(row);
  if (table === 'standards_master') {
    return {
      ...row,
      allowed_use: row.allowed_use || 'reference',
      requires_approval: row.requires_approval ?? false,
      approved_for_auto_ingestion: row.approved_for_auto_ingestion ?? true,
    };
  }
  if (table === 'safescope_knowledge_documents' || table === 'safescope_knowledge_chunks') {
    return {
      ...row,
      hazardTags: JSON.stringify(row.hazardTags || []),
      equipmentTags: JSON.stringify(row.equipmentTags || []),
      taskTags: JSON.stringify(row.taskTags || []),
      standardTags: JSON.stringify(row.standardTags || []),
      lessonTags: JSON.stringify(row.lessonTags || []),
    };
  }
  if (table === 'safescope_knowledge_sources') {
    return { ...row, metadataJson: JSON.stringify(row.metadataJson || {}) };
  }
  if (table === 'safescope_knowledge_ingestion_runs') {
    return {
      ...row,
      warnings: JSON.stringify(row.warnings || []),
      metadataJson: JSON.stringify(row.metadataJson || {}),
    };
  }
  if (table === 'safescope_knowledge_retrieval_logs') {
    return {
      ...row,
      retrievedChunkIds: JSON.stringify(row.retrievedChunkIds || []),
      selectedChunkIds: JSON.stringify(row.selectedChunkIds || []),
      reasoningJson: JSON.stringify(row.reasoningJson || {}),
    };
  }
  if (table === 'user_subscription') return { ...row, userId: String(row.userId) };
  return row;
}

async function main() {
  if (!sourceUrl || !targetUrl) {
    throw new Error('LEGACY_SOURCE_DATABASE_URL and ADOPTION_TARGET_DATABASE_URL are required.');
  }
  if (safeIdentity(sourceUrl) === safeIdentity(targetUrl)) {
    throw new Error('Source and target database identities must differ.');
  }
  if (apply && !operatorLabel.trim()) {
    throw new Error('ADOPTION_OPERATOR_LABEL is required with --apply.');
  }
  const targetName = new URL(targetUrl).pathname.replace(/^\//, '');
  if (!/^phase6_(?:adopt|rollback|restore|test)_[a-z0-9_]+$/.test(targetName)) {
    throw new Error('Adoption targets must be explicitly disposable phase6 databases.');
  }

  const source = new Client({ connectionString: sourceUrl });
  const target = new Client({ connectionString: targetUrl });
  await Promise.all([source.connect(), target.connect()]);
  try {
    await source.query('BEGIN READ ONLY');
    const sourceTables = (await source.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name
    `)).rows.map((row: Row) => row.table_name);
    const targetTables = new Set((await target.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema='public' AND table_type='BASE TABLE'
    `)).rows.map((row: Row) => row.table_name));
    const unsupportedTables = sourceTables.filter((table: string) => !supported.has(table));
    const requiredSource = ['organization', 'user', 'standards_master'];
    const requiredTarget = [
      ...copyTables, 'organization_memberships', 'legacy_adoption_runs',
      'legacy_adoption_records', 'legacy_adoption_quarantine',
    ];
    const missingSource = requiredSource.filter((table: string) => !sourceTables.includes(table));
    const missingTarget = requiredTarget.filter((table) => !targetTables.has(table));
    const sourceData: Record<string, Row[]> = {};
    for (const table of copyTables.filter((name) => sourceTables.includes(name))) {
      sourceData[table] = await rows(source, table);
    }
    const rowCounts = Object.fromEntries(sourceTables.map((table) => [
      table, sourceData[table]?.length ?? 0,
    ]));
    rowCounts.migrations = sourceTables.includes('migrations') ? await count(source, 'migrations') : 0;
    const sourceRowCount = Object.entries(rowCounts)
      .filter(([table]) => table !== 'migrations').reduce((sum, [, value]) => sum + Number(value), 0);
    const catalog = (await source.query(`
      SELECT table_name,column_name,data_type,udt_name,is_nullable,COALESCE(column_default,'') column_default
      FROM information_schema.columns WHERE table_schema='public'
      ORDER BY table_name,ordinal_position
    `)).rows;
    const schemaFingerprint = hash(catalog);
    const contentFingerprint = hash(Object.fromEntries(
      Object.entries(sourceData).map(([table, tableRows]) => [
        table, tableRows.map((row) => hash(row)),
      ]),
    ));
    const existing = targetTables.has('legacy_adoption_runs')
      ? (await target.query(`
          SELECT id FROM legacy_adoption_runs
          WHERE "sourceSchemaFingerprint"=$1 AND "sourceContentFingerprint"=$2 AND status='completed'
        `, [schemaFingerprint, contentFingerprint])).rows[0]
      : undefined;
    const issues: string[] = [];
    if (unsupportedTables.length) issues.push(`Unsupported source tables: ${unsupportedTables.join(', ')}`);
    if (missingSource.length) issues.push(`Required source tables missing: ${missingSource.join(', ')}`);
    if (missingTarget.length) issues.push(`Required canonical target tables missing: ${missingTarget.join(', ')}`);
    if (rowCounts.migrations !== 0) issues.push('Legacy source has non-empty migration history; this contract requires operator review.');

    const organizations = new Set((sourceData.organization || []).map((row) => row.id));
    const users = sourceData.user || [];
    if (new Set(users.map((row) => String(row.email).trim().toLowerCase())).size !== users.length) {
      issues.push('Duplicate case-normalized user email exists.');
    }
    if (users.some((row) => !row.passwordHash && !row.password)) issues.push('A user has no adoptable credential.');
    if (users.some((row) => row.passwordHash && row.password && row.passwordHash !== row.password)) {
      issues.push('A user has conflicting credential columns.');
    }
    if (users.some((row) => row.organizationId && !organizations.has(row.organizationId))) {
      issues.push('A user references a missing organization.');
    }
    const docs = new Set((sourceData.safescope_knowledge_documents || []).map((row) => row.id));
    if ((sourceData.safescope_knowledge_chunks || []).some((row) => !docs.has(row.documentId))) {
      issues.push('A knowledge chunk references a missing document.');
    }
    const userIds = new Set(users.map((row) => row.id));
    if ((sourceData.user_subscription || []).some((row) => !userIds.has(row.userId))) {
      issues.push('A subscription references a missing user.');
    }
    for (const table of copyTables) {
      if (!existing && targetTables.has(table) && await count(target, table) !== 0) {
        issues.push(`Canonical target table is not empty: ${table}`);
      }
    }
    const migrationCount = targetTables.has('migrations') ? await count(target, 'migrations') : 0;
    const expectedMigration = targetTables.has('migrations')
      ? Number((await target.query(`
          SELECT count(*)::int count FROM migrations
          WHERE name='LegacyAdoptionProvenance1800000003000'
        `)).rows[0].count) : 0;
    if (!migrationCount || expectedMigration !== 1) {
      issues.push('Canonical target migrations were not legitimately applied through the adoption-provenance migration.');
    }
    const plan = {
      mode: apply ? 'apply' : 'dry-run',
      source: safeIdentity(sourceUrl),
      target: safeIdentity(targetUrl),
      sourceSchemaFingerprint: schemaFingerprint,
      sourceContentFingerprint: contentFingerprint,
      sourceMigrationCount: rowCounts.migrations,
      targetMigrationCount: migrationCount,
      sourceRowCount,
      rowCounts,
      unsupportedTables,
      mappings: {
        organization: 'organization',
        user: 'user + explicit organization_memberships',
        user_subscription: 'user_subscription',
        standards_master: 'standards_master',
        safescope_knowledge_documents: 'safescope_knowledge_documents',
        safescope_knowledge_chunks: 'safescope_knowledge_chunks',
        safescope_knowledge_sources: 'safescope_knowledge_sources',
        safescope_knowledge_ingestion_runs: 'safescope_knowledge_ingestion_runs',
        safescope_knowledge_retrieval_logs: 'safescope_knowledge_retrieval_logs',
        migrations: 'never copied',
      },
      issues,
      safeToApply: issues.length === 0,
      applied: false,
      alreadyApplied: false,
      adoptedRows: 0,
      membershipRows: users.filter((row) => row.organizationId).length,
      quarantinedRows: 0,
      warning: 'Verify a source backup and restore before apply. Apply writes only to the disposable canonical target.',
    };
    if (issues.length) {
      console.log(JSON.stringify(plan, null, 2));
      process.exitCode = 2;
      return;
    }
    if (existing) {
      plan.alreadyApplied = true;
      plan.applied = apply;
      console.log(JSON.stringify(plan, null, 2));
      return;
    }
    if (!apply) {
      console.log(JSON.stringify(plan, null, 2));
      return;
    }

    await target.query('BEGIN');
    try {
      await target.query(`SELECT pg_advisory_xact_lock(hashtext('safety-insite-legacy-adoption'))`);
      const run = (await target.query(`
        INSERT INTO legacy_adoption_runs (
          "sourceIdentityHash","sourceSchemaFingerprint","sourceContentFingerprint",status,
          "sourceRowCount","operatorLabel",summary
        ) VALUES ($1,$2,$3,'running',$4,$5,$6::jsonb) RETURNING id
      `, [
        sourceIdentityHash(sourceUrl), schemaFingerprint, contentFingerprint,
        sourceRowCount, operatorLabel, JSON.stringify({ rowCounts }),
      ])).rows[0];
      let adopted = 0;
      for (const table of copyTables) {
        for (const sourceRow of sourceData[table] || []) {
          const targetRow = normalizeTable(table, sourceRow);
          await insert(target, table, targetRow);
          await target.query(`
            INSERT INTO legacy_adoption_records (
              "runId","sourceTable","sourceId","targetTable","targetId","sourceRowHash",result
            ) VALUES ($1,$2,$3,$4,$5,$6,'adopted')
          `, [run.id, table, String(sourceRow.id), table, String(targetRow.id), hash(sourceRow)]);
          adopted += 1;
        }
      }
      for (const sourceUser of users.filter((row) => row.organizationId)) {
        await target.query(`
          INSERT INTO organization_memberships (
            id,"userId","organizationId",role,status,"joinedAt","createdAt","updatedAt"
          ) VALUES (uuid_generate_v4(),$1,$2,'member','active',$3,$3,$3)
        `, [sourceUser.id, sourceUser.organizationId, sourceUser.createdAt || new Date()]);
      }
      await target.query(`
        UPDATE legacy_adoption_runs SET status='completed',"adoptedRowCount"=$2,
          "quarantinedRowCount"=0,"completedAt"=now(),
          summary=summary || $3::jsonb WHERE id=$1
      `, [run.id, adopted, JSON.stringify({ membershipRows: plan.membershipRows })]);
      await target.query('COMMIT');
      plan.applied = true;
      plan.adoptedRows = adopted;
    } catch (error) {
      await target.query('ROLLBACK');
      throw error;
    }
    console.log(JSON.stringify(plan, null, 2));
  } finally {
    await source.query('ROLLBACK').catch(() => undefined);
    await Promise.all([source.end(), target.end()]);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
