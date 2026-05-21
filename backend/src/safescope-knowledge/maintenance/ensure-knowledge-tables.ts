import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

async function main() {
  const databaseUrl = process.env.DATABASE_URL;

  const dataSource = new DataSource({
    type: 'postgres',
    url: databaseUrl || undefined,
    host: databaseUrl ? undefined : process.env.DB_HOST,
    port: databaseUrl ? undefined : Number(process.env.DB_PORT || 5432),
    username: databaseUrl ? undefined : process.env.DB_USERNAME,
    password: databaseUrl ? undefined : process.env.DB_PASSWORD,
    database: databaseUrl ? undefined : process.env.DB_NAME,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  await dataSource.initialize();

  await dataSource.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

  await dataSource.query(`
    CREATE TABLE IF NOT EXISTS safescope_knowledge_documents (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      title varchar NOT NULL,
      agency varchar NOT NULL DEFAULT 'GENERAL',
      "sourceType" varchar NOT NULL DEFAULT 'other',
      "authorityTier" integer NOT NULL DEFAULT 5,
      citation varchar NULL,
      "sourceUrl" varchar NULL,
      "publishedAt" varchar NULL,
      "reviewedAt" varchar NULL,
      "approvalStatus" varchar NOT NULL DEFAULT 'draft',
      summary text NULL,
      "rawText" text NOT NULL,
      "hazardTags" text[] NOT NULL DEFAULT '{}',
      "equipmentTags" text[] NOT NULL DEFAULT '{}',
      "taskTags" text[] NOT NULL DEFAULT '{}',
      "standardTags" text[] NOT NULL DEFAULT '{}',
      "lessonTags" text[] NOT NULL DEFAULT '{}',
      "createdAt" timestamp NOT NULL DEFAULT now(),
      "updatedAt" timestamp NOT NULL DEFAULT now()
    );
  `);

  await dataSource.query(`
    CREATE TABLE IF NOT EXISTS safescope_knowledge_chunks (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "documentId" uuid NOT NULL,
      "chunkIndex" integer NOT NULL DEFAULT 0,
      "sectionHeading" varchar NULL,
      "chunkText" text NOT NULL,
      "chunkSummary" text NULL,
      citation varchar NULL,
      "authorityTier" integer NOT NULL DEFAULT 5,
      "hazardTags" text[] NOT NULL DEFAULT '{}',
      "equipmentTags" text[] NOT NULL DEFAULT '{}',
      "taskTags" text[] NOT NULL DEFAULT '{}',
      "standardTags" text[] NOT NULL DEFAULT '{}',
      "lessonTags" text[] NOT NULL DEFAULT '{}',
      "confidenceWeight" numeric NOT NULL DEFAULT 0.5,
      "createdAt" timestamp NOT NULL DEFAULT now(),
      CONSTRAINT fk_safescope_knowledge_chunks_document
        FOREIGN KEY ("documentId")
        REFERENCES safescope_knowledge_documents(id)
        ON DELETE CASCADE
    );
  `);

  await dataSource.query(`
    CREATE TABLE IF NOT EXISTS safescope_knowledge_retrieval_logs (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "workspaceId" varchar NULL,
      "reportId" varchar NULL,
      "findingId" varchar NULL,
      query text NOT NULL,
      "agencyMode" varchar NULL,
      classification varchar NULL,
      "matchedChunkIds" text[] NOT NULL DEFAULT '{}',
      "topScore" numeric NOT NULL DEFAULT 0,
      "createdAt" timestamp NOT NULL DEFAULT now()
    );
  `);

  await dataSource.query(`
    CREATE TABLE IF NOT EXISTS safescope_knowledge_sources (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name varchar NOT NULL UNIQUE,
      agency varchar NOT NULL,
      "sourceType" varchar NOT NULL,
      "trustLevel" varchar NOT NULL DEFAULT 'official',
      "defaultAuthorityTier" integer NOT NULL DEFAULT 3,
      "baseUrl" text NOT NULL,
      description text NULL,
      status varchar NOT NULL DEFAULT 'active',
      "lastCheckedAt" timestamp NULL,
      "lastSuccessfulIngestionAt" timestamp NULL,
      "lastKnownVersion" varchar NULL,
      "metadataJson" jsonb NULL,
      "createdAt" timestamp NOT NULL DEFAULT now(),
      "updatedAt" timestamp NOT NULL DEFAULT now()
    );
  `);

  await dataSource.query(`
    CREATE TABLE IF NOT EXISTS safescope_knowledge_ingestion_runs (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "sourceId" uuid NULL,
      "sourceName" varchar NOT NULL,
      agency varchar NOT NULL,
      "sourceType" varchar NOT NULL,
      status varchar NOT NULL DEFAULT 'queued',
      "discoveredCount" integer NOT NULL DEFAULT 0,
      "ingestedCount" integer NOT NULL DEFAULT 0,
      "pendingReviewCount" integer NOT NULL DEFAULT 0,
      "approvedCount" integer NOT NULL DEFAULT 0,
      "skippedCount" integer NOT NULL DEFAULT 0,
      warnings text[] NOT NULL DEFAULT '{}',
      "errorMessage" text NULL,
      "metadataJson" jsonb NULL,
      "startedAt" timestamp NULL,
      "completedAt" timestamp NULL,
      "createdAt" timestamp NOT NULL DEFAULT now()
    );
  `);

  await dataSource.query(`
    CREATE INDEX IF NOT EXISTS idx_safescope_knowledge_chunks_document_id
      ON safescope_knowledge_chunks ("documentId");
  `);

  await dataSource.query(`
    CREATE INDEX IF NOT EXISTS idx_safescope_knowledge_documents_approval_status
      ON safescope_knowledge_documents ("approvalStatus");
  `);

  console.log('SafeScope knowledge tables verified/created.');

  await dataSource.destroy();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
