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
      fieldAssessment: retrieval.approvedKnowledgeMatches.length > 0 
        ? `Matches found in approved knowledge for: ${retrieval.approvedKnowledgeMatches.map(m => m.authority.title).join(', ')}` 
        : 'Observation indicates potential hazard. Review recommended.',
      whyItMatters: 'Hazard awareness is necessary for safety.',
      likelyMechanisms: retrieval.taxonomyRoute?.matchedSignals || [],
      immediateActions: ['Review hazard information', 'Assess area safety'],
      durableCorrectiveActions: retrieval.approvedKnowledgeMatches.map(m => m.correctiveActionLinks.preferredControlFamilies).flat(),
      evidenceGaps: retrieval.evidenceGaps,
      supervisorQuestions: retrieval.approvedKnowledgeMatches.length > 0 
        ? retrieval.approvedKnowledgeMatches.map(m => m.mapping.evidenceQuestions).flat()
        : ['Has this been evaluated by a competent person?'],
      approvedKnowledgeReferences: retrieval.approvedKnowledgeMatches,
      draftKnowledgeWarnings: retrieval.draftKnowledgeWarnings,
      advisoryBoundaries: ['SafeScope provides advisory information only. Requires human verification.'],
      reviewerRequired: true,
      cannotDeclareViolation: true,
      cannotCreateCitation: true,
    };
  }
}
