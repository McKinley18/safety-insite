import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserSubscription1790000002000 implements MigrationInterface {
  name = "CreateUserSubscription1790000002000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_subscription" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "stripeCustomerId" character varying(255),
        "stripeSubscriptionId" character varying(255),
        "stripePriceId" character varying(255),
        "tier" character varying(32) NOT NULL DEFAULT 'free',
        "status" character varying(32) NOT NULL DEFAULT 'none',
        "currentPeriodStart" TIMESTAMP WITH TIME ZONE,
        "currentPeriodEnd" TIMESTAMP WITH TIME ZONE,
        "cancelAtPeriodEnd" boolean NOT NULL DEFAULT false,
        "lastStripeEventId" character varying(255),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_subscription_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_user_subscription_user_id"
      ON "user_subscription" ("userId")
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_user_subscription_stripe_subscription_id"
      ON "user_subscription" ("stripeSubscriptionId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_user_subscription_stripe_subscription_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_user_subscription_user_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_subscription"`);
  }
}
