import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { CorrectiveAction } from '../corrective-actions/entities/corrective-action.entity';
import { Site } from '../sites/entities/site.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CorrectiveAction, Site])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardsModule {}
