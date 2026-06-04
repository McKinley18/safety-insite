import * as fs from 'fs';
import * as path from 'path';
import { SAFESCOPE_REASONING_SCENARIOS } from '../src/safescope-v2/reasoning-orchestrator/scenarios/reasoning-scenario-fixtures';
import { SCENARIO_COVERAGE_TAXONOMY } from '../src/safescope-v2/reasoning-orchestrator/scenarios/scenario-coverage-taxonomy';

const reportPath = path.join(
  __dirname,
  '../src/safescope-v2/reasoning-orchestrator/scenarios/reports/reasoning-scenario-coverage-report.json',
);

const scenarios = SAFESCOPE_REASONING_SCENARIOS;

const expectedJurisdictions = ['msha', 'osha_general_industry', 'osha_construction', 'unclear'];
const expectedDomains = SCENARIO_COVERAGE_TAXONOMY.map((item) => item.domain);

const jurisdictionCounts = Object.fromEntries(expectedJurisdictions.map((key) => [key, 0]));
const domainCounts = Object.fromEntries(expectedDomains.map((key) => [key, 0]));
const subtypeCounts = Object.fromEntries(
  SCENARIO_COVERAGE_TAXONOMY.flatMap((domain) =>
    domain.subtypes.map((subtype) => [`${domain.domain}.${subtype}`, 0]),
  ),
);

for (const scenario of scenarios) {
  jurisdictionCounts[scenario.expectation.expectedJurisdiction] =
    (jurisdictionCounts[scenario.expectation.expectedJurisdiction] || 0) + 1;

  domainCounts[scenario.expectation.expectedHazardDomain] =
    (domainCounts[scenario.expectation.expectedHazardDomain] || 0) + 1;
}

const missingJurisdictions = expectedJurisdictions.filter((key) => (jurisdictionCounts[key] || 0) === 0);
const missingDomains = expectedDomains.filter((key) => (domainCounts[key] || 0) === 0);

const totalSubtypeTargets = Object.keys(subtypeCounts).length;
const coveredSubtypes = Object.values(subtypeCounts).filter((count) => Number(count) > 0).length;

const priorityDomainGaps = SCENARIO_COVERAGE_TAXONOMY
  .filter((domain) => (domainCounts[domain.domain] || 0) < domain.minimumScenarioTarget)
  .map((domain) => ({
    domain: domain.domain,
    label: domain.label,
    priority: domain.priority,
    currentScenarioCount: domainCounts[domain.domain] || 0,
    minimumScenarioTarget: domain.minimumScenarioTarget,
    gap: domain.minimumScenarioTarget - (domainCounts[domain.domain] || 0),
    relevantJurisdictions: domain.relevantJurisdictions,
  }))
  .sort((a, b) => {
    const priorityRank = { critical: 0, high: 1, medium: 2, low: 3 } as const;
    return priorityRank[a.priority] - priorityRank[b.priority] || b.gap - a.gap;
  });

const report = {
  engine: 'safescope_reasoning_scenario_coverage_report',
  mode: 'deterministic_test_only',
  generatedAt: new Date().toISOString(),
  scenarioCount: scenarios.length,
  trackedDomainCount: SCENARIO_COVERAGE_TAXONOMY.length,
  trackedSubtypeCount: totalSubtypeTargets,
  coveredSubtypeCount: coveredSubtypes,
  jurisdictionCounts,
  domainCounts,
  subtypeCounts,
  missingJurisdictions,
  missingDomains,
  priorityDomainGaps,
  currentScenarioIds: scenarios.map((scenario) => scenario.scenarioId),
  coverageAssessment: {
    hasMshaCoverage: jurisdictionCounts.msha > 0,
    hasOshaGeneralIndustryCoverage: jurisdictionCounts.osha_general_industry > 0,
    hasOshaConstructionCoverage: jurisdictionCounts.osha_construction > 0,
    hasUnclearJurisdictionCoverage: jurisdictionCounts.unclear > 0,
    hasMachineGuardingCoverage: domainCounts.machine_guarding > 0,
    hasLotoCoverage: domainCounts.lockout_tagout > 0,
    hasFallProtectionCoverage: domainCounts.fall_protection > 0,
    hasHealthExposureCoverage: domainCounts.health_exposure > 0,
    needsMoreScenarioCoverage: missingDomains.length > 0,
  },
  recommendedNextScenarioDomains: priorityDomainGaps.slice(0, 10).map((item) => item.domain),
  guardrails: {
    reportOnly: true,
    doesNotModifyReasoning: true,
    doesNotApproveKnowledge: true,
    doesNotDeclareViolations: true,
  },
};

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);

console.log('✅ SafeScope reasoning scenario coverage report generated.');
console.log(`Report: ${reportPath}`);
console.log(`Scenarios: ${report.scenarioCount}`);
console.log(`Missing domains: ${missingDomains.length}`);
