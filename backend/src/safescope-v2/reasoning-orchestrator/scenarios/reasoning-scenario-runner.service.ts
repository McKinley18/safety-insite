import { SafeScopeReasoningOrchestratorService } from '../reasoning-orchestrator.service';
import {
  SafeScopeReasoningScenario,
  SafeScopeReasoningScenarioResult,
  SafeScopeReasoningScenarioSuiteResult,
} from './reasoning-scenario.types';

export class SafeScopeReasoningScenarioRunnerService {
  constructor(private readonly orchestrator = new SafeScopeReasoningOrchestratorService()) {}

  run(scenarios: SafeScopeReasoningScenario[]): SafeScopeReasoningScenarioSuiteResult {
    const scenarioResults = scenarios.map((scenario) => this.runScenario(scenario));

    return {
      engine: 'safescope_reasoning_scenario_runner_v1',
      mode: 'deterministic_test_only',
      totalScenarios: scenarios.length,
      passedScenarios: scenarioResults.filter((result) => result.passed).length,
      failedScenarios: scenarioResults.filter((result) => !result.passed).length,
      scenarioResults,
      guardrails: {
        advisoryOnly: true,
        doesNotDeclareViolations: true,
        doesNotCreateCitations: true,
        requiresQualifiedReview: true,
        productionReasoningModified: false,
      },
    };
  }

  private runScenario(scenario: SafeScopeReasoningScenario): SafeScopeReasoningScenarioResult {
    const result = this.orchestrator.reason(scenario.request);
    const failures: string[] = [];

    if (result.jurisdictionAssessment.likelyJurisdiction !== scenario.expectation.expectedJurisdiction) {
      failures.push(
        `Expected jurisdiction ${scenario.expectation.expectedJurisdiction}, received ${result.jurisdictionAssessment.likelyJurisdiction}.`,
      );
    }

    if (result.hazardClassification.primaryDomain !== scenario.expectation.expectedHazardDomain) {
      failures.push(
        `Expected hazard domain ${scenario.expectation.expectedHazardDomain}, received ${result.hazardClassification.primaryDomain}.`,
      );
    }

    if (scenario.expectation.expectedConfidence && result.confidence.level !== scenario.expectation.expectedConfidence) {
      failures.push(
        `Expected confidence ${scenario.expectation.expectedConfidence}, received ${result.confidence.level}.`,
      );
    }

    if (scenario.expectation.requiresMissingEvidence === true && result.missingEvidence.length === 0) {
      failures.push('Expected missing evidence, but none was returned.');
    }

    if (
      scenario.expectation.requiresCorrectiveActions === true &&
      result.correctiveActionReasoning.summary.totalRecommendations === 0
    ) {
      failures.push('Expected corrective action recommendations, but none were returned.');
    }

    if (
      scenario.expectation.requiresVerificationRecommendation === true &&
      result.correctiveActionReasoning.summary.verificationCount === 0
    ) {
      failures.push('Expected a verification recommendation, but none was returned.');
    }

    if (
      typeof scenario.expectation.minimumRecommendedQuestions === 'number' &&
      result.recommendedNextQuestions.length < scenario.expectation.minimumRecommendedQuestions
    ) {
      failures.push(
        `Expected at least ${scenario.expectation.minimumRecommendedQuestions} recommended questions, received ${result.recommendedNextQuestions.length}.`,
      );
    }

    if (result.productionReasoningModified !== false) {
      failures.push('Scenario modified production reasoning.');
    }

    if (result.conclusionBoundary.advisoryOnly !== true) {
      failures.push('Scenario result was not advisory only.');
    }

    if (result.conclusionBoundary.doesNotDeclareViolation !== true) {
      failures.push('Scenario result allowed violation declaration.');
    }

    if (result.conclusionBoundary.doesNotCreateCitation !== true) {
      failures.push('Scenario result allowed citation creation.');
    }

    if (result.conclusionBoundary.requiresQualifiedReview !== true) {
      failures.push('Scenario result did not require qualified review.');
    }

    if (result.correctiveActionReasoning.reasoningBoundary.doesNotDeclareViolation !== true) {
      failures.push('Corrective action reasoning allowed violation declaration.');
    }

    if (result.correctiveActionReasoning.reasoningBoundary.doesNotGuaranteeAbatement !== true) {
      failures.push('Corrective action reasoning allowed guaranteed abatement.');
    }

    return {
      scenarioId: scenario.scenarioId,
      name: scenario.name,
      passed: failures.length === 0,
      failures,
      result,
    };
  }
}
