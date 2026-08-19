import { readFile, writeFile } from "node:fs/promises";

const baseUrl = process.env.CLOSURE_API_BASE_URL || "http://127.0.0.1:4200";
const corpusUrl = new URL("./HAZLENZ_AUTHENTIC_CORPUS.json", import.meta.url);
const resultUrl = new URL("./HAZLENZ_AUTHENTIC_RESULTS.json", import.meta.url);
const corpus = JSON.parse(await readFile(corpusUrl, "utf8"));

function standardRecords(output) {
  return [
    ...(Array.isArray(output?.suggestedStandards) ? output.suggestedStandards : []),
    ...(Array.isArray(output?.primaryStandards) ? output.primaryStandards : []),
    ...(Array.isArray(output?.standards) ? output.standards : []),
  ];
}
function citations(output) {
  return [...new Set([
    output?.primaryCitation,
    ...standardRecords(output).map((s) => s?.citation || s?.standard || s?.reference),
  ].map((v) => String(v || "").trim()).filter(Boolean))];
}
function includesFamily(values, family) {
  const normalizedFamily = String(family).toLowerCase().replace(/^\\d+\\s*cfr\\s*/, "");
  return values.some((value) => String(value).toLowerCase().replace(/^\\d+\\s*cfr\\s*/, "").includes(normalizedFamily));
}
function questions(output) {
  return output?.clarifyingQuestions || output?.clarificationQuestions || [];
}
function definitiveCitations(output) {
  const candidates = standardRecords(output);
  const explicit = candidates
    .filter((s) => !/candidate|informational|suggested|needs.review/i.test(String(s?.status || s?.candidateStatus || "")))
    .map((s) => String(s?.citation || s?.standard || "").trim())
    .filter(Boolean);
  const primary = String(output?.primaryCitation || "").trim();
  return [...new Set([primary, ...explicit].filter(Boolean))];
}
function outputSummary(output) {
  return {
    classification: output?.classification ?? null,
    jurisdiction: output?.jurisdiction ?? output?.structuredObservation?.jurisdiction ?? null,
    primaryCitation: output?.primaryCitation ?? null,
    citations: citations(output),
    definitiveCitations: definitiveCitations(output),
    standards: standardRecords(output).map((s) => ({
      citation: s?.citation || s?.standard || null,
      title: s?.title || null,
      summary: s?.summary || s?.standardText || s?.text || null,
      status: s?.status || s?.candidateStatus || null,
      authority: s?.authority || s?.source || null,
    })),
    confidence: output?.confidence ?? output?.confidenceIntelligence?.overallConfidence ?? null,
    requiresHumanReview: output?.requiresHumanReview ?? null,
    clarificationQuestions: questions(output),
    risk: output?.risk ?? null,
    generatedActions: output?.generatedActions ?? [],
    ambiguityWarnings: output?.ambiguityWarnings ?? [],
    structuredObservation: output?.structuredObservation ?? null,
  };
}

const results = [];
for (let index = 0; index < corpus.cases.length; index += 1) {
  const testCase = corpus.cases[index];
  const started = performance.now();
  let response;
  let body;
  try {
    response = await fetch(`${baseUrl}/safescope-v2/classify`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-dev-organization-id": "closure-authentic-corpus" },
      body: JSON.stringify({
        text: testCase.observation,
        scopes: testCase.scopes,
        structuredObservation: testCase.structuredObservation,
        clarificationAnswers: testCase.clarificationAnswers,
        priorStructuredObservation: testCase.priorStructuredObservation,
      }),
    });
    body = await response.json().catch(() => ({}));
  } catch (error) {
    results.push({ id: testCase.id, verdict: "FAIL", elapsedMs: Math.round(performance.now() - started), transportError: String(error) });
    continue;
  }
  const actual = outputSummary(body);
  const all = actual.citations;
  const definitive = actual.definitiveCitations;
  const requiredSatisfied =
    testCase.expected.requiredCitationFamilies.length === 0 ||
    testCase.expected.requiredCitationFamilies.some((family) => includesFamily(all, family));
  const prohibitedPromoted =
    testCase.expected.prohibitedCitationFamilies.some((family) => includesFamily(definitive, family));
  const clarificationObserved = actual.clarificationQuestions.length > 0;
  const clarificationAcceptable =
    testCase.expected.clarificationRequired ? clarificationObserved || actual.requiresHumanReview === true : true;
  const safeSuppression =
    !["safe_controlled", "non_safety"].includes(testCase.expected.disposition) ||
    definitive.length === 0;
  const uncertaintyPreserved =
    testCase.expected.disposition !== "insufficient" ||
    actual.requiresHumanReview === true ||
    clarificationObserved ||
    definitive.length === 0;
  const successful = response.ok;
  const lifeSafetyMiss = testCase.expected.lifeCritical && !requiredSatisfied;
  let verdict = "PASS";
  const reasons = [];
  if (!successful) reasons.push(`HTTP ${response.status}`);
  if (!requiredSatisfied) reasons.push("required citation family missing");
  if (prohibitedPromoted) reasons.push("prohibited citation promoted definitively");
  if (!safeSuppression) reasons.push("safe/non-safety state received definitive citation");
  if (!uncertaintyPreserved) reasons.push("insufficient evidence presented without uncertainty");
  if (!clarificationAcceptable) reasons.push("required clarification/review absent");
  if (!successful || prohibitedPromoted || lifeSafetyMiss) verdict = "FAIL";
  else if (reasons.length > 0) verdict = "NEEDS REVIEW";
  results.push({
    id: testCase.id,
    group: testCase.group,
    jurisdiction: testCase.jurisdiction,
    domain: testCase.domain,
    verdict,
    reasons,
    elapsedMs: Math.round(performance.now() - started),
    expected: testCase.expected,
    actual,
    checks: { successful, requiredSatisfied, prohibitedPromoted, clarificationObserved, clarificationAcceptable, safeSuppression, uncertaintyPreserved, lifeSafetyMiss },
  });
  if ((index + 1) % 10 === 0) console.log(`completed ${index + 1}/${corpus.cases.length}`);
  // The production route is limited to 30 requests/minute.
  await new Promise((resolve) => setTimeout(resolve, 2100));
}

const counts = results.reduce((m, r) => ({ ...m, [r.verdict]: (m[r.verdict] || 0) + 1 }), {});
const byJurisdiction = {};
for (const result of results) {
  const bucket = byJurisdiction[result.jurisdiction] ||= { PASS: 0, "NEEDS REVIEW": 0, FAIL: 0 };
  bucket[result.verdict] += 1;
}
const summary = {
  executedAt: new Date().toISOString(),
  endpoint: `${baseUrl}/safescope-v2/classify`,
  count: results.length,
  counts,
  byJurisdiction,
  unsupportedStandardPromotions: results.filter((r) => r.checks?.prohibitedPromoted).length,
  lifeSafetyMisses: results.filter((r) => r.checks?.lifeSafetyMiss).length,
  clarificationExpected: results.filter((r) => r.expected?.clarificationRequired).length,
  clarificationAcceptable: results.filter((r) => r.expected?.clarificationRequired && r.checks?.clarificationAcceptable).length,
  safeSuppressionFailures: results.filter((r) => r.checks && !r.checks.safeSuppression).length,
  p50Ms: results.map((r) => r.elapsedMs).sort((a, b) => a - b)[Math.floor(results.length * 0.5)],
  p95Ms: results.map((r) => r.elapsedMs).sort((a, b) => a - b)[Math.floor(results.length * 0.95)],
};
await writeFile(resultUrl, `${JSON.stringify({ summary, results }, null, 2)}\n`);
console.log(JSON.stringify(summary));
