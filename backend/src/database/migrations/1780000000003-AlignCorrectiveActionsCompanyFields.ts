import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlignCorrectiveActionsCompanyFields1780000000003 implements MigrationInterface {
  name = 'AlignCorrectiveActionsCompanyFields1780000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "corrective_actions"
      ADD COLUMN IF NOT EXISTS "displayId" character varying
    `);

    await queryRunner.query(`
      ALTER TABLE "corrective_actions"
      ADD COLUMN IF NOT EXISTS "tenantId" character varying DEFAULT 'default'
    `);

    await queryRunner.query(`
      ALTER TABLE "corrective_actions"
      ADD COLUMN IF NOT EXISTS "assignedToUserId" character varying
    `);

    await queryRunner.query(`
      ALTER TABLE "corrective_actions"
      ADD COLUMN IF NOT EXISTS "assignedToName" character varying
    `);

    await queryRunner.query(`
      ALTER TABLE "corrective_actions"
      ADD COLUMN IF NOT EXISTS "category" character varying
    `);

    await queryRunner.query(`
      ALTER TABLE "corrective_actions"
      ADD COLUMN IF NOT EXISTS "originalSuggestion" jsonb
    `);

    await queryRunner.query(`
      ALTER TABLE "corrective_actions"
      ADD COLUMN IF NOT EXISTS "organizationId" character varying
    `);

    await queryRunner.query(`
      ALTER TABLE "corrective_actions"
      ADD COLUMN IF NOT EXISTS "siteId" character varying
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_corrective_actions_display_id_unique"
      ON "corrective_actions" ("displayId")
      WHERE "displayId" IS NOT NULL
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_corrective_actions_organization_id"
      ON "corrective_actions" ("organizationId")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_corrective_actions_tenant_id"
      ON "corrective_actions" ("tenantId")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_corrective_actions_site_id"
      ON "corrective_actions" ("siteId")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_corrective_actions_status_priority"
      ON "corrective_actions" ("statusCode", "priorityCode")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_corrective_actions_status_priority"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_corrective_actions_site_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_corrective_actions_tenant_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_corrective_actions_organization_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_corrective_actions_display_id_unique"`);

    await queryRunner.query(`
      ALTER TABLE "corrective_actions"
      DROP COLUMN IF EXISTS "siteId"
    `);

    await queryRunner.query(`
      ALTER TABLE "corrective_actions"
      DROP COLUMN IF EXISTS "organizationId"
    `);

    await queryRunner.query(`
      ALTER TABLE "corrective_actions"
      DROP COLUMN IF EXISTS "originalSuggestion"
    `);

    await queryRunner.query(`
      ALTER TABLE "corrective_actions"
      DROP COLUMN IF EXISTS "category"
    `);

    await queryRunner.query(`
      ALTER TABLE "corrective_actions"
      DROP COLUMN IF EXISTS "assignedToName"
    `);

    await queryRunner.query(`
      ALTER TABLE "corrective_actions"
      DROP COLUMN IF EXISTS "assignedToUserId"
    `);

    await queryRunner.query(`
      ALTER TABLE "corrective_actions"
      DROP COLUMN IF EXISTS "tenantId"
    `);

    await queryRunner.query(`
      ALTER TABLE "corrective_actions"
      DROP COLUMN IF EXISTS "displayId"
    `);
  }
}
