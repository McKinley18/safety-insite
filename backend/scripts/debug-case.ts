import { HazLenzIntelligenceOrchestrator } from '../src/hazlenz/orchestration/intelligence-orchestrator.service';

const text = "Scaffold planks are not cleated or secured, and they slide when the masonry crew steps on them.";
const orchestrator = new HazLenzIntelligenceOrchestrator();

async function run() {
    const output = await orchestrator.evaluate({
        fusedText: text,
        promotedPrimary: {
            classification: "fall_protection",
            confidence: 0.95,
            confidenceBand: 'high',
            risk: {
                riskScore: 16,
                riskBand: "high"
            }
        } as any,
        classifierResult: {
            classification: "fall_protection",
            confidence: 0.95,
            confidenceBand: 'high',
            ambiguityWarnings: []
        } as any,
        evidenceTexts: [],
        visualAttachments: [],
        expandedContext: {},
        primaryStandardsResult: { suggestedStandards: [] },
        generatedActions: [],
        additionalHazards: [],
        priorFindings: [],
        workspaceId: 'test',
        supervisorValidations: []
    });

    console.log("CalibrationMeta Output:", JSON.stringify(output.calibrationMeta, null, 2));
}

run();
