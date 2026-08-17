import { MigrationInterface, QueryRunner } from 'typeorm';

export class HazLenzAnalysisConcurrency1800000005000 implements MigrationInterface {
  name = 'HazLenzAnalysisConcurrency1800000005000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "hazlenz_analyses"
      ADD COLUMN IF NOT EXISTS "idempotencyKey" varchar(128),
      ADD COLUMN IF NOT EXISTS "requestVersion" integer,
      ADD COLUMN IF NOT EXISTS "status" varchar(24) NOT NULL DEFAULT 'current'
    `);
    await queryRunner.query(`
      WITH ranked AS (
        SELECT id,
          row_number() OVER (PARTITION BY "observationId" ORDER BY "createdAt", id) AS version,
          count(*) OVER (PARTITION BY "observationId") AS total
        FROM "hazlenz_analyses"
      )
      UPDATE "hazlenz_analyses" analysis
      SET "requestVersion" = ranked.version,
          "idempotencyKey" = 'legacy-' || analysis.id::text,
          "status" = CASE WHEN ranked.version = ranked.total THEN 'current' ELSE 'superseded' END
      FROM ranked WHERE ranked.id = analysis.id
    `);
    await queryRunner.query(`ALTER TABLE "hazlenz_analyses" ALTER COLUMN "idempotencyKey" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "hazlenz_analyses" ALTER COLUMN "requestVersion" SET NOT NULL`);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "uq_hazlenz_analysis_observation_idempotency"
      ON "hazlenz_analyses" ("observationId", "idempotencyKey")
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "uq_hazlenz_analysis_observation_version"
      ON "hazlenz_analyses" ("observationId", "requestVersion")
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "uq_hazlenz_analysis_current"
      ON "hazlenz_analyses" ("observationId") WHERE "status" = 'current'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "uq_hazlenz_analysis_current"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "uq_hazlenz_analysis_observation_version"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "uq_hazlenz_analysis_observation_idempotency"`);
    await queryRunner.query(`
      ALTER TABLE "hazlenz_analyses"
      DROP COLUMN IF EXISTS "status",
      DROP COLUMN IF EXISTS "requestVersion",
      DROP COLUMN IF EXISTS "idempotencyKey"
    `);
  }
}
