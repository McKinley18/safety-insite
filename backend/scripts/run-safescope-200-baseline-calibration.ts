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
    matches: {
        hazardFamily: 0,
        scenarioFamily: 0,
        mechanism: 0,
        jurisdiction: 0,
        riskBand: 0
    },
    details: [] as any[]
};

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
                    hazardFamily: output.scenarioIntelligence?.expectedHazardFamily === record.expectedHazardFamily,
                    scenarioFamily: output.scenarioIntelligence?.scenarioFamilyId === record.expectedScenarioFamily,
                    mechanism: output.scenarioIntelligence?.mechanismOfInjury === record.expectedMechanism,
                    jurisdiction: output.observationContext?.jurisdiction === record.jurisdiction,
                    riskBand: output.riskReasoning?.initialRiskLevel === record.expectedRiskBand,
                }
            };
            
            if (detail.matches.hazardFamily) results.matches.hazardFamily++;
            if (detail.matches.scenarioFamily) results.matches.scenarioFamily++;
            if (detail.matches.mechanism) results.matches.mechanism++;
            if (detail.matches.jurisdiction) results.matches.jurisdiction++;
            if (detail.matches.riskBand) results.matches.riskBand++;

            results.details.push(detail);
        } catch (e) {
            results.errors++;
            console.error(`Error running case ${record.id}:`, e);
        }
    }

    console.log("Calibration Results:", results);
    fs.writeFileSync(path.resolve(__dirname, '../../safescope-data/benchmarks/safescope-200-baseline-calibration-results.v1.json'), JSON.stringify(results, null, 2));
}

run();
