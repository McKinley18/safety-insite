import { ReviewerCandidate } from './reviewer-candidate-console.types';

export class ReviewerCandidateConsoleValidator {
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

  static validateCandidate(candidate: ReviewerCandidate): string[] {
    const errors: string[] = [];
    
    if (!candidate.candidateId) errors.push('Missing candidateId');
    if (!candidate.status) errors.push('Missing status');
    if (candidate.auditTrail.length === 0) errors.push('Missing auditTrail');
    
    const resultString = JSON.stringify(candidate).toLowerCase();
    for (const phrase of this.prohibitedPhrases) {
        if (resultString.includes(phrase)) {
            errors.push(`Prohibited language detected: ${phrase}`);
        }
    }
    
    return errors;
  }
}
