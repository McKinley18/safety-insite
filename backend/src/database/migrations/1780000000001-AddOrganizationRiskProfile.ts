import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrganizationRiskProfile1780000000001 implements MigrationInterface {
  name = 'AddOrganizationRiskProfile1780000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "organization"
      ADD COLUMN IF NOT EXISTS "riskProfileId" varchar NOT NULL DEFAULT 'standard_5x5'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "organization"
      DROP COLUMN IF EXISTS "riskProfileId"
    `);
  }
}
