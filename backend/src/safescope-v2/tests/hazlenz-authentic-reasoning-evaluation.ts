/**
 * HazLenz Authentic Reasoning Evaluation
 *
 * This is not a golden-output snapshot test.
 * It evaluates whether HazLenz can reason from realistic inspection observations
 * using mechanism-of-injury concepts, jurisdiction cues, standards applicability,
 * evidence gaps, and corrective action quality.
 *
 * The intent is to catch shallow keyword matching and regurgitated citations.
 * Expand this suite over time with real anonymized field observations.
 */

import * as http from "node:http";
import * as https from "node:https";

type Pattern = RegExp | string;

type Scenario = {
  name: string;
  payload: {
    text: string;
    scopes: string[];
    evidenceTexts: string[];
  };
  acceptableHazards?: Pattern[];
  acceptableJurisdictions?: Pattern[];
  requiredMechanism?: Pattern[];
  requiredConsequences?: Pattern[];
  requiredEvidenceGaps?: Pattern[];
  requiredStandards?: Pattern[];
  forbiddenStandards?: Pattern[];
  requiredCorrectiveActions?: Pattern[];
  minConfidence?: number;
  maxConfidence?: number;
  requireLowConfidence?: boolean;
  requireQuestions?: boolean;
  requireControlledOrVague?: boolean;
  critical?: boolean;
  notes: string;
};

type StandardLike = {
  citation?: string;
  title?: string;
  authority?: string;
  authorityLabel?: string;
  authorityType?: string;
  status?: string;
  candidateStatus?: string;
  source?: string;
  matchingReasons?: string[];
  matchReasons?: string[];
  evidenceNeeded?: string[];
  evidenceGaps?: string[];
  confidence?: number;
  confidenceBand?: string;
};

const BASE_URL = process.env.SENTINEL_API_URL || "http://localhost:4000";
const CLASSIFY_URL = joinUrl(BASE_URL, "/safescope-v2/classify");
const REQUIRED_AVERAGE_SCORE = 80;
const SEVERE_FALSE_POSITIVE_PATTERNS: Pattern[] = [
  /1910\.101/i,
  /compressed gas/i,
  /cylinder/i,
  /1910\.147/i,
  /lockout\/?tagout/i,
  /loto/i,
];

function joinUrl(base: string, path: string): string {
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  return new URL(path.replace(/^\//, ""), normalizedBase).toString();
}

function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function asPattern(pattern: Pattern): RegExp {
  return typeof pattern === "string" ? new RegExp(escapeRegExp(pattern), "i") : pattern;
}

function matchesAny(text: string, patterns: Pattern[] = []): boolean {
  return patterns.some((pattern) => asPattern(pattern).test(text));
}

function unique(list: string[]): string[] {
  return Array.from(new Set(list.map((item) => item.trim()).filter(Boolean)));
}

function appendText(target: string[], value: unknown): void {
  if (value === null || value === undefined) return;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed) target.push(trimmed);
    return;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    target.push(String(value));
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) appendText(target, item);
    return;
  }
  if (typeof value === "object") {
    for (const nested of Object.values(value as Record<string, unknown>)) {
      appendText(target, nested);
    }
  }
}

function deepText(value: unknown): string {
  const parts: string[] = [];
  appendText(parts, value);
  return unique(parts).join(" \n ").toLowerCase();
}

function normalizeResponseText(response: any): string {
  return deepText({
    classification: response?.classification,
    hazardCategory: response?.hazardCategory,
    candidateStandardFamily: response?.candidateStandardFamily,
    confidence: response?.confidence,
    confidenceBand: response?.confidenceBand,
    risk: response?.risk,
    riskBand: response?.riskBand,
    riskLevel: response?.riskLevel,
    decisionSummary: response?.decisionSummary,
    reviewStateLabel: response?.reviewStateLabel,
    standardsReasoning: response?.standardsReasoning,
    standardDecisions: response?.standardDecisions,
    suggestedStandards: response?.suggestedStandards,
    primaryStandards: response?.primaryStandards,
    supportingStandards: response?.supportingStandards,
    needsMoreEvidenceStandards: response?.needsMoreEvidenceStandards,
    standardsTraceability: response?.standardsTraceability,
    mechanismChain: response?.mechanismChain,
    inspectionIntelligence: response?.inspectionIntelligence,
    evidenceGapQuestions: response?.evidenceGapQuestions,
    questions: response?.questions,
    correctiveActions: response?.correctiveActions,
    generatedActions: response?.generatedActions,
  });
}

function standardDecisionText(decision: StandardLike): string {
  return [
    decision.citation,
    decision.title,
    decision.authority,
    decision.authorityLabel,
    decision.authorityType,
    decision.status,
    decision.candidateStatus,
    decision.source,
    ...(decision.matchingReasons || []),
    ...(decision.matchReasons || []),
    ...(decision.evidenceNeeded || []),
    ...(decision.evidenceGaps || []),
  ]
    .filter(Boolean)
    .map((value) => String(value))
    .join(" ")
    .toLowerCase();
}

function collectStandards(response: any): StandardLike[] {
  const buckets = [
    response?.standardDecisions,
    response?.suggestedStandards,
    response?.primaryStandards,
    response?.supportingStandards,
    response?.needsMoreEvidenceStandards,
    response?.excludedStandards,
    response?.standards,
    response?.standardsTraceability?.suggestedCitations,
    response?.standardsTraceability?.supportingCitations,
    response?.standardsTraceability?.needsMoreEvidenceCitations,
    response?.standardsTraceability?.excludedCitations,
    response?.inspectionIntelligence?.candidateStandards,
    response?.inspectionIntelligence?.standardApplicability?.suggestedStandards,
    response?.standardApplicability?.suggestedStandards,
    response?.standardApplicability?.matchedRules,
    response?.applicabilityIntelligence?.primaryApplicableStandards,
    response?.standardsReasoning?.topDefensible,
    response?.generatedActions?.referenceStandards,
    response?.baseGeneratedActions?.referenceStandards,
  ];

  const flattened: StandardLike[] = [];

  for (const bucket of buckets) {
    if (!bucket) continue;
    const items = Array.isArray(bucket) ? bucket : [bucket];
    for (const item of items) {
      if (!item) continue;
      const citation =
        item.citation ||
        item.standard ||
        item.standardNumber ||
        item.code ||
        item.reference ||
        item.authority?.citation ||
        item.authorityCitation ||
        item.referenceCitation ||
        item.id;
      const title =
        item.title ||
        item.titleSummary ||
        item.summary ||
        item.label ||
        item.heading ||
        item.name ||
        item.authority?.title ||
        item.authorityTitle;

      if (!citation && !title) continue;

      flattened.push({
        citation: citation ? String(citation) : undefined,
        title: title ? String(title) : undefined,
        authority: item.authority || item.authorityLabel || item.authorityType,
        authorityLabel: item.authorityLabel,
        authorityType: item.authorityType,
        status: item.status,
        candidateStatus: item.candidateStatus,
        source: item.source,
        matchingReasons: item.matchingReasons || item.matchReasons,
        matchReasons: item.matchReasons,
        evidenceNeeded: item.evidenceNeeded,
        evidenceGaps: item.evidenceGaps,
        confidence: typeof item.confidence === "number" ? item.confidence : undefined,
        confidenceBand: item.confidenceBand,
      });
    }
  }

  const seen = new Set<string>();
  return flattened.filter((item) => {
    const key = `${item.citation || ""}::${item.title || ""}`.toLowerCase().trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function standardsText(response: any): string {
  const standards = collectStandards(response);
  return standards.map(standardDecisionText).join(" \n ");
}

function mechanismText(response: any): string {
  return deepText({
    mechanismChain: response?.mechanismChain,
    inspectionMechanismChain: response?.inspectionIntelligence?.mechanismChain,
    mechanismOfInjury: response?.mechanismOfInjury,
    decisionSummary: response?.decisionSummary,
    standardsReasoning: response?.standardsReasoning,
    evidenceGapQuestions: response?.evidenceGapQuestions,
    questions: response?.questions,
    correctiveActions: response?.correctiveActions,
    generatedActions: response?.generatedActions,
  });
}

function questionsText(response: any): string {
  return deepText([
    response?.evidenceGapQuestions,
    response?.questions,
    response?.inspectionIntelligence?.evidenceGapQuestions,
    response?.inspectionIntelligence?.questions,
    response?.standardDecisions?.flatMap?.((item: any) => item?.evidenceNeeded || item?.evidenceGaps || []),
    response?.standardApplicability?.matchedRules?.flatMap?.((item: any) => item?.missingFacts || item?.evidenceNeeded || []),
  ]);
}

function actionsText(response: any): string {
  return deepText([
    response?.correctiveActions,
    response?.generatedActions,
    response?.inspectionIntelligence?.correctiveActions,
    response?.inspectionIntelligence?.generatedActions,
    response?.mechanismChain?.controls,
  ]);
}

function riskText(response: any): string {
  return deepText([
    response?.risk,
    response?.riskBand,
    response?.riskLevel,
    response?.riskScore,
    response?.inspectionIntelligence?.risk,
    response?.inspectionIntelligence?.riskBand,
    response?.inspectionIntelligence?.riskLevel,
    response?.inspectionIntelligence?.riskScore,
  ]);
}

function confidenceValue(response: any): number | undefined {
  const candidates = [
    response?.confidence,
    response?.confidenceScore,
    response?.inspectionIntelligence?.confidence,
    response?.inspectionIntelligence?.confidenceScore,
    response?.risk?.confidence,
  ];
  for (const value of candidates) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return undefined;
}

function submitJson(url: string, payload: unknown): Promise<{ statusCode: number; raw: string }> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const body = JSON.stringify(payload);
    const client = parsed.protocol === "https:" ? https : http;
    const request = client.request(
      {
        method: "POST",
        hostname: parsed.hostname,
        port: parsed.port || (parsed.protocol === "https:" ? 443 : 80),
        path: `${parsed.pathname}${parsed.search}`,
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (response) => {
        let raw = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => (raw += chunk));
        response.on("end", () => resolve({ statusCode: response.statusCode || 0, raw }));
      },
    );

    request.on("error", reject);
    request.write(body);
    request.end();
  });
}

function firstMatching(text: string, patterns: Pattern[] = []): string | undefined {
  return patterns.find((pattern) => asPattern(pattern).test(text))?.toString();
}

function evaluateScenario(response: any, scenario: Scenario) {
  const allText = normalizeResponseText(response);
  const standardText = standardsText(response);
  const mechanism = mechanismText(response);
  const questionText = questionsText(response);
  const actionText = actionsText(response);
  const risk = riskText(response);
  const classification = deepText([
    response?.classification,
    response?.hazardCategory,
    response?.candidateStandardFamily,
    response?.reviewStateLabel,
  ]);
  const jurisdiction = deepText([
    response?.jurisdiction,
    response?.selectedScope,
    response?.selectedScopes,
    response?.scope,
    response?.scopes,
    response?.inspectionIntelligence?.jurisdiction,
    response?.inspectionIntelligence?.selectedScope,
    response?.standardDecisions,
    response?.standardsTraceability,
    response?.standardApplicability,
  ]);

  const dimensions: { name: string; ok: boolean; detail: string }[] = [];

  if (scenario.acceptableHazards?.length) {
    const ok = matchesAny(classification, scenario.acceptableHazards) || matchesAny(allText, scenario.acceptableHazards);
    dimensions.push({ name: "classification", ok, detail: ok ? "matched expected hazard family" : `missing expected hazard concepts: ${scenario.acceptableHazards.map(String).join(", ")}` });
  }

  if (scenario.acceptableJurisdictions?.length) {
    const ok = matchesAny(jurisdiction, scenario.acceptableJurisdictions) || matchesAny(allText, scenario.acceptableJurisdictions);
    dimensions.push({ name: "jurisdiction", ok, detail: ok ? "matched expected jurisdiction" : `missing expected jurisdiction concepts: ${scenario.acceptableJurisdictions.map(String).join(", ")}` });
  }

  if (scenario.requiredMechanism?.length) {
    const ok = matchesAny(mechanism, scenario.requiredMechanism) || matchesAny(allText, scenario.requiredMechanism);
    dimensions.push({ name: "mechanism", ok, detail: ok ? "mechanism chain contains required concepts" : `missing mechanism concepts: ${scenario.requiredMechanism.map(String).join(", ")}` });
  }

  if (scenario.requiredConsequences?.length) {
    const ok = matchesAny(mechanism, scenario.requiredConsequences) || matchesAny(allText, scenario.requiredConsequences);
    dimensions.push({ name: "consequence", ok, detail: ok ? "consequence language is present" : `missing consequence concepts: ${scenario.requiredConsequences.map(String).join(", ")}` });
  }

  if (scenario.requiredEvidenceGaps?.length || scenario.requireQuestions) {
    const ok = (scenario.requiredEvidenceGaps?.length ? matchesAny(questionText, scenario.requiredEvidenceGaps) || matchesAny(allText, scenario.requiredEvidenceGaps) : true) && (!scenario.requireQuestions || Boolean(questionText.trim()));
    dimensions.push({ name: "evidence gaps", ok, detail: ok ? "questions/evidence gaps are present" : `missing evidence gap concepts: ${(scenario.requiredEvidenceGaps || []).map(String).join(", ")}` });
  }

  if (scenario.requiredStandards?.length) {
    const ok = matchesAny(standardText, scenario.requiredStandards) || matchesAny(allText, scenario.requiredStandards);
    dimensions.push({ name: "standards", ok, detail: ok ? "required standard concept present" : `missing required standards: ${scenario.requiredStandards.map(String).join(", ")}` });
  }

  if (scenario.forbiddenStandards?.length) {
    const violated = scenario.forbiddenStandards.find((pattern) => matchesAny(standardText, [pattern]));
    dimensions.push({
      name: "false positives",
      ok: !violated,
      detail: violated ? `forbidden standard matched: ${String(violated)}` : "no forbidden standards present",
    });
  }

  if (scenario.requiredCorrectiveActions?.length) {
    const ok = matchesAny(actionText, scenario.requiredCorrectiveActions) || matchesAny(allText, scenario.requiredCorrectiveActions);
    dimensions.push({ name: "corrective actions", ok, detail: ok ? "corrective actions reflect the mechanism" : `missing corrective action concepts: ${scenario.requiredCorrectiveActions.map(String).join(", ")}` });
  }

  if (scenario.minConfidence !== undefined || scenario.maxConfidence !== undefined || scenario.requireLowConfidence) {
    const conf = confidenceValue(response);
    let ok = true;
    if (scenario.minConfidence !== undefined) ok = ok && typeof conf === "number" && conf >= scenario.minConfidence;
    if (scenario.maxConfidence !== undefined) ok = ok && typeof conf === "number" && conf <= scenario.maxConfidence;
    if (scenario.requireLowConfidence) {
      const band = String(response?.confidenceBand || response?.inspectionIntelligence?.confidenceBand || "").toLowerCase();
      ok = ok && (band === "low" || band === "very low" || (typeof conf === "number" && conf <= 0.45));
    }
    dimensions.push({ name: "confidence", ok, detail: ok ? `confidence acceptable (${conf ?? "n/a"})` : `confidence out of range (${conf ?? "n/a"})` });
  }

  if (scenario.requireControlledOrVague) {
    const controlledText = deepText([
      response?.classification,
      response?.reviewStateLabel,
      response?.decisionSummary,
      response?.evidenceGapQuestions,
      response?.questions,
      response?.standardsReasoning,
    ]);
    const ok = /controlled|review|needs more evidence|more evidence|unclear|vague|safe|guarded|locked out|no active/i.test(controlledText);
    dimensions.push({
      name: "controlled/vague",
      ok,
      detail: ok ? "response remains controlled/vague" : "response escalated too aggressively for a safe/unclear condition",
    });
  }

  const topStandards = collectStandards(response)
    .slice(0, 5)
    .map((item) => item.citation || item.title || "")
    .filter(Boolean);
  const scoreValues = dimensions.length
    ? dimensions.map((dimension) => (dimension.ok ? 1 : 0))
    : [1];

  const score = Math.round((scoreValues.reduce((sum, value) => sum + value, 0) / scoreValues.length) * 100);
  const failedDimensions = dimensions.filter((dimension) => !dimension.ok).map((dimension) => dimension.name);
  const violatedForbidden = scenario.forbiddenStandards?.find((pattern) => matchesAny(standardText, [pattern]));
  const severeFalsePositive =
    Boolean(violatedForbidden) &&
    SEVERE_FALSE_POSITIVE_PATTERNS.some((pattern) => asPattern(pattern).test(String(violatedForbidden)));

  return {
    score,
    failedDimensions,
    topStandards,
    classification: response?.classification || response?.hazardCategory || response?.candidateStandardFamily || "",
    risk: response?.risk?.riskBand || response?.riskBand || response?.riskLevel || "",
    evidenceGaps: questionText.slice(0, 260),
    correctiveActions: actionText.slice(0, 260),
    severeFalsePositive,
    dimensions,
    allText,
    standardText,
    mechanism,
    questionText,
  };
}

function makeScenarios(): Scenario[] {
  return [
    {
      name: "MSHA conveyor tail pulley missing guard during cleanup",
      payload: {
        text: "At the aggregate plant, the conveyor tail pulley is missing its guard and miners clean spilled material near the moving belt during cleanup.",
        scopes: ["msha"],
        evidenceTexts: ["tail pulley missing guard", "cleanup near moving belt", "aggregate plant", "miners nearby"],
      },
      acceptableHazards: [/machine guarding|conveyor|guard|caught[- ]in|pinch point/i],
      acceptableJurisdictions: [/msha|mine|aggregate|30 cfr|part 56|part 57/i],
      requiredMechanism: [/(caught[- ]in|nip point|pinch point|entanglement|drawn into|in[- ]running)/i],
      requiredConsequences: [/(amputation|crush|crushing|serious injury|fatal)/i],
      requiredEvidenceGaps: [/(lockout|cleanup|operating status|guard status|access)/i],
      requiredStandards: [/(56\.14107|1910\.212)/i],
      forbiddenStandards: [/(1910\.1200|1910\.101|1910\.178)/i],
      requiredCorrectiveActions: [/(guard|lockout|stop|restrict access|cleanup)/i],
      minConfidence: 0.6,
      critical: true,
      notes: "Checks MSHA conveyor guarding, caught-in reasoning, and cleanup exposure.",
    },
    {
      name: "Open breaker slot and missing panel cover",
      payload: {
        text: "An electrical panel in the warehouse has an open breaker slot and missing cover plate exposing energized parts.",
        scopes: ["osha_general_industry"],
        evidenceTexts: ["open breaker slot", "missing cover plate", "energized parts", "warehouse panel"],
      },
      acceptableHazards: [/electrical|energized|shock|arc/i],
      acceptableJurisdictions: [/osha general industry|osha|29 cfr|1910/i],
      requiredMechanism: [/(exposed live parts|contact with energized parts|accidental contact|arc)/i],
      requiredConsequences: [/(shock|burn|arc flash|electrocution)/i],
      requiredEvidenceGaps: [/(energized|voltage|qualified|cover|temporary)/i],
      requiredStandards: [/1910\.303\(g\)\(2\)\(i\)/i],
      forbiddenStandards: [/(1910\.147|1910\.1200|1910\.101)/i],
      requiredCorrectiveActions: [/(install|cover|de-energize|qualified|restrict access)/i],
      minConfidence: 0.6,
      critical: true,
      notes: "Checks exposed live parts and direct electrical guarding applicability.",
    },
    {
      name: "Damaged electrical cord in wet area",
      payload: {
        text: "A portable grinder has a damaged power cord lying on a damp floor in the shop.",
        scopes: ["osha_general_industry"],
        evidenceTexts: ["damaged cord", "portable grinder", "damp floor", "shop"],
      },
      acceptableHazards: [/electrical|shock|cord|power/i],
      acceptableJurisdictions: [/osha|1910/i],
      requiredMechanism: [/(exposed conductor|current leakage|contact with energized parts|wet surface)/i],
      requiredConsequences: [/(shock|electrocution|burn|arc)/i],
      requiredEvidenceGaps: [/(gfcI|remove from service|severity|in use|energized)/i],
      requiredStandards: [/1910\.305\(g\)\(2\)\(iii\)/i, /1910\.334\(a\)\(2\)\(ii\)/i],
      forbiddenStandards: [/(1910\.147|1910\.146|1910\.1200)/i],
      requiredCorrectiveActions: [/(remove from service|repair|replace|dry|gfcI|elevate)/i],
      minConfidence: 0.5,
      critical: true,
      notes: "Checks that a damaged cord is treated as electrical exposure rather than LOTO or HazCom.",
    },
    {
      name: "Unlabeled chemical container",
      payload: {
        text: "An unlabeled chemical container is stored on a shelf in the maintenance room.",
        scopes: ["osha_general_industry"],
        evidenceTexts: ["unlabeled container", "maintenance room", "chemical"],
      },
      acceptableHazards: [/hazard communication|hazcom|chemical|label/i],
      acceptableJurisdictions: [/osha|1910/i],
      requiredMechanism: [/(unknown contents|identity gap|communication gap|misidentification)/i],
      requiredConsequences: [/(exposure|incompatible|spill|emergency response|mixing)/i],
      requiredEvidenceGaps: [/(contents|label|sds|secondary containment|identity)/i],
      requiredStandards: [/1910\.1200/i],
      forbiddenStandards: [/(1910\.101|compressed gas|cylinder|1910\.147|1910\.146)/i],
      requiredCorrectiveActions: [/(label|identify|store|sds|contain)/i],
      minConfidence: 0.5,
      critical: true,
      notes: "Checks HazCom identity-gap reasoning without drifting into compressed gas or confined space.",
    },
    {
      name: "Open used oil container near walkway",
      payload: {
        text: "An open container of used oil is sitting on the shop floor near a pedestrian walkway.",
        scopes: ["osha_general_industry"],
        evidenceTexts: ["open used oil container", "shop floor", "pedestrian walkway"],
      },
      acceptableHazards: [/walking|working surfaces|housekeeping|spill|release|oil/i],
      acceptableJurisdictions: [/osha|1910/i],
      requiredMechanism: [/(spill|release|contamination|walking surface|travel path)/i],
      requiredConsequences: [/(slip|trip|fall|contamination)/i],
      requiredEvidenceGaps: [/(label|lid|drain|secondary containment|spill)/i],
      requiredStandards: [/1910\.22\(a\)\(2\)/i, /1910\.22\(a\)\(3\)/i],
      forbiddenStandards: [/(1910\.101|compressed gas|cylinder)/i],
      requiredCorrectiveActions: [/(close|lid|label|move|contain|clean|dispose)/i],
      minConfidence: 0.45,
      critical: true,
      notes: "Checks spill/release reasoning and walk-path contamination over HazCom or compressed gas.",
    },
    {
      name: "Unsecured oxygen cylinder near aisle",
      payload: {
        text: "An oxygen cylinder is standing unsecured near a shop aisle where mobile equipment passes.",
        scopes: ["osha_general_industry"],
        evidenceTexts: ["oxygen cylinder", "unsecured", "shop aisle", "mobile equipment"],
      },
      acceptableHazards: [/compressed gas|cylinder|oxygen/i],
      acceptableJurisdictions: [/osha|1910/i],
      requiredMechanism: [/(tip[- ]?over|valve damage|impact|release|stored energy)/i],
      requiredConsequences: [/(projectile|fire|gas release|impact injury)/i],
      requiredEvidenceGaps: [/(cap|chain|strap|regulator|separation|contents)/i],
      requiredStandards: [/1910\.101/i],
      forbiddenStandards: [/(1910\.22|1910\.178|1910\.1200)/i],
      requiredCorrectiveActions: [/(secure|upright|cap|separate|protect from impact|relocate)/i],
      minConfidence: 0.6,
      critical: true,
      notes: "Checks that actual cylinder evidence drives compressed-gas reasoning.",
    },
    {
      name: "Loader and pedestrians share an aggregate haul route",
      payload: {
        text: "A loader and pedestrians share the same haul route at the aggregate stockpile with no separation.",
        scopes: ["msha"],
        evidenceTexts: ["loader", "pedestrians", "haul route", "aggregate stockpile"],
      },
      acceptableHazards: [/mobile equipment|traffic|pedestrian|vehicle/i],
      acceptableJurisdictions: [/msha|mine|aggregate|30 cfr/i],
      requiredMechanism: [/(struck[- ]by|backing|traffic conflict|no separation|pedestrian exposure)/i],
      requiredConsequences: [/(crush|struck[- ]by|serious injury|fatal)/i],
      requiredEvidenceGaps: [/(traffic control|spotter|marked route|separation|blind corner)/i],
      requiredStandards: [/56\.9100/i],
      forbiddenStandards: [/(1910\.178|1910\.22|1910\.1200)/i],
      requiredCorrectiveActions: [/(separate|mark|spotter|control traffic|route)/i],
      minConfidence: 0.6,
      critical: true,
      notes: "Checks MSHA mobile-equipment and pedestrian interaction reasoning.",
    },
    {
      name: "Scrap and hoses across walkway",
      payload: {
        text: "Scrap material and hoses are lying across a designated pedestrian walkway.",
        scopes: ["osha_general_industry"],
        evidenceTexts: ["scrap material", "hoses", "pedestrian walkway"],
      },
      acceptableHazards: [/walking|working surfaces|housekeeping|trip/i],
      acceptableJurisdictions: [/osha|1910/i],
      requiredMechanism: [/(trip|entanglement|stumble|obstruction|travel path)/i],
      requiredConsequences: [/(fall|sprain|strain|struck against)/i],
      requiredEvidenceGaps: [/(lighting|traffic|alternate route|walkway|housekeeping)/i],
      requiredStandards: [/1910\.22\(a\)\(3\)/i, /1910\.22\(a\)\(2\)/i],
      forbiddenStandards: [/(1910\.178|56\.9100|1910\.212|1910\.1200)/i],
      requiredCorrectiveActions: [/(remove|reroute|clear|inspect|housekeeping)/i],
      minConfidence: 0.5,
      critical: true,
      notes: "Checks housekeeping/trip logic without machine-guarding overreach.",
    },
    {
      name: "Unprotected edge on elevated platform",
      payload: {
        text: "Workers access an elevated platform with an unprotected edge and no guardrail in a maintenance area.",
        scopes: ["osha_construction"],
        evidenceTexts: ["elevated platform", "unprotected edge", "no guardrail", "maintenance area"],
      },
      acceptableHazards: [/fall|guardrail|walking\/working surfaces|platform/i],
      acceptableJurisdictions: [/construction|1926/i],
      requiredMechanism: [/(fall from height|unprotected edge|exposure to lower level|fall hazard)/i],
      requiredConsequences: [/(serious injury|fatal|fracture|head injury)/i],
      requiredEvidenceGaps: [/(height|access|use|edge protection|platform)/i],
      requiredStandards: [/1926\.501|1910\.28/i],
      forbiddenStandards: [/(1910\.212|1910\.1200|1910\.178)/i],
      requiredCorrectiveActions: [/(guardrail|restrict access|fall protection|protect)/i],
      minConfidence: 0.5,
      critical: true,
      notes: "Checks fall exposure with construction-appropriate jurisdiction cues.",
    },
    {
      name: "Scaffold missing guardrail",
      payload: {
        text: "A scaffold at the renovation site is missing its guardrail on the working platform.",
        scopes: ["osha_construction"],
        evidenceTexts: ["scaffold", "missing guardrail", "working platform", "renovation site"],
      },
      acceptableHazards: [/scaffold|fall|guardrail/i],
      acceptableJurisdictions: [/construction|1926/i],
      requiredMechanism: [/(scaffold fall|unprotected platform|fall from scaffold|edge exposure)/i],
      requiredConsequences: [/(serious injury|fatal|fracture|head injury)/i],
      requiredEvidenceGaps: [/(competent person|scaffold type|planks|access|inspection)/i],
      requiredStandards: [/1926\.451/i],
      forbiddenStandards: [/(1926\.501|1910\.28|1910\.212)/i],
      requiredCorrectiveActions: [/(install guardrail|inspect|competent person|remove from service)/i],
      minConfidence: 0.5,
      critical: true,
      notes: "Checks scaffold-specific reasoning over broad fall protection.",
    },
    {
      name: "LOTO servicing jammed machine",
      payload: {
        text: "During servicing, workers clear a jam on a powered machine only after lockout and energy isolation are verified.",
        scopes: ["osha_general_industry"],
        evidenceTexts: ["servicing", "lockout verified", "energy isolation", "jammed machine"],
      },
      acceptableHazards: [/lockout|stored energy|hazardous energy|servicing/i],
      acceptableJurisdictions: [/osha|1910/i],
      requiredMechanism: [/(unexpected energization|energy isolation|stored energy|servicing|jam clearing)/i],
      requiredConsequences: [/(crush|shock|unexpected startup|serious injury)/i],
      requiredEvidenceGaps: [/(isolation|verification|stored energy|start-up|maintenance)/i],
      requiredStandards: [/1910\.147/i],
      forbiddenStandards: [/(1910\.1200|1910\.101|1910\.178)/i],
      requiredCorrectiveActions: [/(lockout|verify|isolate|de-energize|clear jam)/i],
      minConfidence: 0.6,
      critical: true,
      notes: "Checks that actual servicing/energy-isolation facts support LOTO.",
    },
    {
      name: "Hot work near combustibles",
      payload: {
        text: "Hot work is being performed next to stored combustibles without a clear fire watch or permit.",
        scopes: ["osha_general_industry"],
        evidenceTexts: ["hot work", "stored combustibles", "fire watch", "permit"],
      },
      acceptableHazards: [/hot work|fire|combustion|welding|cutting/i],
      acceptableJurisdictions: [/osha|1910/i],
      requiredMechanism: [/(ignition|spark|combustible exposure|fire spread)/i],
      requiredConsequences: [/(fire|burn|explosion|smoke)/i],
      requiredEvidenceGaps: [/(permit|fire watch|combustibles|clearance|shielding)/i],
      requiredStandards: [/1910\.252|1926\.352/i],
      forbiddenStandards: [/(1910\.147|1910\.1200|1910\.101)/i],
      requiredCorrectiveActions: [/(remove combustibles|fire watch|permit|shield|control ignition)/i],
      minConfidence: 0.5,
      critical: true,
      notes: "Checks ignition-control reasoning for hot work.",
    },
    {
      name: "Crusher dust / silica exposure",
      payload: {
        text: "Dust is visible around the crusher and workers may be exposed to respirable silica during material handling.",
        scopes: ["msha"],
        evidenceTexts: ["crusher dust", "respirable silica", "material handling", "workers exposed"],
      },
      acceptableHazards: [/dust|silica|respirable|industrial hygiene|exposure/i],
      acceptableJurisdictions: [/msha|mine|aggregate|30 cfr/i],
      requiredMechanism: [/(inhalation|respirable dust|airborne dust|silica exposure)/i],
      requiredConsequences: [/(lung disease|silicosis|respiratory|chronic)/i],
      requiredEvidenceGaps: [/(monitoring|wet suppression|sampling|controls|respirator)/i],
      requiredStandards: [/56\.5005|1926\.1153/i],
      forbiddenStandards: [/(1910\.101|1910\.147|1910\.178)/i],
      requiredCorrectiveActions: [/(wet suppression|dust control|monitor|ventilation|respirator)/i],
      minConfidence: 0.5,
      critical: true,
      notes: "Checks respirable dust reasoning at a crusher with mine context.",
    },
    {
      name: "Crusher noise exposure",
      payload: {
        text: "The crusher runs loud enough that workers need hearing conservation review and noise exposure assessment.",
        scopes: ["msha"],
        evidenceTexts: ["crusher", "loud", "hearing conservation", "noise exposure"],
      },
      acceptableHazards: [/noise|hearing|industrial hygiene|exposure/i],
      acceptableJurisdictions: [/msha|mine|30 cfr|osha/i],
      requiredMechanism: [/(prolonged noise exposure|hearing exposure|sound pressure|dosimetry)/i],
      requiredConsequences: [/(hearing loss|tinnitus|auditory)/i],
      requiredEvidenceGaps: [/(dosimetry|duration|source control|hearing protection|monitoring)/i],
      requiredStandards: [/62\.110|1910\.95/i],
      forbiddenStandards: [/(1910\.101|1910\.147|1910\.178)/i],
      requiredCorrectiveActions: [/(engineering controls|hearing conservation|dosimetry|reduce noise|hearing protection)/i],
      minConfidence: 0.45,
      critical: true,
      notes: "Checks noise reasoning; PPE may be supporting but not primary.",
    },
    {
      name: "Confined space atmosphere concern",
      payload: {
        text: "A manhole needs entry, but the atmosphere has not been tested and the oxygen reading looks low.",
        scopes: ["osha_general_industry"],
        evidenceTexts: ["manhole", "entry", "atmosphere not tested", "oxygen low"],
      },
      acceptableHazards: [/confined space|atmosphere|oxygen|entry/i],
      acceptableJurisdictions: [/osha|1910/i],
      requiredMechanism: [/(hazardous atmosphere|engulfment|entrapment|entry without classification)/i],
      requiredConsequences: [/(asphyxiation|poisoning|entrapment|fatal)/i],
      requiredEvidenceGaps: [/(permit|atmospheric testing|rescue|isolation|entry)/i],
      requiredStandards: [/1910\.146/i],
      forbiddenStandards: [/(1910\.101|1910\.178|1910\.1200)/i],
      requiredCorrectiveActions: [/(do not enter|test|ventilate|permit|rescue)/i],
      minConfidence: 0.5,
      critical: true,
      notes: "Checks confined-space atmospheric reasoning and rescue-aware questions.",
    },
    {
      name: "Safe guarded conveyor locked out for maintenance",
      payload: {
        text: "Conveyor tail pulley is fully guarded and locked out for maintenance while the area remains barricaded.",
        scopes: ["msha"],
        evidenceTexts: ["fully guarded", "locked out", "maintenance", "barricaded"],
      },
      acceptableHazards: [/controlled|safe|review|maintenance|guarded/i],
      acceptableJurisdictions: [/msha|mine|osha/i],
      requiredEvidenceGaps: [/(what remains|confirm|review|maintenance|status)/i],
      forbiddenStandards: [/(56\.14107|1910\.212|1910\.147)/i],
      requireControlledOrVague: true,
      requireQuestions: true,
      notes: "Checks anti-regurgitation on a safe condition with hazard words present.",
    },
    {
      name: "Natural gas odor in boiler room",
      payload: {
        text: "A boiler room has a natural gas odor and the source has not been found.",
        scopes: ["osha_general_industry"],
        evidenceTexts: ["natural gas odor", "boiler room", "source not found"],
      },
      acceptableHazards: [/gas leak|fire|ventilation|unknown/i],
      acceptableJurisdictions: [/osha|1910/i],
      requiredMechanism: [/(leak|release|ignition|accumulation|ventilation)/i],
      requiredConsequences: [/(fire|explosion|asphyxiation|exposure)/i],
      requiredEvidenceGaps: [/(source|shutoff|ventilation|isolation|testing)/i],
      forbiddenStandards: [/(1910\.101|compressed gas|cylinder)/i],
      requiredCorrectiveActions: [/(evacuate|locate source|ventilate|shut off|test)/i],
      requireQuestions: true,
      minConfidence: 0.35,
      critical: true,
      notes: "Checks that a generic gas odor does not become a compressed-gas cylinder case.",
    },
    {
      name: "Earplugs forgotten near grinder",
      payload: {
        text: "A worker forgot earplugs while standing near a grinder that runs loud during the shift.",
        scopes: ["osha_general_industry"],
        evidenceTexts: ["earplugs forgotten", "grinder", "runs loud"],
      },
      acceptableHazards: [/noise|hearing|industrial hygiene|exposure/i],
      acceptableJurisdictions: [/osha|1910/i],
      requiredMechanism: [/(noise exposure|hearing exposure|sound pressure|prolonged exposure)/i],
      requiredConsequences: [/(hearing loss|tinnitus|auditory)/i],
      requiredEvidenceGaps: [/(dosimetry|duration|source control|hearing conservation)/i],
      requiredStandards: [/1910\.95/i],
      forbiddenStandards: [/(ppe.*primary|ppe hazard|1910\.101|1910\.147)/i],
      requiredCorrectiveActions: [/(engineering controls|hearing conservation|reduce noise|hearing protection)/i],
      minConfidence: 0.4,
      critical: true,
      notes: "Checks that PPE mention does not become the primary hazard category.",
    },
    {
      name: "Boxes and scrap cluttering hallway",
      payload: {
        text: "Boxes and scrap are cluttering the hallway and narrowing the travel path.",
        scopes: ["osha_general_industry"],
        evidenceTexts: ["boxes", "scrap", "hallway", "travel path"],
      },
      acceptableHazards: [/walking|housekeeping|trip|travel path/i],
      acceptableJurisdictions: [/osha|1910/i],
      requiredMechanism: [/(trip|obstruction|clutter|blocked path)/i],
      requiredConsequences: [/(fall|sprain|strain|stumble)/i],
      requiredEvidenceGaps: [/(lighting|traffic|route|housekeeping)/i],
      requiredStandards: [/1910\.22\(a\)\(3\)/i, /1910\.22\(a\)\(2\)/i],
      forbiddenStandards: [/(1910\.212|56\.14107|1910\.178)/i],
      requiredCorrectiveActions: [/(remove|clear|housekeeping|maintain clear)/i],
      minConfidence: 0.45,
      critical: true,
      notes: "Checks housekeeping/trip reasoning instead of machine guarding.",
    },
    {
      name: "Vague unsafe observation",
      payload: {
        text: "Something seems unsafe in the area.",
        scopes: ["osha_general_industry"],
        evidenceTexts: ["unsafe area"],
      },
      acceptableHazards: [/unknown|review|needs more evidence|unclear/i],
      acceptableJurisdictions: [/unknown|unclear|osha|msha/i],
      requiredEvidenceGaps: [/(what|where|which|equipment|exposure|jurisdiction|more evidence)/i],
      forbiddenStandards: [/(1910\.303|1910\.212|1910\.1200|1910\.178|56\.14107|56\.9100|1910\.101)/i],
      requireControlledOrVague: true,
      requireQuestions: true,
      requireLowConfidence: true,
      maxConfidence: 0.55,
      notes: "Checks that genuinely vague input yields clarification questions instead of a fabricated citation.",
    },
  ];
}

async function runScenario(scenario: Scenario) {
  const { statusCode, raw } = await submitJson(CLASSIFY_URL, scenario.payload);
  if (statusCode < 200 || statusCode >= 300) {
    throw new Error(`HTTP ${statusCode}: ${raw.slice(0, 800)}`);
  }

  let response: any;
  try {
    response = JSON.parse(raw);
  } catch (error) {
    throw new Error(`Invalid JSON for ${scenario.name}: ${(error as Error).message}\nRaw: ${raw.slice(0, 800)}`);
  }

  const result = evaluateScenario(response, scenario);
  const failed = result.failedDimensions;
  const severeFalsePositive = result.severeFalsePositive;

  const topStandards = result.topStandards.length ? result.topStandards.join(" | ") : "none";
  const row = [
    scenario.name,
    `${result.score}%`,
    failed.length ? failed.join(", ") : "none",
    result.classification || "n/a",
    result.risk || "n/a",
    topStandards,
    result.questionText || "n/a",
    result.correctiveActions || "n/a",
  ];

  return {
    ...result,
    row,
    failed,
    severeFalsePositive,
    response,
  };
}

async function main() {
  const scenarios = makeScenarios();
  const failures: { name: string; reason: string }[] = [];
  const rows: string[][] = [];
  const scores: number[] = [];

  console.log("==================================================");
  console.log("HazLenz Authentic Reasoning Evaluation");
  console.log("==================================================");
  console.log(`API: ${CLASSIFY_URL}`);
  console.log(`Scenarios: ${scenarios.length}`);
  console.log(`Threshold: ${REQUIRED_AVERAGE_SCORE}% average\n`);

  for (const scenario of scenarios) {
    try {
      const outcome = await runScenario(scenario);
      scores.push(outcome.score);
      rows.push(outcome.row);

      const failedCritical = scenario.critical && outcome.failed.length > 0;
      const severeFalsePositive = outcome.severeFalsePositive;
      const hasEmptyResult = !outcome.classification && !outcome.topStandards.length && !outcome.mechanism && !outcome.questionText;

      if (failedCritical) {
        failures.push({ name: scenario.name, reason: `critical dimensions failed: ${outcome.failed.join(", ")}` });
      }
      if (severeFalsePositive) {
        failures.push({ name: scenario.name, reason: "severe false-positive standard appeared" });
      }
      if (scenario.critical && hasEmptyResult) {
        failures.push({ name: scenario.name, reason: "critical hazard returned an effectively empty result" });
      }

      console.log(
        [
          `[${outcome.score >= 80 ? "PASS" : "WARN"}] ${scenario.name}`,
          `classification=${outcome.classification || "n/a"}`,
          `risk=${outcome.risk || "n/a"}`,
          `top=${outcome.topStandards.join(" | ") || "none"}`,
          `failed=${outcome.failed.length ? outcome.failed.join(", ") : "none"}`,
        ].join(" | "),
      );
      if (scenario.notes) {
        console.log(`  notes: ${scenario.notes}`);
      }
      if (outcome.failed.length) {
        console.log(`  details: ${outcome.failed.join(" | ")}`);
      }
    } catch (error) {
      failures.push({ name: scenario.name, reason: (error as Error).message });
      rows.push([scenario.name, "0%", "request failed", "n/a", "n/a", "n/a", "n/a", "n/a"]);
      console.error(`[FAIL] ${scenario.name}: ${(error as Error).message}`);
    }
  }

  const average = scores.length ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;

  console.log("\n==================================================");
  console.log("Scorecard");
  console.log("==================================================");
  console.log("Scenario | Score | Failed dimensions | Classification | Risk | Top standards | Evidence gaps | Corrective actions");
  console.log("--------- | ----- | ----------------- | -------------- | ---- | ------------- | ------------- | -----------------");
  for (const row of rows) {
    console.log(row.map((item) => String(item).replace(/\s+/g, " ").trim()).join(" | "));
  }

  console.log("\n==================================================");
  console.log(`Average score: ${average.toFixed(1)}%`);
  console.log(`Critical failures: ${failures.length}`);
  console.log("==================================================");

  if (failures.length || average < REQUIRED_AVERAGE_SCORE) {
    console.log("\nFailures:");
    for (const failure of failures) {
      console.log(`- ${failure.name}: ${failure.reason}`);
    }
    if (average < REQUIRED_AVERAGE_SCORE) {
      console.log(`- Average score ${average.toFixed(1)}% is below threshold ${REQUIRED_AVERAGE_SCORE}%`);
    }
    process.exit(1);
  }

  console.log("\nHazLenz authentic reasoning evaluation passed.");
}

main().catch((error) => {
  console.error("Fatal evaluation error:", error);
  process.exit(1);
});
