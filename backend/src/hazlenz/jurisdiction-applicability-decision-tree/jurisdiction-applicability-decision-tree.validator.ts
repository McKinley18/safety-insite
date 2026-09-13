import { JurisdictionApplicabilityResult } from './jurisdiction-applicability-decision-tree.types';

export class JurisdictionApplicabilityValidator {
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

  static validate(result: JurisdictionApplicabilityResult): string[] {
    const errors: string[] = [];
    
    if (!result.primaryJurisdiction) errors.push('Missing primaryJurisdiction');
    if (!result.applicabilityStatus) errors.push('Missing applicabilityStatus');
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
