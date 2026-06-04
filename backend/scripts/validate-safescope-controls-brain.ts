import { CORRECTIVE_ACTION_TEMPLATE_REGISTRY } from '../src/safescope-v2/corrective-actions/corrective-action-template.registry';
import { SafeScopeControlsBrainService } from '../src/safescope-v2/brain/controls-brain/controls-brain.service';
import { SAFESCOPE_CONTROLS_BRAIN_REGISTRY } from '../src/safescope-v2/brain/controls-brain/controls-knowledge.registry';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const service = new SafeScopeControlsBrainService();

assert(SAFESCOPE_CONTROLS_BRAIN_REGISTRY.length >= 15, 'Controls Brain should include at least 15 records.');

for (const record of SAFESCOPE_CONTROLS_BRAIN_REGISTRY) {
  assert(record.controlId, 'Every Controls Brain record must have a controlId.');
  assert(record.hazardDomains.length > 0, `${record.controlId} must have at least one hazard domain.`);
  assert(record.mechanisms.length > 0, `${record.controlId} must have at least one mechanism.`);
  assert(record.immediateControl.length > 10, `${record.controlId} must have a meaningful immediate control.`);
  assert(record.permanentControl.length > 10, `${record.controlId} must have a meaningful permanent control.`);
  assert(record.verificationEvidence.length > 0, `${record.controlId} must have verification evidence.`);
  assert(record.failureModesIfNotVerified.length > 0, `${record.controlId} must define failure modes if not verified.`);
}

const uncoveredTemplates = CORRECTIVE_ACTION_TEMPLATE_REGISTRY
  .map((template) => template.domain)
  .filter((domain) => !SAFESCOPE_CONTROLS_BRAIN_REGISTRY.some((record) => record.hazardDomains.includes(domain)));

assert(
  uncoveredTemplates.length === 0,
  `Every corrective-action template domain must have Controls Brain coverage. Missing: ${uncoveredTemplates.join(', ')}`,
);

const forkliftQuery = service.query({
  hazardDomain: 'mobile_equipment',
  mechanism: 'pedestrian_strike',
  text: 'forklift operating near pedestrians with no separation',
});

assert(
  forkliftQuery.matches[0]?.record.controlId === 'control-mobile-equipment-pedestrian-separation',
  'Forklift pedestrian query should rank pedestrian separation controls first.',
);

const lotoQuery = service.query({
  hazardDomain: 'machine_guarding_loto',
  mechanism: 'unexpected_startup',
  text: 'crusher maintenance without lockout and blocking',
});

assert(
  lotoQuery.matches[0]?.record.controlId === 'control-loto-energy-isolation',
  'LOTO query should rank energy isolation controls first.',
);

const confinedQuery = service.query({
  hazardDomain: 'confined_space',
  mechanism: 'asphyxiation',
  text: 'confined space entry without atmospheric testing attendant or permit',
});

assert(
  confinedQuery.matches[0]?.record.controlId === 'control-confined-space-entry',
  'Confined space query should rank confined space entry controls first.',
);

const silicaQuery = service.query({
  hazardDomain: 'health_respiratory',
  mechanism: 'silica_inhalation',
  text: 'dry cutting concrete generating respirable crystalline silica dust',
});

assert(
  silicaQuery.matches[0]?.record.controlId === 'control-health-respiratory-silica',
  'Silica query should rank silica exposure controls first.',
);

console.log('✅ SafeScope Controls Brain validation passed.');
console.log(`Corrective action template domains covered: ${CORRECTIVE_ACTION_TEMPLATE_REGISTRY.length}`);
console.log(`Controls Brain records: ${SAFESCOPE_CONTROLS_BRAIN_REGISTRY.length}`);
console.log(`Top forklift query: ${forkliftQuery.matches[0]?.record.controlId}`);
console.log(`Top LOTO query: ${lotoQuery.matches[0]?.record.controlId}`);
console.log(`Top confined-space query: ${confinedQuery.matches[0]?.record.controlId}`);
console.log(`Top silica query: ${silicaQuery.matches[0]?.record.controlId}`);
