import { Controller, Get, Post, Body } from '@nestjs/common';
import { SourceIntelligenceService } from './source-intelligence.service';
import { SourceGovernanceService } from './source-governance.service';
import { SourceIngestionService } from './source-ingestion.service';
import { SourceIntelligenceIngestionPreviewDto } from './dto/source-ingestion-preview.dto';

@Controller('source-intelligence')
export class SourceIntelligenceController {
  constructor(
    private readonly intelligenceService: SourceIntelligenceService,
    private readonly governanceService: SourceGovernanceService,
    private readonly ingestionService: SourceIngestionService
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
}
