import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInspectionOrganizationScope1780000000006 implements MigrationInterface {
  name = 'AddInspectionOrganizationScope1780000000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "inspection" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "organizationId" character varying,
        "createdByUserId" character varying,
        "title" character varying NOT NULL,
        "createdAt" timestamp NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "hazard" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "description" character varying NOT NULL,
        "severity" character varying NOT NULL,
        "inspectionId" uuid
      )
    `);

    await queryRunner.query(`ALTER TABLE "inspection" ADD COLUMN IF NOT EXISTS "organizationId" character varying`);
    await queryRunner.query(`ALTER TABLE "inspection" ADD COLUMN IF NOT EXISTS "createdByUserId" character varying`);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'fk_hazard_inspection'
        ) THEN
          ALTER TABLE "hazard"
          ADD CONSTRAINT "fk_hazard_inspection"
          FOREIGN KEY ("inspectionId") REFERENCES "inspection"("id") ON DELETE CASCADE;
        END IF;
      END $$;
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_inspection_organizationId" ON "inspection" ("organizationId")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_hazard_inspection_id" ON "hazard" ("inspectionId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_hazard_inspection_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_inspection_organizationId"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "hazard"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "inspection"`);
  }
}
