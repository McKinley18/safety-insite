import { Module } from '@nestjs/common';
import { PredictiveService } from './predictive.service';

@Module({
  providers: [PredictiveService],
  exports: [PredictiveService],
})
export class PredictiveModule {}
