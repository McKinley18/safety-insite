import {
  SafeScopeScenarioDisambiguationInput,
  SafeScopeScenarioDisambiguationMatch,
  SafeScopeScenarioDisambiguationRecord,
  SafeScopeScenarioDisambiguationResult,
} from './scenario-disambiguation.types';
import { SAFESCOPE_SCENARIO_DISAMBIGUATION_REGISTRY } from './scenario-disambiguation.registry';
import { nonNegatedHits } from '../../reasoning-orchestrator/negation-context.util';

function normalized(value: unknown): string {
  return String(value || '').toLowerCase();
}

function hits(text: string, terms: string[]): string[] {
  return nonNegatedHits(text, terms);
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function confidenceFor(score: number, negativeHitCount: number): 'low' | 'moderate' | 'high' {
  if (score >= 75 && negativeHitCount === 0) return 'high';
  if (score >= 45) return 'moderate';
  return 'low';
}

export class SafeScopeScenarioDisambiguationService {
  query(input: SafeScopeScenarioDisambiguationInput): SafeScopeScenarioDisambiguationResult {
    const limit = input.limit && input.limit > 0 ? input.limit : 5;

    const text = normalized([
      input.text,
      input.jurisdiction,
      input.industryContext,
      input.siteType,
      input.taskContext,
      input.equipmentInvolved,
    ].join(' '));

    const matches: SafeScopeScenarioDisambiguationMatch[] = SAFESCOPE_SCENARIO_DISAMBIGUATION_REGISTRY
      .map((record: SafeScopeScenarioDisambiguationRecord) => {
        const positiveHits = hits(text, record.positiveSignals);
        const negativeHits = hits(text, record.negativeSignals);
        const jurisdictionHits = hits(text, record.jurisdictionSignals);
        const industryHits = hits(text, record.industrySignals);
        const equipmentHits = hits(text, record.equipmentSignals);
        const taskHits = hits(text, record.taskSignals);

        let score = 0;
        const reasonCodes: string[] = [];

        if (positiveHits.length > 0) {
          score += Math.min(45, positiveHits.length * 9);
          reasonCodes.push(`positive-signal:${positiveHits.slice(0, 5).join('|')}`);
        }

        if (jurisdictionHits.length > 0) {
          score += Math.min(20, jurisdictionHits.length * 10);
          reasonCodes.push(`jurisdiction-signal:${jurisdictionHits.slice(0, 3).join('|')}`);
        }

        if (industryHits.length > 0) {
          score += Math.min(15, industryHits.length * 8);
          reasonCodes.push(`industry-signal:${industryHits.slice(0, 3).join('|')}`);
        }

        if (equipmentHits.length > 0) {
          score += Math.min(10, equipmentHits.length * 5);
          reasonCodes.push(`equipment-signal:${equipmentHits.slice(0, 3).join('|')}`);
        }

        if (taskHits.length > 0) {
          score += Math.min(10, taskHits.length * 5);
          reasonCodes.push(`task-signal:${taskHits.slice(0, 3).join('|')}`);
        }

        if (negativeHits.length > 0) {
          score -= Math.min(40, negativeHits.length * 10);
          reasonCodes.push(`negative-signal:${negativeHits.slice(0, 5).join('|')}`);
        }

        const confidence = confidenceFor(score, negativeHits.length);

        return {
          record,
          score,
          positiveHits: uniqueStrings(positiveHits),
          negativeHits: uniqueStrings(negativeHits),
          jurisdictionHits: uniqueStrings(jurisdictionHits),
          industryHits: uniqueStrings(industryHits),
          equipmentHits: uniqueStrings(equipmentHits),
          taskHits: uniqueStrings(taskHits),
          confidence,
          humanReviewRecommended:
            confidence !== 'high' ||
            negativeHits.length > 0 ||
            record.humanReviewTriggers.length > 0,
          reasonCodes: uniqueStrings(reasonCodes),
        };
      })
      .filter((match: SafeScopeScenarioDisambiguationMatch) => match.score > 0)
      .sort((a: SafeScopeScenarioDisambiguationMatch, b: SafeScopeScenarioDisambiguationMatch) => b.score - a.score)
      .slice(0, limit);

    return {
      engine: 'safescope_scenario_disambiguation_v1',
      mode: 'read_only_governed_disambiguation',
      input,
      matches,
      selected: matches[0],
      boundary: {
        readOnly: true,
        advisoryOnly: true,
        canDeclareViolation: false,
        canCreateCitation: false,
        canBypassHumanReview: false,
      },
    };
  }

  list() {
    return [...SAFESCOPE_SCENARIO_DISAMBIGUATION_REGISTRY];
  }
}
