import { CorrectiveActionStrategyResult } from './corrective-action-strategy-ranking.types';

export class CorrectiveActionStrategyRankingValidator {
  private static prohibitedPhrases = [
    "is a violation",
    "creates a citation",
    "will be cited",
    "non-compliant",
    "noncompliant",
    "must comply",
    "regulatory violation"
  ];

  static validate(result: CorrectiveActionStrategyResult): string[] {
    const errors: string[] = [];
    
    if (!result.strategyVersion) errors.push('Missing strategyVersion');
    if (!result.advisoryBoundary) errors.push('Missing advisoryBoundary');
    if (!result.actionPosture) errors.push('Missing actionPosture');
    
    const resultString = JSON.stringify(result).toLowerCase();
    for (const phrase of this.prohibitedPhrases) {
        if (resultString.includes(phrase)) {
            errors.push(`Prohibited language detected: ${phrase}`);
        }
    }
    
    return errors;
  }
}
