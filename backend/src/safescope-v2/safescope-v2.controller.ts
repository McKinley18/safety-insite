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
        body.priorFindings,
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

  @UseGuards(JwtGuard)
  @Roles('ORG_OWNER', 'SAFETY_DIRECTOR', 'SUPERVISOR', 'AUDITOR', 'WORKER')
  @Post('visual-evidence/evaluate')
  async evaluateVisualEvidence(@Body() input: VisualEvidenceReasoningInput) {
    try {
      return await this.service.evaluateVisualEvidence(input);
    } catch (error) {
      console.error('SafeScope v2 visual evidence evaluation failed:', error);
      return {
          version: 'visual_evidence_reasoning_v1',
          evidencePresence: 'unclear',
          visualSupportLevel: 'not_evaluated',
          photoEvidenceScore: 0,
          linkedAttachmentCount: input.attachments?.length || 0,
          relevantAttachmentIds: [],
          missingVisualEvidence: [],
          visualConsistencyFlags: [],
          reviewerQuestions: ['SafeScope visual reasoning failed to process. Manual verification required.'],
          confidenceImpact: 'neutral',
          advisoryBoundary: 'SafeScope visual evidence reasoning is advisory only.'
      };
    }
  }

  @UseGuards(JwtGuard)
  @Roles('ORG_OWNER', 'SAFETY_DIRECTOR', 'SUPERVISOR', 'AUDITOR', 'WORKER')
  @Post('real-image-analysis/evaluate')
  async evaluateRealImage(@Body() input: RealImageAnalysisInput) {
    try {
      return await this.service.evaluateRealImage(input);
    } catch (error) {
      console.error('SafeScope v2 real image analysis failed:', error);
      return {
          version: "real_image_analysis_v1",
          imageCount: input.imageInputs?.length || 0,
          visualSignals: [],
          imageEvidenceSummary: "Error during real image analysis.",
          visualConfidenceImpact: "neutral",
          imageEvidenceLimitations: ["Service error"],
          recommendedPhotoFollowups: ["Retry analysis or manually verify photos."],
          requiresHumanVerification: true,
          advisoryBoundary: "SafeScope real image analysis is advisory only."
      };
    }
  }
}
