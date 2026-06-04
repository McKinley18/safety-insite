export type MechanismEntry = {
  id: string;
  description: string;
  keywords: string[];
};

export const SAFESCOPE_MECHANISM_REGISTRY: MechanismEntry[] = [
  {
    id: 'rotating_equipment',
    description: 'Rotating machinery or moving machine part contact',
    keywords: ['rotating equipment', 'rotating machinery', 'moving machine parts', 'moving parts', 'shaft', 'drive', 'pulley', 'roller', 'conveyor']
  },
  {
    id: 'rotating_equipment_nip_point',
    description: 'Rotating equipment nip point',
    keywords: ['nip point', 'conveyor', 'pulley', 'rotating', 'pinch point']
  },
  {
    id: 'collapse',
    description: 'Excavation collapse',
    keywords: ['collapse', 'cave-in', 'excavation', 'trench']
  },
  {
    id: 'fall_of_ground',
    description: 'Fall of ground',
    keywords: ['fall of ground', 'loose roof', 'fractured', 'roof', 'loose rib']
  },
  {
    id: 'shock',
    description: 'Electrical shock',
    keywords: ['shock', 'energized', 'exposed wiring', 'live parts', 'exposed conductors']
  },
  {
    id: 'fall_from_height',
    description: 'Fall from height',
    keywords: [
      'fall from height',
      'elevated platform',
      'open side',
      'unprotected edge',
      'leading edge',
      'fall protection',
      'fall arrest',
      'fall restraint',
      'guardrail',
      'scaffold',
      'toprail',
      'midrail'
    ]
  },
  {
    id: 'inadequate_guardrail',
    description: 'Missing or inadequate guardrail',
    keywords: ['missing guardrail', 'no guardrail', 'toprail', 'midrail', 'open side', 'incomplete guardrail']
  },
  {
    id: 'fall_from_ladder',
    description: 'Fall from ladder',
    keywords: ['ladder', 'extension ladder', 'unsecured ladder', 'landing surface', 'roof access']
  },
  {
    id: 'slip',
    description: 'Slip on contaminated walking surface',
    keywords: ['wet floor', 'slip', 'spill', 'standing water', 'slick floor']
  },
  {
    id: 'trip',
    description: 'Trip over obstruction or poor housekeeping',
    keywords: ['trip', 'loose material', 'loose parts', 'stored across', 'obstruction', 'travelway', 'housekeeping']
  },
  {
    id: 'slip_trip_fall',
    description: 'Same-level slip or trip fall',
    keywords: ['slip trip', 'slip', 'trip', 'walking surface', 'walkway', 'aisle', 'travelway']
  },
  {
    id: 'run_off_embankment',
    description: 'Vehicle run-off-road or over-edge exposure from missing berm or edge control',
    keywords: ['run off', 'over edge', 'berm', 'missing berm', 'inadequate berm', 'haul road', 'dump point', 'edge control']
  },
  {
    id: 'pedestrian_strike',
    description: 'Pedestrian struck-by mobile equipment',
    keywords: ['pedestrian', 'miners on foot', 'employees on foot', 'forklift', 'shuttle car', 'mobile equipment', 'separation', 'traffic']
  },
  {
    id: 'struck_by',
    description: 'Struck-by mobile equipment or backing equipment',
    keywords: ['struck by', 'backing', 'backup alarm', 'spotter', 'skid steer', 'loader', 'truck', 'visibility']
  },
  {
    id: 'struck_by_mobile_equipment',
    description: 'Worker struck by moving mobile equipment',
    keywords: ['mobile equipment', 'forklift', 'haul truck', 'shuttle car', 'skid steer', 'pedestrian', 'backing equipment']
  },
  {
    id: 'unexpected_startup',
    description: 'Unexpected startup or release of hazardous energy during servicing or maintenance',
    keywords: [
      'unexpected startup',
      'unexpected start up',
      'startup',
      'restart',
      'lockout',
      'tagout',
      'loto',
      'hazardous energy',
      'stored energy',
      'energy isolation',
      'zero energy',
      'de-energize',
      'maintenance',
      'servicing',
      'crusher maintenance',
      'guard removed',
      'blocked',
      'blocking'
    ]
  },
  {
    id: 'stored_energy_release',
    description: 'Release of stored mechanical, electrical, hydraulic, pneumatic, gravity, or thermal energy',
    keywords: ['stored energy', 'gravity energy', 'hydraulic', 'pneumatic', 'spring tension', 'blocked against motion']
  },
  {
    id: 'rib_fall',
    description: 'Loose rib or coal rib fall hazard',
    keywords: ['rib fall', 'loose rib', 'rib control', 'coal rib', 'unsupported rib', 'rib sloughing', 'roof/rib']
  },
  {
    id: 'methane_gas_buildup',
    description: 'Methane or hazardous gas buildup from deficient ventilation control',
    keywords: ['methane', 'methane buildup', 'gas buildup', 'ventilation', 'airflow', 'air flow', 'ventilation curtain', 'curtain']
  },
  {
    id: 'egress_blockage',
    description: 'Blocked or obstructed escapeway or emergency egress route',
    keywords: ['escapeway obstruction', 'blocked escapeway', 'obstructed escapeway', 'egress blockage', 'emergency egress', 'escape route', 'lifeline']
  },
  {
    id: 'silica_inhalation',
    description: 'Respirable crystalline silica inhalation exposure',
    keywords: ['silica', 'respirable crystalline silica', 'silica dust', 'concrete dust', 'dry cutting', 'dust exposure', 'inhalation']
  },
  {
    id: 'chemical_exposure',
    description: 'Chemical exposure from hazardous material or missing hazard communication',
    keywords: ['chemical exposure', 'hazardous chemical', 'unlabeled container', 'secondary container', 'hazcom', 'sds', 'container label']
  },
  {
    id: 'asphyxiation',
    description: 'Asphyxiation or atmospheric hazard in confined space',
    keywords: ['asphyxiation', 'oxygen deficiency', 'atmospheric hazard', 'confined space', 'permit required confined space', 'entry controls']
  },
  {
    id: 'shock_arc_flash',
    description: 'Electrical shock or arc flash exposure',
    keywords: ['shock arc flash', 'arc flash', 'shock', 'damaged electrical cable', 'exposed conductor', 'damaged conductor', 'energized']
  },
  {
    id: 'pinch_point',
    description: 'Machine pinch point or point-of-operation exposure',
    keywords: ['pinch point', 'point of operation', 'unguarded point of operation', 'press', 'caught in', 'caught between']
  },
  {
    id: 'crane_contact',
    description: 'Crane, boom, load line, or lifted load contact with power lines, structures, equipment, or people',
    keywords: ['crane contact', 'boom contact', 'power line contact', 'load line contact', 'crane swing', 'crane struck', 'crane boom']
  },
  {
    id: 'struck_by_suspended_load',
    description: 'Employee struck by suspended, moving, swinging, or falling hoisted load',
    keywords: ['suspended load', 'hoisted load', 'load path', 'under the load', 'fall zone', 'crane load', 'tag line']
  },
  {
    id: 'dropped_load',
    description: 'Hoisted or handled load falls because of loss of control, load shift, rigging failure, or handling failure',
    keywords: ['dropped load', 'falling load', 'load shift', 'lost load control', 'falling object', 'hoisted load']
  },
  {
    id: 'rigging_failure',
    description: 'Damaged, overloaded, misused, or improperly selected rigging fails during lifting or load handling',
    keywords: ['damaged sling', 'rigging defect', 'overloaded sling', 'shackle', 'hook', 'wire rope', 'pre-use inspection']
  },
  {
    id: 'unstable_stack_collapse',
    description: 'Stored or stacked material collapses, shifts, rolls, or falls because it is unstable or unsecured',
    keywords: ['unstable stack', 'stacked material', 'leaning pallet', 'improper stacking', 'material storage', 'rack collapse']
  },
  {
    id: 'falling_object_material',
    description: 'Stored, overhead, or handled material falls and creates struck-by exposure',
    keywords: ['falling object', 'falling material', 'overhead storage', 'material fell', 'object fell', 'stored overhead']
  },
  {
    id: 'defective_tool_contact',
    description: 'Defective hand or power tool creates contact, cut, strike, puncture, or burn exposure',
    keywords: ['defective tool', 'damaged tool', 'broken handle', 'power tool', 'hand tool', 'damaged cord']
  },
  {
    id: 'abrasive_wheel_failure',
    description: 'Grinder, cutoff wheel, or abrasive wheel failure, guard deficiency, or projectile exposure',
    keywords: ['grinder', 'cutoff wheel', 'abrasive wheel', 'grinding wheel', 'missing grinder guard', 'wheel guard']
  },
  {
    id: 'tool_guarding_gap',
    description: 'Portable tool guard is missing, removed, damaged, or ineffective',
    keywords: ['missing tool guard', 'removed guard', 'portable saw guard', 'grinder guard missing', 'tool guard']
  },
  {
    id: 'fire_extinguisher_access_failure',
    description: 'Fire extinguisher or fire protection equipment is blocked, missing, uninspected, or unavailable',
    keywords: ['blocked extinguisher', 'extinguisher blocked', 'missing extinguisher', 'expired extinguisher', 'not accessible']
  },
  {
    id: 'hot_work_ignition',
    description: 'Hot work ignition of combustible, flammable, vapor, residue, or dust exposure',
    keywords: ['hot work', 'welding', 'cutting', 'grinding sparks', 'torch cutting', 'combustibles nearby', 'no fire watch']
  },
  {
    id: 'combustible_exposure_fire',
    description: 'Combustible material or fire load exposure with ignition or fire-spread potential',
    keywords: ['combustible material', 'flammable storage', 'combustibles nearby', 'fire load', 'ignition source']
  },
  {
    id: 'fire_watch_gap',
    description: 'Missing or inadequate fire watch during hot work where a fire could develop',
    keywords: ['no fire watch', 'fire watch missing', 'fire watch not documented', 'hot work without fire watch']
  },
  {
    id: 'ppe_exposure_gap',
    description: 'Task-specific PPE is missing, incorrect, damaged, poorly fitted, or not selected from a hazard assessment',
    keywords: ['missing ppe', 'no ppe', 'wrong ppe', 'damaged ppe', 'not wearing ppe', 'ppe hazard assessment']
  },
  {
    id: 'eye_face_ppe_gap',
    description: 'Eye or face protection missing or inadequate for flying particles, sparks, chemicals, dust, or radiant energy',
    keywords: ['no safety glasses', 'without eye protection', 'no face shield', 'goggles missing', 'grinding without face shield']
  },
  {
    id: 'hand_ppe_gap',
    description: 'Hand protection missing or inadequate for cuts, punctures, chemicals, burns, or abrasion',
    keywords: ['no gloves', 'wrong gloves', 'cut hazard', 'sharp material', 'chemical gloves', 'burn hazard']
  },

  {
    id: 'overexertion',
    description: 'Manual material handling, forceful exertion, awkward posture, or repetitive motion causes musculoskeletal strain or sprain',
    keywords: ['overexertion', 'manual lifting', 'heavy lift', 'awkward posture', 'repetitive motion', 'strain', 'sprain', 'ergonomic']
  },
  {
    id: 'musculoskeletal_disorder',
    description: 'Cumulative ergonomic exposure contributes to musculoskeletal disorder risk',
    keywords: ['musculoskeletal', 'cumulative trauma', 'repetitive task', 'awkward posture', 'ergonomic risk', 'forceful exertion']
  },
  {
    id: 'heat_illness',
    description: 'Heat exposure, workload, PPE burden, humidity, or lack of recovery creates heat illness risk',
    keywords: ['heat stress', 'heat illness', 'heat exhaustion', 'heat stroke', 'hot environment', 'wbgt', 'hydration', 'acclimatization']
  },
  {
    id: 'cold_stress',
    description: 'Cold, wet, wind, or low-temperature exposure creates hypothermia, frostbite, or cold-stress risk',
    keywords: ['cold stress', 'hypothermia', 'frostbite', 'cold exposure', 'wind chill', 'wet cold', 'freezing']
  },
  {
    id: 'noise_induced_hearing_loss',
    description: 'Noise exposure creates risk of occupational hearing loss when sound levels, duration, or controls are inadequate',
    keywords: ['noise', 'loud', 'decibel', 'dba', 'hearing protection', 'hearing conservation', 'audiogram', 'sound level']
  },
  {
    id: 'struck_by_falling_object',
    description: 'Worker struck by falling object from overhead work, tools, materials, or dropped-object exposure',
    keywords: ['falling object', 'overhead work', 'dropped object', 'tools overhead', 'materials overhead', 'toe board', 'toeboard', 'barricade below']
  },
  {
    id: 'bloodborne_pathogen_exposure',
    description: 'Bloodborne pathogen exposure from sharps, blood, bodily fluids, contaminated first-aid materials, or cleanup exposure',
    keywords: ['blood', 'bodily fluids', 'sharps', 'needle', 'contaminated first aid', 'exposure control plan', 'biohazard', 'cleanup kit']
  },
  {
    id: 'compressed_gas_cylinder_release',
    description: 'Compressed gas cylinder release or struck-by exposure from unsecured cylinders, missing valve protection, or stored pressure',
    keywords: ['compressed gas cylinder', 'gas cylinder', 'unsecured cylinder', 'valve cap', 'missing cap', 'cylinder restraint', 'oxygen cylinder', 'fuel gas cylinder']
  },
  {
    id: 'emergency_equipment_access_failure',
    description: 'Emergency equipment access failure involving blocked, unavailable, or inaccessible eyewash, shower, first aid, or response equipment',
    keywords: ['eyewash', 'emergency shower', 'blocked eyewash', 'corrosive', 'caustic', 'quick drenching', 'emergency equipment blocked']
  },
  {
    id: 'fire_explosion',
    description: 'Fire or explosion exposure from fuel gas, oxygen, hot work, ignition sources, or cylinder storage deficiencies',
    keywords: ['oxygen cylinder', 'fuel gas cylinder', 'welding cylinder', 'acetylene', 'hot work', 'stored together', 'cylinder separation', 'fire prevention']
  },
  {
    id: 'fall_on_stairway',
    description: 'Fall on stairway from missing handrail, open side, temporary stairway, or unsafe stair access condition',
    keywords: ['temporary stairway', 'stairway', 'stairs', 'missing handrail', 'open side', 'construction access']
  },
  {
    id: 'air_quality_contaminant_buildup',
    description: 'Air quality contaminant buildup from damaged, disconnected, or ineffective underground ventilation',
    keywords: ['ventilation tubing', 'reduced airflow', 'air quality', 'contaminant buildup', 'underground ventilation', 'damaged ventilation']
  }
];
