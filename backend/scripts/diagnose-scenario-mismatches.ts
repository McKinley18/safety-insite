import * as fs from 'fs';
import * as path from 'path';
import { SafeScopeIntelligenceOrchestrator } from "../src/safescope-v2/orchestration/intelligence-orchestrator.service";

const datasetPath = path.resolve(__dirname, '../../safescope-data/benchmarks/safescope-field-validation-dataset.v1.json');
const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));
const orchestrator = new SafeScopeIntelligenceOrchestrator();

console.log("Analyzing scenarioFamily mismatches...");

const report = {
    mismatches: [] as any[]
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
            const actualScenario = output.scenarioIntelligence?.scenarioFamilyId;
            
            if (actualScenario !== record.expectedScenarioFamily) {
                report.mismatches.push({
                    id: record.id,
                    expected: record.expectedScenarioFamily,
                    actual: actualScenario,
                    equipment: record.equipment,
                    task: record.task
                });
            }
        } catch (e) {
            // handle error
        }
    }
    
    console.log(JSON.stringify(report, null, 2));
}

run();
