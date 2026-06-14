import { SCENARIO_FAMILY_REGISTRY } from '../src/safescope-v2/brain/scenario-family-knowledge/scenario-family.registry';
import { EVIDENCE_GAP_QUESTION_REGISTRY } from '../src/safescope-v2/brain/evidence-gap-question-generator/evidence-gap-question.registry';
import { CORRECTIVE_ACTION_TEMPLATE_REGISTRY } from '../src/safescope-v2/corrective-actions/corrective-action-template.registry';

const weakDomains = ['bloodborne_pathogens', 'cranes_rigging_hoisting', 'ergonomics', 'industrial_hygiene'];
const partialDomains = [
    'emergency_preparedness', 'ppe', 'fire_protection', 'hazardous_materials',
    'health_respiratory', 'material_handling', 'roof_rib_control',
    'trenching_and_excavation', 'ventilation', 'confined_space'
];

let errors = 0;

function logError(msg: string) {
    console.error(`ERROR: ${msg}`);
    errors++;
}

// 1. Weak domain checks
const cranesScenarios = SCENARIO_FAMILY_REGISTRY.filter(s => s.domain === 'cranes_rigging_hoisting');
if (cranesScenarios.length < 4) logError(`Cranes expected >= 4 scenarios, found ${cranesScenarios.length}`);
if (EVIDENCE_GAP_QUESTION_REGISTRY.filter(e => e.hazardDomain === 'cranes_rigging_hoisting').length < 4) logError('Cranes expected >= 4 evidence gap families');
if (CORRECTIVE_ACTION_TEMPLATE_REGISTRY.filter(c => c.domain === 'cranes_rigging_hoisting').length < 1) logError('Cranes expected >= 1 corrective template');

const bloodborneScenarios = SCENARIO_FAMILY_REGISTRY.filter(s => s.domain === 'bloodborne_pathogens');
if (bloodborneScenarios.length < 3) logError(`Bloodborne expected >= 3 scenarios, found ${bloodborneScenarios.length}`);
if (CORRECTIVE_ACTION_TEMPLATE_REGISTRY.filter(c => c.domain === 'bloodborne_pathogens').length < 1) logError('Bloodborne expected >= 1 corrective template');

const ergonomicsScenarios = SCENARIO_FAMILY_REGISTRY.filter(s => s.domain === 'ergonomics');
if (ergonomicsScenarios.length < 3) logError(`Ergonomics expected >= 3 scenarios, found ${ergonomicsScenarios.length}`);
if (CORRECTIVE_ACTION_TEMPLATE_REGISTRY.filter(c => c.domain === 'ergonomics').length < 1) logError('Ergonomics expected >= 1 corrective template');

const ihScenarios = SCENARIO_FAMILY_REGISTRY.filter(s => s.domain === 'industrial_hygiene');
if (ihScenarios.length < 4) logError(`IH expected >= 4 scenarios, found ${ihScenarios.length}`);
if (CORRECTIVE_ACTION_TEMPLATE_REGISTRY.filter(c => c.domain === 'industrial_hygiene').length < 1) logError('IH expected >= 1 corrective template');

// 2. Partial domain checks (at least one scenario family or evidence-gap record)
for (const domain of partialDomains) {
    const scenarios = SCENARIO_FAMILY_REGISTRY.filter(s => s.domain === domain);
    const evidence = EVIDENCE_GAP_QUESTION_REGISTRY.filter(e => e.hazardDomain === domain);
    if (scenarios.length === 0 && evidence.length === 0) {
        logError(`Partial domain ${domain} needs at least one scenario or evidence gap record`);
    }
}

// 3. Guardrails
for (const item of SCENARIO_FAMILY_REGISTRY) {
    if (item.advisoryOnly === false) logError(`Scenario ${item.id} must be advisoryOnly`);
    if (item.doesNotDeclareViolation === false) logError(`Scenario ${item.id} must be doesNotDeclareViolation`);
    if (item.requiresQualifiedReview === false) logError(`Scenario ${item.id} must be requiresQualifiedReview`);
}

for (const item of EVIDENCE_GAP_QUESTION_REGISTRY) {
    if (item.advisoryGuardrails.advisoryOnly === false) logError(`Evidence ${item.id} must be advisoryOnly`);
    if (item.advisoryGuardrails.doesNotDeclareViolation === false) logError(`Evidence ${item.id} must be doesNotDeclareViolation`);
    if (item.advisoryGuardrails.requiresQualifiedReview === false) logError(`Evidence ${item.id} must be requiresQualifiedReview`);
}

// 4. Forbidden language
const forbidden = ["citation issued", "compliant", "noncompliant", "guaranteed"];
const registryText = JSON.stringify(SCENARIO_FAMILY_REGISTRY).toLowerCase();
for (const f of forbidden) {
    if (registryText.includes(f)) logError(`Forbidden word found: ${f}`);
}
// Specifically check for 'violation' outside of guardrails if necessary, 
// but here we know 'doesNotDeclareViolation' key contains it, so we skip it.
if (registryText.replace(/"doesnotdeclareviolation":true/g, "").includes("violation")) {
    logError(`Forbidden word found: violation`);
}

if (errors > 0) {
    console.log(`Validation failed with ${errors} errors.`);
    process.exit(1);
} else {
    console.log('Validation passed!');
    process.exit(0);
}
