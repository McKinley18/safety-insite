import { Injectable } from '@nestjs/common';
import { HazardAbsorptionOutput } from './hazard-information-absorption.types';
import { HazardTaxonomyCoverageService } from '../hazard-taxonomy-coverage/hazard-taxonomy-coverage.service';

@Injectable()
export class HazardInformationAbsorptionService {
  private taxonomyService = new HazardTaxonomyCoverageService();
  
  async absorb(
    rawObservationText: string,
    context: any
  ): Promise<HazardAbsorptionOutput> {
    const route = this.taxonomyService.route(rawObservationText);
    const domain = this.taxonomyService.findDomainById(route.domainId);
    
    return {
        absorptionDecision: route.requiresHumanReview ? 'hold_for_review' : 'categorize_only',
        primaryDomain: route.domainId,
        secondaryDomains: [],
        hazardFamilies: domain?.relatedStandardFamilies || [],
        mechanisms: route.matchedSignals,
        equipmentGroups: domain?.commonEntities || [],
        taskContexts: [],
        jurisdictionAssessment: 'unknown',
        evidenceQuestions: domain?.evidenceQuestions || ['What is the hazard?'],
        requiredFacts: domain?.evidenceQuestions ? ['domain_validated'] : ['hazard_id'],
        correctiveActionControlFamilies: domain?.commonControls || [],
        duplicateKeys: domain ? [domain.domainId + '-draft-01'] : [],
        prohibitedLanguageFlags: false,
        advisoryBoundary: true,
        reasons: ['Absorbed and categorized via taxonomy']
    };
  }
}
