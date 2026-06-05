import * as fs from 'fs';
import * as path from 'path';

const datasetPath = path.resolve(__dirname, '../../safescope-data/benchmarks/safescope-field-validation-dataset.v1.json');
const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));

console.log(`Checking uniqueness for ${dataset.length} cases...`);

const signatures = new Set();
const duplicates = [];

for (const record of dataset) {
    const signature = `${record.expectedScenarioFamily}|${record.expectedMechanism}|${record.jurisdiction}|${record.equipment}|${record.task}`;
    if (signatures.has(signature)) {
        duplicates.push(record.id);
    }
    signatures.add(signature);
}

console.log(`Duplicate signature count: ${duplicates.length}`);
if (duplicates.length > 0) {
    console.log("Duplicate IDs:", duplicates);
}
