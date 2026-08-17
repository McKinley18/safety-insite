import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CorrectiveAction } from '../corrective-actions/entities/corrective-action.entity';
import { Inspection } from '../inspection/inspection.entity';
import { OrganizationMembership } from '../organizations/entities/organization-membership.entity';
import { Site } from '../sites/entities/site.entity';
import { Task } from './task.entity';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [TypeOrmModule.forFeature([
    Task,
    CorrectiveAction,
    Inspection,
    OrganizationMembership,
    Site,
  ])],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
