import { ReviewCoreKnowledgeRecord, ReviewCoreKnowledgeRecordStatus } from './reviewcore-knowledge-record.types';
import { ReviewCoreKnowledgeNormalizerService } from './reviewcore-knowledge-normalizer.service';

export class ReviewCoreKnowledgeIngestionService {
  private normalizer = new ReviewCoreKnowledgeNormalizerService();

  ingestDraft(input: any) {
    const normalized = this.normalizer.normalizeRecord(input);
    const draftRecord: ReviewCoreKnowledgeRecord = {
      ...normalized,
      id: Math.random().toString(36).substring(7),
      status: ReviewCoreKnowledgeRecordStatus.DRAFT,
      createdAt: new Date(),
      updatedAt: new Date(),
      fingerprint: 'draft-fingerprint',
      guardrails: {
        prohibitedLanguage: false,
        confidentialData: false,
        isDuplicate: false,
      },
    };
    return { draftRecord, approvalRequired: true };
  }

  shouldActivateRecord(record: ReviewCoreKnowledgeRecord): boolean {
    return record.status === ReviewCoreKnowledgeRecordStatus.GOVERNED;
  }
}
