import fs from "node:fs/promises";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";
const SCENARIO_FILE =
  process.env.SCENARIO_FILE || "safescope-gauntlet.seed.json";
const LIMIT = Number(process.env.LIMIT || 20);

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[_/-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function includesAny(haystack, needles) {
  const normalizedHaystack = normalize(haystack);
  return needles.some((needle) => normalizedHaystack.includes(normalize(needle)));
}

function collectText(result) {
  return JSON.stringify(result || {}, null, 2);
}

function getSuggestedStandards(result) {
  return (
    result?.suggestedStandards ||
    result?.standards ||
    result?.applicableStandards ||
    result?.standardSuggestions ||
    []
  );
}

function getGeneratedActions(result) {
  return (
    result?.generatedActions ||
    result?.correctiveActions ||
    result?.actions ||
    []
  );
}

function scoreScenario(scenario, result) {
  const resultText = collectText(result);
  const standards = getSuggestedStandards(result);
  const actions = getGeneratedActions(result);

  const classificationText = [
    result?.classification,
    result?.hazardCategory,
    result?.primaryHazard,
    result?.primaryHazardFamily,
    result?.family,
    result?.category,
  ].join(" ");

  const standardText = standards
    .map((standard) =>
      [
        standard?.citation,
        standard?.agency,
        standard?.scope,
        standard?.title,
        standard?.heading,
        standard?.summary,
        standard?.rationale,
        standard?.family,
        standard?.category,
        standard?.standardFamily,
        ...(standard?.matchingReasons || []),
      ].join(" "),
    )
    .join(" ");

  const actionText = [
    ...(result?.requiredControls || []),
    ...actions.map((action) =>
      [
        action?.title,
        action?.description,
        action?.theme,
        action?.actionTheme,
      ].join(" "),
    ),
  ].join(" ");

  // Unacceptable families should only fail the scenario when they appear in
  // actual suggested standards. Do not fail because a word appears elsewhere
  // in metadata, excluded hazards, domain intelligence, or context notes.
  let unacceptableHits = (scenario.unacceptableStandardFamilies || []).filter(
    (family) => standards.some(s => s.citation && includesAny(s.citation + " " + s.title + " " + s.family + " " + s.category, [family]) && (s.score || 0) >= 20)
  );

  const norm = String(scenario.expectedStandardFamily || "").toLowerCase().trim();
  if (norm === "scaffolds" && (includesAny(standardText, ["1926.451", "56.11012", "56.11001"]) || includesAny(resultText, ["scaffold", "scaffolding"]))) {
    unacceptableHits = unacceptableHits.filter(f => f !== "Walking/Working Surfaces" && f !== "Walking-Working Surfaces" && f !== "Walking Working Surfaces");
  }
  if ((norm === "housekeeping" || norm === "walking/working surfaces" || norm === "walking-working surfaces") && (includesAny(standardText, ["1910.22", "56.20003"]) || includesAny(resultText, ["trip", "slip", "spill"]))) {
    unacceptableHits = unacceptableHits.filter(f => f !== "Walking/Working Surfaces" && f !== "Walking-Working Surfaces" && f !== "Walking Working Surfaces" && f !== "Housekeeping");
  }

  function getSearchNeedles(expectedFamily) {
    const needles = [expectedFamily];
    const norm = String(expectedFamily || "").toLowerCase().trim();
    if (norm === "emergency preparedness") {
      needles.push("Emergency Egress");
    }
    if (norm === "emergency egress") {
      needles.push("Emergency Preparedness");
    }
    if (norm === "trenching & shoring" || norm === "trenching and shoring") {
      needles.push("Trenching & Excavation", "Trenching and Excavation");
    }
    if (norm === "trenching & excavation" || norm === "trenching and excavation") {
      needles.push("Trenching & Shoring", "Trenching and Shoring");
    }
    if (norm === "material handling") {
      needles.push("Compressed Gas Cylinder", "Compressed Air Hose");
    }
    if (norm === "compressed gas cylinder" || norm === "compressed air hose") {
      needles.push("Material Handling");
    }
    if (norm === "powered industrial trucks" || norm === "powered industrial truck") {
      needles.push("Powered Industrial Trucks", "Powered Industrial Truck", "Mobile Equipment / Traffic", "Powered Mobile Equipment");
    }
    if (norm === "powered mobile equipment" || norm === "mobile equipment / traffic" || norm === "mobile equipment") {
      needles.push("Powered Mobile Equipment", "Mobile Equipment / Traffic", "Mobile Equipment", "Powered Industrial Trucks", "Powered Industrial Truck");
    }
    if (norm === "housekeeping" || norm === "walking/working surfaces" || norm === "walking-working surfaces" || norm === "walking working surfaces") {
      needles.push("Housekeeping", "Walking/Working Surfaces", "Walking-Working Surfaces", "Walking Working Surfaces");
    }
    if (norm === "scaffolds") {
      needles.push("Fall Protection", "Fall", "Walking/Working Surfaces", "Walking Working Surfaces", "Walking-Working Surfaces");
    }
    return needles;
  }

  const primaryFamilyHit =
    includesAny(classificationText, getSearchNeedles(scenario.primaryHazardFamily)) ||
    includesAny(resultText, getSearchNeedles(scenario.primaryHazardFamily));

  const expectedStandardHit =
    includesAny(standardText, getSearchNeedles(scenario.expectedStandardFamily)) ||
    includesAny(classificationText, getSearchNeedles(scenario.expectedStandardFamily)) ||
    includesAny(resultText, getSearchNeedles(scenario.expectedStandardFamily));

  const correctiveActionHit = includesAny(actionText, [
    scenario.expectedCorrectiveActionTheme,
    String(scenario.expectedCorrectiveActionTheme || "").replaceAll("_", " "),
  ]);

  let score = 0;
  if (primaryFamilyHit) score += 30;
  if (expectedStandardHit) score += 25;
  if (!unacceptableHits.length) score += 15;
  if (correctiveActionHit) score += 10;

  // Light context credit based on equipment/context showing up anywhere.
  if (
    scenario.equipmentContext &&
    includesAny(resultText, [
      scenario.equipmentContext,
      ...String(scenario.equipmentContext).split(/[_\s-]+/).filter(Boolean),
    ])
  ) {
    score += 10;
  }

  // Basic reasoning credit.
  if (result?.reasoning || result?.summary || result?.explanation || result?.reasoningTrace) {
    score += 10;
  }

  const passed = score >= 75 && unacceptableHits.length === 0;

  return {
    scenarioId: scenario.scenarioId,
    observation: scenario.observation,
    expectedPrimaryFamily: scenario.primaryHazardFamily,
    expectedStandardFamily: scenario.expectedStandardFamily,
    unacceptableStandardFamilies: scenario.unacceptableStandardFamilies || [],
    score,
    passed,
    primaryFamilyHit,
    expectedStandardHit,
    correctiveActionHit,
    unacceptableHits,
    topStandards: standards.slice(0, 5).map((standard) => ({
      citation: standard?.citation,
      title: standard?.title || standard?.heading || standard?.rationale,
      family:
        standard?.family ||
        standard?.category ||
        standard?.standardFamily ||
        standard?.scope ||
        standard?.agency,
      score: standard?.score,
    })),
    classification:
      result?.classification ||
      result?.hazardCategory ||
      result?.primaryHazard ||
      result?.primaryHazardFamily ||
      null,
  };
}

async function classifyScenario(scenario) {
  const response = await fetch(`${API_BASE_URL}/safescope-v2/classify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: [
        scenario.observation,
        scenario.agency ? `Agency: ${scenario.agency}` : "",
        scenario.industryContext ? `Industry context: ${scenario.industryContext}` : "",
        scenario.equipmentContext ? `Equipment context: ${scenario.equipmentContext}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    }),
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Non-JSON response: ${text.slice(0, 500)}`);
  }
}

async function main() {
  const raw = await fs.readFile(SCENARIO_FILE, "utf8");
  const scenarios = JSON.parse(raw).slice(0, LIMIT);

  const results = [];

  for (const scenario of scenarios) {
    process.stdout.write(`Running ${scenario.scenarioId}: ${scenario.observation}\n`);

    try {
      const result = await classifyScenario(scenario);
      results.push(scoreScenario(scenario, result));
    } catch (error) {
      results.push({
        scenarioId: scenario.scenarioId,
        observation: scenario.observation,
        passed: false,
        score: 0,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const passed = results.filter((result) => result.passed).length;
  const failed = results.length - passed;
  const averageScore =
    results.reduce((sum, result) => sum + Number(result.score || 0), 0) /
    Math.max(results.length, 1);

  const report = {
    generatedAt: new Date().toISOString(),
    apiBaseUrl: API_BASE_URL,
    scenarioFile: SCENARIO_FILE,
    total: results.length,
    passed,
    failed,
    averageScore: Math.round(averageScore * 10) / 10,
    results,
  };

  await fs.writeFile(
    "safescope-gauntlet.results.json",
    JSON.stringify(report, null, 2),
  );

  console.log("");
  console.log(`Total: ${report.total}`);
  console.log(`Passed: ${report.passed}`);
  console.log(`Failed: ${report.failed}`);
  console.log(`Average score: ${report.averageScore}`);
  console.log("Wrote safescope-gauntlet.results.json");

  const failures = results.filter((result) => !result.passed).slice(0, 10);
  if (failures.length) {
    console.log("");
    console.log("First failures:");
    for (const failure of failures) {
      console.log(
        `- ${failure.scenarioId}: score=${failure.score}; unacceptable=${(failure.unacceptableHits || []).join(", ") || "none"}; ${failure.observation}`,
      );
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
