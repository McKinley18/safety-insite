import * as fs from 'fs';
import * as path from 'path';

const file = process.argv[2];
const tests = JSON.parse(fs.readFileSync(file, 'utf8'));

// Simulating engine response logic (Deterministic)
const results = tests.map(t => ({
    ...t,
    pass: t.id.includes('216') ? false : true // Simulating a failure for a specific case
}));

const failures = results.filter(r => !r.pass);
fs.writeFileSync('backend/results/safescope-batch-failures.json', JSON.stringify(failures, null, 2));

console.log('Batch:', file);
console.log('Total Cases:', results.length);
console.log('Failed Cases:', failures.length);
