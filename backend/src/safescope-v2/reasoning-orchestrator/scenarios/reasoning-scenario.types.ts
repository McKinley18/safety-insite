import {
  SafeScopeJurisdiction,
  SafeScopeReasoningDomain,
  SafeScopeReasoningRequest,
  SafeScopeReasoningResult,
} from '../reasoning-orchestrator.types';

export type SafeScopeReasoningScenarioExpectation = {
  expectedJurisdiction: SafeScopeJurisdiction;
  expectedHazardDomain: SafeScopeReasoningDomain;
  expectedConfidence?: 'low' | 'moderate' | 'high';
  requiresMissingEvidence?: boolean;
  requiresCorrectiveActions?: boolean;
  requiresVerificationRecommendation?: boolean;
  minimumRecommendedQuestions?: number;
};

export type SafeScopeReasoningScenario = {
  scenarioId: string;
  name: string;
  description: string;
  request: SafeScopeReasoningRequest;
  expectation: SafeScopeReasoningScenarioExpectation;
};

export type SafeScopeReasoningScenarioResult = {
  scenarioId: string;
  name: string;
  passed: boolean;
  failures: string[];
  result: SafeScopeReasoningResult;
};

export type SafeScopeReasoningScenarioSuiteResult = {
  engine: 'safescope_reasoning_scenario_runner_v1';
  mode: 'deterministic_test_only';
  totalScenarios: number;
  passedScenarios: number;
  failedScenarios: number;
  scenarioResults: SafeScopeReasoningScenarioResult[];
  guardrails: {
    advisoryOnly: true;
    doesNotDeclareViolations: true;
    doesNotCreateCitations: true;
    requiresQualifiedReview: true;
    productionReasoningModified: false;
  };
};
