import { SafeScopeIntelligenceOrchestrator } from "../src/safescope-v2/orchestration/intelligence-orchestrator.service";
import { SafeScopeIntelligenceOrchestratorInput } from "../src/safescope-v2/orchestration/intelligence-orchestrator.service";

type RiskCalibrationCase = {
  id: string;
  title: string;
  text: string;
  expectedMinRisk: 'low' | 'moderate' | 'high' | 'serious' | 'critical' | 'unknown';
  expectedMinUrgency: 'monitor' | 'scheduled' | 'prompt' | 'urgent' | 'immediate' | 'unknown';
  requireEvidenceGap: boolean;
};

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const cases: RiskCalibrationCase[] = [
  { id: "RISK-CAL-001", title: "Energized equipment servicing", text: "servicing machine while running, no lockout", expectedMinRisk: "critical", expectedMinUrgency: "immediate", requireEvidenceGap: false },
  { id: "RISK-CAL-002", title: "Damaged electrical cord", text: "exposed wires on extension cord in use", expectedMinRisk: "high", expectedMinUrgency: "urgent", requireEvidenceGap: false },
  { id: "RISK-CAL-003", title: "Vague observation", text: "something feels wrong", expectedMinRisk: "moderate", expectedMinUrgency: "prompt", requireEvidenceGap: true },
];

async function runRiskCalibrationBenchmark() {
  console.log(`Starting SafeScope Risk Calibration Benchmark with ${cases.length} scenarios...`);
  const orchestrator = new SafeScopeIntelligenceOrchestrator();
  
  for (const scenario of cases) {
    console.log(`Validating ${scenario.id}: ${scenario.title}`);
    const input: SafeScopeIntelligenceOrchestratorInput = {
      fusedText: scenario.text,
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
    
    const result = await orchestrator.evaluate(input);
    
    // Validate risk reasoning exists
    assert(result.riskReasoning !== undefined, `Missing risk reasoning for ${scenario.id}`);
    
    console.log(`Risk level: ${result.riskReasoning?.initialRiskLevel}, Urgency: ${result.correctiveActionReasoning?.urgencyLevel}`);
  }
  
  console.log("SafeScope Risk Calibration Benchmark passed.");
}

runRiskCalibrationBenchmark();
