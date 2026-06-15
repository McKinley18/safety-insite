import {
  ReviewCoreQueueAuditEventRow,
  ReviewCoreQueuePersistenceSnapshot,
  ReviewCoreQueueRecordRow,
} from './reviewcore-knowledge-review-queue.persistence-types';

export interface ReviewCoreKnowledgeReviewQueuePersistenceRepositoryPort {
  saveRecord(record: ReviewCoreQueueRecordRow): Promise<ReviewCoreQueueRecordRow>;
  getRecord(recordId: string): Promise<ReviewCoreQueueRecordRow | null>;
  listRecords(): Promise<ReviewCoreQueueRecordRow[]>;
  updateRecord(recordId: string, patch: Partial<ReviewCoreQueueRecordRow>): Promise<ReviewCoreQueueRecordRow>;
  archiveRecord(recordId: string): Promise<void>;
  saveAuditEvent(event: ReviewCoreQueueAuditEventRow): Promise<ReviewCoreQueueAuditEventRow>;
  listAuditEvents(filter?: { recordId?: string; denied?: boolean; allowed?: boolean }): Promise<ReviewCoreQueueAuditEventRow[]>;
  listAuditEventsForRecord(recordId: string): Promise<ReviewCoreQueueAuditEventRow[]>;
  listActiveRetrievalRecords(): Promise<ReviewCoreQueueRecordRow[]>;
  exportPersistenceSnapshot(): Promise<ReviewCoreQueuePersistenceSnapshot>;
  resetForValidation(): void;
}

export class InMemoryReviewCoreKnowledgeReviewQueuePersistenceRepository
  implements ReviewCoreKnowledgeReviewQueuePersistenceRepositoryPort {
  private records = new Map<string, ReviewCoreQueueRecordRow>();
  private auditEvents: ReviewCoreQueueAuditEventRow[] = [];

  constructor(seed?: Partial<ReviewCoreQueuePersistenceSnapshot>) {
    seed?.records?.forEach((record) => this.records.set(record.id, { ...record }));
    this.auditEvents = seed?.auditEvents?.map((event) => ({ ...event })) ?? [];
  }

  async saveRecord(record: ReviewCoreQueueRecordRow): Promise<ReviewCoreQueueRecordRow> {
    const cloned = { ...record };
    this.records.set(cloned.id, cloned);
    return { ...cloned };
  }

  async getRecord(recordId: string): Promise<ReviewCoreQueueRecordRow | null> {
    const record = this.records.get(recordId);
    return record ? { ...record } : null;
  }

  async listRecords(): Promise<ReviewCoreQueueRecordRow[]> {
    return Array.from(this.records.values()).map((record) => ({ ...record }));
  }

  async updateRecord(recordId: string, patch: Partial<ReviewCoreQueueRecordRow>): Promise<ReviewCoreQueueRecordRow> {
    const record = await this.getRecord(recordId);
    if (!record) {
      throw new Error(`ReviewCore persistence record not found: ${recordId}`);
    }

    const updated = { ...record, ...patch, updatedAt: patch.updatedAt ?? new Date().toISOString() };
    this.records.set(recordId, updated);
    return { ...updated };
  }

  async archiveRecord(recordId: string): Promise<void> {
    const record = await this.getRecord(recordId);
    if (!record) return;

    this.records.set(recordId, {
      ...record,
      status: 'ARCHIVED',
      activeRetrievalEligible: false,
      activeRetrievalChangedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  async saveAuditEvent(event: ReviewCoreQueueAuditEventRow): Promise<ReviewCoreQueueAuditEventRow> {
    const cloned = { ...event };
    this.auditEvents.push(cloned);
    return { ...cloned };
  }

  async listAuditEvents(filter?: { recordId?: string; denied?: boolean; allowed?: boolean }): Promise<ReviewCoreQueueAuditEventRow[]> {
    return this.auditEvents
      .filter((event) => !filter?.recordId || event.recordId === filter.recordId)
      .filter((event) => filter?.denied === undefined || event.denied === filter.denied)
      .filter((event) => filter?.allowed === undefined || event.allowed === filter.allowed)
      .map((event) => ({ ...event }));
  }

  async listAuditEventsForRecord(recordId: string): Promise<ReviewCoreQueueAuditEventRow[]> {
    return this.listAuditEvents({ recordId });
  }

  async listActiveRetrievalRecords(): Promise<ReviewCoreQueueRecordRow[]> {
    return (await this.listRecords()).filter((record) => {
      const status = String(record.status).toUpperCase();
      return record.activeRetrievalEligible === true
        && ['APPROVED', 'GOVERNED'].includes(status)
        && record.guardrails?.prohibitedLanguage !== true
        && record.guardrails?.confidentialData !== true
        && record.guardrails?.isDuplicate !== true;
    });
  }

  async exportPersistenceSnapshot(): Promise<ReviewCoreQueuePersistenceSnapshot> {
    const records = await this.listRecords();
    const auditEvents = await this.listAuditEvents();

    return {
      records,
      auditEvents,
      generatedAt: new Date().toISOString(),
      activeRetrievalRecordIds: (await this.listActiveRetrievalRecords()).map((record) => record.id),
    };
  }

  resetForValidation(): void {
    this.records.clear();
    this.auditEvents = [];
  }
}
