import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ReviewerCandidateConsoleService } from './reviewer-candidate-console.service';
import { CandidateFilter } from './reviewer-candidate-console.types';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { Request } from 'express';
import { UserGovernanceContext, SafeScopeRole } from '../workspace-governance-access/workspace-governance.types';

@Controller('safescope/reviewer-candidates')
@UseGuards(JwtGuard)
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
          userId: user?.id || 'anonymous',
          workspaceId: user?.organizationId || user?.workspaceId || 'default',
          role: roleMap[user?.role] || 'viewer',
          planTier: user?.planTier || 'team',
          jurisdictionScopes: [],
          reviewerQualifications: []
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
  async approve(@Param('id') id: string, @Body() reviewer: { name: string, role: string, notes?: string }, @Req() req: Request) {
    const context = this.getGovernanceContext(req as any);
    return this.service.approveCandidate(id, reviewer, context);
  }

  @Post(':id/reject')
  async reject(@Param('id') id: string, @Body() reviewer: { name: string, role: string, notes: string }, @Req() req: Request) {
    const context = this.getGovernanceContext(req as any);
    return this.service.rejectCandidate(id, reviewer, context);
  }

  @Post(':id/request-info')
  async requestInfo(@Param('id') id: string, @Body() reviewer: { name: string, role: string, notes: string }, @Req() req: Request) {
    const context = this.getGovernanceContext(req as any);
    return this.service.requestMoreInfo(id, reviewer, context);
  }

  @Post(':id/block')
  async block(@Param('id') id: string, @Body() reviewer: { name: string, role: string, notes: string }, @Req() req: Request) {
    const context = this.getGovernanceContext(req as any);
    return this.service.blockCandidate(id, reviewer, context);
  }

  @Post(':id/archive')
  async archive(@Param('id') id: string, @Body() reviewer: { name: string, role: string, notes?: string }, @Req() req: Request) {
    const context = this.getGovernanceContext(req as any);
    return this.service.archiveCandidate(id, reviewer, context);
  }
}
