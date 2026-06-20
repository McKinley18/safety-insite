import { StandardsBridgeService } from "./standards-bridge.service";
import { Injectable, Optional, ForbiddenException } from "@nestjs/common";
import { WeightedClassifierService } from "./classifier/weighted-classifier.service";
import { evaluateRisk } from "./risk/risk-engine";
import { ActionEngineService } from "../action-engine/action-engine.service";
import { EvidenceFusionService } from "./evidence/evidence-fusion.service";
import { ApplicableStandardsService } from "../applicable-standards/applicable-standards.service";
import { SafeScopeIntelligenceOrchestrator } from "./orchestration/intelligence-orchestrator.service";
import { STANDARDS_INTELLIGENCE_SEED } from "./standards-intelligence/standards-intelligence.seed";
import { buildSourceSynthesis } from "../safescope-knowledge/sources/source-synthesis-helper";
import { getEvidenceGapIntelligence } from "./intelligence/evidence-gap-intelligence";
import { getCorrectiveActionIntelligence } from "./intelligence/corrective-action-intelligence";
import { SafeScopeNativeReasoningService } from "./native-reasoning/native-reasoning.service";
import { SafeScopeReasoningOrchestratorService } from "./reasoning-orchestrator/reasoning-orchestrator.service";
import { SafeScopeReasoningRequest } from "./reasoning-orchestrator/reasoning-orchestrator.types";
import { VisualEvidenceReasoningService } from "./visual-evidence-reasoning/visual-evidence-reasoning.service";
import { VisualEvidenceReasoningInput, Attachment } from "./visual-evidence-reasoning/visual-evidence-reasoning.types";
import { RealImageAnalysisService } from "./real-image-analysis/real-image-analysis.service";
import { RealImageAnalysisInput } from "./real-image-analysis/real-image-analysis.types";
import { OfflineReasoningInput } from "./offline-reasoning-mobile-resilience/offline-reasoning-mobile-resilience.types";
import { OfflineReasoningMobileResilienceService } from "./offline-reasoning-mobile-resilience/offline-reasoning-mobile-resilience.service";
import { SafeScopePersistenceService } from "./persistence/persistence.service";
import { WorkspaceGovernanceAccessService } from "./workspace-governance-access/workspace-governance-access.service";
import { UserGovernanceContext } from "./workspace-governance-access/workspace-governance.types";
import { HazLenzKnowledgeRouterService } from "./knowledge-router/hazlenz-knowledge-router.service";
import { logKnowledgeTelemetry, isHazLenzKnowledgeTelemetryEnabled } from "./telemetry/hazlenz-knowledge-telemetry";
import { HazLenzKnowledgeShardService } from "./knowledge-shards/hazlenz-knowledge-shard.service";


@Injectable()
export class SafescopeV2Service {
  private classifier = new WeightedClassifierService();
  private bridge = new StandardsBridgeService();
  private nativeReasoningService = new SafeScopeNativeReasoningService();
  private reasoningOrchestratorService = new SafeScopeReasoningOrchestratorService();

  constructor(
    private readonly actionEngine: ActionEngineService,
    private readonly evidenceFusion: EvidenceFusionService,
    private readonly applicableStandards: ApplicableStandardsService,
    private readonly intelligenceOrchestrator: SafeScopeIntelligenceOrchestrator,
    private readonly visualService: VisualEvidenceReasoningService,
    private readonly imageAnalysisService: RealImageAnalysisService,
    private readonly offlineService: OfflineReasoningMobileResilienceService,
    private readonly access: WorkspaceGovernanceAccessService,
    private readonly knowledgeRouter: HazLenzKnowledgeRouterService,
    private readonly knowledgeShardService: HazLenzKnowledgeShardService,
    @Optional()
    private readonly persistence?: SafeScopePersistenceService,
  ) {}

  async evaluateVisualEvidence(input: VisualEvidenceReasoningInput, user?: UserGovernanceContext) {
    if (user) {
        const decision = this.access.can(user, 'run_classification');
        if (!decision.allowed) throw new ForbiddenException(decision.reason);
    }
    return this.visualService.evaluate(input);
  }

  async evaluateRealImage(input: RealImageAnalysisInput, user?: UserGovernanceContext) {
    if (user) {
        const decision = this.access.can(user, 'run_classification');
        if (!decision.allowed) throw new ForbiddenException(decision.reason);
    }
    return this.imageAnalysisService.evaluate(input);
  }

  async evaluateOffline(input: OfflineReasoningInput, user?: UserGovernanceContext) {
    if (user) {
        const decision = this.access.can(user, 'run_classification');
        if (!decision.allowed) throw new ForbiddenException(decision.reason);
    }
    const result = this.offlineService.evaluate(input);
    if (this.persistence) {
        await this.persistence.save({
            type: "reasoning_trace_snapshot",
            status: "offline_captured",
            payload: result,
            metadata: { observationText: input.observationText, isOffline: true, syncRequired: true },
            workspaceId: input.workspaceId || user?.workspaceId,
            inspectionId: input.localInspectionId,
            observationId: input.localObservationId,
            traceId: result.offlineTraceId
        });
    }
    return result;
  }
  async classify(
    text: string,
    scopes?: string[],
    evidenceTexts?: string[],
    riskProfileId?: "simple_4x4" | "standard_5x5" | "advanced_6x6",
    workspaceId?: string,
    priorFindings?: any[],
    visualAttachments?: Attachment[],
    user?: UserGovernanceContext,
    debugMetadata?: boolean,
  ) {
    if (user) {
        const decision = this.access.can(user, 'run_classification');
        if (!decision.allowed) throw new ForbiddenException(decision.reason);
    }

      const evidenceFusion = this.evidenceFusion.synthesize([
        text,
        ...(evidenceTexts || []),
      ]);
      const fusedText = evidenceFusion.combinedNarrative;
      const result = this.classifier.classify(fusedText);
      const promotedPrimary = result as any;

      // Calculate risk using the risk engine
      const risk = evaluateRisk({
        text: fusedText,
        classification: promotedPrimary.classification,
        riskProfileId: riskProfileId || "standard_5x5",
      });
      promotedPrimary.risk = risk;

      // Route the observation first so HazLenz opens the most relevant knowledge directory.
      const normalizedScopes = this.normalizeScopes(scopes, fusedText);
      const knowledgeRoute = this.knowledgeRouter.route({
        text: fusedText,
        scopes: normalizedScopes,
      });

      const knowledgeShardSummary = this.knowledgeShardService.getShardSummary({
        shardKey: knowledgeRoute.shardKey,
        bundleIds: knowledgeRoute.bundleIds,
        sourceKeys: knowledgeRoute.sourceKeys,
      });

      if (isHazLenzKnowledgeTelemetryEnabled()) {
        logKnowledgeTelemetry("SafescopeV2Service.classify_knowledge_route", {
          jurisdiction: knowledgeRoute.jurisdiction,
          hazardFamily: knowledgeRoute.hazardFamily,
          equipmentFamily: knowledgeRoute.equipmentFamily,
          taskMechanism: knowledgeRoute.taskMechanism,
          shardKey: knowledgeRoute.shardKey,
          candidateBundleIds: knowledgeRoute.bundleIds,
          sourceKeys: knowledgeRoute.sourceKeys,
          confidence: knowledgeRoute.confidence,
          reasons: knowledgeRoute.reasons,
          matchedShardCount: knowledgeShardSummary.matchedShardCount,
          focusedCitations: knowledgeShardSummary.citations,
          previewOnly: true,
        });
      }

      // Suggest standards using the applicable standards service, then enforce selected jurisdiction scope.
      const source = this.scopeToSource(normalizedScopes);
      const diagnostics: Record<string, any> = {};
      const rawSuggestedStandards = await this.applicableStandards.suggest(
        fusedText,
        promotedPrimary.classification,
        source,
        10,
        knowledgeRoute,
        debugMetadata ? diagnostics : undefined,
      );

      const scopedStandards = this.applyStandardsScopeFit(
        rawSuggestedStandards,
        normalizedScopes,
      ).sort((a, b) => (b.score || 0) - (a.score || 0));

      const suggestedStandards = scopedStandards
        .filter((standard) => standard.scopeFit !== "mismatch")
        .slice(0, 5);

      const excludedStandards = scopedStandards
        .filter((standard) => standard.scopeFit === "mismatch")
        .map((standard) => ({
          ...standard,
          exclusionReason:
            standard.scopeExclusionReason ||
            "Excluded by selected regulatory scope.",
        }));

      // Generate corrective actions using the action engine
      const actionInput: any = {
        id: "safescope-v2-eval-" + Date.now(),
        category: promotedPrimary.classification || "General",
        description: fusedText,
        riskScore: risk?.riskScore || 0,
        riskLevel: (risk?.riskBand || "LOW") as any,
        confidence: promotedPrimary.confidence || 0.5,
        patterns: [],
        location: "Field Location",
        override: false,
        safeScope: {
          classification: promotedPrimary.classification,
          riskBand: (risk?.riskBand || "Low") as any,
          requiresShutdown: risk?.requiresShutdown,
          imminentDanger: risk?.imminentDanger,
          fatalityPotential: risk?.fatalityPotential ? "high" : "low",
          reasoning: risk?.reasoning || [],
          standards: suggestedStandards.map(s => ({ citation: s.citation, rationale: s.matchingReasons?.join(", ") })),
        }
      };
      const generatedActions = await this.actionEngine.generateActionsFromReport(actionInput);

      const historicalReferenceCount = Array.isArray(priorFindings)
        ? priorFindings.length
        : 0;

      const reasoningSourceHierarchy = {
        primaryBasis: [
          "HazLenz AI governed classifier and reasoning brain",
          "approved knowledge and source governance",
          "regulatory scope filtering",
          "standards applicability service",
          "scenario, equipment, task, mechanism, and evidence reasoning",
        ],
        secondaryReferenceOnly: [
          "prior saved findings",
          "workspace learning",
          "site memory",
          "trend intelligence",
          "correlation intelligence",
          "reviewer feedback history",
        ],
        prohibitedHistoricalInfluence: [
          "prior findings cannot create a standard match by themselves",
          "prior findings cannot override approved knowledge or source governance",
          "prior findings cannot remove high-risk review requirements",
          "prior findings cannot finalize compliance or violation decisions",
        ],
      };

      const reasoningBasis = {
        primaryReasoningSource: "safescope_governed_brain",
        standardsMatchPrimarySource: "approved_applicability_and_scope_filtered_standards",
        workspaceHistoryRole: "supporting_reference_only",
        priorFindingsUsed: historicalReferenceCount > 0,
        priorFindingReferenceCount: historicalReferenceCount,
        priorFindingsCanCreateStandards: false,
        priorFindingsCanOverrideGovernance: false,
        sourceHierarchyEnforced: true,
        advisoryOnly: true,
        requiresQualifiedReview: true,
        explanation:
          "HazLenz AI generates classifications, standards candidates, risk reasoning, and corrective actions from its governed brain and approved/source-governed applicability logic first. Prior saved findings and workspace history may support context, trend awareness, confidence tuning, evidence questions, and review priority, but they cannot create or override standards matches.",
      };

      const memorySnapshot = () => {
        const usage = process.memoryUsage();
        return {
          rssMb: Math.round(usage.rss / 1024 / 1024),
          heapUsedMb: Math.round(usage.heapUsed / 1024 / 1024),
          heapTotalMb: Math.round(usage.heapTotal / 1024 / 1024),
          externalMb: Math.round(usage.external / 1024 / 1024),
        };
      };

      const buildDegradedHazLenzIntelligence = (fallbackReason: string, classification?: string) => {
        const lowerClass = (classification || "").toLowerCase();
        let evidenceGaps = [
          "Confirm physical exposure condition, distance to hazard, and employee travelways.",
          "Verify if any warning signs or administrative controls are in place.",
          "Attach photos and supervisor notes for qualified review before relying on the result.",
        ];
        let classReason = "Core classification, risk, standards candidates, and corrective actions were still generated.";

        if (lowerClass.includes("guarding") || lowerClass.includes("machine")) {
          evidenceGaps = [
            "Verify if the guard is securely fastened, requires a tool for removal, and completely prevents contact with moving parts.",
            "Confirm standard guarding dimensions, distance from pinch points, and visibility requirements.",
            "Attach photos and supervisor notes showing physical guard placement and pinch points.",
          ];
          classReason = "Assessed exposure risk to rotating parts, pulleys, or belts, prioritizing physical barrier guarding regulations.";
        } else if (lowerClass.includes("loto") || lowerClass.includes("lockout") || lowerClass.includes("tagout")) {
          evidenceGaps = [
            "Verify if a machine-specific LOTO procedure exists, is current, and is actively posted at the equipment location.",
            "Confirm that all energy sources (electrical, pneumatic, hydraulic, kinetic) are isolated and locked out.",
            "Check if workers have verified zero energy state before starting maintenance or service work.",
          ];
          classReason = "Assessed hazardous energy isolation requirements, prioritizing lockout/tagout procedures and zero-energy verification.";
        } else if (lowerClass.includes("electrical")) {
          evidenceGaps = [
            "Confirm panel cover status, box integrity, cover screws, and presence of open breaker slots.",
            "Verify proper approach boundaries, PPE requirements, and enclosure ratings (e.g. NEMA ratings).",
            "Identify if qualified electrician authorization, warning labels, or LOTO isolation was in place.",
          ];
          classReason = "Assessed shock, electrocution, or arc flash hazards, focusing on live parts exposure and protective enclosure requirements.";
        } else if (lowerClass.includes("fall") || lowerClass.includes("leading edge")) {
          evidenceGaps = [
            "Verify actual fall height to lower level, anchorage point strength, and presence of guardrails or safety nets.",
            "Confirm that personnel have been trained on fall protection and are actively wearing inspected harnesses/lanyards.",
            "Check floor opening covers for proper securing, labeling ('HOLE'), and load-bearing capacity.",
          ];
          classReason = "Assessed height-related fall risk, focusing on guardrails, personal fall arrest systems, and hole protection.";
        } else if (lowerClass.includes("mobile") || lowerClass.includes("berm") || lowerClass.includes("equipment") || lowerClass.includes("pedestrian")) {
          evidenceGaps = [
            "Verify presence and height of safety berms or guardrails along haul roads and dump points.",
            "Confirm pedestrian-equipment segregation plan, high-visibility vest usage, and backup alarm functionality.",
            "Check equipment inspection logs, horn operation, and seatbelt usage compliance.",
          ];
          classReason = "Assessed mobile machinery operation hazards, pedestrian interaction, and ground control/berm requirements.";
        } else if (lowerClass.includes("hazcom") || lowerClass.includes("chemical") || lowerClass.includes("label") || lowerClass.includes("hazard communication")) {
          evidenceGaps = [
            "Verify if the container is properly labeled with identity, hazards, and GHS pictograms.",
            "Confirm availability and location of the Safety Data Sheet (SDS) for this specific chemical.",
            "Check presence of eye wash station, chemical-resistant gloves, and proper secondary containment.",
          ];
          classReason = "Assessed chemical safety risk, focusing on container labeling, hazard communication, and SDS availability.";
        } else if (lowerClass.includes("housekeeping") || lowerClass.includes("trip") || lowerClass.includes("clutter") || lowerClass.includes("walking") || lowerClass.includes("working") || lowerClass.includes("surfaces")) {
          evidenceGaps = [
            "Verify if travelways, walkways, and emergency exits are clear of clutter, cords, or debris.",
            "Identify source of any spills (oil, water, dust) and check if cleanup materials or warning signs are deployed.",
            "Check lighting levels and walking surface conditions (uneven ground, cracks, ice) in the hazard area.",
          ];
          classReason = "Assessed slip, trip, and fall-on-same-level hazards, focusing on clean walkways and clear emergency exits.";
        }

        return {
          degraded: true,
          fullIntelligenceAvailable: false,
          fallbackReason,
          additionalHazards: [],
          evidenceGaps,
          reasoningSummary: [
            "HazLenz AI returned a production-safe advisory result instead of running the full intelligence layer.",
            classReason,
            "Output remains advisory-only and requires qualified review.",
          ],
          governance: {
            advisoryOnly: true,
            requiresQualifiedReview: true,
            degradedMode: true,
          },
        };
      };

      let intelligence: any;

      const renderRuntime =
        Boolean(process.env.RENDER) ||
        Boolean(process.env.RENDER_SERVICE_ID) ||
        Boolean(process.env.RENDER_EXTERNAL_URL);

      const productionRuntime = process.env.NODE_ENV === "production";
      const fullRenderIntelligenceEnabled =
        process.env.HAZLENZ_FULL_INTELLIGENCE_ON_RENDER === "true";

      if (productionRuntime && renderRuntime && !fullRenderIntelligenceEnabled) {
        console.warn("[HazLenz classify] skipping full intelligence orchestrator on Render production; returning production-safe advisory fallback", {
          textLength: fusedText.length,
          standards: suggestedStandards.length,
          actions: Array.isArray(generatedActions) ? generatedActions.length : 0,
          memory: memorySnapshot(),
        });

        intelligence = buildDegradedHazLenzIntelligence(
          "HazLenz full intelligence layer is disabled on the current Render production runtime to prevent service restarts. Core classification, risk, standards candidates, and corrective actions were still generated.",
          promotedPrimary?.classification
        );
      } else {
        try {
          console.log("[HazLenz classify] intelligence orchestrator start", {
            textLength: fusedText.length,
            standards: suggestedStandards.length,
            actions: Array.isArray(generatedActions) ? generatedActions.length : 0,
            memory: memorySnapshot(),
          });

          intelligence = await this.intelligenceOrchestrator.evaluate({
            fusedText,
            promotedPrimary,
            classifierResult: result,
            evidenceTexts,
            visualAttachments,
            expandedContext: { knowledgeRoute },
            primaryStandardsResult: { suggestedStandards },
            generatedActions,
            additionalHazards: [],
            priorFindings,
            workspaceId: workspaceId || user?.workspaceId,
            supervisorValidations: [],
          });

          console.log("[HazLenz classify] intelligence orchestrator complete", {
            memory: memorySnapshot(),
          });
        } catch (error) {
          console.error("[HazLenz classify] intelligence orchestrator failed; returning degraded advisory fallback", {
            error,
            memory: memorySnapshot(),
          });

          intelligence = buildDegradedHazLenzIntelligence(
            "HazLenz full intelligence layer was unavailable. Core classification, risk, standards candidates, and corrective actions were still generated.",
            promotedPrimary?.classification
          );
        }
      }

      const enhancedGeneratedActions = this.buildEnhancedGeneratedActions(
        generatedActions,
        intelligence,
        actionInput.id,
        knowledgeShardSummary,
      );

      const aiEvidenceContract = {
        inputsUsed: [
          "hazard_observation_text",
          ...(evidenceTexts?.length ? ["evidence_texts"] : []),
          ...(visualAttachments?.length ? ["visual_attachments"] : []),
          ...(priorFindings?.length ? ["prior_findings_reference_only"] : []),
        ],
        standardsSourcesUsed: suggestedStandards
          .map((standard: any) => standard.citation || standard.standard || standard.id)
          .filter(Boolean),
        missingInputs: [
          ...(fusedText.toLowerCase().includes("location") ? [] : ["specific_location"]),
          ...(evidenceTexts?.length || visualAttachments?.length ? [] : ["supporting_photo_or_evidence_note"]),
        ],
        unsupportedClaims: [],
        reviewTriggers: [
          "qualified_review_required",
          ...(risk?.requiresShutdown ? ["shutdown_or_immediate_control_review"] : []),
          ...(excludedStandards.length ? ["standards_scope_filter_review"] : []),
        ],
        canFinalizeWithoutHumanReview: false,
        advisoryOnly: true,
        doesNotDeclareViolation: true,
        doesNotCreateCitation: true,
        requiresQualifiedReview: true,
      };

      const aiReadiness = {
        readyForDecisionSupport: true,
        readyForAutonomousComplianceDecision: false,
        marketingPosition: "AI-assisted safety review and decision-support engine",
        advisoryOnly: true,
        requiresQualifiedReview: true,
        limitations: [
          "Does not declare violations.",
          "Does not create citations.",
          "Does not replace qualified safety or regulatory review.",
          "Standards applicability depends on confirmed jurisdiction, task, exposure, and evidence.",
        ],
      };

      const aiCapabilityProfile = {
        classification: "AI-assisted safety review engine",
        capabilities: [
          "hazard classification",
          "risk reasoning",
          "standards candidate support",
          "evidence gap identification",
          "corrective action recommendation",
          "source-governed advisory reasoning",
        ],
        missingForValidatedAi: [
          "independent third-party validation",
          "production-scale field accuracy study",
          "live source update governance approval workflow",
        ],
      };

      const nativeReasoning = {
        enabled: true,
        mode: "offline_capable",
        engine: "safescope_native",
        mechanismIntelligence: {
          enabled: true,
          engine: "safescope_mechanism_intelligence",
          source: "scenario_equipment_task_mechanism_reasoning",
          primaryEnergySources: [
            "mechanical_motion",
            "gravity",
            "electrical_energy",
            "mobile_equipment_kinetic_energy",
          ],
          injuryMechanisms: [
            "caught_in_or_between",
            "struck_by",
            "fall_to_lower_level",
            "electrical_contact",
            "exposure",
          ],
          credibleAccidentPathways: [
            "employee exposure to uncontrolled hazardous energy or motion",
            "failed or missing barrier allows contact with hazard source",
            "unclear task/equipment state requires qualified verification",
          ],
          canInventCitations: false,
          canOverrideStandards: false,
          canReduceHumanReview: false,
          sourceBoundary:
            "Mechanism intelligence explains plausible harm pathways only; it cannot invent citations, override standards, or reduce qualified human review.",
          advisoryOnly: true,
          requiresQualifiedReview: true,
        },
        evidenceGapReasoning: {
          enabled: true,
          source: "evidence_gap_questions_and_field_output",
          advisoryOnly: true,
          requiresQualifiedReview: true,
        },
        correctiveActionReasoning: {
          enabled: true,
          source: "dca_corrective_action_brain",
          advisoryOnly: true,
          doesNotGuaranteeAbatement: true,
          requiresQualifiedReview: true,
        },
        standardsReasoning: {
          enabled: true,
          source: "scope_filtered_applicability_and_traceability",
          advisoryOnly: true,
          doesNotCreateCitation: true,
          requiresQualifiedReview: true,
        },
      };

      const learningMemory = {
        engine: "safescope_learning_memory",
        canSelfModifyRules: false,
        canOverrideStandards: false,
        canReduceHumanReview: false,
        memoryBoundary:
          "Learning memory may preserve reviewer patterns and confidence signals for future review support, but it cannot self-modify rules, override standards, invent citations, or reduce qualified human review.",
      };

      const learningGovernance = {
        allowedInfluence: [
          "adjust_confidence",
          "surface_review_patterns",
          "suggest_evidence_questions",
          "prioritize_human_review",
        ],
        prohibitedInfluence: [
          "create_citations",
          "invented_citations",
          "auto_finalize_compliance_decisions",
          "invent_citations",
          "declare_violations",
          "override_regulations",
          "remove_qualified_review_requirement",
        ],
        advisoryOnly: true,
        requiresQualifiedReview: true,
        finalGovernanceRule:
          "HazLenz AI may support classification, risk reasoning, standards review, evidence questions, and corrective action recommendations, but it must not invent citations, declare violations, finalize compliance decisions, or remove qualified human review.",
      };

      const requiresHumanReview = true;

      const standardsTraceability = {
        primaryMatcher: "ApplicableStandardsService",
        primaryMatcherRole:
          "Produces the initial suggested standards from approved knowledge chunks or the active standards repository.",
        scopeFilter: "SafescopeV2Service.applyStandardsScopeFit",
        scopeFilterRole:
          "Promotes standards matching the selected jurisdiction and excludes mismatched MSHA/OSHA scopes.",
        defensibilityRanker: "StandardsReasoningService",
        defensibilityRankerRole:
          "Ranks already-suggested standards for operational defensibility using context, exposure, risk, and reputable-source support.",
        scenarioStandardMapper: "StandardFamilyMapperService",
        scenarioStandardMapperRole:
          "Maps scenario intelligence to standard families for review and supporting context.",
        citationReview: "CitationReviewBrainService",
        citationReviewRole:
          "Reviews citation-level candidates and evidence gaps for advisory applicability support.",
        sourceBackedGovernance: "SourceBackedApplicabilityGovernanceService",
        sourceBackedGovernanceRole:
          "Evaluates whether source-backed applicability is sufficiently supported and what reviewer limits apply.",
        approvedKnowledgeRetrieval: "ApprovedKnowledgeRetrievalOutputV1Service",
        approvedKnowledgeRetrievalRole:
          "Retrieves approved knowledge records for supporting field output and source context where available.",
        priorFindingsRole: "reference_only",
        priorFindingsCanCreateStandards: false,
        priorFindingsCanOverrideStandards: false,
        finalSuggestedStandardsSource:
          "applicable_standards_scope_filtered_then_v2_reasoning_context",
        selectedScopes: normalizedScopes,
        sourceMode: source || "auto_or_unspecified",
        rawCandidateCount: rawSuggestedStandards.length,
        scopeFilteredCandidateCount: suggestedStandards.length,
        excludedCandidateCount: excludedStandards.length,
        suggestedCitations: suggestedStandards.map((standard: any) => standard.citation).filter(Boolean),
        excludedCitations: excludedStandards.map((standard: any) => standard.citation).filter(Boolean),
        v2ContextAvailable: {
          standardsReasoning: Boolean((intelligence as any).standardsReasoning),
          standardFamilyCandidates: Boolean((intelligence as any).standardFamilyCandidates),
          citationLevelCandidates: Boolean((intelligence as any).citationLevelCandidates),
          sourceBackedApplicability: Boolean((intelligence as any).sbag),
          approvedKnowledgeRetrieval: Boolean((intelligence as any).retrieval),
        },
        advisoryGuardrails: {
          advisoryOnly: true,
          doesNotDeclareViolation: true,
          doesNotCreateCitation: true,
          requiresQualifiedReview: true,
          finalComplianceDecisionByHuman: true,
        },
      };

      const standardsMatchExplanations = this.buildStandardsMatchExplanations(
        suggestedStandards,
        fusedText,
        (intelligence as any)?.observationUnderstanding
      );

      return {
          ...promotedPrimary,
          ...intelligence,
          suggestedStandards,
          standardsMatchExplanations,
          excludedStandards,
          ...(debugMetadata ? { debugMetadata: diagnostics } : {}),
          standardsTraceability,
          knowledgeRoute: {
            jurisdiction: knowledgeRoute.jurisdiction,
            hazardFamily: knowledgeRoute.hazardFamily,
            equipmentFamily: knowledgeRoute.equipmentFamily,
            taskMechanism: knowledgeRoute.taskMechanism,
            shardKey: knowledgeRoute.shardKey,
            sourceKeys: knowledgeRoute.sourceKeys,
            bundleIds: knowledgeRoute.bundleIds,
            confidence: knowledgeRoute.confidence,
            reasons: knowledgeRoute.reasons,
            shardSummary: {
              matchedShardCount: knowledgeShardSummary.matchedShardCount,
              shardKeys: knowledgeShardSummary.shardKeys,
              citations: knowledgeShardSummary.citations,
              evidenceNeeded: knowledgeShardSummary.evidenceNeeded,
              correctiveActionPatterns: knowledgeShardSummary.correctiveActionPatterns,
            },
            advisoryOnly: true,
            requiresQualifiedReview: true,
          },
          generatedActions: enhancedGeneratedActions,
          baseGeneratedActions: generatedActions,
          generatedActionsEnrichment: {
            applied: true,
            source: "safescope_v2_dca_corrective_action_brain",
            usesDca: Boolean((intelligence as any).dca),
            usesCorrectiveActionReasoning: Boolean((intelligence as any).correctiveActionReasoning),
            preservesBaseActionEngineOutput: true,
          },
          reasoningSourceHierarchy,
          reasoningBasis,
          fieldOutput: (intelligence as any).fieldOutput,
          semanticUnderstanding: (intelligence as any).semanticUnderstanding,
          semanticRouting: (intelligence as any).semanticRouting,
          aiReadiness,
          aiEvidenceContract,
          aiCapabilityProfile,
          nativeReasoning,
          learningGovernance,
          learningMemory,
          requiresHumanReview,
          knowledgeBrain: (intelligence as any).knowledgeBrain || (intelligence as any).retrieval || {},
          sourceAwareAnalysis: (intelligence as any).sourceAwareAnalysis || (intelligence as any).sbag || {},
          reasoningSnapshotId: (intelligence as any).reasoningSnapshotId || `local-reasoning-${Date.now()}`,
          decisionSupportMetadata: {
              semanticUnderstanding: (intelligence as any).semanticUnderstanding,
              semanticRouting: (intelligence as any).semanticRouting,
              reasoningSourceHierarchy,
              reasoningBasis,
              standardsTraceability,
              aiEvidenceContract,
              aiReadiness,
              aiCapabilityProfile,
              nativeReasoning,
              learningGovernance,
              learningMemory,
          }
      };
  }


  private buildEnhancedGeneratedActions(
    baseActions: any[],
    intelligence: any,
    reportId: string,
    knowledgeShardSummary?: any,
  ) {
    const safeArray = (value: any) => Array.isArray(value) ? value : [];
    const base = safeArray(baseActions);
    const primary = base[0] || {};

    const dca = intelligence?.dca || {};
    const correctiveActionReasoning = intelligence?.correctiveActionReasoning || {};
    const riskReasoning = intelligence?.riskReasoning || {};
    const scenarioIntelligence = intelligence?.scenarioIntelligence || {};
    const evidenceGapQuestions = safeArray(intelligence?.evidenceGapQuestions);
    const shardCorrectiveActionPatterns = safeArray(
      knowledgeShardSummary?.correctiveActionPatterns,
    )
      .map((item: any) => String(item || "").trim())
      .filter(Boolean);

    const dcaFixes = [
      ...safeArray(dca.immediateActions).map((item: any) => item?.action || item?.title || String(item)),
      ...safeArray(dca.interimControls).map((item: any) => item?.action || item?.title || String(item)),
      ...safeArray(dca.permanentCorrectiveActions).map((item: any) => item?.action || item?.title || String(item)),
      ...safeArray(dca.verificationActions).map((item: any) => item?.action || item?.title || String(item)),
    ].filter(Boolean);

    const brainFixes = [
      ...safeArray(correctiveActionReasoning.immediateActions),
      ...safeArray(correctiveActionReasoning.interimControls),
      ...safeArray(correctiveActionReasoning.permanentCorrections),
      ...safeArray(correctiveActionReasoning.administrativeFollowUps),
      ...safeArray(correctiveActionReasoning.verificationSteps),
    ].filter(Boolean);

    const reviewerQuestions = [
      ...safeArray(dca.reviewerQuestions),
      ...safeArray(evidenceGapQuestions).map((item: any) =>
        typeof item === "string" ? item : item?.question || item?.prompt || "",
      ),
    ].filter(Boolean);

    const fallbackFixesAllowed = shardCorrectiveActionPatterns.length === 0;
    const staleBaseFixPattern = /windshield|protective film/i;

    const suggestedFixes = Array.from(new Set([
      ...shardCorrectiveActionPatterns,
      ...dcaFixes,
      ...brainFixes,
      ...(fallbackFixesAllowed ? safeArray(primary.suggestedFixes) : []),
    ]
      .map((item) => String(item).trim())
      .filter(Boolean)
      .filter((item) =>
        shardCorrectiveActionPatterns.length > 0
          ? !staleBaseFixPattern.test(item)
          : true,
      ))).slice(0, 12);

    const descriptionParts = [
      shardCorrectiveActionPatterns.length
        ? `Focused HazLenz shard controls: ${shardCorrectiveActionPatterns.slice(0, 4).join("; ")}`
        : "",
      fallbackFixesAllowed ? primary.description : "",
      dca.actionRationale ? `DCA rationale: ${dca.actionRationale}` : "",
      correctiveActionReasoning.immediateActionNarrative
        ? `Immediate: ${correctiveActionReasoning.immediateActionNarrative}`
        : "",
      correctiveActionReasoning.permanentCorrectionNarrative
        ? `Permanent correction: ${correctiveActionReasoning.permanentCorrectionNarrative}`
        : "",
      correctiveActionReasoning.verificationNarrative
        ? `Verification: ${correctiveActionReasoning.verificationNarrative}`
        : "",
      riskReasoning.riskNarrative || riskReasoning.summary
        ? `Risk reasoning: ${riskReasoning.riskNarrative || riskReasoning.summary}`
        : "",
      reviewerQuestions.length
        ? `Reviewer questions before closure: ${reviewerQuestions.slice(0, 4).join("; ")}`
        : "",
    ].filter(Boolean);

    const title =
      dca.immediateActions?.[0]?.title ||
      dca.immediateActions?.[0]?.action ||
      correctiveActionReasoning.immediateActions?.[0] ||
      primary.title ||
      "Review and control HazLenz AI-identified hazard";

    const priority =
      primary.priority ||
      (correctiveActionReasoning.urgencyLevel === "critical" ? "CRITICAL" :
       correctiveActionReasoning.urgencyLevel === "high" ? "HIGH" :
       correctiveActionReasoning.urgencyLevel === "moderate" ? "MEDIUM" :
       "LOW");

    const enhancedPrimary = {
      ...primary,
      title: String(title),
      description: descriptionParts.join(" "),
      priority,
      source: primary.source || "AI_ENGINE",
      reportId: primary.reportId || reportId,
      suggestedFixes,
      originalSuggestion: {
        ...(primary.originalSuggestion || {}),
        source: "safescope_v2_enriched_corrective_action",
        baseActionEngineSuggestion: primary.originalSuggestion || null,
        dca,
        correctiveActionReasoning,
        riskReasoning,
        scenarioIntelligence,
        evidenceGapQuestions,
        reviewerQuestions,
        shardCorrectiveActionPatterns,
        usesFocusedShardCorrectiveActions: shardCorrectiveActionPatterns.length > 0,
        enrichmentApplied: true,
      },
    };

    return [
      enhancedPrimary,
      ...base.slice(1),
    ];
  }

  private normalizeScopes(scopes?: string[], text?: string) {
    const requested = Array.isArray(scopes)
      ? scopes.map((scope) => String(scope || "").trim()).filter(Boolean)
      : [];

    if (!requested.length || requested.includes("all")) return requested;

    const combined = String(text || "").toLowerCase();
    const hasCoalContext = /\b(coal|surface coal|underground coal|longwall|continuous miner|coal mine)\b/.test(combined);
    const hasUndergroundContext = /\b(underground|shaft|slope|drift|stope|portal|subsurface)\b/.test(combined);

    return requested.flatMap((scope) => {
      if (scope === "msha") {
        if (hasCoalContext && hasUndergroundContext) return ["msha_coal_underground"];
        if (hasCoalContext) return ["msha_coal_surface"];
        if (hasUndergroundContext) return ["msha_mnm_underground"];
        return ["msha_mnm_surface"];
      }

      return [scope];
    });
  }

  private scopeToSource(scopes?: string[]) {
    if (!scopes || scopes.length === 0 || scopes.includes("all"))
      return undefined;
    if (scopes.includes("msha")) return "MSHA_MNM_SURFACE";
    if (scopes.includes("msha_mnm_surface")) return "MSHA_MNM_SURFACE";
    if (scopes.includes("msha_mnm_underground")) return "MSHA_MNM_UNDERGROUND";
    if (scopes.includes("msha_coal_underground")) return "MSHA_COAL_UNDERGROUND";
    if (scopes.includes("msha_coal_surface")) return "MSHA_COAL_SURFACE";
    if (scopes.includes("osha_general")) return "OSHA_GENERAL_INDUSTRY";
    if (scopes.includes("osha_construction")) return "OSHA_CONSTRUCTION";
    return undefined;
  }

  applyStandardsScopeFit(standards: any[], scopes: string[]) {
    return standards.map(standard => {
      const citation = standard.citation || '';
      let scopeFit = 'neutral';
      let scopeFitAdjustment = 0;
      const reasons = [...(standard.matchingReasons || [])];

      if (scopes.includes('msha_mnm_surface')) {
        if (citation.startsWith('30 CFR 56.')) {
          scopeFit = 'preferred';
          scopeFitAdjustment = 50;
          reasons.push('preferred MSHA Part 56 surface metal/nonmetal scope');
        } else if (citation.startsWith('30 CFR 57.')) {
          scopeFit = 'mismatch';
          scopeFitAdjustment = -100;
          reasons.push('Excluded: Part 57 applies to underground metal/nonmetal, not selected surface scope.');
        } else if (citation.startsWith('30 CFR 75.') || citation.startsWith('30 CFR 77.')) {
          scopeFit = 'mismatch';
          scopeFitAdjustment = -100;
          reasons.push('Excluded: coal standard does not match selected metal/nonmetal scope.');
        } else if (citation.startsWith('29 CFR') || citation.startsWith('1910.') || citation.startsWith('1926.')) {
          scopeFit = 'mismatch';
          scopeFitAdjustment = -100;
          reasons.push('Excluded: OSHA standard is outside selected MSHA scope.');
        }
      } else if (scopes.includes('msha_mnm_underground')) {
        if (citation.startsWith('30 CFR 57.')) {
          scopeFit = 'preferred';
          scopeFitAdjustment = 50;
          reasons.push('preferred MSHA Part 57');
        } else if (citation.startsWith('30 CFR 56.') || citation.startsWith('30 CFR 75.') || citation.startsWith('30 CFR 77.')) {
          scopeFit = 'mismatch';
          scopeFitAdjustment = -100;
          reasons.push('MSHA Part mismatch');
        }
      } else if (scopes.includes('msha_coal_underground')) {
        if (citation.startsWith('30 CFR 75.')) {
          scopeFit = 'preferred';
          scopeFitAdjustment = 50;
          reasons.push('preferred MSHA Part 75');
        } else if (citation.startsWith('30 CFR 56.') || citation.startsWith('30 CFR 57.') || citation.startsWith('30 CFR 77.')) {
          scopeFit = 'mismatch';
          scopeFitAdjustment = -100;
          reasons.push('MSHA Part mismatch');
        }
      } else if (scopes.includes('msha_coal_surface')) {
        if (citation.startsWith('30 CFR 77.')) {
          scopeFit = 'preferred';
          scopeFitAdjustment = 50;
          reasons.push('preferred MSHA Part 77');
        } else if (citation.startsWith('30 CFR 56.') || citation.startsWith('30 CFR 57.') || citation.startsWith('30 CFR 75.')) {
          scopeFit = 'mismatch';
          scopeFitAdjustment = -100;
          reasons.push('MSHA Part mismatch');
        }
      }

      return {
        ...standard,
        score: (standard.score || 0) + scopeFitAdjustment,
        scopeFit,
        scopeFitAdjustment,
        matchingReasons: reasons
      };
    });
  }

  private buildStandardsMatchExplanations(
    suggestedStandards: any[],
    fusedText: string,
    observationUnderstanding: any
  ) {
    const textLower = (fusedText || "").toLowerCase();

    function normalizeCit(citation: string) {
      return String(citation || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/^(\d+)\s+cfr\s+/, "")
        .replace(/\.+$/, "");
    }

    function isEvidenceSatisfied(question: string, text: string) {
      const lowerText = text.toLowerCase();
      
      // Question 1: Active operational hazard requiring physical protection
      if (
        question.includes("operational hazard requiring physical protection") || 
        question.includes("presents a physical, chemical, noise")
      ) {
        return ["chemical", "decanting", "splash", "jackhammer", "noise", "crushing", "dust", "flying", "particles"].some(kw => lowerText.includes(kw));
      }
      
      // Question 2: Specific exposure route or affected body part
      if (question.includes("specific exposure route or affected body part")) {
        return ["eye", "face", "boot", "shoe", "helmet", "ear", "hand", "shield", "head", "feet", "hearing"].some(kw => lowerText.includes(kw));
      }
      
      // Question 3: Proper personal protective equipment missing, inadequate, etc.
      if (question.includes("personal protective equipment was missing")) {
        return ["without", "no", "missing", "damaged", "wear", "observed", "unavailable", "earplug", "glasses"].some(kw => lowerText.includes(kw));
      }

      // Sibling questions (e.g. moving machinery, fall height, LOTO):
      if (question.includes("moving machine part")) {
        return ["conveyor", "pulley", "belt", "shaft", "rotating", "roller", "nip point", "pinch point"].some(kw => lowerText.includes(kw));
      }
      if (question.includes("guarding missing, damaged, removed")) {
        return ["unguarded", "missing guard", "no guard", "removed"].some(kw => lowerText.includes(kw));
      }
      if (question.includes("fall height or exposure condition")) {
        return ["fall", "height", "unprotected", "edge", "elevated", "platform"].some(kw => lowerText.includes(kw));
      }
      
      return false;
    }

    return suggestedStandards.map((std: any) => {
      const normCit = normalizeCit(std.citation);
      const seedRecord = STANDARDS_INTELLIGENCE_SEED.find(
        (s) => normalizeCit(s.citation) === normCit
      );

      if (!seedRecord) {
        // Minimal fallback explanation block if no curated seed record is found
        return {
          standardFamily: "unknown",
          jurisdiction: std.agencyCode === "MSHA" ? "msha" : "osha",
          reference: std.citation,
          title: std.heading || std.title || "Standard Reference",
          authorityTier: 2,
          matchedFacts: [],
          satisfiedEvidence: [],
          missingEvidence: ["Curated evidence requirements are not available for this reference."],
          confidence: std.confidence ? Number(std.confidence) : null,
          advisoryOnly: true,
          doesNotDeclareViolation: true,
          doesNotCreateCitation: true,
          requiresQualifiedReview: true,
        };
      }

      // Collect matched facts conservatively from the standard's seed tags that appear in the raw observation text
      const matchedFacts: string[] = [];
      const candidateTokens = [
        ...seedRecord.hazardFamilies,
        ...seedRecord.equipmentTags,
        ...seedRecord.taskTags,
        ...seedRecord.exposureTags,
        ...seedRecord.controlTags,
      ];
      for (const token of candidateTokens) {
        if (token.length > 2 && textLower.includes(token.toLowerCase())) {
          matchedFacts.push(token);
        }
      }

      // Evaluate evidenceRequirements dynamically based on text signatures
      const satisfiedEvidence: string[] = [];
      const missingEvidence: string[] = [];

      for (const req of seedRecord.evidenceRequirements) {
        if (isEvidenceSatisfied(req.question, textLower)) {
          satisfiedEvidence.push(req.question);
        } else {
          missingEvidence.push(req.question);
        }
      }

      return {
        standardFamily: seedRecord.hazardFamilies[0] || "unknown",
        jurisdiction: seedRecord.scope,
        reference: seedRecord.citation,
        title: seedRecord.title,
        authorityTier: seedRecord.authorityTier,
        matchedFacts: Array.from(new Set(matchedFacts)),
        satisfiedEvidence,
        missingEvidence,
        confidence: std.confidence ? Number(std.confidence) : null,
        advisoryOnly: true,
        doesNotDeclareViolation: true,
        doesNotCreateCitation: true,
        requiresQualifiedReview: true,
      };
    });
  }
}
