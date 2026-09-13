import { RiskVerificationResidualRiskResult } from './risk-verification-residual-risk.types';

export class RiskVerificationResidualRiskValidator {
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

  static validate(result: RiskVerificationResidualRiskResult): string[] {
    const errors: string[] = [];
    
    if (!result.verificationStatus) errors.push('Missing verificationStatus');
    if (!result.residualRiskLevel) errors.push('Missing residualRiskLevel');
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
