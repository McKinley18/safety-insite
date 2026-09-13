import { DeduplicationResult } from './approved-knowledge-citation-normalization.types';

export class ApprovedKnowledgeCitationNormalizationValidator {
  
  static validateDeduplication(result: DeduplicationResult): string[] {
    const errors: string[] = [];
    
    if (!result.status) errors.push('Missing status');
    if (!result.normalizedCitation) errors.push('Missing normalizedCitation');
    
    if (result.status === 'duplicate_blocked' && result.conflictingRecordIds.length === 0) {
        errors.push('Status duplicate_blocked but no conflicting record IDs provided.');
    }

    if (result.status === 'overlap_review_required' && result.conflictingRecordIds.length === 0) {
        errors.push('Status overlap_review_required but no conflicting record IDs provided.');
    }
    
    return errors;
  }
}
