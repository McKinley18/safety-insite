import { SafeScopeReasoningScenarioRunnerService } from '../src/safescope-v2/reasoning-orchestrator/scenarios/reasoning-scenario-runner.service';
import { SAFESCOPE_REASONING_SCENARIOS } from '../src/safescope-v2/reasoning-orchestrator/scenarios/reasoning-scenario-fixtures';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const scenarios = SAFESCOPE_REASONING_SCENARIOS;

const runner = new SafeScopeReasoningScenarioRunnerService();
const suite = runner.run(scenarios);

assert(suite.engine === 'safescope_reasoning_scenario_runner_v1', 'Unexpected scenario runner engine.');
assert(suite.mode === 'deterministic_test_only', 'Unexpected scenario runner mode.');
assert(suite.totalScenarios === scenarios.length, 'Scenario count mismatch.');
if (suite.failedScenarios !== 0) {
  const failuresOnly = suite.scenarioResults
    .filter((scenarioResult) => !scenarioResult.passed)
    .map((scenarioResult) => ({
      scenarioId: scenarioResult.scenarioId,
      name: scenarioResult.name,
      failures: scenarioResult.failures,
      jurisdiction: scenarioResult.result.jurisdictionAssessment.likelyJurisdiction,
      hazardDomain: scenarioResult.result.hazardClassification.primaryDomain,
    }));

  throw new Error(`Expected all scenarios to pass. Failures: ${JSON.stringify(failuresOnly, null, 2)}`);
}
assert(suite.passedScenarios === scenarios.length, 'Not all scenarios passed.');

assert(suite.guardrails.advisoryOnly === true, 'Scenario suite must remain advisory only.');
assert(suite.guardrails.doesNotDeclareViolations === true, 'Scenario suite must not declare violations.');
assert(suite.guardrails.doesNotCreateCitations === true, 'Scenario suite must not create citations.');
assert(suite.guardrails.requiresQualifiedReview === true, 'Scenario suite must require qualified review.');
assert(suite.guardrails.productionReasoningModified === false, 'Scenario suite must not modify production reasoning.');

for (const scenarioResult of suite.scenarioResults) {
  assert(scenarioResult.result.conclusionBoundary.advisoryOnly === true, `${scenarioResult.scenarioId}: not advisory.`);
  assert(
    scenarioResult.result.conclusionBoundary.doesNotDeclareViolation === true,
    `${scenarioResult.scenarioId}: violation declaration boundary failed.`,
  );
  assert(
    scenarioResult.result.conclusionBoundary.doesNotCreateCitation === true,
    `${scenarioResult.scenarioId}: citation creation boundary failed.`,
  );
  assert(
    scenarioResult.result.correctiveActionReasoning.reasoningBoundary.doesNotGuaranteeAbatement === true,
    `${scenarioResult.scenarioId}: guaranteed abatement boundary failed.`,
  );
}

console.log('✅ SafeScope reasoning scenario validation passed.');
console.log(`Scenarios passed: ${suite.passedScenarios}/${suite.totalScenarios}`);
