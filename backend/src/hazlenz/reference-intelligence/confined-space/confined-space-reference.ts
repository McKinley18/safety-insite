export const CONFINED_SPACE_REFERENCE = {
  domain: 'confined_space',

  indicators: [
    'tank',
    'vessel',
    'vault',
    'manhole',
    'pit',
    'silo',
    'hopper',
    'bin',
    'crawl space',
    'permit space',
    'confined space',
    'limited entry',
    'limited egress',
  ],

  atmosphericHazards: [
    'oxygen deficiency',
    'oxygen enrichment',
    'flammable atmosphere',
    'toxic atmosphere',
    'hydrogen sulfide',
    'carbon monoxide',
    'welding fumes',
  ],

  engulfmentHazards: [
    'grain',
    'sand',
    'slurry',
    'liquid',
    'material accumulation',
  ],

  energySources: [
    'mechanical',
    'electrical',
    'pneumatic',
    'hydraulic',
    'chemical',
    'atmospheric',
  ],

  requiredControls: [
    'entry permit',
    'air monitoring',
    'ventilation',
    'attendant',
    'rescue plan',
    'energy isolation',
    'lockout tagout',
    'communication',
  ],

  escalationPatterns: [
    'unauthorized entry',
    'atmospheric deterioration',
    'loss of communication',
    'engulfment progression',
    'failed rescue attempt',
  ],

  standards: {
    OSHA_GENERAL_INDUSTRY: [
      '29 CFR 1910.146',
    ],
    OSHA_CONSTRUCTION: [
      '29 CFR 1926 Subpart AA',
    ],
    MSHA: [
      '56.18002',
      '57.18002',
    ],
  },
};
