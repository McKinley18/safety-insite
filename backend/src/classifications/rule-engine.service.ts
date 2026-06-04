import { Injectable } from '@nestjs/common';
import { CLASSIFICATION_RULES } from '../taxonomy/taxonomy.config';

@Injectable()
export class RuleEngine {
  private readonly rules = CLASSIFICATION_RULES;

  classify(narrative: string) {
    const text = narrative.toLowerCase();
    let bestMatch = null;
    let maxMatches = 0;
    const matchedKeywords = [];

    for (const rule of this.rules) {
      const matches = rule.keywords.filter(k => text.includes(k));
      if (matches.length > maxMatches) {
        maxMatches = matches.length;
        bestMatch = rule;
        matchedKeywords.push(...matches);
      }
    }

    const confidence = maxMatches > 0 ? Math.min(0.5 + (maxMatches * 0.1), 0.95) : 0.2;

    return {
      hazardCategoryCode: bestMatch ? bestMatch.code : 'unknown',
      severityLevel: bestMatch ? bestMatch.severity : 1,
      confidenceScore: confidence,
      requiresHumanReview: confidence < 0.7,
      reasoningSummary: {
        summary: bestMatch ? `Hazard detected: ${bestMatch.code}` : 'No clear hazard identified.',
        methodology: 'KeywordPatternMatching',
        confidence,
        matchedKeywords: [...new Set(matchedKeywords)],
        matchedRules: bestMatch ? [bestMatch.code] : [],
        extractedEntities: [],
      }
    };
  }
}
