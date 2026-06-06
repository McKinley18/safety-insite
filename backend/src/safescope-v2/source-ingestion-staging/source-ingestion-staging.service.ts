import { Injectable } from '@nestjs/common';
import { SourceMetadata, StagedSourceRecord } from './source-ingestion-staging.types';

@Injectable()
export class SourceIngestionStagingService {
  
  stageSource(metadata: SourceMetadata): StagedSourceRecord {
    const missing: string[] = [];
    if (!metadata.citation) missing.push('citation');
    if (!metadata.title) missing.push('title');
    if (!metadata.jurisdiction) missing.push('jurisdiction');
    if (!metadata.sourceUrl) missing.push('sourceUrl');

    return {
      recordId: `staged-${Date.now()}`,
      status: 'staged_only',
      metadata,
      completenessScore: (Object.keys(metadata).length - missing.length) / Object.keys(metadata).length,
      missingMetadata: missing,
      possibleDuplicateKeys: [`${metadata.citation}-${metadata.title}`],
      governanceWarnings: missing.length > 0 ? ['Missing source metadata'] : [],
      createdAt: new Date().toISOString(),
    };
  }
}
