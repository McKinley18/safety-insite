import { CrossDomainCausalChainResult } from './cross-domain-causal-chain.types';

export class CrossDomainCausalChainValidator {
  private static prohibitedPhrases = [
    "is a violation",
    "creates a citation",
    "will be cited",
    "non-compliant",
    "noncompliant",
    "must comply",
    "regulatory violation"
  ];

  static validate(result: CrossDomainCausalChainResult): string[] {
    const errors: string[] = [];
    
    if (!result.version) errors.push('Missing version');
    if (!result.advisoryBoundary) errors.push('Missing advisoryBoundary');
    if (result.doesNotDeclareViolation !== true) errors.push('doesNotDeclareViolation must be true');
    if (result.requiresQualifiedReview !== true) errors.push('requiresQualifiedReview must be true');
    
    const resultString = JSON.stringify(result).toLowerCase();
    for (const phrase of this.prohibitedPhrases) {
        if (resultString.includes(phrase)) {
            errors.push(`Prohibited language detected: ${phrase}`);
        }
    }
    
    return errors;
  }
}
