import { Controller, Get, Headers, Query, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { DashboardService } from './dashboard.service';

@UseGuards(JwtGuard)
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
