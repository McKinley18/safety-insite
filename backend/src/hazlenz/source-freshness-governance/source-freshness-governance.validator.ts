import { SourceFreshnessGovernanceResult } from './source-freshness-governance.types';

export class SourceFreshnessGovernanceValidator {
  private static prohibitedPhrases = [
    "is a violation",
    "creates a citation",
    "will be cited",
    "non-compliant",
    "noncompliant",
    "must comply",
    "regulatory violation",
    "final legal compliance"
  ];

  static validate(result: SourceFreshnessGovernanceResult): string[] {
    const errors: string[] = [];
    
    if (!result.freshnessStatus) errors.push('Missing freshnessStatus');
    if (!result.authorityStatus) errors.push('Missing authorityStatus');
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
