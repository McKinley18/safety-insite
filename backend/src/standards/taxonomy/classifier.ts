import { HAZARD_TAXONOMY } from './hazard-taxonomy';

export function classifyHazard(text: string) {
  const lower = text.toLowerCase();

  let bestMatch = null;
  let bestScore = 0;

  for (const rule of HAZARD_TAXONOMY) {
    let score = 0;

    for (const keyword of rule.keywords) {
      if (lower.includes(keyword)) {
        score += 1;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = rule;
    }
  }

  return bestMatch;
}
