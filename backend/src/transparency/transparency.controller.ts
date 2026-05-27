import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { TransparencyService } from './transparency.service';

@UseGuards(JwtGuard)
@Controller('reports')
export class TransparencyController {
  constructor(private readonly transparencyService: TransparencyService) {}

  @Get(':id/explain')
  async explain(@Param('id') id: string, @Req() req: Request & { user?: any }) {
    const breakdown = await this.transparencyService.getDecisionBreakdown(id, req.user);
    const justification = await this.transparencyService.getActionJustification(id);
    const outcome = await this.transparencyService.getOutcomeExplanation(id);

    const primaryMatch = breakdown.signals.fuzzyMatches[0] || 'available evidence';

    const narrative = `This hazard was classified as ${breakdown.category} with ${breakdown.confidenceLevel} confidence due to direct matches with '${primaryMatch}'. The recommended action is ${justification.priority} because it presents ${justification.whyThisAction} per ${justification.standardJustification}. The corrective action has been ${outcome.effectiveness}ly verified after ${outcome.factors.observationWindow} days with no recurrence in a high-exposure area.`;

    return {
      breakdown,
      justification,
      outcome,
      narrative,
    };
  }
}
