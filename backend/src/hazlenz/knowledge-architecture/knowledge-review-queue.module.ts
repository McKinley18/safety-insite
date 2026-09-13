import { Module } from '@nestjs/common';
import { KnowledgeReviewQueueHttpController } from './knowledge-review-queue.http-controller';
import { KnowledgeReviewQueueProvider } from './knowledge-review-queue.provider';
import { KnowledgeReviewQueuePersistenceAdapter } from './knowledge-review-queue.persistence-adapter';

export const KnowledgeReviewQueueModuleDefinition = {
  controllers: [KnowledgeReviewQueueHttpController],
  providers: [KnowledgeReviewQueueProvider, KnowledgeReviewQueuePersistenceAdapter],
  exports: [KnowledgeReviewQueueProvider, KnowledgeReviewQueuePersistenceAdapter],
};

@Module(KnowledgeReviewQueueModuleDefinition)
export class KnowledgeReviewQueueModule {}
