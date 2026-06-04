import { SafeScopeBrainSnapshotBuilderService } from '../src/safescope-v2/brain/snapshot-builder/brain-snapshot-builder.service';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

type FieldReadinessCase = {
  id: string;
  hazardObservation: string;
  jurisdiction: any;
  hazardDomain: any;
  expectedCitation: string;
  expectedMechanism: string;
};

const builder = new SafeScopeBrainSnapshotBuilderService();

const cases: FieldReadinessCase[] = [
  {
    id: 'OSHA-GI-EYEWASH-001',
    jurisdiction: 'osha_general_industry',
    hazardDomain: 'emergency_preparedness',
    hazardObservation: 'General industry facility has corrosive chemical use with the emergency eyewash blocked by stored material and not immediately accessible.',
    expectedCitation: '29 CFR 1910.151(c)',
    expectedMechanism: 'emergency_equipment_access_failure',
  },
  {
    id: 'OSHA-CONST-STAIRWAY-001',
    jurisdiction: 'osha_construction',
    hazardDomain: 'slips_trips_falls',
    hazardObservation: 'Construction temporary stairway used for access has an open side with missing handrail.',
    expectedCitation: '29 CFR 1926.1052(c)(1)',
    expectedMechanism: 'fall_on_stairway',
  },
  {
    id: 'OSHA-GI-COMPRESSED-GAS-001',
    jurisdiction: 'osha_general_industry',
    hazardDomain: 'material_handling',
    hazardObservation: 'Compressed gas cylinder in a general industry shop is unsecured and missing a valve cap while stored in an employee work area.',
    expectedCitation: '29 CFR 1910.101(b)',
    expectedMechanism: 'compressed_gas_cylinder_release',
  },
  {
    id: 'OSHA-CONST-STRUCK-BY-OVERHEAD-001',
    jurisdiction: 'osha_construction',
    hazardDomain: 'struck_by',
    hazardObservation: 'Construction overhead work is occurring with tools and materials above employees below and no toeboards, barricade, canopy, or falling-object controls.',
    expectedCitation: '29 CFR 1926.501(c)',
    expectedMechanism: 'struck_by_falling_object',
  },
  {
    id: 'MSHA-MNM-UG-VENT-001',
    jurisdiction: 'msha',
    hazardDomain: 'ventilation',
    hazardObservation: 'Underground metal/nonmetal mine has damaged ventilation tubing causing reduced airflow and possible contaminant buildup in the work area.',
    expectedCitation: '30 CFR 57.8520',
    expectedMechanism: 'air_quality_contaminant_buildup',
  },
  {
    id: 'OSHA-GI-WELDING-CYLINDER-001',
    jurisdiction: 'osha_general_industry',
    hazardDomain: 'welding_cutting_hot_work',
    hazardObservation: 'Oxygen and fuel gas welding cylinders are stored together without required separation or noncombustible barrier near hot work.',
    expectedCitation: '29 CFR 1910.253(b)(2)(ii)',
    expectedMechanism: 'fire_explosion',
  },
  {
    id: 'OSHA-GI-BLOODBORNE-001',
    jurisdiction: 'osha_general_industry',
    hazardDomain: 'health_exposure',
    hazardObservation: 'Sharps and blood-contaminated materials are handled without a proper sharps container, PPE, or bloodborne pathogen exposure control process.',
    expectedCitation: '29 CFR 1910.1030',
    expectedMechanism: 'bloodborne_pathogen_exposure',
  },
  {
    id: 'MSHA-COAL-UG-ELECT-CABLE-001',
    jurisdiction: 'msha',
    hazardDomain: 'electrical',
    hazardObservation: 'Underground coal mine trailing cable has damaged cable insulation and jacket damage creating shock and arc flash exposure.',
    expectedCitation: '30 CFR 75.517',
    expectedMechanism: 'shock_arc_flash',
  },
  {
    id: 'OSHA-GI-CHEM-STORAGE-001',
    jurisdiction: 'osha_general_industry',
    hazardDomain: 'hazcom',
    hazardObservation: 'General industry chemical storage area has unlabeled secondary chemical containers and missing SDS/hazard communication information.',
    expectedCitation: '29 CFR 1910.1200',
    expectedMechanism: 'chemical_exposure',
  },
];

for (const testCase of cases) {
  const snapshot = builder.build({
    hazardObservation: testCase.hazardObservation,
    jurisdiction: testCase.jurisdiction,
    hazardDomain: testCase.hazardDomain,
  });

  const citation = snapshot.situationalAwarenessPacket.summary.likelyCitation;
  const mechanism = snapshot.situationalAwarenessPacket.summary.likelyMechanism;

  assert(
    citation === testCase.expectedCitation,
    `${testCase.id} expected citation ${testCase.expectedCitation}, got ${citation}.`,
  );

  assert(
    mechanism === testCase.expectedMechanism,
    `${testCase.id} expected mechanism ${testCase.expectedMechanism}, got ${mechanism}.`,
  );

  assert(
    snapshot.boundary.readOnly === true &&
      snapshot.boundary.canDeclareViolation === false &&
      snapshot.boundary.canModifyProductionReasoning === false,
    `${testCase.id} must preserve read-only governed Brain boundary.`,
  );
}

console.log('✅ SafeScope Field Readiness Routing validation passed.');
console.log(`Cases: ${cases.length}`);
