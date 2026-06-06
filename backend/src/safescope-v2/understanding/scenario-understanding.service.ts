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
      mechanism: mechanism?.mechanism || 'rotating_equipment_nip_point',
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
      u.normalizedText.includes('closing die');

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

    const missingFacts = this.missing([
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
      u.normalizedText.includes('blocked') ||
      u.normalizedText.includes('working clearance');

    if (!accessIssue) return;

    const missingFacts = this.missing([
      ['employee exposure/access need', u.exposure.workerExposed === true],
      ['energized status', u.equipment.operationalState === 'energized']
    ]);

    candidates.push({
      scenarioId: 'electrical_panel_access',
      hazardFamily: 'electrical',
      mechanism: mechanism?.mechanism || 'electrical_shock',
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
      hazardFamily: 'powered_haulage',
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
      u.normalizedText.includes('unprotected edge');

    if (!fallSignal) return;

    const missingFacts = this.missing([
      ['worker exposure', u.exposure.workerExposed === true],
      ['elevated work or edge condition', u.equipment.component === 'ladder' || u.equipment.component === 'unprotected_edge' || u.normalizedText.includes('lower level')],
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
      mechanism: mechanism?.mechanism === 'unknown' ? 'fire_extinguisher_access_failure' : mechanism?.mechanism || 'fire_extinguisher_access_failure',
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
      u.normalizedText.includes('debris') ||
      u.normalizedText.includes('walkway');

    if (!housekeeping) return;
    if (u.equipment.category === 'conveyor') return;

    const missingFacts = this.missing([
      ['walking/working surface condition', u.normalizedText.includes('floor') || u.normalizedText.includes('walkway') || u.normalizedText.includes('spill')],
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
