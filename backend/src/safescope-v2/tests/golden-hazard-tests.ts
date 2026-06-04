import { WeightedClassifierService } from "../classifier/weighted-classifier.service";
import { evaluateRisk } from "../risk/risk-engine";

type GoldenHazardTest = {
  name: string;
  text: string;
  expectedClassification: string;
  expectedConfidenceBand?: "low" | "medium" | "high";
  riskProfileId?: "simple_4x4" | "standard_5x5" | "advanced_6x6";
};

const tests: GoldenHazardTest[] = [
  {
    name: "Unguarded rotating shaft stays Machine Guarding",
    text: "Worker exposed to unguarded rotating shaft near conveyor drive. No fixed guard installed. Employees work within reach of moving parts.",
    expectedClassification: "Machine Guarding",
    expectedConfidenceBand: "high",
  },
  {
    name: "Exposed live wire classifies as Electrical",
    text: "Live wire hanging from open junction box with exposed conductor near work area.",
    expectedClassification: "Electrical",
    expectedConfidenceBand: "high",
  },
  {
    name: "Missing guardrail classifies as Fall Protection",
    text: "Missing guardrail on elevated platform creates unprotected edge exposure.",
    expectedClassification: "Fall Protection",
    expectedConfidenceBand: "high",
  },
  {
    name: "Oil spill in walkway classifies as Walking/Working Surfaces",
    text: "Oil spill across pedestrian walkway creates slip hazard and unsafe access.",
    expectedClassification: "Walking/Working Surfaces",
    expectedConfidenceBand: "high",
  },
  {
    name: "Forklift pedestrian exposure classifies as Mobile Equipment / Traffic",
    text: "Forklift operating near pedestrians with no traffic control or spotter in congested area.",
    expectedClassification: "Mobile Equipment / Traffic",
    expectedConfidenceBand: "high",
  },
  {
    name: "Unlabeled chemical container classifies as Hazard Communication",
    text: "Secondary chemical container unlabeled and no SDS available for unknown substance.",
    expectedClassification: "Hazard Communication",
    expectedConfidenceBand: "high",
  },
  {
    name: "Confined space entry classifies as Confined Space",
    text: "Confined space entry into tank with no attendant and atmospheric testing not performed.",
    expectedClassification: "Confined Space",
    expectedConfidenceBand: "high",
  },
  {
    name: "Flammable vapor hot work classifies as Fire / Explosion",
    text: "Flammable vapors near ignition source during hot work create explosion hazard.",
    expectedClassification: "Fire / Explosion",
    expectedConfidenceBand: "high",
  },
  {
    name: "Maintenance without lockout classifies as Lockout / Stored Energy",
    text: "Maintenance performed without lockout and stored energy not released before clearing jam.",
    expectedClassification: "Lockout / Stored Energy",
    expectedConfidenceBand: "high",
  },
  {
    name: "Visible silica dust classifies as Respirable Dust / Silica",
    text: "Visible silica dust from dry cutting concrete with no dust control or water suppression.",
    expectedClassification: "Respirable Dust / Silica",
    expectedConfidenceBand: "high",
  },
  {
    name: "Blocked emergency exit classifies as Emergency Egress",
    text: "Emergency exit blocked during shift and exit route obstructed by stored materials.",
    expectedClassification: "Emergency Egress",
    expectedConfidenceBand: "high",
  },
];

function runGoldenTests() {
  const classifier = new WeightedClassifierService();

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = classifier.classify(test.text);
    const risk = evaluateRisk({
      text: test.text,
      classification: result.classification,
      riskProfileId: test.riskProfileId || "standard_5x5",
      environment: "warehouse",
    });

    const classificationPass = result.classification === test.expectedClassification;
    const confidencePass = test.expectedConfidenceBand
      ? result.confidenceBand === test.expectedConfidenceBand
      : true;

    const pass = classificationPass && confidencePass;

    if (pass) {
      passed += 1;
      console.log(`✅ ${test.name}`);
    } else {
      failed += 1;
      console.log(`❌ ${test.name}`);
      console.log(`   Expected: ${test.expectedClassification} / ${test.expectedConfidenceBand || "any confidence"}`);
      console.log(`   Received: ${result.classification} / ${result.confidenceBand}`);
      console.log(`   Evidence: ${result.evidenceTokens?.join(", ")}`);
    }

    console.log(`   Risk: ${risk.operationalRisk.matrixScore} ${risk.operationalRisk.matrixBand} (${risk.operationalRisk.profileLabel})`);
  }

  console.log("");
  console.log(`SafeScope golden tests: ${passed} passed, ${failed} failed`);

  if (failed > 0) {
    process.exit(1);
  }
}

runGoldenTests();
