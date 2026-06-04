import { Injectable } from '@nestjs/common';
import { STANDARDS_MAPPING } from './standards-mapping.seed';

@Injectable()
export class StandardsBridgeService {
  getSuggestedStandards(classification: string, scopes?: string[]) {
    const standards = STANDARDS_MAPPING[classification] || [];

    if (!scopes || scopes.length === 0 || scopes.includes('all')) {
      return {
        suggestedStandards: standards,
        excludedStandards: [],
      };
    }

    const suggestedStandards = standards.filter((standard: any) =>
      scopes.includes(standard.scope),
    );

    const excludedStandards = standards
      .filter((standard: any) => !scopes.includes(standard.scope))
      .map((standard: any) => ({
        citation: standard.citation,
        reason: 'Excluded by selected regulatory scope',
      }));

    return {
      suggestedStandards,
      excludedStandards,
    };
  }
}
