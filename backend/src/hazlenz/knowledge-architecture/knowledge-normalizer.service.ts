import { KnowledgeRecord, KnowledgeRecordStatus, KnowledgeAuthorityTier } from './knowledge-record.types';
import { REVIEWCORE_DOMAINS } from './knowledge-taxonomy';

export class KnowledgeNormalizerService {
  normalizeRecord(raw: any): KnowledgeRecord {
    return {
      ...raw,
      title: (raw.title || '').trim(),
      content: (raw.content || '').trim(),
      domain: raw.domain || 'unknown',
      tags: raw.tags || [],
      status: raw.status || KnowledgeRecordStatus.DRAFT,
      authorityTier: raw.authorityTier || KnowledgeAuthorityTier.EXPERIMENTAL,
      updatedAt: new Date(),
    } as KnowledgeRecord;
  }

  classifyDraft(record: KnowledgeRecord): string {
    // Conservative classification: defaults to first domain
    return REVIEWCORE_DOMAINS.includes(record.domain) ? record.domain : REVIEWCORE_DOMAINS[0];
  }

  computeFingerprint(record: KnowledgeRecord): string {
    return Buffer.from(`${record.title}:${record.content}`).toString('base64');
  }

  detectPotentialDuplicates(newRecord: KnowledgeRecord, existingRecords: KnowledgeRecord[]): boolean {
    return existingRecords.some(r => r.fingerprint === newRecord.fingerprint);
  }

  routeToRetrievalFacets(record: KnowledgeRecord): string[] {
    return [record.domain, ...record.tags];
  }
}
