import { Injectable } from '@nestjs/common';
import { FieldOutputV1 } from './field-output-composer-v1.types';
import { ApprovedKnowledgeRetrievalOutputV1Service } from '../approved-knowledge-retrieval-output-v1/approved-knowledge-retrieval-output-v1.service';

@Injectable()
export class FieldOutputComposerV1Service {
  private retrievalService = new ApprovedKnowledgeRetrievalOutputV1Service();

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

    // 3. Add Feedback Learning Disposition if present
    if (feedback) {
        assessment += ` [Review Result: ${feedback.learningDisposition}]`;
    }

    // 4. Source Freshness Warnings
    const freshnessWarnings: string[] = [];
    Object.values(freshness).forEach(res => {
        freshnessWarnings.push(...res.sourceWarnings);
    });

    // 5. Determine actions based on strategy and verification
    const immediateActions = [
        ...strategy.immediateControls.map(a => a.actionText),
        ...verification.additionalControlsNeeded
    ];

    if (immediateActions.length === 0) {
        if (isConflicting || isInsufficient) {
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
        ...verification.verificationSteps
    ];

    Object.values(freshness).forEach(res => {
        supervisorQuestions.push(...res.updateQuestions);
    });

    if (supervisorQuestions.length === 0) {
        supervisorQuestions.push('Has this been evaluated by a competent person?');
    }

    // 6. Add Warnings
    const warnings = [
        ...retrieval.draftKnowledgeWarnings,
        ...verification.weakActionWarnings,
        ...freshnessWarnings
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
          ...verification.residualRiskReasons
      ],
      supervisorQuestions: [...new Set(supervisorQuestions)],
      approvedKnowledgeReferences: retrieval.approvedKnowledgeMatches,
      draftKnowledgeWarnings: [...new Set(warnings)],
      advisoryBoundaries: [
          narrative.advisoryBoundary, 
          causalChain.advisoryBoundary, 
          strategy.advisoryBoundary,
          verification.advisoryBoundary
      ],
      reviewerRequired: true,
      cannotDeclareViolation: true,
      cannotCreateCitation: true,
    };
  }
}
