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
import { sanitizeHazLenzDisplayOutput } from "./display/hazlenz-display-sanitizer";

@Controller('safescope-v2')
export class SafescopeV2Controller {
  constructor(private readonly service: SafescopeV2Service) {}

  private getGovernanceContext(req: Request & { user?: any }): UserGovernanceContext {
      const user = req.user;
      const roleMap: Record<string, SafeScopeRole> = {
          'ORG_OWNER': 'owner',
          'OWNER': 'owner',
          'SUPER_ADMIN': 'admin',
          'ADMIN': 'admin',
          'SAFETY_DIRECTOR': 'safety_manager',
          'SAFETY_MANAGER': 'safety_manager',
          'SUPERVISOR': 'safety_manager',
          'AUDITOR': 'compliance_admin',
          'COMPLIANCE_ADMIN': 'compliance_admin',
          'WORKER': 'field_inspector',
          'FIELD_INSPECTOR': 'field_inspector',
          'VIEWER': 'viewer'
      };

      const normalizeRole = (value?: string) =>
          String(value || '')
              .trim()
              .replace(/([a-z])([A-Z])/g, '$1_$2')
              .replace(/[\s-]+/g, '_')
              .toUpperCase();

      const localDevAuthBypassEnabled =
          process.env.DEV_AUTH_BYPASS === 'true' &&
          process.env.NODE_ENV !== 'production';

      const normalizedRole = user ? normalizeRole(user.role) : '';
      const mappedRole = user ? roleMap[normalizedRole] || 'viewer' : 'viewer';

      // Local/dev bypass should behave like an operational test user so the UI can exercise SafeScope.
      // Production and normal unauthenticated requests remain fail-safe as viewer.
      if (localDevAuthBypassEnabled && (!user || mappedRole === 'viewer')) {
          return {
              userId: user?.id || 'dev-local-user',
              workspaceId: user?.organizationId || user?.workspaceId || 'dev-local-workspace',
              role: 'safety_manager',
              planTier: 'company',
              jurisdictionScopes: ['msha', 'osha_general_industry', 'osha_construction'],
              reviewerQualifications: ['local_development']
          };
      }

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
          userId: user.userId || user.id || 'anonymous',
          workspaceId: user.organizationId || user.workspaceId || 'default',
          role: mappedRole,
          planTier: user.planTier || user.planCode || user.organizationPlanCode || 'individual',
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
      const result = await this.service.classify(
        body.text,
        body.scopes,
        body.evidenceTexts,
        body.riskProfileId,
        body.workspaceId || context.workspaceId,
        body.priorFindings,
        body.visualAttachments,
        context,
        body.debugMetadata,
      );

      return sanitizeHazLenzDisplayOutput(result);
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
      const result = await this.service.evaluateVisualEvidence(input, context);
      return sanitizeHazLenzDisplayOutput(result);
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
      const result = await this.service.evaluateRealImage(input, context);
      return sanitizeHazLenzDisplayOutput(result);
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
      const result = await this.service.evaluateOffline(input, context);
      return sanitizeHazLenzDisplayOutput(result);
    } catch (error) {
      console.error("SafeScope v2 offline evaluation failed:", error);
      throw error;
    }
  }
}
