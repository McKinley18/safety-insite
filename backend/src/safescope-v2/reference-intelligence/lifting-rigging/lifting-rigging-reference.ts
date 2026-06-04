export const LIFTING_RIGGING_REFERENCE = {
  domain: 'lifting_rigging',

  indicators: [
    'crane',
    'hoist',
    'rigging',
    'sling',
    'chain',
    'shackle',
    'hook',
    'load',
    'suspended load',
    'lift',
    'lifting',
    'tag line',
    'signal person',
    'rigger',
    'forklift lift',
    'come-along',
    'below the load',
  ],

  hazardModes: [
    'struck-by suspended load',
    'caught-between load and structure',
    'dropped load',
    'rigging failure',
    'crane instability',
    'load swing',
    'pinch/crush exposure',
    'communication failure',
  ],

  requiredControls: [
    'qualified rigger',
    'pre-use rigging inspection',
    'rated lifting hardware',
    'load weight verification',
    'center of gravity assessment',
    'sling angle consideration',
    'exclusion zone',
    'tag line control',
    'clear communication/signaling',
    'never stand under suspended load',
  ],

  failureModes: [
    'worker under suspended load',
    'unknown load weight',
    'damaged sling',
    'unrated hardware',
    'poor communication',
    'no exclusion zone',
    'load path not controlled',
    'pinch point not controlled',
    'sling angle not considered',
  ],

  escalationPatterns: [
    'load shifts during lift',
    'rigging component fails',
    'worker enters drop zone',
    'load swings into worker',
    'crane or hoist overload occurs',
  ],

  standards: {
    OSHA_GENERAL_INDUSTRY: [
      '29 CFR 1910.179',
      '29 CFR 1910.184',
    ],
    OSHA_CONSTRUCTION: [
      '29 CFR 1926 Subpart CC',
      '29 CFR 1926.251',
    ],
    MSHA: [
      '30 CFR 56.16009',
      '30 CFR 56.16007',
      '30 CFR 57.16009',
      '30 CFR 57.16007',
    ],
  },
};
