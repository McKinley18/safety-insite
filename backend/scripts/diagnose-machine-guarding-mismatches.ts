import * as fs from 'fs';
import * as path from 'path';

const triageResultsPath = path.resolve(__dirname, '../../safescope-data/benchmarks/safescope-200-baseline-triage-results.v1.json');
const datasetPath = path.resolve(__dirname, '../../safescope-data/benchmarks/safescope-field-validation-dataset.v1.json');

const triageResults = JSON.parse(fs.readFileSync(triageResultsPath, 'utf-8'));
const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));

const datasetMap = new Map<string, any>(dataset.map((d: any) => [d.id, d]));

console.log("Analyzing machine_guarding mismatches...");

const mismatchReport = {
    mismatches: [] as any[]
};

for (const detail of triageResults.details) {
    const record = datasetMap.get(detail.id);
    if (!record || record.expectedHazardFamily !== 'machine_guarding') continue;
    
    if (detail.scoring.hazardFamily.status !== 'exact_match') {
        mismatchReport.mismatches.push({
            id: record.id,
            observation: record.observationText,
            equipment: record.equipment,
            task: record.task,
            controlFailure: record.controlFailure,
            exposurePattern: record.exposurePattern,
            locationContext: record.locationContext,
            expectedHazardFamily: record.expectedHazardFamily,
            actualHazardFamily: detail.scoring.hazardFamily.actual,
            expectedScenarioFamily: record.expectedScenarioFamily,
            actualScenarioFamily: detail.scoring.scenarioFamily.actual,
            expectedMechanism: record.expectedMechanism,
            actualMechanism: detail.scoring.mechanism.actual
        });
    }
}

console.log(JSON.stringify(mismatchReport, null, 2));
