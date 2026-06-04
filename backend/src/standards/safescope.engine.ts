import { Injectable } from '@nestjs/common';

type MatchResult = {
  citation: string;
  title: string;
  confidence: number;
  matchedTerms: string[];
};

@Injectable()
export class SafeScopeEngine {
  /* 🔥 CORE MATCH FUNCTION */
  match(text: string): MatchResult[] {
    if (!text) return [];

    const normalized = text.toLowerCase();

    const matches: MatchResult[] = [];

    /* =========================
       FALL / EDGE HAZARDS (MSHA)
    ========================== */
    if (this.contains(normalized, ['unguarded', 'edge', 'open side', 'platform'])) {
      matches.push({
        citation: '56.11012',
        title: 'Protection for openings around travelways',
        confidence: this.score(normalized, ['unguarded', 'edge', 'platform']),
        matchedTerms: this.getMatchedTerms(normalized, ['unguarded', 'edge', 'platform']),
      });
    }

    /* =========================
       FALL PROTECTION (OSHA)
    ========================== */
    if (this.contains(normalized, ['fall', 'height', 'unguarded edge'])) {
      matches.push({
        citation: '1926.501',
        title: 'Duty to have fall protection',
        confidence: this.score(normalized, ['fall', 'height', 'edge']),
        matchedTerms: this.getMatchedTerms(normalized, ['fall', 'height', 'edge']),
      });
    }

    /* =========================
       ELECTRICAL HAZARDS
    ========================== */
    if (this.contains(normalized, ['electrical', 'exposed wire', 'live wire', 'shock'])) {
      matches.push({
        citation: '1910.303',
        title: 'Electrical general requirements',
        confidence: this.score(normalized, ['electrical', 'wire', 'shock']),
        matchedTerms: this.getMatchedTerms(normalized, ['electrical', 'wire', 'shock']),
      });
    }

    /* =========================
       PPE (GENERAL)
    ========================== */
    if (this.contains(normalized, ['no ppe', 'missing ppe', 'no helmet', 'no gloves'])) {
      matches.push({
        citation: '1910.132',
        title: 'Personal Protective Equipment',
        confidence: this.score(normalized, ['ppe', 'helmet', 'gloves']),
        matchedTerms: this.getMatchedTerms(normalized, ['ppe', 'helmet', 'gloves']),
      });
    }

    /* =========================
       HOUSEKEEPING / TRIP HAZARDS
    ========================== */
    if (this.contains(normalized, ['debris', 'clutter', 'trip', 'slip'])) {
      matches.push({
        citation: '1910.22',
        title: 'Walking-working surfaces',
        confidence: this.score(normalized, ['debris', 'trip', 'slip']),
        matchedTerms: this.getMatchedTerms(normalized, ['debris', 'trip', 'slip']),
      });
    }

    /* 🔥 SORT BY CONFIDENCE */
    return matches.sort((a, b) => b.confidence - a.confidence);
  }

  /* 🔥 HELPERS */

  private contains(text: string, keywords: string[]): boolean {
    return keywords.some((k) => text.includes(k));
  }

  private getMatchedTerms(text: string, keywords: string[]): string[] {
    return keywords.filter((k) => text.includes(k));
  }

  private score(text: string, keywords: string[]): number {
    const matched = keywords.filter((k) => text.includes(k)).length;
    const total = keywords.length;

    const base = matched / total;

    // 🔥 scale confidence (0.5–0.95)
    return Math.min(0.5 + base * 0.45, 0.95);
  }
}
