import { KnowledgeRecord, KnowledgeRecordStatus, KnowledgeAuthorityTier } from './knowledge-record.types';

export class KnowledgeApprovalService {
  buildApprovalQueue(records: KnowledgeRecord[]) {
    return records
      .filter(r => r.status === KnowledgeRecordStatus.DRAFT || r.status === KnowledgeRecordStatus.PENDING_VALIDATION)
      .map(r => ({
        recordId: r.id,
        title: r.title,
        status: r.status,
        authorityTier: r.authorityTier,
        recommendedDecision: 'needs_more_info' as const,
      }));
  }

  approveRecord(record: KnowledgeRecord, reviewer: string): KnowledgeRecord {
    return { ...record, status: KnowledgeRecordStatus.GOVERNED, updatedAt: new Date() };
  }

  rejectRecord(record: KnowledgeRecord, reviewer: string, reason: string): KnowledgeRecord {
    return { ...record, status: KnowledgeRecordStatus.RETIRED, updatedAt: new Date() };
  }

  supersedeRecord(oldRecord: KnowledgeRecord, newRecord: KnowledgeRecord, reviewer: string) {
    return {
      oldRecord: { ...oldRecord, status: KnowledgeRecordStatus.RETIRED },
      newRecord: { ...newRecord, status: KnowledgeRecordStatus.GOVERNED },
    };
  }

  getActiveRetrievalRecords(records: KnowledgeRecord[]) {
    return records.filter(r => r.status === KnowledgeRecordStatus.GOVERNED);
  }
}
