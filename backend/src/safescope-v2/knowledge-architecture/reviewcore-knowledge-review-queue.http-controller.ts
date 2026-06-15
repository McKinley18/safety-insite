import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ReviewCoreQueueActor } from './reviewcore-knowledge-review-queue.api-types';
import { ReviewCoreKnowledgeReviewQueueProvider } from './reviewcore-knowledge-review-queue.provider';

type ActorCarrier = {
  actor?: Partial<ReviewCoreQueueActor>;
  actorId?: string;
  role?: ReviewCoreQueueActor["role"];
  planTier?: ReviewCoreQueueActor["planTier"];
};

function actorFromCarrier(input: ActorCarrier = {}): Partial<ReviewCoreQueueActor> | undefined {
  return input.actor ?? {
    actorId: input.actorId,
    role: input.role,
    planTier: input.planTier,
  };
}

@Controller('reviewcore/knowledge-queue')
export class ReviewCoreKnowledgeReviewQueueHttpController {
  constructor(private readonly provider: ReviewCoreKnowledgeReviewQueueProvider) {}

  @Get('queue')
  listQueue(@Query() query: ActorCarrier = {}) {
    return this.provider.listQueue(actorFromCarrier(query));
  }

  @Get('queue/:recordId')
  getQueueItem(@Param('recordId') recordId: string, @Query() query: ActorCarrier = {}) {
    return this.provider.getQueueItem(recordId, actorFromCarrier(query));
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
    return this.provider.listActiveRetrievalRecords(actorFromCarrier(query));
  }

  @Get('snapshot')
  exportQueueSnapshot(@Query() query: ActorCarrier = {}) {
    return this.provider.exportQueueSnapshot(actorFromCarrier(query));
  }

  @Get('persistence-readiness')
  persistenceReadiness(@Query() query: ActorCarrier = {}) {
    return this.provider.persistenceReadiness(actorFromCarrier(query));
  }
}
