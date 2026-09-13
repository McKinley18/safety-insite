import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HazLenzAnalysis } from '../../inspection/entities/hazlenz-analysis.entity';
import { SecurityAuditEvent } from '../../audit/entities/security-audit-event.entity';
import { InspectionModule } from '../../inspection/inspection.module';
import { ExpertAnalysisExecution } from './expert-analysis-execution.entity';
import { ExpertAnalysisService } from './expert-analysis.service';

/**
 * §261 — the Expert product-integration module.
 *
 * IT REGISTERS A SERVICE AND NO CONTROLLER, DELIBERATELY. §261 authorizes the server-side
 * foundation only: no Expert route is exposed, so there is nothing for a client to reach. The
 * authenticated, entitlement-gated route arrives in slice 4 and will be registered on the
 * inspection controller, because the resource it acts on is an observation.
 *
 * IT IMPORTS `InspectionModule` RATHER THAN RE-IMPLEMENTING ACCESS CONTROL. `InspectionService`
 * owns `authorizeObservation` and `findAccessible`, which are the existing tenant choke point. The
 * whole point of depending on them is that Expert introduces NO new authorization mechanism: one
 * implementation of "may this user touch this observation" continues to serve every caller, so a
 * future change to tenancy cannot leave an Expert path behind on the old rules.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([ExpertAnalysisExecution, HazLenzAnalysis, SecurityAuditEvent]),
    InspectionModule,
  ],
  providers: [ExpertAnalysisService],
  exports: [ExpertAnalysisService, TypeOrmModule],
})
export class ExpertHazLenzProductModule {}
