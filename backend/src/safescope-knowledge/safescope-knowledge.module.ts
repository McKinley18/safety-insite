import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SafeScopeKnowledgeController } from './safescope-knowledge.controller';
import { SafeScopeKnowledgeService } from './safescope-knowledge.service';
import { SafeScopeKnowledgeChunk } from './entities/safescope-knowledge-chunk.entity';
import { SafeScopeKnowledgeDocument } from './entities/safescope-knowledge-document.entity';
import { SafeScopeKnowledgeRetrievalLog } from './entities/safescope-knowledge-retrieval-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SafeScopeKnowledgeDocument,
      SafeScopeKnowledgeChunk,
      SafeScopeKnowledgeRetrievalLog,
    ]),
  ],
  controllers: [SafeScopeKnowledgeController],
  providers: [SafeScopeKnowledgeService],
  exports: [SafeScopeKnowledgeService],
})
export class SafeScopeKnowledgeModule {}
