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

    const isConflicting = weighting.evidenceGrade === 'conflicting';
    const isInsufficient = weighting.evidenceGrade === 'insufficient' || weighting.evidenceGrade === 'weak';

    let assessment = retrieval.topScenario 
        ? `Scenario identified: ${retrieval.topScenario.title}`
        : 'Observation indicates potential hazard. Review recommended.';
    
    if (isConflicting) {
        assessment = `Evidence conflict detected: ${weighting.detectedContradictions.join('; ')}. Qualified review required before assessment.`;
    } else if (isInsufficient) {
        assessment = `Limited evidence provided. ${weighting.missingCriticalFacts.join(' ')} Qualified review required.`;
    }

    return {
      version: 'v1',
      observationSummary: observationText,
      primaryDomain: retrieval.taxonomyRoute?.domainId || 'unknown',
      confidence: retrieval.confidence,
      fieldAssessment: assessment,
      whyItMatters: retrieval.topScenario?.reasoningSummary || 'Hazard awareness is necessary for safety.',
      likelyMechanisms: [...(retrieval.taxonomyRoute?.matchedSignals || []), 
                         ...(retrieval.topScenario?.matchedSignals || [])],
      immediateActions: isConflicting || isInsufficient
        ? ['Clarify observation facts', 'Restrict access if unsafe']
        : [...new Set(['Review hazard information', 'Assess area safety', 
                                    ...(retrieval.topScenario?.recommendedReviewerQuestions || [])])],
      durableCorrectiveActions: isConflicting || isInsufficient
        ? ['Conduct full safety inspection']
        : [...new Set([...(retrieval.approvedKnowledgeMatches.map(m => m.correctiveActionLinks.preferredControlFamilies).flat())])],
      evidenceGaps: retrieval.evidenceGaps,
      supervisorQuestions: isConflicting 
        ? weighting.reviewerQuestions
        : (retrieval.topScenario?.recommendedReviewerQuestions || ['Has this been evaluated by a competent person?']),
      approvedKnowledgeReferences: retrieval.approvedKnowledgeMatches,
      draftKnowledgeWarnings: retrieval.draftKnowledgeWarnings,
      advisoryBoundaries: ['SafeScope provides advisory information only. Requires human verification.'],
      reviewerRequired: true,
      cannotDeclareViolation: true,
      cannotCreateCitation: true,
    };
  }
}
