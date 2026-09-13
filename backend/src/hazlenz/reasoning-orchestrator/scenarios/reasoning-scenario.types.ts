import {
  HazLenzJurisdiction,
  HazLenzReasoningDomain,
  HazLenzReasoningRequest,
  HazLenzReasoningResult,
} from '../reasoning-orchestrator.types';

export type HazLenzReasoningScenarioExpectation = {
  expectedJurisdiction: HazLenzJurisdiction;
  expectedHazardDomain: HazLenzReasoningDomain;
  expectedConfidence?: 'low' | 'moderate' | 'high';
  requiresMissingEvidence?: boolean;
  requiresCorrectiveActions?: boolean;
  requiresVerificationRecommendation?: boolean;
  minimumRecommendedQuestions?: number;
};

export type HazLenzReasoningScenario = {
  scenarioId: string;
  name: string;
  description: string;
  request: HazLenzReasoningRequest;
  expectation: HazLenzReasoningScenarioExpectation;
};

export type HazLenzReasoningScenarioResult = {
  scenarioId: string;
  name: string;
  passed: boolean;
  failures: string[];
  result: HazLenzReasoningResult;
};

export type HazLenzReasoningScenarioSuiteResult = {
  engine: 'safescope_reasoning_scenario_runner_v1';
  mode: 'deterministic_test_only';
  totalScenarios: number;
  passedScenarios: number;
  failedScenarios: number;
  scenarioResults: HazLenzReasoningScenarioResult[];
  guardrails: {
    advisoryOnly: true;
    doesNotDeclareViolations: true;
    doesNotCreateCitations: true;
    requiresQualifiedReview: true;
    productionReasoningModified: false;
  };
};
