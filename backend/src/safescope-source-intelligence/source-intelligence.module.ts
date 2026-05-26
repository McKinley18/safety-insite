import { Module } from '@nestjs/common';
import { SourceIntelligenceController } from './source-intelligence.controller';
import { SourceIntelligenceService } from './source-intelligence.service';
import { SourceIngestionService } from './source-ingestion.service';
import { SourceRetrievalService } from './source-retrieval.service';
import { SourceGovernanceService } from './source-governance.service';

@Module({
  controllers: [SourceIntelligenceController],
  providers: [
    SourceIntelligenceService,
    SourceIngestionService,
    SourceRetrievalService,
    SourceGovernanceService
  ],
})
export class SourceIntelligenceModule {}
