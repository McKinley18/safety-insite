import { MigrationInterface, QueryRunner } from 'typeorm';

export class LegacyAdoptionProvenance1800000003000 implements MigrationInterface {
  name = 'LegacyAdoptionProvenance1800000003000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    // Migration 1800000002000 intentionally created the optional knowledge tables,
    // but several column types/names predated the registered entity contract. Align
    // them forward without removing legacy values.
    for (const table of ['safescope_knowledge_documents', 'safescope_knowledge_chunks']) {
      for (const column of ['hazardTags', 'equipmentTags', 'taskTags', 'standardTags', 'lessonTags']) {
        await queryRunner.query(`
          ALTER TABLE "${table}" ALTER COLUMN "${column}" DROP DEFAULT
        `);
        await queryRunner.query(`
          ALTER TABLE "${table}" ALTER COLUMN "${column}" TYPE jsonb
          USING to_jsonb("${column}")
        `);
        await queryRunner.query(`
          ALTER TABLE "${table}" ALTER COLUMN "${column}" SET DEFAULT '[]'::jsonb
        `);
      }
    }
    await queryRunner.query(`
      ALTER TABLE "safescope_knowledge_documents"
      ALTER COLUMN "publishedAt" TYPE date USING NULLIF("publishedAt"::text, '')::date,
      ALTER COLUMN "reviewedAt" TYPE date USING NULLIF("reviewedAt"::text, '')::date
    `);
    await queryRunner.query(`
      ALTER TABLE "safescope_knowledge_chunks"
      ALTER COLUMN "confidenceWeight" TYPE double precision USING "confidenceWeight"::double precision
    `);
    await queryRunner.query(`
      ALTER TABLE "safescope_knowledge_retrieval_logs"
      ADD COLUMN IF NOT EXISTS "queryText" text,
      ADD COLUMN IF NOT EXISTS "retrievedChunkIds" jsonb NOT NULL DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS "selectedChunkIds" jsonb NOT NULL DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS "confidence" double precision NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "reasoningJson" jsonb NOT NULL DEFAULT '{}'::jsonb
    `);
    await queryRunner.query(`
      UPDATE "safescope_knowledge_retrieval_logs"
      SET "queryText" = COALESCE("queryText", "query"),
          "retrievedChunkIds" = CASE
            WHEN cardinality("matchedChunkIds") > 0 THEN to_jsonb("matchedChunkIds")
            ELSE "retrievedChunkIds" END,
          "confidence" = CASE WHEN "topScore" <> 0 THEN "topScore"::double precision ELSE "confidence" END
    `);
    await queryRunner.query(`
      ALTER TABLE "safescope_knowledge_retrieval_logs"
      ALTER COLUMN "queryText" SET NOT NULL,
      ALTER COLUMN "query" DROP NOT NULL
    `);
    await queryRunner.query(`
      CREATE TABLE "legacy_adoption_runs" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "sourceIdentityHash" char(64) NOT NULL,
        "sourceSchemaFingerprint" char(64) NOT NULL,
        "sourceContentFingerprint" char(64) NOT NULL,
        "status" varchar(24) NOT NULL,
        "sourceRowCount" integer NOT NULL,
        "adoptedRowCount" integer NOT NULL DEFAULT 0,
        "quarantinedRowCount" integer NOT NULL DEFAULT 0,
        "startedAt" timestamptz NOT NULL DEFAULT now(),
        "completedAt" timestamptz NULL,
        "operatorLabel" varchar(160) NOT NULL,
        "summary" jsonb NOT NULL DEFAULT '{}'::jsonb
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "uq_legacy_adoption_completed_source"
      ON "legacy_adoption_runs" ("sourceSchemaFingerprint", "sourceContentFingerprint")
      WHERE "status" = 'completed'
    `);
    await queryRunner.query(`
      CREATE TABLE "legacy_adoption_records" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "runId" uuid NOT NULL,
        "sourceTable" varchar(120) NOT NULL,
        "sourceId" varchar(180) NOT NULL,
        "targetTable" varchar(120) NOT NULL,
        "targetId" varchar(180) NOT NULL,
        "sourceRowHash" char(64) NOT NULL,
        "result" varchar(24) NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "fk_legacy_adoption_record_run" FOREIGN KEY ("runId")
          REFERENCES "legacy_adoption_runs"("id") ON DELETE RESTRICT
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "uq_legacy_adoption_record_source"
      ON "legacy_adoption_records" ("runId", "sourceTable", "sourceId")
    `);
    await queryRunner.query(`
      CREATE TABLE "legacy_adoption_quarantine" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "runId" uuid NOT NULL,
        "sourceTable" varchar(120) NOT NULL,
        "sourceId" varchar(180) NOT NULL,
        "classification" varchar(60) NOT NULL,
        "reason" text NOT NULL,
        "sourceRowHash" char(64) NOT NULL,
        "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb,
        "reviewStatus" varchar(24) NOT NULL DEFAULT 'pending_review',
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "fk_legacy_adoption_quarantine_run" FOREIGN KEY ("runId")
          REFERENCES "legacy_adoption_runs"("id") ON DELETE RESTRICT
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "uq_legacy_adoption_quarantine_source"
      ON "legacy_adoption_quarantine" ("runId", "sourceTable", "sourceId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "legacy_adoption_quarantine"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "legacy_adoption_records"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "legacy_adoption_runs"`);
    // Knowledge alignment is intentionally forward-only because converting JSON
    // arrays back to PostgreSQL arrays would be unsafe after canonical writes.
  }
}
