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

    const isConflicting = weighting.evidenceGrade === 'conflicting';
    const isInsufficient = weighting.evidenceGrade === 'insufficient' || weighting.evidenceGrade === 'weak';
    const isMultiHazard = decomposition.isMultiHazard;

    // Use narrative summary for primary assessment if available and clean
    let assessment = narrative.narrativeSummary;
    
    return {
      version: 'v1',
      observationSummary: observationText,
      primaryDomain: retrieval.taxonomyRoute?.domainId || 'unknown',
      confidence: retrieval.confidence,
      fieldAssessment: assessment,
      whyItMatters: narrative.primaryConcern + ' ' + (narrative.secondaryConcerns.join(' ')),
      likelyMechanisms: [...(retrieval.taxonomyRoute?.matchedSignals || []), 
                         ...(retrieval.topScenario?.matchedSignals || [])],
      immediateActions: isConflicting
        ? ['Clarify observation facts', 'Restrict access if unsafe']
        : isMultiHazard
        ? ['Analyze each hazard independently', 'Prioritize by risk level', 'Review area safety']
        : isInsufficient
        ? ['Clarify observation facts', 'Restrict access if unsafe']
        : [...new Set(['Review hazard information', 'Assess area safety', 
                                    ...(retrieval.topScenario?.recommendedReviewerQuestions || [])])],
      durableCorrectiveActions: isConflicting || isInsufficient
        ? ['Conduct full safety inspection']
        : [...new Set([...(retrieval.approvedKnowledgeMatches.map(m => m.mapping.evidenceQuestions).flat())])],
      evidenceGaps: retrieval.evidenceGaps,
      supervisorQuestions: isConflicting 
        ? weighting.reviewerQuestions
        : (retrieval.topScenario?.recommendedReviewerQuestions || ['Has this been evaluated by a competent person?']),
      approvedKnowledgeReferences: retrieval.approvedKnowledgeMatches,
      draftKnowledgeWarnings: retrieval.draftKnowledgeWarnings,
      advisoryBoundaries: [narrative.advisoryBoundary],
      reviewerRequired: true,
      cannotDeclareViolation: true,
      cannotCreateCitation: true,
    };
  }
}
