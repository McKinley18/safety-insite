import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReportWorkspaceStorage1780000000002 implements MigrationInterface {
  name = 'AddReportWorkspaceStorage1780000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "reports"
      ADD COLUMN IF NOT EXISTS "organizationId" varchar,
      ADD COLUMN IF NOT EXISTS "createdByUserId" varchar,
      ADD COLUMN IF NOT EXISTS "frontendReportJson" jsonb
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_report_organization_id"
      ON "reports" ("organizationId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_report_organization_id"`);
    await queryRunner.query(`
      ALTER TABLE "reports"
      DROP COLUMN IF EXISTS "frontendReportJson",
      DROP COLUMN IF EXISTS "createdByUserId",
      DROP COLUMN IF EXISTS "organizationId"
    `);
  }
}
