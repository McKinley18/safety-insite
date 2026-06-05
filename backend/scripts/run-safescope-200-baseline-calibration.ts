import * as fs from 'fs';
import * as path from 'path';
import { SafeScopeIntelligenceOrchestrator } from "../src/safescope-v2/orchestration/intelligence-orchestrator.service";

const datasetPath = path.resolve(__dirname, '../../safescope-data/benchmarks/safescope-field-validation-dataset.v1.json');
const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));
const orchestrator = new SafeScopeIntelligenceOrchestrator();

console.log(`Running Calibration for ${dataset.length} cases...`);

const results = {
    total: dataset.length,
    run: 0,
    errors: 0,
    scorable: {
        hazardFamily: 0,
        scenarioFamily: 0,
        mechanism: 0,
        jurisdiction: 0,
        riskBand: 0,
        standardFamily: 0,
        evidenceGaps: 0
    },
    matches: {
        hazardFamily: 0,
        scenarioFamily: 0,
        mechanism: 0,
        jurisdiction: 0,
        riskBand: 0,
        standardFamily: 0,
        evidenceGaps: 0
    },
    details: [] as any[]
};

function checkMatch(actual: any, expected: any) {
    if (actual === undefined || actual === null) return 'unavailable';
    return actual === expected ? 'exact_match' : 'mismatch';
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

            // Scoring
            const detail = {
                id: record.id,
                matches: {
                    hazardFamily: checkMatch(output.scenarioIntelligence?.hazardCategory, record.expectedHazardFamily),
                    scenarioFamily: checkMatch(output.scenarioIntelligence?.scenarioFamilyId, record.expectedScenarioFamily),
                    mechanism: checkMatch(output.scenarioIntelligence?.mechanismOfInjury, record.expectedMechanism),
                    jurisdiction: checkMatch(output.observationContext?.jurisdictionSignals?.[0], record.expectedJurisdiction),
                    riskBand: checkMatch(output.riskReasoning?.initialRiskLevel, record.expectedRiskBand),
                    standardFamily: checkMatch(output.scenarioIntelligence?.candidateStandardFamily, record.expectedStandardFamily),
                    evidenceGaps: checkMatch(JSON.stringify(output.scenarioIntelligence?.evidenceGaps), JSON.stringify(record.evidenceGapsExpected))
                }
            };
            
            for (const key in detail.matches) {
                const matchVal = detail.matches[key as keyof typeof detail.matches];
                if (matchVal !== 'unavailable') {
                    results.scorable[key as keyof typeof results.scorable]++;
                }
                if (matchVal === 'exact_match') {
                    results.matches[key as keyof typeof results.matches]++;
                }
            }

            results.details.push(detail);
        } catch (e) {
            results.errors++;
            console.error(`Error running case ${record.id}:`, e);
        }
    }

    console.log("Calibration Results:", JSON.stringify(results, null, 2));
    fs.writeFileSync(path.resolve(__dirname, '../../safescope-data/benchmarks/safescope-200-baseline-calibration-results.v1.json'), JSON.stringify(results, null, 2));
}

run();
