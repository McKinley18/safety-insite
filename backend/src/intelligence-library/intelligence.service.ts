import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HazardTaxonomy } from './entities/hazard-taxonomy.entity';

@Injectable()
export class IntelligenceService {
  constructor(@InjectRepository(HazardTaxonomy) private repo: Repository<HazardTaxonomy>) {}
  // Logic to follow in Phase 2
}
