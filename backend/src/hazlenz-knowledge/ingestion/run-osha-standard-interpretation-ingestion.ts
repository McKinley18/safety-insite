import { DataSource } from "typeorm";
import { config } from "dotenv";
import { SafeScopeKnowledgeDocument } from "../entities/safescope-knowledge-document.entity";
import { SafeScopeKnowledgeChunk } from "../entities/safescope-knowledge-chunk.entity";
import { SafeScopeKnowledgeSource } from "../entities/safescope-knowledge-source.entity";
import { SafeScopeKnowledgeIngestionRun } from "../entities/safescope-knowledge-ingestion-run.entity";
import { SafeScopeKnowledgeRetrievalLog } from "../entities/safescope-knowledge-retrieval-log.entity";
import { OshaStandardInterpretationConnector } from "./connectors/osha-standard-interpretation.connector";
import { buildSourceRegistryMetadata } from "../sources/source-registry-metadata";
import {
  completeIngestionRun,
  failIngestionRun,
  startIngestionRun,
} from "./ingestion-run-logger";

const OSHA_METADATA = buildSourceRegistryMetadata(
  "osha-standard-interpretations",
);

config();

function authorityWeight(authorityTier: number) {
  return Number(Math.max(0.1, 1 - (authorityTier - 1) * 0.15).toFixed(2));
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


  let ingestionRun: SafeScopeKnowledgeIngestionRun | null = null;

  try {
    ingestionRun = await startIngestionRun(runRepo, {
      sourceName: "OSHA Standard Interpretations",
      agency: OSHA_METADATA.agency,
      sourceType: OSHA_METADATA.sourceType,
      metadataJson: {
        connector: "OshaStandardInterpretationConnector",
        sourceKey: "osha-standard-interpretations",
        requiresApproval: OSHA_METADATA.requiresApproval,
        authorityTier: OSHA_METADATA.authorityTier,
      },
    });

  const connector = new OshaStandardInterpretationConnector();
  const discovered = await connector.discover();

  let created = 0,
    updated = 0,
    pending = 0;

  for (const item of discovered) {
    const citation = item.externalId.toUpperCase();
    const existing = await documentRepo.findOne({ where: { citation } });
    const doc = existing || documentRepo.create();

    doc.citation = citation;
    doc.title = item.title;
    doc.agency = OSHA_METADATA.agency as any;
    doc.sourceType = OSHA_METADATA.sourceType as any;
    doc.authorityTier = OSHA_METADATA.authorityTier;
    doc.sourceUrl = item.sourceUrl;
    doc.summary = item.summary;
    doc.rawText = item.rawText;
    if (!existing) {
      doc.approvalStatus = OSHA_METADATA.requiresApproval
        ? "pending_review"
        : "approved";
    } else {
      doc.approvalStatus = existing.approvalStatus;
      doc.reviewedAt = existing.reviewedAt;
    }

    const saved = await documentRepo.save(doc);
    if (existing) updated++;
    else {
      created++;
      pending++;
    }

    await chunkRepo.delete({ documentId: saved.id });
    await chunkRepo.save(
      chunkRepo.create({
        documentId: saved.id,
        chunkIndex: 0,
        chunkText: item.rawText,
        chunkSummary: item.summary,
        citation: saved.citation,
        authorityTier: saved.authorityTier,
        confidenceWeight: authorityWeight(saved.authorityTier),
      }),
    );
  }

  console.log(`Discovered: ${discovered.length}`);
  console.log(`Created: ${created}`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: 0`);
  console.log(`PendingReview: ${pending}`);

  await completeIngestionRun(runRepo, ingestionRun, {
    discoveredCount: discovered.length,
    ingestedCount: created,
    pendingReviewCount: pending,
    approvedCount: Math.max(0, discovered.length - pending),
    skippedCount: updated,
    metadataJson: {
      created,
      updated,
      pending,
      approvedPreserved: 0,
    },
  });

  } catch (error) {
    await failIngestionRun(runRepo, ingestionRun, error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

run().catch(console.error);
