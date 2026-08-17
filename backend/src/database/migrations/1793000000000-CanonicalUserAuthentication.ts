import { MigrationInterface, QueryRunner } from 'typeorm';

export class CanonicalUserAuthentication1793000000000 implements MigrationInterface {
  name = 'CanonicalUserAuthentication1793000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('user'))) {
      throw new Error('Canonical user migration requires the auth workspace migration.');
    }

    await queryRunner.query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "passwordHash" varchar`);
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = current_schema() AND table_name = 'user' AND column_name = 'password'
        ) THEN
          UPDATE "user" SET "passwordHash" = "password"
          WHERE "passwordHash" IS NULL AND "password" IS NOT NULL;
        END IF;
      END $$;
    `);
    const missing = await queryRunner.query(`SELECT COUNT(*)::int AS count FROM "user" WHERE "passwordHash" IS NULL`);
    if (Number(missing[0]?.count || 0) > 0) {
      throw new Error('Cannot require user.passwordHash: existing users without a password hash require manual remediation.');
    }
    await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "passwordHash" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "passwordResetTokenHash" varchar`);
    await queryRunner.query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "passwordResetExpiresAt" timestamptz`);
    await queryRunner.query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "passwordChangedAt" timestamptz`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_user_password_reset_token_hash" ON "user" ("passwordResetTokenHash")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_user_organization_id" ON "user" ("organizationId")`);
  }

  public async down(): Promise<void> {
    throw new Error('Canonical authentication migration is intentionally irreversible because rollback could invalidate credentials.');
  }
}
