import { Roles } from '../auth/decorators/roles.decorator';
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { SafescopeV2Service } from './safescope-v2.service';
import { ClassifyDto } from './dto/classify.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { EntitlementGuard, RequireEntitlement } from '../auth/entitlements/entitlement.guard';
import { VisualEvidenceReasoningInput } from './visual-evidence-reasoning/visual-evidence-reasoning.types';
import { RealImageAnalysisInput } from './real-image-analysis/real-image-analysis.types';
import { OfflineReasoningInput } from './offline-reasoning-mobile-resilience/offline-reasoning-mobile-resilience.types';
import { UserGovernanceContext, SafeScopeRole } from './workspace-governance-access/workspace-governance.types';

@Controller('safescope-v2')
export class SafescopeV2Controller {
  constructor(private readonly service: SafescopeV2Service) {}

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

      // Fail-safe defaults for missing context
      if (!user) {
          return {
              userId: 'anonymous',
              workspaceId: 'default',
              role: 'viewer',
              planTier: 'individual',
              jurisdictionScopes: [],
              reviewerQualifications: []
          };
      }

      return {
          userId: user.id || 'anonymous',
          workspaceId: user.organizationId || user.workspaceId || 'default',
          role: roleMap[user.role] || 'viewer',
          planTier: user.planTier || 'individual',
          jurisdictionScopes: [],
          reviewerQualifications: []
      };
  }

  @UseGuards(JwtGuard, EntitlementGuard)
  @RequireEntitlement('fullSafeScope')
  @Roles('ORG_OWNER', 'SAFETY_DIRECTOR', 'SUPERVISOR', 'AUDITOR', 'WORKER')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Post('classify')
  async classify(@Body() body: ClassifyDto, @Req() req: Request & { user?: any }) {
    const context = this.getGovernanceContext(req);

    try {
      return await this.service.classify(
        body.text,
        body.scopes,
        body.evidenceTexts,
        body.riskProfileId,
        body.workspaceId || context.workspaceId,
        body.priorFindings,
        body.visualAttachments,
        context
      );
    } catch (error) {
      console.error('SafeScope v2 classify failed:', error);
      throw error; // Rethrow to let Nest handle ForbiddenException etc.
    }
  }

  @UseGuards(JwtGuard)
  @Roles('ORG_OWNER', 'SAFETY_DIRECTOR', 'SUPERVISOR', 'AUDITOR', 'WORKER')
  @Post('visual-evidence/evaluate')
  async evaluateVisualEvidence(@Body() input: VisualEvidenceReasoningInput, @Req() req: Request & { user?: any }) {
    const context = this.getGovernanceContext(req);
    try {
      return await this.service.evaluateVisualEvidence(input, context);
    } catch (error) {
      console.error('SafeScope v2 visual evidence evaluation failed:', error);
      throw error;
    }
  }

  @UseGuards(JwtGuard)
  @Roles('ORG_OWNER', 'SAFETY_DIRECTOR', 'SUPERVISOR', 'AUDITOR', 'WORKER')
  @Post('real-image-analysis/evaluate')
  async evaluateRealImage(@Body() input: RealImageAnalysisInput, @Req() req: Request & { user?: any }) {
    const context = this.getGovernanceContext(req);
    try {
      return await this.service.evaluateRealImage(input, context);
    } catch (error) {
      console.error('SafeScope v2 real image analysis failed:', error);
      throw error;
    }
  }

  @UseGuards(JwtGuard)
  @Roles("ORG_OWNER", "SAFETY_DIRECTOR", "SUPERVISOR", "AUDITOR", "WORKER")
  @Post("offline/evaluate")
  async evaluateOffline(@Body() input: OfflineReasoningInput, @Req() req: Request & { user?: any }) {
    const context = this.getGovernanceContext(req);
    try {
      return await this.service.evaluateOffline(input, context);
    } catch (error) {
      console.error("SafeScope v2 offline evaluation failed:", error);
      throw error;
    }
  }
}
