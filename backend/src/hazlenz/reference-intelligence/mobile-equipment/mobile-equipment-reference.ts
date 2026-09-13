export const MOBILE_EQUIPMENT_REFERENCE = {
  domain: 'mobile_equipment_traffic_interaction',

  indicators: [
    'loader',
    'haul truck',
    'truck',
    'forklift',
    'mobile equipment',
    'vehicle',
    'traffic',
    'backup',
    'reverse',
    'blind spot',
    'dump point',
    'stockpile',
    'haul road',
    'pedestrian',
    'spotter',
    'berm',
  ],

  exposureModes: [
    'struck-by',
    'caught-between',
    'run-over',
    'rollback',
    'blind-spot interaction',
    'dump-point instability',
    'pedestrian equipment interaction',
  ],

  requiredControls: [
    'traffic management plan',
    'pedestrian separation',
    'backup alarm',
    'horn use',
    'spotter communication',
    'berms or barriers',
    'visibility controls',
    'speed control',
    'operator pre-use inspection',
    'seat belt use',
  ],

  failureModes: [
    'pedestrian in equipment path',
    'blind spot not controlled',
    'backup alarm ineffective',
    'spotter communication unclear',
    'berm missing or inadequate',
    'traffic route not segregated',
    'operator visibility limited',
  ],

  escalationPatterns: [
    'pedestrian enters line of fire',
    'equipment reverses into work area',
    'truck approaches dump edge',
    'loader interacts with ground worker',
    'traffic congestion reduces separation',
  ],

  standards: {
    MSHA: [
      '30 CFR 56.9100',
      '30 CFR 56.9300',
      '30 CFR 56.14100',
      '30 CFR 56.14130',
      '30 CFR 57.9100',
      '30 CFR 57.9300',
      '30 CFR 57.14100',
      '30 CFR 57.14130',
    ],
    OSHA_GENERAL_INDUSTRY: [
      '29 CFR 1910.178',
    ],
    OSHA_CONSTRUCTION: [
      '29 CFR 1926.601',
      '29 CFR 1926.602',
    ],
  },
};
