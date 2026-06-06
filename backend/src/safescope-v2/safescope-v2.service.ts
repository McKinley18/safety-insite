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
import { getEvidenceGapIntelligence } from "./intelligence/evidence-gap-intelligence";
import { getCorrectiveActionIntelligence } from "./intelligence/corrective-action-intelligence";
import { SupervisorValidationService } from "./validation/supervisor-validation.service";
import { SafeScopeNativeReasoningService } from "./native-reasoning/native-reasoning.service";
import { SafeScopeReasoningOrchestratorService } from "./reasoning-orchestrator/reasoning-orchestrator.service";

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
  private nativeReasoningService = new SafeScopeNativeReasoningService();
  private reasoningOrchestratorService = new SafeScopeReasoningOrchestratorService();

  private determineHumanReviewRequired(intelligence: any, primary: any) {
    return Boolean(
      primary?.requiresHumanReview ||
        intelligence?.confidenceIntelligence?.supervisorReviewRecommended ||
        intelligence?.confidenceIntelligence?.reviewTriggers?.length ||
        intelligence?.decisionExplainability?.supervisorReviewRecommended ||
        ["moderate", "high"].includes(
          String(intelligence?.reasoningDrift?.driftBand || ""),
        ) ||
        String(intelligence?.confidenceCalibration?.calibrationBand || "") !==
          "reliable" ||
        intelligence?.contradictionIntelligence?.contradictionsDetected ||
        intelligence?.contradictionIntelligence?.requiresSupervisorClarification ||
        intelligence?.evidenceQuality?.requiresAdditionalEvidence,
    );
  }

  private buildAiCapabilityProfile(input: {
    modelAssisted: boolean;
    retrievalBacked: boolean;
    deterministicRulesApplied: boolean;
    auditTraceAvailable: boolean;
    evidenceContractAvailable: boolean;
    scenarioValidated: boolean;
  }) {
    const capabilities = [
      input.deterministicRulesApplied ? "deterministic_hazard_classification" : null,
      input.deterministicRulesApplied ? "risk_scoring" : null,
      input.retrievalBacked ? "source_retrieval" : null,
      input.retrievalBacked ? "standards_candidate_matching" : null,
      input.auditTraceAvailable ? "audit_trace" : null,
      input.evidenceContractAvailable ? "evidence_contract" : null,
      input.scenarioValidated ? "scenario_gauntlet_validated" : null,
    ].filter(Boolean);

    const missingForValidatedAi = [
      "larger_validated_scenario_library",
      "measured_accuracy_benchmarks",
      "offline_knowledge_bundle_versioning",
      "formal_reviewer_acceptance_workflow",
      "field_tested_confidence_calibration",
      "validation_gated_learning_loop",
      !input.retrievalBacked ? "retrieval_backed_source_grounding" : null,
      !input.auditTraceAvailable ? "persistent_audit_trace" : null,
      !input.evidenceContractAvailable ? "evidence_contract" : null,
      !input.scenarioValidated ? "expanded_golden_scenario_validation" : null,
    ].filter(Boolean);

    let classification:
      | "rules_only"
      | "deterministic_retrieval"
      | "hybrid_ai_ready"
      | "native_reasoning_validated"
      | "validated_native_ai_copilot" = "rules_only";

    if (input.deterministicRulesApplied && input.retrievalBacked) {
      classification = "deterministic_retrieval";
    }

    if (
      input.deterministicRulesApplied &&
      input.retrievalBacked &&
      input.auditTraceAvailable &&
      input.evidenceContractAvailable
    ) {
      classification = "hybrid_ai_ready";
    }

    if (
      input.modelAssisted &&
      input.retrievalBacked &&
      input.auditTraceAvailable &&
      input.evidenceContractAvailable
    ) {
      classification = "native_reasoning_validated";
    }

    if (
      input.modelAssisted &&
      input.retrievalBacked &&
      input.auditTraceAvailable &&
      input.evidenceContractAvailable &&
      input.scenarioValidated
    ) {
      classification = "validated_native_ai_copilot";
    }

    return {
      classification,
      currentStatus:
        classification === "validated_native_ai_copilot"
          ? "SafeScope is operating as a validated AI safety copilot with retrieval grounding, audit traceability, evidence controls, and scenario validation."
          : classification === "native_reasoning_validated"
            ? "SafeScope is operating as a model-assisted retrieval-augmented safety intelligence engine."
            : classification === "hybrid_ai_ready"
              ? "SafeScope is AI-ready: deterministic intelligence, retrieval grounding, evidence controls, audit traceability, native reasoning, and offline-capable safety logic are in place."
              : classification === "deterministic_retrieval"
                ? "SafeScope is operating as deterministic decision support with retrieval-backed standards intelligence."
                : "SafeScope is operating as rules-based decision support.",
      capabilities,
      missingForValidatedAi,
      claimBoundary:
        classification === "validated_native_ai_copilot" || classification === "native_reasoning_validated"
          ? "May be described as validated native safety AI when validation benchmarks, field calibration, and human-review safeguards are active."
          : "Should be described as AI-ready native safety intelligence until validation benchmarks, field calibration, and validation-gated learning are complete.",
    };
  }

  private buildAiReadinessMetadata(input: {
    intelligence?: any;
    primary?: any;
    knowledgeBrain?: any;
    reasoningSnapshotId?: string | null;
  }) {
    const humanReviewRequired = this.determineHumanReviewRequired(
      input.intelligence,
      input.primary,
    );

    return {
      engineName: "SafeScope",
      engineVersion: "0.1.0",
      engineMode: "hybrid_deterministic_retrieval_reasoning",
      reasoningMode: "deterministic_rules_plus_source_retrieval",
      modelAssisted: false,
      retrievalBacked: Boolean(input.knowledgeBrain?.matches?.length),
      deterministicRulesApplied: true,
      taxonomyVersion: "current",
      standardsVersion: "current",
      lowConfidenceThreshold: 0.7,
      humanReviewRequired,
      sourcePolicy: "regulatory_sources_required_for_compliance_claims",
      citationPolicy: "no_uncited_regulatory_claims",
      hallucinationGuardrail:
        "Standards must come from curated mappings, retrieved standards, or approved SafeScope knowledge sources.",
      auditTraceAvailable: Boolean(input.reasoningSnapshotId),
      auditTraceId: input.reasoningSnapshotId || null,
      finalAuthorityStatement:
        "SafeScope provides decision-support intelligence. Final compliance and safety decisions require qualified human review.",
      limitations: [
        "SafeScope does not replace a competent person, certified safety professional, supervisor, or regulatory authority.",
        "Low confidence, conflicting evidence, missing critical information, or high-risk conditions require human review.",
        "External model-assisted reasoning is not required for this engine mode; SafeScope native reasoning remains offline-capable.",
      ],
    };
  }

  constructor(
    private readonly actionEngine: ActionEngineService,
    private readonly contextExpansion: ContextExpansionService,
    private readonly evidenceFusion: EvidenceFusionService,
    private readonly applicableStandards: ApplicableStandardsService,
    private readonly feedbackService: SafeScopeFeedbackService,
    private readonly reasoningSnapshotService: ReasoningSnapshotService,
    private readonly safeScopeKnowledge: SafeScopeKnowledgeService,
    private readonly standardsIntelligenceService: StandardsIntelligenceService,
    private readonly supervisorValidationService: SupervisorValidationService,
  ) {}

  private scopeToSource(scopes?: string[]) {
    if (!scopes || scopes.length === 0 || scopes.includes("all"))
      return undefined;
    if (scopes.includes("msha_mnm_surface")) return "MSHA_MNM_SURFACE";
    if (scopes.includes("msha_mnm_underground")) return "MSHA_MNM_UNDERGROUND";
    if (scopes.includes("msha_coal_underground")) return "MSHA_COAL_UNDERGROUND";
    if (scopes.includes("msha_coal_surface")) return "MSHA_COAL_SURFACE";
    if (scopes.includes("msha")) return "MSHA";
    if (scopes.includes("osha_construction")) return "OSHA_CONSTRUCTION";
    if (scopes.includes("osha_general")) return "OSHA_GENERAL_INDUSTRY";
    return undefined;
  }

  private getPreferredMshaPart(scopes?: string[]): "56" | "57" | "75" | "77" | undefined {
    if (!scopes || scopes.length === 0) return undefined;
    if (scopes.includes("msha_mnm_surface")) return "56";
    if (scopes.includes("msha_mnm_underground")) return "57";
    if (scopes.includes("msha_coal_underground")) return "75";
    if (scopes.includes("msha_coal_surface")) return "77";
    return undefined;
  }

  private applyStandardsScopeFit(
    standards: any[],
    scopes?: string[],
  ) {
    const preferredMshaPart = this.getPreferredMshaPart(scopes);

    return standards.map((standard: any) => {
      const citation = String(standard?.citation || "");
      const matchingReasons = Array.isArray(standard?.matchingReasons)
        ? [...standard.matchingReasons]
        : [];

      let scopeFitAdjustment = 0;
      let scopeFit: "preferred" | "neutral" | "mismatch" = "neutral";

      if (preferredMshaPart && new RegExp(`30 CFR ${preferredMshaPart}\\.`).test(citation)) {
        scopeFitAdjustment += 175;
        scopeFit = "preferred";
        matchingReasons.push(`scope-fit: preferred MSHA Part ${preferredMshaPart}`);
      }

      if (
        preferredMshaPart &&
        /30 CFR (56|57|75|77)\./.test(citation) &&
        !new RegExp(`30 CFR ${preferredMshaPart}\\.`).test(citation)
      ) {
        scopeFitAdjustment -= 125;
        scopeFit = "mismatch";
        matchingReasons.push(`scope-fit: demoted outside selected MSHA Part ${preferredMshaPart}`);
      }

      return {
        ...standard,
        score: Math.max(0, Number(standard?.score || 0) + scopeFitAdjustment),
        scopeFit,
        scopeFitAdjustment,
        matchingReasons,
      };
    });
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

    const scopeRanked = this.applyStandardsScopeFit(unique, scopes);
    const suggestedStandards = scopeRanked
      .sort((a: any, b: any) => {
        const scoreDelta = Number(b.score || 0) - Number(a.score || 0);
        if (scoreDelta !== 0) return scoreDelta;

        const fitPriority: Record<string, number> = {
          preferred: 2,
          neutral: 1,
          mismatch: 0,
        };

        return (
          (fitPriority[b.scopeFit || "neutral"] || 0) -
          (fitPriority[a.scopeFit || "neutral"] || 0)
        );
      })
      .slice(0, 8);

    const excludedByScopeFit = scopeRanked
      .filter((standard: any) => standard.scopeFit === "mismatch")
      .map((standard: any) => ({
        citation: standard.citation,
        reason:
          standard.matchingReasons?.find((reason: string) =>
            String(reason).startsWith("scope-fit: demoted"),
          ) || "Demoted because it does not match the selected MSHA scope.",
        score: standard.score,
        scopeFit: standard.scopeFit,
      }));

    return {
      suggestedStandards,
      excludedStandards: [
        ...(curated.excludedStandards || []),
        ...excludedByScopeFit,
      ],
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


  private uniqueFieldStrings(values: any[], limit = 12): string[] {
    const seen = new Set<string>();
    const result: string[] = [];

    for (const value of values || []) {
      const normalized = String(value || '').trim();
      if (!normalized) continue;

      const key = normalized.toLowerCase();
      if (seen.has(key)) continue;

      seen.add(key);
      result.push(normalized);

      if (result.length >= limit) break;
    }

    return result;
  }

  private buildFieldOutputContract(input: {
    classification: string;
    confidence: any;
    risk: any;
    generatedActions?: any[];
    suggestedStandards?: any[];
    knowledgeBrain?: any;
    evidenceGapIntelligence?: any;
    correctiveActionIntelligence?: any;
    intelligence?: any;
    sourceAwareAnalysis?: any;
    reasoningSnapshotId?: string | null;
    semanticUnderstanding?: any;
    semanticRouting?: any;
    humanReviewRequired: boolean;
  }) {
    const generatedActions = Array.isArray(input.generatedActions)
      ? input.generatedActions
      : [];

    const immediateControls = this.uniqueFieldStrings(
      [
        ...generatedActions
          .filter((action: any) => action?.requiresShutdown || action?.priority === 'Critical' || action?.priority === 'High')
          .flatMap((action: any) => [
            action.title,
            action.description,
            ...(Array.isArray(action.suggestedFixes) ? action.suggestedFixes : []),
          ]),
        ...(Array.isArray(input.correctiveActionIntelligence?.immediateControls)
          ? input.correctiveActionIntelligence.immediateControls
          : []),
      ],
      6,
    );

    const correctiveActions = this.uniqueFieldStrings(
      [
        ...generatedActions.flatMap((action: any) => [
          action.title,
          action.description,
          ...(Array.isArray(action.suggestedFixes) ? action.suggestedFixes : []),
        ]),
        ...(Array.isArray(input.correctiveActionIntelligence?.recommendedActions)
          ? input.correctiveActionIntelligence.recommendedActions
          : []),
      ],
      10,
    );

    const verificationEvidence = this.uniqueFieldStrings(
      [
        ...generatedActions.flatMap((action: any) => [
          action.verification,
          ...(Array.isArray(action.verificationEvidence) ? action.verificationEvidence : []),
          ...(Array.isArray(action.suggestedFixes)
            ? action.suggestedFixes.filter((fix: any) =>
                /photo|verify|verification|record|document|inspection|evidence/i.test(String(fix || '')),
              )
            : []),
        ]),
        ...(Array.isArray(input.correctiveActionIntelligence?.verificationEvidence)
          ? input.correctiveActionIntelligence.verificationEvidence
          : []),
      ],
      8,
    );

    const evidenceGaps = this.uniqueFieldStrings(
      [
        ...(Array.isArray(input.knowledgeBrain?.evidenceGaps)
          ? input.knowledgeBrain.evidenceGaps
          : []),
        ...(Array.isArray(input.evidenceGapIntelligence?.criticalQuestions)
          ? input.evidenceGapIntelligence.criticalQuestions
          : []),
        ...(Array.isArray(input.evidenceGapIntelligence?.evidenceGaps)
          ? input.evidenceGapIntelligence.evidenceGaps
          : []),
        ...(Array.isArray(input.intelligence?.confidenceIntelligence?.missingCriticalInformation)
          ? input.intelligence.confidenceIntelligence.missingCriticalInformation
          : []),
        ...(Array.isArray(input.semanticUnderstanding?.evidenceGaps)
          ? input.semanticUnderstanding.evidenceGaps
          : []),
      ],
      10,
    );

    const supervisorQuestions = this.uniqueFieldStrings(
      [
        ...(Array.isArray(input.intelligence?.operationalReasoning?.supervisorQuestions)
          ? input.intelligence.operationalReasoning.supervisorQuestions
          : []),
        ...(Array.isArray(input.evidenceGapIntelligence?.criticalQuestions)
          ? input.evidenceGapIntelligence.criticalQuestions
          : []),
        ...evidenceGaps,
      ],
      8,
    );

    const topStandards = (Array.isArray(input.suggestedStandards)
      ? input.suggestedStandards
      : []
    )
      .slice(0, 3)
      .map((standard: any) => ({
        citation: standard?.citation,
        heading: standard?.heading || standard?.title || standard?.rationale,
        rationale: standard?.rationale || standard?.reasoning,
      }));

    return {
      version: 'field_output_v1',
      primaryMessage:
        immediateControls[0] ||
        correctiveActions[0] ||
        'Review the SafeScope field output and verify controls before final report use.',
      summary:
        `${input.classification || 'SafeScope'} field output: ${
          immediateControls[0] ||
          correctiveActions[0] ||
          'review required before final report use'
        }`,
      priority: String(input.risk?.riskBand || input.risk?.operationalRisk?.matrixBand || 'Unknown'),
      recommendedDisposition:
        input.intelligence?.decisionConfidence?.recommendedDisposition ||
        input.evidenceGapIntelligence?.recommendedDisposition ||
        (input.humanReviewRequired ? 'proceed_with_human_review' : 'field_review_ready'),
      classification: input.classification,
      confidence: {
        level:
          input.intelligence?.decisionConfidence?.confidenceLevel ||
          input.intelligence?.brain?.summary?.decisionConfidenceLevel ||
          input.confidence,
        display:
          input.intelligence?.decisionConfidence?.confidenceLevel ||
          input.confidence,
        requiresHumanReview: input.humanReviewRequired,
        disposition:
          input.intelligence?.decisionConfidence?.recommendedDisposition ||
          input.evidenceGapIntelligence?.recommendedDisposition ||
          (input.humanReviewRequired ? 'proceed_with_human_review' : 'qualified_review_recommended'),
        defensibilityScore:
          input.intelligence?.decisionConfidence?.defensibilityScore ||
          input.evidenceGapIntelligence?.defensibilityScore,
        warnings: this.uniqueFieldStrings(
          [
            ...(Array.isArray(input.intelligence?.decisionConfidence?.warnings)
              ? input.intelligence.decisionConfidence.warnings
              : []),
            ...(Array.isArray(input.sourceAwareAnalysis?.warnings)
              ? input.sourceAwareAnalysis.warnings
              : []),
          ],
          6,
        ),
      },
      risk: {
        band: input.risk?.riskBand || input.risk?.operationalRisk?.matrixBand || input.risk?.matrixBand,
        requiresShutdownOrImmediateControl: Boolean(
          input.risk?.requiresShutdown || input.risk?.requiresImmediateControl,
        ),
      },
      topStandards,
      observationUnderstanding: input.semanticUnderstanding || null,
      semanticRouting: input.semanticRouting || null,
      immediateControls,
      correctiveActions: correctiveActions.map((action, index) => ({
        title: action,
        description:
          index === 0
            ? `${action}. Document correction and verification before closure.`
            : action,
        priority: String(input.risk?.riskBand || input.risk?.operationalRisk?.matrixBand || 'Medium'),
        suggestedFixes: [action],
        verification:
          verificationEvidence[0] ||
          'Supervisor verification and supporting evidence required before closure.',
        source: 'SafeScope field output',
      })),
      verificationEvidence,
      evidenceGaps,
      supervisorQuestions,
      warnings: this.uniqueFieldStrings(
        [
          ...(input.intelligence?.decisionConfidence?.warnings || []),
          ...(input.intelligence?.confidenceIntelligence?.reviewTriggers || []),
          input.humanReviewRequired
            ? 'SafeScope output requires qualified review before final report use.'
            : '',
        ],
        8,
      ),
      boundary: {
        requiresQualifiedReview: true,
        canDeclareViolation: false,
        canBypassHumanReview: false,
      },
      auditTrace: {
        reasoningSnapshotId: input.reasoningSnapshotId || null,
        source: 'SafeScope v2 field output contract',
        requiresQualifiedReview: true,
        complianceCaution:
          'SafeScope output is decision support only. Final compliance determinations and report language require qualified safety review.',
      },
    };
  }


  private buildAiEvidenceContract(input: {
    text: string;
    evidenceTexts?: string[];
    suggestedStandards?: any[];
    knowledgeBrain?: any;
    sourceAwareAnalysis?: any;
    evidenceGapIntelligence?: any;
    intelligence?: any;
    humanReviewRequired: boolean;
  }) {
    const inputsUsed = [
      input.text ? "hazard_observation_text" : null,
      input.evidenceTexts?.length ? "evidence_texts" : null,
      input.suggestedStandards?.length ? "suggested_standards" : null,
      input.knowledgeBrain?.matches?.length ? "knowledge_retrieval_matches" : null,
      input.intelligence ? "safescope_intelligence_layers" : null,
    ].filter(Boolean);

    const standardsSourcesUsed = Array.from(
      new Set(
        (input.suggestedStandards || [])
          .flatMap((standard: any) =>
            Array.isArray(standard?.source)
              ? standard.source
              : standard?.source
                ? [standard.source]
                : [],
          )
          .concat(
            (input.knowledgeBrain?.matches || []).map((match: any) =>
              match?.sourceType || match?.agency || "knowledge_source",
            ),
          )
          .filter(Boolean),
      ),
    );

    const missingInputs = Array.from(
      new Set([
        ...(input.evidenceGapIntelligence?.missingCriticalInformation || []),
        ...(input.evidenceGapIntelligence?.confidenceLimitations || []),
        ...(input.intelligence?.confidenceIntelligence?.missingCriticalInformation || []),
      ]),
    );

    const reviewTriggers = Array.from(
      new Set([
        ...(input.intelligence?.confidenceIntelligence?.reviewTriggers || []),
        ...(input.intelligence?.confidenceIntelligence?.recommendedFollowup || []),
        ...(input.intelligence?.decisionExplainability?.supervisorReviewRecommended
          ? ["Supervisor review recommended by SafeScope decision explainability."]
          : []),
        ...(input.intelligence?.contradictionIntelligence?.contradictionsDetected
          ? ["Contradictory or ambiguous signals require human review."]
          : []),
        ...(input.humanReviewRequired
          ? ["SafeScope marked this assessment as requiring qualified human review."]
          : []),
      ]),
    );

    const unsupportedClaims = [];
    if (!input.suggestedStandards?.length) {
      unsupportedClaims.push(
        "No standards were selected by the standards engine for this assessment.",
      );
    }

    if (!input.knowledgeBrain?.matches?.length) {
      unsupportedClaims.push(
        "No approved knowledge-source match was retrieved for this assessment.",
      );
    }

    return {
      inputsUsed,
      standardsSourcesUsed,
      missingInputs,
      unsupportedClaims,
      reviewTriggers,
      canFinalizeWithoutHumanReview:
        !input.humanReviewRequired &&
        missingInputs.length === 0 &&
        unsupportedClaims.length === 0,
      finalAuthorityStatement:
        "SafeScope can support review and documentation, but final safety and compliance decisions require qualified human judgment.",
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
      "Confined Space": 105,
      "Trenching & Shoring": 102,
      "Fall Protection": 100,
      Fall: 100,
      "Scaffolds": 99,
      "Mobile Equipment / Traffic": 95,
      "Powered Mobile Equipment": 95,
      Electrical: 90,
      "Lockout / Stored Energy": 88,
      "Fire / Explosion": 87,
      "Welding / Cutting / Hot Work": 87,
      "Lifting & Rigging": 86,
      Machine: 85,
      "Machine Guarding": 85,
      "Compressed Gas Cylinders": 82,
      "Compressed Air / Hose Safety": 80,
      "Respirable Dust / Silica": 75,
      "Chemical Storage": 72,
      "Hazard Communication": 70,
      "Emergency Egress": 68,
      "First Aid / Eyewash / Safety Shower Access": 67,
      "Walking/Working Surfaces": 65,
      "Material Handling": 60,
      Housekeeping: 50,
      PPE: 40,
      "Review Required": 0,
    };

    const promotedPrimary: any = [...allCandidates].sort((a: any, b: any) => {
      const confidenceDiff = (b.confidence || 0) - (a.confidence || 0);
      if (Math.abs(confidenceDiff) >= 0.20) {
        return confidenceDiff;
      }

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
        agencyMode: scopes?.includes("msha_mnm_surface")
          ? "msha_mnm_surface"
          : scopes?.includes("msha_mnm_underground")
            ? "msha_mnm_underground"
            : scopes?.includes("msha_coal_underground")
              ? "msha_coal_underground"
              : scopes?.includes("msha_coal_surface")
                ? "msha_coal_surface"
                : scopes?.includes("msha")
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

    const evidenceGapIntelligence = getEvidenceGapIntelligence(
      fusedText,
      promotedPrimary.classification,
    );

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

    const correctiveActionIntelligence = getCorrectiveActionIntelligence(
      promotedPrimary.classification,
      promotedPrimary.risk,
      sourceAwareAnalysis,
      evidenceGapIntelligence,
    );

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

    const supervisorValidations =
      await this.supervisorValidationService.getWorkspaceValidationSignals(
        workspaceId,
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
      supervisorValidations,
    });

    const equipmentReasoningContext = this.reasoningOrchestratorService.reason({
      hazardObservation: fusedText,
      siteType: scopes?.join(', '),
      taskContext: fusedText,
      industryContext: scopes?.join(', '),
      photosAvailable: Boolean(evidenceTexts?.length),
      employeeExposureKnown: undefined,
      equipmentInvolved: fusedText,
      enableApprovedKnowledgeContext: false,
    });

    const enrichedIntelligence = intelligence as any;

    enrichedIntelligence.equipmentTaskMechanismContext =
      equipmentReasoningContext.equipmentTaskMechanismContext;
    enrichedIntelligence.equipmentArchetypeContext =
      equipmentReasoningContext.equipmentArchetypeContext;
    enrichedIntelligence.equipmentReasoningSummary =
      equipmentReasoningContext.equipmentReasoningSummary;

    const observationUnderstanding =
      equipmentReasoningContext.brainSnapshot?.situationalAwarenessPacket
        ?.observationUnderstanding;

    const semanticUnderstanding = {
      engine: observationUnderstanding?.engine,
      mode: observationUnderstanding?.mode,
      primaryEntityKind:
        observationUnderstanding?.summary?.primaryEntityKind,
      primaryEntityLabel:
        observationUnderstanding?.summary?.primaryEntityLabel,
      primaryCondition:
        observationUnderstanding?.summary?.primaryCondition,
      likelyDomainHints:
        observationUnderstanding?.summary?.likelyDomainHints || [],
      likelyMechanismHints:
        observationUnderstanding?.summary?.likelyMechanismHints || [],
      negativeDomainHints:
        observationUnderstanding?.summary?.negativeDomainHints || [],
      evidenceGaps:
        observationUnderstanding?.summary?.evidenceGaps || [],
      confidence:
        observationUnderstanding?.summary?.confidence,
      reasonCodes:
        observationUnderstanding?.findings?.[0]?.reasonCodes || [],
      boundary:
        observationUnderstanding?.boundary,
    };

    enrichedIntelligence.observationUnderstanding = observationUnderstanding;
    enrichedIntelligence.semanticUnderstanding = semanticUnderstanding;

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

    const normalizeSemanticDomain = (value: unknown): string =>
      String(value || '')
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');

    const rawPrimaryDomainText = normalizeSemanticDomain(finalPrimary.classification);
    const normalizedLikelyDomainHints = Array.isArray(semanticUnderstanding.likelyDomainHints)
      ? semanticUnderstanding.likelyDomainHints.map(normalizeSemanticDomain)
      : [];
    const normalizedNegativeDomainHints = Array.isArray(semanticUnderstanding.negativeDomainHints)
      ? semanticUnderstanding.negativeDomainHints.map(normalizeSemanticDomain)
      : [];

    const primaryDomainText =
      rawPrimaryDomainText === 'hazard_communication' &&
      normalizedLikelyDomainHints.includes('fire_protection') &&
      normalizedNegativeDomainHints.includes('hazard_communication')
        ? 'fire_protection'
        : rawPrimaryDomainText;

    const semanticConflictWithPrimaryDomain =
      primaryDomainText.length > 0 &&
      normalizedNegativeDomainHints.includes(primaryDomainText) &&
      !normalizedLikelyDomainHints.includes(primaryDomainText);

    const semanticRouting = {
      engine: 'safescope_semantic_routing_guard_v1',
      mode: 'read_only_routing_guard',
      rawPrimaryDomain: rawPrimaryDomainText,
      primaryDomain: primaryDomainText,
      likelyDomainHints: semanticUnderstanding.likelyDomainHints || [],
      likelyMechanismHints: semanticUnderstanding.likelyMechanismHints || [],
      negativeDomainHints: semanticUnderstanding.negativeDomainHints || [],
      normalizedLikelyDomainHints,
      normalizedNegativeDomainHints,
      conflictsWithPrimaryDomain: semanticConflictWithPrimaryDomain,
      routingDisposition: semanticConflictWithPrimaryDomain
          ? 'route_for_human_review_due_to_semantic_conflict'
          : 'semantic_context_aligned_or_non_conflicting',
      guardrailNotes: [
        'Semantic routing is advisory only.',
        'Semantic routing may raise review or evidence needs but does not override the final classification.',
        'Semantic routing does not create or override standards.',
      ],
      boundary: {
        readOnly: true,
        doesNotDeclareViolation: true,
        doesNotCreateCitation: true,
        doesNotOverrideFinalClassification: true,
        doesNotOverrideStandards: true,
        requiresQualifiedReview: true,
      },
    };

    enrichedIntelligence.semanticRouting = semanticRouting;

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

    const selectedMshaScope = scopes?.includes("msha_mnm_underground")
      ? "msha_mnm_underground"
      : scopes?.includes("msha_coal_underground")
        ? "msha_coal_underground"
        : scopes?.includes("msha_coal_surface")
          ? "msha_coal_surface"
          : scopes?.includes("msha_mnm_surface")
            ? "msha_mnm_surface"
            : scopes?.includes("msha")
              ? "msha"
              : undefined;

    const defaultElectricalCitation =
      selectedMshaScope === "msha_mnm_underground"
        ? "30 CFR 57.12016"
        : selectedMshaScope === "msha_coal_underground"
          ? "30 CFR 75.511"
          : selectedMshaScope === "msha_coal_surface"
            ? "30 CFR 77.501"
            : "30 CFR 56.12016";

    const defaultMachineGuardingCitation =
      selectedMshaScope === "msha_mnm_underground"
        ? "30 CFR 57.14107"
        : selectedMshaScope === "msha_coal_underground"
          ? "30 CFR 75.1722"
          : selectedMshaScope === "msha_coal_surface"
            ? "30 CFR 77.400"
            : "30 CFR 56.14107(a)";

    const defaultElectricalStandards =
      finalPrimary.classification === "Electrical"
        ? [
            {
              citation: defaultElectricalCitation,
              agency: "MSHA",
              scope: selectedMshaScope || "msha",
              rationale:
                "Electrical work or energized electrical exposure requires de-energization and safe electrical controls.",
              source: ["curated_fallback"],
              score: 90,
              scopeFit: selectedMshaScope ? "preferred" : "neutral",
              scopeFitAdjustment: selectedMshaScope ? 175 : 0,
              matchingReasons: [
                "Electrical classification selected",
                "Energized or live electrical exposure indicated",
                selectedMshaScope
                  ? `Scoped MSHA fallback selected: ${selectedMshaScope}`
                  : "Default MSHA fallback selected",
                selectedMshaScope
                  ? `scope-fit: preferred MSHA scope ${selectedMshaScope}`
                  : "scope-fit: neutral fallback scope",
              ],
            },
          ]
        : [];

    const defaultMachineGuardingStandards =
      finalPrimary.classification === "Machine Guarding"
        ? [
            {
              citation: defaultMachineGuardingCitation,
              agency: "MSHA",
              scope: selectedMshaScope || "mining",
              rationale:
                "Guard moving machine parts that could contact employees.",
              source: ["curated_fallback"],
              score: 90,
              scopeFit: selectedMshaScope ? "preferred" : "neutral",
              scopeFitAdjustment: selectedMshaScope ? 175 : 0,
              matchingReasons: [
                "Machine Guarding classification selected",
                "Conveyor, pulley, guarding, or moving-parts exposure indicated",
                selectedMshaScope
                  ? `Scoped MSHA fallback selected: ${selectedMshaScope}`
                  : "Default MSHA fallback selected",
                selectedMshaScope
                  ? `scope-fit: preferred MSHA scope ${selectedMshaScope}`
                  : "scope-fit: neutral fallback scope",
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

    const uiSuggestedStandards = preservedSuggestedStandards?.length
      ? preservedSuggestedStandards
      : primaryStandardsResult.suggestedStandards || [];

    const humanReviewRequired =
      result.requiresHumanReview ||
      promotionWarning.length > 0 ||
      intelligenceRequiresReview;

    const aiReadiness = this.buildAiReadinessMetadata({
      intelligence,
      primary: {
        ...finalPrimary,
        requiresHumanReview: humanReviewRequired,
      },
      knowledgeBrain,
      reasoningSnapshotId,
    });

    const aiEvidenceContract = this.buildAiEvidenceContract({
      text: fusedText,
      evidenceTexts,
      suggestedStandards: uiSuggestedStandards,
      knowledgeBrain,
      sourceAwareAnalysis,
      evidenceGapIntelligence,
      intelligence,
      humanReviewRequired,
    });

    const nativeReasoning = this.nativeReasoningService.evaluate({
      observationText: fusedText,
      classification: finalPrimary.classification,
      risk: finalRisk,
      suggestedStandards: uiSuggestedStandards,
      evidenceTexts,
      knowledgeBrain,
      aiEvidenceContract,
      intelligence,
    });

    const fieldOutput = this.buildFieldOutputContract({
      classification: finalPrimary.classification,
      confidence: finalPrimary.confidence,
      risk: finalRisk,
      generatedActions: preservedGeneratedActions,
      suggestedStandards: uiSuggestedStandards,
      knowledgeBrain,
      evidenceGapIntelligence,
      correctiveActionIntelligence,
      intelligence,
      sourceAwareAnalysis,
      reasoningSnapshotId,
      semanticUnderstanding,
      semanticRouting,
      humanReviewRequired,
    });

    const aiCapabilityProfile = this.buildAiCapabilityProfile({
      modelAssisted: false,
      retrievalBacked: Boolean(knowledgeBrain?.matches?.length),
      deterministicRulesApplied: true,
      auditTraceAvailable: Boolean(reasoningSnapshotId),
      evidenceContractAvailable: Boolean(aiEvidenceContract),
      scenarioValidated: true,
    });

    return {
      classification: finalPrimary.classification,
      confidence: finalPrimary.confidence,
      confidenceBand: finalPrimary.confidenceBand,
      evidenceTokens: finalPrimary.evidenceTokens,
      ambiguityWarnings: [...result.ambiguityWarnings, ...promotionWarning],
      requiresHumanReview: humanReviewRequired,
      aiReadiness,
      aiEvidenceContract,
      aiCapabilityProfile,
      nativeReasoning,
      fieldOutput,
      semanticUnderstanding,
      semanticRouting,
      decisionSupportMetadata: {
        ...aiReadiness,
        aiEvidenceContract,
        aiCapabilityProfile,
        nativeReasoning,
        semanticUnderstanding,
        observationUnderstanding,
        semanticRouting,
      },
      explanation: finalPrimary.explanation,
      commonConsequences: promotedPrimary.commonConsequences || [],
      requiredControls: promotedPrimary.requiredControls || [],
      score: promotedPrimary.score,
      scoreMargin: promotedPrimary.scoreMargin,
      excludedHazards:
        promotedPrimary.excludedHazards || result.excludedHazards || [],
      ...primaryStandardsResult,
      excludedStandards: primaryStandardsResult.excludedStandards || [],
      risk: finalRisk,
      evidenceFusion,
      expandedContext,
      ...intelligence,
      suggestedStandards: uiSuggestedStandards,
      standardsReasoning: {
        ...(intelligence.standardsReasoning || {}),
        topDefensible: intelligence.standardsReasoning?.topDefensible?.length
          ? intelligence.standardsReasoning.topDefensible
          : uiSuggestedStandards.slice(0, 3),
      },
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
      evidenceGapIntelligence,
      correctiveActionIntelligence,
      additionalHazards: finalAdditionalHazards,
    };
  }
}
