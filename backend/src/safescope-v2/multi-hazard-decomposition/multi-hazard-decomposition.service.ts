import { Injectable } from '@nestjs/common';
import { HazardDecomposition, MultiHazardDecompositionResult } from './multi-hazard-decomposition.types';
import { HazardTaxonomyCoverageService } from '../hazard-taxonomy-coverage/hazard-taxonomy-coverage.service';

@Injectable()
export class MultiHazardDecompositionService {
  private taxonomyService = new HazardTaxonomyCoverageService();

  decompose(observationText: string, context: any = {}): MultiHazardDecompositionResult {
    const version = 'v1';
    const originalObservation = observationText;
    
    // 1. Split into fragments
    const splitRegex = /[.;,!]|\band\b|\balso\b|\bwhile\b/i;
    const fragments = observationText.split(splitRegex)
      .map(f => f.trim())
      .filter(f => f.length > 5);

    const hazards: HazardDecomposition[] = [];
    const routingNotes: string[] = [];

    // 2. Process each fragment
    fragments.forEach((fragment, index) => {
        const route = this.taxonomyService.route(fragment);
        
        if (route.domainId !== 'unknown') {
            const domain = this.taxonomyService.findDomainById(route.domainId);
            
            const existing = hazards.find(h => h.domainId === route.domainId);
            if (existing) {
                routingNotes.push(`Fragment "${fragment}" also matched ${route.domainId} (already captured).`);
                return;
            }

            hazards.push({
                hazardId: `haz-${hazards.length + 1}`,
                domainId: route.domainId,
                hazardFamily: domain?.relatedStandardFamilies[0] || 'unknown',
                mechanism: route.matchedSignals[0],
                observationFragment: fragment,
                supportingSignals: route.matchedSignals,
                confidence: route.confidence,
                possibleOverlapWith: [],
                requiresHumanReview: route.requiresHumanReview,
                evidenceGaps: [],
                reviewerQuestions: route.requiresHumanReview ? [`Please verify the ${route.domainId} hazard in this fragment.`] : []
            });
            routingNotes.push(`Decomposed fragment "${fragment}" routed to ${route.domainId}`);
        }
    });

    // 3. Final result
    const filteredHazards = hazards.filter(
      (hazard) => !(hazard.domainId === 'hot_work' && this.isFalsePositiveHotWorkFragment(hazard.observationFragment || '')),
    );
    const isMultiHazard = filteredHazards.length > 1;
    const hazardCount = filteredHazards.length;
    const primaryHazard = filteredHazards[0];

    return {
      version,
      originalObservation,
      isMultiHazard,
      hazardCount,
      primaryHazard,
      hazards: filteredHazards,
      decompositionConfidence: filteredHazards.length > 0 ? 0.9 : 0,
      routingNotes,
      evidenceGaps: filteredHazards.length === 0 ? ['No clear hazards identified in text.'] : [],
      reviewerQuestions: isMultiHazard ? ['Multiple hazards detected. Review each for accuracy.'] : [],
      advisoryBoundary: 'SafeScope multi-hazard decomposition is advisory only.'
    };
  }
  private isTrueHotWorkFragment(fragment: string): boolean {
    const normalized = fragment.toLowerCase();

    return /\b(weld|welding|cut|cutting|torch|grind|grinding|braz|brazing|solder|soldering|open flame|flame|spark|sparks|hot work permit|hot-work permit)\b/i.test(normalized);
  }

  private isFalsePositiveHotWorkFragment(fragment: string): boolean {
    const normalized = fragment.toLowerCase();

    const genericWorkOnly =
      /\b(worker|workers|work|working|clean|cleaning|cleanup|material|housekeeping)\b/i.test(normalized);

    return genericWorkOnly && !this.isTrueHotWorkFragment(normalized);
  }

}
