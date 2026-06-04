import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FixFeedback } from './fix-feedback.entity';

@Injectable()
export class FixFeedbackService {
  constructor(
    @InjectRepository(FixFeedback)
    private feedbackRepo: Repository<FixFeedback>,
  ) {}

  async recordFeedback(data: Partial<FixFeedback>): Promise<FixFeedback> {
    const feedback = this.feedbackRepo.create(data);
    return await this.feedbackRepo.save(feedback);
  }

  async findLearnedFix(category: string): Promise<string[]> {
    try {
      const normalizedCategory = category.toLowerCase().trim();

      const entries = await this.feedbackRepo.find({
        where: { category: normalizedCategory, approved: true },
      });

      if (entries.length === 0) return [];

      const frequencyMap: Record<string, number> = {};
      entries.forEach((entry) => {
        const title = entry.userAction?.title;
        if (title) {
          frequencyMap[title] = (frequencyMap[title] || 0) + 1;
        }
      });

      return Object.entries(frequencyMap)
        .filter(([_, count]) => count >= 2)
        .sort((a, b) => b[1] - a[1])
        .map(([title]) => title)
        .slice(0, 3);
    } catch (error) {
      console.warn("Fix feedback lookup skipped:", error);
      return [];
    }
  }
}
