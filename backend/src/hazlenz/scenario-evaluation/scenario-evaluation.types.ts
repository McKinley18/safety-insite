export type EvaluationDecision = 'high_confidence' | 'moderate_confidence' | 'low_confidence' | 'insufficient_evidence';

export interface EvaluatedScenario {
  scenarioId: string;
  domainId: string;
  title: string;
  matchedSignals: string[];
  missingSignals: string[];
  evidenceStrengthScore: number;
  exposureScore: number;
  severityPotentialScore: number;
  controlFailureScore: number;
  confidenceScore: number;
  totalScore: number;
  rank: number;
  reasoningSummary: string;
  evidenceGaps: string[];
  recommendedReviewerQuestions: string[];
  advisoryBoundary: string;
}

export interface ScenarioEvaluationResult {
  topScenario?: EvaluatedScenario;
  evaluatedScenarios: EvaluatedScenario[];
  evaluationSummary: string;
}
