import { spawnSync } from 'child_process';
import * as path from 'path';

type Suite = {
  name: string;
  scriptPath: string;
};

const suites: Suite[] = [
  {
    name: "Observation Understanding Benchmark",
    scriptPath: "src/safescope-v2/tests/observation-understanding-benchmark.ts"
  },
  {
    name: "PPE Standards Intelligence Benchmark",
    scriptPath: "src/safescope-v2/tests/ppe-standards-benchmark.ts"
  },
  {
    name: "Corrective Action Intelligence Benchmark",
    scriptPath: "src/safescope-v2/tests/corrective-action-benchmark.ts"
  },
  {
    name: "Mobile Equipment Standards Benchmark",
    scriptPath: "src/safescope-v2/tests/mobile-standards-benchmark.ts"
  }
];

function runAll() {
  console.log("==================================================");
  console.log("HazLenz AI Core Regression Runner");
  console.log("==================================================\n");

  const results: { name: string; exitCode: number; passed: boolean }[] = [];

  for (const suite of suites) {
    console.log(`Running Suite: ${suite.name}`);
    console.log(`Script: ${suite.scriptPath}\n`);

    // Resolve backend root safely
    const backendRoot = path.resolve(__dirname, '../../../');

    const child = spawnSync('npx', ['ts-node', suite.scriptPath], {
      cwd: backendRoot,
      stdio: 'inherit',
      shell: true, // Use shell for platform compatibility (like windows or environments with npx as shell command)
    });

    const exitCode = child.status ?? 0;
    const passed = exitCode === 0;

    results.push({ name: suite.name, exitCode, passed });
    console.log("\n--------------------------------------------------\n");
  }

  // Print Summary Table
  console.log("==================================================");
  console.log("HAZLENZ AI CORE REGRESSION RUN SUMMARY");
  console.log("==================================================");
  
  let overallPassed = true;
  for (const res of results) {
    const statusSymbol = res.passed ? "PASS" : "FAIL";
    console.log(`  [${statusSymbol}] Suite: ${res.name} | Exit Code: ${res.exitCode}`);
    if (!res.passed) overallPassed = false;
  }
  
  console.log("==================================================");
  console.log(`Overall Result: ${overallPassed ? "PASS" : "FAIL"}`);
  console.log("==================================================\n");

  if (!overallPassed) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAll();
