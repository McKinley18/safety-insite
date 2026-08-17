import { MigrationInterface, QueryRunner } from 'typeorm';

export class RegulatoryReleaseGovernance1800000004000 implements MigrationInterface {
  name = 'RegulatoryReleaseGovernance1800000004000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "regulatory_releases" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "releaseId" varchar(120) NOT NULL UNIQUE,
        "releaseVersion" varchar(80) NOT NULL,
        "status" varchar(24) NOT NULL DEFAULT 'draft',
        "manifestChecksum" char(64) NOT NULL,
        "parserVersion" varchar(80) NOT NULL,
        "recordCount" integer NOT NULL DEFAULT 0,
        "approvedBy" varchar NULL,
        "approvedAt" timestamptz NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "standards_master"
      ADD COLUMN IF NOT EXISTS "release_id" varchar(120),
      ADD COLUMN IF NOT EXISTS "source_url" text,
      ADD COLUMN IF NOT EXISTS "source_publication_date" date,
      ADD COLUMN IF NOT EXISTS "effective_date" date,
      ADD COLUMN IF NOT EXISTS "revision_date" date,
      ADD COLUMN IF NOT EXISTS "retrieval_date" date,
      ADD COLUMN IF NOT EXISTS "source_document_checksum" char(64),
      ADD COLUMN IF NOT EXISTS "normalized_record_checksum" char(64),
      ADD COLUMN IF NOT EXISTS "transformation_version" varchar(80),
      ADD COLUMN IF NOT EXISTS "reviewer_approved" boolean NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS "approval_date" timestamptz,
      ADD COLUMN IF NOT EXISTS "deprecation_status" varchar(24) NOT NULL DEFAULT 'active',
      ADD COLUMN IF NOT EXISTS "superseded_by_citation" varchar,
      ADD COLUMN IF NOT EXISTS "applicability_schema_version" varchar(80)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_standards_release_id" ON "standards_master" ("release_id")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_standards_deprecation_status"
      ON "standards_master" ("deprecation_status")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_standards_deprecation_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_standards_release_id"`);
    await queryRunner.query(`
      ALTER TABLE "standards_master"
      DROP COLUMN IF EXISTS "applicability_schema_version",
      DROP COLUMN IF EXISTS "superseded_by_citation",
      DROP COLUMN IF EXISTS "deprecation_status",
      DROP COLUMN IF EXISTS "approval_date",
      DROP COLUMN IF EXISTS "reviewer_approved",
      DROP COLUMN IF EXISTS "transformation_version",
      DROP COLUMN IF EXISTS "normalized_record_checksum",
      DROP COLUMN IF EXISTS "source_document_checksum",
      DROP COLUMN IF EXISTS "retrieval_date",
      DROP COLUMN IF EXISTS "revision_date",
      DROP COLUMN IF EXISTS "effective_date",
      DROP COLUMN IF EXISTS "source_publication_date",
      DROP COLUMN IF EXISTS "source_url",
      DROP COLUMN IF EXISTS "release_id"
    `);
    await queryRunner.query(`DROP TABLE IF EXISTS "regulatory_releases"`);
  }
}
