import 'reflect-metadata';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SafeScopeKnowledgeDocument } from '../entities/safescope-knowledge-document.entity';
import { SafeScopeKnowledgeChunk } from '../entities/safescope-knowledge-chunk.entity';
import { SafeScopeKnowledgeRetrievalLog } from '../entities/safescope-knowledge-retrieval-log.entity';
import { SafeScopeKnowledgeSource } from '../entities/safescope-knowledge-source.entity';
import { SafeScopeKnowledgeIngestionRun } from '../entities/safescope-knowledge-ingestion-run.entity';

async function bootstrap() {
  ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: '.env',
  });

  const configService = new ConfigService();
  const databaseUrl = configService.get<string>('DATABASE_URL');
  const isProduction = configService.get<string>('NODE_ENV') === 'production';

  const dataSource = new DataSource({
    type: 'postgres',
    url: databaseUrl || undefined,
    host: databaseUrl ? undefined : configService.get<string>('DB_HOST'),
    port: databaseUrl ? undefined : Number(configService.get<number>('DB_PORT') || 5432),
    username: databaseUrl ? undefined : configService.get<string>('DB_USERNAME'),
    password: databaseUrl ? undefined : configService.get<string>('DB_PASSWORD'),
    database: databaseUrl ? undefined : configService.get<string>('DB_NAME'),
    ssl: isProduction ? { rejectUnauthorized: false } : false,
    entities: [
      SafeScopeKnowledgeDocument,
      SafeScopeKnowledgeChunk,
      SafeScopeKnowledgeRetrievalLog,
      SafeScopeKnowledgeSource,
      SafeScopeKnowledgeIngestionRun,
    ],
  });

  await dataSource.initialize();

  const documentRepo = dataSource.getRepository(SafeScopeKnowledgeDocument);
  const chunkRepo = dataSource.getRepository(SafeScopeKnowledgeChunk);

  const documents = await documentRepo.find({
    where: { approvalStatus: 'approved' },
    order: { authorityTier: 'ASC', title: 'ASC' },
  });

  const chunks = await chunkRepo.find({
    relations: { document: true },
    order: { authorityTier: 'ASC', chunkIndex: 'ASC' },
  });

  const approvedDocumentIds = new Set(documents.map((document) => document.id));
  const approvedChunks = chunks.filter((chunk) => approvedDocumentIds.has(chunk.documentId));

  const hazardIndex: Record<string, string[]> = {};
  const standardIndex: Record<string, string[]> = {};
  const equipmentIndex: Record<string, string[]> = {};

  for (const chunk of approvedChunks) {
    for (const tag of chunk.hazardTags || []) {
      hazardIndex[tag] = Array.from(new Set([...(hazardIndex[tag] || []), chunk.id]));
    }

    for (const tag of chunk.standardTags || []) {
      standardIndex[tag] = Array.from(new Set([...(standardIndex[tag] || []), chunk.id]));
    }

    for (const tag of chunk.equipmentTags || []) {
      equipmentIndex[tag] = Array.from(new Set([...(equipmentIndex[tag] || []), chunk.id]));
    }
  }

  const bundle = {
    version: new Date().toISOString().slice(0, 10),
    generatedAt: new Date().toISOString(),
    source: 'SafeScope Knowledge Brain',
    approvedOnly: true,
    safetyGate:
      'Only documents with approvalStatus=approved are included in this offline bundle.',
    documents: documents.map((document) => ({
      id: document.id,
      title: document.title,
      agency: document.agency,
      sourceType: document.sourceType,
      authorityTier: document.authorityTier,
      citation: document.citation,
      sourceUrl: document.sourceUrl,
      publishedAt: document.publishedAt,
      reviewedAt: document.reviewedAt,
      approvalStatus: document.approvalStatus,
      summary: document.summary,
      hazardTags: document.hazardTags,
      equipmentTags: document.equipmentTags,
      taskTags: document.taskTags,
      standardTags: document.standardTags,
      lessonTags: document.lessonTags,
    })),
    chunks: approvedChunks.map((chunk) => ({
      id: chunk.id,
      documentId: chunk.documentId,
      chunkIndex: chunk.chunkIndex,
      sectionHeading: chunk.sectionHeading,
      chunkText: chunk.chunkText,
      chunkSummary: chunk.chunkSummary,
      citation: chunk.citation,
      authorityTier: chunk.authorityTier,
      hazardTags: chunk.hazardTags,
      equipmentTags: chunk.equipmentTags,
      taskTags: chunk.taskTags,
      standardTags: chunk.standardTags,
      lessonTags: chunk.lessonTags,
      confidenceWeight: chunk.confidenceWeight,
    })),
    indexes: {
      hazards: hazardIndex,
      standards: standardIndex,
      equipment: equipmentIndex,
    },
  };

  const outputDir = join(process.cwd(), 'dist', 'offline');
  mkdirSync(outputDir, { recursive: true });

  const outputPath = join(outputDir, 'safescope-brain-bundle.json');
  writeFileSync(outputPath, JSON.stringify(bundle, null, 2));

  await dataSource.destroy();

  console.log(`Exported SafeScope Brain Bundle: ${outputPath}`);
  console.log(`Documents: ${bundle.documents.length}`);
  console.log(`Chunks: ${bundle.chunks.length}`);
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
