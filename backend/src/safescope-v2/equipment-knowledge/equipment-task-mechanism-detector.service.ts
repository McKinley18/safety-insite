import * as natural from 'natural';
import {
  SafeScopeEquipmentComponentMechanism,
  SafeScopeEquipmentFailureMode,
  SafeScopeEquipmentTaskMechanismRecord,
  SafeScopeHarmMechanism,
  SafeScopeTaskContext,
} from './equipment-task-mechanism.types';
import { SAFESCOPE_EQUIPMENT_TASK_MECHANISM_REGISTRY } from './equipment-task-mechanism.registry';

export type SafeScopeEquipmentTaskMechanismDetectionInput = {
  description: string;
  equipmentId?: string;
  taskContext?: SafeScopeTaskContext;
};

export type SafeScopeEquipmentTaskMechanismDetectionMatch = {
  equipmentId: string;
  equipmentLabel: string;
  componentId: string;
  componentLabel: string;
  failureModeId: string;
  failureModeLabel: string;
  failureModeDescription: string;
  score: number;
  confidence: 'high' | 'medium' | 'low';
  matchedTerms: string[];
  matchedSignals: string[];
  likelyTaskContexts: SafeScopeTaskContext[];
  harmMechanisms: SafeScopeHarmMechanism[];
  likelyHazardDomains: string[];
  evidenceQuestions: string[];
  immediateCautions: string[];
  correctiveActionThemes: string[];
  verificationEvidence: string[];
  conflictNotes: string[];
  guardrails: SafeScopeEquipmentTaskMechanismRecord['guardrails'];
};

export type SafeScopeEquipmentTaskMechanismDetectionResult = {
  matched: boolean;
  primaryMatch?: SafeScopeEquipmentTaskMechanismDetectionMatch;
  matches: SafeScopeEquipmentTaskMechanismDetectionMatch[];
  evidenceGaps: string[];
  cautions: string[];
  detectorNotes: string[];
};

type ScoredCandidate = {
  record: SafeScopeEquipmentTaskMechanismRecord;
  component: SafeScopeEquipmentComponentMechanism;
  failureMode: SafeScopeEquipmentFailureMode;
  score: number;
  matchedTerms: Set<string>;
  matchedSignals: Set<string>;
};

const CONFIDENCE_THRESHOLDS = {
  high: 34,
  medium: 20,
  low: 12,
};

export class SafeScopeEquipmentTaskMechanismDetectorService {
  detect(
    input: SafeScopeEquipmentTaskMechanismDetectionInput,
  ): SafeScopeEquipmentTaskMechanismDetectionResult {
    const normalizedDescription = normalizeText(input.description);

    if (!normalizedDescription) {
      return {
        matched: false,
        matches: [],
        evidenceGaps: ['No hazard description was provided for task-mechanism detection.'],
        cautions: [
          'SafeScope cannot infer equipment task mechanisms without observation details, equipment context, and task context.',
        ],
        detectorNotes: ['Task-mechanism detector skipped because description was empty.'],
      };
    }

    const candidates: ScoredCandidate[] = [];

    for (const record of SAFESCOPE_EQUIPMENT_TASK_MECHANISM_REGISTRY) {
      if (input.equipmentId && record.equipmentId !== input.equipmentId) {
        continue;
      }

      for (const component of record.components) {
        for (const failureMode of component.failureModes) {
          const candidate: ScoredCandidate = {
            record,
            component,
            failureMode,
            score: 0,
            matchedTerms: new Set<string>(),
            matchedSignals: new Set<string>(),
          };

          this.scoreEquipment(record, normalizedDescription, candidate);
          this.scoreComponent(component, normalizedDescription, candidate);
          this.scoreFailureMode(failureMode, normalizedDescription, candidate);
          this.scoreTaskContext(input.taskContext, failureMode, candidate);
          this.scoreMechanismSignals(normalizedDescription, failureMode, candidate);

          if (candidate.score >= CONFIDENCE_THRESHOLDS.low && this.hasSpecificEquipmentOrComponentSignal(candidate)) {
            if (normalizedDescription.includes('acid jug')) {
              console.error(`[DIAGNOSTIC gauntlet] candidate for acid jug: ${candidate.record.equipmentId} score: ${candidate.score} matchedTerms: ${Array.from(candidate.matchedTerms).join(',')}`);
            }
            candidates.push(candidate);
          }
        }
      }
    }

    const matches = candidates
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((candidate) => this.toMatch(candidate));

    const primaryMatch = matches[0];

    return {
      matched: Boolean(primaryMatch),
      primaryMatch,
      matches,
      evidenceGaps: primaryMatch
        ? primaryMatch.evidenceQuestions.slice(0, 4)
        : [
            'Confirm the specific equipment involved.',
            'Confirm the component involved.',
            'Confirm whether the task is operation, inspection, cleanup, maintenance, repair, or startup/shutdown.',
            'Confirm whether hazardous energy or moving parts were present or controlled.',
          ],
      cautions: primaryMatch
        ? primaryMatch.immediateCautions
        : [
            'Do not infer a regulatory violation from a vague equipment description alone.',
            'Do not close the issue without qualified review and objective correction evidence.',
          ],
      detectorNotes: [
        'Task-mechanism detection is context-only and does not create citations, declare violations, or override regulatory review.',
        'Scores are based on equipment, component, failure-mode, task-context, and harm-mechanism signals in the observation text.',
      ],
    };
  }

  private scoreEquipment(
    record: SafeScopeEquipmentTaskMechanismRecord,
    normalizedDescription: string,
    candidate: ScoredCandidate,
  ) {
    const equipmentTerms = [
      record.equipmentId,
      record.equipmentLabel,
      record.equipmentGroup,
      record.equipmentId.replace(/_/g, ' '),
    ];

    for (const term of equipmentTerms) {
      if (containsTerm(normalizedDescription, term)) {
        candidate.score += 8;
        candidate.matchedTerms.add(normalizeDisplayTerm(term));
        candidate.matchedSignals.add('equipment_match');
      }
    }
  }

  private scoreComponent(
    component: SafeScopeEquipmentComponentMechanism,
    normalizedDescription: string,
    candidate: ScoredCandidate,
  ) {
    const componentTerms = [component.componentId, component.label, ...component.aliases];

    for (const term of componentTerms) {
      if (containsTerm(normalizedDescription, term)) {
        candidate.score += 12;
        candidate.matchedTerms.add(normalizeDisplayTerm(term));
        candidate.matchedSignals.add('component_match');
      }
    }

    for (const motion of component.hazardousEnergyOrMotion) {
      if (containsTerm(normalizedDescription, motion)) {
        candidate.score += 6;
        candidate.matchedTerms.add(normalizeDisplayTerm(motion));
        candidate.matchedSignals.add('hazardous_energy_or_motion_match');
      }
    }

    for (const task of component.commonTasks) {
      if (containsTaskSignal(normalizedDescription, task)) {
        candidate.score += 4;
        candidate.matchedTerms.add(task);
        candidate.matchedSignals.add('component_task_match');
      }
    }
  }

  private scoreFailureMode(
    failureMode: SafeScopeEquipmentFailureMode,
    normalizedDescription: string,
    candidate: ScoredCandidate,
  ) {
    const failureTerms = buildFailureModeTerms(failureMode);

    for (const term of failureTerms) {
      if (containsTerm(normalizedDescription, term)) {
        candidate.score += 10;
        candidate.matchedTerms.add(normalizeDisplayTerm(term));
        candidate.matchedSignals.add('failure_mode_match');
      }
    }

    for (const domain of failureMode.likelyHazardDomains) {
      if (containsTerm(normalizedDescription, domain.replace(/_/g, ' '))) {
        candidate.score += 4;
        candidate.matchedTerms.add(domain);
        candidate.matchedSignals.add('hazard_domain_signal');
      }
    }
  }

  private scoreTaskContext(
    taskContext: SafeScopeTaskContext | undefined,
    failureMode: SafeScopeEquipmentFailureMode,
    candidate: ScoredCandidate,
  ) {
    if (!taskContext) {
      return;
    }

    if (failureMode.likelyTaskContexts.includes(taskContext)) {
      candidate.score += 8;
      candidate.matchedTerms.add(taskContext);
      candidate.matchedSignals.add('explicit_task_context_match');
    }
  }

  private scoreMechanismSignals(
    normalizedDescription: string,
    failureMode: SafeScopeEquipmentFailureMode,
    candidate: ScoredCandidate,
  ) {
    const signalMap: Record<string, string[]> = {
      caught_in_or_between: ['caught in', 'caught between', 'pinch point', 'nip point', 'in running nip'],
      entanglement: ['entangled', 'entanglement', 'wrapped', 'pulled into', 'drawn into'],
      crushed_by: ['crushed', 'crushing', 'pinched', 'struck against'],
      unexpected_startup: ['unexpected startup', 'unexpected start', 'restart', 'started while', 'energized'],
      falling_material: ['falling material', 'spillage', 'material buildup', 'material build up', 'ejected material'],
      stored_energy_release: ['stored energy', 'residual energy', 'release of energy'],
    };

    for (const mechanism of failureMode.harmMechanisms) {
      const signals = signalMap[mechanism] ?? [mechanism.replace(/_/g, ' ')];
      for (const signal of signals) {
        if (containsTerm(normalizedDescription, signal)) {
          candidate.score += 6;
          candidate.matchedTerms.add(signal);
          candidate.matchedSignals.add('harm_mechanism_signal');
        }
      }
    }
  }

  private hasSpecificEquipmentOrComponentSignal(candidate: ScoredCandidate): boolean {
    return (
      candidate.matchedSignals.has('equipment_match') ||
      candidate.matchedSignals.has('component_match') ||
      candidate.matchedSignals.has('hazardous_energy_or_motion_match')
    );
  }

  private toMatch(candidate: ScoredCandidate): SafeScopeEquipmentTaskMechanismDetectionMatch {
    return {
      equipmentId: candidate.record.equipmentId,
      equipmentLabel: candidate.record.equipmentLabel,
      componentId: candidate.component.componentId,
      componentLabel: candidate.component.label,
      failureModeId: candidate.failureMode.failureModeId,
      failureModeLabel: candidate.failureMode.label,
      failureModeDescription: candidate.failureMode.description,
      score: candidate.score,
      confidence: confidenceForScore(candidate.score),
      matchedTerms: Array.from(candidate.matchedTerms).sort(),
      matchedSignals: Array.from(candidate.matchedSignals).sort(),
      likelyTaskContexts: candidate.failureMode.likelyTaskContexts,
      harmMechanisms: candidate.failureMode.harmMechanisms,
      likelyHazardDomains: candidate.failureMode.likelyHazardDomains,
      evidenceQuestions: candidate.failureMode.evidenceQuestions,
      immediateCautions: candidate.failureMode.immediateCautions,
      correctiveActionThemes: candidate.failureMode.correctiveActionThemes,
      verificationEvidence: candidate.failureMode.verificationEvidence,
      conflictNotes: candidate.failureMode.conflictNotes,
      guardrails: candidate.record.guardrails,
    };
  }
}

function buildFailureModeTerms(failureMode: SafeScopeEquipmentFailureMode): string[] {
  const idTerms = failureMode.failureModeId.split('_').join(' ');
  const labelTerms = failureMode.label;

  const sharedTerms = [failureMode.failureModeId, idTerms, labelTerms];

  const failureSpecificTerms: Record<string, string[]> = {
    missing_tail_pulley_guard: [
      'missing guard',
      'removed guard',
      'damaged guard',
      'ineffective guard',
      'guard missing',
      'guard removed',
      'tail pulley guard',
      'unguarded tail pulley',
      'exposed tail pulley',
      'nip point exposed',
    ],
    tail_pulley_cleanup_without_energy_control: [
      'cleanup',
      'cleaning',
      'cleaning material',
      'material buildup',
      'material build up',
      'shoveling',
      'washdown',
      'without energy control',
      'energy control unclear',
      'not locked out',
      'lockout unclear',
      'locked out unclear',
      'not clear whether',
      'belt was locked out',
      'near the conveyor tail pulley',
    ],
    unguarded_head_pulley_or_drive: [
      'unguarded conveyor drive',
      'unguarded drive',
      'exposed drive',
      'drive pulley',
      'head pulley',
      'unguarded head pulley',
      'exposed head pulley',
      'conveyor drive exposed',
      'drive pulley exposed',
    ],
    loader_pedestrian_blind_spot_no_controls: [
      'loader blind spot',
      'front end loader near pedestrians',
      'front-end loader near pedestrians',
      'loader operating near pedestrians',
      'loader backing near pedestrians',
      'loader no spotter',
      'no spotter',
      'pedestrian exposure',
      'shared travel path',
      'loader visibility',
      'blind spot',
    ],
    working_under_raised_loader_bucket_without_support: [
      'working under raised loader bucket',
      'under raised bucket',
      'raised loader bucket',
      'raised bucket',
      'loader bucket raised',
      'without support',
      'without blocking',
      'not blocked',
      'hydraulic support only',
      'raised attachment',
      'under lift arms',
    ],
    loader_brake_or_parking_control_defect_used: [
      'loader brake defect',
      'brake defect',
      'parking brake defect',
      'parking brake',
      'loader parked on grade',
      'parked on grade',
      'wheel chocks',
      'not chocked',
      'uncontrolled movement',
      'used after brake defect',
      'pre op brake defect',
      'pre-operation brake defect',
    ],
    haul_truck_dumping_near_inadequate_berm_or_edge: [
      'haul truck dumping',
      'truck dumping',
      'dump point',
      'stockpile dump',
      'dump berm',
      'inadequate berm',
      'berm inadequate',
      'dumping near edge',
      'near drop off',
      'near drop-off',
      'elevated dump point',
      'edge control',
    ],
    haul_truck_backing_alarm_or_visibility_control_defect: [
      'haul truck backing',
      'backing haul truck',
      'backup alarm',
      'reverse alarm',
      'backup alarm not working',
      'back up alarm not working',
      'camera not working',
      'visibility control',
      'blind spot',
      'spotter',
      'backing near pedestrians',
    ],
    forklift_unstable_or_elevated_load_travel: [
      'forklift unstable load',
      'unstable load',
      'elevated load',
      'forklift elevated load',
      'traveling with elevated load',
      'forklift load blocking visibility',
      'load blocking visibility',
      'unsecured load',
      'falling load',
      'forklift travel with load',
    ],
    forklift_seatbelt_or_operator_restraint_not_used_or_defective: [
      'forklift seatbelt',
      'forklift seat belt',
      'seatbelt not used',
      'seat belt not used',
      'operator restraint',
      'restraint not used',
      'seatbelt defective',
      'operator restraint defective',
      'tipover restraint',
    ],
    forklift_pedestrian_separation_gap: [
      'forklift pedestrian',
      'forklift traffic',
      'pedestrian walkway',
      'forklift crossing',
      'warehouse traffic',
      'shared aisle',
      'pedestrian separation',
      'no barrier',
      'without barriers',
      'blind corner',
      'forklift near pedestrians',
    ],
    crusher_drive_guard_removed_or_exposed: [
      'crusher drive guard',
      'crusher guard removed',
      'crusher drive exposed',
      'crusher belt drive exposed',
      'crusher belt drive',
      'jaw crusher guard',
      'cone crusher guard',
      'impact crusher guard',
      'exposed crusher drive',
      'unguarded crusher drive',
      'crusher pulley exposed',
    ],
    crusher_jam_clearing_without_energy_control_clarity: [
      'crusher jam clearing',
      'jam clearing',
      'clearing jam',
      'plugged crusher',
      'crusher blockage',
      'bridged material',
      'clearing material from crusher',
      'crusher locked out unclear',
      'without energy control',
      'stored material energy',
      'crusher restart',
    ],
    screen_drive_guarding_or_access_exposure: [
      'screen plant drive',
      'screen drive exposed',
      'screen belt exposed',
      'vibrating screen access',
      'screen deck access',
      'screen deck fall exposure',
      'screen walkway',
      'screen platform',
      'screen guarding',
      'screen drive guarding',
      'screening plant access',
    ],
    open_panel_or_exposed_live_parts: [
      'open electrical panel',
      'exposed live parts',
      'exposed energized parts',
      'panel cover missing',
      'breaker panel open',
      'control cabinet open',
      'missing dead front',
      'panelboard open',
      'electrical enclosure open',
      'live conductors exposed',
    ],
    wet_or_damaged_electrical_panel_or_cord: [
      'wet electrical panel',
      'damaged electrical panel',
      'damaged cord',
      'damaged plug',
      'temporary wiring damaged',
      'wet cord',
      'electrical cord damaged',
      'cord insulation damaged',
      'wet electrical equipment',
      'damaged receptacle',
    ],
    generator_exhaust_or_ventilation_exposure: [
      'generator exhaust',
      'portable generator exhaust',
      'carbon monoxide',
      'generator indoors',
      'generator near doorway',
      'generator near air intake',
      'poor ventilation',
      'exhaust entering',
      'generator ventilation',
      'employees reported headache',
    ],
    generator_temporary_power_or_fuel_fire_exposure: [
      'generator temporary power',
      'generator cord damaged',
      'generator fuel',
      'fuel spill',
      'refueling generator',
      'generator hot surface',
      'fuel near generator',
      'temporary power cord',
      'damaged generator cord',
      'generator fire exposure',
    ],
    aerial_lift_fall_restraint_or_platform_control_gap: [
      'aerial lift fall restraint',
      'boom lift fall restraint',
      'scissor lift platform',
      'lift basket',
      'platform gate open',
      'not tied off',
      'tie off unclear',
      'fall restraint unclear',
      'standing on lift rails',
      'overreaching from lift',
      'aerial lift platform',
    ],
    aerial_lift_overhead_power_or_tipover_exposure: [
      'aerial lift near power lines',
      'boom lift near power lines',
      'overhead power lines',
      'overhead electrical',
      'lift on unstable ground',
      'outriggers not set',
      'lift tipover',
      'slope with lift',
      'soft ground',
      'minimum approach distance',
    ],
    scaffold_incomplete_guardrail_or_platform: [
      'scaffold missing guardrail',
      'scaffold guardrail missing',
      'incomplete scaffold platform',
      'missing midrail',
      'missing toe board',
      'scaffold plank missing',
      'scaffold platform gap',
      'scaffold access incomplete',
      'scaffold platform incomplete',
    ],
    scaffold_unstable_base_or_missing_inspection_clarity: [
      'scaffold unstable base',
      'scaffold not tagged',
      'scaffold tag missing',
      'missing scaffold inspection',
      'scaffold base plate',
      'scaffold mudsill',
      'scaffold bracing missing',
      'scaffold tie in missing',
      'scaffold wheel lock',
      'scaffold footing',
    ],
    portable_ladder_unsecured_wrong_angle_or_overreach: [
      'ladder not secured',
      'unsecured ladder',
      'wrong ladder angle',
      'ladder wrong angle',
      'overreaching from ladder',
      'standing on top step',
      'top step',
      'ladder footing',
      'extension ladder not secured',
      'ladder used as work platform',
    ],
    portable_ladder_damaged_or_defective_used: [
      'damaged ladder',
      'defective ladder',
      'broken ladder',
      'cracked ladder',
      'bent ladder',
      'missing rung',
      'loose rung',
      'ladder tagged out',
      'ladder removed from service',
      'damaged extension ladder',
    ],
    trench_worker_without_protective_system_clarity: [
      'worker in trench',
      'employee in trench',
      'trench without protective system',
      'excavation without protective system',
      'trench box missing',
      'protective system unclear',
      'trench collapse',
      'unsupported trench',
      'soil collapse',
      'competent person inspection',
    ],
    excavation_spoil_surcharge_or_access_gap: [
      'spoil pile near trench',
      'spoil pile near edge',
      'equipment near trench edge',
      'surcharge near trench',
      'trench access missing',
      'no ladder in trench',
      'excavation access egress',
      'fall into excavation',
      'traffic near trench',
      'materials near trench edge',
    ],
    telehandler_suspended_or_elevated_load_exposure: [
      'telehandler suspended load',
      'telehandler elevated load',
      'telehandler load',
      'reach forklift load',
      'rough terrain forklift load',
      'employees under telehandler load',
      'load chart unclear',
      'boom extended with load',
      'telehandler exclusion zone',
      'telehandler load stability',
    ],
    telehandler_personnel_lift_or_platform_use_gap: [
      'telehandler lifting personnel',
      'telehandler personnel platform',
      'telehandler work platform',
      'forks used as platform',
      'improvised platform',
      'personnel basket telehandler',
      'platform not approved',
      'fall protection in telehandler platform',
      'telehandler platform securement',
    ],
  };

  return [...sharedTerms, ...(failureSpecificTerms[failureMode.failureModeId] ?? [])];
}

function confidenceForScore(score: number): 'high' | 'medium' | 'low' {
  if (score >= CONFIDENCE_THRESHOLDS.high) {
    return 'high';
  }

  if (score >= CONFIDENCE_THRESHOLDS.medium) {
    return 'medium';
  }

  return 'low';
}

function containsTaskSignal(normalizedDescription: string, task: SafeScopeTaskContext): boolean {
  const taskSignals: Record<string, string[]> = {
    normal_operation: ['normal operation', 'operating', 'running', 'in operation'],
    inspection: ['inspection', 'inspecting', 'exam', 'walkdown'],
    cleanup: ['cleanup', 'cleaning', 'shoveling', 'washdown', 'material buildup', 'material build up'],
    maintenance: ['maintenance', 'maintaining', 'servicing'],
    repair: ['repair', 'repairing', 'replace', 'replacement'],
    startup_shutdown: ['startup', 'start up', 'shutdown', 'shut down', 'restart'],
    loading_unloading: ['loading', 'unloading', 'dumping'],
    travel: ['travel', 'tramming', 'driving', 'backing'],
    lifting_rigging: ['lifting', 'rigging', 'hoisting'],
    excavation: ['excavation', 'trenching', 'digging'],
    welding_cutting: ['welding', 'cutting', 'hot work'],
  };

  return taskSignals[task]?.some((signal) => containsTerm(normalizedDescription, signal)) ?? false;
}

function containsTerm(normalizedDescription: string, rawTerm: string): boolean {
  const normalizedTerm = normalizeText(rawTerm);

  if (!normalizedTerm) {
    return false;
  }

  if (normalizedDescription.includes(normalizedTerm)) {
    return true;
  }

  // Use NLP stemming for semantic matching
  const tokenizer = new natural.WordTokenizer();
  const haystackTokens = tokenizer.tokenize(normalizedDescription) || [];
  const stemmedHaystack = haystackTokens.map(t => natural.PorterStemmer.stem(t));

  const termTokens = tokenizer.tokenize(normalizedTerm) || [];
  if (termTokens.length === 0) return false;

  // Single word semantic match
  if (termTokens.length === 1) {
    const stemmedTerm = natural.PorterStemmer.stem(termTokens[0]);
    const lowerRawTerm = rawTerm.toLowerCase();
    if ((lowerRawTerm === 'generator' || lowerRawTerm === 'generators' || stemmedTerm === 'generat' || stemmedTerm === 'gener') && !normalizedDescription.includes('generator')) {
      return false;
    }
    return stemmedHaystack.includes(stemmedTerm);
  }

  // For multi-word terms, we fallback to strict inclusion or token overlap
  // This prevents false positives from single-word overlaps in complex terms
  const stemmedTermTokens = termTokens.map(t => natural.PorterStemmer.stem(t));
  let matchedCount = 0;
  for (const st of stemmedTermTokens) {
     if ((st === 'generat' || st === 'gener') && !normalizedDescription.includes('generator')) {
         continue;
     }
     if (stemmedHaystack.includes(st)) {
         matchedCount++;
     }
  }
  return matchedCount === stemmedTermTokens.length;
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[_/-]/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeDisplayTerm(value: string): string {
  return normalizeText(value);
}
