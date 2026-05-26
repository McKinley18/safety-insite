import { Injectable } from '@nestjs/common';

@Injectable()
export class SourceIntelligenceService {
  getLibraryStatus() {
    return {
      status: 'active',
      tables: ['source_documents', 'source_hazard_lessons', 'source_controls', 'source_citation_hints', 'source_gauntlet_links'],
      governance: 'strict'
    };
  }
}
