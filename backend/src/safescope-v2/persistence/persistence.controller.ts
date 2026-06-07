import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SafeScopePersistenceService } from './persistence.service';
import { AuditRecordFilter, AuditRecordType } from './persistence.types';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('safescope-v2/persistence')
@UseGuards(JwtGuard)
export class SafeScopePersistenceController {
  constructor(private readonly service: SafeScopePersistenceService) {}

  @Get('audit-records')
  @Roles('ORG_OWNER', 'SAFETY_DIRECTOR', 'SUPERVISOR', 'AUDITOR')
  async getAuditRecords(@Query() filter: AuditRecordFilter) {
    return this.service.find(filter);
  }

  @Get('audit-records/trail')
  @Roles('ORG_OWNER', 'SAFETY_DIRECTOR', 'SUPERVISOR', 'AUDITOR')
  async getAuditTrail(
    @Query('inspectionId') inspectionId?: string,
    @Query('observationId') observationId?: string,
    @Query('traceId') traceId?: string,
  ) {
    return this.service.find({ inspectionId, observationId, traceId });
  }

  @Get('audit-records/candidates')
  @Roles('ORG_OWNER', 'SAFETY_DIRECTOR', 'SUPERVISOR', 'AUDITOR')
  async getCandidates(@Query('status') status?: string) {
    return this.service.find({ type: 'reviewer_candidate', status });
  }
}
