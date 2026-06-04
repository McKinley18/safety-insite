import { Injectable } from '@nestjs/common';

@Injectable()
export class StandardsService {
  private standards = [
    {
      citation: '30 CFR 56.11001',
      description: 'Safe access must be provided and maintained',
      keywords: ['fall', 'ladder', 'walkway', 'platform'],
    },
    {
      citation: '30 CFR 56.12016',
      description: 'Electrical equipment must be de-energized before work',
      keywords: ['electrical', 'wiring', 'energized', 'shock'],
    },
    {
      citation: '30 CFR 56.15005',
      description: 'Safety belts and lines must be worn where there is a danger of falling',
      keywords: ['fall', 'height', 'edge'],
    },
  ];

  match(text: string) {
    const input = text.toLowerCase();

    const matches = this.standards.map((s) => {
      const hits = s.keywords.filter(k => input.includes(k));

      return {
        citation: s.citation,
        description: s.description,
        confidence: hits.length / s.keywords.length,
      };
    });

    return matches
      .filter(m => m.confidence > 0)
      .sort((a, b) => b.confidence - a.confidence);
  }
}
