import { StandardsBridgeService } from "./standards-bridge.service";
import { Injectable, Optional, ForbiddenException } from "@nestjs/common";
import { WeightedClassifierService } from "./classifier/weighted-classifier.service";
import { evaluateRisk } from "./risk/risk-engine";
import { ActionEngineService } from "../action-engine/action-engine.service";
import { EvidenceFusionService } from "./evidence/evidence-fusion.service";
import { ApplicableStandardsService } from "../applicable-standards/applicable-standards.service";
import type { SafeScopeIntelligenceOrchestrator } from "./orchestration/intelligence-orchestrator.service";
import { STANDARDS_INTELLIGENCE_SEED } from "./standards-intelligence/standards-intelligence.seed";

function getMemorySnapshot() {
  const usage = process.memoryUsage();
  return {
    rssMb: Math.round(usage.rss / 1024 / 1024),
    heapUsedMb: Math.round(usage.heapUsed / 1024 / 1024),
    heapTotalMb: Math.round(usage.heapTotal / 1024 / 1024),
    externalMb: Math.round(usage.external / 1024 / 1024),
  };
}
import { buildSourceSynthesis } from "../safescope-knowledge/sources/source-synthesis-helper";
import { getEvidenceGapIntelligence } from "./intelligence/evidence-gap-intelligence";
import { getCorrectiveActionIntelligence } from "./intelligence/corrective-action-intelligence";
import { SafeScopeNativeReasoningService } from "./native-reasoning/native-reasoning.service";
import { SafeScopeReasoningOrchestratorService } from "./reasoning-orchestrator/reasoning-orchestrator.service";
import { InspectionCitationRecoveryService } from "./inspection-intelligence/inspection-citation-recovery.service";
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
import { EXPERT_APPLICABILITY_RULES } from "./inspection-intelligence/standard-applicability.rules";
import {
  buildSupplementalGuidance,
  getSupplementalKnowledgeForContext,
} from "./supplemental-knowledge/supplemental-guidance";



@Injectable()
export class SafescopeV2Service {
  private classifier = new WeightedClassifierService();
  private bridge = new StandardsBridgeService();
  private nativeReasoningService = new SafeScopeNativeReasoningService();
  private reasoningOrchestratorService = new SafeScopeReasoningOrchestratorService();
  private citationRecoveryService = new InspectionCitationRecoveryService();
  private lazyIntelligenceOrchestrator?: any;

  constructor(
    private readonly actionEngine: ActionEngineService,
    private readonly evidenceFusion: EvidenceFusionService,
    private readonly applicableStandards: ApplicableStandardsService,
    @Optional()
    private readonly intelligenceOrchestrator: any,
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

      const memoryBefore = getMemorySnapshot();

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
      const advisoryReasoning = this.reasoningOrchestratorService.reason({
        hazardObservation: fusedText,
        industryContext: normalizedScopes.join(' '),
        workspaceId,
      });
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
      if (debugMetadata) {
        diagnostics.memoryBeforeClassify = memoryBefore;
      }
      const rawSuggestedStandards = await this.applicableStandards.suggest(
        fusedText,
        promotedPrimary.classification,
        source,
        10,
        knowledgeRoute,
        debugMetadata ? diagnostics : undefined,
      );

      const standardAppResults = advisoryReasoning?.inspectionIntelligence?.standardApplicability;
      const governedCitations = new Set(EXPERT_APPLICABILITY_RULES.map(r => r.standardCitation.toLowerCase().replace(/\s+/g, '')));
      const mineType = String(advisoryReasoning?.inspectionIntelligence?.miningContext?.mineType || '').toLowerCase();
      const mineContextDetected = Boolean(advisoryReasoning?.inspectionIntelligence?.miningContext?.detected);
      const mineTypeAllowsCitation = (citation: string) => {
        const normalizedCitation = String(citation || '').trim();
        if (!normalizedCitation) return false;
        if (!/^30 CFR\b/.test(normalizedCitation)) return true;
        if (!mineContextDetected || mineType === 'not_mine') return true;
        if (mineType === 'unclear_mine') return false;
        const part = normalizedCitation.match(/^30 CFR (\d+)/)?.[1];
        if (!part) return true;
        if (part === '62') return true;
        if (mineType === 'surface_metal_nonmetal') return ['46', '48', '56'].includes(part);
        if (mineType === 'underground_metal_nonmetal') return ['48', '57'].includes(part);
        if (mineType === 'surface_coal') return ['48', '71', '77'].includes(part);
        if (mineType === 'underground_coal') return ['48', '70', '75'].includes(part);
        return true;
      };
      const applicabilitySuggestedStandards = Array.isArray(standardAppResults?.matchedRules)
        ? standardAppResults.matchedRules
            .map((rule: any) => {
              const citation = String(rule?.citation || '').trim();
              if (!citation) return null;
              return {
                citation,
                title: rule.standardTitle || citation,
                titleSummary: rule.standardTitle || citation,
                summary: rule.standardTitle || citation,
                score: 1000,
                confidence: 0.96,
                status: 'candidate_standard',
                candidateStatus: 'candidate_standard',
                standardFamily: String(rule.hazardFamily || '').toLowerCase() || undefined,
                hazardFamily: String(rule.hazardFamily || '').toLowerCase() || undefined,
                jurisdiction: rule.jurisdiction,
                source: ['standard_applicability'],
                matchingReasons: [`Sufficient applicability rule matched: ${rule.standardTitle}.`],
                evidenceNeeded: Array.isArray(standardAppResults?.followUpQuestions) && standardAppResults.followUpQuestions.length
                  ? standardAppResults.followUpQuestions.slice(0, 5)
                  : [`Confirm the observed condition, exposure path, and control status for ${rule.standardTitle}.`],
              };
            })
            .filter((standard: any) => Boolean(standard) && mineTypeAllowsCitation(String(standard?.citation || '')))
        : [];

      const mineTypeCompatibleStandards = [...rawSuggestedStandards, ...applicabilitySuggestedStandards]
        .filter((standard) => mineTypeAllowsCitation(String(standard?.citation || standard?.standard || standard?.id || '')));

      const scopedStandards = this.applyStandardsScopeFit(
        mineTypeCompatibleStandards,
        normalizedScopes,
      ).map((standard) => {
        const normCit = (standard.citation || standard.standard || '').toLowerCase().replace(/\s+/g, '');
        if (governedCitations.has(normCit)) {
          const isSuggested = standardAppResults?.suggestedStandards?.some(
            (c: string) => c.toLowerCase().replace(/\s+/g, '') === normCit
          );
          if (!isSuggested) {
            return {
              ...standard,
              candidateStatus: "needs_more_evidence",
              evidenceExclusionReason: "Candidate does not satisfy the Expert Applicability sufficiency gate requirements.",
            };
          }
        }
        return standard;
      }).sort((a, b) => (b.score || 0) - (a.score || 0));

      let suggestedStandards = scopedStandards
        .filter((standard) =>
          standard.scopeFit !== "mismatch" &&
          standard.candidateStatus !== "needs_more_evidence"
        )
        .slice(0, 5);

      let excludedStandards = scopedStandards
        .filter((standard) =>
          standard.scopeFit === "mismatch" ||
          standard.candidateStatus === "needs_more_evidence"
        )
        .map((standard) => ({
          ...standard,
          exclusionReason:
            standard.evidenceExclusionReason ||
            standard.scopeExclusionReason ||
            "Candidate lacks sufficient evidence fit for active suggestion.",
        }));


      const isVague = Boolean(advisoryReasoning.inspectionIntelligence?.vagueInputAnalysis?.isVague);
      if (isVague) {
        const newlyExcluded = suggestedStandards.map((standard: any) => ({
          ...standard,
          scopeFit: "mismatch",
          candidateStatus: "needs_more_evidence",
          exclusionReason: "Observation is too vague to suggest active standard candidates. More physical details are required.",
          scopeExclusionReason: "Observation is too vague to suggest active standard candidates. More physical details are required.",
        }));
        excludedStandards = [...excludedStandards, ...newlyExcluded];
        suggestedStandards = [];
      }

      const citationRecovery = this.citationRecoveryService.recover({
        observation: fusedText,
        suggestedStandards,
        excludedStandards,
        inspectionIntelligence: advisoryReasoning.inspectionIntelligence,
        scopes: normalizedScopes,
      });
      suggestedStandards = citationRecovery.suggestedStandards;
      excludedStandards = citationRecovery.excludedStandards;
      const supportingStandards = citationRecovery.supportingStandards;
      const needsMoreEvidenceFamilyPattern = (() => {
        const familyHint = String(
          advisoryReasoning?.inspectionIntelligence?.standardApplicability?.matchedRules?.[0]?.hazardFamily ||
          advisoryReasoning?.inspectionIntelligence?.hazardCandidates?.find((candidate: any) => candidate?.role === 'primary')?.domain ||
          (advisoryReasoning?.inspectionIntelligence?.candidateStandards?.[0] as any)?.hazardFamily ||
          promotedPrimary.classification ||
          '',
        ).toLowerCase();
        if (familyHint.includes('electrical')) {
          return /(?:1910\.(?:303|305|331|333|334|306)|1926\.(?:403|404|405)|(?:56|57)\.(?:12004|12013|12016|12032|12034|12037)|electrical|cord|cable|wire|panel|breaker|enclosure|live parts?|energized)/i;
        }
        if (familyHint.includes('hazard_communication') || familyHint.includes('hazcom') || familyHint.includes('chemical')) {
          return /(?:1910\.1200|1926\.59|47\.|hazard communication|hazcom|chemical|container|label|sds|spill|leak|release|drain|used oil|waste oil|unknown substance|unknown contents)/i;
        }
        if (familyHint.includes('walking_working_surfaces') || familyHint.includes('housekeeping') || familyHint.includes('slip_trip_fall')) {
          return /(?:1910\.(?:22|23|28|29)|1926\.25|(?:56|57)\.(?:20003|11001)|walking-working surfaces|housekeeping|floor|walkway|aisle|travelway|slip|trip|fall|hole|opening|guardrail|ladder|egress|debris|spill|release|residue)/i;
        }
        if (familyHint.includes('machine_guarding')) {
          return /(?:1910\.(?:212|219|147)|1926\.300|(?:56|57)\.(?:14107|12016)|machine guarding|guard|guarding|conveyor|rotating|shaft|pulley|nip|point of operation|moving parts?|lockout|tagout|servicing|unexpected startup|hazardous energy)/i;
        }
        if (familyHint.includes('mobile_equipment')) {
          return /(?:1910\.178|1926\.(?:601|602)|30 CFR 56\.9100|mobile equipment|forklift|loader|haul truck|truck|vehicle|pedestrian|backing|traffic|spotter|berm|route|blind corner)/i;
        }
        if (familyHint.includes('fall_protection')) {
          return /(?:1910\.(?:28|29)|1926\.501|guardrail|platform|edge|roof|fall protection|fall arrest|aerial lift|scaffold|ladder)/i;
        }
        if (familyHint.includes('compressed_gas')) {
          return /(?:1910\.101|1926\.350|(?:56|57)\.1600[56]|compressed gas|cylinder|oxygen|acetylene|valve cap|regulator)/i;
        }
        if (familyHint.includes('confined_space')) {
          return /(?:1910\.146|1926\.1203|confined space|permit space|tank|vessel|manhole|atmosphere|oxygen deficiency|entry)/i;
        }
        if (familyHint.includes('industrial_hygiene') || familyHint.includes('health_')) {
          return /(?:silica|dust|noise|fume|vapour|vapor|heat|cold|respirator|welding|solvent|ventilation)/i;
        }
        return null;
      })();
      const needsMoreEvidenceStandards = (citationRecovery.needsMoreEvidenceStandards || []).filter((standard: any) => {
        if (!needsMoreEvidenceFamilyPattern) return true;
        const citation = String(standard?.citation || standard?.standard || standard?.id || '').toLowerCase();
        const title = String(standard?.title || standard?.titleSummary || standard?.summary || '').toLowerCase();
        return needsMoreEvidenceFamilyPattern.test(`${citation} ${title}`);
      });
      const scopeCompatibleCandidateCount = scopedStandards.filter(
        (standard) => standard.scopeFit !== "mismatch"
      ).length;

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
        isVague,
        safeScope: {
          classification: promotedPrimary.classification,
          riskBand: (risk?.riskBand || "Low") as any,
          requiresShutdown: risk?.requiresShutdown,
          imminentDanger: risk?.imminentDanger,
          fatalityPotential: risk?.fatalityPotential ? "high" : "low",
          reasoning: risk?.reasoning || [],
          standards: suggestedStandards.map(s => ({ citation: s.citation, rationale: s.matchingReasons?.join(", ") })),
          isVague,
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

      const memorySnapshot = getMemorySnapshot;

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
            "Verify if the container is properly labeled with chemical identity, hazards, and GHS pictograms.",
            "Confirm availability and location of the Safety Data Sheet (SDS) for this specific chemical substance.",
            "Check presence of eye wash station, chemical-resistant gloves, and proper secondary containment.",
            "Confirm what substance is stored inside the container/tank, and whether it is a chemical or secondary container."
          ];
          classReason = "Assessed chemical safety risk, focusing on container labeling, hazard communication, and SDS availability.";
        } else if (lowerClass.includes("housekeeping") || lowerClass.includes("trip") || lowerClass.includes("clutter") || lowerClass.includes("walking") || lowerClass.includes("working") || lowerClass.includes("surfaces") || lowerClass.includes("slip")) {
          if (lowerClass.includes("oil") || lowerClass.includes("container")) {
            evidenceGaps = [
              "Is the container labeled?",
              "Is the container closed or covered?",
              "Is there visible oil on the floor?",
              "Is it in or near a travelway?",
              "Is secondary containment present?",
              "Are there nearby drains, soil, or stormwater pathways?",
              "Is the container managed as used oil/waste per site procedure?",
              "Has cleanup or spill prevention been completed?"
            ];
            classReason = "Assessed open used-oil container or spill hazard near walking paths, analyzing release modes, exposure pathways, and slip risks.";
          } else {
            evidenceGaps = [
              "Verify if travelways, walkways, and emergency exits are clear of clutter, cords, or debris.",
              "Identify source of any spills (oil, water, dust) and check if cleanup materials or warning signs are deployed.",
              "Check lighting levels and walking surface conditions (uneven ground, cracks, ice) in the hazard area.",
            ];
            classReason = "Assessed slip, trip, and fall-on-same-level hazards, focusing on clean walkways and clear emergency exits.";
          }
        } else if (lowerClass.includes("traffic") || lowerClass.includes("pedestrian") || lowerClass.includes("vehicle") || lowerClass.includes("speed")) {
          evidenceGaps = [
            "Are pedestrian walkways physically separated from vehicle lanes?",
            "Are speed limits clearly posted and enforced?",
            "Are backup alarms and strobe lights functioning on all equipment?",
            "Are spotters or flaggers present in blind or high-risk zones?",
            "Are workers wearing high-visibility safety vests?"
          ];
          classReason = "Assessed mobile equipment traffic control and pedestrian interaction hazards, prioritizing physical segregation controls.";
        } else if (lowerClass.includes("compressed_gas") || lowerClass.includes("cylinder") || lowerClass.includes("gas") || lowerClass.includes("valve cap")) {
          evidenceGaps = [
            "Are cylinders secured upright with chains or racks?",
            "Are valve protective caps installed when not in active use?",
            "Are oxygen and fuel gas cylinders separated by 20 feet or a 5-foot 1/2-hour fire barrier?",
            "Are cylinder contents and hazards clearly labeled?"
          ];
          classReason = "Assessed compressed gas cylinder storage and handling hazards, focusing on restraint systems, valve caps, and storage segregation.";
        } else if (lowerClass.includes("hydraulic") || lowerClass.includes("pneumatic") || lowerClass.includes("pressure") || lowerClass.includes("whip check")) {
          evidenceGaps = [
            "Are whip checks or safety cables installed on all high-pressure connections?",
            "Has stored pressure been verified bled to zero before opening lines?",
            "Are mechanical blocks or stands installed under hydraulically raised components?",
            "Have high-pressure hoses been inspected for wear, leaks, or damage?"
          ];
          classReason = "Assessed hydraulic and pneumatic energy release hazards, focusing on pressure isolation, mechanical blocks, and whip check restraints.";
        }

        return {
          degraded: true,
          fullIntelligenceAvailable: false,
          fallbackReason,
          additionalHazards: [],
          evidenceGaps,
          reasoningSummary: [
            "HazLenz AI returned a production-safe advisory result while advanced review was unavailable.",
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
      const fullRenderIntelligenceDisabled =
        process.env.HAZLENZ_DISABLE_FULL_INTELLIGENCE_ON_RENDER === "true";
      const configuredRenderHeapLimitMb = Number(
        process.env.HAZLENZ_MAX_HEAP_BEFORE_FULL_INTELLIGENCE_MB || 420,
      );
      const renderHeapGuardTriggered =
        productionRuntime &&
        renderRuntime &&
        Number.isFinite(configuredRenderHeapLimitMb) &&
        configuredRenderHeapLimitMb > 0 &&
        memoryBefore.heapUsedMb >= configuredRenderHeapLimitMb;

      if (
        productionRuntime &&
        renderRuntime &&
        (fullRenderIntelligenceDisabled || renderHeapGuardTriggered)
      ) {
        if (process.env.NODE_ENV === "development" || debugMetadata) {
          console.warn("[HazLenz classify] skipping full intelligence orchestrator on Render production", {
            reason: renderHeapGuardTriggered
              ? "pre_import_heap_guard"
              : "runtime_configuration",
            textLength: fusedText.length,
            standards: suggestedStandards.length,
            actions: Array.isArray(generatedActions) ? generatedActions.length : 0,
            memory: memorySnapshot(),
          });
        }

        intelligence = buildDegradedHazLenzIntelligence(
          renderHeapGuardTriggered
            ? `HazLenz AI advanced review was skipped because heap usage reached the configured ${configuredRenderHeapLimitMb} MB pre-import guard. Core classification, risk, standards candidates, and corrective actions were still generated.`
            : "HazLenz AI advanced review was disabled by runtime configuration. Core classification, risk, standards candidates, and corrective actions were still generated.",
          promotedPrimary?.classification
        );
      } else {
        try {
          if (process.env.NODE_ENV === "development" || debugMetadata) {
            console.log("[HazLenz classify] intelligence orchestrator start", {
              textLength: fusedText.length,
              standards: suggestedStandards.length,
              actions: Array.isArray(generatedActions) ? generatedActions.length : 0,
              memory: memorySnapshot(),
            });
          }

          let orchestrator = this.intelligenceOrchestrator || this.lazyIntelligenceOrchestrator;
          if (!orchestrator) {
            const { SafeScopeIntelligenceOrchestrator } = await import("./orchestration/intelligence-orchestrator.service");
            this.lazyIntelligenceOrchestrator = new SafeScopeIntelligenceOrchestrator(
              this.persistence,
              undefined,
              this.access,
            );
            orchestrator = this.lazyIntelligenceOrchestrator;
          }

          intelligence = await orchestrator.evaluate({
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

          if (process.env.NODE_ENV === "development" || debugMetadata) {
            console.log("[HazLenz classify] intelligence orchestrator complete", {
              memory: memorySnapshot(),
            });
          }
        } catch (error) {
          console.error("[HazLenz classify] intelligence orchestrator failed; returning degraded advisory fallback", {
            error,
            memory: memorySnapshot(),
          });

          intelligence = buildDegradedHazLenzIntelligence(
            "HazLenz AI advanced review was unavailable. Core classification, risk, standards candidates, and corrective actions were still generated.",
            promotedPrimary?.classification
          );
        }
      }

      if (debugMetadata) {
        diagnostics.memoryAfterClassify = memorySnapshot();
        diagnostics.fullIntelligenceMemoryGuard = {
          renderRuntime,
          productionRuntime,
          configuredHeapLimitMb: configuredRenderHeapLimitMb,
          heapUsedBeforeClassifyMb: memoryBefore.heapUsedMb,
          triggered: renderHeapGuardTriggered,
        };
      }

      const hasServicingEnergyEvidence =
        /\b(lockout|loto|tagout|locked out|energy isolation|isolated|de-energized|deenergized|hazardous energy|unexpected startup|stored energy)\b/i.test(fusedText) ||
        (/\b(maintenance|servicing|repair|clearing jam|unjamming|cleaning|adjusting|troubleshooting|work on)\b/i.test(fusedText) &&
          /\b(energized|powered|running|moving|startup|start up|conveyor|machine|equipment|motor|circuit|electrical)\b/i.test(fusedText));
      const hasConfinedSpaceEvidence =
        /\b(confined space|permit space|permit-required|manhole|vault|pit)\b/i.test(fusedText) ||
        (/\b(tank|vessel|silo|bin)\b/i.test(fusedText) &&
          /\b(entry|enter|inside|worker inside|atmosphere|oxygen deficient|toxic atmosphere|engulfment|permit)\b/i.test(fusedText));
      const hasMobileEquipmentEvidence =
        /\b(forklift|loader|haul truck|truck|mobile equipment|powered industrial truck|vehicle|dozer|skid steer|excavator|backhoe|front-end loader|front end loader)\b/i.test(fusedText) &&
        /\b(pedestrian|walkway|aisle|travelway|traffic|stockpile|haul road|blind corner|separation|spotter|traffic control|right of way|same aisle|same route|no traffic control)\b/i.test(fusedText);
      const hasCylinderEvidence =
        /\b(oxygen|acetylene|argon|propane|compressed gas|gas cylinder|cylinders?|cylinder)\b/i.test(fusedText);
      const hasHotWorkEvidence =
        /\b(hot work|welding|cutting|brazing|torch|fuel gas)\b/i.test(fusedText);
      const hasHornEvidence =
        /\b(horn|horns|backup alarm|backup alarms|audible warning)\b/i.test(fusedText);
      const hasSpecificPurposeEquipmentEvidence =
        /\b(sign|outline lighting|crane|hoist|elevator|dumbwaiter|escalator|moving walk|welder|welding machine|x-ray|induction heating|dielectric heating|electrolytic cell)\b/i.test(fusedText);
      const hasElectricalPhysicalEvidence =
        /\b(panel|breaker|enclosure|cover plate|filler plate|energized parts?|live parts?|conductor|cord|wiring|power strip|receptacle)\b/i.test(fusedText);
      const hasWalkingSurfaceReleaseEvidence =
        /\b(used[- ]oil|waste[- ]oil|oily waste|oily residue|oil spill|spill|spilled|leak|leaking|release|residue|residual)\b/i.test(fusedText) &&
        /\b(floor|walkway|aisle|travelway|walking surface|pedestrian|maintenance area|maintenance bay|shop floor|work area|drain|floor drain|storm drain|soil|water)\b/i.test(fusedText);
      const hasHazComIdentityEvidence =
        /\b(unlabeled|no label|missing label|no workplace marking|workplace marking|unknown liquid|unknown chemical|unidentified liquid|chemical identity|sds|hazcom|hazard communication|secondary container|spray bottle)\b/i.test(fusedText);


      const hasSpecificPanelDefectEvidence =
        /\b(open breaker slot|missing (?:panel )?cover|missing dead[- ]front|missing filler|filler plate|knockout|open slot|empty space in (?:the )?electrical panel|breaker or blank should be|blank should be|unused opening|exposed (?:live |energized )?(?:parts|bus|busbar|terminals?)|uncovered electrical panel|open electrical panel)\b/i.test(fusedText);


      const buildAdditionalInformationNeeded = () => {
        const items: Array<{ category: string; question: string; reason: string }> = [];

        const add = (category: string, question: string, reason: string) => {
          const key = `${category}|${question}`.toLowerCase();
          if (items.some((item) => `${item.category}|${item.question}`.toLowerCase() === key)) return;
          items.push({ category, question, reason });
        };

        const lower = fusedText.toLowerCase();
        const administrativeOnlyText =
          /\b(meeting|scheduled|schedule|training record|record is current|binder|calendar|account|login|log in)\b/i.test(lower) &&
          !/\b(open|missing|damaged|exposed|leaking|spill|unguarded|blocked|unsecured|no label|unlabeled|unknown liquid|energized|live parts|pedestrian exposure)\b/i.test(lower);

        if (administrativeOnlyText) {
          return [];
        }

        if (isVague || /\b(panel|breaker|electrical|cord|wire|wiring)\b/i.test(lower)) {
          add("Electrical condition", "What electrical equipment is involved, and what visible defect was observed?", "Needed to separate blocked access, damaged cord, exposed energized parts, and general electrical concerns.");
          add("Energy/exposure", "Are energized or live parts exposed, and can unqualified persons access the area?", "Needed before HazLenz can treat an electrical standard as more than a candidate.");
          add("Qualified review", "Has a qualified electrical person evaluated the condition?", "Electrical findings commonly require qualified verification before final report language.");
        }

        if (/\b(container|drum|bucket|pail|jug|tank|chemical|label|unlabeled|no label|no workplace marking|workplace marking|unknown liquid|unidentified liquid|spray bottle|sds|used oil|waste oil)\b/i.test(lower)) {
          add("Chemical identity", "What is the container holding, and is the chemical identity known?", "Needed to separate HazCom labeling, spill/release, storage, and environmental concerns.");
          add("Label/SDS", "Is a workplace label present and is the SDS available?", "Needed to support a HazCom candidate standard.");
          add("Release/exposure", "Is there a leak, spill, residue, drain pathway, or employee exposure?", "Needed to determine whether housekeeping, environmental, or exposure controls also apply.");
        }

        if (/\b(oil|spill|leak|residue|floor|walkway|aisle|trip|slip|blocked access)\b/i.test(lower)) {
          add("Walking surface", "Is the walking-working surface wet, oily, obstructed, damaged, or otherwise affected?", "Needed to support walking-working surface applicability.");
          add("Exposure", "Do employees walk through or work in the affected area?", "Needed to estimate likelihood and exposure pathway.");
          add("Control status", "Has the area been barricaded, cleaned, or otherwise controlled?", "Needed to assess immediate control adequacy.");
        }

        if (/\b(guard|guarding|machine|conveyor|pulley|shaft|nip point|moving part)\b/i.test(lower)) {
          add("Equipment", "What machine, conveyor, pulley, shaft, or moving part is involved?", "Needed to select the correct guarding standard and mechanism of injury.");
          add("Exposure", "Can a person reach the moving part during operation, cleanup, or maintenance?", "Needed to determine caught-in exposure.");
          add("Energy/task", "Was the equipment operating, capable of startup, or under lockout/tagout?", "Needed to separate guarding from hazardous-energy-control concerns.");
        }

        if (/\b(forklift|truck|loader|vehicle|mobile equipment|pedestrian|traffic|blind corner)\b/i.test(lower)) {
          add("Equipment movement", "What mobile equipment is operating and where is it traveling?", "Needed to distinguish PIT, mobile equipment, and traffic-control issues.");
          add("Pedestrian exposure", "Are pedestrians, miners, or workers sharing the travel path?", "Needed to evaluate struck-by exposure.");
          add("Traffic controls", "Are spotters, barriers, signs, right-of-way rules, or separation controls in place?", "Needed to assess control adequacy.");
        }

        if (/\b(ladder|platform|roof|edge|fall|guardrail|fall arrest|scaffold)\b/i.test(lower)) {
          add("Fall exposure", "What height, surface, ladder, platform, or edge is involved?", "Needed to separate ladder condition, fall protection, and walking-working surface issues.");
          add("Protection status", "Are guardrails, covers, fall arrest, ladder securement, or other controls present?", "Needed to support the likely fall-protection standard.");
          add("Task", "What work was being performed and how long was the exposure?", "Needed for risk and corrective-action confidence.");
        }

        const existingQuestions = [
          ...(Array.isArray((intelligence as any)?.evidenceGapQuestions) ? (intelligence as any).evidenceGapQuestions : []),
          ...(Array.isArray((intelligence as any)?.inspectionIntelligence?.evidenceGapQuestions) ? (intelligence as any).inspectionIntelligence.evidenceGapQuestions : []),
        ];

        for (const q of existingQuestions) {
          const question = typeof q === "string" ? q : q?.question || q?.prompt || "";
          if (question) {
            add("HazLenz evidence gap", String(question), "Generated by HazLenz to improve confidence before final report use.");
          }
        }

        return items.slice(0, 6);
      };


      const sanitizeVagueGeneratedAction = (action: any) => {
        if (!isVague || hasSpecificPanelDefectEvidence || !action) return action;

        const vagueElectricalConcern =
          /\b(panel|breaker|electrical)\b/i.test(fusedText) &&
          !hasSpecificPanelDefectEvidence;

        if (!vagueElectricalConcern) return action;

        const forbiddenSpecificElectricalLanguage =
          /\b(filler|knockout|dead[- ]front|open slot|approved covers?|blanks?|enclosure parts?|replace damaged wiring|exposed electrical equipment)\b/i;

        const sanitizeText = (value: any) => {
          if (typeof value !== "string") return value;
          if (!forbiddenSpecificElectricalLanguage.test(value)) return value;

          return "Restrict access to the electrical area and have a qualified electrical person verify the condition before work continues.";
        };

        const sanitized = {
          ...action,
          title: sanitizeText(action.title),
          text: sanitizeText(action.text),
          action: sanitizeText(action.action),
          description: sanitizeText(action.description),
          summary: sanitizeText(action.summary),
        };

        if (Array.isArray(action.steps)) {
          sanitized.steps = action.steps
            .map(sanitizeText)
            .filter((step: any) => typeof step !== "string" || !forbiddenSpecificElectricalLanguage.test(step));
        }

        if (Array.isArray(action.referenceStandards)) {
          sanitized.referenceStandards = action.referenceStandards;
        }

        return sanitized;
      };

      const sanitizedGeneratedActions = (generatedActions || []).map((action: any) => sanitizeVagueGeneratedAction({
        ...action,
        referenceStandards: (Array.isArray(action?.referenceStandards) ? action.referenceStandards : []).filter((standard: any) => {
          const citation = String(standard?.citation || standard?.standard || standard?.id || standard || "").trim();
          if (!citation) return false;
          if (/1910\.147|(?:56|57)\.12016/i.test(citation) && !hasServicingEnergyEvidence) return false;
          if (/1910\.146|1926\.1203|(?:56|57)\.18001/i.test(citation) && !hasConfinedSpaceEvidence) return false;
          if (/(?:1910\.178|1926\.60[12]|(?:56|57)\.9100)/i.test(citation) && !hasMobileEquipmentEvidence) return false;
          if (/(?:56\.93[0-9]|56\.14132\(a\)|1910\.178\(l\)|1926\.601\(b\)\(14\))/i.test(citation) && !hasHornEvidence) return false;
          if (/(?:1910\.101|1926\.350|(?:56|57)\.1600[56])/i.test(citation) && !hasCylinderEvidence) return false;
          if (/1910\.306/i.test(citation) && !hasSpecificPurposeEquipmentEvidence) return false;
          if (/(?:1910\.301|1910\.331)/i.test(citation) && hasElectricalPhysicalEvidence) return false;
          return true;
        }),
      }));

      const enhancedGeneratedActions = this.buildEnhancedGeneratedActions(
        sanitizedGeneratedActions,
        intelligence,
        actionInput.id,
        knowledgeShardSummary,
        fusedText,
        isVague,
      );
      const sanitizedEnhancedGeneratedActions = (enhancedGeneratedActions || []).map((action: any) => sanitizeVagueGeneratedAction({
        ...action,
        referenceStandards: (Array.isArray(action?.referenceStandards) ? action.referenceStandards : []).filter((standard: any) => {
          const citation = String(standard?.citation || standard?.standard || standard?.id || standard || "").trim();
          if (!citation) return false;
          if (/1910\.147|(?:56|57)\.12016/i.test(citation) && !hasServicingEnergyEvidence) return false;
          if (/1910\.146|1926\.1203|(?:56|57)\.18001/i.test(citation) && !hasConfinedSpaceEvidence) return false;
          if (/(?:1910\.178|1926\.60[12]|(?:56|57)\.9100)/i.test(citation) && !hasMobileEquipmentEvidence) return false;
          if (/(?:56\.93[0-9]|56\.14132\(a\)|1910\.178\(l\)|1926\.601\(b\)\(14\))/i.test(citation) && !hasHornEvidence) return false;
          if (/(?:1910\.101|1926\.350|(?:56|57)\.1600[56])/i.test(citation) && !hasCylinderEvidence) return false;
          if (/1926\.350/i.test(citation) && !hasHotWorkEvidence) return false;
          if (/1910\.306/i.test(citation) && !hasSpecificPurposeEquipmentEvidence) return false;
          if (/(?:1910\.301|1910\.331)/i.test(citation) && hasElectricalPhysicalEvidence) return false;
          if (/1910\.1200/i.test(citation) && hasWalkingSurfaceReleaseEvidence && !hasHazComIdentityEvidence) return false;
          return true;
        }),
      }));

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
        scopeFilteredCandidateCount: scopeCompatibleCandidateCount,
        supportingCandidateCount: supportingStandards.length,
        needsMoreEvidenceCandidateCount: needsMoreEvidenceStandards.length,
        excludedCandidateCount: excludedStandards.length,
        suggestedCitations: suggestedStandards.map((standard: any) => standard.citation).filter(Boolean),
        supportingCitations: supportingStandards.map((standard: any) => standard.citation).filter(Boolean),
        needsMoreEvidenceCitations: needsMoreEvidenceStandards.map((standard: any) => standard.citation).filter(Boolean),
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
      const isDisplayableCitationLike = (value: any) => {
        const text = String(
          value?.citation ||
            value?.standard ||
            value?.standardNumber ||
            value?.code ||
            value?.reference ||
            value?.title ||
            value?.heading ||
            value || ""
        ).trim();
        if (!text) return false;
        if (/^(review|pending|candidate standard|suggested candidate standard|fallback candidate standard|standard family|applicable standard|no specific standard selected yet|needs more evidence|review candidate standard)$/i.test(text)) {
          return false;
        }
        return /\b(?:\d+\s*CFR\s*\d+(?:\.\d+)?(?:\([a-z0-9]+\))*|\d+\.\d+(?:\([a-z0-9]+\))*)\b/i.test(text);
      };
      const buildDisplayStandard = (value: any) => {
        const citation = String(
          value?.citation ||
            value?.standard ||
            value?.standardNumber ||
            value?.code ||
            value?.reference ||
            value || ""
        ).trim();
        if (!isDisplayableCitationLike(value)) return null;
        if (typeof value === "string") {
          return { citation, title: citation, titleSummary: citation, summary: citation, status: "candidate_standard", candidateStatus: "candidate_standard", source: ["standards_traceability"] };
        }
        return {
          ...value,
          citation,
        };
      };
      const shouldSurfacePrimaryStandard = (citation: string) => {
        if (/1910\.147|(?:56|57)\.12016/i.test(citation) && !hasServicingEnergyEvidence) return false;
        if (/1910\.146|1926\.1203|(?:56|57)\.18001/i.test(citation) && !hasConfinedSpaceEvidence) return false;
        if (/(?:1910\.178|1926\.60[12]|(?:56|57)\.9100)/i.test(citation) && !hasMobileEquipmentEvidence) return false;
        if (/(?:56\.93[0-9]|56\.14132\(a\)|1910\.178\(l\)|1926\.601\(b\)\(14\))/i.test(citation) && !hasHornEvidence) return false;
        if (/(?:1910\.101|1926\.350|(?:56|57)\.1600[56])/i.test(citation) && !hasCylinderEvidence) return false;
        if (/1910\.253/i.test(citation) && !hasHotWorkEvidence) return false;
        if (/1926\.350/i.test(citation) && !hasHotWorkEvidence) return false;
        if (/1910\.306/i.test(citation) && !hasSpecificPurposeEquipmentEvidence) return false;
        if (/(?:1910\.301|1910\.331)/i.test(citation) && hasElectricalPhysicalEvidence) return false;
        if (/1910\.1200/i.test(citation) && hasWalkingSurfaceReleaseEvidence && !hasHazComIdentityEvidence) return false;
        return true;
      };
      const hasContradictoryElectricalSafeEvidence =
        /\b(panel|breaker|electrical|enclosure)\b/i.test(fusedText) &&
        /\b(cover is intact|cover intact|access is clear|clear access|no live parts|no exposed parts|no energized parts|fully closed|closed and latched)\b/i.test(fusedText);

      const primaryStandards = (() => {
        const candidateStandards = (advisoryReasoning.inspectionIntelligence?.candidateStandards || []).map(buildDisplayStandard).filter(Boolean);
        const traceabilityStandards = (standardsTraceability.suggestedCitations || []).map((citation: string) => buildDisplayStandard({ citation, title: citation, summary: citation, status: "candidate_standard", candidateStatus: "candidate_standard", source: ["standards_traceability"] })).filter(Boolean);
        const supportingStandardsDisplay = (supportingStandards || []).map(buildDisplayStandard).filter(Boolean);
        const semanticCandidateStandards = [
          ...(hasSpecificPanelDefectEvidence
            ? [buildDisplayStandard({
                citation: "29 CFR 1910.303(g)(2)(i)",
                title: "Guarding of live parts",
                summary: "Candidate standard based on an electrical panel opening, missing cover/blank, or potentially accessible energized parts.",
                status: "candidate_standard",
                candidateStatus: "candidate_standard",
                standardFamily: "electrical",
                source: ["semantic_evidence_generalization"],
              })]
            : []),
          ...(hasHazComIdentityEvidence && /\b(container|bottle|spray bottle|shop|chemical|liquid|unknown liquid|unidentified liquid|marking|label)\b/i.test(fusedText)
            ? [buildDisplayStandard({
                citation: "29 CFR 1910.1200(f)(1)",
                title: "Labels on shipped containers / workplace chemical identity",
                summary: "Candidate standard based on unknown chemical identity, missing workplace marking, or unlabeled secondary container evidence.",
                status: "candidate_standard",
                candidateStatus: "candidate_standard",
                standardFamily: "hazard_communication",
                source: ["semantic_evidence_generalization"],
              })]
            : []),
        ].filter(Boolean);

        const collected = (suggestedStandards || []).length
          ? (suggestedStandards || []).map(buildDisplayStandard).filter(Boolean)
          : traceabilityStandards.length
            ? traceabilityStandards
            : candidateStandards.length
              ? candidateStandards
              : semanticCandidateStandards;
        const baseCollected = collected.length ? collected : supportingStandardsDisplay;
        const seen = new Set<string>();
        return baseCollected.filter((standard: any) => {
          const key = String(standard?.citation || "").toLowerCase().replace(/\s+/g, "");
          if (!key || seen.has(key) || !shouldSurfacePrimaryStandard(String(standard?.citation || ""))) return false;

          if (hasContradictoryElectricalSafeEvidence) {
            const family = String(standard?.standardFamily || standard?.hazardFamily || "").toLowerCase();
            const status = String(standard?.candidateStatus || standard?.status || "").toLowerCase();
            if (family.includes("electrical") && status.includes("supporting_context")) return false;
          }

          seen.add(key);
          return true;
        }).slice(0, 5);
      })();
      const sanitizeApplicabilityStandards = (standards: any[] = []) =>
        standards
          .map(buildDisplayStandard)
          .filter((standard: any) => standard && shouldSurfacePrimaryStandard(String(standard?.citation || "")))
          .filter((standard: any, index: number, values: any[]) => values.findIndex((item) => String(item?.citation || "").toLowerCase().replace(/\s+/g, "") === String(standard?.citation || "").toLowerCase().replace(/\s+/g, "")) === index);
      const sanitizedApplicabilityIntelligence = (intelligence as any)?.applicabilityIntelligence
        ? {
            ...(intelligence as any).applicabilityIntelligence,
            primaryApplicableStandards: sanitizeApplicabilityStandards((intelligence as any).applicabilityIntelligence?.primaryApplicableStandards || []),
            supportingStandards: sanitizeApplicabilityStandards((intelligence as any).applicabilityIntelligence?.supportingStandards || []),
            excludedStandards: sanitizeApplicabilityStandards((intelligence as any).applicabilityIntelligence?.excludedStandards || []),
          }
        : (intelligence as any)?.applicabilityIntelligence;
      const likelyGuardingReview =
        (
          /guard/i.test(String(promotedPrimary.classification || '')) ||
          String(knowledgeRoute?.hazardFamily || '').toLowerCase() === 'machine_guarding'
        ) &&
        suggestedStandards.length === 0 &&
        (needsMoreEvidenceStandards.length > 0 || Boolean(advisoryReasoning.inspectionIntelligence?.vagueInputAnalysis?.isVague));
      const guardingReviewQuestions = [
        'What equipment, opening, edge, or moving part is missing the guard?',
        'Is the equipment operating or energized, and are workers exposed to a nip point, rotating part, fall edge, or floor opening?',
        'Is this OSHA General Industry, OSHA Construction, or MSHA?',
      ];

      const classifierHazardCategory = (() => {
        const classification = promotedPrimary.classification || '';
        const nameLower = classification.toLowerCase();
        if (
          nameLower.includes('compressed gas') ||
          nameLower.includes('cylinder') ||
          fusedText.includes('cylinder') ||
          fusedText.includes('compressed gas') ||
          fusedText.includes('oxygen')
        ) {
          return 'compressed_gas';
        }
        if (nameLower.includes('electrical')) {
          return 'electrical';
        }
        if (nameLower.includes('guarding') || nameLower.includes('machine')) {
          return 'machine_guarding';
        }
        if (nameLower.includes('loto') || nameLower.includes('lockout')) {
          return 'machine_guarding_loto';
        }
        if (nameLower.includes('fall')) {
          return 'fall_protection';
        }
        if (
          nameLower.includes('housekeeping') ||
          nameLower.includes('slip') ||
          nameLower.includes('trip') ||
          nameLower.includes('working surfaces')
        ) {
          return 'slip_trip_fall';
        }
        if (nameLower.includes('mobile') || nameLower.includes('traffic')) {
          return 'mobile_equipment';
        }
        if (nameLower.includes('confined')) {
          return 'confined_space';
        }
        if (nameLower.includes('materials') || nameLower.includes('communication') || nameLower.includes('hazcom')) {
          return 'hazardous_materials';
        }
        return promotedPrimary.family || 'unknown';
      })();

      // Determine root-level hazardCategory (primary hazard domain)
      const isGenericClassifierCategory = (value: string) => {
        const normalized = String(value || '').toLowerCase();
        return !normalized || ['unknown', 'unclassified', 'other', 'general', 'misc', 'miscellaneous'].includes(normalized);
      };

      const rootHazardCategory = (() => {
        const applicabilityHazardFamily = advisoryReasoning?.inspectionIntelligence?.standardApplicability?.matchedRules?.[0]?.hazardFamily;
        if (applicabilityHazardFamily && !isGenericClassifierCategory(applicabilityHazardFamily)) {
          return applicabilityHazardFamily;
        }
        if (classifierHazardCategory && !isGenericClassifierCategory(classifierHazardCategory)) {
          return classifierHazardCategory;
        }
        if (intelligence?.scenarioIntelligence?.hazardCategory && !isGenericClassifierCategory(intelligence.scenarioIntelligence.hazardCategory)) {
          return intelligence.scenarioIntelligence.hazardCategory;
        }
        if (knowledgeRoute?.hazardFamily && !isGenericClassifierCategory(knowledgeRoute.hazardFamily)) {
          return knowledgeRoute.hazardFamily;
        }
        if (Array.isArray(advisoryReasoning?.inspectionIntelligence?.hazardCandidates)) {
          const primaryCandidate = advisoryReasoning.inspectionIntelligence.hazardCandidates.find((candidate: any) =>
            candidate?.role === 'primary' && candidate?.domain && candidate.domain !== 'unknown',
          );
          if (primaryCandidate?.domain && !isGenericClassifierCategory(primaryCandidate.domain)) {
            return primaryCandidate.domain;
          }
        }
        const applicabilitySuggestedStandard = advisoryReasoning?.inspectionIntelligence?.standardApplicability?.suggestedStandards?.[0];
        if (typeof applicabilitySuggestedStandard === 'string' && /1910\.305|1910\.334|56\.12013|56\.12032/i.test(applicabilitySuggestedStandard)) {
          return 'electrical';
        }
        return isGenericClassifierCategory(classifierHazardCategory) ? 'unknown' : classifierHazardCategory || 'unknown';
      })();

      // Determine root-level candidateStandardFamily
      const rootStandardFamily = (() => {
        if (intelligence?.scenarioIntelligence?.candidateStandardFamily && intelligence.scenarioIntelligence.candidateStandardFamily !== 'unknown') {
          return intelligence.scenarioIntelligence.candidateStandardFamily;
        }
        if (rootHazardCategory === 'compressed_gas') return 'compressed_gas_cylinders';
        if (rootHazardCategory === 'electrical') return 'electrical';
        if (rootHazardCategory === 'machine_guarding') return 'machine_guarding';
        if (rootHazardCategory === 'machine_guarding_loto') return 'machine_guarding_loto';
        if (rootHazardCategory === 'fall_protection') return 'fall_protection';
        if (rootHazardCategory === 'slip_trip_fall') return 'walking_working_surfaces';
        if (rootHazardCategory === 'walking_working_surfaces') return 'walking_working_surfaces';
        if (rootHazardCategory === 'housekeeping') return 'walking_working_surfaces';
        if (rootHazardCategory === 'mobile_equipment') return 'mobile_equipment';
        if (rootHazardCategory === 'confined_space') return 'confined_space';
        if (rootHazardCategory === 'hazardous_materials' || rootHazardCategory === 'hazard_communication') return 'hazcom';
        return 'unknown';
      })();

      const effectiveClassification = (() => {
        const rawClassification = String(promotedPrimary.classification || '').trim();
        if (rawClassification && !/^(unclassified|unknown|other|general|misc|miscellaneous)$/i.test(rawClassification)) {
          return rawClassification;
        }

        const normalizedCategory = String(rootHazardCategory || '').toLowerCase();
        if (normalizedCategory === 'electrical') return 'Electrical';
        if (normalizedCategory === 'machine_guarding') return 'Machine Guarding';
        if (normalizedCategory === 'machine_guarding_loto') return 'Lockout / Stored Energy';
        if (normalizedCategory === 'fall_protection') return 'Fall Protection';
        if (normalizedCategory === 'slip_trip_fall' || normalizedCategory === 'walking_working_surfaces' || normalizedCategory === 'housekeeping') return 'Walking/Working Surfaces';
        if (normalizedCategory === 'mobile_equipment') return 'Mobile Equipment / Traffic';
        if (normalizedCategory === 'confined_space') return 'Confined Space';
        if (normalizedCategory === 'compressed_gas') return 'Compressed Gas Cylinders';
        if (normalizedCategory === 'hazardous_materials' || normalizedCategory === 'hazard_communication') return 'Hazard Communication';
        return rawClassification || 'Unclassified';
      })();

      promotedPrimary.classification = effectiveClassification;
      if (!promotedPrimary.family || /^(unknown|unclassified|other|general|misc|miscellaneous)$/i.test(String(promotedPrimary.family).toLowerCase())) {
        promotedPrimary.family = rootHazardCategory;
      }

      const supplementalEntries = getSupplementalKnowledgeForContext({
        hazardCategory: rootHazardCategory,
        candidateStandardFamily: rootStandardFamily,
        classification: effectiveClassification,
        knowledgeRoute,
        observation: fusedText,
        suggestedStandards,
        supportingStandards,
      });
      const supplementalGuidance = buildSupplementalGuidance(supplementalEntries);
      const resolvedPrimaryCitation = (() => {
        const intelligencePrimaryCitation = String((intelligence as any)?.primaryCitation || '').trim();
        if (intelligencePrimaryCitation && !/^(review|needs more evidence|candidate standard|suggested candidate standard|fallback candidate standard|unclassified|unknown)$/i.test(intelligencePrimaryCitation)) {
          return intelligencePrimaryCitation;
        }
        const candidateCitation = String(
          suggestedStandards?.[0]?.citation ||
            primaryStandards?.[0]?.citation ||
            standardsTraceability.suggestedCitations?.[0] ||
            '',
        ).trim();
        return candidateCitation;
      })();

      const response = {
          ...promotedPrimary,
          ...intelligence,
          applicabilityIntelligence: sanitizedApplicabilityIntelligence,
          classification: effectiveClassification,
          primaryCitation: resolvedPrimaryCitation,
          reviewStateLabel: likelyGuardingReview
            ? 'Review needed — likely guarding issue'
            : isVague
              ? 'Review needed — more evidence required'
              : requiresHumanReview
                ? 'Review'
                : undefined,
          isVague,
          evidenceGapQuestions:
            likelyGuardingReview &&
            !(advisoryReasoning.inspectionIntelligence?.evidenceGapQuestions || []).length
              ? guardingReviewQuestions
              : isVague
                ? (advisoryReasoning.inspectionIntelligence?.evidenceGapQuestions || [])
                : (intelligence.evidenceGapQuestions || []),
          hazardCategory: rootHazardCategory,
          candidateStandardFamily: rootStandardFamily,
          suggestedStandards,
          primaryStandards,
          standards: primaryStandards,
          supportingStandards,
          inspectionIntelligence: advisoryReasoning.inspectionIntelligence,
          standardApplicability: advisoryReasoning.inspectionIntelligence?.standardApplicability,
          evidenceGate: advisoryReasoning.inspectionIntelligence?.evidenceGate,
          citationRecovery: citationRecovery.decision,
          standardsMatchExplanations,
          excludedStandards,
          needsMoreEvidenceStandards,
          ...(debugMetadata ? { debugMetadata: diagnostics } : {}),
          standardsTraceability,
          supplementalGuidance,
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
              correctiveActionPatterns: isVague ? [] : knowledgeShardSummary.correctiveActionPatterns,
            },
            advisoryOnly: true,
            requiresQualifiedReview: true,
          },
          generatedActions: sanitizedEnhancedGeneratedActions,
          baseGeneratedActions: sanitizedGeneratedActions,
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
          additionalInformationNeeded: buildAdditionalInformationNeeded(),
          informationNeeded: buildAdditionalInformationNeeded(),
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

      if (resolvedPrimaryCitation) {
        response.promotion = {
          ...(response.promotion || {}),
          approvedRecordCandidate: {
            ...(response.promotion?.approvedRecordCandidate || {}),
            citation: resolvedPrimaryCitation,
            reference: resolvedPrimaryCitation,
            authority: {
              ...(response.promotion?.approvedRecordCandidate?.authority || {}),
              citation: resolvedPrimaryCitation,
            },
          },
        };
      }

      const standardDecisions = this.buildStandardDecisions({
        response,
        normalizedScopes,
      });
      response.standardDecisions = standardDecisions;
      const mechanismChain = this.buildMechanismChain({
        response,
        normalizedScopes,
      });
      response.mechanismChain = mechanismChain;
      response.decisionSupportMetadata = {
        ...(response.decisionSupportMetadata || {}),
        standardDecisions,
        standardDecisionCount: standardDecisions.length,
        mechanismChain,
      };

      if (likelyGuardingReview && !(response.evidenceGapQuestions || []).length) {
        response.evidenceGapQuestions = guardingReviewQuestions;
        response.inspectionIntelligence = {
          ...(response.inspectionIntelligence || {}),
          evidenceGapQuestions: guardingReviewQuestions,
        };
      }

      if (isVague && !(response.evidenceGapQuestions || []).length) {
        const vagueEvidenceQuestions = [
          'What exact equipment, opening, edge, container, or travel path is involved?',
          'Is the condition open, damaged, leaking, energized, obstructed, or otherwise uncontrolled?',
          'Are workers exposed directly, or is the issue only a general concern without a specific hazard path?',
        ];
        response.evidenceGapQuestions = vagueEvidenceQuestions;
        response.inspectionIntelligence = {
          ...(response.inspectionIntelligence || {}),
          evidenceGapQuestions: vagueEvidenceQuestions,
        };
      }

      if (
        !(response.evidenceGapQuestions || []).length &&
        !((response.suggestedStandards || []).length || (response.primaryStandards || []).length)
      ) {
        const fallbackEvidenceQuestions = [
          'What exact equipment, opening, edge, container, or travel path is involved?',
          'Is the condition open, damaged, leaking, energized, obstructed, or otherwise uncontrolled?',
          'Are workers exposed directly, or is the issue only a general concern without a specific hazard path?',
        ];
        response.evidenceGapQuestions = fallbackEvidenceQuestions;
        response.inspectionIntelligence = {
          ...(response.inspectionIntelligence || {}),
          evidenceGapQuestions: fallbackEvidenceQuestions,
        };
      }

      if (isVague) {
        const isElectrical = String(rootHazardCategory || '').toLowerCase().includes('electrical') ||
                             String(promotedPrimary.classification || '').toLowerCase().includes('electrical');
        const inspectorText = isElectrical
          ? 'Have a qualified safety professional or qualified electrical person inspect the condition.'
          : 'Have a qualified safety professional or competent person inspect the condition.';

        if (response.correctiveActionReasoning) {
          response.correctiveActionReasoning = {
            ...response.correctiveActionReasoning,
            immediateActions: [
              'Keep personnel from touching or operating the affected area/equipment until evaluated.',
              'Restrict access if damage or hazard exposure is suspected.',
              'Mark/flag the concern and collect photos/details.'
            ],
            interimControls: [
              'Maintain access control pending qualified review.'
            ],
            permanentCorrections: [
              'Repair or replace components identified by qualified review.'
            ],
            verificationSteps: [
              inspectorText
            ],
            administrativeFollowUps: [],
            urgencyLevel: 'moderate',
            immediateActionNarrative: 'Keep personnel from touching or operating the affected area/equipment until evaluated.',
            interimControlNarrative: 'Maintain access control pending qualified review.',
            permanentCorrectionNarrative: 'Repair or replace components identified by qualified review.',
            verificationNarrative: inspectorText,
            administrativeFollowUpNarrative: 'Collect photos or details and request qualified safety review.',
          };
        }

        if (response.dca) {
          response.dca = {
            ...response.dca,
            immediateActions: [],
            interimControls: [],
            permanentCorrectiveActions: [],
            verificationActions: [],
            actionRationale: 'Observation is too vague to recommend specific corrective actions.',
            blockedActions: ['Final corrective actions are blocked until critical facts are confirmed.'],
          };
        }

        if (response.inspectionIntelligence?.correctiveActions) {
          response.inspectionIntelligence.correctiveActions = {
            immediate: [
              'Keep personnel from touching or operating the affected area/equipment until evaluated.',
              'Restrict access if damage or hazard exposure is suspected.',
              'Mark/flag the concern and collect photos/details.'
            ],
            interim: [
              'Maintain access control pending qualified review.'
            ],
            permanentEngineering: [
              'Repair or replace components identified by qualified review.'
            ],
            administrativeProgramTraining: [],
            verificationFollowUp: [
              inspectorText
            ]
          };
        }

        // Run the recursive sanitizer on the response object to clean any nested properties
        return this.sanitizeResponseForVagueInput(response, isElectrical, inspectorText, rootHazardCategory);
      }

      return response;
   }


  private buildEnhancedGeneratedActions(
    baseActions: any[],
    intelligence: any,
    reportId: string,
    knowledgeShardSummary?: any,
    observationText?: string,
    isVague?: boolean,
  ) {
    const safeArray = (value: any) => Array.isArray(value) ? value : [];
    const base = safeArray(baseActions);
    const primary = base[0] || {};
    const normalizedObservation = String(observationText || "").toLowerCase();

    const hasTrafficOrMobileEquipmentContext = /\b(forklift|loader|haul truck|vehicle|vehicles|mobile equipment|powered haulage|traffic|pedestrian|pedestrians|blind spot|blind spots|backing|backup alarm|backup alarms|berm|berms|travel path|travel paths|haul road|haul roads|spotter|spotters|flagger|flaggers)\b/i.test(normalizedObservation);

    const isTrafficControlPattern = (value: string) =>
      /\b(pedestrian|pedestrians|equipment travel path|equipment travel paths|mobile equipment|spotter|spotters|traffic control|traffic controls|backup alarm|backup alarms|blind spot|blind spots|haul road|haul roads|berm|berms|vehicle lane|vehicle lanes|operator communication|positive communication)\b/i.test(value);

    const isRelevantShardCorrectiveActionPattern = (value: string) => {
      if (isTrafficControlPattern(value) && !hasTrafficOrMobileEquipmentContext) {
        return false;
      }

      return true;
    };

    const dca = intelligence?.dca || {};
    const correctiveActionReasoning = intelligence?.correctiveActionReasoning || {};
    const riskReasoning = intelligence?.riskReasoning || {};
    const scenarioIntelligence = intelligence?.scenarioIntelligence || {};
    const evidenceGapQuestions = safeArray(intelligence?.evidenceGapQuestions);
    const shardCorrectiveActionPatterns = isVague
      ? []
      : safeArray(
          knowledgeShardSummary?.correctiveActionPatterns,
        )
          .map((item: any) => String(item || "").trim())
          .filter(Boolean)
          .filter(isRelevantShardCorrectiveActionPattern);

    const dcaFixes = isVague
      ? []
      : [
          ...safeArray(dca.immediateActions).map((item: any) => item?.action || item?.title || String(item)),
          ...safeArray(dca.interimControls).map((item: any) => item?.action || item?.title || String(item)),
          ...safeArray(dca.permanentCorrectiveActions).map((item: any) => item?.action || item?.title || String(item)),
          ...safeArray(dca.verificationActions).map((item: any) => item?.action || item?.title || String(item)),
        ].filter(Boolean);

    const brainFixes = isVague
      ? []
      : [
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

    const relevanceFilter = (item: string) =>
      isRelevantShardCorrectiveActionPattern(item);

    const suggestedFixes = Array.from(new Set([
      ...shardCorrectiveActionPatterns,
      ...dcaFixes,
      ...brainFixes,
      ...(fallbackFixesAllowed ? safeArray(primary.suggestedFixes) : []),
    ]
      .map((item) => String(item).trim())
      .filter(Boolean)
      .filter(relevanceFilter)
      .filter((item) =>
        shardCorrectiveActionPatterns.length > 0
          ? !staleBaseFixPattern.test(item)
          : true,
      ))).slice(0, 12);

    const fallbackDescription =
      fallbackFixesAllowed && primary.description && relevanceFilter(String(primary.description))
        ? primary.description
        : "";

    const descriptionParts = [
      shardCorrectiveActionPatterns.length
        ? `Focused HazLenz shard controls: ${shardCorrectiveActionPatterns.slice(0, 4).join("; ")}`
        : "",
      fallbackDescription,
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

    const sanitizeActionText = (value: any) => {
      const raw = String(value || "").trim();
      if (!raw) return raw;
      if (relevanceFilter(raw)) return raw;
      return "";
    };

    const title = isVague
      ? "Review and control HazLenz AI-identified hazard"
      : (sanitizeActionText(dca.immediateActions?.[0]?.title) ||
         sanitizeActionText(dca.immediateActions?.[0]?.action) ||
         sanitizeActionText(correctiveActionReasoning.immediateActions?.[0]) ||
         sanitizeActionText(primary.title) ||
         "Review and control HazLenz AI-identified hazard");

    const priority =
      primary.priority ||
      (correctiveActionReasoning.urgencyLevel === "critical" ? "CRITICAL" :
       correctiveActionReasoning.urgencyLevel === "high" ? "HIGH" :
       correctiveActionReasoning.urgencyLevel === "moderate" ? "MEDIUM" :
       "LOW");

    const description = isVague
      ? `Observed vague safety concern requires qualified safety review. Recommended interim controls: ${suggestedFixes.map(sanitizeActionText).filter(Boolean).slice(0, 3).join("; ")}`
      : descriptionParts.map(sanitizeActionText).filter(Boolean).join(" ");

    const enhancedPrimary = {
      ...primary,
      title: String(title),
      description,
      priority,
      source: primary.source || "AI_ENGINE",
      reportId: primary.reportId || reportId,
      suggestedFixes: suggestedFixes.map(sanitizeActionText).filter(Boolean),
      referenceStandards: isVague ? [] : primary.referenceStandards || [],
      originalSuggestion: isVague
        ? {
            source: "safescope_v2_enriched_corrective_action",
            contextualControls: primary.originalSuggestion?.contextualControls || null,
            enrichmentApplied: true,
            isVague: true,
          }
        : {
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
            relevanceFilterApplied: true,
          },
    };

    if (!hasTrafficOrMobileEquipmentContext && !isVague) {
      delete (enhancedPrimary.originalSuggestion as any).baseActionEngineSuggestion;
    }

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
    if (scopes.includes("osha_general") || scopes.includes("osha_general_industry")) return "OSHA_GENERAL_INDUSTRY";
    if (scopes.includes("osha_construction")) return "OSHA_CONSTRUCTION";
    return undefined;
  }

  applyStandardsScopeFit(standards: any[], scopes: string[]) {
    return standards.map(standard => {
      const citation = standard.citation || '';
      let scopeFit = standard.scopeFit || 'neutral';
      let scopeExclusionReason = standard.scopeExclusionReason;
      let scopeFitAdjustment = scopeFit === 'mismatch' ? -500 : 0;
      const reasons = [...(standard.matchingReasons || [])];

      if (scopeFit !== 'mismatch') {
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
      }

      return {
        ...standard,
        score: (standard.score || 0) + scopeFitAdjustment,
        scopeFit,
        scopeExclusionReason,
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

  private buildStandardDecisions(input: { response: any; normalizedScopes: string[] }) {
    const response = input?.response || {};
    const normalizedScopes = Array.isArray(input?.normalizedScopes) ? input.normalizedScopes : [];
    type StandardDecisionAuthority = "primary" | "supporting" | "advisory" | "needs_more_evidence";

    const genericLabelPattern = /^(review|pending|candidate(?: standard)?|suggested candidate standard|fallback candidate standard|standard family|applicable standard|no specific standard selected yet|needs more evidence|review candidate standard|unknown|none|n\/a|na)$/i;
    const citationPattern = /\b(?:\d+\s*CFR\s*\d+(?:\.\d+)?(?:\([a-z0-9]+\))*|\d+\.\d+(?:\([a-z0-9]+\))*)\b/i;
    const authorityRank: Record<StandardDecisionAuthority, number> = {
      primary: 3,
      supporting: 2,
      needs_more_evidence: 1,
      advisory: 0,
    };

    const clean = (value: unknown) => String(value ?? "").replace(/\s+/g, " ").trim();
    const escapeRegExp = (value: string) => String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const isPlaceholder = (value: string) => genericLabelPattern.test(clean(value));
    const isCitationLike = (value: string) => citationPattern.test(clean(value));
    const normalizeConfidence = (candidate: any): number | undefined => {
      const raw = candidate?.confidence ?? candidate?.confidenceScore ?? candidate?.score;
      const numeric = Number(raw);
      if (!Number.isFinite(numeric)) return undefined;
      if (numeric <= 1) return Math.max(0, Math.min(1, numeric));
      if (numeric <= 100) return Math.max(0, Math.min(1, numeric / 100));
      return Math.max(0, Math.min(1, numeric / 1000));
    };
    const collectText = (value: any, keys: string[]): string[] => {
      const seen = new Set<string>();
      const values: string[] = [];
      for (const key of keys) {
        const raw = value?.[key];
        const items = Array.isArray(raw) ? raw : raw !== undefined && raw !== null ? [raw] : [];
        for (const item of items) {
          const text = clean(typeof item === "string" ? item : item?.question || item?.prompt || item?.reason || item?.text || item?.title || item?.summary || item);
          if (!text || seen.has(text.toLowerCase())) continue;
          seen.add(text.toLowerCase());
          values.push(text);
        }
      }
      return values;
    };
    const extractCitation = (value: any): string => {
      const candidates = [
        value?.citation,
        value?.standard,
        value?.standardNumber,
        value?.code,
        value?.reference,
        value?.authority?.citation,
        value?.referenceStandards?.[0]?.citation,
        value?.primaryCitation,
        typeof value === "string" ? value : "",
      ];

      for (const candidate of candidates) {
        const text = clean(candidate);
        if (!text || isPlaceholder(text) || !isCitationLike(text)) continue;
        return text;
      }
      return "";
    };
    const extractTitle = (value: any, citation: string): string => {
      const raw = clean(
        value?.title ||
        value?.heading ||
        value?.name ||
        value?.sectionTitle ||
        value?.titleSummary ||
        value?.summary ||
        value?.description ||
        value?.citationTitle ||
        ""
      );
      if (!raw || isPlaceholder(raw)) return citation || "";
      const cleaned = raw.replace(new RegExp(`^${escapeRegExp(citation)}\\s*[—:-]*\\s*`, "i"), "").trim();
      return cleaned && !isPlaceholder(cleaned) ? cleaned : (citation || "");
    };
    const authorityFor = (value: any, source: string): StandardDecisionAuthority => {
      const label = String(source || "").toLowerCase();
      const status = String(value?.candidateStatus || value?.status || "").toLowerCase();
      if (label.includes("excluded") || status.includes("excluded") || status.includes("reject")) return "advisory";
      if (label.includes("needsmoreevidence") || label.includes("needs_more_evidence") || status.includes("needs_more_evidence") || status.includes("needs more evidence")) return "needs_more_evidence";
      if (label.includes("supporting") || status.includes("supporting_context")) return "supporting";
      if (label.includes("generatedactions.referencestandards") || label.includes("basegeneratedactions.referencestandards")) return "supporting";
      return "primary";
    };
    const isDirectMatch = (authority: StandardDecisionAuthority, value: any, source: string) => {
      if (authority !== "primary") return false;
      const label = String(source || "").toLowerCase();
      return (
        label.includes("primarystandards") ||
        label.includes("suggestedstandards") ||
        label.includes("standardapplicability.suggestedstandards") ||
        label.includes("standardapplicability.matchedrules") ||
        label.includes("inspectionintelligence.candidatestandards") ||
        label.includes("standardsreasoning.topdefensible") ||
        label.includes("standardstraceability.suggestedcitations") ||
        Boolean(value?.citationRanking?.directCandidate) ||
        String(value?.candidateStatus || "").toLowerCase() === "candidate_standard"
      );
    };
    const buildDecision = (value: any, source: string): any | null => {
      const citation = extractCitation(value);
      if (!citation) return null;

      const authority = authorityFor(value, source);
      const title = extractTitle(value, citation);
      const matchReasons = collectText(value, [
        "matchingReasons",
        "matchReasons",
        "rationale",
        "reason",
        "reasons",
        "supportReason",
        "supportReasonText",
      ]);
      const evidenceGaps = collectText(value, [
        "evidenceNeeded",
        "evidenceGaps",
        "missingEvidence",
        "evidenceGapQuestions",
        "questions",
      ]);
      const agency = clean(value?.agencyCode || value?.agency || (String(citation).startsWith("30 CFR") ? "MSHA" : "OSHA")) || undefined;
      const scope = clean(value?.scope || value?.jurisdiction || value?.standardScope || normalizedScopes[0] || "");
      return {
        citation,
        title,
        authority,
        agency: agency || undefined,
        scope: scope || undefined,
        confidence: normalizeConfidence(value),
        matchReasons: matchReasons.length ? matchReasons : undefined,
        evidenceGaps: evidenceGaps.length ? evidenceGaps : undefined,
        isCandidate: authority !== "advisory",
        isDirectMatch: isDirectMatch(authority, value, source),
        source,
      };
    };
    const ingest = (
      bucket: any,
      source: string,
      decisions: Map<string, any>,
    ) => {
      const items = Array.isArray(bucket) ? bucket : bucket ? [bucket] : [];
      for (const item of items) {
        const decision = buildDecision(item, source);
        if (!decision) continue;

        const key = decision.citation.toLowerCase().replace(/\s+/g, "");
        const existing = decisions.get(key);
        if (!existing) {
          decisions.set(key, decision);
          continue;
        }

        const existingRank = authorityRank[existing.authority as StandardDecisionAuthority] ?? -1;
        const incomingRank = authorityRank[decision.authority as StandardDecisionAuthority] ?? -1;
        const merged = {
          ...existing,
          ...decision,
          authority: incomingRank > existingRank ? decision.authority : existing.authority,
          title: (existing.title && !isPlaceholder(existing.title) && existing.title !== existing.citation)
            ? existing.title
            : decision.title || existing.citation,
          confidence: Math.max(
            Number.isFinite(Number(existing.confidence)) ? Number(existing.confidence) : 0,
            Number.isFinite(Number(decision.confidence)) ? Number(decision.confidence) : 0,
          ) || undefined,
          matchReasons: Array.from(new Set([...(existing.matchReasons || []), ...(decision.matchReasons || [])])).filter(Boolean),
          evidenceGaps: Array.from(new Set([...(existing.evidenceGaps || []), ...(decision.evidenceGaps || [])])).filter(Boolean),
          source: Array.from(new Set([...(String(existing.source || "").split(" | ").filter(Boolean)), ...(String(decision.source || "").split(" | ").filter(Boolean))])).join(" | "),
          isCandidate: (incomingRank > existingRank ? decision.isCandidate : existing.isCandidate) !== false,
          isDirectMatch: incomingRank > existingRank ? decision.isDirectMatch : existing.isDirectMatch,
        };
        decisions.set(key, merged);
      }
    };

    const decisions = new Map<string, any>();

    ingest(response?.primaryStandards, "primaryStandards", decisions);
    ingest(response?.suggestedStandards, "suggestedStandards", decisions);
    ingest(response?.standards, "standards", decisions);
    ingest(response?.standardApplicability?.suggestedStandards, "standardApplicability.suggestedStandards", decisions);
    ingest(response?.standardApplicability?.matchedRules, "standardApplicability.matchedRules", decisions);
    ingest(response?.inspectionIntelligence?.candidateStandards, "inspectionIntelligence.candidateStandards", decisions);
    ingest(response?.applicabilityIntelligence?.primaryApplicableStandards, "applicabilityIntelligence.primaryApplicableStandards", decisions);
    ingest(response?.standardsReasoning?.topDefensible, "standardsReasoning.topDefensible", decisions);
    ingest(response?.supportingStandards, "supportingStandards", decisions);
    ingest(response?.standardsTraceability?.supportingCitations, "standardsTraceability.supportingCitations", decisions);
    ingest(response?.applicabilityIntelligence?.supportingStandards, "applicabilityIntelligence.supportingStandards", decisions);
    ingest(response?.promotion?.approvedRecordCandidate, "promotion.approvedRecordCandidate", decisions);
    ingest(
      (response?.generatedActions || []).flatMap((action: any) => action?.referenceStandards || []),
      "generatedActions.referenceStandards",
      decisions,
    );
    ingest(
      (response?.baseGeneratedActions || []).flatMap((action: any) => action?.referenceStandards || []),
      "baseGeneratedActions.referenceStandards",
      decisions,
    );
    ingest(response?.needsMoreEvidenceStandards, "needsMoreEvidenceStandards", decisions);
    ingest(response?.standardApplicability?.needsMoreEvidenceStandards, "standardApplicability.needsMoreEvidenceStandards", decisions);
    ingest(response?.standardsTraceability?.needsMoreEvidenceCitations, "standardsTraceability.needsMoreEvidenceCitations", decisions);
    ingest(response?.applicabilityIntelligence?.needsMoreEvidenceStandards, "applicabilityIntelligence.needsMoreEvidenceStandards", decisions);
    ingest(response?.excludedStandards, "excludedStandards", decisions);
    ingest(response?.standardsTraceability?.excludedCitations, "standardsTraceability.excludedCitations", decisions);
    ingest(response?.applicabilityIntelligence?.excludedStandards, "applicabilityIntelligence.excludedStandards", decisions);

    const sorted = Array.from(decisions.values()).sort((left, right) => {
      const leftRank = authorityRank[left.authority as StandardDecisionAuthority] ?? -1;
      const rightRank = authorityRank[right.authority as StandardDecisionAuthority] ?? -1;
      if (leftRank !== rightRank) return rightRank - leftRank;
      return String(left.citation).localeCompare(String(right.citation));
    });

    const normalizedCitation = (citation: string) => clean(citation).toLowerCase().replace(/\s+/g, "");
    const isPrefixOfMoreSpecificCitation = (citation: string) => {
      const base = normalizedCitation(citation);
      if (!base) return false;
      return sorted.some((other: any) => {
        const otherCitation = normalizedCitation(other?.citation || "");
        return otherCitation !== base && otherCitation.startsWith(base) && otherCitation.length > base.length;
      });
    };
    const shouldDemoteBroadReference = (decision: any) => {
      const citation = String(decision?.citation || "");
      const title = String(decision?.title || "");
      return (
        /^29 CFR 1910\.301$/i.test(citation) ||
        /^29 CFR 1910\.331$/i.test(citation) ||
        /^29 CFR 1910\.305\(g\)$/i.test(citation) ||
        /^29 CFR 1910\.1200\(f\)$/i.test(citation) ||
        /\b(introduction|scope|candidate requirements related|candidate requirement identified by the existing deterministic citation resolver|specific purpose equipment|general requirements)\b/i.test(title) ||
        isPrefixOfMoreSpecificCitation(citation)
      );
    };

    const ordered = sorted.map((decision: any) => {
      if (decision?.authority === "primary" && shouldDemoteBroadReference(decision)) {
        return {
          ...decision,
          authority: "supporting",
          isDirectMatch: false,
        };
      }
      return decision;
    }).sort((left, right) => {
      const leftRank = authorityRank[left.authority as StandardDecisionAuthority] ?? -1;
      const rightRank = authorityRank[right.authority as StandardDecisionAuthority] ?? -1;
      if (leftRank !== rightRank) return rightRank - leftRank;
      return String(left.citation).localeCompare(String(right.citation));
    });

    if (process.env.HAZLENZ_DEBUG_STANDARD_DECISIONS === "true") {
      console.log("[HazLenz standard decisions]", {
        hazardCategory: response?.hazardCategory,
        candidateStandardFamily: response?.candidateStandardFamily,
        standardDecisions: ordered,
      });
    }

    return ordered;
  }

  private buildMechanismChain(input: { response: any; normalizedScopes: string[] }) {
    const response = input?.response || {};
    const inspectionIntelligence = response?.inspectionIntelligence || {};
    const mechanismChainSource = inspectionIntelligence?.mechanismChain || {};
    const mechanismOfInjury = inspectionIntelligence?.mechanismOfInjury || {};
    const vagueInputAnalysis = inspectionIntelligence?.vagueInputAnalysis || {};
    const correctiveActions = response?.correctiveActions || {};

    const clean = (value: unknown) => String(value ?? "").replace(/\s+/g, " ").trim();
    const uniqueText = (...sources: any[]): string[] => {
      const seen = new Set<string>();
      const values: string[] = [];
      for (const source of sources) {
        const items = Array.isArray(source) ? source : source !== undefined && source !== null ? [source] : [];
        for (const item of items) {
          const text = clean(
            typeof item === "string"
              ? item
              : item?.observedCondition ||
                item?.failureMode ||
                item?.releaseOrFailureMode ||
                item?.exposurePathway ||
                item?.potentialConsequence ||
                item?.consequences ||
                item?.controlFocus ||
                item?.controls ||
                item?.evidenceGap ||
                item?.evidenceGaps ||
                item?.text ||
                item?.title ||
                item?.summary ||
                item?.reason ||
                item,
          );
          if (!text) continue;
          const key = text.toLowerCase();
          if (seen.has(key)) continue;
          seen.add(key);
          values.push(text);
        }
      }
      return values;
    };
    const summarize = (values: string[], fallback: string) => uniqueText(values)[0] || fallback;
    const evidenceGaps = uniqueText(
      mechanismChainSource?.evidenceGaps,
      mechanismOfInjury?.evidenceGaps,
      response?.evidenceGapQuestions,
      inspectionIntelligence?.standardApplicability?.followUpQuestions,
    ).slice(0, 8);
    const controlFocus = uniqueText(
      mechanismChainSource?.controls,
      mechanismOfInjury?.controlThemes,
      correctiveActions?.immediate,
      correctiveActions?.interim,
      correctiveActions?.permanentEngineering,
      correctiveActions?.administrativeProgramTraining,
    ).slice(0, 8);
    const confidence = Number(response?.confidence);
    const normalizedConfidence = Number.isFinite(confidence) ? Math.max(0, Math.min(1, confidence)) : undefined;

    const observedCondition = summarize(
      uniqueText(
        mechanismChainSource?.initiatingCondition,
        mechanismOfInjury?.initiatingCondition,
        vagueInputAnalysis?.observedFacts,
      ),
      response?.classification
        ? `${clean(response.classification)} condition needs review.`
        : "Observed condition needs more detail.",
    );
    const failureMode = summarize(
      uniqueText(
        mechanismChainSource?.releaseOrFailureMode,
        mechanismOfInjury?.failureMode,
      ),
      response?.isVague
        ? "Release or failure mode is not yet specific enough to confirm."
        : "Failure mode is not fully established.",
    );
    const exposurePathway = summarize(
      uniqueText(
        mechanismChainSource?.exposurePathway,
        mechanismOfInjury?.exposurePathway,
      ),
      response?.isVague
        ? "Worker exposure pathway is not yet specific enough to confirm."
        : "Exposure pathway is not fully established.",
    );
    const potentialConsequence = summarize(
      uniqueText(
        mechanismChainSource?.consequences,
        mechanismOfInjury?.potentialConsequences,
      ),
      response?.isVague
        ? "Possible injury, illness, or environmental consequence depends on confirmed details."
        : "Potential consequence is not fully established.",
    );

    const mechanismChain = {
      observedCondition,
      failureMode,
      exposurePathway,
      potentialConsequence,
      evidenceGaps,
      controlFocus,
      ...(normalizedConfidence !== undefined ? { confidence: normalizedConfidence } : {}),
    };

    if (process.env.HAZLENZ_DEBUG_MECHANISM_CHAIN === "true") {
      console.log("[HazLenz mechanism chain]", {
        hazardCategory: response?.hazardCategory,
        candidateStandardFamily: response?.candidateStandardFamily,
        mechanismChain,
      });
    }

    return mechanismChain;
  }

  private sanitizeResponseForVagueInput(obj: any, isElectrical: boolean, inspectorText: string, rootHazardCategory: string): any {
    if (obj === null || obj === undefined) return obj;

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeResponseForVagueInput(item, isElectrical, inspectorText, rootHazardCategory));
    }

    if (typeof obj === 'object') {
      const newObj: any = {};
      for (const key of Object.keys(obj)) {
        // Skip inferredPossibilities as it is allowed to contain possible conditions
        if (key === 'inferredPossibilities') {
          newObj[key] = obj[key];
          continue;
        }

        // 1. Sanitize correctiveActionPatterns
        if (key === 'correctiveActionPatterns' || key === 'shardCorrectiveActionPatterns') {
          newObj[key] = [];
          continue;
        }

        // 2. Sanitize correctiveActionReasoning if it's an object
        if (key === 'correctiveActionReasoning' && typeof obj[key] === 'object' && obj[key] !== null) {
          newObj[key] = {
            ...obj[key],
            immediateActions: [
              'Keep personnel from touching or operating the affected area/equipment until evaluated.',
              'Restrict access if damage or hazard exposure is suspected.',
              'Mark/flag the concern and collect photos/details.'
            ],
            interimControls: [
              'Maintain access control pending qualified review.'
            ],
            permanentCorrections: [
              'Repair or replace components identified by qualified review.'
            ],
            verificationSteps: [
              inspectorText
            ],
            administrativeFollowUps: [],
            urgencyLevel: 'moderate',
            immediateActionNarrative: 'Keep personnel from touching or operating the affected area/equipment until evaluated.',
            interimControlNarrative: 'Maintain access control pending qualified review.',
            permanentCorrectionNarrative: 'Repair or replace components identified by qualified review.',
            verificationNarrative: inspectorText,
            administrativeFollowUpNarrative: 'Collect photos or details and request qualified safety review.',
          };
          continue;
        }

        // 3. Sanitize correctiveActionReasoning if it's a string
        if (key === 'correctiveActionReasoning' && typeof obj[key] === 'string') {
          newObj[key] = "Review and control HazLenz AI-identified hazard. Keep personnel from touching or operating the affected area/equipment until evaluated by a qualified review.";
          continue;
        }

        // 4. Sanitize correctiveActionStrategy if it's an object
        if (key === 'correctiveActionStrategy' && typeof obj[key] === 'object' && obj[key] !== null) {
          const vagueRankedActions = [
            {
              id: "action-vague-1",
              actionType: "immediate",
              priority: "high",
              controlFamily: "administrative",
              actionText: "Keep personnel from touching or operating the affected area/equipment until evaluated.",
              reason: "Observation is too vague to confirm specific conditions or repairs.",
              linkedHazardDomains: [rootHazardCategory || "general"],
              linkedScenarioIds: [],
              linkedCausalChains: [],
              evidenceDependency: "unconfirmed",
              confidence: 0.5,
              requiresHumanVerification: true,
            },
            {
              id: "action-vague-2",
              actionType: "interim",
              priority: "medium",
              controlFamily: "administrative",
              actionText: "Restrict access if damage or hazard exposure is suspected.",
              reason: "Observation is too vague to confirm specific conditions or repairs.",
              linkedHazardDomains: [rootHazardCategory || "general"],
              linkedScenarioIds: [],
              linkedCausalChains: [],
              evidenceDependency: "unconfirmed",
              confidence: 0.5,
              requiresHumanVerification: true,
            },
            {
              id: "action-vague-3",
              actionType: "verification",
              priority: "high",
              controlFamily: "verification",
              actionText: inspectorText,
              reason: "Qualified review and inspection required to determine specific defects.",
              linkedHazardDomains: [rootHazardCategory || "general"],
              linkedScenarioIds: [],
              linkedCausalChains: [],
              evidenceDependency: "unconfirmed",
              confidence: 0.5,
              requiresHumanVerification: true,
            }
          ];

          newObj[key] = {
            strategyVersion: 'v1-vague-sanitized',
            rankedActions: vagueRankedActions,
            immediateControls: vagueRankedActions.filter(a => a.actionType === 'immediate'),
            interimControls: vagueRankedActions.filter(a => a.actionType === 'interim'),
            permanentControls: [
              {
                id: "action-vague-4",
                actionType: "permanent",
                priority: "medium",
                controlFamily: "engineering",
                actionText: "Repair or replace components identified by qualified review.",
                reason: "Permanent corrections must follow qualified inspection and review.",
                linkedHazardDomains: [rootHazardCategory || "general"],
                linkedScenarioIds: [],
                linkedCausalChains: [],
                evidenceDependency: "unconfirmed",
                confidence: 0.5,
                requiresHumanVerification: true,
              }
            ],
            verificationSteps: vagueRankedActions.filter(a => a.actionType === 'verification'),
            weakActionsToAvoid: [],
            supervisorQuestions: [],
            rankingRationale: ["Observation is too vague to recommend specific corrective actions. Prioritizing access control and qualified reviewer inspection."],
            confidence: 0.5,
            actionPosture: 'verify_then_act',
            advisoryBoundary: 'Advisory-only vague hazard control strategy.'
          };
          continue;
        }

        // 5. Sanitize any string containing forbidden terms (case-insensitive checks)
        if (typeof obj[key] === 'string') {
          let val = obj[key];
          const forbiddenTerms = [
            'immediately stop all work',
            'lock out',
            'tag out',
            'de-energization',
            'exposed electrical equipment',
            'exposed energized parts',
            'approved covers',
            'dead-front',
            'open slot',
            'replace damaged wiring',
            'permanent engineered solutions specific to hazard'
          ];

          let containsForbidden = false;
          const valLower = val.toLowerCase();
          for (const term of forbiddenTerms) {
            if (valLower.includes(term)) {
              containsForbidden = true;
              break;
            }
          }

          if (containsForbidden) {
            if (key === 'description' || key === 'title' || key === 'actionText' || key === 'reason') {
               if (valLower.includes('lock out') || valLower.includes('tag out') || valLower.includes('de-energization')) {
                 val = "Verify de-energization or lockout before work is performed.";
               } else {
                 val = "Review and inspect condition with qualified personnel.";
               }
            } else {
               val = "Review and inspect condition with qualified personnel.";
            }
          }
          newObj[key] = val;
          continue;
        }

        newObj[key] = this.sanitizeResponseForVagueInput(obj[key], isElectrical, inspectorText, rootHazardCategory);
      }
      return newObj;
    }

    return obj;
  }
}
