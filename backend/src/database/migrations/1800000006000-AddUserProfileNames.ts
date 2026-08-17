import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserProfileNames1800000006000 implements MigrationInterface {
  name = 'AddUserProfileNames1800000006000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "firstName" varchar`);
    await queryRunner.query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "lastName" varchar`);

    await queryRunner.query(`
      UPDATE "user"
      SET
        "firstName" = NULLIF(split_part(trim("name"), ' ', 1), ''),
        "lastName" = NULLIF(trim(substring(trim("name") FROM length(split_part(trim("name"), ' ', 1)) + 1)), '')
      WHERE "firstName" IS NULL AND "lastName" IS NULL AND "name" IS NOT NULL AND trim("name") <> ''
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN IF EXISTS "firstName"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN IF EXISTS "lastName"`);
  }
}
