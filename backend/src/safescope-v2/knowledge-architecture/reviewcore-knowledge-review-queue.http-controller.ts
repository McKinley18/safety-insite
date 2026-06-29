import { UnauthorizedException, Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ReviewCoreQueueActor } from './reviewcore-knowledge-review-queue.api-types';
import { ReviewCoreKnowledgeReviewQueueProvider } from './reviewcore-knowledge-review-queue.provider';
import { JwtGuard } from '../../auth/guards/jwt.guard';

@UseGuards(JwtGuard)
@Controller('reviewcore/knowledge-queue')
export class ReviewCoreKnowledgeReviewQueueHttpController {
  constructor(private readonly provider: ReviewCoreKnowledgeReviewQueueProvider) {}

  private getQueueActor(req: any): ReviewCoreQueueActor {
    const user = req.user;
    const roleMap: Record<string, ReviewCoreQueueActor["role"]> = {
      'ORG_OWNER': 'owner',
      'SUPER_ADMIN': 'admin',
      'SAFETY_DIRECTOR': 'safety_manager',
      'SUPERVISOR': 'safety_manager',
      'AUDITOR': 'compliance_admin',
      'WORKER': 'field_inspector',
      'VIEWER': 'viewer',
    };

    const normalizedRole = user?.role ? String(user.role).trim().toUpperCase() : '';
    const role = roleMap[normalizedRole] || 'viewer';

    const planCodeMap: Record<string, ReviewCoreQueueActor["planTier"]> = {
      'company': 'company',
      'plus': 'team',
      'pro': 'team',
      'basic': 'individual',
    };
    const planTier = planCodeMap[user?.planCode || user?.planTier] || 'individual';

    return {
      actorId: String(user?.userId || user?.id || user?.sub),
      role,
      planTier,
    };
  }

  @Get('queue')
  listQueue(@Req() req: any) {
    const actor = this.getQueueActor(req);
    return this.provider.listQueue(actor);
  }

  @Get('queue/:recordId')
  getQueueItem(@Param('recordId') recordId: string, @Req() req: any) {
    const actor = this.getQueueActor(req);
    return this.provider.getQueueItem(recordId, actor);
  }

  @Post('drafts')
  createDraft(@Body() body: any = {}, @Req() req: any) {
    const actor = this.getQueueActor(req);
    return this.provider.createDraft(body.request ?? body, actor);
  }

  @Post('queue/:recordId/approve')
  approve(@Param('recordId') recordId: string, @Body() body: any = {}, @Req() req: any) {
    const actor = this.getQueueActor(req);
    return this.provider.approve(recordId, body.request ?? {}, actor);
  }

  @Post('queue/:recordId/reject')
  reject(@Param('recordId') recordId: string, @Body() body: any = {}, @Req() req: any) {
    const actor = this.getQueueActor(req);
    return this.provider.reject(recordId, body.request ?? {}, actor);
  }

  @Post('queue/:recordId/request-more-info')
  requestMoreInfo(@Param('recordId') recordId: string, @Body() body: any = {}, @Req() req: any) {
    const actor = this.getQueueActor(req);
    return this.provider.requestMoreInfo(recordId, body.request ?? {}, actor);
  }

  @Post('queue/:recordId/supersede')
  supersede(@Param('recordId') recordId: string, @Body() body: any = {}, @Req() req: any) {
    const actor = this.getQueueActor(req);
    return this.provider.supersede(recordId, body.request ?? {}, actor);
  }

  @Get('active-retrieval')
  listActiveRetrievalRecords(@Req() req: any) {
    const actor = this.getQueueActor(req);
    return this.provider.listActiveRetrievalRecords(actor);
  }

  @Get('snapshot')
  exportQueueSnapshot(@Req() req: any) {
    const actor = this.getQueueActor(req);
    return this.provider.exportQueueSnapshot(actor);
  }

  @Get('persistence-readiness')
  persistenceReadiness(@Req() req: any) {
    const actor = this.getQueueActor(req);
    return this.provider.persistenceReadiness(actor);
  }
}
