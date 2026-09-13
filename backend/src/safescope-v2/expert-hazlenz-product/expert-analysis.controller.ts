import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { JwtGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { EntitlementGuard, RequireEntitlement } from '../../auth/entitlements/entitlement.guard';
import { RequestExpertAnalysisDto } from './dto/request-expert-analysis.dto';
import { SettleExpertAnalysisDto } from './dto/settle-expert-analysis.dto';
import { ExpertAnalysisExecutionService } from './expert-analysis-execution.service';
import { ExpertAnalysisService } from './expert-analysis.service';
import {
  toExpertAnalysisReadResponse, toExpertAnalysisResponse, toExpertSettlementResponse,
  type ExpertAnalysisReadResponse, type ExpertAnalysisResponse, type ExpertSettlementResponse,
} from './expert-analysis-response';
import { ExpertEffectiveDecisionService } from './expert-effective-decision.service';
import { resolveConfirmationSubject } from './expert-settlement-contract';
import type { SettlementDecision } from './expert-settlement-contract';
import { deriveEffectiveDecision } from './expert-effective-decision';
import type { AnalysisState } from './expert-analysis-authority';

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
  constructor(
    private readonly executions: ExpertAnalysisExecutionService,
    private readonly authority: ExpertAnalysisService,
    // §265. The ONE derivation of whether a conclusion is settled, shared with the downstream
    // consumer. The controller asks it rather than holding an opinion of its own.
    private readonly effective: ExpertEffectiveDecisionService,
  ) {}

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
    // §265. The response carries the server's own derivation and the server's own question. The
    // browser is handed both so it never has to compute either — the whole point of the frontend
    // authority boundary this slice implements.
    const effective = result.analysis === null
      ? null
      : await this.effective.forAnalysis(result.analysis);
    const subject = result.analysis !== null && result.analysis.confirmationRequired
      ? resolveConfirmationSubject(
        (result.analysis.resultSnapshot as Record<string, unknown>)?.posture ?? null,
        result.execution.confirmationRuleVersion ?? null,
      )
      : null;
    return toExpertAnalysisResponse(
      result,
      // No analysis row means no analysis to decide about: a failed or refused execution that
      // persisted nothing. The execution state carries the reason, and the derivation is asked
      // about the execution's own state rather than being handed a benign default.
      effective ?? deriveEffectiveDecision({
        analysisState: result.execution.executionState as AnalysisState, settlement: null,
      }),
      subject,
    );
  }

  /**
   * §265 — READ THE CURRENT EXPERT ANALYSIS FOR AN OBSERVATION.
   *
   * SAME GUARD PROFILE AS THE TWO WRITES. A read of a safety analysis is not a lesser act than
   * producing one, and giving it a weaker profile would put the analysis behind the strongest gate
   * in the product and its contents behind a weaker one. The throttle is the settlement route's,
   * because a read costs no provider legs and an interface polling a running execution must not be
   * starved.
   *
   * IT IS A READ AND IT WRITES NOTHING — in particular it never re-executes, so an interface that
   * refreshes cannot spend. That is why the frontend has a way to recover state that is not
   * "request the analysis again".
   */
  @UseGuards(JwtGuard, EntitlementGuard, RolesGuard)
  @RequireEntitlement('fullSafeScope')
  @Roles('INDIVIDUAL', 'MEMBER', 'MANAGER', 'ORGANIZATION_ADMIN', 'ORG_OWNER', 'SAFETY_DIRECTOR', 'SUPERVISOR', 'AUDITOR', 'WORKER')
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  @Get(':id/expert-analyses/current')
  async readCurrentExpertAnalysis(
    @Req() req: { user?: unknown },
    @Param('id', new ParseUUIDPipe()) observationId: string,
  ): Promise<ExpertAnalysisReadResponse> {
    const model = await this.authority.readExpertAnalysisForObservation(req.user, observationId);
    const effective = model.analysis === null
      ? null
      : await this.effective.forAnalysis(model.analysis);
    return toExpertAnalysisReadResponse(model, effective);
  }

  /**
   * §264 — THE HUMAN SETTLEMENT OF AN EXPERT OPERATIONAL CLASSIFICATION.
   *
   * ONE ROUTE FOR CONFIRM AND OVERRIDE, because they are two outcomes of one act: one eligibility
   * rule, one concurrency guarantee, one audit path, one state-machine edge. Splitting them would
   * duplicate all four and give the eligibility check two places to drift.
   *
   * THE SAME GUARD PROFILE AS THE EXECUTION ROUTE, and for a stronger reason. Executing an Expert
   * analysis spends money; settling one decides whether work continues. §264 requires a profile at
   * least as strong, and this is the same one — JwtGuard, the `fullSafeScope` entitlement, the role
   * list and a dedicated throttle — declared on the same controller so it cannot inherit the
   * weaker persistence posture.
   *
   * THE THROTTLE IS LOOSER THAN THE EXECUTION ROUTE'S, and that is deliberate rather than an
   * oversight. A settlement costs no provider legs and no deterministic analysis; it is a human
   * pressing a button, and a reviewer working through a backlog of pending analyses should not be
   * rate-limited as though each decision cost two hosted calls. It is still bounded.
   *
   * THE ANALYSIS ID IS NOT A BARE KEY. It is addressed under its observation, and the service
   * resolves it as `{ id, observationId }` only after the observation has been authorized — the
   * §261 pattern — so an id from another workspace answers NotFound and discloses nothing.
   */
  @UseGuards(JwtGuard, EntitlementGuard, RolesGuard)
  @RequireEntitlement('fullSafeScope')
  @Roles('INDIVIDUAL', 'MEMBER', 'MANAGER', 'ORGANIZATION_ADMIN', 'ORG_OWNER', 'SAFETY_DIRECTOR', 'SUPERVISOR', 'AUDITOR', 'WORKER')
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  @Post(':id/expert-analyses/:analysisId/settlement')
  async settleExpertAnalysis(
    @Req() req: { user?: unknown },
    @Param('id', new ParseUUIDPipe()) observationId: string,
    @Param('analysisId', new ParseUUIDPipe()) analysisId: string,
    @Body() dto: SettleExpertAnalysisDto,
  ): Promise<ExpertSettlementResponse> {
    const result = await this.authority.settleExpertAnalysis(req.user, observationId, analysisId, {
      idempotencyKey: dto.idempotencyKey,
      decision: dto.decision as SettlementDecision,
      rationale: dto.rationale,
      replacements: dto.replacements ?? [],
      comment: dto.comment ?? null,
    });
    const effective = await this.effective.forAnalysis(result.analysis);
    return toExpertSettlementResponse(result, effective);
  }

}
