import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ReportsController } from './reports.controller';

// 🔥 IMPORT DEPENDENCIES
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

/**
 * §310 (SC-3) — THE MODULE AFTER THE LEGACY REPORT MODEL WAS RETIRED.
 *
 * `Report`, `Finding` and `ReportAttachment` were removed from `forFeature`, and `ReportsService`
 * from the provider and export lists. All three tables are absent from the canonical manifest and
 * from a fresh migration replay: registering them here made TypeORM build repositories for
 * relations that do not exist, which is exactly how the SC-3 500s were produced.
 *
 * What remains is the model that actually ships: `InspectionReport` / `InspectionReportVersion`,
 * the immutable snapshot taken from a completed inspection, served by `CanonicalReportsController`.
 * `ReportsController` is still mounted because its nine `legacy/reports` routes answer 410 — that
 * is a deliberate compatibility signal, and it needs no dependency to produce.
 *
 * `StandardsModule` and `RecommendationsModule` went with `ReportsService`, which was their only
 * consumer here.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      InspectionReport, InspectionReportVersion,
      LegacyReportQuarantine, CorrectiveAction, SecurityAuditEvent, Site, User,
    ]),
    forwardRef(() => ActionEngineModule),
    CorrectiveActionsModule,
    InspectionModule,
    StorageModule,
  ],
  controllers: [ReportsController, CanonicalReportsController],
  providers: [CanonicalReportsService],
  exports: [CanonicalReportsService],
})
export class ReportsModule {}
