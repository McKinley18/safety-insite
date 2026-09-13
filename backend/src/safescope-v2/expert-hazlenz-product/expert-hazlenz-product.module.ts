import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HazLenzAnalysis } from '../../inspection/entities/hazlenz-analysis.entity';
import { HumanReview } from '../../inspection/entities/human-review.entity';
import { SecurityAuditEvent } from '../../audit/entities/security-audit-event.entity';
import { InspectionModule } from '../../inspection/inspection.module';
import { SitesModule } from '../../sites/sites.module';
import { SafescopeV2Module } from '../safescope-v2.module';
import { ExpertAnalysisExecution } from './expert-analysis-execution.entity';
import { ExpertAnalysisService } from './expert-analysis.service';
import { ExpertAnalysisContextService } from './expert-analysis-context';
import { ExpertAnalysisExecutionService } from './expert-analysis-execution.service';
import { ExpertAnalysisController } from './expert-analysis.controller';
import { expertSemanticTransportProvider } from './expert-semantic-transport.provider';

/**
 * §261/§262 — the Expert product-integration module.
 *
 * §261 REGISTERED A SERVICE AND NO CONTROLLER. §262 adds the authoritative execution service, the
 * server-side context loader, the provider seam and the one protected route. The layering is
 * deliberate and is what keeps the §261 property checkable:
 *
 *   ExpertAnalysisService            authority, persistence, audit. NO provider dependency.
 *   ExpertAnalysisContextService     the server's own view of what Expert reasons over.
 *   ExpertAnalysisExecutionService   the ONLY thing that can reach a provider.
 *   ExpertAnalysisController         the one route, carrying the analysis-production guard profile.
 *
 * IT IMPORTS `InspectionModule` RATHER THAN RE-IMPLEMENTING ACCESS CONTROL. `InspectionService`
 * owns `authorizeObservation` and `findAccessible`, which are the existing tenant choke point. The
 * whole point of depending on them is that Expert introduces NO new authorization mechanism: one
 * implementation of "may this user touch this observation" continues to serve every caller, so a
 * future change to tenancy cannot leave an Expert path behind on the old rules.
 *
 * IT IMPORTS `SafescopeV2Module` because §260 froze the Expert input as being built from a
 * deterministic analysis the SERVER runs, not from one a client posts. No cycle exists:
 * `SafescopeV2Module` imports `InspectionModule` and neither imports this one.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      ExpertAnalysisExecution, HazLenzAnalysis, HumanReview, SecurityAuditEvent,
    ]),
    InspectionModule,
    SitesModule,
    SafescopeV2Module,
  ],
  controllers: [ExpertAnalysisController],
  providers: [
    ExpertAnalysisService,
    ExpertAnalysisContextService,
    ExpertAnalysisExecutionService,
    expertSemanticTransportProvider,
  ],
  exports: [ExpertAnalysisService, ExpertAnalysisExecutionService, TypeOrmModule],
})
export class ExpertHazLenzProductModule {}
