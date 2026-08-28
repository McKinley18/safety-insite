import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * The governed knowledge release an inspection is bound to.
 *
 * WHY A COLUMN EXISTS AT ALL. `hazlenz_analyses.knowledgeReleaseId` and
 * `inspection_findings.knowledgeReleaseId` (migration 1800000010000) already record which release
 * governed one ANALYSIS and one FINDING. Neither can be the INPUT to release-scoped retrieval,
 * because both are written after the analysis they describe. Something that outlives an analysis
 * has to hold the choice, and the inspection is the only thing every analysis in a workflow shares
 * -- it is already the authority for the inspection's other cross-analysis regulatory fact,
 * `regulatoryContext`.
 *
 * WHAT IT MEANS. Write-once. An inspection acquires a governing release the first time an analysis
 * runs under a governed mode with a release active, and keeps it: reopening, re-analysing or
 * regenerating the report reproduces the regulatory basis the customer was originally given. When
 * a NEWER release is later activated, existing inspections do not move to it. Re-binding is a
 * migration decision a person makes deliberately; nothing in the request path may make it
 * implicitly, which is why there is no code path that UPDATEs a non-NULL value.
 *
 * NULL is the ordinary state, and is honest: it means no governed release informed this
 * inspection, which is true of every inspection created in LEGACY mode -- that is, every
 * inspection that exists today. It is never backfilled. Stamping a release id onto historical
 * inspections whose retrieval was genuinely unscoped would be exactly the false provenance KG-1
 * exists to prevent, and it cannot be undone once a report cites it.
 *
 * Deployment ordering: ADDITIVE and SAFE_BEFORE_NEW_CODE -- the column is NULLABLE with no default,
 * so code that predates it inserts rows the schema accepts. It is REQUIRED_BEFORE_NEW_CODE,
 * because the entity selects it and the binding resolver reads and writes it, so the order is
 * `migration -> deploy`.
 *
 * The index is PARTIAL on `IS NOT NULL`: the overwhelming majority of rows are NULL and would
 * contribute nothing but size to a full index, while "which inspections are governed by release X"
 * -- the question a rollback or a release audit asks -- is answered from the partial one.
 */
export class InspectionKnowledgeReleaseBinding1800000018000 implements MigrationInterface {
  name = 'InspectionKnowledgeReleaseBinding1800000018000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "inspection" ADD COLUMN IF NOT EXISTS "knowledgeReleaseId" varchar(120) NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_inspection_knowledge_release"
         ON "inspection" ("knowledgeReleaseId") WHERE "knowledgeReleaseId" IS NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_inspection_knowledge_release"`);
    await queryRunner.query(`ALTER TABLE "inspection" DROP COLUMN IF EXISTS "knowledgeReleaseId"`);
  }
}
