import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { EntitlementGuard, RequireEntitlement } from '../auth/entitlements/entitlement.guard';
import { SourceIntelligenceService } from './source-intelligence.service';
import { SourceGovernanceService } from './source-governance.service';
import { SourceIngestionService } from './source-ingestion.service';
import { SourceRetrievalService } from './source-retrieval.service';
import { SourceIntelligenceIngestionPreviewDto } from './dto/source-ingestion-preview.dto';
import { SourceIntelligenceSearchDto } from './dto/source-intelligence-search.dto';

@UseGuards(JwtGuard, EntitlementGuard)
@RequireEntitlement('auditTrail')
@Controller('source-intelligence')
export class SourceIntelligenceController {
  constructor(
    private readonly intelligenceService: SourceIntelligenceService,
    private readonly governanceService: SourceGovernanceService,
    private readonly ingestionService: SourceIngestionService,
    private readonly retrievalService: SourceRetrievalService
  ) {}

  @Get('status')
  getStatus() {
    return this.intelligenceService.getLibraryStatus();
  }

  @Get('governance')
  getGovernance() {
    return this.governanceService.getGovernanceRules();
  }

  @Post('import/preview/validate')
  validatePreview(@Body() body: SourceIntelligenceIngestionPreviewDto) {
    return this.ingestionService.validateIngestionPreview(body);
  }

  @Post('search')
  search(@Body() body: SourceIntelligenceSearchDto) {
    return this.retrievalService.searchVerifiedSources(body);
  }
}
