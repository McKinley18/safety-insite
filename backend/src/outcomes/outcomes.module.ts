import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Outcome } from './outcome.entity';
import { OutcomeService } from './outcome.service';
import { CorrectiveAction } from '../corrective-actions/entities/corrective-action.entity';
import { IntelligenceModule } from '../intelligence/intelligence.module';

@Module({
  imports: [IntelligenceModule, 
    TypeOrmModule.forFeature([Outcome, CorrectiveAction]),
    IntelligenceModule
  ],
  providers: [OutcomeService],
  exports: [OutcomeService],
})
export class OutcomesModule {}
