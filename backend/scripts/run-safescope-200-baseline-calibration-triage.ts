import * as fs from 'fs';
import * as path from 'path';
import { SafeScopeIntelligenceOrchestrator } from "../src/safescope-v2/orchestration/intelligence-orchestrator.service";

const datasetPath = path.resolve(__dirname, '../../safescope-data/benchmarks/safescope-field-validation-dataset.v1.json');
const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));
const orchestrator = new SafeScopeIntelligenceOrchestrator();

console.log(`Running Calibration Triage for ${dataset.length} cases...`);

const results = {
    total: dataset.length,
    run: 0,
    errors: 0,
    metrics: {} as any,
    details: [] as any[]
};

function normalize(val: any): string {
    if (val === undefined || val === null) return 'field_not_available';
    if (typeof val !== 'string') return JSON.stringify(val).toLowerCase().replace(/[\s-]/g, '_');
    return val.toLowerCase().replace(/[\s-]/g, '_');
}

function getMatchStatus(actual: any, expected: any) {
    if (actual === undefined || actual === null) return 'field_not_available';
    
    const normActual = normalize(actual);
    const normExpected = normalize(expected);
    
    if (normActual === normExpected) return 'exact_match';
    
    return 'actual_value_different';
}

async function run() {
    for (const record of dataset) {
        try {
            const input = {
                fusedText: record.observationText,
                promotedPrimary: {} as any,
                classifierResult: { ambiguityWarnings: [] } as any,
                expandedContext: {} as any,
                primaryStandardsResult: { suggestedStandards: [] } as any,
                generatedActions: [],
                additionalHazards: [],
                priorFindings: [],
                workspaceId: 'test',
                standardsFeedback: [],
                correctiveActionOutcomes: [],
                supervisorValidations: []
            };

            const output = await orchestrator.evaluate(input) as any;
            results.run++;

            const scoring = {
                hazardFamily: { expected: record.expectedHazardFamily, actual: output.calibrationMeta?.hazardFamily, status: getMatchStatus(output.calibrationMeta?.hazardFamily, record.expectedHazardFamily) },
                scenarioFamily: { expected: record.expectedScenarioFamily, actual: output.calibrationMeta?.scenarioFamily, status: getMatchStatus(output.calibrationMeta?.scenarioFamily, record.expectedScenarioFamily) },
                mechanism: { expected: record.expectedMechanism, actual: output.calibrationMeta?.mechanism, status: getMatchStatus(output.calibrationMeta?.mechanism, record.expectedMechanism) },
                jurisdiction: { expected: record.jurisdiction, actual: output.calibrationMeta?.jurisdiction, status: getMatchStatus(output.calibrationMeta?.jurisdiction, record.jurisdiction) },
                riskBand: { expected: record.expectedRiskBand, actual: output.calibrationMeta?.riskBand, status: getMatchStatus(output.calibrationMeta?.riskBand, record.expectedRiskBand) }
            };

            results.details.push({ id: record.id, scoring });
        } catch (e) {
            results.errors++;
        }
    }

    // Summary calculation
    const categories = ['hazardFamily', 'scenarioFamily', 'mechanism', 'jurisdiction', 'riskBand'];
    results.metrics = {};
    for (const cat of categories) {
        results.metrics[cat] = { exact_match: 0, actual_value_different: 0, field_not_available: 0 };
    }

    for (const detail of results.details) {
        for (const cat of categories) {
            const status = detail.scoring[cat].status;
            results.metrics[cat][status] = (results.metrics[cat][status] || 0) + 1;
        }
    }

    fs.writeFileSync(path.resolve(__dirname, '../../safescope-data/benchmarks/safescope-200-baseline-triage-results.v1.json'), JSON.stringify(results, null, 2));
    console.log("Calibration Triage Results generated.");
}

run();
EOF
,file_path: