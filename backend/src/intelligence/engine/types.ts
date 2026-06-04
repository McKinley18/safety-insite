export interface ClassificationResult {
  conditionId: string;
  confidence: number;
  evidenceTokens: string[];
  reasoning: string;
}
