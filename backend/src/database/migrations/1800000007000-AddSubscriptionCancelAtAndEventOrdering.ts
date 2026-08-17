import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSubscriptionCancelAtAndEventOrdering1800000007000
  implements MigrationInterface
{
  name = 'AddSubscriptionCancelAtAndEventOrdering1800000007000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_subscription" ADD COLUMN IF NOT EXISTS "cancelAt" timestamptz`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_subscription" ADD COLUMN IF NOT EXISTS "lastStripeEventAt" timestamptz`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_subscription" DROP COLUMN IF EXISTS "cancelAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_subscription" DROP COLUMN IF EXISTS "lastStripeEventAt"`,
    );
  }
}
