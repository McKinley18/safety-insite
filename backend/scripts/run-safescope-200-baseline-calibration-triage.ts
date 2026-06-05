import * as fs from 'fs';
import * as path from 'path';
import { SafeScopeIntelligenceOrchestrator } from "../src/safescope-v2/orchestration/intelligence-orchestrator.service";

const datasetPath = path.resolve(__dirname, '../../safescope-data/benchmarks/safescope-field-validation-dataset.v1.json');
const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));
const orchestrator = new SafeScopeIntelligenceOrchestrator();

console.log(`Running Calibration Triage for ${dataset.length} cases...`);

const runResults = {
    total: dataset.length,
    run: 0,
    errors: 0,
    details: [] as any[]
};

function normalize(val: any): string {
    if (val === undefined || val === null) return 'unavailable';
    if (typeof val !== 'string') return JSON.stringify(val).toLowerCase().replace(/[\s-]/g, '_');
    return val.toLowerCase().replace(/[\s-]/g, '_');
}

const aliasMap: Record<string, string> = {
    'hazardous_energy': 'lockout_tagout',
    'powered_industrial_truck': 'mobile_equipment',
    'walking_working_surfaces': 'housekeeping_slip_trip'
};

function getMatchStatus(actual: any, expected: any) {
    if (actual === undefined || actual === null) return 'field_not_available';
    
    const normActual = normalize(actual);
    const normExpected = normalize(expected);
    
    if (normActual === normExpected) return 'normalized_exact_match';
    if (aliasMap[normActual] === normExpected || aliasMap[normExpected] === normActual) return 'normalized_partial_alias_match';
    
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
            runResults.run++;

            const scoring = {
                hazardFamily: { expected: record.expectedHazardFamily, actual: output.calibrationMeta?.hazardFamily, status: getMatchStatus(output.calibrationMeta?.hazardFamily, record.expectedHazardFamily) },
                scenarioFamily: { expected: record.expectedScenarioFamily, actual: output.calibrationMeta?.scenarioFamily, status: getMatchStatus(output.calibrationMeta?.scenarioFamily, record.expectedScenarioFamily) },
                mechanism: { expected: record.expectedMechanism, actual: output.calibrationMeta?.mechanism, status: getMatchStatus(output.calibrationMeta?.mechanism, record.expectedMechanism) },
                jurisdiction: { expected: record.expectedJurisdiction, actual: output.calibrationMeta?.jurisdiction, status: getMatchStatus(output.calibrationMeta?.jurisdiction, record.expectedJurisdiction) },
                riskBand: { expected: record.expectedRiskBand, actual: output.calibrationMeta?.riskBand, status: getMatchStatus(output.calibrationMeta?.riskBand, record.expectedRiskBand) }
            };

            runResults.details.push({ id: record.id, scoring });
        } catch (e) {
            runResults.errors++;
        }
    }

    // Generate Summary
    const summary = {
        totalCases: runResults.total,
        runCases: runResults.run,
        runErrors: runResults.errors,
        metrics: {} as any,
        mismatchReasons: {} as any,
        recommendations: [
            "Expose hazardFamily/domain in calibration output contract",
            "Expose jurisdiction assessment in calibration output contract",
            "Align scenarioFamily taxonomy",
            "Improve evidence gap comparison/extraction",
            "Tune riskBand calibration after output contract is stable"
        ]
    };

    const categories = ['hazardFamily', 'scenarioFamily', 'mechanism', 'jurisdiction', 'riskBand'];
    for (const cat of categories) {
        summary.metrics[cat] = {
            exact_match: 0,
            partial_match: 0,
            mismatch: 0,
            field_not_available: 0
        };
    }

    for (const detail of runResults.details) {
        for (const cat of categories) {
            const status = detail.scoring[cat].status;
            const mappedStatus = status === 'normalized_exact_match' ? 'exact_match' : status === 'normalized_partial_alias_match' ? 'partial_match' : status === 'actual_value_different' ? 'mismatch' : 'field_not_available';
            summary.metrics[cat][mappedStatus] = (summary.metrics[cat][mappedStatus] || 0) + 1;
        }
    }

    const finalResults = { summary, details: runResults.details };
    
    fs.writeFileSync(path.resolve(__dirname, '../../safescope-data/benchmarks/safescope-200-baseline-triage-results.v1.json'), JSON.stringify(finalResults, null, 2));
    console.log("Calibration Triage Results with Summary generated.");
}

run();
