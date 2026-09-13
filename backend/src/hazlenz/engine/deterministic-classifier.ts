import { TAXONOMY } from '../taxonomy.seed';

type ConfidenceBand = 'low' | 'medium' | 'high';

type ClassificationCandidate = {
  classification: string;
  score: number;
  evidenceTokens: string[];
  explanation: string;
};

const WEAK_TOKENS = new Set([
  'issue',
  'unsafe',
  'condition',
  'area',
  'equipment',
  'observed',
  'near',
]);

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

function confidenceFromScore(score: number): {
  confidence: number;
  confidenceBand: ConfidenceBand;
} {
  if (score >= 6) return { confidence: 0.92, confidenceBand: 'high' };
  if (score >= 3) return { confidence: 0.74, confidenceBand: 'medium' };
  return { confidence: 0.45, confidenceBand: 'low' };
}

export class DeterministicClassifier {
  classify(text: string) {
    const normalizedInput = normalize(text || '');
    const inputTokens = new Set(
      normalizedInput.split(' ').filter((token) => token.length > 0),
    );

    const candidates: ClassificationCandidate[] = Object.entries(TAXONOMY).map(([key, item]) => {
      let score = 0;
      const evidenceTokens: string[] = [];

      item.keywords.forEach((rawKeyword: string) => {
        const keyword = normalize(rawKeyword);
        if (!keyword) return;

        const keywordTokens = keyword
          .split(' ')
          .filter((token) => token.length > 0);

        const meaningfulKeywordTokens = keywordTokens.filter(
          (token) => !WEAK_TOKENS.has(token),
        );

        const phraseMatch = normalizedInput.includes(keyword);
        const allTokensPresent =
          meaningfulKeywordTokens.length > 0 &&
          meaningfulKeywordTokens.every((token) => inputTokens.has(token));

        const overlap = meaningfulKeywordTokens.filter((token) =>
          inputTokens.has(token),
        );

        if (phraseMatch) {
          score += 3;
          evidenceTokens.push(keyword);
          return;
        }

        if (allTokensPresent) {
          score += 2;
          evidenceTokens.push(keyword);
          return;
        }

        if (overlap.length >= 2) {
          score += 1;
          evidenceTokens.push(...overlap);
        }
      });

      return {
        classification: item.family ?? key,
        score,
        evidenceTokens: unique(evidenceTokens),
        explanation:
          score > 0
            ? `Matched deterministic taxonomy terms for ${item.family ?? key}.`
            : 'No deterministic match for this taxonomy item.',
      };
    });

    const ranked = candidates.sort((a, b) => b.score - a.score);
    const best = ranked[0];
    const second = ranked[1];

    if (!best || best.score <= 0) {
      return {
        classification: 'Review Required',
        confidence: 0,
        confidenceBand: 'low',
        evidenceTokens: [],
        ambiguityWarnings: [],
        requiresHumanReview: true,
        explanation: 'No deterministic rule match.',
      };
    }

    const ambiguityWarnings: string[] = [];

    if (second && second.score > 0 && best.score - second.score <= 2) {
      ambiguityWarnings.push(
        `Close match between ${best.classification} and ${second.classification}.`,
      );
    }

    const reviewSignals: Array<{ family: string; terms: string[] }> = [
      { family: 'Electrical', terms: ['electrical', 'wire', 'cord', 'panel', 'cable'] },
      { family: 'Housekeeping', terms: ['walkway', 'spill', 'trip', 'slip', 'blocked'] },
      { family: 'PPE', terms: ['hard hat', 'helmet', 'ppe', 'gloves', 'glasses'] },
      { family: 'Powered Mobile Equipment', terms: ['forklift', 'mobile equipment', 'vehicle', 'pedestrian'] },
      { family: 'Fall', terms: ['edge', 'guardrail', 'mezzanine', 'fall'] },
      { family: 'Machine', terms: ['guard', 'conveyor', 'moving'] },
    ];

    const signalFamilies = reviewSignals
      .filter((signal) =>
        signal.terms.some((term) => normalizedInput.includes(term)),
      )
      .map((signal) => signal.family);

    const uniqueSignalFamilies = unique(signalFamilies);

    const competingSignals = uniqueSignalFamilies.filter(
      (family) => family !== best.classification,
    );

    if (uniqueSignalFamilies.length > 1) {
      ambiguityWarnings.push(
        `Multiple hazard domains detected: ${uniqueSignalFamilies.join(', ')}.`,
      );
    } else if (competingSignals.length > 0) {
      ambiguityWarnings.push(
        `Multiple hazard domains detected: ${[best.classification, ...competingSignals].join(', ')}.`,
      );
    }

    const { confidence, confidenceBand } = confidenceFromScore(best.score);

    if (ambiguityWarnings.length === 0 && confidenceBand !== 'low') {
      const domainTerms = [
        { family: 'Electrical', terms: ['electrical', 'wire', 'cord', 'panel', 'cable'] },
        { family: 'Housekeeping', terms: ['walkway', 'spill', 'trip', 'slip', 'blocked'] },
        { family: 'PPE', terms: ['hard hat', 'helmet', 'ppe', 'gloves', 'glasses'] },
        { family: 'Powered Mobile Equipment', terms: ['forklift', 'mobile equipment', 'vehicle', 'pedestrian'] },
        { family: 'Fall', terms: ['edge', 'guardrail', 'mezzanine', 'fall'] },
        { family: 'Machine', terms: ['guard', 'conveyor', 'moving'] },
      ];

      const detectedDomains = unique(
        domainTerms
          .filter((domain) =>
            domain.terms.some((term) => normalizedInput.includes(term)),
          )
          .map((domain) => domain.family),
      );

      if (detectedDomains.length > 1) {
        ambiguityWarnings.push(
          `Multiple hazard domains detected: ${detectedDomains.join(', ')}.`,
        );
      }
    }

    const additionalHazards = ranked
      .filter(
        (candidate) =>
          candidate.score > 0 &&
          candidate.classification !== best.classification,
      )
      .slice(0, 4)
      .map((candidate) => {
        const calibrated = confidenceFromScore(candidate.score);

        return {
          classification: candidate.classification,
          confidence: calibrated.confidence,
          confidenceBand: calibrated.confidenceBand,
          evidenceTokens: candidate.evidenceTokens,
          requiresHumanReview: calibrated.confidenceBand === 'low',
          explanation: candidate.explanation,
        };
      });

    return {
      classification: best.classification,
      confidence,
      confidenceBand,
      evidenceTokens: best.evidenceTokens,
      ambiguityWarnings,
      requiresHumanReview:
        confidenceBand === 'low' || ambiguityWarnings.length > 0,
      explanation: best.explanation,
      additionalHazards,
    };
  }
}
