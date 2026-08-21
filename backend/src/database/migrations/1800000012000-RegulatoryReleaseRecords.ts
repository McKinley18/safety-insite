import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * KG-3A -- immutable per-release content snapshots (closes defect C).
 *
 * `standards_master.release_id` could only ever name one release per row, so finalizing a new
 * release re-stamped every row and left the previous release with zero records. Release
 * membership AND release content now live in `regulatory_release_records`, written once at
 * finalization and never updated.
 *
 * Additive and reversible. `standards_master.release_id` is deliberately left in place and
 * untouched: existing rows keep it as a "most recent release that captured this row" hint, and
 * no legacy row is assigned membership it did not genuinely have. Nothing in the live standards
 * retrieval path reads either structure.
 */
export class RegulatoryReleaseRecords1800000012000 implements MigrationInterface {
  name = 'RegulatoryReleaseRecords1800000012000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "regulatory_release_records" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "releaseId" varchar(120) NOT NULL,
        "standardId" uuid NULL,
        "agencyCode" varchar(24) NULL,
        "citation" varchar(200) NOT NULL,
        "citationKey" varchar(200) NOT NULL,
        "recordChecksum" char(64) NOT NULL,
        "reviewState" varchar(32) NOT NULL,
        "reviewStateReason" text NULL,
        "payload" jsonb NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now()
      )
    `);
    // One version of a logical citation per release. This is what lets release A and release B
    // each hold their own version of the same citation without colliding.
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "uq_regulatory_release_record_citation"
      ON "regulatory_release_records" ("releaseId", "citationKey")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_regulatory_release_record_release"
      ON "regulatory_release_records" ("releaseId")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_regulatory_release_record_citation_key"
      ON "regulatory_release_records" ("citationKey")
    `);
    await queryRunner.query(`
      ALTER TABLE "regulatory_release_records"
      DROP CONSTRAINT IF EXISTS "chk_regulatory_release_record_review_state"
    `);
    await queryRunner.query(`
      ALTER TABLE "regulatory_release_records"
      ADD CONSTRAINT "chk_regulatory_release_record_review_state"
      CHECK ("reviewState" IN ('unreviewed','mechanically_validated','reviewer_approved'))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_regulatory_release_record_citation_key"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_regulatory_release_record_release"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "uq_regulatory_release_record_citation"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "regulatory_release_records"`);
  }
}
