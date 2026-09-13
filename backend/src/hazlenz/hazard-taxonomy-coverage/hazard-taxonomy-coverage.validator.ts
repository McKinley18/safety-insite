import { Injectable } from '@nestjs/common';
import { TaxonomyDomain } from './hazard-taxonomy-coverage.types';

@Injectable()
export class HazardTaxonomyCoverageValidator {
  static validate(domains: TaxonomyDomain[]): string[] {
    const errors: string[] = [];
    if (domains.length < 40) errors.push('Fewer than 40 domains');
    for (const domain of domains) {
        if (!domain.domainId || !domain.displayName || !domain.status || !domain.priority) {
            errors.push(`Missing mandatory fields in ${domain.domainId}`);
        }
    }
    return errors;
  }
}
