import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
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
  create(@Body() body: any) {
    return this.validations.createValidation(body);
  }

  @Get(':reasoningSnapshotId')
  history(@Param('reasoningSnapshotId') reasoningSnapshotId: string) {
    return this.validations.getValidationHistory(reasoningSnapshotId);
  }
}
