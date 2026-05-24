import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1777429229824 implements MigrationInterface {
    name = 'InitialMigration1777429229824'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "standards_master" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "agency_code" character varying NOT NULL, "citation" character varying NOT NULL, "part_number" character varying, "subpart" character varying, "title" character varying NOT NULL, "standard_text" text NOT NULL, "plain_language_summary" text, "scope_code" character varying NOT NULL, "hazard_codes" text, "keywords" text, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cf656a8e6fe9f03442687fcabfb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_c27d52393c2c29e8c67eb4192e" ON "standards_master" ("agency_code", "citation") `);
        const hasHazardTaxonomy = await queryRunner.hasTable("hazard_taxonomy");

        if (hasHazardTaxonomy) {
            await queryRunner.query(`ALTER TABLE "hazard_taxonomy" DROP COLUMN IF EXISTS "regulatoryCrosswalk"`);
            await queryRunner.query(`ALTER TABLE "hazard_taxonomy" DROP COLUMN IF EXISTS "conditionId"`);
            await queryRunner.query(`ALTER TABLE "hazard_taxonomy" DROP COLUMN IF EXISTS "synonyms"`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const hasHazardTaxonomy = await queryRunner.hasTable("hazard_taxonomy");

        if (hasHazardTaxonomy) {
            await queryRunner.query(`ALTER TABLE "hazard_taxonomy" ADD COLUMN IF NOT EXISTS "synonyms" text`);
            await queryRunner.query(`ALTER TABLE "hazard_taxonomy" ADD COLUMN IF NOT EXISTS "conditionId" character varying`);
            await queryRunner.query(`ALTER TABLE "hazard_taxonomy" ADD COLUMN IF NOT EXISTS "regulatoryCrosswalk" jsonb`);
        }
        await queryRunner.query(`DROP INDEX "public"."IDX_c27d52393c2c29e8c67eb4192e"`);
        await queryRunner.query(`DROP TABLE "standards_master"`);
    }

}
