export {};

import { writeFileSync, mkdirSync } from "fs";
import * as path from "path";

type Stage = "final" | "provisional";
type CaseKind =
  | "clear-positive"
  | "safe-controlled-negative"
  | "ambiguous"
  | "jurisdiction-trap"
  | "competing-standard"
  | "false-friend"
  | "multi-hazard"
  | "poor-language";

type AuditCase = {
  id: string;
  kind: CaseKind;
  family: string;
  observation: string;
  scopes?: string[];
  structuredObservation?: any;
  priorStructuredObservation?: any;
  clarificationAnswers?: any[];
  expectedJurisdiction: "msha" | "osha_general_industry" | "osha_construction" | "unknown";
  expectedHazard: RegExp;
  expectedStage?: Stage;
  requiredPrimary?: RegExp[];
  acceptableSupporting?: RegExp[];
  forbiddenActive?: RegExp[];
  requiredQuestions?: RegExp[];
  forbiddenQuestions?: RegExp[];
  requiredMitigationConcepts?: RegExp[];
  forbiddenMitigationConcepts?: RegExp[];
  sourceReference: string;
  applicabilityBasis: string;
};

type CaseResult = {
  id: string;
  kind: CaseKind;
  family: string;
  status: "pass" | "qualified-pass" | "needs-review" | "critical-fail";
  criticalFailures: string[];
  warnings: string[];
  activeCitations: string[];
  primaryCitation: string;
  questions: string[];
  mitigationText: string;
  resultStage: string;
  classification: string;
  confidence: unknown;
};

const apiBaseUrl = process.env.HAZLENZ_API_URL || process.env.API_BASE_URL || "http://localhost:4000";
const reportDir = process.env.HAZLENZ_INDEPENDENT_AUDIT_REPORT_DIR || "/private/tmp/hazlenz-independent-standards-audit";

const authoritativeSources = {
  "1910.147": "OSHA 29 CFR 1910.147(a)(1)-(a)(2), control of hazardous energy during servicing/maintenance.",
  "1910.212": "OSHA 29 CFR 1910.212(a)(1), machine guarding for point of operation, nip points, rotating parts, flying chips/sparks.",
  "1910.22": "OSHA 29 CFR 1910.22(a), walking-working surfaces kept clean, orderly, sanitary, and free of hazards.",
  "1910.23": "OSHA 29 CFR 1910.23(b), ladder condition and use requirements.",
  "1910.28": "OSHA 29 CFR 1910.28(b), duty to have fall protection for general-industry elevated exposures.",
  "1910.305": "OSHA 29 CFR 1910.305(g), flexible cords and cable condition/use requirements.",
  "1910.1200": "OSHA 29 CFR 1910.1200(f), workplace container labeling and hazard communication.",
  "1910.146": "OSHA 29 CFR 1910.146, permit-required confined spaces.",
  "1926.501": "OSHA 29 CFR 1926.501(b)(1), construction unprotected side/edge at 6 feet or more.",
  "1926.1053": "OSHA 29 CFR 1926.1053(b), construction ladder use/defect requirements.",
  "1926.651-652": "OSHA 29 CFR 1926.651 and 1926.652, excavation access, exposure, and protective systems.",
  "56.14107": "MSHA 30 CFR 56.14107(a), guarding of moving machine parts.",
  "56.12016": "MSHA 30 CFR 56.12016, locking/tagging electrically powered equipment before mechanical work.",
  "56.14132": "MSHA 30 CFR 56.14132(a), maintaining audible warning devices on self-propelled mobile equipment.",
  "56.9300": "MSHA 30 CFR 56.9300, berms or guardrails on roadways with overturn/endangerment drop-offs.",
  "56.11001": "MSHA 30 CFR 56.11001, safe access.",
  "56.11012": "MSHA 30 CFR 56.11012, protection for openings above, below, or near travelways.",
};

const cases: AuditCase[] = [
  {
    id: "msha-conveyor-jam-energized",
    kind: "clear-positive",
    family: "MSHA machine guarding and hazardous energy",
    observation: "A miner is clearing a jammed conveyor while the belt is energized and the tail pulley guard has been removed.",
    scopes: ["msha"],
    expectedJurisdiction: "msha",
    expectedHazard: /guard|lockout|stored energy|machine/i,
    expectedStage: "final",
    requiredPrimary: [/56\.14107/i, /56\.12016/i],
    forbiddenActive: [/1910\./i, /1926\./i],
    requiredMitigationConcepts: [/stop|restrict/i, /lock|tag|isolate|de-energ/i, /zero[- ]energy|verify/i, /guard/i],
    forbiddenMitigationConcepts: [/damaged cords?|qualified electrical person|chemical|label/i],
    sourceReference: `${authoritativeSources["56.14107"]} ${authoritativeSources["56.12016"]}`,
    applicabilityBasis: "Mine context, moving conveyor parts, removed guard, jam-clearing/mechanical work, and energized state satisfy both guarding and energy-isolation predicates.",
  },
  {
    id: "msha-conveyor-locked-out",
    kind: "safe-controlled-negative",
    family: "MSHA hazardous energy controlled state",
    observation: "A miner is clearing a conveyor jam after the conveyor was locked out, zero-energy verified, and access was restricted.",
    scopes: ["msha"],
    structuredObservation: {
      narrative: "A miner is clearing a conveyor jam.",
      jurisdiction: "msha",
      workEnvironment: "mine processing plant",
      taskBeingPerformed: "clearing a jam",
      equipmentInvolved: ["conveyor"],
      energyState: "locked-out",
      controlsPresent: ["lockout/tagout applied", "zero-energy verified", "restricted access"],
      workerInteraction: "No unexpected startup exposure was observed.",
    },
    expectedJurisdiction: "msha",
    expectedHazard: /lockout|stored energy|controlled/i,
    expectedStage: "final",
    forbiddenActive: [/56\.12016/i, /1910\.147/i],
    requiredMitigationConcepts: [/verify|zero[- ]energy|isolation/i],
    forbiddenMitigationConcepts: [/emergency|damaged cords?|chemical/i],
    sourceReference: authoritativeSources["56.12016"],
    applicabilityBasis: "The same task terms are present, but verified lockout and no unexpected-startup exposure suppress active violation promotion.",
  },
  {
    id: "osha-gi-operating-unguarded-shaft",
    kind: "clear-positive",
    family: "OSHA GI machine guarding",
    observation: "Operator reaches near an exposed rotating shaft because the machine guard is missing while the production line is running.",
    scopes: ["osha_general_industry"],
    expectedJurisdiction: "osha_general_industry",
    expectedHazard: /machine|guard|caught/i,
    expectedStage: "provisional",
    requiredPrimary: [/1910\.212/i],
    forbiddenActive: [/1926\./i, /30 CFR/i],
    requiredMitigationConcepts: [/stop|restrict/i, /guard/i, /moving|rotating|nip|shaft/i],
    sourceReference: authoritativeSources["1910.212"],
    applicabilityBasis: "General-industry machine, exposed rotating shaft, missing guard, operation, and operator exposure satisfy machine-guarding predicates.",
  },
  {
    id: "osha-gi-guard-removed-isolated",
    kind: "safe-controlled-negative",
    family: "OSHA GI guarding controlled maintenance",
    observation: "Machine guard was removed for maintenance while the machine is locked out, zero energy verified, and the area is restricted.",
    scopes: ["osha_general_industry"],
    expectedJurisdiction: "osha_general_industry",
    expectedHazard: /lockout|maintenance|controlled/i,
    expectedStage: "provisional",
    forbiddenActive: [/1910\.212/i, /1910\.147/i],
    requiredMitigationConcepts: [/verify|zero[- ]energy|isolation|maintenance/i],
    sourceReference: `${authoritativeSources["1910.147"]} ${authoritativeSources["1910.212"]}`,
    applicabilityBasis: "Guard-removal words are disqualified by verified isolation and restricted access; only verification items remain.",
  },
  {
    id: "osha-gi-damaged-cord-wet-exposed",
    kind: "clear-positive",
    family: "OSHA GI electrical flexible cord",
    observation: "Employee is using an extension cord with exposed copper conductors in a wet washdown area.",
    scopes: ["osha_general_industry"],
    expectedJurisdiction: "osha_general_industry",
    expectedHazard: /electrical|shock/i,
    expectedStage: "provisional",
    requiredPrimary: [/1910\.305|1910\.303|1910\.334/i],
    forbiddenActive: [/1910\.147/i, /1910\.1200/i, /30 CFR/i],
    requiredMitigationConcepts: [/remove|service|replace|repair/i, /restrict|stop/i, /qualified|inspect|verify/i],
    sourceReference: authoritativeSources["1910.305"],
    applicabilityBasis: "In-use flexible cord, damaged insulation/exposed conductors, wet location, and employee exposure support electrical hazard and cord/wiring standards.",
  },
  {
    id: "osha-gi-discarded-damaged-cord",
    kind: "safe-controlled-negative",
    family: "OSHA GI electrical controlled discarded cord",
    observation: "Damaged extension cord is unplugged, tagged out of service, and locked in a disposal bin where employees cannot use it.",
    scopes: ["osha_general_industry"],
    expectedJurisdiction: "osha_general_industry",
    expectedHazard: /electrical|controlled|review/i,
    expectedStage: "provisional",
    forbiddenActive: [/1910\.305/i, /1910\.303/i, /1910\.334/i],
    requiredQuestions: [/conductors|jacket|where did this occur/i],
    sourceReference: authoritativeSources["1910.305"],
    applicabilityBasis: "The cord is damaged, but unplugged, tagged, inaccessible, and locked for disposal; active employee electrical exposure is not established.",
  },
  {
    id: "construction-edge-eight-feet",
    kind: "clear-positive",
    family: "OSHA Construction fall protection",
    observation: "Construction worker is framing beside an unprotected floor edge eight feet above the lower level without guardrails or fall arrest.",
    scopes: ["osha_construction"],
    expectedJurisdiction: "osha_construction",
    expectedHazard: /fall/i,
    expectedStage: "provisional",
    requiredPrimary: [/1926\.501/i],
    forbiddenActive: [/1910\.22/i, /30 CFR/i],
    forbiddenQuestions: [/height|fall distance/i],
    requiredMitigationConcepts: [/guardrail|fall arrest|fall protection/i, /restrict|before work resumes/i],
    sourceReference: authoritativeSources["1926.501"],
    applicabilityBasis: "Construction, unprotected edge, lower level, and eight-foot height satisfy 1926 Subpart M edge protection predicates.",
  },
  {
    id: "osha-gi-same-level-trip",
    kind: "competing-standard",
    family: "OSHA GI walking-working surfaces",
    observation: "Employee could trip over a loose hose across the same-level aisle.",
    scopes: ["osha_general_industry"],
    expectedJurisdiction: "osha_general_industry",
    expectedHazard: /walking|surface|trip/i,
    expectedStage: "provisional",
    requiredPrimary: [/1910\.22/i],
    forbiddenActive: [/1910\.28/i, /1926\.501/i],
    requiredMitigationConcepts: [/remove|reroute|clear/i, /aisle|walk|route/i],
    sourceReference: authoritativeSources["1910.22"],
    applicabilityBasis: "Same-level aisle obstruction is a walking-working surface/trip issue, not an elevated-fall case.",
  },
  {
    id: "osha-gi-unlabeled-secondary-solvent",
    kind: "clear-positive",
    family: "OSHA GI HazCom label",
    observation: "Unlabeled spray bottle of solvent is used by multiple employees at the parts washer.",
    scopes: ["osha_general_industry"],
    expectedJurisdiction: "osha_general_industry",
    expectedHazard: /hazard communication|chemical/i,
    expectedStage: "provisional",
    requiredPrimary: [/1910\.1200/i],
    forbiddenActive: [/1910\.147/i, /1910\.22/i],
    requiredMitigationConcepts: [/label|identify|sds/i],
    sourceReference: authoritativeSources["1910.1200"],
    applicabilityBasis: "Unlabeled workplace secondary container in shared use supports workplace labeling and HazCom controls.",
  },
  {
    id: "osha-gi-immediate-use-cup",
    kind: "false-friend",
    family: "OSHA GI HazCom immediate-use exception",
    observation: "Worker poured solvent into a small unlabeled cup for immediate use during the same shift and kept control of it.",
    scopes: ["osha_general_industry"],
    expectedJurisdiction: "osha_general_industry",
    expectedHazard: /chemical|hazard communication|review/i,
    expectedStage: "provisional",
    forbiddenActive: [/1910\.1200/i],
    requiredQuestions: [/substance|label|exposure/i],
    sourceReference: authoritativeSources["1910.1200"],
    applicabilityBasis: "Immediate-use, under-control transfer language suppresses a final workplace-container labeling violation absent contrary facts.",
  },
  {
    id: "msha-backup-alarm-reversing",
    kind: "clear-positive",
    family: "MSHA mobile equipment audible warning",
    observation: "At a quarry, a loader is backing through a blind area with a broken backup alarm while miners are on foot nearby.",
    scopes: ["msha"],
    expectedJurisdiction: "msha",
    expectedHazard: /mobile|traffic|struck/i,
    expectedStage: "final",
    requiredPrimary: [/56\.14132|56\.9100/i],
    forbiddenActive: [/1910\.178/i, /1926\./i],
    requiredMitigationConcepts: [/stop|remove|restrict/i, /backup alarm|audible|spotter|separate/i],
    sourceReference: authoritativeSources["56.14132"],
    applicabilityBasis: "Mine, self-propelled mobile equipment, backing/blind-area operation, broken alarm, and miner exposure satisfy audible-warning/traffic-control predicates.",
  },
  {
    id: "msha-backup-alarm-parked-out",
    kind: "safe-controlled-negative",
    family: "MSHA mobile equipment controlled state",
    observation: "At a quarry, the loader backup alarm is broken but the loader is parked out of service with the key removed and no reverse operation.",
    scopes: ["msha"],
    expectedJurisdiction: "msha",
    expectedHazard: /mobile|equipment|controlled/i,
    expectedStage: "final",
    forbiddenActive: [/56\.14132/i, /56\.9100/i],
    requiredMitigationConcepts: [/repair|verify|return to service|out of service/i],
    sourceReference: authoritativeSources["56.14132"],
    applicabilityBasis: "A defect exists, but out-of-service/key-removed/no-reverse facts suppress active traffic exposure; repair verification remains appropriate.",
  },
  {
    id: "tank-entry-vague",
    kind: "ambiguous",
    family: "Confined space ambiguity",
    observation: "Worker went into the tank.",
    scopes: ["osha_general_industry"],
    expectedJurisdiction: "osha_general_industry",
    expectedHazard: /confined|space|tank/i,
    expectedStage: "provisional",
    forbiddenActive: [/1910\.146/i],
    requiredQuestions: [/tank|atmosphere|entry|exposed|condition|where/i],
    sourceReference: authoritativeSources["1910.146"],
    applicabilityBasis: "Tank entry suggests possible confined-space exposure, but permit-space predicates require more facts before exact citation promotion.",
  },
  {
    id: "permit-space-entry-positive",
    kind: "clear-positive",
    family: "Permit-required confined space",
    observation: "Employee entered a permit-required process tank with possible toxic atmosphere, no attendant, and no pre-entry atmospheric test.",
    scopes: ["osha_general_industry"],
    expectedJurisdiction: "osha_general_industry",
    expectedHazard: /confined|space/i,
    expectedStage: "provisional",
    requiredPrimary: [/1910\.146/i],
    forbiddenActive: [/1910\.305/i],
    requiredMitigationConcepts: [/stop|suspend|entry/i, /atmospheric|test/i, /attendant|rescue|permit/i],
    sourceReference: authoritativeSources["1910.146"],
    applicabilityBasis: "Entry, permit-space wording, atmospheric hazard, missing attendant, and missing testing satisfy permit-space control predicates.",
  },
  {
    id: "trench-deep-no-protection",
    kind: "clear-positive",
    family: "Construction excavation protection",
    observation: "Construction employee is working in a six-foot trench with vertical walls and no shoring, shielding, or sloping.",
    scopes: ["osha_construction"],
    expectedJurisdiction: "osha_construction",
    expectedHazard: /trench|excavation|cave/i,
    expectedStage: "provisional",
    requiredPrimary: [/1926\.652|1926\.651/i],
    forbiddenActive: [/1910\.22/i, /30 CFR/i],
    requiredMitigationConcepts: [/keep workers out|remove employees|restrict/i, /shoring|shielding|sloping|benching/i],
    sourceReference: authoritativeSources["1926.651-652"],
    applicabilityBasis: "Construction, employee entry, six-foot trench, vertical walls, and no protective system support excavation protective-system requirements.",
  },
  {
    id: "trench-shallow-no-entry",
    kind: "safe-controlled-negative",
    family: "Construction excavation negative mutation",
    observation: "A three-foot landscaping excavation is barricaded, no employee entry is occurring, and no cave-in indicators were observed.",
    scopes: ["osha_construction"],
    expectedJurisdiction: "osha_construction",
    expectedHazard: /excavation|review|controlled/i,
    expectedStage: "provisional",
    forbiddenActive: [/1926\.652/i],
    sourceReference: authoritativeSources["1926.651-652"],
    applicabilityBasis: "Depth, no entry, and barricade facts suppress protective-system citation; access/inspection questions may remain.",
  },
  {
    id: "ladder-bad-vague",
    kind: "ambiguous",
    family: "Ladder ambiguity",
    observation: "Ladder is bad.",
    scopes: ["osha_general_industry"],
    expectedJurisdiction: "osha_general_industry",
    expectedHazard: /ladder|fall/i,
    expectedStage: "provisional",
    forbiddenActive: [/1910\.23/i, /1926\.1053/i],
    requiredQuestions: [/ladder|defective|incorrect|height|use/i],
    sourceReference: `${authoritativeSources["1910.23"]} ${authoritativeSources["1926.1053"]}`,
    applicabilityBasis: "A vague ladder adjective does not identify defect, misuse, height, use, or jurisdiction predicates.",
  },
  {
    id: "construction-damaged-ladder",
    kind: "clear-positive",
    family: "Construction ladder defect",
    observation: "On a construction site, employees are using a portable ladder with a cracked side rail and loose rung.",
    scopes: ["osha_construction"],
    expectedJurisdiction: "osha_construction",
    expectedHazard: /ladder|fall/i,
    expectedStage: "provisional",
    requiredPrimary: [/1926\.1053/i],
    forbiddenActive: [/1910\.23/i, /30 CFR/i],
    requiredMitigationConcepts: [/remove|tag|service|replace/i, /ladder/i],
    sourceReference: authoritativeSources["1926.1053"],
    applicabilityBasis: "Construction, portable ladder, active use, cracked side rail, and loose rung support construction ladder defect requirements.",
  },
  {
    id: "multi-hazard-conveyor-and-oil",
    kind: "multi-hazard",
    family: "Machine guarding plus walking surface",
    observation: "In a manufacturing plant, an operating conveyor has an exposed nip point and oil is leaking onto the aisle used by employees.",
    scopes: ["osha_general_industry"],
    expectedJurisdiction: "osha_general_industry",
    expectedHazard: /guard|walking|surface|machine/i,
    expectedStage: "provisional",
    requiredPrimary: [/1910\.212/i, /1910\.22/i],
    forbiddenActive: [/1926\./i, /30 CFR/i],
    requiredMitigationConcepts: [/guard/i, /clean|spill|leak|aisle/i],
    sourceReference: `${authoritativeSources["1910.212"]} ${authoritativeSources["1910.22"]}`,
    applicabilityBasis: "Two independent hazards must remain separated: exposed moving parts and contaminated walking surface.",
  },
];

function fail(message: string): never {
  throw new Error(message);
}

function normalizeCitation(value: string) {
  return String(value || "").replace(/^29\s*CFR\s*/i, "").replace(/^30\s*CFR\s*/i, "").trim();
}

function activeStandardObjects(result: any): any[] {
  const buckets = [
    result?.suggestedStandards,
    result?.primaryStandards,
    result?.standards,
    (result?.standardDecisions || []).filter((decision: any) =>
      /^(confirmed|probable|candidate_standard)$/i.test(
        String(decision?.applicabilityStatus || decision?.status || decision?.candidateStatus || ""),
      ),
    ),
  ];
  const seen = new Set<string>();
  return buckets
    .flatMap((bucket) => Array.isArray(bucket) ? bucket : bucket ? [bucket] : [])
    .filter((item: any) => {
      const citation = String(item?.citation || item?.standard || item?.id || item || "").trim();
      if (!citation) return false;
      const key = normalizeCitation(citation).toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function activeCitations(result: any) {
  return activeStandardObjects(result).map((item: any) => String(item?.citation || item?.standard || item?.id || item || "").trim());
}

function questionText(result: any) {
  return (Array.isArray(result?.clarifyingQuestions) ? result.clarifyingQuestions : [])
    .map((question: any) => String(question?.question || question?.prompt || question?.id || "").trim())
    .filter(Boolean);
}

function mitigationText(result: any) {
  return JSON.stringify({
    generatedActions: result?.generatedActions,
    requiredControls: result?.requiredControls,
    correctiveActionReasoning: result?.correctiveActionReasoning,
  }).toLowerCase();
}

function resultText(result: any) {
  return JSON.stringify({
    classification: result?.classification,
    hazardCategory: result?.hazardCategory,
    candidateStandardFamily: result?.candidateStandardFamily,
    mechanismChain: result?.mechanismChain,
    evidenceUsed: result?.evidenceUsed,
  });
}

async function classify(testCase: AuditCase) {
  const response = await fetch(`${apiBaseUrl}/safescope-v2/classify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      riskProfileId: "standard_5x5",
      text: testCase.observation,
      scopes: testCase.scopes,
      structuredObservation: testCase.structuredObservation,
      priorStructuredObservation: testCase.priorStructuredObservation,
      clarificationAnswers: testCase.clarificationAnswers,
    }),
  });
  const text = await response.text();
  if (!response.ok) fail(`HTTP ${response.status} for ${testCase.id}: ${text}`);
  return text ? JSON.parse(text) : {};
}

function evaluate(testCase: AuditCase, actual: any): CaseResult {
  const criticalFailures: string[] = [];
  const warnings: string[] = [];
  const citations = activeCitations(actual);
  const questions = questionText(actual);
  const mitigation = mitigationText(actual);
  const primaryCitation = String(actual?.primaryCitation || citations[0] || "");
  const actualResultText = resultText(actual);

  if (testCase.expectedStage && String(actual?.resultStage || "") !== testCase.expectedStage) {
    const target = testCase.expectedStage === "final" ? criticalFailures : warnings;
    target.push(`Expected resultStage ${testCase.expectedStage}, received ${actual?.resultStage || "missing"}.`);
  }

  if (!testCase.expectedHazard.test(actualResultText)) {
    criticalFailures.push(`Expected hazard evidence ${testCase.expectedHazard}; received ${actual.classification || "missing"}.`);
  }

  for (const required of testCase.requiredPrimary || []) {
    if (!citations.some((citation) => required.test(citation))) {
      criticalFailures.push(`Missing required primary/direct citation ${required}; active citations: ${citations.join(", ") || "none"}.`);
    }
  }

  for (const forbidden of testCase.forbiddenActive || []) {
    if (citations.some((citation) => forbidden.test(citation))) {
      criticalFailures.push(`Forbidden active citation ${forbidden} appeared: ${citations.join(", ")}.`);
    }
  }

  for (const required of testCase.requiredQuestions || []) {
    if (!questions.some((question: string) => required.test(question))) {
      criticalFailures.push(`Missing required clarification question ${required}; questions: ${questions.join(" | ") || "none"}.`);
    }
  }

  for (const forbidden of testCase.forbiddenQuestions || []) {
    if (questions.some((question: string) => forbidden.test(question))) {
      criticalFailures.push(`Asked forbidden/redundant question ${forbidden}; questions: ${questions.join(" | ")}.`);
    }
  }

  if (questions.length > 4) {
    criticalFailures.push(`Returned ${questions.length} clarifying questions; maximum is 4.`);
  }

  for (const required of testCase.requiredMitigationConcepts || []) {
    if (!required.test(mitigation)) {
      criticalFailures.push(`Mitigation missing essential control concept ${required}.`);
    }
  }

  for (const forbidden of testCase.forbiddenMitigationConcepts || []) {
    if (forbidden.test(mitigation)) {
      criticalFailures.push(`Mitigation contains unrelated/prohibited concept ${forbidden}.`);
    }
  }

  const status: CaseResult["status"] =
    criticalFailures.length ? "critical-fail" :
    warnings.length ? "qualified-pass" :
    "pass";

  return {
    id: testCase.id,
    kind: testCase.kind,
    family: testCase.family,
    status,
    criticalFailures,
    warnings,
    activeCitations: citations,
    primaryCitation,
    questions,
    mitigationText: mitigation.slice(0, 1200),
    resultStage: String(actual?.resultStage || ""),
    classification: String(actual?.classification || ""),
    confidence: actual?.confidenceIntelligence?.overallConfidence ?? actual?.confidence,
  };
}

function summarize(results: CaseResult[]) {
  const total = results.length;
  const critical = results.filter((result) => result.status === "critical-fail").length;
  const needsReview = results.filter((result) => result.status === "needs-review").length;
  const qualified = results.filter((result) => result.status === "qualified-pass").length;
  const pass = results.filter((result) => result.status === "pass").length;
  const positiveCases = cases.filter((testCase) => testCase.requiredPrimary?.length).length;
  const primaryHits = results.filter((result) => {
    const testCase = cases.find((item) => item.id === result.id)!;
    if (!(testCase.requiredPrimary || []).length) return false;
    return (testCase.requiredPrimary || []).every((pattern) => result.activeCitations.some((citation) => pattern.test(citation)));
  }).length;
  const expectedPrimaryCount = cases.reduce((sum, testCase) => sum + (testCase.requiredPrimary?.length || 0), 0);
  const primaryFoundCount = cases.reduce((sum, testCase) => {
    const result = results.find((item) => item.id === testCase.id)!;
    return sum + (testCase.requiredPrimary || []).filter((pattern) => result.activeCitations.some((citation) => pattern.test(citation))).length;
  }, 0);
  const forbiddenCount = cases.reduce((sum, testCase) => {
    const result = results.find((item) => item.id === testCase.id)!;
    return sum + (testCase.forbiddenActive || []).filter((pattern) => result.activeCitations.some((citation) => pattern.test(citation))).length;
  }, 0);
  const mitigationCases = cases.filter((testCase) => testCase.requiredMitigationConcepts?.length).length;
  const mitigationCovered = results.filter((result) => {
    const testCase = cases.find((item) => item.id === result.id)!;
    if (!(testCase.requiredMitigationConcepts || []).length) return false;
    return (testCase.requiredMitigationConcepts || []).every((pattern) => pattern.test(result.mitigationText));
  }).length;

  return {
    total,
    pass,
    qualifiedPass: qualified,
    needsReview,
    criticalFailures: critical,
    clearPositiveCases: cases.filter((testCase) => testCase.kind === "clear-positive").length,
    safeControlledNegativeCases: cases.filter((testCase) => testCase.kind === "safe-controlled-negative").length,
    ambiguousCases: cases.filter((testCase) => testCase.kind === "ambiguous").length,
    jurisdictionTrapCases: cases.filter((testCase) => testCase.kind === "jurisdiction-trap").length,
    multiHazardCases: cases.filter((testCase) => testCase.kind === "multi-hazard").length,
    primaryCitationRecall: expectedPrimaryCount ? primaryFoundCount / expectedPrimaryCount : 1,
    primaryCaseRecall: positiveCases ? primaryHits / positiveCases : 1,
    unsupportedCitationRate: cases.length ? forbiddenCount / cases.length : 0,
    falsePositiveCount: forbiddenCount,
    mitigationEssentialControlCoverage: mitigationCases ? mitigationCovered / mitigationCases : 1,
  };
}

function writeReports(results: CaseResult[], summary: ReturnType<typeof summarize>) {
  mkdirSync(reportDir, { recursive: true });
  const full = {
    label: "Independent automated regulatory-applicability audit",
    generatedAt: new Date().toISOString(),
    apiBaseUrl,
    authoritativeSources,
    summary,
    auditCases: cases,
    results,
  };
  writeFileSync(path.join(reportDir, "hazlenz-independent-standards-audit.json"), JSON.stringify(full, null, 2));
  const md = [
    "# HazLenz Independent Standards Audit",
    "",
    "This is an automated regulatory-applicability audit. It is not a professional legal or safety certification.",
    "",
    "## Summary",
    "",
    "```json",
    JSON.stringify(summary, null, 2),
    "```",
    "",
    "## Case Results",
    "",
    ...results.flatMap((result) => {
      const testCase = cases.find((item) => item.id === result.id)!;
      return [
        `### ${result.id} - ${result.status}`,
        "",
        `Observation: ${testCase.observation}`,
        "",
        `Applicability basis: ${testCase.applicabilityBasis}`,
        "",
        `Source: ${testCase.sourceReference}`,
        "",
        `Classification: ${result.classification}`,
        "",
        `Active citations: ${result.activeCitations.join(", ") || "none"}`,
        "",
        `Questions: ${result.questions.join(" | ") || "none"}`,
        "",
        result.criticalFailures.length ? `Failures: ${result.criticalFailures.join(" | ")}` : "Failures: none",
        "",
      ];
    }),
  ].join("\n");
  writeFileSync(path.join(reportDir, "hazlenz-independent-standards-audit.md"), md);
}

async function run() {
  const results: CaseResult[] = [];
  for (const testCase of cases) {
    const actual = await classify(testCase);
    const result = evaluate(testCase, actual);
    results.push(result);
    console.log(JSON.stringify({
      id: result.id,
      status: result.status,
      stage: result.resultStage,
      classification: result.classification,
      citations: result.activeCitations,
      failures: result.criticalFailures,
    }));
  }

  const summary = summarize(results);
  writeReports(results, summary);
  console.log("\nIndependent HazLenz standards audit summary:");
  console.log(JSON.stringify(summary, null, 2));
  console.log(`Reports written to ${reportDir}`);

  const failed = results.filter((result) => result.status === "critical-fail");
  if (failed.length) {
    console.error("\nCritical audit failures:");
    for (const result of failed) {
      console.error(`- ${result.id}: ${result.criticalFailures.join(" | ")}`);
    }
    process.exit(1);
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
