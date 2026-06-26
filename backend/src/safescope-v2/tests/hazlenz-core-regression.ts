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
  },
  {
    name: "Golden Hardening Scenarios Test",
    scriptPath: "src/safescope-v2/tests/golden-hardening-tests.ts"
  },
  {
    name: "Inspection Intelligence Regression",
    scriptPath: "src/safescope-v2/tests/inspection-intelligence-regression.ts"
  },
  {
    name: "Inspection Intelligence Expansion Regression",
    scriptPath: "src/safescope-v2/tests/inspection-intelligence-expansion-regression.ts"
  },
  {
    name: "MSHA Inspection Intelligence Regression",
    scriptPath: "src/safescope-v2/tests/msha-inspection-intelligence-regression.ts"
  },
  {
    name: "Inspection Intelligence Adversarial Regression",
    scriptPath: "src/safescope-v2/tests/inspection-intelligence-adversarial-regression.ts"
  },
  {
    name: "Inspection Intelligence Citation Recovery Regression",
    scriptPath: "src/safescope-v2/tests/inspection-intelligence-citation-recovery-regression.ts"
  },
  {
    name: "Inspection Intelligence Citation Ranking Regression",
    scriptPath: "src/safescope-v2/tests/inspection-intelligence-citation-ranking-regression.ts"
  },
  {
    name: "Inspection Intelligence Citation Output Coherence Regression",
    scriptPath: "src/safescope-v2/tests/inspection-intelligence-citation-output-coherence-regression.ts"
  },
  {
    name: "Inspection Intelligence Vague Input Regression",
    scriptPath: "src/safescope-v2/tests/inspection-intelligence-vague-input-regression.ts"
  },
  {
    name: "Inspection Intelligence Vague Output Coherence Regression",
    scriptPath: "src/safescope-v2/tests/inspection-intelligence-vague-output-coherence-regression.ts"
  },
  {
    name: "HazLenz Mechanism Chain Hardening",
    scriptPath: "src/safescope-v2/tests/hazlenz-mechanism-chain-hardening.ts"
  },
  {
    name: "HazLenz Spill/Release Citation Ranking",
    scriptPath: "src/safescope-v2/tests/hazlenz-spill-release-citation-ranking.ts"
  },
  {
    name: "HazLenz Supplemental Knowledge Regression",
    scriptPath: "src/safescope-v2/tests/hazlenz-supplemental-knowledge-regression.ts"
  },
  {
    name: "HazLenz Vague Guarding Regression",
    scriptPath: "src/safescope-v2/tests/hazlenz-vague-guarding-regression.ts"
  },
  {
    name: "HazLenz Classify Path Regression",
    scriptPath: "src/safescope-v2/tests/hazlenz-classify-path-regression.ts"
  },
  {
    name: "HazLenz Production Path Regression",
    scriptPath: "src/safescope-v2/tests/hazlenz-production-path-regression.ts"
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
