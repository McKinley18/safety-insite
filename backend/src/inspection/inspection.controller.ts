import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import {
  AssignInspectionDto,
  CreateAnalysisSnapshotDto,
  CreateHumanReviewDto,
  CreateInspectionDto,
  CreateObservationDto,
  CreateUserAuthoredFindingDto,
  UpdateObservationDto,
  FinalizeFindingDto,
  TransitionInspectionDto,
  UpdateInspectionDto,
} from './dto/inspection.dto';
import { InspectionService } from './inspection.service';

@UseGuards(JwtGuard)
@Controller('inspections')
export class InspectionController {
  constructor(private readonly inspections: InspectionService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateInspectionDto) {
    return this.inspections.create(req.user, dto);
  }

  @Get()
  list(@Req() req: any) {
    return this.inspections.list(req.user);
  }

  @Get(':id')
  get(@Req() req: any, @Param('id') id: string) {
    return this.inspections.get(req.user, id);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateInspectionDto) {
    return this.inspections.update(req.user, id, dto);
  }

  @Post(':id/assignments')
  assign(@Req() req: any, @Param('id') id: string, @Body() dto: AssignInspectionDto) {
    return this.inspections.assign(req.user, id, dto);
  }

  /**
   * What the completion contract says right now. Read-only, and evaluated by the SAME method the
   * transition enforces, so the Finish screen cannot show a readiness the server disagrees with.
   */
  @Get(':id/completion-readiness')
  completionReadiness(@Req() req: any, @Param('id') id: string) {
    return this.inspections.completionReadiness(req.user, id);
  }

  @Post(':id/transition')
  transition(@Req() req: any, @Param('id') id: string, @Body() dto: TransitionInspectionDto) {
    return this.inspections.transition(req.user, id, dto);
  }

  @Post(':id/observations')
  addObservation(@Req() req: any, @Param('id') id: string, @Body() dto: CreateObservationDto) {
    return this.inspections.addObservation(req.user, id, dto);
  }

  @Patch('observations/:id')
  updateObservation(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateObservationDto) {
    return this.inspections.updateObservation(req.user, id, dto);
  }

  @Post('observations/:id/analyses')
  addAnalysis(@Req() req: any, @Param('id') id: string, @Body() dto: CreateAnalysisSnapshotDto) {
    return this.inspections.addAnalysis(req.user, id, dto);
  }

  @Post('observations/:id/reviews')
  addReview(@Req() req: any, @Param('id') id: string, @Body() dto: CreateHumanReviewDto) {
    return this.inspections.addReview(req.user, id, dto);
  }

  @Post('observations/:id/findings')
  finalizeFinding(@Req() req: any, @Param('id') id: string, @Body() dto: FinalizeFindingDto) {
    return this.inspections.finalizeFinding(req.user, id, dto);
  }

  /**
   * A hazard the inspector identified that HazLenz did not propose. Separate route rather than a
   * flag on the finalize route, because it is a different act: this CREATES a pending finding for
   * the normal review workflow, it does not finalize one.
   */
  @Post('observations/:id/user-findings')
  createUserAuthoredFinding(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: CreateUserAuthoredFindingDto,
  ) {
    return this.inspections.createUserAuthoredFinding(req.user, id, dto);
  }
}
