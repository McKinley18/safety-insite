import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * §291 (SU-1 / SU-3) — SOMEWHERE TO PUT THE EVIDENCE.
 *
 * ADDITIVE AND OLD-CODE-SAFE. One new table and one unique index. Nothing existing is touched, no
 * column is retyped, no row is rewritten, and a build that predates this migration is unaffected
 * because it never reads the table. The deployment order is therefore the ordinary one -- migrate,
 * then deploy -- and a rollback of the application over a forward schema is safe.
 *
 * WHY THE UNIQUE INDEX IS PART OF THE CONTRACT, NOT AN OPTIMISATION. Accepting the same version of
 * the same agreement twice is one fact, not two. Enforcing that in the database rather than in the
 * service is what makes the accept route idempotent under a lost-response retry even when two
 * requests race -- the loser reads the winner's row instead of writing a second one.
 *
 * WHY THE `down` IS SAFE HERE, UNLIKE 019000. Dropping this table destroys consent evidence, which
 * is exactly the kind of record the rollback model says must never be destroyed to restore older
 * code. It is written for the pre-data case only: the guard refuses outright once any acceptance
 * exists, so it cannot be run casually against a database that has served real users.
 */
export class AgreementAcceptance1800000023000 implements MigrationInterface {
  name = 'AgreementAcceptance1800000023000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "agreement_acceptances" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL,
        "organizationId" uuid NULL,
        "agreementId" character varying(128) NOT NULL,
        "agreementVersion" character varying(64) NOT NULL,
        "documentDigest" character varying(64) NOT NULL,
        "counselStatusAtAcceptance" character varying(64) NOT NULL,
        "acceptedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "acceptanceChannel" character varying(32) NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_agreement_acceptances" PRIMARY KEY ("id")
      )
    `);

    // One acceptance per user per agreement per version. See the note above.
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "uq_agreement_acceptance_user_version"
        ON "agreement_acceptances" ("userId", "agreementId", "agreementVersion")
    `);

    // The evidence question is almost always "what has THIS user accepted", asked in acceptance
    // order, so the index that answers it is created with the table rather than after the first
    // slow query in production.
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_agreement_acceptance_user_accepted"
        ON "agreement_acceptances" ("userId", "acceptedAt" DESC)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const [existing] = await queryRunner.query(
      `SELECT count(*)::int AS n FROM "agreement_acceptances"`,
    );
    if (Number(existing?.n ?? 0) > 0) {
      throw new Error('AGREEMENT_ACCEPTANCE_291_DOWN_REFUSED: '
        + `${existing.n} recorded acceptance(s) would be destroyed. A consent record is evidence `
        + 'that a named person accepted a named document on a date, and it is not recoverable by '
        + 're-running anything. Resolve those rows deliberately before reverting.');
    }
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_agreement_acceptance_user_accepted"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "uq_agreement_acceptance_user_version"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "agreement_acceptances"`);
  }
}
