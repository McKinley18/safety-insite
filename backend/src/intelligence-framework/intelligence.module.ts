import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HazardTaxonomy } from './entities/hazard-taxonomy.entity';
import { IntelligenceService } from './intelligence.service';

@Module({
  imports: [TypeOrmModule.forFeature([HazardTaxonomy])],
  providers: [IntelligenceService],
  exports: [IntelligenceService],
})
export class IntelligenceLibraryModule {}
