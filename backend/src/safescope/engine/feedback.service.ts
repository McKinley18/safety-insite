import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeedbackEntity } from '../standards/feedback.entity';

@Injectable()
export class FeedbackService {

  constructor(
    @InjectRepository(FeedbackEntity)
    private repo: Repository<FeedbackEntity>,
  ) {}

  async add(feedback: any) {
    const entity = this.repo.create(feedback);
    return this.repo.save(entity);
  }

  async getBoost(citation: string): Promise<number> {
    const records = await this.repo.find({ where: { citation } });

    let score = 0;

    records.forEach(r => {
      if (r.action === 'accepted') score += 2;
      if (r.action === 'rejected') score -= 3;
    });

    return score;
  }
}
