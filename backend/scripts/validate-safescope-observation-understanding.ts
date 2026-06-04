import { SafeScopeObservationUnderstandingService } from '../src/safescope-v2/brain/observation-understanding/observation-understanding.service';

type Case = {
  id: string;
  text: string;
  expectedEntityKind: string;
  expectedDomainHint: string;
  expectedMechanismHint?: string;
  forbiddenDomainHint?: string;
  expectedCondition?: string;
};

const cases: Case[] = [
  {
    id: 'fire-extinguisher-label-not-legible',
    text: 'Label on fire extinguisher is not legible.',
    expectedEntityKind: 'emergency_equipment',
    expectedDomainHint: 'fire_protection',
    expectedMechanismHint: 'fire_extinguisher_access_failure',
    forbiddenDomainHint: 'hazard_communication',
    expectedCondition: 'not_legible',
  },
  {
    id: 'fire-extinguisher-inspection-tag-not-legible',
    text: 'The inspection tag on the portable fire extinguisher is not legible and monthly inspection status cannot be verified.',
    expectedEntityKind: 'emergency_equipment',
    expectedDomainHint: 'fire_protection',
    expectedMechanismHint: 'fire_extinguisher_access_failure',
    forbiddenDomainHint: 'hazard_communication',
    expectedCondition: 'not_legible',
  },
  {
    id: 'chemical-container-label-not-legible',
    text: 'Chemical container label is not legible and employees cannot identify the contents or hazards.',
    expectedEntityKind: 'chemical_container',
    expectedDomainHint: 'hazard_communication',
    expectedMechanismHint: 'chemical_exposure',
    forbiddenDomainHint: 'fire_protection',
    expectedCondition: 'not_legible',
  },
  {
    id: 'unlabeled-secondary-container',
    text: 'Unlabeled secondary container with unknown solvent stored near maintenance area.',
    expectedEntityKind: 'chemical_container',
    expectedDomainHint: 'hazard_communication',
    expectedMechanismHint: 'chemical_exposure',
    expectedCondition: 'unlabeled',
  },
  {
    id: 'blocked-fire-extinguisher',
    text: 'Fire extinguisher blocked by stored materials and not readily accessible.',
    expectedEntityKind: 'emergency_equipment',
    expectedDomainHint: 'fire_protection',
    expectedMechanismHint: 'fire_extinguisher_access_failure',
    expectedCondition: 'blocked',
  },
  {
    id: 'blocked-eyewash',
    text: 'Eyewash station blocked by pallets in chemical use area.',
    expectedEntityKind: 'emergency_equipment',
    expectedDomainHint: 'emergency_response',
    expectedMechanismHint: 'emergency_equipment_unavailable',
    expectedCondition: 'blocked',
  },
  {
    id: 'unguarded-conveyor-tail-pulley',
    text: 'Unguarded conveyor tail pulley with employee access during cleanup.',
    expectedEntityKind: 'equipment',
    expectedDomainHint: 'machine_guarding',
    expectedMechanismHint: 'rotating_equipment_nip_point',
    expectedCondition: 'unguarded',
  },
  {
    id: 'conveyor-maintenance-loto',
    text: 'Maintenance employee working on energized conveyor drive without lockout tagout verification.',
    expectedEntityKind: 'equipment',
    expectedDomainHint: 'machine_guarding',
    expectedMechanismHint: 'unexpected_startup',
  },
  {
    id: 'electrical-panel-label-not-legible',
    text: 'Electrical panel circuit label is not legible and breakers cannot be identified.',
    expectedEntityKind: 'electrical_equipment',
    expectedDomainHint: 'electrical',
    expectedMechanismHint: 'shock',
    forbiddenDomainHint: 'hazard_communication',
    expectedCondition: 'not_legible',
  },
  {
    id: 'forklift-pedestrian-blind-spot',
    text: 'Forklift operating near pedestrians at blind corner with no spotter.',
    expectedEntityKind: 'mobile_equipment',
    expectedDomainHint: 'mobile_equipment',
    expectedMechanismHint: 'pedestrian_strike',
  },
  {
    id: 'open-edge-platform',
    text: 'Open edge on elevated platform with employees working nearby and no guardrail visible.',
    expectedEntityKind: 'fall_exposure',
    expectedDomainHint: 'fall_protection',
    expectedMechanismHint: 'fall_from_height',
  },
  {
    id: 'eye-face-ppe-not-worn',
    text: 'Employee grinding metal without safety glasses or face shield.',
    expectedEntityKind: 'ppe',
    expectedDomainHint: 'ppe',
    expectedMechanismHint: 'eye_face_ppe_gap',
    expectedCondition: 'not_worn',
  },
  {
    id: 'defective-extension-cord',
    text: 'Extension cord has damaged insulation and exposed conductor near work area.',
    expectedEntityKind: 'electrical_equipment',
    expectedDomainHint: 'electrical',
    expectedMechanismHint: 'shock',
    expectedCondition: 'damaged',
  },
  {
    id: 'unstable-material-stack',
    text: 'Palletized material is stacked unevenly and leaning into employee aisle.',
    expectedEntityKind: 'material_storage',
    expectedDomainHint: 'material_handling',
    expectedMechanismHint: 'unstable_stack_collapse',
    expectedCondition: 'unstable',
  },
  {
    id: 'wet-floor-slip-exposure',
    text: 'Standing water creates slick floor condition where employees walk.',
    expectedEntityKind: 'walking_surface',
    expectedDomainHint: 'slip_trip_fall',
    expectedMechanismHint: 'slip',
  },
  {
    id: 'hot-work-fire-watch-gap',
    text: 'Hot work cutting near combustibles without fire watch verified.',
    expectedEntityKind: 'hot_work',
    expectedDomainHint: 'welding_cutting_hot_work',
    expectedMechanismHint: 'fire_watch_gap',
  },
  {
    id: 'confined-space-entry-atmospheric-hazard',
    text: 'Confined space entry started without atmospheric testing documented.',
    expectedEntityKind: 'confined_space',
    expectedDomainHint: 'confined_space',
    expectedMechanismHint: 'asphyxiation',
  },
  {
    id: 'trench-no-protective-system',
    text: 'Employee working in trench with no protective system visible.',
    expectedEntityKind: 'excavation',
    expectedDomainHint: 'excavation_trenching',
    expectedMechanismHint: 'collapse',
  },
  {
    id: 'damaged-rigging-sling',
    text: 'Damaged sling found during rigging inspection before hoisting load.',
    expectedEntityKind: 'rigging_equipment',
    expectedDomainHint: 'cranes_rigging_hoisting',
    expectedMechanismHint: 'rigging_failure',
    expectedCondition: 'damaged',
  },
  {
    id: 'blocked-emergency-exit',
    text: 'Emergency exit route is blocked by stored materials.',
    expectedEntityKind: 'egress',
    expectedDomainHint: 'emergency_preparedness',
    expectedMechanismHint: 'egress_blockage',
    expectedCondition: 'blocked',
  },
];

const service = new SafeScopeObservationUnderstandingService();

let failures = 0;

function includes(values: string[], expected?: string): boolean {
  if (!expected) return true;
  return values.includes(expected);
}

for (const testCase of cases) {
  const result = service.analyze(testCase.text);
  const summary = result.summary;

  const errors: string[] = [];

  if (summary.primaryEntityKind !== testCase.expectedEntityKind) {
    errors.push(`expected entity ${testCase.expectedEntityKind}, got ${summary.primaryEntityKind}`);
  }

  if (!includes(summary.likelyDomainHints, testCase.expectedDomainHint)) {
    errors.push(`missing expected domain hint ${testCase.expectedDomainHint}`);
  }

  if (testCase.expectedMechanismHint && !includes(summary.likelyMechanismHints, testCase.expectedMechanismHint)) {
    errors.push(`missing expected mechanism hint ${testCase.expectedMechanismHint}`);
  }

  if (testCase.forbiddenDomainHint && summary.likelyDomainHints.includes(testCase.forbiddenDomainHint)) {
    errors.push(`included forbidden domain hint ${testCase.forbiddenDomainHint}`);
  }

  if (testCase.expectedCondition && summary.primaryCondition !== testCase.expectedCondition) {
    errors.push(`expected condition ${testCase.expectedCondition}, got ${summary.primaryCondition}`);
  }

  if (!result.boundary.readOnly || !result.boundary.doesNotOverrideProductionDecision) {
    errors.push('read-only boundary not preserved');
  }

  if (errors.length) {
    failures++;
    console.error(`❌ ${testCase.id}`);
    console.error(errors.join('\n'));
    console.error(JSON.stringify(result, null, 2));
  } else {
    console.log(`✅ ${testCase.id}`);
  }
}

if (failures > 0) {
  throw new Error(`${failures} observation understanding case(s) failed.`);
}

console.log('✅ SafeScope observation understanding validation passed.');
