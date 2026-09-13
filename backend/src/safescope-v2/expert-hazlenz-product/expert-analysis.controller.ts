import { Body, Controller, Param, ParseUUIDPipe, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { JwtGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { EntitlementGuard, RequireEntitlement } from '../../auth/entitlements/entitlement.guard';
import { RequestExpertAnalysisDto } from './dto/request-expert-analysis.dto';
import { ExpertAnalysisExecutionService } from './expert-analysis-execution.service';
import { toExpertAnalysisResponse, type ExpertAnalysisResponse } from './expert-analysis-response';

/**
 * §262 — THE PROTECTED EXPERT PRODUCT ROUTE.
 *
 * ---------------------------------------------------------------------------------------------
 * THE GUARD PROFILE IS THE ANALYSIS-PRODUCTION ONE, DELIBERATELY, AND NOT THE PERSISTENCE ONE.
 *
 * §260 section 1 measured both profiles that exist today:
 *
 *   POST /safescope-v2/classify                     JwtGuard, EntitlementGuard('fullSafeScope'),
 *                                                   RolesGuard, Throttle 30/60s
 *   POST /inspections/observations/:id/analyses     JwtGuard only
 *
 * The second is where analyses are PERSISTED and the first is where analysis is PRODUCED. This
 * route produces, and it produces the most expensive thing the product does — two provider legs
 * against a hosted model — so it carries the production profile. Inheriting the persistence
 * profile because the resource is an observation would have left the expensive path with no
 * entitlement gate and no rate control at all.
 *
 * THE THROTTLE IS STRICTER THAN CLASSIFY'S, NOT EQUAL TO IT. An admitting Expert analysis is two
 * hosted calls plus a deterministic analysis; a classify request is neither. 10 per minute per
 * caller is comfortably above any real inspection cadence and far below what an abusive client
 * would need to be interesting. §262 does not redesign rate limiting: the mechanism is the existing
 * global `ThrottlerGuard`, and this decorator only names this route's own limit.
 *
 * THE TENANT CHECK IS NOT HERE, AND THAT IS THE POINT. Ownership resolves through
 * `InspectionService.authorizeObservation` inside the service, which is the same choke point every
 * other observation route uses and which answers NotFound rather than Forbidden. A cross-workspace
 * request therefore cannot learn whether the observation exists, and a future change to tenancy
 * cannot leave this route behind on old rules because there is no second implementation to update.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THE ROUTE LIVES HERE AND NOT ON `InspectionController`.
 *
 * `InspectionController` is annotated `@UseGuards(JwtGuard)` at the class level. Adding this route
 * there would put the Expert endpoint one careless edit away from inheriting the weaker profile,
 * and would mean the strongest and the weakest endpoints in the product shared a guard declaration.
 * It is registered on the same PATH — the resource is still an observation — from its own
 * controller, whose only route is this one.
 */
@Controller('inspections/observations')
export class ExpertAnalysisController {
  constructor(private readonly executions: ExpertAnalysisExecutionService) {}

  @UseGuards(JwtGuard, EntitlementGuard, RolesGuard)
  @RequireEntitlement('fullSafeScope')
  @Roles('INDIVIDUAL', 'MEMBER', 'MANAGER', 'ORGANIZATION_ADMIN', 'ORG_OWNER', 'SAFETY_DIRECTOR', 'SUPERVISOR', 'AUDITOR', 'WORKER')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post(':id/expert-analyses')
  async requestExpertAnalysis(
    @Req() req: { user?: unknown },
    @Param('id', new ParseUUIDPipe()) observationId: string,
    @Body() dto: RequestExpertAnalysisDto,
  ): Promise<ExpertAnalysisResponse> {
    const result = await this.executions.execute(req.user, observationId, {
      idempotencyKey: dto.idempotencyKey,
      requestVersion: dto.requestVersion,
      taskContext: dto.taskContext ?? null,
      answeredClarifications: dto.answeredClarifications ?? [],
    });
    return toExpertAnalysisResponse(result);
  }
}
