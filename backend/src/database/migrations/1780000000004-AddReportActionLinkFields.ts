import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReportActionLinkFields1780000000004 implements MigrationInterface {
  name = 'AddReportActionLinkFields1780000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "corrective_actions" ADD COLUMN IF NOT EXISTS "findingId" character varying`);
    await queryRunner.query(`ALTER TABLE "corrective_actions" ADD COLUMN IF NOT EXISTS "source" character varying`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_corrective_actions_report_finding" ON "corrective_actions" ("reportId", "findingId")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_corrective_actions_org_status" ON "corrective_actions" ("organizationId", "statusCode")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_corrective_actions_org_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_corrective_actions_report_finding"`);
    await queryRunner.query(`ALTER TABLE "corrective_actions" DROP COLUMN IF EXISTS "source"`);
    await queryRunner.query(`ALTER TABLE "corrective_actions" DROP COLUMN IF EXISTS "findingId"`);
  }
}
