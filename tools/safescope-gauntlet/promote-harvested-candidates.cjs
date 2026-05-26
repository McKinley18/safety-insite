const fs = require("fs");

const harvestedPath = "SAFE_SCOPE_HARVESTED_SOURCE_CANDIDATES.json";
const verifiedPath = "SAFE_SCOPE_VERIFIED_SOURCE_CANDIDATES.json";
const decisionsPath = "SAFE_SCOPE_HARVEST_PROMOTION_DECISIONS.json";
const previewPath = "SAFE_SCOPE_VERIFIED_SOURCE_CANDIDATES_PREVIEW.json";
const auditPath = "SAFE_SCOPE_HARVEST_PROMOTION_AUDIT.md";

function readJson(path, fallback) {
  if (!fs.existsSync(path)) return fallback;
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

const harvested = readJson(harvestedPath, []);
const verified = readJson(verifiedPath, []);
const decisions = readJson(decisionsPath, []);

if (!Array.isArray(harvested)) throw new Error(`${harvestedPath} must be an array.`);
if (!Array.isArray(verified)) throw new Error(`${verifiedPath} must be an array.`);
if (!Array.isArray(decisions)) throw new Error(`${decisionsPath} must be an array.`);

if (decisions.length === 0) {
  console.log("Review queue summary:");
  console.log("- Harvested candidates pending review:", harvested.length);
  console.log("- Verified candidates pool:", verified.length);
  process.exit(0);
}

function wordCount(value) {
  return String(value || "").trim().split(/\s+/).filter(Boolean).length;
}

function hasBadEvidence(value) {
  return /page not found|404|search results|accident search results/i.test(String(value || ""));
}

function highestVerifiedNumber(items) {
  let highest = 0;
  for (const item of items) {
    const match = String(item.candidateId || "").match(/^CAND-(\d+)$/);
    if (match) highest = Math.max(highest, Number(match[1]));
  }
  return highest;
}

const harvestedById = new Map(harvested.map((candidate) => [candidate.candidateId, candidate]));
const verifiedUrls = new Set(verified.map((candidate) => candidate.sourceUrl).filter(Boolean));

const promoted = [];
const rejected = [];
const ignored = [];
const warnings = [];

let nextNumber = highestVerifiedNumber(verified) + 1;

for (const decision of decisions) {
  const candidateId = decision.candidateId;
  const harvestedCandidate = harvestedById.get(candidateId);

  if (!harvestedCandidate) {
    ignored.push({ candidateId, reason: "Decision references unknown harvested candidateId." });
    continue;
  }

  if (decision.decision === "reject") {
    rejected.push({
      candidateId,
      sourceUrl: harvestedCandidate.sourceUrl,
      reason: decision.reviewerNotes || "Rejected by reviewer.",
    });
    continue;
  }

  if (decision.decision !== "approve") {
    ignored.push({ candidateId, reason: `Unsupported decision: ${decision.decision}` });
    continue;
  }

  const failures = [];

  if (!decision.reviewerNotes || wordCount(decision.reviewerNotes) < 8) {
    failures.push("Approve decision requires meaningful reviewerNotes.");
  }

  if (!decision.approvedHazardCategory) {
    failures.push("Approve decision requires approvedHazardCategory.");
  }

  if (!decision.approvedSourceTitle) {
    failures.push("Approve decision requires approvedSourceTitle.");
  }

  if (harvestedCandidate.httpStatus !== 200) {
    failures.push("Harvested candidate httpStatus is not 200.");
  }

  if (!harvestedCandidate.verificationEvidence || wordCount(harvestedCandidate.verificationEvidence) < 25) {
    failures.push("Harvested candidate verificationEvidence is missing or under 25 words.");
  }

  if (hasBadEvidence(harvestedCandidate.verificationEvidence)) {
    failures.push("Harvested candidate verificationEvidence contains rejected page/search/error text.");
  }

  if (verifiedUrls.has(harvestedCandidate.sourceUrl)) {
    failures.push("Duplicate sourceUrl already exists in verified candidate pool.");
  }

  if (failures.length) {
    rejected.push({
      candidateId,
      sourceUrl: harvestedCandidate.sourceUrl,
      reason: "Approval failed validation.",
      failures,
    });
    continue;
  }

  const newCandidateId = `CAND-${String(nextNumber).padStart(4, "0")}`;
  nextNumber += 1;

  promoted.push({
    candidateId: newCandidateId,
    sourceAgency: harvestedCandidate.sourceAgency,
    sourceAuthorityType: harvestedCandidate.sourceAuthorityType,
    citationAuthority: harvestedCandidate.citationAuthority,
    allowedUse: harvestedCandidate.allowedUse,
    sourceType: harvestedCandidate.sourceType,
    sourceTitle: decision.approvedSourceTitle,
    sourceUrl: harvestedCandidate.sourceUrl,
    finalUrl: harvestedCandidate.finalUrl || harvestedCandidate.sourceUrl,
    sourceDate: decision.approvedSourceDate || harvestedCandidate.sourceDate || "",
    hazardDescription: harvestedCandidate.hazardDescription || decision.reviewerNotes,
    hazardCategory: decision.approvedHazardCategory,
    secondaryHazardCategories: harvestedCandidate.secondaryHazardCategories || [],
    equipmentInvolved: harvestedCandidate.equipmentInvolved || "",
    rootCauseThemes: harvestedCandidate.rootCauseThemes || [],
    controlFailures: harvestedCandidate.controlFailures || [],
    recommendedControls: decision.approvedControls || harvestedCandidate.recommendedControls || [],
    citationHints: decision.approvedCitationHints || harvestedCandidate.citationHints || [],
    verificationStatus: "verified",
    httpStatus: harvestedCandidate.httpStatus,
    verificationEvidence: harvestedCandidate.verificationEvidence,
    matchingScenarioId: null,
    matchConfidence: null,
    reviewerNotes: decision.reviewerNotes,
    notes: `Promoted from ${candidateId} by explicit review decision. Preview only; verified pool not modified.`,
  });

  verifiedUrls.add(harvestedCandidate.sourceUrl);
}

const preview = [...verified, ...promoted];
fs.writeFileSync(previewPath, JSON.stringify(preview, null, 2) + "\n");

const audit = [
  "# SAFE_SCOPE_HARVEST_PROMOTION_AUDIT.md",
  "",
  `Harvested candidates: ${harvested.length}`,
  `Existing verified candidates: ${verified.length}`,
  `Promotion decisions: ${decisions.length}`,
  `Promoted to preview: ${promoted.length}`,
  `Rejected: ${rejected.length}`,
  `Ignored: ${ignored.length}`,
  "",
  "## Promoted",
  "",
  "```json",
  JSON.stringify(promoted.map((item) => ({
    candidateId: item.candidateId,
    sourceAgency: item.sourceAgency,
    sourceTitle: item.sourceTitle,
    sourceUrl: item.sourceUrl,
    hazardCategory: item.hazardCategory,
  })), null, 2),
  "```",
  "",
  "## Rejected",
  "",
  "```json",
  JSON.stringify(rejected, null, 2),
  "```",
  "",
  "## Ignored",
  "",
  "```json",
  JSON.stringify(ignored, null, 2),
  "```",
  "",
  "## Warnings",
  "",
  "```json",
  JSON.stringify(warnings, null, 2),
  "```",
  "",
  "## Safety Confirmation",
  "",
  "- SAFE_SCOPE_VERIFIED_SOURCE_CANDIDATES.json was not modified.",
  "- safescope-gauntlet.source.v1.json was not modified.",
  "- safescope-source-intelligence.v1.json was not modified.",
  "- Output is preview-only pending manual merge.",
  "",
].join("\n");

fs.writeFileSync(auditPath, audit);

console.log("Promotion preview complete.");
console.log("Harvested candidates:", harvested.length);
console.log("Existing verified candidates:", verified.length);
console.log("Promotion decisions:", decisions.length);
console.log("Promoted to preview:", promoted.length);
console.log("Rejected:", rejected.length);
console.log("Ignored:", ignored.length);
console.log("Preview file:", previewPath);
console.log("Audit file:", auditPath);
