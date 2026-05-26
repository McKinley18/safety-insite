import { Injectable } from '@nestjs/common';

@Injectable()
export class SourceIngestionService {
  previewImportSummary(preview: any) {
    return {
      source_documents: preview.source_documents?.length || 0,
      source_hazard_lessons: preview.source_hazard_lessons?.length || 0,
      source_controls: preview.source_controls?.length || 0,
      source_citation_hints: preview.source_citation_hints?.length || 0,
      source_gauntlet_links: preview.source_gauntlet_links?.length || 0
    };
  }
}
