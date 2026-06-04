import { SafeScopeEquipmentTaskMechanismRecord } from './equipment-task-mechanism.types';

export const SAFESCOPE_EQUIPMENT_TASK_MECHANISM_REGISTRY: SafeScopeEquipmentTaskMechanismRecord[] = [
  {
    equipmentId: 'conveyor',
    equipmentLabel: 'Conveyor',
    equipmentGroup: 'aggregate_facility_equipment',
    components: [
      {
        componentId: 'tail_pulley',
        label: 'Tail Pulley',
        aliases: ['tail pulley', 'conveyor tail pulley', 'tail drum', 'tail roller'],
        normalFunction:
          'Returns and redirects the conveyor belt at the tail end of the conveyor and creates rotating belt/pulley motion.',
        hazardousEnergyOrMotion: [
          'rotating pulley',
          'moving belt',
          'nip point between belt and pulley',
          'stored or residual energy during maintenance',
          'material movement near return point',
        ],
        commonTasks: ['normal_operation', 'inspection', 'cleanup', 'maintenance', 'repair', 'startup_shutdown'],
        failureModes: [
          {
            failureModeId: 'missing_tail_pulley_guard',
            label: 'Missing Tail Pulley Guard',
            description:
              'A guard is missing, removed, damaged, or ineffective at a conveyor tail pulley where employees may access rotating parts or nip points.',
            likelyTaskContexts: ['normal_operation', 'inspection', 'cleanup', 'maintenance'],
            harmMechanisms: [
              'caught_in_or_between',
              'entanglement',
              'crushed_by',
              'unexpected_startup',
              'falling_material',
            ],
            likelyHazardDomains: ['machine_guarding', 'lockout_tagout', 'material_handling'],
            evidenceQuestions: [
              'Is the conveyor running, stopped, locked out, or being restarted?',
              'Can employees access the tail pulley during operation, cleanup, inspection, or maintenance?',
              'Is the guard missing, damaged, removed, loose, bypassed, or not covering the nip point?',
              'Is there material buildup around the tail pulley that requires cleanup?',
              'Are employees exposed to falling, spilled, or ejected material near the pulley?',
              'Was hazardous energy controlled and verified before any cleanup or maintenance task?',
            ],
            immediateCautions: [
              'Do not assume a stopped conveyor is safe without energy-control verification when maintenance or cleanup is involved.',
              'Do not treat a barricade or warning sign as equivalent to a physical guard when employees can access rotating parts.',
              'Do not close the finding without objective evidence that guarding and task exposure were corrected or reviewed.',
            ],
            correctiveActionThemes: [
              'Restrict access to the exposed rotating parts until a qualified person evaluates the condition.',
              'Repair, replace, or install effective guarding for the tail pulley and nip point.',
              'Remove material buildup using a safe method appropriate to the conveyor energy state and task.',
              'Verify hazardous energy control when cleanup, maintenance, repair, or adjustment is performed.',
              'Document before-and-after photos and qualified review before closure.',
            ],
            verificationEvidence: [
              'photo of missing/damaged guard before correction',
              'photo of installed/repaired guard after correction',
              'lockout or energy-control verification record if cleanup or maintenance occurred',
              'qualified person or supervisor signoff',
              'follow-up inspection result',
            ],
            conflictNotes: [
              'If the observation focuses on rotating belt/pulley exposure, machine_guarding is usually primary.',
              'If the observation focuses on cleanup or maintenance with startup/energy concerns, lockout_tagout may also be significant.',
              'If the observation focuses on falling/spilled material rather than moving parts, material_handling may be relevant.',
            ],
          },
          {
            failureModeId: 'tail_pulley_cleanup_without_energy_control',
            label: 'Tail Pulley Cleanup Without Energy-Control Clarity',
            description:
              'Employees are cleaning material near a conveyor tail pulley without clear confirmation that hazardous energy has been controlled.',
            likelyTaskContexts: ['cleanup', 'maintenance'],
            harmMechanisms: ['caught_in_or_between', 'entanglement', 'unexpected_startup', 'stored_energy_release'],
            likelyHazardDomains: ['lockout_tagout', 'machine_guarding'],
            evidenceQuestions: [
              'What cleanup task was being performed and where were employees positioned?',
              'Was the conveyor locked out, tagged out, blocked, or otherwise verified against startup?',
              'Were employees using tools, shovels, hands, or equipment near the tail pulley or belt?',
              'Was the conveyor capable of starting automatically, remotely, or by another employee?',
            ],
            immediateCautions: [
              'Do not recommend manual cleanup near conveyor moving parts without clarifying energy-control status.',
              'Do not assume cleanup is routine if employees can enter the danger zone near moving parts.',
            ],
            correctiveActionThemes: [
              'Clarify and verify hazardous energy control before cleanup near conveyor components.',
              'Review cleanup method, tools, access, guarding, and restart controls.',
              'Use objective evidence before closing the corrective action.',
            ],
            verificationEvidence: [
              'cleanup procedure or instruction',
              'lockout verification record',
              'photo of cleaned area and guarded pulley',
              'supervisor or qualified review signoff',
            ],
            conflictNotes: [
              'This failure mode may classify as lockout_tagout even though conveyor guarding remains relevant.',
              'Machine_guarding remains a related domain if physical access to moving parts exists.',
            ],
          },
        ],
      },
      {
        componentId: 'head_pulley',
        label: 'Head Pulley / Drive Pulley',
        aliases: ['head pulley', 'drive pulley', 'conveyor drive pulley', 'head drum'],
        normalFunction:
          'Drives or redirects conveyor belt motion at the discharge end and may create nip points, rotating shaft exposure, and material discharge hazards.',
        hazardousEnergyOrMotion: [
          'rotating pulley',
          'moving belt',
          'drive shaft motion',
          'nip point',
          'material discharge',
          'unexpected startup',
        ],
        commonTasks: ['normal_operation', 'inspection', 'cleanup', 'maintenance', 'repair'],
        failureModes: [
          {
            failureModeId: 'unguarded_head_pulley_or_drive',
            label: 'Unguarded Head Pulley or Conveyor Drive',
            description:
              'A head pulley, drive pulley, drive shaft, or belt drive is accessible without effective guarding.',
            likelyTaskContexts: ['normal_operation', 'inspection', 'cleanup', 'maintenance'],
            harmMechanisms: ['caught_in_or_between', 'entanglement', 'crushed_by', 'unexpected_startup'],
            likelyHazardDomains: ['machine_guarding', 'lockout_tagout'],
            evidenceQuestions: [
              'Can employees access the head pulley, drive pulley, belt drive, shaft, or nip point?',
              'Is the conveyor running or capable of unexpected startup?',
              'Is the guard present, secure, and covering the hazardous motion?',
              'Are employees performing inspection, cleanup, adjustment, or maintenance nearby?',
            ],
            immediateCautions: [
              'Treat accessible rotating drive components as high concern until reviewed.',
              'Clarify energy-control status before any maintenance, adjustment, or cleanup occurs.',
            ],
            correctiveActionThemes: [
              'Restrict access pending review.',
              'Repair, replace, or install effective guarding.',
              'Verify energy control for maintenance or cleanup.',
              'Document before-and-after correction evidence.',
            ],
            verificationEvidence: [
              'drive guarding photo before and after',
              'energy-control verification if maintenance occurred',
              'qualified review signoff',
              'follow-up inspection note',
            ],
            conflictNotes: [
              'Machine_guarding is usually primary when the observation centers on accessible drive components.',
              'LOTO becomes primary or co-primary when the task is maintenance, adjustment, or cleanup.',
            ],
          },
        ],
      },
    ],
    guardrails: {
      contextOnly: true,
      doesNotDeclareViolation: true,
      doesNotCreateCitation: true,
      doesNotOverrideRegulation: true,
      requiresQualifiedReview: true,
    },
  },
  {
    equipmentId: 'front_end_loader',
    equipmentLabel: 'Front-End Loader',
    equipmentGroup: 'mobile_equipment',
    components: [
      {
        componentId: 'operator_visibility',
        label: 'Operator Visibility / Blind Spot Controls',
        aliases: ['front end loader', 'front-end loader', 'loader', 'wheel loader', 'loader blind spot', 'loader visibility'],
        normalFunction:
          'Allows the operator to control mobile equipment while maintaining awareness of pedestrians, vehicles, ground workers, and fixed objects around the loader.',
        hazardousEnergyOrMotion: [
          'mobile equipment travel',
          'backing movement',
          'limited visibility',
          'pedestrian interaction',
          'traffic interaction',
        ],
        commonTasks: ['normal_operation', 'inspection', 'material_handling', 'travel_access'],
        failureModes: [
          {
            failureModeId: 'loader_pedestrian_blind_spot_no_controls',
            label: 'Loader Pedestrian Blind-Spot Exposure Without Controls',
            description:
              'A front-end loader operates, backs, turns, or travels near pedestrians without clear separation, spotter control, traffic control, or operator visibility controls.',
            likelyTaskContexts: ['normal_operation', 'material_handling', 'travel_access', 'inspection'],
            harmMechanisms: ['struck_by', 'crushed_by', 'traffic_interaction'],
            likelyHazardDomains: ['mobile_equipment', 'traffic_control', 'powered_haulage'],
            evidenceQuestions: [
              'Where were pedestrians or ground workers positioned relative to the loader travel path?',
              'Was the loader backing, turning, loading, dumping, or traveling through a shared work area?',
              'Were spotters, barricades, traffic rules, communication methods, mirrors, cameras, alarms, or pedestrian exclusion zones in use?',
              'Could the operator reasonably see the exposed person from the cab?',
              'Was this an active mine haulage or plant traffic area?',
            ],
            immediateCautions: [
              'Do not assume a spotter was effective without confirming position, communication, visibility, and task control.',
              'Do not treat a general warning as adequate separation when pedestrians remain in the loader travel path.',
              'Do not close the issue without objective evidence that pedestrian/mobile-equipment interaction was controlled.',
            ],
            correctiveActionThemes: [
              'Separate pedestrians from loader travel paths where feasible.',
              'Clarify traffic rules, pedestrian exclusion zones, communication methods, and spotter expectations.',
              'Verify backup alarms, cameras, mirrors, lighting, and other visibility aids where applicable.',
              'Review the task with the operator and affected employees before resuming similar work.',
            ],
            verificationEvidence: [
              'photo or map of corrected pedestrian/equipment separation',
              'spotter or traffic-control plan documentation',
              'backup alarm/camera/mirror inspection evidence where applicable',
              'operator and pedestrian communication review',
              'supervisor or qualified person signoff',
            ],
            conflictNotes: [
              'Mobile_equipment is usually primary when loader operation and operator visibility are central.',
              'Traffic_control becomes significant when the condition involves pedestrian routes, crossings, barricades, signs, or shared travelways.',
              'Powered_haulage may be relevant in active mine haulage or aggregate plant traffic contexts.',
            ],
          },
        ],
      },
      {
        componentId: 'bucket_attachment',
        label: 'Bucket / Raised Attachment',
        aliases: ['loader bucket', 'raised bucket', 'front end loader bucket', 'loader attachment', 'raised attachment'],
        normalFunction:
          'Lifts, carries, dumps, and positions material using hydraulic lift arms and bucket or attachment systems.',
        hazardousEnergyOrMotion: [
          'raised load',
          'gravity energy',
          'hydraulic energy',
          'pinch points',
          'unexpected movement',
        ],
        commonTasks: ['normal_operation', 'maintenance', 'repair', 'inspection', 'material_handling'],
        failureModes: [
          {
            failureModeId: 'working_under_raised_loader_bucket_without_support',
            label: 'Working Under Raised Loader Bucket Without Support Clarity',
            description:
              'Employees are exposed beneath or near a raised loader bucket, lift arm, or attachment without clear support, blocking, or hydraulic/gravity energy control.',
            likelyTaskContexts: ['maintenance', 'repair', 'inspection'],
            harmMechanisms: ['crushed_by', 'stored_energy_release', 'struck_by'],
            likelyHazardDomains: ['lockout_tagout', 'mobile_equipment', 'material_handling'],
            evidenceQuestions: [
              'Was any employee positioned under or within the fall/crush zone of the raised bucket or lift arms?',
              'Was the bucket mechanically supported, blocked, lowered, pinned, or otherwise secured?',
              'Was hydraulic, gravity, or stored energy controlled and verified?',
              'Was the task inspection, maintenance, repair, adjustment, or troubleshooting?',
              'Was the equipment attended, parked, and secured against movement?',
            ],
            immediateCautions: [
              'Do not assume hydraulics alone provide safe support for a raised attachment.',
              'Do not recommend work under a raised bucket without confirming blocking/support and energy control.',
              'Treat unclear support or energy-control status as a qualified-review issue.',
            ],
            correctiveActionThemes: [
              'Lower the bucket/attachment or secure it with appropriate support before work in the danger zone.',
              'Verify hydraulic, gravity, and equipment movement controls for maintenance or repair tasks.',
              'Restrict access beneath raised attachments until reviewed.',
              'Document the safe support method and follow-up inspection evidence.',
            ],
            verificationEvidence: [
              'photo of bucket lowered or properly supported',
              'blocking/support verification',
              'energy-control or maintenance work record',
              'qualified mechanic/supervisor signoff',
              'follow-up inspection note',
            ],
            conflictNotes: [
              'Lockout_tagout may be primary when employees perform service or maintenance under raised components.',
              'Mobile_equipment remains relevant because the exposure is tied to loader configuration and movement.',
              'Material_handling may be relevant when the bucket is carrying or dumping material.',
            ],
          },
        ],
      },
      {
        componentId: 'braking_parking_controls',
        label: 'Brakes / Parking Controls',
        aliases: ['loader brakes', 'parking brake', 'service brake', 'brake defect', 'loader parked on grade', 'wheel chocks'],
        normalFunction:
          'Controls loader stopping, parking, and movement prevention during operation, parking, inspection, and maintenance.',
        hazardousEnergyOrMotion: [
          'uncontrolled movement',
          'rolling equipment',
          'mobile equipment travel',
          'stored mechanical energy',
        ],
        commonTasks: ['normal_operation', 'inspection', 'maintenance', 'startup_shutdown', 'travel_access'],
        failureModes: [
          {
            failureModeId: 'loader_brake_or_parking_control_defect_used',
            label: 'Loader Brake or Parking-Control Defect Used Before Correction',
            description:
              'A front-end loader is operated or left in service after a brake, parking brake, chocking, or movement-control concern is identified but not clearly corrected.',
            likelyTaskContexts: ['inspection', 'normal_operation', 'maintenance'],
            harmMechanisms: ['struck_by', 'crushed_by', 'traffic_interaction'],
            likelyHazardDomains: ['mobile_equipment', 'powered_haulage'],
            evidenceQuestions: [
              'What brake, parking brake, chock, grade, or movement-control condition was observed?',
              'Was the condition found during a pre-use inspection, operator report, maintenance check, or incident review?',
              'Was the loader operated, parked, or left unattended after the concern was identified?',
              'Was the equipment removed from service, repaired, tested, and documented before reuse?',
            ],
            immediateCautions: [
              'Do not assume a brake or parking-control concern is minor without confirming operating conditions and grade exposure.',
              'Do not close the condition without repair/test evidence or qualified review.',
            ],
            correctiveActionThemes: [
              'Remove affected equipment from service pending qualified evaluation when safe movement control is uncertain.',
              'Repair and function-test braking/parking controls before returning equipment to use.',
              'Document pre-use inspection findings, repair records, and return-to-service approval.',
            ],
            verificationEvidence: [
              'pre-use inspection or defect report',
              'maintenance repair record',
              'brake/parking control function test',
              'return-to-service approval',
              'photo or note confirming chocking/parking control where applicable',
            ],
            conflictNotes: [
              'Mobile_equipment is primary for loader braking and parking-control issues.',
              'Powered_haulage may be relevant in mine haulage routes, grades, dump areas, or plant traffic settings.',
            ],
          },
        ],
      },
    ],
    guardrails: {
      contextOnly: true,
      doesNotDeclareViolation: true,
      doesNotCreateCitation: true,
      doesNotOverrideRegulation: true,
      requiresQualifiedReview: true,
    },
  },
  {
    equipmentId: 'haul_truck',
    equipmentLabel: 'Haul Truck',
    equipmentGroup: 'mobile_equipment',
    components: [
      {
        componentId: 'dump_body_dump_point',
        label: 'Dump Body / Dump Point Controls',
        aliases: ['haul truck', 'dump truck', 'haul truck dumping', 'dump point', 'stockpile dump', 'berm', 'dump berm'],
        normalFunction:
          'Transports and dumps material at stockpiles, crushers, dumps, pits, or designated dumping locations.',
        hazardousEnergyOrMotion: [
          'mobile equipment travel',
          'backing movement',
          'dump body movement',
          'edge exposure',
          'material movement',
        ],
        commonTasks: ['normal_operation', 'material_handling', 'travel_access', 'inspection'],
        failureModes: [
          {
            failureModeId: 'haul_truck_dumping_near_inadequate_berm_or_edge',
            label: 'Haul Truck Dumping Near Inadequate Berm or Edge Control',
            description:
              'A haul truck dumps, backs, or positions near a stockpile, dump point, elevated edge, or drop-off where berm/edge control adequacy is unclear.',
            likelyTaskContexts: ['normal_operation', 'material_handling'],
            harmMechanisms: ['crushed_by', 'struck_by', 'traffic_interaction', 'falling_material'],
            likelyHazardDomains: ['powered_haulage', 'mobile_equipment', 'ground_control'],
            evidenceQuestions: [
              'Where was the haul truck positioned relative to the dump edge, stockpile edge, or drop-off?',
              'Was a berm, bumper block, stop log, spotter, dumping procedure, or other edge control present?',
              'Was the truck backing, dumping, turning, or waiting in the dump area?',
              'Were ground conditions, edge stability, visibility, lighting, grade, or traffic congestion concerns present?',
              'Was this a mine, quarry, aggregate plant, or construction material-handling setting?',
            ],
            immediateCautions: [
              'Do not assess dump-point risk from the berm presence alone; position, height, material stability, and task control matter.',
              'Do not infer adequacy without field verification by a qualified person.',
              'Do not close the issue without objective correction and review evidence.',
            ],
            correctiveActionThemes: [
              'Restrict or control dumping at the affected location pending qualified review.',
              'Evaluate berm/edge controls, dumping procedures, traffic flow, lighting, and ground conditions.',
              'Correct dump-point controls before resuming similar dumping activity.',
              'Document before-and-after dump-point conditions.',
            ],
            verificationEvidence: [
              'photo of dump point before and after correction',
              'berm/edge control inspection notes',
              'traffic or dumping procedure review',
              'operator communication or briefing record',
              'qualified person signoff',
            ],
            conflictNotes: [
              'Powered_haulage is usually primary for haul truck dumping and dump-point controls.',
              'Ground_control may be relevant if edge stability, stockpile failure, or ground conditions are central.',
              'Mobile_equipment remains relevant for truck movement, backing, visibility, and operator controls.',
            ],
          },
        ],
      },
      {
        componentId: 'backup_warning_visibility',
        label: 'Backup Warning / Visibility Controls',
        aliases: ['backup alarm', 'reverse alarm', 'backing haul truck', 'haul truck backing', 'camera', 'spotter'],
        normalFunction:
          'Supports safe backing and travel by warning nearby workers and helping the operator identify people, equipment, and obstacles.',
        hazardousEnergyOrMotion: [
          'backing movement',
          'limited visibility',
          'traffic interaction',
          'pedestrian interaction',
          'mobile equipment travel',
        ],
        commonTasks: ['normal_operation', 'inspection', 'travel_access'],
        failureModes: [
          {
            failureModeId: 'haul_truck_backing_alarm_or_visibility_control_defect',
            label: 'Haul Truck Backing Alarm or Visibility-Control Defect',
            description:
              'A haul truck is backing or traveling where backup alarm, camera, mirror, spotter, lighting, or visibility controls are defective, unclear, or not effectively used.',
            likelyTaskContexts: ['normal_operation', 'inspection', 'travel_access'],
            harmMechanisms: ['struck_by', 'crushed_by', 'traffic_interaction'],
            likelyHazardDomains: ['powered_haulage', 'mobile_equipment', 'traffic_control'],
            evidenceQuestions: [
              'Was the truck backing, turning, dumping, or traveling near people or other equipment?',
              'Was the backup alarm audible and functioning in the work environment?',
              'Were cameras, mirrors, lighting, horn use, radio communication, or spotters available and effective?',
              'Were pedestrians or light vehicles separated from the haul truck path?',
            ],
            immediateCautions: [
              'Do not treat a backup alarm as the only control where pedestrians remain exposed.',
              'Do not assume visibility controls are effective without considering noise, lighting, blind spots, and traffic flow.',
            ],
            correctiveActionThemes: [
              'Verify and repair backup alarms, cameras, mirrors, lights, and communication controls as applicable.',
              'Control pedestrian and light-vehicle exposure in haul truck travel paths.',
              'Review traffic control, spotter use, and backing procedures.',
            ],
            verificationEvidence: [
              'backup alarm or camera function check',
              'photo/video of corrected visibility equipment where applicable',
              'traffic control or spotter procedure record',
              'operator briefing or retraining record',
              'supervisor signoff',
            ],
            conflictNotes: [
              'Powered_haulage is primary in mine haulage settings.',
              'Traffic_control becomes significant when the exposure involves routes, crossings, light vehicles, or pedestrians.',
              'Mobile_equipment remains relevant for equipment condition and operator visibility.',
            ],
          },
        ],
      },
    ],
    guardrails: {
      contextOnly: true,
      doesNotDeclareViolation: true,
      doesNotCreateCitation: true,
      doesNotOverrideRegulation: true,
      requiresQualifiedReview: true,
    },
  },
  {
    equipmentId: 'forklift',
    equipmentLabel: 'Forklift',
    equipmentGroup: 'material_handling_equipment',
    components: [
      {
        componentId: 'forks_load_stability',
        label: 'Forks / Load Stability',
        aliases: ['forklift', 'fork truck', 'forks', 'forklift load', 'elevated load', 'unstable load'],
        normalFunction:
          'Lifts, carries, positions, stacks, and lowers loads using forks, mast, carriage, and hydraulic systems.',
        hazardousEnergyOrMotion: [
          'elevated load',
          'falling material',
          'tipover potential',
          'mobile equipment travel',
          'pinch points',
        ],
        commonTasks: ['normal_operation', 'material_handling', 'inspection', 'travel_access'],
        failureModes: [
          {
            failureModeId: 'forklift_unstable_or_elevated_load_travel',
            label: 'Forklift Unstable or Elevated Load Travel',
            description:
              'A forklift travels, turns, lifts, or positions a load that is elevated, unstable, unsecured, obstructing visibility, or exposing people to falling/struck-by hazards.',
            likelyTaskContexts: ['normal_operation', 'material_handling'],
            harmMechanisms: ['struck_by', 'crushed_by', 'falling_material', 'traffic_interaction'],
            likelyHazardDomains: ['material_handling', 'mobile_equipment', 'traffic_control'],
            evidenceQuestions: [
              'Was the forklift traveling, turning, raising, lowering, stacking, or positioning the load?',
              'Was the load elevated, unstable, damaged, unsecured, over capacity, or blocking operator visibility?',
              'Were pedestrians or other workers within the fall zone or travel path?',
              'Were floor/ground conditions, grade, speed, turning radius, or load weight known?',
            ],
            immediateCautions: [
              'Do not focus only on the forklift; load stability, visibility, pedestrian exposure, and travel path are part of the mechanism.',
              'Do not assume training alone corrects an unstable-load exposure without task and load-control verification.',
            ],
            correctiveActionThemes: [
              'Stabilize, lower, secure, or reconfigure the load before travel where needed.',
              'Control pedestrian access to the travel path and fall zone.',
              'Review load handling, capacity, visibility, speed, and route conditions.',
              'Document corrected load handling and employee communication.',
            ],
            verificationEvidence: [
              'photo of corrected load position/security',
              'operator inspection or load assessment notes',
              'pedestrian separation or traffic-control evidence',
              'supervisor observation/signoff',
              'follow-up inspection result',
            ],
            conflictNotes: [
              'Material_handling is usually primary when load condition and movement are central.',
              'Mobile_equipment remains relevant because the forklift is powered equipment.',
              'Traffic_control is relevant when pedestrian routes, crossings, or shared travel paths are involved.',
            ],
          },
        ],
      },
      {
        componentId: 'seatbelt_operator_restraint',
        label: 'Seatbelt / Operator Restraint',
        aliases: ['forklift seatbelt', 'operator restraint', 'seat belt', 'tipover restraint', 'forklift operator restraint'],
        normalFunction:
          'Restrains the operator during operation and tipover events as part of safe powered industrial truck use.',
        hazardousEnergyOrMotion: [
          'tipover potential',
          'operator ejection',
          'mobile equipment travel',
          'sudden stop or impact',
        ],
        commonTasks: ['normal_operation', 'inspection', 'travel_access'],
        failureModes: [
          {
            failureModeId: 'forklift_seatbelt_or_operator_restraint_not_used_or_defective',
            label: 'Forklift Seatbelt or Operator-Restraint Concern',
            description:
              'A forklift is operated with seatbelt/operator-restraint use unclear, not used, damaged, removed, defective, or not verified.',
            likelyTaskContexts: ['normal_operation', 'inspection'],
            harmMechanisms: ['crushed_by', 'struck_by', 'traffic_interaction'],
            likelyHazardDomains: ['mobile_equipment', 'material_handling'],
            evidenceQuestions: [
              'Was the forklift being operated, traveling, turning, loading, or unloading?',
              'Was the operator restraint present, functional, and used?',
              'Was a defect documented during pre-use inspection or reported by the operator?',
              'Were speed, grade, turning, ramp, dock, or tipover conditions involved?',
            ],
            immediateCautions: [
              'Do not close a restraint concern without confirming condition, use, and inspection history.',
              'Do not treat operator behavior separately from equipment condition and operating context.',
            ],
            correctiveActionThemes: [
              'Verify operator restraint condition and use expectations.',
              'Remove equipment from service if restraint condition is defective until repaired or reviewed.',
              'Review pre-use inspection, operator instruction, and supervision where applicable.',
            ],
            verificationEvidence: [
              'photo or inspection note confirming restraint condition',
              'pre-use inspection record',
              'repair record if defective',
              'operator/supervisor review signoff',
            ],
            conflictNotes: [
              'Mobile_equipment is usually primary for operator-restraint concerns.',
              'Material_handling may be relevant when the exposure occurs during loading, unloading, stacking, or travel with loads.',
            ],
          },
        ],
      },
      {
        componentId: 'pedestrian_interaction',
        label: 'Pedestrian Interaction / Traffic Separation',
        aliases: ['forklift traffic', 'forklift pedestrian', 'warehouse traffic', 'pedestrian walkway', 'forklift crossing'],
        normalFunction:
          'Controls interactions between forklift routes, pedestrian walkways, loading areas, docks, aisles, and shared traffic zones.',
        hazardousEnergyOrMotion: [
          'traffic interaction',
          'mobile equipment travel',
          'limited visibility',
          'pedestrian exposure',
        ],
        commonTasks: ['normal_operation', 'material_handling', 'travel_access', 'inspection'],
        failureModes: [
          {
            failureModeId: 'forklift_pedestrian_separation_gap',
            label: 'Forklift Pedestrian Separation Gap',
            description:
              'Forklift traffic interacts with pedestrians at walkways, aisles, docks, crossings, doors, or shared work areas without clear separation or traffic controls.',
            likelyTaskContexts: ['normal_operation', 'material_handling', 'travel_access'],
            harmMechanisms: ['struck_by', 'crushed_by', 'traffic_interaction'],
            likelyHazardDomains: ['traffic_control', 'mobile_equipment', 'material_handling'],
            evidenceQuestions: [
              'Where do pedestrians cross or share space with forklift traffic?',
              'Are signs, floor markings, barriers, mirrors, lights, gates, horns, or right-of-way rules present and followed?',
              'Were visibility restrictions, blind corners, doorways, docks, racks, or aisle congestion involved?',
              'Were pedestrians expected to enter the forklift operating zone for normal work?',
            ],
            immediateCautions: [
              'Do not assume painted lines alone control exposure if forklifts and pedestrians still conflict.',
              'Do not close without verifying traffic-control effectiveness in actual work conditions.',
            ],
            correctiveActionThemes: [
              'Separate pedestrian routes from forklift travel where feasible.',
              'Improve crossings, barriers, signs, mirrors, lighting, speed controls, or right-of-way rules.',
              'Review site-specific traffic patterns and employee communication.',
            ],
            verificationEvidence: [
              'photo/map of corrected pedestrian route or traffic control',
              'signage/barrier/floor-marking evidence',
              'traffic pattern review',
              'employee communication or training record',
              'supervisor signoff',
            ],
            conflictNotes: [
              'Traffic_control is usually primary when routes, crossings, and pedestrian separation are central.',
              'Mobile_equipment and material_handling remain related domains due to forklift operation and load movement.',
            ],
          },
        ],
      },
    ],
    guardrails: {
      contextOnly: true,
      doesNotDeclareViolation: true,
      doesNotCreateCitation: true,
      doesNotOverrideRegulation: true,
      requiresQualifiedReview: true,
    },
  }
,
  {
    equipmentId: 'crusher',
    equipmentLabel: 'Crusher',
    equipmentGroup: 'aggregate_facility_equipment',
    components: [
      {
        componentId: 'crusher_drive_guarding',
        label: 'Crusher Drive / Belt Guarding',
        aliases: ['crusher', 'crusher drive', 'crusher belt drive', 'crusher guard', 'jaw crusher', 'cone crusher', 'impact crusher'],
        normalFunction:
          'Crushes material using powered rotating, compressing, or impacting components driven by belts, pulleys, motors, and shafts.',
        hazardousEnergyOrMotion: [
          'rotating drive components',
          'belt and pulley motion',
          'nip points',
          'crushing motion',
          'unexpected startup',
        ],
        commonTasks: ['normal_operation', 'inspection', 'cleanup', 'maintenance', 'repair', 'jam_clearing'],
        failureModes: [
          {
            failureModeId: 'crusher_drive_guard_removed_or_exposed',
            label: 'Crusher Drive Guard Removed or Exposed',
            description:
              'A crusher drive, belt, pulley, shaft, coupling, or other moving component is accessible because guarding is missing, removed, damaged, or ineffective.',
            likelyTaskContexts: ['normal_operation', 'inspection', 'cleanup', 'maintenance'],
            harmMechanisms: ['caught_in_or_between', 'entanglement', 'crushed_by', 'unexpected_startup'],
            likelyHazardDomains: ['machine_guarding', 'lockout_tagout'],
            evidenceQuestions: [
              'Which crusher drive, belt, pulley, shaft, coupling, or moving part is exposed?',
              'Can employees access the moving component during operation, inspection, cleanup, or maintenance?',
              'Is the guard missing, removed, damaged, unsecured, bypassed, or not covering the hazard?',
              'Was the crusher running, stopped, locked out, or capable of startup?',
              'Were employees clearing material, inspecting, adjusting, or maintaining the crusher nearby?',
            ],
            immediateCautions: [
              'Do not assume a stopped crusher is safe without verifying energy-control status for maintenance, cleanup, or jam clearing.',
              'Do not treat warning signs or informal barricades as equivalent to effective guarding where access remains possible.',
            ],
            correctiveActionThemes: [
              'Restrict access to exposed moving components pending qualified review.',
              'Repair, replace, or install effective guarding for exposed drive components.',
              'Verify hazardous energy control for cleanup, jam clearing, maintenance, repair, or adjustment tasks.',
              'Document before-and-after guarding evidence and qualified review.',
            ],
            verificationEvidence: [
              'photo of exposed crusher drive before correction',
              'photo of repaired or installed guard after correction',
              'energy-control record if cleanup, maintenance, repair, or jam clearing occurred',
              'qualified person or supervisor signoff',
              'follow-up inspection result',
            ],
            conflictNotes: [
              'Machine_guarding is usually primary when the observation centers on exposed moving crusher components.',
              'Lockout_tagout becomes primary or co-primary when employees perform cleanup, jam clearing, adjustment, maintenance, or repair.',
            ],
          },
          {
            failureModeId: 'crusher_jam_clearing_without_energy_control_clarity',
            label: 'Crusher Jam Clearing Without Energy-Control Clarity',
            description:
              'Employees clear, probe, dislodge, or work near jammed crusher material without clear confirmation that hazardous energy and stored material energy are controlled.',
            likelyTaskContexts: ['jam_clearing', 'cleanup', 'maintenance', 'repair'],
            harmMechanisms: ['crushed_by', 'caught_in_or_between', 'stored_energy_release', 'unexpected_startup', 'falling_material'],
            likelyHazardDomains: ['lockout_tagout', 'machine_guarding', 'material_handling'],
            evidenceQuestions: [
              'What jam, blockage, bridging, or plugged-material condition was present?',
              'Where were employees positioned relative to the crusher opening, discharge, belts, or moving parts?',
              'Was the crusher locked out, blocked, de-energized, and verified against startup or stored energy release?',
              'Were tools, bars, equipment, hands, or remote controls used to clear the jam?',
              'Was falling, sliding, or ejected material possible during clearing?',
            ],
            immediateCautions: [
              'Do not recommend jam clearing until energy-control and material-release hazards are clarified.',
              'Do not assume material blockage is stable or that equipment cannot move because it appears stopped.',
            ],
            correctiveActionThemes: [
              'Control hazardous energy and material-release exposure before jam clearing.',
              'Review the jam-clearing method, access, tools, communication, and restart controls.',
              'Restrict employees from danger zones until a qualified review is complete.',
              'Document the safe clearing method and objective verification evidence.',
            ],
            verificationEvidence: [
              'lockout or energy-control verification record',
              'photo or note showing jam condition and corrected condition',
              'jam-clearing procedure or task plan',
              'supervisor or qualified person signoff',
              'restart authorization or follow-up inspection evidence',
            ],
            conflictNotes: [
              'Lockout_tagout is usually primary when jam clearing involves potential startup or stored energy.',
              'Material_handling may be relevant when falling, sliding, bridging, or ejected material is central.',
              'Machine_guarding remains relevant if employees can access moving parts during or after clearing.',
            ],
          },
        ],
      },
    ],
    guardrails: {
      contextOnly: true,
      doesNotDeclareViolation: true,
      doesNotCreateCitation: true,
      doesNotOverrideRegulation: true,
      requiresQualifiedReview: true,
    },
  },
  {
    equipmentId: 'screen_plant',
    equipmentLabel: 'Screen Plant',
    equipmentGroup: 'aggregate_facility_equipment',
    components: [
      {
        componentId: 'screen_drive_and_deck_access',
        label: 'Screen Drive / Deck Access',
        aliases: ['screen plant', 'screen deck', 'screen drive', 'screen belt', 'vibrating screen', 'screening plant'],
        normalFunction:
          'Screens and separates material using vibrating decks, drive systems, belts, springs, guarding, walkways, and access platforms.',
        hazardousEnergyOrMotion: [
          'vibrating motion',
          'rotating drive components',
          'moving belts',
          'fall exposure',
          'unexpected startup',
          'falling material',
        ],
        commonTasks: ['normal_operation', 'inspection', 'cleanup', 'maintenance', 'repair', 'jam_clearing'],
        failureModes: [
          {
            failureModeId: 'screen_drive_guarding_or_access_exposure',
            label: 'Screen Drive Guarding or Access Exposure',
            description:
              'A screen drive, belt, pulley, shaft, vibrating component, or screen-deck access area exposes employees to moving parts, fall exposure, or falling material.',
            likelyTaskContexts: ['normal_operation', 'inspection', 'cleanup', 'maintenance'],
            harmMechanisms: ['caught_in_or_between', 'entanglement', 'fall_from_elevation', 'falling_material', 'unexpected_startup'],
            likelyHazardDomains: ['machine_guarding', 'fall_protection', 'lockout_tagout', 'material_handling'],
            evidenceQuestions: [
              'Which screen component or access point creates the exposure?',
              'Is the exposure related to the drive, belt, pulley, vibrating deck, access platform, or walkway?',
              'Can employees reach moving or vibrating parts during operation or inspection?',
              'Are employees exposed to falls from platforms, ladders, walkways, or screen-deck access points?',
              'Was the screen running, stopped, locked out, or being restarted?',
            ],
            immediateCautions: [
              'Do not treat screen-deck access as only a fall issue if moving parts or startup are also present.',
              'Do not assume access is safe without evaluating guarding, fall exposure, and energy-control status together.',
            ],
            correctiveActionThemes: [
              'Restrict exposed screen access pending qualified review.',
              'Repair or install guarding for screen drive and moving components.',
              'Correct fall exposures at platforms, walkways, ladders, or access points.',
              'Verify energy control for maintenance, repair, cleanup, or jam-clearing tasks.',
            ],
            verificationEvidence: [
              'photo of screen drive/deck/access condition before correction',
              'photo of guarding, access, or fall-protection correction',
              'energy-control record if maintenance or cleanup occurred',
              'qualified person review',
              'follow-up inspection result',
            ],
            conflictNotes: [
              'Machine_guarding is primary when moving screen components are accessible.',
              'Fall_protection becomes significant when access platforms, ladders, decks, or walkways create fall exposure.',
              'Lockout_tagout becomes significant during maintenance, cleanup, repair, or jam clearing.',
            ],
          },
        ],
      },
    ],
    guardrails: {
      contextOnly: true,
      doesNotDeclareViolation: true,
      doesNotCreateCitation: true,
      doesNotOverrideRegulation: true,
      requiresQualifiedReview: true,
    },
  },
  {
    equipmentId: 'electrical_panel',
    equipmentLabel: 'Electrical Panel',
    equipmentGroup: 'electrical_energy_equipment',
    components: [
      {
        componentId: 'panel_live_parts_and_enclosure',
        label: 'Panel Enclosure / Live-Part Boundary',
        aliases: ['electrical panel', 'panelboard', 'breaker panel', 'control cabinet', 'open electrical panel', 'exposed live parts'],
        normalFunction:
          'Distributes or controls electrical energy through enclosed conductors, breakers, switches, controls, and energized components.',
        hazardousEnergyOrMotion: [
          'electrical energy',
          'exposed energized parts',
          'arc flash potential',
          'shock hazard',
          'unexpected energization',
        ],
        commonTasks: ['inspection', 'maintenance', 'troubleshooting', 'repair', 'startup_shutdown'],
        failureModes: [
          {
            failureModeId: 'open_panel_or_exposed_live_parts',
            label: 'Open Panel or Exposed Live Parts',
            description:
              'An electrical panel, cabinet, enclosure, breaker, conductor, or control component is open, damaged, missing covers, or exposing potential live parts.',
            likelyTaskContexts: ['inspection', 'maintenance', 'troubleshooting', 'repair'],
            harmMechanisms: ['electrical_contact', 'arc_flash', 'fire_or_explosion', 'unexpected_startup'],
            likelyHazardDomains: ['electrical', 'lockout_tagout'],
            evidenceQuestions: [
              'What panel, cabinet, breaker, conductor, or enclosure condition is exposed or open?',
              'Is the equipment energized, de-energized, verified, locked out, or being troubleshot?',
              'Are covers, blanks, dead fronts, doors, labels, or barriers missing or damaged?',
              'Who has access to the exposed electrical components?',
              'Is a qualified electrical person required to evaluate the condition?',
            ],
            immediateCautions: [
              'Do not assume exposed electrical parts are de-energized without verification.',
              'Do not recommend contact, adjustment, or troubleshooting by unqualified personnel.',
              'Treat unclear energized status as a qualified-review boundary.',
            ],
            correctiveActionThemes: [
              'Restrict access to exposed electrical components pending qualified evaluation.',
              'Verify energized/de-energized status using appropriate qualified-person procedures.',
              'Repair or replace covers, blanks, dead fronts, doors, labels, or barriers as applicable.',
              'Document electrical review and correction evidence before closure.',
            ],
            verificationEvidence: [
              'photo of panel condition before correction',
              'photo of corrected enclosure, cover, blank, or barrier',
              'qualified electrical review note',
              'lockout or energized-work control record where applicable',
              'follow-up inspection result',
            ],
            conflictNotes: [
              'Electrical is usually primary when exposed conductors, panels, shock, or arc-flash potential are central.',
              'Lockout_tagout becomes significant when servicing, maintenance, repair, or troubleshooting energy-control status is unclear.',
            ],
          },
          {
            failureModeId: 'wet_or_damaged_electrical_panel_or_cord',
            label: 'Wet or Damaged Electrical Equipment',
            description:
              'Electrical equipment, panels, cords, plugs, or temporary power components are wet, damaged, improperly protected, or exposed to environmental conditions.',
            likelyTaskContexts: ['inspection', 'normal_operation', 'maintenance', 'troubleshooting'],
            harmMechanisms: ['electrical_contact', 'arc_flash', 'fire_or_explosion'],
            likelyHazardDomains: ['electrical'],
            evidenceQuestions: [
              'What electrical equipment, cord, plug, receptacle, or panel is wet or damaged?',
              'Is the equipment energized or connected to power?',
              'Is the equipment rated or protected for the environment where it is used?',
              'Are employees exposed to contact, wet conditions, damaged insulation, missing strain relief, or temporary wiring concerns?',
            ],
            immediateCautions: [
              'Do not handle or inspect damaged energized electrical equipment without qualified controls.',
              'Do not assume temporary power is acceptable without verifying condition, protection, and environment.',
            ],
            correctiveActionThemes: [
              'Remove damaged or wet electrical equipment from use pending qualified evaluation.',
              'Repair, replace, protect, or relocate electrical equipment as appropriate.',
              'Verify protection against wet conditions, damage, strain, and unauthorized contact.',
            ],
            verificationEvidence: [
              'photo of damaged/wet condition',
              'repair or replacement record',
              'qualified electrical review',
              'photo of corrected protection or routing',
              'follow-up inspection note',
            ],
            conflictNotes: [
              'Electrical is primary when the mechanism is shock, arc flash, fire, or damaged electrical condition.',
              'Other domains may apply only if the electrical condition creates secondary exposure such as fire response or equipment startup.',
            ],
          },
        ],
      },
    ],
    guardrails: {
      contextOnly: true,
      doesNotDeclareViolation: true,
      doesNotCreateCitation: true,
      doesNotOverrideRegulation: true,
      requiresQualifiedReview: true,
    },
  },
  {
    equipmentId: 'generator',
    equipmentLabel: 'Generator',
    equipmentGroup: 'support_equipment',
    components: [
      {
        componentId: 'generator_exhaust_power_fuel',
        label: 'Generator Exhaust / Temporary Power / Fuel',
        aliases: ['generator', 'portable generator', 'temporary generator', 'generator exhaust', 'generator fuel', 'temporary power'],
        normalFunction:
          'Provides temporary or standby electrical power using an engine, fuel source, exhaust system, generator windings, cords, and distribution connections.',
        hazardousEnergyOrMotion: [
          'electrical energy',
          'engine exhaust',
          'carbon monoxide',
          'fuel vapor',
          'fire or explosion',
          'hot surfaces',
        ],
        commonTasks: ['normal_operation', 'inspection', 'maintenance', 'startup_shutdown', 'repair'],
        failureModes: [
          {
            failureModeId: 'generator_exhaust_or_ventilation_exposure',
            label: 'Generator Exhaust or Ventilation Exposure',
            description:
              'A generator is operated where exhaust, carbon monoxide, heat, or ventilation conditions may expose employees, enclosed spaces, occupied areas, or work zones.',
            likelyTaskContexts: ['normal_operation', 'inspection', 'startup_shutdown'],
            harmMechanisms: ['chemical_or_dust_exposure', 'fire_or_explosion'],
            likelyHazardDomains: ['health_exposure', 'fire_protection', 'emergency_response'],
            evidenceQuestions: [
              'Where is the generator located relative to doors, windows, intakes, enclosed spaces, work areas, or occupied zones?',
              'Is exhaust directed away from employees and air intakes?',
              'Are carbon monoxide, ventilation, heat, or indoor/semi-enclosed operation concerns present?',
              'Are employees reporting symptoms, odors, alarms, or ventilation problems?',
            ],
            immediateCautions: [
              'Do not assume outdoor placement eliminates exhaust exposure if exhaust can migrate into occupied areas.',
              'Do not ignore carbon monoxide potential when generators operate near enclosed or semi-enclosed spaces.',
            ],
            correctiveActionThemes: [
              'Relocate or orient generator exhaust away from employees, intakes, and enclosed spaces.',
              'Evaluate ventilation and carbon monoxide exposure potential.',
              'Use monitoring, alarms, or controls where exposure is possible.',
              'Document corrected generator placement and review evidence.',
            ],
            verificationEvidence: [
              'photo of generator location/exhaust orientation before and after correction',
              'ventilation or carbon monoxide monitoring evidence where applicable',
              'employee communication or symptom review where applicable',
              'supervisor or qualified review signoff',
            ],
            conflictNotes: [
              'Health_exposure is primary when exhaust/carbon monoxide is central.',
              'Fire_protection may be relevant when heat, fuel, or ignition sources are also present.',
              'Emergency_response may be relevant if symptoms, alarms, evacuation, or rescue response are involved.',
            ],
          },
          {
            failureModeId: 'generator_temporary_power_or_fuel_fire_exposure',
            label: 'Generator Temporary Power or Fuel Fire Exposure',
            description:
              'A generator has temporary power, cord, grounding, fuel, hot-surface, storage, or ignition-source concerns that may create shock, fire, or explosion exposure.',
            likelyTaskContexts: ['normal_operation', 'inspection', 'maintenance', 'startup_shutdown'],
            harmMechanisms: ['electrical_contact', 'fire_or_explosion', 'arc_flash'],
            likelyHazardDomains: ['electrical', 'fire_protection'],
            evidenceQuestions: [
              'Are cords, plugs, receptacles, panels, grounding/bonding, or temporary distribution components damaged or exposed?',
              'Is fuel stored, transferred, spilled, or located near hot surfaces or ignition sources?',
              'Are employees exposed to shock, fire, arc, trip, or fuel vapor concerns?',
              'Was the generator being started, fueled, maintained, repaired, or used for temporary power?',
            ],
            immediateCautions: [
              'Do not treat generator concerns as only electrical or only fire; fuel, power, heat, and task context may combine.',
              'Do not refuel or service without clarifying shutdown, hot-surface, ignition, and electrical conditions.',
            ],
            correctiveActionThemes: [
              'Remove damaged temporary power components from use pending qualified review.',
              'Control fuel storage, transfer, spills, ignition sources, and hot-surface exposure.',
              'Verify electrical protection, routing, grounding/bonding, and environmental suitability.',
              'Document repair, replacement, relocation, or qualified review evidence.',
            ],
            verificationEvidence: [
              'photo of damaged cord/fuel/temporary power condition before correction',
              'photo or record of corrected cord routing, replacement, or fuel control',
              'qualified electrical or maintenance review',
              'fire prevention control verification',
              'follow-up inspection result',
            ],
            conflictNotes: [
              'Electrical is primary when shock, cord, grounding, panel, or temporary power conditions are central.',
              'Fire_protection is primary or co-primary when fuel, hot surfaces, ignition, or storage conditions are central.',
            ],
          },
        ],
      },
    ],
    guardrails: {
      contextOnly: true,
      doesNotDeclareViolation: true,
      doesNotCreateCitation: true,
      doesNotOverrideRegulation: true,
      requiresQualifiedReview: true,
    },
  }
,
  {
    equipmentId: 'aerial_lift',
    equipmentLabel: 'Aerial Lift',
    equipmentGroup: 'construction_equipment',
    components: [
      {
        componentId: 'platform_fall_and_positioning_controls',
        label: 'Platform / Fall Restraint / Positioning Controls',
        aliases: ['aerial lift', 'boom lift', 'scissor lift', 'man lift', 'lift basket', 'work platform'],
        normalFunction:
          'Elevates employees to perform work using a platform, basket, controls, guardrails, anchorage points, outriggers, and positioning systems.',
        hazardousEnergyOrMotion: [
          'elevated work platform',
          'fall exposure',
          'tipover potential',
          'overhead electrical contact',
          'crushing or pinch points',
        ],
        commonTasks: ['normal_operation', 'inspection', 'maintenance', 'repair', 'travel_access'],
        failureModes: [
          {
            failureModeId: 'aerial_lift_fall_restraint_or_platform_control_gap',
            label: 'Aerial Lift Fall-Restraint or Platform-Control Gap',
            description:
              'An employee works from an aerial lift where fall-restraint, platform gate/rail condition, anchorage, or basket-positioning controls are unclear or ineffective.',
            likelyTaskContexts: ['normal_operation', 'inspection', 'maintenance', 'repair'],
            harmMechanisms: ['fall_from_elevation', 'struck_by', 'crushed_by'],
            likelyHazardDomains: ['fall_protection', 'mobile_equipment'],
            evidenceQuestions: [
              'What type of lift is involved and what task is being performed from the platform?',
              'Was the platform gate closed and were rails, chains, anchorages, and controls intact?',
              'Was fall restraint or fall arrest required, available, connected, and appropriate for the lift type?',
              'Was the employee leaning, climbing, standing on rails, exiting at elevation, or overreaching?',
              'Was the lift positioned near traffic, structures, pinch points, overhead hazards, or unstable ground?',
            ],
            immediateCautions: [
              'Do not assume platform rails alone address all lift-related fall or ejection exposures.',
              'Do not recommend exiting or climbing from the platform without qualified review of the task and controls.',
              'Do not close without objective evidence of platform condition, restraint expectations, and operator review.',
            ],
            correctiveActionThemes: [
              'Review platform condition, gate/rail integrity, anchorage, and fall-restraint expectations.',
              'Control overreaching, climbing, exiting, or unsafe positioning from the platform.',
              'Verify operator authorization, pre-use inspection, and site-specific positioning controls.',
              'Document before-and-after condition and qualified/supervisor review.',
            ],
            verificationEvidence: [
              'photo of platform, gate, rails, and anchor point condition',
              'pre-use inspection record',
              'fall restraint or harness/lanyard verification where applicable',
              'operator authorization or task review record',
              'supervisor or qualified person signoff',
            ],
            conflictNotes: [
              'Fall_protection is usually primary when the exposure involves falls, ejection, restraint, or platform misuse.',
              'Mobile_equipment remains relevant when positioning, travel, ground condition, tipover, or operator controls are central.',
            ],
          },
          {
            failureModeId: 'aerial_lift_overhead_power_or_tipover_exposure',
            label: 'Aerial Lift Overhead Power or Tipover Exposure',
            description:
              'An aerial lift is operated near overhead electrical hazards, unstable ground, traffic, slopes, or outrigger/positioning concerns that may create contact or tipover exposure.',
            likelyTaskContexts: ['normal_operation', 'inspection', 'maintenance'],
            harmMechanisms: ['electrical_contact', 'arc_flash', 'crushed_by', 'struck_by'],
            likelyHazardDomains: ['electrical', 'mobile_equipment', 'fall_protection'],
            evidenceQuestions: [
              'Is the lift operating near overhead power lines, energized equipment, structures, traffic, or pinch/crush points?',
              'What is the lift position relative to slopes, holes, soft ground, outriggers, stabilizers, or wheel placement?',
              'Were minimum approach, barricading, spotter, de-energization, or insulated-equipment controls considered?',
              'Was the lift moving, elevating, rotating, reaching, or driving while elevated?',
            ],
            immediateCautions: [
              'Do not assume overhead conductors are safe or de-energized without qualified confirmation.',
              'Do not operate or reposition the lift where ground stability or electrical approach boundaries are unclear.',
            ],
            correctiveActionThemes: [
              'Restrict lift operation pending review of overhead and ground-positioning hazards.',
              'Confirm electrical approach controls and qualified review where energized overhead hazards may exist.',
              'Verify ground conditions, outriggers/stabilizers, traffic controls, and operator communication.',
            ],
            verificationEvidence: [
              'photo/map of lift position relative to overhead hazards and ground condition',
              'pre-use inspection and ground condition review',
              'electrical hazard assessment or qualified confirmation where applicable',
              'traffic/spotter/control documentation',
              'supervisor or qualified person signoff',
            ],
            conflictNotes: [
              'Electrical is primary when overhead energized contact is central.',
              'Mobile_equipment is primary when tipover, positioning, slope, travel, or outrigger controls are central.',
              'Fall_protection remains relevant because lift movement or contact may create ejection/fall exposure.',
            ],
          },
        ],
      },
    ],
    guardrails: {
      contextOnly: true,
      doesNotDeclareViolation: true,
      doesNotCreateCitation: true,
      doesNotOverrideRegulation: true,
      requiresQualifiedReview: true,
    },
  },
  {
    equipmentId: 'scaffold',
    equipmentLabel: 'Scaffold',
    equipmentGroup: 'construction_equipment',
    components: [
      {
        componentId: 'platform_guardrails_access_base',
        label: 'Platform / Guardrails / Access / Base',
        aliases: ['scaffold', 'scaffolding', 'scaffold platform', 'scaffold guardrail', 'scaffold access', 'scaffold tag'],
        normalFunction:
          'Provides temporary elevated work access using platforms, guardrails, access components, frames, planks, braces, ties, and base supports.',
        hazardousEnergyOrMotion: [
          'fall exposure',
          'falling material',
          'platform collapse',
          'unstable base',
          'improper access',
        ],
        commonTasks: ['normal_operation', 'inspection', 'maintenance', 'repair', 'travel_access'],
        failureModes: [
          {
            failureModeId: 'scaffold_incomplete_guardrail_or_platform',
            label: 'Incomplete Scaffold Guardrail or Platform',
            description:
              'A scaffold platform, guardrail, midrail, toe board, plank, access point, or edge protection is incomplete, damaged, displaced, or not clearly adequate for employee exposure.',
            likelyTaskContexts: ['normal_operation', 'inspection', 'maintenance', 'repair'],
            harmMechanisms: ['fall_from_elevation', 'falling_material', 'struck_by'],
            likelyHazardDomains: ['fall_protection', 'walking_working_surfaces', 'material_handling'],
            evidenceQuestions: [
              'What scaffold level, platform, guardrail, plank, access point, or edge is involved?',
              'Are employees working, climbing, accessing, or passing below the scaffold?',
              'Are guardrails, midrails, toe boards, planks, access ladders, and platform width/condition complete and secure?',
              'Was the scaffold inspected, tagged, modified, or placed out of service?',
              'Are falling-object exposures present below the platform?',
            ],
            immediateCautions: [
              'Do not treat scaffold access as acceptable without evaluating platform, guardrails, access, base, and inspection status together.',
              'Do not close an incomplete-platform issue without objective correction evidence and competent/qualified review.',
            ],
            correctiveActionThemes: [
              'Restrict scaffold use pending review when platform or guardrail adequacy is unclear.',
              'Complete, repair, or remove defective platform, guardrail, access, or falling-object controls.',
              'Verify scaffold inspection/tag status and communication to affected employees.',
              'Document correction and competent/qualified review evidence.',
            ],
            verificationEvidence: [
              'photo of scaffold condition before correction',
              'photo of completed platform/guardrails/access after correction',
              'scaffold inspection or tag record',
              'competent/qualified person signoff',
              'follow-up inspection result',
            ],
            conflictNotes: [
              'Fall_protection is primary when elevated scaffold edges, missing rails, or incomplete platforms are central.',
              'Walking_working_surfaces may be relevant for platform condition and access surfaces.',
              'Material_handling may be relevant when falling objects, toe boards, or overhead exposure are central.',
            ],
          },
          {
            failureModeId: 'scaffold_unstable_base_or_missing_inspection_clarity',
            label: 'Scaffold Unstable Base or Inspection Clarity Gap',
            description:
              'A scaffold has base, footing, bracing, tie-in, leveling, modification, tagging, or inspection concerns that may affect stability or safe use.',
            likelyTaskContexts: ['inspection', 'normal_operation', 'maintenance'],
            harmMechanisms: ['fall_from_elevation', 'crushed_by', 'struck_by', 'falling_material'],
            likelyHazardDomains: ['fall_protection', 'walking_working_surfaces'],
            evidenceQuestions: [
              'Are base plates, mudsills, leveling, bracing, tie-ins, wheels, locks, or footing conditions adequate and documented?',
              'Was the scaffold modified, moved, loaded, or exposed to weather or impact?',
              'Is inspection/tag status visible and current?',
              'Are employees working on, accessing, or walking below the scaffold?',
            ],
            immediateCautions: [
              'Do not assume a scaffold is safe because it is standing; base, bracing, loading, and inspection status matter.',
              'Do not allow continued use when stability, modification, or inspection status is unclear.',
            ],
            correctiveActionThemes: [
              'Remove scaffold from service or restrict access pending competent/qualified review if stability is uncertain.',
              'Correct base, bracing, tie-in, wheel lock, leveling, or loading concerns.',
              'Update inspection/tag status and communicate use restrictions.',
            ],
            verificationEvidence: [
              'photo of corrected base/bracing/tie-in condition',
              'scaffold inspection/tag documentation',
              'competent/qualified person review',
              'employee communication or restriction record',
              'follow-up inspection result',
            ],
            conflictNotes: [
              'Fall_protection remains central because instability can lead to falls or collapse.',
              'Walking_working_surfaces is relevant for platform and access stability.',
            ],
          },
        ],
      },
    ],
    guardrails: {
      contextOnly: true,
      doesNotDeclareViolation: true,
      doesNotCreateCitation: true,
      doesNotOverrideRegulation: true,
      requiresQualifiedReview: true,
    },
  },
  {
    equipmentId: 'portable_ladder',
    equipmentLabel: 'Portable Ladder',
    equipmentGroup: 'support_equipment',
    components: [
      {
        componentId: 'ladder_condition_setup_use',
        label: 'Condition / Setup / Use',
        aliases: ['portable ladder', 'extension ladder', 'step ladder', 'ladder', 'damaged ladder', 'top step'],
        normalFunction:
          'Provides temporary access to elevated work areas when selected, inspected, positioned, secured, and used according to task conditions.',
        hazardousEnergyOrMotion: [
          'fall exposure',
          'unstable setup',
          'slip or displacement',
          'overreaching',
          'damaged component failure',
        ],
        commonTasks: ['travel_access', 'inspection', 'maintenance', 'repair', 'normal_operation'],
        failureModes: [
          {
            failureModeId: 'portable_ladder_unsecured_wrong_angle_or_overreach',
            label: 'Portable Ladder Setup or Use Exposure',
            description:
              'A portable ladder is used with setup, securement, angle, access extension, footing, overreaching, or top-step concerns that may create fall exposure.',
            likelyTaskContexts: ['travel_access', 'inspection', 'maintenance', 'repair'],
            harmMechanisms: ['fall_from_elevation', 'fall_on_same_level', 'struck_by'],
            likelyHazardDomains: ['fall_protection', 'walking_working_surfaces'],
            evidenceQuestions: [
              'What ladder type is used and what task is being performed?',
              'Is the ladder secured, stable, on sound footing, at an appropriate angle, and extending properly for access?',
              'Is the employee overreaching, standing on the top step/cap, carrying materials, or using the ladder as a work platform?',
              'Are weather, surface condition, traffic, doorways, electrical hazards, or material handling factors present?',
            ],
            immediateCautions: [
              'Do not assume ladder use is acceptable without matching ladder type, setup, task, and work positioning.',
              'Do not close a ladder issue without verifying condition, setup, and employee work practice correction.',
            ],
            correctiveActionThemes: [
              'Stop or control ladder use until setup and task suitability are reviewed.',
              'Secure, reposition, replace, or select a more suitable access method where needed.',
              'Review ladder condition, angle, footing, access extension, and work-positioning limits.',
            ],
            verificationEvidence: [
              'photo of ladder setup before and after correction',
              'ladder inspection evidence',
              'alternative access method evidence where applicable',
              'employee communication or retraining record',
              'supervisor signoff',
            ],
            conflictNotes: [
              'Fall_protection is usually primary for ladder fall exposure.',
              'Walking_working_surfaces may be relevant when footing, surface condition, access route, or same-level fall factors are central.',
            ],
          },
          {
            failureModeId: 'portable_ladder_damaged_or_defective_used',
            label: 'Damaged or Defective Portable Ladder Used',
            description:
              'A portable ladder with damaged, missing, loose, bent, cracked, contaminated, or otherwise defective components is used or left available for use.',
            likelyTaskContexts: ['inspection', 'travel_access', 'maintenance'],
            harmMechanisms: ['fall_from_elevation', 'fall_on_same_level', 'struck_by'],
            likelyHazardDomains: ['fall_protection', 'walking_working_surfaces'],
            evidenceQuestions: [
              'What ladder component is damaged, missing, loose, cracked, bent, contaminated, or defective?',
              'Was the ladder used, available for use, tagged out, removed, or repaired?',
              'Was the defect found during inspection, after an incident, or during task observation?',
              'Could the defect affect stability, support, slip resistance, or safe access?',
            ],
            immediateCautions: [
              'Do not leave a defective ladder available for use while awaiting repair or review.',
              'Do not assume minor damage is acceptable without qualified evaluation of the component and task.',
            ],
            correctiveActionThemes: [
              'Remove the defective ladder from service pending repair, disposal, or qualified evaluation.',
              'Replace or repair ladder components only where appropriate.',
              'Document defect identification, removal from service, and replacement/correction evidence.',
            ],
            verificationEvidence: [
              'photo of ladder defect',
              'tag/removal-from-service evidence',
              'repair/replacement/disposal record',
              'follow-up inspection note',
              'supervisor signoff',
            ],
            conflictNotes: [
              'Fall_protection is primary because ladder defects can lead to falls.',
              'Walking_working_surfaces remains relevant where footing, slip, or access route contributes.',
            ],
          },
        ],
      },
    ],
    guardrails: {
      contextOnly: true,
      doesNotDeclareViolation: true,
      doesNotCreateCitation: true,
      doesNotOverrideRegulation: true,
      requiresQualifiedReview: true,
    },
  },
  {
    equipmentId: 'excavation_trench_box',
    equipmentLabel: 'Excavation / Trench Box',
    equipmentGroup: 'construction_equipment',
    components: [
      {
        componentId: 'protective_system_access_surcharge',
        label: 'Protective System / Access / Spoil-Surcharge Controls',
        aliases: ['excavation', 'trench', 'trench box', 'protective system', 'spoil pile', 'trench access'],
        normalFunction:
          'Supports or protects excavation workers through protective systems, trench boxes, sloping, benching, access/egress, and control of spoil/equipment surcharge.',
        hazardousEnergyOrMotion: [
          'soil collapse',
          'unsupported ground',
          'falling material',
          'mobile equipment surcharge',
          'fall exposure into excavation',
        ],
        commonTasks: ['normal_operation', 'inspection', 'travel_access', 'maintenance'],
        failureModes: [
          {
            failureModeId: 'trench_worker_without_protective_system_clarity',
            label: 'Trench Worker Without Protective-System Clarity',
            description:
              'Employees are in or near an excavation/trench where protective system, depth, soil condition, water, competent-person inspection, or collapse protection is unclear.',
            likelyTaskContexts: ['normal_operation', 'inspection'],
            harmMechanisms: ['unsupported_ground_or_collapse', 'crushed_by', 'falling_material'],
            likelyHazardDomains: ['excavation_trenching', 'ground_control'],
            evidenceQuestions: [
              'Are employees inside the excavation or exposed at the edge?',
              'What are the excavation depth, width, soil/water conditions, and nearby surcharge conditions?',
              'Is a trench box, shoring, shielding, sloping, benching, or other protective system present and appropriate?',
              'Was a competent/qualified person inspection performed after changing conditions?',
              'Are utilities, vibration, weather, water, or adjacent loads affecting stability?',
            ],
            immediateCautions: [
              'Do not infer excavation safety without depth, soil, protective-system, and competent-person information.',
              'Do not allow entry where collapse protection or inspection status is unclear.',
            ],
            correctiveActionThemes: [
              'Restrict entry pending competent/qualified review if protective-system adequacy is unclear.',
              'Verify protective system selection, installation, depth, soil condition, water control, and changing conditions.',
              'Document inspection, protective system, and employee access/egress evidence.',
            ],
            verificationEvidence: [
              'photo of excavation/protective system condition',
              'competent/qualified person inspection record',
              'protective system documentation',
              'water/soil/surcharge control evidence where applicable',
              'follow-up inspection result',
            ],
            conflictNotes: [
              'Excavation_trenching is primary for trench/excavation entry and protective systems.',
              'Ground_control may be relevant where soil/ground stability, highwall-like conditions, or collapse mechanics dominate.',
            ],
          },
          {
            failureModeId: 'excavation_spoil_surcharge_or_access_gap',
            label: 'Excavation Spoil-Surcharge or Access/Egress Gap',
            description:
              'Spoil piles, equipment, materials, traffic, access/egress, or fall exposure near an excavation may affect trench stability or employee escape/access.',
            likelyTaskContexts: ['normal_operation', 'inspection', 'travel_access'],
            harmMechanisms: ['unsupported_ground_or_collapse', 'fall_from_elevation', 'struck_by', 'crushed_by'],
            likelyHazardDomains: ['excavation_trenching', 'traffic_control', 'fall_protection'],
            evidenceQuestions: [
              'Where are spoil piles, equipment, materials, vehicles, or traffic located relative to the trench edge?',
              'Is safe access/egress available and positioned for employees in the excavation?',
              'Are employees exposed to falls into the excavation or struck-by hazards from nearby equipment/materials?',
              'Has a competent/qualified person evaluated surcharge, access, and changing conditions?',
            ],
            immediateCautions: [
              'Do not evaluate excavation risk only by protective system presence; surcharge and access/egress may change the risk.',
              'Do not allow work to continue near unstable edges or unclear access conditions without review.',
            ],
            correctiveActionThemes: [
              'Move or control spoil, materials, equipment, and traffic near excavation edges.',
              'Provide and verify safe access/egress and edge exposure controls.',
              'Review excavation conditions after changes in weather, loading, vibration, or site activity.',
            ],
            verificationEvidence: [
              'photo/map of corrected spoil/equipment distance and access/egress',
              'competent/qualified person inspection record',
              'traffic or edge-control evidence',
              'employee communication record',
              'follow-up inspection result',
            ],
            conflictNotes: [
              'Excavation_trenching remains primary when trench stability, access, and spoil/surcharge are central.',
              'Traffic_control may be significant when vehicles or mobile equipment operate near the excavation.',
              'Fall_protection may be relevant where open-edge fall exposure exists.',
            ],
          },
        ],
      },
    ],
    guardrails: {
      contextOnly: true,
      doesNotDeclareViolation: true,
      doesNotCreateCitation: true,
      doesNotOverrideRegulation: true,
      requiresQualifiedReview: true,
    },
  },
  {
    equipmentId: 'telehandler',
    equipmentLabel: 'Telehandler',
    equipmentGroup: 'material_handling_equipment',
    components: [
      {
        componentId: 'boom_load_personnel_platform_stability',
        label: 'Boom / Load / Personnel Platform / Stability Controls',
        aliases: ['telehandler', 'reach forklift', 'rough terrain forklift', 'telescopic handler', 'telehandler boom', 'telehandler load'],
        normalFunction:
          'Lifts, carries, reaches, and places loads using a telescoping boom, forks/attachments, outriggers/stabilizers, load charts, and operator controls.',
        hazardousEnergyOrMotion: [
          'elevated load',
          'boom movement',
          'tipover potential',
          'suspended load',
          'personnel lifting exposure',
          'traffic interaction',
        ],
        commonTasks: ['normal_operation', 'material_handling', 'inspection', 'maintenance', 'travel_access'],
        failureModes: [
          {
            failureModeId: 'telehandler_suspended_or_elevated_load_exposure',
            label: 'Telehandler Suspended or Elevated Load Exposure',
            description:
              'A telehandler lifts, travels, reaches, or positions an elevated/suspended load where load stability, capacity, exclusion zone, signaling, or ground condition is unclear.',
            likelyTaskContexts: ['normal_operation', 'material_handling'],
            harmMechanisms: ['struck_by', 'crushed_by', 'falling_material', 'traffic_interaction'],
            likelyHazardDomains: ['material_handling', 'mobile_equipment', 'cranes_rigging_hoisting', 'traffic_control'],
            evidenceQuestions: [
              'What load is being lifted, carried, suspended, placed, or traveled with?',
              'Are employees under or near the suspended/elevated load, boom, or travel path?',
              'Are load weight, attachment, capacity chart, boom angle/extension, ground condition, and exclusion zone known?',
              'Are spotters, signalers, taglines, rigging, or communication methods used where needed?',
            ],
            immediateCautions: [
              'Do not treat telehandler lifting as ordinary travel when the load is elevated, suspended, or extended.',
              'Do not allow employees under or near the load path without clarifying controls and qualified review.',
            ],
            correctiveActionThemes: [
              'Control the load path and keep employees out of the fall/crush zone.',
              'Verify load weight, attachment, capacity, boom position, ground condition, and operator communication.',
              'Review rigging/suspended-load controls where the telehandler is used with suspended loads.',
              'Document corrected lift plan or task controls.',
            ],
            verificationEvidence: [
              'photo of corrected load position or exclusion zone',
              'load/attachment/capacity review evidence',
              'lift plan or task briefing where applicable',
              'operator/spotter communication record',
              'qualified person or supervisor signoff',
            ],
            conflictNotes: [
              'Material_handling is primary when load movement and stability are central.',
              'Cranes_rigging_hoisting may be relevant if the telehandler is used with suspended loads or rigging.',
              'Mobile_equipment remains relevant for travel, stability, ground condition, and operator controls.',
            ],
          },
          {
            failureModeId: 'telehandler_personnel_lift_or_platform_use_gap',
            label: 'Telehandler Personnel-Lift or Platform-Use Gap',
            description:
              'A telehandler is used to lift personnel or a work platform where platform approval, attachment, fall protection, controls, communication, or stability is unclear.',
            likelyTaskContexts: ['normal_operation', 'maintenance', 'inspection', 'repair'],
            harmMechanisms: ['fall_from_elevation', 'crushed_by', 'struck_by'],
            likelyHazardDomains: ['fall_protection', 'mobile_equipment', 'material_handling'],
            evidenceQuestions: [
              'Is the telehandler lifting personnel, a work platform, or materials only?',
              'Is the platform designed/approved for the telehandler and secured to the attachment?',
              'Are fall protection, platform controls, communication, and emergency lowering procedures clear?',
              'Are ground conditions, capacity, boom position, travel while elevated, and operator visibility controlled?',
            ],
            immediateCautions: [
              'Do not assume forks or an improvised platform are acceptable for lifting personnel.',
              'Do not treat personnel lifting as a normal material-handling task without platform, fall, and stability review.',
            ],
            correctiveActionThemes: [
              'Stop personnel lifting pending review where platform approval or controls are unclear.',
              'Verify platform compatibility, securement, capacity, fall protection, communication, and rescue/lowering controls.',
              'Document task authorization and qualified/supervisor review before closure.',
            ],
            verificationEvidence: [
              'photo of approved/secured platform and connection',
              'platform/telehandler compatibility evidence',
              'fall protection and communication verification',
              'operator/task authorization record',
              'supervisor or qualified person signoff',
            ],
            conflictNotes: [
              'Fall_protection is primary when personnel are elevated.',
              'Mobile_equipment remains central for stability, controls, and operator operation.',
              'Material_handling may remain related because the telehandler is primarily load-handling equipment.',
            ],
          },
        ],
      },
    ],
    guardrails: {
      contextOnly: true,
      doesNotDeclareViolation: true,
      doesNotCreateCitation: true,
      doesNotOverrideRegulation: true,
      requiresQualifiedReview: true,
    },
  }
];
