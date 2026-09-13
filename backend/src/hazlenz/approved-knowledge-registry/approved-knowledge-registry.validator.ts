import { ApprovedKnowledgeRecord } from './approved-knowledge-record.types';

export class ApprovedKnowledgeRegistryValidator {
  private static prohibitedPhrases = [
    "is a violation",
    "creates a citation",
    "will be cited",
    "non-compliant",
    "noncompliant",
    "must comply",
    "regulatory violation"
  ];

  static validate(record: ApprovedKnowledgeRecord): string[] {
    const errors: string[] = [];

    if (!record.recordId) errors.push('Missing recordId');
    
    // Prohibited language check
    const recordString = JSON.stringify(record).toLowerCase();
    for (const phrase of this.prohibitedPhrases) {
      if (recordString.includes(phrase)) {
        errors.push(`Prohibited language detected: ${phrase}`);
      }
    }

    // Governance guardrails
    if (!record.governance.advisoryOnly || 
        !record.governance.doesNotDeclareViolation || 
        !record.governance.doesNotCreateCitation || 
        !record.governance.requiresQualifiedReview) {
      errors.push('Weakened advisory guardrails detected');
    }

    // Status-specific validation
    if (record.status === 'approved') {
      if (!record.governance.approvedBy || !record.governance.approvedAt || !record.governance.reviewerRole || !record.governance.changeReason) {
        errors.push('Missing required governance fields for approved record');
      }
      if (record.authority.authorityTier === 'primary_regulation' || record.authority.authorityTier === 'official_guidance') {
          if (!record.authority.citation || !record.authority.title || !record.authority.jurisdiction || !record.authority.sourceUrl) {
              errors.push('Missing required source metadata for approved regulation/guidance');
          }
      }
      if (record.mapping.hazardFamilies.length === 0 || record.mapping.mechanisms.length === 0 || record.mapping.applicabilitySignals.length === 0 || record.mapping.evidenceQuestions.length === 0) {
          errors.push('Missing required mapping completeness for approved record');
      }
    }

    return errors;
  }
}
