const fs = require("fs");

const candidatesPath = "SAFE_SCOPE_VERIFIED_SOURCE_CANDIDATES.json";
const candidates = JSON.parse(fs.readFileSync(candidatesPath, "utf8"));

const preview = {
    source_documents: [],
    source_hazard_lessons: [],
    source_controls: [],
    source_citation_hints: [],
    source_gauntlet_links: []
};

const audit = {
    validCount: 0,
    invalidCount: 0,
    errors: [],
    duplicateIds: new Set(),
    duplicateUrls: new Set(),
    seenIds: new Set(),
    seenUrls: new Set()
};

candidates.forEach(c => {
    let invalid = false;
    
    // Integrity checks
    if (c.verificationStatus !== "verified") { audit.errors.push(c.candidateId + ": not verified"); invalid = true; }
    if (c.httpStatus !== 200) { audit.errors.push(c.candidateId + ": http status " + c.httpStatus); invalid = true; }
    if (!c.candidateId || !c.sourceAgency || !c.sourceTitle || !c.sourceUrl) { audit.errors.push(c.candidateId + ": missing fields"); invalid = true; }
    
    if (audit.seenIds.has(c.candidateId)) { audit.duplicateIds.add(c.candidateId); invalid = true; }
    audit.seenIds.add(c.candidateId);

    if (audit.seenUrls.has(c.sourceUrl)) { audit.duplicateUrls.add(c.sourceUrl); invalid = true; }
    audit.seenUrls.add(c.sourceUrl);

    if (invalid) {
        audit.invalidCount++;
        return;
    }

    audit.validCount++;
    const docId = "doc_" + c.candidateId;

    preview.source_documents.push({
        id: docId,
        candidateId: c.candidateId,
        sourceAgency: c.sourceAgency,
        sourceAuthorityType: c.sourceAuthorityType,
        citationAuthority: c.citationAuthority,
        allowedUse: c.allowedUse,
        sourceType: c.sourceType,
        sourceTitle: c.sourceTitle,
        sourceUrl: c.sourceUrl,
        finalUrl: c.sourceUrl,
        sourceDate: c.sourceDate,
        verificationStatus: c.verificationStatus,
        httpStatus: c.httpStatus,
        verificationEvidence: c.verificationEvidence,
        reviewerNotes: c.notes,
        importStatus: "preview",
        createdAtPreview: new Date().toISOString()
    });

    preview.source_hazard_lessons.push({
        id: "lesson_" + c.candidateId,
        sourceDocumentId: docId,
        hazardCategory: c.hazardCategory,
        hazardDescription: c.hazardDescription,
        secondaryHazardCategories: c.secondaryHazardCategories || [],
        equipmentInvolved: c.equipmentInvolved,
        rootCauseThemes: c.rootCauseThemes || [],
        controlFailures: c.controlFailures || [],
        severityNotes: c.fatalityOrSeverity || "",
        createdAtPreview: new Date().toISOString()
    });

    if (c.recommendedControls) {
        c.recommendedControls.forEach((ct, idx) => {
            preview.source_controls.push({
                id: `control_${c.candidateId}_${idx}`,
                sourceDocumentId: docId,
                controlText: ct,
                controlType: "recommended",
                linkedHazardCategory: c.hazardCategory,
                confidence: "reviewed",
                createdAtPreview: new Date().toISOString()
            });
        });
    }

    if (c.citationHints) {
        c.citationHints.forEach((ct, idx) => {
            const agency = ct.startsWith("30 CFR") ? "MSHA" : (ct.match(/1910|1926/) ? "OSHA" : c.sourceAgency);
            preview.source_citation_hints.push({
                id: `citation_${c.candidateId}_${idx}`,
                sourceDocumentId: docId,
                agency: agency,
                citation: ct,
                authorityType: c.citationAuthority,
                notes: "N/A",
                createdAtPreview: new Date().toISOString()
            });
        });
    }

    if (c.matchingScenarioId) {
        preview.source_gauntlet_links.push({
            id: `gauntlet_${c.candidateId}_0`,
            sourceDocumentId: docId,
            scenarioId: c.matchingScenarioId,
            sourceId: c.candidateId,
            createdAtPreview: new Date().toISOString()
        });
    }
});

fs.writeFileSync("SAFE_SCOPE_SOURCE_INTELLIGENCE_INGESTION_PREVIEW.json", JSON.stringify(preview, null, 2));

let auditReport = "# SAFE_SCOPE_SOURCE_INTELLIGENCE_INGESTION_AUDIT.md\n\n";
auditReport += "- Total candidates: " + candidates.length + "\n";
auditReport += "- Valid candidates: " + audit.validCount + "\n";
auditReport += "- Invalid candidates: " + audit.invalidCount + "\n";
auditReport += "- Duplicate IDs: " + audit.duplicateIds.size + "\n";
auditReport += "- Duplicate URLs: " + audit.duplicateUrls.size + "\n";
auditReport += "- Errors: " + JSON.stringify(audit.errors, null, 2) + "\n";
fs.writeFileSync("SAFE_SCOPE_SOURCE_INTELLIGENCE_INGESTION_AUDIT.md", auditReport);

console.log("Audit complete. Valid candidates:", audit.validCount);
if (audit.invalidCount > 0) process.exit(1);
