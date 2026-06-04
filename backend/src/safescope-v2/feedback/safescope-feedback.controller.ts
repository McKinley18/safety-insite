import { Roles } from '../../auth/decorators/roles.decorator';
import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { OptionalJwtGuard } from '../../auth/guards/optional-jwt.guard';
import { SafeScopeFeedbackService } from './safescope-feedback.service';
import { CreateSafeScopeFeedbackDto } from './create-feedback.dto';

@Controller('safescope-v2/feedback')
export class SafeScopeFeedbackController {
  constructor(
    private readonly service: SafeScopeFeedbackService,
  ) {}

  @UseGuards(OptionalJwtGuard)
  @Roles('ORG_OWNER', 'SAFETY_DIRECTOR', 'SUPERVISOR', 'AUDITOR')
  @Post()
  async create(
    @Body() dto: CreateSafeScopeFeedbackDto,
    @Req() req: Request & { user?: any },
  ) {
    return this.service.create({
      ...dto,
      workspaceId: req.user?.organizationId || dto.workspaceId,
      userId: req.user?.userId || dto.userId,
    });
  }

  @UseGuards(OptionalJwtGuard)
  @Get()
  async getWorkspaceSignals(
    @Query('workspaceId') workspaceId: string | undefined,
    @Req() req: Request & { user?: any },
  ) {
    return this.service.getWorkspaceSignals(req.user?.organizationId || workspaceId);
  }

  @UseGuards(OptionalJwtGuard)
  @Get('adjustments')
  async getWorkspaceAdjustments(
    @Query('workspaceId') workspaceId: string | undefined,
    @Req() req: Request & { user?: any },
  ) {
    return this.service.getWorkspaceStandardAdjustments(req.user?.organizationId || workspaceId);
  }
}
