import * as fs from 'fs';
import { join } from 'path';

import { SAFESCOPE_HAZARD_UNIVERSE_REGISTRY } from '../src/safescope-v2/brain/hazard-universe/hazard-universe.registry';
import { SAFESCOPE_REGULATORY_BRAIN_REGISTRY } from '../src/safescope-v2/brain/regulatory-brain/regulatory-knowledge.registry';
import { SAFESCOPE_MECHANISM_BRAIN_REGISTRY } from '../src/safescope-v2/brain/mechanism-brain/mechanism-knowledge.registry';
import { SAFESCOPE_CONTROLS_BRAIN_REGISTRY } from '../src/safescope-v2/brain/controls-brain/controls-knowledge.registry';
import { SAFESCOPE_EVIDENCE_BRAIN_REGISTRY } from '../src/safescope-v2/brain/evidence-brain/evidence-knowledge.registry';

type CoverageBand = 'covered' | 'partial' | 'thin' | 'gap';

type HazardUniverseCoverageRow = {
  hazardUniverseId: string;
  label: string;
  domain: string;
  priority: string;
  score: number;
  band: CoverageBand;
  regulatoryCoverage: boolean;
  mechanismCoverage: boolean;
  controlsCoverage: boolean;
  evidenceCoverage: boolean;
  scenarioCoverage: boolean;
  gaps: string[];
};

function normalized(value: unknown): string {
  return String(value || '').toLowerCase();
}

function includesAny(text: string, terms: string[]): boolean {
  return terms.some((term) => text.includes(normalized(term)));
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

const repoRoot = join(__dirname, '..', '..');
const benchmarkPath = join(repoRoot, 'safescope-data/benchmarks/safescope-finding-audit.v1.json');
const resultsPath = join(repoRoot, 'safescope-data/benchmarks/safescope-hazard-universe-coverage.v1.json');
const markdownPath = join(repoRoot, 'project-docs/08-audits/SAFESCOPE_HAZARD_UNIVERSE_COVERAGE.md');

const benchmark = JSON.parse(fs.readFileSync(benchmarkPath, 'utf8')) as Array<{
  id: string;
  title: string;
  expected: {
    hazardFamily?: string;
    hazardMechanism?: string;
    primaryCitation?: string;
  };
}>;

const benchmarkText = normalized(
  benchmark
    .map((item) => [
      item.id,
      item.title,
      item.expected?.hazardFamily,
      item.expected?.hazardMechanism,
      item.expected?.primaryCitation,
    ].join(' '))
    .join(' '),
);

function hasRegulatoryCoverage(domain: string, terms: string[]): boolean {
  const domainNorm = normalized(domain);
  return SAFESCOPE_REGULATORY_BRAIN_REGISTRY.some((record) => {
    const text = normalized([
      record.title,
      record.citation,
      record.citationTitle,
      record.plainLanguageSummary,
      ...record.hazardDomains,
      ...record.mechanisms,
      ...record.applicabilityTriggers,
      ...record.requiredControls,
    ].join(' '));

    return record.hazardDomains.map(normalized).includes(domainNorm) || includesAny(text, terms);
  });
}

function hasMechanismCoverage(mechanisms: string[]): boolean {
  const mechanismIds = SAFESCOPE_MECHANISM_BRAIN_REGISTRY.map((record) => normalized(record.mechanismId));
  return mechanisms.some((mechanism) => mechanismIds.includes(normalized(mechanism)));
}

function hasControlsCoverage(domain: string, mechanisms: string[], terms: string[]): boolean {
  const domainNorm = normalized(domain);
  return SAFESCOPE_CONTROLS_BRAIN_REGISTRY.some((record) => {
    const text = normalized([
      record.controlId,
      ...record.hazardDomains,
      ...record.mechanisms,
      record.immediateControl,
      record.permanentControl,
      ...record.verificationEvidence,
      ...record.notes,
    ].join(' '));

    return (
      record.hazardDomains.map(normalized).includes(domainNorm) ||
      mechanisms.some((mechanism) => record.mechanisms.map(normalized).includes(normalized(mechanism))) ||
      includesAny(text, terms)
    );
  });
}

function hasEvidenceCoverage(domain: string, mechanisms: string[], terms: string[]): boolean {
  const domainNorm = normalized(domain);
  return SAFESCOPE_EVIDENCE_BRAIN_REGISTRY.some((record) => {
    const text = normalized([
      record.evidenceId,
      ...record.hazardDomains,
      ...record.mechanisms,
      record.question,
      record.whyItMatters,
      record.defensibilityImpact,
      ...record.acceptableEvidenceTypes,
    ].join(' '));

    return (
      record.hazardDomains.map(normalized).includes(domainNorm) ||
      mechanisms.some((mechanism) => record.mechanisms.map(normalized).includes(normalized(mechanism))) ||
      includesAny(text, terms)
    );
  });
}

function hasScenarioCoverage(domain: string, mechanisms: string[], scenarioTerms: string[]): boolean {
  return (
    benchmarkText.includes(normalized(domain)) ||
    mechanisms.some((mechanism) => benchmarkText.includes(normalized(mechanism))) ||
    includesAny(benchmarkText, scenarioTerms)
  );
}

const rows: HazardUniverseCoverageRow[] = SAFESCOPE_HAZARD_UNIVERSE_REGISTRY.map((record) => {
  const terms = unique([
    record.label,
    record.domain,
    ...record.expectedMechanisms,
    ...record.expectedRegulatoryFamilies,
    ...record.expectedControlThemes,
    ...record.expectedEvidenceThemes,
    ...record.typicalScenarioExamples,
  ]);

  const regulatoryCoverage = hasRegulatoryCoverage(record.domain, terms);
  const mechanismCoverage = hasMechanismCoverage(record.expectedMechanisms);
  const controlsCoverage = hasControlsCoverage(record.domain, record.expectedMechanisms, terms);
  const evidenceCoverage = hasEvidenceCoverage(record.domain, record.expectedMechanisms, terms);
  const scenarioCoverage = hasScenarioCoverage(record.domain, record.expectedMechanisms, record.typicalScenarioExamples);

  let score = 0;
  if (regulatoryCoverage) score += 25;
  if (mechanismCoverage) score += 25;
  if (controlsCoverage) score += 20;
  if (evidenceCoverage) score += 20;
  if (scenarioCoverage) score += 10;

  const gaps = [
    regulatoryCoverage ? '' : 'missing regulatory coverage',
    mechanismCoverage ? '' : 'missing mechanism coverage',
    controlsCoverage ? '' : 'missing controls coverage',
    evidenceCoverage ? '' : 'missing evidence coverage',
    scenarioCoverage ? '' : 'missing benchmark scenario coverage',
  ].filter(Boolean);

  const band: CoverageBand =
    score >= 90 ? 'covered' :
    score >= 70 ? 'partial' :
    score >= 40 ? 'thin' :
    'gap';

  return {
    hazardUniverseId: record.hazardUniverseId,
    label: record.label,
    domain: record.domain,
    priority: record.priority,
    score,
    band,
    regulatoryCoverage,
    mechanismCoverage,
    controlsCoverage,
    evidenceCoverage,
    scenarioCoverage,
    gaps,
  };
});

function buildMarkdown(rows: HazardUniverseCoverageRow[]): string {
  const average = rows.reduce((sum, row) => sum + row.score, 0) / rows.length;
  const counts = rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.band] = (acc[row.band] || 0) + 1;
    return acc;
  }, {});

  const byPriority = rows.reduce<Record<string, HazardUniverseCoverageRow[]>>((acc, row) => {
    acc[row.priority] = acc[row.priority] || [];
    acc[row.priority].push(row);
    return acc;
  }, {});

  const lines: string[] = [
    '# SafeScope Hazard Universe Coverage',
    '',
    '## Summary',
    '',
    `- Hazard universe records evaluated: ${rows.length}`,
    `- Average coverage score: ${average.toFixed(2)}`,
    `- Covered: ${counts.covered || 0}`,
    `- Partial: ${counts.partial || 0}`,
    `- Thin: ${counts.thin || 0}`,
    `- Gap: ${counts.gap || 0}`,
    '',
    '## Coverage by Priority',
    '',
    '| Priority | Records | Average Score | Thin/Gap Count |',
    '|---|---:|---:|---:|',
    ...Object.entries(byPriority)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([priority, items]) => {
        const avg = items.reduce((sum, item) => sum + item.score, 0) / items.length;
        const thinGap = items.filter((item) => item.band === 'thin' || item.band === 'gap').length;
        return `| ${priority} | ${items.length} | ${avg.toFixed(1)} | ${thinGap} |`;
      }),
    '',
    '## Hazard Universe Detail',
    '',
    '| Hazard | Domain | Priority | Score | Band | Gaps |',
    '|---|---|---|---:|---|---|',
    ...rows
      .sort((a, b) => a.score - b.score || a.priority.localeCompare(b.priority))
      .map((row) => `| ${row.label} | ${row.domain} | ${row.priority} | ${row.score} | ${row.band} | ${row.gaps.join('; ') || 'none'} |`),
    '',
    '## Interpretation',
    '',
    '- This matrix is broader than the 25-case benchmark.',
    '- A covered row means SafeScope has some regulatory, mechanism, control, evidence, and scenario representation.',
    '- A partial/thin/gap row identifies where expansion should happen before claiming full hazard coverage.',
    '- This is the roadmap for expanding SafeScope from benchmark AI behavior toward broad safety-intelligence coverage.',
    '',
  ];

  return lines.join('\n');
}

fs.mkdirSync(join(repoRoot, 'project-docs/08-audits'), { recursive: true });
fs.mkdirSync(join(repoRoot, 'safescope-data/benchmarks'), { recursive: true });

fs.writeFileSync(resultsPath, JSON.stringify(rows, null, 2));
fs.writeFileSync(markdownPath, buildMarkdown(rows));

const average = rows.reduce((sum, row) => sum + row.score, 0) / rows.length;
const counts = rows.reduce<Record<string, number>>((acc, row) => {
  acc[row.band] = (acc[row.band] || 0) + 1;
  return acc;
}, {});

console.log('✅ SafeScope Hazard Universe Coverage audit complete.');
console.log(`Results JSON: ${resultsPath}`);
console.log(`Results MD: ${markdownPath}`);
console.log(`Hazard universe records: ${rows.length}`);
console.log(`Average coverage score: ${average.toFixed(2)}`);
console.log(`Counts: ${JSON.stringify(counts)}`);
console.log('');
console.log('Lowest coverage rows:');
for (const row of [...rows].sort((a, b) => a.score - b.score).slice(0, 12)) {
  console.log(`${row.score} | ${row.band} | ${row.priority} | ${row.domain} | ${row.label} | ${row.gaps.join('; ') || 'none'}`);
}
