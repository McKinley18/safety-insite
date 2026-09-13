import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * §261 — the Expert HazLenz server-side authority foundation.
 *
 * ADDITIVE AND OLD-CODE-SAFE. Four defaulted columns on `hazlenz_analyses` and one new table. Every
 * added column carries a DEFAULT or is NULLABLE, so code that predates this migration inserts rows
 * the schema accepts, and the deployment order is `migration -> deploy` only because the entity
 * selects the new columns. Nothing is dropped, nothing is retyped, and no historical analysis row's
 * existing data is rewritten.
 *
 * THE BACKFILL STATES A FACT, IT DOES NOT MANUFACTURE ONE. `producer` backfills to
 * `client_supplied` because that is what every row in this table is: the only path that has ever
 * written `hazlenz_analyses` is the snapshot-posting route, which persists a result the client
 * computed and held. No row is retrospectively described as server-authored, and had any row's
 * provenance been genuinely unknown, `client_supplied` -- the WEAKER claim -- would still have been
 * the honest value. The column default carries the same value for the same reason, so a future
 * insert path that forgets to set it fails toward "not authoritative".
 *
 * `analysisState` backfills to ANALYSIS_AVAILABLE and `confirmationRequired` to FALSE for the same
 * reason: a client-supplied advisory analysis is available for display and carries no
 * server-authored operational conclusion, so there is nothing for a human to settle. Backfilling
 * historical rows to ANALYSIS_AWAITING_CONFIRMATION would assert that thousands of analyses are
 * waiting on a confirmation the product never asks for, and would make the state meaningless on the
 * rows where it actually carries the §255 boundary.
 *
 * WHERE CONSTRAINTS ARE USED, AND WHERE THEY ARE NOT. The database enforces the STRUCTURAL facts it
 * can enforce safely and permanently: the two closed vocabularies, the pre-spend uniqueness that IS
 * the duplicate-spend guard, referential integrity, and the producer/execution agreement below.
 * It does NOT encode the confirmation rule, the state machine's legal transitions, or the
 * admissibility of an Expert output -- those are nuanced Expert semantics that belong to application
 * logic, are expected to gain versions, and would be unmaintainable and untestable as SQL.
 *
 * THE PRODUCER/EXECUTION AGREEMENT IS A CHECK CONSTRAINT BECAUSE IT IS A STRUCTURAL FACT. A
 * server-authored row must name the execution that authored it, and a client-supplied row cannot
 * name one, because there was none. Expressed in SQL, this makes the trust boundary impossible to
 * violate by any future code path -- including one that sets `producer` without going through the
 * Expert service, which is precisely the forgery the boundary exists to prevent. TypeScript alone
 * cannot make that guarantee about a database that outlives the process.
 *
 * DOWN IS MAINTAINED because this repository maintains down migrations. It drops only what UP
 * added. It is not lossless and does not pretend to be: dropping `producer` discards the
 * distinction between a client-supplied and a server-authored analysis, and dropping
 * `expert_analysis_executions` discards the executions themselves. That is the ordinary meaning of
 * reverting a schema addition, and it is recorded here rather than discovered later.
 */
export class ExpertAnalysisAuthorityFoundation1800000019000 implements MigrationInterface {
  name = 'ExpertAnalysisAuthorityFoundation1800000019000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ---------------------------------------------------------------- 1. the four additive columns
    await queryRunner.query(`
      ALTER TABLE "hazlenz_analyses"
      ADD COLUMN IF NOT EXISTS "producer" varchar(32) NOT NULL DEFAULT 'client_supplied',
      ADD COLUMN IF NOT EXISTS "analysisState" varchar(48) NOT NULL DEFAULT 'ANALYSIS_AVAILABLE',
      ADD COLUMN IF NOT EXISTS "confirmationRequired" boolean NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS "expertExecutionId" uuid NULL
    `);

    // ---------------------------------------------------------------- 2. the execution record
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "expert_analysis_executions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "observationId" uuid NOT NULL,
        "inspectionId" uuid NOT NULL,
        "organizationId" uuid NULL,
        "analysisId" uuid NULL,
        "idempotencyKey" varchar(128) NOT NULL,
        "requestVersion" integer NOT NULL,
        "executionState" varchar(48) NOT NULL,
        "candidateIdentity" varchar(128) NULL,
        "contractVersion" varchar(160) NULL,
        "entryVersion" varchar(160) NULL,
        "admissionVersion" varchar(160) NULL,
        "projectionVersion" varchar(160) NULL,
        "confirmationRuleVersion" varchar(160) NULL,
        "systemPromptSha" varchar(64) NULL,
        "wireSchemaSha" varchar(64) NULL,
        "providerId" varchar(80) NULL,
        "respondedModel" varchar(120) NULL,
        "admission" varchar(32) NULL,
        "postureRefusalCodes" jsonb NULL,
        "conformanceViolations" jsonb NULL,
        "roleJustificationCodes" jsonb NULL,
        "declarationRefusals" jsonb NULL,
        "verifierReached" boolean NOT NULL DEFAULT false,
        "verifierFactKey" varchar(200) NULL,
        "verifierNotReachedBecause" varchar(200) NULL,
        "firstPassInputTokens" integer NULL,
        "firstPassOutputTokens" integer NULL,
        "verifierInputTokens" integer NULL,
        "verifierOutputTokens" integer NULL,
        "costUsd" numeric(12,6) NULL,
        "latencyMs" integer NULL,
        "attempts" integer NOT NULL DEFAULT 0,
        "rawFirstPass" jsonb NULL,
        "rawVerifier" jsonb NULL,
        "failureKind" varchar(80) NULL,
        "failureDetail" text NULL,
        "requestedByUserId" uuid NOT NULL,
        "producer" varchar(32) NOT NULL DEFAULT 'server_authored',
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "completedAt" timestamptz NULL,
        CONSTRAINT "pk_expert_analysis_executions" PRIMARY KEY ("id")
      )
    `);

    // ---------------------------------------------------------------- 3. identity and idempotency
    //
    // THIS UNIQUE INDEX IS THE PRE-SPEND DUPLICATE-SPEND GUARD. The execution row is inserted in
    // ANALYSIS_RUNNING before the first provider call, so two concurrent requests sharing an
    // idempotency key cannot both claim the execution: the database decides, not application logic,
    // and the loser discovers the winner's record instead of spending. Every pre-existing
    // idempotency control on `hazlenz_analyses` protects the WRITE, which happens after the money.
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "uq_expert_execution_observation_idempotency"
      ON "expert_analysis_executions" ("observationId", "idempotencyKey")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_expert_execution_observation_state"
      ON "expert_analysis_executions" ("observationId", "executionState")
    `);
    // Workspace usage accounting, per §260 section 17. PARTIAL on IS NOT NULL because a personal
    // inspection genuinely has no organization and those rows answer no workspace-usage question.
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_expert_execution_organization_created"
      ON "expert_analysis_executions" ("organizationId", "createdAt")
      WHERE "organizationId" IS NOT NULL
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_hazlenz_analysis_producer_state"
      ON "hazlenz_analyses" ("producer", "analysisState")
    `);

    // ---------------------------------------------------------------- 4. referential integrity
    //
    // The observation FK cascades, matching `hazlenz_analyses` -- deleting an observation removes
    // its analyses, so leaving their executions behind would orphan them. The analysis FK is SET
    // NULL rather than CASCADE: an execution is a record that provider spend OCCURRED, and that
    // fact must survive the deletion of the analysis it produced, or the usage ledger would
    // silently lose entries. `hazlenz_analyses.expertExecutionId` is likewise SET NULL, so
    // reverting an execution never deletes a customer's analysis.
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "expert_analysis_executions"
          ADD CONSTRAINT "fk_expert_execution_observation"
          FOREIGN KEY ("observationId") REFERENCES "observations"("id") ON DELETE CASCADE;
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "expert_analysis_executions"
          ADD CONSTRAINT "fk_expert_execution_analysis"
          FOREIGN KEY ("analysisId") REFERENCES "hazlenz_analyses"("id") ON DELETE SET NULL;
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "hazlenz_analyses"
          ADD CONSTRAINT "fk_hazlenz_analysis_expert_execution"
          FOREIGN KEY ("expertExecutionId") REFERENCES "expert_analysis_executions"("id")
          ON DELETE SET NULL;
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);

    // ---------------------------------------------------------------- 5. the closed vocabularies
    //
    // Enforced as CHECK constraints rather than as Postgres enums, matching how this schema already
    // expresses `status` and `advisoryStatus`: a CHECK can be widened in an ordinary additive
    // migration, whereas an enum's value set is a separate type to alter and cannot be narrowed at
    // all. The vocabulary is closed either way; only the maintenance cost differs.
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "hazlenz_analyses" ADD CONSTRAINT "ck_hazlenz_analysis_producer"
          CHECK ("producer" IN ('client_supplied', 'server_authored'));
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "hazlenz_analyses" ADD CONSTRAINT "ck_hazlenz_analysis_state"
          CHECK ("analysisState" IN (
            'ANALYSIS_RUNNING', 'ANALYSIS_FAILED', 'ANALYSIS_REFUSED', 'ANALYSIS_UNRESOLVED',
            'ANALYSIS_AVAILABLE', 'ANALYSIS_AWAITING_CONFIRMATION', 'ANALYSIS_CONFIRMED',
            'ANALYSIS_OVERRIDDEN'));
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "expert_analysis_executions" ADD CONSTRAINT "ck_expert_execution_producer"
          CHECK ("producer" = 'server_authored');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "expert_analysis_executions" ADD CONSTRAINT "ck_expert_execution_state"
          CHECK ("executionState" IN (
            'ANALYSIS_RUNNING', 'ANALYSIS_FAILED', 'ANALYSIS_REFUSED', 'ANALYSIS_UNRESOLVED',
            'ANALYSIS_AVAILABLE', 'ANALYSIS_AWAITING_CONFIRMATION'));
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);

    // ---------------------------------------------------------------- 6. the trust boundary, in SQL
    //
    // A server-authored analysis MUST name the execution that authored it, and a client-supplied
    // analysis MUST NOT name one, because no server-owned execution ran. Setting `producer` alone
    // can therefore never confer server authorship: without a real execution row to reference, the
    // insert is rejected by the database. This is the one place the trust boundary is enforced
    // somewhere that outlives the application process.
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "hazlenz_analyses" ADD CONSTRAINT "ck_hazlenz_analysis_producer_execution"
          CHECK (
            ("producer" = 'server_authored' AND "expertExecutionId" IS NOT NULL)
            OR ("producer" = 'client_supplied' AND "expertExecutionId" IS NULL)
          );
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);

    // ---------------------------------------------------------------- 7. the backfill
    //
    // Idempotent and narrow: it touches only rows the column default has not already settled, which
    // on a fresh ADD COLUMN ... DEFAULT is none. It exists so the migration is correct when applied
    // to a database where an earlier partial run left the columns present but unset.
    await queryRunner.query(`
      UPDATE "hazlenz_analyses"
      SET "producer" = 'client_supplied'
      WHERE "producer" IS NULL OR "producer" NOT IN ('client_supplied', 'server_authored')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "hazlenz_analyses"
      DROP CONSTRAINT IF EXISTS "ck_hazlenz_analysis_producer_execution"
    `);
    await queryRunner.query(`
      ALTER TABLE "hazlenz_analyses" DROP CONSTRAINT IF EXISTS "ck_hazlenz_analysis_state"
    `);
    await queryRunner.query(`
      ALTER TABLE "hazlenz_analyses" DROP CONSTRAINT IF EXISTS "ck_hazlenz_analysis_producer"
    `);
    await queryRunner.query(`
      ALTER TABLE "hazlenz_analyses" DROP CONSTRAINT IF EXISTS "fk_hazlenz_analysis_expert_execution"
    `);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_hazlenz_analysis_producer_state"`);
    await queryRunner.query(`
      ALTER TABLE "hazlenz_analyses"
      DROP COLUMN IF EXISTS "expertExecutionId",
      DROP COLUMN IF EXISTS "confirmationRequired",
      DROP COLUMN IF EXISTS "analysisState",
      DROP COLUMN IF EXISTS "producer"
    `);
    await queryRunner.query(`DROP TABLE IF EXISTS "expert_analysis_executions"`);
  }
}
