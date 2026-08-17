import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSiteOrganizationId1780000000006 implements MigrationInterface {
  name = 'AddSiteOrganizationId1780000000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "site" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar NOT NULL,
        "organizationId" varchar,
        "createdAt" timestamp NOT NULL DEFAULT now()
      )
    `);
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
