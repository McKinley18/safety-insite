import { MigrationInterface, QueryRunner } from 'typeorm';

// The Expert billing tier is retired; Pro now includes everything Expert
// previously granted. Existing entitlement_grants rows carrying 'expert'
// are remapped to 'pro' before the CHECK constraint is tightened so no
// row is left violating it, and new grants default to 'pro' instead.
export class RetireExpertTier1800000005900 implements MigrationInterface {
  name = 'RetireExpertTier1800000005900';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE "entitlement_grants" SET "tier" = 'pro' WHERE "tier" = 'expert'`);
    await queryRunner.query(`
      ALTER TABLE "entitlement_grants"
      DROP CONSTRAINT IF EXISTS "entitlement_grants_tier_check"
    `);
    await queryRunner.query(`ALTER TABLE "entitlement_grants" ALTER COLUMN "tier" SET DEFAULT 'pro'`);
    await queryRunner.query(`
      ALTER TABLE "entitlement_grants"
      ADD CONSTRAINT "entitlement_grants_tier_check" CHECK ("tier" IN ('pro'))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "entitlement_grants"
      DROP CONSTRAINT IF EXISTS "entitlement_grants_tier_check"
    `);
    await queryRunner.query(`ALTER TABLE "entitlement_grants" ALTER COLUMN "tier" SET DEFAULT 'expert'`);
    await queryRunner.query(`
      ALTER TABLE "entitlement_grants"
      ADD CONSTRAINT "entitlement_grants_tier_check" CHECK ("tier" IN ('pro','expert'))
    `);
  }
}
