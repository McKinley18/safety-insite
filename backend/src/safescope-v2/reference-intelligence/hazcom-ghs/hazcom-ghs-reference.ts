export const HAZCOM_GHS_REFERENCE = {
  domain: 'hazcom_ghs_chemical',

  indicators: [
    'chemical',
    'sds',
    'safety data sheet',
    'label',
    'unlabeled',
    'secondary container',
    'ghs',
    'pictogram',
    'flammable',
    'corrosive',
    'oxidizer',
    'toxic',
    'irritant',
    'carcinogen',
    'acid',
    'caustic',
    'solvent',
    'vapor',
    'fume',
    'spill',
    'incompatible',
  ],

  exposureRoutes: [
    'inhalation',
    'skin contact',
    'eye contact',
    'ingestion',
    'injection',
    'vapor exposure',
    'dust exposure',
  ],

  hazardClasses: [
    'flammable',
    'corrosive',
    'oxidizer',
    'acute toxicity',
    'carcinogenicity',
    'respiratory sensitizer',
    'skin irritant',
    'eye damage',
    'reactive chemical',
  ],

  requiredControls: [
    'container labeling',
    'SDS availability',
    'employee hazard communication training',
    'chemical compatibility review',
    'segregated storage',
    'ventilation',
    'spill response procedure',
    'compatible PPE',
    'eyewash/shower availability when required',
    'secondary container controls',
  ],

  failureModes: [
    'unlabeled secondary container',
    'SDS unavailable',
    'incompatible chemicals stored together',
    'spill not controlled',
    'inadequate ventilation',
    'wrong PPE selected',
    'flammable stored near ignition source',
    'corrosive exposure controls missing',
  ],

  escalationPatterns: [
    'small spill becomes inhalation exposure',
    'incompatible storage causes reaction',
    'flammable vapor reaches ignition source',
    'unlabeled container leads to incorrect handling',
    'corrosive contact causes burn injury',
  ],

  standards: {
    OSHA_GENERAL_INDUSTRY: [
      '29 CFR 1910.1200',
      '29 CFR 1910.1450',
      '29 CFR 1910.106',
    ],
    OSHA_CONSTRUCTION: [
      '29 CFR 1926.59',
      '29 CFR 1926.152',
    ],
    MSHA: [
      '30 CFR Part 47',
      '30 CFR 56.15006',
      '30 CFR 57.15006',
    ],
  },
};
