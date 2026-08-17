import { MigrationInterface, QueryRunner } from 'typeorm';

// Provisions the normalized regulatory-text hierarchy (RegulatoryAgency ->
// RegulatoryPart -> RegulatorySubpart -> RegulatorySection -> RegulatoryParagraph)
// backing the already-built RegulatorySyncService and eCFR/MSHA ingestion
// connectors, none of which had a migration despite being registered TypeORM
// entities (confirmed absent from all prior migrations). Column shapes mirror
// the entity definitions in src/regulatory/entities/*.entity.ts exactly; no
// synchronize:true was used to derive this.
export class RegulatorySectionCorpus1800000005800 implements MigrationInterface {
  name = 'RegulatorySectionCorpus1800000005800';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "regulatory_agency" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "code" varchar NOT NULL UNIQUE,
        "name" varchar NOT NULL,
        "titleNumber" varchar NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "regulatory_part" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "agencyCode" varchar NOT NULL,
        "titleNumber" varchar NOT NULL,
        "part" varchar NOT NULL,
        "heading" varchar NOT NULL,
        "customerPack" varchar NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "uq_regulatory_part_natural_key" UNIQUE ("agencyCode", "titleNumber", "part")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "regulatory_subpart" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "agencyCode" varchar NOT NULL,
        "titleNumber" varchar NOT NULL,
        "part" varchar NOT NULL,
        "subpart" varchar NULL,
        "heading" varchar NULL,
        "sortOrder" integer NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "uq_regulatory_subpart_natural_key" UNIQUE ("agencyCode", "titleNumber", "part", "subpart")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "regulatory_section" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "agencyCode" varchar NOT NULL,
        "titleNumber" varchar NOT NULL,
        "part" varchar NOT NULL,
        "subpart" varchar NULL,
        "section" varchar NOT NULL,
        "citation" varchar NOT NULL UNIQUE,
        "heading" varchar NULL,
        "textPlain" text NULL,
        "summaryPlainLanguage" text NULL,
        "sourceUrl" varchar NULL,
        "upToDateAsOf" varchar NULL,
        "lastAmendedOn" varchar NULL,
        "lastSyncedAt" timestamp NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_regulatory_section_agency_code" ON "regulatory_section" ("agencyCode")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_regulatory_section_title_number" ON "regulatory_section" ("titleNumber")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_regulatory_section_part" ON "regulatory_section" ("part")`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "regulatory_paragraph" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "sectionCitation" varchar NOT NULL,
        "label" varchar NULL,
        "paragraphPath" varchar NULL,
        "textPlain" text NOT NULL,
        "summaryPlainLanguage" text NULL,
        "keywords" text NULL,
        "sortOrder" integer NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "uq_regulatory_paragraph_section_text" UNIQUE ("sectionCitation", "textPlain")
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_regulatory_paragraph_section_citation" ON "regulatory_paragraph" ("sectionCitation")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_regulatory_paragraph_section_citation"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "regulatory_paragraph"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_regulatory_section_part"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_regulatory_section_title_number"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_regulatory_section_agency_code"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "regulatory_section"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "regulatory_subpart"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "regulatory_part"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "regulatory_agency"`);
  }
}
