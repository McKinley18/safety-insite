import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CorrectiveActionsController } from './corrective-actions.controller';
import { CorrectiveActionsService } from './corrective-actions.service';
import { CorrectiveAction } from './entities/corrective-action.entity';
import { AuditModule } from '../audit/audit.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { IntelligenceModule } from '../intelligence/intelligence.module';
import { OutcomesModule } from '../outcomes/outcomes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CorrectiveAction]), 
    AuditModule, 
    NotificationsModule,
    forwardRef(() => IntelligenceModule),
    OutcomesModule,
  ],
  controllers: [CorrectiveActionsController],
  providers: [CorrectiveActionsService],
  exports: [CorrectiveActionsService],
})
export class CorrectiveActionsModule {}
