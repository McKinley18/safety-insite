import { sanitizeHazLenzDisplayOutput } from "../display/hazlenz-display-sanitizer";

function ensureVisiblePrimaryCitationContract(response: any, observationText = ""): any {
  if (!response || typeof response !== "object") return response;

  const primaryCitation = String(response.primaryCitation || "").trim();
  const hasVisibleStandards =
    (Array.isArray(response.suggestedStandards) && response.suggestedStandards.length > 0) ||
    (Array.isArray(response.primaryStandards) && response.primaryStandards.length > 0) ||
    (Array.isArray(response.standards) && response.standards.length > 0) ||
    (Array.isArray(response.standardsTraceability?.suggestedCitations) &&
      response.standardsTraceability.suggestedCitations.length > 0);

  const isBareOshaCitation =
    /^(?:29\s*CFR\s*)?(?:1910|1926)\.\d+(?:\([a-z0-9]+\))*$/i.test(primaryCitation);

  const isBareMshaCitation =
    /^(?:30\s*CFR\s*)?(?:56|57|75|77)\.\d+(?:\([a-z0-9]+\))*$/i.test(primaryCitation);

  const hasConcreteDefectOrExposureEvidence =
    /\b(damaged|broken|cracked|loose|uneven|missing|worn|deteriorated|defective|defect|trip hazard|tripping hazard|slip hazard|fall hazard|unguarded|exposed|blocked|obstructed|leaking|spill|spilled|frayed|cut|inoperative|not working)\b/i.test(observationText);

  const isRealCitation =
    primaryCitation &&
    !/^(review|needs more evidence|candidate standard|suggested candidate standard|fallback candidate standard|unclassified|unknown)$/i.test(primaryCitation) &&
    (isBareOshaCitation || isBareMshaCitation);

  if (!hasVisibleStandards && isRealCitation && hasConcreteDefectOrExposureEvidence) {
    const recoveredStandard = {
      citation: primaryCitation,
      title: primaryCitation,
      summary:
        "Candidate standard recovered at the API boundary because primaryCitation existed but visible standards arrays were empty.",
      status: "candidate_standard",
      candidateStatus: "candidate_standard",
      source: ["controller_primary_citation_contract_repair"],
      matchingReasons: [
        "The service returned a primaryCitation, but the visible standards contract was empty before API serialization.",
      ],
    };

    response.suggestedStandards = [recoveredStandard];

    response.standardsTraceability = {
      ...(response.standardsTraceability || {}),
      suggestedCitations: Array.isArray(response.standardsTraceability?.suggestedCitations)
        ? response.standardsTraceability.suggestedCitations
        : [],
    };

    if (!response.standardsTraceability.suggestedCitations.includes(primaryCitation)) {
      response.standardsTraceability.suggestedCitations.push(primaryCitation);
    }
  }

  return response;
}

function citations(arr: any[]): string[] {
  return (Array.isArray(arr) ? arr : [])
    .map((s) => (typeof s === "string" ? s : s?.citation))
    .filter(Boolean);
}

const positiveSanitized = sanitizeHazLenzDisplayOutput({
  classification: "Walking/Working Surfaces",
  primaryCitation: "1910.22(a)",
  suggestedStandards: [],
  primaryStandards: [],
  standards: [],
  standardsTraceability: {
    suggestedCitations: [],
  },
});

const positiveRepaired = ensureVisiblePrimaryCitationContract(
  positiveSanitized,
  "A damaged stair tread and uneven riser create a trip hazard on the access stairs.",
);

const positiveSuggested = citations(positiveRepaired.suggestedStandards);

if (!positiveSuggested.includes("1910.22(a)")) {
  console.error("FAIL: concrete defect primaryCitation was not represented in suggestedStandards");
  process.exit(1);
}

if (!positiveRepaired.standardsTraceability?.suggestedCitations?.includes("1910.22(a)")) {
  console.error("FAIL: concrete defect primaryCitation was not represented in standardsTraceability.suggestedCitations");
  process.exit(1);
}

const negativeSanitized = sanitizeHazLenzDisplayOutput({
  classification: "Fall Protection",
  primaryCitation: "29 CFR 1926.501",
  suggestedStandards: [],
  primaryStandards: [],
  standards: [],
  standardsTraceability: {
    suggestedCitations: [],
  },
});

const negativeRepaired = ensureVisiblePrimaryCitationContract(
  negativeSanitized,
  "Employee walked up the access stairs to reach the platform.",
);

const negativeSuggested = citations(negativeRepaired.suggestedStandards);

if (negativeSuggested.length > 0) {
  console.error("FAIL: generic non-defect observation should not receive repaired suggestedStandards");
  process.exit(1);
}

if ((negativeRepaired.standardsTraceability?.suggestedCitations || []).length > 0) {
  console.error("FAIL: generic non-defect observation should not receive repaired traceability citations");
  process.exit(1);
}

console.log("PASS: primaryCitation repair is visible for concrete defects and gated for generic observations");
