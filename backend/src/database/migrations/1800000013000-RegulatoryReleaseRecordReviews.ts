import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * KG-3B -- reviewer approval decisions bound to an exact release-record version.
 *
 * KG-3A left `reviewer_approved` with no legitimate producer anywhere in the codebase: the
 * finalizer stopped deriving it (it was deriving "this source may be auto-ingested" and
 * recording it as "a reviewer approved this record"), and nothing replaced it. Every release
 * therefore reports 0 governed records and correctly fails the `governedRecordsPresent`
 * activation gate. This table is the producer.
 *
 * Append-only by design and by convention -- see the entity for why approval is a decision
 * ABOUT an immutable snapshot row rather than a mutation OF it.
 *
 * Additive and reversible. Nothing in the live standards retrieval path reads this table;
 * KG-3B does not enable governed read filtering.
 */
export class RegulatoryReleaseRecordReviews1800000013000 implements MigrationInterface {
  name = 'RegulatoryReleaseRecordReviews1800000013000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "regulatory_release_record_reviews" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "releaseId" varchar(120) NOT NULL,
        "citationKey" varchar(200) NOT NULL,
        "citation" varchar(200) NOT NULL,
        "recordChecksum" char(64) NOT NULL,
        "decision" varchar(16) NOT NULL,
        "reviewerId" varchar(160) NOT NULL,
        "reviewerRole" varchar(120) NULL,
        "note" text NULL,
        "frozenReviewStateAtDecision" varchar(32) NOT NULL,
        "decidedAt" timestamptz NOT NULL DEFAULT now(),
        "createdAt" timestamptz NOT NULL DEFAULT now()
      )
    `);

    // The effective-state query resolves the latest decision for an exact
    // (release, citation, version) triple, so that is the index shape.
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_release_record_review_lookup"
      ON "regulatory_release_record_reviews" ("releaseId", "citationKey", "recordChecksum")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_release_record_review_release_decided"
      ON "regulatory_release_record_reviews" ("releaseId", "decidedAt")
    `);

    await queryRunner.query(`
      ALTER TABLE "regulatory_release_record_reviews"
      DROP CONSTRAINT IF EXISTS "chk_release_record_review_decision"
    `);
    await queryRunner.query(`
      ALTER TABLE "regulatory_release_record_reviews"
      ADD CONSTRAINT "chk_release_record_review_decision"
      CHECK ("decision" IN ('approved','revoked'))
    `);

    // Deliberately NO unique constraint on (releaseId, citationKey, recordChecksum): a record
    // may legitimately be approved, revoked, and approved again, and every one of those
    // decisions must be retained. Uniqueness here would force revocation to be a DELETE or an
    // UPDATE, destroying the audit trail this table exists to keep.
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_release_record_review_release_decided"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_release_record_review_lookup"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "regulatory_release_record_reviews"`);
  }
}
