import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { TaxonomyDomain, RoutingResult } from './hazard-taxonomy-coverage.types';

@Injectable()
export class HazardTaxonomyCoverageService {
  private static cachedCoverageMap: { domains: TaxonomyDomain[] } | null = null;

  private ensureLoaded() {
    if (HazardTaxonomyCoverageService.cachedCoverageMap) return;

    const mapPath = path.resolve(
      __dirname,
      '../../../../safescope-data/hazard-taxonomy/hazard-taxonomy-coverage-map.v1.json',
    );
    HazardTaxonomyCoverageService.cachedCoverageMap = JSON.parse(fs.readFileSync(mapPath, 'utf-8'));
  }

  private get coverageMap() {
    this.ensureLoaded();
    return HazardTaxonomyCoverageService.cachedCoverageMap as { domains: TaxonomyDomain[] };
  }

  getAllDomains(): TaxonomyDomain[] {
    return this.coverageMap.domains;
  }

  getGaps(): TaxonomyDomain[] {
    return this.coverageMap.domains.filter(d => d.status === 'gap');
  }

  getCoveredDraftPackDomains(): TaxonomyDomain[] {
    return this.coverageMap.domains.filter(d => d.status === 'covered_draft_pack');
  }

  findDomainById(domainId: string): TaxonomyDomain | undefined {
    return this.coverageMap.domains.find(d => d.domainId === domainId);
  }

  route(text: string): RoutingResult {
    const lowerText = text.toLowerCase();
    
    // Weighted matching logic
    let bestDomain: TaxonomyDomain | null = null;
    let maxScore = 0;
    let bestMatches: string[] = [];

    for (const domain of this.coverageMap.domains) {
        const entities = domain.commonEntities || [];
        const mechanisms = domain.commonMechanisms || [];
        const signals = [...entities, ...mechanisms];
        
        let score = 0;
        let matches: string[] = [];
        
        for (const signal of signals) {
            if (lowerText.includes(signal.toLowerCase())) {
                score += (signal.split(' ').length > 1 ? 2 : 1); // Weight multi-word signals higher
                matches.push(signal);
            }
        }
        
        if (score > maxScore) {
            maxScore = score;
            bestDomain = domain;
            bestMatches = matches;
        }
    }
    
    if (bestDomain && maxScore > 0) {
        return {
          domainId: bestDomain.domainId,
          confidence: Math.min(maxScore / 5, 1),
          matchedSignals: bestMatches,
          routeDisposition: bestDomain.status === 'gap' ? 'hold_for_review' : 'categorize_only',
          requiresHumanReview: bestDomain.status === 'gap'
        };
      }
    
    return {
      domainId: 'unknown',
      confidence: 0,
      matchedSignals: [],
      routeDisposition: 'hold_for_review',
      requiresHumanReview: true
    };
  }
}
