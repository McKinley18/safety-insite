import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HazLenzAnalysis } from '../../inspection/entities/hazlenz-analysis.entity';
import { HumanReview } from '../../inspection/entities/human-review.entity';
import { ExpertEffectiveDecisionService } from './expert-effective-decision.service';

/**
 * §265 — A LEAF MODULE, DELIBERATELY.
 *
 * It imports two repositories and nothing else. That is what lets `InspectionModule` and
 * `ExpertHazLenzProductModule` both depend on it without a cycle, and therefore what lets finding
 * finalization ask the one derivation instead of re-deriving authority from `analysisState`.
 *
 * Nothing may be added to its imports that reaches back into either of those modules. If a future
 * consumer needs more context than an analysis row, the context belongs at the consumer, not here.
 */
@Module({
  imports: [TypeOrmModule.forFeature([HazLenzAnalysis, HumanReview])],
  providers: [ExpertEffectiveDecisionService],
  exports: [ExpertEffectiveDecisionService],
})
export class ExpertEffectiveDecisionModule {}
