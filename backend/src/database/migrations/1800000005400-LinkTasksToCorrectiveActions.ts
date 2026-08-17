import { MigrationInterface, QueryRunner } from 'typeorm';

export class LinkTasksToCorrectiveActions1800000005400 implements MigrationInterface {
  name = 'LinkTasksToCorrectiveActions1800000005400';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "correctiveActionId" uuid NULL`);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_task_corrective_action') THEN
          ALTER TABLE "tasks" ADD CONSTRAINT "fk_task_corrective_action"
            FOREIGN KEY ("correctiveActionId") REFERENCES "corrective_actions"("id") ON DELETE RESTRICT;
        END IF;
      END $$;
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_task_corrective_action" ON "tasks" ("correctiveActionId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_task_corrective_action"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT IF EXISTS "fk_task_corrective_action"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN IF EXISTS "correctiveActionId"`);
  }
}
