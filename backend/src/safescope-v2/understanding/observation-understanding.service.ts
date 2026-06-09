import {
  SafeScopeUnderstanding,
  SafeScopeUnderstandingJurisdiction,
  SafeScopeUnderstandingMechanismCandidate
} from './safescope-understanding.types';
import { EquipmentUnderstandingService } from './equipment-understanding.service';
import { TaskUnderstandingService } from './task-understanding.service';
import { ExposureUnderstandingService } from './exposure-understanding.service';
import { EnergyUnderstandingService } from './energy-understanding.service';
import { ControlUnderstandingService } from './control-understanding.service';
import { ScenarioUnderstandingService } from './scenario-understanding.service';

export class ObservationUnderstandingService {
  private readonly equipmentService = new EquipmentUnderstandingService();
  private readonly taskService = new TaskUnderstandingService();
  private readonly exposureService = new ExposureUnderstandingService();
  private readonly energyService = new EnergyUnderstandingService();
  private readonly controlService = new ControlUnderstandingService();
  private readonly scenarioService = new ScenarioUnderstandingService();

  evaluate(rawText: string): SafeScopeUnderstanding {
    const normalizedText = this.normalize(rawText);

    const jurisdiction = this.detectJurisdiction(normalizedText);
    const equipment = this.equipmentService.evaluate(normalizedText);
    const task = this.taskService.evaluate(normalizedText);
    const exposure = this.exposureService.evaluate(normalizedText);
    const energy = this.energyService.evaluate(normalizedText);
    const controls = this.controlService.evaluate(normalizedText);

    const mechanismCandidates = this.inferMechanismCandidates({
      normalizedText,
      equipmentCategory: equipment.category,
      component: equipment.component,
      taskType: task.taskType,
      workerExposed: exposure.workerExposed,
      primaryEnergySource: energy.primaryEnergySource,
      missingControls: controls.missingControls,
      failedControls: controls.failedControls
    });

    const baseUnderstanding: SafeScopeUnderstanding = {
      engine: 'safescope_understanding_engine',
      version: '0.1.0',
      rawText,
      normalizedText,
      jurisdiction,
      equipment,
      task,
      exposure,
      energy,
      controls,
      mechanismCandidates,
      evidenceGaps: [] as string[],
      trace: [] as string[],
      advisoryGuardrails: {
        advisoryOnly: true,
        doesNotDeclareViolation: true,
        requiresQualifiedReview: true
      }
    };

    const scenarioUnderstanding = this.scenarioService.evaluate(baseUnderstanding);

    const evidenceGaps = [
      ...this.detectEvidenceGaps({
        jurisdiction,
        equipmentCategory: equipment.category,
        taskType: task.taskType,
        workerExposed: exposure.workerExposed,
        proximity: exposure.proximity,
        operationalState: equipment.operationalState,
        controlsKnown: controls.missingControls.length > 0 || controls.failedControls.length > 0 || controls.existingControls.length > 0
      }),
      ...scenarioUnderstanding.evidenceGaps
    ].filter((gap, index, all) => all.indexOf(gap) === index);

    return {
      engine: 'safescope_understanding_engine',
      version: '0.1.0',
      rawText,
      normalizedText,
      jurisdiction,
      equipment,
      task,
      exposure,
      energy,
      controls,
      mechanismCandidates,
      scenarioUnderstanding,
      evidenceGaps,
      trace: [
        'Normalized raw observation.',
        'Evaluated jurisdiction, equipment, task, exposure, energy, and controls.',
        'Generated mechanism candidates from structured facts.',
        'Generated evidence gaps from missing or uncertain context.'
      ],
      advisoryGuardrails: {
        advisoryOnly: true,
        doesNotDeclareViolation: true,
        requiresQualifiedReview: true
      }
    };
  }

  private normalize(rawText: string): string {
    return rawText
      .toLowerCase()
      .replace(/[_/().,;:]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private detectJurisdiction(text: string): SafeScopeUnderstandingJurisdiction {
    const evidence: string[] = [];

    if (text.includes('msha') || text.includes('mine') || text.includes('miner')) {
      evidence.push('MSHA or mining signal detected.');
      return {
        detected: 'msha',
        evidence,
        needsConfirmation: false,
        confidence: { score: 0.85, reasons: evidence }
      };
    }

    if (text.includes('osha construction') || text.includes('construction')) {
      evidence.push('OSHA construction signal detected.');
      return {
        detected: 'osha_construction',
        evidence,
        needsConfirmation: false,
        confidence: { score: 0.8, reasons: evidence }
      };
    }

    if (text.includes('osha') || text.includes('general industry')) {
      evidence.push('OSHA general industry signal detected.');
      return {
        detected: 'osha_general_industry',
        evidence,
        needsConfirmation: false,
        confidence: { score: 0.75, reasons: evidence }
      };
    }

    return {
      detected: 'unclear',
      evidence: [],
      needsConfirmation: true,
      confidence: {
        score: 0.2,
        reasons: ['Jurisdiction signal is unclear.']
      }
    };
  }

  private inferMechanismCandidates(input: {
    normalizedText: string;
    equipmentCategory: string;
    component: string;
    taskType: string;
    workerExposed: boolean | 'unclear';
    primaryEnergySource: string;
    missingControls: string[];
    failedControls: string[];
  }): SafeScopeUnderstandingMechanismCandidate[] {
    const candidates: SafeScopeUnderstandingMechanismCandidate[] = [];

    const hasMissingOrFailedGuard =
      input.missingControls.includes('guarding') || input.failedControls.includes('guarding');

    const shaftEntanglementSignal =
      input.normalizedText.includes('shaft') ||
      input.normalizedText.includes('coupling') ||
      input.normalizedText.includes('keyway') ||
      input.normalizedText.includes('pump motor') ||
      input.normalizedText.includes('pump shaft') ||
      input.normalizedText.includes('motor coupling');

    const conveyorNipPointSignal =
      input.equipmentCategory === 'conveyor' &&
      (
        ['tail_pulley', 'head_pulley_or_drive', 'roller_or_idler'].includes(input.component) ||
        input.normalizedText.includes('nip point') ||
        input.normalizedText.includes('in running nip') ||
        input.normalizedText.includes('moving belt') ||
        input.normalizedText.includes('tail pulley') ||
        input.normalizedText.includes('head pulley')
      );

    if (conveyorNipPointSignal && hasMissingOrFailedGuard) {
      candidates.push({
        mechanism: 'rotating_equipment_nip_point',
        confidence: shaftEntanglementSignal ? 0.74 : (input.workerExposed === true ? 0.9 : 0.78),
        reasons: [
          'Conveyor pulley, belt, roller, or in-running nip-point signal detected.',
          'Guarding failure detected.',
          input.workerExposed === true ? 'Worker exposure is indicated.' : 'Worker exposure requires confirmation.'
        ],
        competingMechanisms: ['rotating_equipment_entanglement', 'unexpected_startup', 'crush_point']
      });
    }

    if (
      input.primaryEnergySource === 'mechanical_rotation' &&
      shaftEntanglementSignal &&
      hasMissingOrFailedGuard
    ) {
      candidates.push({
        mechanism: 'rotating_equipment_entanglement',
        confidence: 0.88,
        reasons: [
          'Rotating shaft, coupling, keyway, pump motor, or motor-coupling language detected.',
          'Guarding failure detected.'
        ],
        competingMechanisms: ['rotating_equipment_nip_point', 'crush_point', 'unexpected_startup']
      });
    }

    if (
      input.normalizedText.includes('blade') ||
      input.normalizedText.includes('point of operation') ||
      input.normalizedText.includes('press brake') ||
      input.normalizedText.includes('closing die')
    ) {
      candidates.push({
        mechanism: 'cut_amputation_point_of_operation',
        confidence: hasMissingOrFailedGuard ? 0.82 : 0.62,
        reasons: [
          'Point-of-operation or cutting/crushing component signal detected.',
          hasMissingOrFailedGuard ? 'Safeguarding failure detected.' : 'Safeguarding status requires confirmation.'
        ],
        competingMechanisms: ['crush_point', 'rotating_equipment_entanglement', 'unexpected_startup']
      });
    }

    if (input.primaryEnergySource === 'electrical') {
      const arcFlashSignal =
        input.normalizedText.includes('arc flash') ||
        input.normalizedText.includes('switchgear') ||
        input.normalizedText.includes('breaker') ||
        input.normalizedText.includes('mcc') ||
        input.normalizedText.includes('motor control center');

      const wetOrDamagedCordSignal =
        input.normalizedText.includes('damaged insulation') ||
        input.normalizedText.includes('exposed conductor') ||
        input.normalizedText.includes('frayed cord') ||
        input.normalizedText.includes('wet location') ||
        input.normalizedText.includes('wet area');

      candidates.push({
        mechanism: arcFlashSignal && !wetOrDamagedCordSignal ? 'arc_flash' : 'electrical_shock',
        confidence: input.workerExposed === true ? 0.82 : 0.76,
        reasons: [
          'Electrical energy source detected.',
          arcFlashSignal ? 'Arc-flash-capable equipment or switching equipment signal detected.' : 'Direct-contact or shock pathway is more likely from available facts.',
          wetOrDamagedCordSignal ? 'Wet or damaged conductor/insulation signal detected.' : 'Wet/damaged cord status requires confirmation if relevant.'
        ],
        competingMechanisms: ['arc_flash', 'electrical_shock_arc_flash_access_clearance']
      });
    }

    if (input.equipmentCategory === 'excavation' || input.primaryEnergySource === 'soil_collapse') {
      candidates.push({
        mechanism: 'caught_in_cave_in',
        confidence: input.workerExposed === true ? 0.84 : 0.64,
        reasons: [
          'Excavation or trenching condition detected.',
          input.workerExposed === true ? 'Worker exposure is indicated.' : 'Worker exposure requires confirmation.'
        ],
        competingMechanisms: ['fall_from_height', 'struck_by']
      });
    }

    if (
      input.equipmentCategory === 'fall_protection' ||
      input.primaryEnergySource === 'gravity' ||
      input.normalizedText.includes('fall exposure') ||
      input.normalizedText.includes('unprotected edge')
    ) {
      candidates.push({
        mechanism: 'fall_from_height',
        confidence: input.workerExposed === true ? 0.82 : 0.62,
        reasons: [
          'Gravity/fall exposure signal detected.',
          input.workerExposed === true ? 'Worker exposure is indicated.' : 'Worker exposure requires confirmation.'
        ],
        competingMechanisms: ['slip_trip_fall_same_level', 'falling_object_struck_by']
      });
    }

    if (input.equipmentCategory === 'mobile_equipment') {
      candidates.push({
        mechanism: 'struck_by_mobile_equipment',
        confidence: input.workerExposed === true ? 0.78 : 0.58,
        reasons: ['Mobile equipment exposure pathway detected.'],
        competingMechanisms: ['run_off_embankment', 'crush_point']
      });
    }

    if (input.normalizedText.includes('walkway') || input.normalizedText.includes('slip') || input.normalizedText.includes('trip')) {
      candidates.push({
        mechanism: 'slip_trip_fall_same_level',
        confidence: 0.7,
        reasons: ['Walking-working surface or slip/trip signal detected.'],
        competingMechanisms: ['fall_from_height']
      });
    }

    if (!candidates.length) {
      candidates.push({
        mechanism: 'unknown',
        confidence: 0.2,
        reasons: ['Mechanism could not be determined from available structured facts.'],
        competingMechanisms: []
      });
    }

    return candidates.sort((a, b) => b.confidence - a.confidence);
  }

  private detectEvidenceGaps(input: {
    jurisdiction: SafeScopeUnderstandingJurisdiction;
    equipmentCategory: string;
    taskType: string;
    workerExposed: boolean | 'unclear';
    proximity: string;
    operationalState: string;
    controlsKnown: boolean;
  }): string[] {
    const gaps: string[] = [];

    if (input.jurisdiction.detected === 'unclear') {
      gaps.push('Jurisdiction is unclear and should be confirmed.');
    }

    if (input.equipmentCategory === 'unknown') {
      gaps.push('Equipment type is not clearly identified.');
    }

    if (input.taskType === 'unknown') {
      gaps.push('Task or activity is not clearly identified.');
    }

    if (input.workerExposed !== true) {
      gaps.push('Worker exposure is not clearly established.');
    }

    if (input.proximity === 'unknown' || input.proximity === 'not_established') {
      gaps.push('Worker proximity to the hazard is not clearly described.');
    }

    if (input.operationalState === 'unknown') {
      gaps.push('Operational or energy state is not clearly established.');
    }

    if (!input.controlsKnown) {
      gaps.push('Existing, missing, or failed controls are not clearly described.');
    }

    return gaps;
  }
}
