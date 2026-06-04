import { Injectable } from '@nestjs/common';

type AiEnhanceInput = {
  calculatedRisk: number;
};

type AiMatch = {
  score?: number;
  standard: {
    recommendedActions: string[];
  };
};

@Injectable()
export class AiService {
  enhance(input: AiEnhanceInput, matches: AiMatch[]) {
    const topScore = matches[0]?.score || 0;

    return {
      reasoning: `Standards selected based on hazard, behavior, and risk level (${input.calculatedRisk}).`,
      recommendedActions: this.cleanActions(matches),
      confidence: this.calculateConfidence(topScore),
    };
  }

  private calculateConfidence(score: number) {
    if (score >= 20) return 0.95;
    if (score >= 15) return 0.9;
    if (score >= 10) return 0.8;
    if (score >= 6) return 0.65;
    return 0.5;
  }

  private cleanActions(matches: AiMatch[]) {
    const actions = new Set<string>();

    matches.forEach((match: AiMatch) => {
      match.standard.recommendedActions.forEach((action: string) =>
        actions.add(action),
      );
    });

    return Array.from(actions).slice(0, 5);
  }
}
