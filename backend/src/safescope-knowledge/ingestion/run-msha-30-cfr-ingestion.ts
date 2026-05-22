import { DataSource } from "typeorm";
import { config } from "dotenv";
import { SafeScopeKnowledgeDocument } from "../entities/safescope-knowledge-document.entity";
import { SafeScopeKnowledgeChunk } from "../entities/safescope-knowledge-chunk.entity";
import { SafeScopeKnowledgeSource } from "../entities/safescope-knowledge-source.entity";
import { SafeScopeKnowledgeIngestionRun } from "../entities/safescope-knowledge-ingestion-run.entity";
import { SafeScopeKnowledgeRetrievalLog } from "../entities/safescope-knowledge-retrieval-log.entity";
import { Msha30CfrConnector } from "./connectors/msha-30-cfr.connector";
import { buildSourceRegistryMetadata } from "../sources/source-registry-metadata";

const MSHA_METADATA = buildSourceRegistryMetadata("msha-30-cfr-standards");

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

  const connector = new Msha30CfrConnector();
  const discovered = await connector.discover();

  let created = 0,
    updated = 0,
    pending = 0,
    approvedPreserved = 0;

  for (const item of discovered) {
    const citation = item.externalId.toUpperCase();
    const existing = await documentRepo.findOne({ where: { citation } });

    let approvalStatus: any = MSHA_METADATA.requiresApproval
      ? "pending_review"
      : "approved";
    let reviewedAt: string | null = null;

    if (existing) {
      if (existing.approvalStatus === "approved") {
        approvalStatus = "approved";
        reviewedAt = existing.reviewedAt || null;
        approvedPreserved++;
      }
      updated++;
    } else {
      created++;
      if (approvalStatus === "pending_review") pending++;
    }

    const doc = existing || documentRepo.create();
    doc.citation = citation;
    doc.title = item.title;
    doc.agency = MSHA_METADATA.agency as any;
    doc.sourceType = MSHA_METADATA.sourceType as any;
    doc.authorityTier = MSHA_METADATA.authorityTier;
    doc.sourceUrl = item.sourceUrl;
    doc.summary = item.summary;
    doc.rawText = item.rawText;
    doc.approvalStatus = approvalStatus;
    doc.reviewedAt = reviewedAt;
    doc.hazardTags = item.metadata.hazardTags || [];
    doc.standardTags = item.metadata.standardTags || [];

    const saved = await documentRepo.save(doc);

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
        hazardTags: saved.hazardTags,
        standardTags: saved.standardTags,
      }),
    );
  }

  console.log(`Discovered: ${discovered.length}`);
  console.log(`Created: ${created}`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: 0`);
  console.log(`PendingReview: ${pending}`);
  console.log(`ApprovedPreserved: ${approvedPreserved}`);

  await dataSource.destroy();
}

run().catch(console.error);
