import { spawnSync } from 'child_process';
import * as path from 'path';

type Suite = {
  name: string;
  scriptPath: string;
};

const suites: Suite[] = [
  {
    name: "Observation Understanding Benchmark",
    scriptPath: "src/hazlenz/tests/observation-understanding-benchmark.ts"
  },
  {
    name: "PPE Standards Intelligence Benchmark",
    scriptPath: "src/hazlenz/tests/ppe-standards-benchmark.ts"
  },
  {
    name: "Corrective Action Intelligence Benchmark",
    scriptPath: "src/hazlenz/tests/corrective-action-benchmark.ts"
  },
  {
    name: "Mobile Equipment Standards Benchmark",
    scriptPath: "src/hazlenz/tests/mobile-standards-benchmark.ts"
  },
  {
    name: "Golden Hardening Scenarios Test",
    scriptPath: "src/hazlenz/tests/golden-hardening-tests.ts"
  },
  {
    name: "Inspection Intelligence Regression",
    scriptPath: "src/hazlenz/tests/inspection-intelligence-regression.ts"
  },
  {
    name: "Inspection Intelligence Expansion Regression",
    scriptPath: "src/hazlenz/tests/inspection-intelligence-expansion-regression.ts"
  },
  {
    name: "MSHA Inspection Intelligence Regression",
    scriptPath: "src/hazlenz/tests/msha-inspection-intelligence-regression.ts"
  },
  {
    name: "Inspection Intelligence Adversarial Regression",
    scriptPath: "src/hazlenz/tests/inspection-intelligence-adversarial-regression.ts"
  },
  {
    name: "Inspection Intelligence Citation Recovery Regression",
    scriptPath: "src/hazlenz/tests/inspection-intelligence-citation-recovery-regression.ts"
  },
  {
    name: "Inspection Intelligence Citation Ranking Regression",
    scriptPath: "src/hazlenz/tests/inspection-intelligence-citation-ranking-regression.ts"
  },
  {
    name: "Inspection Intelligence Citation Output Coherence Regression",
    scriptPath: "src/hazlenz/tests/inspection-intelligence-citation-output-coherence-regression.ts"
  },
  {
    name: "Inspection Intelligence Vague Input Regression",
    scriptPath: "src/hazlenz/tests/inspection-intelligence-vague-input-regression.ts"
  },
  {
    name: "Inspection Intelligence Vague Output Coherence Regression",
    scriptPath: "src/hazlenz/tests/inspection-intelligence-vague-output-coherence-regression.ts"
  },
  {
    name: "HazLenz Mechanism Chain Hardening",
    scriptPath: "src/hazlenz/tests/hazlenz-mechanism-chain-hardening.ts"
  },
  {
    name: "HazLenz Spill/Release Citation Ranking",
    scriptPath: "src/hazlenz/tests/hazlenz-spill-release-citation-ranking.ts"
  },
  {
    name: "HazLenz Mechanism Chain Contract Regression",
    scriptPath: "src/hazlenz/tests/hazlenz-mechanism-chain-contract-regression.ts"
  },
  {
    name: "HazLenz Supplemental Knowledge Regression",
    scriptPath: "src/hazlenz/tests/hazlenz-supplemental-knowledge-regression.ts"
  },
  {
    name: "HazLenz Vague Guarding Regression",
    scriptPath: "src/hazlenz/tests/hazlenz-vague-guarding-regression.ts"
  },
  {
    name: "HazLenz Classify Path Regression",
    scriptPath: "src/hazlenz/tests/hazlenz-classify-path-regression.ts"
  },
  {
    name: "HazLenz Production Path Regression",
    scriptPath: "src/hazlenz/tests/hazlenz-production-path-regression.ts"
  },
  {
    name: "HazLenz Temporal Reconciliation Regression",
    scriptPath: "src/hazlenz/tests/hazlenz-temporal-reconciliation-regression.ts"
  },
  {
    name: "HazLenz Condition-State Invariants Regression",
    scriptPath: "src/hazlenz/tests/hazlenz-condition-state-invariants-regression.ts"
  },
  {
    name: "HazLenz Finding-Scoped Standards Regression",
    scriptPath: "src/hazlenz/tests/hazlenz-finding-scoped-standards-regression.ts"
  },
  {
    name: "HazLenz LOTO Fragment-Scoping Regression",
    scriptPath: "src/hazlenz/tests/hazlenz-loto-fragment-scoping-regression.ts"
  },
  {
    name: "HazLenz Handrail/Guardrail Regression",
    scriptPath: "src/hazlenz/tests/hazlenz-handrail-guardrail-regression.ts"
  },
  {
    name: "HazLenz LOTO Degraded-Gap Alignment Regression",
    scriptPath: "src/hazlenz/tests/hazlenz-loto-degraded-gap-alignment-regression.ts"
  },
  {
    name: "HazLenz Energy-Isolation Negation Regression",
    scriptPath: "src/hazlenz/tests/hazlenz-energy-isolation-negation-regression.ts"
  },
  {
    name: "HazLenz Defeated-Control / Contradiction Regression",
    scriptPath: "src/hazlenz/tests/hazlenz-defeated-control-contradiction-regression.ts"
  },
  {
    name: "HazLenz Jurisdiction-Unknown Standards Regression",
    scriptPath: "src/hazlenz/tests/hazlenz-jurisdiction-unknown-standards-regression.ts"
  },
  {
    name: "HazLenz Inspection-Context / Autonomy Regression",
    scriptPath: "src/hazlenz/tests/hazlenz-inspection-context-autonomy-regression.ts"
  },
  {
    name: "HazLenz Decomposition Precision / Recall Gate",
    scriptPath: "src/hazlenz/tests/hazlenz-decomposition-precision-regression.ts"
  },
  {
    name: "HazLenz Level-1 Recall Gate",
    scriptPath: "src/hazlenz/tests/hazlenz-level1-recall-regression.ts"
  },
  {
    name: "HazLenz Actionable Coverage Gate",
    scriptPath: "src/hazlenz/tests/hazlenz-actionable-coverage-regression.ts"
  },
  {
    name: "HazLenz Standards Jurisdiction Gate",
    scriptPath: "src/hazlenz/tests/hazlenz-standards-jurisdiction-gate.ts"
  },
  {
    name: "HazLenz Source Authority Gate",
    scriptPath: "src/hazlenz/tests/hazlenz-source-authority-gate.ts"
  },
  {
    name: "Release Identity Immutability Gate",
    scriptPath: "src/standards/tests/release-identity-immutability.ts"
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
