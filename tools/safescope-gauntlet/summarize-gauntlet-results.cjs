const fs = require("fs");
const results = JSON.parse(fs.readFileSync("safescope-gauntlet.results.json", "utf8"));

console.log("Total:", results.total);
console.log("Passed:", results.passed);
console.log("Failed:", results.failed);
console.log("Average Score:", results.averageScore);

const failures = results.results.filter(r => !r.passed);
console.log("\nFailures by Expected Family:");
const failByExpected = failures.reduce((acc, f) => { acc[f.expectedPrimaryFamily] = (acc[f.expectedPrimaryFamily] || 0) + 1; return acc; }, {});
console.log(failByExpected);

console.log("\nFirst 40 Failures:");
failures.slice(0, 40).forEach(f => {
    console.log(`${f.scenarioId} (Score: ${f.score}): ${f.observation}`);
});
