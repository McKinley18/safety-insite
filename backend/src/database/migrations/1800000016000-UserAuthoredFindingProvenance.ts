import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Provenance for a finding the INSPECTOR identified, which HazLenz did not propose.
 *
 * Until now every row in `inspection_findings` came from one place: the decomposition
 * reconciliation in `InspectionService.reconcileDecompositionFindings`, materialising one finding
 * per hazard HazLenz emitted. A finding therefore did not need to say where it came from, because
 * there was only one answer.
 *
 * That is no longer true. An inspector who sees a legitimate hazard HazLenz failed to identify can
 * now record it directly, and the record must never blur the two:
 *
 *   'hazlenz_decomposition' — HazLenz proposed this hazard from the observation.
 *   'user_authored'         — the inspector identified it; HazLenz did not propose it.
 *
 * The distinction is not cosmetic. A user-authored finding carries NO HazLenz-derived confidence
 * and NO citation the engine did not independently produce, so anything reading a finding must be
 * able to tell which kind it is holding before it presents regulatory support for it. It is also
 * one half of the evaluation signal the programme needs: "HazLenz proposed X, the inspector
 * rejected it" is a candidate false positive, and "HazLenz did not propose X, the inspector added
 * it" is a candidate false negative. Neither is ground truth; both are measurable only if they are
 * durably recorded.
 *
 * Deployment ordering: ADDITIVE and SAFE_BEFORE_NEW_CODE. The column is NOT NULL with a default,
 * so every existing row truthfully backfills to 'hazlenz_decomposition' -- which is what every
 * pre-existing finding actually is -- and no constraint can reject a row the running code writes.
 * It is also REQUIRED_BEFORE_NEW_CODE: the entity declares the column and the service selects it.
 * Order is therefore `migration -> deploy`, with no ordering uncertainty.
 */
export class UserAuthoredFindingProvenance1800000016000 implements MigrationInterface {
  name = 'UserAuthoredFindingProvenance1800000016000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "inspection_findings"
      ADD COLUMN IF NOT EXISTS "source" varchar(32) NOT NULL DEFAULT 'hazlenz_decomposition'
    `);

    // Partial index: user-authored findings are the rare case and the one every evaluation query
    // and provenance check filters on. Indexing only those rows keeps it small on a corpus that is
    // overwhelmingly engine-derived.
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_inspection_finding_user_authored"
        ON "inspection_findings" ("inspectionId", "source")
        WHERE "source" = 'user_authored'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_inspection_finding_user_authored"`);
    await queryRunner.query(`ALTER TABLE "inspection_findings" DROP COLUMN IF EXISTS "source"`);
  }
}
