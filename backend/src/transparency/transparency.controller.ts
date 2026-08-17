import { Controller, Get, GoneException, Param, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { EntitlementGuard, RequireEntitlement } from '../auth/entitlements/entitlement.guard';
import { TransparencyService } from './transparency.service';

@UseGuards(JwtGuard, EntitlementGuard)
@RequireEntitlement('cloudReports')
@Controller('legacy/reports')
export class TransparencyController {
  constructor(private readonly transparencyService: TransparencyService) {}

  @Get(':id/explain')
  async explain(@Param('id') id: string, @Req() req: Request & { user?: any }) {
    void id;
    void req;
    throw new GoneException('Legacy report explanations are retired with the mutable report model.');
  }
}
