import { Module } from '@nestjs/common';
import { ReviewCoreKnowledgeReviewQueueHttpController } from './reviewcore-knowledge-review-queue.http-controller';
import { ReviewCoreKnowledgeReviewQueueProvider } from './reviewcore-knowledge-review-queue.provider';
import { ReviewCoreKnowledgeReviewQueuePersistenceAdapter } from './reviewcore-knowledge-review-queue.persistence-adapter';

export const ReviewCoreKnowledgeReviewQueueModuleDefinition = {
  controllers: [ReviewCoreKnowledgeReviewQueueHttpController],
  providers: [ReviewCoreKnowledgeReviewQueueProvider, ReviewCoreKnowledgeReviewQueuePersistenceAdapter],
  exports: [ReviewCoreKnowledgeReviewQueueProvider, ReviewCoreKnowledgeReviewQueuePersistenceAdapter],
};

@Module(ReviewCoreKnowledgeReviewQueueModuleDefinition)
export class ReviewCoreKnowledgeReviewQueueModule {}
