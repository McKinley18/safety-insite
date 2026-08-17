import { MigrationInterface, QueryRunner } from 'typeorm';

export class RegulatorySourceChecksums1800000005200 implements MigrationInterface {
  name = 'RegulatorySourceChecksums1800000005200';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "safescope_knowledge_documents"
      ADD COLUMN IF NOT EXISTS "sourceDocumentChecksum" char(64),
      ADD COLUMN IF NOT EXISTS "normalizedRecordChecksum" char(64),
      ADD COLUMN IF NOT EXISTS "retrievedAt" timestamptz,
      ADD COLUMN IF NOT EXISTS "parserVersion" varchar(80),
      ADD COLUMN IF NOT EXISTS "regulatoryReleaseId" varchar(120)
    `);
    await queryRunner.query(`
      ALTER TABLE "safescope_knowledge_chunks"
      ADD COLUMN IF NOT EXISTS "normalizedRecordChecksum" char(64)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_knowledge_document_regulatory_release"
      ON "safescope_knowledge_documents" ("regulatoryReleaseId", "approvalStatus")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_knowledge_chunk_citation"
      ON "safescope_knowledge_chunks" ("citation")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_knowledge_chunk_citation"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_knowledge_document_regulatory_release"`);
    await queryRunner.query(`ALTER TABLE "safescope_knowledge_chunks" DROP COLUMN IF EXISTS "normalizedRecordChecksum"`);
    await queryRunner.query(`
      ALTER TABLE "safescope_knowledge_documents"
      DROP COLUMN IF EXISTS "regulatoryReleaseId",
      DROP COLUMN IF EXISTS "parserVersion",
      DROP COLUMN IF EXISTS "retrievedAt",
      DROP COLUMN IF EXISTS "normalizedRecordChecksum",
      DROP COLUMN IF EXISTS "sourceDocumentChecksum"
    `);
  }
}
