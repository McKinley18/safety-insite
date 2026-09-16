import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * §305 (SE-12) — CANONICAL SCHEMA CONVERGENCE. THE MIGRATION HISTORY CATCHES UP TO PRODUCTION.
 *
 * ===============================================================================================
 * WHAT SE-12 IS, RESTATED AS A CONSEQUENCE RATHER THAN A STATISTIC.
 *
 * Production's schema was created by TypeORM `synchronize` and migrations were later baselined over
 * it, so the migration history has never described production. §305A proved that is not academic:
 * on a database built from migrations, DELETE /auth/me fails with `relation "notifications" does
 * not exist`. Account deletion — a core individual-product function and a data-protection
 * obligation — is lost in any environment rebuilt by replaying history.
 *
 * This migration makes a fresh replay produce the schema production actually runs, so that
 * "rebuild from migrations" stops being an untested claim.
 *
 * ===============================================================================================
 * WHY PRODUCTION IS THE AUTHORITY HERE, AND WHERE IT IS NOT.
 *
 * For these objects production IS canonical: synchronize built them from the same entities the code
 * still uses, and production is the schema the product has been operating on for its whole life. So
 * the statements below were GENERATED from a normalized extract of production rather than written
 * from memory, which is also why they are verbose and boring — they are a transcription, not a
 * design.
 *
 * Two deliberate exceptions:
 *
 *   - `user.password` and `user.legacy_id` exist in production, are declared by no entity and are
 *     read by nothing. They are PRESERVED in production — §305 forbids dropping production data —
 *     and NOT replicated into a fresh database. A canonical contract should describe intent, not
 *     history.
 *
 *   - `notifications` is given a real contract rather than a copy of production's. §305 says not to
 *     "merely create an empty table matching its name", and production's version is a bare table
 *     with a primary key and nothing else: `userId` is a varchar holding a uuid, with no foreign key
 *     and no index, on a table whose only query filters by exactly that column. See below.
 *
 * ===============================================================================================
 * IT CONVERGES FROM EITHER SIDE.
 *
 * Every statement is written so that applying it to PRODUCTION, where the object already exists, is
 * a no-op, and applying it to a FRESH REPLAY performs the repair. `CREATE TABLE IF NOT EXISTS`,
 * `ADD COLUMN IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, and constraint additions wrapped so a
 * duplicate is ignored. Type and nullability changes are checked against the current catalogue
 * before they run.
 *
 * Conversions are safe by construction: in a fresh database the tables are EMPTY, and in production
 * they already hold the target type. The one conversion that touches a populated production column
 * — `user.organizationId` — is already `uuid` in production, so its guard finds nothing to do; the
 * guard still counts unconvertible values first and refuses rather than failing mid-statement.
 */
export class CanonicalSchemaConvergence1800000025000 implements MigrationInterface {
  name = 'CanonicalSchemaConvergence1800000025000';

  private async columnType(
    queryRunner: QueryRunner, table: string, column: string,
  ): Promise<string | null> {
    const rows = await queryRunner.query(
      `SELECT data_type FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`,
      [table, column],
    );
    return rows.length ? rows[0].data_type : null;
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    /*
     * -------------------------------------------------------------------------------------------
     * 1. THE GUARDED CONVERSION.
     *
     * `user.organizationId` is the second and last member of the uuid-versus-varchar class §304
     * identified (the first was `invitation.organizationId`, repaired there). The entity declares a
     * ManyToOne to Organization, whose primary key is uuid, so uuid is the contract; production
     * already agrees and only the migration history disagreed.
     *
     * The count runs FIRST and names a QUANTITY, never a value, so no organization id or user
     * identifier can reach a log through this path.
     */
    if ((await this.columnType(queryRunner, 'user', 'organizationId')) === 'character varying') {
      const [{ bad }] = await queryRunner.query(`
        SELECT count(*)::int AS bad FROM "user"
        WHERE "organizationId" IS NOT NULL
          AND "organizationId" !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      `);
      if (bad > 0) {
        throw new Error(
          `§305 SE-12: refusing to convert "user"."organizationId" to uuid — ${bad} row(s) hold a ` +
          'value that is not valid UUID syntax. No row is deleted or altered. Resolve them ' +
          'deliberately and re-run; this migration will not guess what they meant.',
        );
      }
    }

    /*
     * -------------------------------------------------------------------------------------------
     * 2. NOTIFICATIONS — THE CONTRACT, NOT A COPY.
     *
     * Production's table is `userId character varying` with no foreign key and no index, which is
     * what synchronize produces from `@Column() userId: string`. Every query this table serves
     * filters by `userId` (plus `tenantId`), and `AuthService.deleteAccount` deletes by `userId`.
     *
     * The canonical contract therefore:
     *
     *   - types `userId` as `uuid`, because every value is a user id and the column exists to be
     *     compared against `user.id`;
     *   - binds it with a foreign key ON DELETE CASCADE. Cascade is correct here and is NOT the lazy
     *     choice: a notification is derived per-user convenience data with no audit standing, and
     *     `deleteAccount` already deletes these rows explicitly. The cascade makes the database
     *     enforce what the service intends, rather than leaving orphans if a delete path is ever
     *     added elsewhere. Contrast the invitation foreign key at §304, which is RESTRICT precisely
     *     because an invitation IS a credential and its disappearance would destroy evidence.
     *   - indexes `("userId", "createdAt")`, which is exactly the shape of `findMine` — filter by
     *     user, order by createdAt descending, take 50 — so the product's only read of this table
     *     stops being a sequential scan;
     *   - keeps `tenantId` as `character varying NOT NULL`, because an individual has no
     *     organization and CorrectiveActionsService writes the synthetic tenant `user:<id>` for
     *     them. Typing it as uuid would make notifications impossible for exactly the users Beta v1
     *     is for.
     *
     * Production holds ZERO notification rows, so the conversion and the foreign key are free.
     */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "notifications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" character varying NOT NULL,
        "userId" uuid NOT NULL,
        "type" character varying NOT NULL,
        "title" character varying NOT NULL,
        "message" text NOT NULL,
        "entityType" character varying,
        "entityId" character varying,
        "read" boolean NOT NULL DEFAULT false,
        "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notifications" PRIMARY KEY ("id")
      )
    `);

    if ((await this.columnType(queryRunner, 'notifications', 'userId')) === 'character varying') {
      const [{ bad }] = await queryRunner.query(`
        SELECT count(*)::int AS bad FROM "notifications"
        WHERE "userId" !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      `);
      if (bad > 0) {
        throw new Error(
          `§305 SE-12: refusing to convert "notifications"."userId" to uuid — ${bad} row(s) hold a ` +
          'value that is not valid UUID syntax. No row is deleted or altered.',
        );
      }
      const [{ orphans }] = await queryRunner.query(`
        SELECT count(*)::int AS orphans FROM "notifications" n
        WHERE NOT EXISTS (SELECT 1 FROM "user" u WHERE u."id" = n."userId"::uuid)
      `);
      if (orphans > 0) {
        throw new Error(
          `§305 SE-12: refusing to add the foreign key — ${orphans} notification row(s) reference a ` +
          'user that does not exist. Deleting them would destroy a record the customer may still ' +
          'see; resolve them deliberately and re-run.',
        );
      }
      await queryRunner.query(
        `ALTER TABLE "notifications" ALTER COLUMN "userId" TYPE uuid USING "userId"::uuid`);
    }

    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "notifications" ADD CONSTRAINT "fk_notifications_userId"
          FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_notifications_user_created"
        ON "notifications" ("userId", "createdAt")
    `);

    /*
     * -------------------------------------------------------------------------------------------
     * 3. THE ONE COLUMN WHERE PRODUCTION IS THE STALE SIDE.
     *
     * `safescope_knowledge_ingestion_runs.warnings` is `text[]` in the entity AND in the migration
     * history; production holds `jsonb` from an older shape of the same field. Everywhere else in
     * this migration production is the authority, because synchronize built it from these entities —
     * here it is simply behind, and copying its `jsonb` into the migration history would have frozen
     * the stale side and left the entity contradicting both forever.
     *
     * The conversion is value-preserving rather than a cast: `jsonb_array_elements_text` unpacks the
     * stored array into real text elements. A row holding anything that is not a JSON array would
     * raise, which is the correct outcome — production holds one row and it is an array.
     */
    if ((await this.columnType(queryRunner, 'safescope_knowledge_ingestion_runs', 'warnings')) === 'jsonb') {
      /*
       * ADD, POPULATE, SWAP — rather than `ALTER COLUMN ... USING`.
       *
       * `USING` forbids a subquery, and unpacking a jsonb array into text elements needs one
       * (`jsonb_array_elements_text` is set-returning). Casting the jsonb text form instead —
       * `translate(x::text,'[]','{}')::text[]` — would round-trip most values and silently corrupt
       * any string containing a brace or a comma. So the value is moved through a real UPDATE, where
       * a subquery is allowed and the conversion is exact.
       *
       * A row whose `warnings` is not a JSON array raises here rather than being coerced. That is
       * the intended behaviour: production holds one row and it is an array, and a surprise is a
       * reason to stop, not to guess.
       */
      await queryRunner.query(
        `ALTER TABLE "safescope_knowledge_ingestion_runs" ADD COLUMN "warnings__text" text[]`);
      await queryRunner.query(`
        UPDATE "safescope_knowledge_ingestion_runs"
        SET "warnings__text" = COALESCE(
          (SELECT array_agg(value) FROM jsonb_array_elements_text("warnings") AS value),
          '{}'::text[])
      `);
      await queryRunner.query(
        `ALTER TABLE "safescope_knowledge_ingestion_runs" DROP COLUMN "warnings"`);
      await queryRunner.query(
        `ALTER TABLE "safescope_knowledge_ingestion_runs" RENAME COLUMN "warnings__text" TO "warnings"`);
      await queryRunner.query(`
        ALTER TABLE "safescope_knowledge_ingestion_runs"
        ALTER COLUMN "warnings" SET DEFAULT '{}'
      `);
      await queryRunner.query(`
        ALTER TABLE "safescope_knowledge_ingestion_runs"
        ALTER COLUMN "warnings" SET NOT NULL
      `);
    }

    /*
     * -------------------------------------------------------------------------------------------
     * 4. THE GENERATED CONVERGENCE.
     *
     * Tables, columns, types, nullability, defaults, indexes and foreign keys that production has
     * and a migration replay did not. Transcribed from the normalized production extract.
     */
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "classifications_classificationstatus_enum" AS ENUM ('pending', 'approved', 'modified', 'rejected');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "classification_feedback" (
        "accepted" boolean NOT NULL DEFAULT false,
        "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
        "hazardDescription" text NOT NULL,
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "notes" text,
        "selectedStandardId" character varying,
        "suggestedStandardId" character varying,
        "tenantId" character varying NOT NULL,
        "userId" character varying NOT NULL,
        PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "uq_classification_feedback_id" ON "classification_feedback" ("id")
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "classification_rule_versions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "ruleId" character varying NOT NULL,
        "snapshot" text NOT NULL,
        "status" character varying NOT NULL DEFAULT 'published',
        "version" integer NOT NULL,
        PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "uq_classification_rule_versions_id" ON "classification_rule_versions" ("id")
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "classification_rules" (
        "code" character varying NOT NULL,
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "isActive" boolean NOT NULL DEFAULT true,
        "keywords" text NOT NULL,
        "severity" integer NOT NULL,
        PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "uq_classification_rules_code" ON "classification_rules" ("code")
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "uq_classification_rules_id" ON "classification_rules" ("id")
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "corrective_action_templates" (
        "bestPracticeOption" text,
        "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
        "estimatedRiskReduction" integer NOT NULL DEFAULT 0,
        "hazardCategoryCode" character varying NOT NULL,
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "lowCostOption" text,
        "recommendedAction" text NOT NULL,
        "standardId" character varying,
        "title" character varying NOT NULL,
        "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
        "verificationSteps" text,
        PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "uq_corrective_action_templates_id" ON "corrective_action_templates" ("id")
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "decision_governance_logs" (
        "confidence" double precision NOT NULL,
        "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
        "decisionSource" character varying NOT NULL,
        "finalHumanDecision" jsonb,
        "finalOutcome" character varying,
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "inputText" text NOT NULL,
        "originalAiDecision" jsonb,
        "overrideApplied" boolean NOT NULL DEFAULT false,
        "overrideReason" character varying,
        "predictedCategory" character varying NOT NULL,
        "recommendedAction" text NOT NULL,
        "reportId" character varying NOT NULL,
        "riskScore" double precision NOT NULL,
        "selectedStandard" character varying NOT NULL,
        "userReviewed" boolean NOT NULL DEFAULT false,
        PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "uq_decision_governance_logs_id" ON "decision_governance_logs" ("id")
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "hazard_categories" (
        "code" character varying NOT NULL,
        "commonKeywords" text,
        "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
        "defaultSeverity" character varying NOT NULL DEFAULT 'medium',
        "description" text,
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
        PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "uq_hazard_categories_code" ON "hazard_categories" ("code")
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "uq_hazard_categories_id" ON "hazard_categories" ("id")
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "hazard_standard_mappings" (
        "confidenceBoost" integer NOT NULL DEFAULT 0,
        "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
        "hazardCategoryCode" character varying NOT NULL,
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "matchTerms" text,
        "reasoningTemplate" text,
        "standardId" character varying NOT NULL,
        "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
        PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "uq_hazard_standard_mappings_id" ON "hazard_standard_mappings" ("id")
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "recommendation_feedback" (
        "action" character varying NOT NULL,
        "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
        "hazard" character varying NOT NULL,
        "id" serial NOT NULL,
        "notes" character varying,
        "replacementText" character varying,
        PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "uq_recommendation_feedback_id" ON "recommendation_feedback" ("id")
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "report_language_templates" (
        "correctiveActionTemplate" text NOT NULL,
        "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
        "findingTemplate" text NOT NULL,
        "hazardCategoryCode" character varying NOT NULL,
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "professionalSummaryTemplate" text NOT NULL,
        "standardReasoningTemplate" text NOT NULL,
        "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
        PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "uq_report_language_templates_id" ON "report_language_templates" ("id")
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "safescope_audit_records" (
        "actorId" character varying,
        "actorRole" character varying,
        "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "inspectionId" character varying,
        "metadata" jsonb NOT NULL DEFAULT '{}',
        "observationId" character varying,
        "payload" jsonb NOT NULL,
        "status" character varying NOT NULL DEFAULT 'active',
        "traceId" character varying,
        "type" character varying(50) NOT NULL,
        "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
        "workspaceId" character varying,
        PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "uq_safescope_audit_records_id" ON "safescope_audit_records" ("id")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_safescope_audit_records_traceId" ON "safescope_audit_records" ("traceId")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_safescope_audit_records_type_status" ON "safescope_audit_records" ("type", "status")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_safescope_audit_records_workspaceId" ON "safescope_audit_records" ("workspaceId")
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "standard_match_feedback" (
        "action" character varying NOT NULL,
        "citation" character varying NOT NULL,
        "created_at" timestamp without time zone NOT NULL DEFAULT now(),
        "hazard_category" character varying,
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "notes" text,
        "query_text" character varying,
        "replacement_citation" character varying,
        "report_id" character varying,
        "standard_id" character varying NOT NULL,
        PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "uq_standard_match_feedback_id" ON "standard_match_feedback" ("id")
    `);

    await queryRunner.query(`ALTER TABLE "audit_entry_findings" ALTER COLUMN "confidenceScore" SET DEFAULT '0'`);
    await queryRunner.query(`ALTER TABLE "classifications" ALTER COLUMN "classificationStatus" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "classifications" ALTER COLUMN "classificationStatus" TYPE classifications_classificationstatus_enum USING "classificationStatus"::classifications_classificationstatus_enum`);
    await queryRunner.query(`ALTER TABLE "classifications" ALTER COLUMN "classificationStatus" SET DEFAULT 'pending'`);
    await queryRunner.query(`ALTER TABLE "classifications" ADD COLUMN IF NOT EXISTS "reviewReason" character varying`);
    await queryRunner.query(`ALTER TABLE "classifications" ALTER COLUMN "severityLevel" TYPE integer USING "severityLevel"::integer`);
    await queryRunner.query(`ALTER TABLE "corrective_actions" ALTER COLUMN "tenantId" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "fix_feedback" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
    await queryRunner.query(`ALTER TABLE "regulatory_agency" ALTER COLUMN "createdAt" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "regulatory_agency" ALTER COLUMN "createdAt" TYPE timestamp without time zone USING "createdAt"::timestamp without time zone`);
    await queryRunner.query(`ALTER TABLE "regulatory_agency" ALTER COLUMN "createdAt" SET DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "regulatory_agency" ALTER COLUMN "updatedAt" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "regulatory_agency" ALTER COLUMN "updatedAt" TYPE timestamp without time zone USING "updatedAt"::timestamp without time zone`);
    await queryRunner.query(`ALTER TABLE "regulatory_agency" ALTER COLUMN "updatedAt" SET DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "regulatory_paragraph" ALTER COLUMN "createdAt" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "regulatory_paragraph" ALTER COLUMN "createdAt" TYPE timestamp without time zone USING "createdAt"::timestamp without time zone`);
    await queryRunner.query(`ALTER TABLE "regulatory_paragraph" ALTER COLUMN "createdAt" SET DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "regulatory_paragraph" ALTER COLUMN "updatedAt" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "regulatory_paragraph" ALTER COLUMN "updatedAt" TYPE timestamp without time zone USING "updatedAt"::timestamp without time zone`);
    await queryRunner.query(`ALTER TABLE "regulatory_paragraph" ALTER COLUMN "updatedAt" SET DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "regulatory_part" ALTER COLUMN "createdAt" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "regulatory_part" ALTER COLUMN "createdAt" TYPE timestamp without time zone USING "createdAt"::timestamp without time zone`);
    await queryRunner.query(`ALTER TABLE "regulatory_part" ALTER COLUMN "createdAt" SET DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "regulatory_part" ALTER COLUMN "updatedAt" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "regulatory_part" ALTER COLUMN "updatedAt" TYPE timestamp without time zone USING "updatedAt"::timestamp without time zone`);
    await queryRunner.query(`ALTER TABLE "regulatory_part" ALTER COLUMN "updatedAt" SET DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "regulatory_section" ALTER COLUMN "createdAt" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "regulatory_section" ALTER COLUMN "createdAt" TYPE timestamp without time zone USING "createdAt"::timestamp without time zone`);
    await queryRunner.query(`ALTER TABLE "regulatory_section" ALTER COLUMN "createdAt" SET DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "regulatory_section" ALTER COLUMN "updatedAt" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "regulatory_section" ALTER COLUMN "updatedAt" TYPE timestamp without time zone USING "updatedAt"::timestamp without time zone`);
    await queryRunner.query(`ALTER TABLE "regulatory_section" ALTER COLUMN "updatedAt" SET DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "regulatory_subpart" ALTER COLUMN "createdAt" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "regulatory_subpart" ALTER COLUMN "createdAt" TYPE timestamp without time zone USING "createdAt"::timestamp without time zone`);
    await queryRunner.query(`ALTER TABLE "regulatory_subpart" ALTER COLUMN "createdAt" SET DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "regulatory_subpart" ALTER COLUMN "updatedAt" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "regulatory_subpart" ALTER COLUMN "updatedAt" TYPE timestamp without time zone USING "updatedAt"::timestamp without time zone`);
    await queryRunner.query(`ALTER TABLE "regulatory_subpart" ALTER COLUMN "updatedAt" SET DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "safescope_feedback" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
    await queryRunner.query(`ALTER TABLE "safescope_feedback" ADD COLUMN IF NOT EXISTS "safeScopeVersion" character varying NOT NULL DEFAULT 'v2'`);
    await queryRunner.query(`ALTER TABLE "safescope_knowledge_chunks" ALTER COLUMN "chunkIndex" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "safescope_knowledge_chunks" ALTER COLUMN "citation" TYPE character varying(160) USING "citation"::character varying(160)`);
    await queryRunner.query(`ALTER TABLE "safescope_knowledge_chunks" ALTER COLUMN "confidenceWeight" SET DEFAULT '0'`);
    await queryRunner.query(`ALTER TABLE "safescope_knowledge_chunks" ALTER COLUMN "sectionHeading" TYPE character varying(220) USING "sectionHeading"::character varying(220)`);
    await queryRunner.query(`ALTER TABLE "safescope_knowledge_documents" ALTER COLUMN "agency" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "safescope_knowledge_documents" ALTER COLUMN "agency" TYPE character varying(40) USING "agency"::character varying(40)`);
    await queryRunner.query(`ALTER TABLE "safescope_knowledge_documents" ALTER COLUMN "agency" SET DEFAULT 'Other'`);
    await queryRunner.query(`ALTER TABLE "safescope_knowledge_documents" ALTER COLUMN "agency" SET DEFAULT 'Other'`);
    await queryRunner.query(`ALTER TABLE "safescope_knowledge_documents" ALTER COLUMN "approvalStatus" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "safescope_knowledge_documents" ALTER COLUMN "approvalStatus" TYPE character varying(40) USING "approvalStatus"::character varying(40)`);
    await queryRunner.query(`ALTER TABLE "safescope_knowledge_documents" ALTER COLUMN "approvalStatus" SET DEFAULT 'draft'`);
    await queryRunner.query(`ALTER TABLE "safescope_knowledge_documents" ALTER COLUMN "citation" TYPE character varying(160) USING "citation"::character varying(160)`);
    await queryRunner.query(`ALTER TABLE "safescope_knowledge_documents" ALTER COLUMN "sourceType" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "safescope_knowledge_documents" ALTER COLUMN "sourceType" TYPE character varying(60) USING "sourceType"::character varying(60)`);
    await queryRunner.query(`ALTER TABLE "safescope_knowledge_documents" ALTER COLUMN "sourceType" SET DEFAULT 'other'`);
    await queryRunner.query(`ALTER TABLE "safescope_knowledge_documents" ALTER COLUMN "sourceUrl" TYPE text USING "sourceUrl"::text`);
    await queryRunner.query(`ALTER TABLE "safescope_knowledge_documents" ALTER COLUMN "title" TYPE character varying(240) USING "title"::character varying(240)`);
    await queryRunner.query(`ALTER TABLE "safescope_knowledge_ingestion_runs" ALTER COLUMN "agency" TYPE character varying(40) USING "agency"::character varying(40)`);
    await queryRunner.query(`ALTER TABLE "safescope_knowledge_ingestion_runs" ALTER COLUMN "metadataJson" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "safescope_knowledge_ingestion_runs" ALTER COLUMN "metadataJson" SET DEFAULT '{}'`);
    await queryRunner.query(`ALTER TABLE "safescope_knowledge_ingestion_runs" ALTER COLUMN "sourceName" TYPE character varying(160) USING "sourceName"::character varying(160)`);
    await queryRunner.query(`ALTER TABLE "safescope_knowledge_ingestion_runs" ALTER COLUMN "sourceType" TYPE character varying(80) USING "sourceType"::character varying(80)`);
    await queryRunner.query(`ALTER TABLE "safescope_knowledge_ingestion_runs" ALTER COLUMN "status" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "safescope_knowledge_ingestion_runs" ALTER COLUMN "status" TYPE character varying(40) USING "status"::character varying(40)`);
    await queryRunner.query(`ALTER TABLE "safescope_knowledge_ingestion_runs" ALTER COLUMN "status" SET DEFAULT 'queued'`);
    await queryRunner.query(`ALTER TABLE "safescope_knowledge_retrieval_logs" ALTER COLUMN "confidence" SET DEFAULT '0'`);
    await queryRunner.query(`ALTER TABLE "safescope_knowledge_retrieval_logs" ALTER COLUMN "findingId" TYPE character varying(120) USING "findingId"::character varying(120)`);
    await queryRunner.query(`ALTER TABLE "safescope_knowledge_retrieval_logs" ALTER COLUMN "reportId" TYPE character varying(120) USING "reportId"::character varying(120)`);
    await queryRunner.query(`ALTER TABLE "safescope_knowledge_retrieval_logs" ALTER COLUMN "workspaceId" TYPE character varying(120) USING "workspaceId"::character varying(120)`);
    await queryRunner.query(`ALTER TABLE "safescope_knowledge_sources" ALTER COLUMN "agency" TYPE character varying(40) USING "agency"::character varying(40)`);
    await queryRunner.query(`ALTER TABLE "safescope_knowledge_sources" ALTER COLUMN "lastKnownVersion" TYPE character varying(120) USING "lastKnownVersion"::character varying(120)`);
    await queryRunner.query(`ALTER TABLE "safescope_knowledge_sources" ALTER COLUMN "metadataJson" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "safescope_knowledge_sources" ALTER COLUMN "metadataJson" SET DEFAULT '{}'`);
    await queryRunner.query(`ALTER TABLE "safescope_knowledge_sources" ALTER COLUMN "name" TYPE character varying(160) USING "name"::character varying(160)`);
    await queryRunner.query(`ALTER TABLE "safescope_knowledge_sources" ALTER COLUMN "sourceType" TYPE character varying(80) USING "sourceType"::character varying(80)`);
    await queryRunner.query(`ALTER TABLE "safescope_knowledge_sources" ALTER COLUMN "status" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "safescope_knowledge_sources" ALTER COLUMN "status" TYPE character varying(40) USING "status"::character varying(40)`);
    await queryRunner.query(`ALTER TABLE "safescope_knowledge_sources" ALTER COLUMN "status" SET DEFAULT 'active'`);
    await queryRunner.query(`ALTER TABLE "safescope_knowledge_sources" ALTER COLUMN "trustLevel" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "safescope_knowledge_sources" ALTER COLUMN "trustLevel" TYPE character varying(80) USING "trustLevel"::character varying(80)`);
    await queryRunner.query(`ALTER TABLE "safescope_knowledge_sources" ALTER COLUMN "trustLevel" SET DEFAULT 'official'`);
    await queryRunner.query(`ALTER TABLE "standards_master" ALTER COLUMN "scope_code" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "organizationId" TYPE uuid USING "organizationId"::uuid`);
    await queryRunner.query(`ALTER TABLE "safescope_feedback" ADD COLUMN IF NOT EXISTS "hazLenzVersion" character varying NOT NULL DEFAULT 'v2'`);
    await queryRunner.query(`ALTER TABLE "safescope_knowledge_retrieval_logs" ADD COLUMN IF NOT EXISTS "agencyMode" character varying`);
    await queryRunner.query(`ALTER TABLE "safescope_knowledge_retrieval_logs" ADD COLUMN IF NOT EXISTS "classification" character varying`);
    await queryRunner.query(`ALTER TABLE "safescope_knowledge_retrieval_logs" ADD COLUMN IF NOT EXISTS "matchedChunkIds" text[] NOT NULL DEFAULT '{}'`);
    await queryRunner.query(`ALTER TABLE "safescope_knowledge_retrieval_logs" ADD COLUMN IF NOT EXISTS "query" text`);
    await queryRunner.query(`ALTER TABLE "safescope_knowledge_retrieval_logs" ADD COLUMN IF NOT EXISTS "topScore" numeric NOT NULL DEFAULT 0`);

    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "uq_corrective_actions_displayId" ON "corrective_actions" ("displayId")`);
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "site" ADD CONSTRAINT "fk_site_organizationId"
          FOREIGN KEY ("organizationId") REFERENCES "organization" ("id")
          ON DELETE NO ACTION ON UPDATE NO ACTION;
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "user" ADD CONSTRAINT "fk_user_organizationId"
          FOREIGN KEY ("organizationId") REFERENCES "organization" ("id")
          ON DELETE NO ACTION ON UPDATE NO ACTION;
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "uq_safescope_knowledge_sources_name" ON "safescope_knowledge_sources" ("name")`);
  }

  /**
   * WHAT `down` DOES, AND WHY IT IS DELIBERATELY NARROW.
   *
   * It removes only what this migration ADDED and can remove without destroying anything: the
   * notifications foreign key and its index. It does NOT drop the tables or columns it created, and
   * it does NOT revert any type or nullability change.
   *
   * That is the honest position rather than a tidy one. Dropping these tables in production would
   * destroy live data — they hold production's real rows and existed long before this migration.
   * Reverting `user.organizationId` to `character varying` would move production to a shape it has
   * never had and would recreate the defect class §304 repaired. A `down` that did either would be
   * more dangerous than the forward migration.
   *
   * Per `project-docs/operations/BACKUP-AND-RESTORE.md`: a wrong migration is fixed forward, and
   * where the schema genuinely must go back, the recorded pre-migration backup is the reliable path
   * — not this function.
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_notifications_user_created"`);
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT IF EXISTS "fk_notifications_userId"`);
  }
}
