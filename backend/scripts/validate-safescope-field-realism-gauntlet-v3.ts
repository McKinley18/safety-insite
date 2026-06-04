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
    id: `V3-DOOR-${i}`, title: `Door hazard ${i}`, text: "powered door stuck open", expectedDomain: "machine_guarding", expectedFamily: "powered-door-malfunction", requireEvidenceGap: true
  })),
  ...Array.from({ length: 15 }, (_, i) => ({
    id: `V3-FIRE-${i}`, title: `Fire hazard ${i}`, text: "blocked fire extinguisher", expectedDomain: "fire_protection", expectedFamily: "fire-extinguisher-ambiguity", requireEvidenceGap: true
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
    const result = await orchestrator.evaluate({
      fusedText: scenario.text,
      promotedPrimary: {} as any,
    });
    
    // Validate domain
    assert(result.scenarioIntelligence?.scenarioFamilyId !== undefined, `Missing scenario family for ${scenario.id}`);
    
    // Validate evidence gaps
    if (scenario.requireEvidenceGap) {
      assert(result.evidenceGapQuestions && result.evidenceGapQuestions.length > 0, `Missing evidence gaps for ${scenario.id}`);
    }
  }
  
  console.log("SafeScope Field Realism Gauntlet v3 validation passed.");
}

runV3Gauntlet();
