import { IngestionDraftCandidate, PromotionResult } from './source-ingestion-approved-update-workflow.types';

export class SourceIngestionApprovedUpdateWorkflowValidator {
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

  static validateCandidate(candidate: IngestionDraftCandidate): string[] {
    const errors: string[] = [];
    
    if (!candidate.candidateId) errors.push('Missing candidateId');
    if (!candidate.candidateStatus) errors.push('Missing candidateStatus');
    if (!candidate.advisoryBoundary) errors.push('Missing advisoryBoundary');
    
    const resultString = JSON.stringify(candidate).toLowerCase();
    for (const phrase of this.prohibitedPhrases) {
        if (resultString.includes(phrase)) {
            errors.push(`Prohibited language detected: ${phrase}`);
        }
    }
    
    return errors;
  }

  static validatePromotion(result: PromotionResult): string[] {
    const errors: string[] = [];
    
    if (!result.promotionStatus) errors.push('Missing promotionStatus');
    if (!result.auditTrail) errors.push('Missing auditTrail');
    
    const resultString = JSON.stringify(result).toLowerCase();
    for (const phrase of this.prohibitedPhrases) {
        if (resultString.includes(phrase)) {
            errors.push(`Prohibited language detected: ${phrase}`);
        }
    }
    
    return errors;
  }
}
