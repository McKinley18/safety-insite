import { SafeScopeMechanismBrainRecord } from './mechanism-brain.types';

export const SAFESCOPE_MECHANISM_BRAIN_REGISTRY: SafeScopeMechanismBrainRecord[] = [
  {
    mechanismId: 'rotating_equipment_nip_point',
    label: 'Rotating equipment nip point',
    hazardDomains: ['machine_guarding'],
    energyType: 'mechanical',
    exposurePathway: 'Employee body part, clothing, tool, or material can be drawn into an in-running nip point or rotating machine part.',
    commonTriggerTerms: ['conveyor', 'tail pulley', 'head pulley', 'return roller', 'nip point', 'rotating', 'unguarded'],
    competingMechanisms: ['rotating_equipment', 'pinch_point', 'unexpected_startup'],
    precedenceNotes: [
      'Use when the exposure is contact with a rotating conveyor, pulley, roller, shaft, belt, or in-running nip point.',
      'If the task is maintenance or servicing with energy isolation missing, evaluate unexpected_startup as a competing LOTO mechanism.',
      'For underground metal/nonmetal conveyor guarding scope, regulatory citation routing must distinguish 30 CFR 57.14107 from 30 CFR 56.14107.'
    ],
    evidenceQuestions: [
      'What rotating component is exposed?',
      'Can a person contact the nip point during normal work, cleanup, travel, inspection, or maintenance?',
      'Is a fixed guard installed, intact, and secured?',
      'Is the equipment surface or underground, and is it coal or metal/nonmetal?'
    ],
    immediateControls: ['stop access', 'restrict access', 'guard exposed moving parts'],
    verificationEvidence: ['photo of installed guard', 'post-correction inspection record', 'equipment location/scope confirmation']
  },
  {
    mechanismId: 'rotating_equipment',
    label: 'Rotating equipment contact',
    hazardDomains: ['machine_guarding'],
    energyType: 'mechanical',
    exposurePathway: 'Employee may contact rotating machinery or moving machine parts where guarding is absent or ineffective.',
    commonTriggerTerms: ['rotating equipment', 'moving machine parts', 'conveyor', 'drive', 'shaft', 'pulley', 'roller'],
    competingMechanisms: ['rotating_equipment_nip_point', 'pinch_point', 'unexpected_startup'],
    precedenceNotes: [
      'Use as a broader rotating-machinery mechanism when the finding does not specifically describe an in-running nip point.',
      'Use rotating_equipment_nip_point when the text clearly identifies a nip point, tail pulley, head pulley, or in-running point.',
      'Use unexpected_startup when the dominant exposure is servicing, repair, blocking, or lockout failure.'
    ],
    evidenceQuestions: [
      'Which moving part is exposed?',
      'Is the component rotating, reciprocating, or otherwise moving?',
      'Is guarding missing, damaged, removed, or bypassed?',
      'What work activity puts employees within reach?'
    ],
    immediateControls: ['stop access', 'restrict access', 'install or restore guard'],
    verificationEvidence: ['photo of guarded component', 'inspection record', 'scope determination for applicable citation']
  },
  {
    mechanismId: 'pinch_point',
    label: 'Machine pinch point or point-of-operation exposure',
    hazardDomains: ['machine_guarding'],
    energyType: 'mechanical',
    exposurePathway: 'Employee hands or body parts can be caught, crushed, or amputated at the point of operation or between moving parts.',
    commonTriggerTerms: ['pinch point', 'point of operation', 'unguarded point of operation', 'press', 'caught in', 'caught between'],
    competingMechanisms: ['rotating_equipment_nip_point', 'rotating_equipment', 'unexpected_startup'],
    precedenceNotes: [
      'Use for point-of-operation hazards where the machine action creates caught-in, caught-between, crush, or amputation exposure.',
      'Use rotating_equipment_nip_point for conveyor/pulley nip points.',
      'Use LOTO/unexpected_startup if the finding is about servicing or maintenance energy control.'
    ],
    evidenceQuestions: [
      'What machine operation creates the pinch or point-of-operation exposure?',
      'Can the operator or nearby employee reach the danger zone?',
      'What guard, device, two-hand control, barrier, or safe distance is missing?'
    ],
    immediateControls: ['stop affected operation', 'restrict access', 'guard point of operation'],
    verificationEvidence: ['photo of guard or device', 'functional test of safeguarding', 'supervisor verification']
  },
  {
    mechanismId: 'collapse',
    label: 'Excavation collapse or cave-in',
    hazardDomains: ['excavation_trenching'],
    energyType: 'gravity',
    exposurePathway: 'Soil or material can cave in and engulf, crush, or trap workers inside the excavation.',
    commonTriggerTerms: ['collapse', 'cave-in', 'trench', 'excavation', 'vertical wall', 'unprotected trench'],
    competingMechanisms: ['fall_from_height', 'struck_by'],
    precedenceNotes: [
      'Use when the primary hazard is soil or excavation wall failure.',
      'If the exposure is falling into the excavation rather than cave-in, evaluate fall_from_height separately.'
    ],
    evidenceQuestions: [
      'How deep is the excavation?',
      'What soil or rock conditions are present?',
      'Is there a protective system such as sloping, benching, shoring, or shielding?',
      'Has a competent person inspected the excavation?'
    ],
    immediateControls: ['remove employees from excavation', 'stop entry'],
    verificationEvidence: ['competent person inspection record', 'photo of protective system', 'depth/soil documentation']
  },
  {
    mechanismId: 'fall_of_ground',
    label: 'Fall of ground',
    hazardDomains: ['ground_control', 'roof_rib_control'],
    energyType: 'gravity',
    exposurePathway: 'Loose roof, face, rib, or ground can fall into the work or travel area and strike or crush miners.',
    commonTriggerTerms: ['fall of ground', 'loose roof', 'fractured roof', 'unsupported roof', 'loose rib', 'roof control'],
    competingMechanisms: ['rib_fall', 'struck_by'],
    precedenceNotes: [
      'Use for roof or ground-control hazards where the falling material source is roof, face, or ground.',
      'Use rib_fall when the text specifically identifies loose rib, coal rib, rib sloughing, or rib support.'
    ],
    evidenceQuestions: [
      'Is the hazard roof, rib, face, highwall, or loose ground?',
      'Is the area traveled or occupied by miners?',
      'What support, scaling, examination, or barricade is in place?'
    ],
    immediateControls: ['restrict access', 'barricade area', 'remove miners from exposure'],
    verificationEvidence: ['qualified person examination', 'scaling/support record', 'photo of corrected condition']
  },
  {
    mechanismId: 'rib_fall',
    label: 'Loose rib or rib fall',
    hazardDomains: ['roof_rib_control'],
    energyType: 'gravity',
    exposurePathway: 'Loose coal or mine rib can slough or fall into a travelway or work area and strike or pin miners.',
    commonTriggerTerms: ['rib fall', 'loose rib', 'rib control', 'coal rib', 'unsupported rib', 'rib sloughing', 'roof/rib'],
    competingMechanisms: ['fall_of_ground', 'struck_by'],
    precedenceNotes: [
      'Use when rib-specific language is present.',
      'Do not collapse rib hazards into generic roof control when the finding specifically describes rib exposure.'
    ],
    evidenceQuestions: [
      'Where is the loose rib located?',
      'Is the area a travelway, working place, or active face area?',
      'What rib support, scaling, or barricading is present?'
    ],
    immediateControls: ['restrict access to affected area', 'barricade loose rib area', 'scale or support loose rib'],
    verificationEvidence: ['qualified person examination', 'roof/rib correction record', 'photo of support or scaling']
  },
  {
    mechanismId: 'shock',
    label: 'Electrical shock',
    hazardDomains: ['electrical'],
    energyType: 'electrical',
    exposurePathway: 'Employee can contact exposed energized parts, wiring, conductors, or electrical components.',
    commonTriggerTerms: ['shock', 'energized', 'exposed wiring', 'live parts', 'exposed conductors'],
    competingMechanisms: ['shock_arc_flash', 'unexpected_startup'],
    precedenceNotes: [
      'Use for electrical contact hazards when arc-flash indicators are not prominent.',
      'Use shock_arc_flash when damaged cable, exposed conductor, or arc-flash wording indicates both shock and arc-flash exposure.'
    ],
    evidenceQuestions: [
      'Is the part energized or potentially energized?',
      'Are conductors, terminals, or live parts exposed?',
      'Is the circuit de-energized, guarded, covered, or locked out?'
    ],
    immediateControls: ['de-energize circuit', 'restrict access', 'guard live parts'],
    verificationEvidence: ['qualified electrical repair record', 'photo of corrected enclosure', 'voltage/zero-energy verification where applicable']
  },
  {
    mechanismId: 'shock_arc_flash',
    label: 'Electrical shock or arc flash exposure',
    hazardDomains: ['electrical'],
    energyType: 'electrical',
    exposurePathway: 'Damaged or exposed electrical conductors can create shock, burn, or arc-flash exposure.',
    commonTriggerTerms: ['shock arc flash', 'arc flash', 'damaged electrical cable', 'exposed conductor', 'damaged conductor', 'energized'],
    competingMechanisms: ['shock', 'unexpected_startup'],
    precedenceNotes: [
      'Use for damaged cable/conductor findings and exposed energized conductor findings.',
      'This mechanism should outrank generic shock where damaged cable or arc-flash terminology appears.'
    ],
    evidenceQuestions: [
      'What cable, conductor, or energized part is damaged or exposed?',
      'Is the circuit energized or locked out?',
      'Is insulation, enclosure integrity, or guarding compromised?',
      'Was the repair verified by a qualified person?'
    ],
    immediateControls: ['de-energize circuit', 'restrict access', 'repair damaged conductor'],
    verificationEvidence: ['qualified electrical repair/inspection verification', 'photo of repaired cable/enclosure', 'zero-energy or insulation verification']
  },
  {
    mechanismId: 'fall_from_height',
    label: 'Fall from height',
    hazardDomains: ['fall_protection', 'scaffolds', 'ladders'],
    energyType: 'gravity',
    exposurePathway: 'Employee can fall from an elevated surface, unprotected edge, scaffold, platform, or work level.',
    commonTriggerTerms: ['elevated platform', 'open side', 'unprotected edge', 'leading edge', 'fall protection', 'guardrail', 'scaffold'],
    competingMechanisms: ['fall_from_ladder', 'inadequate_guardrail', 'slip_trip_fall'],
    precedenceNotes: [
      'Use for elevated fall hazards where the fall distance or exposure is the dominant injury mechanism.',
      'Use fall_from_ladder when the ladder itself is the primary access/equipment hazard.',
      'Use inadequate_guardrail for guardrail-specific deficiencies when useful as a secondary mechanism.'
    ],
    evidenceQuestions: [
      'What is the estimated fall distance?',
      'What edge, opening, platform, scaffold, or elevated work surface is involved?',
      'What fall protection system is missing or ineffective?',
      'Are employees exposed during assigned work?'
    ],
    immediateControls: ['restrict access to fall exposure', 'stop exposed work', 'install fall protection'],
    verificationEvidence: ['photo of guardrail/fall protection', 'competent person verification', 'fall protection inspection record']
  },
  {
    mechanismId: 'inadequate_guardrail',
    label: 'Missing or inadequate guardrail',
    hazardDomains: ['fall_protection', 'scaffolds'],
    energyType: 'gravity',
    exposurePathway: 'Employee can fall through or over an incomplete, missing, or inadequate guardrail system.',
    commonTriggerTerms: ['missing guardrail', 'no guardrail', 'toprail', 'midrail', 'open side', 'incomplete guardrail'],
    competingMechanisms: ['fall_from_height'],
    precedenceNotes: [
      'Use as a guardrail-specific mechanism when toprail, midrail, or open-side guarding is the central defect.',
      'Fall_from_height may remain the broader parent mechanism.'
    ],
    evidenceQuestions: [
      'Which guardrail component is missing?',
      'What is the height and location of the elevated surface?',
      'Is access restricted until the guardrail is restored?'
    ],
    immediateControls: ['restrict access', 'install toprail and midrail', 'provide equivalent fall protection'],
    verificationEvidence: ['photo of completed guardrail', 'competent person inspection', 'fall protection verification']
  },
  {
    mechanismId: 'fall_from_ladder',
    label: 'Fall from ladder',
    hazardDomains: ['ladders', 'slips_trips_falls'],
    energyType: 'gravity',
    exposurePathway: 'Employee can fall because ladder setup, access, extension, stability, or use is deficient.',
    commonTriggerTerms: ['ladder', 'extension ladder', 'unsecured ladder', 'landing surface', 'roof access'],
    competingMechanisms: ['fall_from_height', 'slip_trip_fall'],
    precedenceNotes: [
      'Use when a ladder is the primary access method or defective equipment involved.',
      'Use fall_from_height for broader edge/platform exposures not centered on ladder setup.'
    ],
    evidenceQuestions: [
      'Is the ladder secured and stable?',
      'Does the ladder extend above the landing where required?',
      'Is the ladder damaged or being misused?',
      'What landing, roof, or access point is involved?'
    ],
    immediateControls: ['remove ladder from service until corrected', 'restrict ladder access', 'secure ladder'],
    verificationEvidence: ['photo of corrected setup', 'ladder inspection', 'competent person/supervisor verification']
  },
  {
    mechanismId: 'slip',
    label: 'Slip on contaminated walking surface',
    hazardDomains: ['slip_trip_fall', 'walking_working_surfaces'],
    energyType: 'gravity',
    exposurePathway: 'Foot traction is reduced by liquid, slick material, ice, mud, oil, or similar contamination.',
    commonTriggerTerms: ['wet floor', 'slip', 'spill', 'standing water', 'slick floor'],
    competingMechanisms: ['trip', 'slip_trip_fall', 'fall_from_height'],
    precedenceNotes: [
      'Use when the walking-surface defect is primarily traction loss.',
      'Use trip when the main defect is obstruction, elevation change, stored material, or poor housekeeping.'
    ],
    evidenceQuestions: [
      'What contaminant or condition made the surface slick?',
      'Was the surface a work area, aisle, accessway, or travelway?',
      'Were warnings, barricades, drainage, cleanup, or floor maintenance controls present?'
    ],
    immediateControls: ['barricade or warn until corrected', 'clean spill', 'restore dry walking surface'],
    verificationEvidence: ['photo of clean/dry surface', 'housekeeping record', 'inspection verification']
  },
  {
    mechanismId: 'trip',
    label: 'Trip over obstruction or poor housekeeping',
    hazardDomains: ['slip_trip_fall', 'walking_working_surfaces'],
    energyType: 'gravity',
    exposurePathway: 'Employee foot path is interrupted by loose material, obstruction, uneven condition, stored item, or poor housekeeping.',
    commonTriggerTerms: ['trip', 'loose material', 'loose parts', 'stored across', 'obstruction', 'travelway', 'housekeeping'],
    competingMechanisms: ['slip', 'slip_trip_fall', 'egress_blockage'],
    precedenceNotes: [
      'Use when the primary same-level fall mechanism is an obstruction or housekeeping issue.',
      'Use egress_blockage when the obstruction is specifically in an escapeway or emergency egress route.'
    ],
    evidenceQuestions: [
      'What object or condition creates the trip exposure?',
      'Is the area a required travelway, aisle, walkway, or work platform?',
      'Can the obstruction be removed, rerouted, or guarded?'
    ],
    immediateControls: ['barricade or warn until corrected', 'remove obstruction', 'restore clear travelway'],
    verificationEvidence: ['photo of cleared travelway', 'housekeeping verification', 'inspection record']
  },
  {
    mechanismId: 'slip_trip_fall',
    label: 'Same-level slip/trip/fall',
    hazardDomains: ['slip_trip_fall', 'walking_working_surfaces', 'slips_trips_falls'],
    energyType: 'gravity',
    exposurePathway: 'Employee can fall on the same level due to walking-surface, housekeeping, access, or travelway defects.',
    commonTriggerTerms: ['slip trip', 'slip', 'trip', 'walking surface', 'walkway', 'aisle', 'travelway'],
    competingMechanisms: ['slip', 'trip', 'fall_from_ladder', 'pedestrian_strike'],
    precedenceNotes: [
      'Use as a general same-level fall mechanism when slip vs. trip is not clear.',
      'Do not use when mobile equipment/pedestrian strike is the dominant hazard even if pedestrian walking language appears.'
    ],
    evidenceQuestions: [
      'Is the defect a slip source, trip source, or both?',
      'Is this a travelway, aisle, work area, or access route?',
      'Are employees exposed during normal travel or work?'
    ],
    immediateControls: ['restrict access if unsafe', 'clean or clear walking surface', 'restore safe access'],
    verificationEvidence: ['photo of corrected surface', 'housekeeping record', 'supervisor verification']
  },
  {
    mechanismId: 'run_off_embankment',
    label: 'Run-off-road or over-edge mobile equipment exposure',
    hazardDomains: ['mobile_equipment', 'powered_haulage'],
    energyType: 'mechanical',
    exposurePathway: 'Mobile equipment can travel over an edge, dump point, embankment, or roadway drop-off where berm or edge control is inadequate.',
    commonTriggerTerms: ['run off', 'over edge', 'berm', 'missing berm', 'inadequate berm', 'haul road', 'dump point', 'edge control'],
    competingMechanisms: ['struck_by', 'pedestrian_strike'],
    precedenceNotes: [
      'Use when edge protection, berms, dump points, or roadway drop-offs are central.',
      'Use pedestrian_strike when the dominant hazard is people on foot in the mobile equipment path.'
    ],
    evidenceQuestions: [
      'Where is the drop-off or edge?',
      'What mobile equipment uses the roadway or dump point?',
      'Is the berm height adequate relative to equipment axle height?',
      'Is access restricted until edge protection is restored?'
    ],
    immediateControls: ['restrict haulage route', 'stop dumping/travel near edge', 'restore berm or edge control'],
    verificationEvidence: ['photo of berm/edge control', 'roadway inspection record', 'supervisor verification']
  },
  {
    mechanismId: 'pedestrian_strike',
    label: 'Pedestrian struck by mobile equipment',
    hazardDomains: ['mobile_equipment', 'traffic_control', 'powered_haulage'],
    energyType: 'mechanical',
    exposurePathway: 'Pedestrian or miner on foot enters the path or blind zone of mobile equipment, creating struck-by or crush exposure.',
    commonTriggerTerms: ['pedestrian', 'miners on foot', 'employees on foot', 'forklift', 'shuttle car', 'mobile equipment', 'separation', 'traffic'],
    competingMechanisms: ['struck_by', 'slip_trip_fall', 'run_off_embankment'],
    precedenceNotes: [
      'Use when people on foot and mobile equipment interaction are both present.',
      'This mechanism outranks same-level slip/trip wording when forklift/pedestrian interaction is the dominant hazard.',
      'Use struck_by for backing/visibility scenarios where pedestrian wording is not central.'
    ],
    evidenceQuestions: [
      'What mobile equipment is operating?',
      'Where are pedestrians or miners on foot located?',
      'What separation, exclusion zone, spotter, alarm, or traffic control is in place?',
      'Is operator visibility limited?'
    ],
    immediateControls: ['separate pedestrians from mobile equipment', 'restrict access to traffic area', 'stop equipment movement until controls are established'],
    verificationEvidence: ['traffic control verification', 'operator/pedestrian separation documentation', 'spotter/alarm verification']
  },
  {
    mechanismId: 'struck_by',
    label: 'Struck-by mobile equipment or backing equipment',
    hazardDomains: ['mobile_equipment', 'traffic_control'],
    energyType: 'mechanical',
    exposurePathway: 'Employee can be struck by moving, backing, turning, or poorly visible mobile equipment.',
    commonTriggerTerms: ['struck by', 'backing', 'backup alarm', 'spotter', 'skid steer', 'loader', 'truck', 'visibility'],
    competingMechanisms: ['pedestrian_strike', 'struck_by_mobile_equipment', 'run_off_embankment'],
    precedenceNotes: [
      'Use for backing equipment, alarm, spotter, visibility, or struck-by mobile equipment hazards.',
      'Use pedestrian_strike when the observation specifically centers on pedestrians or employees on foot.'
    ],
    evidenceQuestions: [
      'What equipment is moving or backing?',
      'Is there a functional backup alarm or spotter?',
      'Are pedestrians, workers, or other vehicles exposed?',
      'What visibility limitations exist?'
    ],
    immediateControls: ['stop affected equipment movement', 'establish exclusion zone', 'use spotter where required'],
    verificationEvidence: ['backup alarm verification', 'traffic control plan/photo', 'spotter or exclusion-zone verification']
  },
  {
    mechanismId: 'struck_by_mobile_equipment',
    label: 'Worker struck by moving mobile equipment',
    hazardDomains: ['mobile_equipment', 'traffic_control'],
    energyType: 'mechanical',
    exposurePathway: 'Worker can be hit or crushed by moving mobile equipment due to traffic pattern, visibility, or separation failure.',
    commonTriggerTerms: ['mobile equipment', 'forklift', 'haul truck', 'shuttle car', 'skid steer', 'pedestrian', 'backing equipment'],
    competingMechanisms: ['pedestrian_strike', 'struck_by'],
    precedenceNotes: [
      'Use as a broad mobile-equipment struck-by mechanism.',
      'Use pedestrian_strike when people-on-foot exposure is explicit and central.'
    ],
    evidenceQuestions: [
      'What equipment and worker path intersect?',
      'Are routes, alarms, mirrors, cameras, spotters, or barriers in place?',
      'Is the traffic pattern documented and communicated?'
    ],
    immediateControls: ['separate people and equipment', 'restrict access', 'establish traffic controls'],
    verificationEvidence: ['traffic control verification', 'equipment alarm/visibility check', 'worker separation evidence']
  },
  {
    mechanismId: 'unexpected_startup',
    label: 'Unexpected startup or release of hazardous energy',
    hazardDomains: ['machine_guarding_loto', 'lockout_tagout'],
    energyType: 'mechanical',
    exposurePathway: 'Equipment can start, move, cycle, fall, or release stored energy while employees perform servicing, maintenance, repair, or clearing.',
    commonTriggerTerms: ['unexpected startup', 'restart', 'lockout', 'tagout', 'loto', 'hazardous energy', 'stored energy', 'maintenance', 'servicing'],
    competingMechanisms: ['stored_energy_release', 'rotating_equipment_nip_point', 'pinch_point'],
    precedenceNotes: [
      'Use when servicing/maintenance and missing energy isolation are central.',
      'Use rotating or pinch mechanisms as secondary context when the exposure point is identified but energy control is the controlling deficiency.'
    ],
    evidenceQuestions: [
      'What task is being performed: maintenance, repair, cleaning, clearing, or adjustment?',
      'Were energy sources isolated, locked, tagged, blocked, and verified?',
      'Is stored energy present?',
      'Who verified zero energy?'
    ],
    immediateControls: ['stop maintenance or servicing work', 'isolate hazardous energy', 'apply lockout/tagout'],
    verificationEvidence: ['LOTO verification', 'zero-energy verification', 'supervisor/qualified person verification']
  },
  {
    mechanismId: 'stored_energy_release',
    label: 'Stored energy release',
    hazardDomains: ['machine_guarding_loto', 'lockout_tagout'],
    energyType: 'mechanical',
    exposurePathway: 'Stored gravity, hydraulic, pneumatic, spring, electrical, thermal, or pressure energy can release unexpectedly.',
    commonTriggerTerms: ['stored energy', 'gravity energy', 'hydraulic', 'pneumatic', 'spring tension', 'blocked against motion'],
    competingMechanisms: ['unexpected_startup', 'pinch_point', 'shock_arc_flash'],
    precedenceNotes: [
      'Use when stored energy is explicitly described.',
      'Use unexpected_startup when the overall finding is broader hazardous-energy control failure.'
    ],
    evidenceQuestions: [
      'What stored energy source exists?',
      'Has the equipment been blocked, bled, discharged, restrained, or otherwise controlled?',
      'How was zero energy verified?'
    ],
    immediateControls: ['stop work', 'control stored energy', 'block against motion'],
    verificationEvidence: ['stored energy release/control record', 'blocking verification', 'zero-energy verification']
  },
  {
    mechanismId: 'methane_gas_buildup',
    label: 'Methane or hazardous gas buildup',
    hazardDomains: ['ventilation'],
    energyType: 'atmospheric',
    exposurePathway: 'Deficient ventilation control can allow methane or hazardous gases to accumulate or airflow to become inadequate.',
    commonTriggerTerms: ['methane', 'methane buildup', 'gas buildup', 'ventilation', 'airflow', 'ventilation curtain', 'curtain'],
    competingMechanisms: ['asphyxiation', 'chemical_exposure'],
    precedenceNotes: [
      'Use for underground coal ventilation control and methane/airflow deficiencies.',
      'Use confined_space/asphyxiation when the setting is a permit-required confined space rather than mine ventilation.'
    ],
    evidenceQuestions: [
      'What ventilation control is damaged, missing, or ineffective?',
      'What area or working section is affected?',
      'Was methane or air quality checked?',
      'Was airflow restored and verified?'
    ],
    immediateControls: ['restrict affected area until ventilation is evaluated', 'restore ventilation control', 'evaluate methane/air quality'],
    verificationEvidence: ['ventilation examination', 'airflow verification', 'methane/gas check record']
  },
  {
    mechanismId: 'egress_blockage',
    label: 'Blocked escapeway or emergency egress route',
    hazardDomains: ['emergency_preparedness'],
    energyType: 'unknown',
    exposurePathway: 'Obstruction prevents or delays emergency travel through an escapeway, escape route, lifeline route, or required egress path.',
    commonTriggerTerms: ['escapeway obstruction', 'blocked escapeway', 'obstructed escapeway', 'egress blockage', 'emergency egress', 'escape route', 'lifeline'],
    competingMechanisms: ['trip', 'unexpected_startup', 'slip_trip_fall'],
    precedenceNotes: [
      'Use when obstruction affects required emergency route or escapeway.',
      'This mechanism outranks housekeeping/trip if emergency egress is the controlling safety function.'
    ],
    evidenceQuestions: [
      'What route is blocked?',
      'Is it a required escapeway, emergency route, exit route, or lifeline route?',
      'Can miners/employees pass through safely during an emergency?',
      'Was the obstruction removed and documented?'
    ],
    immediateControls: ['remove obstruction from escapeway', 'restrict travel until clear', 'notify responsible mine official'],
    verificationEvidence: ['photo of clear escapeway', 'escapeway inspection record', 'responsible person verification']
  },
  {
    mechanismId: 'silica_inhalation',
    label: 'Respirable crystalline silica inhalation',
    hazardDomains: ['health_respiratory'],
    energyType: 'chemical',
    exposurePathway: 'Employee inhales respirable crystalline silica generated by cutting, grinding, drilling, crushing, or other dust-generating activity.',
    commonTriggerTerms: ['silica', 'respirable crystalline silica', 'silica dust', 'concrete dust', 'dry cutting', 'dust exposure', 'inhalation'],
    competingMechanisms: ['chemical_exposure'],
    precedenceNotes: [
      'Use for silica-specific dust exposure scenarios.',
      'Do not collapse silica into generic chemical exposure where crystalline silica is specifically identified.'
    ],
    evidenceQuestions: [
      'What material is being cut, drilled, crushed, or disturbed?',
      'Are wet methods, dust collection, or other engineering controls used?',
      'Is respiratory protection required or used?',
      'Is exposure assessment or Table 1/task-based control information available?'
    ],
    immediateControls: ['restrict dust-generating work until controls are verified', 'use wet methods or dust collection', 'control silica dust'],
    verificationEvidence: ['exposure control method', 'respiratory protection evaluation where required', 'silica control verification']
  },
  {
    mechanismId: 'chemical_exposure',
    label: 'Chemical exposure or missing hazard communication',
    hazardDomains: ['hazardous_materials', 'hazard_communication'],
    energyType: 'chemical',
    exposurePathway: 'Employee may be exposed to hazardous chemical contents without adequate identity, hazard warning, SDS, or communication.',
    commonTriggerTerms: ['chemical exposure', 'hazardous chemical', 'unlabeled container', 'secondary container', 'hazcom', 'sds', 'container label'],
    competingMechanisms: ['silica_inhalation', 'asphyxiation'],
    precedenceNotes: [
      'Use for unlabeled containers, HazCom, SDS, or hazardous chemical identity/communication failures.',
      'Use silica_inhalation for silica dust exposure and confined_space/asphyxiation for atmospheric hazards in permit spaces.'
    ],
    evidenceQuestions: [
      'What chemical or product is in the container?',
      'Is the container labeled with identity and hazard information?',
      'Is the SDS available?',
      'Have affected employees been trained?'
    ],
    immediateControls: ['remove unlabeled container from use', 'restrict use until labeled', 'identify chemical contents'],
    verificationEvidence: ['corrected container label', 'SDS verification', 'HazCom correction record']
  },
  {
    mechanismId: 'asphyxiation',
    label: 'Asphyxiation or atmospheric hazard',
    hazardDomains: ['confined_space'],
    energyType: 'atmospheric',
    exposurePathway: 'Employee enters or may enter an atmosphere with oxygen deficiency, toxic contaminants, engulfment, or other serious atmospheric hazards.',
    commonTriggerTerms: ['asphyxiation', 'oxygen deficiency', 'atmospheric hazard', 'confined space', 'permit required confined space', 'entry controls'],
    competingMechanisms: ['methane_gas_buildup', 'chemical_exposure'],
    precedenceNotes: [
      'Use for confined-space atmospheric hazard or missing permit-entry control scenarios.',
      'Use methane_gas_buildup for underground coal ventilation/methane control contexts.'
    ],
    evidenceQuestions: [
      'Is the space large enough to enter, limited in entry/exit, and not designed for continuous occupancy?',
      'Has the atmosphere been tested?',
      'Are entry permit, attendant, rescue, and ventilation controls in place?',
      'Are entrants currently exposed?'
    ],
    immediateControls: ['stop confined space entry', 'restrict entry until hazards are evaluated', 'test atmosphere before entry'],
    verificationEvidence: ['confined space evaluation', 'atmospheric testing record', 'entry permit and attendant verification']
  },
  {
    mechanismId: 'struck_by_suspended_load',
    label: 'Struck by suspended load',
    hazardDomains: ['cranes_rigging_hoisting'],
    energyType: 'gravity',
    exposurePathway: 'Employee is positioned under or near a suspended, moving, or hoisted load and can be struck if the load shifts, swings, lowers, or falls.',
    commonTriggerTerms: ['suspended load', 'hoisted load', 'under the load', 'load path', 'fall zone', 'crane load', 'tag line'],
    competingMechanisms: ['dropped_load', 'rigging_failure', 'struck_by'],
    precedenceNotes: [
      'Use when employee position relative to a suspended or hoisted load is the dominant exposure.',
      'Use rigging_failure when damaged or overloaded rigging is the primary initiating failure.',
      'Use dropped_load when the finding emphasizes loss of load control or falling object rather than employee location alone.'
    ],
    evidenceQuestions: [
      'Where were employees positioned relative to the suspended load or fall zone?',
      'What was the load path and was it controlled?',
      'Were exclusion zones, tag lines, and signal controls established?'
    ],
    immediateControls: ['stop lift', 'clear employees from load path', 'establish exclusion zone'],
    verificationEvidence: ['photo or observation of clear load path', 'lift plan or pre-lift briefing', 'operator/signal person confirmation']
  },
  {
    mechanismId: 'dropped_load',
    label: 'Dropped load',
    hazardDomains: ['cranes_rigging_hoisting', 'material_handling'],
    energyType: 'gravity',
    exposurePathway: 'A lifted, hoisted, stacked, or handled load can fall and strike or crush employees or equipment below.',
    commonTriggerTerms: ['dropped load', 'falling load', 'load fell', 'uncontrolled load', 'load shift', 'lost load control'],
    competingMechanisms: ['struck_by_suspended_load', 'rigging_failure', 'unstable_stack_collapse'],
    precedenceNotes: [
      'Use when the central concern is a load falling or being dropped.',
      'Use struck_by_suspended_load when the stronger signal is employees under or near an actively suspended load.',
      'Use rigging_failure when sling, hook, shackle, or rigging damage is the initiating concern.'
    ],
    evidenceQuestions: [
      'What load was lifted or handled?',
      'What failed or allowed the load to drop or shift?',
      'Were employees in the fall zone or struck-by path?'
    ],
    immediateControls: ['stop lift or handling task', 'secure load', 'clear fall zone'],
    verificationEvidence: ['load condition documentation', 'rigging/equipment inspection', 'corrected lift control verification']
  },
  {
    mechanismId: 'rigging_failure',
    label: 'Rigging failure',
    hazardDomains: ['cranes_rigging_hoisting'],
    energyType: 'mechanical',
    exposurePathway: 'Damaged, overloaded, misused, or incompatible rigging can fail during lifting and release the load.',
    commonTriggerTerms: ['damaged sling', 'frayed sling', 'broken wire', 'chain sling', 'shackle', 'hook', 'rigging', 'rated capacity', 'sling tag'],
    competingMechanisms: ['dropped_load', 'struck_by_suspended_load', 'crane_contact'],
    precedenceNotes: [
      'Use when sling, hook, shackle, chain, wire rope, synthetic sling, or rigging configuration is the primary issue.',
      'Escalate to dropped_load or struck_by_suspended_load when employee exposure to a falling or suspended load is specifically described.'
    ],
    evidenceQuestions: [
      'What rigging component is damaged, missing identification, overloaded, or misused?',
      'What is the load weight and rated capacity?',
      'Was the rigging inspected by a competent or qualified person?'
    ],
    immediateControls: ['remove damaged rigging from service', 'stop lift', 'replace or inspect rigging'],
    verificationEvidence: ['photo of damaged rigging', 'sling identification/rated capacity', 'competent person inspection record']
  },
  {
    mechanismId: 'crane_contact',
    label: 'Crane or load contact with structure, equipment, or power line',
    hazardDomains: ['cranes_rigging_hoisting', 'electrical'],
    energyType: 'mechanical',
    exposurePathway: 'Crane boom, load, rigging, or hoisting equipment can contact a structure, equipment, or energized line and create struck-by, crushing, or electrical exposure.',
    commonTriggerTerms: ['boom contact', 'power line contact', 'crane contact', 'load contact', 'swing radius', 'electrical line'],
    competingMechanisms: ['shock_arc_flash', 'struck_by_suspended_load', 'dropped_load'],
    precedenceNotes: [
      'Use when the crane, boom, line, rigging, or load contacts or could contact another object.',
      'If energized line contact is central, evaluate electrical shock/arc flash as a competing mechanism.'
    ],
    evidenceQuestions: [
      'What object, structure, equipment, or line could be contacted?',
      'Was swing radius, clearance, or spotter control established?',
      'Is there potential electrical contact or stored energy exposure?'
    ],
    immediateControls: ['stop crane movement', 'establish clearance controls', 'restrict swing/contact zone'],
    verificationEvidence: ['clearance verification', 'spotter/signal control documentation', 'photo of corrected swing or contact zone']
  },


  {
    mechanismId: 'unstable_stack_collapse',
    label: 'Unstable material stack collapse',
    hazardDomains: ['material_handling'],
    energyType: 'gravity',
    exposurePathway: 'Stored, stacked, racked, or palletized material can shift, collapse, or fall into an employee work/travel area.',
    commonTriggerTerms: ['unstable stack', 'stacked material', 'leaning pallet', 'improper stacking', 'material storage', 'rack collapse', 'stored material'],
    competingMechanisms: ['dropped_load', 'struck_by', 'trip'],
    precedenceNotes: [
      'Use when stored or stacked material stability is the controlling issue.',
      'Use dropped_load when an active lift or handled load is falling or shifting.',
      'Use trip when the primary issue is obstruction on a walking surface rather than falling-object exposure.'
    ],
    evidenceQuestions: [
      'What material is stacked or stored?',
      'Is it leaning, unsecured, overloaded, damaged, or outside rack capacity?',
      'Are employees exposed to the collapse or falling-object zone?'
    ],
    immediateControls: ['restrict access to the fall zone', 'stabilize or restack material', 'remove unstable material from service area'],
    verificationEvidence: ['photo of corrected storage', 'rack/load capacity verification', 'supervisor inspection record']
  },
  {
    mechanismId: 'falling_object_material',
    label: 'Falling object from stored or handled material',
    hazardDomains: ['material_handling'],
    energyType: 'gravity',
    exposurePathway: 'Stored, overhead, elevated, or handled material can fall and strike employees below.',
    commonTriggerTerms: ['falling object', 'falling material', 'overhead storage', 'material fell', 'object fell', 'stored overhead'],
    competingMechanisms: ['dropped_load', 'struck_by_suspended_load', 'unstable_stack_collapse'],
    precedenceNotes: [
      'Use for non-crane stored or overhead material that can fall.',
      'Use struck_by_suspended_load when the load is actively hoisted or suspended.'
    ],
    evidenceQuestions: [
      'Where was the material located relative to employees?',
      'What prevented or failed to prevent falling material?',
      'Were toe boards, racking, restraints, or exclusion zones present?'
    ],
    immediateControls: ['clear employees from below material', 'secure material', 'remove overhead falling-object exposure'],
    verificationEvidence: ['photo of secured material', 'storage/racking correction record', 'exclusion-zone verification']
  },
  {
    mechanismId: 'defective_tool_contact',
    label: 'Defective hand or power tool contact',
    hazardDomains: ['tools_equipment'],
    energyType: 'mechanical',
    exposurePathway: 'A damaged, modified, or defective hand/power tool can cut, strike, puncture, burn, or otherwise injure the user or nearby employees.',
    commonTriggerTerms: ['defective tool', 'damaged tool', 'broken handle', 'damaged cord', 'power tool', 'hand tool', 'missing handle'],
    competingMechanisms: ['shock_arc_flash', 'tool_guarding_gap', 'abrasive_wheel_failure'],
    precedenceNotes: [
      'Use for general defective hand/power tool condition.',
      'Use shock_arc_flash if exposed energized conductors are central.',
      'Use abrasive_wheel_failure for grinder or cutoff-wheel failure/guard issues.'
    ],
    evidenceQuestions: [
      'What tool is involved and what defect exists?',
      'Was the tool being used or available for use?',
      'Was the tool removed from service and tagged?'
    ],
    immediateControls: ['remove defective tool from service', 'tag tool out of service', 'replace or repair tool'],
    verificationEvidence: ['photo of tagged tool', 'tool repair/replacement record', 'pre-use inspection verification']
  },
  {
    mechanismId: 'abrasive_wheel_failure',
    label: 'Abrasive wheel or grinder failure',
    hazardDomains: ['tools_equipment', 'ppe'],
    energyType: 'mechanical',
    exposurePathway: 'A grinder, cutoff wheel, or abrasive wheel can fragment, kick back, or eject material toward the operator or nearby workers.',
    commonTriggerTerms: ['grinder', 'cutoff wheel', 'abrasive wheel', 'grinding wheel', 'missing grinder guard', 'wheel guard', 'face shield'],
    competingMechanisms: ['defective_tool_contact', 'eye_face_ppe_gap', 'tool_guarding_gap'],
    precedenceNotes: [
      'Use when grinder/cutoff wheel failure, guard, or eye/face projectile exposure is central.',
      'Use eye_face_ppe_gap when the main issue is missing PPE with otherwise adequate tool controls.'
    ],
    evidenceQuestions: [
      'Is the grinder or abrasive wheel guarded?',
      'What wheel/disc is installed and is it compatible with the tool?',
      'Are eye and face protection used?'
    ],
    immediateControls: ['stop grinder use', 'install/restore guard', 'verify wheel condition and PPE before reuse'],
    verificationEvidence: ['photo of guard and wheel', 'tool inspection record', 'PPE verification']
  },
  {
    mechanismId: 'tool_guarding_gap',
    label: 'Portable tool guarding gap',
    hazardDomains: ['tools_equipment'],
    energyType: 'mechanical',
    exposurePathway: 'A portable tool guard is missing, removed, damaged, or ineffective, exposing the operator to blade, wheel, bit, or point-of-operation contact.',
    commonTriggerTerms: ['missing tool guard', 'removed guard', 'portable saw guard', 'grinder guard missing', 'tool guard'],
    competingMechanisms: ['machine_guarding', 'abrasive_wheel_failure', 'defective_tool_contact'],
    precedenceNotes: [
      'Use for portable tool guards.',
      'Use machine_guarding for fixed machines or stationary point-of-operation hazards.'
    ],
    evidenceQuestions: [
      'What guard is missing, removed, or damaged?',
      'Is the tool portable or fixed equipment?',
      'Can the operator contact the blade, wheel, or point of operation?'
    ],
    immediateControls: ['remove tool from use', 'restore guard', 'verify guard before reuse'],
    verificationEvidence: ['photo of restored guard', 'tool inspection record', 'supervisor verification']
  },
  {
    mechanismId: 'fire_extinguisher_access_failure',
    label: 'Fire extinguisher access failure',
    hazardDomains: ['fire_protection'],
    energyType: 'thermal',
    exposurePathway: 'A blocked, missing, discharged, unidentified, or uninspected fire extinguisher can delay emergency response to an incipient fire.',
    commonTriggerTerms: ['blocked extinguisher', 'extinguisher blocked', 'missing extinguisher', 'expired extinguisher', 'not accessible'],
    competingMechanisms: ['egress_blockage', 'hot_work_ignition', 'combustible_exposure_fire'],
    precedenceNotes: [
      'Use when extinguisher availability, inspection, or access is the controlling issue.',
      'Use hot_work_ignition when welding/cutting/grinding ignition risk is central.'
    ],
    evidenceQuestions: [
      'Is the extinguisher visible and accessible?',
      'Is the inspection current?',
      'Is the extinguisher appropriate and mounted/identified?'
    ],
    immediateControls: ['clear access immediately', 'replace or inspect extinguisher', 'verify visibility and readiness'],
    verificationEvidence: ['photo of accessible extinguisher', 'inspection tag', 'area correction record']
  },
  {
    mechanismId: 'hot_work_ignition',
    label: 'Hot work ignition of combustible or flammable material',
    hazardDomains: ['welding_cutting_hot_work', 'fire_protection'],
    energyType: 'thermal',
    exposurePathway: 'Welding, cutting, grinding, torch work, or sparks can ignite nearby combustibles, flammables, vapors, residues, or dust.',
    commonTriggerTerms: ['hot work', 'welding', 'cutting', 'grinding sparks', 'torch cutting', 'combustibles nearby', 'no fire watch'],
    competingMechanisms: ['fire_extinguisher_access_failure', 'chemical_exposure', 'combustible_exposure_fire'],
    precedenceNotes: [
      'Use when ignition source plus combustible/flammable exposure is central.',
      'Use fire_extinguisher_access_failure only when extinguisher access is the main issue.'
    ],
    evidenceQuestions: [
      'What hot work is occurring?',
      'What combustibles, flammables, dusts, or residues are nearby?',
      'Are fire watch, extinguisher, permit/authorization, and post-work inspection documented?'
    ],
    immediateControls: ['stop hot work until combustibles are removed or protected', 'assign fire watch', 'verify extinguisher readiness'],
    verificationEvidence: ['hot work permit/authorization', 'fire watch record', 'combustible clearance photo', 'extinguisher verification']
  },
  {
    mechanismId: 'combustible_exposure_fire',
    label: 'Combustible material fire exposure',
    hazardDomains: ['fire_protection', 'welding_cutting_hot_work'],
    energyType: 'thermal',
    exposurePathway: 'Combustible material accumulation, storage, or proximity to ignition sources can allow fire to start or spread.',
    commonTriggerTerms: ['combustible material', 'flammable storage', 'combustibles nearby', 'fire load', 'ignition source'],
    competingMechanisms: ['hot_work_ignition', 'chemical_exposure', 'fire_extinguisher_access_failure'],
    precedenceNotes: [
      'Use for combustible storage/fire loading without a specific hot work ignition source.',
      'Use hot_work_ignition when welding/cutting/grinding is present.'
    ],
    evidenceQuestions: [
      'What combustible or flammable material is present?',
      'What ignition source exists?',
      'Are storage, separation, housekeeping, or fire protection controls adequate?'
    ],
    immediateControls: ['remove or isolate combustibles', 'control ignition sources', 'restore fire protection controls'],
    verificationEvidence: ['photo of combustible clearance', 'storage correction record', 'fire protection verification']
  },
  {
    mechanismId: 'fire_watch_gap',
    label: 'Missing or inadequate fire watch',
    hazardDomains: ['welding_cutting_hot_work'],
    energyType: 'thermal',
    exposurePathway: 'Hot work occurs where a fire could develop, but fire watch, extinguisher readiness, or post-work monitoring is missing or inadequate.',
    commonTriggerTerms: ['no fire watch', 'fire watch missing', 'fire watch not documented', 'hot work without fire watch'],
    competingMechanisms: ['hot_work_ignition', 'fire_extinguisher_access_failure'],
    precedenceNotes: [
      'Use when the missing fire watch is specifically described.',
      'Use hot_work_ignition as the broader mechanism when combustibles and ignition source are both central.'
    ],
    evidenceQuestions: [
      'Was fire watch required for the hot work location?',
      'Was a trained fire watch assigned?',
      'Were extinguisher and post-work inspection controls verified?'
    ],
    immediateControls: ['stop hot work until fire watch is assigned', 'verify extinguisher availability', 'document post-work inspection'],
    verificationEvidence: ['fire watch assignment', 'hot work permit/authorization', 'post-work inspection record']
  },
  {
    mechanismId: 'ppe_exposure_gap',
    label: 'Exposure-specific PPE gap',
    hazardDomains: ['ppe'],
    energyType: 'unknown',
    exposurePathway: 'A task-specific exposure exists but the selected, worn, fitted, or maintained PPE does not match the hazard.',
    commonTriggerTerms: ['missing ppe', 'no ppe', 'wrong ppe', 'damaged ppe', 'not wearing ppe', 'ppe hazard assessment'],
    competingMechanisms: ['eye_face_ppe_gap', 'hand_ppe_gap', 'silica_inhalation', 'chemical_exposure'],
    precedenceNotes: [
      'Use as broad PPE mechanism when the specific exposure type is unclear.',
      'Use more specific PPE mechanism when eye/face or hand exposure is central.'
    ],
    evidenceQuestions: [
      'What exposure requires PPE?',
      'What PPE is missing, wrong, damaged, or not worn?',
      'Are higher-level controls also needed?'
    ],
    immediateControls: ['stop exposure until appropriate PPE is selected and used', 'replace damaged PPE', 'verify hazard assessment'],
    verificationEvidence: ['PPE hazard assessment', 'photo/observation of correct PPE use', 'training or fit verification where needed']
  },
  {
    mechanismId: 'eye_face_ppe_gap',
    label: 'Eye or face protection gap',
    hazardDomains: ['ppe'],
    energyType: 'mechanical',
    exposurePathway: 'Flying particles, sparks, chemicals, dust, or radiant energy can contact the eyes or face when eye/face protection is missing or inadequate.',
    commonTriggerTerms: ['no safety glasses', 'without eye protection', 'no face shield', 'goggles missing', 'grinding without face shield'],
    competingMechanisms: ['abrasive_wheel_failure', 'hot_work_ignition', 'chemical_exposure'],
    precedenceNotes: [
      'Use when the primary deficiency is missing/inadequate eye or face PPE.',
      'Use abrasive_wheel_failure when tool/wheel condition is the initiating hazard.'
    ],
    evidenceQuestions: [
      'What eye or face hazard exists?',
      'What eye/face PPE is required and what is actually worn?',
      'Are tool guards or shields also required?'
    ],
    immediateControls: ['stop task until proper eye/face protection is worn', 'provide correct PPE', 'verify guards or shields where needed'],
    verificationEvidence: ['photo/observation of correct eye/face PPE', 'PPE selection record', 'supervisor verification']
  },
  {
    mechanismId: 'hand_ppe_gap',
    label: 'Hand protection gap',
    hazardDomains: ['ppe'],
    energyType: 'mechanical',
    exposurePathway: 'Hands are exposed to cuts, punctures, burns, chemicals, or abrasion without suitable hand protection.',
    commonTriggerTerms: ['no gloves', 'wrong gloves', 'cut hazard', 'sharp material', 'chemical gloves', 'burn hazard'],
    competingMechanisms: ['chemical_exposure', 'defective_tool_contact', 'pinch_point'],
    precedenceNotes: [
      'Use when hand PPE selection/use is the controlling issue.',
      'Use chemical_exposure when chemical identity and HazCom/SDS issues are central.'
    ],
    evidenceQuestions: [
      'What hand hazard exists?',
      'What glove or hand protection is required?',
      'Are gloves compatible with the exposure?'
    ],
    immediateControls: ['stop hand exposure until suitable gloves are provided', 'replace damaged gloves', 'verify glove compatibility'],
    verificationEvidence: ['PPE selection record', 'photo/observation of correct gloves', 'supervisor verification']
  },

  {
    mechanismId: 'overexertion',
    label: 'Manual handling overexertion',
    hazardDomains: ['ergonomics', 'material_handling'],
    energyType: 'ergonomic',
    exposurePathway: 'Forceful manual lifting, carrying, pushing, pulling, reaching, twisting, or repetitive handling can overload the musculoskeletal system.',
    commonTriggerTerms: ['manual lifting', 'heavy lift', 'overexertion', 'awkward posture', 'repetitive motion', 'material handling by hand'],
    competingMechanisms: ['unstable_stack_collapse', 'struck_by', 'pinch_point'],
    precedenceNotes: [
      'Use when the primary harm mechanism is biomechanical load on the worker.',
      'Use material_handling mechanisms when the material can fall, shift, collapse, or strike.'
    ],
    evidenceQuestions: [
      'What load is being lifted, carried, pushed, or pulled?',
      'What are the weight, frequency, reach distance, posture, and duration?',
      'Are mechanical aids, team lifts, staging, or task redesign available?'
    ],
    immediateControls: ['pause high-risk manual handling', 'provide mechanical assistance', 'reduce load or frequency'],
    verificationEvidence: ['task observation/photo', 'load weight estimate', 'ergonomic assessment or supervisor verification']
  },
  {
    mechanismId: 'musculoskeletal_disorder',
    label: 'Cumulative musculoskeletal disorder exposure',
    hazardDomains: ['ergonomics'],
    energyType: 'ergonomic',
    exposurePathway: 'Repeated force, awkward posture, vibration, contact stress, or insufficient recovery can contribute to cumulative musculoskeletal injury.',
    commonTriggerTerms: ['musculoskeletal', 'cumulative trauma', 'repetitive task', 'awkward posture', 'ergonomic risk', 'forceful exertion'],
    competingMechanisms: ['overexertion'],
    precedenceNotes: [
      'Use when cumulative or repetitive exposure is central.',
      'Use overexertion when a discrete heavy lift or forceful exertion is central.'
    ],
    evidenceQuestions: [
      'What task is repeated and how often?',
      'What posture, force, vibration, or contact stress is present?',
      'What recovery, rotation, or redesign controls are in place?'
    ],
    immediateControls: ['evaluate task exposure', 'reduce repetition or force', 'provide recovery or rotation'],
    verificationEvidence: ['task frequency record', 'ergonomic assessment', 'corrected workstation or process verification']
  },
  {
    mechanismId: 'heat_illness',
    label: 'Heat illness exposure',
    hazardDomains: ['environmental_exposure', 'health_exposure'],
    energyType: 'thermal',
    exposurePathway: 'Heat, humidity, radiant heat, workload, PPE burden, and inadequate recovery can cause heat exhaustion, heat stroke, dehydration, or fatigue-related error.',
    commonTriggerTerms: ['heat stress', 'heat illness', 'heat exhaustion', 'heat stroke', 'hot environment', 'wbgt', 'hydration', 'acclimatization'],
    competingMechanisms: ['hot_work_ignition', 'chemical_exposure'],
    precedenceNotes: [
      'Use for worker physiological heat exposure.',
      'Use hot_work_ignition when the hazard is fire ignition from welding, cutting, or grinding.'
    ],
    evidenceQuestions: [
      'What are the temperature, humidity, radiant heat, or WBGT conditions?',
      'What is the workload, PPE burden, exposure duration, and recovery schedule?',
      'Are workers acclimatized, monitored, hydrated, and covered by emergency response controls?'
    ],
    immediateControls: ['move affected workers to cooling/recovery', 'provide water shade or cooling', 'adjust work/rest schedule'],
    verificationEvidence: ['temperature or WBGT data', 'work/rest plan', 'hydration/shade verification', 'symptom monitoring record']
  },
  {
    mechanismId: 'cold_stress',
    label: 'Cold stress exposure',
    hazardDomains: ['environmental_exposure', 'health_exposure'],
    energyType: 'thermal',
    exposurePathway: 'Cold temperature, wind, wet clothing, or prolonged exposure can cause hypothermia, frostbite, reduced dexterity, and fatigue-related error.',
    commonTriggerTerms: ['cold stress', 'hypothermia', 'frostbite', 'cold exposure', 'wind chill', 'wet cold', 'freezing'],
    competingMechanisms: ['slip', 'trip'],
    precedenceNotes: [
      'Use for worker physiological cold exposure.',
      'Use slip/trip when ice or surface condition is the dominant walking-surface hazard.'
    ],
    evidenceQuestions: [
      'What are the temperature, wind chill, wetness, and exposure duration?',
      'What warming areas, PPE/clothing, breaks, and monitoring are provided?',
      'Are symptoms, reduced dexterity, or emergency concerns present?'
    ],
    immediateControls: ['move affected workers to warming/recovery', 'provide dry/warm PPE', 'adjust exposure time'],
    verificationEvidence: ['temperature/wind chill data', 'warming provision verification', 'PPE/clothing verification', 'exposure monitoring record']
  },
  {
    mechanismId: 'noise_induced_hearing_loss',
    label: 'Noise-induced hearing loss exposure',
    hazardDomains: ['health_exposure'],
    energyType: 'unknown',
    exposurePathway: 'Noise dose transfers through sound energy over time and can damage hearing when exposure is excessive or controls are inadequate.',
    commonTriggerTerms: ['noise', 'loud', 'decibel', 'dba', 'sound level', 'hearing protection', 'hearing conservation', 'audiogram'],
    competingMechanisms: ['ppe_exposure_gap'],
    precedenceNotes: [
      'Use when the core hazard is noise dose or hearing conservation.',
      'Use PPE exposure gap only when missing hearing protection is described without enough noise-exposure context.'
    ],
    evidenceQuestions: [
      'What task or equipment is generating noise?',
      'What sound level, dose, or exposure duration is known?',
      'What engineering, administrative, hearing protection, and hearing conservation controls are in place?'
    ],
    immediateControls: ['evaluate noise exposure', 'restrict unprotected high-noise exposure', 'provide suitable hearing protection pending assessment'],
    verificationEvidence: ['sound level measurement', 'dosimetry result', 'hearing protection verification', 'hearing conservation program record']
  },
  {
    mechanismId: 'struck_by_falling_object',
    label: 'Struck by falling object',
    hazardDomains: ['struck_by' as any],
    energyType: 'gravity',
    exposurePathway: 'Tools, materials, or objects used or stored above workers can fall into an occupied area below.',
    commonTriggerTerms: ['falling object', 'overhead work', 'dropped object', 'tools overhead', 'materials overhead', 'toe board', 'toeboard', 'barricade below'],
    competingMechanisms: ['fall_from_height', 'struck_by_suspended_load', 'falling_object_material'],
    precedenceNotes: [
      'Use when the injured person is exposed below overhead work or falling materials.',
      'Use fall_from_height when the worker could fall from an elevated surface.',
      'Use struck_by_suspended_load when the object is a hoisted or suspended load.'
    ],
    evidenceQuestions: [
      'What work or materials are located above the exposed workers?',
      'Are employees working or passing below the overhead activity?',
      'Are toe boards, screens, canopies, barricades, tool tethering, or material controls present?'
    ],
    immediateControls: ['barricade the lower exposure area', 'secure overhead tools and materials', 'install or verify falling-object protection'],
    verificationEvidence: ['barricade photo', 'toe board or screen verification', 'tool/material securement evidence']
  },
  {
    mechanismId: 'bloodborne_pathogen_exposure',
    label: 'Bloodborne pathogen exposure',
    hazardDomains: ['health_exposure'],
    energyType: 'biological',
    exposurePathway: 'Sharps, blood, bodily fluids, or contaminated first-aid materials can expose employees through puncture, skin, mucous membrane, or cleanup contact.',
    commonTriggerTerms: ['blood', 'bodily fluids', 'sharps', 'needle', 'contaminated first aid', 'exposure control plan', 'biohazard', 'cleanup kit'],
    competingMechanisms: ['chemical_exposure', 'ppe_exposure_gap'],
    precedenceNotes: [
      'Use when biological contamination or sharps exposure is central.',
      'Use chemical_exposure for chemical container, SDS, label, or incompatibility issues.'
    ],
    evidenceQuestions: [
      'Are sharps, blood, bodily fluids, or contaminated materials present?',
      'Is there an exposure control plan and appropriate disposal container?',
      'What PPE, cleanup, vaccination, and training controls are documented?'
    ],
    immediateControls: ['isolate contaminated materials', 'provide sharps disposal and PPE', 'use trained personnel for cleanup'],
    verificationEvidence: ['sharps container verification', 'exposure control plan', 'training or cleanup record']
  },
  {
    mechanismId: 'compressed_gas_cylinder_release',
    label: 'Compressed gas cylinder release',
    hazardDomains: ['material_handling'],
    energyType: 'pressure',
    exposurePathway: 'Stored pressure in unsecured or unprotected compressed gas cylinders can be released if the cylinder falls, valve is damaged, or cap/restraint is missing.',
    commonTriggerTerms: ['compressed gas cylinder', 'gas cylinder', 'unsecured cylinder', 'valve cap', 'missing cap', 'cylinder restraint', 'oxygen cylinder', 'fuel gas cylinder'],
    competingMechanisms: ['pinch_point', 'unstable_stack_collapse', 'fire_explosion'],
    precedenceNotes: [
      'Use when cylinder storage, restraint, valve protection, or stored pressure is central.',
      'Use fire_explosion when oxygen/fuel gas separation or ignition exposure is central.'
    ],
    evidenceQuestions: [
      'Are cylinders secured upright and protected from impact?',
      'Are valve caps installed where required?',
      'Are cylinders segregated and stored away from incompatible conditions?'
    ],
    immediateControls: ['secure cylinders upright', 'install valve caps where required', 'segregate or relocate cylinders from exposure'],
    verificationEvidence: ['cylinder restraint photo', 'valve cap verification', 'storage inspection record']
  },
  {
    mechanismId: 'emergency_equipment_access_failure',
    label: 'Emergency equipment access failure',
    hazardDomains: ['emergency_preparedness'],
    energyType: 'chemical',
    exposurePathway: 'Emergency flushing, first-aid, egress, or response equipment that is blocked, unavailable, or too far from the exposure area can worsen injury after exposure.',
    commonTriggerTerms: ['eyewash', 'emergency shower', 'blocked eyewash', 'corrosive', 'caustic', 'quick drenching', 'emergency equipment blocked'],
    competingMechanisms: ['chemical_exposure', 'egress_blockage', 'unstable_stack_collapse'],
    precedenceNotes: [
      'Use when the central issue is inability to reach emergency equipment after exposure.',
      'Use chemical_exposure when the primary deficiency is labeling, SDS, storage, or chemical segregation.'
    ],
    evidenceQuestions: [
      'What corrosive or injurious material exposure is present?',
      'Can employees reach the emergency eyewash or shower quickly and without obstruction?',
      'Is the equipment inspected, functional, and clearly accessible?'
    ],
    immediateControls: ['clear access to emergency equipment', 'verify eyewash or shower function', 'restrict corrosive use until emergency access is restored'],
    verificationEvidence: ['eyewash access photo', 'inspection tag', 'chemical inventory or corrosive-use evidence']
  },
  {
    mechanismId: 'fire_explosion',
    label: 'Fire or explosion from welding/cylinder storage',
    hazardDomains: ['welding_cutting_hot_work'],
    energyType: 'thermal',
    exposurePathway: 'Fuel gas, oxygen, hot work, sparks, or ignition sources can initiate fire or explosion when storage, separation, valve protection, or fire prevention controls are missing.',
    commonTriggerTerms: ['oxygen cylinder', 'fuel gas cylinder', 'welding cylinder', 'acetylene', 'hot work', 'stored together', 'cylinder separation', 'fire prevention'],
    competingMechanisms: ['hot_work_ignition', 'compressed_gas_cylinder_release', 'pedestrian_strike'],
    precedenceNotes: [
      'Use for oxygen/fuel gas cylinder separation or welding/cutting fire-explosion exposure.',
      'Use compressed_gas_cylinder_release when the issue is cylinder restraint or valve protection without fire/explosion context.'
    ],
    evidenceQuestions: [
      'Are oxygen and fuel gas cylinders stored together or near combustibles?',
      'Are valve protection, separation distance, or noncombustible barriers provided?',
      'Are hot work and fire prevention controls documented?'
    ],
    immediateControls: ['separate oxygen and fuel gas cylinders', 'protect valves', 'remove cylinders from ignition or hot work exposure'],
    verificationEvidence: ['cylinder storage photo', 'separation or barrier verification', 'valve protection evidence']
  },
  {
    mechanismId: 'fall_on_stairway',
    label: 'Fall on stairway',
    hazardDomains: ['slips_trips_falls'],
    energyType: 'gravity',
    exposurePathway: 'Missing handrails, open sides, poor stair condition, or carrying materials on stairs can lead to a fall while ascending or descending.',
    commonTriggerTerms: ['temporary stairway', 'stairway', 'stairs', 'missing handrail', 'open side', 'construction access', 'carrying materials'],
    competingMechanisms: ['fall_from_height', 'trip', 'slip'],
    precedenceNotes: [
      'Use when the hazard is stairway access or missing handrail/stair rail.',
      'Use fall_from_height when the primary exposure is an unprotected elevated edge or platform.'
    ],
    evidenceQuestions: [
      'Is the stairway used for access between levels?',
      'What handrail, stair rail, open-side, tread, or landing condition is deficient?',
      'Are workers carrying materials or otherwise exposed while using the stairway?'
    ],
    immediateControls: ['restrict unsafe stairway access', 'install or restore handrail/stair rail', 'provide safe alternate access until corrected'],
    verificationEvidence: ['stairway photo', 'handrail installation verification', 'access control or inspection record']
  },
  {
    mechanismId: 'air_quality_contaminant_buildup',
    label: 'Air quality contaminant buildup',
    hazardDomains: ['ventilation'],
    energyType: 'atmospheric',
    exposurePathway: 'Damaged, disconnected, obstructed, or inadequate ventilation can reduce airflow and allow contaminants, dust, fumes, or poor air quality to accumulate in the work area.',
    commonTriggerTerms: ['ventilation tubing', 'reduced airflow', 'air quality', 'contaminant buildup', 'underground ventilation', 'damaged ventilation', 'partially disconnected'],
    competingMechanisms: ['methane_gas_buildup', 'silica_inhalation', 'asphyxiation'],
    precedenceNotes: [
      'Use for metal/nonmetal underground ventilation or general air-quality buildup concerns.',
      'Use methane_gas_buildup when coal mine methane ventilation is central.',
      'Use silica_inhalation when respirable silica dust exposure is the central health mechanism.'
    ],
    evidenceQuestions: [
      'What ventilation component is damaged, disconnected, or obstructed?',
      'Is airflow reaching the active work area?',
      'Are air quality, dust, fumes, gases, or contaminant measurements available?'
    ],
    immediateControls: ['restrict affected work area if airflow is inadequate', 'repair or reconnect ventilation controls', 'verify airflow and air quality before normal work resumes'],
    verificationEvidence: ['ventilation repair photo', 'airflow measurement', 'air quality or gas check record']
  },
  {
    mechanismId: 'excavation_cave_in_or_entrapment',
    label: 'Excavation cave-in or egress entrapment',
    hazardDomains: ['excavation_trenching'],
    energyType: 'gravity',
    exposurePathway: 'Trench collapse, side-wall cave-in, flooding, or accumulation of water can trap or suffocate workers if safe stairway, ladder, ramp, or other safe egress is absent, blocked, or located too far laterally.',
    commonTriggerTerms: ['trench access', 'excavation ladder', 'trench egress', 'lateral travel distance', 'excavation egress', 'trench ladder', 'trench ramp', 'ladder', 'egress', 'ramp', 'stairway', 'stairs', 'trench egress', 'excavation egress', 'access'],
    competingMechanisms: ['collapse', 'fall_from_height', 'asphyxiation'],
    precedenceNotes: [
      'Use when the hazard is missing, deficient, unstable, or distant access and egress inside excavations or trenches.',
      'Use collapse when the primary structural hazard is missing protective systems (shoring, shielding, sloping) without egress details.',
      'If the excavation creates atmospheric hazards (gases, lack of oxygen), evaluate asphyxiation as a competing or secondary mechanism.'
    ],
    evidenceQuestions: [
      'Is the excavation 4 feet or more in depth?',
      'Is a stairway, ladder, ramp, or other safe egress provided?',
      'Does employee travel exceed 25 feet of lateral distance to reach egress?',
      'Is the egress located within the boundaries of the protective shoring system?'
    ],
    immediateControls: ['restrict trench entry until safe egress is provided', 'install a stable stairway, ladder, or ramp', 'ensure egress is positioned within protected shoring limits'],
    verificationEvidence: ['photo of stairway ladder or ramp inside trench', 'lateral travel measurement verification', 'competent person ramp structural design approval']
  },
  {
    mechanismId: 'ground_fault_shock_pathway',
    label: 'Ground-fault wet-enclosure shock pathway',
    hazardDomains: ['electrical'],
    energyType: 'electrical',
    exposurePathway: 'Moisture ingress, outdoor temporary power setups, or standing water near open or damaged electrical enclosures can establish a low-resistance path to ground, delivering a fatal shock to workers when contact is made.',
    commonTriggerTerms: ['temporary construction power', 'missing gfci', 'outdoor extension cord', 'generator outlets', 'gfci missing', 'ground fault protection', 'wet electrical', 'wet panel', 'puddle near electrical'],
    competingMechanisms: ['shock', 'shock_arc_flash'],
    precedenceNotes: [
      'Use when the electrical hazard is specifically combined with wet conditions, outdoor temporary wiring, or missing GFCI protection.',
      'If the panel is dry and closed, do not trigger this pathway. Hold for evidence instead.',
    ],
    evidenceQuestions: [
      'Is temporary wiring or are portable extension cords in wet locations?',
      'Is GFCI protection missing or unverified?',
      'Has water entered the electrical enclosure?',
    ],
    immediateControls: ['disconnect cords from wet areas', 'install plug-in GFCI devices', 'verify GFCI breaker functionality'],
    verificationEvidence: ['photo of dry GFCI plug-in device', 'GFCI breaker verification photo', 'assured grounding testing log'],
  },
  {
    mechanismId: 'energized_contact',
    label: 'Energized electrical contact',
    hazardDomains: ['electrical'],
    energyType: 'electrical',
    exposurePathway: 'Direct physical contact with exposed live busbars, uninsulated conductors, bare copper wires, or open terminals provides an immediate path for electrical current through the human body, causing severe burns, nerve damage, or cardiac arrest.',
    commonTriggerTerms: ['exposed live parts', 'bare copper', 'missing dead-front', 'exposed busbars', 'uncovered electrical panel', 'exposed live wiring', 'exposed energized wiring', 'voltage testing', 'energized troubleshooting'],
    competingMechanisms: ['shock', 'shock_arc_flash'],
    precedenceNotes: [
      'Use when unqualified persons are exposed to uncovered energized terminals or missing dead-front covers.',
      'If the technician is qualified and wearing NFPA 70E PPE, classify as a procedural safety practice under 1910.333, bypassing automatic shock exposure alarms.',
    ],
    evidenceQuestions: [
      'Are live busbars or terminals completely exposed to direct contact?',
      'Is the system verified as energized, de-energized, or locked out?',
      'Are unqualified employees exposed within the shock boundaries?',
    ],
    immediateControls: ['apply temporary physical barrier or lock', 'de-energize circuits and verify absence of voltage', 'install Dead-Front cover'],
    verificationEvidence: ['photo of installedDead-Front inner cover', 'electrical lock verification photo', 'electrical repair record log'],
  },

];
