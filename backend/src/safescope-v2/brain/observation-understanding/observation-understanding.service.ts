import {
  SafeScopeObservationCondition,
  SafeScopeObservationEntityKind,
  SafeScopeObservationUnderstandingFinding,
  SafeScopeObservationUnderstandingResult,
} from './observation-understanding.types';

function normalize(value: unknown): string {
  return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function includesAny(text: string, terms: string[]): boolean {
  return terms.some((term) => text.includes(term.toLowerCase()));
}

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function conditionSignals(text: string): SafeScopeObservationCondition[] {
  const conditions: SafeScopeObservationCondition[] = [];

  if (includesAny(text, ['blocked', 'obstructed', 'blocked by', 'stored in front'])) conditions.push('blocked');
  if (includesAny(text, ['missing', 'not provided', 'absent'])) conditions.push('missing');
  if (includesAny(text, ['damaged', 'broken', 'cracked', 'frayed'])) conditions.push('damaged');
  if (includesAny(text, ['not legible', 'illegible', 'unreadable', 'cannot read', 'cannot be read', 'faded'])) conditions.push('not_legible');
  if (includesAny(text, ['unlabeled', 'no label', 'missing label', 'label missing'])) conditions.push('unlabeled');
  if (includesAny(text, ['unguarded', 'missing guard', 'guard removed', 'guard bypassed', 'no guard'])) conditions.push('unguarded');
  if (includesAny(text, ['exposed', 'open', 'accessible'])) conditions.push('exposed');
  if (includesAny(text, ['not accessible', 'inaccessible', 'access blocked'])) conditions.push('not_accessible');
  if (includesAny(text, ['expired inspection', 'inspection expired', 'monthly inspection', 'inspection tag', 'inspection status cannot be verified'])) conditions.push('not_inspected');
  if (includesAny(text, ['defective', 'not functioning', 'failed', 'inoperable'])) conditions.push('defective');
  if (includesAny(text, ['unsecured', 'not secured', 'not tied off', 'not restrained', 'missing chain'])) conditions.push('unsecured');
  if (includesAny(text, ['unstable', 'leaning', 'stacked unevenly', 'unevenly stacked', 'improperly stacked'])) conditions.push('unstable');
  if (includesAny(text, [
    'not wearing',
    'without eye protection',
    'without face protection',
    'without eye and face protection',
    'without safety glasses',
    'without goggles',
    'without face shield',
    'without gloves',
    'no eye protection',
    'no face protection',
    'no eye and face protection',
    'no safety glasses',
    'no goggles',
    'no face shield',
    'no gloves',
    'missing eye protection',
    'missing face protection',
    'missing safety glasses',
    'missing goggles',
    'missing face shield',
    'missing gloves',
  ])) conditions.push('not_worn');
  if (includesAny(text, ['not separated', 'stored together', 'no separation', 'missing separation'])) conditions.push('not_separated');
  if (includesAny(text, ['blind spot', 'poor visibility', 'limited visibility', 'cannot see', 'obstructed view'])) conditions.push('poor_visibility');
  if (includesAny(text, ['poor air quality', 'reduced airflow', 'no ventilation', 'dust cloud', 'visible dust', 'fume', 'vapor', 'gas buildup'])) conditions.push('poor_air_quality');
  if (includesAny(text, ['unclear', 'unknown', 'cannot verify', 'cannot be verified'])) conditions.push('unclear');

  return unique(conditions.length ? conditions : ['unknown']);
}

function taskSignals(text: string): string[] {
  const signals: string[] = [];

  if (includesAny(text, ['maintenance', 'servicing', 'repair', 'cleaning', 'cleanup', 'unjamming'])) signals.push('maintenance_or_service');
  if (includesAny(text, ['operation', 'operating', 'running', 'cycling', 'in use'])) signals.push('normal_operation');
  if (includesAny(text, ['hot work', 'welding', 'cutting', 'grinding', 'torch cutting'])) signals.push('hot_work');
  if (includesAny(text, ['lifting', 'rigging', 'hoisting', 'sling', 'load handling'])) signals.push('lifting_or_rigging');
  if (includesAny(text, ['manual lifting', 'carrying', 'material handling by hand', 'repetitive'])) signals.push('manual_material_handling');
  if (includesAny(text, ['walking', 'travel path', 'travelway', 'pedestrian', 'employees pass', 'egress', 'exit route'])) signals.push('pedestrian_travel');
  if (includesAny(text, ['inspection', 'pre-op', 'pre operation', 'pre-use'])) signals.push('inspection_or_preuse');

  return unique(signals);
}

function exposureSignals(text: string): string[] {
  const signals: string[] = [];

  if (includesAny(text, ['employee', 'worker', 'person', 'pedestrian', 'ground worker'])) signals.push('employee_presence');
  if (includesAny(text, ['access', 'accessible', 'reach', 'near', 'under', 'beside', 'through'])) signals.push('access_or_proximity');
  if (includesAny(text, ['line of fire', 'struck by', 'crush', 'pinch', 'caught'])) signals.push('line_of_fire_or_contact');
  if (includesAny(text, ['dust', 'fume', 'vapor', 'gas', 'noise', 'heat'])) signals.push('health_exposure_pathway');

  return unique(signals);
}

function energySignals(text: string): string[] {
  const signals: string[] = [];

  if (includesAny(text, ['rotating', 'moving', 'belt', 'pulley', 'shaft', 'conveyor', 'press'])) signals.push('mechanical_motion');
  if (includesAny(text, ['energized', 'live', 'electrical', 'voltage', 'wire', 'conductor', 'panel'])) signals.push('electrical_energy');
  if (includesAny(text, ['hydraulic', 'pneumatic', 'pressure', 'stored energy'])) signals.push('stored_pressure_or_energy');
  if (includesAny(text, ['overhead', 'raised', 'suspended', 'falling', 'edge', 'height'])) signals.push('gravity');
  if (includesAny(text, ['chemical', 'solvent', 'acid', 'caustic', 'flammable'])) signals.push('chemical_energy');
  if (includesAny(text, ['fire', 'hot work', 'welding', 'cutting', 'torch', 'spark'])) signals.push('thermal_energy');
  if (includesAny(text, ['dust', 'silica', 'fume', 'vapor', 'gas', 'noise'])) signals.push('industrial_hygiene_exposure');

  return unique(signals);
}

export class SafeScopeObservationUnderstandingService {
  analyze(textInput: string): SafeScopeObservationUnderstandingResult {
    const text = normalize(textInput);
    const findings: SafeScopeObservationUnderstandingFinding[] = [];

    const common = {
      conditions: conditionSignals(text),
      taskSignals: taskSignals(text),
      exposureSignals: exposureSignals(text),
      energySignals: energySignals(text),
    };

    if (includesAny(text, ['fire extinguisher', 'extinguisher', 'portable extinguisher'])) {
      findings.push({
        entityKind: 'emergency_equipment',
        entityLabel: includesAny(text, ['portable']) ? 'portable fire extinguisher' : 'fire extinguisher',
        ...common,
        likelyDomainHints: ['fire_protection', 'emergency_response'],
        likelyMechanismHints: ['fire_extinguisher_access_failure', 'emergency_equipment_unavailable'],
        jurisdictionHints: ['osha_general_industry', 'msha', 'osha_construction'],
        negativeDomainHints: ['hazard_communication', 'hazardous_materials'],
        evidenceGaps: [
          'Confirm extinguisher location, visibility, access, inspection status, tag/label readability, mounting, charge status, and area hazard coverage.',
        ],
        confidence: 'high',
        reasonCodes: ['entity-fire-extinguisher', 'prevent-hazcom-label-false-positive'],
      });
    }

    if (
      includesAny(text, ['chemical container', 'secondary container', 'container of chemical', 'solvent bottle', 'chemical bottle', 'drum']) ||
      (
        includesAny(text, ['container', 'bottle', 'drum', 'pail']) &&
        includesAny(text, ['chemical', 'solvent', 'acid', 'caustic', 'flammable', 'sds', 'hazcom'])
      )
    ) {
      findings.push({
        entityKind: 'chemical_container',
        entityLabel: 'chemical container',
        ...common,
        likelyDomainHints: ['hazard_communication', 'hazardous_materials'],
        likelyMechanismHints: ['chemical_exposure'],
        jurisdictionHints: ['osha_general_industry', 'osha_construction', 'msha'],
        negativeDomainHints: ['fire_protection'],
        evidenceGaps: [
          'Confirm chemical identity, label contents, hazard information, SDS availability, storage compatibility, use task, and employee exposure potential.',
        ],
        confidence: 'high',
        reasonCodes: ['entity-chemical-container', 'hazcom-label-context'],
      });
    }

    if (includesAny(text, ['electrical panel', 'breaker panel', 'junction box', 'disconnect', 'conductor', 'wire', 'cord', 'cable'])) {
      findings.push({
        entityKind: 'electrical_equipment',
        entityLabel: includesAny(text, ['panel']) ? 'electrical panel' : 'electrical equipment',
        ...common,
        likelyDomainHints: ['electrical'],
        likelyMechanismHints: ['shock', 'shock_arc_flash'],
        jurisdictionHints: ['osha_general_industry', 'osha_construction', 'msha'],
        negativeDomainHints: ['hazard_communication'],
        evidenceGaps: [
          'Confirm energized status, voltage or hazard class if known, exposure/access, enclosure integrity, working clearance, and qualified electrical review needs.',
        ],
        confidence: 'high',
        reasonCodes: ['entity-electrical-equipment'],
      });
    }

    if (includesAny(text, ['conveyor', 'pulley', 'belt', 'shaft', 'sprocket', 'chain', 'press', 'point of operation', 'nip point', 'pinch point'])) {
      findings.push({
        entityKind: 'equipment',
        entityLabel: includesAny(text, ['conveyor']) ? 'conveyor' : 'machine equipment',
        ...common,
        likelyDomainHints: ['machine_guarding'],
        likelyMechanismHints: includesAny(text, ['lockout', 'tagout', 'maintenance', 'servicing'])
          ? ['unexpected_startup', 'stored_energy_release', 'rotating_equipment_nip_point']
          : ['rotating_equipment', 'rotating_equipment_nip_point', 'pinch_point'],
        jurisdictionHints: ['msha', 'osha_general_industry', 'osha_construction'],
        negativeDomainHints: [],
        evidenceGaps: [
          'Confirm the moving part or point of operation, employee access, operational state, guard coverage, task, and energy-isolation status if servicing or cleaning is involved.',
        ],
        confidence: 'high',
        reasonCodes: ['entity-machine-equipment'],
      });
    }

    if (includesAny(text, ['forklift', 'loader', 'haul truck', 'mobile equipment', 'powered industrial truck', 'vehicle', 'truck'])) {
      findings.push({
        entityKind: 'mobile_equipment',
        entityLabel: includesAny(text, ['forklift']) || includesAny(text, ['powered industrial truck']) ? 'powered industrial truck' : 'mobile equipment',
        ...common,
        likelyDomainHints: ['mobile_equipment', 'powered_haulage'],
        likelyMechanismHints: ['pedestrian_strike', 'struck_by_mobile_equipment'],
        jurisdictionHints: ['msha', 'osha_general_industry', 'osha_construction'],
        negativeDomainHints: [],
        evidenceGaps: [
          'Confirm equipment type, movement direction, pedestrian proximity, visibility, alarm/spotter status, travel path, traffic controls, and operator controls.',
        ],
        confidence: 'high',
        reasonCodes: ['entity-mobile-equipment'],
      });
    }

    if (includesAny(text, ['open edge', 'platform', 'scaffold', 'ladder', 'floor hole', 'roof edge', 'fall protection', 'guardrail'])) {
      findings.push({
        entityKind: 'fall_exposure',
        entityLabel: 'fall exposure',
        ...common,
        likelyDomainHints: ['fall_protection', 'walking_working_surfaces'],
        likelyMechanismHints: ['fall_from_height', 'inadequate_guardrail'],
        jurisdictionHints: ['osha_construction', 'osha_general_industry', 'msha'],
        negativeDomainHints: [],
        evidenceGaps: [
          'Confirm fall height, work surface, edge/opening condition, employee location, fall protection system, guardrail details, and access method.',
        ],
        confidence: 'high',
        reasonCodes: ['entity-fall-exposure'],
      });
    }

    if (includesAny(text, ['eyewash', 'emergency shower'])) {
      findings.push({
        entityKind: 'emergency_equipment',
        entityLabel: includesAny(text, ['shower']) ? 'emergency shower' : 'eyewash station',
        ...common,
        likelyDomainHints: ['emergency_response', 'hazardous_materials'],
        likelyMechanismHints: ['emergency_equipment_unavailable'],
        jurisdictionHints: ['osha_general_industry', 'osha_construction', 'msha'],
        negativeDomainHints: [],
        evidenceGaps: [
          'Confirm access distance, obstruction, inspection tag, activation test, water flow, affected chemical/process, and employee exposure potential.',
        ],
        confidence: 'high',
        reasonCodes: ['entity-emergency-wash-equipment'],
      });
    }

    if (includesAny(text, ['safety glasses', 'goggles', 'face shield', 'eye protection', 'face protection', 'gloves', 'hand protection', 'ppe'])) {
      findings.push({
        entityKind: 'ppe',
        entityLabel: includesAny(text, ['glove', 'hand protection']) ? 'hand protection' : 'eye and face protection',
        ...common,
        likelyDomainHints: ['ppe'],
        likelyMechanismHints: includesAny(text, ['glove', 'hand protection']) ? ['hand_ppe_gap'] : ['eye_face_ppe_gap'],
        jurisdictionHints: ['osha_general_industry', 'osha_construction', 'msha'],
        negativeDomainHints: [],
        evidenceGaps: [
          'Confirm task, exposure type, required PPE, PPE availability, employee use, condition of PPE, and whether higher-level controls are needed.',
        ],
        confidence: 'high',
        reasonCodes: ['entity-ppe'],
      });
    }

    if (includesAny(text, ['grinder', 'abrasive wheel', 'cutoff wheel', 'cut-off wheel', 'portable power tool', 'hand tool', 'extension cord', 'tool cord'])) {
      findings.push({
        entityKind: 'tool',
        entityLabel: includesAny(text, ['grinder', 'abrasive wheel', 'cutoff']) ? 'abrasive wheel tool' : 'tool or cord',
        ...common,
        likelyDomainHints: ['tools_equipment'],
        likelyMechanismHints: includesAny(text, ['guard', 'abrasive wheel', 'grinder']) ? ['abrasive_wheel_failure', 'tool_guarding_gap'] : ['defective_tool_contact'],
        jurisdictionHints: ['osha_general_industry', 'osha_construction', 'msha'],
        negativeDomainHints: [],
        evidenceGaps: [
          'Confirm tool type, guard condition, cord/grounding condition, wheel rating if applicable, task, user exposure, and whether defective equipment was removed from service.',
        ],
        confidence: 'high',
        reasonCodes: ['entity-tool-equipment'],
      });
    }

    if (includesAny(text, ['unstable stack', 'stacked unevenly', 'leaning pallet', 'palletized material', 'material stored overhead', 'overhead storage', 'falling material'])) {
      findings.push({
        entityKind: 'material_storage',
        entityLabel: includesAny(text, ['overhead', 'falling']) ? 'overhead stored material' : 'unstable stored material',
        ...common,
        likelyDomainHints: ['material_handling'],
        likelyMechanismHints: includesAny(text, ['overhead', 'falling']) ? ['falling_object_material'] : ['unstable_stack_collapse'],
        jurisdictionHints: ['osha_general_industry', 'osha_construction', 'msha'],
        negativeDomainHints: [],
        evidenceGaps: [
          'Confirm material type, stack height/stability, aisle or employee exposure, storage method, rack condition, and corrective storage controls.',
        ],
        confidence: 'high',
        reasonCodes: ['entity-material-storage'],
      });
    }

    if (includesAny(text, ['wet floor', 'spill', 'standing water', 'slick floor', 'loose material', 'trip hazard', 'extension cord across', 'obstruction in walkway'])) {
      findings.push({
        entityKind: 'walking_surface',
        entityLabel: includesAny(text, ['wet', 'spill', 'slick']) ? 'slippery walking surface' : 'obstructed walking surface',
        ...common,
        likelyDomainHints: ['slip_trip_fall', 'walking_working_surfaces', 'slips_trips_falls'],
        likelyMechanismHints: includesAny(text, ['wet', 'spill', 'slick']) ? ['slip'] : ['trip'],
        jurisdictionHints: ['osha_general_industry', 'osha_construction', 'msha'],
        negativeDomainHints: [],
        evidenceGaps: [
          'Confirm walking surface condition, source of contamination or obstruction, travel frequency, lighting, drainage/housekeeping controls, and employee exposure.',
        ],
        confidence: 'high',
        reasonCodes: ['entity-walking-surface'],
      });
    }

    if (includesAny(text, ['heat stress', 'heat illness', 'cold stress', 'cold exposure', 'noise', 'loud', 'dust', 'silica', 'fume', 'vapor'])) {
      findings.push({
        entityKind: 'environmental_condition',
        entityLabel: includesAny(text, ['heat']) ? 'heat exposure' : includesAny(text, ['cold']) ? 'cold exposure' : includesAny(text, ['noise', 'loud']) ? 'noise exposure' : 'airborne exposure',
        ...common,
        likelyDomainHints: includesAny(text, ['silica', 'dust']) ? ['health_respiratory', 'health_exposure'] : ['environmental_exposure', 'health_exposure'],
        likelyMechanismHints: includesAny(text, ['heat']) ? ['heat_illness'] : includesAny(text, ['cold']) ? ['cold_stress'] : includesAny(text, ['noise', 'loud']) ? ['noise_induced_hearing_loss'] : ['silica_inhalation'],
        jurisdictionHints: ['osha_general_industry', 'osha_construction', 'msha'],
        negativeDomainHints: [],
        evidenceGaps: [
          'Confirm exposure source, duration/frequency, affected employees, monitoring data if available, controls, PPE, symptoms, and applicable exposure limits or programs.',
        ],
        confidence: 'high',
        reasonCodes: ['entity-environmental-health-exposure'],
      });
    }

    if (includesAny(text, ['hot work', 'welding', 'cutting', 'torch cutting', 'grinding sparks', 'fire watch'])) {
      findings.push({
        entityKind: 'hot_work',
        entityLabel: 'hot work',
        ...common,
        likelyDomainHints: ['welding_cutting_hot_work', 'fire_protection'],
        likelyMechanismHints: includesAny(text, ['fire watch']) ? ['fire_watch_gap'] : ['hot_work_ignition', 'fire_explosion'],
        jurisdictionHints: ['osha_general_industry', 'osha_construction', 'msha'],
        negativeDomainHints: [],
        evidenceGaps: [
          'Confirm hot-work task, ignition sources, combustible clearance, fire watch, permits/procedure, extinguisher readiness, ventilation, and affected personnel.',
        ],
        confidence: 'high',
        reasonCodes: ['entity-hot-work'],
      });
    }

    if (includesAny(text, ['confined space', 'permit space', 'tank entry', 'vessel entry', 'oxygen deficiency', 'atmospheric hazard'])) {
      findings.push({
        entityKind: 'confined_space',
        entityLabel: 'confined space',
        ...common,
        likelyDomainHints: ['confined_space'],
        likelyMechanismHints: ['asphyxiation'],
        jurisdictionHints: ['osha_general_industry', 'osha_construction', 'msha'],
        negativeDomainHints: [],
        evidenceGaps: [
          'Confirm space configuration, entry status, atmospheric testing, ventilation, isolation, attendant/rescue provisions, permit status, and entrant exposure.',
        ],
        confidence: 'high',
        reasonCodes: ['entity-confined-space'],
      });
    }

    if (includesAny(text, ['trench', 'excavation', 'cave-in', 'cave in', 'protective system', 'trench box'])) {
      findings.push({
        entityKind: 'excavation',
        entityLabel: 'excavation or trench',
        ...common,
        likelyDomainHints: ['excavation_trenching'],
        likelyMechanismHints: ['collapse'],
        jurisdictionHints: ['osha_construction', 'msha'],
        negativeDomainHints: [],
        evidenceGaps: [
          'Confirm excavation depth, soil/rock condition, protective system, spoil placement, access/egress, water accumulation, adjacent loads, and employee location.',
        ],
        confidence: 'high',
        reasonCodes: ['entity-excavation-trenching'],
      });
    }

    if (includesAny(text, ['crane', 'rigging', 'sling', 'shackle', 'hook', 'suspended load', 'hoisted load', 'load path'])) {
      findings.push({
        entityKind: 'rigging_equipment',
        entityLabel: includesAny(text, ['suspended load', 'hoisted load']) ? 'suspended load' : 'rigging equipment',
        ...common,
        likelyDomainHints: ['cranes_rigging_hoisting'],
        likelyMechanismHints: includesAny(text, ['suspended load', 'hoisted load', 'load path']) ? ['struck_by_suspended_load'] : ['rigging_failure'],
        jurisdictionHints: ['osha_general_industry', 'osha_construction', 'msha'],
        negativeDomainHints: [],
        evidenceGaps: [
          'Confirm load weight, rigging condition, inspection status, qualified rigger/operator involvement, load path, exclusion zone, and employee exposure.',
        ],
        confidence: 'high',
        reasonCodes: ['entity-crane-rigging-hoisting'],
      });
    }

    if (includesAny(text, ['exit route', 'emergency exit', 'egress', 'escapeway', 'escape way', 'blocked exit', 'blocked doorway'])) {
      findings.push({
        entityKind: 'egress',
        entityLabel: includesAny(text, ['escapeway', 'escape way']) ? 'mine escapeway' : 'emergency egress route',
        ...common,
        likelyDomainHints: ['emergency_preparedness'],
        likelyMechanismHints: ['egress_blockage'],
        jurisdictionHints: ['osha_general_industry', 'osha_construction', 'msha'],
        negativeDomainHints: [],
        evidenceGaps: [
          'Confirm exit/egress route, obstruction, signage/lighting, travel distance, employee occupancy, alternate route, and emergency readiness impact.',
        ],
        confidence: 'high',
        reasonCodes: ['entity-emergency-egress'],
      });
    }

    if (!findings.length) {
      findings.push({
        entityKind: 'unknown',
        entityLabel: 'unknown',
        ...common,
        likelyDomainHints: ['unknown'],
        likelyMechanismHints: ['unknown'],
        jurisdictionHints: ['unclear'],
        negativeDomainHints: [],
        evidenceGaps: [
          'Clarify object/equipment, condition, location, task, employee exposure, energy source, jurisdiction, and existing controls.',
        ],
        confidence: 'low',
        reasonCodes: ['insufficient-entity-context'],
      });
    }

    const primary = findings[0];

    return {
      engine: 'safescope_observation_understanding_v1',
      mode: 'read_only_semantic_extraction',
      inputText: textInput,
      findings,
      summary: {
        primaryEntityKind: primary.entityKind,
        primaryEntityLabel: primary.entityLabel,
        primaryCondition: primary.conditions[0] || 'unknown',
        likelyDomainHints: unique(findings.flatMap((finding) => finding.likelyDomainHints)),
        likelyMechanismHints: unique(findings.flatMap((finding) => finding.likelyMechanismHints)),
        negativeDomainHints: unique(findings.flatMap((finding) => finding.negativeDomainHints)),
        evidenceGaps: unique(findings.flatMap((finding) => finding.evidenceGaps)),
        confidence: primary.confidence,
      },
      boundary: {
        readOnly: true,
        doesNotDeclareViolation: true,
        doesNotCreateCitation: true,
        doesNotOverrideProductionDecision: true,
        requiresValidationBeforeRouting: true,
      },
    };
  }
}
