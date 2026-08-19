import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Inspection-level regulatory context (OSHA General Industry / OSHA Construction /
 * MSHA / unknown), established once at inspection setup and inherited by every
 * observation and finding. Defaults to 'unknown' so pre-existing inspections keep
 * their prior "let HazLenz determine" behaviour unchanged.
 */
export class InspectionRegulatoryContext1800000009000 implements MigrationInterface {
  name = 'InspectionRegulatoryContext1800000009000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "inspection" ADD COLUMN IF NOT EXISTS "regulatoryContext" varchar(32) NOT NULL DEFAULT 'unknown'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "inspection" DROP COLUMN IF EXISTS "regulatoryContext"`);
  }
}
