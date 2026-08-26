import { Controller, Get, Headers, Query, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { EntitlementGuard, RequireEntitlement } from '../auth/entitlements/entitlement.guard';
import { DashboardService } from './dashboard.service';

// Both routes on this controller are the paid "Advanced dashboards" surface
// (Free: No / Pro: Yes on the published plan comparison). The requirement is
// declared at CLASS level so a route added here can never reach a handler
// ungated: EntitlementGuard resolves the metadata with getAllAndOverride over
// [handler, class], so a per-route override still wins where one is needed.
@UseGuards(JwtGuard, EntitlementGuard)
@RequireEntitlement('analytics')
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
