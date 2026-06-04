import * as fs from 'fs';
import * as path from 'path';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const reportPath = path.join(
  __dirname,
  '../src/safescope-v2/reasoning-orchestrator/scenarios/reports/reasoning-scenario-maturity-report.json',
);

assert(
  fs.existsSync(reportPath),
  'Reasoning scenario maturity report does not exist. Run generate-safescope-reasoning-scenario-maturity.ts first.',
);

const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

assert(report.engine === 'safescope_reasoning_scenario_maturity_report', 'Maturity report engine changed.');
assert(report.mode === 'deterministic_test_only', 'Maturity report mode changed.');
assert(Boolean(report.generatedAt), 'Maturity report missing generatedAt.');
assert(report.scenarioCount >= 21, 'Maturity report should include the expanded 21-scenario suite.');
assert(report.totalScenarioTarget > report.scenarioCount, 'Maturity report should show that depth targets are not yet complete.');
assert(report.totalScenarioGap > 0, 'Maturity report should show remaining scenario depth gap.');

assert(report.trackedDomainCount >= 20, 'Maturity report should track the expanded broad-domain taxonomy.');
assert(Array.isArray(report.domainMaturity), 'domainMaturity must be an array.');
assert(report.domainMaturity.length === report.trackedDomainCount, 'domainMaturity count must equal trackedDomainCount.');
assert(Array.isArray(report.priorityGaps), 'priorityGaps must be an array.');
assert(Array.isArray(report.recommendedNextDomains), 'recommendedNextDomains must be an array.');

assert(
  report.maturitySummary?.broadDomainCoverageComplete === true,
  'Broad domain coverage should be complete after 21 scenarios.',
);
assert(
  report.maturitySummary?.scenarioDepthTargetMet === false,
  'Scenario depth target should not be marked complete yet.',
);

for (const item of report.domainMaturity) {
  assert(Boolean(item.domain), 'Domain maturity item missing domain.');
  assert(Boolean(item.label), `${item.domain}: missing label.`);
  assert(['critical', 'high', 'medium', 'low'].includes(item.priority), `${item.domain}: invalid priority.`);
  assert(Number.isInteger(item.currentScenarioCount), `${item.domain}: currentScenarioCount must be integer.`);
  assert(Number.isInteger(item.minimumScenarioTarget), `${item.domain}: minimumScenarioTarget must be integer.`);
  assert(Number.isInteger(item.gap), `${item.domain}: gap must be integer.`);
  assert(
    ['none', 'starter', 'developing', 'target_met'].includes(item.coverageLevel),
    `${item.domain}: invalid coverageLevel.`,
  );
  assert(Array.isArray(item.relevantJurisdictions), `${item.domain}: relevantJurisdictions must be array.`);
  assert(Number.isInteger(item.trackedSubtypeCount), `${item.domain}: trackedSubtypeCount must be integer.`);
}

assert(report.guardrails?.reportOnly === true, 'Maturity report must be report-only.');
assert(report.guardrails?.doesNotModifyReasoning === true, 'Maturity report must not modify reasoning.');
assert(report.guardrails?.doesNotApproveKnowledge === true, 'Maturity report must not approve knowledge.');
assert(report.guardrails?.doesNotDeclareViolations === true, 'Maturity report must not declare violations.');
assert(report.guardrails?.doesNotChangeScenarioFixtures === true, 'Maturity report must not change scenario fixtures.');

console.log('✅ SafeScope reasoning scenario maturity validation passed.');
console.log(`Scenario count: ${report.scenarioCount}`);
console.log(`Scenario target: ${report.totalScenarioTarget}`);
console.log(`Scenario gap: ${report.totalScenarioGap}`);
console.log(`Target-met domains: ${report.maturitySummary.targetMetDomains}`);
console.log(`Starter domains: ${report.maturitySummary.starterDomains}`);
