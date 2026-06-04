import { Injectable } from '@nestjs/common';
import { HAZARD_FAMILIES } from './data/hazard-conditions';

type HazardFamilyKey = keyof typeof HAZARD_FAMILIES;

@Injectable()
export class MatchEngineService {
  match(desc: string, category: string, mode: string) {
    const descNormal = desc
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .trim();

    // Stage 1: Family Detection
    let bestFamily: {
      id: HazardFamilyKey | 'other_uncertain';
      score: number;
    } = {
      id: 'other_uncertain',
      score: 0,
    };

    for (const [id, config] of Object.entries(
      HAZARD_FAMILIES,
    ) as [HazardFamilyKey, (typeof HAZARD_FAMILIES)[HazardFamilyKey]][]) {
      let score = 0;

      config.keywords.forEach((keyword: string) => {
        if (descNormal.includes(keyword)) score += 50;
      });

      if (score > bestFamily.score) {
        bestFamily = { id, score };
      }
    }

    if (bestFamily.score < 30) {
      return {
        primaryConditionId: 'other_uncertain',
        confidence: 0,
      };
    }

    // Stage 2: Subtype Detection
    const familyConfig = HAZARD_FAMILIES[
      bestFamily.id as HazardFamilyKey
    ];

    let bestSubtype: {
      id: string;
      score: number;
    } = {
      id: familyConfig.conditions[0],
      score: 0,
    };

    familyConfig.conditions.forEach((cond: string) => {
      let subScore = 0;

      if (descNormal.includes(cond.replace('_', ' '))) {
        subScore += 100;
      }

      if (subScore > bestSubtype.score) {
        bestSubtype = {
          id: cond,
          score: subScore,
        };
      }
    });

    return {
      primaryConditionId: bestSubtype.id,
      parentConditionId: bestFamily.id,
      confidence: bestFamily.score + bestSubtype.score,
      needsReview: bestSubtype.score < 50,
    };
  }
}
