import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ReviewCoreQueueActor } from './reviewcore-knowledge-review-queue.api-types';
import { ReviewCoreKnowledgeReviewQueueProvider } from './reviewcore-knowledge-review-queue.provider';

type ActorCarrier = {
  actor?: Partial<ReviewCoreQueueActor>;
};

@Controller('reviewcore/knowledge-queue')
export class ReviewCoreKnowledgeReviewQueueHttpController {
  constructor(private readonly provider: ReviewCoreKnowledgeReviewQueueProvider) {}

  @Get('queue')
  listQueue(@Query() query: ActorCarrier = {}) {
    return this.provider.listQueue(query.actor);
  }

  @Get('queue/:recordId')
  getQueueItem(@Param('recordId') recordId: string, @Query() query: ActorCarrier = {}) {
    return this.provider.getQueueItem(recordId, query.actor);
  }

  @Post('drafts')
  createDraft(@Body() body: ActorCarrier & { request?: any } = {}) {
    return this.provider.createDraft(body.request ?? body, body.actor);
  }

  @Post('queue/:recordId/approve')
  approve(@Param('recordId') recordId: string, @Body() body: ActorCarrier & { request?: any } = {}) {
    return this.provider.approve(recordId, body.request ?? {}, body.actor);
  }

  @Post('queue/:recordId/reject')
  reject(@Param('recordId') recordId: string, @Body() body: ActorCarrier & { request?: any } = {}) {
    return this.provider.reject(recordId, body.request ?? {}, body.actor);
  }

  @Post('queue/:recordId/request-more-info')
  requestMoreInfo(@Param('recordId') recordId: string, @Body() body: ActorCarrier & { request?: any } = {}) {
    return this.provider.requestMoreInfo(recordId, body.request ?? {}, body.actor);
  }

  @Post('queue/:recordId/supersede')
  supersede(@Param('recordId') recordId: string, @Body() body: ActorCarrier & { request?: any } = {}) {
    return this.provider.supersede(recordId, body.request ?? {}, body.actor);
  }

  @Get('active-retrieval')
  listActiveRetrievalRecords(@Query() query: ActorCarrier = {}) {
    return this.provider.listActiveRetrievalRecords(query.actor);
  }

  @Get('snapshot')
  exportQueueSnapshot(@Query() query: ActorCarrier = {}) {
    return this.provider.exportQueueSnapshot(query.actor);
  }

  @Get('persistence-readiness')
  persistenceReadiness(@Query() query: ActorCarrier = {}) {
    return this.provider.persistenceReadiness(query.actor);
  }
}
