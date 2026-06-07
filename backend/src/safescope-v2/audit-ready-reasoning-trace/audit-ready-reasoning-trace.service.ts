import { Injectable } from '@nestjs/common';
import { 
  AuditReadyReasoningTraceInput, 
  AuditReadyReasoningTraceResult 
} from './audit-ready-reasoning-trace.types';

@Injectable()
export class AuditReadyReasoningTraceService {

  generateTrace(input: AuditReadyReasoningTraceInput): AuditReadyReasoningTraceResult {
    const { 
      observationText, 
      taxonomyRoute, 
      approvedKnowledgeMatches, 
      evaluatedScenarioMatches, 
      evidenceWeighting, 
      multiHazardAnalysis, 
      narrativeSynthesis, 
      causalChainAnalysis, 
      correctiveActionStrategy, 
      residualRiskVerification, 
      humanReviewFeedback, 
      sourceFreshness, 
      jurisdictionApplicability,
      context
    } = input;

    const traceId = `trace-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const generatedAt = new Date().toISOString();
    
    const primaryDecisionPath: string[] = [
        `Taxonomy routing to ${taxonomyRoute.domainId}`,
        `Jurisdiction identified as ${jurisdictionApplicability.primaryJurisdiction}`,
        `Evidence graded as ${evidenceWeighting.evidenceGrade}`,
        `Corrective action posture set to ${correctiveActionStrategy.actionPosture}`
    ];

    const sourceReasoning: string[] = approvedKnowledgeMatches.map(m => {
        const freshness = sourceFreshness[m.recordId];
        return `Record ${m.recordId}: ${m.authority.title} (${freshness?.freshnessStatus || 'unknown'}). Use restriction: ${freshness?.useRestriction || 'none'}.`;
    });

    const scenarioReasoning: string[] = evaluatedScenarioMatches.slice(0, 3).map(s => {
        return `Scenario ${s.scenarioId}: ${s.title} (Score: ${s.totalScore})`;
    });

    const confidenceModifiers: string[] = [];
    if (evidenceWeighting.contradictionPenalty > 0) confidenceModifiers.push(`Penalty for contradictions: -${evidenceWeighting.contradictionPenalty}`);
    if (evidenceWeighting.missingFactPenalty > 0) confidenceModifiers.push(`Penalty for missing facts: -${evidenceWeighting.missingFactPenalty}`);
    
    Object.values(sourceFreshness).forEach(f => {
        if (f.confidenceImpact < 0) confidenceModifiers.push(`Source freshness impact: ${f.confidenceImpact}`);
    });
    if (residualRiskVerification.confidenceAdjustment !== 0) {
        confidenceModifiers.push(`Risk verification adjustment: ${residualRiskVerification.confidenceAdjustment}`);
    }

    const humanReviewGates: string[] = [];
    if (jurisdictionApplicability.humanReviewRequired) humanReviewGates.push('Jurisdiction ambiguity requiring manual confirmation.');
    if (evidenceWeighting.evidenceGrade === 'conflicting') humanReviewGates.push('Contradictory evidence requiring verification.');
    if (multiHazardAnalysis.isMultiHazard) humanReviewGates.push('Multi-hazard complexity requiring per-hazard review.');

    // Add learning candidate info to gates if relevant
    if (humanReviewFeedback && humanReviewFeedback.learningDisposition !== 'accept_no_learning_needed') {
        humanReviewGates.push(`Learning candidate created: ${humanReviewFeedback.learningDisposition}`);
    }

    const reviewerChecklist: string[] = [
        ...evidenceWeighting.reviewerQuestions,
        ...jurisdictionApplicability.reviewerQuestions,
        ...residualRiskVerification.reviewerQuestions
    ];

    return {
      traceVersion: 'v1',
      traceId,
      generatedAt,
      observationSummary: observationText,
      primaryDecisionPath,
      supportingEvidence: evidenceWeighting.supportingSignals,
      weakeningEvidence: evidenceWeighting.weakeningSignals,
      missingCriticalFacts: evidenceWeighting.missingCriticalFacts,
      detectedContradictions: evidenceWeighting.detectedContradictions,
      jurisdictionReasoning: jurisdictionApplicability.reasoningSummary,
      sourceReasoning,
      scenarioReasoning,
      causalChainReasoning: causalChainAnalysis.primaryCausalChain,
      correctiveActionReasoning: correctiveActionStrategy.rankingRationale.join('; '),
      residualRiskReasoning: residualRiskVerification.residualRiskReasons.join('; '),
      confidenceModifiers,
      rejectedAlternatives: jurisdictionApplicability.conflictingJurisdictionSignals,
      humanReviewGates,
      advisoryBoundary: 'SafeScope audit trace is for informational and audit purposes only.',
      safeScopeLimitations: [
          'Deterministic text analysis based on limited dictionary',
          'Advisory-only boundary strictly maintained',
          'Requires qualified human review for all high-risk determinations'
      ],
      reviewerChecklist: [...new Set(reviewerChecklist)]
    };
  }
}
