import { Injectable, Optional } from '@nestjs/common';
import { RetrievalOutput } from './approved-knowledge-retrieval-output-v1.types';
import { HazardTaxonomyCoverageService } from '../hazard-taxonomy-coverage/hazard-taxonomy-coverage.service';
import { ApprovedKnowledgeRegistrySearchService } from '../approved-knowledge-registry/approved-knowledge-registry-search.service';
import { ScenarioExpansionService } from '../scenario-expansion/scenario-expansion.service';
import { ScenarioEvaluationService } from '../scenario-evaluation/scenario-evaluation.service';
import { FieldEvidenceWeightingService } from '../field-evidence-weighting/field-evidence-weighting.service';
import { MultiHazardDecompositionService } from '../multi-hazard-decomposition/multi-hazard-decomposition.service';
import { ObservationNarrativeSynthesisService } from '../observation-narrative-synthesis/observation-narrative-synthesis.service';
import { CrossDomainCausalChainService } from '../cross-domain-causal-chain/cross-domain-causal-chain.service';
import { CorrectiveActionStrategyRankingService } from '../corrective-action-strategy-ranking/corrective-action-strategy-ranking.service';
import { RiskVerificationResidualRiskService } from '../risk-verification-residual-risk/risk-verification-residual-risk.service';
import { HumanReviewFeedbackLoopService } from '../human-review-feedback-loop/human-review-feedback-loop.service';
import { SourceFreshnessGovernanceService } from '../source-freshness-governance/source-freshness-governance.service';
import { JurisdictionApplicabilityDecisionTreeService } from '../jurisdiction-applicability-decision-tree/jurisdiction-applicability-decision-tree.service';
import { AuditReadyReasoningTraceService } from '../audit-ready-reasoning-trace/audit-ready-reasoning-trace.service';
import { ReviewerCandidateConsoleService } from '../reviewer-candidate-console/reviewer-candidate-console.service';
import { SemanticSynonymExpansionService } from '../semantic-synonym-expansion/semantic-synonym-expansion.service';
import { VisualEvidenceReasoningService } from '../visual-evidence-reasoning/visual-evidence-reasoning.service';
import { RealImageAnalysisService } from '../real-image-analysis/real-image-analysis.service';
import { SafeScopePersistenceService } from '../persistence/persistence.service';
import { RoleBasedApprovalGatesService } from '../role-based-approval-gates/role-based-approval-gates.service';
import { WorkspaceGovernanceAccessService } from '../workspace-governance-access/workspace-governance-access.service';

@Injectable()
export class ApprovedKnowledgeRetrievalOutputV1Service {
  private _taxonomyService?: HazardTaxonomyCoverageService;
  private _searchService?: ApprovedKnowledgeRegistrySearchService;
  private _scenarioService?: ScenarioExpansionService;
  private _evaluationService?: ScenarioEvaluationService;
  private _evidenceWeightingService?: FieldEvidenceWeightingService;
  private _decompositionService?: MultiHazardDecompositionService;
  private _narrativeService?: ObservationNarrativeSynthesisService;
  private _causalChainService?: CrossDomainCausalChainService;
  private _strategyService?: CorrectiveActionStrategyRankingService;
  private _riskVerificationService?: RiskVerificationResidualRiskService;
  private _feedbackService?: HumanReviewFeedbackLoopService;
  private _freshnessService?: SourceFreshnessGovernanceService;
  private _jurisdictionService?: JurisdictionApplicabilityDecisionTreeService;
  private _traceService?: AuditReadyReasoningTraceService;
  private _consoleService?: ReviewerCandidateConsoleService;
  private _semanticService?: SemanticSynonymExpansionService;
  private _visualService?: VisualEvidenceReasoningService;
  private _imageAnalysisService?: RealImageAnalysisService;

  constructor(
    @Optional()
    private readonly persistence?: SafeScopePersistenceService,
    @Optional()
    private readonly gates?: RoleBasedApprovalGatesService,
    @Optional()
    private readonly access?: WorkspaceGovernanceAccessService,
  ) {
      const p = persistence || new SafeScopePersistenceService();
      const g = gates || new RoleBasedApprovalGatesService();
      const a = access || new WorkspaceGovernanceAccessService();
      this.persistence = p;
  }

  private get taxonomyService() {
    return (this._taxonomyService ??= new HazardTaxonomyCoverageService());
  }

  private get searchService() {
    return (this._searchService ??= new ApprovedKnowledgeRegistrySearchService());
  }

  private get scenarioService() {
    return (this._scenarioService ??= new ScenarioExpansionService());
  }

  private get evaluationService() {
    return (this._evaluationService ??= new ScenarioEvaluationService());
  }

  private get evidenceWeightingService() {
    return (this._evidenceWeightingService ??= new FieldEvidenceWeightingService());
  }

  private get decompositionService() {
    return (this._decompositionService ??= new MultiHazardDecompositionService());
  }

  private get narrativeService() {
    return (this._narrativeService ??= new ObservationNarrativeSynthesisService());
  }

  private get causalChainService() {
    return (this._causalChainService ??= new CrossDomainCausalChainService());
  }

  private get strategyService() {
    return (this._strategyService ??= new CorrectiveActionStrategyRankingService());
  }

  private get riskVerificationService() {
    return (this._riskVerificationService ??= new RiskVerificationResidualRiskService());
  }

  private get freshnessService() {
    return (this._freshnessService ??= new SourceFreshnessGovernanceService());
  }

  private get jurisdictionService() {
    return (this._jurisdictionService ??= new JurisdictionApplicabilityDecisionTreeService());
  }

  private get traceService() {
    return (this._traceService ??= new AuditReadyReasoningTraceService());
  }

  private get consoleService() {
    if (!this._consoleService) {
      const p = this.persistence || new SafeScopePersistenceService();
      const g = this.gates || new RoleBasedApprovalGatesService();
      const a = this.access || new WorkspaceGovernanceAccessService();
      this._consoleService = new ReviewerCandidateConsoleService(p, g, a);
    }
    return this._consoleService;
  }

  private get feedbackService() {
    if (!this._feedbackService) {
      const p = this.persistence || new SafeScopePersistenceService();
      const g = this.gates || new RoleBasedApprovalGatesService();
      const a = this.access || new WorkspaceGovernanceAccessService();
      this._feedbackService = new HumanReviewFeedbackLoopService(this.consoleService, p, g, a);
    }
    return this._feedbackService;
  }

  private get semanticService() {
    return (this._semanticService ??= new SemanticSynonymExpansionService());
  }

  private get visualService() {
    return (this._visualService ??= new VisualEvidenceReasoningService());
  }

  private get imageAnalysisService() {
    return (this._imageAnalysisService ??= new RealImageAnalysisService());
  }

  async retrieve(
    observationText: string,
    context: any = {}
  ): Promise<RetrievalOutput> {
    
    const taxonomyRoute = this.taxonomyService.route(observationText);
    const approvedMatches = this.searchService.search({
      domainId: taxonomyRoute.domainId,
      text: observationText
    });
    
    const scenarioMatches = this.scenarioService.search({
        domainId: taxonomyRoute.domainId,
        text: observationText
    });
    
    const evaluation = await this.evaluationService.evaluate(observationText, scenarioMatches, context);
    
    const evidenceWeighting = this.evidenceWeightingService.evaluate({
        observationText,
        taxonomyRoute,
        approvedKnowledgeMatches: approvedMatches,
        evaluatedScenarioMatches: evaluation.evaluatedScenarios,
        context
    });

    const multiHazardDecomposition = this.decompositionService.decompose(observationText, context);

    const observationNarrative = await this.narrativeService.synthesize({
        observationText,
        taxonomyRoute,
        approvedKnowledgeMatches: approvedMatches,
        scenarioMatches: scenarioMatches,
        evaluatedScenarios: evaluation.evaluatedScenarios,
        evidenceWeighting: evidenceWeighting,
        multiHazardAnalysis: multiHazardDecomposition,
        context
    });

    const crossDomainCausalChain = this.causalChainService.analyze({
        observationText,
        multiHazardDecomposition,
        evidenceWeighting
    });

    const correctiveActionStrategy = this.strategyService.rank({
        observationText,
        taxonomyRoute,
        approvedKnowledgeMatches: approvedMatches,
        scenarioMatches: scenarioMatches,
        evaluatedScenarios: evaluation.evaluatedScenarios,
        evidenceWeighting: evidenceWeighting,
        multiHazardAnalysis: multiHazardDecomposition,
        narrativeSynthesis: observationNarrative,
        causalChainAnalysis: crossDomainCausalChain,
        context
    });

    const riskVerification = this.riskVerificationService.evaluate({
        observationText,
        hazardRoute: taxonomyRoute,
        evidenceWeighting,
        multiHazardAnalysis: multiHazardDecomposition,
        causalChains: crossDomainCausalChain,
        correctiveActionStrategy,
        proposedActions: context.proposedActions,
        completedActions: context.completedActions,
        context
    });

    const sourceFreshnessGovernanceResults: Record<string, any> = {};
    approvedMatches.forEach(match => {
        sourceFreshnessGovernanceResults[match.recordId] = this.freshnessService.evaluate(match.authority);
    });

    const jurisdictionApplicability = this.jurisdictionService.evaluate({
        observationText,
        taxonomyRoute,
        approvedKnowledgeMatches: approvedMatches,
        sourceFreshnessResults: sourceFreshnessGovernanceResults,
        context
    });

    const semanticSynonymExpansion = this.semanticService.expand({
        observationText,
        taxonomyRoute,
        context,
        jurisdictionAssessment: jurisdictionApplicability,
        evidenceWeighting,
        multiHazardAnalysis: multiHazardDecomposition
    });

    const visualEvidenceReasoning = this.visualService.evaluate({
        observationText,
        taxonomyRoute,
        evidenceWeighting,
        multiHazardAnalysis: multiHazardDecomposition,
        semanticSynonymExpansion,
        attachments: context.visualAttachments || context.attachments || [],
        context
    });

    const realImageAnalysis = this.imageAnalysisService.evaluate({
        observationText,
        imageInputs: context.visualAttachments || context.attachments || []
    });


    const pendingReviewerCandidates = await this.consoleService.listCandidates({
        domainId: taxonomyRoute.domainId,
        status: 'pending_review'
    }, context.user);

    let reviewFeedback = undefined;
    if (context.humanReview) {
        reviewFeedback = await this.feedbackService.processReview({
            observationText,
            originalRetrievalOutput: undefined, 
            originalFieldOutput: undefined,
            reviewerRole: context.humanReview.reviewerRole || 'unknown',
            reviewerDecision: context.humanReview.reviewerDecision || 'accepted',
            reviewerNotes: context.humanReview.reviewerNotes,
            correctedHazardFamily: context.humanReview.correctedHazardFamily,
            correctedMechanism: context.humanReview.correctedMechanism,
            correctedActions: context.humanReview.correctedActions,
            missingEvidenceNotes: context.humanReview.missingEvidenceNotes,
            sourceReference: context.humanReview.sourceReference,
            context
        }, context.user);
    }

    const auditReadyReasoningTrace = this.traceService.generateTrace({
        observationText,
        taxonomyRoute,
        approvedKnowledgeMatches: approvedMatches,
        evaluatedScenarioMatches: evaluation.evaluatedScenarios,
        evidenceWeighting,
        multiHazardAnalysis: multiHazardDecomposition,
        narrativeSynthesis: observationNarrative,
        causalChainAnalysis: crossDomainCausalChain,
        correctiveActionStrategy,
        residualRiskVerification: riskVerification,
        humanReviewFeedback: reviewFeedback,
        sourceFreshness: sourceFreshnessGovernanceResults,
        jurisdictionApplicability,
        context,
        semanticSynonymExpansion: semanticSynonymExpansion as any,
        visualEvidenceReasoning: visualEvidenceReasoning as any,
        realImageAnalysis: realImageAnalysis as any
    } as any);

    const draftKnowledgeWarnings = approvedMatches.length === 0 && taxonomyRoute.requiresHumanReview 
        ? ['No approved matches found. Information requires human review.'] 
        : [];

    let freshnessConfidenceImpact = 0;
    Object.values(sourceFreshnessGovernanceResults).forEach((res: any) => {
        freshnessConfidenceImpact += res.confidenceImpact;
    });

    let visualConfidenceModifier = 0;
    if (visualEvidenceReasoning.confidenceImpact === 'boost') visualConfidenceModifier = 0.1;
    if (visualEvidenceReasoning.confidenceImpact === 'downgrade') visualConfidenceModifier = -0.1;
    if (visualEvidenceReasoning.confidenceImpact === 'block_confident_language') visualConfidenceModifier = -0.3;

    const result: RetrievalOutput = {
      version: 'v1',
      observationSummary: observationText,
      taxonomyRoute: taxonomyRoute,
      approvedKnowledgeMatches: approvedMatches,
      scenarioMatches: scenarioMatches,
      evaluatedScenarios: evaluation.evaluatedScenarios,
      topScenario: evaluation.topScenario,
      evidenceWeighting: evidenceWeighting,
      multiHazardDecomposition: multiHazardDecomposition,
      observationNarrative: observationNarrative,
      crossDomainCausalChain: crossDomainCausalChain,
      correctiveActionStrategy: correctiveActionStrategy,
      riskVerification: riskVerification,
      sourceFreshnessGovernanceResults,
      jurisdictionApplicability,
      auditReadyReasoningTrace,
      semanticSynonymExpansion,
      visualEvidenceReasoning,
      realImageAnalysis,
      pendingReviewerCandidates,
      reviewFeedback,
      draftKnowledgeWarnings: draftKnowledgeWarnings,
      applicabilityAssessment: approvedMatches.length > 0 ? 'supported' : 'advisory_only',
      confidence: Math.max(0, Math.min(1.0, 
        Math.min(taxonomyRoute.confidence, (evidenceWeighting.finalEvidenceConfidence / 10)) + 
        riskVerification.confidenceAdjustment + 
        freshnessConfidenceImpact +
        (semanticSynonymExpansion.semanticConfidenceScore * 0.1) +
        visualConfidenceModifier
      )),
      evidenceGaps: [
          ...evidenceWeighting.missingCriticalFacts,
          ...riskVerification.residualRiskReasons,
          ...jurisdictionApplicability.missingJurisdictionFacts,
          ...visualEvidenceReasoning.missingVisualEvidence,
          ...(approvedMatches.length === 0 ? ['Insufficient evidence for definitive assessment.'] : [])
      ],
      advisoryBoundaries: ['HazLenz AI provides advisory information only. Requires human verification.'],
      recommendedReviewerActions: [
          ...evidenceWeighting.reviewerQuestions,
          ...crossDomainCausalChain.reviewerQuestions,
          ...riskVerification.reviewerQuestions,
          ...jurisdictionApplicability.reviewerQuestions,
          ...semanticSynonymExpansion.reviewerQuestions,
          ...visualEvidenceReasoning.reviewerQuestions,
          'Verify categorization', 
          'Review evidence sufficiency'
      ],
      fieldOutputNotes: 'Output generated as advisory, source-backed analysis.'
    };

    if (context.persist && this.persistence) {
        await this.persistence.save({
            type: 'reasoning_trace_snapshot',
            status: 'active',
            payload: auditReadyReasoningTrace,
            metadata: { observationText },
            workspaceId: context.workspaceId,
            inspectionId: context.inspectionId,
            observationId: context.observationId,
            traceId: auditReadyReasoningTrace.traceId
        });

        await this.persistence.save({
            type: 'visual_evidence_snapshot',
            status: 'active',
            payload: visualEvidenceReasoning,
            metadata: { observationText },
            workspaceId: context.workspaceId,
            inspectionId: context.inspectionId,
            observationId: context.observationId
        });

        await this.persistence.save({
            type: 'real_image_analysis_snapshot',
            status: 'active',
            payload: realImageAnalysis,
            metadata: { observationText },
            workspaceId: context.workspaceId,
            inspectionId: context.inspectionId,
            observationId: context.observationId
        });
    }

    return result;
  }
}
