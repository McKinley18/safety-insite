import * as fs from 'fs';
import * as path from 'path';

const datasetPath = path.resolve(__dirname, '../../safescope-data/benchmarks/safescope-field-validation-dataset.v1.json');
const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));

console.log("Validating Field Validation Dataset...");

let validCases = 0;
let missingFields = 0;

for (const record of dataset) {
    if (record.observationText && record.expectedScenarioFamily && record.expectedMechanism) {
        validCases++;
    } else {
        missingFields++;
    }
}

console.log(`Total Cases: ${dataset.length}`);
console.log(`Valid Cases: ${validCases}`);
console.log(`Missing Required Fields: ${missingFields}`);

if (missingFields === 0) {
    console.log("Field Validation Dataset validation passed.");
} else {
    throw new Error("Field Validation Dataset validation failed.");
}
