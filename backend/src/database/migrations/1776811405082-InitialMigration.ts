import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1776811405082 implements MigrationInterface {
    name = 'InitialMigration1776811405082'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "reports" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "siteId" character varying NOT NULL, "sourceType" character varying, "eventDatetime" TIMESTAMP NOT NULL, "reportedDatetime" TIMESTAMP NOT NULL, "eventTypeCode" character varying NOT NULL, "title" character varying NOT NULL, "narrative" text NOT NULL, "intakeStatus" character varying NOT NULL DEFAULT 'received', "aiStatus" character varying, "reportStatus" character varying NOT NULL DEFAULT 'open', "confidenceScore" double precision, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d9013193989303580053c0b5ef6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "classifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "reportId" character varying NOT NULL, "classifierType" character varying NOT NULL, "classifierVersion" character varying NOT NULL, "classificationStatus" character varying NOT NULL DEFAULT 'pending', "eventTypeCode" character varying NOT NULL, "hazardCategoryCode" character varying, "hazardSubcategoryCode" character varying, "rootCauseCategoryCode" character varying, "rootCauseSubcategoryCode" character varying, "severityLevel" character varying, "likelihoodLevel" character varying, "areaTypeCode" character varying, "regulationRefs" text, "extractedEntities" text, "reasoningSummary" text, "confidenceScore" double precision NOT NULL DEFAULT '0', "requiresHumanReview" boolean NOT NULL DEFAULT false, "reviewedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_58d976e264f75fc0ea006718856" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "actorUserId" character varying, "entityType" character varying NOT NULL, "entityId" character varying NOT NULL, "actionCode" character varying NOT NULL, "beforeJson" text, "afterJson" text, "metadataJson" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "reviews" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "reportId" character varying NOT NULL, "classificationId" character varying NOT NULL, "reviewerUserId" character varying, "reviewAction" character varying NOT NULL, "notes" text, "beforeSnapshot" text, "afterSnapshot" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_231ae565c273ee700b283f15c1d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "risk_scores" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "reportId" character varying NOT NULL, "classificationId" character varying NOT NULL, "severityScore" integer NOT NULL, "recurrenceScore" integer NOT NULL, "trendScore" integer NOT NULL, "controlFailureScore" integer NOT NULL, "confidenceModifier" double precision NOT NULL, "compositeRiskScore" integer NOT NULL, "riskBand" character varying NOT NULL, "calculatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ac76f1fbfc456572b6ed51abe8f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "corrective_actions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "reportId" character varying NOT NULL, "classificationId" character varying, "title" character varying NOT NULL, "description" text NOT NULL, "ownerUserId" character varying, "priorityCode" character varying NOT NULL, "statusCode" character varying NOT NULL DEFAULT 'open', "dueDate" TIMESTAMP, "closureNotes" text, "verifiedByUserId" character varying, "verifiedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b1382eccccc5ca8d821e3688ade" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "corrective_actions"`);
        await queryRunner.query(`DROP TABLE "risk_scores"`);
        await queryRunner.query(`DROP TABLE "reviews"`);
        await queryRunner.query(`DROP TABLE "audit_logs"`);
        await queryRunner.query(`DROP TABLE "classifications"`);
        await queryRunner.query(`DROP TABLE "reports"`);
    }

}
