import { Injectable } from '@nestjs/common';
import { ExpertApplicabilityRule, EvidenceGateResult } from './standard-applicability.types';

@Injectable()
export class EvidenceSufficiencyGateService {
  evaluate(rule: ExpertApplicabilityRule, text: string): EvidenceGateResult {
    const lowerText = text.toLowerCase();
    
    // 1. Check exclusions (doNotSelectWhen)
    let excludedByDoNotSelect = false;
    if (rule.doNotSelectWhen) {
      for (const pattern of rule.doNotSelectWhen) {
        if (pattern.test(lowerText)) {
          excludedByDoNotSelect = true;
          break;
        }
      }
    }

    if (excludedByDoNotSelect) {
      return {
        ruleId: rule.id,
        citation: rule.standardCitation,
        isSufficient: false,
        confidenceScore: 0,
        confidenceLevel: 'low',
        missingFacts: ['This standard is explicitly excluded based on negative signals in the observation.'],
        boostersTriggered: [],
        reducersTriggered: [],
        excludedByDoNotSelect: true,
      };
    }

    // 2. Check required evidence
    const missingFacts: string[] = [];
    let hasRequiredEvidence = false;
    for (const pattern of rule.requiredEvidence) {
      if (pattern.test(lowerText)) {
        hasRequiredEvidence = true;
      }
    }

    if (!hasRequiredEvidence) {
      missingFacts.push('The observation lacks specific physical evidence (e.g., exposed parts, damaged status, unchained status) required for this standard.');
    }

    // 3. Evaluate boosters and reducers
    let confidenceScore = hasRequiredEvidence ? 75 : 40;
    const boostersTriggered: string[] = [];
    const reducersTriggered: string[] = [];

    if (rule.confidenceBoosters) {
      for (const pattern of rule.confidenceBoosters) {
        if (pattern.test(lowerText)) {
          boostersTriggered.push(pattern.source);
          confidenceScore += 15;
        }
      }
    }

    if (rule.confidenceReducers) {
      for (const pattern of rule.confidenceReducers) {
        if (pattern.test(lowerText)) {
          reducersTriggered.push(pattern.source);
          confidenceScore -= 15;
        }
      }
    }

    // Clamp score
    confidenceScore = Math.max(0, Math.min(100, confidenceScore));

    // Determine confidence level
    let confidenceLevel: 'low' | 'moderate' | 'high' = 'low';
    if (confidenceScore >= 85) {
      confidenceLevel = 'high';
    } else if (confidenceScore >= 60) {
      confidenceLevel = 'moderate';
    }

    // Evidence sufficiency decision
    // To be sufficient, it must have required evidence AND at least moderate confidence.
    const isSufficient = hasRequiredEvidence && confidenceLevel !== 'low';

    if (!isSufficient && missingFacts.length === 0) {
      missingFacts.push('Confidence level is low due to conflicting or weak evidence signals.');
    }

    return {
      ruleId: rule.id,
      citation: rule.standardCitation,
      isSufficient,
      confidenceScore,
      confidenceLevel,
      missingFacts,
      boostersTriggered,
      reducersTriggered,
      excludedByDoNotSelect: false,
    };
  }
}
