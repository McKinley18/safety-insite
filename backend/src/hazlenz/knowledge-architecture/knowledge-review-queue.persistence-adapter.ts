import {
  KnowledgeQueueAuditEvent,
  KnowledgeQueueGovernanceTrace,
} from './knowledge-review-queue.api-types';
import {
  KnowledgeQueueAuditEventRow,
  KnowledgeQueuePersistRecordMetadata,
  KnowledgeQueuePersistenceAdapterPort,
  KnowledgeQueuePersistenceLayerReadiness,
  KnowledgeQueuePersistenceSnapshot,
  KnowledgeQueueRecordRow,
} from './knowledge-review-queue.persistence-types';
import {
  InMemoryKnowledgeReviewQueuePersistenceRepository,
  KnowledgeReviewQueuePersistenceRepositoryPort,
} from './knowledge-review-queue.repository';

export { InMemoryKnowledgeReviewQueuePersistenceRepository };

const ACTIVE_STATUSES = new Set(['APPROVED', 'GOVERNED']);

export class KnowledgeReviewQueuePersistenceAdapter implements KnowledgeQueuePersistenceAdapterPort {
  constructor(
    private readonly repository: KnowledgeReviewQueuePersistenceRepositoryPort =
      new InMemoryKnowledgeReviewQueuePersistenceRepository(),
  ) {}

  async persistEnvelope(envelope: any): Promise<void> {
    const record = envelope?.data?.result?.record ?? envelope?.data?.record ?? envelope?.data?.result;
    const auditEvent = envelope?.auditEvent;

    if (record?.id) {
      await this.persistRecord(record, {
        governanceTrace: envelope.governanceTrace,
        activeRetrievalEligible: envelope?.data?.activeRetrievalEligible ?? envelope?.governanceTrace?.activeRetrievalEligible,
      });
    }

    if (auditEvent?.eventId) {
      await this.persistAuditEvent(auditEvent, envelope?.governanceTrace);
    }
  }

  async persistRecord(record: any, metadata: KnowledgeQueuePersistRecordMetadata = {}): Promise<KnowledgeQueueRecordRow> {
    const now = new Date().toISOString();
    const status = String(record.status ?? 'DRAFT');
    const guardrails = record.guardrails ?? {};
    const activeRetrievalEligible = this.computeActiveRetrievalEligibility(record, metadata.activeRetrievalEligible);

    const row: KnowledgeQueueRecordRow = {
      id: record.id,
      title: record.title ?? 'Untitled Knowledge knowledge record',
      content: record.content ?? '',
      domain: record.domain ?? 'uncategorized',
      tags: Array.isArray(record.tags) ? record.tags : [],
      authorityTier: record.authorityTier ?? 'SUPPORTING',
      status,
      primaryCitation: record.primaryCitation ?? record.citation ?? null,
      fingerprint: record.fingerprint ?? `record-${record.id}`,
      guardrails,
      createdBy: record.createdBy ?? record.reviewer ?? 'unknown',
      createdAt: record.createdAt ?? now,
      updatedAt: record.updatedAt ?? now,
      approvedBy: record.approvedBy,
      approvedAt: record.approvedAt,
      rejectedBy: record.rejectedBy,
      rejectedAt: record.rejectedAt,
      supersededBy: record.supersededBy,
      supersededAt: record.supersededAt,
      replacementRecordId: record.replacementRecordId,
      activeRetrievalEligible,
      activeRetrievalChangedAt: activeRetrievalEligible ? metadata.activeRetrievalChangedAt ?? now : undefined,
      governanceTrace: metadata.governanceTrace,
      originalPayload: JSON.stringify(record),
    };

    return this.repository.saveRecord(row);
  }

  async persistAuditEvent(
    auditEvent: KnowledgeQueueAuditEvent,
    governanceTrace?: KnowledgeQueueGovernanceTrace,
  ): Promise<KnowledgeQueueAuditEventRow> {
    const row: KnowledgeQueueAuditEventRow = {
      eventId: auditEvent.eventId,
      action: auditEvent.action,
      actorId: auditEvent.actorId,
      actorRole: auditEvent.actorRole,
      planTier: auditEvent.planTier,
      recordId: auditEvent.recordId,
      timestamp: auditEvent.timestamp,
      allowed: auditEvent.allowed,
      denied: auditEvent.denied,
      reason: auditEvent.reason,
      blockers: auditEvent.blockers ?? [],
      beforeStatus: auditEvent.beforeStatus,
      afterStatus: auditEvent.afterStatus,
      activeRetrievalEligible: auditEvent.activeRetrievalEligible,
      guardrailSnapshot: auditEvent.guardrailSnapshot,
      governanceTrace,
      originalPayload: JSON.stringify(auditEvent),
    };

    return this.repository.saveAuditEvent(row);
  }

  async hydrateStore(): Promise<KnowledgeQueueRecordRow[]> {
    return this.repository.listRecords();
  }

  async listActiveRetrievalRecords(): Promise<KnowledgeQueueRecordRow[]> {
    return this.repository.listActiveRetrievalRecords();
  }

  async exportPersistenceSnapshot(): Promise<KnowledgeQueuePersistenceSnapshot> {
    return this.repository.exportPersistenceSnapshot();
  }

  persistenceReadiness(): KnowledgeQueuePersistenceLayerReadiness {
    return {
      persistenceLayerDefined: true,
      entitiesDefined: true,
      repositoryPortDefined: true,
      inMemoryValidationRepositoryDefined: true,
      databaseMigrationReady: false,
      durablePersistenceReady: false,
      externalDatabaseRequiredForValidation: false,
    };
  }

  private computeActiveRetrievalEligibility(record: any, requested?: boolean): boolean {
    const status = String(record.status ?? '').toUpperCase();
    const guardrails = record.guardrails ?? {};
    return requested === true
      && ACTIVE_STATUSES.has(status)
      && guardrails.prohibitedLanguage !== true
      && guardrails.confidentialData !== true
      && guardrails.isDuplicate !== true;
  }
}
