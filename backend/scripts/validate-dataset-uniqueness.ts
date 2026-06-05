import * as fs from 'fs';
import * as path from 'path';

const datasetPath = path.resolve(__dirname, '../../safescope-data/benchmarks/safescope-field-validation-dataset.v1.json');
const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));

console.log(`Checking uniqueness for ${dataset.length} cases...`);

const richSignatures = new Set();
const duplicates = [];

const richFields = [
    'expectedScenarioFamily',
    'expectedMechanism',
    'jurisdiction',
    'equipment',
    'task',
    'controlFailure',
    'exposurePattern',
    'locationContext'
];

console.log("Rich signature fields:", richFields);

for (const record of dataset) {
    const signature = richFields.map(field => record[field] || 'null').join('|');
    
    if (richSignatures.has(signature)) {
        duplicates.push(record.id);
    }
    richSignatures.add(signature);
}

console.log(`Duplicate rich signature count: ${duplicates.length}`);
if (duplicates.length > 0) {
    console.log("Duplicate IDs:", duplicates);
    process.exit(1);
} else {
    console.log("Uniqueness Validation: PASSED");
    process.exit(0);
}
