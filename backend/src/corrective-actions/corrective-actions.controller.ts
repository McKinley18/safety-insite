import { Controller, Get, Post, Body, Param, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { EntitlementGuard, RequireEntitlement } from '../auth/entitlements/entitlement.guard';
import { CorrectiveActionsService } from './corrective-actions.service';
import {
  CloseCorrectiveActionDto,
  CreateCorrectiveActionDto,
  UpdateCorrectiveActionDto,
  UpdateCorrectiveActionStatusDto,
} from './dto/corrective-action.dto';

@UseGuards(JwtGuard)
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
  @UseGuards(EntitlementGuard)
  @RequireEntitlement('correctiveActionAssignments')
  create(
    @Req() req: any,
    @Body() dto: CreateCorrectiveActionDto,
  ) {
    return this.service.create(req.user, dto);
  }

  /**
   * §287 / D-051. Edit an action's fields, including its DUE DATE — the mutation the product had
   * no route for at all before §287, which made "a changed due date moves the calendar event"
   * unrepresentable for a corrective action.
   *
   * NO entitlement guard, deliberately and consistently with the rest of this controller: only
   * CREATE carries `correctiveActionAssignments`. An account that has raised actions must be able
   * to finish managing them after a downgrade, exactly as it keeps the reports it generated.
   */
  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateCorrectiveActionDto) {
    return this.service.update(req.user, id, dto);
  }

  @Patch(':id/status')
  updateStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateCorrectiveActionStatusDto,
  ) {
    return this.service.updateStatus(req.user, id, dto);
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
