import { Injectable } from '@nestjs/common';
import { HazardFix, HAZARD_FIX_LIBRARY } from './hazard-fix.library';
import * as natural from 'natural';

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for', 'if', 'in', 'into', 'is', 'it',
  'no', 'not', 'of', 'on', 'or', 'such', 'that', 'the', 'their', 'then', 'there', 'these',
  'they', 'this', 'to', 'was', 'will', 'with'
]);

function normalizeCategory(cat: string): string {
  const c = String(cat || '').toLowerCase().trim();
  if (c.includes('machine') || c.includes('guard')) return 'machine';
  if (c.includes('electrical') || c.includes('circuit') || c.includes('energized') || c.includes('wiring')) return 'electrical';
  if (c.includes('slip') || c.includes('trip') || c.includes('housekeeping') || c.includes('working surface') || c.includes('aisle')) return 'slip';
  if (c.includes('fall') || c.includes('scaffold') || c.includes('ladder') || c.includes('harness')) return 'fall';
  if (c.includes('excavation') || c.includes('trench') || c.includes('ground')) return 'excavation';
  if (c.includes('ppe') || c.includes('respiratory') || c.includes('mask') || c.includes('glasses')) return 'ppe';
  if (c.includes('fire') || c.includes('explosion') || c.includes('ignition')) return 'fire';
  if (c.includes('chemical') || c.includes('communication') || c.includes('label') || c.includes('sds')) return 'chemical';
  if (c.includes('dust') || c.includes('silica') || c.includes('hygiene')) return 'industrial hygiene';
  if (c.includes('egress') || c.includes('emergency') || c.includes('preparedness')) return 'emergency preparedness';
  if (c.includes('loto') || c.includes('lockout') || c.includes('tagout')) return 'loto';
  if (c.includes('mobile') || c.includes('equipment') || c.includes('haulage') || c.includes('vehicle') || c.includes('traffic')) return 'powered mobile equipment';
  return c;
}

function getStemmedTokens(text: string): string[] {
  if (!text) return [];
  const tokenizer = new natural.WordTokenizer();
  const tokens = tokenizer.tokenize(text.toLowerCase()) || [];
  return tokens
    .filter(token => token.length > 1 && !STOP_WORDS.has(token))
    .map(token => natural.PorterStemmer.stem(token));
}

@Injectable()
export class HazardFixService {
  private readonly library: HazardFix[] = HAZARD_FIX_LIBRARY;

  findByCategory(category: string): HazardFix[] {
    const normalizedCategory = category.toLowerCase().trim();
    return this.library.filter((item) => item.category === normalizedCategory);
  }

  findBestMatch(input: string, categoryHint?: string): HazardFix | null {
    if (!input) return null;
    const normalizedInput = input.toLowerCase().trim();

    // 1. Direct Hazard Name Match (Exact or Includes)
    const directMatch = this.library.find((item) => 
      normalizedInput.includes(item.hazard.toLowerCase()) || 
      item.hazard.toLowerCase().includes(normalizedInput)
    );
    if (directMatch) return directMatch;

    // 2. Category Keyword Match (if no categoryHint is provided, or as early return)
    if (!categoryHint) {
      const categoryMatch = this.library.find((item) => 
        normalizedInput.includes(item.category)
      );
      if (categoryMatch) return categoryMatch;
    }

    // 3. Fallback: Search within Violation text
    const violationMatch = this.library.find((item) =>
      item.violation.toLowerCase().includes(normalizedInput)
    );
    if (violationMatch) return violationMatch;

    // 4. Advanced NLP Stemmed Token Overlap Match
    const inputTokens = getStemmedTokens(input);
    if (inputTokens.length === 0) return null;

    let bestItem: HazardFix | null = null;
    let highestScore = 0;

    const normCategoryHint = categoryHint ? normalizeCategory(categoryHint) : null;

    for (const item of this.library) {
      const hazardTokens = getStemmedTokens(item.hazard);
      const violationTokens = getStemmedTokens(item.violation);

      const hazardIntersection = inputTokens.filter(t => hazardTokens.includes(t));
      const violationIntersection = inputTokens.filter(t => violationTokens.includes(t));

      const hazardOverlapScore = hazardIntersection.length / Math.max(1, hazardTokens.length);
      const violationOverlapScore = violationIntersection.length / Math.max(1, violationTokens.length);

      let score = (hazardOverlapScore * 2.0) + (violationOverlapScore * 1.0);
      score += (hazardIntersection.length + violationIntersection.length) * 0.1;

      // Category matching boost
      const itemNormCategory = normalizeCategory(item.category);
      if (normCategoryHint && itemNormCategory === normCategoryHint) {
        score *= 1.5;
        score += 0.5; // Ensure category matching is strongly preferred
      }

      // Check if any specific fix words match
      for (const fix of item.fixes) {
        if (normalizedInput.includes(fix.toLowerCase())) {
          score += 1.0;
        }
      }

      if (score > highestScore) {
        highestScore = score;
        bestItem = item;
      }
    }

    // Only return if the match has some minimal substance
    if (highestScore >= 0.2 && bestItem) {
      return bestItem;
    }

    return null;
  }
}
