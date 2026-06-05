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
            results.run++;

            const scoring = {
                hazardFamily: { expected: record.expectedHazardFamily, actual: output.scenarioIntelligence?.hazardCategory, status: getMatchStatus(output.scenarioIntelligence?.hazardCategory, record.expectedHazardFamily) },
                scenarioFamily: { expected: record.expectedScenarioFamily, actual: output.scenarioIntelligence?.scenarioFamilyId, status: getMatchStatus(output.scenarioIntelligence?.scenarioFamilyId, record.expectedScenarioFamily) },
                mechanism: { expected: record.expectedMechanism, actual: output.scenarioIntelligence?.mechanismOfInjury, status: getMatchStatus(output.scenarioIntelligence?.mechanismOfInjury, record.expectedMechanism) },
                jurisdiction: { expected: record.jurisdiction, actual: output.observationContext?.jurisdictionSignals?.[0], status: getMatchStatus(output.observationContext?.jurisdictionSignals?.[0], record.jurisdiction) },
                riskBand: { expected: record.expectedRiskBand, actual: output.riskReasoning?.initialRiskLevel, status: getMatchStatus(output.riskReasoning?.initialRiskLevel, record.expectedRiskBand) }
            };

            results.details.push({ id: record.id, scoring });
        } catch (e) {
            results.errors++;
        }
    }

    fs.writeFileSync(path.resolve(__dirname, '../../safescope-data/benchmarks/safescope-200-baseline-triage-results.v1.json'), JSON.stringify(results, null, 2));
    console.log("Calibration Triage Results generated.");
}

run();
