import { UnauthorizedException, Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ReviewerCandidateConsoleService } from './reviewer-candidate-console.service';
import { CandidateFilter } from './reviewer-candidate-console.types';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Request } from 'express';
import { UserGovernanceContext, SafeScopeRole } from '../workspace-governance-access/workspace-governance.types';

@Controller('safescope/reviewer-candidates')
@UseGuards(JwtGuard, RolesGuard)
@Roles('SAFETY_DIRECTOR', 'AUDITOR', 'ORG_OWNER', 'SUPER_ADMIN')
export class ReviewerCandidateConsoleController {
  constructor(private readonly service: ReviewerCandidateConsoleService) {}

  private getGovernanceContext(req: Request & { user?: any }): UserGovernanceContext {
      const user = req.user;
      const roleMap: Record<string, SafeScopeRole> = {
          'ORG_OWNER': 'owner',
          'SUPER_ADMIN': 'admin',
          'SAFETY_DIRECTOR': 'safety_manager',
          'SUPERVISOR': 'safety_manager',
          'AUDITOR': 'compliance_admin',
          'WORKER': 'field_inspector',
          'VIEWER': 'viewer'
      };

      return {
          userId: user?.userId || user?.id || user?.sub,
          workspaceId: user?.organizationId || user?.workspaceId || 'default',
          role: roleMap[user?.role] || 'viewer',
          planTier: user?.planTier || 'team',
          jurisdictionScopes: [],
          reviewerQualifications: []
      };
  }

  private platformReviewer(req: Request & { user?: any }, notes?: string) {
    const user = req.user;
    return {
      name: String(user?.userId || user?.id || user?.sub || 'authenticated-platform-administrator'),
      role: 'system_admin',
      notes: notes || '',
    };
  }

  @Get()
  async listCandidates(@Query() filter: CandidateFilter, @Req() req: Request) {
    const context = this.getGovernanceContext(req as any);
    return this.service.listCandidates(filter, context);
  }

  @Get(':id')
  async getCandidate(@Param('id') id: string, @Req() req: Request) {
    const context = this.getGovernanceContext(req as any);
    return this.service.getCandidateById(id, context);
  }

  @Post(':id/approve')
  @Roles('SUPER_ADMIN', 'PLATFORM_ADMIN')
  async approve(@Param('id') id: string, @Body() reviewer: { notes?: string }, @Req() req: Request) {
    const context = this.getGovernanceContext(req as any);
    return this.service.approveCandidate(id, this.platformReviewer(req as any, reviewer.notes), context);
  }

  @Post(':id/reject')
  @Roles('SUPER_ADMIN', 'PLATFORM_ADMIN')
  async reject(@Param('id') id: string, @Body() reviewer: { notes: string }, @Req() req: Request) {
    const context = this.getGovernanceContext(req as any);
    return this.service.rejectCandidate(id, this.platformReviewer(req as any, reviewer.notes), context);
  }

  @Post(':id/request-info')
  @Roles('SUPER_ADMIN', 'PLATFORM_ADMIN')
  async requestInfo(@Param('id') id: string, @Body() reviewer: { notes: string }, @Req() req: Request) {
    const context = this.getGovernanceContext(req as any);
    return this.service.requestMoreInfo(id, this.platformReviewer(req as any, reviewer.notes), context);
  }

  @Post(':id/block')
  @Roles('SUPER_ADMIN', 'PLATFORM_ADMIN')
  async block(@Param('id') id: string, @Body() reviewer: { notes: string }, @Req() req: Request) {
    const context = this.getGovernanceContext(req as any);
    return this.service.blockCandidate(id, this.platformReviewer(req as any, reviewer.notes), context);
  }

  @Post(':id/archive')
  @Roles('SUPER_ADMIN', 'PLATFORM_ADMIN')
  async archive(@Param('id') id: string, @Body() reviewer: { notes?: string }, @Req() req: Request) {
    const context = this.getGovernanceContext(req as any);
    return this.service.archiveCandidate(id, this.platformReviewer(req as any, reviewer.notes), context);
  }
}
