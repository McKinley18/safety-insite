import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HazardTaxonomy } from './entities/hazard-taxonomy.entity';

@Injectable()
export class IntelligenceService {
  constructor(@InjectRepository(HazardTaxonomy) private repo: Repository<HazardTaxonomy>) {}

  async analyze(description: string) {
    const norm = description.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
    const taxonomy = await this.repo.find();
    
    let best = null;
    let maxScore = 0;

    for (const item of taxonomy) {
      let score = 0;
      item.triggerPhrases.forEach(p => { if(norm.includes(p.toLowerCase())) score += 100; });
      if (score > maxScore) {
        maxScore = score;
        best = item;
      }
    }
    
    return best ? {
      condition: best.condition,
      confidence: maxScore,
      questions: maxScore < 100 ? best.clarifyingQuestions : [],
      standards: best.likelyCitations
    } : { condition: 'unknown', confidence: 0 };
  }
}
