import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSafeScopeSnapshotEquipmentReasoning1792000000000 implements MigrationInterface {
  name = 'AddSafeScopeSnapshotEquipmentReasoning1792000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "safescope_reasoning_snapshots" ADD COLUMN IF NOT EXISTS "equipmentReasoningSummary" jsonb`);
    await queryRunner.query(`ALTER TABLE "safescope_reasoning_snapshots" ADD COLUMN IF NOT EXISTS "equipmentTaskMechanismContext" jsonb`);
    await queryRunner.query(`ALTER TABLE "safescope_reasoning_snapshots" ADD COLUMN IF NOT EXISTS "equipmentArchetypeContext" jsonb`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "safescope_reasoning_snapshots" DROP COLUMN IF EXISTS "equipmentArchetypeContext"`);
    await queryRunner.query(`ALTER TABLE "safescope_reasoning_snapshots" DROP COLUMN IF EXISTS "equipmentTaskMechanismContext"`);
    await queryRunner.query(`ALTER TABLE "safescope_reasoning_snapshots" DROP COLUMN IF EXISTS "equipmentReasoningSummary"`);
  }
}
