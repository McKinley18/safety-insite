import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecommendationFeedback } from './entities/recommendation-feedback.entity';

@Injectable()
export class RecommendationsService {
  constructor(
    @InjectRepository(RecommendationFeedback)
    private feedbackRepo: Repository<RecommendationFeedback>,
  ) {}

  async generate(findings: any[]) {
    const feedback = await this.feedbackRepo.find();

    return findings.map(f => {
      const base = this.getBaseRecommendation(f.hazardCategory);

      const adjusted = this.applyFeedback(f.hazardCategory, base, feedback);

      return {
        hazard: f.hazardCategory,
        severity: f.severity,
        ...adjusted,
      };
    });
  }

  async submitFeedback(data: Partial<RecommendationFeedback>) {
    return this.feedbackRepo.save(data);
  }

  private applyFeedback(hazard: string, base: any, feedback: RecommendationFeedback[]) {
    const relevant = feedback.filter(f => f.hazard === hazard);

    if (relevant.length === 0) return base;

    const rejectedCount = relevant.filter(f => f.action === 'rejected').length;
    const modified = relevant.find(f => f.action === 'modified');

    // 🔥 If user modified → prioritize that
    if (modified?.replacementText) {
      return {
        ...base,
        recommendation: modified.replacementText,
      };
    }

    // 🔥 If too many rejections → soften recommendation
    if (rejectedCount > 2) {
      return {
        ...base,
        recommendation:
          'Review site-specific conditions and determine appropriate corrective action.',
      };
    }

    return base;
  }

  private getBaseRecommendation(hazard: string) {
    const map: any = {
      'Fall Hazard': {
        recommendation:
          'Install or repair fall protection systems including guardrails or personal fall arrest systems.',
        prevention:
          'Ensure consistent use of fall protection equipment.',
        rationale:
          'Falls are a leading cause of fatal injuries.',
        standard:
          'OSHA 1926.501 / MSHA 56.15005',
      },

      Electrical: {
        recommendation:
          'De-energize equipment and apply lockout/tagout procedures.',
        prevention:
          'Only qualified personnel perform electrical work.',
        rationale:
          'Electrical hazards can result in fatal shock or burns.',
        standard:
          'OSHA 1910.147 / MSHA 56.12016',
      },
    };

    return map[hazard] || {
      recommendation:
        'Evaluate hazard and apply appropriate controls.',
      prevention:
        'Ensure training and inspections are conducted.',
      rationale:
        'Uncontrolled hazards increase injury risk.',
      standard:
        'General Duty Clause',
    };
  }
}
