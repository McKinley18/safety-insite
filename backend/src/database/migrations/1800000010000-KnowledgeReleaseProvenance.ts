import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * KG-1 -- Knowledge release provenance (closes architecture gap G1).
 *
 * Records, per HazLenz analysis, which governed knowledge release/snapshot actually
 * informed the analysis, and lets every finding derived from that analysis inherit the
 * same value so an inspection can be explained after the fact.
 *
 * Deliberately additive and nullable. Historical analyses and findings predate any
 * knowledge-release control plane, so they keep NULL; no backfill is performed and none
 * is required. NULL means "no single release can be truthfully named", which is also the
 * correct value for new analyses until standards retrieval is release-scoped (KG-3).
 *
 * This migration changes no reasoning, no retrieval, and no report content.
 */
export class KnowledgeReleaseProvenance1800000010000 implements MigrationInterface {
  name = 'KnowledgeReleaseProvenance1800000010000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "hazlenz_analyses" ADD COLUMN IF NOT EXISTS "knowledgeReleaseId" varchar(120) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "inspection_findings" ADD COLUMN IF NOT EXISTS "knowledgeReleaseId" varchar(120) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "inspection_findings" DROP COLUMN IF EXISTS "knowledgeReleaseId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "hazlenz_analyses" DROP COLUMN IF EXISTS "knowledgeReleaseId"`,
    );
  }
}
