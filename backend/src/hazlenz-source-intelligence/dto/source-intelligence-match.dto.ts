export class SourceIntelligenceMatchDto {
  sourceId?: string;
  sourceAgency?: string;
  sourceTitle?: string;
  sourceUrl?: string;
  hazardCategory?: string;
  evidenceExcerpt?: string;
  controls?: string[];
  relevanceScore?: number;
  citationAuthority?: string;
  notes?: string;
}
