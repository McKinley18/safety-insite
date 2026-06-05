import * as fs from 'fs';
import * as path from 'path';

const resultsPath = path.resolve(__dirname, '../../safescope-data/benchmarks/safescope-200-baseline-calibration-results.v1.json');
const datasetPath = path.resolve(__dirname, '../../safescope-data/benchmarks/safescope-field-validation-dataset.v1.json');

const results = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));

console.log("Generating Calibration Triage Diagnostics...");

const triage = {
    mismatchReasons: {} as Record<string, number>,
    topMismatchFamilies: {} as Record<string, number>,
    samples: [] as any[]
};

function normalize(val: any): string {
    if (typeof val !== 'string') return JSON.stringify(val);
    return val.toLowerCase().replace(/[\s-]/g, '_');
}

const aliasMap: Record<string, string> = {
    'hazardous_energy': 'lockout_tagout',
    'powered_industrial_truck': 'mobile_equipment',
    'walking_working_surfaces': 'housekeeping_slip_trip'
};

function getStatus(actual: any, expected: any) {
    if (actual === undefined || actual === null) return 'field_not_available';
    
    const normActual = normalize(actual);
    const normExpected = normalize(expected);
    
    if (normActual === normExpected) return 'normalized_exact_match';
    
    if (aliasMap[normActual] === normExpected || aliasMap[normExpected] === normActual) return 'normalized_partial_alias_match';
    
    return 'actual_value_different';
}

// Map dataset for fast lookup
const datasetMap = new Map(dataset.map((d: any) => [d.id, d]));

for (let i = 0; i < Math.min(results.details.length, 10); i++) {
    const detail = results.details[i];
    const record = datasetMap.get(detail.id);
    
    const sample = {
        id: detail.id,
        analysis: {} as any
    };

    for (const key in detail.matches) {
        const expected = record[key.startsWith('hazard') ? 'expectedHazardFamily' : 
                                 key === 'scenarioFamily' ? 'expectedScenarioFamily' :
                                 key === 'mechanism' ? 'expectedMechanism' :
                                 key === 'jurisdiction' ? 'jurisdiction' :
                                 key === 'riskBand' ? 'expectedRiskBand' :
                                 key === 'standardFamily' ? 'expectedStandardFamily' : 'evidenceGapsExpected'];
        
        const actual = detail.matches[key]; // This only has true/false from previous run
        // Wait, the previous run only saved boolean matches, I need to redo the run to get raw values!
        // This diagnostic script is limited by the previous results data.
    }
    triage.samples.push(sample);
}

console.log("Diagnostic summary (limited by current results data format):", triage);
