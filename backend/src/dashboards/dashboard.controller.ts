import { Controller, Get, Headers, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private service: DashboardService) {}

  @Get('executive-summary')
  async getSummary(
    @Headers('authorization') authorization: string,
    @Query('siteId') siteId?: string,
  ) {
    return await this.service.getExecutiveSummary(authorization, siteId);
  }

  @Get('corporate-summary')
  async getCorporateSummary(@Headers('authorization') authorization: string) {
    return await this.service.getCorporateSummary(authorization);
  }
}
