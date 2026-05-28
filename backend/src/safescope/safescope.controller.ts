import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { SafeScopeService } from './safescope.service';
import { FeedbackService } from './engine/feedback.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { EntitlementGuard, RequireEntitlement } from '../auth/entitlements/entitlement.guard';

@UseGuards(JwtGuard, EntitlementGuard)
@RequireEntitlement('fullSafeScope')
@Controller('safescope')
export class SafeScopeController {
  constructor(
    private service: SafeScopeService,
    private feedbackService: FeedbackService
  ) {}

  @Post('analyze')
  analyze(@Body() body: any) {
    return this.service.analyze(body);
  }

  @Post('feedback')
  feedback(@Body() body: any) {
    this.feedbackService.add(body);
    return { status: 'feedback recorded' };
  }
}
