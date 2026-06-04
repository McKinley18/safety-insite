import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPlanCode1780000000002 implements MigrationInterface {
  name = "AddPlanCode1780000000002";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user"
      ADD COLUMN IF NOT EXISTS "planCode" character varying NOT NULL DEFAULT 'basic'
    `);

    await queryRunner.query(`
      ALTER TABLE "organization"
      ADD COLUMN IF NOT EXISTS "planCode" character varying NOT NULL DEFAULT 'basic'
    `);

    await queryRunner.query(`
      UPDATE "user"
      SET "planCode" = CASE
        WHEN "type" = 'company' THEN 'company'
        WHEN "type" = 'pro' THEN 'plus'
        WHEN "type" = 'plus' THEN 'plus'
        ELSE 'basic'
      END
      WHERE "planCode" IS NULL OR "planCode" = 'basic'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN IF EXISTS "planCode"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN IF EXISTS "planCode"`);
  }
}
