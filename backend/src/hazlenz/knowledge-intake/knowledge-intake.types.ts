export type AuthorityTier = 'federal_regulation' | 'agency_policy' | 'industry_standard' | 'expert_reference';
export type SourceType = 'cfr' | 'interpretation_letter' | 'policy_manual' | 'accident_report' | 'technical_standard';
export type ReviewStatus = 'unreviewed' | 'pending_review' | 'approved_by_human' | 'rejected';
export type HazardDomain = 'electrical' | 'chemical' | 'mechanical' | 'structural' | 'operational';
export type KnowledgeUseBoundary = 'advisory' | 'mandatory' | 'prohibited';

export interface SourceMetadata {
  authorityTier: AuthorityTier;
  sourceType: SourceType;
  jurisdiction: string;
}

export interface KnowledgeRecord {
  recordId: string;
  sourceAuthority: string;
  sourceType: SourceType;
  authorityTier: AuthorityTier;
  citation: string;
  title: string;
  sourceUrl: string;
  retrievedAt: string;
  jurisdiction: string;
  hazardDomains: HazardDomain[];
  applicabilityTriggers: string[];
  standardIntent: string;
  evidenceNeeded: string[];
  nonApplicabilityQuestions: string[];
  sourceBoundary: KnowledgeUseBoundary;
  reviewStatus: ReviewStatus;
  approvedForUse: boolean;
}
