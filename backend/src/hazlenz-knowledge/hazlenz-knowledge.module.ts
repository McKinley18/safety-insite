import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HazLenzKnowledgeController } from './hazlenz-knowledge.controller';
import { HazLenzKnowledgeService } from './hazlenz-knowledge.service';
import { HazLenzKnowledgeChunk } from './entities/hazlenz-knowledge-chunk.entity';
import { HazLenzKnowledgeDocument } from './entities/hazlenz-knowledge-document.entity';
import { HazLenzKnowledgeRetrievalLog } from './entities/hazlenz-knowledge-retrieval-log.entity';
import { HazLenzKnowledgeSource } from './entities/hazlenz-knowledge-source.entity';
import { HazLenzKnowledgeIngestionRun } from './entities/hazlenz-knowledge-ingestion-run.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HazLenzKnowledgeDocument,
      HazLenzKnowledgeChunk,
      HazLenzKnowledgeRetrievalLog,
      HazLenzKnowledgeSource,
      HazLenzKnowledgeIngestionRun,
    ]),
  ],
  controllers: [HazLenzKnowledgeController],
  providers: [HazLenzKnowledgeService],
  exports: [HazLenzKnowledgeService],
})
export class HazLenzKnowledgeModule {}
