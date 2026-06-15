import {
  ReviewCoreQueueAuditEvent,
  ReviewCoreQueueGovernanceTrace,
} from './reviewcore-knowledge-review-queue.api-types';
import {
  ReviewCoreQueueAuditEventRow,
  ReviewCoreQueuePersistRecordMetadata,
  ReviewCoreQueuePersistenceAdapterPort,
  ReviewCoreQueuePersistenceLayerReadiness,
  ReviewCoreQueuePersistenceSnapshot,
  ReviewCoreQueueRecordRow,
} from './reviewcore-knowledge-review-queue.persistence-types';
import {
  InMemoryReviewCoreKnowledgeReviewQueuePersistenceRepository,
  ReviewCoreKnowledgeReviewQueuePersistenceRepositoryPort,
} from './reviewcore-knowledge-review-queue.repository';

export { InMemoryReviewCoreKnowledgeReviewQueuePersistenceRepository };

const ACTIVE_STATUSES = new Set(['APPROVED', 'GOVERNED']);

export class ReviewCoreKnowledgeReviewQueuePersistenceAdapter implements ReviewCoreQueuePersistenceAdapterPort {
  constructor(
    private readonly repository: ReviewCoreKnowledgeReviewQueuePersistenceRepositoryPort =
      new InMemoryReviewCoreKnowledgeReviewQueuePersistenceRepository(),
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

  async persistRecord(record: any, metadata: ReviewCoreQueuePersistRecordMetadata = {}): Promise<ReviewCoreQueueRecordRow> {
    const now = new Date().toISOString();
    const status = String(record.status ?? 'DRAFT');
    const guardrails = record.guardrails ?? {};
    const activeRetrievalEligible = this.computeActiveRetrievalEligibility(record, metadata.activeRetrievalEligible);

    const row: ReviewCoreQueueRecordRow = {
      id: record.id,
      title: record.title ?? 'Untitled ReviewCore knowledge record',
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
    auditEvent: ReviewCoreQueueAuditEvent,
    governanceTrace?: ReviewCoreQueueGovernanceTrace,
  ): Promise<ReviewCoreQueueAuditEventRow> {
    const row: ReviewCoreQueueAuditEventRow = {
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

  async hydrateStore(): Promise<ReviewCoreQueueRecordRow[]> {
    return this.repository.listRecords();
  }

  async listActiveRetrievalRecords(): Promise<ReviewCoreQueueRecordRow[]> {
    return this.repository.listActiveRetrievalRecords();
  }

  async exportPersistenceSnapshot(): Promise<ReviewCoreQueuePersistenceSnapshot> {
    return this.repository.exportPersistenceSnapshot();
  }

  persistenceReadiness(): ReviewCoreQueuePersistenceLayerReadiness {
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
