import { Roles } from '../auth/decorators/roles.decorator';
import { Body, Controller, Optional, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { GovernedCutoverContext } from '../standards/cutover/governed-cutover-context';
import { orchestrateShadowRequest } from '../standards/cutover/shadow-request-orchestration';
import { resolveCutoverEnablement } from '../standards/cutover/cutover-mode';
import { resolveInspectionReleaseBinding } from '../standards/releases/inspection-release-binding';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { HazLenzService } from './hazlenz.service';
import { ClassifyDto } from './dto/classify.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { EntitlementGuard, RequireEntitlement } from '../auth/entitlements/entitlement.guard';
import { VisualEvidenceReasoningInput } from './visual-evidence-reasoning/visual-evidence-reasoning.types';
import { RealImageAnalysisInput } from './real-image-analysis/real-image-analysis.types';
import { OfflineReasoningInput } from './offline-reasoning-mobile-resilience/offline-reasoning-mobile-resilience.types';
import { UserGovernanceContext } from './workspace-governance-access/workspace-governance.types';
import {
  localDevBypassUserId, requireGovernanceUserId, resolveHazLenzGovernanceContext,
} from './workspace-governance-access/hazlenz-governance-context';
import { scopesForRegulatoryContext } from './evidence/regulatory-scopes';
import { sanitizeHazLenzDisplayOutput } from "./display/hazlenz-display-sanitizer";
import { enforceHazLenzEvidenceBoundary } from './display/hazlenz-evidence-boundary';
import { applyEvidenceFoundation, applyFindingScopedStandards } from './evidence/evidence-foundation';
import { applyFinalizationGate } from './evidence/finalization-gate';
import { normalizeHazardObservationText } from './display/hazlenz-evidence-boundary';
import { attachGuidedFindingResponse } from './display/guided-finding-response';
import { InspectionService } from '../inspection/inspection.service';
import { regulatoryContextProvenance } from '../inspection/inspection.entity';

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

/**
 * §276 — A HAZARD THE ENGINE ITSELF CALLED VERIFIED SAFE IS NOT A PROPOSED FINDING.
 *
 * ==================== THE DEFECT THIS EXISTS TO FIX ====================
 *
 * §276 drove a deliberately SAFE observation as a product path:
 *
 *   "The fixed guard on the bench grinder in the maintenance shop is in place, correctly
 *    adjusted and secured with all fasteners present. The tool rest is set within one
 *    eighth of an inch of the wheel. Nobody was working at the grinder and it was switched
 *    off and isolated at the wall."
 *
 * The interface answered "HazLenz found 2 possible findings", offered a `hot_work` hazard
 * built from that entire sentence, and pre-ticked a candidate. The engine had ALREADY
 * decided the truth: that hazard carried `conditionState: SAFE_VERIFIED`.
 *
 * The rule existed. `enforceVerifiedControlDisplay` below drops `SAFE_VERIFIED` and
 * `HISTORICAL` hazards -- but only after a gate that requires the WHOLE observation text to
 * match one of four narrow phrasings ("guard ... tested", "locked out ... verified", ...).
 * An inspector who writes "in place, correctly adjusted and secured with all fasteners
 * present" matches none of them, so the engine's own per-hazard determination was discarded
 * in favour of a regex that had not been taught that wording.
 *
 * This applies the same rule unconditionally. It is a SCOPING correction, not a semantic
 * one: nothing here decides whether a condition is safe -- the engine already did that, per
 * hazard -- and nothing is invented. What changes is that the product stops proposing as a
 * hazard something its own analysis records as verified safe or historical.
 *
 * The narrower `enforceVerifiedControlDisplay` is left in place and still runs: it does more
 * than this filter (it also rewrites the standards display for a verified control), and
 * removing it would be a separate change with a separate justification.
 */
/**
 * §277 / D-024b — A CUSTOMER-VISIBLE CANDIDATE NEEDS MORE THAN A MATCHED WORD.
 *
 * ==================== THE DEFECT THIS EXISTS TO FIX ====================
 *
 * §276 drove a deliberately SAFE observation -- a bench grinder correctly guarded, tool
 * rest set, switched off and "isolated at the wall" -- and the product proposed a
 * `ground_control` hazard from it. The whole of that hazard's evidence was the single word
 * **"wall"**: mechanism `wall`, supporting signals `['wall']`, routing confidence **0.2**,
 * and no standard matched. An inspector documenting a compliant machine was told there was
 * a hazard, and had to dismiss it.
 *
 * ==================== THE RULE (D-024b) ====================
 *
 * The floor for ordinary customer-visible candidate routing is **0.50**. A candidate below
 * it must not appear as a normal primary finding **solely from weak semantic/lexical
 * routing**. It may remain internal, or be surfaced as uncertain where the product has an
 * explicit state for that.
 *
 * The exception is the load-bearing half: **explicit governed deterministic evidence may
 * route a hazard regardless of semantic routing confidence, where the deterministic rule
 * independently establishes the candidate.**
 *
 * ==================== WHY THE EXCEPTION IS THE MAIN PATH, NOT A CARVE-OUT ====================
 *
 * Measured before writing this, across every §276 product path: **almost every legitimate
 * hazard routes at 0.2.** The router is a lexical matcher that fires at 0.2 on a single
 * entity word, and it does so for the real hazards and the spurious ones alike --
 *
 *   "the point of operation guard on the 60-ton punch press ... has been removed"
 *      -> machine_guarding, confidence 0.2, signals ['guard']
 *   "isolated at the wall"
 *      -> ground_control,   confidence 0.2, signals ['wall']
 *
 * A bare threshold would therefore have suppressed the §275 machine-guarding case, the MSHA
 * case and the fall-protection case along with the noise. The discriminator cannot be the
 * confidence number, and it cannot be the count or length of the matched signals either --
 * both fragments above have exactly one single-word signal.
 *
 * What separates them is whether ANYTHING OTHER THAN THE LEXICAL ROUTER supports the
 * candidate. The guarding fragment carries `29 CFR 1910.212(a)(1)`, produced by the
 * deterministic applicability engine from that finding's own evidence. The "wall" fragment
 * carries nothing. That is precisely D-024b's "solely from weak semantic/lexical routing",
 * and it is what this tests.
 *
 * A `candidate` standard counts as well as a `direct` one: the deterministic rule evaluated
 * this hazard's evidence, produced a citation and named the predicates still missing. That
 * is the engine independently establishing a candidate, and the product has an explicit
 * uncertain state for it -- the card that reads "Candidate · Confidence: Low · missing: ...".
 *
 * ==================== WHAT THIS DELIBERATELY DOES NOT DO ====================
 *
 * It does not touch `applicabilityDecisions`, `evidenceSnapshot` or any deterministic
 * conclusion. Established deterministic hazard truth is never suppressed -- the floor
 * applies to the CANDIDATE LIST a customer is shown, and a hazard the deterministic engine
 * established is exempt from it by construction.
 *
 * A withheld route is recorded in `routingNotes`, never dropped silently: a reviewer asking
 * "why did it not raise the grinder?" must be able to find the answer, and an auditor must
 * be able to see that a route was considered and set aside rather than never made.
 *
 * ==================== THE MEASURED CONSEQUENCE, STATED ====================
 *
 * This withholds a genuine hazard as well as the noise. The §276 electrical path -- a
 * missing cover plate on a 480-volt disconnect with energised terminals exposed at chest
 * height -- routes at 0.2 on the word "panel" and carries NO standard, because the governed
 * knowledge base has no electrical rule that fires on it. Under D-024b that candidate is
 * supported solely by weak lexical routing and is withheld, so the product now says it did
 * not establish a hazard rather than asserting one on a matched word.
 *
 * That is the rule working, and it exposes a real coverage gap in the governed knowledge
 * base rather than creating one. It is recorded as a §277 finding, not absorbed.
 */
export const CUSTOMER_VISIBLE_ROUTING_FLOOR = 0.5;

export function withholdWeaklyRoutedHazards(response: any): any {
  if (!response || typeof response !== 'object') return response;

  /**
   * Whether something other than the lexical router supports this candidate.
   *
   * Read from the hazard's own `standardCandidates`, which `applyFindingScopedStandards`
   * derived by running the unmodified deterministic engine over that finding's evidence,
   * and from any whole-observation decision in the same family.
   */
  const observationDecisions = Array.isArray(response.applicabilityDecisions)
    ? response.applicabilityDecisions
    : [];
  const familyOf = (value: unknown) => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const deterministicallyEstablished = (hazard: any) => {
    const candidates = Array.isArray(hazard?.standardCandidates) ? hazard.standardCandidates : [];
    if (candidates.some((item: any) => item && typeof item.citation === 'string' && item.citation.trim())) {
      return true;
    }
    const hazardFamilies = new Set([familyOf(hazard?.domainId), familyOf(hazard?.hazardFamily)].filter(Boolean));
    return observationDecisions.some((decision: any) =>
      hazardFamilies.has(familyOf(decision?.family)) && String(decision?.status || '') !== 'NOT_APPLICABLE');
  };

  const belowFloor = (hazard: any) => {
    const confidence = Number(hazard?.confidence);
    if (!Number.isFinite(confidence)) return false;
    return confidence < CUSTOMER_VISIBLE_ROUTING_FLOOR;
  };

  const withheld = (hazard: any) => belowFloor(hazard) && !deterministicallyEstablished(hazard);

  const decomposition = response.multiHazardDecomposition;
  if (decomposition && typeof decomposition === 'object' && Array.isArray(decomposition.hazards)) {
    const kept = decomposition.hazards.filter((hazard: any) => !withheld(hazard));
    if (kept.length !== decomposition.hazards.length) {
      response.multiHazardDecomposition = {
        ...decomposition,
        hazards: kept,
        hazardCount: kept.length,
        isMultiHazard: kept.length > 1,
        primaryHazard: kept.find((hazard: any) => hazard === decomposition.primaryHazard) || kept[0],
        routingNotes: [
          ...(Array.isArray(decomposition.routingNotes) ? decomposition.routingNotes : []),
          ...decomposition.hazards.filter(withheld).map((hazard: any) =>
            `Not proposed as a finding: ${hazard?.domainId || 'hazard'} was routed at confidence `
            + `${hazard?.confidence} on ${JSON.stringify(hazard?.supportingSignals || [])} with no governed `
            + `standard, which is below the ${CUSTOMER_VISIBLE_ROUTING_FLOOR} customer-visible routing floor.`),
        ],
      };
    }
  }

  if (Array.isArray(response.additionalHazards)) {
    response.additionalHazards = response.additionalHazards.filter((hazard: any) => !withheld(hazard));
  }

  return response;
}

function withdrawResolvedHazards(response: any): any {
  if (!response || typeof response !== 'object') return response;

  const isResolved = (hazard: any) =>
    ['SAFE_VERIFIED', 'HISTORICAL'].includes(String(hazard?.conditionState || '').toUpperCase());

  const decomposition = response.multiHazardDecomposition;
  if (decomposition && typeof decomposition === 'object' && Array.isArray(decomposition.hazards)) {
    const kept = decomposition.hazards.filter((hazard: any) => !isResolved(hazard));
    if (kept.length !== decomposition.hazards.length) {
      response.multiHazardDecomposition = {
        ...decomposition,
        hazards: kept,
        hazardCount: kept.length,
        isMultiHazard: kept.length > 1,
        primaryHazard: kept.find((hazard: any) => hazard === decomposition.primaryHazard) || kept[0],
        /**
         * The withdrawal is RECORDED, not silent. A reviewer asking "why did it not raise
         * the grinder?" must be able to find the answer, and an auditor must be able to see
         * that a hazard was considered and set aside rather than never noticed.
         */
        routingNotes: [
          ...(Array.isArray(decomposition.routingNotes) ? decomposition.routingNotes : []),
          ...decomposition.hazards
            .filter((hazard: any) => isResolved(hazard))
            .map((hazard: any) =>
              `Not proposed as a finding: ${hazard?.domainId || 'hazard'} was assessed `
              + `${String(hazard?.conditionState || '').toUpperCase()} from the observation's own wording.`),
        ],
      };
    }
  }

  if (Array.isArray(response.additionalHazards)) {
    response.additionalHazards = response.additionalHazards.filter((hazard: any) => !isResolved(hazard));
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


@Controller('hazlenz')
export class HazLenzController {
  constructor(
    private readonly service: HazLenzService,
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
    return requireGovernanceUserId(user);
  }

  private getLocalDevBypassUserId(): string {
    return localDevBypassUserId();
  }

  /**
   * §262 EXTRACTION. The role map, the fail-safe viewer default and the local development bypass
   * moved verbatim to `workspace-governance-access/hazlenz-governance-context.ts` so the
   * authoritative Expert execution path resolves the SAME governance context from the SAME
   * definition. This method is now the controller's adapter from the request onto that function.
   */
  private getGovernanceContext(req: Request & { user?: any }): UserGovernanceContext {
    return resolveHazLenzGovernanceContext(req.user);
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
        // §307. The governance context, and ONLY the governance context. This was
        // `body.workspaceId || context.workspaceId`, which let a caller name the workspace their
        // own request was analysed in. `workspaceId` is no longer declared on `ClassifyDto`, so a
        // body carrying it is now rejected by the global pipe before this line runs; this reads the
        // server-derived value directly so the authority cannot be re-introduced by a DTO edit.
        context.workspaceId,
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
        const guided = withholdWeaklyRoutedHazards(withdrawResolvedHazards(enforceVerifiedControlDisplay(attachGuidedFindingResponse(ensureVisiblePrimaryCitationContract(
          sanitizeHazLenzDisplayOutput(
            applyFinalizationGate(foundation),
          ),
          body.text,
        ), body), body.text)));
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
      console.error('HazLenz v2 classify failed:', error);
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
      console.error('HazLenz v2 visual evidence evaluation failed:', error);
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
      console.error('HazLenz v2 real image analysis failed:', error);
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
      console.error("HazLenz v2 offline evaluation failed:", error);
      throw error;
    }
  }
}
