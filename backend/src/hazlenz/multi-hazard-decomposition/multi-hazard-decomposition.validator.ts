import { MultiHazardDecompositionResult } from './multi-hazard-decomposition.types';

export class MultiHazardDecompositionValidator {
  private static prohibitedPhrases = [
    "is a violation",
    "creates a citation",
    "will be cited",
    "non-compliant",
    "noncompliant",
    "must comply",
    "regulatory violation"
  ];

  static validate(result: MultiHazardDecompositionResult): string[] {
    const errors: string[] = [];
    
    if (!result.version) errors.push('Missing version');
    if (!result.advisoryBoundary) errors.push('Missing advisoryBoundary');
    
    const resultString = JSON.stringify(result).toLowerCase();
    for (const phrase of this.prohibitedPhrases) {
        if (resultString.includes(phrase)) {
            errors.push(`Prohibited language detected: ${phrase}`);
        }
    }
    
    for (const hazard of result.hazards) {
        if (!hazard.hazardId) errors.push('Missing hazardId');
        if (!hazard.domainId) errors.push('Missing domainId');
        if (hazard.confidence === undefined) errors.push('Missing confidence');
    }
    
    return errors;
  }
}
