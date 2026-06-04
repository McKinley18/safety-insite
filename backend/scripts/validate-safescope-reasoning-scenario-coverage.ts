import * as fs from 'fs';
import * as path from 'path';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const reportPath = path.join(
  __dirname,
  '../src/safescope-v2/reasoning-orchestrator/scenarios/reports/reasoning-scenario-coverage-report.json',
);

assert(
  fs.existsSync(reportPath),
  'Reasoning scenario coverage report does not exist. Run generate-safescope-reasoning-scenario-coverage.ts first.',
);

const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

assert(report.engine === 'safescope_reasoning_scenario_coverage_report', 'Coverage report engine changed.');
assert(report.mode === 'deterministic_test_only', 'Coverage report mode changed.');
assert(Boolean(report.generatedAt), 'Coverage report missing generatedAt.');
assert(report.scenarioCount >= 5, 'Coverage report should include at least five scenarios.');
assert(report.trackedDomainCount >= 20, 'Coverage report should track a realistic broad-domain taxonomy.');
assert(report.trackedSubtypeCount >= 100, 'Coverage report should track a realistic subtype taxonomy.');
assert(report.coveredSubtypeCount >= 0, 'Coverage report should include coveredSubtypeCount.');
assert(Array.isArray(report.priorityDomainGaps), 'priorityDomainGaps must be an array.');

assert(report.coverageAssessment?.hasMshaCoverage === true, 'Coverage report must include MSHA coverage.');
assert(
  report.coverageAssessment?.hasOshaGeneralIndustryCoverage === true,
  'Coverage report must include OSHA General Industry coverage.',
);
assert(report.coverageAssessment?.hasOshaConstructionCoverage === true, 'Coverage report must include OSHA Construction coverage.');
assert(report.coverageAssessment?.hasUnclearJurisdictionCoverage === true, 'Coverage report must include unclear jurisdiction coverage.');

assert(report.coverageAssessment?.hasMachineGuardingCoverage === true, 'Coverage report must include machine guarding coverage.');
assert(report.coverageAssessment?.hasLotoCoverage === true, 'Coverage report must include lockout/tagout coverage.');
assert(report.coverageAssessment?.hasFallProtectionCoverage === true, 'Coverage report must include fall protection coverage.');
assert(report.coverageAssessment?.hasHealthExposureCoverage === true, 'Coverage report must include health exposure coverage.');

assert(Array.isArray(report.missingDomains), 'missingDomains must be an array.');
assert(Array.isArray(report.recommendedNextScenarioDomains), 'recommendedNextScenarioDomains must be an array.');
assert(report.guardrails?.reportOnly === true, 'Coverage report must be report-only.');
assert(report.guardrails?.doesNotModifyReasoning === true, 'Coverage report must not modify reasoning.');
assert(report.guardrails?.doesNotApproveKnowledge === true, 'Coverage report must not approve knowledge.');
assert(report.guardrails?.doesNotDeclareViolations === true, 'Coverage report must not declare violations.');

console.log('✅ SafeScope reasoning scenario coverage validation passed.');
console.log(`Scenario coverage count: ${report.scenarioCount}`);
console.log(`Missing domains: ${report.missingDomains.length}`);
