import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ReviewerCandidateConsoleService } from './reviewer-candidate-console.service';
import { CandidateFilter } from './reviewer-candidate-console.types';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtGuard } from '../../auth/guards/jwt.guard';

@Controller('safescope/reviewer-candidates')
@UseGuards(JwtGuard)
@Roles('SAFETY_DIRECTOR', 'AUDITOR', 'ORG_OWNER')
export class ReviewerCandidateConsoleController {
  constructor(private readonly service: ReviewerCandidateConsoleService) {}

  @Get()
  listCandidates(@Query() filter: CandidateFilter) {
    return this.service.listCandidates(filter);
  }

  @Get(':id')
  getCandidate(@Param('id') id: string) {
    return this.service.getCandidateById(id);
  }

  @Post(':id/approve')
  approve(@Param('id') id: string, @Body() reviewer: { name: string, role: string, notes?: string }) {
    return this.service.approveCandidate(id, reviewer);
  }

  @Post(':id/reject')
  reject(@Param('id') id: string, @Body() reviewer: { name: string, role: string, notes: string }) {
    return this.service.rejectCandidate(id, reviewer);
  }

  @Post(':id/request-info')
  requestInfo(@Param('id') id: string, @Body() reviewer: { name: string, role: string, notes: string }) {
    return this.service.requestMoreInfo(id, reviewer);
  }

  @Post(':id/block')
  block(@Param('id') id: string, @Body() reviewer: { name: string, role: string, notes: string }) {
    return this.service.blockCandidate(id, reviewer);
  }

  @Post(':id/archive')
  archive(@Param('id') id: string, @Body() reviewer: { name: string, role: string, notes?: string }) {
    return this.service.archiveCandidate(id, reviewer);
  }
}
