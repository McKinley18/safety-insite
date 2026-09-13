import { KnowledgeRecord, KnowledgeRecordStatus } from './knowledge-record.types';
import { SEED_RECORDS } from './governed-seed-records';

export interface RetrievalInput {
  query: string;
  facets: string[];
}

export class KnowledgeRetrievalService {
  retrieveForObservation(input: RetrievalInput): KnowledgeRecord[] {
    // 1. Filter by guardrails (only GOVERNED)
    const candidates = SEED_RECORDS.filter(r => r.status === KnowledgeRecordStatus.GOVERNED && !r.guardrails.prohibitedLanguage);
    
    // 2. Score and filter
    const matches = candidates
      .map(r => ({ record: r, score: this.scoreRecordAgainstFacets(r, input.facets) }))
      .filter(m => m.score > 0.5) // Threshold
      .sort((a, b) => b.score - a.score);

    return matches.map(m => m.record);
  }

  scoreRecordAgainstFacets(record: KnowledgeRecord, facets: string[]): number {
    const matches = facets.filter(f => record.tags.includes(f) || record.domain === f);
    return matches.length / Math.max(facets.length, 1);
  }

  explainMatch(record: KnowledgeRecord, facets: string[]): string {
    return `Record ${record.id} matched facets: ${facets.filter(f => record.tags.includes(f) || record.domain === f).join(', ')}`;
  }
}
