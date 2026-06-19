import { Injectable } from '@nestjs/common';
import { STANDARDS_MAPPING } from './standards-mapping.seed';
import { withKnowledgeTelemetry } from './telemetry/hazlenz-knowledge-telemetry';

const REGULATORY_CROSS_BRIDGE: Record<string, { citation: string; agency: 'MSHA' | 'OSHA'; scope: 'msha' | 'osha_general' | 'osha_construction'; rationale: string }> = {
  // MSHA to OSHA
  '30 CFR 56.14107(a)': { citation: '1910.212(a)(1)', agency: 'OSHA', scope: 'osha_general', rationale: 'OSHA Point of Operation Machine Guarding equivalent' },
  '30 CFR 56.12016': { citation: '1910.303(b)(1)', agency: 'OSHA', scope: 'osha_general', rationale: 'OSHA Electrical conductors exposure equivalent' },
  '30 CFR 56.11012': { citation: '1926.501(b)(1)', agency: 'OSHA', scope: 'osha_construction', rationale: 'OSHA Unprotected sides and edges fall equivalent' },
  '30 CFR 56.20003': { citation: '1910.22(a)(1)', agency: 'OSHA', scope: 'osha_general', rationale: 'OSHA Housekeeping equivalent' },
  
  // OSHA to MSHA
  '1910.212(a)(1)': { citation: '30 CFR 56.14107(a)', agency: 'MSHA', scope: 'msha', rationale: 'MSHA Moving machine parts guarding equivalent' },
  '1910.303(b)(1)': { citation: '30 CFR 56.12016', agency: 'MSHA', scope: 'msha', rationale: 'MSHA Electrical conductors exposed equivalent' },
  '1926.501(b)(1)': { citation: '30 CFR 56.11012', agency: 'MSHA', scope: 'msha', rationale: 'MSHA Openings above/below/near travelways equivalent' },
  '1910.22(a)(1)': { citation: '30 CFR 56.20003', agency: 'MSHA', scope: 'msha', rationale: 'MSHA Housekeeping equivalent' }
};

@Injectable()
export class StandardsBridgeService {
  async getSuggestedStandards(classification: string, scopes?: string[]) {
    return withKnowledgeTelemetry('StandardsBridgeService.getSuggestedStandards', { classification, scopeCount: scopes?.length || 0 }, async () => {
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

      // Apply the Cross-Jurisdictional Regulatory Bridge
      const bridged: any[] = [];
      for (const std of suggestedStandards) {
        const equivalent = REGULATORY_CROSS_BRIDGE[std.citation];
        if (equivalent && !suggestedStandards.some(s => s.citation === equivalent.citation)) {
          bridged.push({
            citation: equivalent.citation,
            agency: equivalent.agency,
            scope: equivalent.scope,
            rationale: `${equivalent.rationale} (Cross-Jurisdictional Regulatory Bridge)`
          });
        }
      }
      suggestedStandards.push(...bridged);

      const excludedStandards = standards
        .filter((standard: any) => !scopes.includes(standard.scope) && !bridged.some(b => b.citation === standard.citation))
        .map((standard: any) => ({
          citation: standard.citation,
          reason: 'Excluded by selected regulatory scope',
        }));

      return {
        suggestedStandards,
        excludedStandards,
      };
    });
  }
}
