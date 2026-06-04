import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSiteOrganizationId1780000000004 implements MigrationInterface {
  name = 'AddSiteOrganizationId1780000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "site"
      ADD COLUMN IF NOT EXISTS "organizationId" varchar
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_site_organization_id"
      ON "site" ("organizationId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_site_organization_id"`);

    await queryRunner.query(`
      ALTER TABLE "site"
      DROP COLUMN IF EXISTS "organizationId"
    `);
  }
}
