import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassificationsController } from './classifications.controller';
import { ClassificationsService } from './classifications.service';
import { Classification } from './entities/classification.entity';
import { Report } from '../reports/entities/report.entity';
import { AuditModule } from '../audit/audit.module';
import { TaxonomyModule } from '../taxonomy/taxonomy.module';
import { RuleEngine } from './rule-engine.service';
import { EntityExtractorService } from './entity-extractor.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Classification, Report]),
    AuditModule,
    TaxonomyModule,
  ],
  controllers: [ClassificationsController],
  providers: [
    ClassificationsService,
    RuleEngine,
    EntityExtractorService,
  ],
  exports: [ClassificationsService],
})
export class ClassificationsModule {}
