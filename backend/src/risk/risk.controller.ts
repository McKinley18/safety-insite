import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { RiskService } from './risk.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { EntitlementGuard, RequireEntitlement } from '../auth/entitlements/entitlement.guard';

@UseGuards(JwtGuard, EntitlementGuard)
@RequireEntitlement('fullSafeScope')
@Controller('risk')
export class RiskController {
  constructor(private service: RiskService) {}

  @Post('calculate')
  async calculate(@Body() body: { severity: number; likelihood: number }) {
    return this.service.calculate(body.severity, body.likelihood);
  }
}
