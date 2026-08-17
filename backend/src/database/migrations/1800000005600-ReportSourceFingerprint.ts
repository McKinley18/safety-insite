import { MigrationInterface, QueryRunner } from 'typeorm';

export class ReportSourceFingerprint1800000005600 implements MigrationInterface {
  name = 'ReportSourceFingerprint1800000005600';
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "inspection_report_versions" ADD COLUMN IF NOT EXISTS "sourceFingerprint" char(64)`);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "uq_report_source_fingerprint" ON "inspection_report_versions" ("reportId", "sourceFingerprint") WHERE "sourceFingerprint" IS NOT NULL`);
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "uq_report_source_fingerprint"`);
    await queryRunner.query(`ALTER TABLE "inspection_report_versions" DROP COLUMN IF EXISTS "sourceFingerprint"`);
  }
}
