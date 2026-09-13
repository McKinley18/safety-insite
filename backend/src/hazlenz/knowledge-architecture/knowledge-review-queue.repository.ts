import {
  KnowledgeQueueAuditEventRow,
  KnowledgeQueuePersistenceSnapshot,
  KnowledgeQueueRecordRow,
} from './knowledge-review-queue.persistence-types';

export interface KnowledgeReviewQueuePersistenceRepositoryPort {
  saveRecord(record: KnowledgeQueueRecordRow): Promise<KnowledgeQueueRecordRow>;
  getRecord(recordId: string): Promise<KnowledgeQueueRecordRow | null>;
  listRecords(): Promise<KnowledgeQueueRecordRow[]>;
  updateRecord(recordId: string, patch: Partial<KnowledgeQueueRecordRow>): Promise<KnowledgeQueueRecordRow>;
  archiveRecord(recordId: string): Promise<void>;
  saveAuditEvent(event: KnowledgeQueueAuditEventRow): Promise<KnowledgeQueueAuditEventRow>;
  listAuditEvents(filter?: { recordId?: string; denied?: boolean; allowed?: boolean }): Promise<KnowledgeQueueAuditEventRow[]>;
  listAuditEventsForRecord(recordId: string): Promise<KnowledgeQueueAuditEventRow[]>;
  listActiveRetrievalRecords(): Promise<KnowledgeQueueRecordRow[]>;
  exportPersistenceSnapshot(): Promise<KnowledgeQueuePersistenceSnapshot>;
  resetForValidation(): void;
}

export class InMemoryKnowledgeReviewQueuePersistenceRepository
  implements KnowledgeReviewQueuePersistenceRepositoryPort {
  private records = new Map<string, KnowledgeQueueRecordRow>();
  private auditEvents: KnowledgeQueueAuditEventRow[] = [];

  constructor(seed?: Partial<KnowledgeQueuePersistenceSnapshot>) {
    seed?.records?.forEach((record) => this.records.set(record.id, { ...record }));
    this.auditEvents = seed?.auditEvents?.map((event) => ({ ...event })) ?? [];
  }

  async saveRecord(record: KnowledgeQueueRecordRow): Promise<KnowledgeQueueRecordRow> {
    const cloned = { ...record };
    this.records.set(cloned.id, cloned);
    return { ...cloned };
  }

  async getRecord(recordId: string): Promise<KnowledgeQueueRecordRow | null> {
    const record = this.records.get(recordId);
    return record ? { ...record } : null;
  }

  async listRecords(): Promise<KnowledgeQueueRecordRow[]> {
    return Array.from(this.records.values()).map((record) => ({ ...record }));
  }

  async updateRecord(recordId: string, patch: Partial<KnowledgeQueueRecordRow>): Promise<KnowledgeQueueRecordRow> {
    const record = await this.getRecord(recordId);
    if (!record) {
      throw new Error(`Knowledge persistence record not found: ${recordId}`);
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

  async saveAuditEvent(event: KnowledgeQueueAuditEventRow): Promise<KnowledgeQueueAuditEventRow> {
    const cloned = { ...event };
    this.auditEvents.push(cloned);
    return { ...cloned };
  }

  async listAuditEvents(filter?: { recordId?: string; denied?: boolean; allowed?: boolean }): Promise<KnowledgeQueueAuditEventRow[]> {
    return this.auditEvents
      .filter((event) => !filter?.recordId || event.recordId === filter.recordId)
      .filter((event) => filter?.denied === undefined || event.denied === filter.denied)
      .filter((event) => filter?.allowed === undefined || event.allowed === filter.allowed)
      .map((event) => ({ ...event }));
  }

  async listAuditEventsForRecord(recordId: string): Promise<KnowledgeQueueAuditEventRow[]> {
    return this.listAuditEvents({ recordId });
  }

  async listActiveRetrievalRecords(): Promise<KnowledgeQueueRecordRow[]> {
    return (await this.listRecords()).filter((record) => {
      const status = String(record.status).toUpperCase();
      return record.activeRetrievalEligible === true
        && ['APPROVED', 'GOVERNED'].includes(status)
        && record.guardrails?.prohibitedLanguage !== true
        && record.guardrails?.confidentialData !== true
        && record.guardrails?.isDuplicate !== true;
    });
  }

  async exportPersistenceSnapshot(): Promise<KnowledgeQueuePersistenceSnapshot> {
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
