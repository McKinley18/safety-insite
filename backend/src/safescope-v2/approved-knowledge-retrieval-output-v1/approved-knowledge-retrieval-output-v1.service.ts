import { Injectable } from '@nestjs/common';
import { RetrievalOutput } from './approved-knowledge-retrieval-output-v1.types';
import { HazardTaxonomyCoverageService } from '../hazard-taxonomy-coverage/hazard-taxonomy-coverage.service';

@Injectable()
export class ApprovedKnowledgeRetrievalOutputV1Service {
  private taxonomyService = new HazardTaxonomyCoverageService();

  async retrieve(
    observationText: string,
    context: any = {}
  ): Promise<RetrievalOutput> {
    
    const taxonomyRoute = this.taxonomyService.route(observationText);

    return {
      version: 'v1',
      observationSummary: observationText,
      taxonomyRoute: taxonomyRoute,
      approvedKnowledgeMatches: [],
      draftKnowledgeWarnings: taxonomyRoute.requiresHumanReview ? ['This information requires human review.'] : [],
      applicabilityAssessment: 'advisory_only',
      confidence: taxonomyRoute.confidence,
      evidenceGaps: ['Insufficient evidence for definitive assessment.'],
      advisoryBoundaries: ['SafeScope provides advisory information only. Requires human verification.'],
      recommendedReviewerActions: ['Verify categorization', 'Review evidence sufficiency'],
      fieldOutputNotes: 'Output generated as advisory, source-backed analysis.'
    };
  }
}
