import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * §304 (SE-6) — MAKE THE MIGRATION HISTORY DESCRIBE THE INVITATION RELATIONSHIP THAT ACTUALLY WORKS.
 *
 * ===============================================================================================
 * WHAT SE-6 REALLY IS, WHICH IS NOT WHAT §303 RECORDED.
 *
 * §303 registered SE-6 as "GET /auth/verify-invite/:token returns 500 in production for every
 * token". §304 measured production directly and that is FALSE. In production the route answers
 * `404 {"message":"Invalid or expired invitation token"}`, because production's
 * `invitation."organizationId"` is ALREADY `uuid` and already carries a foreign key to
 * `organization("id")`. Team invitation is NOT a non-functional feature in production.
 *
 * The 500 is real, and it reproduces on every database BUILT FROM THIS MIGRATION HISTORY:
 * `1779000000000-CreateAuthWorkspaceTables` declares the column `character varying`, while the
 * entity relates it to `organization.id`, which is `uuid`. The relation join therefore emits
 * `organization."id" = invitation."organizationId"` and PostgreSQL refuses it with
 * `operator does not exist: uuid = character varying`.
 *
 * Production escapes it only by accident of history: its `invitation` table was created by TypeORM
 * `synchronize` BEFORE migrations were baselined over the existing schema, and synchronize inferred
 * `uuid` correctly from the `@ManyToOne`. The constraint names prove it —
 * `PK_beb994737756c0f18a1c1f8669c` and `FK_5c00d7d515395f91bd1fee19f32` are TypeORM-generated,
 * whereas the hand-written migration names its constraints `PK_invitation_id` and
 * `UQ_invitation_token`.
 *
 * So the defect is that the MIGRATION HISTORY DOES NOT DESCRIBE PRODUCTION. Every disposable
 * verification database gets the broken shape, and so would any environment ever rebuilt from
 * migrations — including a restore that replays history rather than a dump.
 *
 * ===============================================================================================
 * THIS MIGRATION IS A NO-OP IN PRODUCTION, AND THE REPAIR ON A CLEAN DATABASE.
 *
 * Every statement below is written to converge on one shape from either starting point:
 *
 *   - production already has the uuid column, the index and the FK  -> nothing changes but the
 *     explicit `ON DELETE RESTRICT` and the token uniqueness constraint;
 *   - a migration-built database has varchar, no FK               -> it is converted and bound.
 *
 * Which is why it is safe to apply to production and necessary to apply to everything else.
 *
 * ===============================================================================================
 * WHY THE CONVERSION IS GUARDED RATHER THAN CAST BLINDLY.
 *
 * `ALTER COLUMN ... TYPE uuid USING "organizationId"::uuid` fails loudly on the first row it cannot
 * parse, which is the correct behaviour — but it fails in the middle of a migration rather than
 * before it starts. The guard below counts unparseable rows FIRST and raises a message that names
 * the count and nothing else, so an operator learns the size and shape of the problem without any
 * invitation token, email address or organization name reaching a log. §304 measured production at
 * ZERO invitation rows, so on the authorised target this branch cannot fire at all.
 *
 * ===============================================================================================
 * FOREIGN KEY POLICY: `ON DELETE RESTRICT`, DECIDED RATHER THAN INHERITED.
 *
 * An invitation is a membership-granting credential. If an organization could be deleted out from
 * under its outstanding invitations, those invitations would either dangle — pointing at an
 * organization id that could later be reissued — or, with CASCADE, disappear silently along with
 * the evidence that they were ever issued. Neither is acceptable for a credential, so deleting an
 * organization that still has invitations must FAIL and force the operator to deal with them.
 *
 * `RESTRICT` is not invented here. It is the policy every canonically-modelled table already uses
 * against `organization("id")`: `organization_memberships`, `site`, `inspection` and
 * `corrective_actions` were all given `ON DELETE RESTRICT` by `1800000000000`. Production's
 * existing invitation FK has no explicit action — the SQL default, `NO ACTION` — which enforces the
 * same prohibition but defers the check; making it RESTRICT states the intent in the schema and
 * matches its siblings. `ON UPDATE` stays `NO ACTION` because an organization's primary key is a
 * generated uuid and is never mutated.
 *
 * ===============================================================================================
 * THE UNIQUE CONSTRAINT ON `token` IS A CONVERGENCE, NOT AN ADDITION.
 *
 * `1779000000000` declares `UQ_invitation_token`; production does not have it, because synchronize
 * built the table from an entity whose `token` column declares no uniqueness. Tokens are 16 random
 * bytes so a collision is not a practical concern, but `verifyInvitation` does `findOne` by token,
 * and "findOne over a column that is not unique" is a silent non-determinism rather than a
 * near-impossibility. With ZERO invitation rows in production this costs nothing to establish and
 * makes the lookup's assumption true by construction.
 */
export class AlignInvitationOrganizationRelation1800000024000 implements MigrationInterface {
  name = 'AlignInvitationOrganizationRelation1800000024000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const [{ data_type: currentType }] = await queryRunner.query(`
      SELECT data_type FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'invitation' AND column_name = 'organizationId'
    `);

    if (currentType !== 'uuid') {
      /*
       * Count first, convert second. The count names a quantity and never a value: no token, no
       * email address, no organization name is read, let alone logged.
       */
      const [{ bad }] = await queryRunner.query(`
        SELECT count(*)::int AS bad FROM "invitation"
        WHERE "organizationId" IS NOT NULL
          AND "organizationId" !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      `);
      if (bad > 0) {
        throw new Error(
          `§304 SE-6: refusing to convert "invitation"."organizationId" to uuid — ${bad} row(s) ` +
          'hold a value that is not valid UUID syntax. These rows are NOT deleted and NOT altered. ' +
          'Resolve them deliberately and re-run; this migration will not guess what they meant.',
        );
      }

      const [{ orphans }] = await queryRunner.query(`
        SELECT count(*)::int AS orphans FROM "invitation" i
        WHERE i."organizationId" IS NOT NULL
          AND i."organizationId" ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
          AND NOT EXISTS (SELECT 1 FROM "organization" o WHERE o."id" = i."organizationId"::uuid)
      `);
      if (orphans > 0) {
        throw new Error(
          `§304 SE-6: refusing to add the foreign key — ${orphans} invitation row(s) reference an ` +
          'organization that does not exist. Deleting them would destroy evidence that an ' +
          'invitation was issued, and inventing an organization for them would be a guess. ' +
          'Resolve them deliberately and re-run.',
        );
      }

      await queryRunner.query(`
        ALTER TABLE "invitation"
        ALTER COLUMN "organizationId" TYPE uuid USING "organizationId"::uuid
      `);
    }

    /*
     * The FK is dropped and recreated only when its definition is not already the one intended.
     * Production's is `FOREIGN KEY ("organizationId") REFERENCES organization(id)` with no explicit
     * action, so it is replaced once, here, by the same reference with RESTRICT stated out loud.
     */
    const existing: Array<{ conname: string; def: string }> = await queryRunner.query(`
      SELECT con.conname, pg_get_constraintdef(con.oid) AS def
      FROM pg_constraint con
      JOIN pg_class rel ON rel.oid = con.conrelid
      JOIN pg_namespace n ON n.oid = rel.relnamespace
      WHERE n.nspname = 'public' AND rel.relname = 'invitation' AND con.contype = 'f'
    `);
    const intended = 'FOREIGN KEY ("organizationId") REFERENCES organization(id) ON DELETE RESTRICT';
    for (const fk of existing) {
      if (fk.def !== intended) {
        await queryRunner.query(`ALTER TABLE "invitation" DROP CONSTRAINT "${fk.conname}"`);
      }
    }
    if (!existing.some((fk) => fk.def === intended)) {
      await queryRunner.query(`
        ALTER TABLE "invitation"
        ADD CONSTRAINT "FK_invitation_organization"
        FOREIGN KEY ("organizationId") REFERENCES "organization" ("id")
        ON DELETE RESTRICT ON UPDATE NO ACTION
      `);
    }

    /*
     * `getInvitations` filters by organizationId on every read, and a foreign key does not create an
     * index on the referencing side. Production already has this index under the same name, so this
     * is a no-op there.
     */
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_invitation_organization_id" ON "invitation" ("organizationId")
    `);

    /*
     * `verifyInvitation` looks a single invitation up by token. Make that lookup's assumption true.
     * A unique INDEX rather than a constraint, so `IF NOT EXISTS` applies and the statement is
     * replayable against a database that already has it under either name.
     */
    const [{ present }] = await queryRunner.query(`
      SELECT count(*)::int AS present FROM pg_constraint con
      JOIN pg_class rel ON rel.oid = con.conrelid
      JOIN pg_namespace n ON n.oid = rel.relnamespace
      WHERE n.nspname = 'public' AND rel.relname = 'invitation'
        AND con.contype = 'u' AND pg_get_constraintdef(con.oid) = 'UNIQUE ("token")'
    `);
    if (present === 0) {
      await queryRunner.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS "uq_invitation_token" ON "invitation" ("token")
      `);
    }
  }

  /**
   * WHAT `down` RESTORES, AND WHAT IT DELIBERATELY DOES NOT.
   *
   * It removes what this migration added: the RESTRICT foreign key and the token unique index. It
   * does NOT convert `organizationId` back to `character varying`.
   *
   * That omission is the honest part. Reverting the type would recreate SE-6 — the relation join
   * would start failing again — so a `down` that "restored" varchar would be restoring a defect, on
   * a schema production has never had. Worse, it would not be symmetric: production's column was
   * uuid before this migration existed, so reverting it would move production somewhere it has
   * never been, which is not a rollback.
   *
   * Per the rollback model in `project-docs/operations/BACKUP-AND-RESTORE.md`: a wrong migration is
   * preferably fixed forward, and where the schema genuinely must go back, the recorded pre-migration
   * backup is the reliable path — not this function.
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "uq_invitation_token"`);
    await queryRunner.query(`
      ALTER TABLE "invitation" DROP CONSTRAINT IF EXISTS "FK_invitation_organization"
    `);
  }
}
