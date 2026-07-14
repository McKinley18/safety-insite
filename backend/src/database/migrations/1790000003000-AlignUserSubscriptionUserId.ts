import { MigrationInterface, QueryRunner } from "typeorm";

export class AlignUserSubscriptionUserId1790000003000 implements MigrationInterface {
  name = "AlignUserSubscriptionUserId1790000003000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.assertUserSubscriptionTableExists(queryRunner);
    await this.assertNoDuplicateStripeCustomerIds(queryRunner);

    const userIdColumn = await this.getUserIdColumn(queryRunner);
    if (userIdColumn.data_type !== "character varying" || Number(userIdColumn.character_maximum_length) !== 64) {
      await queryRunner.query(`
        ALTER TABLE "user_subscription"
        ALTER COLUMN "userId" TYPE character varying(64)
        USING "userId"::text
      `);
    }

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_user_subscription_stripe_customer_id"
      ON "user_subscription" ("stripeCustomerId")
      WHERE "stripeCustomerId" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await this.assertUserSubscriptionTableExists(queryRunner);
    await this.assertAllUserIdsAreUuidCompatible(queryRunner);

    await queryRunner.query(`DROP INDEX IF EXISTS "idx_user_subscription_stripe_customer_id"`);

    const userIdColumn = await this.getUserIdColumn(queryRunner);
    if (userIdColumn.data_type !== "uuid") {
      await queryRunner.query(`
        ALTER TABLE "user_subscription"
        ALTER COLUMN "userId" TYPE uuid
        USING "userId"::uuid
      `);
    }
  }

  private async assertUserSubscriptionTableExists(queryRunner: QueryRunner): Promise<void> {
    const result = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = current_schema()
          AND table_name = 'user_subscription'
      ) AS "exists"
    `);

    if (!result?.[0]?.exists) {
      throw new Error('Migration AlignUserSubscriptionUserId requires table "user_subscription" to exist.');
    }
  }

  private async getUserIdColumn(queryRunner: QueryRunner): Promise<{ data_type: string; character_maximum_length: number | null }> {
    const result = await queryRunner.query(`
      SELECT data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_schema = current_schema()
        AND table_name = 'user_subscription'
        AND column_name = 'userId'
      LIMIT 1
    `);

    if (!result?.[0]) {
      throw new Error('Migration AlignUserSubscriptionUserId requires column "user_subscription"."userId" to exist.');
    }

    return result[0];
  }

  private async assertNoDuplicateStripeCustomerIds(queryRunner: QueryRunner): Promise<void> {
    const duplicates = await queryRunner.query(`
      SELECT "stripeCustomerId", COUNT(*)::int AS count
      FROM "user_subscription"
      WHERE "stripeCustomerId" IS NOT NULL
      GROUP BY "stripeCustomerId"
      HAVING COUNT(*) > 1
      ORDER BY COUNT(*) DESC, "stripeCustomerId"
      LIMIT 5
    `);

    if (duplicates.length > 0) {
      const details = duplicates
        .map((row: any) => `${this.maskStripeCustomerId(row.stripeCustomerId)} (${row.count})`)
        .join(", ");
      throw new Error(
        `Cannot create unique Stripe customer index for user_subscription: duplicate non-null stripeCustomerId values exist: ${details}. Resolve duplicate subscription ownership before running this migration.`,
      );
    }
  }

  private async assertAllUserIdsAreUuidCompatible(queryRunner: QueryRunner): Promise<void> {
    const invalid = await queryRunner.query(`
      SELECT "userId"
      FROM "user_subscription"
      WHERE "userId" IS NOT NULL
        AND "userId"::text !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
      LIMIT 5
    `);

    if (invalid.length > 0) {
      throw new Error(
        `Cannot roll back user_subscription.userId to uuid: ${invalid.length} sampled row(s) contain non-UUID user identifiers. Preserve varchar user IDs or migrate those records before down migration.`,
      );
    }
  }

  private maskStripeCustomerId(value: unknown): string {
    const raw = String(value || "");
    if (raw.length <= 8) return "[masked]";
    return `${raw.slice(0, 4)}...${raw.slice(-4)}`;
  }
}
