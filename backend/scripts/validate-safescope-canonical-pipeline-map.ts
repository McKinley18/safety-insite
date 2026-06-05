import { CANONICAL_PIPELINE_REGISTRY } from '../src/safescope-v2/orchestration/contract/pipeline.registry';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const requiredStages = [
  'observation_context',
  'scenario',
  'citation_level_review',
  'evidence_gap_questions',
  'corrective_action',
  'confidence'
];

console.log("Validating Canonical Pipeline Registry...");

for (const stageId of requiredStages) {
  const stage = CANONICAL_PIPELINE_REGISTRY.find(s => s.stageId === stageId);
  assert(!!stage, `Missing required pipeline stage: ${stageId}`);
  assert(stage!.guardrails.includes('advisoryOnly'), `Stage ${stageId} missing advisoryOnly guardrail`);
  console.log(`Verified stage: ${stageId}`);
}

console.log("Canonical Pipeline Registry validation passed.");
