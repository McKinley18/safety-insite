import { Module } from '@nestjs/common';
import { ReviewCoreKnowledgeReviewQueueHttpController } from './reviewcore-knowledge-review-queue.http-controller';
import { ReviewCoreKnowledgeReviewQueueProvider } from './reviewcore-knowledge-review-queue.provider';

export const ReviewCoreKnowledgeReviewQueueModuleDefinition = {
  controllers: [ReviewCoreKnowledgeReviewQueueHttpController],
  providers: [ReviewCoreKnowledgeReviewQueueProvider],
  exports: [ReviewCoreKnowledgeReviewQueueProvider],
};

@Module(ReviewCoreKnowledgeReviewQueueModuleDefinition)
export class ReviewCoreKnowledgeReviewQueueModule {}
