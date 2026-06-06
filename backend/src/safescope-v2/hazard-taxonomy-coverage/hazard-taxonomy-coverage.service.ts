import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { TaxonomyDomain, RoutingResult } from './hazard-taxonomy-coverage.types';

@Injectable()
export class HazardTaxonomyCoverageService {
  private coverageMap: { domains: TaxonomyDomain[] };

  constructor() {
    const mapPath = path.resolve(__dirname, '../../../../safescope-data/hazard-taxonomy/hazard-taxonomy-coverage-map.v1.json');
    console.log('Loading taxonomy map from:', mapPath);
    this.coverageMap = JSON.parse(fs.readFileSync(mapPath, 'utf-8'));
    console.log('Loaded', this.coverageMap.domains.length, 'domains.');
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
    console.log('Routing text:', lowerText);
    for (const domain of this.coverageMap.domains) {
      const entities = domain.commonEntities || [];
      const mechanisms = domain.commonMechanisms || [];
      const matches = [...entities, ...mechanisms].filter(
        signal => lowerText.includes(signal.toLowerCase())
      );
      if (matches.length > 0) {
        console.log('Matched domain:', domain.domainId, 'with signals:', matches);
        return {
          domainId: domain.domainId,
          confidence: Math.min(matches.length / 2, 1),
          matchedSignals: matches,
          routeDisposition: domain.status === 'gap' ? 'hold_for_review' : 'categorize_only',
          requiresHumanReview: domain.status === 'gap'
        };
      }
    }
    console.log('No domain matched.');
    return {
      domainId: 'unknown',
      confidence: 0,
      matchedSignals: [],
      routeDisposition: 'hold_for_review',
      requiresHumanReview: true
    };
  }
}
