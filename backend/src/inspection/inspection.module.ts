import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Inspection } from './inspection.entity';
import { Hazard } from './hazard.entity';
import { InspectionService } from './inspection.service';
import { InspectionController } from './inspection.controller';
import { SitesModule } from '../sites/sites.module';
import { InspectionAssignment } from './entities/inspection-assignment.entity';
import { Observation } from './entities/observation.entity';
import { HazLenzAnalysis } from './entities/hazlenz-analysis.entity';
import { HumanReview } from './entities/human-review.entity';
import { InspectionFinding } from './entities/inspection-finding.entity';
import { OrganizationMembership } from '../organizations/entities/organization-membership.entity';
import { SecurityAuditEvent } from '../audit/entities/security-audit-event.entity';
import { CorrectiveAction } from '../corrective-actions/entities/corrective-action.entity';
import {
  ExpertEffectiveDecisionModule,
} from '../safescope-v2/expert-hazlenz-product/expert-effective-decision.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Inspection,
      Hazard,
      InspectionAssignment,
      Observation,
      HazLenzAnalysis,
      HumanReview,
      InspectionFinding,
      OrganizationMembership,
      SecurityAuditEvent,
      CorrectiveAction,
    ]),
    SitesModule,
    // §265. Finding finalization asks the ONE effective-decision derivation instead of reading
    // `analysisState` and deciding for itself. This is a LEAF module — it imports two repositories
    // and nothing else — which is what makes the dependency acyclic: the Expert product module
    // imports `InspectionModule`, so any Expert module that imported back would not resolve.
    ExpertEffectiveDecisionModule,
  ],
  providers: [InspectionService],
  controllers: [InspectionController],
  exports: [InspectionService, TypeOrmModule],
})
export class InspectionModule {}
