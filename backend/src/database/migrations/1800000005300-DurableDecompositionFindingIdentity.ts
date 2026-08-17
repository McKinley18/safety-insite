import { MigrationInterface, QueryRunner } from 'typeorm';

export class DurableDecompositionFindingIdentity1800000005300 implements MigrationInterface {
  name = 'DurableDecompositionFindingIdentity1800000005300';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "inspection_findings"
      ALTER COLUMN "finalReviewId" DROP NOT NULL,
      ALTER COLUMN "finalizedByUserId" DROP NOT NULL
    `);
    await queryRunner.query(`ALTER TABLE "inspection_findings" DROP CONSTRAINT IF EXISTS "inspection_findings_status_check"`);
    await queryRunner.query(`
      ALTER TABLE "inspection_findings"
      ADD COLUMN IF NOT EXISTS "hazardKey" varchar(120) NOT NULL DEFAULT 'primary',
      ADD COLUMN IF NOT EXISTS "originatingAnalysisId" uuid NULL
        REFERENCES "hazlenz_analyses"("id") ON DELETE RESTRICT
    `);
    await queryRunner.query(`
      ALTER TABLE "inspection_findings"
      ADD CONSTRAINT "inspection_findings_status_check"
      CHECK ("status" IN ('pending_review','finalized','dismissed','superseded'))
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_inspection_finding_observation_hazard"
      ON "inspection_findings" ("observationId", "hazardKey", "status")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_inspection_finding_observation_hazard"`);
    await queryRunner.query(`ALTER TABLE "inspection_findings" DROP CONSTRAINT IF EXISTS "inspection_findings_status_check"`);
    await queryRunner.query(`ALTER TABLE "inspection_findings" ADD CONSTRAINT "inspection_findings_status_check" CHECK ("status" IN ('finalized','dismissed'))`);
    await queryRunner.query(`ALTER TABLE "inspection_findings" DROP COLUMN IF EXISTS "originatingAnalysisId", DROP COLUMN IF EXISTS "hazardKey"`);
    await queryRunner.query(`ALTER TABLE "inspection_findings" ALTER COLUMN "finalReviewId" SET NOT NULL, ALTER COLUMN "finalizedByUserId" SET NOT NULL`);
  }
}
