import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * §267 — PRODUCER-SCOPED ANALYSIS CURRENTNESS. THE ONE THING QUERY REPAIR COULD NOT EXPRESS.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY A MIGRATION EXISTS AT ALL, HAVING BEEN AUTHORIZED ONLY AS A LAST RESORT.
 *
 * §267 authorizes a schema change only where producer-scoped currentness "cannot be correctly
 * expressed with the existing producer + status/state + existing relationships", and directs that
 * query repair be preferred. Query repair WAS attempted first and it is what ships for every read
 * and every supersession decision: `expert-analysis-currentness.ts` scopes both, and no reader asks
 * the ambiguous "newest non-superseded analysis" question any more.
 *
 * It was not sufficient, and the reason is a partial unique index rather than a preference:
 *
 *     uq_hazlenz_analysis_current  UNIQUE ("observationId") WHERE "status" = 'current'
 *
 * created by §5's HazLenzAnalysisConcurrency when `hazlenz_analyses` had ONE producer. It says, in
 * the schema, that an observation has at most one current analysis FULL STOP. Producer-scoped
 * currentness requires exactly two — one deterministic, one Expert — so the repaired code was
 * refused by the database: the §267 suite measured
 * `duplicate key value violates unique constraint "uq_hazlenz_analysis_current"`, surfacing as
 * `PERSISTENCE_FAILED_AFTER_PROVIDER_ANSWERED`. No amount of query scoping can satisfy an index
 * that permits one row where the product needs two.
 *
 * ---------------------------------------------------------------------------------------------
 * IT IS MINIMAL, AND IT LOOSENS NOTHING THAT WAS PROTECTING ANYTHING.
 *
 * The replacement adds `producer` to the index key and changes nothing else — same table, same
 * partial predicate, same uniqueness guarantee, one column narrower in scope:
 *
 *     uq_hazlenz_analysis_current_by_producer
 *       UNIQUE ("observationId", "producer") WHERE "status" = 'current'
 *
 * At most one current DETERMINISTIC analysis per observation, and at most one current EXPERT
 * analysis per observation. The property §5 was protecting — that "the current analysis" is
 * singular and cannot be ambiguous — is preserved exactly; it is now singular per family, which is
 * what "the current analysis" has meant since §261 introduced the second producer. What is removed
 * is only the part that made the two families contend for one slot, which is the §266 defect
 * expressed as an index.
 *
 * NO DATA IS TOUCHED. No column is added, dropped, widened or backfilled; no row is rewritten. Every
 * existing observation has at most one current row, so the new index is satisfied by the data as it
 * stands and its creation cannot fail on existing content.
 *
 * ---------------------------------------------------------------------------------------------
 * ORDERING: THE NEW INDEX IS CREATED BEFORE THE OLD ONE IS DROPPED.
 *
 * The old index is strictly stricter than the new one, so the new one is satisfiable at the moment
 * it is created and there is no instant at which the table is unprotected. Doing it the other way
 * round would open a window in which two current rows per observation could be written.
 *
 * ---------------------------------------------------------------------------------------------
 * `down` CAN LEGITIMATELY FAIL, AND IT SHOULD.
 *
 * Reverting restores the one-current-row-per-observation rule. If any observation has by then
 * acquired both a current deterministic and a current Expert analysis — which is the normal state
 * of an observation that has used Expert — recreating the old index will be refused by Postgres.
 * That refusal is CORRECT and is not repaired here: silently deleting or superseding one of the two
 * to make the revert succeed would destroy a customer-authoritative analysis or an Expert
 * provenance record in order to run a rollback. The revert is only genuinely available while no
 * observation carries both, and the failure says so rather than papering over it.
 */
export class ProducerScopedAnalysisCurrentness1800000021000 implements MigrationInterface {
  name = 'ProducerScopedAnalysisCurrentness1800000021000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "uq_hazlenz_analysis_current_by_producer"
      ON "hazlenz_analyses" ("observationId", "producer") WHERE "status" = 'current'
    `);
    await queryRunner.query(`DROP INDEX IF EXISTS "uq_hazlenz_analysis_current"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // See the header: this is expected to fail on any database where an observation carries both a
    // current deterministic and a current Expert analysis, and that failure is the honest outcome.
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "uq_hazlenz_analysis_current"
      ON "hazlenz_analyses" ("observationId") WHERE "status" = 'current'
    `);
    await queryRunner.query(`DROP INDEX IF EXISTS "uq_hazlenz_analysis_current_by_producer"`);
  }
}
