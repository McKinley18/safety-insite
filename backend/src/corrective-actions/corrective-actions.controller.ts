import { Controller, Get, Post, Body, Param, Patch, Query, Headers, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { CorrectiveActionsService } from './corrective-actions.service';
import { CreateCorrectiveActionDto, CloseCorrectiveActionDto } from './dto/corrective-action.dto';

@UseGuards(JwtGuard)
@Controller('actions')
export class CorrectiveActionsController {
  constructor(private readonly service: CorrectiveActionsService) {}

  @Get()
  findAll(
    @Headers('authorization') authorization: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('statusCode') statusCode?: string,
    @Query('priorityCode') priorityCode?: string,
    @Query('assignedToMe') assignedToMe?: string,
  ) {
    return this.service.findAll(authorization, { page, limit, statusCode, priorityCode, assignedToMe: assignedToMe === 'true' });
  }

  @Post()
  create(@Headers('authorization') authorization: string, @Body() dto: CreateCorrectiveActionDto) {
    return this.service.create(authorization, dto);
  }

  @Patch(':id/status')
  updateStatus(
    @Headers('authorization') authorization: string,
    @Param('id') id: string,
    @Body() body: { statusCode: 'open' | 'in_progress' | 'closed' | 'cancelled'; closureNotes?: string },
  ) {
    return this.service.updateStatus(authorization, id, body);
  }

  @Post('alerts/scan')
  generateDueDateAlerts(@Headers('authorization') authorization: string) {
    return this.service.generateDueDateAlerts(authorization);
  }

  @Get('export')
  async export(
    @Query('statusCode') statusCode?: string,
    @Query('priorityCode') priorityCode?: string,
    @Query('format') format: string = 'json',
  ) {
    const data = await this.service.export(statusCode, priorityCode);
    if (format === 'csv') {
      const header = Object.keys(data[0] || {}).join(',');
      const rows = data.map(obj => Object.values(obj).join(',')).join('\n');
      return header + '\n' + rows;
    }
    return data;
  }
}
