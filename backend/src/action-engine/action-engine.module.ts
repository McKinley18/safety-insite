import { Module, forwardRef } from '@nestjs/common';
import { ActionEngineService } from './action-engine.service';
import { ActionEngineController } from './action-engine.controller';
import { ReportsModule } from '../reports/reports.module';
import { CorrectiveActionsModule } from '../corrective-actions/corrective-actions.module';
import { IntelligenceModule } from '../intelligence/intelligence.module';

@Module({
  imports: [
    forwardRef(() => ReportsModule),
    CorrectiveActionsModule,
    IntelligenceModule,
  ],
  providers: [ActionEngineService],
  controllers: [ActionEngineController],
  exports: [ActionEngineService],
})
export class ActionEngineModule {}
