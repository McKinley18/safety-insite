export type FreshnessStatus = 'current' | 'stale' | 'unknown' | 'superseded' | 'missing_source_date' | 'review_required';

export type AuthorityStatus = 
  | 'primary_authority' 
  | 'official_guidance' 
  | 'consensus_reference' 
  | 'company_policy' 
  | 'unknown_authority';

export type UseRestriction = 'allowed' | 'caution' | 'review_required' | 'blocked';

export interface SourceFreshnessInput {
  sourceUrl?: string;
  agency?: string;
  citation?: string;
  title?: string;
  effectiveDate?: string;
  revisionDate?: string;
  lastVerifiedAt?: string;
  sourceDateStatus?: string;
  authorityTier?: string;
  sourceType?: string;
  retrievedAt?: string;
  recordStatus?: string;
  supersededBy?: string;
  reviewerNotes?: string;
}

export interface SourceFreshnessGovernanceResult {
  freshnessStatus: FreshnessStatus;
  authorityStatus: AuthorityStatus;
  useRestriction: UseRestriction;
  freshnessScore: number;
  confidenceImpact: number;
  requiredReviewerActions: string[];
  sourceWarnings: string[];
  updateQuestions: string[];
  advisoryBoundary: string;
}
