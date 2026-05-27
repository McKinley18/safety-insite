import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAuditSessionOrganizationScope1780000000005 implements MigrationInterface {
  name = 'AddAuditSessionOrganizationScope1780000000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "audit_sessions"
      ADD COLUMN IF NOT EXISTS "tenantId" varchar
    `);

    await queryRunner.query(`
      ALTER TABLE "audit_sessions"
      ADD COLUMN IF NOT EXISTS "organizationId" varchar
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_audit_sessions_tenant_id"
      ON "audit_sessions" ("tenantId")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_audit_sessions_organization_id"
      ON "audit_sessions" ("organizationId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_audit_sessions_organization_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_audit_sessions_tenant_id"`);

    await queryRunner.query(`
      ALTER TABLE "audit_sessions"
      DROP COLUMN IF EXISTS "organizationId"
    `);

    await queryRunner.query(`
      ALTER TABLE "audit_sessions"
      DROP COLUMN IF EXISTS "tenantId"
    `);
  }
}
