import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * A customer-facing record number for an inspection.
 *
 * Until now the only identity an inspection had was its uuid, and the only "identity" a report had
 * was a fragment of its SHA-256 checksum. Neither is a record number. A uuid is unreadable and
 * cannot be spoken aloud; a checksum is INTEGRITY METADATA -- it exists to prove that a byte
 * sequence was not altered, it changes whenever the report is regenerated, and presenting it as
 * the record's identity teaches the customer that their inspection's name changes when the file
 * does. It also invites the checksum to be used as a lookup key, which would make an integrity
 * value load-bearing for retrieval.
 *
 * `displayNumber` is therefore a plain integer sequence, allocated ONCE at inspection creation and
 * never re-derived from anything. Under the one-report-per-inspection contract the report needs no
 * number of its own: there is exactly one report per inspection, so the inspection's number
 * identifies it ("the report for Inspection #7").
 *
 * SCOPE. The sequence is PER OWNER -- per organization for an organization-scoped inspection, per
 * user for an individually-owned one -- and starts at 1 for every scope. A global sequence was
 * rejected deliberately: it would tell every customer how many inspections every OTHER customer had
 * created, and adjacent numbers would let two accounts infer each other's activity. A per-scope
 * sequence discloses only the account's own volume, which the account already knows.
 *
 * IT IS NOT A CREDENTIAL. Nothing authorizes on it, nothing looks a record up by it across scopes,
 * and it appears in no route. Authorization stays exactly where it is -- owner/organization
 * predicates on the uuid primary key. The number is display only, and guessing `#8` grants nothing.
 *
 * BACKFILL is deterministic: within each scope, existing rows are numbered by (createdAt, id), so
 * re-running the backfill on the same corpus always produces the same assignment. `id` breaks ties
 * on identical timestamps, so the ordering is total.
 *
 * Deployment ordering: ADDITIVE and SAFE_BEFORE_NEW_CODE -- the column is NULLABLE, so code that
 * predates it inserts rows the constraint accepts. It is also REQUIRED_BEFORE_NEW_CODE, because
 * `InspectionService.create` allocates the value and the entity selects it. Order is therefore
 * `migration -> deploy`. The column stays nullable rather than NOT NULL precisely so that the
 * ordering has no failure window; the allocator always sets it, so no new row is ever NULL.
 *
 * The unique indexes are PARTIAL on `IS NOT NULL`, so a row that somehow arrives without a number
 * is never rejected -- an unnumbered inspection is a display gap, never a lost record.
 */
export class InspectionDisplayNumber1800000017000 implements MigrationInterface {
  name = 'InspectionDisplayNumber1800000017000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "inspection" ADD COLUMN IF NOT EXISTS "displayNumber" integer NULL`,
    );

    // Deterministic backfill. COALESCE picks whichever scope column is populated; the table's
    // chk_inspection_exactly_one_scope guarantees exactly one of them is.
    await queryRunner.query(`
      UPDATE "inspection" AS target
         SET "displayNumber" = numbered."rowNumber"
        FROM (
          SELECT "id",
                 ROW_NUMBER() OVER (
                   PARTITION BY COALESCE("organizationId", "ownerUserId")
                   ORDER BY "createdAt" ASC, "id" ASC
                 ) AS "rowNumber"
            FROM "inspection"
        ) AS numbered
       WHERE target."id" = numbered."id"
         AND target."displayNumber" IS NULL
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "uq_inspection_display_number_org"
        ON "inspection" ("organizationId", "displayNumber")
        WHERE "organizationId" IS NOT NULL AND "displayNumber" IS NOT NULL
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "uq_inspection_display_number_owner"
        ON "inspection" ("ownerUserId", "displayNumber")
        WHERE "ownerUserId" IS NOT NULL AND "displayNumber" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "uq_inspection_display_number_owner"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "uq_inspection_display_number_org"`);
    await queryRunner.query(`ALTER TABLE "inspection" DROP COLUMN IF EXISTS "displayNumber"`);
  }
}
