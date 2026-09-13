export type AuthorityTier = 
  | 'primary_regulation'
  | 'official_agency_guidance'
  | 'consensus_standard_reference'
  | 'company_policy'
  | 'internal_interpretive_note'
  | 'unapproved_reference';

export type ApprovalStatus = 'draft' | 'pending_review' | 'approved' | 'deprecated' | 'rejected';

export type ApprovedSourceRecord = {
  id: string;
  title: string;
  sourceType: string;
  agency: string;
  jurisdiction: string;
  industryScope: string[];
  authorityTier: AuthorityTier;
  sourceUrl?: string;
  sourceReference?: string;
  citation?: string;
  citationFamily?: string;
  standardFamily?: string;
  hazardDomains?: string[];
  evidenceRequiredBeforeUse?: string[];
  effectiveDate?: string;
  lastReviewedDate?: string;
  nextReviewDueDate?: string;
  approvalStatus: ApprovalStatus;
  approvedBy?: string;
  version: string;
  supersedes?: string;
  supersededBy?: string;
  deprecated: boolean;
  duplicateOf?: string;
  duplicateRiskSignals: string[];
  applicabilityNotes?: string[];
  prohibitedUses: string[];
  advisoryGuardrails: {
    advisoryOnly: boolean;
    doesNotDeclareViolation: boolean;
    requiresQualifiedReview: boolean;
  };
  traceNotes: string[];
};
