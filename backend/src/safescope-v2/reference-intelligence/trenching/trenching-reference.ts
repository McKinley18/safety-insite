export const TRENCHING_REFERENCE = {
  domain: 'trenching_excavation',

  indicators: [
    'trench',
    'excavation',
    'ditch',
    'soil',
    'spoils',
    'spoil pile',
    'cave-in',
    'shoring',
    'shield',
    'trench box',
    'sloping',
    'benching',
    'ladder',
    'egress',
    'water accumulation',
    'adjacent structure',
  ],

  hazardModes: [
    'cave-in',
    'engulfment',
    'struck-by falling material',
    'equipment surcharge loading',
    'water accumulation',
    'hazardous atmosphere',
    'falls into excavation',
    'access-egress failure',
  ],

  requiredControls: [
    'competent person inspection',
    'protective system',
    'sloping or benching',
    'shoring',
    'shield or trench box',
    'safe access and egress',
    'spoil pile setback',
    'water control',
    'atmospheric testing when applicable',
    'barricades or fall protection near edge',
  ],

  failureModes: [
    'no protective system',
    'spoil pile too close',
    'ladder missing',
    'egress not provided',
    'water accumulation present',
    'equipment too close to edge',
    'competent person inspection missing',
    'soil instability not addressed',
  ],

  escalationPatterns: [
    'wall movement progresses to cave-in',
    'water accumulation reduces soil stability',
    'equipment surcharge increases wall collapse potential',
    'worker enters unprotected trench',
    'delayed rescue after engulfment',
  ],

  standards: {
    OSHA_CONSTRUCTION: [
      '29 CFR 1926 Subpart P',
      '29 CFR 1926.651',
      '29 CFR 1926.652',
    ],
    OSHA_GENERAL_INDUSTRY: [],
    MSHA: [
      '30 CFR 56.3200',
      '30 CFR 57.3200',
    ],
  },
};
