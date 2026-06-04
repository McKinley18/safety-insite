import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSafeScopeFeedback1780000000000 implements MigrationInterface {
  name = 'CreateSafeScopeFeedback1780000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "safescope_feedback" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "workspaceId" varchar,
        "userId" varchar,
        "reportId" varchar,
        "findingId" varchar,
        "classification" varchar NOT NULL,
        "citation" varchar NOT NULL,
        "action" varchar NOT NULL,
        "replacementCitation" varchar,
        "reason" text,
        "confidenceBefore" double precision,
        "riskProfileId" varchar,
        "reviewerRole" varchar,
        "safeScopeVersion" varchar NOT NULL DEFAULT 'v2',
        "expertReviewed" boolean NOT NULL DEFAULT false,
        "promotedToGlobal" boolean NOT NULL DEFAULT false,
        "createdAt" timestamp NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_safescope_feedback_workspace" ON "safescope_feedback" ("workspaceId")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_safescope_feedback_classification" ON "safescope_feedback" ("classification")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_safescope_feedback_citation" ON "safescope_feedback" ("citation")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_safescope_feedback_citation"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_safescope_feedback_classification"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_safescope_feedback_workspace"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "safescope_feedback"`);
  }
}
