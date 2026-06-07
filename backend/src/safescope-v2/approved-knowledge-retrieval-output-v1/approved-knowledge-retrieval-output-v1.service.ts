import { Injectable } from '@nestjs/common';
import { RetrievalOutput } from './approved-knowledge-retrieval-output-v1.types';
import { HazardTaxonomyCoverageService } from '../hazard-taxonomy-coverage/hazard-taxonomy-coverage.service';
import { ApprovedKnowledgeRegistrySearchService } from '../approved-knowledge-registry/approved-knowledge-registry-search.service';
import { ScenarioExpansionService } from '../scenario-expansion/scenario-expansion.service';
import { ScenarioEvaluationService } from '../scenario-evaluation/scenario-evaluation.service';

@Injectable()
export class ApprovedKnowledgeRetrievalOutputV1Service {
  private taxonomyService = new HazardTaxonomyCoverageService();
  private searchService = new ApprovedKnowledgeRegistrySearchService();
  private scenarioService = new ScenarioExpansionService();
  private evaluationService = new ScenarioEvaluationService();

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
    
    const draftKnowledgeWarnings = approvedMatches.length === 0 && taxonomyRoute.requiresHumanReview 
        ? ['No approved matches found. Information requires human review.'] 
        : [];

    return {
      version: 'v1',
      observationSummary: observationText,
      taxonomyRoute: taxonomyRoute,
      approvedKnowledgeMatches: approvedMatches,
      scenarioMatches: scenarioMatches,
      evaluatedScenarios: evaluation.evaluatedScenarios,
      topScenario: evaluation.topScenario,
      draftKnowledgeWarnings: draftKnowledgeWarnings,
      applicabilityAssessment: approvedMatches.length > 0 ? 'supported' : 'advisory_only',
      confidence: taxonomyRoute.confidence,
      evidenceGaps: approvedMatches.length === 0 ? ['Insufficient evidence for definitive assessment.'] : [],
      advisoryBoundaries: ['SafeScope provides advisory information only. Requires human verification.'],
      recommendedReviewerActions: ['Verify categorization', 'Review evidence sufficiency'],
      fieldOutputNotes: 'Output generated as advisory, source-backed analysis.'
    };
  }
}
