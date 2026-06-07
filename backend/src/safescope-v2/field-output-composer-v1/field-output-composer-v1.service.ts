import { Injectable, Optional } from '@nestjs/common';
import { FieldOutputV1 } from './field-output-composer-v1.types';
import { ApprovedKnowledgeRetrievalOutputV1Service } from '../approved-knowledge-retrieval-output-v1/approved-knowledge-retrieval-output-v1.service';

@Injectable()
export class FieldOutputComposerV1Service {
  private retrievalService: ApprovedKnowledgeRetrievalOutputV1Service;

  constructor(
    @Optional()
    retrievalService?: ApprovedKnowledgeRetrievalOutputV1Service,
  ) {
      this.retrievalService = retrievalService || new ApprovedKnowledgeRetrievalOutputV1Service();
  }

  async compose(
    observationText: string,
    context: any = {}
  ): Promise<FieldOutputV1> {
    const retrieval = await this.retrievalService.retrieve(observationText, context);
    const weighting = retrieval.evidenceWeighting;
    const decomposition = retrieval.multiHazardDecomposition;
    const narrative = retrieval.observationNarrative;
    const causalChain = retrieval.crossDomainCausalChain;
    const strategy = retrieval.correctiveActionStrategy;
    const verification = retrieval.riskVerification;
    const feedback = retrieval.reviewFeedback;
    const freshness = retrieval.sourceFreshnessGovernanceResults;
    const jurisdiction = retrieval.jurisdictionApplicability;
    const trace = retrieval.auditReadyReasoningTrace;
    const visual = retrieval.visualEvidenceReasoning;
    const realImage = retrieval.realImageAnalysis;

    const isConflicting = weighting.evidenceGrade === 'conflicting';
    const isInsufficient = weighting.evidenceGrade === 'insufficient' || weighting.evidenceGrade === 'weak';
    const isMultiHazard = decomposition.isMultiHazard;

    // 1. Primary Assessment Narrative
    let assessment = narrative.narrativeSummary;
    if (causalChain.primaryCausalChain.length > 0) {
        assessment += ' ' + causalChain.primaryCausalChain.join(' ');
    }
    
    // 2. Add Risk Verification / Residual Risk Status
    if (verification.verificationStatus === 'residual_risk_remaining') {
        assessment += ' RESIDUAL RISK REMAINS: ' + verification.residualRiskReasons.join(' ');
    } else if (verification.verificationStatus === 'escalation_required') {
        assessment += ' ESCALATION REQUIRED: Assessment cannot proceed without qualified site review.';
    }

    // 3. Add Jurisdiction Caution
    if (jurisdiction.primaryJurisdiction === 'unclear' || jurisdiction.primaryJurisdiction === 'mixed') {
        assessment += ` [JURISDICTION CAUTION: ${jurisdiction.reasoningSummary}]`;
    } else if (jurisdiction.primaryJurisdiction === 'company_policy_only') {
        assessment += ' [NOTICE: Assessment based on company policy only.]';
    }

    // 4. Add Visual Evidence Status
    if (visual.visualSupportLevel === 'conflicting' || realImage.visualConfidenceImpact === 'downgrade' || realImage.visualConfidenceImpact === 'block') {
        assessment += ' [VISUAL CONFLICT DETECTED: Attached evidence contradicts observation text.]';
    } else if (visual.visualSupportLevel === 'insufficient' && visual.evidencePresence !== 'none') {
        assessment += ' [NOTICE: Attached evidence provides insufficient support for this hazard type.]';
    }

    if (realImage.visualSignals.length > 0) {
        const concerns = realImage.visualSignals.filter(s => s.support === 'adds_new_concern');
        if (concerns.length > 0) {
            assessment += ` [VISION DISCOVERY: Potential additional concerns identified: ${concerns.map(c => c.signal).join(', ')}]`;
        }
    }

    // 5. Add Feedback Learning Disposition if present
    if (feedback) {
        assessment += ` [Review Result: ${feedback.learningDisposition}]`;
    }
    
    // 6. Audit Trace Summary
    assessment += ` (Trace ID: ${trace.traceId})`;

    // 7. Source Freshness Warnings
    const freshnessWarnings: string[] = [];
    Object.values(freshness).forEach((res: any) => {
        freshnessWarnings.push(...res.sourceWarnings);
    });

    // 8. Determine actions based on strategy and verification
    const immediateActions = [
        ...strategy.immediateControls.map(a => a.actionText),
        ...verification.additionalControlsNeeded
    ];

    if (immediateActions.length === 0) {
        if (isConflicting || isInsufficient || visual.visualSupportLevel === 'conflicting' || realImage.visualConfidenceImpact === 'block') {
            immediateActions.push('Clarify observation facts', 'Restrict access if unsafe');
        } else {
            immediateActions.push('Review hazard information', 'Assess area safety');
        }
    }

    const durableActions = [
        ...strategy.permanentControls.map(a => a.actionText),
        ...strategy.interimControls.map(a => a.actionText)
    ];

    if (durableActions.length === 0) {
        durableActions.push('Conduct full safety inspection');
    }

    const supervisorQuestions = [
        ...strategy.supervisorQuestions.map(q => q.actionText),
        ...strategy.verificationSteps.map(v => v.actionText),
        ...verification.reviewerQuestions,
        ...verification.verificationSteps,
        ...jurisdiction.reviewerQuestions,
        ...visual.reviewerQuestions,
        ...realImage.recommendedPhotoFollowups,
        ...trace.reviewerChecklist
    ];

    Object.values(freshness).forEach((res: any) => {
        supervisorQuestions.push(...res.updateQuestions);
    });

    if (supervisorQuestions.length === 0) {
        supervisorQuestions.push('Has this been evaluated by a competent person?');
    }

    // 9. Add Warnings
    const warnings = [
        ...retrieval.draftKnowledgeWarnings,
        ...verification.weakActionWarnings,
        ...freshnessWarnings,
        ...visual.visualConsistencyFlags
    ];

    return {
      version: 'v1',
      observationSummary: observationText,
      primaryDomain: retrieval.taxonomyRoute?.domainId || 'unknown',
      confidence: retrieval.confidence,
      fieldAssessment: assessment,
      whyItMatters: narrative.primaryConcern + ' ' + (narrative.secondaryConcerns.join(' ')),
      likelyMechanisms: [...new Set([
          ...(retrieval.taxonomyRoute?.matchedSignals || []), 
          ...(retrieval.topScenario?.matchedSignals || []),
          ...causalChain.plausibleInjuryMechanisms
      ])],
      immediateActions: [...new Set(immediateActions)],
      durableCorrectiveActions: [...new Set(durableActions)],
      evidenceGaps: [
          ...retrieval.evidenceGaps,
          ...causalChain.missingCausalFacts,
          ...verification.residualRiskReasons,
          ...jurisdiction.missingJurisdictionFacts,
          ...visual.missingVisualEvidence
      ],
      supervisorQuestions: [...new Set(supervisorQuestions)],
      approvedKnowledgeReferences: retrieval.approvedKnowledgeMatches.filter(m => !jurisdiction.blockedKnowledgeScopes.includes(m.recordId)),
      draftKnowledgeWarnings: [...new Set(warnings)],
      advisoryBoundaries: [
          narrative.advisoryBoundary, 
          causalChain.advisoryBoundary, 
          strategy.advisoryBoundary,
          verification.advisoryBoundary,
          jurisdiction.advisoryBoundary,
          trace.advisoryBoundary,
          visual.advisoryBoundary
      ],
      reviewerRequired: true,
      cannotDeclareViolation: true,
      cannotCreateCitation: true,
    };
  }
}
