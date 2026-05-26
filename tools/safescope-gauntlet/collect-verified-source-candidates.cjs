const fs = require("fs");

const filePath = "SAFE_SCOPE_VERIFIED_SOURCE_CANDIDATES.json";
if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
}

const candidates = JSON.parse(fs.readFileSync(filePath, "utf8"));
const rejectionReasons = {
    httpStatus: 0,
    missingEvidence: 0,
    shortEvidence: 0,
    invalidEvidenceContent: 0,
    genericOSHA: 0,
    genericNotes: 0
};

let structuralFailures = 0;
let invalidCount = 0;

candidates.forEach(c => {
    let invalid = false;
    // 1. Status Code
    if (c.httpStatus !== 200) { rejectionReasons.httpStatus++; invalid = true; }
    // 2. Evidence fields
    if (!c.verificationEvidence) { rejectionReasons.missingEvidence++; invalid = true; }
    else {
        if (c.verificationEvidence.split(" ").length < 25) { rejectionReasons.shortEvidence++; invalid = true; }
        const badWords = ["Page Not Found", "404", "Search Results", "Accident Search Results", "category page", "landing page"];
        if (badWords.some(bw => c.verificationEvidence.includes(bw))) { rejectionReasons.invalidEvidenceContent++; invalid = true; }
    }
    // 3. OSHA Check
    if (c.sourceUrl.includes("accidentsearch.search") && !/(employer|inspection|accident|fatality|hospitalization|amputation|injured|killed)/i.test(c.verificationEvidence)) {
        rejectionReasons.genericOSHA++; invalid = true;
    }
    // 4. Notes check
    const genericNotes = ["verified official source", "specific report", "source-specific page", "official report page"];
    if (genericNotes.includes(c.notes)) { rejectionReasons.genericNotes++; invalid = true; }

    if (invalid) invalidCount++;
});

console.log("Candidate count:", candidates.length);
console.log("Valid candidates:", candidates.length - invalidCount);
console.log("Invalid candidates:", invalidCount);
console.log("Rejection reasons:", rejectionReasons);

let auditReport = "# SAFE_SCOPE_VERIFIED_SOURCE_CANDIDATES_AUDIT.md\n\n";
auditReport += "- Total candidates: " + candidates.length + "\n";
auditReport += "- Valid: " + (candidates.length - invalidCount) + "\n";
auditReport += "- Invalid: " + invalidCount + "\n";
auditReport += "- Rejection breakdown: " + JSON.stringify(rejectionReasons, null, 2) + "\n";

fs.writeFileSync("SAFE_SCOPE_VERIFIED_SOURCE_CANDIDATES_AUDIT.md", auditReport);
