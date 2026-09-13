import { KnowledgeRecord, KnowledgeRecordStatus } from './knowledge-record.types';
import { KnowledgeNormalizerService } from './knowledge-normalizer.service';

export class KnowledgeIngestionService {
  private normalizer = new KnowledgeNormalizerService();

  ingestDraft(input: any) {
    const normalized = this.normalizer.normalizeRecord(input);
    const draftRecord: KnowledgeRecord = {
      ...normalized,
      id: Math.random().toString(36).substring(7),
      status: KnowledgeRecordStatus.DRAFT,
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

  shouldActivateRecord(record: KnowledgeRecord): boolean {
    return record.status === KnowledgeRecordStatus.GOVERNED;
  }
}
