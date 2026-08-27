import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Authoritative idempotency identity for offline field-capture synchronisation.
 *
 * The problem this closes: creating an inspection, an observation or an evidence object is a
 * non-idempotent POST. A server that commits the row and then loses the response leaves the client
 * unable to tell "never happened" from "happened, answer lost", and a retry creates a duplicate.
 * The client previously reconciled by matching title + site + timestamp, which is a heuristic: it
 * cannot distinguish two legitimate inspections created seconds apart with the same title at the
 * same site, and it refuses to act whenever more than one candidate matches.
 *
 * The fix is a stable opaque identifier the CLIENT generates once, persists with its local draft,
 * and replays on every attempt. The database — not the client, and not a heuristic — is the
 * authority that a given identifier maps to exactly one row.
 *
 * Scoping is per CREATING USER, never per organisation. An idempotency key is only ever honoured
 * for the account that minted it, so one member of an organisation can never resolve or adopt
 * another member's inspection by presenting their identifier. That is stricter than the read
 * authorisation model (which does permit authorised organisation sharing) and deliberately so:
 * sharing what already exists is a different question from deciding whose write a request is.
 *
 * Every index is PARTIAL on `IS NOT NULL`. Existing rows have NULL, and an online create that
 * sends no identifier stays exactly as it was — unconstrained and backward compatible.
 *
 * Nothing here is destructive: three nullable columns and three indexes, no data rewritten, no
 * constraint that can reject an existing row.
 */
export class OfflineSyncIdempotency1800000015000 implements MigrationInterface {
  name = 'OfflineSyncIdempotency1800000015000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "inspection" ADD COLUMN IF NOT EXISTS "clientRequestId" varchar(128) NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "uq_inspection_client_request"
         ON "inspection" ("createdByUserId", "clientRequestId")
         WHERE "clientRequestId" IS NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "observations" ADD COLUMN IF NOT EXISTS "clientRequestId" varchar(128) NULL`,
    );
    // Also keyed by inspectionId: an observation identifier is only meaningful inside the
    // inspection it belongs to, and this keeps a replayed key from reaching across inspections.
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "uq_observation_client_request"
         ON "observations" ("inspectionId", "createdByUserId", "clientRequestId")
         WHERE "clientRequestId" IS NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "storage_objects" ADD COLUMN IF NOT EXISTS "clientRequestId" varchar(128) NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "uq_storage_object_client_request"
         ON "storage_objects" ("createdByUserId", "clientRequestId")
         WHERE "clientRequestId" IS NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "uq_storage_object_client_request"`);
    await queryRunner.query(`ALTER TABLE "storage_objects" DROP COLUMN IF EXISTS "clientRequestId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "uq_observation_client_request"`);
    await queryRunner.query(`ALTER TABLE "observations" DROP COLUMN IF EXISTS "clientRequestId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "uq_inspection_client_request"`);
    await queryRunner.query(`ALTER TABLE "inspection" DROP COLUMN IF EXISTS "clientRequestId"`);
  }
}
