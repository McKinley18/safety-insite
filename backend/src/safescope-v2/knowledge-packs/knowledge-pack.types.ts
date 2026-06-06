export interface KnowledgePack {
  packId: string;
  jurisdiction: string;
  authorityTier: string;
  sourcePolicy: string;
  approvedRecordIds: string[];
  draftCandidateIds: string[];
  retiredRecordIds: string[];
  validationStatus: 'valid' | 'invalid' | 'needs_review';
  lastReviewedAt: string;
  governanceWarnings: string[];
}
