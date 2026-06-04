import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSafeScopeReasoningSnapshots1790000000000 implements MigrationInterface {
  name = 'CreateSafeScopeReasoningSnapshots1790000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "safescope_reasoning_snapshots" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "reportId" varchar,
        "workspaceId" varchar,
        "classification" varchar,
        "engineVersion" varchar,
        "intelligenceMetadata" jsonb,
        "confidenceCalibration" jsonb,
        "reasoningDrift" jsonb,
        "workspaceLearning" jsonb,
        "operationalReasoning" jsonb,
        "standardsReasoning" jsonb,
        "decisionExplainability" jsonb,
        "fullIntelligenceSnapshot" jsonb,
        "validationStatus" varchar NOT NULL DEFAULT 'generated',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_safescope_reasoning_snapshots" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_safescope_reasoning_snapshots_report" ON "safescope_reasoning_snapshots" ("reportId")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_safescope_reasoning_snapshots_workspace" ON "safescope_reasoning_snapshots" ("workspaceId")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_safescope_reasoning_snapshots_classification" ON "safescope_reasoning_snapshots" ("classification")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_safescope_reasoning_snapshots_status" ON "safescope_reasoning_snapshots" ("validationStatus")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_safescope_reasoning_snapshots_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_safescope_reasoning_snapshots_classification"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_safescope_reasoning_snapshots_workspace"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_safescope_reasoning_snapshots_report"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "safescope_reasoning_snapshots"`);
  }
}
