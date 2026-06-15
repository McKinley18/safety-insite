import {
  ReviewCoreQueueAuditEvent,
  ReviewCoreQueueGovernanceTrace,
} from './reviewcore-knowledge-review-queue.api-types';
import { ReviewCoreQueueGuardrails } from './reviewcore-knowledge-review-queue.service';

export type ReviewCoreQueueSerializedPayload = string;

export interface ReviewCoreQueueRecordRow {
  id: string;
  title: string;
  content: string;
  domain: string;
  tags: string[];
  authorityTier: string;
  status: string;
  primaryCitation: string | null;
  fingerprint: string;
  guardrails: Record<string, unknown>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  supersededBy?: string;
  supersededAt?: string;
  replacementRecordId?: string;
  activeRetrievalEligible: boolean;
  activeRetrievalChangedAt?: string;
  governanceTrace?: ReviewCoreQueueGovernanceTrace;
  originalPayload: ReviewCoreQueueSerializedPayload;
}

export interface ReviewCoreQueueAuditEventRow {
  eventId: string;
  action: string;
  actorId: string;
  actorRole: string;
  planTier: string;
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
  governanceTrace?: ReviewCoreQueueGovernanceTrace;
  originalPayload: ReviewCoreQueueSerializedPayload;
}

export interface ReviewCoreQueuePersistenceSnapshot {
  records: ReviewCoreQueueRecordRow[];
  auditEvents: ReviewCoreQueueAuditEventRow[];
  generatedAt: string;
  activeRetrievalRecordIds: string[];
}

export interface ReviewCoreQueuePersistenceLayerReadiness {
  persistenceLayerDefined: boolean;
  entitiesDefined: boolean;
  repositoryPortDefined: boolean;
  inMemoryValidationRepositoryDefined: boolean;
  databaseMigrationReady: boolean;
  durablePersistenceReady: boolean;
  externalDatabaseRequiredForValidation: boolean;
}

export interface ReviewCoreQueuePersistRecordMetadata {
  governanceTrace?: ReviewCoreQueueGovernanceTrace;
  activeRetrievalEligible?: boolean;
  activeRetrievalChangedAt?: string;
}

export interface ReviewCoreQueuePersistenceAdapterPort {
  persistEnvelope(envelope: any): Promise<void>;
  persistRecord(record: any, metadata?: ReviewCoreQueuePersistRecordMetadata): Promise<ReviewCoreQueueRecordRow>;
  persistAuditEvent(
    auditEvent: ReviewCoreQueueAuditEvent,
    governanceTrace?: ReviewCoreQueueGovernanceTrace,
  ): Promise<ReviewCoreQueueAuditEventRow>;
  hydrateStore(): Promise<ReviewCoreQueueRecordRow[]>;
  listActiveRetrievalRecords(): Promise<ReviewCoreQueueRecordRow[]>;
  exportPersistenceSnapshot(): Promise<ReviewCoreQueuePersistenceSnapshot>;
  persistenceReadiness(): ReviewCoreQueuePersistenceLayerReadiness;
}
