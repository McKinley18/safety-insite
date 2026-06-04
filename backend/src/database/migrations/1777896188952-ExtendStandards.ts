import { MigrationInterface, QueryRunner } from "typeorm";

export class ExtendStandards1777896188952 implements MigrationInterface {
    name = 'ExtendStandards1777896188952'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const hasHazardTaxonomy = await queryRunner.hasTable("hazard_taxonomy");

        if (hasHazardTaxonomy) {
            await queryRunner.query(`ALTER TABLE "hazard_taxonomy" DROP COLUMN IF EXISTS "regulatoryCrosswalk"`);
            await queryRunner.query(`ALTER TABLE "hazard_taxonomy" DROP COLUMN IF EXISTS "conditionId"`);
            await queryRunner.query(`ALTER TABLE "hazard_taxonomy" DROP COLUMN IF EXISTS "synonyms"`);
        }
        await queryRunner.query(`ALTER TABLE "standards_master" ADD "required_controls" text`);
        await queryRunner.query(`ALTER TABLE "standards_master" ADD "severity_weight" integer NOT NULL DEFAULT '1'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "standards_master" DROP COLUMN "severity_weight"`);
        await queryRunner.query(`ALTER TABLE "standards_master" DROP COLUMN "required_controls"`);
        const hasHazardTaxonomy = await queryRunner.hasTable("hazard_taxonomy");

        if (hasHazardTaxonomy) {
            await queryRunner.query(`ALTER TABLE "hazard_taxonomy" ADD COLUMN IF NOT EXISTS "synonyms" text`);
            await queryRunner.query(`ALTER TABLE "hazard_taxonomy" ADD COLUMN IF NOT EXISTS "conditionId" character varying`);
            await queryRunner.query(`ALTER TABLE "hazard_taxonomy" ADD COLUMN IF NOT EXISTS "regulatoryCrosswalk" jsonb`);
        }
    }

}
