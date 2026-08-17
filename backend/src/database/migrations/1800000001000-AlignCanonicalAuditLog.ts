import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlignCanonicalAuditLog1800000001000 implements MigrationInterface {
  name = 'AlignCanonicalAuditLog1800000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "audit_logs"
      ADD COLUMN IF NOT EXISTS "tenantId" varchar NOT NULL DEFAULT 'default'
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_audit_logs_tenant_created"
      ON "audit_logs" ("tenantId", "createdAt")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_audit_logs_tenant_created"`);
    await queryRunner.query(`ALTER TABLE "audit_logs" DROP COLUMN IF EXISTS "tenantId"`);
  }
}
