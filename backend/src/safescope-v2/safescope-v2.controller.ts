import { Roles } from '../auth/decorators/roles.decorator';
import { Body, Controller, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
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


function ensureVisiblePrimaryCitationContract(response: any, observationText = ''): any {
  if (!response || typeof response !== 'object') return response;

  const primaryCitation = String(response.primaryCitation || '').trim();
  const hasVisibleStandards =
    (Array.isArray(response.suggestedStandards) && response.suggestedStandards.length > 0) ||
    (Array.isArray(response.primaryStandards) && response.primaryStandards.length > 0) ||
    (Array.isArray(response.standards) && response.standards.length > 0) ||
    (Array.isArray(response.standardsTraceability?.suggestedCitations) &&
      response.standardsTraceability.suggestedCitations.length > 0);

  const isBareOshaCitation =
    /^(?:29\s*CFR\s*)?(?:1910|1926)\.\d+(?:\([a-z0-9]+\))*$/i.test(primaryCitation);

  const isBareMshaCitation =
    /^(?:30\s*CFR\s*)?(?:56|57|75|77)\.\d+(?:\([a-z0-9]+\))*$/i.test(primaryCitation);

  const hasConcreteDefectOrExposureEvidence =
    /\b(damaged|broken|cracked|loose|uneven|missing|worn|deteriorated|defective|defect|trip hazard|tripping hazard|slip hazard|fall hazard|unguarded|exposed|blocked|obstructed|leaking|spill|spilled|frayed|cut|inoperative|not working)\b/i.test(observationText);

  const isRealCitation =
    primaryCitation &&
    !/^(review|needs more evidence|candidate standard|suggested candidate standard|fallback candidate standard|unclassified|unknown)$/i.test(primaryCitation) &&
    (isBareOshaCitation || isBareMshaCitation);

  if (!hasVisibleStandards && isRealCitation && hasConcreteDefectOrExposureEvidence) {
    const recoveredStandard = {
      citation: primaryCitation,
      title: primaryCitation,
      summary:
        'Candidate standard recovered at the API boundary because primaryCitation existed but visible standards arrays were empty.',
      status: 'candidate_standard',
      candidateStatus: 'candidate_standard',
      source: ['controller_primary_citation_contract_repair'],
      matchingReasons: [
        'The service returned a primaryCitation, but the visible standards contract was empty before API serialization.',
      ],
    };

    response.suggestedStandards = [recoveredStandard];

    response.standardsTraceability = {
      ...(response.standardsTraceability || {}),
      suggestedCitations: Array.isArray(response.standardsTraceability?.suggestedCitations)
        ? response.standardsTraceability.suggestedCitations
        : [],
    };

    if (!response.standardsTraceability.suggestedCitations.includes(primaryCitation)) {
      response.standardsTraceability.suggestedCitations.push(primaryCitation);
    }
  }

  return response;
}


@Controller('safescope-v2')
export class SafescopeV2Controller {
  constructor(private readonly service: SafescopeV2Service) {}

  private requireUserId(user: any): string {
    const userId = user?.userId || user?.id || user?.sub;

    if (!userId) {
      throw new UnauthorizedException('Authenticated user context is required.');
    }

    return String(userId);
  }

  private getLocalDevBypassUserId(): string {
    if (
      process.env.DEV_AUTH_BYPASS === 'true' &&
      process.env.NODE_ENV !== 'production'
    ) {
      return 'local-dev-bypass-user';
    }

    throw new UnauthorizedException('Authenticated user context is required.');
  }

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
              userId: this.getLocalDevBypassUserId(),
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
              userId: this.requireUserId(user),
              workspaceId: 'default',
              role: 'viewer',
              planTier: 'individual',
              jurisdictionScopes: [],
              reviewerQualifications: []
          };
      }

      return {
          userId: this.requireUserId(user),
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

      return ensureVisiblePrimaryCitationContract(sanitizeHazLenzDisplayOutput(result), body.text);
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
