import * as fs from 'fs';
import * as path from 'path';
import { SAFESCOPE_REASONING_SCENARIOS } from '../src/safescope-v2/reasoning-orchestrator/scenarios/reasoning-scenario-fixtures';
import { SCENARIO_COVERAGE_TAXONOMY } from '../src/safescope-v2/reasoning-orchestrator/scenarios/scenario-coverage-taxonomy';

type CoverageLevel = 'none' | 'starter' | 'developing' | 'target_met';

const reportPath = path.join(
  __dirname,
  '../src/safescope-v2/reasoning-orchestrator/scenarios/reports/reasoning-scenario-maturity-report.json',
);

function coverageLevel(current: number, target: number): CoverageLevel {
  if (current === 0) return 'none';
  if (current >= target) return 'target_met';
  if (current >= Math.ceil(target / 2)) return 'developing';
  return 'starter';
}

const domainScenarioCounts = Object.fromEntries(
  SCENARIO_COVERAGE_TAXONOMY.map((domain) => [domain.domain, 0]),
);

const jurisdictionScenarioCounts: Record<string, number> = {
  msha: 0,
  osha_general_industry: 0,
  osha_construction: 0,
  unclear: 0,
};

for (const scenario of SAFESCOPE_REASONING_SCENARIOS) {
  const domain = scenario.expectation.expectedHazardDomain;
  const jurisdiction = scenario.expectation.expectedJurisdiction;

  domainScenarioCounts[domain] = (domainScenarioCounts[domain] || 0) + 1;
  jurisdictionScenarioCounts[jurisdiction] = (jurisdictionScenarioCounts[jurisdiction] || 0) + 1;
}

const domainMaturity = SCENARIO_COVERAGE_TAXONOMY.map((domain) => {
  const currentScenarioCount = domainScenarioCounts[domain.domain] || 0;
  const gap = Math.max(domain.minimumScenarioTarget - currentScenarioCount, 0);
  const level = coverageLevel(currentScenarioCount, domain.minimumScenarioTarget);

  return {
    domain: domain.domain,
    label: domain.label,
    priority: domain.priority,
    currentScenarioCount,
    minimumScenarioTarget: domain.minimumScenarioTarget,
    gap,
    coverageLevel: level,
    relevantJurisdictions: domain.relevantJurisdictions,
    trackedSubtypeCount: domain.subtypes.length,
    maturityNotes:
      level === 'target_met'
        ? 'Domain meets current broad scenario target.'
        : level === 'developing'
          ? 'Domain has meaningful scenario coverage but still needs more subtype and edge-case depth.'
          : level === 'starter'
            ? 'Domain has only starter coverage and should receive additional scenario depth.'
            : 'Domain has no scenario coverage.',
  };
});

const totalScenarioTarget = SCENARIO_COVERAGE_TAXONOMY.reduce(
  (sum, domain) => sum + domain.minimumScenarioTarget,
  0,
);

const currentScenarioCount = SAFESCOPE_REASONING_SCENARIOS.length;
const targetMetDomains = domainMaturity.filter((item) => item.coverageLevel === 'target_met').length;
const developingDomains = domainMaturity.filter((item) => item.coverageLevel === 'developing').length;
const starterDomains = domainMaturity.filter((item) => item.coverageLevel === 'starter').length;
const noneDomains = domainMaturity.filter((item) => item.coverageLevel === 'none').length;

const priorityGaps = domainMaturity
  .filter((item) => item.gap > 0)
  .sort((a, b) => {
    const priorityRank = { critical: 0, high: 1, medium: 2, low: 3 } as const;
    return priorityRank[a.priority] - priorityRank[b.priority] || b.gap - a.gap;
  });

const report = {
  engine: 'safescope_reasoning_scenario_maturity_report',
  mode: 'deterministic_test_only',
  generatedAt: new Date().toISOString(),
  scenarioCount: currentScenarioCount,
  totalScenarioTarget,
  totalScenarioGap: Math.max(totalScenarioTarget - currentScenarioCount, 0),
  trackedDomainCount: SCENARIO_COVERAGE_TAXONOMY.length,
  maturitySummary: {
    targetMetDomains,
    developingDomains,
    starterDomains,
    noneDomains,
    broadDomainCoverageComplete: noneDomains === 0,
    scenarioDepthTargetMet: currentScenarioCount >= totalScenarioTarget && priorityGaps.length === 0,
  },
  jurisdictionScenarioCounts,
  domainMaturity,
  priorityGaps,
  recommendedNextDomains: priorityGaps.slice(0, 10).map((item) => ({
    domain: item.domain,
    label: item.label,
    priority: item.priority,
    currentScenarioCount: item.currentScenarioCount,
    minimumScenarioTarget: item.minimumScenarioTarget,
    gap: item.gap,
  })),
  guardrails: {
    reportOnly: true,
    doesNotModifyReasoning: true,
    doesNotApproveKnowledge: true,
    doesNotDeclareViolations: true,
    doesNotChangeScenarioFixtures: true,
  },
};

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);

console.log('✅ SafeScope reasoning scenario maturity report generated.');
console.log(`Report: ${reportPath}`);
console.log(`Scenarios: ${report.scenarioCount}`);
console.log(`Scenario target: ${report.totalScenarioTarget}`);
console.log(`Scenario gap: ${report.totalScenarioGap}`);
console.log(`Target-met domains: ${targetMetDomains}`);
console.log(`Starter domains: ${starterDomains}`);
