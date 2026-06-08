import { AuthorityAgency, Jurisdiction } from '../../approved-knowledge-registry/approved-knowledge-record.types';

export type IngestionRecommendedUse = 
  | 'regulation_candidate' 
  | 'fatality_lesson_candidate' 
  | 'supplemental_context_candidate' 
  | 'enforcement_summary_candidate'
  | 'ignore';

export type IngestionRiskLevel = 'low' | 'medium' | 'high';

export type ConnectorMode = 'fixture' | 'live';

export interface ConnectorFetchOptions {
  mode?: ConnectorMode;
  source?: string;
  jurisdiction?: Jurisdiction;
  maxRecords?: number;
  allowNetwork?: boolean;
}

export interface RegulatorySourceConnectorResult {
  sourceId: string;
  sourceName: string;
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
  hazardFamilies: string[];
  recommendedUse: IngestionRecommendedUse;
  ingestionRisk: IngestionRiskLevel;
  reasons: string[];
  liveFetchUsed: boolean;
  governanceWarnings: string[];
}

export interface IRegulatorySourceConnector {
  sourceId: string;
  sourceName: string;
  authorityTier: string;
  supportedJurisdictions: Jurisdiction[];
  defaultMode: ConnectorMode;
  
  fetchCandidates(options?: ConnectorFetchOptions): Promise<RegulatorySourceConnectorResult[]>;
}
