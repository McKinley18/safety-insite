import { Injectable } from '@nestjs/common';
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

@Injectable()
export class ApprovedKnowledgeRetrievalOutputV1Service {
  private taxonomyService = new HazardTaxonomyCoverageService();
  private searchService = new ApprovedKnowledgeRegistrySearchService();
  private scenarioService = new ScenarioExpansionService();
  private evaluationService = new ScenarioEvaluationService();
  private evidenceWeightingService = new FieldEvidenceWeightingService();
  private decompositionService = new MultiHazardDecompositionService();
  private narrativeService = new ObservationNarrativeSynthesisService();
  private causalChainService = new CrossDomainCausalChainService();
  private strategyService = new CorrectiveActionStrategyRankingService();
  private riskVerificationService = new RiskVerificationResidualRiskService();
  private feedbackService = new HumanReviewFeedbackLoopService();
  private freshnessService = new SourceFreshnessGovernanceService();
  private jurisdictionService = new JurisdictionApplicabilityDecisionTreeService();
  private traceService = new AuditReadyReasoningTraceService();
  private consoleService = new ReviewerCandidateConsoleService();
  private semanticService = new SemanticSynonymExpansionService();
  private visualService = new VisualEvidenceReasoningService();

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
        attachments: context.attachments || [],
        context
    });

    let reviewFeedback = undefined;
    if (context.humanReview) {
        reviewFeedback = this.feedbackService.processReview({
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
        });
    }

    const pendingReviewerCandidates = this.consoleService.listCandidates({
        domainId: taxonomyRoute.domainId,
        status: 'pending_review'
    });

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
        visualEvidenceReasoning: visualEvidenceReasoning as any
    } as any);

    const draftKnowledgeWarnings = approvedMatches.length === 0 && taxonomyRoute.requiresHumanReview 
        ? ['No approved matches found. Information requires human review.'] 
        : [];

    // Calculate freshness impact
    let freshnessConfidenceImpact = 0;
    Object.values(sourceFreshnessGovernanceResults).forEach((res: any) => {
        freshnessConfidenceImpact += res.confidenceImpact;
    });

    // Calculate visual impact
    let visualConfidenceModifier = 0;
    if (visualEvidenceReasoning.confidenceImpact === 'boost') visualConfidenceModifier = 0.1;
    if (visualEvidenceReasoning.confidenceImpact === 'downgrade') visualConfidenceModifier = -0.1;
    if (visualEvidenceReasoning.confidenceImpact === 'block_confident_language') visualConfidenceModifier = -0.3;

    return {
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
      advisoryBoundaries: ['SafeScope provides advisory information only. Requires human verification.'],
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
  }
}
