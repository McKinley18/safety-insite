const fs = require("fs");

const filePath = "SAFE_SCOPE_VERIFIED_SOURCE_CANDIDATES.json";
if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
}

const candidates = JSON.parse(fs.readFileSync(filePath, "utf8"));
const allowedAgencies = ["OSHA", "MSHA", "NIOSH", "CSB", "NSC", "BLS"];

let structuralFailures = 0;

candidates.forEach(c => {
    if (!c.candidateId || !c.sourceAgency || !c.sourceUrl) {
        console.error("Missing required field:", c.candidateId);
        structuralFailures++;
    }
    if (!allowedAgencies.includes(c.sourceAgency)) {
        console.error("Invalid agency:", c.candidateId, c.sourceAgency);
        structuralFailures++;
    }
    if (c.sourceUrl.endsWith("/fatalities") || c.sourceUrl.endsWith("/fatality-reports")) {
        console.error("Generic landing page URL:", c.candidateId, c.sourceUrl);
        structuralFailures++;
    }
});

let auditReport = "# SAFE_SCOPE_VERIFIED_SOURCE_CANDIDATES_AUDIT.md\n\n";
auditReport += "- Total candidates: " + candidates.length + "\n";
auditReport += "- Structural critical failures: " + structuralFailures + "\n";
auditReport += "- Status: " + (structuralFailures === 0 ? "PASS" : "FAIL") + "\n\n";
auditReport += "To add candidates, edit SAFE_SCOPE_VERIFIED_SOURCE_CANDIDATES.json and run this script again.\n";

fs.writeFileSync("SAFE_SCOPE_VERIFIED_SOURCE_CANDIDATES_AUDIT.md", auditReport);

console.log("Audit complete.");
if (structuralFailures > 0) process.exit(1);
