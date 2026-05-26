const { execSync } = require("child_process");

function run(cmd, dir = ".") {
  console.log(`Running: ${cmd}`);
  try {
    execSync(cmd, { stdio: "inherit", cwd: dir });
  } catch (e) {
    console.error(`Failed: ${cmd}`);
    process.exit(1);
  }
}

console.log("Starting SafeScope Validation Stack...");

run("npm run build", "backend");
run("npm run test:safescope", "backend");
run("npm run test:safescope-standards", "backend");

run("node tools/safescope-gauntlet/audit-source-quality.mjs");

console.log("\nRunning Source-Grounded Gauntlet...");
run("SCENARIO_FILE=safescope-gauntlet.source.v1.json LIMIT=100 node tools/safescope-gauntlet/run-gauntlet.mjs");
run("node tools/safescope-gauntlet/summarize-gauntlet-results.mjs");

console.log("\nRunning v2 Gauntlet...");
run("SCENARIO_FILE=safescope-gauntlet.v2.json LIMIT=500 node tools/safescope-gauntlet/run-gauntlet.mjs");
run("node tools/safescope-gauntlet/summarize-gauntlet-results.mjs");

console.log("All validation checks passed.");
