import { ApprovedKnowledgeRecord, AuthorityAgency, AuthorityTier, Jurisdiction, SourceDateStatus } from '../approved-knowledge-registry/approved-knowledge-record.types';

export type IngestionCandidateStatus = 'approved_candidate' | 'needs_review' | 'rejected' | 'blocked';
export type IngestionWriteTarget = 'draft_only' | 'none';
export type PromotionStatus = 'promoted' | 'rejected' | 'held_for_review' | 'blocked';

export interface SourceIngestionInput {
  sourceId: string;
  agency: string;
  jurisdiction: string;
  authorityTier: string;
  citation: string;
  title: string;
  sourceUrl: string;
  effectiveDate: string;
  revisionDate: string;
  verifiedAt: string;
  sourceDateStatus: string;
  sourceText: string;
  mappedDomainId: string;
  mappedStandardFamily: string;
  mappedHazardFamilies: string[];
  mappedMechanisms: string[];
  mappedEquipmentGroups: string[];
  mappedTaskContexts: string[];
  applicabilitySignals: string[];
  requiredFacts: string[];
  disqualifyingFacts: string[];
  evidenceQuestions: string[];
  submittedBy: string;
  reviewerRole: string;
}

export interface DuplicateConflictAnalysis {
  duplicateStatus: 'none' | 'possible_duplicate' | 'exact_duplicate';
  conflictStatus: 'none' | 'metadata_conflict' | 'applicability_conflict' | 'authority_conflict' | 'freshness_conflict';
  matchedExistingRecordIds: string[];
  conflictReasons: string[];
  recommendedDisposition: string;
}

export interface IngestionDraftCandidate {
  candidateId: string;
  candidateStatus: IngestionCandidateStatus;
  writeTarget: IngestionWriteTarget;
  mayPromoteToApproved: boolean;
  normalizedSource: any;
  mapping: any;
  duplicateAnalysis: DuplicateConflictAnalysis;
  freshnessAnalysis: any;
  jurisdictionAnalysis: any;
  reviewerQuestions: string[];
  requiredReviewerChecks: string[];
  governanceWarnings: string[];
  advisoryBoundary: string;
}

export interface PromotionDecisionInput {
  candidate: IngestionDraftCandidate;
  reviewerDecision: 'approve' | 'reject' | 'hold_for_review';
  reviewerName: string;
  reviewerRole: string;
  reviewerNotes: string;
  sourceVerified: boolean;
  duplicateReviewed: boolean;
  jurisdictionConfirmed: boolean;
}

export interface PromotionResult {
  promotionStatus: PromotionStatus;
  canWriteApprovedRegistry: boolean;
  reasons: string[];
  approvedRecordDraft?: ApprovedKnowledgeRecord;
  auditTrail: any;
}
