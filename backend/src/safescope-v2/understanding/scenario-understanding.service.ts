import {
  SafeScopeUnderstanding,
  SafeScopeUnderstandingMechanismCandidate
} from './safescope-understanding.types';

export type SafeScopeScenarioUnderstandingCandidate = {
  scenarioId: string;
  hazardFamily: string;
  mechanism: string;
  confidence: number;
  reasons: string[];
  requiredFacts: string[];
  missingFacts: string[];
};

export type SafeScopeScenarioUnderstandingResult = {
  candidates: SafeScopeScenarioUnderstandingCandidate[];
  topScenario?: SafeScopeScenarioUnderstandingCandidate;
  evidenceGaps: string[];
};

export class ScenarioUnderstandingService {
  evaluate(understanding: SafeScopeUnderstanding): SafeScopeScenarioUnderstandingResult {
    const candidates: SafeScopeScenarioUnderstandingCandidate[] = [];

    const topMechanism = understanding.mechanismCandidates[0];

    this.addConveyorCleanupCandidate(candidates, understanding, topMechanism);
    this.addUnguardedConveyorPulleyCandidate(candidates, understanding, topMechanism);
    this.addRotatingShaftCandidate(candidates, understanding, topMechanism);
    this.addPointOfOperationCandidate(candidates, understanding, topMechanism);
    this.addElectricalCordCandidate(candidates, understanding, topMechanism);
    this.addElectricalPanelCandidate(candidates, understanding, topMechanism);
    this.addExcavationCandidate(candidates, understanding, topMechanism);
    this.addMobileEquipmentCandidate(candidates, understanding, topMechanism);
    this.addFallProtectionCandidate(candidates, understanding, topMechanism);
    this.addEnergyIsolationCandidate(candidates, understanding, topMechanism);
    this.addHazcomCandidate(candidates, understanding, topMechanism);
    this.addConfinedSpaceCandidate(candidates, understanding, topMechanism);
    this.addSuspendedLoadCandidate(candidates, understanding, topMechanism);
    this.addPressurizedHoseCandidate(candidates, understanding, topMechanism);
    this.addFireExtinguisherCandidate(candidates, understanding, topMechanism);
    this.addHousekeepingCandidate(candidates, understanding, topMechanism);

    const sorted = candidates.sort((a, b) => b.confidence - a.confidence);
    const topScenario = sorted[0];

    return {
      candidates: sorted,
      topScenario,
      evidenceGaps: topScenario?.missingFacts || understanding.evidenceGaps
    };
  }

  private addConveyorCleanupCandidate(
    candidates: SafeScopeScenarioUnderstandingCandidate[],
    u: SafeScopeUnderstanding,
    mechanism?: SafeScopeUnderstandingMechanismCandidate
  ) {
    if (u.equipment.category !== 'conveyor') return;
    if (u.task.taskType !== 'cleanup') return;

    const explicitTravelOnly =
      u.normalizedText.includes('travelway') ||
      u.normalizedText.includes('normal travel') ||
      u.normalizedText.includes('walking through') ||
      u.normalizedText.includes('employees pass') ||
      u.normalizedText.includes('walk past');

    if (explicitTravelOnly && u.task.taskType !== 'cleanup' && !u.normalizedText.includes('cleaning') && !u.normalizedText.includes('cleanup')) return;

    const missingFacts = this.missing([
      ['worker exposure', u.exposure.workerExposed === true],
      ['rotating conveyor component', ['tail_pulley', 'head_pulley_or_drive', 'roller_or_idler'].includes(u.equipment.component)],
      ['guarding status', this.hasGuardingFailure(u)]
    ]);

    candidates.push({
      scenarioId: 'conveyor_cleanup',
      hazardFamily: 'machine_guarding',
      mechanism: mechanism?.mechanism || 'rotating_equipment_nip_point',
      confidence: this.score(0.62, missingFacts, mechanism?.confidence || 0.5),
      reasons: [
        'Conveyor equipment detected.',
        'Cleanup task detected.',
        'Scenario requires evaluating exposure to moving conveyor components during cleanup.'
      ],
      requiredFacts: ['conveyor', 'cleanup task', 'worker exposure', 'rotating component', 'guarding status'],
      missingFacts
    });
  }

  private addUnguardedConveyorPulleyCandidate(
    candidates: SafeScopeScenarioUnderstandingCandidate[],
    u: SafeScopeUnderstanding,
    mechanism?: SafeScopeUnderstandingMechanismCandidate
  ) {
    if (u.equipment.category !== 'conveyor') return;
    if (!['tail_pulley', 'head_pulley_or_drive', 'roller_or_idler'].includes(u.equipment.component)) return;
    if (u.task.taskType === 'cleanup') return;

    const missingFacts = this.missing([
      ['worker exposure', u.exposure.workerExposed === true],
      ['guarding failure', this.hasGuardingFailure(u)]
    ]);

    candidates.push({
      scenarioId: 'unguarded_conveyor_pulley',
      hazardFamily: 'machine_guarding',
      mechanism: mechanism?.mechanism || 'rotating_equipment_entanglement',
      confidence: this.score(0.6, missingFacts, mechanism?.confidence || 0.5),
      reasons: [
        'Conveyor pulley/roller component detected.',
        'Task is not primarily cleanup.',
        'Scenario requires evaluating guarding and access to an in-running nip point.'
      ],
      requiredFacts: ['conveyor pulley or roller', 'guarding status', 'worker exposure'],
      missingFacts
    });
  }

  private addRotatingShaftCandidate(
    candidates: SafeScopeScenarioUnderstandingCandidate[],
    u: SafeScopeUnderstanding,
    mechanism?: SafeScopeUnderstandingMechanismCandidate
  ) {
    if (!u.normalizedText.includes('shaft')) return;

    const missingFacts = this.missing([
      ['guarding failure', this.hasGuardingFailure(u)],
      ['worker exposure', u.exposure.workerExposed === true]
    ]);

    candidates.push({
      scenarioId: 'rotating_shaft_guarding',
      hazardFamily: 'machine_guarding',
      mechanism: mechanism?.mechanism || 'rotating_equipment_entanglement',
      confidence: this.score(0.58, missingFacts, mechanism?.confidence || 0.5),
      reasons: [
        'Rotating shaft language detected.',
        'Scenario requires evaluating entanglement exposure and guarding.'
      ],
      requiredFacts: ['rotating shaft', 'guarding status', 'worker exposure'],
      missingFacts
    });
  }

  private addPointOfOperationCandidate(
    candidates: SafeScopeScenarioUnderstandingCandidate[],
    u: SafeScopeUnderstanding,
    mechanism?: SafeScopeUnderstandingMechanismCandidate
  ) {
    const pointOfOperation =
      u.normalizedText.includes('point of operation') ||
      u.normalizedText.includes('blade') ||
      u.normalizedText.includes('press brake') ||
      u.normalizedText.includes('closing die') ||
      u.normalizedText.includes('drill press') ||
      u.normalizedText.includes('lathe') ||
      u.normalizedText.includes('grinder') ||
      u.normalizedText.includes('spindle') ||
      u.normalizedText.includes('chuck') ||
      u.normalizedText.includes('shear') ||
      u.normalizedText.includes('punch');

    if (!pointOfOperation) return;

    const missingFacts = this.missing([
      ['safeguarding status', this.hasGuardingFailure(u)],
      ['operator or employee exposure', u.exposure.workerExposed === true]
    ]);

    candidates.push({
      scenarioId: 'point_of_operation_guarding',
      hazardFamily: 'machine_guarding',
      mechanism: mechanism?.mechanism || 'cut_amputation_point_of_operation',
      confidence: this.score(0.61, missingFacts, mechanism?.confidence || 0.5),
      reasons: [
        'Point-of-operation signal detected.',
        'Scenario requires evaluating operator exposure to cutting, closing, or amputation point.'
      ],
      requiredFacts: ['point of operation', 'safeguarding status', 'worker exposure'],
      missingFacts
    });
  }

  private addElectricalCordCandidate(
    candidates: SafeScopeScenarioUnderstandingCandidate[],
    u: SafeScopeUnderstanding,
    mechanism?: SafeScopeUnderstandingMechanismCandidate
  ) {
    if (u.equipment.category !== 'electrical_cord') return;

    const wetOrDamaged =
      u.normalizedText.includes('damaged insulation') ||
      u.normalizedText.includes('exposed conductor') ||
      u.normalizedText.includes('frayed cord') ||
      u.normalizedText.includes('wet location') ||
      u.normalizedText.includes('wet area') ||
      u.normalizedText.includes('wet processing area');

    const missingFacts = this.missing([
      ['damaged conductor/insulation or wet-location condition', wetOrDamaged],
      ['energized or in-use status', u.equipment.operationalState === 'energized'],
      ['worker exposure', u.exposure.workerExposed === true]
    ]);

    candidates.push({
      scenarioId: 'damaged_cord_wet_location',
      hazardFamily: 'electrical',
      mechanism: mechanism?.mechanism || 'electrical_shock',
      confidence: this.score(0.57, missingFacts, mechanism?.confidence || 0.5),
      reasons: [
        'Electrical cord detected.',
        'Scenario requires evaluating damaged insulation, wet location, and contact potential.'
      ],
      requiredFacts: ['electrical cord', 'damage condition', 'energized/in-use status', 'worker exposure'],
      missingFacts
    });
  }

  private addElectricalPanelCandidate(
    candidates: SafeScopeScenarioUnderstandingCandidate[],
    u: SafeScopeUnderstanding,
    mechanism?: SafeScopeUnderstandingMechanismCandidate
  ) {
    if (u.equipment.category !== 'electrical_equipment') return;

    const accessIssue =
      u.controls.failedControls.includes('access_control') ||
      u.controls.failedControls.includes('electrical_working_clearance') ||
      u.normalizedText.includes('blocked') ||
      u.normalizedText.includes('working clearance') ||
      u.normalizedText.includes('open') ||
      u.normalizedText.includes('swinging') ||
      u.normalizedText.includes('missing cover') ||
      u.normalizedText.includes('cover plates') ||
      u.normalizedText.includes('exposed breaker') ||
      u.normalizedText.includes('breaker slots') ||
      u.normalizedText.includes('broken') ||
      u.normalizedText.includes('exposing') ||
      u.normalizedText.includes('exposed');

    if (!accessIssue) return;

    const missingFacts = this.missing([
      ['employee exposure/access need', u.exposure.workerExposed === true],
      ['energized status', u.equipment.operationalState === 'energized']
    ]);

    candidates.push({
      scenarioId: 'electrical_panel_access',
      hazardFamily: 'electrical',
      mechanism: 'electrical_shock_arc_flash_access_clearance',
      confidence: this.score(0.55, missingFacts, mechanism?.confidence || 0.5),
      reasons: [
        'Electrical panel or disconnect equipment detected.',
        'Access or clearance issue detected.'
      ],
      requiredFacts: ['electrical panel/disconnect', 'access or clearance issue', 'worker exposure', 'energized status'],
      missingFacts
    });
  }

  private addExcavationCandidate(
    candidates: SafeScopeScenarioUnderstandingCandidate[],
    u: SafeScopeUnderstanding,
    mechanism?: SafeScopeUnderstandingMechanismCandidate
  ) {
    if (u.equipment.category !== 'excavation') return;

    const missingFacts = this.missing([
      ['worker inside or adjacent to excavation', u.exposure.workerExposed === true],
      ['protective system status', u.controls.missingControls.includes('excavation_protective_system')]
    ]);

    candidates.push({
      scenarioId: 'excavation_protective_system_ambiguity',
      hazardFamily: 'excavation_trenching',
      mechanism: mechanism?.mechanism || 'caught_in_cave_in',
      confidence: this.score(0.62, missingFacts, mechanism?.confidence || 0.5),
      reasons: [
        'Excavation or trenching condition detected.',
        'Scenario requires evaluating cave-in exposure and protective system status.'
      ],
      requiredFacts: ['excavation/trench', 'worker exposure', 'protective system status'],
      missingFacts
    });
  }

  private addMobileEquipmentCandidate(
    candidates: SafeScopeScenarioUnderstandingCandidate[],
    u: SafeScopeUnderstanding,
    mechanism?: SafeScopeUnderstandingMechanismCandidate
  ) {
    if (u.equipment.category !== 'mobile_equipment') return;

    const missingFacts = this.missing([
      ['pedestrian or worker exposure', u.exposure.workerExposed === true],
      ['equipment motion/operation', u.equipment.motion === 'moving' || u.equipment.operationalState === 'operating']
    ]);

    candidates.push({
      scenarioId: 'mobile_equipment_pedestrian_interaction',
      hazardFamily: 'mobile_equipment',
      mechanism: mechanism?.mechanism || 'struck_by_mobile_equipment',
      confidence: this.score(0.59, missingFacts, mechanism?.confidence || 0.5),
      reasons: [
        'Mobile equipment detected.',
        'Scenario requires evaluating pedestrian/equipment interaction and line-of-fire exposure.'
      ],
      requiredFacts: ['mobile equipment', 'motion/operation', 'pedestrian or worker exposure'],
      missingFacts
    });
  }

  private addFallProtectionCandidate(
    candidates: SafeScopeScenarioUnderstandingCandidate[],
    u: SafeScopeUnderstanding,
    mechanism?: SafeScopeUnderstandingMechanismCandidate
  ) {
    const fallSignal =
      u.equipment.category === 'fall_protection' ||
      u.energy.primaryEnergySource === 'gravity' ||
      u.normalizedText.includes('fall exposure') ||
      u.normalizedText.includes('unprotected edge') ||
      u.normalizedText.includes('roof edge') ||
      u.normalizedText.includes('floor hole') ||
      u.normalizedText.includes('open floor hole') ||
      u.normalizedText.includes('uncovered') ||
      u.normalizedText.includes('lower level');

    if (!fallSignal) return;

    const missingFacts = this.missing([
      ['worker exposure', u.exposure.workerExposed === true],
      ['elevated work, edge, floor opening, or lower-level fall condition', u.equipment.component === 'ladder' || u.equipment.component === 'scaffold' || u.equipment.component === 'unprotected_edge' || u.normalizedText.includes('lower level') || u.normalizedText.includes('roof edge') || u.normalizedText.includes('floor hole') || u.normalizedText.includes('open floor hole')],
      ['fall protection or edge protection status', u.controls.missingControls.includes('fall_protection_or_edge_protection')]
    ]);

    candidates.push({
      scenarioId: 'fall_protection_unprotected_edge',
      hazardFamily: 'fall_protection',
      mechanism: mechanism?.mechanism === 'unknown' ? 'fall_from_height' : mechanism?.mechanism || 'fall_from_height',
      confidence: this.score(0.61, missingFacts, mechanism?.confidence || 0.5),
      reasons: [
        'Fall exposure, ladder, platform, or unprotected edge signal detected.',
        'Scenario requires evaluating elevated work exposure and fall protection status.'
      ],
      requiredFacts: ['worker exposure', 'elevated work or edge condition', 'fall protection status'],
      missingFacts
    });
  }

  private addEnergyIsolationCandidate(
    candidates: SafeScopeScenarioUnderstandingCandidate[],
    u: SafeScopeUnderstanding,
    mechanism?: SafeScopeUnderstandingMechanismCandidate
  ) {
    const explicitEnergyIsolation =
      u.normalizedText.includes('not locked out') ||
      u.normalizedText.includes('lockout') ||
      u.normalizedText.includes('locked out') ||
      u.normalizedText.includes('energy isolation') ||
      u.normalizedText.includes('unexpectedly') ||
      u.normalizedText.includes('start unexpectedly') ||
      u.normalizedText.includes('stored and rotating energy');

    const servicingExposure =
      u.task.taskType === 'servicing' ||
      u.task.taskType === 'maintenance' ||
      u.normalizedText.includes('servicing') ||
      u.normalizedText.includes('mechanic');

    if (!explicitEnergyIsolation || !servicingExposure) return;

    candidates.push({
      scenarioId: 'unexpected_startup_energy_isolation',
      hazardFamily: 'lockout_tagout',
      mechanism: 'unexpected_startup',
      confidence: 0.86,
      reasons: [
        'Servicing or maintenance activity detected.',
        'Missing lockout/energy-isolation signal detected.',
        'Unexpected startup/stored energy exposure should override generic machine-guarding routing.'
      ],
      requiredFacts: ['servicing or maintenance task', 'energy isolation status', 'worker exposure'],
      missingFacts: this.missing([
        ['worker exposure', u.exposure.workerExposed === true]
      ])
    });
  }

  private addHazcomCandidate(
    candidates: SafeScopeScenarioUnderstandingCandidate[],
    u: SafeScopeUnderstanding,
    mechanism?: SafeScopeUnderstandingMechanismCandidate
  ) {
    const chemicalSignal =
      u.normalizedText.includes('chemical') ||
      u.normalizedText.includes('solvent') ||
      u.normalizedText.includes('acid') ||
      u.normalizedText.includes('corrosive') ||
      u.normalizedText.includes('container') ||
      u.normalizedText.includes('sds') ||
      u.normalizedText.includes('label') ||
      u.normalizedText.includes('hazcom') ||
      u.normalizedText.includes('ghs') ||
      u.normalizedText.includes('paint') ||
      u.normalizedText.includes('welding') ||
      u.normalizedText.includes('fumes') ||
      u.normalizedText.includes('exhaust') ||
      u.normalizedText.includes('dust') ||
      u.normalizedText.includes('generator') ||
      u.normalizedText.includes('carbon monoxide') ||
      u.normalizedText.includes('grinding');

    const labelOrSdsGap =
      u.normalizedText.includes('unlabeled') ||
      u.normalizedText.includes('no sds') ||
      u.normalizedText.includes('missing sds') ||
      u.normalizedText.includes('without') ||
      u.normalizedText.includes('missing') ||
      u.normalizedText.includes('no label') ||
      u.normalizedText.includes('no warning') ||
      u.normalizedText.includes('blank') ||
      u.normalizedText.includes('warning') ||
      u.normalizedText.includes('warnings') ||
      u.normalizedText.includes('no') ||
      u.normalizedText.includes('unventilated') ||
      u.normalizedText.includes('broken') ||
      u.normalizedText.includes('accumulate') ||
      u.normalizedText.includes('accumulating');

    if (!chemicalSignal || !labelOrSdsGap) return;

    candidates.push({
      scenarioId: 'chemical_label_sds_gap',
      hazardFamily: 'hazcom',
      mechanism: 'chemical_exposure_unknown_agent',
      confidence: 0.84,
      reasons: [
        'Chemical container or HazCom signal detected.',
        'Missing label/SDS signal detected.',
        'Unknown chemical identity and communication-control gap detected.'
      ],
      requiredFacts: ['chemical container/material', 'label or SDS status', 'employee handling or exposure'],
      missingFacts: this.missing([
        ['employee handling or exposure', u.exposure.workerExposed === true || u.normalizedText.includes('handling')]
      ])
    });
  }

  private addConfinedSpaceCandidate(
    candidates: SafeScopeScenarioUnderstandingCandidate[],
    u: SafeScopeUnderstanding,
    mechanism?: SafeScopeUnderstandingMechanismCandidate
  ) {
    const spaceSignal =
      u.normalizedText.includes('confined space') ||
      u.normalizedText.includes('tank') ||
      u.normalizedText.includes('vessel') ||
      u.normalizedText.includes('limited ventilation');

    const entrySignal =
      u.normalizedText.includes('enter') ||
      u.normalizedText.includes('entry') ||
      u.normalizedText.includes('preparing to enter') ||
      u.normalizedText.includes('inside');

    const permitControlGap =
      u.normalizedText.includes('no atmospheric test') ||
      u.normalizedText.includes('atmospheric test') ||
      u.normalizedText.includes('attendant') ||
      u.normalizedText.includes('permit') ||
      u.normalizedText.includes('rescue plan') ||
      u.normalizedText.includes('limited ventilation');

    if (!spaceSignal || !entrySignal || !permitControlGap) return;

    candidates.push({
      scenarioId: 'permit_required_confined_space_entry',
      hazardFamily: 'confined_space',
      mechanism: 'atmospheric_hazard_engulfment_or_entrapment',
      confidence: 0.9,
      reasons: [
        'Tank/confined-space entry signal detected.',
        'Missing atmospheric testing, attendant, permit, rescue, or ventilation controls detected.',
        'Permit-required confined-space context should override generic equipment guarding.'
      ],
      requiredFacts: ['confined space or tank', 'entry activity', 'permit/atmospheric/rescue controls'],
      missingFacts: []
    });
  }

  private addSuspendedLoadCandidate(
    candidates: SafeScopeScenarioUnderstandingCandidate[],
    u: SafeScopeUnderstanding,
    mechanism?: SafeScopeUnderstandingMechanismCandidate
  ) {
    const suspendedLoad =
      u.normalizedText.includes('suspended load') ||
      u.normalizedText.includes('hoisted load') ||
      u.normalizedText.includes('crane lift') ||
      u.normalizedText.includes('load path');

    const lineOfFire =
      u.normalizedText.includes('stands below') ||
      u.normalizedText.includes('worker below') ||
      u.normalizedText.includes('employees below') ||
      u.normalizedText.includes('line of fire') ||
      u.normalizedText.includes('below a suspended load');

    const riggingGap =
      u.normalizedText.includes('damaged sling') ||
      u.normalizedText.includes('damaged rigging') ||
      u.normalizedText.includes('no exclusion zone') ||
      u.normalizedText.includes('exclusion zone');

    if (!suspendedLoad || (!lineOfFire && !riggingGap)) return;

    candidates.push({
      scenarioId: 'suspended_load_line_of_fire',
      hazardFamily: 'lifting_rigging',
      mechanism: 'struck_by_falling_suspended_load',
      confidence: 0.88,
      reasons: [
        'Suspended/hoisted load signal detected.',
        'Line-of-fire or damaged rigging/exclusion-zone gap detected.',
        'Crane/rigging scenario should route to suspended-load struck-by exposure.'
      ],
      requiredFacts: ['suspended load', 'worker in load path or below load', 'rigging/exclusion zone status'],
      missingFacts: []
    });
  }

  private addPressurizedHoseCandidate(
    candidates: SafeScopeScenarioUnderstandingCandidate[],
    u: SafeScopeUnderstanding,
    mechanism?: SafeScopeUnderstandingMechanismCandidate
  ) {
    const hoseSignal =
      u.normalizedText.includes('compressed air hose') ||
      u.normalizedText.includes('pressurized hose') ||
      u.normalizedText.includes('pressurized line') ||
      u.normalizedText.includes('hose coupling');

    const failureSignal =
      u.normalizedText.includes('damaged') ||
      u.normalizedText.includes('leaking') ||
      u.normalizedText.includes('coupling fails') ||
      u.normalizedText.includes('whipping') ||
      u.normalizedText.includes('pressurized');

    if (!hoseSignal || !failureSignal) return;

    candidates.push({
      scenarioId: 'pressurized_hose_failure',
      hazardFamily: 'stored_energy',
      mechanism: 'struck_by_whipping_pressurized_line',
      confidence: 0.86,
      reasons: [
        'Compressed-air or pressurized-hose signal detected.',
        'Damaged/leaking coupling or whipping line-of-fire signal detected.',
        'Stored pressure release scenario detected.'
      ],
      requiredFacts: ['pressurized hose or line', 'damage/leak/failure condition', 'employee proximity'],
      missingFacts: this.missing([
        ['employee proximity', u.exposure.workerExposed === true || u.normalizedText.includes('near employees')]
      ])
    });
  }

  private addFireExtinguisherCandidate(
    candidates: SafeScopeScenarioUnderstandingCandidate[],
    u: SafeScopeUnderstanding,
    mechanism?: SafeScopeUnderstandingMechanismCandidate
  ) {
    if (u.equipment.category !== 'fire_protection_equipment') return;

    const blockedOrInspectionIssue =
      u.normalizedText.includes('blocked') ||
      u.normalizedText.includes('obstructed') ||
      u.normalizedText.includes('expired') ||
      u.equipment.component === 'inspection_tag';

    if (!blockedOrInspectionIssue) return;

    candidates.push({
      scenarioId: 'fire_extinguisher_access_inspection',
      hazardFamily: 'fire_protection',
      mechanism: 'delayed_emergency_response',
      confidence: 0.74,
      reasons: [
        'Fire extinguisher detected.',
        'Access, obstruction, or inspection-readiness issue detected.'
      ],
      requiredFacts: ['fire extinguisher', 'access or inspection status'],
      missingFacts: []
    });
  }

  private addHousekeepingCandidate(
    candidates: SafeScopeScenarioUnderstandingCandidate[],
    u: SafeScopeUnderstanding,
    mechanism?: SafeScopeUnderstandingMechanismCandidate
  ) {
    const housekeeping =
      u.task.taskType === 'cleanup' ||
      u.normalizedText.includes('housekeeping') ||
      u.normalizedText.includes('spill') ||
      u.normalizedText.includes('spillage') ||
      u.normalizedText.includes('debris') ||
      u.normalizedText.includes('walkway') ||
      u.normalizedText.includes('walk deck') ||
      u.normalizedText.includes('deck') ||
      u.normalizedText.includes('floor') ||
      u.normalizedText.includes('leak') ||
      u.normalizedText.includes('pooled') ||
      u.normalizedText.includes('slip') ||
      u.normalizedText.includes('trip') ||
      u.normalizedText.includes('puddle') ||
      u.normalizedText.replace(/soil/g, '').includes('oil') ||
      u.normalizedText.includes('grease') ||
      u.normalizedText.includes('fluid');

    if (!housekeeping) return;
    if (u.equipment.category === 'fall_protection' && !u.normalizedText.includes('spill') && !u.normalizedText.includes('leak') && !u.normalizedText.includes('pooled') && !u.normalizedText.includes('grease') && !u.normalizedText.replace(/soil/g, '').includes('oil') && !u.normalizedText.includes('slip') && !u.normalizedText.includes('trip')) return;
    if (u.equipment.category === 'conveyor' && !u.normalizedText.includes('walkway') && !u.normalizedText.includes('walk deck')) return;
    if (u.equipment.category === 'electrical_cord' || u.equipment.category === 'electrical_equipment') return;
    if (u.equipment.category === 'mobile_equipment') return;
    if (u.normalizedText.includes('floor hole') || u.normalizedText.includes('open floor hole')) return;

    const hasCylinderOrSpecialHazard = /(cylinder|oxygen cylinder|gas cylinder|acetylene cylinder|compressed gas|electrical|live wire|live parts|breaker|conveyor|nip point|pinch point|guarding)/i.test(u.normalizedText);
    const hasActualDefectOrTrip = /(spill|spilled|spilling|obstruction|obstructed|uneven|hole|guardrail|elevated platform|ladder|stairs|stairway|blocked|blocking|trip hazard|trip exposure|slip hazard|slip exposure|fall exposure|clutter|debris|aggregate|scattered|buildup|pile)/i.test(u.normalizedText);
    if (hasCylinderOrSpecialHazard && !hasActualDefectOrTrip) return;

    const missingFacts = this.missing([
      ['walking/working surface condition', u.normalizedText.includes('floor') || u.normalizedText.includes('walkway') || u.normalizedText.includes('spill') || u.normalizedText.includes('spillage') || u.normalizedText.includes('leak') || u.normalizedText.includes('pooled') || u.normalizedText.includes('puddle') || u.normalizedText.replace(/soil/g, '').includes('oil') || u.normalizedText.includes('grease') || u.normalizedText.includes('fluid')],
      ['pedestrian exposure', u.exposure.workerExposed === true]
    ]);

    candidates.push({
      scenarioId: 'housekeeping_slip_trip',
      hazardFamily: 'slip_trip_fall',
      mechanism: mechanism?.mechanism === 'unknown' ? 'slip_trip_fall_same_level' : mechanism?.mechanism || 'slip_trip_fall_same_level',
      confidence: this.score(0.52, missingFacts, mechanism?.confidence || 0.5),
      reasons: [
        'Housekeeping or walking-working surface signal detected.',
        'Scenario requires evaluating pedestrian exposure to slip/trip condition.'
      ],
      requiredFacts: ['walking/working surface condition', 'pedestrian exposure'],
      missingFacts
    });
  }

  private hasGuardingFailure(u: SafeScopeUnderstanding): boolean {
    return (
      u.controls.missingControls.includes('guarding') ||
      u.controls.failedControls.includes('guarding')
    );
  }

  private missing(checks: Array<[string, boolean]>): string[] {
    return checks.filter(([, present]) => !present).map(([label]) => label);
  }

  private score(base: number, missingFacts: string[], mechanismConfidence: number): number {
    const missingPenalty = missingFacts.length * 0.09;
    const mechanismBoost = Math.max(0, mechanismConfidence - 0.5) * 0.25;
    return Math.max(0.2, Math.min(0.95, base + mechanismBoost - missingPenalty));
  }
}
