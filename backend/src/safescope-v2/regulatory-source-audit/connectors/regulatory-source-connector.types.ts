import { AuthorityAgency, Jurisdiction } from '../../approved-knowledge-registry/approved-knowledge-record.types';

export type IngestionRecommendedUse = 
  | 'regulation_candidate' 
  | 'fatality_lesson_candidate' 
  | 'supplemental_context_candidate' 
  | 'ignore';

export type IngestionRiskLevel = 'low' | 'medium' | 'high';

export interface RegulatorySourceConnectorResult {
  sourceSystem: string;
  sourceType: string;
  agency: AuthorityAgency;
  jurisdiction: Jurisdiction;
  sourceUrl: string;
  fetchedAt: string;
  sourceRevisionDate?: string;
  rawTitle: string;
  rawCitation?: string;
  normalizedCitation: string;
  rawTextExcerpt: string;
  contentHash: string;
  contentFingerprint: string;
  recommendedUse: IngestionRecommendedUse;
  ingestionRisk: IngestionRiskLevel;
  reasons: string[];
}

export interface IRegulatorySourceConnector {
  fetchCandidates(filter?: any): Promise<RegulatorySourceConnectorResult[]>;
}
