import { SafeScopeStandard } from '../standards/standards.service';

type ScoreInput = {
  hazardType?: string;
  keywords: string[];
  equipment?: string;
  environment?: string;
  calculatedRisk: number;
};

export class ScorerService {
  score(input: ScoreInput, standard: SafeScopeStandard): number {
    let score = 0;

    if (input.hazardType && standard.hazardTags.includes(input.hazardType)) {
      score += 5;
    }

    const keywordMatches = standard.keywordTriggers.filter((keyword: string) =>
      input.keywords.includes(keyword),
    );

    score += keywordMatches.length * 2;

    if (input.equipment && standard.equipmentTags?.includes(input.equipment)) {
      score += 2;
    }

    if (
      input.environment &&
      standard.environmentTags?.includes(input.environment)
    ) {
      score += 1;
    }

    if (standard.severityWeight?.includes(input.calculatedRisk)) {
      score += 1;
    }

    return score;
  }
}
