import { spawnSync } from 'child_process';

type Step = {
  label: string;
  command: string;
  args: string[];
  cwd?: string;
};

const steps: Step[] = [
  {
    label: 'Production environment readiness',
    command: 'npx',
    args: ['ts-node', 'scripts/verify-production-environment-readiness.ts'],
  },
  {
    label: 'Reasoning result contract',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-reasoning-result-contract.ts'],
  },
  {
    label: 'Reasoning snapshot equipment fields',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-reasoning-snapshot-equipment-fields.ts'],
  },
  {
    label: 'Reasoning snapshot summary contract',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-reasoning-snapshot-summary-contract.ts'],
  },
  {
    label: 'Live equipment snapshot context',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-v2-live-equipment-snapshot-context.ts'],
  },
  {
    label: 'Reasoning snapshot access control',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-reasoning-snapshot-access-control.ts'],
  },
  {
    label: 'Supervisor validation workspace scope',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-supervisor-validation-workspace-scope.ts'],
  },
  {
    label: 'Standards scope-fit ranking',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-hazlenz-standards-scope-fit-ranking.ts'],
  },
  {
    label: 'HazLenz Brain snapshot builder',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-hazlenz-brain-snapshot-builder.ts'],
  },
  {
    label: 'HazLenz Brain query orchestrator',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-hazlenz-brain-query-orchestrator.ts'],
  },
  {
    label: 'HazLenz Canonical Pipeline Contract',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-canonical-pipeline-contract.ts'],
  },
  {
    label: 'HazLenz Field Readiness Routing',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-field-readiness-routing.ts'],
  },
  {
    label: 'HazLenz Field Output Contract',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-field-output-contract.ts'],
  },
  {
    label: 'HazLenz Field Output Scenarios',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-field-output-scenarios.ts'],
  },
  {
    label: 'HazLenz Field Realism Gauntlet',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-field-realism-gauntlet.ts'],
  },
  {
    label: 'HazLenz Field Realism Pack v2',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-field-realism-pack-v2.ts'],
  },
  {
    label: 'HazLenz Evidence Brain',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-evidence-brain.ts'],
  },
  {
    label: 'HazLenz Evidence Gap Intelligence',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-evidence-gap-intelligence.ts'],
  },
  {
    label: 'HazLenz Decision Confidence',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-decision-confidence.ts'],
  },
  {
    label: 'HazLenz Learning Memory',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-learning-memory.ts'],
  },
  {
    label: 'HazLenz Improvement Candidate Engine',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-improvement-candidate-engine.ts'],
  },
  {
    label: 'HazLenz Controls Brain',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-controls-brain.ts'],
  },
  {
    label: 'HazLenz Mechanism Brain',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-hazlenz-mechanism-brain.ts'],
  },
  {
    label: 'HazLenz Regulatory Brain',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-regulatory-brain.ts'],
  },
  {
    label: 'HazLenz Scenario Disambiguation',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-safescope-scenario-disambiguation.ts'],
  },

  {
    label: 'HazLenz Brain foundation',
    command: 'npx',
    args: ['ts-node', 'scripts/validate-hazlenz-brain-foundation.ts'],
  },
  {
    label: 'HazLenz Brain alignment audit',
    command: 'npx',
    args: ['ts-node', 'scripts/audit-hazlenz-brain-alignment.ts'],
  },
  {
    label: 'HazLenz Brain coverage matrix',
    command: 'npx',
    args: ['ts-node', 'scripts/audit-hazlenz-brain-coverage-matrix.ts'],
  },
  {
    label: 'HazLenz finding audit',
    command: 'npm',
    args: ['run', 'audit:safescope-findings'],
  },
  {
    label: 'Backend TypeScript build',
    command: 'npm',
    args: ['run', 'build'],
  },
];

console.log('\nHazLenz Production Readiness Verification');
console.log('==========================================\n');

for (const step of steps) {
  console.log(`\n▶ ${step.label}`);

  const result = spawnSync(step.command, step.args, {
    cwd: step.cwd || process.cwd(),
    stdio: 'inherit',
    shell: false,
  });

  if (result.status !== 0) {
    console.error(`\n❌ Failed: ${step.label}`);
    process.exit(result.status || 1);
  }

  console.log(`✅ Passed: ${step.label}`);
}

console.log('\n==========================================');
console.log('✅ HazLenz production readiness verification passed.');
console.log('==========================================\n');
