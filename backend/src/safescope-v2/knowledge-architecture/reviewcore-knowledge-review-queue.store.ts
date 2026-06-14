import {
  ReviewCoreKnowledgeRecord,
  ReviewCoreKnowledgeRecordStatus,
} from './reviewcore-knowledge-record.types';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function statusOf(record: any): string {
  return String(record?.status ?? '').toLowerCase();
}

function isActiveRetrievalEligible(record: any): boolean {
  if (!record) return false;
  if (
    record.status !== ReviewCoreKnowledgeRecordStatus.GOVERNED &&
    statusOf(record) !== 'approved' &&
    statusOf(record) !== 'governed'
  ) {
    return false;
  }
  if (record.duplicateOfRecordId) return false;
  if (record.guardrails?.prohibitedLanguage === true) return false;
  if (record.guardrails?.confidentialData === true) return false;
  if (record.guardrails?.isDuplicate === true) return false;
  return true;
}

export class ReviewCoreKnowledgeReviewQueueStore {
  private records: ReviewCoreKnowledgeRecord[] = [];

  constructor(seedRecords: ReviewCoreKnowledgeRecord[] = []) {
    this.reset(seedRecords);
  }

  listRecords(): ReviewCoreKnowledgeRecord[] {
    return clone(this.records);
  }

  getRecord(recordId: string): ReviewCoreKnowledgeRecord | undefined {
    const record = this.records.find((candidate) => candidate.id === recordId);
    return record ? clone(record) : undefined;
  }

  saveRecord(record: ReviewCoreKnowledgeRecord): ReviewCoreKnowledgeRecord {
    const nextRecord = clone(record);
    const index = this.records.findIndex((candidate) => candidate.id === nextRecord.id);

    if (index >= 0) {
      this.records[index] = nextRecord;
    } else {
      this.records.push(nextRecord);
    }

    return clone(nextRecord);
  }

  updateRecord(
    recordId: string,
    updater: (record: ReviewCoreKnowledgeRecord) => ReviewCoreKnowledgeRecord,
  ): ReviewCoreKnowledgeRecord | undefined {
    const current = this.getRecord(recordId);
    if (!current) return undefined;

    const updated = updater(current);
    return this.saveRecord(updated);
  }

  archiveRecord(recordId: string, reason = 'archived'): ReviewCoreKnowledgeRecord | undefined {
    return this.updateRecord(recordId, (record: any) => ({
      ...record,
      status: ReviewCoreKnowledgeRecordStatus.RETIRED,
      reviewHistory: [
        ...(Array.isArray(record.reviewHistory) ? record.reviewHistory : []),
        {
          action: 'archive',
          reason,
          timestamp: new Date().toISOString(),
        },
      ],
    }));
  }

  reset(seedRecords: ReviewCoreKnowledgeRecord[] = []): void {
    this.records = clone(seedRecords);
  }

  listActiveRetrievalRecords(): ReviewCoreKnowledgeRecord[] {
    return clone(this.records.filter(isActiveRetrievalEligible));
  }

  exportStoreSnapshot() {
    const records = this.listRecords();
    const activeRetrievalRecordIds = this.listActiveRetrievalRecords().map((record) => record.id);

    return {
      generatedAt: new Date().toISOString(),
      counts: {
        total: records.length,
        activeRetrievalEligible: activeRetrievalRecordIds.length,
      },
      records,
      activeRetrievalRecordIds,
    };
  }
}
