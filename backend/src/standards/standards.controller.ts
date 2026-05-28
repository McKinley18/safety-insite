import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { StandardsService } from './standards.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { EntitlementGuard, RequireEntitlement } from '../auth/entitlements/entitlement.guard';

@UseGuards(JwtGuard, EntitlementGuard)
@RequireEntitlement('fullSafeScope')
@Controller('standards')
export class StandardsController {
  constructor(private readonly standardsService: StandardsService) {}

  @Post('match')
  match(@Body() body: { text: string }) {
    return this.standardsService.match(body.text);
  }
}
