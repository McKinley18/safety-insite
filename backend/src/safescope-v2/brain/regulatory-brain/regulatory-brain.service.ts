import { SafeScopeBrainMatch, SafeScopeBrainQuery } from '../safescope-brain.types';
import { SAFESCOPE_REGULATORY_BRAIN_REGISTRY } from './regulatory-knowledge.registry';
import { SafeScopeRegulatoryBrainResult } from './regulatory-brain.types';

function normalized(value: unknown): string {
  return String(value || '').toLowerCase();
}

function includesNormalized(haystack: string, needle: string): boolean {
  return haystack.includes(normalized(needle));
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function includesAny(text: string, terms: string[]): boolean {
  return terms.some((term) => text.includes(normalized(term)));
}

function isCoalUndergroundTrailingCableContext(text: string): boolean {
  return (
    includesAny(text, ['coal', 'underground coal', 'coal mine']) &&
    includesAny(text, ['underground', 'underground mine']) &&
    includesAny(text, ['trailing cable', 'power cable', 'damaged cable', 'cable insulation', 'jacket damage', 'electrical cable'])
  );
}


export class SafeScopeRegulatoryBrainService {
  query(query: SafeScopeBrainQuery): SafeScopeRegulatoryBrainResult {
    const text = normalized(query.text);
    const limit = query.limit && query.limit > 0 ? query.limit : 10;

    const matches = SAFESCOPE_REGULATORY_BRAIN_REGISTRY
      .map((record): SafeScopeBrainMatch => {
        let score = 0;
        const matchedFields: string[] = [];
        const reasonCodes: string[] = [];

        if (query.approvedOnly && !record.verificationStatus.startsWith('approved_')) {
          return { record, score: -1, matchedFields, reasonCodes: ['filtered-unapproved'] };
        }

        if (query.jurisdiction && record.jurisdiction === query.jurisdiction) {
          score += 25;
          matchedFields.push('jurisdiction');
          reasonCodes.push('jurisdiction-match');
        }

        if (query.industryScope && record.industryScope === query.industryScope) {
          score += 15;
          matchedFields.push('industryScope');
          reasonCodes.push('industry-scope-match');
        }

        if (query.mineScope && record.mineScope === query.mineScope) {
          score += 15;
          matchedFields.push('mineScope');
          reasonCodes.push('mine-scope-match');
        }

        if (query.hazardDomain && record.hazardDomains.includes(query.hazardDomain)) {
          score += 30;
          matchedFields.push('hazardDomains');
          reasonCodes.push('hazard-domain-match');
        }

        if (query.mechanism && record.mechanisms.includes(query.mechanism)) {
          score += 25;
          matchedFields.push('mechanisms');
          reasonCodes.push('mechanism-match');
        }

        if (query.citation && record.citation === query.citation) {
          score += 40;
          matchedFields.push('citation');
          reasonCodes.push('citation-exact-match');
        }

        if (text && isCoalUndergroundTrailingCableContext(text)) {
          if (record.citation === '30 CFR 75.517') {
            score += 90;
            matchedFields.push('coalUndergroundTrailingCableContext');
            reasonCodes.push('coal-underground-trailing-cable-context');
          }

          if (record.citation === '30 CFR 56.12004') {
            score -= 75;
            reasonCodes.push('penalized-surface-mnm-electrical-for-coal-underground-cable');
          }
        }

        if (text) {
          const searchable = normalized([
            record.title,
            record.citation,
            record.citationTitle,
            record.plainLanguageSummary,
            ...record.hazardDomains,
            ...record.mechanisms,
            ...record.applicabilityTriggers,
            ...record.requiredControls,
            ...record.correctiveActionPatterns,
            ...record.evidenceQuestions,
          ].join(' '));

          if (includesNormalized(searchable, text)) {
            score += 20;
            matchedFields.push('text');
            reasonCodes.push('text-match');
          }

          for (const trigger of record.applicabilityTriggers) {
            if (includesNormalized(text, trigger)) {
              score += 8;
              matchedFields.push('applicabilityTriggers');
              reasonCodes.push(`trigger:${trigger}`);
            }
          }

          for (const mechanism of record.mechanisms) {
            if (includesNormalized(text, mechanism.replace(/_/g, ' '))) {
              score += 8;
              matchedFields.push('mechanisms');
              reasonCodes.push(`mechanism-text:${mechanism}`);
            }
          }
        }

        return {
          record,
          score,
          matchedFields: uniqueStrings(matchedFields),
          reasonCodes: uniqueStrings(reasonCodes),
        };
      })
      .filter((match) => match.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return {
      engine: 'safescope_brain',
      mode: 'read_only_governed_knowledge',
      compartment: 'regulatory_brain',
      query,
      matches,
      totalAvailable: SAFESCOPE_REGULATORY_BRAIN_REGISTRY.length,
      boundary: {
        readOnly: true,
        canCreateCitation: false,
        canDeclareViolation: false,
        canOverrideRegulation: false,
        canBypassHumanReview: false,
      },
    };
  }
}
