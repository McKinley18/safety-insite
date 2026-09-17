import { Controller, Post, Param, Headers, NotFoundException, Inject, forwardRef, Req, UseGuards, GoneException } from '@nestjs/common';
import { Request } from 'express';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { EntitlementGuard, RequireEntitlement } from '../auth/entitlements/entitlement.guard';
import { ActionEngineService, ActionInput } from './action-engine.service';
import { CorrectiveActionsService } from '../corrective-actions/corrective-actions.service';

@UseGuards(JwtGuard, EntitlementGuard)
@RequireEntitlement('cloudReports')
@Controller('action-engine')
export class ActionEngineController {
  constructor(
    private readonly actionEngineService: ActionEngineService,
    
    private readonly correctiveActionsService: CorrectiveActionsService,
  ) {}

  /**
   * §310 (SC-3) — RETIRED. THE FIFTH REACHABLE MISSING-RELATION ROUTE, AND THE ONE A ROUTE TABLE
   * FOUND THAT READING CONTROLLERS DID NOT.
   *
   * It read a legacy `Report` and generated corrective actions from `report.findings` — both the
   * `report` and `finding` tables were retired with the mutable report model and exist in neither
   * the canonical manifest nor a fresh replay, so every call reached a missing relation.
   *
   * The capability itself is not lost: corrective actions are generated from an inspection's
   * FINALIZED findings and managed through `/actions`, which §305A and §307 both exercise
   * end to end. This route was the predecessor of that, not a second way to do it.
   */
  @Post('generate/:reportId')
  async generateActions(
    @Param('reportId') reportId: string,
    @Req() req: Request & { user?: any },
  ) {
    void reportId;
    void req;
    throw new GoneException('Generating corrective actions from a legacy report is retired. '
      + 'Corrective actions are raised from a completed inspection\'s findings at /actions.');
  }
}
