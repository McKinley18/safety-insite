import { Controller, Get, Post, Body, Param, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { EntitlementGuard, RequireEntitlement } from '../auth/entitlements/entitlement.guard';
import { CorrectiveActionsService } from './corrective-actions.service';
import { CreateCorrectiveActionDto, CloseCorrectiveActionDto } from './dto/corrective-action.dto';

@UseGuards(JwtGuard, EntitlementGuard)
@RequireEntitlement('cloudReports')
@Controller('actions')
export class CorrectiveActionsController {
  constructor(private readonly service: CorrectiveActionsService) {}

  @Get()
  findAll(
    @Req() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('statusCode') statusCode?: string,
    @Query('priorityCode') priorityCode?: string,
    @Query('assignedToMe') assignedToMe?: string,
  ) {
    return this.service.findAll(req.user, {
      page,
      limit,
      statusCode,
      priorityCode,
      assignedToMe: assignedToMe === 'true',
    });
  }

  @Post()
  create(
    @Req() req: any,
    @Body() dto: CreateCorrectiveActionDto,
  ) {
    return this.service.create(req.user, dto);
  }

  @Patch(':id/status')
  updateStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { statusCode: 'open' | 'in_progress' | 'closed' | 'cancelled'; closureNotes?: string },
  ) {
    return this.service.updateStatus(req.user, id, body);
  }

  @Post('alerts/scan')
  generateDueDateAlerts(@Req() req: any) {
    return this.service.generateDueDateAlerts(req.user);
  }

  @Get('export')
  async export(
    @Req() req: any,
    @Query('statusCode') statusCode?: string,
    @Query('priorityCode') priorityCode?: string,
    @Query('format') format: string = 'json',
  ) {
    const data = await this.service.export(req.user, statusCode, priorityCode);
    if (format === 'csv') {
      const header = Object.keys(data[0] || {}).join(',');
      const rows = data.map(obj => Object.values(obj).join(',')).join('\n');
      return header + '\n' + rows;
    }
    return data;
  }
}
