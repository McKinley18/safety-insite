import { StandardsBridgeService } from "./standards-bridge.service";
import { Injectable, Optional, ForbiddenException } from "@nestjs/common";
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
import { VisualEvidenceReasoningService } from "./visual-evidence-reasoning/visual-evidence-reasoning.service";
import { VisualEvidenceReasoningInput, Attachment } from "./visual-evidence-reasoning/visual-evidence-reasoning.types";
import { RealImageAnalysisService } from "./real-image-analysis/real-image-analysis.service";
import { RealImageAnalysisInput } from "./real-image-analysis/real-image-analysis.types";
import { OfflineReasoningInput } from "./offline-reasoning-mobile-resilience/offline-reasoning-mobile-resilience.types";
import { OfflineReasoningMobileResilienceService } from "./offline-reasoning-mobile-resilience/offline-reasoning-mobile-resilience.service";
import { SafeScopePersistenceService } from "./persistence/persistence.service";
import { WorkspaceGovernanceAccessService } from "./workspace-governance-access/workspace-governance-access.service";
import { UserGovernanceContext } from "./workspace-governance-access/workspace-governance.types";

@Injectable()
export class SafescopeV2Service {
  private classifier = new WeightedClassifierService();
  private bridge = new StandardsBridgeService();
  private nativeReasoningService = new SafeScopeNativeReasoningService();
  private reasoningOrchestratorService = new SafeScopeReasoningOrchestratorService();

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
    private readonly intelligenceOrchestrator: SafeScopeIntelligenceOrchestrator,
    private readonly visualService: VisualEvidenceReasoningService,
    private readonly imageAnalysisService: RealImageAnalysisService,
    private readonly offlineService: OfflineReasoningMobileResilienceService,
    private readonly access: WorkspaceGovernanceAccessService,
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

      // Suggest standards using the applicable standards service
      const source = this.scopeToSource(scopes);
      const suggestedStandards = await this.applicableStandards.suggest(
        fusedText,
        promotedPrimary.classification,
        source,
        5,
      );

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

      const intelligence = await this.intelligenceOrchestrator.evaluate({
        fusedText,
        promotedPrimary,
        classifierResult: result,
        evidenceTexts,
        visualAttachments,
        expandedContext: {},
        primaryStandardsResult: { suggestedStandards },
        generatedActions,
        additionalHazards: [],
        priorFindings,
        workspaceId: workspaceId || user?.workspaceId,
        supervisorValidations: [],
      });

      return {
          ...promotedPrimary,
          ...intelligence,
          suggestedStandards,
          generatedActions,
          fieldOutput: (intelligence as any).fieldOutput,
          semanticUnderstanding: (intelligence as any).semanticUnderstanding,
          semanticRouting: (intelligence as any).semanticRouting,
          decisionSupportMetadata: {
              semanticUnderstanding: (intelligence as any).semanticUnderstanding,
              semanticRouting: (intelligence as any).semanticRouting,
          }
      };
  }

  private scopeToSource(scopes?: string[]) {
    if (!scopes || scopes.length === 0 || scopes.includes("all"))
      return undefined;
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
          reasons.push('preferred MSHA Part 56');
        } else if (citation.startsWith('30 CFR 57.') || citation.startsWith('30 CFR 75.') || citation.startsWith('30 CFR 77.')) {
          scopeFit = 'mismatch';
          scopeFitAdjustment = -100;
          reasons.push('MSHA Part mismatch');
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
}
