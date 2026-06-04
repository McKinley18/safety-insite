import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsService } from './reviews.service';
import { Review } from './entities/review.entity';
import { ReviewQueueController } from './review-queue.controller';
import { Classification } from '../classifications/entities/classification.entity';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Classification]), AuditModule],
  controllers: [ReviewQueueController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
