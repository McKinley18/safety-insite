import { SafeScopeReasoningDomain } from '../reasoning-orchestrator/reasoning-orchestrator.types';

export type TaxonomyEntry = {
  canonical: SafeScopeReasoningDomain;
  aliases: string[];
  description: string;
};

export const SAFESCOPE_TAXONOMY_REGISTRY: Record<string, TaxonomyEntry> = {
  compressed_gas: {
    canonical: 'compressed_gas',
    aliases: ['compressed gas cylinder', 'oxygen cylinder', 'acetylene cylinder', 'gas cylinder', 'cylinder valve cap', 'unsecured cylinder'],
    description: 'Compressed-gas cylinder storage, restraint, valve protection, and release hazards.'
  },
  noise_exposure: {
    canonical: 'noise_exposure',
    aliases: ['noise exposure', 'loud equipment', 'hearing conservation', 'without hearing protection', 'no hearing protection'],
    description: 'Occupational noise dose and hearing-loss exposure.'
  },
  heat_stress: {
    canonical: 'heat_stress',
    aliases: ['heat stress', 'heat illness', 'high heat', 'no shade or water', 'heat index', 'wbgt'],
    description: 'Heat illness exposure involving workload, environment, hydration, shade, rest, and acclimatization.'
  },
  cold_stress: {
    canonical: 'cold_stress',
    aliases: ['cold stress', 'cold exposure', 'hypothermia', 'frostbite', 'wind chill', 'freezing conditions'],
    description: 'Cold injury exposure involving temperature, wind, wetness, duration, warming, and protective clothing.'
  },
  dropped_objects: {
    canonical: 'dropped_objects',
    aliases: ['dropped object', 'falling object', 'loose tools overhead', 'tools stored loose', 'tools are stored loose', 'tools on elevated platform'],
    description: 'Struck-by exposure from unsecured tools or materials at elevation.'
  },
  water_drowning: {
    canonical: 'water_drowning',
    aliases: ['drowning hazard', 'open water', 'working near water', 'without flotation protection', 'no pfd', 'personal flotation device'],
    description: 'Fall-into-water and drowning exposure requiring prevention and rescue capability.'
  },
  environmental_release: {
    canonical: 'environmental_release',
    aliases: ['environmental release', 'spill to drain', 'near a floor drain', 'near floor drain', 'release pathway', 'secondary containment'],
    description: 'Material release pathway to drains, soil, or water.'
  },
  machine_guarding_loto: {
    canonical: 'machine_guarding_loto',
    aliases: [
      'lockout',
      'tagout',
      'lockout tagout',
      'loto',
      'hazardous energy',
      'unexpected startup',
      'unexpected start up',
      'stored energy',
      'energy isolation',
      'de-energize',
      'zero energy',
      'block against motion',
      'blocking',
      'blocked',
      'maintenance without lockout',
      'servicing without lockout',
      'crusher maintenance',
      'crusher drive',
      'maintenance with guard removed',
      'repair without lockout',
      'locking out',
      'without locking out'
    ],
    description: 'Hazardous energy control, lockout/tagout, blocking, and unexpected startup hazards during servicing or maintenance.'
  },
  lockout_tagout: {
    canonical: 'machine_guarding_loto',
    aliases: [
      'lockout',
      'tagout',
      'lock out',
      'tag out',
      'lockout/tagout',
      'loto',
      'energy control',
      'hazardous energy control',
      'control of hazardous energy'
    ],
    description: 'OSHA/MSHA hazardous energy isolation and lockout/tagout controls.'
  },
  machine_guarding: {
    canonical: 'machine_guarding',
    aliases: ['guarding', 'nip_point', 'rotating_parts', 'conveyor', 'pulley', 'point_of_operation', 'point of operation', 'pinch point', 'unguarded point of operation', 'press'],
    description: 'Guarding of moving machine parts.'
  },
  excavation_trenching: {
    canonical: 'excavation_trenching',
    aliases: ['trenching', 'trench', 'excavation', 'trenching_and_excavation'],
    description: 'Protection for excavation and trenching activities.'
  },
  roof_rib_control: {
    canonical: 'roof_rib_control',
    aliases: [
      'rib',
      'loose rib',
      'rib control',
      'rib fall',
      'coal rib',
      'rib sloughing',
      'unsupported rib',
      'loose coal rib',
      'underground coal rib',
      'roof and rib',
      'roof/rib'
    ],
    description: 'Underground coal roof and rib control hazards, including loose rib and rib-fall exposure.'
  },
  ventilation: {
    canonical: 'ventilation',
    aliases: [
      'ventilation',
      'ventilation curtain',
      'curtain',
      'airflow',
      'air flow',
      'methane',
      'gas buildup',
      'methane buildup',
      'methane gas buildup',
      'stoppings',
      'regulator',
      'return air',
      'intake air',
      'ventilation control'
    ],
    description: 'Underground mine ventilation hazards, including airflow controls and methane/gas accumulation potential.'
  },
  emergency_preparedness: {
    canonical: 'emergency_preparedness',
    aliases: [
      'escapeway',
      'escape way',
      'primary escapeway',
      'secondary escapeway',
      'egress',
      'emergency egress',
      'blocked escapeway',
      'obstructed escapeway',
      'escapeway obstruction',
      'lifeline',
      'travelway obstruction',
      'emergency route',
      'escape route'
    ],
    description: 'Emergency preparedness, escapeway, and emergency egress hazards.'
  },
  ground_control: {
    canonical: 'ground_control',
    aliases: ['roof_control', 'rock_fall', 'highwall', 'loose highwall', 'loose material on a highwall', 'highwall instability'],
    description: 'Management of roof and ground stability.'
  },
  health_respiratory: {
    canonical: 'health_respiratory',
    aliases: [
      'silica',
      'respirable crystalline silica',
      'dust exposure',
      'silica dust',
      'respirable dust',
      'dry cutting',
      'dry cuts',
      'saw cutting',
      'concrete dust',
      'respiratory exposure',
      'inhalation exposure',
      'airborne dust'
    ],
    description: 'Respiratory health exposure hazards, including silica and airborne contaminant exposure.'
  },
  hazardous_materials: {
    canonical: 'hazardous_materials',
    aliases: [
      'hazcom',
      'hazard communication',
      'hazardous material',
      'hazardous chemical',
      'chemical',
      'chemical exposure',
      'unlabeled container',
      'secondary container',
      'sds',
      'label missing',
      'container label',
      'chemical container'
    ],
    description: 'Hazard communication and hazardous material labeling/exposure hazards.'
  },
  bloodborne_pathogens: {
    canonical: 'bloodborne_pathogens',
    aliases: [
      'bloodborne',
      'blood borne',
      'bloodborne pathogens',
      'blood',
      'sharps',
      'sharp',
      'needle',
      'discarded needle',
      'used needle',
      'needlestick',
      'exposure control plan',
      'contaminated materials',
      'opim'
    ],
    description: 'Bloodborne pathogens and contaminated sharps exposure hazards.'
  },
  industrial_hygiene: {
    canonical: 'industrial_hygiene',
    aliases: [
      'industrial hygiene',
      'atmospheric contaminant',
      'air contaminants',
      'air quality',
      'vocs',
      'gas exposure',
      'multi-contaminant',
      'contaminants',
      'chemical vapors',
      'solvent vapors',
      'respirable particulates',
      'dust concentration',
      'lead exposure',
      'hexavalent chromium',
      'toxic substance'
    ],
    description: 'Industrial hygiene and environmental health monitoring hazards, including multi-contaminant atmospheric, toxic dusts, and chemical vapor exposure.'
  },
  ergonomics: {
    canonical: 'ergonomics',
    aliases: [
      'ergonomics',
      'musculoskeletal',
      'manual lifting',
      'heavy lifting',
      'repetitive strain',
      'lifting hazard',
      'musculoskeletal disorder',
      'msd',
      'improper lift',
      'repetitive lifting',
      'lifting assist',
      'hoist',
      'manipulator',
      'loader assist',
      'back strain',
      'forceful exertion'
    ],
    description: 'Ergonomic hazards and musculoskeletal strain risks during lifting, forceful exertion, or highly repetitive manual material handling tasks.'
  },
  confined_space: {
    canonical: 'confined_space',
    aliases: [
      'confined space',
      'permit required confined space',
      'permit-required confined space',
      'tank',
      'vessel',
      'manhole',
      'entry controls',
      'atmospheric hazard',
      'oxygen deficiency',
      'asphyxiation',
      'engulfment',
      'attendant',
      'entry permit'
    ],
    description: 'Confined space entry hazards, including atmospheric, engulfment, and permit/control failures.'
  },
  electrical: {
    canonical: 'electrical',
    aliases: ['electrical_safety', 'junction_box', 'energized', 'exposed wiring', 'live parts', 'electrical cable', 'damaged electrical cable', 'exposed conductor', 'damaged conductor', 'arc flash', 'shock arc flash'],
    description: 'Electrical hazard protection.'
  },
  fall_protection: {
    canonical: 'fall_protection',
    aliases: [
      'fall protection',
      'fall hazard',
      'fall from height',
      'elevated platform',
      'work platform',
      'platform had an open side',
      'open side',
      'unprotected edge',
      'unprotected roof edge',
      'roof edge',
      'leading edge',
      'guardrail missing',
      'missing guardrail',
      'no guardrail',
      'toprail',
      'midrail',
      'fall arrest',
      'fall restraint',
      'scaffold',
      'platform over 10 feet'
    ],
    description: 'Protection from falls to a lower level, including elevated platforms, leading edges, and scaffold guardrail exposure.'
  },
  scaffolds: {
    canonical: 'fall_protection',
    aliases: ['scaffold', 'scaffolding', 'toprail', 'midrail', 'planking', 'incomplete platform', 'scaffold guardrail'],
    description: 'Scaffold-related fall protection hazards.'
  },
  ladders: {
    canonical: 'slips_trips_falls',
    aliases: ['ladder', 'extension ladder', 'unsecured ladder', 'ladder access', 'landing surface', 'roof access'],
    description: 'Ladder access and ladder-related fall hazards.'
  },
  walking_working_surfaces: {
    canonical: 'slip_trip_fall',
    aliases: [
      'walking surface',
      'walking-working surface',
      'walkway',
      'travelway',
      'aisle',
      'wet floor',
      'spilled material',
      'loose material',
      'trip hazard',
      'slip hazard',
      'housekeeping',
      'obstruction',
      'stored across',
      'production aisle'
    ],
    description: 'Same-level slip, trip, housekeeping, and walking-working surface hazards.'
  },
  mobile_equipment: {
    canonical: 'mobile_equipment',
    aliases: [
      'mobile equipment',
      'haul truck',
      'haul road',
      'berm',
      'missing berm',
      'inadequate berm',
      'edge control',
      'dump point',
      'loader',
      'shuttle car',
      'skid steer',
      'forklift',
      'powered industrial truck',
      'pit',
      'truck',
      'equipment traffic',
      'pedestrian',
      'pedestrians',
      'backing equipment',
      'backup alarm',
      'spotter',
      'traffic control',
      'exclusion zone',
      'pedestrian separation',
      'visibility control',
      'right-of-way'
    ],
    description: 'Mobile equipment, powered haulage, struck-by, traffic control, and pedestrian-equipment interaction hazards.'
  },
  powered_haulage: {
    canonical: 'mobile_equipment',
    aliases: ['powered haulage', 'haulage', 'haul road', 'haul truck', 'shuttle car', 'dump point', 'berm'],
    description: 'Haulage equipment and haul road hazards.'
  },
  traffic_control: {
    canonical: 'mobile_equipment',
    aliases: ['traffic control', 'pedestrian separation', 'equipment separation', 'spotter', 'backup alarm', 'exclusion zone'],
    description: 'Vehicle/pedestrian traffic control hazards.'
  },
  slip_trip_fall: {
    canonical: 'slip_trip_fall',
    aliases: ['slip', 'trip', 'slip trip', 'same level fall', 'wet floor', 'loose parts', 'spilled material'],
    description: 'Same-level slip and trip hazards.'
  }
};
