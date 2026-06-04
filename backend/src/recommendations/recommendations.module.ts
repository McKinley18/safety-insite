import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecommendationsService } from './recommendations.service';
import { RecommendationFeedback } from './entities/recommendation-feedback.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RecommendationFeedback])],
  providers: [RecommendationsService],
  exports: [RecommendationsService],
})
export class RecommendationsModule {}
