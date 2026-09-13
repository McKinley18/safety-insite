import { ObservationUnderstandingService } from '../understanding/observation-understanding.service';

const service = new ObservationUnderstandingService();

type BenchmarkScenario = {
  name: string;
  text: string;
  expect: {
    equipmentCategory?: string;
    equipmentComponent?: string;
    primaryEnergySource?: string;
    missingControl?: string;
    failedControl?: string;
    expectedMechanismInCandidates?: string;
    expectedMechanismIsTop?: string;
  };
};

const scenarios: BenchmarkScenario[] = [
  {
    name: "1. Missing machine guard / rotating shaft",
    text: "Worker exposed to unguarded rotating shaft near conveyor drive. No fixed guard installed. Employees work within reach of moving parts.",
    expect: {
      equipmentCategory: "rotating_equipment",
      primaryEnergySource: "mechanical_rotation",
      missingControl: "guarding",
      expectedMechanismIsTop: "rotating_equipment_entanglement",
    },
  },
  {
    name: "2. Damaged electrical cord / exposed conductor",
    text: "Live wire hanging from open junction box with exposed conductor near work area.",
    expect: {
      equipmentCategory: "electrical_cord",
      primaryEnergySource: "electrical",
      failedControl: "electrical_integrity",
      expectedMechanismIsTop: "electrical_shock",
    },
  },
  {
    name: "3. Mobile equipment and pedestrian exposure",
    text: "Forklift operating near pedestrians with no traffic control or spotter in congested area.",
    expect: {
      equipmentCategory: "mobile_equipment",
      primaryEnergySource: "mobile_equipment_kinetic",
      expectedMechanismIsTop: "struck_by_mobile_equipment",
    },
  },
  {
    name: "4. Open edge / fall hazard",
    text: "Missing guardrail on elevated platform creates unprotected edge exposure.",
    expect: {
      equipmentCategory: "fall_protection",
      equipmentComponent: "unprotected_edge",
      primaryEnergySource: "gravity",
      missingControl: "fall_protection_or_edge_protection",
      expectedMechanismIsTop: "fall_from_height",
    },
  },
  {
    name: "5. Chemical exposure / unlabeled container",
    text: "Secondary chemical container unlabeled and no SDS available for unknown substance.",
    expect: {
      primaryEnergySource: "chemical",
    },
  },
  {
    name: "6. Housekeeping / slip-trip walkway hazard",
    text: "Oil spill across pedestrian walkway creates slip hazard and unsafe access.",
    expect: {
      primaryEnergySource: "gravity",
      expectedMechanismInCandidates: "slip_trip_fall_same_level",
    },
  },
  {
    name: "7. LOTO / energized maintenance",
    text: "Maintenance performed with no lockout and stored energy not released before clearing jam.",
    expect: {
      missingControl: "energy_isolation",
    },
  },
  {
    name: "8. Conveyor tail pulley / nip point exposure",
    text: "Worker cleaning conveyor belt tail pulley while running. Missing tail pulley guard exposes worker to in-running nip point.",
    expect: {
      equipmentCategory: "conveyor",
      equipmentComponent: "tail_pulley",
      primaryEnergySource: "mechanical_rotation",
      missingControl: "guarding",
      expectedMechanismIsTop: "rotating_equipment_nip_point",
    },
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
  console.log("🏃 Running HazLenz AI Observation Understanding Benchmark...\n");

  let passedCount = 0;
  let failedCount = 0;

  for (const sc of scenarios) {
    console.log(`Checking Scenario: ${sc.name}`);
    const understanding = service.evaluate(sc.text);

    // Basic assertion validations
    const assertions: { label: string; passed: boolean; actual: string }[] = [];

    // Verify root object and primary components exist
    assertions.push({
      label: "observationUnderstanding object exists",
      passed: !!understanding,
      actual: understanding ? "Exists" : "Missing",
    });

    assertions.push({
      label: "jurisdiction object exists",
      passed: !!understanding?.jurisdiction,
      actual: understanding?.jurisdiction ? "Exists" : "Missing",
    });

    assertions.push({
      label: "evidenceGaps is an array",
      passed: Array.isArray(understanding?.evidenceGaps),
      actual: Array.isArray(understanding?.evidenceGaps) ? "Array" : "Not an array",
    });

    // Flexible assertion validations for matched components
    if (sc.expect.equipmentCategory) {
      const categoryMatch = understanding.equipment?.category === sc.expect.equipmentCategory;
      assertions.push({
        label: `equipment.category matches '${sc.expect.equipmentCategory}'`,
        passed: categoryMatch,
        actual: understanding.equipment?.category || "Missing",
      });
    }

    if (sc.expect.equipmentComponent) {
      const componentMatch = understanding.equipment?.component === sc.expect.equipmentComponent;
      assertions.push({
        label: `equipment.component matches '${sc.expect.equipmentComponent}'`,
        passed: componentMatch,
        actual: understanding.equipment?.component || "Missing",
      });
    }

    if (sc.expect.primaryEnergySource) {
      const energyMatch = understanding.energy?.primaryEnergySource === sc.expect.primaryEnergySource;
      assertions.push({
        label: `energy.primaryEnergySource matches '${sc.expect.primaryEnergySource}'`,
        passed: energyMatch,
        actual: understanding.energy?.primaryEnergySource || "Missing",
      });
    }

    if (sc.expect.missingControl) {
      const missingMatch = understanding.controls?.missingControls?.includes(sc.expect.missingControl);
      assertions.push({
        label: `controls.missingControls contains '${sc.expect.missingControl}'`,
        passed: missingMatch,
        actual: JSON.stringify(understanding.controls?.missingControls || []),
      });
    }

    if (sc.expect.failedControl) {
      const failedMatch = understanding.controls?.failedControls?.includes(sc.expect.failedControl);
      assertions.push({
        label: `controls.failedControls contains '${sc.expect.failedControl}'`,
        passed: failedMatch,
        actual: JSON.stringify(understanding.controls?.failedControls || []),
      });
    }

    if (sc.expect.expectedMechanismIsTop) {
      const topMechanism = understanding.mechanismCandidates?.[0]?.mechanism;
      const mechanismMatch = topMechanism === sc.expect.expectedMechanismIsTop;
      assertions.push({
        label: `top injury mechanism matches '${sc.expect.expectedMechanismIsTop}'`,
        passed: mechanismMatch,
        actual: topMechanism || "None",
      });
    }

    if (sc.expect.expectedMechanismInCandidates) {
      const hasMechanism = understanding.mechanismCandidates?.some(
        c => c.mechanism === sc.expect.expectedMechanismInCandidates
      );
      assertions.push({
        label: `mechanismCandidates contains '${sc.expect.expectedMechanismInCandidates}'`,
        passed: !!hasMechanism,
        actual: JSON.stringify(understanding.mechanismCandidates?.map(c => c.mechanism) || []),
      });
    }

    // Safety & Guardrails Keyword Scan
    const prohibitedKeywordsFound = scanForProhibitedKeywords(understanding);
    const guardrailPassed = prohibitedKeywordsFound.length === 0;
    assertions.push({
      label: "Safety Guardrails: No prohibited legal/citation language dynamically produced",
      passed: guardrailPassed,
      actual: guardrailPassed ? "Pass" : `Fail (Prohibited terms found: ${prohibitedKeywordsFound.join(", ")})`,
    });

    // Report Scenario Status
    const scenarioFailed = assertions.some(a => !a.passed);
    if (scenarioFailed) {
      failedCount++;
      console.log(`❌ FAIL`);
    } else {
      passedCount++;
      console.log(`✅ PASS`);
    }

    // Print key parsed values & assertions
    console.log(`   - Parsed Equipment: ${understanding.equipment?.category || "None"} (${understanding.equipment?.specificEquipment || "None"})`);
    console.log(`   - Primary Energy:   ${understanding.energy?.primaryEnergySource || "None"}`);
    console.log(`   - Control Failures: Failed: [${understanding.controls?.failedControls?.join(", ") || ""}] | Missing: [${understanding.controls?.missingControls?.join(", ") || ""}]`);
    console.log(`   - Evidence Gaps:    ${understanding.evidenceGaps?.slice(0, 3).join(" • ") || "None"}`);
    if (scenarioFailed) {
      console.log(`   Detailed Assertions:`);
      assertions.forEach(a => {
        console.log(`     [${a.passed ? "✅" : "❌"}] ${a.label} (Actual: ${a.actual})`);
      });
    }
    console.log("--------------------------------------------------\n");
  }

  console.log(`📊 Benchmark Summary: ${passedCount} passed, ${failedCount} failed.`);
  if (failedCount > 0) {
    process.exit(1);
  }
}

runBenchmark();
