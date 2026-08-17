import { MigrationInterface, QueryRunner } from 'typeorm';

export class CanonicalInspectionFoundation1800000000000 implements MigrationInterface {
  name = 'CanonicalInspectionFoundation1800000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "organization_memberships" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL REFERENCES "user"("id") ON DELETE RESTRICT,
        "organizationId" uuid NOT NULL REFERENCES "organization"("id") ON DELETE RESTRICT,
        "role" varchar(32) NOT NULL DEFAULT 'member',
        "status" varchar(32) NOT NULL DEFAULT 'active',
        "invitedByUserId" uuid NULL,
        "joinedAt" timestamptz NULL,
        "endedAt" timestamptz NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "chk_membership_role" CHECK ("role" IN ('member','manager','organization_admin')),
        CONSTRAINT "chk_membership_status" CHECK ("status" IN ('invited','active','suspended','ended'))
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_membership_organization_status" ON "organization_memberships" ("organizationId", "status")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_membership_user_status" ON "organization_memberships" ("userId", "status")`);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "uq_membership_one_active_user" ON "organization_memberships" ("userId") WHERE "status" = 'active'`);
    await queryRunner.query(`
      INSERT INTO "organization_memberships"
        ("userId", "organizationId", "role", "status", "joinedAt")
      SELECT u."id", u."organizationId"::uuid,
        CASE
          WHEN lower(COALESCE(u."role", '')) IN ('owner','org_owner','admin','organization_admin') THEN 'organization_admin'
          WHEN lower(COALESCE(u."role", '')) IN ('manager','safety_director') THEN 'manager'
          ELSE 'member'
        END,
        'active', now()
      FROM "user" u
      WHERE u."organizationId" IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM "organization_memberships" m
          WHERE m."userId" = u."id" AND m."status" = 'active'
        )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "security_audit_events" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "actorUserId" uuid NULL,
        "organizationId" uuid NULL,
        "action" varchar(80) NOT NULL,
        "resourceType" varchar(80) NOT NULL,
        "resourceId" uuid NULL,
        "metadata" jsonb NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_security_audit_actor_created" ON "security_audit_events" ("actorUserId", "createdAt")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_security_audit_organization_created" ON "security_audit_events" ("organizationId", "createdAt")`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "platform_support_grants" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "platformUserId" uuid NOT NULL REFERENCES "user"("id") ON DELETE RESTRICT,
        "organizationId" uuid NOT NULL REFERENCES "organization"("id") ON DELETE RESTRICT,
        "approvedByUserId" uuid NOT NULL REFERENCES "user"("id") ON DELETE RESTRICT,
        "reason" text NOT NULL,
        "expiresAt" timestamptz NOT NULL,
        "revokedAt" timestamptz NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_support_grant_actor_expiry" ON "platform_support_grants" ("platformUserId", "expiresAt")`);

    await queryRunner.query(`ALTER TABLE "site" ALTER COLUMN "organizationId" TYPE uuid USING "organizationId"::uuid`);
    await queryRunner.query(`ALTER TABLE "site" ADD COLUMN IF NOT EXISTS "ownerUserId" uuid NULL`);
    await queryRunner.query(`ALTER TABLE "site" ADD COLUMN IF NOT EXISTS "createdByUserId" uuid NULL`);
    await queryRunner.query(`ALTER TABLE "site" ADD COLUMN IF NOT EXISTS "updatedAt" timestamptz NOT NULL DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "site" ADD COLUMN IF NOT EXISTS "archivedAt" timestamptz NULL`);
    await queryRunner.query(`ALTER TABLE "site" ADD COLUMN IF NOT EXISTS "archivedByUserId" uuid NULL`);
    await queryRunner.query(`
      DO $$ BEGIN
        IF EXISTS (SELECT 1 FROM "site" WHERE "organizationId" IS NULL AND "ownerUserId" IS NULL) THEN
          RAISE EXCEPTION 'Ambiguous site ownership requires operator review before migration';
        END IF;
      END $$
    `);
    await queryRunner.query(`ALTER TABLE "site" DROP CONSTRAINT IF EXISTS "chk_site_exactly_one_owner"`);
    await queryRunner.query(`ALTER TABLE "site" ADD CONSTRAINT "chk_site_exactly_one_owner" CHECK ((("ownerUserId" IS NOT NULL AND "organizationId" IS NULL) OR ("ownerUserId" IS NULL AND "organizationId" IS NOT NULL)))`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_site_owner_archived" ON "site" ("ownerUserId", "archivedAt")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_site_organization_archived" ON "site" ("organizationId", "archivedAt")`);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "uq_site_owner_active_name" ON "site" ("ownerUserId", lower("name")) WHERE "ownerUserId" IS NOT NULL AND "archivedAt" IS NULL`);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "uq_site_organization_active_name" ON "site" ("organizationId", lower("name")) WHERE "organizationId" IS NOT NULL AND "archivedAt" IS NULL`);

    await queryRunner.query(`ALTER TABLE "inspection" ALTER COLUMN "organizationId" TYPE uuid USING "organizationId"::uuid`);
    await queryRunner.query(`ALTER TABLE "inspection" ALTER COLUMN "createdByUserId" TYPE uuid USING "createdByUserId"::uuid`);
    await queryRunner.query(`ALTER TABLE "inspection" ALTER COLUMN "createdByUserId" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "inspection" ADD COLUMN IF NOT EXISTS "ownerUserId" uuid NULL`);
    await queryRunner.query(`ALTER TABLE "inspection" ADD COLUMN IF NOT EXISTS "siteId" uuid NULL`);
    await queryRunner.query(`ALTER TABLE "inspection" ADD COLUMN IF NOT EXISTS "status" varchar(24) NOT NULL DEFAULT 'draft'`);
    await queryRunner.query(`ALTER TABLE "inspection" ADD COLUMN IF NOT EXISTS "version" integer NOT NULL DEFAULT 1`);
    await queryRunner.query(`ALTER TABLE "inspection" ADD COLUMN IF NOT EXISTS "completedAt" timestamptz NULL`);
    await queryRunner.query(`ALTER TABLE "inspection" ADD COLUMN IF NOT EXISTS "completedByUserId" uuid NULL`);
    await queryRunner.query(`ALTER TABLE "inspection" ADD COLUMN IF NOT EXISTS "archivedAt" timestamptz NULL`);
    await queryRunner.query(`ALTER TABLE "inspection" ADD COLUMN IF NOT EXISTS "updatedAt" timestamptz NOT NULL DEFAULT now()`);
    await queryRunner.query(`
      DO $$ BEGIN
        IF EXISTS (SELECT 1 FROM "inspection" WHERE "siteId" IS NULL) THEN
          RAISE EXCEPTION 'Existing inspections require explicit site mapping before migration';
        END IF;
      END $$
    `);
    await queryRunner.query(`ALTER TABLE "inspection" ALTER COLUMN "siteId" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "inspection" DROP CONSTRAINT IF EXISTS "chk_inspection_exactly_one_scope"`);
    await queryRunner.query(`ALTER TABLE "inspection" ADD CONSTRAINT "chk_inspection_exactly_one_scope" CHECK ((("ownerUserId" IS NOT NULL AND "organizationId" IS NULL) OR ("ownerUserId" IS NULL AND "organizationId" IS NOT NULL)))`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_inspection_site_status" ON "inspection" ("siteId", "status")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_inspection_org_status" ON "inspection" ("organizationId", "status")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_inspection_owner_status" ON "inspection" ("ownerUserId", "status")`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "inspection_assignments" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "inspectionId" uuid NOT NULL REFERENCES "inspection"("id") ON DELETE CASCADE,
        "userId" uuid NOT NULL REFERENCES "user"("id") ON DELETE RESTRICT,
        "role" varchar(24) NOT NULL CHECK ("role" IN ('collaborator','reviewer')),
        "assignedByUserId" uuid NOT NULL REFERENCES "user"("id") ON DELETE RESTRICT,
        "endedAt" timestamptz NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        UNIQUE ("inspectionId", "userId", "role")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "observations" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "inspectionId" uuid NOT NULL REFERENCES "inspection"("id") ON DELETE CASCADE,
        "rawText" text NOT NULL,
        "evidenceSource" varchar(32) NOT NULL DEFAULT 'direct_observation',
        "version" integer NOT NULL DEFAULT 1,
        "createdByUserId" uuid NOT NULL REFERENCES "user"("id") ON DELETE RESTRICT,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_observation_inspection_created" ON "observations" ("inspectionId", "createdAt")`);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "hazlenz_analyses" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "observationId" uuid NOT NULL REFERENCES "observations"("id") ON DELETE CASCADE,
        "engineVersion" varchar(80) NOT NULL,
        "traceId" varchar(80) NULL,
        "resultSnapshot" jsonb NOT NULL,
        "advisoryStatus" varchar(24) NOT NULL DEFAULT 'advisory' CHECK ("advisoryStatus" = 'advisory'),
        "requestedByUserId" uuid NOT NULL REFERENCES "user"("id") ON DELETE RESTRICT,
        "createdAt" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_hazlenz_analysis_observation_created" ON "hazlenz_analyses" ("observationId", "createdAt")`);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "human_reviews" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "observationId" uuid NOT NULL REFERENCES "observations"("id") ON DELETE CASCADE,
        "analysisId" uuid NULL REFERENCES "hazlenz_analyses"("id") ON DELETE RESTRICT,
        "decision" varchar(24) NOT NULL CHECK ("decision" IN ('accepted','edited','overridden','dismissed')),
        "rationale" text NOT NULL,
        "reviewedConclusion" jsonb NULL,
        "reviewedByUserId" uuid NOT NULL REFERENCES "user"("id") ON DELETE RESTRICT,
        "createdAt" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_human_review_observation_created" ON "human_reviews" ("observationId", "createdAt")`);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "inspection_findings" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "inspectionId" uuid NOT NULL REFERENCES "inspection"("id") ON DELETE CASCADE,
        "observationId" uuid NOT NULL REFERENCES "observations"("id") ON DELETE RESTRICT,
        "selectedAnalysisId" uuid NULL REFERENCES "hazlenz_analyses"("id") ON DELETE RESTRICT,
        "finalReviewId" uuid NOT NULL REFERENCES "human_reviews"("id") ON DELETE RESTRICT,
        "status" varchar(24) NOT NULL CHECK ("status" IN ('finalized','dismissed')),
        "hazardCategory" varchar(160) NULL,
        "conclusion" text NOT NULL,
        "revision" integer NOT NULL DEFAULT 1,
        "finalizedByUserId" uuid NOT NULL REFERENCES "user"("id") ON DELETE RESTRICT,
        "createdAt" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_inspection_finding_inspection_status" ON "inspection_findings" ("inspectionId", "status")`);

    await queryRunner.query(`ALTER TABLE "corrective_actions" ALTER COLUMN "organizationId" TYPE uuid USING "organizationId"::uuid`);
    await queryRunner.query(`ALTER TABLE "corrective_actions" ALTER COLUMN "reportId" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "corrective_actions" ADD COLUMN IF NOT EXISTS "inspectionId" uuid NULL`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "tasks" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "organizationId" uuid NULL REFERENCES "organization"("id") ON DELETE RESTRICT,
        "ownerUserId" uuid NULL REFERENCES "user"("id") ON DELETE RESTRICT,
        "assignedToUserId" uuid NULL REFERENCES "user"("id") ON DELETE RESTRICT,
        "siteId" uuid NULL REFERENCES "site"("id") ON DELETE RESTRICT,
        "inspectionId" uuid NULL REFERENCES "inspection"("id") ON DELETE RESTRICT,
        "title" varchar(200) NOT NULL,
        "description" text NULL,
        "dueDate" date NOT NULL,
        "priority" varchar(16) NOT NULL DEFAULT 'medium',
        "status" varchar(16) NOT NULL DEFAULT 'open',
        "version" integer NOT NULL DEFAULT 1,
        "createdByUserId" uuid NOT NULL REFERENCES "user"("id") ON DELETE RESTRICT,
        "completedAt" timestamptz NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "chk_task_exactly_one_scope" CHECK ((("ownerUserId" IS NOT NULL AND "organizationId" IS NULL) OR ("ownerUserId" IS NULL AND "organizationId" IS NOT NULL)))
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_task_org_due" ON "tasks" ("organizationId", "dueDate")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_task_owner_due" ON "tasks" ("ownerUserId", "dueDate")`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "entitlement_grants" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL REFERENCES "user"("id") ON DELETE RESTRICT,
        "source" varchar(32) NOT NULL CHECK ("source" IN ('pilot','test','support')),
        "tier" varchar(32) NOT NULL DEFAULT 'expert' CHECK ("tier" IN ('pro','expert')),
        "status" varchar(24) NOT NULL DEFAULT 'active' CHECK ("status" IN ('active','revoked','expired')),
        "startsAt" timestamptz NOT NULL,
        "endsAt" timestamptz NOT NULL,
        "issuedByUserId" uuid NULL,
        "reason" text NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_entitlement_grant_user_status_expiry" ON "entitlement_grants" ("userId", "status", "endsAt")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "entitlement_grants"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tasks"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "inspection_findings"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "human_reviews"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "hazlenz_analyses"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "observations"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "inspection_assignments"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "platform_support_grants"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "security_audit_events"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "organization_memberships"`);
  }
}
