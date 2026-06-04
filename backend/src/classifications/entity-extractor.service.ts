import { Injectable } from '@nestjs/common';

@Injectable()
export class EntityExtractorService {
  private readonly patterns = [
    { type: 'equipment', keywords: ['forklift', 'drill', 'conveyor', 'ladder', 'harness', 'welder'] },
    { type: 'location', keywords: ['floor', 'warehouse', 'loading dock', 'office', 'roof'] },
    { type: 'condition', keywords: ['wet', 'slick', 'dark', 'crowded', 'noisy'] },
  ];

  extract(text: string) {
    const extracted = [];
    const lower = text.toLowerCase();
    
    for (const pattern of this.patterns) {
      for (const keyword of pattern.keywords) {
        if (lower.includes(keyword)) {
          extracted.push({ type: pattern.type, value: keyword });
        }
      }
    }
    return extracted;
  }
}
