import * as fs from 'fs';
import * as path from 'path';
import { join } from 'path';

import { SAFESCOPE_REGULATORY_BRAIN_REGISTRY } from '../src/safescope-v2/brain/regulatory-brain/regulatory-knowledge.registry';
import { SAFESCOPE_MECHANISM_BRAIN_REGISTRY } from '../src/safescope-v2/brain/mechanism-brain/mechanism-knowledge.registry';
import { SAFESCOPE_CONTROLS_BRAIN_REGISTRY } from '../src/safescope-v2/brain/controls-brain/controls-knowledge.registry';
import { SAFESCOPE_EVIDENCE_BRAIN_REGISTRY } from '../src/safescope-v2/brain/evidence-brain/evidence-knowledge.registry';

const REPO_ROOT = join(__dirname, '..', '..');

type BenchmarkCase = {
  id: string;
  title: string;
  expected: {
    hazardFamily?: string;
    hazardMechanism?: string;
    primaryCitation?: string;
    minimumCorrectiveActionElements?: string[];
  };
};

type CoverageRow = {
  id: string;
  title: string;
  domain: string;
  mechanism: string;
  citation: string;
  regulatoryCoverage: boolean;
  mechanismCoverage: boolean;
  controlsCoverage: boolean;
  evidenceCoverage: boolean;
  coverageScore: number;
  coverageBand: 'strong' | 'adequate' | 'thin' | 'gap';
  gaps: string[];
};

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function normalize(value: unknown): string {
  return String(value || '').trim();
}

function domainAliases(domain: string): string[] {
  const aliases: Record<string, string[]> = {
    roof_control: ['roof_control', 'ground_control', 'roof_rib_control'],
    trenching_and_excavation: ['trenching_and_excavation', 'excavation_trenching'],
    slips_trips_falls: ['slips_trips_falls', 'slip_trip_fall', 'ladders'],
    slip_trip_fall: ['slip_trip_fall', 'slips_trips_falls', 'walking_working_surfaces'],
    hazardous_materials: ['hazardous_materials', 'hazard_communication'],
    health_respiratory: ['health_respiratory', 'health_exposure'],
  };

  return aliases[domain] || [domain];
}

function hasDomainCoverage(domain: string, domains: string[]): boolean {
  const expectedAliases = domainAliases(domain);
  return domains.some((candidate) => expectedAliases.includes(candidate));
}

function hasRegulatoryCoverage(domain: string, citation: string): boolean {
  return SAFESCOPE_REGULATORY_BRAIN_REGISTRY.some((record) => {
    const citationMatches = record.citation === citation;
    const domainMatches = hasDomainCoverage(domain, record.hazardDomains);
    return citationMatches || domainMatches;
  });
}

function hasMechanismCoverage(mechanism: string): boolean {
  return SAFESCOPE_MECHANISM_BRAIN_REGISTRY.some((record) => record.mechanismId === mechanism);
}

function hasControlsCoverage(domain: string, mechanism: string): boolean {
  return SAFESCOPE_CONTROLS_BRAIN_REGISTRY.some((record) => {
    const domainMatches = hasDomainCoverage(domain, record.hazardDomains);
    const mechanismMatches = mechanism ? record.mechanisms.includes(mechanism) : false;
    return domainMatches || mechanismMatches;
  });
}

function hasEvidenceCoverage(domain: string, mechanism: string): boolean {
  return SAFESCOPE_EVIDENCE_BRAIN_REGISTRY.some((record) => {
    const domainMatches = hasDomainCoverage(domain, record.hazardDomains);
    const mechanismMatches = mechanism ? record.mechanisms.includes(mechanism) : false;
    return domainMatches || mechanismMatches;
  });
}

function band(score: number): CoverageRow['coverageBand'] {
  if (score >= 100) return 'strong';
  if (score >= 75) return 'adequate';
  if (score >= 50) return 'thin';
  return 'gap';
}

function scoreRow(row: Omit<CoverageRow, 'coverageScore' | 'coverageBand'>): number {
  let score = 0;
  if (row.regulatoryCoverage) score += 30;
  if (row.mechanismCoverage) score += 25;
  if (row.controlsCoverage) score += 20;
  if (row.evidenceCoverage) score += 25;
  return score;
}

function buildMarkdown(rows: CoverageRow[]): string {
  const counts = rows.reduce(
    (acc, row) => {
      acc[row.coverageBand] = (acc[row.coverageBand] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const average =
    rows.length > 0
      ? rows.reduce((sum, row) => sum + row.coverageScore, 0) / rows.length
      : 0;

  const domainSummary = unique(rows.map((row) => row.domain)).sort().map((domain) => {
    const domainRows = rows.filter((row) => row.domain === domain);
    const avg =
      domainRows.reduce((sum, row) => sum + row.coverageScore, 0) / domainRows.length;
    const gapCount = domainRows.filter((row) => row.coverageBand === 'gap' || row.coverageBand === 'thin').length;

    return `| ${domain} | ${domainRows.length} | ${avg.toFixed(1)} | ${gapCount} |`;
  });

  const detailRows = rows.map((row) => {
    return `| ${row.id} | ${row.domain} | ${row.mechanism} | ${row.citation} | ${row.coverageScore} | ${row.coverageBand} | ${row.gaps.join('; ') || 'none'} |`;
  });

  return [
    '# SafeScope Brain Coverage Matrix',
    '',
    '## Summary',
    '',
    `- Cases evaluated: ${rows.length}`,
    `- Average coverage score: ${average.toFixed(2)}`,
    `- Strong: ${counts.strong || 0}`,
    `- Adequate: ${counts.adequate || 0}`,
    `- Thin: ${counts.thin || 0}`,
    `- Gap: ${counts.gap || 0}`,
    '',
    '## Domain Coverage Summary',
    '',
    '| Domain | Cases | Average Score | Thin/Gap Count |',
    '|---|---:|---:|---:|',
    ...domainSummary,
    '',
    '## Case Coverage Detail',
    '',
    '| Case | Domain | Mechanism | Citation | Score | Band | Gaps |',
    '|---|---|---|---|---:|---|---|',
    ...detailRows,
    '',
    '## Interpretation',
    '',
    '- Regulatory coverage confirms citation/domain representation.',
    '- Mechanism coverage confirms canonical injury mechanism representation.',
    '- Controls coverage confirms corrective action intelligence exists for the hazard family or mechanism.',
    '- Evidence coverage confirms defensibility questions and evidence requirements exist.',
    '- Thin or gap rows should be expanded before adding unrelated knowledge.',
    '',
  ].join('\n');
}

const benchmarkPath = join(REPO_ROOT, 'safescope-data/benchmarks/safescope-finding-audit.v1.json');
const resultsPath = join(REPO_ROOT, 'safescope-data/benchmarks/safescope-brain-coverage-matrix.v1.json');
const markdownPath = join(REPO_ROOT, 'project-docs/08-audits/SAFESCOPE_BRAIN_COVERAGE_MATRIX.md');

const benchmark = JSON.parse(fs.readFileSync(benchmarkPath, 'utf8')) as BenchmarkCase[];

const rows: CoverageRow[] = benchmark.map((item) => {
  const domain = normalize(item.expected.hazardFamily);
  const mechanism = normalize(item.expected.hazardMechanism);
  const citation = normalize(item.expected.primaryCitation);

  const base = {
    id: item.id,
    title: item.title,
    domain,
    mechanism,
    citation,
    regulatoryCoverage: hasRegulatoryCoverage(domain, citation),
    mechanismCoverage: hasMechanismCoverage(mechanism),
    controlsCoverage: hasControlsCoverage(domain, mechanism),
    evidenceCoverage: hasEvidenceCoverage(domain, mechanism),
    gaps: [] as string[],
  };

  if (!base.regulatoryCoverage) base.gaps.push('missing regulatory coverage');
  if (!base.mechanismCoverage) base.gaps.push('missing mechanism coverage');
  if (!base.controlsCoverage) base.gaps.push('missing controls coverage');
  if (!base.evidenceCoverage) base.gaps.push('missing evidence coverage');

  const coverageScore = scoreRow(base);

  return {
    ...base,
    coverageScore,
    coverageBand: band(coverageScore),
  };
});

fs.writeFileSync(resultsPath, JSON.stringify(rows, null, 2));
fs.writeFileSync(markdownPath, buildMarkdown(rows));

const average = rows.reduce((sum, row) => sum + row.coverageScore, 0) / rows.length;
const counts = rows.reduce(
  (acc, row) => {
    acc[row.coverageBand] = (acc[row.coverageBand] || 0) + 1;
    return acc;
  },
  {} as Record<string, number>,
);

console.log('✅ SafeScope Brain Coverage Matrix complete.');
console.log(`Results JSON: ${resultsPath}`);
console.log(`Results MD: ${markdownPath}`);
console.log(`Cases: ${rows.length}`);
console.log(`Average coverage score: ${average.toFixed(2)}`);
console.log(`Counts: ${JSON.stringify(counts)}`);

const lowest = [...rows].sort((a, b) => a.coverageScore - b.coverageScore).slice(0, 10);

console.log('');
console.log('Lowest coverage rows:');
for (const row of lowest) {
  console.log(`${row.id} | ${row.coverageScore} | ${row.coverageBand} | ${row.domain} | ${row.mechanism} | ${row.gaps.join('; ') || 'none'}`);
}
