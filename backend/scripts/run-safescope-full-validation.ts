import { spawnSync } from 'child_process';
import * as path from 'path';

type ValidationStep = {
  label: string;
  command: string;
  args: string[];
};

const backendRoot = path.resolve(__dirname, '..');

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

  console.log('');
  console.log(`✅ ${steps.length}/${steps.length} validation steps passed.`);
  console.log('✅ SafeScope full validation suite passed.');
}

main();
