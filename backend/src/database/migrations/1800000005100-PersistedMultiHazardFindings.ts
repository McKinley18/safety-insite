import { MigrationInterface, QueryRunner } from 'typeorm';

export class PersistedMultiHazardFindings1800000005100 implements MigrationInterface {
  name = 'PersistedMultiHazardFindings1800000005100';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "inspection_findings"
      ADD COLUMN IF NOT EXISTS "segmentKey" varchar(120) NOT NULL DEFAULT 'primary',
      ADD COLUMN IF NOT EXISTS "sourceCandidate" jsonb,
      ADD COLUMN IF NOT EXISTS "reviewerDisposition" varchar(16) NOT NULL DEFAULT 'single'
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "uq_inspection_finding_segment_revision"
      ON "inspection_findings" ("observationId", "segmentKey", "revision")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_inspection_finding_observation_segment"
      ON "inspection_findings" ("observationId", "segmentKey")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_inspection_finding_observation_segment"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "uq_inspection_finding_segment_revision"`);
    await queryRunner.query(`
      ALTER TABLE "inspection_findings"
      DROP COLUMN IF EXISTS "reviewerDisposition",
      DROP COLUMN IF EXISTS "sourceCandidate",
      DROP COLUMN IF EXISTS "segmentKey"
    `);
  }
}
