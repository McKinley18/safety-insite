import { Body, Controller, Get, Headers, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { AuditSessionService } from './audit-session.service';
import { AuditAnalysisService } from './audit-analysis.service';

@UseGuards(JwtGuard)
@Controller('audit-sessions')
export class AuditSessionController {
  constructor(
    private readonly sessionService: AuditSessionService,
    private readonly analysisService: AuditAnalysisService,
  ) {}

  @Post()
  createSession(@Headers('authorization') authorization: string, @Body() dto: any) {
    return this.sessionService.createSession(authorization, dto);
  }

  @Get()
  findAll(@Headers('authorization') authorization: string) {
    return this.sessionService.findAll(authorization);
  }

  @Get(':id')
  findOne(@Headers('authorization') authorization: string, @Param('id') id: string) {
    return this.sessionService.findOne(authorization, id);
  }

  @Post(':id/entries')
  addEntry(
    @Headers('authorization') authorization: string,
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return this.sessionService.addEntry(authorization, id, dto);
  }

  @Post(':sessionId/entries/:entryId/analyze')
  analyzeEntry(@Param('entryId') entryId: string, @Body() dto: any) {
    return this.analysisService.analyzeEntry({
      notes: dto?.notes,
      locationText: dto?.locationText,
    });
  }

  @Patch(':id/publish')
  publish(@Headers('authorization') authorization: string, @Param('id') id: string) {
    return this.sessionService.publish(authorization, id);
  }
}
