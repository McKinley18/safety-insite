import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { EntitlementGuard, RequireEntitlement } from '../../auth/entitlements/entitlement.guard';
import { SupervisorValidationService } from './supervisor-validation.service';

@UseGuards(JwtGuard, EntitlementGuard)
@RequireEntitlement('supervisorValidation')
@Controller('safescope-v2/supervisor-validations')
export class SupervisorValidationController {
  constructor(
    private readonly validations: SupervisorValidationService,
  ) {}

  @Post()
  create(@Body() body: any, @Req() req: any) {
    return this.validations.createValidationForUser(body, req.user);
  }

  @Get(':reasoningSnapshotId')
  history(@Param('reasoningSnapshotId') reasoningSnapshotId: string, @Req() req: any) {
    return this.validations.getValidationHistoryForUser(reasoningSnapshotId, req.user);
  }
}
