import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { AnalyticsService } from './analytics.service';

@UseGuards(JwtGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('safety-trends')
  getSafetyTrends(@Req() req: Request & { user?: any }) {
    return this.analyticsService.getSafetyTrends(req.user);
  }
}
