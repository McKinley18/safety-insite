export type CandidateStatus = 
  | 'pending_review' 
  | 'needs_more_information' 
  | 'approved_for_promotion' 
  | 'rejected' 
  | 'blocked' 
  | 'archived';

export type CandidateType = 'human_review_learning' | 'source_ingestion' | 'draft_candidate' | 'reasoning_candidate';

export interface ReviewerCandidate {
  candidateId: string;
  candidateType: CandidateType;
  sourceSystem: string;
  createdAt: string;
  status: CandidateStatus;
  priority: 'critical' | 'high' | 'medium' | 'low';
  domainIds: string[];
  hazardFamilies: string[];
  mechanisms: string[];
  jurisdiction: string;
  authorityTier: string;
  sourceReferences: string[];
  summary: string;
  proposedKnowledgeText?: string;
  proposedChange?: any;
  evidenceBasis: string;
  governanceFlags: string[];
  requiredReviewSteps: string[];
  reviewerDecision?: string;
  reviewerRationale?: string;
  auditTrail: CandidateAuditEntry[];
}

export interface CandidateAuditEntry {
  action: string;
  timestamp: string;
  actor: string;
  role: string;
  notes?: string;
}

export interface CandidateFilter {
  status?: CandidateStatus;
  candidateType?: CandidateType;
  authorityTier?: string;
  jurisdiction?: string;
  domainId?: string;
  priority?: string;
}
