export type WriteDecision = 'allow_write_candidate' | 'hold_for_review' | 'reject_write' | 'blocked';

export interface WritePermission {
  canWriteApprovedKnowledge: boolean;
  canCreateDraftCandidate: boolean;
  canUpdateExistingRecord: boolean;
  canMergeDuplicate: boolean;
  requiresFinalReviewerApproval: boolean;
}

export interface RequiredInputs {
  sourceIntakeDecision: string;
  promotionDecision: string;
  reviewerApprovalPresent: boolean;
  auditTrailPresent: boolean;
  duplicateResolved: boolean;
  versioningPresent: boolean;
  changeReasonPresent: boolean;
}

export interface RegistryRecordReadiness {
  readyForDraft: boolean;
  readyForApprovedRegistry: boolean;
  missingReadinessItems: string[];
}

export interface DuplicateWriteGuard {
  possibleDuplicate: boolean;
  duplicateResolved: boolean;
  allowedAction: 'none' | 'create_new' | 'update_existing' | 'merge_existing' | 'reject_duplicate';
  reasons: string[];
}

export interface VersioningGuard {
  requiresVersionIncrement: boolean;
  previousVersion: string;
  proposedVersion: string;
  changeReasonRequired: boolean;
  versioningWarnings: string[];
}

export interface ReviewerApprovalGuard {
  approvalRequired: boolean;
  approvalPresent: boolean;
  approverRoleAccepted: boolean;
  requiredApproverRoles: string[];
  approvalWarnings: string[];
}

export interface AuditGuard {
  auditRequired: boolean;
  auditTrailPresent: boolean;
  requiredAuditFields: string[];
  missingAuditFields: string[];
}

export interface AdvisoryGuardrails {
  advisoryOnly: boolean;
  doesNotDeclareViolation: boolean;
  doesNotCreateCitation: boolean;
  requiresQualifiedReview: boolean;
}

export interface ApprovedKnowledgeRegistryWriteGuardOutput {
  engine: string;
  version: string;
  writeDecision: WriteDecision;
  writePermission: WritePermission;
  requiredInputs: RequiredInputs;
  registryRecordReadiness: RegistryRecordReadiness;
  duplicateWriteGuard: DuplicateWriteGuard;
  versioningGuard: VersioningGuard;
  reviewerApprovalGuard: ReviewerApprovalGuard;
  auditGuard: AuditGuard;
  blockedReasons: string[];
  governanceWarnings: string[];
  decisionTrace: string[];
  advisoryGuardrails: AdvisoryGuardrails;
}
