import { OfflineReasoningResult } from './offline-reasoning-mobile-resilience.types';

export class OfflineReasoningMobileResilienceValidator {
  private static prohibitedPhrases = [
    "is a violation",
    "creates a citation",
    "must comply",
    "regulatory violation",
    "definitive violation"
  ];

  static validate(result: OfflineReasoningResult): string[] {
    const errors: string[] = [];
    
    if (result.mode !== 'offline_limited_advisory') errors.push('Invalid mode for offline result');
    if (result.confidenceCeiling > 0.5) errors.push('Confidence ceiling too high for offline mode');
    if (!result.offlineTraceId) errors.push('Missing offlineTraceId');
    if (!result.advisoryBoundary) errors.push('Missing advisoryBoundary');
    
    const resultString = JSON.stringify(result).toLowerCase();
    for (const phrase of this.prohibitedPhrases) {
        if (resultString.includes(phrase)) {
            errors.push('Prohibited language detected in offline result: ' + phrase);
        }
    }
    
    return errors;
  }
}
