
const fs = require("fs");
const scenarios = JSON.parse(fs.readFileSync("safescope-gauntlet.source.v1.json", "utf8"));
const intel = JSON.parse(fs.readFileSync("safescope-source-intelligence.v1.json", "utf8"));

let structuralCriticalFailures = 0;
let sourceQualityWarnings = 0;
let sourceQualityCriticalFailures = 0;

// 1. Structural Checks
if (scenarios.length !== 150) { structuralCriticalFailures++; }
const ids = scenarios.map(s => s.scenarioId);
if (ids.length !== new Set(ids).size) { structuralCriticalFailures++; }

// 2. Quality Checks
const suspectRegex = /^Source Title \d+/i;
const genericTitles = ["MSHA Fatality", "MSHA Fatality Report", "OSHA Inspection", "Inspection: Construction"];
const genericUrls = ["https://www.osha.gov/fatalities", "https://www.msha.gov/data-and-reports/fatality-reports"];
const genericNotes = ["Derived from source", "Automatically reconciled"];

scenarios.forEach(s => {
    let suspect = false;
    if (suspectRegex.test(s.sourceTitle) || genericTitles.includes(s.sourceTitle)) { suspect = true; }
    if (genericUrls.includes(s.sourceUrl)) { suspect = true; }
    if (genericNotes.includes(s.sourceGroundingNotes)) { suspect = true; }

    if (suspect) {
        sourceQualityWarnings++;
        sourceQualityCriticalFailures++;
        console.log("Strict failure:", s.scenarioId, s.sourceTitle);
    }
});

console.log("Structural critical failures:", structuralCriticalFailures);
console.log("Source quality warnings:", sourceQualityWarnings);
console.log("Source quality critical failures:", sourceQualityCriticalFailures);

const strict = process.env.STRICT_SOURCE_QUALITY === "1";

if (strict) {
    if (structuralCriticalFailures > 0 || sourceQualityCriticalFailures > 0) {
        console.log("FAIL: Strict source quality audit failed.");
        process.exit(1);
    }
    console.log("PASS: Strict source quality audit passed.");
} else {
    if (sourceQualityWarnings > 0) console.log("Note: Source quality warnings do not fail default mode.");
    if (structuralCriticalFailures > 0) {
        console.log("FAIL: Dataset structural integrity check failed.");
        process.exit(1);
    }
    console.log("PASS: Dataset structural integrity verified.");
}
