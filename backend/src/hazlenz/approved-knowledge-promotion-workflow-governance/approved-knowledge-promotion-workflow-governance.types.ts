export type PromotionDecision = 'ready_for_final_review' | 'needs_revision' | 'merge_review_required' | 'escalated_review_required' | 'blocked';
export type PromotionReadinessLevel = 'ready' | 'partially_ready' | 'weak' | 'not_ready';

export interface SourceCandidateStatus {
  intakeDecision: string;
  authorityTier: string;
  agency: string;
  jurisdiction: string;
  citation: string;
  title: string;
  sourceDateStatus: string;
  mappingConfidence: string;
}

export interface ReviewerWorkflow {
  primaryReviewerRequired: boolean;
  secondaryReviewerRequired: boolean;
  legalOrComplianceReviewRequired: boolean;
  mergeReviewRequired: boolean;
  sourceOwnerReviewRequired: boolean;
  requiredReviewerRoles: string[];
}

export interface ReadinessChecks {
  sourceAuthorityAccepted: boolean;
  sourceQualityAccepted: boolean;
  duplicateResolved: boolean;
  mappingAccepted: boolean;
  freshnessAccepted: boolean;
  reviewerApprovalPresent: boolean;
  advisoryBoundaryAccepted: boolean;
}

export interface LockedPromotionFields {
  agency: string;
  authorityTier: string;
  jurisdiction: string;
  citation: string;
  title: string;
  sourceUrl: string;
  effectiveDate: string;
  revisionDate: string;
  standardFamily: string;
  hazardFamilies: string[];
  mechanisms: string[];
  equipmentGroups: string[];
  applicabilitySignals: string[];
}

export interface AdvisoryGuardrails {
  advisoryOnly: boolean;
  doesNotDeclareViolation: boolean;
  doesNotCreateCitation: boolean;
  requiresQualifiedReview: boolean;
}

export interface ApprovedKnowledgePromotionWorkflowGovernanceOutput {
  engine: string;
  version: string;
  promotionDecision: PromotionDecision;
  promotionReadinessLevel: PromotionReadinessLevel;
  sourceCandidateStatus: SourceCandidateStatus;
  requiredPromotionApprovals: string[];
  reviewerWorkflow: ReviewerWorkflow;
  readinessChecks: ReadinessChecks;
  lockedPromotionFields: LockedPromotionFields;
  unresolvedIssues: string[];
  blockedReasons: string[];
  governanceWarnings: string[];
  auditTrailRequirements: string[];
  decisionTrace: string[];
  advisoryGuardrails: AdvisoryGuardrails;
}
