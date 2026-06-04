import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSafeScopeSupervisorValidations1790000001000 implements MigrationInterface {
  name = 'CreateSafeScopeSupervisorValidations1790000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "safescope_supervisor_validations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "reasoningSnapshotId" varchar NOT NULL,
        "reportId" varchar,
        "workspaceId" varchar,
        "reviewerName" varchar,
        "validationDecision" varchar NOT NULL DEFAULT 'accepted',
        "reviewerNotes" text,
        "modifiedClassification" jsonb,
        "modifiedStandards" jsonb,
        "modifiedRiskAssessment" jsonb,
        "validationMetadata" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_safescope_supervisor_validations" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_safescope_supervisor_validations_snapshot" ON "safescope_supervisor_validations" ("reasoningSnapshotId")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_safescope_supervisor_validations_workspace" ON "safescope_supervisor_validations" ("workspaceId")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_safescope_supervisor_validations_decision" ON "safescope_supervisor_validations" ("validationDecision")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_safescope_supervisor_validations_decision"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_safescope_supervisor_validations_workspace"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_safescope_supervisor_validations_snapshot"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "safescope_supervisor_validations"`);
  }
}
