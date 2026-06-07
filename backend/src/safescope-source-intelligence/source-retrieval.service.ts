import { Injectable } from '@nestjs/common';
import { SourceIntelligenceSearchDto } from './dto/source-intelligence-search.dto';
import { SourceIntelligenceMatchDto } from './dto/source-intelligence-match.dto';

/**
 * @deprecated Legacy source-intelligence module.
 * SafeScope v2 now utilizes ApprovedKnowledgeRetrievalOutputV1Service 
 * and ApprovedKnowledgeRegistrySearchService for governed source retrieval.
 */
@Injectable()
export class SourceRetrievalService {
  searchVerifiedSources(query: SourceIntelligenceSearchDto): {
    query: SourceIntelligenceSearchDto;
    matches: SourceIntelligenceMatchDto[];
    retrievalStatus: "stubbed";
    databaseReadEnabled: false;
    governance: {
      verifiedOnly: true;
      sourceDoesNotOverrideStandards: true;
      readOnly: true;
    };
  } {
    // This legacy service is maintained for dependency compatibility during v2 migration.
    // It must not return invented or unverified source matches in staging/production.
    
    return {
      query,
      matches: [], 
      retrievalStatus: "stubbed",
      databaseReadEnabled: false,
      governance: {
        verifiedOnly: true,
        sourceDoesNotOverrideStandards: true,
        readOnly: true
      }
    };
  }
}
