import { ReviewCoreKnowledgeRecord, ReviewCoreKnowledgeRecordStatus, ReviewCoreKnowledgeAuthorityTier } from './reviewcore-knowledge-record.types';

export class ReviewCoreKnowledgeApprovalService {
  buildApprovalQueue(records: ReviewCoreKnowledgeRecord[]) {
    return records
      .filter(r => r.status === ReviewCoreKnowledgeRecordStatus.DRAFT || r.status === ReviewCoreKnowledgeRecordStatus.PENDING_VALIDATION)
      .map(r => ({
        recordId: r.id,
        title: r.title,
        status: r.status,
        authorityTier: r.authorityTier,
        recommendedDecision: 'needs_more_info' as const,
      }));
  }

  approveRecord(record: ReviewCoreKnowledgeRecord, reviewer: string): ReviewCoreKnowledgeRecord {
    return { ...record, status: ReviewCoreKnowledgeRecordStatus.GOVERNED, updatedAt: new Date() };
  }

  rejectRecord(record: ReviewCoreKnowledgeRecord, reviewer: string, reason: string): ReviewCoreKnowledgeRecord {
    return { ...record, status: ReviewCoreKnowledgeRecordStatus.RETIRED, updatedAt: new Date() };
  }

  supersedeRecord(oldRecord: ReviewCoreKnowledgeRecord, newRecord: ReviewCoreKnowledgeRecord, reviewer: string) {
    return {
      oldRecord: { ...oldRecord, status: ReviewCoreKnowledgeRecordStatus.RETIRED },
      newRecord: { ...newRecord, status: ReviewCoreKnowledgeRecordStatus.GOVERNED },
    };
  }

  getActiveRetrievalRecords(records: ReviewCoreKnowledgeRecord[]) {
    return records.filter(r => r.status === ReviewCoreKnowledgeRecordStatus.GOVERNED);
  }
}
