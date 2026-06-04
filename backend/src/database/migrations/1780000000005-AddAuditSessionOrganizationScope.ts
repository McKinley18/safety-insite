import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAuditSessionOrganizationScope1780000000005 implements MigrationInterface {
  name = 'AddAuditSessionOrganizationScope1780000000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "audit_sessions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "facilityName" character varying NOT NULL,
        "siteId" character varying,
        "tenantId" character varying,
        "organizationId" character varying,
        "auditorName" character varying,
        "auditDate" date,
        "standardsMode" character varying NOT NULL DEFAULT 'msha_hybrid',
        "status" character varying NOT NULL DEFAULT 'draft',
        "sessionNotes" text,
        "publishedAt" timestamp
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "audit_entries" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "auditSessionId" uuid NOT NULL,
        "locationText" character varying,
        "notes" text,
        "verificationStatus" character varying NOT NULL DEFAULT 'draft'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "audit_entry_attachments" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "auditEntryId" uuid NOT NULL,
        "imageUri" character varying NOT NULL,
        "mimeType" character varying,
        "fileName" character varying
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "audit_entry_findings" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "auditEntryId" uuid NOT NULL,
        "title" character varying,
        "observedCondition" text,
        "hazardCategoryCode" character varying,
        "applicableStandards" text,
        "severityLevel" integer,
        "suggestedFix" text,
        "confidenceScore" double precision NOT NULL DEFAULT 0,
        "aiReasoning" text,
        "verificationStatus" character varying NOT NULL DEFAULT 'draft'
      )
    `);

    await queryRunner.query(`ALTER TABLE "audit_sessions" ADD COLUMN IF NOT EXISTS "tenantId" character varying`);
    await queryRunner.query(`ALTER TABLE "audit_sessions" ADD COLUMN IF NOT EXISTS "organizationId" character varying`);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'fk_audit_entries_session'
        ) THEN
          ALTER TABLE "audit_entries"
          ADD CONSTRAINT "fk_audit_entries_session"
          FOREIGN KEY ("auditSessionId") REFERENCES "audit_sessions"("id") ON DELETE CASCADE;
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'fk_audit_entry_attachments_entry'
        ) THEN
          ALTER TABLE "audit_entry_attachments"
          ADD CONSTRAINT "fk_audit_entry_attachments_entry"
          FOREIGN KEY ("auditEntryId") REFERENCES "audit_entries"("id") ON DELETE CASCADE;
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'fk_audit_entry_findings_entry'
        ) THEN
          ALTER TABLE "audit_entry_findings"
          ADD CONSTRAINT "fk_audit_entry_findings_entry"
          FOREIGN KEY ("auditEntryId") REFERENCES "audit_entries"("id") ON DELETE CASCADE;
        END IF;
      END $$;
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_audit_sessions_tenant_id" ON "audit_sessions" ("tenantId")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_audit_sessions_organization_id" ON "audit_sessions" ("organizationId")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_audit_entries_session_id" ON "audit_entries" ("auditSessionId")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_audit_entry_attachments_entry_id" ON "audit_entry_attachments" ("auditEntryId")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_audit_entry_findings_entry_id" ON "audit_entry_findings" ("auditEntryId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_audit_entry_findings_entry_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_audit_entry_attachments_entry_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_audit_entries_session_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_audit_sessions_organization_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_audit_sessions_tenant_id"`);

    await queryRunner.query(`DROP TABLE IF EXISTS "audit_entry_findings"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_entry_attachments"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_entries"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_sessions"`);
  }
}
