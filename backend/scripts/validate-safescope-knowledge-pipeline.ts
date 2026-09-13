import { execFileSync } from 'child_process';

type PipelineStep = {
  name: string;
  command: string;
  args: string[];
};

const steps: PipelineStep[] = [
  {
    name: 'Build backend',
    command: 'npm',
    args: ['--prefix', 'backend', 'run', 'build'],
  },
  {
    name: 'Validate quarantined knowledge records',
    command: 'npx',
    args: ['ts-node', '--project', 'backend/tsconfig.json', 'backend/scripts/validate-hazlenz-knowledge-intake.ts'],
  },
  {
    name: 'Validate reputable source ingestion',
    command: 'npx',
    args: ['ts-node', '--project', 'backend/tsconfig.json', 'backend/scripts/validate-safescope-reputable-sources-ingestion.ts'],
  },
  {
    name: 'Validate source register',
    command: 'npx',
    args: ['ts-node', '--project', 'backend/tsconfig.json', 'backend/scripts/validate-safescope-source-register.ts'],
  },
  {
    name: 'Generate knowledge coverage report',
    command: 'npx',
    args: ['ts-node', '--project', 'backend/tsconfig.json', 'backend/scripts/report-hazlenz-knowledge-coverage.ts'],
  },
  {
    name: 'Validate human review workflow',
    command: 'npx',
    args: ['ts-node', '--project', 'backend/tsconfig.json', 'backend/scripts/validate-hazlenz-knowledge-review-workflow.ts'],
  },
  {
    name: 'Export approved knowledge bundle',
    command: 'npx',
    args: ['ts-node', '--project', 'backend/tsconfig.json', 'backend/scripts/export-approved-hazlenz-knowledge.ts'],
  },
  {
    name: 'Validate approved knowledge bundle',
    command: 'npx',
    args: ['ts-node', '--project', 'backend/tsconfig.json', 'backend/scripts/validate-approved-hazlenz-knowledge-export.ts'],
  },
  {
    name: 'Validate approved export fixture lifecycle',
    command: 'npx',
    args: ['ts-node', '--project', 'backend/tsconfig.json', 'backend/scripts/validate-safescope-approved-export-with-fixture.ts'],
  },
  {
    name: 'Validate approved knowledge query service',
    command: 'npx',
    args: ['ts-node', '--project', 'backend/tsconfig.json', 'backend/scripts/validate-safescope-approved-knowledge-query.ts'],
  },
  {
    name: 'Validate disabled approved knowledge bridge',
    command: 'npx',
    args: ['ts-node', '--project', 'backend/tsconfig.json', 'backend/scripts/validate-safescope-approved-knowledge-bridge.ts'],
  },
  {
    name: 'Validate approved knowledge bridge contract',
    command: 'npx',
    args: ['ts-node', '--project', 'backend/tsconfig.json', 'backend/scripts/validate-safescope-approved-knowledge-bridge-contract.ts'],
  },
  {
    name: 'Generate approved knowledge bridge snapshot',
    command: 'npx',
    args: ['ts-node', '--project', 'backend/tsconfig.json', 'backend/scripts/generate-safescope-approved-knowledge-bridge-snapshot.ts'],
  },
  {
    name: 'Validate approved knowledge bridge snapshot',
    command: 'npx',
    args: ['ts-node', '--project', 'backend/tsconfig.json', 'backend/scripts/validate-safescope-approved-knowledge-bridge-snapshot.ts'],
  },
  {
    name: 'Validate disabled approved knowledge integration adapter',
    command: 'npx',
    args: ['ts-node', '--project', 'backend/tsconfig.json', 'backend/scripts/validate-safescope-approved-knowledge-integration-adapter.ts'],
  },
  {
    name: 'Validate approved knowledge integration contract',
    command: 'npx',
    args: ['ts-node', '--project', 'backend/tsconfig.json', 'backend/scripts/validate-safescope-approved-knowledge-integration-contract.ts'],
  },
  {
    name: 'Generate approved knowledge integration snapshot',
    command: 'npx',
    args: ['ts-node', '--project', 'backend/tsconfig.json', 'backend/scripts/generate-safescope-approved-knowledge-integration-snapshot.ts'],
  },
  {
    name: 'Validate approved knowledge integration snapshot',
    command: 'npx',
    args: ['ts-node', '--project', 'backend/tsconfig.json', 'backend/scripts/validate-safescope-approved-knowledge-integration-snapshot.ts'],
  },
  {
    name: 'Validate HazLenz reasoning orchestrator v1',
    command: 'npx',
    args: ['ts-node', '--project', 'backend/tsconfig.json', 'backend/scripts/validate-safescope-reasoning-orchestrator.ts'],
  },
  {
    name: 'Validate HazLenz applicability analysis',
    command: 'npx',
    args: ['ts-node', '--project', 'backend/tsconfig.json', 'backend/scripts/validate-safescope-applicability-analysis.ts'],
  },
  {
    name: 'Validate HazLenz corrective action reasoning',
    command: 'npx',
    args: ['ts-node', '--project', 'backend/tsconfig.json', 'backend/scripts/validate-safescope-corrective-action-reasoning.ts'],
  },
  {
    name: 'Validate HazLenz reasoning scenarios',
    command: 'npx',
    args: ['ts-node', '--project', 'backend/tsconfig.json', 'backend/scripts/validate-safescope-reasoning-scenarios.ts'],
  },
  {
    name: 'Validate HazLenz domain candidate scoring',
    command: 'npx',
    args: ['ts-node', '--project', 'backend/tsconfig.json', 'backend/scripts/validate-safescope-domain-candidate-scoring.ts'],
  },
  {
    name: 'Validate HazLenz equipment knowledge registry',
    command: 'npx',
    args: ['ts-node', '--project', 'backend/tsconfig.json', 'backend/scripts/validate-safescope-equipment-knowledge.ts'],
  },
  {
    name: 'Validate HazLenz equipment context detector',
    command: 'npx',
    args: ['ts-node', '--project', 'backend/tsconfig.json', 'backend/scripts/validate-safescope-equipment-context-detector.ts'],
  },
  {
    name: 'Validate HazLenz equipment task mechanisms',
    command: 'npx',
    args: ['ts-node', '--project', 'backend/tsconfig.json', 'backend/scripts/validate-safescope-equipment-task-mechanisms.ts'],
  },
  {
    name: 'Generate HazLenz reasoning scenario coverage',
    command: 'npx',
    args: ['ts-node', '--project', 'backend/tsconfig.json', 'backend/scripts/generate-safescope-reasoning-scenario-coverage.ts'],
  },
  {
    name: 'Validate HazLenz reasoning scenario coverage',
    command: 'npx',
    args: ['ts-node', '--project', 'backend/tsconfig.json', 'backend/scripts/validate-safescope-reasoning-scenario-coverage.ts'],
  },
  {
    name: 'Generate HazLenz reasoning scenario maturity',
    command: 'npx',
    args: ['ts-node', '--project', 'backend/tsconfig.json', 'backend/scripts/generate-safescope-reasoning-scenario-maturity.ts'],
  },
  {
    name: 'Validate HazLenz reasoning scenario maturity',
    command: 'npx',
    args: ['ts-node', '--project', 'backend/tsconfig.json', 'backend/scripts/validate-safescope-reasoning-scenario-maturity.ts'],
  },
  {
    name: 'Generate HazLenz reasoning orchestrator snapshot',
    command: 'npx',
    args: ['ts-node', '--project', 'backend/tsconfig.json', 'backend/scripts/generate-safescope-reasoning-orchestrator-snapshot.ts'],
  },
  {
    name: 'Validate HazLenz reasoning orchestrator snapshot',
    command: 'npx',
    args: ['ts-node', '--project', 'backend/tsconfig.json', 'backend/scripts/validate-safescope-reasoning-orchestrator-snapshot.ts'],
  },
  {
    name: 'Final approved knowledge bundle validation',
    command: 'npx',
    args: ['ts-node', '--project', 'backend/tsconfig.json', 'backend/scripts/validate-approved-hazlenz-knowledge-export.ts'],
  },
];

console.log('🚦 Starting HazLenz knowledge pipeline validation...\n');

for (const [index, step] of steps.entries()) {
  console.log(`\n[${index + 1}/${steps.length}] ${step.name}`);
  execFileSync(step.command, step.args, {
    cwd: process.cwd(),
    stdio: 'inherit',
  });
}

console.log('\n✅ HazLenz knowledge pipeline validation passed.');
