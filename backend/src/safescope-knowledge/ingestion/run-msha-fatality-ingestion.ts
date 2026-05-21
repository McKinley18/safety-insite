import { DataSource } from "typeorm";
import { config } from "dotenv";
import { SafeScopeKnowledgeDocument } from "../entities/safescope-knowledge-document.entity";
import { SafeScopeKnowledgeChunk } from "../entities/safescope-knowledge-chunk.entity";
import { SafeScopeKnowledgeSource } from "../entities/safescope-knowledge-source.entity";
import { SafeScopeKnowledgeIngestionRun } from "../entities/safescope-knowledge-ingestion-run.entity";
import { SafeScopeKnowledgeRetrievalLog } from "../entities/safescope-knowledge-retrieval-log.entity";
import { MshaFatalityConnector } from "./connectors/msha-fatality.connector";
import {
  buildSourceRegistryMetadata,
  mergeUniqueTags,
} from "../sources/source-registry-metadata";

const MSHA_FATALITY_SOURCE_METADATA = buildSourceRegistryMetadata(
  "msha-fatality-reports",
);

config();

function chunkSummary(text: string) {
  return text.split(/[.!?]/).slice(0, 2).join(". ").trim().slice(0, 280);
}

function authorityWeight(authorityTier: number) {
  return Number(Math.max(0.1, 1 - (authorityTier - 1) * 0.15).toFixed(2));
}

async function main() {
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
  });

  await dataSource.initialize();

  const documentRepo = dataSource.getRepository(SafeScopeKnowledgeDocument);
  const chunkRepo = dataSource.getRepository(SafeScopeKnowledgeChunk);
  const runRepo = dataSource.getRepository(SafeScopeKnowledgeIngestionRun);

  const run = await runRepo.save(
    runRepo.create({
      sourceName: "MSHA Fatality Reports",
      agency: MSHA_FATALITY_SOURCE_METADATA.agency,
      sourceType: "fatality_report",
      status: "running",
      startedAt: new Date(),
      metadataJson: {
        connector: "MshaFatalityConnector",
        mode: "governed_pending_review",
      },
    }),
  );

  const connector = new MshaFatalityConnector();
  const discovered = await connector.discover();

  let ingestedCount = 0;
  let skippedCount = 0;

  for (const item of discovered) {
    const citation = `MSHA-FATALITY-LEARNING-${item.externalId}`.toUpperCase();

    const existing = await documentRepo.findOne({
      where: { citation },
    });

    const document = existing || documentRepo.create();

    document.title = item.title;
    document.agency = MSHA_FATALITY_SOURCE_METADATA.agency as any;
    document.sourceType = MSHA_FATALITY_SOURCE_METADATA.sourceType as any;
    document.authorityTier = MSHA_FATALITY_SOURCE_METADATA.authorityTier;
    document.citation = citation;
    document.sourceUrl = item.sourceUrl;
    document.publishedAt = item.publishedAt || null;
    document.summary = item.summary;
    document.rawText = item.rawText;
    document.hazardTags = item.hazardTags;
    document.equipmentTags = item.equipmentTags;
    document.taskTags = item.taskTags;
    document.standardTags = [
      "machine guarding",
      "workplace examination",
      "lockout tagout",
    ];
    document.lessonTags = item.lessonTags;

    if (!existing) {
      document.reviewedAt = null;
      document.approvalStatus = "pending_review";
    }

    const savedDocument = await documentRepo.save(document);

    await chunkRepo.delete({ documentId: savedDocument.id });

    await chunkRepo.save(
      chunkRepo.create({
        documentId: savedDocument.id,
        document: savedDocument,
        chunkIndex: 0,
        sectionHeading: "Fatality learning pattern",
        chunkText: item.rawText,
        chunkSummary: chunkSummary(item.rawText),
        citation: savedDocument.citation,
        authorityTier: savedDocument.authorityTier,
        hazardTags: savedDocument.hazardTags,
        equipmentTags: savedDocument.equipmentTags,
        taskTags: savedDocument.taskTags,
        standardTags: savedDocument.standardTags,
        lessonTags: savedDocument.lessonTags,
        confidenceWeight: authorityWeight(savedDocument.authorityTier),
      }),
    );

    if (existing) {
      skippedCount += 1;
      console.log(`Updated existing document: ${savedDocument.title}`);
    } else {
      ingestedCount += 1;
      console.log(`Created pending review document: ${savedDocument.title}`);
    }
  }

  run.status = "completed";
  run.discoveredCount = discovered.length;
  run.ingestedCount = ingestedCount;
  run.pendingReviewCount = ingestedCount;
  run.approvedCount = 0;
  run.skippedCount = skippedCount;
  run.completedAt = new Date();

  await runRepo.save(run);

  console.log("MSHA fatality ingestion complete");
  console.log(`Discovered: ${discovered.length}`);
  console.log(`Pending review created: ${ingestedCount}`);
  console.log(`Skipped existing: ${skippedCount}`);

  await dataSource.destroy();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
