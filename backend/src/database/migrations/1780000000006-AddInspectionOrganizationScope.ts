import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInspectionOrganizationScope1780000000006 implements MigrationInterface {
  name = 'AddInspectionOrganizationScope1780000000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "inspection" ADD COLUMN IF NOT EXISTS "organizationId" character varying`);
    await queryRunner.query(`ALTER TABLE "inspection" ADD COLUMN IF NOT EXISTS "createdByUserId" character varying`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_inspection_organizationId" ON "inspection" ("organizationId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_inspection_organizationId"`);
    await queryRunner.query(`ALTER TABLE "inspection" DROP COLUMN IF EXISTS "createdByUserId"`);
    await queryRunner.query(`ALTER TABLE "inspection" DROP COLUMN IF EXISTS "organizationId"`);
  }
}
