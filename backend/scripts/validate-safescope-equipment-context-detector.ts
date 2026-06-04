import { SafeScopeEquipmentContextDetectorService } from '../src/safescope-v2/equipment-knowledge/equipment-context-detector.service';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const detector = new SafeScopeEquipmentContextDetectorService();

const cases = [
  {
    name: 'Haul truck dump point context',
    expectedPrimaryEquipment: 'haul_truck',
    request: {
      hazardObservation: 'Haul truck dumping near stockpile edge with unclear dump point control and berm adequacy.',
      equipmentInvolved: 'haul truck',
      taskContext: 'stockpile dumping inspection',
      industryContext: 'mining',
      siteType: 'surface aggregate mine',
    },
  },
  {
    name: 'Loader blind spot context',
    expectedPrimaryEquipment: 'front_end_loader',
    request: {
      hazardObservation: 'Front-end loader operating near ground workers with blind spot exposure and no spotter assigned.',
      equipmentInvolved: 'front-end loader',
      taskContext: 'mobile equipment operation inspection',
      industryContext: 'mining',
      siteType: 'surface aggregate mine',
    },
  },
  {
    name: 'Forklift seatbelt context',
    expectedPrimaryEquipment: 'forklift',
    request: {
      hazardObservation: 'Forklift operating in warehouse with operator seatbelt use and travel path controls unclear.',
      equipmentInvolved: 'forklift',
      taskContext: 'warehouse mobile equipment inspection',
      industryContext: 'manufacturing',
      siteType: 'general industry facility',
    },
  },
  {
    name: 'Excavator swing radius context',
    expectedPrimaryEquipment: 'excavator',
    request: {
      hazardObservation: 'Excavator working near employees with uncontrolled swing radius and no spotter assigned.',
      equipmentInvolved: 'excavator',
      taskContext: 'excavation area inspection',
      industryContext: 'construction',
      siteType: 'construction site',
    },
  },
  {
    name: 'Dozer slope operation context',
    expectedPrimaryEquipment: 'dozer',
    request: {
      hazardObservation: 'Dozer operating on slope near stockpile edge with rollover risk and limited rear visibility.',
      equipmentInvolved: 'dozer',
      taskContext: 'stockpile operation inspection',
      industryContext: 'mining',
      siteType: 'surface mine',
    },
  },
  {
    name: 'Skid steer raised bucket context',
    expectedPrimaryEquipment: 'skid_steer',
    request: {
      hazardObservation: 'Skid steer parked with raised bucket near employees and attachment securement unclear.',
      equipmentInvolved: 'skid steer',
      taskContext: 'compact equipment inspection',
      industryContext: 'construction',
      siteType: 'construction site',
    },
  },
  {
    name: 'Aerial lift fall protection context',
    expectedPrimaryEquipment: 'aerial_lift',
    request: {
      hazardObservation: 'Aerial lift being used for work at height with platform gate and fall arrest status unclear.',
      equipmentInvolved: 'aerial lift',
      taskContext: 'elevated work inspection',
      industryContext: 'construction',
      siteType: 'construction site',
    },
  },
  {
    name: 'Telehandler load chart context',
    expectedPrimaryEquipment: 'telehandler',
    request: {
      hazardObservation: 'Telehandler lifting load with extended boom where load chart and attachment compatibility are unclear.',
      equipmentInvolved: 'telehandler',
      taskContext: 'material handling inspection',
      industryContext: 'construction',
      siteType: 'construction site',
    },
  },
  {
    name: 'Conveyor guarding context',
    expectedPrimaryEquipment: 'conveyor',
    request: {
      hazardObservation: 'Employee cleaning around conveyor drive components with no lockout tagout verification before work.',
      equipmentInvolved: 'conveyor drive',
      taskContext: 'conveyor cleanup maintenance',
      industryContext: 'mining',
      siteType: 'surface aggregate mine',
    },
  },
  {
    name: 'Electrical panel context',
    expectedPrimaryEquipment: 'electrical_panel',
    request: {
      hazardObservation: 'Employee working inside energized electrical panel with arc flash boundary and PPE requirements unclear.',
      equipmentInvolved: 'energized electrical panel',
      taskContext: 'energized electrical troubleshooting',
      industryContext: 'manufacturing',
      siteType: 'general industry facility',
    },
  },
];

for (const testCase of cases) {
  const result = detector.detect(testCase.request);

  assert(result.engine === 'safescope_equipment_context_detector_v1', `${testCase.name}: engine changed.`);
  assert(result.mode === 'read_only_test_only_context_detection', `${testCase.name}: mode changed.`);
  assert(result.guardrails.readOnly === true, `${testCase.name}: detector must be read-only.`);
  assert(result.guardrails.contextOnly === true, `${testCase.name}: detector must be context-only.`);
  assert(result.guardrails.doesNotModifyReasoning === true, `${testCase.name}: detector must not modify reasoning.`);
  assert(result.guardrails.doesNotDeclareViolation === true, `${testCase.name}: detector must not declare violations.`);
  assert(result.guardrails.doesNotCreateCitation === true, `${testCase.name}: detector must not create citations.`);
  assert(result.guardrails.doesNotOverrideRegulation === true, `${testCase.name}: detector must not override regulation.`);
  assert(result.guardrails.requiresQualifiedReview === true, `${testCase.name}: detector must require qualified review.`);

  assert(result.detectedEquipment.length > 0, `${testCase.name}: expected at least one detected equipment record.`);
  assert(Boolean(result.primaryEquipment), `${testCase.name}: expected primaryEquipment.`);
  assert(
    result.primaryEquipment?.equipmentId === testCase.expectedPrimaryEquipment,
    `${testCase.name}: expected ${testCase.expectedPrimaryEquipment}, received ${result.primaryEquipment?.equipmentId}.`,
  );

  const primary = result.detectedEquipment[0];
  assert(primary.score > 0, `${testCase.name}: primary score must be positive.`);
  assert(primary.matchedAliases.length + primary.matchedScenarioTriggers.length > 0, `${testCase.name}: primary should include matched evidence.`);
  assert(primary.commonHazardDomains.length > 0, `${testCase.name}: primary should include commonHazardDomains.`);
  assert(primary.inspectionFocusAreas.length > 0, `${testCase.name}: primary should include inspectionFocusAreas.`);
  assert(primary.evidenceQuestions.length > 0, `${testCase.name}: primary should include evidenceQuestions.`);
  assert(primary.verificationEvidence.length > 0, `${testCase.name}: primary should include verificationEvidence.`);
  assert(primary.conflictNotes.length > 0, `${testCase.name}: primary should include conflictNotes.`);
}

const unknown = detector.detect({
  hazardObservation: 'Possible issue observed.',
});

assert(unknown.detectedEquipment.length === 0, 'Unknown observation should not force equipment detection.');
assert(unknown.primaryEquipment === undefined, 'Unknown observation should not have primaryEquipment.');

console.log('✅ SafeScope equipment context detector validation passed.');
console.log(`Cases validated: ${cases.length + 1}/${cases.length + 1}`);
