import { SemanticSynonymExpansionResult } from './semantic-synonym-expansion.types';

export class SemanticSynonymExpansionValidator {
  private static prohibitedPhrases = [
    "is a violation",
    "creates a citation",
    "will be cited",
    "non-compliant",
    "noncompliant",
    "must comply",
    "regulatory violation",
    "final legal compliance",
    "legal determination",
    "definitive violation"
  ];

  static validate(result: SemanticSynonymExpansionResult): string[] {
    const errors: string[] = [];
    
    if (!result.version) errors.push('Missing version');
    if (!result.normalizedObservationText) errors.push('Missing normalizedObservationText');
    if (!result.advisoryBoundary) errors.push('Missing advisoryBoundary');
    if (result.semanticConfidenceScore === undefined) errors.push('Missing semanticConfidenceScore');
    
    const resultString = JSON.stringify(result).toLowerCase();
    for (const phrase of this.prohibitedPhrases) {
        if (resultString.includes(phrase)) {
            errors.push(`Prohibited language detected: ${phrase}`);
        }
    }
    
    return errors;
  }
}
