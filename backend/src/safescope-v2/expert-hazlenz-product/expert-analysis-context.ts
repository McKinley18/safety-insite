import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash } from 'crypto';

import { Inspection, regulatoryContextProvenance } from '../../inspection/inspection.entity';
import { Observation } from '../../inspection/entities/observation.entity';
import { Site } from '../../sites/entities/site.entity';
import { SafescopeV2Service } from '../safescope-v2.service';
import { applyEvidenceFoundation } from '../evidence/evidence-foundation';
import { scopesForRegulatoryContext } from '../evidence/regulatory-scopes';
import { normalizeHazardObservationText } from '../display/hazlenz-evidence-boundary';
import {
  resolveSafeScopeGovernanceContext,
} from '../workspace-governance-access/safescope-governance-context';
import {
  HazardTaxonomyCoverageService,
} from '../hazard-taxonomy-coverage/hazard-taxonomy-coverage.service';
import {
  buildExpertAnalysisInputFromAnalysis, type HazLenzAnalysisState,
} from '../expert-hazlenz/expert-input-constructor';
import type { ExpertHazLenzRequest } from '../expert-hazlenz/expert-hazlenz-analysis';

/**
 * §262 — THE AUTHORITATIVE CONTEXT THE SERVER LOADS FOR ITSELF.
 *
 * ---------------------------------------------------------------------------------------------
 * THE PROPERTY THIS FILE EXISTS TO MAKE TRUE.
 *
 * Every value the Expert layer reasons over is established HERE, by the server, from persisted
 * state it already owns or from a deterministic analysis it runs itself. The request body cannot
 * reach any of it. The client contributes exactly two things and both are ordinary user-authored
 * content rather than conclusions: the free-text task/area supplement, and answers the inspector
 * gave to clarification questions. Neither is a hazard, a posture, a control, a citation or a
 * provenance claim, and neither is written to a provenance field.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THE DETERMINISTIC ANALYSIS IS RUN HERE RATHER THAN READ FROM `hazlenz_analyses`.
 *
 * §260 section 1 established the standing trust boundary: the frontend calls `/safescope-v2/classify`,
 * holds the result, and later posts that snapshot back for persistence. The server does not
 * establish that the snapshot it stored equals the analysis it returned, which is why every existing
 * row is `producer = client_supplied`. Feeding such a row to Expert as its deterministic context
 * would let a client decide what the deterministic layer "found" — not the Expert conclusion, which
 * stays server-owned either way, but the factual premises Expert reasons from. A snapshot claiming
 * a live hazard was CONTROLLED is a premise no one checked.
 *
 * So §260 section 2 froze the flow as `run the deterministic analysis — existing SafeScopeV2 path`,
 * and that is what happens below: the SAME `SafescopeV2Service.classify` the customer route calls,
 * on the observation text the SERVER holds, under the governance context the SERVER derives.
 *
 * ONLY THE STRUCTURE-PRODUCING PART OF THE CLASSIFY CHAIN IS RUN. The classify ROUTE additionally
 * runs display sanitisation, the guided-finding response, finding-scoped standards hydration, the
 * finalization gate and the shadow orchestration. Those shape what a HUMAN is shown; Expert consumes
 * structure. `applyEvidenceFoundation` is included because it is not display — it is what produces
 * `applicabilityDecisions` and the resolved `regulatoryContext`, both of which are genuine
 * deterministic conclusions the §119 contract requires Expert to receive. Nothing downstream of it
 * is reproduced here, so this file is not a second copy of the customer pipeline.
 *
 * ---------------------------------------------------------------------------------------------
 * GOVERNED EVIDENCE IS DELIBERATELY EMPTY IN §262, AND THAT IS THE FAIL-CLOSED ANSWER.
 *
 * `ExpertAnalysisInput.governedStandards` and the vNext governed records carry APPROVED regulatory
 * text into the transmitted prompt. The only place §262 could obtain such text without building a
 * new server-side governed loader is the client-supplied analysis snapshot — which would let a
 * request inject arbitrary text into the Expert prompt while it is labelled governed evidence.
 * Empty is the honest value and the contract already states its meaning: "Empty means Expert may
 * cite nothing at all." A server-side governed-evidence loader bound to the inspection's release is
 * a later slice with its own authorization; §262 does not fabricate one.
 */
export const EXPERT_CONTEXT_BUILDER_VERSION = 'hazlenz.expert.262.server-context.v1' as const;

/** The user-authored supplements a request may carry. Neither is a conclusion. */
export interface ExpertClientContextSupplement {
  readonly taskContext?: string | null;
  readonly answeredClarifications?: ReadonlyArray<{
    readonly clarificationId: string; readonly answer: string;
  }>;
}

export interface ExpertServerContext {
  readonly request: ExpertHazLenzRequest;
  /**
   * What the server established, recorded so the persisted analysis can state the basis it reasoned
   * from. Every member is server-derived; none is echoed from the request body.
   */
  readonly basis: {
    readonly contextBuilderVersion: typeof EXPERT_CONTEXT_BUILDER_VERSION;
    readonly observationId: string;
    readonly inspectionId: string;
    readonly organizationId: string | null;
    readonly jurisdiction: string;
    readonly jurisdictionProvenance: string;
    readonly allowedHazardFamilyCount: number;
    readonly deterministicFindingCount: number;
    readonly deterministicFamilyDispositionCount: number | null;
    readonly governedRecordCount: number;
    /**
     * A digest of the deterministic premises Expert was given. Not the analysis itself: enough to
     * establish, later, that two runs reasoned from the same premises or that they did not.
     */
    readonly deterministicBasisDigest: string;
  };
}

@Injectable()
export class ExpertAnalysisContextService {
  private readonly taxonomy = new HazardTaxonomyCoverageService();

  constructor(
    private readonly safescope: SafescopeV2Service,
    @InjectRepository(Site) private readonly sites: Repository<Site>,
  ) {}

  /**
   * Build the frozen §259 entry point's request from server-owned state.
   *
   * `rawUser` is the authenticated principal the route already authorized against this observation;
   * it is used ONLY to derive the governance context the deterministic layer consults, never as a
   * source of analysis content.
   */
  async build(
    rawUser: unknown,
    observation: Observation,
    inspection: Inspection,
    analysisId: string,
    supplement: ExpertClientContextSupplement,
  ): Promise<ExpertServerContext> {
    // ---- the regulatory fact. The INSPECTION is the authority, exactly as the classify route
    // ---- resolves it for a persisted inspection; the request body has no say.
    const contextValue = inspection.regulatoryContext || 'unknown';
    const provenance = regulatoryContextProvenance(contextValue);
    const userConfirmed = provenance === 'USER_CONFIRMED';

    const observationText = normalizeHazardObservationText(observation.rawText);
    const site = await this.sites.findOne({ where: { id: inspection.siteId } });

    // The task/area supplement is user-authored context, carried as an authoritative SOURCE the
    // model may quote, and as `inspectionContext.task`. It is never a finding and never provenance.
    const taskContext = typeof supplement.taskContext === 'string' && supplement.taskContext.trim()
      ? supplement.taskContext.trim() : null;

    const classifyRequest: any = {
      text: observationText,
      inspectionId: inspection.id,
      ...(userConfirmed
        ? {
          scopes: scopesForRegulatoryContext(contextValue),
          structuredObservation: { jurisdiction: contextValue },
          regulatoryContext: {
            value: contextValue, provenance, source: 'inspection', inspectionId: inspection.id,
          },
        }
        : {
          regulatoryContext: {
            value: 'unknown', provenance: 'UNKNOWN', source: 'inspection', inspectionId: inspection.id,
          },
        }),
    };

    const governance = resolveSafeScopeGovernanceContext(rawUser);
    const classified: any = await this.safescope.classify(
      observationText,
      classifyRequest.scopes,
      undefined,
      undefined,
      governance.workspaceId,
      undefined,
      undefined,
      governance,
      false,
      classifyRequest.structuredObservation,
      undefined,
      undefined,
    );
    const withFoundation: any = applyEvidenceFoundation(classified, classifyRequest);

    // ---- the deterministic premises, read STRUCTURALLY from the analysis the server just ran.
    const decomposition = withFoundation?.multiHazardDecomposition
      ?? withFoundation?.intelligence?.multiHazardDecomposition;
    const hazards: any[] = Array.isArray(decomposition?.hazards) ? decomposition.hazards : [];
    // `undefined` and `[]` are DIFFERENT and §119 preserves both: undefined means no family
    // evaluation is on offer, `[]` means one ran and projected nothing. Neither is synthesised.
    const applicabilityDecisions = Array.isArray(withFoundation?.applicabilityDecisions)
      ? withFoundation.applicabilityDecisions.map((d: any) => ({
        family: String(d?.family ?? ''),
        status: String(d?.status ?? ''),
        confidence: typeof d?.confidence === 'number' ? d.confidence : 0,
        requiredPredicates: Array.isArray(d?.requiredPredicates)
          ? d.requiredPredicates.map((p: any) => ({
            name: String(p?.name ?? ''), status: String(p?.status ?? ''),
          }))
          : [],
      }))
      : undefined;

    // The jurisdiction Expert is TOLD is the one the deterministic layer actually evaluated under,
    // which is the inspection's value where the inspection has one and the engine's honest reading
    // otherwise. It is supplied as a fact and never re-decided by Expert.
    const jurisdiction = userConfirmed
      ? contextValue
      : String(withFoundation?.regulatoryContext?.value ?? 'unknown');
    const jurisdictionProvenance = userConfirmed
      ? 'USER_CONFIRMED'
      : String(withFoundation?.regulatoryContext?.provenance ?? 'UNKNOWN');

    const state: HazLenzAnalysisState = {
      analysisId,
      observation: observationText,
      inspectionContext: { location: site?.name ?? null, task: taskContext },
      jurisdiction,
      allowedHazardFamilies: this.allowedHazardFamilies(hazards),
      hazards,
      applicabilityDecisions,
      // See the header: governed evidence is not sourced from a client-supplied snapshot.
      governedStandards: [],
      answeredClarifications: (supplement.answeredClarifications ?? []).map(a => ({
        clarificationId: a.clarificationId, answer: a.answer,
      })),
      supplementaryContext: taskContext === null ? [] : [{
        sourceId: 'inspection_context',
        sourceType: 'inspection_context',
        text: taskContext,
      }],
    };

    const input = buildExpertAnalysisInputFromAnalysis(state);

    return {
      request: {
        input,
        // The observation source id the §210J projection validates evidence offsets against. It is
        // the id the canonical constructor placed on the observation source, so a quoted span binds
        // to the text the SERVER holds rather than to anything the request supplied.
        observation: { sourceId: input.authoritativeSources[0].sourceId, text: observationText },
        governedRecords: [],
        governedEvidence: [],
      },
      basis: {
        contextBuilderVersion: EXPERT_CONTEXT_BUILDER_VERSION,
        observationId: observation.id,
        inspectionId: inspection.id,
        organizationId: inspection.organizationId ?? null,
        jurisdiction,
        jurisdictionProvenance,
        allowedHazardFamilyCount: input.allowedHazardFamilies.length,
        deterministicFindingCount: input.deterministicFindings.length,
        deterministicFamilyDispositionCount:
          input.deterministicFamilyDispositions === undefined
            ? null : input.deterministicFamilyDispositions.length,
        governedRecordCount: 0,
        deterministicBasisDigest: createHash('sha256').update(JSON.stringify({
          observationText,
          jurisdiction,
          allowedHazardFamilies: input.allowedHazardFamilies,
          deterministicFindings: input.deterministicFindings,
          deterministicFamilyDispositions: input.deterministicFamilyDispositions ?? null,
        }), 'utf8').digest('hex'),
      },
    };
  }

  /**
   * THE CLOSED HAZARD-FAMILY VOCABULARY EXPERT MAY NAME.
   *
   * Two server-owned sources, unioned, and nothing else:
   *
   *   1. the product's own hazard taxonomy coverage map — 41 domains, a repository artifact, the
   *      same registry the deterministic decomposition routes against; and
   *   2. every family the deterministic layer actually emitted for THIS observation, because a
   *      routed family that is not in the coverage map must still be nameable or Expert could not
   *      even discuss a hazard the deterministic layer already found.
   *
   * IT IS NOT NARROWED TO WHAT THE DETERMINISTIC LAYER FOUND. Expert exists to raise what the
   * deterministic layer missed; a vocabulary containing only what was already found would make that
   * unexpressible, and the layer would measure as agreeing with the engine by construction.
   *
   * The result is sorted so two runs on one observation transmit the same enum in the same order,
   * which is what keeps the wire schema — and therefore the candidate identity of a transmitted
   * request — reproducible.
   */
  private allowedHazardFamilies(hazards: readonly any[]): string[] {
    const families = new Set<string>();
    for (const domain of this.taxonomy.getAllDomains()) {
      const id = String((domain as { domainId?: unknown }).domainId ?? '').trim();
      if (id) families.add(id);
    }
    for (const hazard of hazards) {
      const emitted = String(hazard?.hazardFamily ?? hazard?.domainId ?? '').trim();
      if (emitted) families.add(emitted);
    }
    // `unknown` is the decomposition's "not routed" marker, not a hazard family. Admitting it would
    // let Expert file a candidate under a family that names no hazard at all.
    families.delete('unknown');
    return [...families].sort();
  }
}
