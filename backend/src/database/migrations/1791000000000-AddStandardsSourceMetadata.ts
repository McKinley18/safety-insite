import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStandardsSourceMetadata1791000000000 implements MigrationInterface {
  name = 'AddStandardsSourceMetadata1791000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "standards_master"
      ADD COLUMN IF NOT EXISTS "source_key" varchar,
      ADD COLUMN IF NOT EXISTS "source_name" varchar,
      ADD COLUMN IF NOT EXISTS "source_type" varchar,
      ADD COLUMN IF NOT EXISTS "authority_tier" integer NOT NULL DEFAULT 3,
      ADD COLUMN IF NOT EXISTS "allowed_use" varchar NOT NULL DEFAULT 'reference',
      ADD COLUMN IF NOT EXISTS "requires_approval" boolean NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS "approved_for_auto_ingestion" boolean NOT NULL DEFAULT true
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "standards_master"
      DROP COLUMN IF EXISTS "approved_for_auto_ingestion",
      DROP COLUMN IF EXISTS "requires_approval",
      DROP COLUMN IF EXISTS "allowed_use",
      DROP COLUMN IF EXISTS "authority_tier",
      DROP COLUMN IF EXISTS "source_type",
      DROP COLUMN IF EXISTS "source_name",
      DROP COLUMN IF EXISTS "source_key"
    `);
  }
}
