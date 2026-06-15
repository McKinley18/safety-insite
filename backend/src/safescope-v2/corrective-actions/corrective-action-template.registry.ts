import { SafeScopeReasoningDomain } from '../reasoning-orchestrator/reasoning-orchestrator.types';

export type CorrectiveActionTemplate = {
  domain: SafeScopeReasoningDomain;
  relatedEquipment?: string[];
  relatedTask?: string[];
  relatedMechanism?: string[];
  immediateControlElements: string[];
  interimControls?: string[];
  permanentCorrectionElements: string[];
  verificationEvidence: string[];
  responsibleRole?: string[];
  urgencyLogic?: 'low' | 'moderate' | 'high' | 'critical';
};

export const CORRECTIVE_ACTION_TEMPLATE_REGISTRY: CorrectiveActionTemplate[] = [
  {
    domain: 'machine_guarding',
    relatedEquipment: [],
    relatedTask: [],
    relatedMechanism: [],
    immediateControlElements: ['stop access', 'restrict access'],
    permanentCorrectionElements: ['install guard', 'repair guard', 'guard exposed moving parts', 'prevent contact with nip point', 'guard point of operation', 'prevent contact with pinch point'],
    interimControls: ['Apply temporary physical barrier or administrative restriction'],
    verificationEvidence: ['verify guard before operation', 'document post-correction inspection']
  },
  {
    domain: 'excavation_trenching',
    relatedEquipment: [],
    relatedTask: [],
    relatedMechanism: [],
    immediateControlElements: ['remove employees from excavation', 'stop entry'],
    permanentCorrectionElements: ['install protective system', 'slope', 'shore', 'shield', 'ensure safe egress'],
    interimControls: ['Apply temporary physical barrier or administrative restriction'],
    verificationEvidence: ['competent person inspection record']
  },
  {
    domain: 'ground_control',
    relatedEquipment: [],
    relatedTask: [],
    relatedMechanism: [],
    immediateControlElements: ['restrict access', 'barricade'],
    permanentCorrectionElements: ['scale loose rock', 'install supplemental support', 'follow approved roof control plan'],
    interimControls: ['Apply temporary physical barrier or administrative restriction'],
    verificationEvidence: ['qualified person examination record']
  },
  {
    domain: 'electrical',
    relatedEquipment: [],
    relatedTask: [],
    relatedMechanism: [],
    immediateControlElements: ['de-energize circuit', 'restrict access'],
    permanentCorrectionElements: ['install junction box cover', 'guard exposed energized terminals', 'repair enclosure integrity', 'repair damaged electrical cable', 'protect exposed conductors', 'control shock and arc flash exposure', 'verify insulation integrity before return to service'],
    interimControls: ['Apply temporary physical barrier or administrative restriction'],
    verificationEvidence: ['document electrical repair/inspection verification']
  },
  {
    domain: 'fall_protection',
    relatedEquipment: [],
    relatedTask: [],
    relatedMechanism: [],
    immediateControlElements: ['restrict access to fall exposure', 'stop exposed work'],
    permanentCorrectionElements: ['install guardrail', 'install scaffold guardrail', 'provide toprail and midrail', 'provide equivalent fall protection', 'provide fall arrest or fall restraint', 'protect leading edge', 'install fall protection system', 'correct open side or leading edge exposure'],
    interimControls: ['Apply temporary physical barrier or administrative restriction'],
    verificationEvidence: ['verify fall protection before work resumes', 'document supervisor or competent person verification']
  },
  {
    domain: 'scaffolds',
    relatedEquipment: [],
    relatedTask: [],
    relatedMechanism: [],
    immediateControlElements: ['restrict scaffold use', 'stop work from deficient scaffold'],
    permanentCorrectionElements: ['install toprail', 'install midrail', 'install scaffold guardrail', 'correct platform or planking deficiency'],
    interimControls: ['Apply temporary physical barrier or administrative restriction'],
    verificationEvidence: ['inspect scaffold before use', 'document competent person inspection']
  },
  {
    domain: 'ladders',
    relatedEquipment: [],
    relatedTask: [],
    relatedMechanism: [],
    immediateControlElements: ['remove ladder from service until corrected', 'restrict ladder access'],
    permanentCorrectionElements: ['secure ladder', 'extend ladder above landing', 'maintain ladder access', 'extend ladder above landing where required', 'provide stable access'],
    interimControls: ['Apply temporary physical barrier or administrative restriction'],
    verificationEvidence: ['verify ladder setup before use', 'document ladder correction']
  },
  {
    domain: 'slip_trip_fall',
    relatedEquipment: [],
    relatedTask: [],
    relatedMechanism: [],
    immediateControlElements: ['barricade or warn until corrected', 'restrict access if travelway is unsafe'],
    permanentCorrectionElements: ['remove loose material', 'remove obstruction', 'clean spill', 'restore clear travelway', 'maintain dry walking surface'],
    interimControls: ['Apply temporary physical barrier or administrative restriction'],
    verificationEvidence: ['verify walking surface is clean dry and clear', 'document housekeeping correction']
  },
  {
    domain: 'walking_working_surfaces',
    relatedEquipment: [],
    relatedTask: [],
    relatedMechanism: [],
    immediateControlElements: ['barricade or warn until corrected', 'restrict access if walking surface is unsafe'],
    permanentCorrectionElements: ['clean spill', 'remove stored material', 'restore clear aisle', 'maintain walking-working surface'],
    interimControls: ['Apply temporary physical barrier or administrative restriction'],
    verificationEvidence: ['verify walking-working surface is clean dry and clear', 'document correction']
  },
  {
    domain: 'slips_trips_falls',
    relatedEquipment: [],
    relatedTask: [],
    relatedMechanism: [],
    immediateControlElements: ['remove ladder from service until corrected', 'barricade or warn until corrected'],
    permanentCorrectionElements: ['secure ladder', 'extend ladder above landing', 'maintain ladder access', 'extend ladder above landing where required', 'remove trip hazard', 'restore safe access'],
    interimControls: ['Apply temporary physical barrier or administrative restriction'],
    verificationEvidence: ['verify ladder or walking surface correction before use', 'document correction']
  },
  {
    domain: 'mobile_equipment',
    relatedEquipment: [],
    relatedTask: [],
    relatedMechanism: [],
    immediateControlElements: ['separate pedestrians from mobile equipment', 'restrict access to traffic area', 'stop equipment movement until controls are established'],
    permanentCorrectionElements: ['install or restore berm', 'establish traffic control', 'use spotter where required', 'verify backup alarm or visibility controls', 'separate pedestrians', 'prevent pedestrian strike', 'define pedestrian exclusion zone', 'provide operator communication'],
    interimControls: ['Apply temporary physical barrier or administrative restriction'],
    verificationEvidence: ['document traffic control verification', 'verify berm or edge protection', 'document operator/pedestrian separation controls']
  },
  {
    domain: 'powered_haulage',
    relatedEquipment: [],
    relatedTask: [],
    relatedMechanism: [],
    immediateControlElements: ['restrict haulage until controls are established', 'separate miners from haulage route'],
    permanentCorrectionElements: ['install berm', 'restore edge control', 'establish haul road traffic controls', 'verify dump point controls'],
    interimControls: ['Apply temporary physical barrier or administrative restriction'],
    verificationEvidence: ['document berm/roadway inspection', 'verify haulage route controls']
  },
  {
    domain: 'traffic_control',
    relatedEquipment: [],
    relatedTask: [],
    relatedMechanism: [],
    immediateControlElements: ['stop affected traffic movement until controls are established', 'restrict pedestrian access'],
    permanentCorrectionElements: ['establish exclusion zone', 'assign spotter', 'verify backup alarm', 'improve pedestrian separation', 'define right-of-way'],
    interimControls: ['Apply temporary physical barrier or administrative restriction'],
    verificationEvidence: ['document traffic control setup', 'verify spotter/alarm/separation controls']
  },
  {
    domain: 'machine_guarding_loto',
    relatedEquipment: [],
    relatedTask: [],
    relatedMechanism: [],
    immediateControlElements: [
      'stop maintenance or servicing work',
      'isolate hazardous energy',
      'restrict access until lockout is applied'
    ],
    permanentCorrectionElements: [
      'de-energize equipment',
      'lock out and tag out energy sources', 'apply lockout tagout', 'verify zero energy',
      'block equipment against motion where required',
      'verify zero energy before work',
      'control stored energy',
      'restore guard only after maintenance is complete'
    ],
    interimControls: ['Apply temporary physical barrier or administrative restriction'],
    verificationEvidence: [
      'document lockout/tagout verification',
      'document zero-energy verification',
      'document supervisor or qualified person verification'
    ]
  },
  {
    domain: 'lockout_tagout',
    relatedEquipment: [],
    relatedTask: [],
    relatedMechanism: [],
    immediateControlElements: [
      'stop servicing work',
      'isolate hazardous energy',
      'restrict access until lockout/tagout is complete'
    ],
    permanentCorrectionElements: [
      'apply lockout/tagout procedure',
      'de-energize all energy sources',
      'verify zero energy',
      'control stored energy',
      'train affected and authorized employees'
    ],
    interimControls: ['Apply temporary physical barrier or administrative restriction'],
    verificationEvidence: [
      'document lockout/tagout verification',
      'verify authorized employee lockout',
      'document procedure review'
    ]
  },
  {
    domain: 'roof_rib_control',
    relatedEquipment: [],
    relatedTask: [],
    relatedMechanism: [],
    immediateControlElements: [
      'restrict access to affected area',
      'barricade loose rib area',
      'remove miners from unsupported rib exposure'
    ],
    permanentCorrectionElements: [
      'scale loose rib',
      'install supplemental rib support',
      'follow approved roof control plan',
      'perform examination by qualified person',
      'correct hazardous roof/rib condition before travel resumes'
    ],
    interimControls: ['Apply temporary physical barrier or administrative restriction'],
    verificationEvidence: [
      'document qualified person examination',
      'document roof/rib correction',
      'verify support or scaling before reopening area'
    ]
  },
  {
    domain: 'ventilation',
    relatedEquipment: [],
    relatedTask: [],
    relatedMechanism: [],
    immediateControlElements: [
      'restrict affected area until ventilation is evaluated',
      'notify responsible mine official',
      'evaluate methane/air quality where applicable'
    ],
    permanentCorrectionElements: [
      'restore ventilation curtain or control', 'repair ventilation curtain', 'maintain ventilation control',
      'correct airflow deficiency',
      'verify ventilation control is intact', 'verify airflow quantity', 'verify methane is controlled',
      'conduct methane or air-quality check where required',
      'document ventilation correction'
    ],
    interimControls: ['Apply temporary physical barrier or administrative restriction'],
    verificationEvidence: [
      'document ventilation examination',
      'verify airflow restored',
      'document methane or gas check where applicable'
    ]
  },
  {
    domain: 'emergency_preparedness',
    relatedEquipment: [],
    relatedTask: [],
    relatedMechanism: [],
    immediateControlElements: [
      'remove obstruction from escapeway',
      'restrict travel until escapeway is clear',
      'notify responsible mine official'
    ],
    permanentCorrectionElements: [
      'restore clear escapeway',
      'remove stored material or obstruction',
      'verify lifeline or emergency route integrity',
      'maintain required emergency egress route',
      'prevent storage in escapeway'
    ],
    interimControls: ['Apply temporary physical barrier or administrative restriction'],
    verificationEvidence: [
      'document escapeway inspection',
      'verify escapeway is clear and passable',
      'document corrective action and responsible person verification'
    ]
  },
  {
    domain: 'health_respiratory',
    relatedEquipment: [],
    relatedTask: [],
    relatedMechanism: [],
    immediateControlElements: [
      'restrict dust-generating work until controls are verified',
      'limit employee exposure to airborne silica'
    ],
    permanentCorrectionElements: [
      'use wet methods or dust collection',
      'implement silica exposure control',
      'use respiratory protection where required', 'use wet methods', 'use dust collection', 'control silica dust',
      'verify engineering controls are effective',
      'train affected employees on silica hazards'
    ],
    interimControls: ['Apply temporary physical barrier or administrative restriction'],
    verificationEvidence: [
      'document silica control verification',
      'document exposure control method',
      'document respiratory protection evaluation where required'
    ]
  },
  {
    domain: 'hazardous_materials',
    relatedEquipment: [],
    relatedTask: [],
    relatedMechanism: [],
    immediateControlElements: [
      'remove unlabeled container from use',
      'restrict use until container is labeled'
    ],
    permanentCorrectionElements: [
      'label chemical container',
      'identify chemical contents and hazards',
      'provide hazard communication label',
      'make SDS available',
      'train affected employees on chemical hazards'
    ],
    interimControls: ['Apply temporary physical barrier or administrative restriction'],
    verificationEvidence: [
      'document corrected container label',
      'verify SDS availability',
      'document hazard communication correction'
    ]
  },
  {
    domain: 'confined_space',
    relatedEquipment: [],
    relatedTask: [],
    relatedMechanism: [],
    immediateControlElements: [
      'stop confined space entry',
      'restrict entry until hazards are evaluated',
      'remove entrants if entry controls are missing'
    ],
    permanentCorrectionElements: [
      'evaluate confined space hazards',
      'implement permit-required confined space controls',
      'test atmosphere before entry',
      'provide attendant and rescue provisions',
      'control atmospheric hazards'
    ],
    interimControls: ['Apply temporary physical barrier or administrative restriction'],
    verificationEvidence: [
      'document confined space evaluation',
      'document atmospheric testing',
      'verify entry permit and attendant controls'
    ]
  },
  {
    domain: 'cranes_rigging_hoisting',
    relatedEquipment: [],
    relatedTask: [],
    relatedMechanism: [],
    immediateControlElements: ['stop lifting operation', 'restrict access to area under load'],
    permanentCorrectionElements: ['inspect rigging for defects', 'use certified rigging components', 'establish load path control', 'ensure crane capacity is verified'],
    interimControls: ['Apply temporary physical barrier or administrative restriction'],
    verificationEvidence: ['verify load chart', 'document pre-lift inspection', 'competent person sign-off']
  },
  {
    domain: 'bloodborne_pathogens',
    relatedEquipment: [],
    relatedTask: [],
    relatedMechanism: [],
    immediateControlElements: ['restrict access to contaminated area', 'use appropriate PPE'],
    permanentCorrectionElements: ['clean and disinfect', 'use sharps containers', 'provide hepatitis B vaccination program', 'follow exposure control plan'],
    interimControls: ['Apply temporary physical barrier or administrative restriction'],
    verificationEvidence: ['document cleaning record', 'verify sharps container availability', 'document employee training']
  },
  {
    domain: 'industrial_hygiene',
    relatedEquipment: [],
    relatedTask: [],
    relatedMechanism: [],
    immediateControlElements: ['restrict exposure area', 'use respiratory protection if required'],
    permanentCorrectionElements: ['implement engineering controls for dust/fumes', 'conduct personal exposure monitoring', 'use localized exhaust ventilation'],
    interimControls: ['Apply temporary physical barrier or administrative restriction'],
    verificationEvidence: ['document exposure assessment', 'verify ventilation performance', 'document employee notification']
  },
  {
    domain: 'ergonomics',
    relatedEquipment: [],
    relatedTask: [],
    relatedMechanism: [],
    immediateControlElements: ['modify workstation setup', 'rotate employee tasks'],
    permanentCorrectionElements: ['implement adjustable workstation', 'provide ergonomic tools', 'improve task design to reduce strain'],
    interimControls: ['Apply temporary physical barrier or administrative restriction'],
    verificationEvidence: ['conduct ergonomic assessment', 'document workstation modification', 'verify employee comfort/strain reduction']
  },

  {
    domain: 'ppe',
    relatedEquipment: [],
    relatedTask: [],
    relatedMechanism: [],
    immediateControlElements: ['stop exposed task until correct PPE is available', 'remove damaged PPE from service', 'restrict exposure where PPE is missing or incorrect'],
    permanentCorrectionElements: ['complete PPE hazard assessment', 'select PPE matched to the exposure', 'replace damaged PPE', 'verify fit/use limitations', 'train affected employees on correct use and care'],
    interimControls: ['Apply temporary physical barrier or administrative restriction'],
    verificationEvidence: ['PPE hazard assessment', 'PPE rating or compatibility confirmation', 'before/after task photo', 'training or supervisor verification']
  },
  {
    domain: 'fire_protection',
    relatedEquipment: [],
    relatedTask: [],
    relatedMechanism: [],
    immediateControlElements: ['clear access to fire protection equipment', 'pause hot work until fire controls are verified', 'remove or control combustibles'],
    permanentCorrectionElements: ['restore extinguisher access and inspection status', 'establish hot work permit/fire watch where needed', 'maintain sprinkler/alarm/fire equipment clearance', 'correct flammable storage or ignition-source controls'],
    interimControls: ['Apply temporary physical barrier or administrative restriction'],
    verificationEvidence: ['extinguisher access photo', 'inspection tag photo', 'hot work permit or fire watch record', 'combustible clearance photo']
  },

];
