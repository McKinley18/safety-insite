import { Controller, Get, Headers, Query, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { EntitlementGuard, RequireEntitlement } from '../auth/entitlements/entitlement.guard';
import { DashboardService } from './dashboard.service';

@UseGuards(JwtGuard, EntitlementGuard)
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

  @RequireEntitlement('analytics')
  @Get('corporate-summary')
  async getCorporateSummary(@Headers('authorization') authorization: string) {
    return await this.service.getCorporateSummary(authorization);
  }
}
