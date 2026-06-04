const fs = require('fs');
const { execSync } = require('child_process');

const suites = [
  ['MSHA field validation', 'tests/regression/msha/msha-field-validation-001.json'],
  ['OSHA general industry validation', 'tests/regression/osha/osha-gi-field-validation-001.json'],
  ['OSHA construction validation', 'tests/regression/osha/osha-construction-field-validation-001.json'],
  ['Mixed OSHA/MSHA routing', 'tests/regression/mixed-scope-routing-001.json'],
  ['Expanded field-language validation', 'tests/regression/expanded/field-language-validation-001.json'],
  ['Hard negative validation', 'tests/regression/expanded/hard-negative-validation-001.json'],
  ['Manual field validation', 'tests/regression/manual-field-validation-001.json'],
  ['Ambiguity benchmark', 'tests/regression/ambiguity-benchmark-001.json'],
  ['False-positive benchmark', 'tests/regression/false-positive-benchmark-001.json'],
  ['10k realistic benchmark', 'tests/scale/condition-scale-10000-library-derived-v3-alt-aware.json'],
];

const results = [];

for (const [name, file] of suites) {
  const output = execSync(`node scripts/run-condition-library-batch.js ${file}`, { encoding: 'utf8' });
  const json = JSON.parse(output.match(/\{[\s\S]*\}/)[0]);
  results.push({ name, file, ...json });
}

const speedOutput = execSync('node scripts/benchmark-condition-engine.js', { encoding: 'utf8' });
const speed = JSON.parse(speedOutput);

const report = {
  generatedAt: new Date().toISOString(),
  engine: 'SafeScope OSHA/MSHA condition engine',
  summary: {
    totalSuites: results.length,
    totalCases: results.reduce((sum, r) => sum + r.totalCases, 0),
    totalFailures: results.reduce((sum, r) => sum + r.failureCount, 0),
    speed,
  },
  suites: results,
};

fs.mkdirSync('results', { recursive: true });
fs.writeFileSync('results/engine-validation-report.json', JSON.stringify(report, null, 2));

console.log(JSON.stringify(report.summary, null, 2));
console.log('Wrote results/engine-validation-report.json');
