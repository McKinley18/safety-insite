export class SourceDocumentPreviewDto {
  id?: string;
  candidateId?: string;
  sourceAgency?: string;
  sourceTitle?: string;
  sourceUrl?: string;
  verificationStatus?: string;
}

export class SourceHazardLessonPreviewDto {
  id?: string;
  sourceDocumentId?: string;
  hazardCategory?: string;
}

export class SourceControlPreviewDto {
  id?: string;
  sourceDocumentId?: string;
}

export class SourceCitationHintPreviewDto {
  id?: string;
  sourceDocumentId?: string;
}

export class SourceGauntletLinkPreviewDto {
  id?: string;
  sourceDocumentId?: string;
}

export class SourceIntelligenceIngestionPreviewDto {
  source_documents?: SourceDocumentPreviewDto[];
  source_hazard_lessons?: SourceHazardLessonPreviewDto[];
  source_controls?: SourceControlPreviewDto[];
  source_citation_hints?: SourceCitationHintPreviewDto[];
  source_gauntlet_links?: SourceGauntletLinkPreviewDto[];
}
