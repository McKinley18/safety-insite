import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * §287 — THE CORRECTIVE-ACTION LIFECYCLE COLUMNS.
 *
 * ==================== WHY THE TABLE NEEDED ANYTHING AT ALL ====================
 *
 * §286 / D-052 measured that closing a corrective action stamped `verifiedByUserId` and
 * `verifiedAt` and recorded the outcome as `VERIFIED_STRONG` / `SUPERVISOR_SIGNOFF` --
 * unconditionally, for any caller who could reach the route, including the person who raised the
 * action. Nothing had been verified and nobody had signed off.
 *
 * The cause was not carelessness in the write path, it was a MISSING MODEL. `corrective_actions`
 * has carried `verifiedByUserId` and `verifiedAt` since the initial migration and has never had
 * anywhere to record WHO CLOSED AN ACTION AND WHEN. Closure had one pair of columns available to
 * it, and they were the verification pair. The product then read those columns back and reported
 * what they say.
 *
 * ==================== WHAT THIS ADDS, AND WHAT IT DELIBERATELY DOES NOT ====================
 *
 *   closedAt / closedByUserId   the completion axis, which had no representation. Closing writes
 *                               these; it no longer touches the verification pair.
 *   clientRequestId             §287 / D-053. `POST /actions` was the only create route in the
 *                               product with no idempotency key, so a double-submit, a retry after
 *                               a timeout, or a lost response produced a second identical open
 *                               action. Same column name, same shape and same partial-unique
 *                               treatment the inspection and observation routes already use.
 *
 * There is NO new status column and NO new state machine. The lifecycle state a customer sees is
 * DERIVED from `statusCode` (which already carries open / in_progress / closed / cancelled) and
 * from whether `verifiedAt` is set. §287's direction is explicit that equivalent semantics in the
 * existing authoritative model must be used rather than duplicated, and two status columns that
 * can disagree is precisely the defect a second state machine introduces.
 *
 * Nothing here is backfilled. A row closed before §287 has `closedAt` NULL, which is truthful --
 * the product genuinely does not know when it was closed, and inventing a time from `verifiedAt`
 * would re-commit the error this migration exists to correct. `verifiedAt` on those historical
 * rows is left exactly as written; it is not evidence of verification and §287's read path does
 * not treat it as such for rows that predate the repair, because it cannot tell them apart. That
 * limitation is recorded rather than papered over.
 */
/*
 * §288. TIMESTAMP CORRECTED FROM 1800000006000 TO 1800000022000.
 *
 * §287 authored this file as `1800000006000-…`, which collided with the existing
 * `1800000006000-AddUserProfileNames` and sorted 16 migrations before the current head. Two
 * consequences, the second of which is why §288 repaired it rather than registering it:
 *
 *   1. a duplicate timestamp makes the relative order of those two migrations ambiguous;
 *   2. `release-identity.ts` derives `schemaCompatibilityVersion` from the LAST migration by sort
 *      order, so a schema change filed before the head was invisible to the release contract's
 *      own compatibility signal — the release manifest would have reported a schema version that
 *      did not include this table change.
 *
 * Safe as a pure rename: this migration has never run in any production database, it declares no
 * dependency on any later migration, and every statement is idempotent (`IF NOT EXISTS`).
 */
export class CorrectiveActionLifecycle1800000022000 implements MigrationInterface {
  name = 'CorrectiveActionLifecycle1800000022000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "corrective_actions" ADD COLUMN IF NOT EXISTS "closedAt" TIMESTAMP`);
    await queryRunner.query(
      `ALTER TABLE "corrective_actions" ADD COLUMN IF NOT EXISTS "closedByUserId" character varying`);
    await queryRunner.query(
      `ALTER TABLE "corrective_actions" ADD COLUMN IF NOT EXISTS "clientRequestId" character varying`);

    /**
     * PARTIAL unique index, scoped to the tenant and the creating user.
     *
     * PARTIAL because `clientRequestId` is optional: every row created before §287, and every
     * caller that does not send one, has NULL, and a plain unique index would collapse all of them
     * into one. WHERE NOT NULL lets the constraint bind only the callers that opted in.
     *
     * SCOPED to (tenantId, ownerUserId) rather than global because a client-generated id is client
     * input. A global constraint would let one account's chosen id block another account's create,
     * which is a denial-of-service surface reachable from a request body.
     */
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_corrective_actions_client_request_id"
      ON "corrective_actions" ("tenantId", "ownerUserId", "clientRequestId")
      WHERE "clientRequestId" IS NOT NULL
    `);

    // The corrective-action list is read by owner scope and ordered by creation; the calendar
    // projection reads it by scope and due date. Neither had an index covering it.
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_corrective_actions_owner_status_due"
      ON "corrective_actions" ("ownerUserId", "statusCode", "dueDate")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_corrective_actions_owner_status_due"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_corrective_actions_client_request_id"`);
    await queryRunner.query(
      `ALTER TABLE "corrective_actions" DROP COLUMN IF EXISTS "clientRequestId"`);
    await queryRunner.query(
      `ALTER TABLE "corrective_actions" DROP COLUMN IF EXISTS "closedByUserId"`);
    await queryRunner.query(
      `ALTER TABLE "corrective_actions" DROP COLUMN IF EXISTS "closedAt"`);
  }
}
