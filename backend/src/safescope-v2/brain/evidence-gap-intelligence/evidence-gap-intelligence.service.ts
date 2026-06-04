import {
  SafeScopeEvidenceGapIntelligenceInput,
  SafeScopeEvidenceGapIntelligenceMatch,
  SafeScopeEvidenceGapIntelligenceResult,
  SafeScopeEvidenceGapSeverity,
} from './evidence-gap-intelligence.types';
import { SAFESCOPE_EVIDENCE_GAP_INTELLIGENCE_REGISTRY } from './evidence-gap-intelligence.registry';

function normalized(value: unknown): string {
  return String(value || '').toLowerCase();
}

function hits(text: string, terms: string[]): string[] {
  return terms.filter((term) => text.includes(normalized(term)));
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

const severityRank: Record<SafeScopeEvidenceGapSeverity, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

function highestSeverity(values: SafeScopeEvidenceGapSeverity[]): SafeScopeEvidenceGapSeverity | undefined {
  return values.sort((a, b) => severityRank[b] - severityRank[a])[0];
}

export class SafeScopeEvidenceGapIntelligenceService {
  query(input: SafeScopeEvidenceGapIntelligenceInput): SafeScopeEvidenceGapIntelligenceResult {
    const limit = input.limit && input.limit > 0 ? input.limit : 5;
    const text = normalized([
      input.text,
      input.jurisdiction,
      input.hazardDomain,
      input.mechanism,
      input.citation,
    ].join(' '));

    const matches: SafeScopeEvidenceGapIntelligenceMatch[] =
      SAFESCOPE_EVIDENCE_GAP_INTELLIGENCE_REGISTRY
        .map((record): SafeScopeEvidenceGapIntelligenceMatch => {
          let score = 0;
          const matchedFields: string[] = [];
          const reasonCodes: string[] = [];

          if (input.jurisdiction && record.jurisdictions.includes(input.jurisdiction)) {
            score += 15;
            matchedFields.push('jurisdictions');
            reasonCodes.push('jurisdiction-match');
          }

          if (input.hazardDomain && record.hazardDomains.includes(input.hazardDomain)) {
            score += 30;
            matchedFields.push('hazardDomains');
            reasonCodes.push('hazard-domain-match');
          }

          if (input.mechanism && record.mechanisms.includes(input.mechanism)) {
            score += 35;
            matchedFields.push('mechanisms');
            reasonCodes.push('mechanism-match');
          }

          const triggerHits = hits(text, record.triggerTerms);
          if (triggerHits.length > 0) {
            score += Math.min(30, triggerHits.length * 6);
            matchedFields.push('triggerTerms');
            reasonCodes.push(`trigger:${triggerHits.slice(0, 5).join('|')}`);
          }

          const missingEvidenceHits = hits(text, record.missingEvidenceTerms);
          if (missingEvidenceHits.length > 0) {
            score += Math.min(20, missingEvidenceHits.length * 4);
            matchedFields.push('missingEvidenceTerms');
            reasonCodes.push(`missing-evidence:${missingEvidenceHits.slice(0, 5).join('|')}`);
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

    const criticalQuestions = uniqueStrings(
      matches.map((match) => match.record.inspectorQuestion),
    ).slice(0, 8);

    const topSeverity = highestSeverity(matches.map((match) => match.record.severity));

    const recommendedDisposition =
      matches.some((match) => match.record.recommendedDisposition === 'hold_for_critical_evidence')
        ? 'hold_for_critical_evidence'
        : matches.some((match) => match.record.recommendedDisposition === 'proceed_with_human_review')
          ? 'proceed_with_human_review'
          : 'proceed_with_advisory_context';

    return {
      engine: 'safescope_evidence_gap_intelligence_v1',
      mode: 'read_only_evidence_gap_reasoning',
      input,
      matches,
      criticalQuestions,
      highestSeverity: topSeverity,
      recommendedDisposition,
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
    return [...SAFESCOPE_EVIDENCE_GAP_INTELLIGENCE_REGISTRY];
  }
}
