import { ApprovedKnowledgeRecord } from '../approved-knowledge-registry/approved-knowledge-record.types';
import { PromotionMetadata } from './approved-knowledge-promotion-v1.types';

export class ApprovedKnowledgePromotionValidator {
  private static prohibitedPhrases = [
    "is a violation",
    "creates a citation",
    "will be cited",
    "non-compliant",
    "noncompliant",
    "must comply",
    "regulatory violation"
  ];

  static validatePromotion(record: ApprovedKnowledgeRecord, metadata: PromotionMetadata): string[] {
    const errors: string[] = [];

    // Metadata validation
    if (!metadata.approvedBy) errors.push('Missing approvedBy');
    if (!metadata.sourceVerified) errors.push('Source not verified');

    // Authority validation
    if (record.authority.agency === 'UNKNOWN') errors.push('Agency cannot be UNKNOWN');
    if (record.authority.authorityTier === 'unknown') errors.push('Authority tier cannot be unknown');
    if (record.authority.sourceUrl === 'source_review_required') errors.push('Source URL not resolved');
    if (record.authority.citation === 'source_review_required') errors.push('Citation not resolved');
    if (record.authority.sourceDateStatus === 'outdated') errors.push('Outdated source cannot be approved');

    // Mapping completeness
    if (record.mapping.hazardFamilies.length === 0 || 
        record.mapping.mechanisms.length === 0 || 
        record.mapping.applicabilitySignals.length === 0 || 
        record.mapping.evidenceQuestions.length === 0) {
        errors.push('Missing required mapping completeness');
    }

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

    return errors;
  }
}
