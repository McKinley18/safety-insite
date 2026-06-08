import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

type ValidationStep = {
  label: string;
  command: string;
  args: string[];
};

const backendRoot = path.resolve(__dirname, '..');

const repoRoot = path.resolve(backendRoot, '..');

const trackedGeneratedValidationFiles = [
  'safescope-data/benchmarks/safescope-precision-batch-001-results.v1.json',
  'safescope-data/benchmarks/safescope-precision-batch-002-results.v1.json',
  'safescope-data/benchmarks/safescope-precision-batch-003-results.v1.json',
  'safescope-data/reviewer-candidates/candidates.json',
  'safescope-data/source-audit/regulatory-source-inventory-v1.json',
  'safescope-data/source-audit/regulatory-coverage-matrix-v1.json',
  'safescope-data/source-audit/regulatory-metadata-normalization-v1.json',
];

const generatedValidationTempFiles = [
  'safescope-data/persistence/audit_records.json',
  'safescope-data/approved-knowledge/draft-candidates/core-expansion-v1-temp.json',
];

function restoreTrackedGeneratedFiles(): void {
  const result = spawnSync('git', ['restore', ...trackedGeneratedValidationFiles], {
    cwd: repoRoot,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.status !== 0) {
    console.warn('⚠️ Generated validation file cleanup did not fully complete.');
  }

  for (const relativePath of generatedValidationTempFiles) {
    const absolutePath = path.join(repoRoot, relativePath);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  }
}



const steps: ValidationStep[] = [
  {
    label: 'Backend TypeScript build',
    command: 'npm',
    args: ['run', 'build'],
  },
  {
    label: 'Governance output snapshot',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-governance-output-snapshot.ts'],
  },
  {
    label: 'System index audit',
    command: 'npx',
    args: ['ts-node', 'scripts/audit-safescope-system-index.ts'],
  },
  {
    label: 'Hazard taxonomy coverage',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-hazard-taxonomy-coverage.ts'],
  },
  {
    label: 'Approved knowledge review API v1',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-approved-knowledge-review-api-v1.ts'],
  },

  {
    label: 'Hazard information absorption',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-hazard-information-absorption.ts'],
  },
  {
    label: 'Approved knowledge retrieval output v1',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-approved-knowledge-retrieval-output-v1.ts'],
  },
  {
    label: 'Scenario expansion pack v1',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-scenario-expansion-pack-v1.ts'],
  },
  {
    label: 'Field output composer v1',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-field-output-composer-v1.ts'],
  },
  {
    label: 'Field evidence weighting v1',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-field-evidence-weighting-v1.ts'],
  },
  {
    label: 'Multi-hazard observation decomposition v1',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-multi-hazard-decomposition-v1.ts'],
  },
  {
    label: 'Observation narrative synthesis v1',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-observation-narrative-synthesis-v1.ts'],
  },
  {
    label: 'Cross-domain causal chain reasoning v1',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-cross-domain-causal-chain-v1.ts'],
  },
  {
    label: 'Corrective action strategy ranking v1',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-corrective-action-strategy-ranking-v1.ts'],
  },
  {
    label: 'Risk verification and residual risk reassessment v1',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-risk-verification-residual-risk-v1.ts'],
  },
  {
    label: 'Human review feedback loop v1',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-human-review-feedback-loop-v1.ts'],
  },
  {
    label: 'Source freshness and regulation update governance v1',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-source-freshness-governance-v1.ts'],
  },
  {
    label: 'Jurisdiction-specific applicability decision tree v1',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-jurisdiction-applicability-decision-tree-v1.ts'],
  },
  {
    label: 'Audit-ready reasoning trace and explainability v1',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-audit-ready-reasoning-trace-v1.ts'],
  },
  {
    label: 'Semantic synonym expansion v1',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-semantic-synonym-expansion-v1.ts'],
  },
  {
    label: 'Visual evidence reasoning v1',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-visual-evidence-reasoning-v1.ts'],
  },
  {
    label: 'Visual evidence API and UI wiring v1',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-visual-evidence-api-ui-wiring-v1.ts'],
  },
  {
    label: 'Real image analysis and photo classification v1',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-real-image-analysis-v1.ts'],
  },
  {
    label: 'Production persistence and audit storage v1',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-production-persistence-audit-storage-v1.ts'],
  },
  {
    label: 'Full regulatory knowledge expansion v1',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-full-regulatory-knowledge-expansion-v1.ts'],
  },
  {
    label: 'Regulatory knowledge deduplication and citation normalization v1',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-regulatory-dedup-citation-normalization-v1.ts'],
  },
  {
    label: "Role-based approval gates v1",
    command: "npx",
    args: ["ts-node", "scripts/validate-safescope-role-based-approval-gates-v1.ts"],
  },
  {
    label: "Offline reasoning and mobile resilience v1",
    command: "npx",
    args: ["ts-node", "scripts/validate-safescope-offline-reasoning-mobile-resilience-v1.ts"],
  },
  {
    label: "Workspace auth and governance hardening v1",
    command: "npx",
    args: ["ts-node", "scripts/validate-safescope-workspace-auth-governance-v1.ts"],
  },
  {
    label: "Staging hardening v1",
    command: "npx",
    args: ["ts-node", "scripts/validate-safescope-staging-hardening-v1.ts"],
  },
  {
    label: "Staging deployment readiness v1",
    command: "npx",
    args: ["ts-node", "scripts/validate-safescope-staging-deployment-readiness-v1.ts"],
  },
  {
    label: "Hazard universe coverage v1",
    command: "npx",
    args: ["ts-node", "scripts/validate-safescope-hazard-universe-coverage-v1.ts"],
  },
  {
    label: "Generalization intelligence audit v1",
    command: "npx",
    args: ["ts-node", "scripts/validate-safescope-generalization-intelligence-v1.ts"],
  },
  {
    label: "Failure-mode calibration v1",
    command: "npx",
    args: ["ts-node", "scripts/validate-safescope-failure-mode-calibration-v1.ts"],
  },
  {
    label: "Full hazard coverage expansion v1",
    command: "npx",
    args: ["ts-node", "scripts/validate-safescope-full-hazard-coverage-expansion-v1.ts"],
  },
  {
    label: "Response appropriateness audit v1",
    command: "npx",
    args: ["ts-node", "scripts/validate-safescope-response-appropriateness-v1.ts"],
  },
  {
    label: "Project organization audit v1",
    command: "npx",
    args: ["ts-node", "scripts/validate-safescope-project-organization-audit-v1.ts"],
  },
  {
    label: "Regulatory source audit and ingestion v1",
    command: "npx",
    args: ["ts-node", "scripts/validate-safescope-regulatory-source-audit-ingestion-v1.ts"],
  },
  {
    label: "Live regulatory connectors v1",
    command: "npx",
    args: ["ts-node", "scripts/validate-safescope-live-regulatory-connectors-v1.ts"],
  },
  {
    label: "Regulatory coverage matrix v1",
    command: "npx",
    args: ["ts-node", "scripts/validate-safescope-regulatory-coverage-matrix-v1.ts"],
  },
  {
    label: "Regulatory metadata normalization v1",
    command: "npx",
    args: ["ts-node", "scripts/validate-safescope-regulatory-metadata-normalization-v1.ts"],
  },
  {
    label: "Core regulatory expansion v1",
    command: "npx",
    args: ["ts-node", "scripts/validate-safescope-core-regulatory-expansion-v1.ts"],
  },
  {
    label: "Core regulatory draft promotion v1",
    command: "npx",
    args: ["ts-node", "scripts/validate-safescope-core-regulatory-draft-promotion-workflow-v1.ts"],
  },
  {
    label: "Site policy isolation v1",
    command: "npx",
    args: ["ts-node", "scripts/validate-safescope-site-policy-isolation-v1.ts"],
  },
  {
    label: "Field test scenario packs v1",
    command: "npx",
    args: ["ts-node", "scripts/validate-safescope-field-test-scenario-packs-v1.ts"],
  },
  {
    label: 'Knowledge source ingestion and approved update workflow v1',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-source-ingestion-approved-update-workflow-v1.ts'],
  },
  {
    label: 'Reviewer candidate console v1',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-reviewer-candidate-console-v1.ts'],
  },
  {
    label: 'Reviewer candidate console API contract v1',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-reviewer-candidate-console-api-contract-v1.ts'],
  },
  {
    label: 'Approved knowledge retrieval matching v1',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-approved-knowledge-population-and-retrieval-matching-v1.ts'],
  },
  {
    label: 'Orchestrator field output wiring',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-orchestrator-field-output-wiring.ts'],
  },
  {
    label: 'AI Transition Gap Map Audit',
    command: 'npx',
    args: ['ts-node', 'scripts/audit-safescope-ai-transition-gap-map.ts'],
  },
  {
    label: 'HazCom chemical labeling SDS draft pack',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-hazcom-chemical-labeling-sds-draft-pack.ts'],
  },
  {
    label: 'Excavation trenching ground control draft pack',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-excavation-trenching-ground-control-draft-pack.ts'],
  },
  {
    label: 'Fall protection working-at-height draft pack',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-fall-protection-working-at-height-draft-pack.ts'],
  },
  {
    label: 'Electrical energized equipment draft pack',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-electrical-energized-equipment-draft-pack.ts'],
  },
  {
    label: 'Confined space atmospheric draft pack',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-confined-space-atmospheric-draft-pack.ts'],
  },
  {
    label: 'Mobile equipment pedestrian draft pack',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-mobile-equipment-pedestrian-draft-pack.ts'],
  },
  {
    label: 'Machine guarding conveyor LOTO draft pack',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-machine-guarding-conveyor-loto-draft-pack.ts'],
  },
  {
    label: 'Source-backed knowledge candidates',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-source-backed-knowledge-candidates.ts'],
  },
  {
    label: 'Approved knowledge registry IO',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-approved-knowledge-registry-io.ts'],
  },
  {
    label: 'Approved knowledge search',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-approved-knowledge-search.ts'],
  },
  {
    label: 'Approved knowledge registry schema',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-approved-knowledge-registry-schema.ts'],
  },
  {
    label: 'Governance pipeline contract',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-governance-pipeline-contract.ts'],
  },
  {
    label: 'Approved knowledge registry write guard',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-approved-knowledge-registry-write-guard.ts'],
  },
  {
    label: 'Approved knowledge promotion workflow governance',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-approved-knowledge-promotion-workflow-governance.ts'],
  },
  {
    label: 'Approved source knowledge intake governance',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-approved-source-knowledge-intake-governance.ts'],
  },
  {
    label: 'Source-backed applicability governance',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-source-backed-applicability-governance.ts'],
  },
  {
    label: 'Human review learning governance',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-human-review-learning-governance.ts'],
  },
  {
    label: 'Defensible corrective action',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-defensible-corrective-action.ts'],
  },
  {
    label: 'Output policy',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-output-policy.ts'],
  },
  {
    label: 'Confidence governance',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-confidence-governance.ts'],
  },
  {
    label: 'Evidence sufficiency',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-evidence-sufficiency.ts'],
  },
  {
    label: 'Causal-risk reasoning',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-causal-risk-reasoning.ts'],
  },
  {
    label: 'Golden domain intelligence tests',
    command: 'npx',
    args: ['ts-node', 'src/safescope-v2/tests/golden-domain-intelligence-tests.ts'],
  },
  {
    label: 'Golden operational reasoning tests',
    command: 'npx',
    args: ['ts-node', 'src/safescope-v2/tests/golden-operational-reasoning-tests.ts'],
  },
  {
    label: 'Precision batch 001',
    command: 'npx',
    args: ['ts-node', 'scripts/run-safescope-precision-batch-001.ts'],
  },
  {
    label: 'Precision batch 002',
    command: 'npx',
    args: ['ts-node', 'scripts/run-safescope-precision-batch-002.ts'],
  },
  {
    label: 'Precision batch 003',
    command: 'npx',
    args: ['ts-node', 'scripts/run-safescope-precision-batch-003.ts'],
  },
  {
    label: 'Observation understanding',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-observation-understanding.ts'],
  },
  {
    label: 'Understanding engine',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-understanding-engine.ts'],
  },
  {
    label: 'Main output observation understanding',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-main-output-observation-understanding.ts'],
  },
  {
    label: 'Observation trace snapshot',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-observation-trace-snapshot.ts'],
  },
  {
    label: 'Field output contract',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-field-output-contract.ts'],
  },
];

function runStep(step: ValidationStep, index: number): void {
  console.log('');
  console.log(`--- [${index + 1}/${steps.length}] ${step.label} ---`);
  console.log(`$ ${step.command} ${step.args.join(' ')}`);

  const result = spawnSync(step.command, step.args, {
    cwd: backendRoot,
    stdio: 'inherit',
    shell: false,
    env: process.env,
  });

  if (result.error) {
    console.error(`❌ Failed to start: ${step.label}`);
    console.error(result.error);
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error(`❌ Failed: ${step.label}`);
    process.exit(result.status ?? 1);
  }

  console.log(`✅ Passed: ${step.label}`);
}

function main(): void {
  console.log('--- Starting SafeScope Full Validation Suite ---');

  steps.forEach(runStep);

  restoreTrackedGeneratedFiles();

  console.log('');
  console.log(`✅ ${steps.length}/${steps.length} validation steps passed.`);
  console.log('✅ SafeScope full validation suite passed.');
}

main();
