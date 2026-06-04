import { Injectable } from '@nestjs/common';
import { SafeScopeStandard } from '../standards/standards.service';
import { ScorerService } from './scorer.service';
import { KeywordService } from './keyword.service';
import { BehaviorService } from './behavior.service';
import { RiskService } from './risk.service';
import { FeedbackService } from './feedback.service';

@Injectable()
export class MatcherService {
  constructor(
    private scorer: ScorerService,
    private keywordService: KeywordService,
    private behaviorService: BehaviorService,
    private riskService: RiskService,
    private feedbackService: FeedbackService
  ) {}

  async match(input: any, standards: SafeScopeStandard[]) {

    const keywords = this.keywordService.extract(
      `${input.description || ''} ${input.task || ''} ${input.environment || ''}`
    );

    const behaviors = this.behaviorService.detect(input.description);
    const riskWeight = this.riskService.getWeight(input.calculatedRisk);

    let preferredDomain: string | null = null;

    if (input.environment?.toLowerCase().includes('mine')) {
      preferredDomain = 'MSHA';
    }

    const enriched = await Promise.all(standards.map(async (s) => {

      let score = this.scorer.score({ ...input, keywords }, s);

      if (!s.hazardTags.includes(input.hazardType)) score -= 6;
      if (preferredDomain && s.domain !== preferredDomain) score -= 5;

      if (input.environment && s.environmentTags?.length) {
        if (!s.environmentTags.includes(input.environment)) score -= 3;
      }

      if (behaviors.includes("PPE_VIOLATION")) {
        if (s.title.toLowerCase().includes("seat belt")) score += 6;
        else score -= 3;
      }

      if (this.riskService.isSevere(input.calculatedRisk)) {
        if (s.severityWeight?.includes(input.calculatedRisk)) score += 4;
      }

      // 🔥 DB-BASED FEEDBACK
      const feedbackBoost = await this.feedbackService.getBoost(s.citation);
      score += feedbackBoost;

      score = score * (1 + riskWeight * 0.2);

      return { standard: s, score };
    }));

    return enriched
      .filter(e => e.score > 5)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }
}
