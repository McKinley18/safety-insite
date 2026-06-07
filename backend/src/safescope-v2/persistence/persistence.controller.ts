import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { SafeScopePersistenceService } from './persistence.service';
import { AuditRecordFilter, AuditRecordType } from './persistence.types';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Request } from 'express';
import { UserGovernanceContext, SafeScopeRole } from '../workspace-governance-access/workspace-governance.types';

@Controller('safescope-v2/persistence')
@UseGuards(JwtGuard)
export class SafeScopePersistenceController {
  constructor(private readonly service: SafeScopePersistenceService) {}

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

  @Get('audit-records')
  @Roles('ORG_OWNER', 'SAFETY_DIRECTOR', 'SUPERVISOR', 'AUDITOR', 'SUPER_ADMIN')
  async getAuditRecords(@Query() filter: AuditRecordFilter, @Req() req: Request) {
    const context = this.getGovernanceContext(req as any);
    return this.service.find(filter, context);
  }

  @Get('audit-records/trail')
  @Roles('ORG_OWNER', 'SAFETY_DIRECTOR', 'SUPERVISOR', 'AUDITOR', 'SUPER_ADMIN')
  async getAuditTrail(
    @Query('inspectionId') inspectionId?: string,
    @Query('observationId') observationId?: string,
    @Query('traceId') traceId?: string,
    @Req() req?: Request
  ) {
    const context = this.getGovernanceContext(req as any);
    return this.service.find({ inspectionId, observationId, traceId }, context);
  }

  @Get('audit-records/candidates')
  @Roles('ORG_OWNER', 'SAFETY_DIRECTOR', 'SUPERVISOR', 'AUDITOR', 'SUPER_ADMIN')
  async getCandidates(@Query('status') status?: string, @Req() req?: Request) {
    const context = this.getGovernanceContext(req as any);
    return this.service.find({ type: 'reviewer_candidate', status }, context);
  }
}
