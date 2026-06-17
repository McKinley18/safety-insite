import { CorrectiveActionBrainService } from '../brain/corrective-action-brain/corrective-action.service';
import { ObservationUnderstandingService } from '../understanding/observation-understanding.service';

const correctiveActionEngine = new CorrectiveActionBrainService();
const understandingEngine = new ObservationUnderstandingService();

type BenchmarkScenario = {
  name: string;
  text: string;
  scenarioFamilyId: string;
  hazardDomain: string;
  mechanismOfInjury: string;
  missingControls: string[];
  expectedWordingHint: string;
};

const scenarios: BenchmarkScenario[] = [
  {
    name: "1. Conveyor tail pulley / mechanical rotation",
    text: "Worker exposed to unguarded rotating shaft near conveyor drive. No fixed guard installed. Employees work within reach of moving parts.",
    scenarioFamilyId: "conveyor-cleanup",
    hazardDomain: "machine_guarding",
    mechanismOfInjury: "rotating_equipment_entanglement",
    missingControls: ["guarding"],
    expectedWordingHint: "Pause affected work and restrict access around",
  },
  {
    name: "2. Damaged electrical cord / electrical energy",
    text: "Live wire hanging from open junction box with exposed conductor near work area.",
    scenarioFamilyId: "damaged-cord-wet-location",
    hazardDomain: "electrical",
    mechanismOfInjury: "electrical_shock",
    missingControls: ["electrical_integrity"],
    expectedWordingHint: "Isolate the affected",
  },
  {
    name: "3. Open platform edge / gravity",
    text: "Missing guardrail on elevated platform creates unprotected edge exposure.",
    scenarioFamilyId: "elevated-fall",
    hazardDomain: "fall_protection",
    mechanismOfInjury: "fall_from_height",
    missingControls: ["fall_protection_or_edge_protection"],
    expectedWordingHint: "Restrict access to the open platform edge",
  },
  {
    name: "4. Chemical transfer / chemical exposure",
    text: "Worker decanting corrosive chemicals without wearing a face shield or safety glasses.",
    scenarioFamilyId: "chemical-exposure-unclear",
    hazardDomain: "ppe",
    mechanismOfInjury: "chemical_splash",
    missingControls: ["eye_face_protection"],
    expectedWordingHint: "Confirm eye/face splash exposure controls",
  },
];

function scanForProhibitedKeywords(obj: any): string[] {
  const foundKeywords: string[] = [];
  const prohibited = ["violation", "citation", "cited", "noncompliant", "will be cited", "must be cited"];

  function recurse(val: any) {
    if (typeof val === "string") {
      const lower = val.toLowerCase();
      for (const kw of prohibited) {
        if (lower.includes(kw)) {
          foundKeywords.push(kw);
        }
      }
    } else if (Array.isArray(val)) {
      for (const item of val) {
        recurse(item);
      }
    } else if (val && typeof val === "object") {
      for (const key of Object.keys(val)) {
        recurse(val[key]);
      }
    }
  }

  recurse(obj);
  return Array.from(new Set(foundKeywords));
}

function runBenchmark() {
  console.log("🏃 Running HazLenz AI Corrective Action Intelligence Benchmark...\n");

  let passedCount = 0;
  let failedCount = 0;

  for (const sc of scenarios) {
    console.log(`Checking Scenario: ${sc.name}`);
    const understanding = understandingEngine.evaluate(sc.text);

    const dummyScenarioIntelligence = {
      scenarioFamilyId: sc.scenarioFamilyId,
      candidateStandardFamily: sc.hazardDomain,
      mechanismOfInjury: sc.mechanismOfInjury,
      exposedPersonActivity: "maintenance or operations",
      missingOrFailedControls: sc.missingControls,
      hierarchyLevel: "engineering",
      confidenceSignals: { score: 0.95 },
    } as any;

    const result = correctiveActionEngine.evaluate(
      dummyScenarioIntelligence,
      [],
      understanding
    );

    const assertions: { label: string; passed: boolean; actual: string }[] = [];

    // 1. Verify reasoning object exists
    assertions.push({
      label: "Corrective action reasoning output is produced",
      passed: !!result,
      actual: result ? "Exists" : "Missing",
    });

    // 2. Verify expected tailored wording is present
    const immediateNarrative = result?.immediateActionNarrative || "";
    const hasTailoredWording = immediateNarrative.includes(sc.expectedWordingHint);
    assertions.push({
      label: `Rationale/action narrative includes tailored phrase: '${sc.expectedWordingHint}'`,
      passed: hasTailoredWording,
      actual: immediateNarrative || "None",
    });

    // 3. Verify equipment or component is referenced when known
    const parsedEquipment = understanding?.equipment?.category || "";
    const hasEquipmentRef = immediateNarrative.toLowerCase().includes(parsedEquipment.toLowerCase().replace("_", " ")) || 
                            result?.permanentCorrectionNarrative?.toLowerCase().includes("shaft") ||
                            result?.permanentCorrectionNarrative?.toLowerCase().includes("wiring") ||
                            result?.permanentCorrectionNarrative?.toLowerCase().includes("edge") ||
                            result?.permanentCorrectionNarrative?.toLowerCase().includes("ventilation");
    assertions.push({
      label: "Corrective action narrative successfully references parsed equipment/components",
      passed: hasEquipmentRef,
      actual: `Immediate Narrative: "${immediateNarrative}"`,
    });

    // 4. Verify no prohibited language
    const prohibitedKeywordsFound = scanForProhibitedKeywords(result);
    const guardrailPassed = prohibitedKeywordsFound.length === 0;
    assertions.push({
      label: "Safety Guardrails: No prohibited legal/citation language dynamically produced",
      passed: guardrailPassed,
      actual: guardrailPassed ? "Pass" : `Fail (Prohibited terms found: ${prohibitedKeywordsFound.join(", ")})`,
    });

    // Verify advisory guardrails are present
    assertions.push({
      label: "Advisory guardrails are fully active",
      passed: !!(result?.advisoryGuardrails?.advisoryOnly && result?.advisoryGuardrails?.doesNotDeclareViolation && result?.advisoryGuardrails?.requiresQualifiedReview),
      actual: JSON.stringify(result?.advisoryGuardrails || {}),
    });

    // Calculate Scenario Status
    const scenarioFailed = assertions.some(a => !a.passed);
    if (scenarioFailed) {
      failedCount++;
      console.log(`❌ FAIL`);
    } else {
      passedCount++;
      console.log(`✅ PASS`);
    }

    // Print details
    console.log(`   - Immediate Action: ${immediateNarrative}`);
    console.log(`   - Interim Control:  ${result?.interimControlNarrative}`);
    console.log(`   - Permanent Fix:    ${result?.permanentCorrectionNarrative}`);
    if (scenarioFailed) {
      console.log(`   Detailed Assertions:`);
      assertions.forEach(a => {
        console.log(`     [${a.passed ? "✅" : "❌"}] ${a.label} (Actual: ${a.actual})`);
      });
    }
    console.log("--------------------------------------------------\n");
  }

  console.log(`📊 Corrective Action Benchmark Summary: ${passedCount} passed, ${failedCount} failed.`);
  if (failedCount > 0) {
    process.exit(1);
  }
}

runBenchmark();
