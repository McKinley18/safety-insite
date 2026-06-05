import * as fs from 'fs';
import * as path from 'path';

const datasetPath = path.resolve(__dirname, '../../safescope-data/benchmarks/safescope-field-validation-dataset.v1.json');
const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));

console.log("Scoring Field Validation Dataset...");

const results = {
    total: dataset.length,
    valid: 0,
    coverage: {
        scenarioFamily: 0,
        riskBand: 0,
        mechanism: 0,
        jurisdiction: 0,
        evidenceGap: 0
    },
    missingFields: [] as string[]
};

for (const record of dataset) {
    let isValid = true;
    if (!record.observationText) { results.missingFields.push(record.id + ": observationText"); isValid = false; }
    if (!record.expectedHazardFamily) { results.missingFields.push(record.id + ": expectedHazardFamily"); isValid = false; }
    if (record.expectedMechanism) results.coverage.mechanism++;
    if (record.expectedRiskBand) results.coverage.riskBand++;
    if (record.evidenceGapsExpected) results.coverage.evidenceGap++;
    
    if (isValid) results.valid++;
}

console.log(`Total Cases: ${results.total}`);
console.log(`Valid Cases: ${results.valid}`);
console.log(`Coverage:`, results.coverage);
console.log(`Missing Required Fields: ${results.missingFields.length}`);
if (results.missingFields.length > 0) console.log("First 5 missing:", results.missingFields.slice(0,5));

console.log("Readiness Status: " + (results.valid === results.total ? "Ready" : "Needs work"));
