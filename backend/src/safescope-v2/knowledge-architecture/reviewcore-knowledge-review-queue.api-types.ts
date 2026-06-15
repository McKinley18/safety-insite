import { ReviewCoreQueueGuardrails } from './reviewcore-knowledge-review-queue.service';

export type ReviewCoreQueueActorRole =
  | 'owner'
  | 'admin'
  | 'compliance_admin'
  | 'safety_manager'
  | 'field_inspector'
  | 'viewer';

export type ReviewCoreQueuePlanTier = 'individual' | 'team' | 'company';

export type ReviewCoreQueueActionType =
  | 'list_queue'
  | 'get_queue_item'
  | 'create_draft'
  | 'approve'
  | 'reject'
  | 'request_more_info'
  | 'supersede'
  | 'list_active_retrieval_records'
  | 'export_queue_snapshot'
  | 'persistence_readiness';

export interface ReviewCoreQueueActor {
  actorId: string;
  role: ReviewCoreQueueActorRole;
  planTier: ReviewCoreQueuePlanTier;
}

export interface ReviewCoreCreateDraftRequest {
  id?: string;
  title?: string;
  content?: string;
  domain?: string;
  tags?: string[];
  authorityTier?: string;
  primaryCitation?: string;
  fingerprint?: string;
  status?: string;
  [key: string]: unknown;
}

export interface ReviewCoreApproveRequest {
  reason?: string;
}

export interface ReviewCoreRejectRequest {
  reason: string;
}

export interface ReviewCoreRequestMoreInfoRequest {
  reason: string;
}

export interface ReviewCoreSupersedeRequest {
  replacementInput: Record<string, unknown>;
}

export interface ReviewCoreQueueGovernanceTrace {
  advisoryOnly: true;
  qualifiedReviewRequired: true;
  activeRetrievalChanged: boolean;
  activeRetrievalEligible: boolean;
  approvalReadinessBlockers: string[];
  sourceReferenceRequired: boolean;
  actorAuthorized: boolean;
  planAuthorized: boolean;
  blockedReason?: string;
  retrievalBoundary: 'Only approved/governed records are eligible for active retrieval.';
}

export interface ReviewCoreQueueAuditEvent {
  eventId: string;
  action: ReviewCoreQueueActionType;
  actorId: string;
  actorRole: ReviewCoreQueueActorRole;
  planTier: ReviewCoreQueuePlanTier;
  recordId?: string;
  timestamp: string;
  allowed: boolean;
  denied: boolean;
  reason?: string;
  blockers: string[];
  beforeStatus?: string;
  afterStatus?: string;
  activeRetrievalEligible: boolean;
  guardrailSnapshot: ReviewCoreQueueGuardrails;
}

export interface ReviewCoreQueueResponseEnvelope<T = unknown> {
  data: T;
  guardrails: ReviewCoreQueueGuardrails;
  governanceTrace: ReviewCoreQueueGovernanceTrace;
  auditEvent?: ReviewCoreQueueAuditEvent;
  auditEvents?: ReviewCoreQueueAuditEvent[];
  generatedAt: string;
}

export interface ReviewCoreQueueSnapshotEnvelope<T = unknown> extends ReviewCoreQueueResponseEnvelope<T> {
  auditEvents?: ReviewCoreQueueAuditEvent[];
}

export interface ReviewCoreQueuePersistenceReadiness {
  routeScaffoldReady: boolean;
  authGuardReady: boolean;
  auditLogReady: boolean;
  databaseMigrationReady: false;
  durablePersistenceReady: false;
  frontendApiWiringReady: boolean;
  remainingRequirements: string[];
}

export interface ReviewCoreQueueGuardDecision {
  allowed: boolean;
  reason: string;
  actorAuthorized: boolean;
  planAuthorized: boolean;
}
