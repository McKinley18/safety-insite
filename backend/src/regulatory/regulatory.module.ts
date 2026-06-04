import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegulatoryAgency } from './entities/regulatory-agency.entity';
import { RegulatoryPart } from './entities/regulatory-part.entity';
import { RegulatorySubpart } from './entities/regulatory-subpart.entity';
import { RegulatorySection } from './entities/regulatory-section.entity';
import { RegulatoryParagraph } from './entities/regulatory-paragraph.entity';
import { StandardMatchFeedback } from '../standards/entities/standard-match-feedback.entity';
import { RegulatoryController } from './regulatory.controller';
import { RegulatoryService } from './regulatory.service';
import { RegulatorySyncService } from './regulatory-sync.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RegulatoryAgency,
      RegulatoryPart,
      RegulatorySubpart,
      RegulatorySection,
      RegulatoryParagraph,
      StandardMatchFeedback,
    ]),
  ],
  controllers: [RegulatoryController],
  providers: [RegulatoryService, RegulatorySyncService],
  exports: [RegulatoryService],
})
export class RegulatoryModule {}
