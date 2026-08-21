import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * KG-3F (Phases 8-10) -- the explicit approval/provenance contract.
 *
 * KG-3E measured that editing `source_url` or `retrieval_date` left the reviewer-bound checksum
 * unchanged, and deliberately did not rule on whether that was right. The cause was that approval
 * had no contract of its own: it reused `recordChecksum`, which is the release MANIFEST identity.
 * The manifest answers "was this release tampered with"; approval answers "does this reviewer's
 * decision still truthfully name this content". Those need different field sets, and reusing one
 * for the other left `part_number`/`subpart` and `deprecation_status` outside the reviewer's
 * binding -- so a record could be re-scoped to a different subpart, or marked superseded, with its
 * approval intact.
 *
 * This migration adds the second identity ALONGSIDE the first. `recordChecksum` is untouched:
 * every finalized release's integrity proof depends on it byte-for-byte, and changing it would
 * invalidate the entire release history to fix an approval defect.
 *
 * HISTORICAL SAFETY -- the reason every column here is NULLable.
 *
 * Existing snapshot rows cannot be backfilled. `payload` holds the v1 projection, which never
 * contained `part_number`, `deprecation_status`, `source_document_checksum` or the other fields
 * the contract now covers, so the v2 digest is not derivable from what was frozen. It could be
 * recomputed from the live `standards_master`, but that table is mutable and may have drifted
 * since finalization -- the result would attest a reviewer to content they may never have seen.
 * That is precisely the stale-approval failure this whole subsystem exists to prevent.
 *
 * So NULL is load-bearing and means exactly one thing: "this record predates the approval
 * contract". Its historical approvals remain true statements about what a reviewer decided under
 * v1 and are never rewritten, reinterpreted or deleted. They are simply not carried forward
 * automatically -- `describeContractReaffirmationCandidates()` enumerates them for explicit,
 * evidence-backed reaffirmation, one decision at a time. There is no bulk approval path.
 *
 * Additive and reversible. No customer retrieval path reads these columns.
 */
export class ApprovalProvenanceContract1800000014000 implements MigrationInterface {
  name = 'ApprovalProvenanceContract1800000014000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // --- the snapshot's approval identity, parallel to its manifest identity ---
    await queryRunner.query(`
      ALTER TABLE "regulatory_release_records"
        ADD COLUMN IF NOT EXISTS "approvalContractVersion" integer NULL,
        ADD COLUMN IF NOT EXISTS "substantiveContentDigest" char(64) NULL,
        ADD COLUMN IF NOT EXISTS "sourceIdentityDigest" char(64) NULL,
        ADD COLUMN IF NOT EXISTS "approvalDigest" char(64) NULL,
        ADD COLUMN IF NOT EXISTS "approvalPayload" jsonb NULL
    `);

    // Effective-state resolution joins decisions to records on the approval digest for v2
    // records, exactly as it joins on recordChecksum for v1 ones.
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_release_record_approval_digest"
        ON "regulatory_release_records" ("releaseId", "citationKey", "approvalDigest")
    `);

    // --- the decision's binding, recorded at decision time ---
    // NULL approvalDigest on a decision means it was recorded under v1 and binds via
    // recordChecksum only. Existing rows are left exactly as they are.
    await queryRunner.query(`
      ALTER TABLE "regulatory_release_record_reviews"
        ADD COLUMN IF NOT EXISTS "approvalContractVersion" integer NULL,
        ADD COLUMN IF NOT EXISTS "approvalDigest" char(64) NULL,
        ADD COLUMN IF NOT EXISTS "substantiveContentDigest" char(64) NULL,
        ADD COLUMN IF NOT EXISTS "sourceIdentityDigest" char(64) NULL,
        ADD COLUMN IF NOT EXISTS "supersedesDecisionId" uuid NULL
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_release_record_review_approval_digest"
        ON "regulatory_release_record_reviews" ("releaseId", "citationKey", "approvalDigest")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_release_record_review_approval_digest"`);
    await queryRunner.query(`
      ALTER TABLE "regulatory_release_record_reviews"
        DROP COLUMN IF EXISTS "supersedesDecisionId",
        DROP COLUMN IF EXISTS "sourceIdentityDigest",
        DROP COLUMN IF EXISTS "substantiveContentDigest",
        DROP COLUMN IF EXISTS "approvalDigest",
        DROP COLUMN IF EXISTS "approvalContractVersion"
    `);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_release_record_approval_digest"`);
    await queryRunner.query(`
      ALTER TABLE "regulatory_release_records"
        DROP COLUMN IF EXISTS "approvalPayload",
        DROP COLUMN IF EXISTS "approvalDigest",
        DROP COLUMN IF EXISTS "sourceIdentityDigest",
        DROP COLUMN IF EXISTS "substantiveContentDigest",
        DROP COLUMN IF EXISTS "approvalContractVersion"
    `);
  }
}
