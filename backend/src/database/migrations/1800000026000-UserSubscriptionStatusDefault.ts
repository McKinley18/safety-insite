import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * §310 (SC-4, narrow member) — THE `user.subscriptionStatus` DEFAULT STOPS SAYING `active`.
 *
 * ===============================================================================================
 * WHAT WAS MEASURED, AND WHY IT IS A SAFETY-OF-ENTITLEMENT DEFECT RATHER THAN AN UNTIDY DEFAULT.
 *
 * The canonical database declares:
 *
 *     "subscriptionStatus" character varying NOT NULL DEFAULT 'active'::character varying
 *
 * while the entity has always declared `@Column({ default: 'none' })`. §309 recorded the
 * difference in the entity-contract ledger rather than repairing it, because repairing a DEFAULT
 * requires a migration and §309 was explicitly scoped to entity-only metadata corrections.
 *
 * The consequence was measured directly, not inferred. An INSERT into `user` that omits
 * `subscriptionStatus` — which is what any code path that builds a user row without going through
 * `AuthService.register` produces — yields a row whose subscription status reads `active`. That is
 * the single value the entitlement layer treats as a paying customer. A default is the value you
 * get when nobody decided, and the value you get when nobody decided must be the SAFE one. Here
 * the unsafe direction was the default: silence granted entitlement.
 *
 * `'none'` is the correct default because it is the state of a user about whom no billing fact is
 * known, and because it is what the entity — and therefore every consumer reading the type — has
 * claimed all along.
 *
 * ===============================================================================================
 * WHAT THIS MIGRATION DELIBERATELY DOES NOT DO.
 *
 * It changes the DEFAULT and NOTHING ELSE. It does not read, rewrite, normalize or audit a single
 * existing row.
 *
 * That restraint is the point. Existing `active` rows are legitimate customer subscription state:
 * some were written explicitly by `AuthService` or by the Stripe webhook handler, and a migration
 * cannot distinguish those from rows that merely inherited the bad default. Guessing would either
 * revoke a paying customer's entitlement or fabricate a billing state — both worse than the defect.
 * The objective is DEFAULT correction, not customer-state normalization.
 *
 * Normal registration was already correct and is unaffected: `AuthService.register` sets `planCode`
 * and `subscriptionStatus` explicitly (§302 / EN-3), so it never relied on the default, and a
 * caller-supplied `subscriptionStatus` is still refused with 400 (BI-4). This migration closes the
 * path where NOBODY supplies a value.
 *
 * ===============================================================================================
 * IT CONVERGES FROM EITHER SIDE.
 *
 * `SET DEFAULT 'none'` is idempotent and correct against production (where the default is
 * currently `'active'`) and against a fresh replay (where the column is created by the §305
 * convergence migration with the same `'active'` default). Applying it twice is a no-op. The
 * column's type and nullability are untouched, so the statement cannot fail on data.
 *
 * `down()` restores `'active'` so the history is honestly reversible, even though reverting
 * reinstates the defect.
 */
export class UserSubscriptionStatusDefault1800000026000 implements MigrationInterface {
  name = 'UserSubscriptionStatusDefault1800000026000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const exists = await queryRunner.query(
      `SELECT 1 FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'user' AND column_name = 'subscriptionStatus'`,
    );
    if (!exists.length) return;

    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "subscriptionStatus" SET DEFAULT 'none'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const exists = await queryRunner.query(
      `SELECT 1 FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'user' AND column_name = 'subscriptionStatus'`,
    );
    if (!exists.length) return;

    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "subscriptionStatus" SET DEFAULT 'active'`,
    );
  }
}
