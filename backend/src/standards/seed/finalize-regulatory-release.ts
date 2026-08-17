import 'dotenv/config';
import { createHash } from 'crypto';
const { Client } = require('pg') as {
  Client: new (options: { connectionString: string }) => {
    connect(): Promise<void>;
    query(sql: string, params?: unknown[]): Promise<{ rows: Array<Record<string, any>> }>;
    end(): Promise<void>;
  };
};

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is required.');
const verifiedConnectionString = connectionString;

const RELEASE_ID = process.env.REGULATORY_RELEASE_ID || 'federal-core-2026-07-30.1';
const RELEASE_VERSION = process.env.REGULATORY_RELEASE_VERSION || '2026-07-30.1';
const PARSER_VERSION = 'standards-release-normalizer-v1';
const APPLICABILITY_SCHEMA_VERSION = 'hazlenz-applicability-v1';

const digest = (value: unknown) =>
  createHash('sha256').update(JSON.stringify(value)).digest('hex');

async function run() {
  const client = new Client({ connectionString: verifiedConnectionString });
  await client.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(`
      SELECT id, agency_code, citation, part_number, subpart, title, standard_text,
             plain_language_summary, scope_code, source_key, source_name, source_type,
             authority_tier, allowed_use, requires_approval, approved_for_auto_ingestion,
             hazard_codes, required_controls, keywords, severity_weight, is_active
      FROM standards_master
      ORDER BY agency_code, citation
    `);
    const records = result.rows.map((row: Record<string, any>) => {
      const normalized = {
        agency: row.agency_code,
        citation: row.citation,
        title: row.title,
        canonicalText: row.standard_text,
        summary: row.plain_language_summary,
        scope: row.scope_code,
        sourceKey: row.source_key || null,
        sourceName: row.source_name || null,
        sourceType: row.source_type || null,
        authorityTier: row.authority_tier,
        allowedUse: row.allowed_use,
        hazards: row.hazard_codes || null,
        controls: row.required_controls || null,
        keywords: row.keywords || null,
        severityWeight: row.severity_weight,
        active: row.is_active,
      };
      return { id: row.id, row, checksum: digest(normalized) };
    });
    const manifestChecksum = digest(records.map(record => ({
      agency: record.row.agency_code,
      citation: record.row.citation,
      checksum: record.checksum,
    })));

    await client.query(`
      INSERT INTO regulatory_releases
        ("releaseId","releaseVersion","status","manifestChecksum","parserVersion","recordCount")
      VALUES ($1,$2,'provisional',$3,$4,$5)
      ON CONFLICT ("releaseId") DO UPDATE SET
        "releaseVersion" = EXCLUDED."releaseVersion",
        "manifestChecksum" = EXCLUDED."manifestChecksum",
        "parserVersion" = EXCLUDED."parserVersion",
        "recordCount" = EXCLUDED."recordCount"
    `, [RELEASE_ID, RELEASE_VERSION, manifestChecksum, PARSER_VERSION, records.length]);

    for (const record of records) {
      const sourceKey = record.row.source_key ||
        `starter-unverified:${String(record.row.agency_code).toLowerCase()}:${record.row.citation}`;
      const approved = Boolean(
        record.row.source_key &&
        record.row.approved_for_auto_ingestion &&
        !record.row.requires_approval,
      );
      await client.query(`
        UPDATE standards_master SET
          source_key = $2,
          release_id = $3,
          normalized_record_checksum = $4,
          transformation_version = $5,
          reviewer_approved = $6,
          deprecation_status = CASE WHEN is_active THEN 'active' ELSE 'deprecated' END,
          applicability_schema_version = $7
        WHERE id = $1
      `, [record.id, sourceKey, RELEASE_ID, record.checksum, PARSER_VERSION, approved,
        APPLICABILITY_SCHEMA_VERSION]);
    }
    await client.query('COMMIT');
    console.log(JSON.stringify({
      releaseId: RELEASE_ID,
      releaseVersion: RELEASE_VERSION,
      status: 'provisional',
      recordCount: records.length,
      manifestChecksum,
      approvedRecords: records.filter(record =>
        record.row.source_key && record.row.approved_for_auto_ingestion && !record.row.requires_approval).length,
      unknownSourceMetadata: records.filter(record => !record.row.source_key).length,
    }));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
