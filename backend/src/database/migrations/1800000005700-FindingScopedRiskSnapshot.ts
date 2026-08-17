import { MigrationInterface, QueryRunner } from 'typeorm';

export class FindingScopedRiskSnapshot1800000005700 implements MigrationInterface {
  name = 'FindingScopedRiskSnapshot1800000005700';
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "inspection_findings" ADD COLUMN IF NOT EXISTS "riskSnapshot" jsonb NULL`);
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "inspection_findings" DROP COLUMN IF EXISTS "riskSnapshot"`);
  }
}
