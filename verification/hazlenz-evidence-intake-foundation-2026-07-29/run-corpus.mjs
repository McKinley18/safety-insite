import { readFile, writeFile } from "node:fs/promises";

const baseUrl = process.env.HAZLENZ_API_BASE_URL || "http://127.0.0.1:4200";
const input = process.env.HAZLENZ_CORPUS_INPUT;
const output = process.env.HAZLENZ_CORPUS_OUTPUT;
if (!input || !output) throw new Error("HAZLENZ_CORPUS_INPUT and HAZLENZ_CORPUS_OUTPUT are required.");
const corpus = JSON.parse(await readFile(input, "utf8"));

const norm = (value) => String(value || "").toLowerCase().replace(/^\d+\s*cfr\s*/, "");
const includesFamily = (values, family) => values.some((value) => norm(value).includes(norm(family)));
const records = (body) => [
  ...(body?.suggestedStandards || []),
  ...(body?.primaryStandards || []),
  ...(body?.standards || []),
];
function summarize(body) {
  const decisions = Array.isArray(body?.applicabilityDecisions) ? body.applicabilityDecisions : [];
  const recordCitations = records(body).map((item) => item?.citation || item?.standard).filter(Boolean);
  const candidates = decisions.filter((item) => item.status === "UNKNOWN").map((item) => item.citation);
  const supported = decisions.filter((item) => item.status === "SUPPORTED").map((item) => item.citation);
  const definitive = [...new Set([
    body?.primaryCitation,
    ...supported,
    ...records(body)
      .filter((item) => !/candidate|informational|suggested|needs.review/i.test(String(item?.status || item?.candidateStatus || "")))
      .map((item) => item?.citation || item?.standard),
  ].filter(Boolean))];
  return {
    classification: body?.classification ?? null,
    jurisdiction: body?.jurisdiction ?? body?.structuredObservation?.jurisdiction ?? null,
    primaryCitation: body?.primaryCitation ?? null,
    citations: [...new Set([...recordCitations, ...supported, ...candidates, body?.primaryCitation].filter(Boolean))],
    definitiveCitations: definitive,
    candidateCitations: candidates,
    applicabilityDecisions: decisions,
    evidenceSnapshot: body?.evidenceSnapshot ?? null,
    clarificationQuestions: body?.clarificationQuestions || body?.clarifyingQuestions || [],
    risk: body?.risk ?? null,
    regulatoryConclusion: body?.regulatoryConclusion ?? null,
    generatedActions: body?.generatedActions || [],
  };
}

const results = [];
for (let index = 0; index < corpus.cases.length; index += 1) {
  const item = corpus.cases[index];
  const started = performance.now();
  let response;
  let body = {};
  try {
    response = await fetch(`${baseUrl}/safescope-v2/classify`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-dev-organization-id": "evidence-foundation-corpus" },
      body: JSON.stringify({
        text: item.observation,
        scopes: item.scopes,
        structuredObservation: item.structuredObservation,
        clarificationAnswers: item.clarificationAnswers,
        priorStructuredObservation: item.priorStructuredObservation,
      }),
    });
    body = await response.json().catch(() => ({}));
  } catch (error) {
    results.push({ id: item.id, verdict: "FAIL", reasons: [String(error)], transportError: true });
    continue;
  }
  const actual = summarize(body);
  const expected = item.expected;
  const requiredSatisfied = expected.requiredCitationFamilies.length === 0 ||
    expected.requiredCitationFamilies.some((family) => includesFamily(actual.citations, family));
  const requiredDefinitive = expected.requiredCitationFamilies.length === 0 ||
    expected.requiredCitationFamilies.some((family) => includesFamily(actual.definitiveCitations, family));
  const prohibitedPromoted = expected.prohibitedCitationFamilies.some((family) =>
    includesFamily(actual.definitiveCitations, family));
  const safeExpected = ["safe_controlled", "non_safety"].includes(expected.disposition);
  const safeSuppression = !safeExpected || actual.definitiveCitations.length === 0;
  const clarificationObserved = actual.clarificationQuestions.length > 0;
  const candidateWithMaterialUnknown = expected.lifeCritical && requiredSatisfied && !requiredDefinitive &&
    actual.applicabilityDecisions.some((decision) =>
      decision.status === "UNKNOWN" &&
      expected.requiredCitationFamilies.some((family) => includesFamily([decision.citation], family)) &&
      decision.missingPredicates?.length);
  const lifeSafetyMiss = expected.lifeCritical && !requiredSatisfied;
  const fabricatedCitation = actual.definitiveCitations.some((citation) =>
    !/^(?:(?:29|30)\s*CFR\s+)?(?:56|57|75|77|1910|1926)\.\d+/i.test(citation));
  const unsafeAction = actual.generatedActions.some((action) =>
    /\b(bypass|defeat|continue operating|work live without)\b/i.test(JSON.stringify(action)));
  const reasons = [];
  if (!response.ok) reasons.push(`HTTP ${response.status}`);
  if (!requiredSatisfied) reasons.push("required standard family absent");
  if (requiredSatisfied && !requiredDefinitive && !candidateWithMaterialUnknown && expected.disposition === "hazard")
    reasons.push("required family not promoted despite supported predicates");
  if (candidateWithMaterialUnknown) reasons.push("life-safety family retained as candidate pending a material predicate");
  if (prohibitedPromoted) reasons.push("prohibited family promoted definitively");
  if (!safeSuppression) reasons.push("safe/non-safety state received a definitive standard");
  if (expected.clarificationRequired && !clarificationObserved) reasons.push("material clarification absent");
  if (fabricatedCitation) reasons.push("citation format is not an authoritative supported family");
  if (unsafeAction) reasons.push("unsafe corrective action language");
  let verdict = "PASS";
  if (!response.ok || lifeSafetyMiss || prohibitedPromoted || !safeSuppression || fabricatedCitation || unsafeAction)
    verdict = "FAIL";
  else if (reasons.length) verdict = "NEEDS REVIEW";
  results.push({
    id: item.id, group: item.group, jurisdiction: item.jurisdiction, domain: item.domain,
    verdict, reasons, elapsedMs: Math.round(performance.now() - started), expected, actual,
    checks: { requiredSatisfied, requiredDefinitive, prohibitedPromoted, safeSuppression,
      clarificationObserved, candidateWithMaterialUnknown, lifeSafetyMiss, fabricatedCitation, unsafeAction },
  });
  if ((index + 1) % 10 === 0) console.log(`completed ${index + 1}/${corpus.cases.length}`);
  await new Promise((resolve) => setTimeout(resolve, Number(process.env.HAZLENZ_DELAY_MS || 2100)));
}

const counts = results.reduce((summary, item) => {
  summary[item.verdict] = (summary[item.verdict] || 0) + 1;
  return summary;
}, {});
const byJurisdiction = {};
for (const item of results) {
  const bucket = byJurisdiction[item.jurisdiction] ||= { PASS: 0, "NEEDS REVIEW": 0, FAIL: 0 };
  bucket[item.verdict] += 1;
}
const summary = {
  executedAt: new Date().toISOString(), endpoint: `${baseUrl}/safescope-v2/classify`,
  count: results.length, counts, byJurisdiction,
  lifeSafetyMisses: results.filter((item) => item.checks?.lifeSafetyMiss).length,
  unsupportedDefinitivePromotions: results.filter((item) => item.checks?.prohibitedPromoted).length,
  safeStateFailures: results.filter((item) => item.checks && !item.checks.safeSuppression).length,
  fabricatedCitations: results.filter((item) => item.checks?.fabricatedCitation).length,
  unsafeActions: results.filter((item) => item.checks?.unsafeAction).length,
};
await writeFile(output, `${JSON.stringify({ summary, results }, null, 2)}\n`);
console.log(JSON.stringify(summary));
