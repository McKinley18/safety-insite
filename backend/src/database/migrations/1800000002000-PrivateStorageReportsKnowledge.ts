import { MigrationInterface, QueryRunner } from 'typeorm';

export class PrivateStorageReportsKnowledge1800000002000 implements MigrationInterface {
  name = 'PrivateStorageReportsKnowledge1800000002000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`
      CREATE TABLE "storage_objects" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(), "category" varchar(24) NOT NULL,
        "provider" varchar(24) NOT NULL, "objectKey" varchar(500) NOT NULL UNIQUE,
        "organizationId" uuid NULL, "ownerUserId" uuid NULL, "parentType" varchar(40) NOT NULL,
        "parentId" uuid NOT NULL, "contentType" varchar(160) NOT NULL, "downloadName" varchar(255) NOT NULL,
        "sizeBytes" bigint NOT NULL, "sha256" char(64) NOT NULL, "status" varchar(24) NOT NULL DEFAULT 'uploading',
        "createdByUserId" uuid NOT NULL, "expiresAt" timestamptz NULL, "deletedAt" timestamptz NULL,
        "deletedByUserId" uuid NULL, "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "chk_storage_object_exactly_one_scope" CHECK (
          (("ownerUserId" IS NOT NULL AND "organizationId" IS NULL) OR
           ("ownerUserId" IS NULL AND "organizationId" IS NOT NULL))
        )
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_storage_object_scope" ON "storage_objects" ("organizationId","ownerUserId","status")`);
    await queryRunner.query(`CREATE INDEX "idx_storage_object_parent" ON "storage_objects" ("parentType","parentId")`);
    await queryRunner.query(`
      CREATE TABLE "inspection_reports" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(), "inspectionId" uuid NOT NULL,
        "organizationId" uuid NULL, "ownerUserId" uuid NULL, "createdByUserId" uuid NOT NULL,
        "archivedAt" timestamptz NULL, "createdAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "chk_inspection_report_exactly_one_scope" CHECK (
          (("ownerUserId" IS NOT NULL AND "organizationId" IS NULL) OR
           ("ownerUserId" IS NULL AND "organizationId" IS NOT NULL))
        ),
        CONSTRAINT "fk_inspection_report_inspection" FOREIGN KEY ("inspectionId") REFERENCES "inspection"("id") ON DELETE RESTRICT
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX "uq_inspection_report_inspection" ON "inspection_reports" ("inspectionId")`);
    await queryRunner.query(`
      CREATE TABLE "inspection_report_versions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(), "reportId" uuid NOT NULL,
        "version" integer NOT NULL, "status" varchar(24) NOT NULL, "sourceInspectionVersion" integer NOT NULL,
        "sourceSnapshot" jsonb NOT NULL, "storageObjectId" uuid NULL, "sha256" char(64) NULL,
        "sizeBytes" bigint NULL, "generatorVersion" varchar(80) NOT NULL, "generatedByUserId" uuid NOT NULL,
        "generatedAt" timestamptz NULL, "failureReason" text NULL, "supersededByVersionId" uuid NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "fk_inspection_report_version_report" FOREIGN KEY ("reportId") REFERENCES "inspection_reports"("id") ON DELETE RESTRICT,
        CONSTRAINT "fk_inspection_report_version_storage" FOREIGN KEY ("storageObjectId") REFERENCES "storage_objects"("id") ON DELETE RESTRICT
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX "uq_inspection_report_version" ON "inspection_report_versions" ("reportId","version")`);
    await queryRunner.query(`
      CREATE TABLE "legacy_report_quarantine" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(), "sourceTable" varchar(80) NOT NULL,
        "sourceId" varchar(160) NOT NULL, "classification" varchar(50) NOT NULL, "reason" text NOT NULL,
        "sourcePayloadSha256" char(64) NOT NULL, "reviewStatus" varchar(24) NOT NULL DEFAULT 'pending_review',
        "metadata" jsonb NULL, "quarantinedAt" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX "uq_legacy_report_quarantine_source" ON "legacy_report_quarantine" ("sourceTable","sourceId")`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "safescope_knowledge_documents" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(), "title" varchar NOT NULL,
        "agency" varchar NOT NULL DEFAULT 'GENERAL', "sourceType" varchar NOT NULL DEFAULT 'other',
        "authorityTier" integer NOT NULL DEFAULT 5, "citation" varchar NULL, "sourceUrl" varchar NULL,
        "publishedAt" varchar NULL, "reviewedAt" varchar NULL, "approvalStatus" varchar NOT NULL DEFAULT 'draft',
        "summary" text NULL, "rawText" text NOT NULL, "hazardTags" text[] NOT NULL DEFAULT '{}',
        "equipmentTags" text[] NOT NULL DEFAULT '{}', "taskTags" text[] NOT NULL DEFAULT '{}',
        "standardTags" text[] NOT NULL DEFAULT '{}', "lessonTags" text[] NOT NULL DEFAULT '{}',
        "createdAt" timestamp NOT NULL DEFAULT now(), "updatedAt" timestamp NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "safescope_knowledge_chunks" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(), "documentId" uuid NOT NULL,
        "chunkIndex" integer NOT NULL DEFAULT 0, "sectionHeading" varchar NULL, "chunkText" text NOT NULL,
        "chunkSummary" text NULL, "citation" varchar NULL, "authorityTier" integer NOT NULL DEFAULT 5,
        "hazardTags" text[] NOT NULL DEFAULT '{}', "equipmentTags" text[] NOT NULL DEFAULT '{}',
        "taskTags" text[] NOT NULL DEFAULT '{}', "standardTags" text[] NOT NULL DEFAULT '{}',
        "lessonTags" text[] NOT NULL DEFAULT '{}', "confidenceWeight" numeric NOT NULL DEFAULT 0.5,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "fk_safescope_knowledge_chunks_document" FOREIGN KEY ("documentId")
          REFERENCES "safescope_knowledge_documents"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "safescope_knowledge_retrieval_logs" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(), "workspaceId" varchar NULL, "reportId" varchar NULL,
        "findingId" varchar NULL, "query" text NOT NULL, "agencyMode" varchar NULL, "classification" varchar NULL,
        "matchedChunkIds" text[] NOT NULL DEFAULT '{}', "topScore" numeric NOT NULL DEFAULT 0,
        "createdAt" timestamp NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "safescope_knowledge_sources" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(), "name" varchar NOT NULL UNIQUE,
        "agency" varchar NOT NULL, "sourceType" varchar NOT NULL, "trustLevel" varchar NOT NULL DEFAULT 'official',
        "defaultAuthorityTier" integer NOT NULL DEFAULT 3, "baseUrl" text NOT NULL, "description" text NULL,
        "status" varchar NOT NULL DEFAULT 'active', "lastCheckedAt" timestamp NULL,
        "lastSuccessfulIngestionAt" timestamp NULL, "lastKnownVersion" varchar NULL, "metadataJson" jsonb NULL,
        "createdAt" timestamp NOT NULL DEFAULT now(), "updatedAt" timestamp NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "safescope_knowledge_ingestion_runs" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(), "sourceId" uuid NULL, "sourceName" varchar NOT NULL,
        "agency" varchar NOT NULL, "sourceType" varchar NOT NULL, "status" varchar NOT NULL DEFAULT 'queued',
        "discoveredCount" integer NOT NULL DEFAULT 0, "ingestedCount" integer NOT NULL DEFAULT 0,
        "pendingReviewCount" integer NOT NULL DEFAULT 0, "approvedCount" integer NOT NULL DEFAULT 0,
        "skippedCount" integer NOT NULL DEFAULT 0, "warnings" text[] NOT NULL DEFAULT '{}',
        "errorMessage" text NULL, "metadataJson" jsonb NULL, "startedAt" timestamp NULL,
        "completedAt" timestamp NULL, "createdAt" timestamp NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_safescope_knowledge_chunks_document_id" ON "safescope_knowledge_chunks" ("documentId")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_safescope_knowledge_documents_approval_status" ON "safescope_knowledge_documents" ("approvalStatus")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "legacy_report_quarantine"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "inspection_report_versions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "inspection_reports"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "storage_objects"`);
    // Knowledge tables may predate this migration and are deliberately retained.
  }
}
