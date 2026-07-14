import { QueryRunner } from "typeorm";
import { dataSource } from "../database/data-source";
import { CreateUserSubscription1790000002000 } from "../database/migrations/1790000002000-CreateUserSubscription";
import { AlignUserSubscriptionUserId1790000003000 } from "../database/migrations/1790000003000-AlignUserSubscriptionUserId";

const createMigration = new CreateUserSubscription1790000002000();
const alignMigration = new AlignUserSubscriptionUserId1790000003000();
const uuidA = "11111111-1111-4111-8111-111111111111";
const uuidB = "22222222-2222-4222-8222-222222222222";

async function withSchema(name: string, run: (queryRunner: QueryRunner) => Promise<void>) {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.query(`CREATE SCHEMA "${name}"`);
  await queryRunner.query(`SET search_path TO "${name}", public`);
  try {
    await run(queryRunner);
    console.log(`PASS ${name}`);
  } finally {
    await queryRunner.query(`SET search_path TO public`);
    await queryRunner.query(`DROP SCHEMA IF EXISTS "${name}" CASCADE`);
    await queryRunner.release();
  }
}

async function insertSubscription(queryRunner: QueryRunner, userId: string, stripeCustomerId?: string | null) {
  await queryRunner.query(
    `
      INSERT INTO "user_subscription" ("userId", "tier", "status", "stripeCustomerId")
      VALUES ($1, 'free', 'none', $2)
    `,
    [userId, stripeCustomerId ?? null],
  );
}

async function assertUserIdType(queryRunner: QueryRunner, expectedType: string) {
  const rows = await queryRunner.query(`
    SELECT data_type, character_maximum_length
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'user_subscription'
      AND column_name = 'userId'
  `);
  const row = rows[0];
  if (!row || row.data_type !== expectedType) {
    throw new Error(`Expected userId type ${expectedType}, received ${row?.data_type || "missing"}.`);
  }
}

async function assertValue(queryRunner: QueryRunner, sql: string, expected: unknown) {
  const rows = await queryRunner.query(sql);
  const actual = Object.values(rows[0] || {})[0];
  if (String(actual) !== String(expected)) {
    throw new Error(`Expected ${expected}, received ${actual}.`);
  }
}

async function expectFailure(label: string, run: () => Promise<void>, expectedMessage: RegExp) {
  try {
    await run();
  } catch (error) {
    const message = String((error as Error).message || error);
    if (!expectedMessage.test(message)) {
      throw new Error(`${label} failed with unexpected error: ${message}`);
    }
    console.log(`PASS ${label}`);
    return;
  }
  throw new Error(`${label} should have failed.`);
}

async function validateFreshSequence() {
  await withSchema("billing_migration_fresh_sequence", async (queryRunner) => {
    await createMigration.up(queryRunner);
    await insertSubscription(queryRunner, uuidA, null);
    await alignMigration.up(queryRunner);
    await assertUserIdType(queryRunner, "character varying");
    await insertSubscription(queryRunner, "local-dev-user", "cus_unique_local");
    await assertValue(queryRunner, `SELECT COUNT(*)::int FROM "user_subscription"`, 2);
  });
}

async function validateUpgradeFromUuid() {
  await withSchema("billing_migration_upgrade_uuid", async (queryRunner) => {
    await createMigration.up(queryRunner);
    await insertSubscription(queryRunner, uuidA, "cus_unique_a");
    await alignMigration.up(queryRunner);
    await assertUserIdType(queryRunner, "character varying");
    await assertValue(queryRunner, `SELECT "userId" FROM "user_subscription" WHERE "stripeCustomerId" = 'cus_unique_a'`, uuidA);
  });
}

async function validateAlreadyVarchar() {
  await withSchema("billing_migration_already_varchar", async (queryRunner) => {
    await createMigration.up(queryRunner);
    await queryRunner.query(`
      ALTER TABLE "user_subscription"
      ALTER COLUMN "userId" TYPE character varying(64)
      USING "userId"::text
    `);
    await insertSubscription(queryRunner, "external-auth-user", "cus_unique_b");
    await alignMigration.up(queryRunner);
    await assertUserIdType(queryRunner, "character varying");
    await assertValue(queryRunner, `SELECT "userId" FROM "user_subscription" WHERE "stripeCustomerId" = 'cus_unique_b'`, "external-auth-user");
  });
}

async function validateDuplicateStripeCustomerDiagnostic() {
  await withSchema("billing_migration_duplicate_customer", async (queryRunner) => {
    await createMigration.up(queryRunner);
    await insertSubscription(queryRunner, uuidA, "cus_duplicate");
    await insertSubscription(queryRunner, uuidB, "cus_duplicate");
    await expectFailure(
      "duplicate Stripe customer diagnostic",
      () => alignMigration.up(queryRunner),
      /duplicate non-null stripeCustomerId/i,
    );
  });
}

async function validateRollback() {
  await withSchema("billing_migration_rollback", async (queryRunner) => {
    await createMigration.up(queryRunner);
    await insertSubscription(queryRunner, uuidA, "cus_rollback");
    await alignMigration.up(queryRunner);
    await alignMigration.down(queryRunner);
    await assertUserIdType(queryRunner, "uuid");
    await assertValue(queryRunner, `SELECT "userId"::text FROM "user_subscription" WHERE "stripeCustomerId" = 'cus_rollback'`, uuidA);
  });
}

async function validateRollbackDiagnosticForNonUuidUser() {
  await withSchema("billing_migration_rollback_non_uuid", async (queryRunner) => {
    await createMigration.up(queryRunner);
    await alignMigration.up(queryRunner);
    await insertSubscription(queryRunner, "local-dev-user", "cus_non_uuid");
    await expectFailure(
      "rollback non-UUID diagnostic",
      () => alignMigration.down(queryRunner),
      /non-UUID user identifiers/i,
    );
  });
}

async function run() {
  await dataSource.initialize();
  try {
    await validateFreshSequence();
    await validateUpgradeFromUuid();
    await validateAlreadyVarchar();
    await validateDuplicateStripeCustomerDiagnostic();
    await validateRollback();
    await validateRollbackDiagnosticForNonUuidUser();
    console.log("Billing migration validation: 6 passed, 0 failed");
  } finally {
    await dataSource.destroy();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
