import { Injectable } from '@nestjs/common';

@Injectable()
export class IntelligenceService {
  constructor() {}

  /* 🔥 PURE INTELLIGENCE — NO DB DEPENDENCY */
  classify(text: string) {
    const lower = text.toLowerCase();

    let hazardCategory = 'general';
    let severity = 3;
    let likelihood = 3;

    if (lower.includes('unguarded') || lower.includes('edge')) {
      hazardCategory = 'fall';
      severity = 4;
      likelihood = 4;
    }

    if (lower.includes('electrical')) {
      hazardCategory = 'electrical';
      severity = 5;
      likelihood = 3;
    }

    return {
      hazardCategory,
      severity,
      likelihood,
      confidence: 0.8,
      reasoning: ['keyword match'],
    };
  }
}
