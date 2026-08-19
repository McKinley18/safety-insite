import { readFile, writeFile } from "node:fs/promises";

const path = new URL("./HAZLENZ_NOVEL_CASES.json", import.meta.url);
const document = JSON.parse(await readFile(path, "utf8"));
const selectedIds = ["N001", "N004", "N010", "N019", "N025", "N034", "N043", "N058", "N076", "N088"];
const selected = document.cases.filter((item) => selectedIds.includes(item.id));
const baseUrl = process.env.AUDIT_API_BASE_URL || "http://127.0.0.1:4010";

function summarize(output) {
  const standards = [
    ...(output?.suggestedStandards || []),
    ...(output?.primaryStandards || []),
    ...(output?.standards || []),
  ];
  return {
    classification: output?.classification ?? null,
    primaryCitation: output?.primaryCitation ?? null,
    citations: [...new Set(standards.map((item) => String(item?.citation || item?.standard || "")).filter(Boolean))],
    confidence: output?.confidence ?? output?.confidenceIntelligence?.overallConfidence ?? null,
    requiresHumanReview: output?.requiresHumanReview ?? null,
    clarificationCount: (output?.clarifyingQuestions || output?.clarificationQuestions || []).length,
    riskBand: output?.risk?.riskBand ?? output?.risk?.level ?? null,
  };
}

async function classify(request) {
  const response = await fetch(`${baseUrl}/safescope-v2/classify`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-dev-organization-id": "audit-stability-evaluation" },
    body: JSON.stringify(request),
  });
  const body = await response.json();
  await new Promise((resolve) => setTimeout(resolve, 2100));
  return { httpStatus: response.status, ...summarize(body) };
}

function paraphrase(text) {
  return `During an independent walk-through, the following was documented: ${text
    .replace(/\bemployee\b/gi, "worker")
    .replace(/\bworker\b/gi, "employee")
    .replace(/\bno\b/gi, "without any")
    .replace(/\bis\b/gi, "was observed to be")}`;
}

const repeatability = [];
const paraphrases = [];
for (const item of selected) {
  const runA = await classify(item.request);
  const runB = await classify(item.request);
  const identical = JSON.stringify(runA) === JSON.stringify(runB);
  repeatability.push({ caseId: item.id, runA, runB, identical });

  const paraphrasedRequest = {
    ...item.request,
    text: paraphrase(item.request.text),
    structuredObservation: {
      ...item.request.structuredObservation,
      narrative: paraphrase(item.request.text),
    },
  };
  const paraphrased = await classify(paraphrasedRequest);
  const baseline = {
    classification: item.actual.classification,
    primaryCitation: item.actual.primaryCitation,
    citations: item.actual.citations,
    confidence: item.actual.confidence,
    requiresHumanReview: item.actual.requiresHumanReview,
    clarificationCount: (item.actual.clarificationQuestions || []).length,
    riskBand: item.actual.risk?.riskBand ?? item.actual.risk?.level ?? null,
  };
  const stable =
    baseline.classification === paraphrased.classification &&
    baseline.primaryCitation === paraphrased.primaryCitation;
  paraphrases.push({ caseId: item.id, baseline, paraphrased, stable });
}

document.stabilityEvaluation = {
  selectedIds,
  repeatability,
  paraphrases,
  nondeterministicOutputs: repeatability.filter((item) => !item.identical).length,
  paraphraseInstabilityCount: paraphrases.filter((item) => !item.stable).length,
  paraphraseInstabilityRate: paraphrases.filter((item) => !item.stable).length / paraphrases.length,
  note: "Repeat equality includes classification, standards, confidence, review flag, question count, and risk band; timing is excluded."
};

await writeFile(path, JSON.stringify(document, null, 2));
console.log(JSON.stringify({
  nondeterministicOutputs: document.stabilityEvaluation.nondeterministicOutputs,
  paraphraseInstabilityCount: document.stabilityEvaluation.paraphraseInstabilityCount,
  paraphraseInstabilityRate: document.stabilityEvaluation.paraphraseInstabilityRate,
}, null, 2));
