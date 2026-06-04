import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFixFeedback1780000001000 implements MigrationInterface {
  name = 'CreateFixFeedback1780000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "fix_feedback" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "report_id" varchar NOT NULL,
        "category" varchar NOT NULL,
        "original_suggestion" jsonb NOT NULL,
        "user_action" jsonb NOT NULL,
        "approved" boolean NOT NULL DEFAULT false,
        "created_at" timestamp NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_fix_feedback_category_approved"
      ON "fix_feedback" ("category", "approved")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_fix_feedback_report_id"
      ON "fix_feedback" ("report_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_fix_feedback_report_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_fix_feedback_category_approved"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "fix_feedback"`);
  }
}
