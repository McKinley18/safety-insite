import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { MatchEngineService } from './match-engine.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { EntitlementGuard, RequireEntitlement } from '../auth/entitlements/entitlement.guard';

@UseGuards(JwtGuard, EntitlementGuard)
@RequireEntitlement('fullSafeScope')
@Controller('match')
export class MatchEngineController {
  constructor(private service: MatchEngineService) {}

  @Post('hazard')
  async match(@Body() body: any) {
    return this.service.match(body.description, body.hazardCategory, body.industryMode);
  }
}
