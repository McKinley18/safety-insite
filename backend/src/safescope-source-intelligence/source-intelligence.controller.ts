import { Controller, Get } from '@nestjs/common';
import { SourceIntelligenceService } from './source-intelligence.service';
import { SourceGovernanceService } from './source-governance.service';

@Controller('source-intelligence')
export class SourceIntelligenceController {
  constructor(
    private readonly intelligenceService: SourceIntelligenceService,
    private readonly governanceService: SourceGovernanceService
  ) {}

  @Get('status')
  getStatus() {
    return this.intelligenceService.getLibraryStatus();
  }

  @Get('governance')
  getGovernance() {
    return this.governanceService.getGovernanceRules();
  }
}
