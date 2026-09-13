import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * §264 — THE HUMAN CONFIRMATION BOUNDARY, AS SCHEMA. ADDITIVE AND OLD-CODE-SAFE.
 *
 * ---------------------------------------------------------------------------------------------
 * IT EXTENDS `human_reviews` RATHER THAN BUILDING A SECOND REVIEW SUBSYSTEM.
 *
 * §260 section 10 froze this. `human_reviews` already carries a decision, a rationale, a reviewed
 * conclusion, reviewer identity, supersession, an idempotency key and an analysis link. A parallel
 * "expert_settlements" table would duplicate every one of them and split the answer to "who decided
 * what about this observation" across two places.
 *
 * What it does NOT do is overload the existing four decision values. `accepted` today means a
 * reviewer accepted a FINDING; reusing it for a classification confirmation would destroy the
 * distinction between "a human reviewed this finding" and "a human settled the operational
 * classification". Two new values are added instead, and they are unambiguous by construction:
 * they can only ever appear on a row that names a server-authored Expert analysis.
 *
 * ---------------------------------------------------------------------------------------------
 * THE COLUMN IS WIDENED BECAUSE ONE NEW VALUE IS EXACTLY THE OLD LIMIT.
 *
 * `classification_confirmed` is 24 characters and `decision` is `varchar(24)`. It fits — exactly,
 * with nothing to spare. Widening to 32 costs nothing on Postgres (varchar length is a constraint,
 * not a storage decision) and removes a silent truncation risk the next value would hit.
 *
 * ---------------------------------------------------------------------------------------------
 * CONCURRENCY IS ADJUDICATED BY AN INDEX, NOT BY APPLICATION LOGIC.
 *
 * `uq_human_review_analysis_settlement` permits at most ONE settlement row per analysis. The service
 * also performs a conditional state transition, and either one alone would be enough on a good day;
 * together they mean two reviewers racing on one pending analysis cannot both win even if the
 * application layer is wrong. §261 established this pattern for provider spend and it is the same
 * argument here: a read-then-write check has a window, and the database is where concurrency is
 * actually decided.
 *
 * ---------------------------------------------------------------------------------------------
 * A SETTLED STATE CANNOT BE MINTED WITHOUT A SETTLEMENT RECORD.
 *
 * `ck_hazlenz_analysis_settlement` is the sibling of §261's `ck_hazlenz_analysis_producer_execution`.
 * Setting `analysisState = 'ANALYSIS_CONFIRMED'` by hand does not make an analysis confirmed: without
 * a real review row to reference, the write is rejected. Authority again cannot be conferred by
 * setting the column that describes it.
 */
export class ExpertHumanConfirmation1800000020000 implements MigrationInterface {
  name = 'ExpertHumanConfirmation1800000020000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ---------------------------------------------------------------- 1. the decision vocabulary
    await queryRunner.query(`
      ALTER TABLE "human_reviews" ALTER COLUMN "decision" TYPE varchar(32)
    `);
    // Dropped and re-added rather than altered: Postgres has no ALTER CONSTRAINT for a CHECK, and
    // adding a second CHECK would leave the old one still rejecting the new values.
    await queryRunner.query(`
      ALTER TABLE "human_reviews" DROP CONSTRAINT IF EXISTS "human_reviews_decision_check"
    `);
    await queryRunner.query(`
      ALTER TABLE "human_reviews" DROP CONSTRAINT IF EXISTS "ck_human_review_decision"
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "human_reviews" ADD CONSTRAINT "ck_human_review_decision"
          CHECK ("decision" IN (
            'accepted', 'edited', 'overridden', 'dismissed',
            'classification_confirmed', 'classification_changed'));
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);

    // ---------------------------------------------------------------- 2. one settlement per analysis
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "uq_human_review_analysis_settlement"
        ON "human_reviews" ("analysisId")
        WHERE "analysisId" IS NOT NULL
          AND "decision" IN ('classification_confirmed', 'classification_changed')
    `);

    // ---------------------------------------------------------------- 3. retry, not re-decision
    //
    // The existing idempotency index is scoped to `findingId`, which is NULL on a settlement, so it
    // does not protect this path at all. This one makes a replayed request resolve to the row it
    // already created instead of creating a second one.
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "uq_human_review_analysis_idempotency"
        ON "human_reviews" ("analysisId", "idempotencyKey")
        WHERE "analysisId" IS NOT NULL AND "idempotencyKey" IS NOT NULL
    `);

    // ---------------------------------------------------------------- 4. the settlement link
    await queryRunner.query(`
      ALTER TABLE "hazlenz_analyses"
        ADD COLUMN IF NOT EXISTS "settlementReviewId" uuid NULL
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "hazlenz_analyses" ADD CONSTRAINT "fk_hazlenz_analysis_settlement_review"
          FOREIGN KEY ("settlementReviewId") REFERENCES "human_reviews"("id") ON DELETE RESTRICT;
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);

    // ---------------------------------------------------------------- 5. authority, in SQL
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "hazlenz_analyses" ADD CONSTRAINT "ck_hazlenz_analysis_settlement"
          CHECK (
            (
              "analysisState" IN ('ANALYSIS_CONFIRMED', 'ANALYSIS_OVERRIDDEN')
              AND "settlementReviewId" IS NOT NULL
              AND "producer" = 'server_authored'
            )
            OR (
              "analysisState" NOT IN ('ANALYSIS_CONFIRMED', 'ANALYSIS_OVERRIDDEN')
              AND "settlementReviewId" IS NULL
            )
          );
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);
  }

  /**
   * DOWN restores the pre-§264 shape. It is safe only while no settlement exists, which is the
   * ordinary case for a rollback of a slice that has never run in production: dropping the column
   * would otherwise discard the link between an analysis and the human decision that settled it,
   * so the guard refuses rather than silently losing it.
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    const [settled] = await queryRunner.query(`
      SELECT count(*)::int AS n FROM "hazlenz_analyses" WHERE "settlementReviewId" IS NOT NULL
    `);
    if (Number(settled?.n ?? 0) > 0) {
      throw new Error('EXPERT_HUMAN_CONFIRMATION_264_DOWN_REFUSED: '
        + `${settled.n} analysis row(s) reference a human settlement. Reverting would discard the `
        + 'link between an analysis and the person who settled it. Resolve those rows deliberately '
        + 'before reverting.');
    }
    await queryRunner.query(`
      ALTER TABLE "hazlenz_analyses" DROP CONSTRAINT IF EXISTS "ck_hazlenz_analysis_settlement"
    `);
    await queryRunner.query(`
      ALTER TABLE "hazlenz_analyses" DROP CONSTRAINT IF EXISTS "fk_hazlenz_analysis_settlement_review"
    `);
    await queryRunner.query(`
      ALTER TABLE "hazlenz_analyses" DROP COLUMN IF EXISTS "settlementReviewId"
    `);
    await queryRunner.query(`DROP INDEX IF EXISTS "uq_human_review_analysis_idempotency"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "uq_human_review_analysis_settlement"`);
    await queryRunner.query(`
      ALTER TABLE "human_reviews" DROP CONSTRAINT IF EXISTS "ck_human_review_decision"
    `);
    await queryRunner.query(`
      DELETE FROM "human_reviews"
      WHERE "decision" IN ('classification_confirmed', 'classification_changed')
    `);
    await queryRunner.query(`
      ALTER TABLE "human_reviews" ALTER COLUMN "decision" TYPE varchar(24)
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "human_reviews" ADD CONSTRAINT "human_reviews_decision_check"
          CHECK ("decision" IN ('accepted', 'edited', 'overridden', 'dismissed'));
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);
  }
}
