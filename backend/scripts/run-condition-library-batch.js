const fs = require("fs");
const { classifyObservation } = require("./sentinel-condition-engine");

const input = process.argv[2];

if (!input) {
  console.error("Usage: node scripts/run-condition-library-batch.js <batch.json>");
  process.exit(1);
}

const cases = JSON.parse(fs.readFileSync(input, "utf8"));

const results = [];
const failures = [];

for (const testCase of cases) {
  const result = classifyObservation(testCase.observation, { context: testCase.context || {} });

  const routeOk =
    testCase.scopeExpected === "no_match"
      ? result.citation === "NO_MATCH"
      : result.scope === testCase.scopeExpected;

  const familyOk =
    testCase.scopeExpected === "no_match"
      ? result.citation === "NO_MATCH"
      : result.family === testCase.primaryHazardFamily;

  const acceptableAlternateCitations = testCase.acceptableAlternateCitations || [];
  const acceptableAlternateFamilies = testCase.acceptableAlternateFamilies || [];

  const citationOk =
    !testCase.citationReference ||
    testCase.citationReference === "AUTO" ||
    testCase.citationReference === result.citation ||
    acceptableAlternateCitations.includes(result.citation) ||
    (testCase.citationReference === "NO_MATCH" && result.citation === "NO_MATCH");

  const familyEquivalentOk =
    acceptableAlternateFamilies.includes(result.family);

  const pass = routeOk && (familyOk || familyEquivalentOk) && citationOk;

  const row = {
    id: testCase.id,
    observation: testCase.observation,
    expectedScope: testCase.scopeExpected,
    expectedFamily: testCase.primaryHazardFamily,
    expectedCitation: testCase.citationReference,
    actualConditionId: result.conditionId,
    actualCitation: result.citation,
    actualScope: result.scope,
    actualFamily: result.family,
    actualConfidence: result.confidence,
    reviewRequired: result.reviewRequired,
    routeOk,
    familyOk,
    citationOk,
    pass,
    reasons: result.reasons || [],
    secondaryMatches: result.secondaryMatches || [],
    sourceConditionId: testCase.sourceConditionId || null
  };

  results.push(row);
  if (!pass) failures.push(row);
}

fs.mkdirSync("results", { recursive: true });

fs.writeFileSync("results/condition-batch-report.json", JSON.stringify(results, null, 2));
fs.writeFileSync("results/condition-batch-failures.json", JSON.stringify(failures, null, 2));

const total = cases.length;
const noMatchCases = cases.filter(c => c.scopeExpected === "no_match").length;
const nonNoMatchCases = total - noMatchCases;

const routePass = results.filter(r => r.routeOk).length;
const familyPass = results.filter(r => r.expectedScope !== "no_match" && r.familyOk).length;
const noMatchPass = results.filter(r => r.expectedScope === "no_match" && r.pass).length;

console.log(JSON.stringify({
  totalCases: total,
  routeAccuracy: `${routePass}/${total} = ${Math.round(routePass / total * 100)}%`,
  familyAccuracy: `${familyPass}/${nonNoMatchCases} = ${nonNoMatchCases ? Math.round(familyPass / nonNoMatchCases * 100) : 100}%`,
  noMatchAccuracy: `${noMatchPass}/${noMatchCases} = ${noMatchCases ? Math.round(noMatchPass / noMatchCases * 100) : 100}%`,
  failureCount: failures.length,
  report: "results/condition-batch-report.json",
  failures: "results/condition-batch-failures.json"
}, null, 2));
