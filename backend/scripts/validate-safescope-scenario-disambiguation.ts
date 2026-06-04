import { SafeScopeScenarioDisambiguationService } from '../src/safescope-v2/brain/scenario-disambiguation/scenario-disambiguation.service';
import { SAFESCOPE_SCENARIO_DISAMBIGUATION_REGISTRY } from '../src/safescope-v2/brain/scenario-disambiguation/scenario-disambiguation.registry';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const service = new SafeScopeScenarioDisambiguationService();

for (const record of SAFESCOPE_SCENARIO_DISAMBIGUATION_REGISTRY) {
  assert(record.scenarioId.trim().length > 0, 'Scenario record must have scenarioId.');
  assert(record.label.trim().length > 0, `${record.scenarioId} must have label.`);
  assert(record.targetDomain.trim().length > 0, `${record.scenarioId} must have targetDomain.`);
  assert(record.targetMechanism.trim().length > 0, `${record.scenarioId} must have targetMechanism.`);
  assert(record.positiveSignals.length > 0, `${record.scenarioId} must have positive signals.`);
  assert(record.negativeSignals.length > 0, `${record.scenarioId} must have negative signals.`);
}

const constructionFallingObject = service.query({
  text: 'Construction crew performing overhead work with tools above employees below and no toe board or barricade below.',
  jurisdiction: 'osha_construction',
  industryContext: 'construction',
  siteType: 'construction',
});

assert(
  constructionFallingObject.selected?.record.scenarioId === 'construction-falling-object-overhead-work',
  `Construction falling object should rank construction scenario first, got ${constructionFallingObject.selected?.record.scenarioId}`,
);

const materialStorage = service.query({
  text: 'Warehouse palletized material stored overhead on rack could fall into employee aisle.',
  jurisdiction: 'osha_general_industry',
  industryContext: 'general industry',
  siteType: 'facility',
});

assert(
  materialStorage.selected?.record.scenarioId === 'general-industry-material-falling-object-storage',
  `General industry storage falling object should rank storage scenario first, got ${materialStorage.selected?.record.scenarioId}`,
);

const weldingCylinder = service.query({
  text: 'Oxygen cylinder and acetylene fuel gas cylinder stored together in welding area without required separation.',
  jurisdiction: 'osha_general_industry',
  industryContext: 'general industry',
  equipmentInvolved: 'oxygen and acetylene cylinders',
});

assert(
  weldingCylinder.selected?.record.scenarioId === 'welding-cylinder-fire-explosion',
  `Welding cylinder storage should rank fire/explosion scenario first, got ${weldingCylinder.selected?.record.scenarioId}`,
);

const compressedGas = service.query({
  text: 'Unsecured compressed gas cylinder missing valve cap and not restrained upright in storage area.',
  jurisdiction: 'osha_general_industry',
  industryContext: 'general industry',
  equipmentInvolved: 'compressed gas cylinder',
});

assert(
  compressedGas.selected?.record.scenarioId === 'compressed-gas-cylinder-release',
  `Compressed gas cylinder should rank pressure-release scenario first, got ${compressedGas.selected?.record.scenarioId}`,
);

const coalVent = service.query({
  text: 'Underground coal section has damaged ventilation curtain and methane gas buildup concern.',
  jurisdiction: 'msha',
  industryContext: 'coal mining',
  siteType: 'mine',
});

assert(
  coalVent.selected?.record.scenarioId === 'coal-underground-methane-ventilation',
  `Coal ventilation should rank coal methane scenario first, got ${coalVent.selected?.record.scenarioId}`,
);

const mnmVent = service.query({
  text: 'Underground metal nonmetal mine has damaged ventilation tubing, reduced airflow, and air quality contaminant buildup.',
  jurisdiction: 'msha',
  industryContext: 'metal nonmetal mining',
  siteType: 'mine',
});

assert(
  mnmVent.selected?.record.scenarioId === 'mnm-underground-air-quality-ventilation',
  `MNM ventilation should rank MNM air quality scenario first, got ${mnmVent.selected?.record.scenarioId}`,
);

console.log('✅ SafeScope Scenario Disambiguation v1 validation passed.');
console.log(`Scenario records: ${SAFESCOPE_SCENARIO_DISAMBIGUATION_REGISTRY.length}`);
console.log(`Construction falling object: ${constructionFallingObject.selected?.record.scenarioId}`);
console.log(`GI material storage: ${materialStorage.selected?.record.scenarioId}`);
console.log(`Welding cylinder: ${weldingCylinder.selected?.record.scenarioId}`);
console.log(`Compressed gas cylinder: ${compressedGas.selected?.record.scenarioId}`);
console.log(`Coal ventilation: ${coalVent.selected?.record.scenarioId}`);
console.log(`MNM ventilation: ${mnmVent.selected?.record.scenarioId}`);
