import fs from "node:fs";
import path from "node:path";

const candidateHelperPaths = [
  path.resolve("frontend-next/lib/hazlenzStandardHelpers.ts"),
  path.resolve("lib/hazlenzStandardHelpers.ts"),
];

const candidateDisplayPaths = [
  path.resolve("frontend-next/lib/inspection/standardDisplay.ts"),
  path.resolve("lib/inspection/standardDisplay.ts"),
];

const helperPath = candidateHelperPaths.find((candidate) => fs.existsSync(candidate));
const displayPath = candidateDisplayPaths.find((candidate) => fs.existsSync(candidate));

if (!helperPath) {
  console.error("Could not find hazlenzStandardHelpers.ts from current working directory.");
  process.exit(1);
}

if (!displayPath) {
  console.error("Could not find inspection/standardDisplay.ts from current working directory.");
  process.exit(1);
}

const helper = fs.readFileSync(helperPath, "utf8");
const display = fs.readFileSync(displayPath, "utf8");
const combined = `${helper}\n${display}`;

const requiredPaths = [
  "result.primaryStandards",
  "result.suggestedStandards",
  "result.supportingStandards",
  "result.candidateStandards",
  "result.standards",
  "result.standardsTraceability?.suggestedCitations",
  "result.standardApplicability?.suggestedStandards",
  "result.standardApplicability?.needsMoreEvidenceStandards",
  "result.standardApplicability?.matchedRules",
  "result.applicabilityIntelligence?.primaryApplicableStandards",
  "result.needsMoreEvidenceStandards",
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

if (!combined.includes("looksLikeCitation")) {
  failures++;
  console.error("Missing looksLikeCitation guard.");
}

if (!combined.includes("isDisplayableStandardCandidate")) {
  failures++;
  console.error("Missing displayable-standard guard.");
}

const genericRejectionCues = [
  "candidate standard",
  "suggested candidate standard",
  "fallback candidate standard",
  "review candidate standard",
  "standard family",
  "no specific standard selected yet",
  "needs more evidence",
];

for (const cue of genericRejectionCues) {
  if (!combined.includes(cue)) {
    failures++;
    console.error(`Missing generic standard-label rejection cue: ${cue}`);
  }
}

if (failures) {
  process.exit(1);
}

console.log("✅ HazLenz frontend standard helper smoke passed");
