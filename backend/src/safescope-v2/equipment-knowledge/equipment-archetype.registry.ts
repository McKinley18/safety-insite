import { SafeScopeEquipmentArchetypeRegistry } from './equipment-archetype.types';

const guardrails = {
  contextOnly: true,
  doesNotDeclareViolation: true,
  doesNotCreateCitation: true,
  doesNotOverrideRegulation: true,
  requiresQualifiedReview: true,
} as const;

export const SAFESCOPE_EQUIPMENT_ARCHETYPE_REGISTRY: SafeScopeEquipmentArchetypeRegistry = {
  engine: 'safescope_equipment_archetype_registry_v1',
  mode: 'generalized_equipment_reasoning_context_only',
  records: [
    {
      archetypeId: 'rotating_machinery',
      label: 'Rotating Machinery',
      description:
        'General equipment class for rotating shafts, couplings, belts, pulleys, rollers, fans, pumps, mixers, grinders, and other moving mechanical components.',
      exampleEquipment: ['shaft', 'coupling', 'belt drive', 'pulley', 'roller', 'fan', 'pump', 'mixer', 'grinder'],
      commonComponentClasses: ['rotating shaft', 'coupling', 'belt and pulley', 'nip point', 'drive guard', 'moving blade or impeller'],
      commonTasks: ['normal_operation', 'inspection', 'cleanup', 'maintenance', 'repair', 'startup_shutdown'],
      harmMechanisms: ['caught_in_or_between', 'entanglement', 'crushed_by', 'unexpected_startup'],
      likelyHazardDomains: ['machine_guarding', 'lockout_tagout'],
      detectionSignals: {
        strong: ['rotating shaft', 'coupling exposed', 'unguarded pulley', 'nip point', 'moving parts exposed', 'guard removed'],
        medium: ['rotating equipment', 'belt drive', 'pulley', 'shaft', 'coupling', 'roller', 'drive guard'],
        weak: ['machine', 'equipment', 'moving part', 'guard'],
      },
      evidenceQuestions: [
        'What equipment is the rotating component attached to?',
        'Can employees access the rotating part, nip point, coupling, shaft, belt, pulley, blade, or roller?',
        'Was the equipment running, stopped, locked out, or capable of unexpected startup?',
        'Was the task operation, inspection, cleanup, maintenance, repair, adjustment, or troubleshooting?',
        'Is the guard missing, removed, damaged, bypassed, loose, or incomplete?',
      ],
      immediateCautions: [
        'Do not assume a stopped machine is safe without verifying energy-control status for service, cleanup, repair, or adjustment.',
        'Do not treat signage or distance alone as equivalent to effective guarding where employees can access moving parts.',
      ],
      correctiveActionThemes: [
        'Restrict access to exposed rotating components pending qualified review.',
        'Repair, replace, or install effective guarding where moving-part access exists.',
        'Verify hazardous energy control before cleanup, maintenance, repair, adjustment, or jam-clearing tasks.',
        'Document before-and-after condition and qualified review evidence.',
      ],
      verificationEvidence: [
        'photo of exposed component before correction',
        'photo of installed/repaired guard after correction',
        'energy-control verification if service or maintenance occurred',
        'qualified person or supervisor signoff',
        'follow-up inspection result',
      ],
      specificRecordHandoffHints: [
        'If the equipment is a conveyor, check powered_conveyor_system and conveyor task-mechanism records.',
        'If the equipment is a crusher, screen, pump, mixer, or fixed plant machine, check fixed_plant_processing_equipment.',
      ],
      guardrails,
    },
    {
      archetypeId: 'powered_conveyor_system',
      label: 'Powered Conveyor System',
      description:
        'General equipment class for conveyor belts, pulleys, rollers, drives, take-ups, emergency stops, walkways, cleanup areas, and material transfer points.',
      exampleEquipment: ['conveyor', 'belt conveyor', 'tail pulley', 'head pulley', 'drive pulley', 'take-up pulley', 'return roller'],
      commonComponentClasses: ['tail pulley', 'head pulley', 'drive', 'belt', 'roller', 'emergency stop/pull cord', 'walkway', 'transfer point'],
      commonTasks: ['normal_operation', 'inspection', 'cleanup', 'maintenance', 'repair', 'startup_shutdown'],
      harmMechanisms: ['caught_in_or_between', 'entanglement', 'crushed_by', 'unexpected_startup', 'falling_material'],
      likelyHazardDomains: ['machine_guarding', 'lockout_tagout', 'material_handling'],
      detectionSignals: {
        strong: ['conveyor tail pulley', 'conveyor drive', 'moving conveyor belt', 'pull cord', 'emergency stop conveyor', 'conveyor cleanup'],
        medium: ['conveyor', 'belt', 'tail pulley', 'head pulley', 'drive pulley', 'roller', 'material buildup'],
        weak: ['belt', 'pulley', 'spillage', 'transfer point'],
      },
      evidenceQuestions: [
        'Which conveyor component is involved: tail pulley, head pulley, drive, roller, belt, transfer point, walkway, or emergency stop?',
        'Is the conveyor running, stopped, locked out, or capable of automatic/remote restart?',
        'Can employees access nip points, moving belts, rollers, or drive components?',
        'Is the task cleanup, inspection, maintenance, jam clearing, repair, or normal operation?',
        'Are emergency stops, pull cords, guarding, access controls, and restart controls functional and verified?',
      ],
      immediateCautions: [
        'Do not assume conveyor cleanup is routine when employees enter the danger zone near moving parts.',
        'Do not treat an emergency stop as a substitute for energy control during maintenance or cleanup.',
      ],
      correctiveActionThemes: [
        'Clarify conveyor operating state and energy-control status.',
        'Control access to moving parts and material transfer points.',
        'Repair or install guarding, emergency-stop, pull-cord, walkway, or cleanup controls as applicable.',
        'Document correction and qualified review evidence.',
      ],
      verificationEvidence: [
        'photo of conveyor component before and after correction',
        'pull-cord or emergency-stop function verification where applicable',
        'energy-control record where cleanup/maintenance occurred',
        'cleanup procedure or work instruction',
        'qualified review signoff',
      ],
      specificRecordHandoffHints: [
        'If the observation names tail pulley, head pulley, or conveyor drive, check conveyor task-mechanism records.',
      ],
      guardrails,
    },
    {
      archetypeId: 'mobile_equipment',
      label: 'Mobile Equipment',
      description:
        'General equipment class for self-propelled equipment that travels, backs, turns, parks, dumps, loads, grades, lifts, or operates near pedestrians and other equipment.',
      exampleEquipment: ['loader', 'haul truck', 'dozer', 'excavator', 'skid steer', 'service truck', 'water truck', 'pickup'],
      commonComponentClasses: ['operator visibility', 'brakes', 'parking controls', 'backup alarm', 'bucket/attachment', 'tires/tracks', 'access ladder'],
      commonTasks: ['normal_operation', 'inspection', 'maintenance', 'repair', 'travel_access', 'material_handling'],
      harmMechanisms: ['struck_by', 'crushed_by', 'traffic_interaction', 'fall_from_elevation'],
      likelyHazardDomains: ['mobile_equipment', 'powered_haulage', 'traffic_control'],
      detectionSignals: {
        strong: ['mobile equipment near pedestrians', 'backup alarm not working', 'equipment backing', 'blind spot', 'parking brake defect'],
        medium: ['loader', 'haul truck', 'dozer', 'excavator', 'skid steer', 'service truck', 'operator visibility'],
        weak: ['vehicle', 'truck', 'equipment travel', 'backing', 'parking'],
      },
      evidenceQuestions: [
        'What equipment is moving, backing, turning, loading, dumping, parking, or traveling?',
        'Where are pedestrians, light vehicles, ground workers, or other equipment relative to the travel path?',
        'Are visibility, alarm, camera, mirror, lighting, spotter, communication, speed, and traffic controls adequate for the task?',
        'Are brakes, parking controls, chocks, grade, and unattended-equipment conditions known?',
        'Was a pre-use inspection or defect report involved?',
      ],
      immediateCautions: [
        'Do not treat mobile equipment exposure as only an operator issue; visibility, traffic flow, ground conditions, and pedestrian separation matter.',
        'Do not close equipment-defect concerns without repair, function test, and return-to-service evidence where applicable.',
      ],
      correctiveActionThemes: [
        'Separate pedestrians and mobile equipment where feasible.',
        'Verify visibility, alarm, traffic-control, brake, parking, and communication controls.',
        'Remove defective equipment from service when safe movement control is uncertain.',
        'Document inspection, repair, or task-control evidence.',
      ],
      verificationEvidence: [
        'traffic route or separation photo/map',
        'backup alarm/camera/mirror/lighting check',
        'pre-use inspection or defect report',
        'repair and return-to-service record',
        'operator or pedestrian communication record',
      ],
      specificRecordHandoffHints: [
        'If the equipment is a front-end loader, haul truck, forklift, or telehandler, check specific task-mechanism records.',
      ],
      guardrails,
    },
    {
      archetypeId: 'electrical_energy_equipment',
      label: 'Electrical Energy Equipment',
      description:
        'General equipment class for panels, conductors, cabinets, controls, cords, plugs, temporary wiring, receptacles, and energized electrical work boundaries.',
      exampleEquipment: ['electrical panel', 'control cabinet', 'breaker panel', 'cord', 'plug', 'temporary wiring', 'disconnect'],
      commonComponentClasses: ['panel enclosure', 'live parts', 'cord/plug', 'breaker', 'disconnect', 'grounding/bonding', 'temporary wiring'],
      commonTasks: ['inspection', 'maintenance', 'troubleshooting', 'repair', 'startup_shutdown'],
      harmMechanisms: ['electrical_contact', 'arc_flash', 'fire_or_explosion', 'unexpected_startup'],
      likelyHazardDomains: ['electrical', 'lockout_tagout', 'fire_protection'],
      detectionSignals: {
        strong: ['exposed live parts', 'open electrical panel', 'missing dead front', 'damaged electrical cord', 'energized troubleshooting'],
        medium: ['electrical panel', 'control cabinet', 'breaker', 'cord', 'plug', 'temporary wiring', 'energized'],
        weak: ['electrical', 'power', 'wire', 'outlet', 'shock'],
      },
      evidenceQuestions: [
        'What electrical equipment or component is involved?',
        'Is the equipment energized, de-energized, verified, locked out, or being troubleshot?',
        'Are covers, blanks, dead fronts, insulation, strain relief, grounding, barriers, labels, or environmental protections missing or damaged?',
        'Who has access and is qualified electrical review required?',
        'Are wet conditions, temporary power, damaged cords, or fire/arc exposure present?',
      ],
      immediateCautions: [
        'Do not assume exposed electrical equipment is de-energized without qualified verification.',
        'Do not recommend electrical troubleshooting, repair, or contact by unqualified personnel.',
      ],
      correctiveActionThemes: [
        'Restrict access to exposed or damaged electrical equipment pending qualified review.',
        'Verify energized/de-energized status and energy-control requirements.',
        'Repair, replace, cover, guard, route, or remove damaged electrical components as applicable.',
        'Document qualified review and correction evidence.',
      ],
      verificationEvidence: [
        'photo of electrical condition before correction',
        'photo of repaired cover/barrier/cord/routing after correction',
        'qualified electrical review note',
        'lockout or energized-work control record where applicable',
        'follow-up inspection result',
      ],
      specificRecordHandoffHints: [
        'If the equipment is an electrical panel or generator temporary power, check specific task-mechanism records.',
      ],
      guardrails,
    },
    {
      archetypeId: 'elevated_work_platform',
      label: 'Elevated Work Platform',
      description:
        'General equipment class for powered elevated platforms, boom lifts, scissor lifts, baskets, and personnel-elevating equipment.',
      exampleEquipment: ['aerial lift', 'boom lift', 'scissor lift', 'man lift', 'basket', 'work platform'],
      commonComponentClasses: ['platform', 'gate', 'rails', 'anchor point', 'controls', 'outriggers', 'stabilizers'],
      commonTasks: ['normal_operation', 'inspection', 'maintenance', 'repair', 'travel_access'],
      harmMechanisms: ['fall_from_elevation', 'electrical_contact', 'crushed_by', 'struck_by', 'arc_flash'],
      likelyHazardDomains: ['fall_protection', 'mobile_equipment', 'electrical'],
      detectionSignals: {
        strong: ['aerial lift near power lines', 'lift basket gate open', 'not tied off in lift', 'boom lift on unstable ground'],
        medium: ['aerial lift', 'boom lift', 'scissor lift', 'man lift', 'lift basket', 'work platform'],
        weak: ['platform', 'basket', 'elevated work', 'tie off'],
      },
      evidenceQuestions: [
        'What type of elevated platform is involved?',
        'What task is being performed and is the employee inside, exiting, climbing, leaning, or overreaching from the platform?',
        'Are rails, gate, anchorages, fall restraint/arrest, controls, and pre-use inspection status known?',
        'Are overhead electrical hazards, slopes, soft ground, traffic, structures, or pinch/crush points present?',
      ],
      immediateCautions: [
        'Do not assume platform rails address all ejection, fall, electrical, or tipover exposure.',
        'Do not assume overhead conductors are safe or de-energized without qualified confirmation.',
      ],
      correctiveActionThemes: [
        'Review platform condition, fall-restraint expectations, operator authorization, and positioning controls.',
        'Control overhead, traffic, ground stability, and electrical approach hazards.',
        'Document pre-use inspection, task review, and correction evidence.',
      ],
      verificationEvidence: [
        'platform/gate/rail/anchor photo',
        'pre-use inspection record',
        'fall restraint verification where applicable',
        'electrical/ground condition review where applicable',
        'supervisor or qualified person signoff',
      ],
      specificRecordHandoffHints: [
        'If the equipment is an aerial lift, check aerial_lift task-mechanism records.',
        'If a telehandler is lifting personnel, check telehandler personnel platform records.',
      ],
      guardrails,
    },
    {
      archetypeId: 'temporary_access_equipment',
      label: 'Temporary Access Equipment',
      description:
        'General equipment class for ladders, temporary stairs, portable access, platforms, and task access methods used to reach elevated or lower work areas.',
      exampleEquipment: ['portable ladder', 'extension ladder', 'step ladder', 'temporary stair', 'portable platform'],
      commonComponentClasses: ['rails', 'rungs', 'feet', 'spreaders', 'securement', 'access extension', 'footing'],
      commonTasks: ['travel_access', 'inspection', 'maintenance', 'repair', 'normal_operation'],
      harmMechanisms: ['fall_from_elevation', 'fall_on_same_level', 'struck_by'],
      likelyHazardDomains: ['fall_protection', 'walking_working_surfaces'],
      detectionSignals: {
        strong: ['ladder not secured', 'wrong ladder angle', 'standing on top step', 'damaged ladder', 'missing rung'],
        medium: ['portable ladder', 'extension ladder', 'step ladder', 'ladder', 'temporary access'],
        weak: ['access', 'climb', 'rung', 'step'],
      },
      evidenceQuestions: [
        'What access equipment is being used and what task is being performed?',
        'Is the ladder or access method selected, inspected, positioned, secured, and used appropriately for the task?',
        'Are footing, angle, extension, damage, overreaching, material handling, traffic, weather, or electrical hazards present?',
        'Was the access equipment removed from service if defective?',
      ],
      immediateCautions: [
        'Do not evaluate temporary access without considering equipment condition, setup, task, and user position together.',
        'Do not leave defective access equipment available for use pending repair or review.',
      ],
      correctiveActionThemes: [
        'Stop or control use until access suitability is reviewed.',
        'Secure, reposition, repair, replace, or remove access equipment from service as needed.',
        'Use a more suitable access method where ladder/task conditions do not align.',
      ],
      verificationEvidence: [
        'photo of access setup before and after correction',
        'inspection/removal-from-service record',
        'replacement or alternative access evidence',
        'employee communication record',
        'supervisor signoff',
      ],
      specificRecordHandoffHints: [
        'If the equipment is a portable ladder, check portable_ladder task-mechanism records.',
      ],
      guardrails,
    },
    {
      archetypeId: 'excavation_ground_opening',
      label: 'Excavation / Ground Opening',
      description:
        'General equipment/work-area class for trenches, excavations, trench boxes, ground openings, spoil piles, access/egress, and collapse/fall exposures.',
      exampleEquipment: ['trench', 'excavation', 'trench box', 'shoring', 'spoil pile', 'ground opening'],
      commonComponentClasses: ['protective system', 'trench box', 'slope/bench', 'spoil pile', 'access/egress', 'edge control'],
      commonTasks: ['normal_operation', 'inspection', 'travel_access', 'maintenance'],
      harmMechanisms: ['unsupported_ground_or_collapse', 'crushed_by', 'falling_material', 'fall_from_elevation', 'struck_by'],
      likelyHazardDomains: ['excavation_trenching', 'ground_control', 'traffic_control', 'fall_protection'],
      detectionSignals: {
        strong: ['worker in trench', 'trench without protective system', 'spoil pile near trench', 'trench collapse', 'no ladder in trench'],
        medium: ['excavation', 'trench', 'trench box', 'protective system', 'spoil pile', 'competent person'],
        weak: ['hole', 'edge', 'digging', 'soil', 'ground opening'],
      },
      evidenceQuestions: [
        'Are employees inside the excavation or exposed at the edge?',
        'What are the depth, soil/water conditions, protective system, spoil/surcharge, and access/egress conditions?',
        'Has a competent/qualified person evaluated conditions and changing hazards?',
        'Are vehicles, equipment, materials, traffic, weather, utilities, vibration, or water affecting stability?',
      ],
      immediateCautions: [
        'Do not infer excavation safety without depth, soil, protective-system, access/egress, and competent-person information.',
        'Do not treat protective-system presence alone as adequate if surcharge, access, or changing conditions are uncontrolled.',
      ],
      correctiveActionThemes: [
        'Restrict entry pending competent/qualified review when protective-system adequacy is unclear.',
        'Control spoil, surcharge, access/egress, edge fall exposure, and nearby equipment/traffic.',
        'Document inspection and protective-system verification evidence.',
      ],
      verificationEvidence: [
        'photo of excavation/protective system/access condition',
        'competent/qualified person inspection record',
        'protective system documentation',
        'spoil/surcharge/access correction evidence',
        'follow-up inspection result',
      ],
      specificRecordHandoffHints: [
        'If a trench box or trench protective-system issue is described, check excavation_trench_box task-mechanism records.',
      ],
      guardrails,
    },
  ],
};
