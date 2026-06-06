import { ObservationUnderstandingService } from '../src/safescope-v2/understanding/observation-understanding.service';

type ExpectedCase = {
  id: string;
  text: string;
  expected: {
    jurisdiction?: string;
    equipmentCategory?: string;
    component?: string;
    taskType?: string;
    workerExposed?: boolean | 'unclear';
    primaryEnergySource?: string;
    missingControl?: string;
    mechanism?: string;
  };
};

const cases: ExpectedCase[] = [
  {
    id: 'UNDERSTANDING-001',
    text: 'Employee cleaning spilled material at an operating conveyor tail pulley. Guard is missing.',
    expected: {
      equipmentCategory: 'conveyor',
      component: 'tail_pulley',
      taskType: 'cleanup',
      workerExposed: true,
      primaryEnergySource: 'mechanical_rotation',
      missingControl: 'guarding',
      mechanism: 'rotating_equipment_nip_point'
    }
  },
  {
    id: 'UNDERSTANDING-002',
    text: 'Worker inside an unprotected trench with vertical walls and no trench box.',
    expected: {
      equipmentCategory: 'excavation',
      taskType: 'unknown',
      workerExposed: true,
      primaryEnergySource: 'soil_collapse',
      missingControl: 'excavation_protective_system',
      mechanism: 'caught_in_cave_in'
    }
  },
  {
    id: 'UNDERSTANDING-003',
    text: 'Damaged extension cord with exposed conductor is in use in a wet processing area.',
    expected: {
      equipmentCategory: 'electrical_cord',
      primaryEnergySource: 'electrical',
      mechanism: 'electrical_shock'
    }
  },
  {
    id: 'UNDERSTANDING-004',
    text: 'Forklift operating in shared pedestrian aisle with employees walking beside moving equipment.',
    expected: {
      equipmentCategory: 'mobile_equipment',
      taskType: 'operation',
      workerExposed: true,
      primaryEnergySource: 'mobile_equipment_kinetic',
      mechanism: 'struck_by_mobile_equipment'
    }
  },
  {
    id: 'UNDERSTANDING-005',
    text: 'Fire extinguisher is blocked by stacked pallets and inspection tag is expired.',
    expected: {
      equipmentCategory: 'fire_protection_equipment',
      component: 'inspection_tag',
      primaryEnergySource: 'thermal_fire'
    }
  }
];

const service = new ObservationUnderstandingService();

let failed = false;

for (const c of cases) {
  const result = service.evaluate(c.text);
  const actualMechanism = result.mechanismCandidates[0]?.mechanism;

  const allChecks: Array<[string, unknown, unknown]> = [
    ['jurisdiction', c.expected.jurisdiction, result.jurisdiction.detected],
    ['equipmentCategory', c.expected.equipmentCategory, result.equipment.category],
    ['component', c.expected.component, result.equipment.component],
    ['taskType', c.expected.taskType, result.task.taskType],
    ['workerExposed', c.expected.workerExposed, result.exposure.workerExposed],
    ['primaryEnergySource', c.expected.primaryEnergySource, result.energy.primaryEnergySource],
    [
      'missingControl',
      c.expected.missingControl,
      result.controls.missingControls.includes(c.expected.missingControl || '') ? c.expected.missingControl : 'missing'
    ],
    ['mechanism', c.expected.mechanism, actualMechanism]
  ];

  const checks = allChecks.filter(([, expected]) => expected !== undefined);
  const misses = checks.filter(([, expected, actual]) => expected !== actual);

  console.log(`\n${c.id}`);
  console.log(`  equipment=${result.equipment.category}/${result.equipment.component}`);
  console.log(`  task=${result.task.taskType}`);
  console.log(`  exposure=${result.exposure.workerExposed}/${result.exposure.proximity}`);
  console.log(`  energy=${result.energy.primaryEnergySource}`);
  console.log(`  controls missing=${result.controls.missingControls.join(',') || 'none'}`);
  console.log(`  top mechanism=${actualMechanism}`);
  console.log(`  evidence gaps=${result.evidenceGaps.length}`);

  if (misses.length) {
    failed = true;
    console.log('  FAIL');
    for (const [field, expected, actual] of misses) {
      console.log(`    ${field}: expected=${expected} actual=${actual}`);
    }
  } else {
    console.log('  PASS');
  }
}

if (failed) {
  throw new Error('SafeScope understanding engine validation failed.');
}

console.log('\nSafeScope understanding engine validation passed.');
