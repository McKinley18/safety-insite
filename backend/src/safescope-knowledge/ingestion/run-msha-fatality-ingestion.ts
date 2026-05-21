import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { SafeScopeKnowledgeDocument } from '../entities/safescope-knowledge-document.entity';
import { SafeScopeKnowledgeChunk } from '../entities/safescope-knowledge-chunk.entity';
import { SafeScopeKnowledgeSource } from '../entities/safescope-knowledge-source.entity';
import { SafeScopeKnowledgeIngestionRun } from '../entities/safescope-knowledge-ingestion-run.entity';
import { SafeScopeKnowledgeRetrievalLog } from '../entities/safescope-knowledge-retrieval-log.entity';
import { MshaFatalityConnector } from './connectors/msha-fatality.connector';

config();

function chunkSummary(text: string) {
  return text.split(/[.!?]/).slice(0, 2).join('. ').trim().slice(0, 280);
}

function authorityWeight(authorityTier: number) {
  return Number(Math.max(0.1, 1 - (authorityTier - 1) * 0.15).toFixed(2));
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;

  const dataSource = new DataSource({
    type: 'postgres',
    url: databaseUrl || undefined,
    host: databaseUrl ? undefined : process.env.DB_HOST,
    port: databaseUrl ? undefined : Number(process.env.DB_PORT || 5432),
    username: databaseUrl ? undefined : process.env.DB_USERNAME,
    password: databaseUrl ? undefined : process.env.DB_PASSWORD,
    database: databaseUrl ? undefined : process.env.DB_NAME,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
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
      sourceName: 'MSHA Fatality Reports',
      agency: 'MSHA',
      sourceType: 'fatality_report',
      status: 'running',
      startedAt: new Date(),
      metadataJson: {
        connector: 'MshaFatalityConnector',
        mode: 'governed_pending_review',
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

    if (existing) {
      skippedCount += 1;
      continue;
    }

    const document = await documentRepo.save(
      documentRepo.create({
        title: item.title,
        agency: 'MSHA',
        sourceType: 'case_study',
        authorityTier: 3,
        citation,
        sourceUrl: item.sourceUrl,
        publishedAt: item.publishedAt || null,
        reviewedAt: null,
        approvalStatus: 'pending_review',
        summary: item.summary,
        rawText: item.rawText,
        hazardTags: item.hazardTags,
        equipmentTags: item.equipmentTags,
        taskTags: item.taskTags,
        standardTags: ['machine guarding', 'workplace examination', 'lockout tagout'],
        lessonTags: item.lessonTags,
      }),
    );

    await chunkRepo.save(
      chunkRepo.create({
        documentId: document.id,
        document,
        chunkIndex: 0,
        sectionHeading: 'Fatality learning pattern',
        chunkText: item.rawText,
        chunkSummary: chunkSummary(item.rawText),
        citation: document.citation,
        authorityTier: document.authorityTier,
        hazardTags: document.hazardTags,
        equipmentTags: document.equipmentTags,
        taskTags: document.taskTags,
        standardTags: document.standardTags,
        lessonTags: document.lessonTags,
        confidenceWeight: authorityWeight(document.authorityTier),
      }),
    );

    ingestedCount += 1;
    console.log(`Created pending review document: ${document.title}`);
  }

  run.status = 'completed';
  run.discoveredCount = discovered.length;
  run.ingestedCount = ingestedCount;
  run.pendingReviewCount = ingestedCount;
  run.approvedCount = 0;
  run.skippedCount = skippedCount;
  run.completedAt = new Date();

  await runRepo.save(run);

  console.log('MSHA fatality ingestion complete');
  console.log(`Discovered: ${discovered.length}`);
  console.log(`Pending review created: ${ingestedCount}`);
  console.log(`Skipped existing: ${skippedCount}`);

  await dataSource.destroy();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
