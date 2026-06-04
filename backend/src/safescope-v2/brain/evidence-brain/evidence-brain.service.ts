import { SafeScopeBrainQuery } from '../safescope-brain.types';
import { SafeScopeEvidenceBrainRecord } from './evidence-brain.types';
import { SAFESCOPE_EVIDENCE_BRAIN_REGISTRY } from './evidence-knowledge.registry';

export type SafeScopeEvidenceBrainMatch = {
  record: SafeScopeEvidenceBrainRecord;
  score: number;
  matchedFields: string[];
  reasonCodes: string[];
};

export type SafeScopeEvidenceBrainQueryResult = {
  engine: 'safescope_evidence_brain';
  mode: 'read_only_defensibility_requirements';
  query: SafeScopeBrainQuery;
  matches: SafeScopeEvidenceBrainMatch[];
  totalAvailable: number;
  boundary: {
    readOnly: true;
    canCreateCitation: false;
    canDeclareViolation: false;
    canOverrideRegulation: false;
    canBypassHumanReview: false;
  };
};

function normalized(value: unknown): string {
  return String(value || '').toLowerCase();
}

function includesText(text: string, value: string): boolean {
  return text.includes(normalized(value));
}

function addScore(
  state: { score: number; matchedFields: string[]; reasonCodes: string[] },
  points: number,
  field: string,
  reasonCode: string,
): void {
  state.score += points;
  state.matchedFields.push(field);
  state.reasonCodes.push(reasonCode);
}

export class SafeScopeEvidenceBrainService {
  query(query: SafeScopeBrainQuery): SafeScopeEvidenceBrainQueryResult {
    const text = normalized([
      query.text,
      query.hazardDomain,
      query.mechanism,
      query.jurisdiction,
      query.industryScope,
      query.mineScope,
    ].join(' '));

    const matches = SAFESCOPE_EVIDENCE_BRAIN_REGISTRY
      .map((record): SafeScopeEvidenceBrainMatch => {
        const state = { score: 0, matchedFields: [] as string[], reasonCodes: [] as string[] };

        if (query.hazardDomain && record.hazardDomains.includes(query.hazardDomain)) {
          addScore(state, 40, 'hazardDomains', 'hazard-domain-match');
        }

        if (query.mechanism && record.mechanisms.includes(query.mechanism)) {
          addScore(state, 45, 'mechanisms', 'mechanism-match');
        }

        if (record.importance === 'critical') {
          addScore(state, 5, 'importance', 'critical-evidence-priority');
        }

        for (const term of [...record.hazardDomains, ...record.mechanisms]) {
          if (term && includesText(text, term)) {
            addScore(state, 6, 'text', `text-match-${term}`);
          }
        }

        for (const term of [
          record.question,
          record.whyItMatters,
          record.defensibilityImpact,
          ...record.acceptableEvidenceTypes,
        ]) {
          const words = normalized(term).split(/[^a-z0-9_/-]+/).filter((word) => word.length >= 5);
          if (words.some((word) => text.includes(word))) {
            addScore(state, 2, 'text', 'semantic-evidence-text-match');
          }
        }

        return {
          record,
          score: state.score,
          matchedFields: Array.from(new Set(state.matchedFields)),
          reasonCodes: Array.from(new Set(state.reasonCodes)),
        };
      })
      .filter((match) => match.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, query.limit || 10);

    return {
      engine: 'safescope_evidence_brain',
      mode: 'read_only_defensibility_requirements',
      query,
      matches,
      totalAvailable: SAFESCOPE_EVIDENCE_BRAIN_REGISTRY.length,
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
