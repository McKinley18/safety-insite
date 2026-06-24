import fs from "node:fs";
import path from "node:path";

const candidatePaths = [
  path.resolve("frontend-next/lib/hazlenzStandardHelpers.ts"),
  path.resolve("lib/hazlenzStandardHelpers.ts"),
];

const helperPath = candidatePaths.find((candidate) => fs.existsSync(candidate));
if (!helperPath) {
  console.error("Could not find hazlenzStandardHelpers.ts from current working directory.");
  process.exit(1);
}

const helper = fs.readFileSync(helperPath, "utf8");

const requiredPaths = [
  "result.suggestedStandards",
  "result.primaryStandards",
  "result.supportingStandards",
  "result.candidateStandards",
  "result.standards",
  "result.standardsTraceability?.suggestedCitations",
  "result.standardApplicability?.suggestedStandards",
  "result.standardApplicability?.matchedRules",
  "result.applicabilityIntelligence?.primaryApplicableStandards",
  "result.standardsReasoning?.topDefensible",
  "result.inspectionIntelligence?.candidateStandards",
  "result.standardsMatchExplanations",
  "result.generatedActions",
  "result.baseGeneratedActions",
];

let failures = 0;

for (const required of requiredPaths) {
  if (!helper.includes(required)) {
    failures++;
    console.error(`Missing helper extraction path: ${required}`);
  }
}

if (!helper.includes("looksLikeCitation")) {
  failures++;
  console.error("Missing looksLikeCitation guard.");
}

if (failures) {
  process.exit(1);
}

console.log("✅ HazLenz frontend standard helper smoke passed");
