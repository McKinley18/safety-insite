export interface NormalizedCitation {
  canonical: string;
  original: string;
  agency: string;
  parts: string[];
  isPlaceholder: boolean;
}

export type DuplicateClassification = 
  | 'no_duplicate'
  | 'shared_citation_allowed'
  | 'duplicate_blocked'
  | 'overlap_review_required'
  | 'placeholder_review_required';

export interface DeduplicationResult {
  status: DuplicateClassification;
  normalizedCitation: string;
  reason: string;
  conflictingRecordIds: string[];
}
