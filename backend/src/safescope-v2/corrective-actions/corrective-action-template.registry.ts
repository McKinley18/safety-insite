import { SafeScopeReasoningDomain } from '../reasoning-orchestrator/reasoning-orchestrator.types';

export type CorrectiveActionTemplate = {
  domain: SafeScopeReasoningDomain;
  immediateControlElements: string[];
  permanentCorrectionElements: string[];
  verificationEvidence: string[];
};

export const CORRECTIVE_ACTION_TEMPLATE_REGISTRY: CorrectiveActionTemplate[] = [
  {
    domain: 'machine_guarding',
    immediateControlElements: ['stop access', 'restrict access'],
    permanentCorrectionElements: ['install guard', 'repair guard', 'guard exposed moving parts', 'prevent contact with nip point', 'guard point of operation', 'prevent contact with pinch point'],
    verificationEvidence: ['verify guard before operation', 'document post-correction inspection']
  },
  {
    domain: 'excavation_trenching',
    immediateControlElements: ['remove employees from excavation', 'stop entry'],
    permanentCorrectionElements: ['install protective system', 'slope', 'shore', 'shield', 'ensure safe egress'],
    verificationEvidence: ['competent person inspection record']
  },
  {
    domain: 'ground_control',
    immediateControlElements: ['restrict access', 'barricade'],
    permanentCorrectionElements: ['scale loose rock', 'install supplemental support', 'follow approved roof control plan'],
    verificationEvidence: ['qualified person examination record']
  },
  {
    domain: 'electrical',
    immediateControlElements: ['de-energize circuit', 'restrict access'],
    permanentCorrectionElements: ['install junction box cover', 'guard exposed energized terminals', 'repair enclosure integrity', 'repair damaged electrical cable', 'protect exposed conductors', 'control shock and arc flash exposure', 'verify insulation integrity before return to service'],
    verificationEvidence: ['document electrical repair/inspection verification']
  },
  {
    domain: 'fall_protection',
    immediateControlElements: ['restrict access to fall exposure', 'stop exposed work'],
    permanentCorrectionElements: ['install guardrail', 'install scaffold guardrail', 'provide toprail and midrail', 'provide equivalent fall protection', 'provide fall arrest or fall restraint', 'protect leading edge', 'install fall protection system', 'correct open side or leading edge exposure'],
    verificationEvidence: ['verify fall protection before work resumes', 'document supervisor or competent person verification']
  },
  {
    domain: 'scaffolds',
    immediateControlElements: ['restrict scaffold use', 'stop work from deficient scaffold'],
    permanentCorrectionElements: ['install toprail', 'install midrail', 'install scaffold guardrail', 'correct platform or planking deficiency'],
    verificationEvidence: ['inspect scaffold before use', 'document competent person inspection']
  },
  {
    domain: 'ladders',
    immediateControlElements: ['remove ladder from service until corrected', 'restrict ladder access'],
    permanentCorrectionElements: ['secure ladder', 'extend ladder above landing', 'maintain ladder access', 'extend ladder above landing where required', 'provide stable access'],
    verificationEvidence: ['verify ladder setup before use', 'document ladder correction']
  },
  {
    domain: 'slip_trip_fall',
    immediateControlElements: ['barricade or warn until corrected', 'restrict access if travelway is unsafe'],
    permanentCorrectionElements: ['remove loose material', 'remove obstruction', 'clean spill', 'restore clear travelway', 'maintain dry walking surface'],
    verificationEvidence: ['verify walking surface is clean dry and clear', 'document housekeeping correction']
  },
  {
    domain: 'walking_working_surfaces',
    immediateControlElements: ['barricade or warn until corrected', 'restrict access if walking surface is unsafe'],
    permanentCorrectionElements: ['clean spill', 'remove stored material', 'restore clear aisle', 'maintain walking-working surface'],
    verificationEvidence: ['verify walking-working surface is clean dry and clear', 'document correction']
  },
  {
    domain: 'slips_trips_falls',
    immediateControlElements: ['remove ladder from service until corrected', 'barricade or warn until corrected'],
    permanentCorrectionElements: ['secure ladder', 'extend ladder above landing', 'maintain ladder access', 'extend ladder above landing where required', 'remove trip hazard', 'restore safe access'],
    verificationEvidence: ['verify ladder or walking surface correction before use', 'document correction']
  },
  {
    domain: 'mobile_equipment',
    immediateControlElements: ['separate pedestrians from mobile equipment', 'restrict access to traffic area', 'stop equipment movement until controls are established'],
    permanentCorrectionElements: ['install or restore berm', 'establish traffic control', 'use spotter where required', 'verify backup alarm or visibility controls', 'separate pedestrians', 'prevent pedestrian strike', 'define pedestrian exclusion zone', 'provide operator communication'],
    verificationEvidence: ['document traffic control verification', 'verify berm or edge protection', 'document operator/pedestrian separation controls']
  },
  {
    domain: 'powered_haulage',
    immediateControlElements: ['restrict haulage until controls are established', 'separate miners from haulage route'],
    permanentCorrectionElements: ['install berm', 'restore edge control', 'establish haul road traffic controls', 'verify dump point controls'],
    verificationEvidence: ['document berm/roadway inspection', 'verify haulage route controls']
  },
  {
    domain: 'traffic_control',
    immediateControlElements: ['stop affected traffic movement until controls are established', 'restrict pedestrian access'],
    permanentCorrectionElements: ['establish exclusion zone', 'assign spotter', 'verify backup alarm', 'improve pedestrian separation', 'define right-of-way'],
    verificationEvidence: ['document traffic control setup', 'verify spotter/alarm/separation controls']
  },
  {
    domain: 'machine_guarding_loto',
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
    verificationEvidence: [
      'document lockout/tagout verification',
      'document zero-energy verification',
      'document supervisor or qualified person verification'
    ]
  },
  {
    domain: 'lockout_tagout',
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
    verificationEvidence: [
      'document lockout/tagout verification',
      'verify authorized employee lockout',
      'document procedure review'
    ]
  },
  {
    domain: 'roof_rib_control',
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
    verificationEvidence: [
      'document qualified person examination',
      'document roof/rib correction',
      'verify support or scaling before reopening area'
    ]
  },
  {
    domain: 'ventilation',
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
    verificationEvidence: [
      'document ventilation examination',
      'verify airflow restored',
      'document methane or gas check where applicable'
    ]
  },
  {
    domain: 'emergency_preparedness',
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
    verificationEvidence: [
      'document escapeway inspection',
      'verify escapeway is clear and passable',
      'document corrective action and responsible person verification'
    ]
  },
  {
    domain: 'health_respiratory',
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
    verificationEvidence: [
      'document silica control verification',
      'document exposure control method',
      'document respiratory protection evaluation where required'
    ]
  },
  {
    domain: 'hazardous_materials',
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
    verificationEvidence: [
      'document corrected container label',
      'verify SDS availability',
      'document hazard communication correction'
    ]
  },
  {
    domain: 'confined_space',
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
    verificationEvidence: [
      'document confined space evaluation',
      'document atmospheric testing',
      'verify entry permit and attendant controls'
    ]
  }
];
