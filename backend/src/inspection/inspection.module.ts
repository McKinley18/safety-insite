import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Inspection } from './inspection.entity';
import { Hazard } from './hazard.entity';
import { InspectionService } from './inspection.service';
import { InspectionController } from './inspection.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Inspection, Hazard])],
  providers: [InspectionService],
  controllers: [InspectionController],
})
export class InspectionModule {}
