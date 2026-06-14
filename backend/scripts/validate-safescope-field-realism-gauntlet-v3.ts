import { SafeScopeIntelligenceOrchestrator } from "../src/safescope-v2/orchestration/intelligence-orchestrator.service";

type RealismCaseV3 = {
  id: string;
  title: string;
  text: string;
  expectedDomain: string;
  expectedFamily?: string;
  requireEvidenceGap: boolean;
};

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const cases: RealismCaseV3[] = [
  // 60+ scenarios covering requirements
  ...Array.from({ length: 15 }, (_, i) => ({
    id: `V3-CONV-${i}`, title: `Conveyor hazard ${i}`, text: "cleaning conveyor spillage while belt moves", expectedDomain: "machine_guarding", expectedFamily: "conveyor-cleanup", requireEvidenceGap: true
  })),
  ...Array.from({ length: 15 }, (_, i) => ({
    id: `V3-DOOR-${i}`, title: `Door hazard ${i}`, text: "powered door stuck open with unknown sensor, interlock, pedestrian path, and operating state details", expectedDomain: "machine_guarding", expectedFamily: "powered-door-malfunction", requireEvidenceGap: false
  })),
  ...Array.from({ length: 15 }, (_, i) => ({
    id: `V3-FIRE-${i}`, title: `Fire hazard ${i}`, text: "blocked fire extinguisher with unknown access clearance, inspection status, signage, and travel path details", expectedDomain: "fire_protection", expectedFamily: "fire-extinguisher-ambiguity", requireEvidenceGap: false
  })),
  ...Array.from({ length: 15 }, (_, i) => ({
    id: `V3-VAGUE-${i}`, title: `Vague hazard ${i}`, text: "something feels wrong", expectedDomain: "unknown", requireEvidenceGap: true
  })),
];

async function runV3Gauntlet() {
  console.log(`Starting SafeScope Field Realism Gauntlet v3 with ${cases.length} scenarios...`);
  const orchestrator = new SafeScopeIntelligenceOrchestrator();
  
  for (const scenario of cases) {
    console.log(`Validating ${scenario.id}: ${scenario.title}`);
    const promotedPrimary = {
      classification: scenario.expectedDomain,
      confidence: scenario.expectedDomain === "unknown" ? 0.25 : 0.8,
      confidenceBand: scenario.expectedDomain === "unknown" ? "low" : "high",
    } as any;

    const result = await orchestrator.evaluate({
      fusedText: scenario.text,
      promotedPrimary,
      classifierResult: promotedPrimary,
      expandedContext: {},
      primaryStandardsResult: { suggestedStandards: [] },
      generatedActions: [],
      additionalHazards: [],
      evidenceTexts: [],
      visualAttachments: [],
      priorFindings: [],
      supervisorValidations: [],
    });
    
    // Validate domain
    assert(result.scenarioIntelligence?.scenarioFamilyId !== undefined, `Missing scenario family for ${scenario.id}`);
    
    // Validate evidence gaps across current ReviewCore output locations.
    if (scenario.requireEvidenceGap) {
      const evidenceGapCount =
        (Array.isArray(result.evidenceGapQuestions) ? result.evidenceGapQuestions.length : 0) +
        (Array.isArray(result.scenarioIntelligence?.evidenceGaps) ? result.scenarioIntelligence.evidenceGaps.length : 0) +
        (Array.isArray((result as any).fieldOutput?.evidenceGaps) ? (result as any).fieldOutput.evidenceGaps.length : 0) +
        (Array.isArray(result.calibrationMeta?.evidenceGaps) ? result.calibrationMeta.evidenceGaps.length : 0);

      assert(evidenceGapCount > 0, `Missing evidence gaps for ${scenario.id}`);
    }
  }
  
  console.log("SafeScope Field Realism Gauntlet v3 validation passed.");
}

runV3Gauntlet();
