import {
  KnowledgeQueueAuditEvent,
  KnowledgeQueueGovernanceTrace,
} from './knowledge-review-queue.api-types';
import { KnowledgeQueueGuardrails } from './knowledge-review-queue.service';

export type KnowledgeQueueSerializedPayload = string;

export interface KnowledgeQueueRecordRow {
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
  governanceTrace?: KnowledgeQueueGovernanceTrace;
  originalPayload: KnowledgeQueueSerializedPayload;
}

export interface KnowledgeQueueAuditEventRow {
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
  guardrailSnapshot: KnowledgeQueueGuardrails;
  governanceTrace?: KnowledgeQueueGovernanceTrace;
  originalPayload: KnowledgeQueueSerializedPayload;
}

export interface KnowledgeQueuePersistenceSnapshot {
  records: KnowledgeQueueRecordRow[];
  auditEvents: KnowledgeQueueAuditEventRow[];
  generatedAt: string;
  activeRetrievalRecordIds: string[];
}

export interface KnowledgeQueuePersistenceLayerReadiness {
  persistenceLayerDefined: boolean;
  entitiesDefined: boolean;
  repositoryPortDefined: boolean;
  inMemoryValidationRepositoryDefined: boolean;
  databaseMigrationReady: boolean;
  durablePersistenceReady: boolean;
  externalDatabaseRequiredForValidation: boolean;
}

export interface KnowledgeQueuePersistRecordMetadata {
  governanceTrace?: KnowledgeQueueGovernanceTrace;
  activeRetrievalEligible?: boolean;
  activeRetrievalChangedAt?: string;
}

export interface KnowledgeQueuePersistenceAdapterPort {
  persistEnvelope(envelope: any): Promise<void>;
  persistRecord(record: any, metadata?: KnowledgeQueuePersistRecordMetadata): Promise<KnowledgeQueueRecordRow>;
  persistAuditEvent(
    auditEvent: KnowledgeQueueAuditEvent,
    governanceTrace?: KnowledgeQueueGovernanceTrace,
  ): Promise<KnowledgeQueueAuditEventRow>;
  hydrateStore(): Promise<KnowledgeQueueRecordRow[]>;
  listActiveRetrievalRecords(): Promise<KnowledgeQueueRecordRow[]>;
  exportPersistenceSnapshot(): Promise<KnowledgeQueuePersistenceSnapshot>;
  persistenceReadiness(): KnowledgeQueuePersistenceLayerReadiness;
}
