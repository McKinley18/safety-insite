import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DecisionGovernanceLog } from './decision-governance.entity';
import { DecisionGovernanceService } from './decision-governance.service';
import { IntelligenceModule } from '../intelligence/intelligence.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DecisionGovernanceLog]),
    IntelligenceModule,
  ],
  providers: [DecisionGovernanceService],
  exports: [DecisionGovernanceService],
})
export class GovernanceModule {}
