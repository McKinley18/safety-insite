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

    return {
      version: 'v1',
      observationSummary: observationText,
      primaryDomain: retrieval.taxonomyRoute?.domainId || 'unknown',
      confidence: retrieval.confidence,
      fieldAssessment: retrieval.topScenario 
        ? `Scenario identified: ${retrieval.topScenario.title}`
        : 'Observation indicates potential hazard. Review recommended.',
      whyItMatters: retrieval.topScenario?.reasoningSummary || 'Hazard awareness is necessary for safety.',
      likelyMechanisms: [...(retrieval.taxonomyRoute?.matchedSignals || []), 
                         ...(retrieval.topScenario?.matchedSignals || [])],
      immediateActions: [...new Set(['Review hazard information', 'Assess area safety', 
                                    ...(retrieval.topScenario?.recommendedReviewerQuestions || [])])],
      durableCorrectiveActions: [...new Set([...(retrieval.approvedKnowledgeMatches.map(m => m.correctiveActionLinks.preferredControlFamilies).flat())])],
      evidenceGaps: retrieval.evidenceGaps,
      supervisorQuestions: retrieval.topScenario?.recommendedReviewerQuestions || ['Has this been evaluated by a competent person?'],
      approvedKnowledgeReferences: retrieval.approvedKnowledgeMatches,
      draftKnowledgeWarnings: retrieval.draftKnowledgeWarnings,
      advisoryBoundaries: ['SafeScope provides advisory information only. Requires human verification.'],
      reviewerRequired: true,
      cannotDeclareViolation: true,
      cannotCreateCitation: true,
    };
  }
}
