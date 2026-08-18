import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefreshTokens1800000008000 implements MigrationInterface {
  name = 'RefreshTokens1800000008000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "refresh_tokens" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "tokenHash" varchar NOT NULL,
        "expiresAt" timestamptz NOT NULL,
        "revokedAt" timestamptz NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_refresh_token_hash" ON "refresh_tokens" ("tokenHash")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_refresh_tokens_user_id" ON "refresh_tokens" ("userId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "refresh_tokens"`);
  }
}
