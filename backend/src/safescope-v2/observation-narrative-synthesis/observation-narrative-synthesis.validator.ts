import { ObservationNarrativeSynthesisResult } from './observation-narrative-synthesis.types';

export class ObservationNarrativeSynthesisValidator {
  private static prohibitedPhrases = [
    "is a violation",
    "creates a citation",
    "will be cited",
    "non-compliant",
    "noncompliant",
    "must comply",
    "regulatory violation"
  ];

  static validate(result: ObservationNarrativeSynthesisResult): string[] {
    const errors: string[] = [];
    
    if (!result.version) errors.push('Missing version');
    if (!result.narrativeSummary) errors.push('Missing narrativeSummary');
    if (!result.advisoryBoundary) errors.push('Missing advisoryBoundary');
    
    const resultString = JSON.stringify(result).toLowerCase();
    for (const phrase of this.prohibitedPhrases) {
        if (resultString.includes(phrase)) {
            errors.push(`Prohibited language detected: ${phrase}`);
        }
    }
    
    return errors;
  }
}
