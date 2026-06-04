const fs = require('fs');
const { classifyObservation } = require('../src/engine/condition-engine');

const file = process.argv[2] || 'tests/scale/condition-scale-10000-library-derived-v3-alt-aware.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

const start = Date.now();

for (const row of data) {
  classifyObservation(row.observation, {
    context: row.context || { industryScope: row.scopeExpected || 'mining' },
  });
}

const ms = Date.now() - start;
const avg = ms / data.length;

console.log(JSON.stringify({
  cases: data.length,
  totalMs: ms,
  avgMsPerCase: Number(avg.toFixed(4)),
  casesPerSecond: Number((data.length / (ms / 1000)).toFixed(2)),
}, null, 2));
