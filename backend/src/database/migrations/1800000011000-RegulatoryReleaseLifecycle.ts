import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * KG-2 -- regulatory release lifecycle and the active-release pointer (closes gap G3).
 *
 * Extends the existing `regulatory_releases` table rather than introducing a parallel
 * control-state structure, adds the states `active` / `superseded` / `rolled_back` alongside
 * the existing `draft` / `provisional`, and enforces at most one active release with a
 * partial unique index. Adds `knowledge_release_events` as the audit trail for pointer
 * movements.
 *
 * Additive and reversible. No existing row changes status, so after this migration there is
 * still NO active release -- exactly as before. Nothing in the standards retrieval path
 * reads any of this; KG-3 decides when the runtime may honour the pointer.
 */
export class RegulatoryReleaseLifecycle1800000011000 implements MigrationInterface {
  name = 'RegulatoryReleaseLifecycle1800000011000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "regulatory_releases"
      ADD COLUMN IF NOT EXISTS "parentReleaseId" varchar(120) NULL,
      ADD COLUMN IF NOT EXISTS "activatedAt" timestamptz NULL,
      ADD COLUMN IF NOT EXISTS "deactivatedAt" timestamptz NULL
    `);

    // Makes the lifecycle explicit and rejects typo'd statuses. Only 'draft' (column default)
    // and 'provisional' (written by finalize-regulatory-release.ts) can exist beforehand, so
    // no pre-existing row can violate it.
    await queryRunner.query(`
      ALTER TABLE "regulatory_releases"
      DROP CONSTRAINT IF EXISTS "chk_regulatory_release_status"
    `);
    await queryRunner.query(`
      ALTER TABLE "regulatory_releases"
      ADD CONSTRAINT "chk_regulatory_release_status"
      CHECK ("status" IN ('draft','provisional','active','superseded','rolled_back'))
    `);

    // The hard guarantee that at most one release is active. Application logic and the
    // advisory lock make contention orderly; this makes two active releases impossible.
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "uq_regulatory_release_active"
      ON "regulatory_releases" ("status") WHERE "status" = 'active'
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "knowledge_release_events" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "event" varchar(24) NOT NULL,
        "outcome" varchar(16) NOT NULL,
        "fromReleaseId" varchar(120) NULL,
        "toReleaseId" varchar(120) NOT NULL,
        "actor" varchar(160) NOT NULL,
        "reason" text NULL,
        "details" jsonb NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_knowledge_release_event_to_created"
      ON "knowledge_release_events" ("toReleaseId", "createdAt")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_knowledge_release_event_to_created"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "knowledge_release_events"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "uq_regulatory_release_active"`);
    await queryRunner.query(`
      ALTER TABLE "regulatory_releases"
      DROP CONSTRAINT IF EXISTS "chk_regulatory_release_status"
    `);
    // Any release still holding a KG-2-only status must fall back to the pre-KG-2 vocabulary,
    // otherwise reverting would leave rows the old code cannot interpret.
    await queryRunner.query(`
      UPDATE "regulatory_releases" SET "status" = 'provisional'
      WHERE "status" IN ('active','superseded','rolled_back')
    `);
    await queryRunner.query(`
      ALTER TABLE "regulatory_releases"
      DROP COLUMN IF EXISTS "deactivatedAt",
      DROP COLUMN IF EXISTS "activatedAt",
      DROP COLUMN IF EXISTS "parentReleaseId"
    `);
  }
}
