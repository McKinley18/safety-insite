import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { IntelligenceService } from './intelligence.service';
import { StandardsService } from '../standards/standards.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { EntitlementGuard, RequireEntitlement } from '../auth/entitlements/entitlement.guard';

@UseGuards(JwtGuard, EntitlementGuard)
@RequireEntitlement('fullSafeScope')
@Controller('intelligence')
export class IntelligenceController {
  constructor(
    private intelligence: IntelligenceService,
    private standards: StandardsService,
  ) {}

  @Post('analyze')
  analyze(@Body() body: { text: string }) {
    const classification = this.intelligence.classify(body.text);
    const standards = this.standards.match(body.text);

    return {
      classification,
      standards,
    };
  }
}
