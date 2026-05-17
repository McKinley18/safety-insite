import { Roles } from '../auth/decorators/roles.decorator';
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { SafescopeV2Service } from './safescope-v2.service';
import { ClassifyDto } from './dto/classify.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { EntitlementGuard, RequireEntitlement } from '../auth/entitlements/entitlement.guard';

@Controller('safescope-v2')
export class SafescopeV2Controller {
  constructor(private readonly service: SafescopeV2Service) {}

  @UseGuards(JwtGuard, EntitlementGuard)
  @RequireEntitlement('fullSafeScope')
  @Roles('ORG_OWNER', 'SAFETY_DIRECTOR', 'SUPERVISOR', 'AUDITOR', 'WORKER')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Post('classify')
  async classify(@Body() body: ClassifyDto, @Req() req: Request & { user?: any }) {
    const workspaceId = req.user?.organizationId || req.user?.workspaceId;

    try {
      return await this.service.classify(
        body.text,
        body.scopes,
        body.evidenceTexts,
        body.riskProfileId,
        workspaceId,
      );
    } catch (error) {
      console.error('SafeScope v2 classify failed:', error);

      return {
        classification: 'Review Required',
        confidence: 0.5,
        confidenceBand: 'review_required',
        evidenceTokens: [],
        ambiguityWarnings: ['SafeScope full intelligence failed in production fallback mode.'],
        requiresHumanReview: true,
        explanation: 'SafeScope could not complete the full intelligence workflow. Manual review is required.',
        commonConsequences: [],
        requiredControls: [],
        score: 0,
        scoreMargin: 0,
        excludedHazards: [],
        suggestedStandards: [],
        excludedStandards: [],
        risk: null,
        evidenceFusion: {
          combinedNarrative: body.text || '',
          inferredThemes: [],
          signalDensity: 0,
          reasoning: ['Fallback response returned by controller.'],
        },
        expandedContext: null,
        confidenceIntelligence: {
          overallConfidence: 0.5,
          confidenceBand: 'review_required',
          strengths: ['Request reached SafeScope.'],
          missingCriticalInformation: ['Production SafeScope intelligence failed before completion.'],
          conflictingSignals: [],
          recommendedFollowup: ['Manually review hazard classification, standards, and corrective actions.'],
        },
        generatedActions: [],
        additionalHazards: [],
        fallbackMode: true,
      };
    }
  }
}
