
import { DataSource } from "typeorm";
import { config } from "dotenv";
import { SafeScopeKnowledgeDocument } from "../entities/safescope-knowledge-document.entity";
import { SafeScopeKnowledgeChunk } from "../entities/safescope-knowledge-chunk.entity";
import { SafeScopeKnowledgeSource } from "../entities/safescope-knowledge-source.entity";
import { SafeScopeKnowledgeIngestionRun } from "../entities/safescope-knowledge-ingestion-run.entity";
import { SafeScopeKnowledgeRetrievalLog } from "../entities/safescope-knowledge-retrieval-log.entity";
import { OshaIncidentDatabaseConnector } from "./connectors/osha-incident-database.connector";
import { buildSourceRegistryMetadata } from "../sources/source-registry-metadata";
import {
  completeIngestionRun,
  failIngestionRun,
  startIngestionRun,
} from "./ingestion-run-logger";

config();

const OSHA_INCIDENT_METADATA = buildSourceRegistryMetadata(
  "osha-fatality-catastrophe-data",
);

function authorityWeight(authorityTier: number) {
  return Number(Math.max(0.1, 1 - (authorityTier - 1) * 0.15).toFixed(2));
}

function chunkSummary(text: string) {
  return text.split(/[.!?]/).slice(0, 3).join(". ").trim().slice(0, 320);
}

async function run() {
  const dataSource = new DataSource({
    type: "postgres",
    url:
      process.env.DATABASE_URL ||
      "postgres://mckinley@localhost:5432/sentinel_safety",
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
    sourceName: OSHA_INCIDENT_METADATA.sourceName || "OSHA Fatality and Catastrophe Data",
    agency: OSHA_INCIDENT_METADATA.agency,
    sourceType: OSHA_INCIDENT_METADATA.sourceType,
    metadataJson: {
      connector: "OshaIncidentDatabaseConnector",
      sourceKey: "osha-fatality-catastrophe-data",
      mode: "governed_pending_review",
    },
  });

  try {
    const connector = new OshaIncidentDatabaseConnector();
    const discovered = await connector.discover();

    let created = 0;
    let updated = 0;
    let pending = 0;
    let approvedPreserved = 0;

    for (const item of discovered) {
      const citation = `OSHA-INCIDENT-DATABASE-${item.externalId}`.toUpperCase();
      const existing = await documentRepo.findOne({ where: { citation } });

      const doc = existing || documentRepo.create();

      doc.citation = citation;
      doc.title = item.title;
      doc.agency = OSHA_INCIDENT_METADATA.agency as any;
      doc.sourceType = OSHA_INCIDENT_METADATA.sourceType as any;
      doc.authorityTier = OSHA_INCIDENT_METADATA.authorityTier;
      doc.sourceUrl = item.sourceUrl;
      doc.summary = item.summary;
      doc.rawText = item.rawText;
      doc.hazardTags = item.hazardTags;
      doc.equipmentTags = item.equipmentTags;
      doc.taskTags = item.taskTags;
      doc.standardTags = item.standardTags;
      doc.lessonTags = item.lessonTags;

      if (existing) {
        updated += 1;
        if (existing.approvalStatus === "approved") {
          doc.approvalStatus = "approved";
          doc.reviewedAt = existing.reviewedAt;
          approvedPreserved += 1;
        }
      } else {
        created += 1;
        pending += 1;
        doc.approvalStatus = "pending_review";
        doc.reviewedAt = null;
      }

      const saved = await documentRepo.save(doc);

      await chunkRepo.delete({ documentId: saved.id });
      await chunkRepo.save(
        chunkRepo.create({
          documentId: saved.id,
          document: saved,
          chunkIndex: 0,
          sectionHeading: "OSHA incident database source profile",
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
      discoveredCount: discovered.length,
      ingestedCount: created,
      pendingReviewCount: pending,
      approvedCount: approvedPreserved,
      skippedCount: updated,
      metadataJson: { created, updated, approvedPreserved },
    });

    console.log(`Discovered: ${discovered.length}`);
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
