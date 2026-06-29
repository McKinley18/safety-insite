import { Roles } from '../../auth/decorators/roles.decorator';
import { BadRequestException, Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { SafeScopeFeedbackService } from './safescope-feedback.service';
import { CreateSafeScopeFeedbackDto } from './create-feedback.dto';

@Controller('safescope-v2/feedback')
export class SafeScopeFeedbackController {
  constructor(
    private readonly service: SafeScopeFeedbackService,
  ) {}

  @UseGuards(JwtGuard)
  @Roles('ORG_OWNER', 'SAFETY_DIRECTOR', 'SUPERVISOR', 'AUDITOR')
  @Post()
  async create(
    @Body() dto: CreateSafeScopeFeedbackDto,
    @Req() req: Request & { user?: any },
  ) {
    const orgId = req.user?.organizationId;
    if (!orgId) {
      throw new BadRequestException('Organization context is required.');
    }
    return this.service.create({
      ...dto,
      workspaceId: orgId,
      userId: req.user?.userId || req.user?.id || req.user?.sub,
    });
  }

  @UseGuards(JwtGuard)
  @Get()
  async getWorkspaceSignals(
    @Req() req: Request & { user?: any },
  ) {
    const orgId = req.user?.organizationId;
    if (!orgId) {
      throw new BadRequestException('Organization context is required.');
    }
    return this.service.getWorkspaceSignals(orgId);
  }

  @UseGuards(JwtGuard)
  @Get('adjustments')
  async getWorkspaceAdjustments(
    @Req() req: Request & { user?: any },
  ) {
    const orgId = req.user?.organizationId;
    if (!orgId) {
      throw new BadRequestException('Organization context is required.');
    }
    return this.service.getWorkspaceStandardAdjustments(orgId);
  }
}
