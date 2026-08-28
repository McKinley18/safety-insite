import { Roles } from '../auth/decorators/roles.decorator';
import { Body, Controller, Optional, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { GovernedCutoverContext } from '../standards/cutover/governed-cutover-context';
import { orchestrateShadowRequest } from '../standards/cutover/shadow-request-orchestration';
import { resolveCutoverEnablement } from '../standards/cutover/cutover-mode';
import { resolveInspectionReleaseBinding } from '../standards/releases/inspection-release-binding';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { SafescopeV2Service } from './safescope-v2.service';
import { ClassifyDto } from './dto/classify.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { EntitlementGuard, RequireEntitlement } from '../auth/entitlements/entitlement.guard';
import { VisualEvidenceReasoningInput } from './visual-evidence-reasoning/visual-evidence-reasoning.types';
import { RealImageAnalysisInput } from './real-image-analysis/real-image-analysis.types';
import { OfflineReasoningInput } from './offline-reasoning-mobile-resilience/offline-reasoning-mobile-resilience.types';
import { UserGovernanceContext, SafeScopeRole } from './workspace-governance-access/workspace-governance.types';
import { sanitizeHazLenzDisplayOutput } from "./display/hazlenz-display-sanitizer";
import { enforceHazLenzEvidenceBoundary } from './display/hazlenz-evidence-boundary';
import { applyEvidenceFoundation, applyFindingScopedStandards } from './evidence/evidence-foundation';
import { applyFinalizationGate } from './evidence/finalization-gate';
import { normalizeHazardObservationText } from './display/hazlenz-evidence-boundary';
import { attachGuidedFindingResponse } from './display/guided-finding-response';
import { InspectionService } from '../inspection/inspection.service';
import { regulatoryContextProvenance } from '../inspection/inspection.entity';

/**
 * Maps the inspection-level regulatory context onto BOTH jurisdiction vocabularies the
 * classify pipeline consumes (structuredObservation.jurisdiction for the evidence-fact /
 * applicability engine, and `scopes` for the classifier's standards search), so the two
 * engines can never disagree about which regime governs the inspection.
 */
function scopesForRegulatoryContext(context: string): string[] | undefined {
  switch (context) {
    case 'msha': return ['msha'];
    case 'osha-general-industry': return ['osha_general_industry'];
    case 'osha-construction': return ['osha_construction'];
    default: return undefined;
  }
}


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

function enforceVerifiedControlDisplay(response: any, observationText: string): any {
  if (!response || typeof response !== 'object') return response;
  const text = String(observationText || '');
  const verified =
    /guard[^.]{0,120}(?:fixed|interlocked)[^.]{0,60}(?:tested|prevents? access|cannot reach)/i.test(text) ||
    /(?:stopped|deenergized|locked out|zero energy verified)[^.]{0,120}(?:log|record|tested|verified)/i.test(text) ||
    /(?:sealed|closed)[^.]{0,100}(?:labeled|labelled|inventoried)[^.]{0,100}(?:no release|no exposure)/i.test(text) ||
    /(?:behind|within)[^.]{0,80}(?:complete guardrail|fall-arrest system)[^.]{0,80}(?:attached|protected)/i.test(text);
  if (!verified) return response;
  const controlledFragment = (fragment: unknown) => {
    const value = String(fragment || '');
    return (
      (/(?:sealed|closed)[^.]{0,100}(?:labeled|labelled|inventoried)?/i.test(value) && /\b(?:no active release|no release|no exposure)\b/i.test(text)) ||
      /(?:sealed|closed)[^.]{0,100}(?:labeled|labelled|inventoried)[^.]{0,100}(?:no release|no exposure)/i.test(value) ||
      /guard[^.]{0,120}(?:fixed|interlocked)[^.]{0,60}(?:tested|prevents? access|cannot reach)/i.test(value) ||
      /(?:stopped|deenergized|locked out|zero energy verified)[^.]{0,120}(?:log|record|tested|verified)/i.test(value) ||
      /(?:behind|within)[^.]{0,80}(?:complete guardrail|fall-arrest system)[^.]{0,80}(?:attached|protected)/i.test(value)
    );
  };
  const preservedAdditionalHazards = Array.isArray(response.additionalHazards)
    ? response.additionalHazards.filter((hazard: any) => {
      const state = String(hazard?.conditionState || '').toUpperCase();
      return !controlledFragment(hazard?.observationFragment) && !['HISTORICAL', 'SAFE_VERIFIED'].includes(state);
    })
    : [];
  const originalDecomposition = response.multiHazardDecomposition && typeof response.multiHazardDecomposition === 'object'
    ? response.multiHazardDecomposition
    : null;
  const preservedDecompositionHazards = Array.isArray(originalDecomposition?.hazards)
    ? originalDecomposition.hazards.filter((hazard: any) => {
      const state = String(hazard?.conditionState || '').toUpperCase();
      return !controlledFragment(hazard?.observationFragment) && !['HISTORICAL', 'SAFE_VERIFIED'].includes(state);
    })
    : [];
  const preservedDecomposition = originalDecomposition
    ? {
      ...originalDecomposition,
      hazards: preservedDecompositionHazards,
      hazardCount: preservedDecompositionHazards.length,
      isMultiHazard: preservedDecompositionHazards.length > 1,
      primaryHazard: preservedDecompositionHazards[0],
    }
    : { hazards: [], hazardCount: 0, isMultiHazard: false };
  return {
    ...response,
    classification: 'Controlled Condition',
    family: 'controlled_condition',
    hazardCategory: 'controlled_condition',
    primaryCitation: '',
    primaryStandard: null,
    suggestedStandards: [],
    primaryStandards: [],
    standards: [],
    supportingStandards: [],
    additionalHazards: preservedAdditionalHazards,
    multiHazardDecomposition: preservedDecomposition,
    requiresHumanReview: true,
    reviewStateLabel: 'Controlled state — qualified review required',
    assessmentDisposition: 'controlled_condition_requires_qualified_review',
  };
}


@Controller('safescope-v2')
export class SafescopeV2Controller {
  constructor(
    private readonly service: SafescopeV2Service,
    private readonly inspections: InspectionService,
    /**
     * KG-4A. Optional so every existing construction site (tests, harnesses, module wiring that
     * predates KG-4A) keeps working unchanged; without it the cutover context can never pin a
     * release and every mode degrades to legacy behaviour, which is the safe direction.
     */
    @Optional() private readonly dataSource?: DataSource,
  ) {}

  /**
   * Inspection-level regulatory context is the authoritative source of jurisdiction for
   * every observation in a persisted inspection. When the client identifies the inspection,
   * load its persisted context (authorization-checked exactly like every other inspection
   * read) and apply it to the request -- overriding whatever jurisdiction/scopes the client
   * sent, so a stale or missing client-side value can never make one finding evaluate under
   * a different regime than its siblings. An 'unknown' inspection context leaves HazLenz free
   * to infer from evidence or ask once; it does NOT override a jurisdiction the client did
   * confirm on the request itself (e.g. an answered clarification the UI is about to persist).
   */
  private async applyInspectionRegulatoryContext(body: ClassifyDto, user: unknown): Promise<void> {
    if (!body.inspectionId) {
      // Without a persisted inspection there is no inspection-level provenance to claim: a
      // client-supplied regulatoryContext is just another explicit request jurisdiction.
      const claimed = body.regulatoryContext?.value;
      delete body.regulatoryContext;
      if (claimed && claimed !== 'unknown' && !body.structuredObservation?.jurisdiction) {
        body.structuredObservation = { ...(body.structuredObservation || {}), jurisdiction: claimed };
      }
      return;
    }
    const inspection = await this.inspections.findAccessible(user, body.inspectionId);
    const value = inspection.regulatoryContext || 'unknown';
    const provenance = regulatoryContextProvenance(value);
    if (provenance === 'USER_CONFIRMED') {
      body.structuredObservation = { ...(body.structuredObservation || {}), jurisdiction: value };
      body.scopes = scopesForRegulatoryContext(value);
      body.regulatoryContext = { value, provenance, source: 'inspection', inspectionId: inspection.id };
      return;
    }
    const clientJurisdiction = body.structuredObservation?.jurisdiction;
    if (clientJurisdiction && clientJurisdiction !== 'unknown') {
      body.regulatoryContext = { value: clientJurisdiction, provenance: 'USER_CONFIRMED', source: 'request', inspectionId: inspection.id };
      return;
    }
    body.regulatoryContext = { value: 'unknown', provenance: 'UNKNOWN', source: 'inspection', inspectionId: inspection.id };
  }

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
          'INDIVIDUAL': 'field_inspector',
          'MEMBER': 'field_inspector',
          'MANAGER': 'safety_manager',
          'ORGANIZATION_ADMIN': 'admin',
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

  @UseGuards(JwtGuard, EntitlementGuard, RolesGuard)
  @RequireEntitlement('fullSafeScope')
  @Roles('INDIVIDUAL', 'MEMBER', 'MANAGER', 'ORGANIZATION_ADMIN', 'ORG_OWNER', 'SAFETY_DIRECTOR', 'SUPERVISOR', 'AUDITOR', 'WORKER')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Post('classify')
  async classify(@Body() body: ClassifyDto, @Req() req: Request & { user?: any }) {
    const context = this.getGovernanceContext(req);
    await this.applyInspectionRegulatoryContext(body, req.user);

    // RELEASE BINDING, resolved BEFORE the analysis and exactly once.
    //
    // This is the sibling of `applyInspectionRegulatoryContext` above and follows the same rule:
    // the INSPECTION is the authority for a regulatory fact every one of its findings inherits.
    // Jurisdiction was already such a fact; the governing knowledge release is the other one.
    //
    // Resolved here, at the controller, because this is the only place that holds all three inputs
    // at once -- the authenticated principal (which decides the mode), the persisted inspection
    // (which may already carry a binding), and the data source. `body.inspectionId` was already
    // authorization-checked by `applyInspectionRegulatoryContext`, so no unauthorized inspection
    // can be read or bound here.
    //
    // In LEGACY -- every customer today -- the resolver returns before touching the database, so
    // this line performs no query and the binding stays null.
    const releaseBinding = await resolveInspectionReleaseBinding({
      dataSource: this.dataSource ?? null,
      inspectionId: body.inspectionId ?? null,
      mode: resolveCutoverEnablement({
        userId: req.user?.userId ?? null, organizationId: req.user?.organizationId ?? null,
      }).effectiveMode,
    });

    try {
      const result = await this.service.classify(
        normalizeHazardObservationText(body.text),
        body.scopes,
        body.evidenceTexts,
        body.riskProfileId,
        body.workspaceId || context.workspaceId,
        body.priorFindings,
        body.visualAttachments,
        context,
        body.debugMetadata,
        body.structuredObservation,
        body.clarificationAnswers,
        body.priorStructuredObservation,
      );

      // KG-4A / KG-4D. THE customer-visible standards pipeline, as a closure.
      //
      // Everything from the evidence boundary to the final serialization lives here so it can be
      // executed with or without a governed cutover context. It begins AFTER the AI analysis is
      // complete and closes over that already-computed `result`, so re-running it re-runs
      // hydration and display -- never a model call.
      //
      // `pristine` decides whether this invocation runs on the ORIGINAL analysis object or on a
      // copy, and the distinction is load-bearing.
      //
      //   pristine: true   -- runs on `result` itself, exactly as the pre-integration controller
      //                       did. This is the invocation whose output the customer receives, so
      //                       the customer payload is produced by a code path that copies nothing.
      //   pristine: false  -- runs on a JSON copy, because the chain mutates the foundation in
      //                       place and two invocations sharing one object would compare an object
      //                       against itself. Only the shadow comparison uses these.
      //
      // WHY NOT `structuredClone`. The analysis result carries a class reference
      // (`ApprovedKnowledgeRegistryValidator`), and `structuredClone` throws `DataCloneError` on it
      // -- which turned every classify request into an HTTP 500 the first time this was wired. A
      // JSON copy drops functions and class references, which is correct here: they are internal
      // machinery, never customer-visible output. Found by the Phase 3 real-HTTP baseline, not by
      // a helper test, which is precisely why Phase 3 requires real requests.
      const runStandardsPipeline = async (
        cutover: GovernedCutoverContext | null,
        options: { pristine: boolean },
      ) => {
        const source = options.pristine ? result : JSON.parse(JSON.stringify(result));
        const foundation = await this.service.hydrateFindingScopedStandards(
          applyFindingScopedStandards(applyEvidenceFoundation(enforceHazLenzEvidenceBoundary(source, body), body), body),
          cutover,
        );
        const guided = enforceVerifiedControlDisplay(attachGuidedFindingResponse(ensureVisiblePrimaryCitationContract(
          sanitizeHazLenzDisplayOutput(
            applyFinalizationGate(foundation),
          ),
          body.text,
        ), body), body.text);
        // Re-apply the evidence boundary after the compatibility response adapter
        // so legacy serialization cannot reintroduce a suppressed citation.
        return enforceHazLenzEvidenceBoundary(guided, body);
      };

      // KG-4D. The ONE orchestration boundary for governed/shadow execution.
      //
      // Authorization, the kill switch, the circuit breaker, the customer-output invariance hash,
      // the SHADOW provenance invariant, privacy-safe telemetry and the operational metrics are all
      // decided in `orchestrateShadowRequest()` rather than scattered through this controller.
      //
      // For a LEGACY request -- every customer today -- it calls the pipeline exactly once with a
      // null context and returns its payload unchanged; no code in `standards/cutover/` executes.
      // In SHADOW it returns the LEGACY-branch payload, computed by a run the governed resolver
      // never touched, which is what makes shadow invisibility structural rather than measured.
      const orchestrated = await orchestrateShadowRequest({
        dataSource: this.dataSource ?? null,
        principal: { userId: req.user?.userId ?? null, organizationId: req.user?.organizationId ?? null },
        analysisTraceId: (result as any)?.traceId ?? null,
        // Server-resolved above. Retrieval is scoped to this release; it is never a release id the
        // request supplied, and it is never re-derived from the active pointer per finding.
        boundReleaseId: releaseBinding.releaseId,
        jurisdiction: (result as any)?.regulatoryContext?.value ?? null,
        runPipeline: runStandardsPipeline,
      });

      return orchestrated.payload;
    } catch (error) {
      console.error('SafeScope v2 classify failed:', error);
      throw error; // Rethrow to let Nest handle ForbiddenException etc.
    }
  }

  @UseGuards(JwtGuard, EntitlementGuard, RolesGuard)
  @RequireEntitlement('fullSafeScope')
  @Roles('INDIVIDUAL', 'MEMBER', 'MANAGER', 'ORGANIZATION_ADMIN', 'ORG_OWNER', 'SAFETY_DIRECTOR', 'SUPERVISOR', 'AUDITOR', 'WORKER')
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

  @UseGuards(JwtGuard, EntitlementGuard, RolesGuard)
  @RequireEntitlement('fullSafeScope')
  @Roles('INDIVIDUAL', 'MEMBER', 'MANAGER', 'ORGANIZATION_ADMIN', 'ORG_OWNER', 'SAFETY_DIRECTOR', 'SUPERVISOR', 'AUDITOR', 'WORKER')
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

  @UseGuards(JwtGuard, EntitlementGuard, RolesGuard)
  @RequireEntitlement('fullSafeScope')
  @Roles("INDIVIDUAL", "MEMBER", "MANAGER", "ORGANIZATION_ADMIN", "ORG_OWNER", "SAFETY_DIRECTOR", "SUPERVISOR", "AUDITOR", "WORKER")
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
