
import { DataSource } from "typeorm";
import { config } from "dotenv";
import { SafeScopeKnowledgeDocument } from "../entities/safescope-knowledge-document.entity";
import { SafeScopeKnowledgeChunk } from "../entities/safescope-knowledge-chunk.entity";
import { SafeScopeKnowledgeSource } from "../entities/safescope-knowledge-source.entity";
import { SafeScopeKnowledgeIngestionRun } from "../entities/safescope-knowledge-ingestion-run.entity";
import { SafeScopeKnowledgeRetrievalLog } from "../entities/safescope-knowledge-retrieval-log.entity";
import { NioshMiningPublicationConnector } from "./connectors/niosh-mining-publication.connector";
import { buildSourceRegistryMetadata } from "../sources/source-registry-metadata";
import {
  completeIngestionRun,
  failIngestionRun,
  startIngestionRun,
} from "./ingestion-run-logger";

const NIOSH_METADATA = buildSourceRegistryMetadata("niosh-mining-publications");

config();

function authorityWeight(authorityTier: number) {
  return Number(Math.max(0.1, 1 - (authorityTier - 1) * 0.15).toFixed(2));
}

function chunkSummary(text: string) {
  return text
    .split(/[.!?]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 2)
    .join(". ")
    .slice(0, 280);
}

async function run() {
  const databaseUrl = process.env.DATABASE_URL;

  const dataSource = new DataSource({
    type: "postgres",
    url: databaseUrl || undefined,
    host: databaseUrl ? undefined : process.env.DB_HOST,
    port: databaseUrl ? undefined : Number(process.env.DB_PORT || 5432),
    username: databaseUrl ? undefined : process.env.DB_USERNAME,
    password: databaseUrl ? undefined : process.env.DB_PASSWORD,
    database: databaseUrl ? undefined : process.env.DB_NAME,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
    entities: [
      SafeScopeKnowledgeDocument,
      SafeScopeKnowledgeChunk,
      SafeScopeKnowledgeSource,
      SafeScopeKnowledgeIngestionRun,
      SafeScopeKnowledgeRetrievalLog,
    ],
    synchronize: false,
  });

  await dataSource.initialize();

  const documentRepo = dataSource.getRepository(SafeScopeKnowledgeDocument);
  const chunkRepo = dataSource.getRepository(SafeScopeKnowledgeChunk);
  const runRepo = dataSource.getRepository(SafeScopeKnowledgeIngestionRun);

  const ingestionRun = await startIngestionRun(runRepo, {
    sourceName: NIOSH_METADATA.sourceName,
    agency: NIOSH_METADATA.agency,
    sourceType: NIOSH_METADATA.sourceType,
    metadataJson: {
      connector: "NioshMiningPublicationConnector",
      mode: "governed_pending_review",
      requiresApproval: NIOSH_METADATA.requiresApproval,
      authorityTier: NIOSH_METADATA.authorityTier,
    },
  });

  let created = 0;
  let updated = 0;
  let pending = 0;
  let approvedPreserved = 0;
  let discoveredCount = 0;

  try {
    const connector = new NioshMiningPublicationConnector();
    const discovered = await connector.discover();
    discoveredCount = discovered.length;

    for (const item of discovered) {
      const citation = item.externalId.toUpperCase();

      const existing = await documentRepo.findOne({
        where: { citation },
      });

      let approvalStatus: any = NIOSH_METADATA.requiresApproval
        ? "pending_review"
        : "approved";
      let reviewedAt: string | null = null;

      if (existing) {
        if (existing.approvalStatus === "approved") {
          approvalStatus = "approved";
          reviewedAt = existing.reviewedAt || null;
          approvedPreserved += 1;
        }

        updated += 1;
      } else {
        created += 1;
        if (approvalStatus === "pending_review") pending += 1;
      }

      const doc = existing || documentRepo.create();

      doc.citation = citation;
      doc.title = item.title;
      doc.agency = NIOSH_METADATA.agency as any;
      doc.sourceType = NIOSH_METADATA.sourceType as any;
      doc.authorityTier = NIOSH_METADATA.authorityTier;
      doc.sourceUrl = item.sourceUrl;
      doc.publishedAt = item.publishedAt || null;
      doc.summary = item.summary;
      doc.rawText = item.rawText;
      doc.approvalStatus = approvalStatus;
      doc.reviewedAt = reviewedAt;
      doc.hazardTags = item.metadata.hazardTags || [];
      doc.equipmentTags = item.metadata.equipmentTags || [];
      doc.taskTags = item.metadata.taskTags || [];
      doc.standardTags = item.metadata.standardTags || [];
      doc.lessonTags = item.metadata.lessonTags || [];

      const saved = await documentRepo.save(doc);

      await chunkRepo.delete({ documentId: saved.id });

      await chunkRepo.save(
        chunkRepo.create({
          documentId: saved.id,
          document: saved,
          chunkIndex: 0,
          sectionHeading: "NIOSH mining research support",
          chunkText: item.rawText,
          chunkSummary: chunkSummary(item.rawText),
          citation: saved.citation,
          authorityTier: saved.authorityTier,
          hazardTags: saved.hazardTags || [],
          equipmentTags: saved.equipmentTags || [],
          taskTags: saved.taskTags || [],
          standardTags: saved.standardTags || [],
          lessonTags: saved.lessonTags || [],
          confidenceWeight: authorityWeight(saved.authorityTier),
        }),
      );
    }

    await completeIngestionRun(runRepo, ingestionRun, {
      discoveredCount,
      ingestedCount: created,
      pendingReviewCount: pending,
      approvedCount: approvedPreserved,
      skippedCount: updated,
      metadataJson: {
        created,
        updated,
        pending,
        approvedPreserved,
      },
    });

    console.log(`Discovered: ${discoveredCount}`);
    console.log(`Created: ${created}`);
    console.log(`Updated: ${updated}`);
    console.log(`PendingReview: ${pending}`);
    console.log(`ApprovedPreserved: ${approvedPreserved}`);
  } catch (error) {
    await failIngestionRun(runRepo, ingestionRun, error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
