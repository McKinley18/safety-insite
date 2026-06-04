import { SAFESCOPE_MECHANISM_REGISTRY } from '../src/safescope-v2/mechanism-intelligence/safescope-mechanism.registry';
import { SAFESCOPE_MECHANISM_BRAIN_REGISTRY } from '../src/safescope-v2/brain/mechanism-brain/mechanism-knowledge.registry';
import { SafeScopeMechanismBrainService } from '../src/safescope-v2/brain/mechanism-brain/mechanism-brain.service';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const service = new SafeScopeMechanismBrainService();

const registryMechanismIds = new Set(SAFESCOPE_MECHANISM_REGISTRY.map((entry) => entry.id));
const brainMechanismIds = new Set(SAFESCOPE_MECHANISM_BRAIN_REGISTRY.map((entry) => entry.mechanismId));

for (const mechanism of SAFESCOPE_MECHANISM_REGISTRY) {
  assert(
    brainMechanismIds.has(mechanism.id),
    `Mechanism Brain missing mechanism from SAFESCOPE_MECHANISM_REGISTRY: ${mechanism.id}`,
  );
}

for (const record of SAFESCOPE_MECHANISM_BRAIN_REGISTRY) {
  assert(record.mechanismId.trim().length > 0, 'Mechanism record must have mechanismId.');
  assert(record.label.trim().length > 0, `${record.mechanismId} must have label.`);
  assert(record.hazardDomains.length > 0, `${record.mechanismId} must have hazard domain.`);
  assert(record.energyType.trim().length > 0, `${record.mechanismId} must have energy type.`);
  assert(record.exposurePathway.trim().length > 0, `${record.mechanismId} must have exposure pathway.`);
  assert(record.commonTriggerTerms.length > 0, `${record.mechanismId} must have trigger terms.`);
  assert(record.evidenceQuestions.length > 0, `${record.mechanismId} must have evidence questions.`);
  assert(record.immediateControls.length > 0, `${record.mechanismId} must have immediate controls.`);
  assert(record.verificationEvidence.length > 0, `${record.mechanismId} must have verification evidence.`);

  assert(
    registryMechanismIds.has(record.mechanismId),
    `${record.mechanismId} must remain aligned to the current mechanism registry.`,
  );
}

const forkliftQuery = service.query({
  hazardDomain: 'mobile_equipment',
  text: 'forklift operating near pedestrians in aisle with no separation',
  limit: 3,
});

assert(
  forkliftQuery.matches[0]?.record.mechanismId === 'pedestrian_strike',
  `Forklift pedestrian query should rank pedestrian_strike first, got ${forkliftQuery.matches[0]?.record.mechanismId}`,
);

const conductorQuery = service.query({
  hazardDomain: 'electrical',
  text: 'damaged electrical cable with exposed conductor and arc flash exposure',
  limit: 3,
});

assert(
  conductorQuery.matches[0]?.record.mechanismId === 'shock_arc_flash',
  `Damaged conductor query should rank shock_arc_flash first, got ${conductorQuery.matches[0]?.record.mechanismId}`,
);

const escapewayQuery = service.query({
  hazardDomain: 'emergency_preparedness',
  text: 'blocked escapeway with stored material obstructing lifeline route',
  limit: 3,
});

assert(
  escapewayQuery.matches[0]?.record.mechanismId === 'egress_blockage',
  `Escapeway query should rank egress_blockage first, got ${escapewayQuery.matches[0]?.record.mechanismId}`,
);

const silicaQuery = service.query({
  hazardDomain: 'health_respiratory',
  text: 'dry cutting concrete creates respirable crystalline silica dust exposure',
  limit: 3,
});

assert(
  silicaQuery.matches[0]?.record.mechanismId === 'silica_inhalation',
  `Silica query should rank silica_inhalation first, got ${silicaQuery.matches[0]?.record.mechanismId}`,
);

const undergroundGuardingQuery = service.query({
  hazardDomain: 'machine_guarding',
  text: 'underground metal nonmetal conveyor tail pulley guarding rotating equipment nip point',
  limit: 5,
});

assert(
  undergroundGuardingQuery.matches.some((match) => match.record.mechanismId === 'rotating_equipment_nip_point'),
  'Underground conveyor guarding query should include rotating_equipment_nip_point.',
);

const suspendedLoadQuery = service.query({
  hazardDomain: 'cranes_rigging_hoisting',
  text: 'employee standing under suspended crane load in the load path without exclusion zone',
  limit: 5,
});

assert(
  suspendedLoadQuery.matches[0]?.record.mechanismId === 'struck_by_suspended_load',
  `Suspended load query should rank struck_by_suspended_load first, got ${suspendedLoadQuery.matches[0]?.record.mechanismId}`,
);

const riggingQuery = service.query({
  hazardDomain: 'cranes_rigging_hoisting',
  text: 'damaged sling used for hoisting load with rigging defect and no pre-use inspection',
  limit: 5,
});

assert(
  riggingQuery.matches.some((match) => match.record.mechanismId === 'rigging_failure'),
  'Damaged rigging query should include rigging_failure.',
);

console.log('✅ SafeScope Mechanism Brain validation passed.');
console.log(`Mechanism registry records: ${SAFESCOPE_MECHANISM_REGISTRY.length}`);
console.log(`Mechanism Brain records: ${SAFESCOPE_MECHANISM_BRAIN_REGISTRY.length}`);
console.log(`Top forklift query: ${forkliftQuery.matches[0]?.record.mechanismId}`);
console.log(`Top conductor query: ${conductorQuery.matches[0]?.record.mechanismId}`);
console.log(`Top escapeway query: ${escapewayQuery.matches[0]?.record.mechanismId}`);
console.log(`Top silica query: ${silicaQuery.matches[0]?.record.mechanismId}`);
console.log(`Top suspended-load query: ${suspendedLoadQuery.matches[0]?.record.mechanismId}`);
