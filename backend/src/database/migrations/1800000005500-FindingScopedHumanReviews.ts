import { MigrationInterface, QueryRunner } from 'typeorm';

export class FindingScopedHumanReviews1800000005500 implements MigrationInterface {
  name = 'FindingScopedHumanReviews1800000005500';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "human_reviews" ADD COLUMN IF NOT EXISTS "findingId" uuid NULL`);
    await queryRunner.query(`ALTER TABLE "human_reviews" ADD COLUMN IF NOT EXISTS "status" varchar(24) NOT NULL DEFAULT 'current'`);
    await queryRunner.query(`ALTER TABLE "human_reviews" ADD COLUMN IF NOT EXISTS "idempotencyKey" varchar(128) NULL`);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_human_review_finding') THEN
          ALTER TABLE "human_reviews" ADD CONSTRAINT "fk_human_review_finding"
            FOREIGN KEY ("findingId") REFERENCES "inspection_findings"("id") ON DELETE RESTRICT;
        END IF;
      END $$;
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_human_review_finding_created" ON "human_reviews" ("findingId", "createdAt")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_human_review_finding_status" ON "human_reviews" ("findingId", "status")`);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "uq_human_review_finding_idempotency" ON "human_reviews" ("findingId", "idempotencyKey") WHERE "findingId" IS NOT NULL AND "idempotencyKey" IS NOT NULL`);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "uq_human_review_current_finding"
      ON "human_reviews" ("findingId") WHERE "findingId" IS NOT NULL AND "status" = 'current'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "uq_human_review_current_finding"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_human_review_finding_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_human_review_finding_created"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "uq_human_review_finding_idempotency"`);
    await queryRunner.query(`ALTER TABLE "human_reviews" DROP CONSTRAINT IF EXISTS "fk_human_review_finding"`);
    await queryRunner.query(`ALTER TABLE "human_reviews" DROP COLUMN IF EXISTS "status"`);
    await queryRunner.query(`ALTER TABLE "human_reviews" DROP COLUMN IF EXISTS "findingId"`);
    await queryRunner.query(`ALTER TABLE "human_reviews" DROP COLUMN IF EXISTS "idempotencyKey"`);
  }
}
