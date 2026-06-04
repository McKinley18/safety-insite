const fs = require("fs");

const scenarios = JSON.parse(fs.readFileSync("safescope-gauntlet.source.v1.json", "utf8"));
const intel = JSON.parse(fs.readFileSync("safescope-source-intelligence.v1.json", "utf8"));

const suspectRegex = /^Source Title \d+/i;
const genericTitles = ["MSHA Fatality", "MSHA Fatality Report", "OSHA Inspection", "Inspection: Construction"];
const genericUrls = ["https://www.osha.gov/fatalities", "https://www.msha.gov/data-and-reports/fatality-reports"];
const genericNotes = ["Derived from source", "Automatically reconciled"];

function isStrictEligible(s) {
    if (suspectRegex.test(s.sourceTitle) || genericTitles.includes(s.sourceTitle)) return false;
    if (genericUrls.includes(s.sourceUrl)) return false;
    if (genericNotes.includes(s.sourceGroundingNotes)) return false;
    return true;
}

const eligibleScenarios = scenarios.filter(isStrictEligible);
const ineligibleScenarios = scenarios.filter(s => !isStrictEligible(s));

const eligibleSourceIds = new Set(eligibleScenarios.map(s => s.sourceId));
const eligibleIntel = intel.filter(i => eligibleSourceIds.has(i.sourceId));
const ineligibleIntel = intel.filter(i => !eligibleSourceIds.has(i.sourceId));

let report = "# SAFE_SCOPE_STRICT_SOURCE_ELIGIBILITY_REPORT.md\n\n";
report += "- **Total scenarios:** " + scenarios.length + "\n";
report += "- **Strict eligible scenario count:** " + eligibleScenarios.length + "\n";
report += "- **Strict ineligible scenario count:** " + ineligibleScenarios.length + "\n";
report += "- **Strict eligible intel count:** " + eligibleIntel.length + "\n";
report += "- **Strict ineligible intel count:** " + ineligibleIntel.length + "\n\n";

report += "## Ineligible Scenarios\n";
ineligibleScenarios.forEach(s => report += "- " + s.scenarioId + ": " + s.sourceTitle + "\n");

fs.writeFileSync("SAFE_SCOPE_STRICT_SOURCE_ELIGIBILITY_REPORT.md", report);
fs.writeFileSync("SAFE_SCOPE_STRICT_SOURCE_ELIGIBLE_SCENARIOS.json", JSON.stringify(eligibleScenarios, null, 2));
fs.writeFileSync("SAFE_SCOPE_STRICT_SOURCE_ELIGIBLE_INTELLIGENCE.json", JSON.stringify(eligibleIntel, null, 2));

console.log("Eligible scenarios:", eligibleScenarios.length);
console.log("Ineligible scenarios:", ineligibleScenarios.length);
