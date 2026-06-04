import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SafeScopeKnowledgeDocument } from '../entities/safescope-knowledge-document.entity';
import { SafeScopeKnowledgeChunk } from '../entities/safescope-knowledge-chunk.entity';
import { SafeScopeKnowledgeRetrievalLog } from '../entities/safescope-knowledge-retrieval-log.entity';
import { SafeScopeKnowledgeSource } from '../entities/safescope-knowledge-source.entity';
import { SafeScopeKnowledgeIngestionRun } from '../entities/safescope-knowledge-ingestion-run.entity';
import { starterKnowledge } from './starter-knowledge';

function chunkText(rawText: string) {
  const clean = String(rawText || '').replace(/\r/g, '').trim();
  if (!clean) return [];

  const paragraphs = clean.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);
  const chunks: string[] = [];
  let current = '';

  for (const paragraph of paragraphs) {
    if ((current + '\n\n' + paragraph).length > 1800 && current) {
      chunks.push(current.trim());
      current = paragraph;
    } else {
      current = current ? `${current}\n\n${paragraph}` : paragraph;
    }
  }

  if (current.trim()) chunks.push(current.trim());

  return chunks.length ? chunks : [clean.slice(0, 1800)];
}

function summarizeChunk(text: string) {
  const firstSentence = text.split(/(?<=[.!?])\s+/)[0];
  return firstSentence?.slice(0, 280) || null;
}

function extractHeading(text: string) {
  const firstLine = text.split('\n').find(Boolean)?.trim();
  if (!firstLine) return null;
  return firstLine.length <= 160 ? firstLine : null;
}

function authorityWeight(authorityTier: number) {
  return Number(Math.max(0.1, 1 - (authorityTier - 1) * 0.15).toFixed(2));
}

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
    synchronize:
      configService.get<string>('TYPEORM_SYNCHRONIZE') === 'true' ||
      (!isProduction && configService.get<string>('NODE_ENV') === 'development'),
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

  for (const item of starterKnowledge) {
    const existing = await documentRepo.findOne({
      where: { citation: item.citation },
    });

    const documentToSave = existing || new SafeScopeKnowledgeDocument();

    Object.assign(documentToSave, item);

    const saved = await documentRepo.save(documentToSave);

    await chunkRepo.delete({ documentId: saved.id });

    const chunks = chunkText(saved.rawText).map((chunk, index) =>
      chunkRepo.create({
        documentId: saved.id,
        document: saved,
        chunkIndex: index,
        sectionHeading: extractHeading(chunk),
        chunkText: chunk,
        chunkSummary: summarizeChunk(chunk),
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

    await chunkRepo.save(chunks);

    console.log(`Seeded: ${saved.title}`);
  }

  await dataSource.destroy();

  console.log(`SafeScope Knowledge seed complete: ${starterKnowledge.length} documents`);
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
