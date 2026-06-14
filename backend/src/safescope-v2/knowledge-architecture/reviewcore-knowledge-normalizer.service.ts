import { ReviewCoreKnowledgeRecord, ReviewCoreKnowledgeRecordStatus, ReviewCoreKnowledgeAuthorityTier } from './reviewcore-knowledge-record.types';
import { REVIEWCORE_DOMAINS } from './reviewcore-knowledge-taxonomy';

export class ReviewCoreKnowledgeNormalizerService {
  normalizeRecord(raw: any): ReviewCoreKnowledgeRecord {
    return {
      ...raw,
      title: raw.title.trim(),
      content: raw.content.trim(),
      status: raw.status || ReviewCoreKnowledgeRecordStatus.DRAFT,
      authorityTier: raw.authorityTier || ReviewCoreKnowledgeAuthorityTier.EXPERIMENTAL,
      updatedAt: new Date(),
    };
  }

  classifyDraft(record: ReviewCoreKnowledgeRecord): string {
    // Conservative classification: defaults to first domain
    return REVIEWCORE_DOMAINS.includes(record.domain) ? record.domain : REVIEWCORE_DOMAINS[0];
  }

  computeFingerprint(record: ReviewCoreKnowledgeRecord): string {
    return Buffer.from(`${record.title}:${record.content}`).toString('base64');
  }

  detectPotentialDuplicates(newRecord: ReviewCoreKnowledgeRecord, existingRecords: ReviewCoreKnowledgeRecord[]): boolean {
    return existingRecords.some(r => r.fingerprint === newRecord.fingerprint);
  }

  routeToRetrievalFacets(record: ReviewCoreKnowledgeRecord): string[] {
    return [record.domain, ...record.tags];
  }
}
