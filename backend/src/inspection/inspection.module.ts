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
  ],
  providers: [InspectionService],
  controllers: [InspectionController],
  exports: [InspectionService, TypeOrmModule],
})
export class InspectionModule {}
