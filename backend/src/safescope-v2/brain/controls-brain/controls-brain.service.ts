import { SafeScopeReasoningDomain } from '../../reasoning-orchestrator/reasoning-orchestrator.types';
import { SAFESCOPE_CONTROLS_BRAIN_REGISTRY } from './controls-knowledge.registry';
import { SafeScopeControlBrainRecord } from './controls-brain.types';

export type SafeScopeControlsBrainQuery = {
  hazardDomain?: SafeScopeReasoningDomain;
  mechanism?: string;
  text?: string;
  limit?: number;
};

export type SafeScopeControlsBrainMatch = {
  record: SafeScopeControlBrainRecord;
  score: number;
  matchedFields: string[];
  reasonCodes: string[];
};

export type SafeScopeControlsBrainResult = {
  engine: 'safescope_controls_brain';
  mode: 'read_only_control_intelligence';
  query: SafeScopeControlsBrainQuery;
  matches: SafeScopeControlsBrainMatch[];
  totalAvailable: number;
  boundary: {
    readOnly: true;
    canDeclareViolation: false;
    canCreateCitation: false;
    canBypassHumanReview: false;
  };
};

function normalized(value: unknown): string {
  return String(value || '').toLowerCase();
}

function includesText(text: string, values: string[]): boolean {
  return values.some((value) => text.includes(normalized(value)));
}

export class SafeScopeControlsBrainService {
  query(query: SafeScopeControlsBrainQuery): SafeScopeControlsBrainResult {
    const text = normalized(textParts([
      query.text,
      query.hazardDomain,
      query.mechanism,
    ]));

    const matches = SAFESCOPE_CONTROLS_BRAIN_REGISTRY
      .map((record): SafeScopeControlsBrainMatch => {
        let score = 0;
        const matchedFields: string[] = [];
        const reasonCodes: string[] = [];

        if (query.hazardDomain && record.hazardDomains.includes(query.hazardDomain)) {
          score += 50;
          matchedFields.push('hazardDomains');
          reasonCodes.push('hazard-domain-match');
        }

        if (query.mechanism && record.mechanisms.includes(query.mechanism)) {
          score += 60;
          matchedFields.push('mechanisms');
          reasonCodes.push('mechanism-match');
        }

        if (text && includesText(text, record.mechanisms)) {
          score += 20;
          matchedFields.push('mechanism-text');
          reasonCodes.push('mechanism-text-match');
        }

        if (
          text &&
          includesText(text, [
            record.immediateControl,
            record.permanentControl,
            ...record.verificationEvidence,
            ...record.failureModesIfNotVerified,
            ...record.notes,
          ])
        ) {
          score += 15;
          matchedFields.push('control-text');
          reasonCodes.push('control-context-match');
        }

        return { record, score, matchedFields, reasonCodes };
      })
      .filter((match) => match.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, query.limit || 5);

    return {
      engine: 'safescope_controls_brain',
      mode: 'read_only_control_intelligence',
      query,
      matches,
      totalAvailable: SAFESCOPE_CONTROLS_BRAIN_REGISTRY.length,
      boundary: {
        readOnly: true,
        canDeclareViolation: false,
        canCreateCitation: false,
        canBypassHumanReview: false,
      },
    };
  }
}

function textParts(parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
