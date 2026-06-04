import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SafeScopeController } from './safescope.controller';
import { SafeScopeService } from './safescope.service';

import { MatcherService } from './engine/matcher.service';
import { ScorerService } from './engine/scorer.service';
import { KeywordService } from './engine/keyword.service';
import { BehaviorService } from './engine/behavior.service';
import { RiskService } from './engine/risk.service';
import { FeedbackService } from './engine/feedback.service';

import { AiService } from './ai/ai.service';
import { StandardsService } from './standards/standards.service';
import { FeedbackEntity } from './standards/feedback.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FeedbackEntity]) // 🔥 THIS FIXES YOUR ERROR
  ],
  controllers: [SafeScopeController],
  providers: [
    SafeScopeService,
    MatcherService,
    ScorerService,
    KeywordService,
    BehaviorService,
    RiskService,
    FeedbackService,
    AiService,
    StandardsService,
  ],
})
export class SafeScopeModule {}
