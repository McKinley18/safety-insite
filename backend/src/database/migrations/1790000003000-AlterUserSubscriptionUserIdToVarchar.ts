import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterUserSubscriptionUserIdToVarchar1790000003000 implements MigrationInterface {
  name = "AlterUserSubscriptionUserIdToVarchar1790000003000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_user_subscription_user_id"`);
    await queryRunner.query(
      `ALTER TABLE "user_subscription" ALTER COLUMN "userId" TYPE character varying(64) USING "userId"::text`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "idx_user_subscription_user_id" ON "user_subscription" ("userId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_user_subscription_user_id"`);
    await queryRunner.query(
      `ALTER TABLE "user_subscription" ALTER COLUMN "userId" TYPE uuid USING "userId"::uuid`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "idx_user_subscription_user_id" ON "user_subscription" ("userId")`,
    );
  }
}
