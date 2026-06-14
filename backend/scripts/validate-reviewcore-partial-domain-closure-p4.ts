import { SCENARIO_FAMILY_REGISTRY } from '../src/safescope-v2/brain/scenario-family-knowledge/scenario-family.registry';
import { EVIDENCE_GAP_QUESTION_REGISTRY } from '../src/safescope-v2/brain/evidence-gap-question-generator/evidence-gap-question.registry';
import { CORRECTIVE_ACTION_TEMPLATE_REGISTRY } from '../src/safescope-v2/corrective-actions/corrective-action-template.registry';

const domains = [
  'emergency_preparedness',
  'ppe',
  'hazardous_materials',
  'health_respiratory',
  'roof_rib_control',
  'fire_protection',
  'ventilation',
];

let errors = 0;

function fail(message: string) {
  errors++;
  console.error(`ERROR: ${message}`);
}

for (const domain of domains) {
  const scenarios = SCENARIO_FAMILY_REGISTRY.filter((record) => record.domain === domain);
  const evidence = EVIDENCE_GAP_QUESTION_REGISTRY.filter((record) => record.hazardDomain === domain);
  const templates = CORRECTIVE_ACTION_TEMPLATE_REGISTRY.filter((record) => record.domain === domain);

  if (scenarios.length < 1) fail(`${domain}: expected at least 1 scenario family`);
  if (evidence.length < 1) fail(`${domain}: expected at least 1 evidence gap question`);
  if (templates.length < 1) fail(`${domain}: expected at least 1 corrective template`);

  for (const scenario of scenarios) {
    if (scenario.advisoryOnly !== true) fail(`${scenario.id}: advisoryOnly must be true`);
    if (scenario.doesNotDeclareViolation !== true) fail(`${scenario.id}: doesNotDeclareViolation must be true`);
    if (scenario.requiresQualifiedReview !== true) fail(`${scenario.id}: requiresQualifiedReview must be true`);
  }

  for (const gap of evidence) {
    if (gap.advisoryGuardrails.advisoryOnly !== true) fail(`${gap.id}: advisoryOnly guardrail must be true`);
    if (gap.advisoryGuardrails.doesNotDeclareViolation !== true) fail(`${gap.id}: doesNotDeclareViolation guardrail must be true`);
    if (gap.advisoryGuardrails.requiresQualifiedReview !== true) fail(`${gap.id}: requiresQualifiedReview guardrail must be true`);
  }
}

const blob = JSON.stringify({
  scenarios: SCENARIO_FAMILY_REGISTRY.filter((record) => domains.includes(record.domain)),
  evidence: EVIDENCE_GAP_QUESTION_REGISTRY.filter((record) => domains.includes(record.hazardDomain)),
  templates: CORRECTIVE_ACTION_TEMPLATE_REGISTRY.filter((record) => domains.includes(record.domain)),
}).toLowerCase();

for (const phrase of ['citation issued', 'violation issued', 'guaranteed compliance', 'no human review required']) {
  if (blob.includes(phrase)) fail(`forbidden final-decision language found: ${phrase}`);
}

if (errors > 0) {
  console.error(`ReviewCore P4 partial-domain closure validation failed with ${errors} error(s).`);
  process.exit(1);
}

console.log('✅ ReviewCore P4 partial-domain closure validation passed.');
