/**
 * HazLenz Field Gauntlet
 *
 * This is an authenticity evaluation, not a golden-output snapshot.
 * It runs the real classify endpoint against messy, field-style observations
 * and scores whether HazLenz reasons like a safety professional:
 * observation -> mechanism -> exposure -> consequence -> standards -> gaps -> controls.
 *
 * The goal is to expose shallow keyword matching, wrong jurisdiction, wrong standards,
 * weak mechanisms, weak evidence gaps, and generic corrective actions.
 * Expand this over time using anonymized field observations.
 */

import * as fs from "node:fs";
import * as http from "node:http";
import * as https from "node:https";
import * as path from "node:path";

type Pattern = RegExp | string;

type ScenarioDefinition = {
  name: string;
  text: string;
  scopes: readonly string[];
  evidenceTexts: readonly string[];
  acceptableHazards?: Pattern[];
  acceptableJurisdictions?: Pattern[];
  requiredMechanism?: Pattern[];
  requiredConsequences?: Pattern[];
  requiredRiskConcepts?: Pattern[];
  severityExpectation?: "low" | "medium" | "high" | "critical";
  requiredEvidenceGaps?: Pattern[];
  requiredStandards?: Pattern[];
  forbiddenStandards?: Pattern[];
  forbiddenConcepts?: Pattern[];
  requiredCorrectiveActions?: Pattern[];
  minConfidence?: number;
  maxConfidence?: number;
  requireLowConfidence?: boolean;
  requireQuestions?: boolean;
  requireControlledOrVague?: boolean;
  critical?: boolean;
  stopWorkRecommended?: boolean;
  escalationRecommended?: boolean;
  notes: string;
};

type Scenario = ScenarioDefinition & {
  payload: {
    text: string;
    scopes: string[];
    evidenceTexts: string[];
  };
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

type DimensionResult = {
  name: string;
  ok: boolean;
  weight: number;
  detail: string;
  missing?: string[];
  hits?: string[];
};

type ScenarioOutcome = {
  score: number;
  status: "PASS" | "NEEDS_REVIEW" | "FAIL";
  failedDimensions: string[];
  dimensions: DimensionResult[];
  topStandards: string[];
  classification: string;
  risk: string;
  confidence?: number;
  confidenceBand?: string;
  evidenceGaps: string;
  correctiveActions: string;
  mechanism: string;
  questionText: string;
  allText: string;
  standardText: string;
  rawResponse: unknown;
  missingExpectedConcepts: string[];
  questionableInferences: string[];
  overreachWarnings: string[];
  severeFalsePositive: boolean;
  responseEmpty: boolean;
};

const BASE_URL = process.env.SENTINEL_API_URL || "http://localhost:4000";
const CLASSIFY_URL = joinUrl(BASE_URL, "/safescope-v2/classify");
const REPORT_DIR = process.env.HAZLENZ_GAUNTLET_REPORT_DIR
  ? path.resolve(process.env.HAZLENZ_GAUNTLET_REPORT_DIR)
  : path.resolve(__dirname, "../../../tmp");
const REPORT_JSON = process.env.OUTPUT_JSON
  ? path.resolve(process.env.OUTPUT_JSON)
  : path.join(REPORT_DIR, "hazlenz-field-gauntlet-report.json");
const REPORT_MD = process.env.OUTPUT_MD
  ? path.resolve(process.env.OUTPUT_MD)
  : path.join(REPORT_DIR, "hazlenz-field-gauntlet-report.md");
const REQUIRED_AVERAGE_SCORE = 80;
const PASS_SCORE = 80;
const REVIEW_SCORE = 60;
const REQUEST_SPACING_MS = Number(process.env.HAZLENZ_GAUNTLET_DELAY_MS || 2500);
const REQUEST_RETRY_DELAY_MS = Number(process.env.HAZLENZ_GAUNTLET_RETRY_DELAY_MS || 5000);
const SEVERE_FALSE_POSITIVE_PATTERNS: Pattern[] = [
  /1910\.101/i,
  /compressed gas/i,
  /cylinder/i,
  /1910\.147/i,
  /lockout\/?tagout/i,
  /loto/i,
  /1910\.146/i,
];

const OSHA_GI = ["osha_general_industry"];
const OSHA_CONSTRUCTION = ["osha_construction"];
const MSHA = ["msha"];
const UNKNOWN = ["unknown"];

function joinUrl(base: string, pathPart: string): string {
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  return new URL(pathPart.replace(/^\//, ""), normalizedBase).toString();
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

function matchingPatterns(text: string, patterns: Pattern[] = []): string[] {
  return patterns.filter((pattern) => asPattern(pattern).test(text)).map(String);
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
    response?.promotion?.approvedRecordCandidate,
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
  return collectStandards(response).map(standardDecisionText).join(" \n ");
}

function mechanismText(response: any): string {
  return deepText({
    mechanismChain: response?.mechanismChain,
    inspectionMechanismChain: response?.inspectionIntelligence?.mechanismChain,
    mechanismOfInjury: response?.mechanismOfInjury,
    decisionSummary: response?.decisionSummary,
    standardsReasoning: response?.standardsReasoning,
    riskReasoning: response?.riskReasoning,
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
    response?.decisionSummary,
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

async function delay(ms: number): Promise<void> {
  if (!ms || ms <= 0) return;
  await new Promise((resolve) => setTimeout(resolve, ms));
}

function severityPatterns(severity?: ScenarioDefinition["severityExpectation"]): Pattern[] {
  switch (severity) {
    case "low":
      return [/(low|minor|limited|review|watch)/i];
    case "medium":
      return [/(moderate|medium|elevated|significant)/i];
    case "high":
      return [/(high|serious|severe|significant)/i];
    case "critical":
      return [/(critical|imminent|fatal|catastrophic|extreme)/i];
    default:
      return [];
  }
}

function makeScenario(def: ScenarioDefinition): Scenario {
  return {
    ...def,
    payload: {
      text: def.text,
      scopes: [...def.scopes],
      evidenceTexts: [...def.evidenceTexts],
    },
  };
}

type ScenarioCase = {
  title: string;
  text: string;
  evidenceTexts: readonly string[];
  scopes?: readonly string[];
  overrides?: Partial<Omit<ScenarioDefinition, "name" | "text" | "scopes" | "evidenceTexts">>;
};

function expandGroup(
  group: string,
  base: Omit<ScenarioDefinition, "name" | "text" | "scopes" | "evidenceTexts"> & { scopes: readonly string[] },
  cases: ScenarioCase[],
): ScenarioDefinition[] {
  return cases.map((scenario) => ({
    ...base,
    ...scenario.overrides,
    name: `${group} - ${scenario.title}`,
    text: scenario.text,
    scopes: [...(scenario.scopes || base.scopes)],
    evidenceTexts: [...scenario.evidenceTexts],
    notes: scenario.overrides?.notes || base.notes,
  }));
}

function scenarioScoreWeights(): Record<string, number> {
  return {
    classification: 12,
    jurisdiction: 8,
    mechanism: 18,
    consequence: 12,
    risk: 8,
    standards: 16,
    evidenceGaps: 10,
    correctiveActions: 8,
    confidence: 4,
    falsePositives: 4,
  };
}

function evaluateResponse(response: any, scenario: Scenario): ScenarioOutcome {
  const stripAdvisoryGuardrails = (value: any): any => {
    if (!value || typeof value !== "object") return value;
    if (Array.isArray(value)) return value.map(stripAdvisoryGuardrails);
    const cleaned: Record<string, any> = {};
    for (const [key, entry] of Object.entries(value)) {
      if (key === "advisoryGuardrails" || key === "qualifiedReviewDisclaimer") continue;
      cleaned[key] = stripAdvisoryGuardrails(entry);
    }
    return cleaned;
  };

  const allText = deepText({
    classification: response?.classification,
    hazardCategory: response?.hazardCategory,
    candidateStandardFamily: response?.candidateStandardFamily,
    confidence: response?.confidence,
    confidenceBand: response?.confidenceBand,
    risk: stripAdvisoryGuardrails(response?.risk),
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
    inspectionIntelligence: stripAdvisoryGuardrails(response?.inspectionIntelligence),
    evidenceGapQuestions: response?.evidenceGapQuestions,
    questions: response?.questions,
    correctiveActions: response?.correctiveActions,
    generatedActions: response?.generatedActions,
  });
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
  const confidence = confidenceValue(response);
  const confidenceBand = String(response?.confidenceBand || response?.inspectionIntelligence?.confidenceBand || "").toLowerCase();

  const dimensions: DimensionResult[] = [];
  const weights = scenarioScoreWeights();
  const requiredRiskConcepts = scenario.requiredRiskConcepts?.length
    ? scenario.requiredRiskConcepts
    : severityPatterns(scenario.severityExpectation);

  function addDimension(
    name: keyof ReturnType<typeof scenarioScoreWeights>,
    ok: boolean,
    detail: string,
    missing?: string[],
    hits?: string[],
  ) {
    dimensions.push({
      name,
      ok,
      weight: weights[name],
      detail,
      missing,
      hits,
    });
  }

  if (scenario.acceptableHazards?.length) {
    const hits = matchingPatterns(classification, scenario.acceptableHazards).concat(matchingPatterns(allText, scenario.acceptableHazards));
    const ok = hits.length > 0;
    addDimension(
      "classification",
      ok,
      ok ? "matched expected hazard family" : `missing expected hazard concepts: ${scenario.acceptableHazards.map(String).join(", ")}`,
      ok ? [] : scenario.acceptableHazards.map(String),
      hits,
    );
  }

  if (scenario.acceptableJurisdictions?.length) {
    const hits = matchingPatterns(jurisdiction, scenario.acceptableJurisdictions).concat(matchingPatterns(allText, scenario.acceptableJurisdictions));
    const ok = hits.length > 0;
    addDimension(
      "jurisdiction",
      ok,
      ok ? "matched expected jurisdiction" : `missing expected jurisdiction concepts: ${scenario.acceptableJurisdictions.map(String).join(", ")}`,
      ok ? [] : scenario.acceptableJurisdictions.map(String),
      hits,
    );
  }

  if (scenario.requiredMechanism?.length) {
    const hits = matchingPatterns(mechanism, scenario.requiredMechanism).concat(matchingPatterns(allText, scenario.requiredMechanism));
    const ok = hits.length > 0;
    addDimension(
      "mechanism",
      ok,
      ok ? "mechanism chain contains required concepts" : `missing mechanism concepts: ${scenario.requiredMechanism.map(String).join(", ")}`,
      ok ? [] : scenario.requiredMechanism.map(String),
      hits,
    );
  }

  if (scenario.requiredConsequences?.length) {
    const hits = matchingPatterns(mechanism, scenario.requiredConsequences).concat(matchingPatterns(allText, scenario.requiredConsequences));
    const ok = hits.length > 0;
    addDimension(
      "consequence",
      ok,
      ok ? "consequence language is present" : `missing consequence concepts: ${scenario.requiredConsequences.map(String).join(", ")}`,
      ok ? [] : scenario.requiredConsequences.map(String),
      hits,
    );
  }

  if (requiredRiskConcepts.length) {
    const hits = matchingPatterns(risk, requiredRiskConcepts).concat(matchingPatterns(allText, requiredRiskConcepts));
    const ok = hits.length > 0;
    addDimension(
      "risk",
      ok,
      ok ? "risk language is present" : `missing risk concepts: ${requiredRiskConcepts.map(String).join(", ")}`,
      ok ? [] : requiredRiskConcepts.map(String),
      hits,
    );
  }

  if (scenario.requiredStandards?.length) {
    const hits = matchingPatterns(standardText, scenario.requiredStandards).concat(matchingPatterns(allText, scenario.requiredStandards));
    const ok = hits.length > 0;
    addDimension(
      "standards",
      ok,
      ok ? "required standard concept present" : `missing required standards: ${scenario.requiredStandards.map(String).join(", ")}`,
      ok ? [] : scenario.requiredStandards.map(String),
      hits,
    );
  }

  if (scenario.requiredEvidenceGaps?.length || scenario.requireQuestions) {
    const questionHits = matchesAny(questionText, scenario.requiredEvidenceGaps || []) || matchesAny(allText, scenario.requiredEvidenceGaps || []);
    const ok = (scenario.requiredEvidenceGaps?.length ? questionHits : true) && (!scenario.requireQuestions || Boolean(questionText.trim()));
    addDimension(
      "evidenceGaps",
      ok,
      ok ? "questions/evidence gaps are present" : `missing evidence gap concepts: ${(scenario.requiredEvidenceGaps || []).map(String).join(", ")}`,
      ok ? [] : (scenario.requiredEvidenceGaps || []).map(String),
      questionHits ? (scenario.requiredEvidenceGaps || []).map(String) : [],
    );
  }

  if (scenario.requiredCorrectiveActions?.length) {
    const hits = matchingPatterns(actionText, scenario.requiredCorrectiveActions).concat(matchingPatterns(allText, scenario.requiredCorrectiveActions));
    const ok = hits.length > 0;
    addDimension(
      "correctiveActions",
      ok,
      ok ? "corrective actions reflect the mechanism" : `missing corrective action concepts: ${scenario.requiredCorrectiveActions.map(String).join(", ")}`,
      ok ? [] : scenario.requiredCorrectiveActions.map(String),
      hits,
    );
  }

  if (scenario.minConfidence !== undefined || scenario.maxConfidence !== undefined || scenario.requireLowConfidence) {
    let ok = true;
    if (scenario.minConfidence !== undefined) ok = ok && typeof confidence === "number" && confidence >= scenario.minConfidence;
    if (scenario.maxConfidence !== undefined) ok = ok && typeof confidence === "number" && confidence <= scenario.maxConfidence;
    if (scenario.requireLowConfidence) {
      ok =
        ok &&
        (confidenceBand === "low" ||
          confidenceBand === "very low" ||
          (typeof confidence === "number" && confidence <= 0.45));
    }
    addDimension(
      "confidence",
      ok,
      ok ? `confidence acceptable (${confidence ?? "n/a"})` : `confidence out of range (${confidence ?? "n/a"})`,
      ok ? [] : ["confidence"],
      typeof confidence === "number" ? [String(confidence)] : [],
    );
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
    const ok = /controlled|review|needs more evidence|more evidence|unclear|vague|safe|guarded|locked out|no active|confirm/i.test(controlledText);
    addDimension(
      "falsePositives",
      ok,
      ok ? "response remains controlled/vague" : "response escalated too aggressively for a safe/unclear condition",
      ok ? [] : ["controlled/vague handling"],
    );
  }

  if (scenario.forbiddenStandards?.length) {
    const violated = scenario.forbiddenStandards.find((pattern) => matchesAny(standardText, [pattern]));
    addDimension(
      "falsePositives",
      !violated,
      violated ? `forbidden standard matched: ${String(violated)}` : "no forbidden standards present",
      violated ? [String(violated)] : [],
      violated ? [String(violated)] : [],
    );
  }

  if (scenario.forbiddenConcepts?.length) {
    const hits = matchingPatterns(allText, scenario.forbiddenConcepts);
    const ok = hits.length === 0;
    addDimension(
      "falsePositives",
      ok,
      ok ? "no forbidden concepts present" : `forbidden concepts appeared: ${hits.join(", ")}`,
      ok ? [] : hits,
      hits,
    );
  }

  const applicableDimensions = dimensions.filter((dimension) => dimension.weight > 0);
  const weightedTotal = applicableDimensions.reduce((sum, dimension) => sum + dimension.weight, 0) || 1;
  const weightedScore = applicableDimensions.reduce(
    (sum, dimension) => sum + (dimension.ok ? dimension.weight : 0),
    0,
  );
  const score = Math.round((weightedScore / weightedTotal) * 100);

  const failedDimensions = dimensions.filter((dimension) => !dimension.ok).map((dimension) => dimension.name);
  const topStandards = collectStandards(response)
    .slice(0, 6)
    .map((item) => item.citation || item.title || "")
    .filter(Boolean);

  const forbiddenHits = [
    ...(scenario.forbiddenStandards || []).filter((pattern) => matchesAny(standardText, [pattern])).map(String),
    ...(scenario.forbiddenConcepts || []).filter((pattern) => matchesAny(allText, [pattern])).map(String),
  ];

  const severeFalsePositive =
    forbiddenHits.some((hit) => SEVERE_FALSE_POSITIVE_PATTERNS.some((pattern) => asPattern(pattern).test(hit))) ||
    false;

  const responseEmpty = !classification && !topStandards.length && !mechanism && !questionText && !actionText;
  const classificationName = response?.classification || response?.hazardCategory || response?.candidateStandardFamily || "";

  return {
    score,
    status:
      severeFalsePositive || (scenario.critical && failedDimensions.length > 0) || responseEmpty || score < REVIEW_SCORE
        ? score >= PASS_SCORE && !severeFalsePositive && failedDimensions.length === 0 && !responseEmpty
          ? "PASS"
          : score >= REVIEW_SCORE
            ? "NEEDS_REVIEW"
            : "FAIL"
        : score >= PASS_SCORE
          ? "PASS"
          : "NEEDS_REVIEW",
    failedDimensions,
    dimensions,
    topStandards,
    classification: classificationName,
    risk,
    confidence,
    confidenceBand,
    evidenceGaps: questionText.slice(0, 260),
    correctiveActions: actionText.slice(0, 260),
    mechanism,
    questionText,
    allText,
    standardText,
    rawResponse: response,
    missingExpectedConcepts: failedDimensions.flatMap((dimension) =>
      dimensions.find((entry) => entry.name === dimension)?.missing || [dimension],
    ),
    questionableInferences: forbiddenHits,
    overreachWarnings: forbiddenHits,
    severeFalsePositive,
    responseEmpty,
  };
}

function buildScoreLabel(score: number, status: ScenarioOutcome["status"]): string {
  return `${score}% (${status})`;
}

function runQualityChecks(response: any, scenario: Scenario, outcome: ScenarioOutcome): string[] {
  const warnings: string[] = [];
  if (scenario.critical && outcome.responseEmpty) {
    warnings.push("critical hazard returned an effectively empty result");
  }
  if (!outcome.classification && outcome.topStandards.length > 0) {
    warnings.push("standards present but classification is missing");
  }
  if (outcome.severeFalsePositive) {
    warnings.push("severe false-positive standard appeared");
  }
  if (scenario.requireQuestions && !outcome.questionText.trim()) {
    warnings.push("missing evidence-gap questions");
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
    if (!/controlled|review|needs more evidence|more evidence|unclear|vague|safe|guarded|locked out|no active|confirm/i.test(controlledText)) {
      warnings.push("safe/vague condition was over-classified");
    }
  }
  return warnings;
}

function renderMarkdownReport(
  outcomes: Array<ScenarioOutcome & { scenario: Scenario; warnings: string[] }>,
  averageScore: number,
): string {
  const passed = outcomes.filter((outcome) => outcome.status === "PASS").length;
  const needsReview = outcomes.filter((outcome) => outcome.status === "NEEDS_REVIEW").length;
  const failed = outcomes.filter((outcome) => outcome.status === "FAIL").length;

  const weaknessTally = new Map<string, number>();
  for (const outcome of outcomes) {
    for (const dimension of outcome.dimensions.filter((item) => !item.ok)) {
      weaknessTally.set(dimension.name, (weaknessTally.get(dimension.name) || 0) + 1);
    }
    for (const warning of outcome.warnings) {
      weaknessTally.set(warning, (weaknessTally.get(warning) || 0) + 1);
    }
  }

  const topWeaknesses = Array.from(weaknessTally.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const strongest = [...outcomes].sort((a, b) => b.score - a.score).slice(0, 5);
  const weakest = [...outcomes].sort((a, b) => a.score - b.score).slice(0, 5);

  const lines: string[] = [];
  lines.push("# HazLenz Field Gauntlet Report");
  lines.push("");
  lines.push(`- Scenarios: ${outcomes.length}`);
  lines.push(`- Pass: ${passed}`);
  lines.push(`- Needs review: ${needsReview}`);
  lines.push(`- Fail: ${failed}`);
  lines.push(`- Average score: ${averageScore.toFixed(1)}%`);
  lines.push("");
  lines.push("## Top weakness themes");
  lines.push("");
  if (topWeaknesses.length === 0) {
    lines.push("- None");
  } else {
    for (const [theme, count] of topWeaknesses) {
      lines.push(`- ${theme}: ${count}`);
    }
  }
  lines.push("");
  lines.push("## Strongest outputs");
  lines.push("");
  for (const outcome of strongest) {
    lines.push(`- ${outcome.scenario.name} — ${outcome.score}% — ${outcome.classification || "n/a"} — ${outcome.topStandards[0] || "no standard"}`);
  }
  lines.push("");
  lines.push("## Weakest outputs");
  lines.push("");
  for (const outcome of weakest) {
    lines.push(`- ${outcome.scenario.name} — ${outcome.score}% — ${outcome.classification || "n/a"} — ${outcome.topStandards[0] || "no standard"}`);
  }
  lines.push("");
  lines.push("## Scenario detail");
  lines.push("");
  for (const outcome of outcomes) {
    lines.push(`### ${outcome.scenario.name}`);
    lines.push(`- Status: ${outcome.status}`);
    lines.push(`- Score: ${outcome.score}%`);
    lines.push(`- Observation: ${outcome.scenario.text}`);
    lines.push(`- Scopes: ${outcome.scenario.scopes.join(", ")}`);
    lines.push(`- Classification: ${outcome.classification || "n/a"}`);
    lines.push(`- Risk: ${outcome.risk || "n/a"}`);
    lines.push(`- Confidence: ${outcome.confidence ?? "n/a"}${outcome.confidenceBand ? ` (${outcome.confidenceBand})` : ""}`);
    lines.push(`- Top standards: ${outcome.topStandards.length ? outcome.topStandards.join(" | ") : "none"}`);
    lines.push(`- Mechanism: ${outcome.mechanism || "n/a"}`);
    lines.push(`- Evidence gaps: ${outcome.evidenceGaps || "n/a"}`);
    lines.push(`- Corrective actions: ${outcome.correctiveActions || "n/a"}`);
    lines.push(`- Missing expected concepts: ${outcome.missingExpectedConcepts.length ? outcome.missingExpectedConcepts.join(", ") : "none"}`);
    lines.push(`- Questionable inferences: ${outcome.questionableInferences.length ? outcome.questionableInferences.join(", ") : "none"}`);
    lines.push(`- Warnings: ${outcome.warnings.length ? outcome.warnings.join(" | ") : "none"}`);
    lines.push(`- Stop-work/escalation: ${outcome.scenario.stopWorkRecommended ? "consider stop-work" : outcome.scenario.escalationRecommended ? "consider escalation" : "not explicitly required"}`);
    lines.push("");
  }

  return lines.join("\n");
}

function buildFieldGauntletScenarios(): ScenarioDefinition[] {
  const scenarios: ScenarioDefinition[] = [];

  const machineGuardingBase = {
    scopes: MSHA,
    acceptableHazards: [/machine guarding|conveyor|guard|caught[- ]in|pinch point/i],
    acceptableJurisdictions: [/msha|mine|aggregate|30 cfr|part 56|part 57|osha/i],
    requiredMechanism: [/(caught[- ]in|nip point|pinch point|entanglement|drawn into|in[- ]running)/i],
    requiredConsequences: [/(amputation|crush|crushing|serious injury|fatal)/i],
    requiredRiskConcepts: [/(high|critical|serious|severe)/i],
    requiredEvidenceGaps: [/(guard|access|running|cleanup|status|lockout)/i],
    requiredStandards: [/(56\.14107|1910\.212)/i],
    forbiddenStandards: [/(1910\.1200|1910\.101|1910\.178|1910\.146)/i],
    forbiddenConcepts: [/(hazcom|compressed gas|confined space)/i],
    requiredCorrectiveActions: [/(guard|stop|lockout|restrict access|replace|repair)/i],
    minConfidence: 0.5,
    critical: true,
    severityExpectation: "high" as const,
    stopWorkRecommended: true,
    notes: "Checks machine guarding and caught-in reasoning.",
  };
  scenarios.push(
    ...expandGroup(
      "Machine guarding",
      machineGuardingBase,
      [
        {
          title: "Conveyor tail pulley missing guard during cleanup",
          text: "At the aggregate plant, the conveyor tail pulley is missing its guard and miners clean spilled material near the moving belt during cleanup.",
          evidenceTexts: ["tail pulley missing guard", "cleanup near moving belt", "aggregate plant", "miners nearby"],
          overrides: { requiredStandards: [/56\.14107/i] },
        },
        {
          title: "Missing grinder tongue guard",
          text: "A handheld grinder is being used without its tongue guard while the operator stands in line with the wheel.",
          evidenceTexts: ["grinder", "tongue guard missing", "wheel", "line of fire"],
          scopes: OSHA_GI,
          overrides: {
            acceptableJurisdictions: [/osha|1910/i],
            requiredStandards: [/1910\.215/i],
            forbiddenStandards: [/(1910\.147|1910\.1200|1910\.101)/i],
            notes: "Checks small hand tool guarding and wheel exposure.",
          },
        },
        {
          title: "Exposed rotating shaft coupling",
          text: "A rotating shaft coupling on the production line is exposed with employees working within reach during normal operation.",
          evidenceTexts: ["rotating shaft", "coupling exposed", "employees within reach"],
          scopes: OSHA_GI,
          overrides: {
            requiredStandards: [/1910\.212/i],
            notes: "Checks exposed rotating parts and reach-in exposure.",
          },
        },
        {
          title: "Nip point at rollers",
          text: "Material feed rollers create an accessible nip point where hands could be drawn into the machine.",
          evidenceTexts: ["rollers", "nip point", "hands drawn in"],
          scopes: OSHA_GI,
          overrides: {
            requiredStandards: [/1910\.212/i],
            notes: "Checks pinch-point / nip-point language.",
          },
        },
        {
          title: "Interlocked guard defeated",
          text: "An interlocked guard has been bypassed so the machine can run with the access door open.",
          evidenceTexts: ["interlocked guard bypassed", "door open", "machine running"],
          scopes: OSHA_GI,
          overrides: {
            requiredStandards: [/1910\.212/i],
            requiredEvidenceGaps: [/(bypass|interlock|door|open|run)/i],
            notes: "Checks defeated interlock / guard bypass reasoning.",
          },
        },
        {
          title: "Point-of-operation guard missing",
          text: "The press brake point of operation is unguarded and the operator's hands are close to the pinch point during setup.",
          evidenceTexts: ["press brake", "point of operation", "unguarded", "setup"],
          scopes: OSHA_GI,
          overrides: {
            requiredStandards: [/1910\.212/i],
            notes: "Checks point-of-operation guarding.",
          },
        },
        {
          title: "Safe guarded conveyor locked out",
          text: "Conveyor tail pulley is fully guarded and locked out for maintenance while the area remains barricaded.",
          evidenceTexts: ["fully guarded", "locked out", "maintenance", "barricaded"],
          overrides: {
            acceptableHazards: [/controlled|safe|review|maintenance|guarded/i],
            requiredStandards: [],
            requiredEvidenceGaps: [/(confirm|review|status|maintenance)/i],
            forbiddenStandards: [/(56\.14107|1910\.212|1910\.147)/i],
            requireControlledOrVague: true,
            requireQuestions: true,
            critical: false,
            stopWorkRecommended: false,
            notes: "Anti-regurgitation safe condition.",
          },
        },
      ],
    ),
  );

  const lotoBase = {
    scopes: OSHA_GI,
    acceptableHazards: [/lockout|stored energy|hazardous energy|servicing|loto/i],
    acceptableJurisdictions: [/osha|1910/i],
    requiredMechanism: [/(unexpected energization|energy isolation|stored energy|servicing|jam clearing|startup)/i],
    requiredConsequences: [/(crush|shock|unexpected startup|serious injury|fatal)/i],
    requiredRiskConcepts: [/(high|critical|serious|severe)/i],
    requiredEvidenceGaps: [/(isolation|verification|stored energy|start-up|maintenance|energy source)/i],
    requiredStandards: [/1910\.147/i],
    forbiddenStandards: [/(1910\.1200|1910\.101|1910\.178|1910\.212)/i],
    requiredCorrectiveActions: [/(lockout|verify|isolate|de-energize|clear jam|release energy)/i],
    minConfidence: 0.55,
    critical: true,
    severityExpectation: "high" as const,
    stopWorkRecommended: true,
    notes: "Checks hazardous energy / LOTO reasoning.",
  };
  scenarios.push(
    ...expandGroup(
      "Lockout / hazardous energy",
      lotoBase,
      [
        {
          title: "Maintenance while energized",
          text: "Maintenance is being performed while the machine remains energized and a guard panel is removed.",
          evidenceTexts: ["maintenance", "energized", "guard panel removed"],
          overrides: {
            requiredStandards: [/1910\.147/i, /1910\.303/i],
            notes: "Checks energized maintenance with LOTO and electrical overlap.",
          },
        },
        {
          title: "Jam clearing without isolation",
          text: "Workers clear a jam from a running conveyor without locking out the machine or releasing stored energy.",
          evidenceTexts: ["jam clearing", "running conveyor", "no lockout"],
          scopes: MSHA,
          overrides: {
            acceptableJurisdictions: [/msha|mine|30 cfr|osha/i],
            requiredStandards: [/1910\.147/i, /56\.12016/i],
            notes: "Checks jam clearing without isolation.",
          },
        },
        {
          title: "Multiple energy sources",
          text: "The equipment has electrical, hydraulic, and pneumatic energy sources but only the main disconnect is addressed before servicing.",
          evidenceTexts: ["electrical", "hydraulic", "pneumatic", "servicing"],
          overrides: {
            requiredStandards: [/1910\.147/i],
            requiredEvidenceGaps: [/(hydraulic|pneumatic|stored energy|secondary source|verify)/i],
            notes: "Checks multiple energy source control.",
          },
        },
        {
          title: "Stored hydraulic energy",
          text: "A hydraulic ram can drop after power is removed because stored pressure has not been relieved.",
          evidenceTexts: ["hydraulic ram", "stored pressure", "power removed"],
          overrides: {
            requiredStandards: [/1910\.147/i],
            notes: "Checks stored hydraulic energy and release.",
          },
        },
        {
          title: "Contractor servicing equipment",
          text: "A contractor is servicing a line while plant staff keep the equipment available for quick restart during the repair.",
          evidenceTexts: ["contractor", "servicing", "quick restart"],
          overrides: {
            requiredStandards: [/1910\.147/i],
            requiredEvidenceGaps: [/(contractor|responsibility|communication|isolation)/i],
            notes: "Checks contractor coordination during servicing.",
          },
        },
        {
          title: "Startup after maintenance",
          text: "The machine starts unexpectedly after maintenance because the stored energy and start-up checks were not verified.",
          evidenceTexts: ["maintenance", "unexpected start", "stored energy"],
          overrides: {
            requiredStandards: [/1910\.147/i],
            notes: "Checks startup after maintenance.",
          },
        },
        {
          title: "Safe locked out equipment",
          text: "The line is locked out, de-energized, and tested before maintenance begins.",
          evidenceTexts: ["locked out", "de-energized", "tested"],
          overrides: {
            acceptableHazards: [/controlled|safe|review|maintenance|locked out/i],
            requiredStandards: [],
            requiredEvidenceGaps: [/(confirm|verification|maintenance|review)/i],
            forbiddenStandards: [/(1910\.147|1910\.212|1910\.1200)/i],
            requireControlledOrVague: true,
            requireQuestions: true,
            critical: false,
            stopWorkRecommended: false,
            notes: "Anti-regurgitation safe condition.",
          },
        },
      ],
    ),
  );

  const walkingBase = {
    scopes: OSHA_GI,
    acceptableHazards: [/walking|working surfaces|housekeeping|slip|trip|fall/i],
    acceptableJurisdictions: [/osha|1910/i],
    requiredMechanism: [/(trip|slip|stumble|obstruction|travel path|walking surface)/i],
    requiredConsequences: [/(fall|sprain|strain|struck against|bruise)/i],
    requiredRiskConcepts: [/(medium|elevated|high|serious)/i],
    requiredEvidenceGaps: [/(lighting|traffic|alternate route|walkway|housekeeping|cleaning)/i],
    requiredStandards: [/1910\.22\(a\)\(2\)/i, /1910\.22\(a\)\(3\)/i],
    forbiddenStandards: [/(1910\.178|1910\.212|56\.9100|1910\.1200)/i],
    forbiddenConcepts: [/(machine guarding|forklift|compressed gas)/i],
    requiredCorrectiveActions: [/(remove|reroute|clear|inspect|housekeeping|clean)/i],
    minConfidence: 0.45,
    critical: true,
    severityExpectation: "medium" as const,
    stopWorkRecommended: false,
    notes: "Checks housekeeping and slip-trip-fall reasoning.",
  };
  scenarios.push(
    ...expandGroup(
      "Walking-working surfaces / housekeeping",
      walkingBase,
      [
        {
          title: "Oil spill near walkway",
          text: "Oil spilled near the pedestrian walkway and the floor remains slick where employees walk through the area.",
          evidenceTexts: ["oil spill", "pedestrian walkway", "slick floor"],
          overrides: {
            requiredStandards: [/1910\.22\(a\)\(2\)/i],
            notes: "Checks spill-to-slip-path reasoning.",
          },
        },
        {
          title: "Extension cord across aisle",
          text: "An extension cord crosses the aisle and people have to step over it to reach the work area.",
          evidenceTexts: ["extension cord", "crosses aisle", "step over"],
          overrides: {
            requiredStandards: [/1910\.22\(a\)\(3\)/i],
            notes: "Checks trip hazard from cord routing.",
          },
        },
        {
          title: "Damaged stairs",
          text: "A damaged stair tread and uneven riser create a trip hazard on the access stairs.",
          evidenceTexts: ["damaged stairs", "uneven riser", "access stairs"],
          overrides: {
            requiredStandards: [/1910\.22\(a\)\(1\)|1910\.28/i],
            notes: "Checks stair condition and access hazard.",
          },
        },
        {
          title: "Missing handrail",
          text: "The stair landing is missing a handrail and the edge is open toward the lower level.",
          evidenceTexts: ["missing handrail", "stair landing", "open edge"],
          overrides: {
            acceptableHazards: [/walking|working surfaces|fall|guardrail|handrail/i],
            requiredStandards: [/1910\.28/i],
            notes: "Checks handrail / edge transition.",
          },
        },
        {
          title: "Open floor hole",
          text: "A floor hole near the conveyor access point is open and uncovered during normal work.",
          evidenceTexts: ["floor hole", "uncovered", "conveyor access"],
          overrides: {
            requiredStandards: [/1910\.28|1910\.22/i],
            notes: "Checks floor hole / opening hazard.",
          },
        },
        {
          title: "Cluttered work area",
          text: "Boxes, scrap, and cords clutter the work area and narrow the travel path.",
          evidenceTexts: ["boxes", "scrap", "cords", "travel path"],
          overrides: {
            requiredStandards: [/1910\.22\(a\)\(3\)/i],
            notes: "Checks cluttered workspace / housekeeping.",
          },
        },
        {
          title: "Maintenance bay spill near drain",
          text: "A leak near the drain leaves residue on the floor in the maintenance bay.",
          evidenceTexts: ["leak near drain", "residue", "maintenance bay"],
          overrides: {
            acceptableHazards: [/hazard communication|chemical|spill|environmental|housekeeping/i],
            requiredStandards: [/1910\.22|1910\.1200/i],
            forbiddenConcepts: [/(machine guarding|forklift)/i],
            notes: "Tricky leak/drain case should not force machine guarding.",
          },
        },
      ],
    ),
  );

  const fallBase = {
    scopes: OSHA_CONSTRUCTION,
    acceptableHazards: [/fall|guardrail|ladder|scaffold|working at height/i],
    acceptableJurisdictions: [/construction|1926|osha/i],
    requiredMechanism: [/(fall from height|unprotected edge|lower level|loss of balance|elevated work)/i],
    requiredConsequences: [/(fracture|head injury|fatal|serious injury|fall)/i],
    requiredRiskConcepts: [/(high|critical|serious|severe)/i],
    requiredEvidenceGaps: [/(height|access|guardrail|tie off|platform|inspection)/i],
    requiredStandards: [/1926\.501|1926\.451|1926\.1053|1910\.28/i],
    forbiddenStandards: [/(1910\.212|1910\.1200|1910\.178)/i],
    requiredCorrectiveActions: [/(guardrail|fall protection|remove from service|inspect|tie off|protect)/i],
    minConfidence: 0.5,
    critical: true,
    severityExpectation: "high" as const,
    stopWorkRecommended: true,
    notes: "Checks elevated work and fall-control reasoning.",
  };
  scenarios.push(
    ...expandGroup(
      "Fall protection / ladders / elevated work",
      fallBase,
      [
        {
          title: "Worker on roof edge",
          text: "Workers are on a roof edge with no visible fall protection while staging materials near the unprotected side.",
          evidenceTexts: ["roof edge", "no fall protection", "unprotected side"],
          overrides: {
            requiredStandards: [/1926\.501/i],
            notes: "Checks roof edge fall exposure.",
          },
        },
        {
          title: "Aerial lift without tie-off",
          text: "A worker in an aerial lift is not tied off and is leaning out over the rail to reach the task.",
          evidenceTexts: ["aerial lift", "not tied off", "leaning out"],
          overrides: {
            requiredStandards: [/1926\.453|1926\.502/i],
            notes: "Checks aerial lift tie-off and reach-out exposure.",
          },
        },
        {
          title: "Damaged ladder",
          text: "A damaged ladder with cracked side rails is still being used for access to a mezzanine.",
          evidenceTexts: ["damaged ladder", "cracked side rails", "mezzanine"],
          overrides: {
            requiredStandards: [/1926\.1053/i],
            notes: "Checks damaged ladder use.",
          },
        },
        {
          title: "Ladder used incorrectly",
          text: "The ladder is set on a muddy base and extends only a short distance above the landing.",
          evidenceTexts: ["muddy base", "short extension", "landing"],
          overrides: {
            requiredStandards: [/1926\.1053/i],
            notes: "Checks improper ladder setup.",
          },
        },
        {
          title: "Scaffold missing guardrails",
          text: "A scaffold at the renovation site is missing its guardrail on the working platform.",
          evidenceTexts: ["scaffold", "missing guardrail", "working platform"],
          overrides: {
            requiredStandards: [/1926\.451/i],
            forbiddenStandards: [/(1926\.501|1910\.28|1910\.212)/i],
            notes: "Checks scaffold-specific reasoning over broad fall protection.",
          },
        },
        {
          title: "Unprotected platform edge",
          text: "A maintenance platform has an unprotected edge and employees are working within reach of the drop.",
          evidenceTexts: ["maintenance platform", "unprotected edge", "drop"],
          overrides: {
            requiredStandards: [/1910\.28|1926\.501/i],
            notes: "Checks unprotected platform edge.",
          },
        },
      ],
    ),
  );

  const electricalBase = {
    scopes: OSHA_GI,
    acceptableHazards: [/electrical|shock|energized|arc|panel|cord/i],
    acceptableJurisdictions: [/osha|1910/i],
    requiredMechanism: [/(exposed conductor|contact with energized parts|current leakage|arc|wet surface|blocked access)/i],
    requiredConsequences: [/(shock|electrocution|burn|arc flash|fire)/i],
    requiredRiskConcepts: [/(high|critical|serious|severe)/i],
    requiredEvidenceGaps: [/(voltage|energized|de-energized|gfcI|cover|disconnect|wet)/i],
    requiredStandards: [/1910\.303|1910\.305|1910\.334/i],
    forbiddenStandards: [/(1910\.147|1910\.146|1910\.1200|1910\.178)/i],
    forbiddenConcepts: [/(compressed gas|scaffold)/i],
    requiredCorrectiveActions: [/(remove from service|repair|replace|de-energize|cover|clear|gfcI)/i],
    minConfidence: 0.45,
    critical: true,
    severityExpectation: "high" as const,
    stopWorkRecommended: true,
    notes: "Checks electrical exposure and equipment integrity.",
  };
  scenarios.push(
    ...expandGroup(
      "Electrical",
      electricalBase,
      [
        {
          title: "Exposed conductors",
          text: "Exposed conductors are visible at a splice point near the workbench.",
          evidenceTexts: ["exposed conductors", "splice point", "workbench"],
          overrides: {
            requiredStandards: [/1910\.303/i],
            notes: "Checks live-part exposure.",
          },
        },
        {
          title: "Open electrical panel",
          text: "An electrical panel has an open breaker slot and missing cover plate in the shop.",
          evidenceTexts: ["open breaker slot", "missing cover plate", "shop panel"],
          overrides: {
            requiredStandards: [/1910\.303/i],
            notes: "Checks open panel / missing cover.",
          },
        },
        {
          title: "Damaged extension cord",
          text: "A portable grinder has a damaged power cord lying on a damp floor in the shop.",
          evidenceTexts: ["damaged cord", "portable grinder", "damp floor"],
          overrides: {
            requiredStandards: [/1910\.305\(g\)\(2\)\(iii\)/i, /1910\.334\(a\)\(2\)\(ii\)/i],
            forbiddenStandards: [/(1910\.147|1910\.146|1910\.1200|1910\.101)/i],
            notes: "Checks damaged cord with wet-area exposure.",
          },
        },
        {
          title: "Blocked electrical disconnect",
          text: "Pallets block the electrical disconnect so workers cannot reach it quickly during an emergency.",
          evidenceTexts: ["blocked disconnect", "pallets", "emergency"],
          overrides: {
            requiredStandards: [/1910\.303/i],
            notes: "Checks access to disconnect / emergency shutdown.",
          },
        },
        {
          title: "Wet location electrical use",
          text: "A cord-and-plug tool is being used in a wet area without a clear drying or GFCI control.",
          evidenceTexts: ["wet area", "cord-and-plug tool", "GFCI"],
          overrides: {
            requiredStandards: [/1910\.303|1910\.304/i],
            notes: "Checks wet-location electrical use.",
          },
        },
        {
          title: "Missing GFCI on construction site",
          text: "Temporary power on the construction site lacks GFCI protection for handheld tools.",
          evidenceTexts: ["temporary power", "construction site", "missing GFCI"],
          scopes: OSHA_CONSTRUCTION,
          overrides: {
            acceptableJurisdictions: [/construction|1926|osha/i],
            requiredStandards: [/1926\.404/i],
            notes: "Checks construction GFCI / temporary power.",
          },
        },
      ],
    ),
  );

  const mobileBase = {
    scopes: MSHA,
    acceptableHazards: [/mobile equipment|traffic|forklift|vehicle|pedestrian/i],
    acceptableJurisdictions: [/msha|mine|aggregate|30 cfr|osha/i],
    requiredMechanism: [/(struck[- ]by|backing|traffic conflict|blind corner|pedestrian exposure)/i],
    requiredConsequences: [/(crush|struck[- ]by|serious injury|fatal)/i],
    requiredRiskConcepts: [/(high|critical|serious|severe)/i],
    requiredEvidenceGaps: [/(traffic control|spotter|marked route|separation|backup alarm|seat belt)/i],
    requiredStandards: [/56\.9100|1910\.178/i],
    forbiddenStandards: [/(1910\.212|1910\.1200|1910\.101|1910\.146)/i],
    forbiddenConcepts: [/(compressed gas|guardrail)/i],
    requiredCorrectiveActions: [/(separate|mark|spotter|control traffic|route|repair)/i],
    minConfidence: 0.5,
    critical: true,
    severityExpectation: "high" as const,
    stopWorkRecommended: true,
    notes: "Checks mobile equipment and pedestrian interaction.",
  };
  scenarios.push(
    ...expandGroup(
      "Powered industrial trucks / mobile equipment",
      mobileBase,
      [
        {
          title: "Forklift pedestrian interaction",
          text: "A forklift and pedestrians share the same aisle with no traffic control or spotter in the congested area.",
          evidenceTexts: ["forklift", "pedestrians", "no traffic control"],
          overrides: {
            requiredStandards: [/56\.9100|1910\.178/i],
            notes: "Checks forklift / pedestrian interaction.",
          },
        },
        {
          title: "Backup alarm not working",
          text: "The forklift backup alarm is not working and the operator backs through a blind area.",
          evidenceTexts: ["backup alarm not working", "backs", "blind area"],
          overrides: {
            requiredStandards: [/1910\.178|56\.9100/i],
            notes: "Checks backup alarm failure.",
          },
        },
        {
          title: "Seatbelt not used",
          text: "The forklift operator drives without a seatbelt while the forks are elevated slightly above travel height.",
          evidenceTexts: ["seatbelt", "forks elevated", "travel"],
          overrides: {
            requiredStandards: [/1910\.178/i],
            notes: "Checks seatbelt and travel posture.",
          },
        },
        {
          title: "Elevated forks",
          text: "A pallet truck is traveling with elevated forks through the work area and passing close to pedestrians.",
          evidenceTexts: ["elevated forks", "pallet truck", "pedestrians"],
          overrides: {
            requiredStandards: [/1910\.178/i],
            notes: "Checks elevated forks during travel.",
          },
        },
        {
          title: "Damaged forklift",
          text: "A damaged forklift has a leaking hydraulic line and worn tires but remains in service.",
          evidenceTexts: ["damaged forklift", "leaking hydraulic line", "worn tires"],
          overrides: {
            requiredStandards: [/1910\.178/i],
            notes: "Checks damaged PIT remaining in service.",
          },
        },
        {
          title: "Blind corner traffic exposure",
          text: "Blind corner traffic exposure leaves pedestrians and mobile equipment unable to see each other in the stockpile yard.",
          evidenceTexts: ["blind corner", "pedestrians", "stockpile yard"],
          overrides: {
            requiredStandards: [/56\.9100/i],
            notes: "Checks blind-corner traffic exposure.",
          },
        },
      ],
    ),
  );

  const excavationBase = {
    scopes: OSHA_CONSTRUCTION,
    acceptableHazards: [/excavation|trench|trenching|underground|utility/i],
    acceptableJurisdictions: [/construction|1926|osha/i],
    requiredMechanism: [/(collapse|cave[- ]?in|struck[- ]by|engulfment|utility strike)/i],
    requiredConsequences: [/(serious injury|fatal|crush|asphyxiation|electric shock)/i],
    requiredRiskConcepts: [/(high|critical|serious|severe)/i],
    requiredEvidenceGaps: [/(sloping|shoring|shielding|spoils|water|egress|utilities)/i],
    requiredStandards: [/1926\.651|1926\.652|1926\.653/i],
    forbiddenStandards: [/(1910\.212|1910\.1200|1910\.101|1910\.178)/i],
    requiredCorrectiveActions: [/(protect|shoring|sloping|shield|locate utilities|remove water|egress)/i],
    minConfidence: 0.5,
    critical: true,
    severityExpectation: "high" as const,
    stopWorkRecommended: true,
    notes: "Checks excavation and trench protection reasoning.",
  };
  scenarios.push(
    ...expandGroup(
      "Excavation / trenching / construction",
      excavationBase,
      [
        {
          title: "Unprotected trench",
          text: "An unprotected trench is open at the roadway repair site with workers nearby.",
          evidenceTexts: ["unprotected trench", "roadway repair", "workers nearby"],
          overrides: {
            requiredStandards: [/1926\.652/i],
            notes: "Checks unprotected trench.",
          },
        },
        {
          title: "Spoil pile at edge",
          text: "Spoil piles are stacked at the trench edge and the wall shows cracking.",
          evidenceTexts: ["spoil piles", "trench edge", "wall cracking"],
          overrides: {
            requiredStandards: [/1926\.651/i],
            notes: "Checks spoil pile placement and cave-in risk.",
          },
        },
        {
          title: "Water accumulation",
          text: "Water has accumulated in the trench and the bottom is soft and unstable.",
          evidenceTexts: ["water accumulated", "soft bottom", "unstable"],
          overrides: {
            requiredStandards: [/1926\.652/i],
            notes: "Checks water accumulation in trench.",
          },
        },
        {
          title: "No ladder from trench",
          text: "Workers are in a trench more than 4 feet deep but there is no ladder or other egress nearby.",
          evidenceTexts: ["no ladder", "trench", "egress"],
          overrides: {
            requiredStandards: [/1926\.651/i],
            notes: "Checks trench egress.",
          },
        },
        {
          title: "Excavator struck-by exposure",
          text: "An excavator swings material near workers and there is a struck-by exposure around the bucket path.",
          evidenceTexts: ["excavator", "struck-by", "bucket path"],
          overrides: {
            requiredStandards: [/1926\.651/i],
            notes: "Checks struck-by exposure around excavation equipment.",
          },
        },
        {
          title: "Overhead utility concern",
          text: "Overhead utility lines run above the excavation route and the equipment boom could contact them.",
          evidenceTexts: ["overhead utility", "boom", "contact"],
          overrides: {
            requiredStandards: [/1926\.1410|1926\.651/i],
            notes: "Checks overhead utility concern.",
          },
        },
      ],
    ),
  );

  const confinedBase = {
    scopes: OSHA_GI,
    acceptableHazards: [/confined space|atmosphere|oxygen|entry/i],
    acceptableJurisdictions: [/osha|1910/i],
    requiredMechanism: [/(hazardous atmosphere|engulfment|entrapment|entry without classification|line breaking)/i],
    requiredConsequences: [/(asphyxiation|poisoning|entrapment|fatal|explosion)/i],
    requiredRiskConcepts: [/(high|critical|serious|severe)/i],
    requiredEvidenceGaps: [/(permit|atmospheric testing|rescue|isolation|entry|attendant|ventilation)/i],
    requiredStandards: [/1910\.146/i],
    forbiddenStandards: [/(1910\.101|1910\.178|1910\.1200|1910\.212)/i],
    requiredCorrectiveActions: [/(do not enter|test|ventilate|permit|rescue|attendant|isolate)/i],
    minConfidence: 0.45,
    critical: true,
    severityExpectation: "high" as const,
    stopWorkRecommended: true,
    notes: "Checks confined-space atmosphere and permit reasoning.",
  };
  scenarios.push(
    ...expandGroup(
      "Confined space",
      confinedBase,
      [
        {
          title: "Tank entry without permit",
          text: "A tank needs entry but there is no permit and the opening remains unclassified.",
          evidenceTexts: ["tank entry", "no permit", "unclassified"],
          overrides: {
            requiredStandards: [/1910\.146/i],
            notes: "Checks permit absence.",
          },
        },
        {
          title: "Unknown atmosphere",
          text: "The manhole atmosphere has not been tested and the oxygen reading looks low.",
          evidenceTexts: ["manhole", "atmosphere not tested", "oxygen low"],
          overrides: {
            requiredStandards: [/1910\.146/i],
            notes: "Checks low oxygen / unknown atmosphere.",
          },
        },
        {
          title: "Attendant missing",
          text: "Workers are in a permit-required space but no attendant is posted at the entrance.",
          evidenceTexts: ["permit-required space", "no attendant", "entrance"],
          overrides: {
            requiredStandards: [/1910\.146/i],
            notes: "Checks attendant requirement.",
          },
        },
        {
          title: "Rescue plan missing",
          text: "A rescue plan is missing for vessel entry and supervisors are unsure who would respond.",
          evidenceTexts: ["rescue plan missing", "vessel entry", "supervisors unsure"],
          overrides: {
            requiredStandards: [/1910\.146/i],
            notes: "Checks rescue planning.",
          },
        },
        {
          title: "Ventilation inadequate",
          text: "Ventilation is inadequate in the tunnel and fumes build up during work.",
          evidenceTexts: ["ventilation inadequate", "tunnel", "fumes"],
          overrides: {
            requiredStandards: [/1910\.146/i],
            notes: "Checks ventilation during confined-space work.",
          },
        },
        {
          title: "Line breaking into confined area",
          text: "A line break into the vessel could release product into the confined area during maintenance.",
          evidenceTexts: ["line breaking", "vessel", "confined area", "maintenance"],
          overrides: {
            requiredStandards: [/1910\.146/i],
            notes: "Checks line-breaking into confined area.",
          },
        },
      ],
    ),
  );

  const ihBase = {
    scopes: OSHA_GI,
    acceptableHazards: [/industrial hygiene|exposure|dust|fume|noise|heat|respirator|chemical/i],
    acceptableJurisdictions: [/osha|1910/i],
    requiredMechanism: [/(inhalation|airborne|exposure|contact|dose|release)/i],
    requiredConsequences: [/(lung|hearing|illness|burn|poisoning|heat stress|sensitization)/i],
    requiredRiskConcepts: [/(medium|high|critical|serious|elevated)/i],
    requiredEvidenceGaps: [/(monitoring|sampling|ventilation|controls|PPE|fit test|duration|source)/i],
    requiredCorrectiveActions: [/(monitor|ventilate|reduce|substitute|fit test|control|isolate)/i],
    minConfidence: 0.35,
    critical: true,
    severityExpectation: "medium" as const,
    stopWorkRecommended: false,
    notes: "Checks industrial hygiene and exposure reasoning.",
  };
  scenarios.push(
    ...expandGroup(
      "Industrial hygiene / health",
      ihBase,
      [
        {
          title: "Silica dust during cutting",
          text: "Silica dust is visible during cutting and workers may be breathing the dust cloud.",
          evidenceTexts: ["silica dust", "cutting", "dust cloud"],
          scopes: OSHA_CONSTRUCTION,
          overrides: {
            acceptableJurisdictions: [/construction|1926|osha/i],
            requiredStandards: [/1926\.1153/i],
            notes: "Checks respirable crystalline silica exposure.",
          },
        },
        {
          title: "Welding fumes in enclosed area",
          text: "Welding fumes build up in an enclosed area with no obvious local exhaust ventilation.",
          evidenceTexts: ["welding fumes", "enclosed area", "no ventilation"],
          overrides: {
            requiredStandards: [/1910\.252|1910\.94/i],
            notes: "Checks welding fume exposure.",
          },
        },
        {
          title: "Solvent use without ventilation",
          text: "Workers use solvent to clean parts in a small room without ventilation or odor control.",
          evidenceTexts: ["solvent", "small room", "no ventilation"],
          overrides: {
            requiredStandards: [/1910\.1000|1910\.1200/i],
            notes: "Checks solvent inhalation / chemical exposure.",
          },
        },
        {
          title: "Noise exposure",
          text: "Noise near the crusher is high enough that workers need hearing conservation review.",
          evidenceTexts: ["noise", "crusher", "hearing conservation"],
          scopes: MSHA,
          overrides: {
            acceptableJurisdictions: [/msha|mine|30 cfr|osha/i],
            requiredStandards: [/62\.110|1910\.95/i],
            notes: "Checks noise exposure.",
          },
        },
        {
          title: "Heat stress",
          text: "The crew is working in high heat and humidity with little shade or rest opportunity.",
          evidenceTexts: ["high heat", "humidity", "little shade"],
          overrides: {
            requiredStandards: [/1910\.132|heat/i],
            notes: "Checks heat-stress exposure and recovery control.",
          },
        },
        {
          title: "Chemical splash potential",
          text: "A corrosive chemical is poured from one container to another and splash potential is obvious.",
          evidenceTexts: ["corrosive chemical", "poured", "splash potential"],
          overrides: {
            requiredStandards: [/1910\.132|1910\.1200/i],
            notes: "Checks splash potential and eye/skin exposure.",
          },
        },
        {
          title: "Respirator use without fit test",
          text: "A worker wears a respirator but there is no fit test or program record available.",
          evidenceTexts: ["respirator", "no fit test", "no program record"],
          overrides: {
            requiredStandards: [/1910\.134/i],
            notes: "Checks respirator program / fit test.",
          },
        },
        {
          title: "Asbestos or lead suspicion",
          text: "Old insulation and dust raise asbestos or lead suspicion during demolition prep.",
          evidenceTexts: ["old insulation", "dust", "demolition prep"],
          scopes: OSHA_CONSTRUCTION,
          overrides: {
            acceptableJurisdictions: [/construction|1926|osha/i],
            requiredStandards: [/1926\.1101|1926\.62/i],
            notes: "Checks asbestos / lead suspicion.",
          },
        },
      ],
    ),
  );

  const spillBase = {
    scopes: OSHA_GI,
    acceptableHazards: [/spill|release|chemical|used oil|drum|waste/i],
    acceptableJurisdictions: [/osha|1910|environment/i],
    requiredMechanism: [/(spill|release|leak|contamination|drain|soil|water|tracking)/i],
    requiredConsequences: [/(slip|trip|fall|contamination|environmental|skin|eye)/i],
    requiredRiskConcepts: [/(medium|high|serious|elevated)/i],
    requiredEvidenceGaps: [/(label|lid|contents|drain|containment|secondary containment|cleanup)/i],
    requiredCorrectiveActions: [/(close|label|contain|move|cleanup|dispose|isolate|segregate)/i],
    minConfidence: 0.4,
    critical: true,
    severityExpectation: "medium" as const,
    stopWorkRecommended: false,
    notes: "Checks spill/release and environmental-adjacent reasoning.",
  };
  scenarios.push(
    ...expandGroup(
      "Environmental-adjacent / spill exposure",
      spillBase,
      [
        {
          title: "Open used-oil container",
          text: "An open container of used oil is sitting on the shop floor near a pedestrian walkway.",
          evidenceTexts: ["open used oil container", "shop floor", "pedestrian walkway"],
          overrides: {
            requiredStandards: [/1910\.22|1910\.1200/i],
            forbiddenStandards: [/(1910\.101|compressed gas|cylinder)/i],
            notes: "Checks used oil spill / walk-path contamination.",
          },
        },
        {
          title: "Leaking drum",
          text: "A leaking drum in the maintenance bay is staining the floor and needs containment.",
          evidenceTexts: ["leaking drum", "staining the floor", "containment"],
          overrides: {
            requiredStandards: [/1910\.1200|1910\.22/i],
            notes: "Checks leaking drum and spill containment.",
          },
        },
        {
          title: "Chemical near drain",
          text: "Chemical containers are stored near a floor drain without secondary containment.",
          evidenceTexts: ["chemical containers", "floor drain", "no secondary containment"],
          overrides: {
            requiredStandards: [/1910\.1200/i],
            notes: "Checks release pathway near a drain.",
          },
        },
        {
          title: "Incompatible storage",
          text: "Incompatible chemicals are stored together and one container is leaking onto the shelf.",
          evidenceTexts: ["incompatible chemicals", "leaking onto the shelf"],
          overrides: {
            requiredStandards: [/1910\.1200/i],
            notes: "Checks incompatibility and release potential.",
          },
        },
        {
          title: "Battery acid spill potential",
          text: "Battery acid is staged on a cart and the caps look loose enough to spill if moved quickly.",
          evidenceTexts: ["battery acid", "caps loose", "spill"],
          overrides: {
            requiredStandards: [/1910\.1200/i],
            notes: "Checks battery acid spill potential.",
          },
        },
        {
          title: "Unlabeled waste container",
          text: "An unlabeled waste container sits by the maintenance sink and the contents are unknown.",
          evidenceTexts: ["unlabeled waste container", "contents unknown"],
          overrides: {
            requiredStandards: [/1910\.1200/i],
            forbiddenStandards: [/(1910\.101|compressed gas|cylinder|1910\.147)/i],
            notes: "Checks unlabeled waste container without compressed-gas drift.",
          },
        },
      ],
    ),
  );

  const fireBase = {
    scopes: OSHA_GI,
    acceptableHazards: [/fire|emergency|life safety|flammable|gas|eyewash/i],
    acceptableJurisdictions: [/osha|1910/i],
    requiredMechanism: [/(ignition|blocked access|emergency response|release|heat|spark)/i],
    requiredConsequences: [/(fire|burn|explosion|delayed response|smoke)/i],
    requiredRiskConcepts: [/(high|critical|serious|severe)/i],
    requiredEvidenceGaps: [/(access|route|clearance|permit|storage|response)/i],
    requiredCorrectiveActions: [/(clear|unblock|relocate|protect|permit|maintain|shutdown)/i],
    minConfidence: 0.45,
    critical: true,
    severityExpectation: "high" as const,
    stopWorkRecommended: true,
    notes: "Checks emergency access and fire-control reasoning.",
  };
  scenarios.push(
    ...expandGroup(
      "Fire / emergency / life safety",
      fireBase,
      [
        {
          title: "Blocked extinguisher",
          text: "A pallet blocks access to the fire extinguisher in the corridor.",
          evidenceTexts: ["blocked extinguisher", "pallet", "corridor"],
          overrides: {
            requiredStandards: [/1910\.157/i],
            notes: "Checks extinguisher access.",
          },
        },
        {
          title: "Blocked exit",
          text: "The exit route is blocked by storage carts and workers have to detour around them.",
          evidenceTexts: ["blocked exit", "storage carts", "detour"],
          overrides: {
            requiredStandards: [/1910\.37/i],
            notes: "Checks blocked exit route.",
          },
        },
        {
          title: "Flammable storage issue",
          text: "Flammable liquids are stored in a hallway with open shelves and no clear separation from ignition sources.",
          evidenceTexts: ["flammable liquids", "hallway", "ignition sources"],
          overrides: {
            requiredStandards: [/1910\.106/i],
            notes: "Checks flammable storage.",
          },
        },
        {
          title: "Hot work near combustibles",
          text: "Hot work is being performed next to stored combustibles without a clear fire watch or permit.",
          evidenceTexts: ["hot work", "stored combustibles", "fire watch", "permit"],
          overrides: {
            requiredStandards: [/1910\.252|1926\.352/i],
            forbiddenStandards: [/(1910\.147|1910\.146|1910\.101)/i],
            notes: "Checks hot-work ignition control.",
          },
        },
        {
          title: "Missing eyewash access",
          text: "The emergency eyewash is blocked by supplies and the operator would not reach it quickly after a splash.",
          evidenceTexts: ["eyewash blocked", "supplies", "splash"],
          overrides: {
            requiredStandards: [/1910\.151/i],
            notes: "Checks emergency eyewash access.",
          },
        },
        {
          title: "Compressed gas near ignition source",
          text: "A compressed gas cylinder sits near a welding area and the ignition source is too close.",
          evidenceTexts: ["compressed gas cylinder", "welding area", "ignition source"],
          overrides: {
            requiredStandards: [/1910\.101/i],
            notes: "Checks real cylinder exposure, not generic gas wording.",
          },
        },
      ],
    ),
  );

  const mshaBase = {
    scopes: MSHA,
    acceptableHazards: [/msha|mine|aggregate|crusher|berm|highwall|trailing cable|plant/i],
    acceptableJurisdictions: [/msha|mine|aggregate|30 cfr|part 56|part 57/i],
    requiredMechanism: [/(struck[- ]by|cave[- ]in|tip[- ]over|entanglement|electrical contact|fall exposure)/i],
    requiredConsequences: [/(serious injury|fatal|crush|electrocution|fall)/i],
    requiredRiskConcepts: [/(high|critical|serious|severe)/i],
    requiredEvidenceGaps: [/(pre[- ]op|workplace exam|berm|highwall|trailing cable|walkway)/i],
    requiredCorrectiveActions: [/(remove|repair|berm|maintain|exam|guard|isolate)/i],
    minConfidence: 0.45,
    critical: true,
    severityExpectation: "high" as const,
    stopWorkRecommended: true,
    notes: "Checks mining-specific reasoning and 30 CFR alignment.",
  };
  scenarios.push(
    ...expandGroup(
      "MSHA / mining-specific",
      mshaBase,
      [
        {
          title: "Conveyor guarding",
          text: "The mine conveyor tail pulley is missing a guard and miners clean spillage near the moving belt.",
          evidenceTexts: ["mine conveyor", "tail pulley", "spillage", "moving belt"],
          overrides: {
            requiredStandards: [/56\.14107/i],
            notes: "Checks MSHA conveyor guarding.",
          },
        },
        {
          title: "Berm missing at elevated roadway",
          text: "A berm is missing along the elevated roadway near the stockpile edge.",
          evidenceTexts: ["berm missing", "elevated roadway", "stockpile edge"],
          overrides: {
            requiredStandards: [/56\.9300|56\.9301/i],
            notes: "Checks berm / traffic edge protection.",
          },
        },
        {
          title: "Mobile equipment pre-op defect",
          text: "A pre-op inspection found a mobile equipment brake defect and the unit should not be returned to service.",
          evidenceTexts: ["pre-op inspection", "brake defect", "do not return to service"],
          overrides: {
            requiredStandards: [/56\.14100|56\.9100/i],
            notes: "Checks pre-op defect on mobile equipment.",
          },
        },
        {
          title: "Highwall / ground control concern",
          text: "The highwall shows tension cracks and loose material that could fall into the work area below.",
          evidenceTexts: ["highwall", "tension cracks", "loose material"],
          overrides: {
            requiredStandards: [/56\.3200|56\.3130/i],
            notes: "Checks ground control / highwall concern.",
          },
        },
        {
          title: "Workplace exam observation",
          text: "The workplace exam did not document the travelway hazard and the observed condition remained uncorrected.",
          evidenceTexts: ["workplace exam", "travelway hazard", "uncorrected"],
          overrides: {
            requiredStandards: [/56\.18002/i],
            notes: "Checks workplace examination observation.",
          },
        },
        {
          title: "Trailing cable damage",
          text: "A damaged trailing cable lies across the wet mine floor near the feeder and shows exposed insulation.",
          evidenceTexts: ["damaged trailing cable", "wet mine floor", "exposed insulation"],
          overrides: {
            requiredStandards: [/56\.12013|57\.12004/i],
            notes: "Checks MSHA electrical trailing cable damage.",
          },
        },
        {
          title: "Housekeeping around plant walkway",
          text: "Scrap, hoses, and loose rock clutter the plant walkway and narrow the travel path.",
          evidenceTexts: ["scrap", "hoses", "loose rock", "plant walkway"],
          overrides: {
            requiredStandards: [/56\.20003|1910\.22/i],
            forbiddenStandards: [/(1910\.178|1910\.212)/i],
            notes: "Checks housekeeping around a plant walkway.",
          },
        },
        {
          title: "Crusher platform fall hazard",
          text: "Employees are exposed to a fall hazard at the crusher platform edge with no barrier in place.",
          evidenceTexts: ["crusher platform", "fall hazard", "no barrier"],
          overrides: {
            requiredStandards: [/56\.11012|1910\.28/i],
            notes: "Checks fall hazard at crusher platform.",
          },
        },
      ],
    ),
  );

  const trickyBase = {
    scopes: UNKNOWN,
    acceptableHazards: [/unknown|review|needs more evidence|unclear|possible/i],
    acceptableJurisdictions: [/unknown|unclear|osha|msha/i],
    requiredEvidenceGaps: [/(what|where|which|equipment|exposure|jurisdiction|more evidence|confirm)/i],
    requiredRiskConcepts: [/(review|unclear|needs more evidence|possible|unknown)/i],
    requireQuestions: true,
    requireLowConfidence: true,
    maxConfidence: 0.55,
    critical: true,
    stopWorkRecommended: false,
    notes: "Checks ambiguous observations and anti-regurgitation behavior.",
  };
  scenarios.push(
    ...expandGroup(
      "Ambiguous / tricky",
      trickyBase,
      [
        {
          title: "Severe-looking but incomplete",
          text: "The area looks dangerous but the photo is cropped and it is not clear what failed.",
          evidenceTexts: ["cropped photo", "looks dangerous", "unclear failure"],
          overrides: {
            requireControlledOrVague: true,
            forbiddenStandards: [/(1910\.212|1910\.101|1910\.147|56\.14107)/i],
            notes: "Checks incomplete evidence without overclaiming.",
          },
        },
        {
          title: "Vague photo description",
          text: "A blurry photo shows a worker near equipment and the report does not identify the hazard.",
          evidenceTexts: ["blurry photo", "near equipment", "hazard not identified"],
          overrides: {
            requireControlledOrVague: true,
            notes: "Checks vague photo handling.",
          },
        },
        {
          title: "Conflicting evidence",
          text: "One note says the guard is missing but another says the guard was reinstalled before the inspection.",
          evidenceTexts: ["guard missing", "guard reinstalled"],
          overrides: {
            requireControlledOrVague: true,
            notes: "Checks conflicting evidence handling.",
          },
        },
        {
          title: "Safe condition not over-classified",
          text: "The conveyor tail pulley is fully guarded and locked out for maintenance while the area is barricaded.",
          evidenceTexts: ["fully guarded", "locked out", "barricaded"],
          overrides: {
            acceptableHazards: [/controlled|safe|review|maintenance|guarded/i],
            requiredStandards: [],
            requiredEvidenceGaps: [/(confirm|review|status|maintenance)/i],
            forbiddenStandards: [/(56\.14107|1910\.212|1910\.147)/i],
            requireControlledOrVague: true,
            requireQuestions: true,
            critical: false,
            notes: "Checks safe condition with hazard words present.",
          },
        },
        {
          title: "Non-violation improvement opportunity",
          text: "Housekeeping could be improved by moving stored items away from the wall, but no immediate exposure is obvious.",
          evidenceTexts: ["housekeeping", "stored items", "no immediate exposure"],
          overrides: {
            acceptableHazards: [/housekeeping|review|improvement|unclear/i],
            requireControlledOrVague: true,
            forbiddenStandards: [/(1910\.212|1910\.101|1910\.147|56\.9100)/i],
            notes: "Checks improvement opportunity without violation language.",
          },
        },
        {
          title: "Two hazards in one observation",
          text: "A leaking drum sits beside an open walkway and a damaged cord runs through the same area.",
          evidenceTexts: ["leaking drum", "open walkway", "damaged cord"],
          overrides: {
            acceptableHazards: [/spill|electrical|walking|housekeeping/i],
            requiredStandards: [/1910\.1200|1910\.305/i],
            notes: "Checks mixed-hazard observations and prioritization.",
          },
        },
        {
          title: "Wrong jurisdiction trap",
          text: "MSHA-like equipment appears in an OSHA shop and the note does not clarify whether this is a mine site.",
          evidenceTexts: ["MSHA-like equipment", "OSHA shop", "not clarify mine site"],
          overrides: {
            acceptableHazards: [/osha|msha|unclear|review/i],
            requireControlledOrVague: true,
            notes: "Checks jurisdiction ambiguity trap.",
          },
        },
        {
          title: "Empty clean container",
          text: "A secondary container is empty and clean after use, with no residue or unknown contents.",
          evidenceTexts: ["empty", "clean", "no residue", "unknown contents"],
          overrides: {
            acceptableHazards: [/review|container|unknown|empty/i],
            forbiddenStandards: [/(1910\.101|compressed gas|cylinder|1910\.147)/i],
            requireControlledOrVague: true,
            notes: "Checks that empty/clean containers are not forced into HazCom or compressed gas.",
          },
        },
        {
          title: "Secured oxygen cylinder",
          text: "A secured oxygen cylinder is chained upright and stored away from traffic.",
          evidenceTexts: ["secured oxygen cylinder", "chained upright", "away from traffic"],
          overrides: {
            acceptableHazards: [/controlled|safe|review|cylinder/i],
            forbiddenStandards: [/(1910\.101|projectile|unsecured)/i],
            requireControlledOrVague: true,
            notes: "Checks secured cylinder vs. unsecured false positive.",
          },
        },
        {
          title: "PPE mention should not dominate",
          text: "A worker forgot earplugs while standing near a loud grinder with flying particles and dust.",
          evidenceTexts: ["earplugs", "loud grinder", "flying particles", "dust"],
          overrides: {
            acceptableHazards: [/noise|grinder|dust|exposure/i],
            requiredStandards: [/1910\.95|1910\.212/i],
            forbiddenConcepts: [/(ppe.*primary|ppe hazard)/i],
            notes: "Checks that PPE mention does not become the primary hazard.",
          },
        },
        {
          title: "Natural gas odor not cylinder storage",
          text: "A boiler room has a natural gas odor and the source has not been found.",
          evidenceTexts: ["natural gas odor", "boiler room", "source not found"],
          overrides: {
            acceptableHazards: [/gas leak|fire|ventilation|unknown/i],
            forbiddenStandards: [/(1910\.101|compressed gas|cylinder)/i],
            requireQuestions: true,
            notes: "Checks that a gas odor does not become a cylinder storage case.",
          },
        },
        {
          title: "Generic gas term not compressed gas",
          text: "The area smells like gas after the heater cycles, but there is no cylinder or storage context.",
          evidenceTexts: ["smells like gas", "heater cycles", "no cylinder"],
          overrides: {
            acceptableHazards: [/gas leak|ventilation|unknown|review/i],
            forbiddenStandards: [/(1910\.101|cylinder|compressed gas)/i],
            requireQuestions: true,
            notes: "Checks generic gas wording without cylinder evidence.",
          },
        },
      ],
    ),
  );

  return scenarios;
}

async function classifyScenario(scenario: Scenario) {
  if (REQUEST_SPACING_MS > 0) {
    await delay(REQUEST_SPACING_MS);
  }

  const response = await submitJson(CLASSIFY_URL, scenario.payload);
  if (response.statusCode === 429) {
    await delay(REQUEST_RETRY_DELAY_MS);
    const retry = await submitJson(CLASSIFY_URL, scenario.payload);
    if (retry.statusCode < 200 || retry.statusCode >= 300) {
      throw new Error(`HTTP ${retry.statusCode}: ${retry.raw.slice(0, 800)}`);
    }
    try {
      return JSON.parse(retry.raw);
    } catch (error) {
      throw new Error(`Invalid JSON for ${scenario.name}: ${(error as Error).message}\nRaw: ${retry.raw.slice(0, 800)}`);
    }
  }
  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw new Error(`HTTP ${response.statusCode}: ${response.raw.slice(0, 800)}`);
  }

  try {
    return JSON.parse(response.raw);
  } catch (error) {
    throw new Error(`Invalid JSON for ${scenario.name}: ${(error as Error).message}\nRaw: ${response.raw.slice(0, 800)}`);
  }
}

function statusFromScore(score: number, failedDimensions: string[], severeFalsePositive: boolean, responseEmpty: boolean): ScenarioOutcome["status"] {
  if (severeFalsePositive || responseEmpty || failedDimensions.includes("classification") && failedDimensions.includes("mechanism")) {
    return "FAIL";
  }
  if (score >= PASS_SCORE && failedDimensions.length === 0) return "PASS";
  if (score >= REVIEW_SCORE) return "NEEDS_REVIEW";
  return "FAIL";
}

function summarizeOutcome(
  scenario: Scenario,
  response: any,
  evaluated: ScenarioOutcome,
): ScenarioOutcome & { scenario: Scenario; warnings: string[] } {
  const warnings = runQualityChecks(response, scenario, evaluated);
  const status = statusFromScore(evaluated.score, evaluated.failedDimensions, evaluated.severeFalsePositive, evaluated.responseEmpty);
  const result: ScenarioOutcome & { scenario: Scenario; warnings: string[] } = {
    ...evaluated,
    status,
    scenario,
    warnings,
  };
  return result;
}

function makeShortText(value: unknown, limit = 240): string {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  return text.length > limit ? `${text.slice(0, limit - 1)}…` : text;
}

async function writeReports(
  outcomes: Array<ScenarioOutcome & { scenario: Scenario; warnings: string[] }>,
  averageScore: number,
): Promise<void> {
  fs.mkdirSync(REPORT_DIR, { recursive: true });

  const passCount = outcomes.filter((outcome) => outcome.status === "PASS").length;
  const reviewCount = outcomes.filter((outcome) => outcome.status === "NEEDS_REVIEW").length;
  const failCount = outcomes.filter((outcome) => outcome.status === "FAIL").length;

  const themeCounts = new Map<string, number>();
  for (const outcome of outcomes) {
    for (const dimension of outcome.dimensions.filter((entry) => !entry.ok)) {
      themeCounts.set(dimension.name, (themeCounts.get(dimension.name) || 0) + 1);
    }
    for (const warning of outcome.warnings) {
      themeCounts.set(warning, (themeCounts.get(warning) || 0) + 1);
    }
    for (const hit of outcome.questionableInferences) {
      const label = /1910\.147|loto/i.test(hit)
        ? "LOTO overreach"
        : /1910\.101|compressed gas|cylinder/i.test(hit)
          ? "Compressed-gas overreach"
          : /1910\.212|machine guarding/i.test(hit)
            ? "Machine-guarding overreach"
            : /1910\.1200|hazcom/i.test(hit)
              ? "HazCom overreach"
              : hit;
      themeCounts.set(label, (themeCounts.get(label) || 0) + 1);
    }
  }

  const topWeaknesses = Array.from(themeCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([theme, count]) => ({ theme, count }));

  const strongestOutputs = [...outcomes]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((outcome) => ({
      scenarioId: outcome.scenario.name,
      score: outcome.score,
      status: outcome.status,
      classification: outcome.classification,
      risk: outcome.risk,
      topStandards: outcome.topStandards.slice(0, 3),
      mechanism: makeShortText(outcome.mechanism),
      evidenceGaps: makeShortText(outcome.evidenceGaps),
      correctiveActions: makeShortText(outcome.correctiveActions),
    }));

  const weakestOutputs = [...outcomes]
    .sort((a, b) => a.score - b.score)
    .slice(0, 5)
    .map((outcome) => ({
      scenarioId: outcome.scenario.name,
      score: outcome.score,
      status: outcome.status,
      classification: outcome.classification,
      risk: outcome.risk,
      topStandards: outcome.topStandards.slice(0, 3),
      mechanism: makeShortText(outcome.mechanism),
      evidenceGaps: makeShortText(outcome.evidenceGaps),
      correctiveActions: makeShortText(outcome.correctiveActions),
    }));

  const jsonReport = {
    generatedAt: new Date().toISOString(),
    apiUrl: CLASSIFY_URL,
    threshold: REQUIRED_AVERAGE_SCORE,
    summary: {
      scenarios: outcomes.length,
      passCount,
      reviewCount,
      failCount,
      averageScore,
    },
    topWeaknesses,
    strongestOutputs,
    weakestOutputs,
    scenarios: outcomes.map((outcome) => ({
      scenario: {
        name: outcome.scenario.name,
        text: outcome.scenario.text,
        scopes: outcome.scenario.scopes,
        evidenceTexts: outcome.scenario.evidenceTexts,
        expectedHazards: outcome.scenario.acceptableHazards?.map(String) || [],
        expectedJurisdictions: outcome.scenario.acceptableJurisdictions?.map(String) || [],
        expectedMechanisms: outcome.scenario.requiredMechanism?.map(String) || [],
        expectedConsequences: outcome.scenario.requiredConsequences?.map(String) || [],
        expectedStandards: outcome.scenario.requiredStandards?.map(String) || [],
        forbiddenStandards: outcome.scenario.forbiddenStandards?.map(String) || [],
        forbiddenConcepts: outcome.scenario.forbiddenConcepts?.map(String) || [],
        expectedCorrectiveActions: outcome.scenario.requiredCorrectiveActions?.map(String) || [],
        severityExpectation: outcome.scenario.severityExpectation || "n/a",
        stopWorkRecommended: Boolean(outcome.scenario.stopWorkRecommended),
        escalationRecommended: Boolean(outcome.scenario.escalationRecommended),
        notes: outcome.scenario.notes,
      },
      score: outcome.score,
      status: outcome.status,
      classification: outcome.classification,
      risk: outcome.risk,
      confidence: outcome.confidence,
      confidenceBand: outcome.confidenceBand,
      topStandards: outcome.topStandards,
      mechanism: outcome.mechanism,
      evidenceGaps: outcome.evidenceGaps,
      correctiveActions: outcome.correctiveActions,
      failedDimensions: outcome.failedDimensions,
      missingExpectedConcepts: outcome.missingExpectedConcepts,
      questionableInferences: outcome.questionableInferences,
      overreachWarnings: outcome.overreachWarnings,
      warnings: outcome.warnings,
      response: outcome.rawResponse,
    })),
  };

  const markdown = renderMarkdownReport(outcomes, averageScore);

  fs.writeFileSync(REPORT_JSON, `${JSON.stringify(jsonReport, null, 2)}\n`, "utf8");
  fs.writeFileSync(REPORT_MD, `${markdown}\n`, "utf8");
}

async function main() {
  const limit = Number(process.env.LIMIT || 0);
  const scenarios = buildFieldGauntletScenarios().map(makeScenario);
  const selectedScenarios = Number.isFinite(limit) && limit > 0 ? scenarios.slice(0, limit) : scenarios;
  const outcomes: Array<ScenarioOutcome & { scenario: Scenario; warnings: string[] }> = [];
  const failures: { name: string; reason: string }[] = [];
  const scores: number[] = [];

  console.log("==================================================");
  console.log("HazLenz Field Gauntlet");
  console.log("==================================================");
  console.log(`API: ${CLASSIFY_URL}`);
  console.log(`Scenarios: ${selectedScenarios.length}`);
  console.log(`Threshold: ${REQUIRED_AVERAGE_SCORE}% average`);
  console.log(`Reports: ${REPORT_JSON}`);
  console.log(`          ${REPORT_MD}\n`);

  for (const scenario of selectedScenarios) {
    try {
      const response = await classifyScenario(scenario);
      const evaluated = evaluateResponse(response, scenario);
      const summary = summarizeOutcome(scenario, response, evaluated);
      outcomes.push(summary);
      scores.push(summary.score);

      const failedCritical = scenario.critical && summary.failedDimensions.length > 0;
      if (failedCritical) {
        failures.push({ name: scenario.name, reason: `critical dimensions failed: ${summary.failedDimensions.join(", ")}` });
      }
      if (summary.severeFalsePositive) {
        failures.push({ name: scenario.name, reason: "severe false-positive standard appeared" });
      }
      if (scenario.critical && summary.responseEmpty) {
        failures.push({ name: scenario.name, reason: "critical hazard returned an effectively empty result" });
      }

      console.log(
        [
          `[${summary.status}] ${scenario.name}`,
          `score=${summary.score}%`,
          `classification=${summary.classification || "n/a"}`,
          `risk=${summary.risk || "n/a"}`,
          `standards=${summary.topStandards.slice(0, 3).join(" | ") || "none"}`,
          `failed=${summary.failedDimensions.length ? summary.failedDimensions.join(", ") : "none"}`,
        ].join(" | "),
      );

      if (scenario.notes) {
        console.log(`  notes: ${scenario.notes}`);
      }
      if (summary.failedDimensions.length) {
        console.log(`  details: ${summary.failedDimensions.join(" | ")}`);
      }
    } catch (error) {
      failures.push({ name: scenario.name, reason: (error as Error).message });
      console.error(`[FAIL] ${scenario.name}: ${(error as Error).message}`);
      outcomes.push({
        scenario,
        score: 0,
        status: "FAIL",
        failedDimensions: ["request failed"],
        dimensions: [],
        topStandards: [],
        classification: "",
        risk: "",
        evidenceGaps: "",
        correctiveActions: "",
        mechanism: "",
        questionText: "",
        allText: "",
        standardText: "",
        rawResponse: null,
        missingExpectedConcepts: ["request failed"],
        questionableInferences: [],
        overreachWarnings: [],
        severeFalsePositive: false,
        responseEmpty: true,
        warnings: [error instanceof Error ? error.message : String(error)],
      });
    }
  }

  const average = scores.length ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
  await writeReports(outcomes, average);

  console.log("\n==================================================");
  console.log("Scorecard");
  console.log("==================================================");
  console.log("Scenario | Score | Status | Failed dimensions | Classification | Risk | Top standards | Evidence gaps | Corrective actions");
  console.log("--------- | ----- | ------ | ----------------- | -------------- | ---- | ------------- | ------------- | -----------------");
  for (const outcome of outcomes) {
    console.log(
      [
        outcome.scenario.name,
        buildScoreLabel(outcome.score, outcome.status),
        outcome.status,
        outcome.failedDimensions.length ? outcome.failedDimensions.join(", ") : "none",
        outcome.classification || "n/a",
        outcome.risk || "n/a",
        outcome.topStandards.slice(0, 3).join(" | ") || "none",
        makeShortText(outcome.evidenceGaps),
        makeShortText(outcome.correctiveActions),
      ]
        .map((item) => String(item).replace(/\s+/g, " ").trim())
        .join(" | "),
    );
  }

  const passCount = outcomes.filter((outcome) => outcome.status === "PASS").length;
  const reviewCount = outcomes.filter((outcome) => outcome.status === "NEEDS_REVIEW").length;
  const failCount = outcomes.filter((outcome) => outcome.status === "FAIL").length;

  console.log("\n==================================================");
  console.log(`Average score: ${average.toFixed(1)}%`);
  console.log(`Pass: ${passCount} | Needs review: ${reviewCount} | Fail: ${failCount}`);
  console.log(`Report JSON: ${REPORT_JSON}`);
  console.log(`Report MD:   ${REPORT_MD}`);
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

  console.log("\nHazLenz field gauntlet passed.");
}

export { buildFieldGauntletScenarios, makeScenario, classifyScenario, evaluateResponse, summarizeOutcome, renderMarkdownReport, main };

if (require.main === module) {
  main().catch((error) => {
    console.error("Fatal evaluation error:", error);
    process.exit(1);
  });
}
