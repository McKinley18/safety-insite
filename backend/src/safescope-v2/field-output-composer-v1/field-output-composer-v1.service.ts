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

    const isConflicting = weighting.evidenceGrade === 'conflicting';
    const isInsufficient = weighting.evidenceGrade === 'insufficient' || weighting.evidenceGrade === 'weak';
    const isMultiHazard = decomposition.isMultiHazard;

    // Use narrative summary for primary assessment
    let assessment = narrative.narrativeSummary;
    if (causalChain.primaryCausalChain.length > 0) {
        assessment += ' ' + causalChain.primaryCausalChain.join(' ');
    }

    // Determine actions based on strategy
    const immediateActions = strategy.immediateControls.length > 0 
        ? strategy.immediateControls.map(a => a.actionText)
        : isConflicting || isInsufficient
        ? ['Clarify observation facts', 'Restrict access if unsafe']
        : ['Review hazard information', 'Assess area safety'];

    const durableActions = strategy.permanentControls.length > 0
        ? strategy.permanentControls.map(a => a.actionText)
        : strategy.interimControls.length > 0
        ? strategy.interimControls.map(a => a.actionText)
        : ['Conduct full safety inspection'];

    const supervisorQuestions = [
        ...strategy.supervisorQuestions.map(q => q.actionText),
        ...strategy.verificationSteps.map(v => v.actionText)
    ];

    if (supervisorQuestions.length === 0) {
        supervisorQuestions.push('Has this been evaluated by a competent person?');
    }

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
          ...causalChain.missingCausalFacts
      ],
      supervisorQuestions: [...new Set(supervisorQuestions)],
      approvedKnowledgeReferences: retrieval.approvedKnowledgeMatches,
      draftKnowledgeWarnings: retrieval.draftKnowledgeWarnings,
      advisoryBoundaries: [narrative.advisoryBoundary, causalChain.advisoryBoundary, strategy.advisoryBoundary],
      reviewerRequired: true,
      cannotDeclareViolation: true,
      cannotCreateCitation: true,
    };
  }
}
