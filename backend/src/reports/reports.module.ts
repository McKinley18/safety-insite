import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

// 🔥 IMPORT YOUR ENTITIES
import { Report } from './entities/report.entity';
import { Finding } from './entities/finding.entity';
import { ReportAttachment } from './entities/attachment.entity';

// 🔥 IMPORT DEPENDENCIES
import { StandardsModule } from '../standards/standards.module';
import { RecommendationsModule } from '../recommendations/recommendations.module';
import { ActionEngineModule } from '../action-engine/action-engine.module';
import { CorrectiveActionsModule } from '../corrective-actions/corrective-actions.module';
import { InspectionModule } from '../inspection/inspection.module';
import { StorageModule } from '../storage/storage.module';
import { SecurityAuditEvent } from '../audit/entities/security-audit-event.entity';
import { CorrectiveAction } from '../corrective-actions/entities/corrective-action.entity';
import { CanonicalReportsController } from './canonical-reports.controller';
import { CanonicalReportsService } from './canonical-reports.service';
import { InspectionReport } from './entities/inspection-report.entity';
import { InspectionReportVersion } from './entities/inspection-report-version.entity';
import { LegacyReportQuarantine } from './entities/legacy-report-quarantine.entity';
import { Site } from '../sites/entities/site.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Report, Finding, ReportAttachment, InspectionReport, InspectionReportVersion,
      LegacyReportQuarantine, CorrectiveAction, SecurityAuditEvent, Site, User,
    ]),
    StandardsModule,
    RecommendationsModule,
    forwardRef(() => ActionEngineModule),
    CorrectiveActionsModule,
    InspectionModule,
    StorageModule,
  ],
  controllers: [ReportsController, CanonicalReportsController],
  providers: [ReportsService, CanonicalReportsService],
  exports: [ReportsService, CanonicalReportsService],
})
export class ReportsModule {}
