import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAuthWorkspaceTables1779000000000 implements MigrationInterface {
  name = "CreateAuthWorkspaceTables1779000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "organization" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "logoPath" character varying,
        "riskProfileId" character varying NOT NULL DEFAULT 'standard_5x5',
        "planCode" character varying NOT NULL DEFAULT 'basic',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_organization_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user" (
        "id" SERIAL NOT NULL,
        "name" character varying NOT NULL,
        "email" character varying NOT NULL,
        "password" character varying NOT NULL,
        "type" character varying NOT NULL,
        "planCode" character varying NOT NULL DEFAULT 'basic',
        "role" character varying NOT NULL DEFAULT 'Auditor',
        "subscriptionStatus" character varying NOT NULL DEFAULT 'active',
        "nextBillingDate" TIMESTAMP,
        "deletedAt" TIMESTAMP,
        "organizationId" character varying,
        CONSTRAINT "PK_user_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_email" UNIQUE ("email")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "invitation" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "token" character varying NOT NULL,
        "role" character varying NOT NULL DEFAULT 'Auditor',
        "organizationId" character varying NOT NULL,
        "isUsed" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_invitation_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_invitation_token" UNIQUE ("token")
      )
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_user_organization_id" ON "user" ("organizationId")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_invitation_organization_id" ON "invitation" ("organizationId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_invitation_organization_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_user_organization_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "invitation"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "organization"`);
  }
}
