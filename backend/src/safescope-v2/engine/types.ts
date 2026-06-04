export interface HazardClassification {
  family: string;
  type: string;
  condition: string;
  confidence: number;
  confidenceBand: 'low' | 'medium' | 'high';
  requiresHumanReview: boolean;
  evidenceTokens: string[];
  suppressedTokens: string[];
  reasoning: string;
}
