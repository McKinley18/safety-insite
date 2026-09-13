import { KnowledgeQueueGuardrails } from './knowledge-review-queue.service';

export type KnowledgeQueueActorRole =
  | 'owner'
  | 'admin'
  | 'compliance_admin'
  | 'safety_manager'
  | 'field_inspector'
  | 'viewer';

export type KnowledgeQueuePlanTier = 'individual' | 'team' | 'company';

export type KnowledgeQueueActionType =
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

export interface KnowledgeQueueActor {
  actorId: string;
  role: KnowledgeQueueActorRole;
  planTier: KnowledgeQueuePlanTier;
}

export interface KnowledgeCreateDraftRequest {
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

export interface KnowledgeApproveRequest {
  reason?: string;
}

export interface KnowledgeRejectRequest {
  reason: string;
}

export interface KnowledgeRequestMoreInfoRequest {
  reason: string;
}

export interface KnowledgeSupersedeRequest {
  replacementInput: Record<string, unknown>;
}

export interface KnowledgeQueueGovernanceTrace {
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

export interface KnowledgeQueueAuditEvent {
  eventId: string;
  action: KnowledgeQueueActionType;
  actorId: string;
  actorRole: KnowledgeQueueActorRole;
  planTier: KnowledgeQueuePlanTier;
  recordId?: string;
  timestamp: string;
  allowed: boolean;
  denied: boolean;
  reason?: string;
  blockers: string[];
  beforeStatus?: string;
  afterStatus?: string;
  activeRetrievalEligible: boolean;
  guardrailSnapshot: KnowledgeQueueGuardrails;
}

export interface KnowledgeQueueResponseEnvelope<T = unknown> {
  data: T;
  guardrails: KnowledgeQueueGuardrails;
  governanceTrace: KnowledgeQueueGovernanceTrace;
  auditEvent?: KnowledgeQueueAuditEvent;
  auditEvents?: KnowledgeQueueAuditEvent[];
  generatedAt: string;
}

export interface KnowledgeQueueSnapshotEnvelope<T = unknown> extends KnowledgeQueueResponseEnvelope<T> {
  auditEvents?: KnowledgeQueueAuditEvent[];
}

export interface KnowledgeQueuePersistenceReadiness {
  routeScaffoldReady: boolean;
  authGuardReady: boolean;
  auditLogReady: boolean;
  databaseMigrationReady: false;
  durablePersistenceReady: false;
  frontendApiWiringReady: boolean;
  remainingRequirements: string[];
}

export interface KnowledgeQueueGuardDecision {
  allowed: boolean;
  reason: string;
  actorAuthorized: boolean;
  planAuthorized: boolean;
}
