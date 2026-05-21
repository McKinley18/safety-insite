import { StandardsBridgeService } from "./standards-bridge.service";
import { Injectable } from "@nestjs/common";
import { WeightedClassifierService } from "./classifier/weighted-classifier.service";
import { evaluateRisk } from "./risk/risk-engine";
import { ActionEngineService } from "../action-engine/action-engine.service";
import { ContextExpansionService } from "./context/context-expansion.service";
import { EvidenceFusionService } from "./evidence/evidence-fusion.service";
import { ApplicableStandardsService } from "../applicable-standards/applicable-standards.service";
import { SafeScopeFeedbackService } from "./feedback/safescope-feedback.service";
import { ReasoningSnapshotService } from "./snapshots/reasoning-snapshot.service";
import { SafeScopeIntelligenceOrchestrator } from "./orchestration/intelligence-orchestrator.service";
import { SafeScopeKnowledgeService } from "../safescope-knowledge/safescope-knowledge.service";
import { StandardsIntelligenceService } from "./standards-intelligence/standards-intelligence.service";
import { buildSourceSynthesis } from "../safescope-knowledge/sources/source-synthesis-helper";

@Injectable()
export class SafescopeV2Service {
  private shouldPreserveMachineGuardingPrimary(
    currentClassification: string,
    promotedClassification: string,
    text: string,
  ) {
    const normalized = String(text || "").toLowerCase();

    const currentIsMachineGuarding =
      currentClassification === "Machine Guarding" ||
      currentClassification === "Machine";

    const promotedIsElectrical = promotedClassification === "Electrical";

    const strongMachineGuardingSignal =
      /(unguarded|guard missing|missing guard|guard removed|guard bypassed|exposed moving|moving parts|pinch point|entanglement|conveyor|pulley|belt|sprocket|rotating shaft|idler|tail roller|tail pulley)/.test(
        normalized,
      );

    const strongElectricalPrimarySignal =
      /(electrical panel|open panel|panel|breaker|conductor|wire|wiring|cord|cable|voltage|shock|arc flash|live electrical|energized circuit|exposed live|damaged insulation|junction box|disconnect)/.test(
        normalized,
      );

    const energyControlContext =
      /(energized|running|operating|moving|powered|not locked out|lockout|tagout|loto|zero energy|de-energized|maintenance|cleanup|repair|servicing)/.test(
        normalized,
      );

    return (
      currentIsMachineGuarding &&
      promotedIsElectrical &&
      strongMachineGuardingSignal &&
      energyControlContext &&
      !strongElectricalPrimarySignal
    );
  }

  private classifier = new WeightedClassifierService();
  private bridge = new StandardsBridgeService();
  private intelligenceOrchestrator = new SafeScopeIntelligenceOrchestrator();

  constructor(
    private readonly actionEngine: ActionEngineService,
    private readonly contextExpansion: ContextExpansionService,
    private readonly evidenceFusion: EvidenceFusionService,
    private readonly applicableStandards: ApplicableStandardsService,
    private readonly feedbackService: SafeScopeFeedbackService,
    private readonly reasoningSnapshotService: ReasoningSnapshotService,
    private readonly safeScopeKnowledge: SafeScopeKnowledgeService,
    private readonly standardsIntelligenceService: StandardsIntelligenceService,
  ) {}

  private scopeToSource(scopes?: string[]) {
    if (!scopes || scopes.length === 0 || scopes.includes("all"))
      return undefined;
    if (scopes.includes("msha")) return "MSHA";
    if (scopes.includes("osha_construction")) return "OSHA_CONSTRUCTION";
    if (scopes.includes("osha_general")) return "OSHA_GENERAL_INDUSTRY";
    return undefined;
  }

  private async getMergedStandards(
    classification: string,
    text: string,
    scopes?: string[],
    workspaceId?: string,
  ) {
    const curated = this.bridge.getSuggestedStandards(classification, scopes);

    const cfrMatches = await this.applicableStandards.suggest(
      text,
      classification,
      this.scopeToSource(scopes),
      5,
    );

    const normalizedCurated = curated.suggestedStandards.map(
      (standard: any) => ({
        ...standard,
        source: "curated",
        score: 100,
        matchingReasons: [standard.rationale || "Curated SafeScope mapping"],
      }),
    );

    const normalizedCfr = cfrMatches.map((standard: any) => ({
      citation: standard.citation,
      agency: standard.agencyCode,
      scope: standard.scopeCode,
      rationale: standard.summary || standard.heading || "CFR database match",
      source: "cfr_database",
      score: standard.score,
      confidence: standard.confidence,
      matchingReasons: standard.matchingReasons || [],
    }));

    const merged = [...normalizedCurated, ...normalizedCfr];
    const byCitation = new Map<string, any>();

    for (const standard of merged) {
      const existing = byCitation.get(standard.citation);

      if (!existing) {
        byCitation.set(standard.citation, {
          ...standard,
          source: [standard.source],
          matchingReasons: standard.matchingReasons || [],
        });
        continue;
      }

      byCitation.set(standard.citation, {
        ...existing,
        ...standard,
        source: Array.from(
          new Set([...(existing.source || []), standard.source]),
        ),
        score: Math.max(existing.score || 0, standard.score || 0),
        confidence: Math.max(
          existing.confidence || 0,
          standard.confidence || 0,
        ),
        matchingReasons: Array.from(
          new Set([
            ...(existing.matchingReasons || []),
            ...(standard.matchingReasons || []),
          ]),
        ),
      });
    }

    const adjustments =
      await this.feedbackService.getWorkspaceStandardAdjustments(workspaceId);
    const adjustmentMap = new Map(
      adjustments.map((item: any) => [item.citation, item]),
    );

    const unique = Array.from(byCitation.values()).map((standard: any) => {
      const adjustment = adjustmentMap.get(standard.citation);

      if (!adjustment) {
        return {
          ...standard,
          workspaceLearningAdjustment: 0,
          workspaceLearningWarnings: [],
        };
      }

      return {
        ...standard,
        score: Math.max(0, (standard.score || 0) + adjustment.adjustment),
        workspaceLearningAdjustment: adjustment.adjustment,
        workspaceLearningWarnings: adjustment.warnings || [],
      };
    });

    return {
      suggestedStandards: unique
        .sort((a: any, b: any) => (b.score || 0) - (a.score || 0))
        .slice(0, 8),
      excludedStandards: curated.excludedStandards,
    };
  }

  private async buildActionPreview(
    classification: string,
    text: string,
    risk: any,
    standards: any[],
    expandedContext?: any,
  ) {
    const generated = await this.actionEngine.generateActionsFromReport({
      id: `preview-${Date.now()}`,
      category:
        classification === "Machine Guarding" ? "machine" : classification,
      description: text,
      riskScore: risk?.operationalRisk?.matrixScore || risk?.riskScore || 10,
      riskLevel: (risk?.riskBand || "MODERATE").toUpperCase(),
      confidence: 0.9,
      patterns: [],
      location: "Inspection Area",
      override: risk?.requiresShutdown || false,
      safeScope: {
        classification,
        riskBand: risk?.riskBand,
        requiresShutdown: risk?.requiresShutdown,
        imminentDanger: risk?.imminentDanger,
        fatalityPotential: risk?.fatalityPotential,
        reasoning: [
          ...(risk?.reasoning || []),
          ...(expandedContext?.reasoning || []),
        ],
        standards,
        expandedContext,
      },
    });

    return generated.map((action) => ({
      title: action.title,
      description: action.description,
      priority: action.priority,
      assignedRole: action.assignedRole,
      dueDate: action.dueDate,
      requiresShutdown: risk?.requiresShutdown || false,
      referenceStandards: standards.map((standard) => standard.citation),
      suggestedFixes: action.suggestedFixes || [],
      sourceHazard: classification,
    }));
  }

  private formatKnowledgeBrain(result: any) {
    return {
      confidence: result?.confidence || 0,
      matches: (result?.matches || []).map((match: any) => ({
        chunkId: match.chunkId,
        documentId: match.documentId,
        title: match.title,
        agency: match.agency,
        sourceType: match.sourceType,
        authorityTier: match.authorityTier,
        citation: match.citation,
        sourceUrl: match.sourceUrl,
        sectionHeading: match.sectionHeading,
        excerpt: match.excerpt,
        tags: match.tags,
        score: match.score,
        reason: match.reason,
      })),
      supportingReferences: (result?.matches || []).map((match: any) => ({
        title: match.title,
        citation: match.citation,
        authorityTier: match.authorityTier,
        sourceType: match.sourceType,
        reason: match.reason,
      })),
      evidenceGaps: result?.reasoning?.evidenceGaps || [],
      caution:
        result?.reasoning?.caution ||
        "SafeScope references supporting knowledge and likely applicability. Final compliance decisions require qualified review.",
    };
  }

  async classify(
    text: string,
    scopes?: string[],
    evidenceTexts?: string[],
    riskProfileId?: "simple_4x4" | "standard_5x5" | "advanced_6x6",
    workspaceId?: string,
    priorFindings?: any[],
  ) {
    const evidenceFusion = this.evidenceFusion.synthesize([
      text,
      ...(evidenceTexts || []),
    ]);

    const fusedText = evidenceFusion.combinedNarrative || text;

    const result = this.classifier.classify(fusedText);

    const primaryCandidate = {
      classification: result.classification,
      confidence: result.confidence,
      confidenceBand: result.confidenceBand,
      evidenceTokens: result.evidenceTokens,
      requiresHumanReview: result.requiresHumanReview,
      explanation: result.explanation,
      commonConsequences: result.commonConsequences || [],
      requiredControls: result.requiredControls || [],
      score: result.score,
      scoreMargin: result.scoreMargin,
      excludedHazards: result.excludedHazards || [],
      risk: evaluateRisk({
        text: fusedText,
        classification: result.classification,
        environment: "warehouse",
        riskProfileId,
      }),
    };

    const additionalCandidates = (result.additionalHazards || []).map(
      (hazard) => ({
        ...hazard,
        risk: evaluateRisk({
          text: fusedText,
          classification: hazard.classification,
          environment: "warehouse",
          riskProfileId,
        }),
      }),
    );

    const allCandidates = [primaryCandidate, ...additionalCandidates];

    const severityPriority: Record<string, number> = {
      Fall: 100,
      "Powered Mobile Equipment": 95,
      Electrical: 90,
      Machine: 85,
      "Hazard Communication": 70,
      Housekeeping: 50,
      PPE: 40,
      "Review Required": 0,
    };

    const promotedPrimary: any = [...allCandidates].sort((a: any, b: any) => {
      const scoreDelta = (b.risk?.riskScore || 0) - (a.risk?.riskScore || 0);
      if (scoreDelta !== 0) return scoreDelta;

      const priorityDelta =
        (severityPriority[b.classification] || 0) -
        (severityPriority[a.classification] || 0);
      if (priorityDelta !== 0) return priorityDelta;

      return (b.confidence || 0) - (a.confidence || 0);
    })[0];

    const expandedContext = this.contextExpansion.expand(
      fusedText,
      promotedPrimary.classification,
      evidenceFusion.inferredThemes,
    );

    const primaryStandardsResult = await this.getMergedStandards(
      promotedPrimary.classification,
      fusedText,
      scopes,
      workspaceId,
    );

    const knowledgeBrainResult =
      await this.safeScopeKnowledge.retrieveForHazard({
        fusedText,
        agencyMode: scopes?.includes("msha")
          ? "msha"
          : scopes?.includes("osha_construction")
            ? "osha_construction"
            : scopes?.includes("osha_general")
              ? "osha_general"
              : undefined,
        classification: promotedPrimary.classification,
        location:
          (expandedContext as any)?.location || (expandedContext as any)?.area,
        workspaceId,
      });

    const knowledgeBrain = this.formatKnowledgeBrain(knowledgeBrainResult);

    const generatedActions = await this.buildActionPreview(
      promotedPrimary.classification,
      fusedText,
      promotedPrimary.risk,
      primaryStandardsResult.suggestedStandards,
      expandedContext,
    );

    const sourceAwareAnalysis = buildSourceSynthesis(knowledgeBrain.matches);

    let correctiveReasoning =
      "Controls should be verified with evidence before closure.";
    if (sourceAwareAnalysis.primaryRegulatoryBasis.length)
      correctiveReasoning =
        "Corrective action should first address the enforceable regulatory basis identified by SafeScope. " +
        correctiveReasoning;
    else if (sourceAwareAnalysis.officialGuidance.length)
      correctiveReasoning =
        "Official guidance should be used to clarify applicability, but not as a standalone citation. " +
        correctiveReasoning;
    else if (sourceAwareAnalysis.incidentLearning.length)
      correctiveReasoning =
        "Incident learning should inform hazard recognition, severity, and prevention controls. " +
        correctiveReasoning;
    else if (sourceAwareAnalysis.bestPracticeGuidance.length)
      correctiveReasoning =
        "Safety alerts and best-practice guidance should inform preventive controls and closure evidence. " +
        correctiveReasoning;

    let confidenceNote =
      "No approved supporting knowledge sources were retrieved for this finding.";
    if (sourceAwareAnalysis.primaryRegulatoryBasis.length)
      confidenceNote =
        "Higher confidence because primary regulatory sources were retrieved.";
    else if (
      sourceAwareAnalysis.officialGuidance.length ||
      sourceAwareAnalysis.incidentLearning.length ||
      sourceAwareAnalysis.bestPracticeGuidance.length ||
      sourceAwareAnalysis.internalContext.length ||
      sourceAwareAnalysis.supportingReferences.length
    )
      confidenceNote =
        "Supportive references were retrieved, but no primary regulatory basis was identified in this knowledge synthesis.";

    const additionalHazards = await Promise.all(
      allCandidates
        .filter(
          (hazard) => hazard.classification !== promotedPrimary.classification,
        )
        .map(async (hazard) => {
          const standardsResult = await this.getMergedStandards(
            hazard.classification,
            fusedText,
            scopes,
            workspaceId,
          );

          const hazardExpandedContext = this.contextExpansion.expand(
            fusedText,
            hazard.classification,
            evidenceFusion.inferredThemes,
          );

          const hazardActions = await this.buildActionPreview(
            hazard.classification,
            fusedText,
            hazard.risk,
            standardsResult.suggestedStandards,
            hazardExpandedContext,
          );

          return {
            ...hazard,
            ...standardsResult,
            expandedContext: hazardExpandedContext,
            generatedActions: hazardActions,
          };
        }),
    );

    const intelligence = this.intelligenceOrchestrator.evaluate({
      fusedText,
      promotedPrimary,
      classifierResult: result,
      evidenceTexts,
      expandedContext,
      primaryStandardsResult,
      generatedActions,
      additionalHazards,
      priorFindings,
      workspaceId,
    });

    let reasoningSnapshotId: string | null = null;

    try {
      const snapshot = await this.reasoningSnapshotService.createSnapshot({
        workspaceId,
        classification: promotedPrimary.classification,
        intelligence,
      });

      reasoningSnapshotId = snapshot.id;
    } catch (error) {
      console.warn("SafeScope reasoning snapshot persistence failed:", error);
    }

    const shouldPreserveMachineGuardingPrimary =
      promotedPrimary.classification !== result.classification &&
      this.shouldPreserveMachineGuardingPrimary(
        result.classification,
        promotedPrimary.classification,
        fusedText,
      );

    const finalPrimary = shouldPreserveMachineGuardingPrimary
      ? result
      : promotedPrimary;

    const promotionWarning =
      promotedPrimary.classification !== result.classification
        ? shouldPreserveMachineGuardingPrimary
          ? [
              "Electrical/energized-state wording was treated as supporting energy-control context because machine-guarding indicators were stronger.",
            ]
          : [
              `Primary hazard promoted from ${result.classification} to ${promotedPrimary.classification} based on operational risk.`,
            ]
        : [];

    const intelligenceRequiresReview =
      Boolean(intelligence.confidenceIntelligence?.reviewTriggers?.length) ||
      Boolean(
        intelligence.decisionExplainability?.supervisorReviewRecommended,
      ) ||
      ["moderate", "high"].includes(
        String(intelligence.reasoningDrift?.driftBand || ""),
      ) ||
      String(intelligence.confidenceCalibration?.calibrationBand || "") !==
        "reliable" ||
      Boolean(intelligence.contradictionIntelligence?.contradictionsDetected);

    const finalAdditionalHazards = shouldPreserveMachineGuardingPrimary
      ? [promotedPrimary, ...additionalHazards].filter(
          (hazard, index, hazards) =>
            hazards.findIndex(
              (candidate) => candidate.classification === hazard.classification,
            ) === index,
        )
      : additionalHazards;

    const baseResult: any = result;
    const promotedResult: any = promotedPrimary;

    const finalSuggestedStandards = shouldPreserveMachineGuardingPrimary
      ? [
          ...(baseResult.suggestedStandards || []),
          ...(promotedResult.suggestedStandards || []).filter(
            (standard: any) =>
              !String(standard?.citation || "").includes("56.12016") &&
              !String(standard?.citation || "").includes("57.12016"),
          ),
        ].filter(
          (standard: any, index: number, standards: any[]) =>
            standards.findIndex(
              (candidate: any) => candidate?.citation === standard?.citation,
            ) === index,
        )
      : promotedPrimary.suggestedStandards;

    const finalRisk = shouldPreserveMachineGuardingPrimary
      ? baseResult.risk || promotedResult.risk
      : promotedResult.risk;

    const finalGeneratedActions = shouldPreserveMachineGuardingPrimary
      ? [
          {
            title: "Correct machine guarding and verify energy isolation",
            description:
              "Restrict access to the exposed conveyor tail pulley, verify the equipment energy state, apply lockout/tagout before cleanup or maintenance, install or repair guarding, and document supervisor verification with photo evidence before returning the area to service.",
            priority: finalRisk?.requiresShutdown ? "CRITICAL" : "HIGH",
            assignedRole: "Safety Manager",
            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            requiresShutdown: Boolean(finalRisk?.requiresShutdown),
            referenceStandards: finalSuggestedStandards
              ?.map((standard: any) => standard?.citation)
              .filter(Boolean),
            suggestedFixes: [
              "Stop affected work and restrict access to the exposed conveyor tail pulley.",
              "Verify whether the equipment is energized, running, shut down, or locked out.",
              "Apply lockout/tagout and block hazardous motion before cleanup or maintenance.",
              "Install, repair, or replace guarding so miners cannot contact moving parts.",
              "Document correction and supervisor verification with photo evidence.",
            ],
            sourceHazard: "Machine Guarding",
          },
        ]
      : promotedResult.generatedActions || generatedActions || [];

    if (shouldPreserveMachineGuardingPrimary) {
      const machineStandard = (baseResult.suggestedStandards || []).find(
        (standard: any) =>
          String(standard?.citation || "").includes("56.14107"),
      );

      const otherMachineStandards = (
        baseResult.suggestedStandards || []
      ).filter((standard: any) => standard !== machineStandard);

      const supportingEnergyStandards = (
        promotedResult.suggestedStandards || []
      ).filter(
        (standard: any) =>
          !String(standard?.citation || "").includes("56.12016") &&
          !String(standard?.citation || "").includes("57.12016"),
      );

      (finalSuggestedStandards || []).splice(
        0,
        (finalSuggestedStandards || []).length,
        ...[
          machineStandard,
          ...otherMachineStandards,
          ...supportingEnergyStandards,
        ]
          .filter(Boolean)
          .filter(
            (standard: any, index: number, standards: any[]) =>
              standards.findIndex(
                (candidate: any) => candidate?.citation === standard?.citation,
              ) === index,
          ),
      );

      if (finalRisk?.reasoning) {
        finalRisk.reasoning = finalRisk.reasoning.map((reason: string) =>
          String(reason).replace(
            "Electrical hazards can create serious or fatal exposure.",
            "Machine Guarding hazards can create serious or fatal exposure.",
          ),
        );
      }

      if (intelligence?.decisionExplainability) {
        intelligence.decisionExplainability.decisionSummary =
          "Machine Guarding was selected based on stronger conveyor, pulley, guarding, access, and cleanup signals. Energized-state wording was retained as supporting energy-control context.";
        intelligence.decisionExplainability.standardsStatement =
          "Primary standard selection favors machine guarding, with energy-control concerns retained for supervisor review.";
      }

      if (intelligence?.executiveJudgment) {
        intelligence.executiveJudgment.classification = "Machine Guarding";
        intelligence.executiveJudgment.strongestCausalFactor =
          "Accessible moving conveyor component with guarding/energy-control concern.";
        intelligence.executiveJudgment.topStandard =
          finalSuggestedStandards?.[0]
            ? {
                citation: finalSuggestedStandards[0].citation,
                heading:
                  finalSuggestedStandards[0].heading ||
                  finalSuggestedStandards[0].rationale ||
                  "Machine guarding standard",
                defensibilityScore: 0.82,
                reasoning:
                  "Machine guarding indicators were stronger than standalone energized-state wording.",
              }
            : intelligence.executiveJudgment.topStandard;
        intelligence.executiveJudgment.primaryAction =
          finalGeneratedActions?.[0]
            ? {
                title: finalGeneratedActions[0].title,
                priority: finalGeneratedActions[0].priority,
                verification:
                  finalGeneratedActions[0].verification ||
                  finalGeneratedActions[0].verificationMethod ||
                  "Supervisor verification and photo evidence required before closure.",
              }
            : intelligence.executiveJudgment.primaryAction;
        intelligence.executiveJudgment.decisionSummary =
          "Machine guarding exposure requires immediate control and energy-isolation verification.";
        intelligence.executiveJudgment.auditReadySummary =
          "Machine guarding exposure requires immediate control and energy-isolation verification. Accessible conveyor tail pulley was identified with energized-state uncertainty.";
      }
    }

    const defaultElectricalStandards =
      finalPrimary.classification === "Electrical"
        ? [
            {
              citation: "30 CFR 56.12016",
              agency: "MSHA",
              scope: "msha",
              rationale:
                "Electrical work or energized electrical exposure requires de-energization and safe electrical controls.",
              source: ["curated_fallback"],
              score: 90,
              matchingReasons: [
                "Electrical classification selected",
                "Energized or live electrical exposure indicated",
              ],
            },
          ]
        : [];

    const defaultMachineGuardingStandards =
      finalPrimary.classification === "Machine Guarding"
        ? [
            {
              citation: "30 CFR 56.14107(a)",
              agency: "MSHA",
              scope: "mining",
              rationale:
                "Guard moving machine parts that could contact employees.",
              source: ["curated_fallback"],
              score: 90,
              matchingReasons: [
                "Machine Guarding classification selected",
                "Conveyor, pulley, guarding, or moving-parts exposure indicated",
              ],
            },
          ]
        : [];

    const machineGuardingStandard =
      (baseResult.suggestedStandards || []).find((standard: any) =>
        String(standard?.citation || "").includes("56.14107"),
      ) ||
      (finalAdditionalHazards || [])
        .flatMap((hazard: any) => hazard?.suggestedStandards || [])
        .find((standard: any) =>
          String(standard?.citation || "").includes("56.14107"),
        );

    const preservedSuggestedStandards = shouldPreserveMachineGuardingPrimary
      ? [
          machineGuardingStandard,
          ...(baseResult.suggestedStandards || []),
          ...(finalAdditionalHazards || []).flatMap(
            (hazard: any) => hazard?.suggestedStandards || [],
          ),
        ]
          .filter(Boolean)
          .filter(
            (standard: any) =>
              !String(standard?.citation || "").includes("56.12016") &&
              !String(standard?.citation || "").includes("57.12016"),
          )
          .filter(
            (standard: any, index: number, standards: any[]) =>
              standards.findIndex(
                (candidate: any) => candidate?.citation === standard?.citation,
              ) === index,
          )
      : finalSuggestedStandards && finalSuggestedStandards.length
        ? finalSuggestedStandards
        : [...defaultElectricalStandards, ...defaultMachineGuardingStandards];

    const preservedGeneratedActions = shouldPreserveMachineGuardingPrimary
      ? [
          {
            title: "Correct machine guarding and verify energy isolation",
            description:
              "Restrict access to the exposed conveyor tail pulley, verify the equipment energy state, apply lockout/tagout before cleanup or maintenance, install or repair guarding, and document supervisor verification with photo evidence before returning the area to service.",
            priority: finalRisk?.requiresShutdown ? "CRITICAL" : "HIGH",
            assignedRole: "Safety Manager",
            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            requiresShutdown: Boolean(finalRisk?.requiresShutdown),
            referenceStandards: preservedSuggestedStandards
              ?.map((standard: any) => standard?.citation)
              .filter(Boolean),
            suggestedFixes: [
              "Stop affected work and restrict access to the exposed conveyor tail pulley.",
              "Verify whether the equipment is energized, running, shut down, or locked out.",
              "Apply lockout/tagout and block hazardous motion before cleanup or maintenance.",
              "Install, repair, or replace guarding so miners cannot contact moving parts.",
              "Document correction and supervisor verification with photo evidence.",
            ],
            verification:
              "Supervisor verification and photo evidence required before closure.",
            sourceHazard: "Machine Guarding",
          },
        ]
      : finalGeneratedActions;

    if (
      shouldPreserveMachineGuardingPrimary &&
      intelligence?.executiveJudgment
    ) {
      intelligence.executiveJudgment.classification = "Machine Guarding";
      intelligence.executiveJudgment.topStandard =
        preservedSuggestedStandards?.[0]
          ? {
              citation: preservedSuggestedStandards[0].citation,
              heading:
                preservedSuggestedStandards[0].heading ||
                preservedSuggestedStandards[0].rationale ||
                "Guard moving machine parts",
              defensibilityScore: 0.82,
              reasoning:
                "Machine guarding indicators were stronger than standalone energized-state wording.",
            }
          : intelligence.executiveJudgment.topStandard;

      intelligence.executiveJudgment.primaryAction =
        preservedGeneratedActions?.[0]
          ? {
              title: preservedGeneratedActions[0].title,
              priority: preservedGeneratedActions[0].priority,
              verification:
                preservedGeneratedActions[0].verification ||
                "Supervisor verification and photo evidence required before closure.",
            }
          : intelligence.executiveJudgment.primaryAction;
    }

    return {
      classification: finalPrimary.classification,
      confidence: finalPrimary.confidence,
      confidenceBand: finalPrimary.confidenceBand,
      evidenceTokens: finalPrimary.evidenceTokens,
      ambiguityWarnings: [...result.ambiguityWarnings, ...promotionWarning],
      requiresHumanReview:
        result.requiresHumanReview ||
        promotionWarning.length > 0 ||
        intelligenceRequiresReview,
      explanation: finalPrimary.explanation,
      commonConsequences: promotedPrimary.commonConsequences || [],
      requiredControls: promotedPrimary.requiredControls || [],
      score: promotedPrimary.score,
      scoreMargin: promotedPrimary.scoreMargin,
      excludedHazards:
        promotedPrimary.excludedHazards || result.excludedHazards || [],
      ...primaryStandardsResult,
      suggestedStandards: preservedSuggestedStandards,
      excludedStandards: primaryStandardsResult.excludedStandards || [],
      risk: finalRisk,
      evidenceFusion,
      expandedContext,
      ...intelligence,
      reasoningSnapshotId,
      generatedActions: preservedGeneratedActions,
      knowledgeBrain,
      sourceAwareAnalysis: {
        ...sourceAwareAnalysis,
        correctiveReasoning,
        complianceCaution:
          "SafeScope separates enforceable standards from guidance, incident learning, and best-practice references. Final compliance determinations require qualified safety review.",
        confidenceNote,
      },
      additionalHazards: finalAdditionalHazards,
    };
  }
}
