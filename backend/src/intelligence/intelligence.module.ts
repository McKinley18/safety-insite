import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FixFeedbackService } from './fix-feedback.service';
import { FixFeedback } from './fix-feedback.entity';
import { HazardFixService } from './hazard-fix.service';
import { MatchEngine } from './engine/match.engine';

@Module({
  imports: [TypeOrmModule.forFeature([FixFeedback])],
  providers: [FixFeedbackService, HazardFixService, MatchEngine],
  exports: [FixFeedbackService, HazardFixService, MatchEngine],
})
export class IntelligenceModule {}
