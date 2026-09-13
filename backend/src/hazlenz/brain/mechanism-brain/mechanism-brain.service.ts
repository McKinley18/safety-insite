import { HazLenzReasoningDomain } from '../../reasoning-orchestrator/reasoning-orchestrator.types';
import { HazLenzMechanismBrainRecord } from './mechanism-brain.types';
import { HAZLENZ_MECHANISM_BRAIN_REGISTRY } from './mechanism-knowledge.registry';

function normalized(value: unknown): string {
  return String(value || '').toLowerCase();
}

function includesAny(text: string, terms: string[]): boolean {
  const norm = normalized(text);
  return terms.some((term) => norm.includes(normalized(term)));
}

export type HazLenzMechanismBrainQuery = {
  hazardDomain?: HazLenzReasoningDomain;
  mechanismId?: string;
  text?: string;
  limit?: number;
};

export type HazLenzMechanismBrainMatch = {
  record: HazLenzMechanismBrainRecord;
  score: number;
  matchedFields: string[];
  reasonCodes: string[];
};

export type HazLenzMechanismBrainQueryResult = {
  engine: 'safescope_mechanism_brain';
  mode: 'read_only_mechanism_knowledge';
  query: HazLenzMechanismBrainQuery;
  matches: HazLenzMechanismBrainMatch[];
  totalAvailable: number;
  boundary: {
    readOnly: true;
    canCreateCitation: false;
    canDeclareViolation: false;
    canOverrideRegulation: false;
    canBypassHumanReview: false;
  };
};

export class HazLenzMechanismBrainService {
  query(query: HazLenzMechanismBrainQuery): HazLenzMechanismBrainQueryResult {
    const text = normalized(query.text);
    const limit = query.limit || 10;

    const matches = HAZLENZ_MECHANISM_BRAIN_REGISTRY.map((record): HazLenzMechanismBrainMatch => {
      let score = 0;
      const matchedFields: string[] = [];
      const reasonCodes: string[] = [];

      if (query.mechanismId && record.mechanismId === query.mechanismId) {
        score += 100;
        matchedFields.push('mechanismId');
        reasonCodes.push('exact-mechanism-id-match');
      }

      if (query.hazardDomain && record.hazardDomains.includes(query.hazardDomain)) {
        score += 25;
        matchedFields.push('hazardDomains');
        reasonCodes.push('hazard-domain-match');
      }

      if (text) {
        if (includesAny(text, [record.mechanismId, record.label])) {
          score += 40;
          matchedFields.push('label');
          reasonCodes.push('mechanism-label-text-match');
        }

        const triggerHits = record.commonTriggerTerms.filter((term) => text.includes(normalized(term)));
        if (triggerHits.length > 0) {
          score += Math.min(45, triggerHits.length * 10);
          matchedFields.push('commonTriggerTerms');
          reasonCodes.push(`trigger-term-match:${triggerHits.slice(0, 5).join('|')}`);
        }

        const evidenceHits = record.evidenceQuestions.filter((question) =>
          normalized(question).split(/\W+/).filter(Boolean).some((token) => token.length > 4 && text.includes(token)),
        );

        if (evidenceHits.length > 0) {
          score += Math.min(10, evidenceHits.length * 2);
          matchedFields.push('evidenceQuestions');
          reasonCodes.push('evidence-question-context-match');
        }
      }

      return {
        record,
        score,
        matchedFields: Array.from(new Set(matchedFields)),
        reasonCodes,
      };
    })
      .filter((match) => match.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return {
      engine: 'safescope_mechanism_brain',
      mode: 'read_only_mechanism_knowledge',
      query,
      matches,
      totalAvailable: HAZLENZ_MECHANISM_BRAIN_REGISTRY.length,
      boundary: {
        readOnly: true,
        canCreateCitation: false,
        canDeclareViolation: false,
        canOverrideRegulation: false,
        canBypassHumanReview: false,
      },
    };
  }

  getByMechanismId(mechanismId: string): HazLenzMechanismBrainRecord | undefined {
    return HAZLENZ_MECHANISM_BRAIN_REGISTRY.find((record) => record.mechanismId === mechanismId);
  }

  list(): HazLenzMechanismBrainRecord[] {
    return [...HAZLENZ_MECHANISM_BRAIN_REGISTRY];
  }
}
