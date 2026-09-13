import { Injectable } from '@nestjs/common';
import { ExpertApplicabilityRule } from './standard-applicability.types';

@Injectable()
export class FollowUpQuestionIntelligenceService {
  generateQuestions(failedRules: ExpertApplicabilityRule[]): string[] {
    const questions: string[] = [];
    for (const rule of failedRules) {
      for (const question of rule.followUpQuestions) {
        if (!questions.includes(question)) {
          questions.push(question);
        }
      }
    }
    return questions;
  }
}
