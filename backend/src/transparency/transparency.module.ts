import { Module } from '@nestjs/common';
import { TransparencyService } from './transparency.service';
import { TransparencyController } from './transparency.controller';
import { ReportsModule } from '../reports/reports.module';
import { CorrectiveActionsModule } from '../corrective-actions/corrective-actions.module';
import { OutcomesModule } from '../outcomes/outcomes.module';
import { IntelligenceModule } from '../intelligence/intelligence.module';

@Module({
  imports: [
    ReportsModule,
    CorrectiveActionsModule,
    OutcomesModule,
    IntelligenceModule
  ],
  providers: [TransparencyService],
  controllers: [TransparencyController],
  exports: [TransparencyService],
})
export class TransparencyModule {}
